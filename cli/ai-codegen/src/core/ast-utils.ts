import * as parser from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { parse as parseVueSFC, SFCDescriptor } from "@vue/compiler-sfc";

// Handle both ESM and CommonJS imports
const traverse = (_traverse as any).default || _traverse;

/**
 * AST-based utilities for parsing Vue and TypeScript code
 * Replaces fragile regex-based parsing with robust AST traversal
 */
export class ASTUtils {
  /**
   * Parse TypeScript/JavaScript code into Babel AST
   */
  static parseScript(code: string): t.File {
    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });
  }

  /**
   * Parse Vue SFC file
   */
  static parseVueSFC(vueCode: string): { descriptor: SFCDescriptor; errors: any[] } {
    const { descriptor, errors } = parseVueSFC(vueCode);
    return { descriptor, errors };
  }

  /**
   * Extract defineOptions properties using AST
   * Handles nested objects, multi-line content, comments, etc.
   *
   * @param code - Vue script content
   * @returns Object with defineOptions properties or null if not found
   */
  static extractDefineOptions(code: string): Record<string, any> | null {
    try {
      const ast = this.parseScript(code);
      let options: Record<string, any> | null = null;

      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          if (t.isIdentifier(path.node.callee, { name: "defineOptions" })) {
            const arg = path.node.arguments[0];
            if (t.isObjectExpression(arg)) {
              options = {};
              for (const prop of arg.properties) {
                if (t.isObjectProperty(prop)) {
                  const key = ASTUtils.getObjectPropertyKey(prop);
                  if (key) {
                    options[key] = ASTUtils.extractValue(prop.value);
                  }
                }
              }
            }
          }
        },
      });

      return options;
    } catch (error) {
      console.error("Failed to parse defineOptions:", error);
      return null;
    }
  }

  /**
   * Extract property key from ObjectProperty node
   */
  private static getObjectPropertyKey(prop: t.ObjectProperty): string | null {
    if (t.isIdentifier(prop.key)) {
      return prop.key.name;
    }
    if (t.isStringLiteral(prop.key)) {
      return prop.key.value;
    }
    return null;
  }

  /**
   * Extract value from AST node
   * Converts AST nodes to JavaScript values where possible
   */
  private static extractValue(node: t.Node): any {
    if (t.isStringLiteral(node)) {
      return node.value;
    }
    if (t.isNumericLiteral(node)) {
      return node.value;
    }
    if (t.isBooleanLiteral(node)) {
      return node.value;
    }
    if (t.isNullLiteral(node)) {
      return null;
    }
    if (t.isArrayExpression(node)) {
      return node.elements.map((el) => (el && !t.isSpreadElement(el) ? this.extractValue(el) : null));
    }
    if (t.isObjectExpression(node)) {
      const obj: Record<string, any> = {};
      for (const prop of node.properties) {
        if (t.isObjectProperty(prop)) {
          const key = this.getObjectPropertyKey(prop);
          if (key) {
            obj[key] = this.extractValue(prop.value);
          }
        }
      }
      return obj;
    }
    // For complex expressions, return undefined
    return undefined;
  }

  /**
   * Find all empty function handlers (functions with no body)
   * Handles arrow functions, function expressions, function declarations
   *
   * @param code - Script content
   * @returns Array of function names that are empty
   */
  static findEmptyHandlers(code: string): string[] {
    try {
      const ast = this.parseScript(code);
      const emptyHandlers: string[] = [];

      traverse(ast, {
        FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
          if (path.node.body.body.length === 0 && path.node.id) {
            emptyHandlers.push(path.node.id.name);
          }
        },
        VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
          if (
            t.isIdentifier(path.node.id) &&
            (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init))
          ) {
            const func = path.node.init;
            if (t.isBlockStatement(func.body) && func.body.body.length === 0) {
              emptyHandlers.push(path.node.id.name);
            }
          }
        },
        ObjectMethod(path: NodePath<t.ObjectMethod>) {
          if (path.node.body.body.length === 0) {
            if (t.isIdentifier(path.node.key)) {
              emptyHandlers.push(path.node.key.name);
            }
          }
        },
      });

      return emptyHandlers;
    } catch (error) {
      console.error("Failed to find empty handlers:", error);
      return [];
    }
  }

  /**
   * Extract all Vue component tags from template
   * Handles self-closing tags, dynamic components, nested structures
   *
   * @param vueCode - Complete Vue SFC code
   * @returns Array of component tag names (e.g., ['VcTable', 'VcButton'])
   */
  static extractComponentTags(vueCode: string): string[] {
    try {
      const { descriptor } = this.parseVueSFC(vueCode);
      if (!descriptor.template) return [];

      const components = new Set<string>();
      const templateContent = descriptor.template.content;

      // Simple regex for component extraction from template
      // This is acceptable for templates as they are not JavaScript
      const componentRegex = /<(Vc[A-Z][a-zA-Z0-9]*)/g;
      let match;

      while ((match = componentRegex.exec(templateContent)) !== null) {
        components.add(match[1]);
      }

      return Array.from(components);
    } catch (error) {
      console.error("Failed to extract component tags:", error);
      return [];
    }
  }

  /**
   * Extract all import sources from code
   *
   * @param code - Script content
   * @returns Array of import source paths
   */
  static extractImportSources(code: string): string[] {
    try {
      const ast = this.parseScript(code);
      const sources: string[] = [];

      traverse(ast, {
        ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
          sources.push(path.node.source.value);
        },
      });

      return sources;
    } catch (error) {
      console.error("Failed to extract import sources:", error);
      return [];
    }
  }

  /**
   * Extract i18n keys from $t() or t() calls
   *
   * @param code - Script or template content
   * @returns Array of i18n keys
   */
  static extractI18nKeys(code: string): string[] {
    try {
      const ast = this.parseScript(code);
      const keys: string[] = [];

      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          const callee = path.node.callee;

          // Check for t() or $t() calls
          if (
            (t.isIdentifier(callee) && callee.name === "t") ||
            (t.isMemberExpression(callee) &&
              t.isThisExpression(callee.object) &&
              t.isIdentifier(callee.property) &&
              callee.property.name === "$t")
          ) {
            const firstArg = path.node.arguments[0];
            if (t.isStringLiteral(firstArg)) {
              keys.push(firstArg.value);
            }
          }
        },
      });

      return keys;
    } catch (error) {
      console.error("Failed to extract i18n keys:", error);
      return [];
    }
  }

  /**
   * Extract column IDs from table columns definition
   * Looks for arrays of objects with 'id' property
   *
   * @param code - Script content
   * @returns Array of column IDs
   */
  static extractColumnIds(code: string): string[] {
    try {
      const ast = this.parseScript(code);
      const columnIds: string[] = [];

      traverse(ast, {
        VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
          // Look for tableColumns, columns, etc.
          if (
            t.isIdentifier(path.node.id) &&
            (path.node.id.name.includes("Columns") || path.node.id.name.includes("columns"))
          ) {
            if (t.isCallExpression(path.node.init) && t.isIdentifier(path.node.init.callee, { name: "ref" })) {
              const refArg = path.node.init.arguments[0];
              if (t.isArrayExpression(refArg)) {
                ASTUtils.extractIdsFromArray(refArg, columnIds);
              }
            } else if (t.isArrayExpression(path.node.init)) {
              ASTUtils.extractIdsFromArray(path.node.init, columnIds);
            }
          }
        },
      });

      return columnIds;
    } catch (error) {
      console.error("Failed to extract column IDs:", error);
      return [];
    }
  }

  /**
   * Helper to extract 'id' properties from array of objects
   */
  private static extractIdsFromArray(arrayExpr: t.ArrayExpression, ids: string[]): void {
    for (const element of arrayExpr.elements) {
      if (element && t.isObjectExpression(element)) {
        for (const prop of element.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: "id" })) {
            if (t.isStringLiteral(prop.value)) {
              ids.push(prop.value.value);
            }
          }
        }
      }
    }
  }

  /**
   * Count number of defineOptions calls (should be exactly 1)
   *
   * @param code - Script content
   * @returns Number of defineOptions calls found
   */
  static countDefineOptions(code: string): number {
    try {
      const ast = this.parseScript(code);
      let count = 0;

      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          if (t.isIdentifier(path.node.callee, { name: "defineOptions" })) {
            count++;
          }
        },
      });

      return count;
    } catch (error) {
      console.error("Failed to count defineOptions:", error);
      return 0;
    }
  }

  /**
   * Check if code uses 'any' type
   *
   * @param code - TypeScript code
   * @returns true if 'any' type is found
   */
  static hasAnyType(code: string): boolean {
    try {
      const ast = this.parseScript(code);
      let hasAny = false;

      traverse(ast, {
        TSAnyKeyword() {
          hasAny = true;
        },
      });

      return hasAny;
    } catch (error) {
      // Fallback to regex if parsing fails
      return /:\s*any(?!\w)/.test(code);
    }
  }

  /**
   * Find async function calls that are missing await
   *
   * @param code - Script content
   * @returns Array of function names called without await
   */
  static findMissingAwait(code: string): string[] {
    try {
      const ast = this.parseScript(code);
      const missingAwait: string[] = [];

      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          const callee = path.node.callee;

          // Check if it's a call to an async-like function
          if (t.isIdentifier(callee) || (t.isMemberExpression(callee) && t.isIdentifier(callee.property))) {
            const funcName = t.isIdentifier(callee) ? callee.name : (callee.property as t.Identifier).name;

            // Check if function name suggests it's async (get, save, delete, load, fetch, etc.)
            if (/^(get|save|delete|load|fetch)\w+/.test(funcName)) {
              // Check if parent is AwaitExpression
              if (!t.isAwaitExpression(path.parent)) {
                missingAwait.push(funcName);
              }
            }
          }
        },
      });

      return missingAwait;
    } catch (error) {
      console.error("Failed to find missing await:", error);
      return [];
    }
  }
}
