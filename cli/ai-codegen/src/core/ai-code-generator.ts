import type { CompositionPattern, GenerationRules } from "./generation-rules.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import type { Column, Field } from "./template-adapter.js";
import type { BladeLogic } from "./logic-planner.js";

export interface AIGenerationGuide {
  task: string;
  context: {
    type: string;
    entity: string;
    features: string[];
  };
  patterns: {
    name: string;
    description: string;
    code: string;
  }[];
  rules: {
    structure: string;
    naming: string[];
    validation: string[];
    forbidden: string[];
  };
  requirements: {
    components: string[];
    imports: string[];
    logic: string;
  };
  examples: string[];
  constraints: string[];
  estimatedComplexity: number;
}

/**
 * AICodeGenerator builds comprehensive guidance for AI via MCP
 *
 * ARCHITECTURE (MCP Server Pattern):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ AI (Cursor/Claude)                                          │
 * │   ↓ calls MCP tool                                          │
 * │ generate_with_composition({plan, features})                 │
 * │   ↓                                                          │
 * │ MCP Server (this code)                                      │
 * │   → AICodeGenerator.buildGenerationGuide()                  │
 * │   → Returns structured guide with patterns/rules/examples   │
 * │   ↓                                                          │
 * │ AI reads guide                                              │
 * │   → Composes code from patterns                             │
 * │   → Follows rules and constraints                           │
 * │   → Generates Vue SFC/TypeScript                            │
 * │   ↓                                                          │
 * │ Returns generated code                                      │
 * │   ↓                                                          │
 * │ MCP Server validates code                                   │
 * │   → If valid: success                                       │
 * │   → If invalid: AI retries with error feedback              │
 * └─────────────────────────────────────────────────────────────┘
 *
 * KEY POINTS:
 * - NO direct AI API calls (Claude/GPT)
 * - AI calls US via MCP
 * - We provide structured context
 * - AI generates code based on patterns
 * - We validate result
 */
export class AICodeGenerator {
  /**
   * Build comprehensive generation guide for AI consumption via MCP
   *
   * This creates a structured guide that AI reads to understand:
   * - What patterns to compose
   * - What rules to follow
   * - What components to use
   * - How to structure the code
   */
  buildGenerationGuide(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): AIGenerationGuide {
    const { type, naming, componentName, features, logic, composableDefinition } = context;

    return {
      task: `Generate ${type} blade: ${componentName}`,

      context: {
        type: type,
        entity: naming.entitySingularPascal,
        features: features,
      },

      patterns: patterns.map(p => ({
        name: p.name,
        description: p.description,
        code: p.codeExample || p.content,
      })),

      rules: {
        structure: type === "list" ? rules.bladeStructure.list : rules.bladeStructure.details,
        naming: [
          `Component: ${rules.naming.components}`,
          `Files: ${rules.naming.files}`,
          `Variables: ${rules.naming.variables}`,
        ],
        validation: rules.validation.required,
        forbidden: rules.validation.forbidden,
      },

      requirements: {
        components: this.extractRequiredComponents(context, patterns),
        imports: this.buildRequiredImports(context),
        logic: logic ? this.describeLogic(logic) : "Standard CRUD logic",
      },

      examples: this.selectRelevantExamples(patterns, features),

      constraints: this.buildConstraints(rules, context),

      estimatedComplexity: this.estimateComplexity(context),
    };
  }

