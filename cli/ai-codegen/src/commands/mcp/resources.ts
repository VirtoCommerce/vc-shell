/**
 * Resources Module
 * MCP resource definitions and handlers
 */

import * as fs from "fs";
import * as path from "path";
import { isCompiledBuild } from "../../utils/paths";

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Get all available resources
 */
export function getResourceDefinitions(rootPath: string): ResourceDefinition[] {
  return [
    {
      uri: "vcshell://component-registry",
      name: "VC-Shell Component Registry",
      description: "Complete registry of available VC-Shell components with examples",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://ui-plan-schema",
      name: "UI-Plan JSON Schema",
      description: "JSON Schema for VC-Shell UI-Plan validation",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://blade-list-pattern",
      name: "Blade List Pattern",
      description: "Complete example of a list/grid blade with table, search, and CRUD operations",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://blade-details-pattern",
      name: "Blade Details Pattern",
      description: "Complete example of a details/form blade with validation and save/delete",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://composable-list-pattern",
      name: "List Composable Pattern",
      description: "Example of useEntityList composable for list blades",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://composable-details-pattern",
      name: "Details Composable Pattern",
      description: "Example of useEntityDetails composable for details blades",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://component-templates",
      name: "Slot Component Templates",
      description:
        "Reusable Vue components for table slots and blade composition (status-badge, image-grid, actions-dropdown, widget-container)",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://generation-rules",
      name: "Code Generation Rules",
      description:
        "Complete rules for AI code generation including blade structure, naming conventions, i18n patterns, composition patterns, and validation rules",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://composition-guide",
      name: "Pattern Composition Guide",
      description:
        "Guide for composing blades from patterns using AI. Explains pattern selection, composition strategies, and generation workflows",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://prompt-analysis-guide-v2",
      name: "Prompt Analysis Guide V2 (Extended)",
      description:
        "V2 Extended: Comprehensive guide for deep analysis of complex multi-entity scenarios. Supports multiple entities, custom routes/permissions/actions, workflows (linear/branching/parallel), 40+ features, data sources (API/GraphQL/static), and business rules. Use for COMPLEX scenarios.",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://prompt-analysis-schema-v2",
      name: "Prompt Analysis JSON Schema V2 (Extended)",
      description:
        "V2 Extended: JSON Schema for PromptAnalysisV2 with support for multiple entities, workflows, custom configurations, and rich feature set. Use for complex multi-entity analysis.",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://ui-plan-example-complete",
      name: "Complete UI-Plan Example",
      description:
        "IMPORTANT: Full example of a VALID UI-Plan JSON with list and details blades. Shows correct schema format, component types, logic structure, and ALL required fields. ALWAYS reference this when creating UI-Plans!",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://logic-patterns",
      name: "Common Logic Patterns",
      description:
        "Common blade logic patterns (handlers, toolbar, state) for list and details blades with various features",
      mimeType: "application/json",
    },
    // Reference resources (Single Source of Truth)
    {
      uri: "vcshell://reference/blade-list",
      name: "Reference: List Blade",
      description:
        "Authoritative list blade implementation with VcTable, search, pagination, sorting, and toolbar",
      mimeType: "text/plain",
    },
    {
      uri: "vcshell://reference/blade-details",
      name: "Reference: Details Blade",
      description:
        "Authoritative details blade implementation with VcForm, VcCard, validation, and modification tracking",
      mimeType: "text/plain",
    },
    {
      uri: "vcshell://reference/composable-list",
      name: "Reference: List Composable",
      description:
        "Authoritative list composable with useAsync generic pattern, useApiClient, pagination",
      mimeType: "text/plain",
    },
    {
      uri: "vcshell://reference/composable-details",
      name: "Reference: Details Composable",
      description:
        "Authoritative details composable with useAsync, useModificationTracker, useLoading",
      mimeType: "text/plain",
    },
    {
      uri: "vcshell://reference/api-client",
      name: "Reference: API Client",
      description:
        "Authoritative API client with AuthApiBase inheritance and proper method signatures",
      mimeType: "text/plain",
    },
  ];
}

export interface ResourceReaderContext {
  registry?: any;
  buildAnalysisPromptV2?: (prompt: string) => string;
  getPromptAnalysisSchemaV2?: () => any;
  getGenerationRulesProvider?: () => any;
}

/**
 * Read resource content
 * Some resources are static files, others are dynamically generated
 */
