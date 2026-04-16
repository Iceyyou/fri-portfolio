#!/bin/bash
# Fetch all content (diary + weekly) from private repo bravohenry/fri-content
# Runs at build time on Vercel (needs CONTENT_GITHUB_TOKEN env var)
# Locally, files are already in content/ (gitignored)

DIARY="content/diary"
WEEKLY="content/weekly"
DAILY="content/daily"

TOKEN="${CONTENT_GITHUB_TOKEN:-$DIARY_GITHUB_TOKEN}"

echo "[fetch-content] ====== Debug Info ======"
echo "[fetch-content] TOKEN present: $([ -n "$TOKEN" ] && echo 'YES' || echo 'NO')"
echo "[fetch-content] TOKEN length: ${#TOKEN}"
echo "[fetch-content] VERCEL_GIT_COMMIT_REF: ${VERCEL_GIT_COMMIT_REF:-'not set'}"
echo "[fetch-content] ========================"

if [ -z "$TOKEN" ]; then
  echo "[fetch-content] ❌ ERROR: No GitHub token set!"
  echo "[fetch-content] Set CONTENT_GITHUB_TOKEN environment variable in Vercel"
  echo "[fetch-content] Creating empty directories to prevent build failure..."
  mkdir -p "$DIARY" "$WEEKLY" "$DAILY"
  exit 1  # Changed to exit 1 to fail the build and make the issue visible
fi

# Determine branch based on Vercel environment
# VERCEL_GIT_COMMIT_REF is set by Vercel (e.g., "master", "dev")
CONTENT_BRANCH="${VERCEL_GIT_COMMIT_REF:-master}"
echo "[fetch-content] Cloning content from private repo (branch: $CONTENT_BRANCH)..."

if git clone --depth 1 --branch "$CONTENT_BRANCH" "https://x-access-token:${TOKEN}@github.com/Iceyyou/fri-content.git" /tmp/fri-content-clone; then
  echo "[fetch-content] Clone successful from branch $CONTENT_BRANCH"
else
  echo "[fetch-content] ERROR: Failed to clone repository from branch $CONTENT_BRANCH"
  mkdir -p "$DIARY" "$WEEKLY" "$DAILY"
  exit 0
fi

mkdir -p "$DIARY" "$WEEKLY" "$DAILY"

# Copy diary files
if [ -d "/tmp/fri-content-clone/diary" ]; then
  cp /tmp/fri-content-clone/diary/*.md "$DIARY/" 2>/dev/null && echo "[fetch-content] ✓ Fetched $(ls $DIARY/*.md 2>/dev/null | wc -l | tr -d ' ') diary entries" || echo "[fetch-content] No diary entries found"
else
  echo "[fetch-content] No diary directory in source repo"
fi

# Copy weekly files
if [ -d "/tmp/fri-content-clone/weekly" ]; then
  cp /tmp/fri-content-clone/weekly/*.md "$WEEKLY/" 2>/dev/null && echo "[fetch-content] ✓ Fetched $(ls $WEEKLY/*.md 2>/dev/null | wc -l | tr -d ' ') weekly entries" || echo "[fetch-content] No weekly entries found"
else
  echo "[fetch-content] No weekly directory in source repo"
fi

# Copy daily files
if [ -d "/tmp/fri-content-clone/daily" ]; then
  echo "[fetch-content] Daily source directory exists"
  echo "[fetch-content] Files in source: $(ls /tmp/fri-content-clone/daily/*.md 2>/dev/null | wc -l | tr -d ' ')"
  cp /tmp/fri-content-clone/daily/*.md "$DAILY/" 2>/dev/null && echo "[fetch-content] ✓ Fetched $(ls $DAILY/*.md 2>/dev/null | wc -l | tr -d ' ') daily digests" || echo "[fetch-content] No daily digests found"
  echo "[fetch-content] Files after copy: $(ls $DAILY/*.md 2>/dev/null | wc -l | tr -d ' ')"
else
  echo "[fetch-content] ❌ No daily directory in source repo"
fi

rm -rf /tmp/fri-content-clone
echo "[fetch-content] ✓ Content fetch complete"
exit 0
