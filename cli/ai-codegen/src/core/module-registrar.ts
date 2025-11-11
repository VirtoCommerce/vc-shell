import fs from "node:fs";
import path from "node:path";
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
import type { NamingConfig } from "./code-generator.js";
import type { NodePath } from "@babel/traverse";

// Handle ESM default exports
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;

/**
 * ModuleRegistrar automatically registers modules in main.ts
 *
 * This parses main.ts, finds the correct insertion points,
 * and adds the necessary import and .use() call.
 */
export class ModuleRegistrar {
  /**
   * Register a module in main.ts
   */
  async registerModule(moduleName: string, naming: NamingConfig, cwd: string): Promise<void> {
    const mainTsPath = path.join(cwd, "src", "main.ts");

    if (!fs.existsSync(mainTsPath)) {
      throw new Error(`main.ts not found at ${mainTsPath}`);
    }

    const code = fs.readFileSync(mainTsPath, "utf-8");
    const updatedCode = this.updateMainTs(code, moduleName, naming);

    fs.writeFileSync(mainTsPath, updatedCode, "utf-8");
  }

  /**
   * Update main.ts code with new module
   */
  private updateMainTs(code: string, moduleName: string, naming: NamingConfig): string {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript"],
    });

    const moduleImportName = `${naming.moduleNamePascal}Module`;
    const importPath = `./modules/${moduleName}`;

    // Check if already imported
    let alreadyImported = false;
    traverse(ast, {
      ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
        if (path.node.source.value === importPath) {
          alreadyImported = true;
        }
      },
    });

    if (alreadyImported) {
      console.log(`Module ${moduleName} is already registered in main.ts`);
      return code;
    }

    // Add import after other module imports
    let lastModuleImportIndex = -1;
    let programBody: t.Statement[] | null = null;

    traverse(ast, {
      Program: (path: NodePath<t.Program>) => {
        programBody = path.node.body;

        // Find last import from "./modules/*"
        path.node.body.forEach((node: t.Statement, index: number) => {
          if (
            t.isImportDeclaration(node) &&
            typeof node.source.value === "string" &&
            node.source.value.startsWith("./modules/")
          ) {
            lastModuleImportIndex = index;
          }
        });
      },
    });

    if (programBody) {
      // Create new import
      const newImport = t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier(moduleImportName))],
        t.stringLiteral(importPath)
      );

      // Insert after last module import, or at beginning if none found
      const insertIndex = lastModuleImportIndex >= 0 ? lastModuleImportIndex + 1 : 0;
      programBody.splice(insertIndex, 0, newImport);
    }

    // Add .use() call before .use(router)
    traverse(ast, {
      CallExpression: (path: NodePath<t.CallExpression>) => {
        // Look for .use(router)
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === "use" &&
          path.node.arguments.length > 0 &&
          t.isIdentifier(path.node.arguments[0]) &&
          path.node.arguments[0].name === "router"
        ) {
          // Found .use(router), need to add .use(Module, { router }) before it

          // Get the object being chained (.use is called on this)
          const chainObject = path.node.callee.object;

          // Create .use(ModuleName, { router })
          const moduleUseCall = t.callExpression(
            t.memberExpression(chainObject, t.identifier("use")),
            [
              t.identifier(moduleImportName),
              t.objectExpression([
                t.objectProperty(t.identifier("router"), t.identifier("router"), false, true),
              ]),
            ]
          );

          // Replace chainObject with our new call
          path.node.callee.object = moduleUseCall;
        }
      },
    });

    const output = generate(ast, { retainLines: true, compact: false });
    return output.code;
  }

  /**
   * Validate that module is registered
   */
  validateRegistration(moduleName: string, naming: NamingConfig, cwd: string): boolean {
    const mainTsPath = path.join(cwd, "src", "main.ts");

    if (!fs.existsSync(mainTsPath)) {
      return false;
    }

    const code = fs.readFileSync(mainTsPath, "utf-8");
    const moduleImportName = `${naming.moduleNamePascal}Module`;

    // Check for import
    const hasImport = code.includes(`import ${moduleImportName} from "./modules/${moduleName}"`);

    // Check for .use() call
    const hasUse = code.includes(`.use(${moduleImportName}`);

    return hasImport && hasUse;
  }
}

