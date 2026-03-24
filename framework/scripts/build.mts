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
  const outDir = path.join(__dirname, "../dist/locales");
  const files = fs.readdirSync(localesDir).filter((file) => file.endsWith(".json"));
  const baseLocale = path.join(localesDir, "en.json");

  fs.ensureDirSync(outDir);

  console.log(chalk.cyan("Building VC shell locales...\n"));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lang = file.replace(".json", "");
    process.stdout.write(`${chalk.green(`Output File ${i + 1}/${files.length}: `)} ${lang}.js`);

    const input = path.join(localesDir, file);

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

    const jsonContent = fs.readFileSync(input, "utf-8");
    fs.writeFileSync(path.join(outDir, `${lang}.js`), `export default ${jsonContent};\n`);

    // Also copy en.json as baseline for CLI validation tool
    if (file === "en.json") {
      fs.copySync(input, path.join(outDir, "en.json"));
    }

    console.log("\n");
  }

  generateLocaleTypes();

  return true;
}

function jsonToInterface(obj: Record<string, unknown>, indent = 2): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const pad = " ".repeat(indent);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      lines.push(`${pad}${key}: {`);
      lines.push(jsonToInterface(value as Record<string, unknown>, indent + 2));
      lines.push(`${pad}};`);
    } else {
      lines.push(`${pad}${key}: string;`);
    }
  }
  return lines.join("\n");
}

function generateLocaleTypes() {
  const localesDir = path.join(__dirname, "../locales");
  const outDir = path.join(__dirname, "../dist/locales");
  const files = fs.readdirSync(localesDir).filter((file) => file.endsWith(".json"));

  console.log(chalk.cyan("Generating locale type declarations...\n"));

  // Generate types.d.ts from en.json
  const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf-8"));
  const interfaceBody = jsonToInterface(enJson);

  const typesContent = [
    "// Auto-generated from en.json — do not edit manually",
    "",
    "export type DeepPartial<T> = {",
    "  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];",
    "};",
    "",
    "export interface VcShellLocale {",
    interfaceBody,
    "}",
    "",
    "export type VcShellLocalePartial = DeepPartial<VcShellLocale>;",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(outDir, "types.d.ts"), typesContent);
  console.log(chalk.green("  types.d.ts"));

  // Generate <lang>.d.ts for each locale
  for (const file of files) {
    const lang = file.replace(".json", "");
    const dtsContent = [
      `import { VcShellLocale } from "./types";`,
      `declare const locale: VcShellLocale;`,
      `export default locale;`,
      "",
    ].join("\n");

    fs.writeFileSync(path.join(outDir, `${lang}.d.ts`), dtsContent);
    console.log(chalk.green(`  ${lang}.d.ts`));
  }

  console.log("");
}

async function buildShell(command: string) {
  return sync("yarn", [command], { stdio: "inherit" });
}

async function buildCheckLocalesCli() {
  const { build } = await import("esbuild");
  console.log(chalk.cyan("Building vc-check-locales CLI...\n"));
  await build({
    entryPoints: [path.join(__dirname, "check-locales.mts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    outfile: path.join(__dirname, "../dist/scripts/check-locales.cjs"),
    banner: { js: "#!/usr/bin/env node" },
  });
  console.log(chalk.green("  dist/scripts/check-locales.cjs\n"));
}

async function Bundle() {
  try {
    await buildShell("build:lib");
    await buildShell("build:types");
    await buildLocales();
    await buildCheckLocalesCli();
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
