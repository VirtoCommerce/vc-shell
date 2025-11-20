import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
import { parse as parseVueSFC, compileTemplate } from "@vue/compiler-sfc";
import type { NamingConfig } from "./code-generator";
import type { NodePath } from "@babel/traverse";

// Handle ESM default exports
const traverse = (_traverse as unknown as { default?: typeof _traverse }).default || _traverse;
const generate = (_generate as unknown as { default?: typeof _generate }).default || _generate;

export interface Column {
  id: string;
  title: string;
  type?: string;
  sortable?: boolean;
  width?: string;
}

export interface Field {
  key: string;
  as: string;
  label: string;
  type?: string;
  validation?: string;
  required?: boolean;
  placeholder?: string;
}

export interface CustomSlot {
  name: string;
  component?: string;
  props?: Record<string, unknown>;
}

export interface AdaptConfig {
  naming: NamingConfig;
  componentName: string;
  composableName: string;
  route: string;
  isWorkspace?: boolean;
  menuTitleKey?: string;
  columns?: Column[];
  fields?: Field[];
  customSlots?: CustomSlot[];
  features?: string[];
}

/**
 * TemplateAdapter uses AST transformations to adapt Vue SFC templates
 *
 * This replaces simple string replacement with proper AST manipulation,
 * ensuring generated code is syntactically correct and maintainable.
 */
export class TemplateAdapter {
  /**
   * Adapt a list blade template
   */
  adaptListTemplate(template: string, config: AdaptConfig): string {
    const { descriptor, errors } = parseVueSFC(template);

    if (errors.length > 0) {
      throw new Error(`Template parse error: ${errors.map(e => e.message).join(", ")}`);
    }

    // Transform script section
    let scriptCode = descriptor.script?.content || descriptor.scriptSetup?.content || "";
    if (scriptCode) {
      scriptCode = this.transformScript(scriptCode, config, "list");
    }

    // Transform template section
    let templateCode = descriptor.template?.content || "";
    if (templateCode) {
      templateCode = this.transformTemplate(templateCode, config, "list");
    }

    // Rebuild SFC
    return this.rebuildSFC({
      template: templateCode,
      script: scriptCode,
      scriptSetup: descriptor.scriptSetup !== null,
    });
  }

  /**
   * Adapt a details blade template
   */
  adaptDetailsTemplate(template: string, config: AdaptConfig): string {
    const { descriptor, errors } = parseVueSFC(template);

    if (errors.length > 0) {
      throw new Error(`Template parse error: ${errors.map(e => e.message).join(", ")}`);
    }

    let scriptCode = descriptor.script?.content || descriptor.scriptSetup?.content || "";
    if (scriptCode) {
      scriptCode = this.transformScript(scriptCode, config, "details");
    }

    let templateCode = descriptor.template?.content || "";
    if (templateCode) {
      templateCode = this.transformTemplate(templateCode, config, "details");
    }

    return this.rebuildSFC({
      template: templateCode,
      script: scriptCode,
      scriptSetup: descriptor.scriptSetup !== null,
    });
  }

