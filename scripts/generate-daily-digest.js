#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Workflow:
 * 1. Get raw digest from follow-builders
 * 2. For podcasts: Extract & translate key insights
 * 3. For blogs: Fetch and process blog content
 * 4. For tweets: Keep English only (no translation)
 * 5. Format with proper structure
 */

// Ollama configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'mistral';

/**
 * Call Ollama API for summarization
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
 * Generate Chinese translation for podcast insights using Ollama
 */
async function generateChineseSummary(text) {
  const prompt = `用中文总结以下内容的核心要点，1-2 句话。保留英文术语和人名的英文原文，不要翻译。不要包含"总结："或其他前缀，直接给出总结内容。`;
  
  const result = await callOllama(prompt, text, 2);
  if (result) return result;
  
  // Fallback: return original text if translation fails
  return text;
}

/**
 * Extract and clean podcast key insights with Chinese translation
 */
async function extractKeyInsightsWithTranslation(transcript) {
  if (!transcript || transcript.length === 0) return [];
  
  const insights = extractKeyInsights(transcript);
  const result = [];
  
  for (const insight of insights) {
    const zhInsight = await generateChineseSummary(insight);
    result.push({
      en: insight,
      zh: zhInsight
    });
  }
  
  return result;
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
    // Extract main content - simple heuristic
    const contentMatch = html.match(/<article[^>]*>(.*?)<\/article>/is) || 
                        html.match(/<main[^>]*>(.*?)<\/main>/is) ||
                        html.match(/<div class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is);
    
    if (!contentMatch) return null;
    
    // Remove HTML tags and decode entities
    let text = contentMatch[1]
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
      .trim();
    
    return text.substring(0, 300); // First 300 chars
  } catch (e) {
    console.error(`Failed to fetch blog: ${e.message}`);
    return null;
  }
}

/**
 * Extract key insights from transcript
 */
function extractKeyInsights(transcript) {
  if (!transcript || transcript.length === 0) return [];
  
  const insights = [];
  const lines = transcript.split('\n');
  
  for (const line of lines) {
    // Look for substantial content (sentences)
    const match = line.match(/^(.{50,250}?)(?:\.|$)/);
    if (match) {
      const text = match[1].trim();
      // Only include substantial insights (>50 chars)
      if (text.length > 50 && text.length < 250) {
        insights.push(text);
      }
    }
  }
  
  // Return first 3 unique insights
  return [...new Set(insights)].slice(0, 3);
}

/**
 * Generate tweet summary
 */
