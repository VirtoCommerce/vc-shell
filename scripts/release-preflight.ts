import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

interface Check {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
}

interface PreflightCache {
  schemaVersion: number;
  fingerprint: string;
  head: string;
  branch: string;
  createdAt: string;
}

const checks: Check[] = [
  {
    name: "TypeScript",
    command: "npx",
    args: ["vue-tsc", "--noEmit"],
    cwd: "framework",
  },
  {
    name: "Lint",
    command: "npx",
    args: [
      "eslint",
      "--cache",
      "framework/**/*.{ts,vue}",
      "cli/**/*.{ts,vue}",
      "configs/**/*.{ts,vue}",
      "packages/**/*.{ts,vue}",
    ],
  },
  {
    name: "Tests",
    command: "npx",
    args: ["vitest", "run"],
    cwd: "framework",
  },
  {
    name: "Build",
    command: "yarn",
    args: ["build"],
  },
  {
    name: "Circular deps",
    command: "yarn",
    args: ["check:circular"],
  },
];

const CACHE_SCHEMA_VERSION = 1;
const CACHE_FILE = path.join(".yarn", ".cache", "release-preflight.json");

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function getEnvFlag(name: string): boolean {
  const value = process.env[name];
  return value === "1" || value === "true";
}

function runGitCommand(args: string[]): string {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout.trimEnd();
}

function getChecksSignature(): string {
  return checks.map((check) => `${check.name}|${check.command}|${check.args.join(" ")}|${check.cwd ?? "."}`).join("\n");
}

function buildFingerprint(head: string, branch: string, status: string): string {
  const source = [
    `schema=${CACHE_SCHEMA_VERSION}`,
    `head=${head}`,
    `branch=${branch}`,
    `status=${status}`,
    `node=${process.version}`,
    `prerelease=${process.env.PRERELEASE_CHANNEL ?? ""}`,
    `checks=${getChecksSignature()}`,
  ].join("\n---\n");

  return createHash("sha256").update(source).digest("hex");
}

function readCache(): PreflightCache | null {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as PreflightCache;
    if (
      parsed.schemaVersion !== CACHE_SCHEMA_VERSION ||
      !parsed.fingerprint ||
      !parsed.head ||
      !parsed.branch ||
      !parsed.createdAt
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: PreflightCache) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
}

function runChecks() {
  const totalStart = Date.now();
  const cacheDisabled = getEnvFlag("RELEASE_PREFLIGHT_NO_CACHE") || !!process.env.CI;

  console.log("\n\x1b[1mRelease preflight checks\x1b[0m");
  console.log("\x1b[90m──────────────────────────────────\x1b[0m");

  let currentFingerprint: string | null = null;
  let head = "";
  let branch = "";

  if (!cacheDisabled) {
    try {
      head = runGitCommand(["rev-parse", "HEAD"]);
      branch = runGitCommand(["rev-parse", "--abbrev-ref", "HEAD"]);
      const status = runGitCommand(["status", "--porcelain=v1", "--untracked-files=all"]);
      currentFingerprint = buildFingerprint(head, branch, status);

      const cached = readCache();
      if (cached && cached.fingerprint === currentFingerprint) {
        console.log("  \x1b[32m✓\x1b[0m Preflight cache hit");
        console.log(
          `  \x1b[90mLast successful run: ${cached.createdAt} (${cached.branch}@${cached.head.slice(0, 7)})\x1b[0m`,
        );
        console.log("  \x1b[90mSet RELEASE_PREFLIGHT_NO_CACHE=1 to force full re-check.\x1b[0m\n");
        return;
      }
    } catch (error) {
      console.log(`  \x1b[33m⚠\x1b[0m Cache unavailable: ${(error as Error).message}`);
      console.log("  \x1b[90mContinuing with full preflight run.\x1b[0m\n");
      currentFingerprint = null;
    }
  }

  for (const check of checks) {
    const dots = ".".repeat(Math.max(1, 24 - check.name.length));
    console.log(`  \x1b[33m▸\x1b[0m ${check.name} \x1b[90m${dots}\x1b[0m running`);

    const start = Date.now();

    const result = spawnSync(check.command, check.args, {
      stdio: "inherit",
      cwd: check.cwd,
      env: process.env,
      shell: process.platform === "win32",
    });

    const duration = Date.now() - start;
    const ok = result.status === 0;
    const time = formatDuration(duration);

    if (ok) {
      console.log(`  \x1b[32m✓\x1b[0m ${check.name} \x1b[90m${dots}\x1b[0m ${time}\n`);
    } else {
      console.log(`  \x1b[31m✗\x1b[0m ${check.name} \x1b[90m${dots}\x1b[0m \x1b[31mFAILED\x1b[0m (${time})`);
      console.log(`\n\x1b[31mRelease aborted.\x1b[0m\n`);
      process.exit(1);
    }
  }

  const totalDuration = formatDuration(Date.now() - totalStart);

  console.log("\x1b[90m──────────────────────────────────\x1b[0m");
  console.log(`  \x1b[32m✓ All checks passed\x1b[0m (${totalDuration})\n`);

  if (!cacheDisabled) {
    try {
      if (!currentFingerprint) {
        head = runGitCommand(["rev-parse", "HEAD"]);
        branch = runGitCommand(["rev-parse", "--abbrev-ref", "HEAD"]);
        const status = runGitCommand(["status", "--porcelain=v1", "--untracked-files=all"]);
        currentFingerprint = buildFingerprint(head, branch, status);
      }
      writeCache({
        schemaVersion: CACHE_SCHEMA_VERSION,
        fingerprint: currentFingerprint,
        head,
        branch,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.log(`  \x1b[33m⚠\x1b[0m Could not update preflight cache: ${(error as Error).message}`);
    }
  }
}

runChecks();
