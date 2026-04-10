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
const OLLAMA_MODEL = 'mistral';

/**
 * Call Ollama API
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
          temperature: 0.3
        }),
        timeout: 30000
      });

      if (!response.ok) {
        console.error(`[Ollama] HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (data.response) {
        return data.response.trim();
      }
    } catch (err) {
      console.error(`[Ollama attempt ${attempt + 1}/${retries}] ${err.message}`);
    }
  }

  return null;
}

/**
 * Extract key insights from podcast transcript (using Ollama for better extraction)
 */
async function extractPodcastKeyInsights(transcript, title) {
  if (!transcript || transcript.length < 100) return [];

  const prompt = `从这个播客的文字稿中提取3-5个最核心的洞察或观点。要求：
1. 提取真正有价值的核心见解，不是细节
2. 每个观点用一句话总结，保留关键的英文术语和人名
3. 精炼、有深度、可直接理解
4. 不要加数字或列表符号，直接输出观点，每个观点一行
5. 例如输出格式：
Core insight 1 here
Core insight 2 here
Core insight 3 here`;

  const result = await callOllama(prompt, transcript.substring(0, 2000), 2);
  if (result) {
    return result
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
      .filter(line => line.length > 0 && !line.match(/^(提示|格式|例如)/))
      .slice(0, 5);
  }
  return [];
}

/**
 * Extract key insights from blog content
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
    .substring(0, 3000);

  const prompt = `从这篇博文中提取2-3个最核心的要点或关键观点。要求：
1. 只提取真正重要的洞察，不是细节
2. 保留英文术语和产品名
3. 每个要点一句话
4. 不要加数字或列表符号，直接列出观点，每行一个
5. 例如输出格式：
Key point 1
Key point 2
Key point 3`;

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
      .filter(line => line.length > 0 && !line.match(/^(格式|例如)/))
      .slice(0, 3);
  }
  return [];
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
            processedBlogs.push({
              ...blog,
              keyInsights: insights
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
        processedPodcasts.push({
          ...podcast,
          keyInsights: insights
        });
        console.log(`${colors.green}✓${colors.reset} Podcast: ${podcast.title}`);
      }
      rawDigest.podcasts = processedPodcasts;
    }

    // Process tweets - extract key insight from each
    if (rawDigest.x && rawDigest.x.length > 0) {
      console.log(`${colors.blue}𝕏 Processing tweets...${colors.reset}`);
      rawDigest.x = rawDigest.x.map((builder) => ({
        ...builder,
        tweets: builder.tweets.map((tweet) => {
          const insight = extractTweetKeyInsight(tweet.text);
          const insightStr = typeof insight === 'string' ? insight : String(insight);
          console.log(`${colors.green}✓${colors.reset} Tweet: ${insightStr.substring(0, 50)}...`);
          return {
            ...tweet,
            insight: insightStr
          };
        }),
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
 * Format digest as markdown - KEY INSIGHTS ONLY
 */
function formatDigestMarkdown(digest) {
  let markdown = `# AI Builders Digest\n\n`;
  markdown += `Generated: ${getBeijingTime()}\n\n`;
  markdown += `---\n\n`;

  // === SECTION 1: BLOGS ===
  if (digest.blogs && digest.blogs.length > 0) {
    markdown += `## 📰 Blogs\n\n`;

    digest.blogs.forEach((item) => {
      const title = item.title || 'Blog Post';
      const url = item.url || '#';
      const insights = item.keyInsights || [];

      markdown += `### ${title}\n`;
      markdown += `Bottom line: `;

      if (insights.length > 0) {
        markdown += insights[0] + `\n\n`;
        if (insights.length > 1) {
          markdown += `Key points:\n`;
          insights.slice(1).forEach((insight) => {
            markdown += `- ${insight}\n`;
          });
          markdown += `\n`;
        }
      }

      markdown += `<a href="${url}" target="_blank">${url}</a>\n\n`;
    });
  }

  // === SECTION 2: PODCASTS ===
  if (digest.podcasts && digest.podcasts.length > 0) {
    markdown += `## 🎙️ Podcasts\n\n`;

    digest.podcasts.forEach((item) => {
      const title = item.title || 'Episode';
      const source = item.name || 'Podcast';
      const url = item.url || '#';
      const insights = item.keyInsights || [];

      markdown += `### ${source} — "${title}"\n`;
      markdown += `Bottom line: `;

      if (insights.length > 0) {
        markdown += insights[0] + `\n\n`;
        if (insights.length > 1) {
          markdown += `Key insights:\n`;
          insights.slice(1).forEach((insight) => {
            markdown += `- ${insight}\n`;
          });
          markdown += `\n`;
        }
      }

      markdown += `<a href="${url}" target="_blank">${url}</a>\n\n`;
    });
  }

  // === SECTION 3: X TWEETS ===
  if (digest.x && digest.x.length > 0) {
    markdown += `## 𝕏 Tweets\n\n`;

    digest.x.forEach((builder) => {
      const name = builder.name || 'Unknown';
      const handle = builder.handle || 'unknown';
      const tweets = builder.tweets || [];

      if (tweets.length === 0) return;

      markdown += `### @${handle}\n`;
      markdown += `${name}\n`;

      // Show all tweets with their insights
      tweets.forEach((tweet) => {
        const insight = tweet.insight || tweet.text || '';
        const insightStr = typeof insight === 'string' ? insight : String(insight);
        const url = tweet.url || `https://x.com/status/${tweet.id || 'unknown'}`;
        markdown += `${insightStr}\n`;
        markdown += `<a href="${url}" target="_blank">${url}</a>\n`;
      });

      markdown += `\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `Reply to adjust your settings, sources, or summary style.\n`;

  return markdown;
}

// Run the digest generation
generateDailyDigest().catch((error) => {
  console.error(`${colors.red}Failed to generate digest:${colors.reset}`, error.message);
  process.exit(1);
});