function generateTweetSummary(text) {
  if (!text) return '(No content)';
  
  // Remove URLs
  let summary = text.replace(/https?:\/\/\S+/g, '').trim();
  
  // Remove leading @mentions
  summary = summary.replace(/^(@\w+\s*)+/g, '').trim();
  
  // Clean up whitespace
  summary = summary.replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (summary.length > 250) {
    summary = summary.substring(0, 247) + '...';
  }
  
  return summary;
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

    console.log(`${colors.blue}✨ Processing podcasts, blogs, and tweets...${colors.reset}`);
    
    // Process podcasts with Chinese translations
    if (rawDigest.podcasts) {
      console.log(`${colors.blue}🎙️  Translating podcast insights...${colors.reset}`);
      const processedPodcasts = [];
      for (const item of rawDigest.podcasts) {
        const keyInsights = await extractKeyInsightsWithTranslation(item.transcript || '');
        processedPodcasts.push({
          ...item,
          keyInsights
        });
      }
      rawDigest.podcasts = processedPodcasts;
    }

    // Process blogs
    if (rawDigest.blogs && rawDigest.blogs.length > 0) {
      console.log(`${colors.blue}📰 Fetching blog content...${colors.reset}`);
      for (const blog of rawDigest.blogs) {
        if (blog.url) {
          const content = await fetchBlogContent(blog.url);
          if (content) {
            blog.preview = content;
          }
        }
      }
    }

    // Tweets: No translation, keep English only
    if (rawDigest.x && rawDigest.x.length > 0) {
      console.log(`${colors.blue}𝕏 Processing tweets (English only)...${colors.reset}`);
      rawDigest.x = rawDigest.x.map((builder) => ({
        ...builder,
        tweets: builder.tweets.map((tweet) => {
          const summary = generateTweetSummary(tweet.text);
          console.log(`${colors.green}✓${colors.reset} Processed: ${summary.substring(0, 40)}...`);
          return {
            ...tweet,
            summary,
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
 * Format digest as markdown
 * New features: Blogs support, better podcast insights, tweet links open in new tabs
 * Time format: yyyy-mm-dd hh:mm:ss UTC+8
 */
function getBeijingTime() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const yyyy = String(bjTime.getUTCFullYear());
  const mm = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(bjTime.getUTCDate()).padStart(2, '0');
  const hh = String(bjTime.getUTCHours()).padStart(2, '0');
  const mi = String(bjTime.getUTCMinutes()).padStart(2, '0');
  const ss = String(bjTime.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC+8`;
}

function formatDigestMarkdown(digest) {
  let markdown = `# AI Builders Digest\n\n`;
  markdown += `Generated: ${getBeijingTime()}\n\n`;
  markdown += `---\n\n`;

  // === SECTION 0: BLOGS ===
  if (digest.blogs && digest.blogs.length > 0) {
    markdown += `## 📰 Blogs\n\n`;

    digest.blogs.forEach((item) => {
      const title = item.title || 'Blog Post';
      const url = item.url || '#';
      const preview = item.preview || '';

      markdown += `### ${title}\n\n`;

      if (preview) {
        markdown += `${preview}...\n\n`;
      }

      markdown += `[Read More](${url}){target="_blank"}\n\n`;
      markdown += `---\n\n`;
    });
  }

  // === SECTION 1: PODCASTS ===
  if (digest.podcasts && digest.podcasts.length > 0) {
    markdown += `## 🎙️ Podcasts\n\n`;

    digest.podcasts.forEach((item) => {
      const title = item.title || 'Episode';
      const source = item.name || 'Podcast';
      const url = item.url || '#';
      const insights = item.keyInsights || [];

      markdown += `### ${title}\n\n`;
      markdown += `**Source:** ${source}\n\n`;

      // Key insights with bilingual support
      if (insights.length > 0) {
        markdown += `**Key Insights:**\n\n`;
        insights.forEach((insight) => {
          if (typeof insight === 'object' && insight.en) {
            // Bilingual format
            markdown += `- ${insight.en}\n`;
            if (insight.zh && insight.zh !== insight.en) {
              markdown += `  > ${insight.zh}\n`;
            }
          } else {
            // String format fallback
            markdown += `- ${insight}\n`;
          }
        });
        markdown += `\n`;
      }

      markdown += `[Watch](${url}){target="_blank"}\n\n`;
      markdown += `---\n\n`;
    });
  }

  // === SECTION 2: X TWEETS ===
  if (digest.x && digest.x.length > 0) {
    markdown += `## 𝕏 Tweets\n\n`;

    digest.x.forEach((builder) => {
      const name = builder.name || 'Unknown';
      const handle = builder.handle || 'unknown';
      const tweets = builder.tweets || [];

      if (tweets.length === 0) return;

      // Logic: Collapse if more than 5 tweets
      const shouldCollapse = tweets.length > 5;

      if (shouldCollapse) {
        markdown += `<details>\n`;
        markdown += `<summary><strong>@${handle}</strong> (${name}) — ${tweets.length} tweets</summary>\n\n`;
      } else {
        markdown += `### @${handle} (${name})\n\n`;
      }

      // Show first 5 tweets
      const displayTweets = tweets.slice(0, 5);
      displayTweets.forEach((tweet, idx) => {
        markdown += formatTweetEntry(tweet, idx + 1);
      });

      // If more than 5, show "+more" section
      if (tweets.length > 5) {
        markdown += `<details>\n`;
        markdown += `<summary>⬇️ +${tweets.length - 5} More tweets</summary>\n\n`;

        tweets.slice(5).forEach((tweet, idx) => {
          markdown += formatTweetEntry(tweet, 5 + idx + 1);
        });

        markdown += `</details>\n\n`;
        markdown += `</details>\n\n`;
      } else {
        markdown += `---\n\n`;
      }
    });
  }

  markdown += `Auto-generated by [AI Builders Digest](https://github.com/zarazhangrui/follow-builders)\n`;

  return markdown;
}

function formatTweetEntry(tweet, index) {
  const summary = tweet.summary || generateTweetSummary(tweet.text);
  const url = tweet.url || `https://x.com/status/${tweet.id || 'unknown'}`;

  let entry = `**${index}.** ${summary}\n\n`;

  // Link with target="_blank" for new tab
  entry += `[View](${url}){target="_blank"}\n\n`;

  return entry;
}

// Run the digest generation
generateDailyDigest().catch((error) => {
  console.error(`${colors.red}Failed to generate digest:${colors.reset}`, error.message);
  process.exit(1);
});
