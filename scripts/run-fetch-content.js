#!/usr/bin/env node
/**
 * Cross-platform script runner for fetch-content.sh
 * - On Linux/macOS: executes fetch-content.sh directly
 * - On Windows: would need implementation, but Vercel builds on Linux
 * This avoids chmod issues on Windows and bash dependency issues on older systems
 */

const { execSync } = require("child_process");
const path = require("path");
const os = require("os");

const scriptPath = path.join(__dirname, "fetch-content.sh");

try {
  if (os.platform() === "win32") {
    console.log("[run-fetch-content] Windows detected - fetch-content.sh execution skipped");
    console.log("[run-fetch-content] On Vercel (Linux), fetch-content.sh will run automatically");
    process.exit(0);
  }

  console.log("[run-fetch-content] Executing fetch-content.sh...");
  execSync(`bash "${scriptPath}"`, { stdio: "inherit" });
  console.log("[run-fetch-content] ✓ Script completed successfully");
} catch (error) {
  console.error("[run-fetch-content] ✗ Script failed:", error.message);
  process.exit(1);
}
