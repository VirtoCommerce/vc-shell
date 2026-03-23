#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── ANSI color helpers ────────────────────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

// ─── Arg parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { runtime: null, global: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--runtime' && argv[i + 1]) {
      args.runtime = argv[i + 1];
      i++;
    } else if (argv[i] === '--no-global') {
      args.global = false;
    } else if (argv[i] === '--global') {
      args.global = true;
    }
  }
  return args;
}

// ─── Config dir detection ─────────────────────────────────────────────────────
function detectConfigDir(baseDir, runtime) {
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir) return envDir;

  const runtimeDirs = {
    claude: ['.claude'],
    opencode: ['.config/opencode', '.opencode'],
    gemini: ['.gemini'],
  };

  if (runtime && runtimeDirs[runtime]) {
    // Use first candidate that exists, otherwise use first candidate
    const candidates = runtimeDirs[runtime];
    for (const rel of candidates) {
      const full = path.join(baseDir, rel);
      if (fs.existsSync(full)) return full;
    }
    return path.join(baseDir, candidates[0]);
  }

  // Auto-detect: check which dirs exist
  for (const [, dirs] of Object.entries(runtimeDirs)) {
    for (const rel of dirs) {
      const full = path.join(baseDir, rel);
      if (fs.existsSync(full)) return full;
    }
  }

  // Fallback: ~/.claude
  return path.join(baseDir, '.claude');
}

// ─── Settings.json hook removal ───────────────────────────────────────────────
function removeHook(settingsPath) {
  let settings;
  try {
    const raw = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — nothing to do
    return false;
  }

  if (!settings.hooks || !Array.isArray(settings.hooks.SessionStart)) {
    return false; // nothing to remove
  }

  const before = settings.hooks.SessionStart.length;

  // Filter out entries that contain a vc-app-check-update hook command
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter((entry) => {
    if (!entry || !Array.isArray(entry.hooks)) return true;
    const hasVcAppHook = entry.hooks.some(
      (h) => h && typeof h.command === 'string' && h.command.includes('vc-app-check-update'),
    );
    return !hasVcAppHook;
  });

  const after = settings.hooks.SessionStart.length;

  if (before === after) {
    return false; // nothing changed
  }

  // Remove empty SessionStart array
  if (settings.hooks.SessionStart.length === 0) {
    delete settings.hooks.SessionStart;
  }

  // Remove empty hooks object
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  return settings;
}

// ─── Remove file silently ─────────────────────────────────────────────────────
function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const KNOWN_RUNTIMES = ['claude', 'opencode', 'gemini'];

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.runtime && !KNOWN_RUNTIMES.includes(args.runtime)) {
    console.warn(yellow(`  warning: unknown runtime "${args.runtime}", falling back to auto-detect`));
    args.runtime = null;
  }

  const baseDir = args.global ? os.homedir() : process.cwd();
  const configDir = detectConfigDir(baseDir, args.runtime);

  console.log(bold('\n  @vc-shell/vc-app-skill uninstaller'));
  console.log(`  config dir: ${cyan(configDir)}\n`);

  // 1. Remove {configDir}/vc-app-skill/ directory
  const runtimeDir = path.join(configDir, 'vc-app-skill');
  if (fs.existsSync(runtimeDir)) {
    console.log(`  removing runtime directory...`);
    fs.rmSync(runtimeDir, { recursive: true, force: true });
    console.log(`  removed ${cyan(runtimeDir)}`);
  } else {
    console.log(yellow(`  runtime directory not found, skipping: ${runtimeDir}`));
  }

  // 2. Remove {configDir}/commands/vc-app.md
  const commandFile = path.join(configDir, 'commands', 'vc-app.md');
  if (removeFile(commandFile)) {
    console.log(`  removed ${cyan(commandFile)}`);
  } else {
    console.log(yellow(`  command file not found, skipping: ${commandFile}`));
  }

  // 3. Remove {configDir}/commands/vc-app/ directory
  const commandDir = path.join(configDir, 'commands', 'vc-app');
  if (fs.existsSync(commandDir)) {
    console.log(`  removing commands directory...`);
    fs.rmSync(commandDir, { recursive: true, force: true });
    console.log(`  removed ${cyan(commandDir)}`);
  } else {
    console.log(yellow(`  commands directory not found, skipping: ${commandDir}`));
  }

  // 4. Remove {configDir}/hooks/vc-app-check-update.js
  const hookFile = path.join(configDir, 'hooks', 'vc-app-check-update.js');
  if (removeFile(hookFile)) {
    console.log(`  removed ${cyan(hookFile)}`);
  } else {
    console.log(yellow(`  hook file not found, skipping: ${hookFile}`));
  }

  // 5. Remove {configDir}/cache/vc-app-update-check.json
  const cacheFile = path.join(configDir, 'cache', 'vc-app-update-check.json');
  if (removeFile(cacheFile)) {
    console.log(`  removed ${cyan(cacheFile)}`);
  } else {
    console.log(yellow(`  cache file not found, skipping: ${cacheFile}`));
  }

  // 6. Remove hook registration from settings.json
  const settingsPath = path.join(configDir, 'settings.json');
  console.log(`  updating settings.json...`);
  const updated = removeHook(settingsPath);
  if (updated === false) {
    console.log(yellow(`  no vc-app hooks found in settings.json, skipping`));
  } else if (updated) {
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
    console.log(`  removed hook registration from ${cyan(settingsPath)}`);
  }

  // 7. Confirmation
  console.log(green('\n  vc-app-skill uninstalled successfully!\n'));
}

main();
