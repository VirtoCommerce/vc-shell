import fs from "node:fs";
import { toPascalCase, toKebabCase, toScreamingSnakeCase } from "./helpers.js";

/**
 * Insert an import statement at the top of a file (after existing imports).
 */
function insertImport(code: string, importStatement: string): string {
  // Find the last import statement
  const importRegex = /^import\s.+$/gm;
  let lastImportMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(code)) !== null) {
    lastImportMatch = match;
  }

  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    return code.slice(0, insertPos) + "\n" + importStatement + code.slice(insertPos);
  }
  // No imports found, prepend
  return importStatement + "\n" + code;
}

/**
 * Add a module import and app.use() call to main.ts
 */
export function addModuleToMain(mainTsPath: string, moduleName: string): void {
  let code = fs.readFileSync(mainTsPath, "utf-8");
  const pascalName = toPascalCase(moduleName);
  const kebabName = toKebabCase(moduleName);

  // Add import statement
  code = insertImport(code, `import ${pascalName} from "./modules/${kebabName}";`);

  // Find last .use(ModuleName, { router }) and insert after it
  const usePattern = /\.use\([A-Z]\w+,\s*\{\s*router\s*\}\)/g;
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = usePattern.exec(code)) !== null) {
    lastMatch = m;
  }

  if (lastMatch) {
    const insertPos = lastMatch.index + lastMatch[0].length;
    const insertion = `\n    .use(${pascalName}, { router })`;
    code = code.slice(0, insertPos) + insertion + code.slice(insertPos);
  }

  fs.writeFileSync(mainTsPath, code);
}

/**
 * Add a menu item registration to bootstrap.ts
 */
export function addMenuItemToBootstrap(bootstrapPath: string, moduleName: string): void {
  let code = fs.readFileSync(bootstrapPath, "utf-8");
  const kebabName = toKebabCase(moduleName);
  const screamingSnake = toScreamingSnakeCase(moduleName);

  // Ensure addMenuItem is imported
  if (!code.includes("addMenuItem")) {
    // Add to existing framework import or add new import
    const frameworkImport = /import\s*\{([^}]+)\}\s*from\s*["']@vc-shell\/framework["']/;
    const fwMatch = frameworkImport.exec(code);
    if (fwMatch) {
      const newImports = fwMatch[1].trim() + ", addMenuItem";
      code = code.replace(fwMatch[0], `import { ${newImports} } from "@vc-shell/framework"`);
    } else {
      code = insertImport(code, `import { addMenuItem } from "@vc-shell/framework";`);
    }
  }

  const addMenuPattern = /addMenuItem\(\{[\s\S]*?\}\);/g;
  let lastMenuMatch: RegExpExecArray | null = null;
  let menuMatch: RegExpExecArray | null;
  while ((menuMatch = addMenuPattern.exec(code)) !== null) {
    lastMenuMatch = menuMatch;
  }

  const menuItem = `\n  addMenuItem({\n    title: "${screamingSnake}.MENU.TITLE",\n    icon: "lucide-box",\n    priority: 10,\n    url: "/${kebabName}",\n  });`;

  if (lastMenuMatch) {
    const insertPos = lastMenuMatch.index + lastMenuMatch[0].length;
    code = code.slice(0, insertPos) + "\n" + menuItem + code.slice(insertPos);
  } else {
    const closingBrace = code.lastIndexOf("}");
    if (closingBrace !== -1) {
      code = code.slice(0, closingBrace) + menuItem + "\n" + code.slice(closingBrace);
    }
  }

  fs.writeFileSync(bootstrapPath, code);
}
