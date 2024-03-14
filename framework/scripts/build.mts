import path, { dirname } from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildLocales() {
  const localesDir = path.join(__dirname, "../locales");
  const files = fs.readdirSync(localesDir);

  console.log(chalk.cyan("Building VC shell locales...\n"));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file === "index.ts") break;
    process.stdout.write(`${chalk.green(`Output File ${i + 1}/${files.length - 1}: `)} ${file}`);

    const input = path.join(__dirname, "../locales", file);
    const out = path.join(__dirname, "../dist/locales", file);
    fs.copySync(input, out);
    console.log("\n");
  }

  return true;
}

async function buildShell(command: string) {
  return await spawnSync("yarn", [command], { stdio: "inherit" });
}

async function Bundle() {
  try {
    await buildShell("build:lib");
    await buildShell("build:types");
    await buildLocales();
  } catch (e) {
    if (e?.stderr) {
      console.error(e.stderr);
      process.exit(1);
    }
  }
}

Bundle().then(() => {
  console.log(chalk.green("VC shell build complete."));
});
