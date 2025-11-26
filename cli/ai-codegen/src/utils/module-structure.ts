/**
 * Module Structure Utilities
 *
 * Creates and manages module structure for VC-Shell applications.
 * Used during code generation to scaffold new modules and update index files.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Convert kebab-case or lowercase to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Convert string to UPPER_SNAKE_CASE
 */
function toUpperSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toUpperCase();
}

/**
 * Check if module already exists
 */
export function moduleExists(cwd: string, moduleName: string): boolean {
  const modulePath = path.join(cwd, "src", "modules", moduleName);
  const indexPath = path.join(modulePath, "index.ts");
  return fs.existsSync(indexPath);
}

/**
 * Creates module structure for NEW modules only.
 * Does NOT use create-vc-app - creates structure directly.
 *
 * Creates:
 * - src/modules/{module}/index.ts
 * - src/modules/{module}/pages/index.ts
 * - src/modules/{module}/composables/index.ts
 * - src/modules/{module}/locales/index.ts
 * - src/modules/{module}/locales/en.json
 * - src/modules/{module}/components/widgets/index.ts
 *
 * Then registers the module in main.ts (BEFORE router!)
 */
export async function scaffoldModule(
  cwd: string,
  moduleName: string,
  options?: {
    displayName?: string;
  }
): Promise<{ created: boolean; registered: boolean; alreadyExists: boolean }> {
  // Check if module already exists
  if (moduleExists(cwd, moduleName)) {
    console.log(`[scaffoldModule] Module ${moduleName} already exists, skipping scaffold`);
    return { created: false, registered: false, alreadyExists: true };
  }

  const modulePath = path.join(cwd, "src", "modules", moduleName);
  const moduleNamePascal = toPascalCase(moduleName);
  const moduleNameUpper = toUpperSnakeCase(moduleName);
  const displayName = options?.displayName || moduleNamePascal;

  console.log(`[scaffoldModule] Creating module structure: ${moduleName}`);

  try {
    // Create directories
    const dirs = [
      modulePath,
      path.join(modulePath, "pages"),
      path.join(modulePath, "composables"),
      path.join(modulePath, "locales"),
      path.join(modulePath, "components", "widgets"),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Create module index.ts
    const moduleIndexContent = `import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export * from "./composables";
`;
    fs.writeFileSync(path.join(modulePath, "index.ts"), moduleIndexContent, "utf-8");

    // Create pages/index.ts (empty with comment)
    const pagesIndexContent = `// Auto-generated exports - do not edit manually
`;
    fs.writeFileSync(path.join(modulePath, "pages", "index.ts"), pagesIndexContent, "utf-8");

    // Create composables/index.ts (empty with comment)
    const composablesIndexContent = `// Auto-generated exports - do not edit manually
`;
    fs.writeFileSync(path.join(modulePath, "composables", "index.ts"), composablesIndexContent, "utf-8");

    // Create locales/index.ts
    const localesIndexContent = `import en from "./en.json";
export { en };
`;
    fs.writeFileSync(path.join(modulePath, "locales", "index.ts"), localesIndexContent, "utf-8");

    // Create locales/en.json with base structure
    const localesEnContent = {
      [moduleNameUpper]: {
        MENU: {
          TITLE: displayName,
        },
        PAGES: {},
      },
    };
    fs.writeFileSync(
      path.join(modulePath, "locales", "en.json"),
      JSON.stringify(localesEnContent, null, 2),
      "utf-8"
    );

    // Create components/widgets/index.ts (empty)
    const widgetsIndexContent = `// Auto-generated widget exports
`;
    fs.writeFileSync(
      path.join(modulePath, "components", "widgets", "index.ts"),
      widgetsIndexContent,
      "utf-8"
    );

    console.log(`[scaffoldModule] ✓ Created module structure`);

    // Register module in main.ts
    const registered = await registerModuleInMainTs(cwd, moduleName, moduleNamePascal);

    return { created: true, registered, alreadyExists: false };
  } catch (error: any) {
    console.error(`[scaffoldModule] ✗ Failed to scaffold module: ${error.message}`);
    throw error;
  }
}

/**
 * Registers a new module in main.ts by adding import and .use() call
 * CRITICAL: Inserts .use(Module, { router }) BEFORE .use(router)
 *
 * Adapted from create-vc-app/src/utils/register-module.ts
 */
async function registerModuleInMainTs(
  cwd: string,
  moduleName: string,
  moduleNamePascal: string
): Promise<boolean> {
  const mainTsPath = path.join(cwd, "src", "main.ts");

  if (!fs.existsSync(mainTsPath)) {
    console.log(`[registerModule] ⚠️ main.ts not found at ${mainTsPath}`);
    console.log(`[registerModule]    Please register the module manually.`);
    return false;
  }

  try {
    let content = fs.readFileSync(mainTsPath, "utf-8");

    const importStatement = `import ${moduleNamePascal}Module from "./modules/${moduleName}";`;

    // Check if already registered
    if (content.includes(importStatement) || content.includes(`from "./modules/${moduleName}"`)) {
      console.log(`[registerModule] Module ${moduleName} is already registered in main.ts`);
      return true;
    }

    // Find last import statement from local files
    const importRegex = /^import\s+.+\s+from\s+['"]\.\/.+['"];?\s*$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);

      // Add import after last import
      content =
        content.slice(0, lastImportIndex + lastImport.length) +
        `\n${importStatement}` +
        content.slice(lastImportIndex + lastImport.length);
    } else {
      // No local imports found, try to add after package imports
      const anyImportRegex = /^import\s+.+\s+from\s+['"].+['"];?\s*$/gm;
      const anyImports = content.match(anyImportRegex);

      if (anyImports && anyImports.length > 0) {
        const lastImport = anyImports[anyImports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);

        content =
          content.slice(0, lastImportIndex + lastImport.length) +
          `\n${importStatement}` +
          content.slice(lastImportIndex + lastImport.length);
      }
    }

    // Detect style: chain (.use()) or separate (app.use())
    const createAppMatch = content.match(/const\s+app\s*=\s*createApp\([^)]*\)([;\s]*\n)/);

    let isChainStyle = false;
    if (createAppMatch) {
      const afterCreateApp = content.slice(
        content.indexOf(createAppMatch[0]) + createAppMatch[0].length,
        content.indexOf(createAppMatch[0]) + createAppMatch[0].length + 50
      );
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
      while (lineStart > 0 && content[lineStart - 1] !== "\n") {
        lineStart--;
      }

      // Extract indentation
      const indentation = content.slice(lineStart, useRouterIndex).match(/^\s*/)?.[0] || "  ";

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
      content = content.slice(0, lineStart) + `${useStatement}\n` + content.slice(lineStart);
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

        content = content.slice(0, lastUseIndex) + useStatement + content.slice(lastUseIndex);
      }
    }

    fs.writeFileSync(mainTsPath, content, "utf-8");
    console.log(`[registerModule] ✓ Registered module in main.ts`);
    return true;
  } catch (error: any) {
    console.log(`[registerModule] ⚠️ Failed to auto-register module: ${error.message}`);
    console.log(`[registerModule]    Please register manually.`);
    return false;
  }
}

