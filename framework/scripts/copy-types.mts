import path, { dirname } from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyTypes() {
  console.log(chalk.cyan("Copying type declarations...\n"));

  // Copy globals.d.ts
  const globalsSource = path.join(__dirname, "../globals.d.ts");
  const globalsTarget = path.join(__dirname, "../dist/globals.d.ts");
  fs.copySync(globalsSource, globalsTarget);
  console.log(chalk.green("Copied: ") + "globals.d.ts");

  // Create typings directory
  const typingsDir = path.join(__dirname, "../dist/typings");
  fs.ensureDirSync(typingsDir);

  // Copy shims-vue.d.ts
  const shimsSource = path.join(__dirname, "../shims-vue.d.ts");
  const shimsTarget = path.join(__dirname, "../dist/shims-vue.d.ts");
  fs.copySync(shimsSource, shimsTarget);
  console.log(chalk.green("Copied: ") + "shims-vue.d.ts");
}

copyTypes().catch((err) => {
  console.error(chalk.red("Error copying type declarations:"), err);
  process.exit(1);
});
