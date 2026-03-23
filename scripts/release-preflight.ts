import { spawnSync } from "node:child_process";

interface Check {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
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
    command: "yarn",
    args: ["lint"],
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
    args: ["check-circular"],
  },
];

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function runChecks() {
  const totalStart = Date.now();
  const results: { name: string; ok: boolean; duration: number }[] = [];

  console.log("\n\x1b[1mRelease preflight checks\x1b[0m");
  console.log("\x1b[90m──────────────────────────────────\x1b[0m");

  for (const check of checks) {
    const start = Date.now();

    const result = spawnSync(check.command, check.args, {
      stdio: "pipe",
      cwd: check.cwd,
      env: process.env,
      shell: process.platform === "win32",
    });

    const duration = Date.now() - start;
    const ok = result.status === 0;

    results.push({ name: check.name, ok, duration });

    const dots = ".".repeat(Math.max(1, 24 - check.name.length));
    const time = formatDuration(duration);

    if (ok) {
      console.log(`  \x1b[32m✓\x1b[0m ${check.name} \x1b[90m${dots}\x1b[0m ${time}`);
    } else {
      console.log(`  \x1b[31m✗\x1b[0m ${check.name} \x1b[90m${dots}\x1b[0m \x1b[31mFAILED\x1b[0m (${time})`);

      const stderr = result.stderr?.toString().trim();
      const stdout = result.stdout?.toString().trim();
      const output = stderr || stdout;

      if (output) {
        console.log("");
        console.log(
          output
            .split("\n")
            .map((line) => `  ${line}`)
            .join("\n"),
        );
      }

      console.log(`\n\x1b[31mRelease aborted.\x1b[0m\n`);
      process.exit(1);
    }
  }

  const totalDuration = formatDuration(Date.now() - totalStart);

  console.log("\x1b[90m──────────────────────────────────\x1b[0m");
  console.log(`  \x1b[32m✓ All checks passed\x1b[0m (${totalDuration})\n`);
}

runChecks();