  /**
   * Build detailed blade generation instructions
   *
   * This is the main guidance text that AI reads
   */
  buildBladeInstructions(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    const { type, naming, blade, columns, fields, componentName, composableName, route, isWorkspace, menuTitleKey, features, logic } = context;

    let instructions = `# 🎯 Generate Vue SFC Blade: ${componentName}

## 📋 Task Overview

You are generating a **${type} blade** for the **${naming.moduleName}** module.
This blade will ${type === "list" ? "display a table of items with CRUD operations" : "show a form for creating/editing items"}.

## 🏗️ Requirements

- **Component Name:** \`${componentName}\`
- **Composable:** \`${composableName}\`
- **Route:** \`${route}\`
- **Is Workspace:** ${isWorkspace ? "✅ Yes (add to menu)" : "❌ No"}
- **Features:** ${features.length > 0 ? features.join(", ") : "Basic (no special features)"}

## 🎨 Entity Information

- **Singular:** ${naming.entitySingularPascal}
- **Plural:** ${naming.entityPluralPascal}
- **Module:** ${naming.moduleName}
- **Module Key (i18n):** ${naming.moduleNameUpperSnake}

`;

    // Add columns/fields section
    if (type === "list" && columns) {
      instructions += `## 📊 Columns to Display

${columns.map(col => `- **${col.key}**: ${col.title} (${col.type || "text"}${col.sortable ? ", sortable" : ""})`).join("\n")}

`;
    } else if (type === "details" && fields) {
      instructions += `## 📝 Form Fields

${fields.map(field => `- **${field.key}**: ${field.label} (${field.as}, ${field.type || "text"}${field.required ? ", required" : ""})`).join("\n")}

`;
    }

    // Add logic section if provided
    if (logic) {
      instructions += `## ⚙️ Logic Requirements

${this.describeLogic(logic)}

`;
    }

    // Add patterns section
    instructions += `## 🧩 Composition Patterns to Use

You should compose your code from these patterns:

${patterns.map((p, i) => `### ${i + 1}. ${p.name}

${p.description}

**Required Components:** ${p.requiredComponents.join(", ")}
**Features:** ${p.features.join(", ") || "Basic"}

${p.codeExample ? `**Example:**
\`\`\`vue
${p.codeExample}
\`\`\`
` : ""}`).join("\n")}

`;

    // Add structure rules
    instructions += `## 📐 Structure Rules

**Blade Structure:**
${type === "list" ? rules.bladeStructure.list : rules.bladeStructure.details}

**Naming Conventions:**
- Components: ${rules.naming.components}
- Files: ${rules.naming.files}
- Variables: ${rules.naming.variables}

**i18n:**
- Structure: ${rules.i18n.structure}
- Case: ${rules.i18n.case}
- Usage: ${rules.i18n.usage}

`;

    // Add defineOptions template
    instructions += `## 🔧 defineOptions Template

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

`;

    // Add required imports
    instructions += `## 📦 Required Imports

\`\`\`typescript
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, useBladeNavigation } from "@vc-shell/framework";
import { ${composableName} } from "../composables";
${type === "details" ? 'import { Field } from "vee-validate";' : ""}
\`\`\`

`;

    // Add validation rules
    instructions += `## ✅ Validation Rules

**REQUIRED:**
${rules.validation.required.map(r => `- ${r}`).join("\n")}

**FORBIDDEN:**
${rules.validation.forbidden.map(r => `- ${r}`).join("\n")}

`;

    // Add generation instructions
    instructions += `## 🚀 Code Generation Instructions

1. **Study the composition patterns above** - understand the structure and logic
2. **Compose your code** by combining relevant parts from patterns
3. **Adapt entity names** - replace generic names with ${naming.entitySingularPascal}/${naming.entityPluralPascal}
4. **Implement the required logic** from the Logic Requirements section
5. **Use proper i18n keys** - all strings must use $t() with ${naming.moduleNameUpperSnake} prefix
6. **Follow TypeScript best practices** - proper types, interfaces, and generics
7. **Include error handling** - try/catch blocks in async methods
8. **Add loading states** - use loading ref from composable

## 📤 Output Format

Generate a **complete, production-ready Vue SFC file** with:
- \`<template>\` section with VcComponents
- \`<script setup lang="ts">\` section with TypeScript
- All imports, types, and logic
- Proper i18n usage throughout
- No placeholder comments or TODOs

**Generate ONLY the code - no explanations or markdown outside the code block.**

`;

    return instructions;
  }

  /**
   * Build composable generation instructions
   */
  buildComposableInstructions(
    context: BladeGenerationContext,
    patterns: CompositionPattern[],
    rules: GenerationRules,
  ): string {
    const { type, naming, columns, fields, composableName, composableDefinition } = context;

    let instructions = `# 🎯 Generate TypeScript Composable: ${composableName}

## 📋 Task Overview

You are generating a **${type === "list" ? "list" : "details"} composable** for the **${naming.entitySingularPascal}** entity.
This composable will ${type === "list" ? "manage a collection of items with search, pagination, and CRUD" : "manage a single item with save, delete, and validation"}.

## 🏗️ Requirements

- **Composable Name:** \`${composableName}\`
- **Entity:** ${naming.entitySingularPascal}
- **Pattern:** ${type === "list" ? "useEntityList" : "useEntityDetails"}
- **Mock Data:** ✅ Required

`;

    // Add methods if defined
    if (composableDefinition?.methods && composableDefinition.methods.length > 0) {
      instructions += `## 🔧 Required Methods

${composableDefinition.methods.map(m => `- \`${m}()\``).join("\n")}

`;
    }

    // Add entity interface
    if (type === "list" && columns) {
      instructions += `## 🗂️ Entity Interface (from columns)

\`\`\`typescript
interface ${naming.entitySingularPascal} {
${columns.map(col => `  ${col.key}: ${this.inferTypeFromColumn(col)};`).join("\n")}
  id: string;
  createdDate?: Date;
  modifiedDate?: Date;
}
\`\`\`

`;
    } else if (type === "details" && fields) {
      instructions += `## 🗂️ Entity Interface (from fields)

\`\`\`typescript
interface ${naming.entitySingularPascal} {
${fields.map(field => `  ${field.key}${field.required ? "" : "?"}: ${this.inferTypeFromField(field)};`).join("\n")}
  id: string;
}
\`\`\`

`;
    }

    // Add pattern structure
    instructions += `## 🧩 Pattern Structure

${type === "list" ? `### useEntityList Pattern

