#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x11b[36m',
  red: '\x1b[31m',
};

/**
 * Workflow:
 * 1. Get raw digest from follow-builders
 * 2. For each section (blogs, podcasts, tweets): Extract KEY INSIGHTS only
 * 3. Format as plain markdown with proper structure
 * 4. Output English + Chinese side-by-side (or bilingual inline)
 */

// Ollama configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
// 轻量模型选项（按 CPU 占用从低到高排列）：
// - 'qwen2:1.5b'  : 超轻（推荐用于翻译）
// - 'phi2'         : 轻量
// - 'neural-chat'  : 中等
// - 'mistral'      : 中等（原默认）
// - 'llama2'       : 较重
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2:1.5b';

console.log(`\x1b[36m[Config] Using Ollama model: ${OLLAMA_MODEL}\x1b[0m`);

/**
 * Call Ollama API with optimizations for lightweight models
 * 轻量模型参数优化，降低 CPU 占用和提高速度
 */
async function callOllama(prompt, text, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${prompt}\n\nContent:\n${text}\n\nResponse:`,
          stream: false,
          temperature: 0.2,      // 降低随机性，加快收敛
          top_p: 0.8,            // 减少采样范围
          top_k: 40,             // 限制候选词数量
          num_predict: 200,      // 限制输出长度，加快生成
          repeat_penalty: 1.1    // 轻微惩罚重复
        }),
        timeout: 20000            // 改为 20s（从 30s）
      });

      if (!response.ok) {
        console.error(`${colors.yellow}[Ollama] HTTP ${response.status}${colors.reset}`);
        continue;
      }

      const data = await response.json();
      if (data.response) {
        return data.response.trim();
      }
    } catch (err) {
      console.error(`${colors.yellow}[Ollama attempt ${attempt + 1}/${retries}] ${err.message}${colors.reset}`);
    }
  }

  return null;
}

/**
 * Extract key insights from podcast transcript (using Ollama for better extraction)
 * Optimized for lightweight models
 */
async function extractPodcastKeyInsights(transcript, title) {
  if (!transcript || transcript.length < 100) {
    console.warn(`${colors.yellow}⚠️  Podcast transcript too short or empty: ${title}${colors.reset}`);
    // 回退：从标题中生成默认 insight
    return [
      `This episode discusses ${title.replace(/[:"]+/g, '').trim()}.`
    ];
  }

  const prompt = `Extract 3-5 key insights from podcast. Keep terms and names in English. Output one insight per line, no numbers or labels:`;

  const result = await callOllama(prompt, transcript.substring(0, 1500), 2);
  if (result) {
    const insights = result
      .split('\n')
      .filter(line => line.trim().length > 10)
      .map(line => {
        // Remove number prefixes, labels, and colons
        return line
          .replace(/^[-•*\d.]+\s*/, '')
          .replace(/^(Core\s+)?insight\s+\d+:?\s*/i, '')
          .replace(/^Key\s+(insight|point)\s+\d+:?\s*/i, '')
          .trim();
      })
      .filter(line => line.length > 0)
      .slice(0, 5);
    
    if (insights.length > 0) return insights;
  }
  
  // 如果 Ollama 失败或返回空，使用默认 insight
  console.warn(`${colors.yellow}⚠️  Failed to extract podcast insights, using fallback: ${title}${colors.reset}`);
  return [
    `This episode covers important insights about ${title.replace(/[:"]+/g, '').trim()}.`
  ];
}

/**
 * Extract key insights from blog content
 * Optimized for lightweight models
 */
async function extractBlogKeyInsights(html, title) {
  // Extract main content
  let text = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2500);

  const prompt = `Extract 2-3 key points from blog. Keep English terms and names. Output one point per line, no numbers or labels:`;

  const result = await callOllama(prompt, text, 2);
  if (result) {
    return result
      .split('\n')
      .filter(line => line.trim().length > 10)
      .map(line => {
        // Remove number prefixes and labels
        return line
          .replace(/^[-•*\d.]+\s*/, '')
          .replace(/^Key\s+(insight|point)\s+\d+:?\s*/i, '')
          .trim();
      })
      .filter(line => line.length > 0)
      .slice(0, 3);
  }
  return [];
}

