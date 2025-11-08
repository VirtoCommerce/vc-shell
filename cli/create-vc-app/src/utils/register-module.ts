import fs from "node:fs";
import path from "node:path";
import { default as chalk } from "chalk";
import { formatFile } from "./format.js";

/**
 * Registers a new module in main.ts by adding import and .use() call
 *
 * Supports two styles:
 * 1. Chain style: const app = createApp().use(...).use(router);
 * 2. Separate style: const app = createApp(); app.use(...); app.use(router);
 *
 * @param cwd - Current working directory
 * @param moduleName - Module name (e.g., "orders")
 * @param moduleNamePascal - Module name in PascalCase (e.g., "Orders")
 * @returns true if successful, false otherwise
 */
export async function registerModuleInMainTs(
  cwd: string,
  moduleName: string,
  moduleNamePascal: string
): Promise<boolean> {
  const mainTsPath = path.join(cwd, "src", "main.ts");

  if (!fs.existsSync(mainTsPath)) {
    console.log(chalk.yellow(`⚠️  main.ts not found at ${mainTsPath}`));
    console.log(chalk.yellow(`   Please register the module manually.`));
    return false;
  }

  try {
    let content = fs.readFileSync(mainTsPath, "utf-8");

    const importStatement = `import ${moduleNamePascal}Module from "./modules/${moduleName}";`;

    // Check if already registered
    if (content.includes(importStatement) || content.includes(`from "./modules/${moduleName}"`)) {
      console.log(chalk.yellow(`   Module ${moduleName} is already registered in main.ts`));
      return true;
    }

    // Find last import statement
    const importRegex = /^import\s+.+\s+from\s+['"]\.\/.+['"];?\s*$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);

      // Add import after last import
      content = content.slice(0, lastImportIndex + lastImport.length) +
        `\n${importStatement}` +
        content.slice(lastImportIndex + lastImport.length);
    } else {
      // No imports found, add at the beginning after comments
      const firstLineAfterComments = content.search(/^import/m);
      if (firstLineAfterComments !== -1) {
        content = content.slice(0, firstLineAfterComments) +
          `${importStatement}\n` +
          content.slice(firstLineAfterComments);
      }
    }

    // Detect style: chain (.use()) or separate (app.use())
    const createAppMatch = content.match(/const\s+app\s*=\s*createApp\([^)]*\)([;\s]*\n)/);

    let isChainStyle = false;
    if (createAppMatch) {
      const afterCreateApp = content.slice(content.indexOf(createAppMatch[0]) + createAppMatch[0].length, content.indexOf(createAppMatch[0]) + createAppMatch[0].length + 50);
      // If next non-whitespace line starts with .use() → chain style
      isChainStyle = /^\s*\.use\(/.test(afterCreateApp);
    }

    // Find app.use(router) or .use(router) and insert BEFORE it
    const useRouterRegex = /(app\.use|\.use)\(router\)/;
    const useRouterMatch = content.match(useRouterRegex);

    if (useRouterMatch) {
      const useRouterIndex = content.indexOf(useRouterMatch[0]);

      // Find the start of the line to preserve indentation
      let lineStart = useRouterIndex;
      while (lineStart > 0 && content[lineStart - 1] !== '\n') {
        lineStart--;
      }

      // Extract indentation
      const indentation = content.slice(lineStart, useRouterIndex).match(/^\s*/)?.[0] || '  ';

      // Create appropriate .use() statement based on detected style
      let useStatement: string;
      if (isChainStyle) {
        // Chain style: .use(Module, { router })
        useStatement = `${indentation}.use(${moduleNamePascal}Module, { router })`;
      } else {
        // Separate style: app.use(Module, { router });
        useStatement = `${indentation}app.use(${moduleNamePascal}Module, { router });`;
      }

      // Insert new .use() call BEFORE .use(router)
      content = content.slice(0, lineStart) +
        `${useStatement}\n` +
        content.slice(lineStart);
    } else {
      // Fallback: try to find any .use() chain
      const useRegex = /(app\.use|\.use)\([^)]+\)/g;
      const useMatches = [...content.matchAll(useRegex)];

      if (useMatches.length > 0) {
        const lastUse = useMatches[useMatches.length - 1];
        const lastUseIndex = lastUse.index! + lastUse[0].length;

        let useStatement: string;
        if (isChainStyle) {
          useStatement = `\n    .use(${moduleNamePascal}Module, { router })`;
        } else {
          useStatement = `\n  app.use(${moduleNamePascal}Module, { router });`;
        }

        content = content.slice(0, lastUseIndex) +
          useStatement +
          content.slice(lastUseIndex);
      }
    }

    fs.writeFileSync(mainTsPath, content, "utf-8");
    console.log(chalk.green(`✓ Registered module in main.ts`));
    return true;
  } catch (error: any) {
    console.log(chalk.yellow(`⚠️  Failed to auto-register module: ${error.message}`));
    console.log(chalk.yellow(`   Please register manually.`));
    return false;
  }
}

/**
 * Registers blades in pages/index.ts
 *
 * @param modulePath - Path to module directory
 * @param bladeNames - Array of blade names to export
 * @returns true if successful
 */
export async function registerBladesInIndex(
  modulePath: string,
  bladeNames: Array<{ exportName: string; fileName: string }>
): Promise<boolean> {
  const pagesDir = path.join(modulePath, "pages");
  const indexPath = path.join(pagesDir, "index.ts");

  try {
    let content = "";

    if (fs.existsSync(indexPath)) {
      content = fs.readFileSync(indexPath, "utf-8");
    }

    for (const blade of bladeNames) {
      const exportStatement = `export { default as ${blade.exportName} } from "./${blade.fileName}.vue";`;

      if (!content.includes(exportStatement) && !content.includes(`from "./${blade.fileName}.vue"`)) {
        content += exportStatement + "\n";
      }
    }

    fs.writeFileSync(indexPath, content, "utf-8");
    await formatFile(indexPath);
    console.log(chalk.green(`✓ Updated pages/index.ts`));
    return true;
  } catch (error: any) {
    console.log(chalk.yellow(`⚠️  Failed to update pages/index.ts: ${error.message}`));
    return false;
  }
}

