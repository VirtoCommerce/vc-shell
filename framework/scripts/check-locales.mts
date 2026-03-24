import path, { dirname } from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";

// In ESM (tsx): derive from import.meta.url. In CJS (esbuild bundle): use Node's globals.
/* eslint-disable no-var */
var __filename: string, __dirname: string;
try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} catch {
  // CJS environment: __dirname and __filename are already defined by Node/esbuild
}

interface LocaleComparison {
  locale: string;
  missing: string[];
  extra: string[];
}

type LocaleObject = { [key: string]: string | LocaleObject };

function getAllKeys(obj: LocaleObject, prefix = ""): string[] {
  return Object.entries(obj).reduce((keys: string[], [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return [...keys, ...getAllKeys(value as LocaleObject, newKey)];
    }
    return [...keys, newKey];
  }, []);
}

function compareLocales(baseLocale: string, compareLocale: string): { missing: string[]; extra: string[] } {
  const base = JSON.parse(fs.readFileSync(baseLocale, "utf-8"));
  const compare = JSON.parse(fs.readFileSync(compareLocale, "utf-8"));

  const baseKeys = new Set(getAllKeys(base));
  const compareKeys = new Set(getAllKeys(compare));

  const missing = [...baseKeys].filter((key) => !compareKeys.has(key));
  const extra = [...compareKeys].filter((key) => !baseKeys.has(key));

  return { missing, extra };
}

async function checkLocales(): Promise<boolean> {
  const localesDir = path.join(__dirname, "../locales");
  const files = fs.readdirSync(localesDir).filter((file) => file.endsWith(".json"));
  const baseLocale = path.join(localesDir, "en.json");

  if (!files.includes("en.json")) {
    console.log(chalk.red("\n❌ Base locale (en.json) not found!"));
    return false;
  }

  const results: LocaleComparison[] = [];
  let hasErrors = false;

  console.log(chalk.cyan("Checking localizations against en.json...\n"));

  // Compare each locale (except en.json) with the base locale
  for (const file of files) {
    if (file === "en.json") continue;

    const compareLocale = path.join(localesDir, file);
    const { missing, extra } = compareLocales(baseLocale, compareLocale);

    if (missing.length > 0 || extra.length > 0) {
      hasErrors = true;
      results.push({
        locale: file,
        missing,
        extra,
      });
    }
  }

  if (results.length > 0) {
    console.log(chalk.yellow("Found differences in localizations:\n"));

    for (const result of results) {
      console.log(chalk.bold(`\n${result.locale}:`));

      if (result.missing.length > 0) {
        console.log(chalk.red("\nMissing keys:"));
        console.log(result.missing.join(", "));
      }

      if (result.extra.length > 0) {
        console.log(chalk.yellow("\nExtra keys:"));
        console.log(result.extra.join(", "));
      }
      console.log(); // Empty line for better readability
    }

    console.log(chalk.red("\n❌ Localization check failed. Please fix the issues above.\n"));
    return false;
  }

  console.log(chalk.green("✓ All localizations are in sync with en.json!\n"));
  return true;
}

// CLI entry point: npx vc-check-locales ./path/to/locale.json
async function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No args: run internal check (existing behavior)
    const success = await checkLocales();
    process.exit(success ? 0 : 1);
  }

  // External file validation against framework baseline
  const userFile = args[0];
  if (!fs.existsSync(userFile)) {
    console.log(chalk.red(`\nFile not found: ${userFile}`));
    process.exit(1);
  }

  // Resolve baseline en.json: first try source locales (dev), then fall back to dist
  // __dirname works both in tsx (top-level define) and in CJS esbuild bundle
  const candidates = [
    path.join(__dirname, "../locales/en.json"),         // source (when running via tsx in dev)
    path.join(__dirname, "../dist/locales/en.json"),    // fallback
    path.join(__dirname, "../locales/en.json"),         // when bundled as dist/scripts/ → ../locales/
  ];

  const resolvedBaseline = candidates.find((p) => fs.existsSync(p));

  if (!resolvedBaseline) {
    console.log(chalk.red("\nCould not find framework baseline locale (en.json)"));
    process.exit(1);
  }

  console.log(chalk.cyan(`Checking ${path.basename(userFile)} against framework baseline...\n`));

  const { missing, extra } = compareLocales(resolvedBaseline, path.resolve(userFile));

  if (missing.length > 0) {
    console.log(chalk.red(`Missing keys (${missing.length}):`));
    console.log(missing.join("\n"));
    console.log();
  }

  if (extra.length > 0) {
    console.log(chalk.yellow(`Extra keys (${extra.length}):`));
    console.log(extra.join("\n"));
    console.log();
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log(chalk.green(`✓ ${path.basename(userFile)} is complete — all keys match the framework baseline.`));
    process.exit(0);
  } else {
    console.log(chalk.red(`✗ Found ${missing.length} missing and ${extra.length} extra keys.`));
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename || process.argv[1]?.endsWith("/vc-check-locales")) {
  cli();
}

export { checkLocales, compareLocales };