/**
 * Translate text to Chinese using Ollama (optimized for lightweight models)
 */
async function translateToChinese(text, context = '') {
  if (!text || text.length < 10) {
    return '';
  }
  
  // For lightweight models, use simpler Chinese prompt
  const prompt = `把下面的英文翻译成中文，保留英文术语。只输出中文翻译：`;
  
  const result = await callOllama(prompt, text.substring(0, 800), 1);
  if (!result) {
    return '';
  }
  return result.trim();
}

/**
 * Summarize tweets from a builder into one paragraph (optimized for lightweight models)
 * 总是返回中文提炼总结，不返回原英文内容
 */
async function summarizeTweets(tweets) {
  if (!tweets || tweets.length === 0) return '';
  
  // Concatenate all tweet texts
  const allText = tweets
    .map(t => t.text || '')
    .filter(t => t.length > 0)
    .join('\n\n');
  
  if (allText.length < 50) {
    // 如果内容太短，也要尝试翻译成中文
    const chinese = await translateToChinese(allText, 'tweets');
    return chinese || allText;
  }
  
  // 使用中文提示词要求总结，确保输出中文
  const prompt = `请用中文总结下面这个人在推文中的主要观点（1-2句话，保留重要英文术语）：`;
  
  const result = await callOllama(prompt, allText.substring(0, 1500), 1);
  
  if (result && result.trim().length > 0) {
    // 清理可能的提示词残留
    let cleaned = result.trim();
    // 移除常见的英文提示词残留
    cleaned = cleaned.replace(/^(Summary in Chinese|Chinese summary)[:\s]*/i, '');
    // 移除 "内容：" 等标签
    cleaned = cleaned.replace(/^内容[:：]\s*/, '');
    return cleaned;
  }
  
  // 如果 Ollama 失败，则使用翻译函数
  console.warn(`${colors.yellow}⚠️  Tweet summarization failed, attempting translation...${colors.reset}`);
  const chinese = await translateToChinese(allText.substring(0, 800), 'tweets');
  if (chinese && chinese.trim().length > 0) {
    return chinese;
  }
  
  // 最后的回退：返回处理后的英文摘要
  const summary = allText
    .split('\n')
    .slice(0, 2)
    .join(' | ')
    .substring(0, 300);
  return summary || 'Tweet content';
}

/**
 * Extract tweet key insight
 */
function extractTweetKeyInsight(text) {
  if (!text || text.length < 20) return text;

  // Remove URLs
  let clean = text.replace(/https?:\/\/\S+/g, '').trim();
  // Remove leading @mentions
  clean = clean.replace(/^(@\w+\s*)+/g, '').trim();
  // Clean whitespace
  clean = clean.replace(/\s+/g, ' ');

  // If very short, return as is
  if (clean.length < 50) return clean;

  // If has multiple sentences, keep them
  if (clean.length < 200) return clean;

  // Otherwise truncate to first meaningful sentence
  const sentences = clean.split(/[.!?]+/);
  if (sentences[0].length < 200) {
    return sentences[0].trim();
  }

  return clean.substring(0, 200).trim() + '...';
}

/**
 * Fetch blog content from URL
 */
async function fetchBlogContent(url) {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    return html;
  } catch (e) {
    console.error(`Failed to fetch blog: ${e.message}`);
    return null;
  }
}

/**
 * Generate Beijing time in format: yyyy-mm-dd hh:mm:ss UTC+8
 */
