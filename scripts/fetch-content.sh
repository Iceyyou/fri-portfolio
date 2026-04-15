#!/bin/bash
# Fetch all content (diary + weekly) from private repo bravohenry/fri-content
# Runs at build time on Vercel (needs CONTENT_GITHUB_TOKEN env var)
# Locally, files are already in content/ (gitignored)

DIARY="content/diary"
WEEKLY="content/weekly"
DAILY="content/daily"

# skip if content already present (local dev)
if [ -d "$DIARY" ] && [ "$(ls -A $DIARY 2>/dev/null)" ]; then
  echo "[fetch-content] content/ already has files, skipping fetch"
  exit 0
fi

TOKEN="${CONTENT_GITHUB_TOKEN:-$DIARY_GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "[fetch-content] WARNING: No GitHub token set, skipping content fetch"
  echo "[fetch-content] Set CONTENT_GITHUB_TOKEN environment variable in Vercel"
  mkdir -p "$DIARY" "$WEEKLY" "$DAILY"
  exit 0
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
  cp /tmp/fri-content-clone/daily/*.md "$DAILY/" 2>/dev/null && echo "[fetch-content] ✓ Fetched $(ls $DAILY/*.md 2>/dev/null | wc -l | tr -d ' ') daily digests" || echo "[fetch-content] No daily digests found"
else
  echo "[fetch-content] No daily directory in source repo"
fi

rm -rf /tmp/fri-content-clone
echo "[fetch-content] ✓ Content fetch complete"
exit 0
