import path, { dirname } from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Run the check if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkLocales().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { checkLocales, compareLocales };