function getBeijingTime() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const yyyy = String(bjTime.getUTCFullYear());
  const mm = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(bjTime.getUTCDate()).padStart(2, '0');
  const hh = String(bjTime.getUTCHours()).padStart(2, '0');
  const mi = String(bjTime.getUTCMinutes()).padStart(2, '0');
  const ss = String(bjTime.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC+8`;
}

async function generateDailyDigest() {
  try {
    const skillsPath = path.join(
      process.env.USERPROFILE || process.env.HOME,
      '.workbuddy',
      'skills',
      'follow-builders-main',
      'scripts'
    );

    console.log(`${colors.blue}📥 Fetching raw digest data...${colors.reset}`);
    let rawOutput;
    try {
      rawOutput = execSync(
        `node "${path.join(skillsPath, 'prepare-digest.js')}"`,
        {
          encoding: 'utf-8',
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );
    } catch (e) {
      console.error(`${colors.yellow}⚠️  prepare-digest.js failed:${colors.reset}`, e.message);
      rawOutput = '{}';
    }

    const rawDigest = JSON.parse(rawOutput);

    console.log(`${colors.blue}✨ Extracting key insights...${colors.reset}`);

    // Process blogs
    if (rawDigest.blogs && rawDigest.blogs.length > 0) {
      console.log(`${colors.blue}📰 Processing blogs...${colors.reset}`);
      const processedBlogs = [];
      for (const blog of rawDigest.blogs) {
        if (blog.url) {
          const html = await fetchBlogContent(blog.url);
          if (html) {
            const insights = await extractBlogKeyInsights(html, blog.title);
            // Translate insights to Chinese
            const chineseInsights = [];
            for (const insight of insights) {
              const chinese = await translateToChinese(insight, '要点');
              if (chinese) chineseInsights.push(chinese);
            }
            processedBlogs.push({
              ...blog,
              keyInsights: insights,
              chineseInsights: chineseInsights
            });
            console.log(`${colors.green}✓${colors.reset} Blog: ${blog.title}`);
          }
        }
      }
      rawDigest.blogs = processedBlogs;
    }

    // Process podcasts
    if (rawDigest.podcasts && rawDigest.podcasts.length > 0) {
      console.log(`${colors.blue}🎙️  Processing podcasts...${colors.reset}`);
      const processedPodcasts = [];
      for (const podcast of rawDigest.podcasts) {
        const insights = await extractPodcastKeyInsights(podcast.transcript, podcast.title);
        // Translate insights to Chinese
        const chineseInsights = [];
        for (const insight of insights) {
          const chinese = await translateToChinese(insight, '洞察');
          if (chinese) chineseInsights.push(chinese);
        }
        processedPodcasts.push({
          ...podcast,
          keyInsights: insights,
          chineseInsights: chineseInsights
        });
        console.log(`${colors.green}✓${colors.reset} Podcast: ${podcast.title}`);
      }
      rawDigest.podcasts = processedPodcasts;
    }

    // Process tweets - aggregate by builder
    if (rawDigest.x && rawDigest.x.length > 0) {
      console.log(`${colors.blue}𝕏 Processing tweets...${colors.reset}`);
      rawDigest.x = await Promise.all(rawDigest.x.map(async (builder) => {
        const tweets = builder.tweets || [];
        if (tweets.length > 0) {
          const summary = await summarizeTweets(tweets);
          console.log(`${colors.green}✓${colors.reset} Builder: ${builder.name} (${tweets.length} tweets)`);
          return {
            ...builder,
            tweetsSummary: summary,
            tweetCount: tweets.length
          };
        }
        return builder;
      }));
    }

    console.log(`${colors.blue}📝 Formatting markdown...${colors.reset}`);
    const markdown = formatDigestMarkdown(rawDigest);

    const workspaceRoot = path.join(__dirname, '..');
    const contentDir = path.join(workspaceRoot, '..', 'fri-content', 'daily');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const outputPath = path.join(contentDir, `${today}.md`);
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`${colors.green}✅ Daily digest generated: ${outputPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Format digest as markdown - KEY INSIGHTS with bilingual support
 */
function formatDigestMarkdown(digest) {
  let markdown = `# AI Builders Digest\n\n`;
  markdown += `Generated: ${getBeijingTime()}\n\n`;
  markdown += `---\n\n`;

  // === SECTION 1: BLOGS ===
  if (digest.blogs && digest.blogs.length > 0) {
    markdown += `## 📰 Blogs\n\n`;

    digest.blogs.forEach((item, idx) => {
      const title = item.title || 'Blog Post';
      const url = item.url || '#';
      const insights = item.keyInsights || [];
      const chineseInsights = item.chineseInsights || [];

      markdown += `### ${title}\n`;
      markdown += `**Bottom line:**\n`;

      if (insights.length > 0) {
        markdown += `${insights[0]}\n`;
        
        if (insights.length > 1) {
          markdown += `\n**Key points:**\n`;
          for (let i = 1; i < insights.length; i++) {
            markdown += `- ${insights[i]}\n`;
          }
        }

        // Chinese translation in collapsible details
        if (chineseInsights.length > 0 && chineseInsights[0]) {
          markdown += `\n<details>\n<summary>中文版本</summary>\n\n`;
          markdown += `**要点：**\n${chineseInsights[0]}\n`;
          
          if (chineseInsights.length > 1) {
            markdown += `\n**关键点：**\n`;
            for (let i = 1; i < chineseInsights.length; i++) {
              if (chineseInsights[i]) {
                markdown += `- ${chineseInsights[i]}\n`;
              }
            }
          }
          markdown += `\n</details>\n`;
        }
      }

      markdown += `\n<a href="${url}" target="_blank">${url}</a>\n`;
      
      // Add separator between items except the last one
      if (idx < digest.blogs.length - 1) {
        markdown += `\n---\n\n`;
      }
    });

    markdown += `\n---\n\n`;
  }

  // === SECTION 2: PODCASTS ===
  if (digest.podcasts && digest.podcasts.length > 0) {
    markdown += `## 🎙️ Podcasts\n\n`;

    digest.podcasts.forEach((item, idx) => {
      const title = item.title || 'Episode';
      const source = item.name || 'Podcast';
      const url = item.url || '#';
      const insights = item.keyInsights || [];
      const chineseInsights = item.chineseInsights || [];

      markdown += `### ${source} — "${title}"\n`;
      markdown += `**Bottom line:**\n`;

      if (insights.length > 0) {
        markdown += `${insights[0]}\n`;
        
        if (insights.length > 1) {
          markdown += `\n**Key insights:**\n`;
          for (let i = 1; i < insights.length; i++) {
            markdown += `- ${insights[i]}\n`;
          }
        }

        // Chinese translation in collapsible details
        if (chineseInsights.length > 0 && chineseInsights[0]) {
          markdown += `\n<details>\n<summary>中文版本</summary>\n\n`;
          markdown += `**要点：**\n${chineseInsights[0]}\n`;
          
          if (chineseInsights.length > 1) {
            markdown += `\n**核心洞察：**\n`;
            for (let i = 1; i < chineseInsights.length; i++) {
              if (chineseInsights[i]) {
                markdown += `- ${chineseInsights[i]}\n`;
              }
            }
          }
          markdown += `\n</details>\n`;
        }
      }

      markdown += `\n<a href="${url}" target="_blank">${url}</a>\n`;
      
      // Add separator between items except the last one
      if (idx < digest.podcasts.length - 1) {
        markdown += `\n---\n\n`;
      }
    });

    markdown += `\n---\n\n`;
  }

  // === SECTION 3: X TWEETS ===
  if (digest.x && digest.x.length > 0) {
    markdown += `## 𝕏 Tweets\n\n`;

    digest.x.forEach((builder, idx) => {
      const name = builder.name || 'Unknown';
      const handle = builder.handle || 'unknown';
      const summary = builder.tweetsSummary || '';
      const profileUrl = `https://x.com/${handle}`;

      if (!summary) return;

      markdown += `### [@${handle} — ${name}](${profileUrl})\n\n`;
      markdown += `${summary}\n\n`;
      markdown += `<a href="${profileUrl}" target="_blank">查看主页</a>\n`;
      
      // Add separator between items except the last one
      if (idx < digest.x.length - 1) {
        markdown += `\n---\n\n`;
      }
    });
  }

  return markdown;
}

// Run the digest generation
generateDailyDigest().catch((error) => {
  console.error(`${colors.red}Failed to generate digest:${colors.reset}`, error.message);
  process.exit(1);
});
