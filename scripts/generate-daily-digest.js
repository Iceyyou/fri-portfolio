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
 * 2. For podcasts: Extract key insights from transcript
 * 3. For tweets: Generate English summary + Chinese translation using Ollama
 * 4. Format with proper structure
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
 * Generate Chinese translation using Ollama
 */
async function generateChineseSummary(text) {
  const prompt = `用中文总结以下内容的核心要点，2-4 句话。保留英文术语和人名的英文原文，不要翻译。不要包含"总结："或其他前缀，直接给出总结内容。`;
  
  const result = await callOllama(prompt, text, 2);
  if (result) return result;
  
  // Fallback: return original text if translation fails
  return text;
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

    console.log(`${colors.blue}✨ Processing podcasts and tweets...${colors.reset}`);
    
    // Process podcasts
    if (rawDigest.podcasts) {
      rawDigest.podcasts = rawDigest.podcasts.map((item) => ({
        ...item,
        keyInsights: extractKeyInsights(item.transcript || ''),
      }));
    }

    // Process tweets with translations
    if (rawDigest.x && rawDigest.x.length > 0) {
      console.log(`${colors.blue}🌐 Translating tweets to Chinese using Ollama...${colors.reset}`);
      
      // Collect all tweet summaries for batch translation
      const summariesToTranslate = [];
      
      rawDigest.x.forEach((builder) => {
        if (builder.tweets) {
          builder.tweets.forEach((tweet) => {
            const summary = generateTweetSummary(tweet.text);
            summariesToTranslate.push(summary);
          });
        }
      });

      // Batch translate all summaries
      const translatedSummaries = [];
      for (const summary of summariesToTranslate) {
        try {
          const translated = await generateChineseSummary(summary);
          translatedSummaries.push(translated);
          console.log(`${colors.green}✓${colors.reset} Translated: ${summary.substring(0, 40)}...`);
        } catch (e) {
          console.error(`${colors.yellow}⚠️  Translation failed:${colors.reset}`, e.message);
          translatedSummaries.push(summary); // Fallback
        }
        
        // Delay between requests to avoid overwhelming Ollama
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`${colors.green}✓ Completed ${translatedSummaries.length} translations${colors.reset}`);

      // Update tweets with translations
      let translationIdx = 0;
      rawDigest.x = rawDigest.x.map((builder) => ({
        ...builder,
        tweets: builder.tweets.map((tweet) => {
          const enSummary = generateTweetSummary(tweet.text);
          const zhSummary = translatedSummaries[translationIdx++] || enSummary;
          return {
            ...tweet,
            enSummary,
            zhSummary,
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
 * UI language: English only
 * Content: English + Chinese (collapsed)
 */
function getBeijingTime() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const yy = String(bjTime.getUTCFullYear()).slice(2);
  const mm = String(bjTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(bjTime.getUTCDate()).padStart(2, '0');
  const hh = String(bjTime.getUTCHours()).padStart(2, '0');
  const ss = String(bjTime.getUTCSeconds()).padStart(2, '0');
  return `${yy}-${mm}-${dd}-${hh}-${ss} UTC+8`;
}

function formatDigestMarkdown(digest) {
  let markdown = `# AI Builders Digest\n\n`;
  markdown += `Generated: ${getBeijingTime()}\n\n`;
  markdown += `---\n\n`;

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

      // Key insights section - English UI
      if (insights.length > 0) {
        markdown += `**Key Insights:**\n\n`;
        insights.forEach((insight) => {
          markdown += `- ${insight}\n`;
        });
        markdown += `\n`;
      }

      markdown += `[Watch](${url})\n\n`;
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
  const enSummary = tweet.enSummary || generateTweetSummary(tweet.text);
  const zhSummary = tweet.zhSummary || enSummary;
  const url = tweet.url || `https://x.com/status/${tweet.id || 'unknown'}`;

  let entry = `**${index}.** ${enSummary}\n\n`;

  // Chinese translation (collapsed by default, only if different)
  if (zhSummary !== enSummary) {
    entry += `<details>\n`;
    entry += `<summary>中文</summary>\n\n`;
    entry += `${zhSummary}\n\n`;
    entry += `</details>\n\n`;
  }

  // Link
  entry += `[View](${url})\n\n`;

  return entry;
}

// Run the digest generation
generateDailyDigest().catch((error) => {
  console.error(`${colors.red}Failed to generate digest:${colors.reset}`, error.message);
  process.exit(1);
});
