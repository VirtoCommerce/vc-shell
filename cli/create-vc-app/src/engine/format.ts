import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

/** Directories that are never worth walking into. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".yarn", "dist"]);

/**
 * Collect every file under `target`. `target` may be a file or a directory.
 */
function collectFiles(target: string, acc: string[] = []): string[] {
  if (!fs.existsSync(target)) return acc;

  if (!fs.statSync(target).isDirectory()) {
    acc.push(target);
    return acc;
  }

  for (const entry of fs.readdirSync(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    collectFiles(path.join(target, entry), acc);
  }
  return acc;
}

/**
 * Format generated sources in place.
 *
 * Templates are `.ejs`, so neither Prettier nor ESLint can check them directly —
 * EJS control tags and the regex splicing in `codegen.ts` both emit code whose
 * shape depends on runtime data. Running Prettier over the *output* is the only
 * point where the result can be normalised.
 *
 * Formatting is best-effort: a file Prettier cannot parse is left untouched
 * rather than failing the scaffold.
 */
export async function formatGenerated(targets: string[]): Promise<number> {
  const files = targets.flatMap((t) => collectFiles(t));
  let formatted = 0;

  for (const file of files) {
    try {
      const info = await prettier.getFileInfo(file, { resolveConfig: true });
      if (!info.inferredParser || info.ignored) continue;

      const source = fs.readFileSync(file, "utf-8");
      // `editorconfig: true` matches what the Prettier CLI does. Without it the
      // API ignores `.editorconfig` and falls back to printWidth 80, which would
      // rewrap code the generated project wants at 120.
      const config = await prettier.resolveConfig(file, { editorconfig: true });
      const result = await prettier.format(source, { ...config, filepath: file });

      if (result !== source) {
        fs.writeFileSync(file, result);
        formatted++;
      }
    } catch {
      // Unparseable output is a template bug, not a reason to abort the
      // scaffold — the user still gets a working project directory.
    }
  }

  return formatted;
}
