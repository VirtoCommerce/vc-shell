import fs from "node:fs";
import path from "node:path";
import ejs from "ejs";

const BINARY_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".pdf", ".zip"]);

const RENAME_MAP: Record<string, string> = {
  _gitignore: ".gitignore",
  "_yarnrc.yml": ".yarnrc.yml",
  _browserslistrc: ".browserslistrc",
  "_commitlintrc.json": ".commitlintrc.json",
  _editorconfig: ".editorconfig",
  _env: ".env",
  "_env.local": ".env.local",
  _eslintignore: ".eslintignore",
  _prettierignore: ".prettierignore",
  _prettierrc: ".prettierrc",
  "_eslintrc.js": ".eslintrc.js",
  _github: ".github",
  _vscode: ".vscode",
  _yarn: ".yarn",
  "_package.json": "package.json",
};

/**
 * Render a single template file. Strips .ejs extension.
 * Binary files are copied as-is. Text files are rendered through EJS.
 */
export function renderTemplate(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>,
): void {
  if (outputPath.endsWith(".ejs")) {
    outputPath = outputPath.slice(0, -4);
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ext = path.extname(templatePath.replace(/\.ejs$/, "")).toLowerCase();

  if (BINARY_EXTENSIONS.has(ext)) {
    fs.copyFileSync(templatePath, outputPath);
  } else {
    const content = fs.readFileSync(templatePath, "utf-8");
    const rendered = ejs.render(content, data, { filename: templatePath });
    fs.writeFileSync(outputPath, rendered);
  }
}

/**
 * Recursively render all files in a template directory to an output directory.
 * Handles file renames (underscore → dot prefix) and EJS variable substitution
 * in file/directory names.
 */
export function renderDir(
  templateDir: string,
  outputDir: string,
  data: Record<string, unknown>,
): void {
  if (!fs.existsSync(templateDir)) return;

  const entries = fs.readdirSync(templateDir);

  for (const entry of entries) {
    const sourcePath = path.join(templateDir, entry);

    // Strip .ejs before rename lookup so _package.json.ejs → _package.json → package.json
    let baseName = entry.endsWith(".ejs") ? entry.slice(0, -4) : entry;
    let targetName = RENAME_MAP[baseName] ?? baseName;
    // Replace template variables in file/directory names
    try {
      targetName = ejs.render(targetName, data);
    } catch {
      // If EJS rendering fails for a filename, use it as-is
    }

    const targetPath = path.join(outputDir, targetName);

    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      renderDir(sourcePath, targetPath, data);
    } else {
      renderTemplate(sourcePath, targetPath, data);
    }
  }
}

/**
 * Empty a directory (remove all contents but keep the dir itself).
 * Preserves .git directory.
 */
export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Check if a directory is empty (or only has .git)
 */
export function isDirEmpty(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) return true;
  const files = fs.readdirSync(dirPath);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}