/**
 * Update composables/index.ts with new export
 *
 * Adds: export * from "./useEntityList";
 * or:   export { useEntityList, type IUseEntityList } from "./useEntityList";
 */
export async function updateComposablesIndex(
  cwd: string,
  moduleName: string,
  composableName: string
): Promise<void> {
  const indexPath = path.join(cwd, "src", "modules", moduleName, "composables", "index.ts");

  // Extract base name without extension
  const baseName = composableName.replace(/\.ts$/, "");

  // Create export statement
  const exportStatement = `export * from "./${baseName}";`;

  try {
    let content = "";

    if (fs.existsSync(indexPath)) {
      content = fs.readFileSync(indexPath, "utf-8");
    } else {
      // Create directory if needed
      const dir = path.dirname(indexPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      content = "// Auto-generated exports - do not edit manually\n";
    }

    // Check if already exported
    if (content.includes(`from "./${baseName}"`) || content.includes(`from './${baseName}'`)) {
      console.log(`[updateComposablesIndex] Export for ${baseName} already exists`);
      return;
    }

    // Add export
    content = content.trimEnd() + "\n" + exportStatement + "\n";

    fs.writeFileSync(indexPath, content, "utf-8");
    console.log(`[updateComposablesIndex] ✓ Added export for ${baseName}`);
  } catch (error: any) {
    console.error(`[updateComposablesIndex] ✗ Failed: ${error.message}`);
  }
}

/**
 * Update pages/index.ts with new blade export
 *
 * Adds: export { default as EntityList } from "./entity-list.vue";
 */
export async function updatePagesIndex(
  cwd: string,
  moduleName: string,
  bladeId: string,
  componentName: string
): Promise<void> {
  const indexPath = path.join(cwd, "src", "modules", moduleName, "pages", "index.ts");

  // Create export statement
  const exportStatement = `export { default as ${componentName} } from "./${bladeId}.vue";`;

  try {
    let content = "";

    if (fs.existsSync(indexPath)) {
      content = fs.readFileSync(indexPath, "utf-8");
    } else {
      // Create directory if needed
      const dir = path.dirname(indexPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      content = "// Auto-generated exports - do not edit manually\n";
    }

    // Check if already exported
    if (content.includes(`from "./${bladeId}.vue"`) || content.includes(`from './${bladeId}.vue'`)) {
      console.log(`[updatePagesIndex] Export for ${bladeId}.vue already exists`);
      return;
    }

    // Add export
    content = content.trimEnd() + "\n" + exportStatement + "\n";

    fs.writeFileSync(indexPath, content, "utf-8");
    console.log(`[updatePagesIndex] ✓ Added export for ${componentName} (${bladeId}.vue)`);
  } catch (error: any) {
    console.error(`[updatePagesIndex] ✗ Failed: ${error.message}`);
  }
}

/**
 * Convert blade ID to component name
 * e.g., "offer-list" → "OfferList", "offer-details" → "OfferDetails"
 */
export function bladeIdToComponentName(bladeId: string): string {
  return toPascalCase(bladeId);
}