export async function readResource(
  uri: string,
  rootPath: string,
  context?: ResourceReaderContext,
): Promise<string> {
  // Detect if running from dist/ or src/ (cross-platform)
  const compiled = isCompiledBuild(rootPath);
  const schemasDir = compiled ? "schemas" : path.join("src", "schemas");
  const examplesDir = compiled ? "examples" : path.join("src", "examples");
  const docsDir = "docs";

  const schemasPath = path.join(rootPath, schemasDir);
  const examplesPath = path.join(rootPath, examplesDir);
  const docsPath = path.join(rootPath, docsDir);

  switch (uri) {
    case "vcshell://component-registry":
      return fs.readFileSync(path.join(schemasPath, "component-registry.json"), "utf-8");

    case "vcshell://ui-plan-schema":
      return fs.readFileSync(path.join(schemasPath, "ui-plan.v1.schema.json"), "utf-8");

    case "vcshell://blade-list-pattern": {
      const examplePath = path.join(examplesPath, "patterns/blade-list-complete.md");
      if (!fs.existsSync(examplePath)) {
        throw new Error("Blade list pattern example not found");
      }
      return fs.readFileSync(examplePath, "utf-8");
    }

    case "vcshell://blade-details-pattern": {
      const examplePath = path.join(examplesPath, "patterns/blade-details-complete.md");
      if (!fs.existsSync(examplePath)) {
        throw new Error("Blade details pattern example not found");
      }
      return fs.readFileSync(examplePath, "utf-8");
    }

    case "vcshell://composable-list-pattern": {
      const examplePath = path.join(examplesPath, "patterns/composable-list-complete.md");
      if (!fs.existsSync(examplePath)) {
        throw new Error("Composable list pattern example not found");
      }
      return fs.readFileSync(examplePath, "utf-8");
    }

    case "vcshell://composable-details-pattern": {
      const examplePath = path.join(examplesPath, "patterns/composable-details-complete.md");
      if (!fs.existsSync(examplePath)) {
        throw new Error("Composable details pattern example not found");
      }
      return fs.readFileSync(examplePath, "utf-8");
    }

    case "vcshell://component-templates": {
      // Return slot component metadata and code (requires registry from context)
      if (!context?.registry) {
        throw new Error("Registry context required for component-templates resource");
      }

      const slotComponents = context.registry._slotComponents?.components || [];
      const componentsData = slotComponents.map((comp: any) => {
        const compPath = path.join(examplesPath, comp.file);
        let code = "";

        if (fs.existsSync(compPath)) {
          code = fs.readFileSync(compPath, "utf-8");
        }

        return {
          name: comp.name,
          file: comp.file,
          description: comp.description,
          usage: comp.usage,
          props: comp.props,
          events: comp.events,
          example: comp.example,
          code,
        };
      });

      return JSON.stringify(
        {
          description: "Reusable components for custom table slots and blade composition",
          components: componentsData,
        },
        null,
        2,
      );
    }

    case "vcshell://generation-rules": {
      // Dynamically generate rules using generation-rules provider
      if (!context?.getGenerationRulesProvider) {
        throw new Error("getGenerationRulesProvider context required for generation-rules resource");
      }

      const rulesProvider = context.getGenerationRulesProvider();
      return rulesProvider.exportRulesAsJSON();
    }

    case "vcshell://prompt-analysis-guide-v2": {
      // Dynamically generate V2 analysis guide
      if (!context?.buildAnalysisPromptV2) {
        throw new Error("buildAnalysisPromptV2 context required for prompt-analysis-guide-v2 resource");
      }

      const dummyPrompt = "Example: Order management with approval workflow. Orders have line items.";
      return context.buildAnalysisPromptV2(dummyPrompt);
    }

    case "vcshell://prompt-analysis-schema-v2": {
      // Dynamically generate V2 schema
      if (!context?.getPromptAnalysisSchemaV2) {
        throw new Error("getPromptAnalysisSchemaV2 context required for prompt-analysis-schema-v2 resource");
      }

      const schema = context.getPromptAnalysisSchemaV2();
      return JSON.stringify(schema, null, 2);
    }

    case "vcshell://ui-plan-example-complete":
      return fs.readFileSync(path.join(examplesPath, "ui-plan-example-complete.json"), "utf-8");

    case "vcshell://composition-guide":
      return getCompositionGuide();

    case "vcshell://logic-patterns":
      return getLogicPatterns();

    // Reference resources (Single Source of Truth)
    case "vcshell://reference/blade-list": {
      const refPath = path.join(examplesPath, "reference/blade-list.vue");
      if (!fs.existsSync(refPath)) {
        throw new Error("Reference blade-list.vue not found");
      }
      return fs.readFileSync(refPath, "utf-8");
    }

    case "vcshell://reference/blade-details": {
      const refPath = path.join(examplesPath, "reference/blade-details.vue");
      if (!fs.existsSync(refPath)) {
        throw new Error("Reference blade-details.vue not found");
      }
      return fs.readFileSync(refPath, "utf-8");
    }

    case "vcshell://reference/composable-list": {
      const refPath = path.join(examplesPath, "reference/composable-list.ts");
      if (!fs.existsSync(refPath)) {
        throw new Error("Reference composable-list.ts not found");
      }
      return fs.readFileSync(refPath, "utf-8");
    }

    case "vcshell://reference/composable-details": {
      const refPath = path.join(examplesPath, "reference/composable-details.ts");
      if (!fs.existsSync(refPath)) {
        throw new Error("Reference composable-details.ts not found");
      }
      return fs.readFileSync(refPath, "utf-8");
    }

    case "vcshell://reference/api-client": {
      const refPath = path.join(examplesPath, "reference/api-client.ts");
      if (!fs.existsSync(refPath)) {
        throw new Error("Reference api-client.ts not found");
      }
      return fs.readFileSync(refPath, "utf-8");
    }

    default:
      throw new Error(`Unknown resource URI: ${uri}`);
  }
}