\`\`\`typescript
// 1. Mock data array
const MOCK_${naming.entityPluralCamel.toUpperCase()}: ${naming.entitySingularPascal}[] = [
  // Generate 3-5 realistic mock items
];

// 2. Reactive state
const items = ref<${naming.entitySingularPascal}[]>([]);
const loading = ref(false);
const totalCount = ref(0);
const currentPage = ref(1);

// 3. Computed properties
const pages = computed(() => Math.ceil(totalCount.value / pageSize));

// 4. Methods
async function load(query?: SearchQuery) {
  loading.value = true;
  await simulateDelay();
  // Filter and paginate MOCK_DATA
  loading.value = false;
}

async function deleteItem(id: string) {
  // Remove from MOCK_DATA
  await reload();
}

// 5. Return object
return {
  items,
  loading,
  totalCount,
  currentPage,
  pages,
  load,
  deleteItem,
  reload,
};
\`\`\`
` : `### useEntityDetails Pattern

\`\`\`typescript
// 1. Factory function
function createEmpty(): ${naming.entitySingularPascal} {
  return {
    id: "",
    // ... all fields with default values
  };
}

// 2. Reactive state
const item = ref<${naming.entitySingularPascal}>(createEmpty());
const loading = ref(false);
const originalItem = ref<${naming.entitySingularPascal}>();

// 3. Computed properties
const isModified = computed(() =>
  JSON.stringify(item.value) !== JSON.stringify(originalItem.value)
);

// 4. Methods
async function load(args: { id: string }) {
  loading.value = true;
  await simulateDelay();
  // Mock load
  item.value = mockData;
  originalItem.value = JSON.parse(JSON.stringify(item.value));
  loading.value = false;
}

async function save() {
  loading.value = true;
  await simulateDelay();
  console.log("Saving:", item.value);
  originalItem.value = JSON.parse(JSON.stringify(item.value));
  loading.value = false;
}

// 5. Return object
return {
  item,
  loading,
  isModified,
  load,
  save,
  deleteItem,
  reset,
};
\`\`\`
`}

## 📦 Mock Data Requirements

${type === "list" ? `Generate **3-5 mock items** with realistic data:
- IDs: "1", "2", "3", ...
- Dates: Use \`new Date(Date.now() - Math.random() * 30 * 86400000)\` for variety
- All columns should have realistic values
- Use faker-like patterns for names, emails, etc.
` : `Generate **default values** for all fields:
- Strings: empty \`""\`
- Numbers: \`0\`
- Booleans: \`false\`
- Dates: \`new Date()\`
- Arrays: \`[]\`
- Objects: \`{}\`
`}

## ⏱️ Async Behavior

