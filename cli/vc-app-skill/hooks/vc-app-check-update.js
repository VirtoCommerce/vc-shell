#!/usr/bin/env node
// Check for vc-app-skill updates in background, write result to cache
// Called by SessionStart hook - runs once per session

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const homeDir = os.homedir();
const cwd = process.cwd();

function detectConfigDir(baseDir) {
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir && fs.existsSync(path.join(envDir, "vc-app-skill", "VERSION"))) {
    return envDir;
  }
  for (const dir of [".config/opencode", ".opencode", ".gemini", ".claude"]) {
    if (fs.existsSync(path.join(baseDir, dir, "vc-app-skill", "VERSION"))) {
      return path.join(baseDir, dir);
    }
  }
  return envDir || path.join(baseDir, ".claude");
}

const globalConfigDir = detectConfigDir(homeDir);
const projectConfigDir = detectConfigDir(cwd);
const cacheDir = path.join(globalConfigDir, "cache");
const cacheFile = path.join(cacheDir, "vc-app-update-check.json");

const projectVersionFile = path.join(projectConfigDir, "vc-app-skill", "VERSION");
const globalVersionFile = path.join(globalConfigDir, "vc-app-skill", "VERSION");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const child = spawn(process.execPath, ["-e", `
  const fs = require("fs");
  const { execSync } = require("child_process");

  const cacheFile = ${JSON.stringify(cacheFile)};
  const projectVersionFile = ${JSON.stringify(projectVersionFile)};
  const globalVersionFile = ${JSON.stringify(globalVersionFile)};

  let installed = "0.0.0";
  try {
    if (fs.existsSync(projectVersionFile)) {
      installed = fs.readFileSync(projectVersionFile, "utf8").trim();
    } else if (fs.existsSync(globalVersionFile)) {
      installed = fs.readFileSync(globalVersionFile, "utf8").trim();
    }
  } catch (e) {}

  let latest = null;
  try {
    latest = execSync("npm view @vc-shell/vc-app-skill version", { encoding: "utf8", timeout: 10000, windowsHide: true }).trim();
  } catch (e) {}

  const result = {
    update_available: latest && installed !== latest,
    installed,
    latest: latest || "unknown",
    checked: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(cacheFile, JSON.stringify(result));
`], {
  stdio: "ignore",
  windowsHide: true,
  detached: true
});

child.unref();
