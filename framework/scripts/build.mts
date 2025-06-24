import path, { dirname } from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { sync } from "cross-spawn";
import { compareLocales } from "./check-locales.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildLocales() {
  const localesDir = path.join(__dirname, "../locales");
  const files = fs.readdirSync(localesDir).filter((file) => file.endsWith(".json"));
  const baseLocale = path.join(localesDir, "en.json");

  console.log(chalk.cyan("Building VC shell locales...\n"));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    process.stdout.write(`${chalk.green(`Output File ${i + 1}/${files.length}: `)} ${file}`);

    const input = path.join(__dirname, "../locales", file);
    const out = path.join(__dirname, "../dist/locales", file);

    if (file !== "en.json") {
      const { missing, extra } = compareLocales(baseLocale, input);
      if (missing.length > 0 || extra.length > 0) {
        console.log(chalk.yellow("\nLocalization has differences:"));
        if (missing.length > 0) {
          console.log(chalk.red(`\nMissing keys in ${file}:`));
          console.log(missing.join(", "));
        }
        if (extra.length > 0) {
          console.log(chalk.yellow(`\nExtra keys in ${file}:`));
          console.log(extra.join(", "));
        }
      }
    }

    fs.copySync(input, out);
    console.log("\n");
  }

  return true;
}

async function buildShell(command: string) {
  return sync("yarn", [command], { stdio: "inherit" });
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
