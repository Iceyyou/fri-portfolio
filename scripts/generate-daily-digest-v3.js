#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Main workflow:
 * 1. Get raw digest from follow-builders
 * 2. Use Ollama qwen2:1.5b to extract KEY INSIGHTS (not summaries)
 * 3. Format for web display with proper structure
 */

async function generateDailyDigest() {
  try {
    console.log(`${colors.blue}🚀 Starting Daily Digest Generation v3...${colors.reset}`);

    const skillsPath = path.join(
      process.env.USERPROFILE || process.env.HOME,
      '.workbuddy',
      'skills',
      'follow-builders-main',
      'scripts'
    );

    // Step 1: Get raw digest data
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
      rawOutput = '{"blogs":[],"podcasts":[],"x":[]}';
    }

    let rawDigest = {};
    try {
      rawDigest = JSON.parse(rawOutput);
    } catch (e) {
      console.error(`${colors.yellow}⚠️  Failed to parse digest JSON${colors.reset}`);
      rawDigest = { blogs: [], podcasts: [], x: [] };
    }

    // Step 2: Extract insights using Ollama
    console.log(`${colors.blue}🤖 Extracting KEY INSIGHTS with Ollama...${colors.reset}`);
    const digestWithInsights = await extractInsightsWithOllama(rawDigest);

    // Step 3: Format for markdown display
    console.log(`${colors.blue}📝 Formatting markdown...${colors.reset}`);
    const markdown = formatDigestMarkdown(digestWithInsights);

    // Step 4: Save to both fri-content and content directories
    const workspaceRoot = path.join(__dirname, '..');
    const friContentDir = path.join(workspaceRoot, 'fri-content', 'daily');
    const contentDir = path.join(workspaceRoot, 'content', 'daily');
    
    if (!fs.existsSync(friContentDir)) {
      fs.mkdirSync(friContentDir, { recursive: true });
    }
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const friContentPath = path.join(friContentDir, `${today}.md`);
    const contentPath = path.join(contentDir, `${today}.md`);
    
    fs.writeFileSync(friContentPath, markdown, 'utf-8');
    fs.writeFileSync(contentPath, markdown, 'utf-8');

    console.log(`${colors.green}✅ Daily digest generated:${colors.reset}`);
    console.log(`   - ${friContentPath}`);
    console.log(`   - ${contentPath}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Call Ollama API to extract insights from content
 */
async function extractInsightsWithOllama(rawDigest) {
  const enhanced = { ...rawDigest };

  // Process blogs
  if (enhanced.blogs && enhanced.blogs.length > 0) {
    console.log(`  📰 Processing ${enhanced.blogs.length} blogs...`);
    enhanced.blogs = await Promise.all(
      enhanced.blogs.map(async (blog) => {
        const content = (blog.description || blog.content || '').substring(0, 500);
        return {
          ...blog,
          insight: await getOllamaInsight(
            `请分析这篇文章的关键洞察。不是简单翻译标题，而是提取文章中实际讨论的重要发现、数据或观点。\n\n标题：${blog.title}\n\n内容：${content}\n\n用2-3句话总结核心洞察（包括具体信息、方法或发现）：`,
            'blog'
          ),
        };
      })
    );
  }

  // Process podcasts
  if (enhanced.podcasts && enhanced.podcasts.length > 0) {
    console.log(`  🎙️ Processing ${enhanced.podcasts.length} podcasts...`);
    enhanced.podcasts = await Promise.all(
      enhanced.podcasts.map(async (podcast) => {
        const desc = (podcast.description || '').substring(0, 500);
        return {
          ...podcast,
          insight: await getOllamaInsight(
            `请分析这期播客的关键洞察。不是简单翻译标题，而是提取播客中实际讨论的核心观点、论证或发现。\n\n标题：${podcast.title}\n\n描述：${desc}\n\n用2-3句话总结核心洞察（包括具体的论点、数据或观点）：`,
            'podcast'
          ),
        };
      })
    );
  }

  // Process tweets
  if (enhanced.x && enhanced.x.length > 0) {
    console.log(`  𝕏 Processing ${enhanced.x.length} builders...`);
    enhanced.x = await Promise.all(
      enhanced.x.map(async (builder) => ({
        ...builder,
        tweets: builder.tweets
          ? await Promise.all(
              builder.tweets.map(async (tweet) => ({
                ...tweet,
                // Use Ollama to summarize tweets in Chinese for better insight
                insight: await getOllamaInsight(
                  `用1-2句话总结这条推文的核心观点（中文，不超过50字）：\n\n推文内容：${tweet.text?.substring(0, 300)}\n\n总结：`,
                  'tweet'
                ),
              }))
            )
          : [],
      }))
    );
  }

  return enhanced;
}

/**
 * Call Ollama qwen2:1.5b to extract insight
 * Retries up to 3 times with exponential backoff
 */
async function getOllamaInsight(prompt, type = 'default', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await callOllamaAPI({
        model: 'qwen2:1.5b',
        prompt: prompt,
        stream: false,
        temperature: 0.5, // Higher for more creative insight extraction
        top_p: 0.95,
      });

      if (response && response.response) {
        let result = response.response.trim();
        
        // Clean up common Ollama artifacts
        result = result
          .replace(/^(回答|答案|核心观点|总结|insight)[：:\s]*/i, '') // Remove prefixes
          .replace(/[\n\r]/g, ' ') // Remove line breaks
          .trim();

        // Validate minimum length
        if (result && result.length > 5) {
          // Cap at reasonable length for insights
          if (result.length > 100) {
            result = result.substring(0, 97) + '...';
          }
          return result;
        }
      }
    } catch (e) {
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1s, 2s
        const delayMs = Math.pow(2, attempt - 1) * 500;
        console.warn(
          `    ⚠️  Ollama call failed (attempt ${attempt}/${retries}), retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.warn(`    ⚠️  Ollama unavailable after ${retries} attempts: ${e.message}`);
        // Return a fallback based on type
        return type === 'blog' ? '无法生成摘要' : type === 'podcast' ? '无法生成摘要' : 'Unable to extract.';
      }
    }
  }
  return '无法生成摘要';
}

