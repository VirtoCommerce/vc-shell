/**
 * AST-based Code Validator
 *
 * Uses proper AST parsing instead of regex to extract components and hooks.
 */

import { parse as babelParse } from "@babel/parser";
import { parse as vueCompilerParse } from "@vue/compiler-sfc";
import type { Node } from "@babel/types";

export interface ASTValidationResult {
  components: string[];
  hooks: {
    name: string;
    source: string | null; // Import source, null if from @vc-shell/framework
    isLocal: boolean; // true if from relative path
    isExternal: boolean; // true if from external lib (not framework)
  }[];
  imports: {
    name: string;
    source: string;
  }[];
}

/**
 * ASTValidator
 *
 * Validates Vue SFC and TypeScript code using AST parsing.
 */
export class ASTValidator {
  /**
   * Parse Vue SFC and extract components, hooks, imports
   */
  parseVueSFC(code: string): ASTValidationResult {
    try {
      // Parse Vue SFC
      const { descriptor } = vueCompilerParse(code);

      // Extract components from template
      const components = this.extractComponentsFromTemplate(descriptor.template?.content || "");

      // Extract hooks and imports from script
      const scriptContent = descriptor.scriptSetup?.content || descriptor.script?.content || "";
      const { hooks, imports } = this.extractHooksAndImports(scriptContent);

      return {
        components,
        hooks,
        imports,
      };
    } catch (error: any) {
      console.error("[ASTValidator] Failed to parse Vue SFC:", error.message);
      return {
        components: [],
        hooks: [],
        imports: [],
      };
    }
  }

  /**
   * Parse TypeScript code and extract hooks and imports
   */
  parseTypeScript(code: string): Pick<ASTValidationResult, "hooks" | "imports"> {
    try {
      return this.extractHooksAndImports(code);
    } catch (error: any) {
      console.error("[ASTValidator] Failed to parse TypeScript:", error.message);
      return {
        hooks: [],
        imports: [],
      };
    }
  }

  /**
   * Extract Vue components from template (simple approach)
   */
  private extractComponentsFromTemplate(template: string): string[] {
    const components = new Set<string>();

    // Match component tags (must start with uppercase or Vc)
    const componentRegex = /<(Vc[A-Z][a-zA-Z0-9]*|[A-Z][a-zA-Z0-9]*)/g;
    let match;
    while ((match = componentRegex.exec(template)) !== null) {
      components.add(match[1]);
    }

    return Array.from(components);
  }

  /**
   * Extract hooks and imports using Babel AST
   */
  private extractHooksAndImports(
    code: string,
  ): Pick<ASTValidationResult, "hooks" | "imports"> {
    const hooks: ASTValidationResult["hooks"] = [];
    const imports: ASTValidationResult["imports"] = [];
    const importMap = new Map<string, string>(); // name -> source

    try {
      // Parse with Babel
      const ast = babelParse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      // Visit AST nodes
      const visit = (node: any) => {
        // Extract imports
        if (node.type === "ImportDeclaration") {
          const source = node.source.value;

          // Named imports
          if (node.specifiers) {
            for (const specifier of node.specifiers) {
              if (specifier.type === "ImportSpecifier") {
                const importedName = specifier.imported.name;
                const localName = specifier.local?.name || importedName;
                // Track the local binding name so hook resolution works with aliases and `default as foo`
                imports.push({ name: localName, source });
                importMap.set(localName, source);
              } else if (specifier.type === "ImportDefaultSpecifier") {
                const name = specifier.local.name;
                imports.push({ name, source });
                importMap.set(name, source);
              }
            }
          }
        }

        // Extract hook calls
        if (node.type === "CallExpression" && node.callee) {
          const calleeName = this.getCalleeName(node.callee);
          if (calleeName && calleeName.startsWith("use") && /^use[A-Z]/.test(calleeName)) {
            const source = importMap.get(calleeName) || null;
            hooks.push({
              name: calleeName,
              source,
              isLocal: source ? source.startsWith(".") || source.startsWith("../") : false,
              isExternal:
                source ? !source.includes("@vc-shell/framework") && !source.startsWith(".") : false,
            });
          }
        }

        // Extract hook destructuring: const { xxx } = useXxx()
        if (
          node.type === "VariableDeclarator" &&
          node.init?.type === "CallExpression" &&
          node.init.callee
        ) {
          const calleeName = this.getCalleeName(node.init.callee);
          if (calleeName && calleeName.startsWith("use") && /^use[A-Z]/.test(calleeName)) {
            const source = importMap.get(calleeName) || null;
            hooks.push({
              name: calleeName,
              source,
              isLocal: source ? source.startsWith(".") || source.startsWith("../") : false,
              isExternal:
                source ? !source.includes("@vc-shell/framework") && !source.startsWith(".") : false,
            });
          }
        }

        // Recursively visit child nodes
        for (const key in node) {
          const child = node[key];
          if (child && typeof child === "object") {
            if (Array.isArray(child)) {
              child.forEach((c) => visit(c));
            } else if (child.type) {
              visit(child);
            }
          }
        }
      };

      visit(ast);

      // Remove duplicates
      const uniqueHooks = Array.from(
        new Map(hooks.map((h) => [h.name + h.source, h])).values(),
      );

      return {
        hooks: uniqueHooks,
        imports,
      };
    } catch (error: any) {
      console.error("[ASTValidator] Failed to parse code:", error.message);
      return {
        hooks: [],
        imports,
      };
    }
  }

  /**
   * Get callee name from CallExpression node
   */
  private getCalleeName(callee: any): string | null {
    if (callee.type === "Identifier") {
      return callee.name;
    }
    if (callee.type === "MemberExpression" && callee.object?.type === "Identifier") {
      return callee.object.name;
    }
    return null;
  }

  /**
   * Filter hooks that need validation (only framework hooks)
   */
  getFrameworkHooks(hooks: ASTValidationResult["hooks"]): string[] {
    return hooks
      .filter((h) => {
        // Exclude Vue built-ins
        const vueBuiltins = ["useSlots", "useAttrs", "useCssModule", "useCssVars"];
        if (vueBuiltins.includes(h.name)) return false;

        // Exclude external library hooks
        if (h.isExternal) return false;

        // Exclude local composables
        if (h.isLocal) return false;

        // Include only hooks without explicit import source (should be from framework)
        // or hooks explicitly from @vc-shell/framework
        return h.source === null || h.source.includes("@vc-shell/framework");
      })
      .map((h) => h.name);
  }
}
