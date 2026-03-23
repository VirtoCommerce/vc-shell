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

// ─── Settings.json hook registration ─────────────────────────────────────────
function registerHook(settingsPath, hookCommand) {
  let settings = {};
  try {
    const raw = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — start fresh
  }

  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

  const sessionStart = settings.hooks.SessionStart;

  // Check for duplicate by command string across all hook objects
  const alreadyRegistered = sessionStart.some((entry) => {
    if (!entry || !Array.isArray(entry.hooks)) return false;
    return entry.hooks.some(
      (h) => h && h.type === 'command' && h.command === hookCommand,
    );
  });

  if (alreadyRegistered) {
    return false; // nothing changed
  }

  // Append a new hook group entry
  sessionStart.push({
    hooks: [
      {
        type: 'command',
        command: hookCommand,
      },
    ],
  });

  return settings;
}

// ─── Directory copy (merge, not replace) ──────────────────────────────────────
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(yellow(`  warning: source directory not found, skipping: ${src}`));
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

// ─── Read installed version ───────────────────────────────────────────────────
function readVersion() {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    try {
      const verPath = path.join(__dirname, '..', 'runtime', 'VERSION');
      return fs.readFileSync(verPath, 'utf8').trim();
    } catch {
      return 'unknown';
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseDir = args.global ? os.homedir() : process.cwd();
  const configDir = detectConfigDir(baseDir, args.runtime);
  const version = readVersion();

  console.log(bold('\n  @vc-shell/vc-app-skill installer'));
  console.log(`  version: ${cyan(version)}`);
  console.log(`  config dir: ${cyan(configDir)}\n`);

  // Source dirs (relative to this bin/ file)
  const srcRuntime = path.join(__dirname, '..', 'runtime');
  const srcCommands = path.join(__dirname, '..', 'commands');
  const srcHooks = path.join(__dirname, '..', 'hooks');

  // Destination dirs
  const destRuntime = path.join(configDir, 'vc-app-skill');
  const destCommands = path.join(configDir, 'commands');
  const destHooks = path.join(configDir, 'hooks');

  // 1. Copy runtime/ → {configDir}/vc-app-skill/
  console.log(`  copying runtime files...`);
  copyDir(srcRuntime, destRuntime);

  // 2. Copy commands/ → {configDir}/commands/  (merge)
  if (fs.existsSync(srcCommands)) {
    console.log(`  copying commands...`);
    copyDir(srcCommands, destCommands);
  }

  // 3. Copy hooks/ → {configDir}/hooks/  (merge)
  if (fs.existsSync(srcHooks)) {
    console.log(`  copying hooks...`);
    copyDir(srcHooks, destHooks);
  }

  // 4. Register SessionStart hook in settings.json
  const updateCheckHook = path.join(destHooks, 'vc-app-check-update.js');
  const hookCommand = `node "${updateCheckHook}"`;
  const settingsPath = path.join(configDir, 'settings.json');

  if (fs.existsSync(srcHooks) && fs.existsSync(path.join(srcHooks, 'vc-app-check-update.js'))) {
    console.log(`  registering SessionStart hook...`);
    const updated = registerHook(settingsPath, hookCommand);
    if (updated === false) {
      console.log(yellow(`  hook already registered, skipping`));
    } else if (updated) {
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
      console.log(`  registered hook in ${cyan(settingsPath)}`);
    }
  }

  // 5. Success summary
  console.log(green('\n  vc-app-skill installed successfully!\n'));
  console.log(`  Available commands:`);

  // List installed commands
  if (fs.existsSync(destCommands)) {
    try {
      const files = fs.readdirSync(destCommands).filter((f) => f.endsWith('.md'));
      for (const f of files) {
        const name = f.replace(/\.md$/, '');
        console.log(`    ${cyan('/')}${cyan(name)}`);
      }
    } catch {
      // ignore
    }
  }

  if (fs.existsSync(destRuntime)) {
    // Also list skill files
    try {
      const skillFiles = fs.readdirSync(destRuntime).filter((f) => f.endsWith('.md'));
      for (const f of skillFiles) {
        const name = f.replace(/\.md$/, '');
        console.log(`    ${cyan('/')}${cyan(name)}`);
      }
    } catch {
      // ignore
    }
  }

  console.log(`\n  Run ${cyan('/vc-app')} in your AI coding tool to get started.\n`);
}

main();