/**
 * Get composition guide (static content)
 */
function getCompositionGuide(): string {
  return `# 🎨 Pattern Composition Guide

## Overview

This guide explains how to compose VC-Shell blade code from multiple patterns instead of using fixed templates.

## Pattern Composition Philosophy

**OLD APPROACH (v0.5.0):**
- 5 fixed templates
- Token replacement
- Limited variations

**NEW APPROACH (v0.6.0):**
- Unlimited pattern combinations
- Smart composition
- AI-driven generation

## Available Patterns

### Base Patterns
1. **list-basic** - Basic list blade with VcTable
2. **form-basic** - Basic details blade with VcForm

### Feature Patterns
3. **filters-pattern** - Add filters slot to list
4. **list-with-multiselect** - Add row selection
5. **validation-pattern** - Add VeeValidate
6. **gallery-pattern** - Add image gallery

### Custom Patterns
7. **custom-column-slots** - Custom table columns
8. **custom-toolbar** - Custom toolbar actions
9. **widget-integration** - Add custom widgets

### Shared Patterns
10. **error-handling** - Comprehensive error handling
11. **async-select** - Async searchable selects
12. **i18n-integration** - Internationalization

## Composition Strategy

### Step 1: Select Base Pattern
Choose either list-basic or form-basic based on blade layout.

### Step 2: Add Feature Patterns
Add patterns for each feature (filters, multiselect, etc.)

### Step 3: Add Custom Patterns
If blade has customSlots, widgets, or custom logic, add custom patterns.

### Step 4: Merge Patterns
Combine all patterns cohesively:
- Merge imports
- Combine template sections
- Merge script setup code
- Combine styles

### Step 5: Apply Logic
Apply blade.logic definitions:
- Wire up handlers
- Add toolbar actions
- Setup state management

## Composition Rules

### Structure Rules
1. All VC-Shell blades must use Composition API
2. Always use \`<script setup lang="ts">\`
3. Use \`markRaw()\` for blade references
4. Props: interface Props defined at top
5. Emits: defineEmits() after props

### Naming Rules
1. Components: PascalCase (EntityList, EntityDetails)
2. Composables: use + PascalCase (useEntityList)
3. Files: kebab-case (entity-list.vue)
4. Variables: camelCase
5. Constants: UPPER_CASE

### i18n Rules
1. ALL text must use $t()
2. Keys: pages.{module}.{blade}.{section}.{key}
3. Tooltips: pages.{module}.{blade}.tooltips.{key}
4. Errors: pages.{module}.{blade}.errors.{key}

### Import Rules
1. Vue imports first
2. VC-Shell composables second
3. Local imports last
4. Always import { markRaw } from 'vue'

## Example Composition

\`\`\`vue
<template>
  <!-- Base: VcTable -->
  <VcTable
    :items="items"
    :loading="loading"
    @item-click="onItemClick"
  >
    <!-- Feature: Filters -->
    <template #filters>
      <VcInput v-model="stagedFilters.keyword" />
    </template>

    <!-- Custom: Column slots -->
    <template #item_status="{ item }">
      <VcStatus :value="item.isActive" />
    </template>
  </VcTable>
</template>

<script setup lang="ts">
// Imports (Base + Feature patterns)
import { ref, computed, onMounted } from 'vue';
import { markRaw } from 'vue';
import { useEntityList } from './composables/useEntityList';

// Props & Emits
interface Props {
  param?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// Composable (Base pattern)
const { items, loading, load, deleteItem } = useEntityList();

// State (Feature patterns)
const selectedItemId = ref<string>();
const selectedItems = ref<string[]>([]);
const stagedFilters = ref({});
const appliedFilters = ref({});

// Handlers (Logic from UI-Plan)
const onItemClick = (item: any) => {
  openBlade({
    blade: markRaw(EntityDetails),
    param: item.id,
    onOpen: () => { selectedItemId.value = item.id },
    onClose: () => { selectedItemId.value = undefined; load() }
  });
};

// Lifecycle
onMounted(() => {
  load();
});
</script>
\`\`\`

## Quality Checklist

Before generating code, ensure:
- [ ] Uses only VC-Shell components from registry
- [ ] All text uses i18n ($t())
- [ ] Handlers match blade.logic definitions
- [ ] State matches blade.logic.state
- [ ] Toolbar matches blade.logic.toolbar
- [ ] TypeScript types are correct
- [ ] Error handling is comprehensive
- [ ] Loading states are handled
- [ ] Empty states are handled

## Common Mistakes

❌ **DON'T:**
- Use HTML elements instead of VC components
- Hardcode text strings
- Use Options API
- Forget markRaw() for blades
- Mix naming conventions

✅ **DO:**
- Use VcInput, VcButton, VcTable, etc.
- Use $t() for all text
- Use Composition API with <script setup>
- Always markRaw() blade components
- Follow naming conventions strictly

`;
}