/**
 * HTTP request to Ollama API with improved error handling
 */
function callOllamaAPI(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 180000, // 180 seconds (increased for longer insight generation)
    };

    let timedOut = false;

    const req = http.request(options, (res) => {
      let body = '';

      // Handle timeout explicitly
      const responseTimeout = setTimeout(() => {
        timedOut = true;
        req.destroy();
        reject(new Error('Response timeout - Ollama took too long to respond'));
      }, 110000);

      res.on('data', (chunk) => {
        body += chunk.toString();
        // Prevent memory issues from huge responses
        if (body.length > 10 * 1024 * 1024) {
          clearTimeout(responseTimeout);
          req.destroy();
          reject(new Error('Response too large (>10MB)'));
        }
      });

      res.on('end', () => {
        clearTimeout(responseTimeout);
        try {
          if (!body || body.trim() === '') {
            reject(new Error('Empty response from Ollama'));
            return;
          }
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(new Error('Invalid JSON response from Ollama'));
        }
      });
    });

    req.on('error', (err) => {
      if (!timedOut) {
        reject(new Error(`HTTP error: ${err.message}`));
      }
    });

    req.on('timeout', () => {
      timedOut = true;
      req.destroy();
      reject(new Error('Connection timeout to Ollama (>90s)'));
    });

    req.write(data);
    req.end();
  });
}

/**
 * Fast heuristic to extract tweet insight (no LLM call for speed)
 */
function extractTweetInsight(text) {
  // Remove URLs and mentions
  let cleaned = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/@\w+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Cap at reasonable length
  if (cleaned.length > 280) {
    cleaned = cleaned.substring(0, 277) + '...';
  }

  return cleaned || '(No text content)';
}

/**
 * Format digest as markdown with KEY INSIGHTS structure
 */
function formatDigestMarkdown(digest) {
  let markdown = `# AI 行业日报 / Daily Digest\n\n`;
  markdown += `**生成时间 / Generated:** ${new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
  })} (Beijing Time)\n\n`;
  markdown += `---\n\n`;

  // === SECTION 1: BLOGS ===
  if (digest.blogs && digest.blogs.length > 0) {
    markdown += `## 📰 文章 / Blogs\n\n`;

    digest.blogs.forEach((blog) => {
      markdown += `### ${blog.title || 'Untitled'}\n\n`;
      markdown += `**Bottom line:** ${blog.insight || 'N/A'}\n\n`;

      if (blog.description) {
        markdown += `**Key points:**\n`;
        markdown += `- ${blog.description.substring(0, 150)}...\n\n`;
      }

      markdown += `<a href="${blog.url || '#'}" target="_blank">${blog.url || 'Link'}</a>\n\n`;
      markdown += `---\n\n`;
    });
  }

  // === SECTION 2: PODCASTS ===
  if (digest.podcasts && digest.podcasts.length > 0) {
    markdown += `## 🎙️ 播客 / Podcasts\n\n`;

    digest.podcasts.forEach((podcast) => {
      const source = podcast.source || 'Podcast';
      const title = podcast.title || 'Episode';

      markdown += `### ${source} — "${title}"\n\n`;
      markdown += `**Bottom line:** ${podcast.insight || 'N/A'}\n\n`;

      if (podcast.description) {
        markdown += `**Key insights:**\n`;
        markdown += `- ${podcast.description.substring(0, 150)}...\n\n`;
      }

      markdown += `<a href="${podcast.url || '#'}" target="_blank">${podcast.url || 'Link'}</a>\n\n`;
      markdown += `---\n\n`;
    });
  }

  // === SECTION 3: X TWEETS ===
  if (digest.x && digest.x.length > 0) {
    markdown += `## 𝕏 推文 / Tweets\n\n`;

    digest.x.forEach((builder) => {
      const name = builder.name || 'Unknown';
      const handle = builder.handle || 'unknown';
      const tweets = builder.tweets || [];

      if (tweets.length === 0) return;

      markdown += `### @${handle}\n`;
      markdown += `**${name}**\n\n`;

      tweets.forEach((tweet, idx) => {
        markdown += `${tweet.insight}\n`;
        markdown += `<a href="${tweet.url || '#'}" target="_blank">${tweet.url || 'Link'}</a>\n\n`;
      });

      markdown += `---\n\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `**生成工具 / Generated by:** [Follow Builders Skill](https://github.com/zarazhangrui/follow-builders) + Ollama qwen2:1.5b\n`;

  return markdown;
}

// Run the digest generation
generateDailyDigest();
