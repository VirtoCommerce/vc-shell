import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).map((arg) => (arg === "--dry" ? "--dry-run" : arg));

const result = spawnSync("release-it", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error("\nFailed to run release-it:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