/**
 * Get logic patterns (static content)
 */
function getLogicPatterns(): string {
  const patterns = {
    listPatterns: {
      basic: {
        handlers: {
          onItemClick:
            "openBlade({blade: markRaw(EntityDetails), param: item.id, onOpen: () => { selectedItemId.value = item.id }, onClose: () => { selectedItemId.value = undefined; load() }})",
        },
        toolbar: [
          { id: "refresh", icon: "material-refresh", action: "load()" },
          { id: "add", icon: "material-add", action: "openBlade({blade: markRaw(EntityDetails)})" },
        ],
        state: {
          items: { source: "composable", reactive: true },
          loading: { source: "composable", reactive: true },
          selectedItemId: { source: "local", reactive: true, default: "undefined" },
        },
      },
      withFilters: {
        handlers: {
          onApplyFilters: "appliedFilters.value = stagedFilters.value; load()",
        },
        state: {
          stagedFilters: { source: "local", reactive: true, default: "{}" },
          appliedFilters: { source: "composable", reactive: true },
        },
      },
      withMultiselect: {
        handlers: {
          onSelectionChange: "selectedItems.value = selectedIds",
          onDelete: "confirmAndDelete(item.id)",
        },
        toolbar: [
          {
            id: "delete-selected",
            icon: "material-delete",
            action: "deleteSelectedItems()",
            condition: "selectedItems.value.length > 0",
          },
        ],
        state: {
          selectedItems: { source: "local", reactive: true, default: "[]" },
        },
      },
    },
    detailsPatterns: {
      basic: {
        handlers: {
          onSave: "validateAndSave()",
        },
        toolbar: [
          { id: "save", icon: "material-save", action: "save()", condition: "modified && !loading" },
          { id: "cancel", icon: "material-close", action: "close()" },
        ],
        state: {
          item: { source: "composable", reactive: true },
          loading: { source: "composable", reactive: true },
          modified: { source: "local", reactive: true, default: "false" },
        },
      },
      withValidation: {
        handlers: {
          onValidate: "validateForm()",
        },
        state: {
          errors: { source: "local", reactive: true, default: "{}" },
          validating: { source: "local", reactive: true, default: "false" },
        },
      },
      withGallery: {
        handlers: {
          onImageUpload: "uploadImage(file)",
          onImageDelete: "deleteImage(imageId)",
        },
        state: {
          images: { source: "local", reactive: true, default: "[]" },
          uploading: { source: "local", reactive: true, default: "false" },
        },
      },
    },
  };

  return JSON.stringify(patterns, null, 2);
}
