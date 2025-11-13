import type { NamingConfig } from "./code-generator.js";
import type { Column, Field } from "./template-adapter.js";
import type { CompositionPattern, GenerationRules } from "./generation-rules.js";
import type { UIPlanBlade } from "../schemas/zod-schemas.js";

export interface BladeGenerationContext {
  type: "list" | "details";
  naming: NamingConfig;
  blade: UIPlanBlade;
  columns?: Column[];
  fields?: Field[];
  componentName: string;
  composableName: string;
  route: string;
  isWorkspace?: boolean;
  menuTitleKey: string;
  features: string[];
}

export interface GenerationContext {
  patterns: CompositionPattern[];
  rules: GenerationRules;
  componentRegistry: string[];
}

export interface GeneratedCode {
  code: string;
  metadata: {
    linesOfCode: number;
    importsCount: number;
    componentsUsed: string[];
    i18nKeys: string[];
  };
}

/**
 * AICodeGenerator provides structure and context for AI code generation
 *
 * This class does NOT call AI APIs directly.
 * Instead, it prepares the context (patterns, rules, examples) that AI
 * uses when generating code through MCP tools.
 *
 * The actual code generation happens when AI (Cursor/Claude) reads:
 * 1. Generation rules from this context
 * 2. Composition patterns
 * 3. UI-Plan requirements
 * 4. Component registry
 *
 * And generates Vue SFC or TypeScript composables following these rules.
 */
export class AICodeGenerator {
  /**
   * Generate blade code (Vue SFC)
   *
   * This method returns a structured prompt/context that AI uses
   * to generate the actual code.
   */
  generateBlade(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    // Build generation instructions for AI
    const instructions = this.buildBladeInstructions(context, patterns, rules);

    // In actual implementation, AI reads these instructions and generates code
    // For now, return instructions as documentation
    return instructions;
  }

  /**
   * Generate composable code (TypeScript)
   */
  generateComposable(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    const instructions = this.buildComposableInstructions(context, patterns, rules);
    return instructions;
  }

  /**
   * Build blade generation instructions for AI
   */
  private buildBladeInstructions(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    const { type, naming, blade, columns, fields, componentName, composableName, route, isWorkspace, menuTitleKey, features } = context;

    return `# Generate Vue SFC Blade: ${componentName}

## Requirements

**Type:** ${type} blade
**Component Name:** ${componentName}
**Composable:** ${composableName}
**Route:** ${route}
**Workspace:** ${isWorkspace ? "Yes (add menuItem)" : "No"}
**Features:** ${features.join(", ") || "none"}

## Entity Information

- Singular: ${naming.entitySingularPascal}
- Plural: ${naming.entityPluralPascal}
- Module: ${naming.moduleName}

${type === "list" ? `## Columns

${columns?.map(col => `- ${col.key}: ${col.title} (${col.type || "text"}${col.sortable ? ", sortable" : ""})`).join("\n") || "No columns defined"}` : ""}

${type === "details" ? `## Fields

${fields?.map(field => `- ${field.key}: ${field.label} (${field.as}, ${field.type || "text"}${field.required ? ", required" : ""})`).join("\n") || "No fields defined"}` : ""}

## Structure Rules

${type === "list" ? rules.bladeStructure.list : rules.bladeStructure.details}

## Patterns to Follow

${patterns.map(p => `### ${p.name}
${p.description}
**Required Components:** ${p.requiredComponents.join(", ")}
**Features:** ${p.features.join(", ")}
`).join("\n")}

## Naming Conventions

- Component name: ${rules.naming.components}
- File name: ${rules.naming.files}
- Variables: ${rules.naming.variables}

## i18n Requirements

- Structure: ${rules.i18n.structure}
- Case: ${rules.i18n.case}
- Usage: ${rules.i18n.usage}

**Module Key:** ${naming.moduleNameUpperSnake}
**Menu Title Key:** ${menuTitleKey}

## defineOptions

\`\`\`typescript
defineOptions({
  name: "${componentName}",
  url: "${route}",${isWorkspace ? `
  isWorkspace: true,
  menuItem: {
    title: "${menuTitleKey}",
    icon: "material-${type === "list" ? "list" : "edit"}",
    priority: 1,
  },` : ""}
});
\`\`\`

## Required Imports

\`\`\`typescript
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, useBladeNavigation } from "@vc-shell/framework";
import { ${composableName} } from "../composables";
${type === "details" ? 'import { Field } from "vee-validate";' : ""}
\`\`\`

## Validation Rules

**Required:**
${rules.validation.required.map(r => `- ${r}`).join("\n")}

**Forbidden:**
${rules.validation.forbidden.map(r => `- ${r}`).join("\n")}

## Code Generation

Generate a complete Vue SFC file following these rules and patterns.
Use the composition patterns as reference for structure and logic.
Include all required sections: template, script setup with TypeScript.
`;
  }