All async methods should:
1. Set \`loading.value = true\`
2. Simulate API delay: \`await new Promise(resolve => setTimeout(resolve, 300))\`
3. Perform operation (filter, update, delete with mock data)
4. Set \`loading.value = false\`
5. Include try/catch with proper error handling

## 📤 Export

\`\`\`typescript
export default function ${composableName}() {
  // ... implementation
  return { ... };
}
\`\`\`

## 🚀 Code Generation Instructions

1. **Follow the pattern structure** above exactly
2. **Generate realistic mock data** with proper types
3. **Implement all required methods** from the pattern
4. **Use proper TypeScript types** - no \`any\`, proper interfaces
5. **Add error handling** - try/catch in all async methods
6. **Include helper functions** if needed (e.g., \`simulateDelay\`)
7. **Export default** as shown above

Generate a **complete, production-ready TypeScript composable** with mock data.

`;

    return instructions;
  }

  /**
   * Describe blade logic for AI context
   */
  private describeLogic(logic: BladeLogic): string {
    let description = "";

    if (logic.handlers && Object.keys(logic.handlers).length > 0) {
      description += "### Event Handlers\n\n";
      for (const [event, handler] of Object.entries(logic.handlers)) {
        description += `- **${event}**: \`${handler}\`\n`;
      }
      description += "\n";
    }

    if (logic.toolbar && logic.toolbar.length > 0) {
      description += "### Toolbar Actions\n\n";
      for (const action of logic.toolbar) {
        description += `- **${action.id}** (${action.icon || "no icon"}): \`${action.action}\`\n`;
      }
      description += "\n";
    }

    if (logic.state && Object.keys(logic.state).length > 0) {
      description += "### State Management\n\n";
      for (const [name, def] of Object.entries(logic.state)) {
        const defaultValue = def.default !== undefined ? ` (default: ${JSON.stringify(def.default)})` : "";
        description += `- **${name}**: source=${def.source}, reactive=${def.reactive}${defaultValue}\n`;
      }
    }

    return description;
  }

  /**
   * Extract required components from context and patterns
   */
  private extractRequiredComponents(context: BladeGenerationContext, patterns: CompositionPattern[]): string[] {
    const components = new Set<string>();

    // From patterns
    for (const pattern of patterns) {
      for (const comp of pattern.requiredComponents) {
        components.add(comp);
      }
    }

    // From blade type
    if (context.type === "list") {
      components.add("VcBlade");
      components.add("VcTable");
    } else {
      components.add("VcBlade");
      components.add("VcContainer");
      components.add("VcForm");
    }

    // From features
    if (context.features.includes("gallery")) {
      components.add("VcGallery");
    }

    return Array.from(components).sort();
  }

  /**
   * Build required imports list
   */
  private buildRequiredImports(context: BladeGenerationContext): string[] {
    const imports = [
      "{ ref, computed, onMounted } from 'vue'",
      "{ useI18n } from 'vue-i18n'",
      "{ IBladeToolbar, useBladeNavigation } from '@vc-shell/framework'",
      `{ ${context.composableName} } from '../composables'`,
    ];

    if (context.type === "details") {
      imports.push("{ Field } from 'vee-validate'");
    }

    return imports;
  }

  /**
   * Select relevant examples from patterns
   */
  private selectRelevantExamples(patterns: CompositionPattern[], features: string[]): string[] {
    const examples: string[] = [];

    for (const pattern of patterns) {
      if (pattern.codeExample) {
        examples.push(`### ${pattern.name}\n\`\`\`vue\n${pattern.codeExample}\n\`\`\``);
      }
    }

    return examples;
  }

  /**
   * Build constraints list
   */
  private buildConstraints(rules: GenerationRules, context: BladeGenerationContext): string[] {
    const constraints: string[] = [
      "Use ONLY components from VC-Shell registry",
      "ALL strings must use i18n ($t())",
      "NO hardcoded text",
      "Use TypeScript - no `any` types",
      "Include error handling in async methods",
      "Follow naming conventions strictly",
    ];

    constraints.push(...rules.validation.forbidden);

    return constraints;
  }

  /**
   * Estimate code complexity
   */
  private estimateComplexity(context: BladeGenerationContext): number {
    let complexity = 0;

    // Base complexity
    complexity += context.type === "list" ? 5 : 4;

    // Features
    complexity += context.features.length * 2;

    // Columns/fields
    complexity += (context.columns?.length || 0) * 0.5;
    complexity += (context.fields?.length || 0) * 0.5;

    // Logic
    if (context.logic) {
      complexity += context.logic.handlers ? Object.keys(context.logic.handlers).length : 0;
      complexity += context.logic.toolbar ? context.logic.toolbar.length : 0;
      complexity += context.logic.state ? Object.keys(context.logic.state).length * 0.5 : 0;
    }

    return Math.round(complexity);
  }

  /**
   * Estimate lines of code
   */
  private estimateLines(context: BladeGenerationContext): number {
    let lines = context.type === "list" ? 200 : 180;

    // Features add lines
    lines += context.features.length * 30;

    // Columns/fields
    lines += (context.columns?.length || 0) * 5;
    lines += (context.fields?.length || 0) * 10;

    return lines;
  }

  /**
   * Infer TypeScript type from column
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
   * Infer TypeScript type from field
   */
  private inferTypeFromField(field: Field): string {
    switch (field.type) {
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "date":
        return "Date | string";
      default:
        return "string";
    }
  }
}