  /**
   * Transform script section using Babel AST
   */
  private transformScript(code: string, config: AdaptConfig, type: "list" | "details"): string {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    traverse(ast, {
      // Replace entity names in identifiers
      Identifier: (path: NodePath<t.Identifier>) => {
        const name = path.node.name;

        // Entity → YourEntity
        if (name === "Entity" || name === "entity") {
          path.node.name = name === "Entity"
            ? config.naming.entitySingularPascal
            : config.naming.entitySingularCamel;
        }

        // Entities → YourEntities
        if (name === "Entities" || name === "entities") {
          path.node.name = name === "Entities"
            ? config.naming.entityPluralPascal
            : config.naming.entityPluralCamel;
        }

        if (name === "useEntityList" && type === "list") {
          path.node.name = config.composableName;
        }

        if (name === "useEntityDetails" && type === "details") {
          path.node.name = config.composableName;
        }

        if (name === "EntityList" || name === "EntityDetails") {
          path.node.name = config.componentName;
        }
      },

      // Replace import paths and remove TODO comments
      ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
        const source = path.node.source.value;

        // Replace ../composables/useEntityList with actual composable path
        if (source.includes("../composables/useEntity")) {
          path.node.source.value = `../composables/${config.composableName}`;
        }

        // Replace ./entity-details.vue with actual details blade
        if (source.includes("./entity-details")) {
          const detailsFileName = `${config.naming.entitySingularKebab}-details`;
          path.node.source.value = `./${detailsFileName}.vue`;
        }
      },

      // Replace strings in i18n keys
      StringLiteral: (path: NodePath<t.StringLiteral>) => {
        const value = path.node.value;

        // ENTITIES.* → YOUR_ENTITIES.*
        if (value.includes("ENTITIES.")) {
          path.node.value = value.replace(/ENTITIES\./g, `${config.naming.moduleNameUpperSnake}.`);
        }
      },

      // Update columns array for list blades
      ArrayExpression: (path: NodePath<t.ArrayExpression>) => {
        if (type === "list" && config.columns && this.isColumnsArray(path)) {
          path.node.elements = this.generateColumnsAST(config.columns, config.naming.moduleNameUpperSnake);
        }
      },

      // Update defineOptions
      CallExpression: (path: NodePath<t.CallExpression>) => {
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === "defineOptions"
        ) {
          this.updateDefineOptions(path, config, type);
        }
      },
    });

    const output = generate(ast, {
      retainLines: false,
      compact: false,
      comments: false // Remove all comments including TODOs
    });

    // Remove any remaining TODO comments from output
    let cleanedCode = output.code;
    cleanedCode = cleanedCode.replace(/\/\/\s*TODO:.*$/gm, '');
    cleanedCode = cleanedCode.replace(/\/\*\s*TODO:[\s\S]*?\*\//g, '');

    return cleanedCode;
  }

  /**
   * Transform template section (Vue template HTML)
   */
  private transformTemplate(template: string, config: AdaptConfig, type: "list" | "details"): string {
    let result = template;

    // Replace entity names in template
    result = result.replace(/\bEntity\b/g, config.naming.entitySingularPascal);
    result = result.replace(/\bentity\b/g, config.naming.entitySingularCamel);
    result = result.replace(/\bEntities\b/g, config.naming.entityPluralPascal);
    result = result.replace(/\bentities\b/g, config.naming.entityPluralCamel);

    // Replace i18n keys
    result = result.replace(/ENTITIES\./g, `${config.naming.moduleNameUpperSnake}.`);

    // Add custom slots if specified
    if (config.customSlots && type === "list") {
      result = this.addCustomSlotsToTemplate(result, config.customSlots);
    }

    return result;
  }

  /**
   * Check if array expression is columns definition
   */
  private isColumnsArray(path: NodePath<t.ArrayExpression>): boolean {
    const parent = path.parent;
    if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
      return parent.id.name === "columns";
    }
    return false;
  }

  /**
   * Generate columns AST from column definitions
   */
  private generateColumnsAST(columns: Column[], moduleKey: string): t.Expression[] {
    return columns.map(col => {
      const translationKey = `${moduleKey}.PAGES.LIST.TABLE.HEADER.${col.id.toUpperCase()}`;
      const properties: t.ObjectProperty[] = [
        // Use 'id' to match VcTable component API
        t.objectProperty(t.identifier("id"), t.stringLiteral(col.id)),
        t.objectProperty(
          t.identifier("title"),
          t.callExpression(
            t.identifier("computed"),
            [t.arrowFunctionExpression(
              [],
              t.callExpression(
                t.identifier("t"),
                [t.stringLiteral(translationKey)]
              )
            )]
          )
        ),
      ];

      if (col.sortable) {
        properties.push(
          t.objectProperty(t.identifier("sortable"), t.booleanLiteral(true))
        );
      }

      if (col.type) {
        properties.push(
          t.objectProperty(t.identifier("type"), t.stringLiteral(col.type))
        );
      }

      if (col.width) {
        properties.push(
          t.objectProperty(t.identifier("width"), t.stringLiteral(col.width))
        );
      }

      return t.objectExpression(properties);
    });
  }

  /**
   * Update defineOptions call
   */
  private updateDefineOptions(path: NodePath<t.CallExpression>, config: AdaptConfig, type: "list" | "details"): void {
    if (path.node.arguments.length === 0) return;

    const optionsArg = path.node.arguments[0];
    if (!t.isObjectExpression(optionsArg)) return;

    optionsArg.properties.forEach((prop: any) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        // Update name
        if (prop.key.name === "name") {
          prop.value = t.stringLiteral(config.componentName);
        }

        // Update url
        if (prop.key.name === "url") {
          prop.value = t.stringLiteral(config.route);
        }

        if (prop.key.name === "isWorkspace" && typeof config.isWorkspace === "boolean") {
          prop.value = t.booleanLiteral(config.isWorkspace);
        }

        // Update menuItem title
        if (prop.key.name === "menuItem" && t.isObjectExpression(prop.value)) {
          prop.value.properties.forEach((menuProp: any) => {
            if (t.isObjectProperty(menuProp) && t.isIdentifier(menuProp.key)) {
              if (menuProp.key.name === "title") {
                menuProp.value = t.stringLiteral(config.menuTitleKey || `${config.naming.moduleNameUpperSnake}.MENU.TITLE`);
              }
            }
          });
        }
      }
    });
  }

  /**
   * Add custom slots to template
   */
  private addCustomSlotsToTemplate(template: string, slots: CustomSlot[]): string {
    let result = template;

    // Find </VcTable> closing tag
    const tableCloseIndex = result.indexOf("</VcTable>");
    if (tableCloseIndex === -1) return result;

    // Insert custom slots before closing tag
    const slotsCode = slots
      .map(slot => {
        if (slot.component) {
          return `    <template #${slot.name}="{ item }">
      <${slot.component} :${Object.keys(slot.props || {})[0] || "value"}="item.${slot.name.replace("item_", "")}" />
    </template>`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    if (slotsCode) {
      result = result.slice(0, tableCloseIndex) + "\n" + slotsCode + "\n  " + result.slice(tableCloseIndex);
    }

    return result;
  }

  /**
   * Rebuild Vue SFC from parts
   */
  private rebuildSFC(parts: { template: string; script: string; scriptSetup: boolean }): string {
    const lines: string[] = [];

    // Template section
    if (parts.template) {
      lines.push("<template>");
      lines.push(parts.template);
      lines.push("</template>");
      lines.push("");
    }

    // Script section
    if (parts.script) {
      if (parts.scriptSetup) {
        lines.push('<script setup lang="ts">');
      } else {
        lines.push('<script lang="ts">');
      }
      lines.push(parts.script);
      lines.push("</script>");
    }

    return lines.join("\n");
  }
}