  /**
   * Build composable generation instructions for AI
   */
  private buildComposableInstructions(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    const { type, naming, columns, fields, composableName } = context;

    return `# Generate TypeScript Composable: ${composableName}

## Requirements

**Type:** ${type === "list" ? "useEntityList" : "useEntityDetails"} pattern
**Composable Name:** ${composableName}
**Entity:** ${naming.entitySingularPascal}
**Mock Data:** Required

## Entity Interface

${type === "list" ? `Based on columns:
${columns?.map(col => `- ${col.key}: ${this.inferTypeFromColumn(col)}`).join("\n")}` : ""}

${type === "details" ? `Based on fields:
${fields?.map(field => `- ${field.key}: ${field.type || "string"}${field.required ? "" : " | undefined"}`).join("\n")}` : ""}

## Pattern Structure

${type === "list" ? `### useEntityList Pattern

\`\`\`typescript
// Mock data array
const MOCK_${naming.entityPluralCamel.toUpperCase()}: ${naming.entitySingularPascal}[] = [...]

// Reactive state
const items = ref<${naming.entitySingularPascal}[]>([])
const loading = ref(false)
const totalCount = ref(0)
const currentPage = ref(1)

// Computed
const pages = computed(() => Math.ceil(totalCount.value / pageSize))

// Methods
async function load${naming.entityPluralPascal}(query?: SearchQuery)
async function delete${naming.entitySingularPascal}(id: string)
async function reload()

// Return
return {
  items,
  loading,
  totalCount,
  currentPage,
  pages,
  load${naming.entityPluralPascal},
  delete${naming.entitySingularPascal},
  reload,
}
\`\`\`
` : `### useEntityDetails Pattern

\`\`\`typescript
// Factory function
function createEmpty${naming.entitySingularPascal}(): ${naming.entitySingularPascal}

// Reactive state
const item = ref<${naming.entitySingularPascal}>(createEmpty${naming.entitySingularPascal}())
const loading = ref(false)
const originalItem = ref<${naming.entitySingularPascal}>()

// Computed
const isModified = computed(() =>
  JSON.stringify(item.value) !== JSON.stringify(originalItem.value)
)

// Methods
async function load${naming.entitySingularPascal}(args: { id: string })
async function save${naming.entitySingularPascal}()
async function delete${naming.entitySingularPascal}()
function reset()

// Return
return {
  item,
  loading,
  isModified,
  load${naming.entitySingularPascal},
  save${naming.entitySingularPascal},
  delete${naming.entitySingularPascal},
  reset,
}
\`\`\`
`}

## Mock Data Requirements

${type === "list" ? `Generate 3 mock items with realistic data:
- IDs: "1", "2", "3"
- Dates: Use Date.now() - random days
- All columns should have values
` : `Generate default values for all fields:
- Strings: empty ""
- Numbers: 0
- Booleans: false
- Dates: new Date()
- Arrays: []
`}

## Async Behavior

All methods should:
1. Set loading = true
2. Simulate API delay: await new Promise(resolve => setTimeout(resolve, 300))
3. Perform operation (filter, update, delete)
4. Set loading = false
5. Include try/catch with error logging

## TypeScript Types

Define proper interfaces:
- ${naming.entitySingularPascal} interface with all properties
- SearchQuery interface (for list)
- LoadArgs interface (for details)

## Export

\`\`\`typescript
export default function ${composableName}() {
  // ... implementation
  return { ... }
}
\`\`\`

## Patterns to Follow

${patterns.filter(p => p.name.includes("composable")).map(p => `### ${p.name}
${p.description}
`).join("\n")}

## Code Generation

Generate a complete TypeScript composable following these rules and patterns.
Include mock data, type definitions, and all required methods.
`;
  }

  /**
   * Infer TypeScript type from column definition
   */
  private inferTypeFromColumn(column: Column): string {
    switch (column.type) {
      case "number":
      case "money":
        return "number";
      case "boolean":
        return "boolean";
      case "date":
      case "date-ago":
        return "Date | string";
      case "image":
        return "string"; // URL
      default:
        return "string";
    }
  }

  /**
   * Extract metadata from generated code
   */
  extractMetadata(code: string): GeneratedCode["metadata"] {
    const lines = code.split("\n");
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith("//")).length;

    // Extract imports
    const importMatches = code.matchAll(/^import\s+.*from\s+["']([^"']+)["']/gm);
    const imports = Array.from(importMatches).map(m => m[1]);

    // Extract components used
    const componentMatches = code.matchAll(/<(Vc[A-Z][a-zA-Z]*)/g);
    const components = Array.from(new Set(Array.from(componentMatches).map(m => m[1])));

    // Extract i18n keys
    const i18nMatches = code.matchAll(/\$t\s*\(\s*["']([^"']+)["']/g);
    const i18nKeys = Array.from(new Set(Array.from(i18nMatches).map(m => m[1])));

    return {
      linesOfCode,
      importsCount: imports.length,
      componentsUsed: components,
      i18nKeys,
    };
  }
}

