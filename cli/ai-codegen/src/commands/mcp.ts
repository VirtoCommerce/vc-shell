#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Validator } from "../core/validator.js";
import { SearchEngine } from "../core/search-engine.js";
import { FrameworkAPISearchEngine } from "../core/framework-search-engine.js";
import {
  searchComponentsSchema,
  viewComponentsSchema,
  getComponentExamplesSchema,
  scaffoldAppSchema,
  validateUIPlanSchema,
  getBladeTemplateSchema,
  generateCompleteModuleSchema,
  validateAndFixPlanSchema,
  generateBladeSchema,
  searchComponentsByIntentSchema,
  getComponentCapabilitiesSchema,
  generateWithCompositionSchema,
  inferBladeLogicSchema,
  getCompositionGuideSchema,
  submitGeneratedCodeSchema,
  analyzePromptV2Schema,
  createUIPlanFromAnalysisV2Schema,
  searchFrameworkAPIsSchema,
  viewFrameworkAPIsSchema,
  searchFrameworkByIntentSchema,
  getFrameworkCapabilitiesSchema,
  getFrameworkExamplesSchema,
  type Component,
  type ComponentRegistry,
  type ComponentCapability,
  type ComponentTemplate,
  type FrameworkRegistry,
  type SlotComponent,
} from "../schemas/zod-schemas.js";
import {
  formatComponentList,
  formatMultipleComponentDetails,
  formatSearchResults,
  formatComponentExamples,
  formatMcpError,
} from "../utils/formatters.js";
import { generateMinimalAuditChecklist } from "../utils/audit-checklist.js";
import { componentNotFoundError, mcpError } from "../utils/errors.js";
import { UnifiedCodeGenerator } from "../core/unified-generator.js";
import type { UIPlan as ValidatorUIPlan, Blade } from "../core/validator.js";
import { LogicPlanner } from "../core/logic-planner.js";
import { BladeComposer } from "../core/blade-composer.js";
import { SmartCodeGenerator, GenerationStrategy } from "../core/smart-generator.js";
import { getGenerationRulesProvider } from "../core/generation-rules.js";
import { autoFixUIPlan } from "../utils/ui-plan-fixer.js";
import { CodeValidator } from "../core/code-validator.js";
import { LLMFeedbackFormatter } from "../core/llm-feedback.js";
import { PlannerV2 } from "../core/planner-v2.js";
import { buildAnalysisPromptV2, getPromptAnalysisSchemaV2 } from "../core/prompt-analyzer-v2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP Server for VC-Shell AI Code Generation
 * Provides tools and resources for Cursor/Claude to generate UI-Plans and Vue code
 */
export async function mcpServerCommand() {
  const server = new Server(
    {
      name: "vcshell-codegen",
      version: "0.7.6",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  // Get paths to schemas and examples
  const schemasPath = __dirname.includes("/dist")
    ? path.join(__dirname, "schemas")
    : path.join(__dirname, "..", "schemas");

  const examplesPath = __dirname.includes("/dist")
    ? path.join(__dirname, "examples")
    : path.join(__dirname, "..", "examples");

  // Load unified component registry with capabilities
  const registryPath = path.join(schemasPath, "component-registry.json");
  const registry: ComponentRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

  // Initialize search engine
  const searchEngine = new SearchEngine(registry);

  // Load framework API registry
  const frameworkRegistryPath = path.join(schemasPath, "framework-api-registry.json");
  const frameworkRegistry: FrameworkRegistry = JSON.parse(fs.readFileSync(frameworkRegistryPath, "utf-8"));

  // Initialize framework search engine
  const frameworkSearchEngine = new FrameworkAPISearchEngine(frameworkRegistry);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "validate_ui_plan",
          description: "Validate a UI-Plan JSON against the VC-Shell schema and component registry",
          inputSchema: zodToJsonSchema(validateUIPlanSchema),
        },
        {
          name: "search_components",
          description:
            "Search for VC-Shell components with optional fuzzy matching. Supports pagination and filtering by category. Replaces get_component_list with more powerful search capabilities.",
          inputSchema: zodToJsonSchema(searchComponentsSchema),
        },
        {
          name: "view_components",
          description:
            "Get detailed information about one or more components including props, events, slots, examples, and dependencies",
          inputSchema: zodToJsonSchema(viewComponentsSchema),
        },
        {
          name: "get_component_examples",
          description: "Search for component examples and demos. Returns full code examples from demo files.",
          inputSchema: zodToJsonSchema(getComponentExamplesSchema),
        },
        {
          name: "get_audit_checklist",
          description:
            "Get a comprehensive audit checklist for verifying generated code. Use this after code generation to ensure quality.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "scaffold_app",
          description:
            "Create a new VC-Shell application from scratch using create-vc-app. IMPORTANT: Always use this tool (NOT bash/npx) when user asks to 'create new app', 'scaffold app', or 'initialize VC-Shell project'. This tool automatically uses --skip-module-gen flag to create base app structure only. After app creation, user can generate modules using generate_complete_module tool.",
          inputSchema: zodToJsonSchema(scaffoldAppSchema),
        },
        {
          name: "get_blade_template",
          description:
            "Get a complete, production-ready Vue SFC blade template. Returns full file content (150-330 lines) that AI should copy and adapt. Available templates: list-simple, list-filters, list-multiselect, details-simple, details-validation. Use this instead of generating code from scratch.",
          inputSchema: zodToJsonSchema(getBladeTemplateSchema),
        },
        {
          name: "generate_complete_module",
          description:
            "⚠️ STRATEGY CHANGE: This tool generates AI INSTRUCTION GUIDES only (AI_FULL strategy), NOT actual code files. It creates detailed per-blade guides that AI must follow to manually write code. Templates and auto-code-generation have been removed. Output is comprehensive instructions for implementing blades/composables/locales.",
          inputSchema: zodToJsonSchema(generateCompleteModuleSchema),
        },
        {
          name: "validate_and_fix_plan",
          description: "Validate UI-Plan and suggest fixes for errors. Returns fixed plan if validation fails.",
          inputSchema: zodToJsonSchema(validateAndFixPlanSchema),
        },
        {
          name: "generate_blade",
          description:
            "Generate single blade (list or details) from configuration. Use this for generating individual blades without full module.",
          inputSchema: zodToJsonSchema(generateBladeSchema),
        },
        {
          name: "search_components_by_intent",
          description:
            "Semantic search for components based on user intent. Returns components with relevant capabilities ranked by relevance. Example: 'I need to filter items by status' → VcTable with filters-slot capability.",
          inputSchema: zodToJsonSchema(searchComponentsByIntentSchema),
        },
        {
          name: "get_component_capabilities",
          description:
            "Get all capabilities of a component with examples. Returns detailed information about props, slots, events, features, and patterns. Use this to understand what a component can do before using it.",
          inputSchema: zodToJsonSchema(getComponentCapabilitiesSchema),
        },
        {
          name: "generate_with_composition",
          description:
            "Generate complete module using smart strategy selection (template/composition/ai-guided). IMPORTANT: UI-Plan MUST follow exact schema format:\n\n" +
            "REQUIRED STRUCTURE:\n" +
            '{\n  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",\n  "module": "kebab-case-string",  // STRING not object!\n  "blades": [{\n' +
            '    "id": "blade-id",\n    "route": "/path",  // REQUIRED!\n    "layout": "grid"|"details"|"page",\n    "title": "Title",\n' +
            '    "components": [{\n      "type": "VcTable",  // type not name!\n      "columns": [...]\n    }],\n' +
            '    "features": ["filters","multiselect","validation","gallery","widgets"],  // ONLY these!\n' +
            '    "logic": {\n      "state": {\n        "loading": {"source":"composable","reactive":true},  // OBJECT not string!\n' +
            '        "items": {"source":"composable","reactive":true}\n      },\n' +
            '      "toolbar": [{"id":"save","icon":"fas fa-save","action":"save()"}],  // action not onClick!\n' +
            '      "handlers": {"onSave":"Save handler description"}\n    }\n  }]\n}\n\n' +
            "READ vcshell://ui-plan-example-complete BEFORE creating UI-Plan!",
          inputSchema: zodToJsonSchema(generateWithCompositionSchema),
        },
        {
          name: "infer_blade_logic",
          description:
            "Automatically infer blade logic (handlers, toolbar, state) from blade structure and features. Use this to generate logic definitions for UI-Plan or to understand what logic a blade should have. Can merge with existing user-provided logic.",
          inputSchema: zodToJsonSchema(inferBladeLogicSchema),
        },
        {
          name: "get_composition_guide",
          description:
            "Get comprehensive composition guide for AI code generation. Returns patterns, rules, examples, and instructions for composing blade code from patterns. Use this to understand how to compose code for specific blade types and features.",
          inputSchema: zodToJsonSchema(getCompositionGuideSchema),
        },
        {
          name: "submit_generated_code",
          description:
            "Submit AI-generated code for validation and saving. Use this tool when you have generated Vue SFC code following a generation guide (AI_GUIDED or AI_FULL strategy). The system will validate the code, provide detailed feedback if there are errors, and allow up to 3 retry attempts. If validation fails after 3 attempts, the system will fall back to composition strategy.",
          inputSchema: zodToJsonSchema(submitGeneratedCodeSchema),
        },
        {
          name: "analyze_prompt_v2",
          description:
            "Get comprehensive instructions for deep analysis of complex prompts (multi-entity, custom routes/actions/permissions, workflows, rich features, data sources). Returns detailed guide with examples.",
          inputSchema: zodToJsonSchema(analyzePromptV2Schema),
        },
        {
          name: "create_ui_plan_from_analysis_v2",
          description:
            "Create rich multi-entity UI-Plan from V2 analysis. Supports multiple entities per module, custom routes/permissions/actions, dashboard/wizard blades, workflows, and 40+ features.",
          inputSchema: zodToJsonSchema(createUIPlanFromAnalysisV2Schema),
        },
        {
          name: "search_framework_apis",
          description:
            "Search for VC-Shell framework composables, plugins, and utilities with fuzzy matching. Find APIs by name, keywords, category (Navigation, Data, UI, Utility), or type (composable, plugin, utility, service). Example: 'blade nav' → finds useBladeNavigation. Use this to discover available framework functionality.",
          inputSchema: zodToJsonSchema(searchFrameworkAPIsSchema),
        },
        {
          name: "view_framework_apis",
          description:
            "Get detailed information about framework composables/plugins/utilities including methods, state, capabilities, examples, and usage. Returns complete API reference with signatures, parameters, return types, and code examples. Use this to understand how to use specific framework APIs.",
          inputSchema: zodToJsonSchema(viewFrameworkAPIsSchema),
        },
        {
          name: "search_framework_by_intent",
          description:
            "Find framework APIs based on user intent using semantic search. Searches through capabilities and use cases. Example: 'I need to close a blade after saving' → finds useBladeNavigation.closeBlade. Context-aware (list/details blades). Returns top 5 most relevant APIs with matched capabilities.",
          inputSchema: zodToJsonSchema(searchFrameworkByIntentSchema),
        },
        {
          name: "get_framework_capabilities",
          description:
            "Get detailed capability information for a framework API. Shows what the API can do, when to use it, complexity level, and complete working examples. Use this to understand framework API features before using them in generated code.",
          inputSchema: zodToJsonSchema(getFrameworkCapabilitiesSchema),
        },
        {
          name: "get_framework_examples",
          description:
            "Search for framework API code examples. Returns complete working code snippets filtered by query and API name. Use this to get ready-to-use implementation examples for framework composables, plugins, and utilities.",
          inputSchema: zodToJsonSchema(getFrameworkExamplesSchema),
        },
      ],
    };
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
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
      ],
    };
  });

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    switch (uri) {
      case "vcshell://component-registry": {
        const content = fs.readFileSync(registryPath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }

      case "vcshell://ui-plan-schema": {
        const schemaPath = path.join(schemasPath, "ui-plan.v1.schema.json");
        const content = fs.readFileSync(schemaPath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }

      case "vcshell://blade-list-pattern": {
        const examplePath = path.join(examplesPath, "blade-list-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Blade list pattern example not found");
      }

      case "vcshell://blade-details-pattern": {
        const examplePath = path.join(examplesPath, "blade-details-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Blade details pattern example not found");
      }

      case "vcshell://composable-list-pattern": {
        const examplePath = path.join(examplesPath, "composable-list-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Composable list pattern example not found");
      }

      case "vcshell://composable-details-pattern": {
        const examplePath = path.join(examplesPath, "composable-details-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Composable details pattern example not found");
      }

      case "vcshell://component-templates": {
        // Return slot component metadata and code
        const slotComponents: SlotComponent[] = registry._slotComponents?.components || [];
        const componentsPath = path.join(examplesPath, "components");

        const componentsData = slotComponents.map((comp) => {
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

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  description: "Reusable components for custom table slots and blade composition",
                  components: componentsData,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "vcshell://generation-rules": {
        // Import getGenerationRulesProvider dynamically
        const { getGenerationRulesProvider } = await import("../core/generation-rules.js");
        const rulesProvider = getGenerationRulesProvider();
        const rulesJSON = rulesProvider.exportRulesAsJSON();

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: rulesJSON,
            },
          ],
        };
      }

      case "vcshell://prompt-analysis-guide-v2": {
        const dummyPrompt = "Example: Order management with approval workflow. Orders have line items.";
        const guide = buildAnalysisPromptV2(dummyPrompt);
        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: guide,
            },
          ],
        };
      }

      case "vcshell://prompt-analysis-schema-v2": {
        const schema = getPromptAnalysisSchemaV2();
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      }

      case "vcshell://ui-plan-example-complete": {
        const examplePath = path.join(examplesPath, "ui-plan-example-complete.json");
        const content = fs.readFileSync(examplePath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }

      case "vcshell://composition-guide": {
        const guide = `# 🎨 Pattern Composition Guide

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

## Strategy Selection

The system automatically chooses:
- **TEMPLATE** (complexity ≤5): Fast AST transformation
- **COMPOSITION** (5-10): Pattern composition (THIS GUIDE)
- **AI_FULL** (>10): Full AI generation with all patterns

When using COMPOSITION strategy, follow this guide precisely.
`;

        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: guide,
            },
          ],
        };
      }

      case "vcshell://logic-patterns": {
        const patterns = {
          listPatterns: {
            basic: {
              handlers: {
                onItemClick:
                  "openBlade({blade: markRaw(EntityDetails), param: item.id, onOpen: () => { selectedItemId.value = item.id }, onClose: () => { selectedItemId.value = undefined; load() }})",
              },
              toolbar: [
                { id: "refresh", icon: "fas fa-sync", action: "load()" },
                { id: "add", icon: "fas fa-plus", action: "openBlade({blade: markRaw(EntityDetails)})" },
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
                  icon: "fas fa-trash",
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
                { id: "save", icon: "fas fa-save", action: "save()", condition: "modified && !loading" },
                { id: "cancel", icon: "fas fa-times", action: "close()" },
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

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(patterns, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "validate_ui_plan": {
          const parsed = validateUIPlanSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const validator = new Validator();
          const result = validator.validateUIPlan(parsed.data.plan);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    valid: result.valid,
                    message: result.valid ? "UI-Plan is valid" : "UI-Plan has validation errors",
                    errors: result.errors || undefined,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "search_components": {
          const parsed = searchComponentsSchema.safeParse(args || {});
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, limit, offset } = parsed.data;
          const searchResult = searchEngine.search({
            query,
            limit: limit || 20,
            offset: offset || 0,
          });

          const formatted = formatSearchResults(searchResult);

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        case "view_components": {
          const parsed = viewComponentsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { components } = parsed.data;
          const componentData = searchEngine.getComponents(components);

          if (componentData.length === 0) {
            const availableComponents = Array.from(searchEngine.getAllComponents().keys());
            throw componentNotFoundError(components.join(", "), availableComponents);
          }

          const componentsWithDetails = componentData.map(({ name, component }) => ({
            name,
            ...component,
          }));

          const formatted = formatMultipleComponentDetails(componentsWithDetails);

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        case "get_component_examples": {
          const parsed = getComponentExamplesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, component } = parsed.data;

          const componentsPath = path.join(examplesPath, "components");
          const templatesPath = path.join(examplesPath, "templates");

          const foundFiles: Array<{ file: string; path: string; type: string }> = [];

          // Search in components/ for .md demos
          if (fs.existsSync(componentsPath)) {
            const files = fs.readdirSync(componentsPath);
            for (const file of files) {
              if (file.endsWith("-demo.md") || file.endsWith("-example.md")) {
                if (component && !file.toLowerCase().includes(component.toLowerCase())) {
                  continue;
                }
                if (query && !file.toLowerCase().includes(query.toLowerCase())) {
                  continue;
                }
                foundFiles.push({
                  file,
                  path: path.join(componentsPath, file),
                  type: "demo",
                });
              }
            }
          }

          // Search in templates/ for .vue templates
          if (fs.existsSync(templatesPath)) {
            const files = fs.readdirSync(templatesPath);
            for (const file of files) {
              if (file.endsWith(".vue")) {
                if (query && !file.toLowerCase().includes(query.toLowerCase())) {
                  continue;
                }
                foundFiles.push({
                  file,
                  path: path.join(templatesPath, file),
                  type: "template",
                });
              }
            }
          }

          if (foundFiles.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No examples or templates found matching query: "${query}"${component ? ` for component: ${component}` : ""}

Try:
- "VcTable" for component demos
- "list" for list blade templates
- "details" for details blade templates
- "filter" for examples with filters`,
                },
              ],
            };
          }

          // Read and format found files
          let output = `# Examples and Templates\n\nFound ${foundFiles.length} result(s):\n\n`;

          for (const { file, path: filePath, type } of foundFiles) {
            const content = fs.readFileSync(filePath, "utf-8");
            const title = file.replace("-demo.md", "").replace("-example.md", "").replace(".vue", "");
            const fileType = type === "template" ? "Production Template" : "Demo";

            output += `## ${title} (${fileType})\n\n`;

            if (type === "template") {
              const templates = registry.VcBlade?.templates || [];
              const templateInfo = templates.find((t) => t.file === `templates/${file}`);

              if (templateInfo) {
                output += `**Complexity:** ${templateInfo.complexity}\n`;
                output += `**Features:** ${templateInfo.features?.join(", ")}\n`;
                output += `**Lines:** ~${templateInfo.lines}\n\n`;
                output += `**Usage:** Production-ready template - COPY and ADAPT.\n\n`;
              }
            }

            output += `\`\`\`${type === "template" ? "vue" : "markdown"}\n${content}\n\`\`\`\n\n---\n\n`;
          }

          return {
            content: [
              {
                type: "text",
                text: output,
              },
            ],
          };
        }

        case "get_audit_checklist": {
          const checklist = generateMinimalAuditChecklist();

          return {
            content: [
              {
                type: "text",
                text: checklist,
              },
            ],
          };
        }

        case "scaffold_app": {
          const parsed = scaffoldAppSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { projectName, targetDirectory } = parsed.data;

          const targetDir = targetDirectory || process.cwd();
          const projectPath = path.join(targetDir, projectName);

          // Check if directory already exists
          if (fs.existsSync(projectPath)) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: `Directory '${projectName}' already exists`,
                      suggestion: "Choose a different project name or remove existing directory",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          // Import execa dynamically
          const { execa } = await import("execa");

          try {
            // Run create-vc-app in non-interactive mode
            console.error(`Creating VC-Shell app: ${projectName}...`);

            const result = await execa(
              "npx",
              ["@vc-shell/create-vc-app@latest", projectName, "--skip-module-gen", "--overwrite"],
              {
                cwd: targetDir,
                stdio: "pipe",
              },
            );

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      message: `VC-Shell app '${projectName}' created successfully`,
                      path: projectPath,
                      nextSteps: [
                        `cd ${projectName}`,
                        `yarn install`,
                        `yarn serve`,
                        ``,
                        `Then use AI to generate modules:`,
                        `"Create vendor management module with list and details"`,
                      ],
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          } catch (error: any) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "Failed to create app",
                      details: error.message || String(error),
                      suggestion: "Check that @vc-shell/create-vc-app is accessible and try again",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }
        }

        case "get_blade_template": {
          const parsed = getBladeTemplateSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { type, complexity } = parsed.data;

          // Map type + complexity to template filename
          const templateMap: Record<string, string> = {
            "list-simple": "list-simple.vue",
            "list-filters": "list-filters.vue",
            "list-multiselect": "list-multiselect.vue",
            "details-simple": "details-simple.vue",
            "details-validation": "details-validation.vue",
          };

          const templateKey = `${type}-${complexity}`;
          const templateFile = templateMap[templateKey];

          if (!templateFile) {
            return {
              content: [
                {
                  type: "text",
                  text: `Template not found for type="${type}" complexity="${complexity}". Available: list-simple, list-filters, list-multiselect, details-simple, details-validation`,
                },
              ],
              isError: true,
            };
          }

          const templatePath = path.join(examplesPath, "templates", templateFile);

          if (!fs.existsSync(templatePath)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Template file not found: ${templateFile}`,
                },
              ],
              isError: true,
            };
          }

          const content = fs.readFileSync(templatePath, "utf-8");

          // Get template metadata from registry
          const templates = registry.VcBlade?.templates || [];
          const templateInfo = templates.find((t) => t.id === templateKey);

          const metadata = templateInfo
            ? `
## Template: ${templateInfo.description}

**Complexity:** ${templateInfo.complexity}
**Features:** ${templateInfo.features?.join(", ")}
**Lines:** ~${templateInfo.lines}
${templateInfo.requiredComponents ? `**Required Components:** ${templateInfo.requiredComponents.join(", ")}` : ""}

**Instructions:**
1. COPY the template code below as-is
2. RENAME entity names (Entity → YourEntity)
3. ADAPT columns/fields for your data model
4. UPDATE i18n keys (ENTITIES → YOUR_MODULE)
5. PRESERVE all event handlers and state management logic

`
            : "";

          return {
            content: [
              {
                type: "text",
                text: `${metadata}
\`\`\`vue
${content}
\`\`\`

**Next Steps:**
- Copy this template
- Adapt entity names and types
- Customize columns/fields
- Update translation keys
- Create corresponding composable (useEntityList or useEntityDetails)
`,
              },
            ],
          };
        }

        case "generate_complete_module": {
          const parsed = generateCompleteModuleSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { plan, cwd, dryRun, mode } = parsed.data;

          // Validate plan first
          const validator = new Validator();
          const validation = validator.validateUIPlan(plan);

          if (!validation.valid) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "UI-Plan validation failed",
                      errors: validation.errors,
                      suggestion: "Fix validation errors and try again, or use validate_and_fix_plan tool",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          // Generate module
          const validatedPlan = plan as unknown as ValidatorUIPlan;
          const generator = new UnifiedCodeGenerator();
          const result = await generator.generateModule(validatedPlan, cwd, {
            writeToDisk: !dryRun,
            dryRun,
            mode,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Module generated successfully`,
                    summary: {
                      module: validatedPlan.module,
                      blades: result.summary.blades,
                      composables: result.summary.composables,
                      locales: result.summary.locales,
                      registered: result.summary.registered,
                      totalFiles: result.files.length,
                      mode: result.summary.mode || mode,
                    },
                    files: result.files.map((f) => ({
                      path: f.path.replace(cwd, ""),
                      lines: f.lines,
                    })),
                    dryRun: dryRun || false,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "validate_and_fix_plan": {
          const parsed = validateAndFixPlanSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { plan } = parsed.data;
          const validator = new Validator();

          // First, normalize the plan (auto-fix id → key, width, etc.)
          const { plan: normalizedPlan, changes } = validator.normalizePlan(plan);

          // Then validate normalized plan
          const validation = validator.validateUIPlan(normalizedPlan);

          if (validation.valid) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      valid: true,
                      fixed: changes.length > 0,
                      message:
                        changes.length > 0
                          ? "UI-Plan fixed and validated successfully"
                          : "UI-Plan is valid, no fixes needed",
                      plan: normalizedPlan,
                      changes,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          // Generate suggested fixes for remaining errors
          const fixes = validation.errors.map((error) => ({
            path: error.path,
            message: error.message,
            severity: error.severity,
            suggestion: generateFixSuggestion(error),
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    valid: false,
                    errors: validation.errors,
                    fixes,
                    message: "UI-Plan has validation errors. Review and fix manually or regenerate plan.",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "generate_blade": {
          const parsed = generateBladeSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { type, entity, columns, fields } = parsed.data;

          // This is a simplified single-blade generation
          // In practice, this would use the same template adapter logic
          // For now, return instructions
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: "Single blade generation",
                    note: "Use generate_complete_module for full module generation",
                    params: { type, entity, columns, fields },
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "search_components_by_intent": {
          const parsed = searchComponentsByIntentSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { intent, context } = parsed.data;

          // Simple keyword matching for semantic search
          // In production, this could use embeddings or more sophisticated NLP
          const keywords = intent.toLowerCase().split(/\s+/);
          const results: any[] = [];

          for (const [componentName, component] of Object.entries(registry)) {
            if (!componentName.startsWith("Vc")) continue;

            let score = 0;
            const matchedCapabilities: any[] = [];

            // Search in capabilities (if they exist)
            const capabilities = component.capabilities || {};
            for (const [capId, capability] of Object.entries(capabilities)) {
              const capText =
                `${capability.name} ${capability.description} ${capability.useCases?.join(" ")}`.toLowerCase();

              for (const keyword of keywords) {
                if (capText.includes(keyword)) {
                  score += 10;
                  matchedCapabilities.push({
                    id: capId,
                    name: capability.name,
                    type: capability.type,
                    description: capability.description,
                  });
                }
              }
            }

            // Context filtering
            if (context) {
              if (context === "list" && !componentName.includes("Table")) score *= 0.5;
              if (context === "details" && !componentName.includes("Form")) score *= 0.5;
            }

            if (score > 0) {
              results.push({
                component: componentName,
                score,
                capabilities: matchedCapabilities.slice(0, 3), // Top 3 capabilities
                description: component.description,
              });
            }
          }

          // Sort by score
          results.sort((a, b) => b.score - a.score);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    intent,
                    results: results.slice(0, 5), // Top 5 results
                    totalFound: results.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "get_component_capabilities": {
          const parsed = getComponentCapabilitiesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { component, capability, includeExamples } = parsed.data;

          if (!registry[component]) {
            throw new Error(`Component ${component} not found in registry`);
          }

          const componentData: any = registry[component];
          let capabilities = componentData.capabilities || {};

          // Filter by specific capability if requested
          if (capability) {
            capabilities = { [capability]: capabilities[capability] };
            if (!capabilities[capability]) {
              throw new Error(`Capability ${capability} not found for ${component}`);
            }
          }

          // Load examples if requested
          if (includeExamples) {
            for (const [capId, cap] of Object.entries(capabilities)) {
              try {
                const examplePath = path.join(examplesPath, "capabilities", component, `${capId}.md`);
                if (fs.existsSync(examplePath)) {
                  cap.exampleFile = fs.readFileSync(examplePath, "utf-8");
                }
              } catch (error) {
                // Example not found, skip
              }
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    component,
                    description: componentData.description,
                    category: componentData.category,
                    capabilities,
                    capabilityCount: Object.keys(capabilities).length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "generate_with_composition": {
          const parsed = generateWithCompositionSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          let { plan, cwd, strategy, dryRun } = parsed.data;

          // Auto-fix common UI-Plan errors
          const fixResult = autoFixUIPlan(plan);
          if (fixResult.fixed) {
            console.log(`\n🔧 Auto-fixed ${fixResult.changes.length} UI-Plan issues:`);
            fixResult.changes.forEach((change) => console.log(`   - ${change}`));
            plan = fixResult.plan;
          }

          // Validate plan
          const validator = new Validator();
          const validation = validator.validateUIPlan(plan);

          if (!validation.valid) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "UI-Plan validation failed",
                      errors: validation.errors,
                      autoFixAttempted: fixResult.fixed,
                      autoFixChanges: fixResult.changes,
                      suggestion:
                        "Auto-fix attempted but validation still failed. Common issues:\n" +
                        "1. module must be STRING in kebab-case, not object\n" +
                        "2. components must have 'type' field, not 'name' or 'component'\n" +
                        "3. route is REQUIRED for each blade\n" +
                        "4. state values must be OBJECTS with {source, reactive}, not strings\n" +
                        "5. toolbar must have 'action' field, not 'onClick' or 'handler'\n" +
                        "6. features can only be: filters, multiselect, validation, gallery, widgets\n\n" +
                        "READ vcshell://ui-plan-example-complete to see correct format!",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          const validatedPlan = plan as ValidatorUIPlan;

          // Initialize smart generator
          const smartGen = new SmartCodeGenerator();
          const logicPlanner = new LogicPlanner();

          // For each blade: infer logic if not provided
          for (const blade of validatedPlan.blades) {
            if (!blade.logic) {
              blade.logic = logicPlanner.inferLogic(blade);
            }
            if (!blade.composable) {
              blade.composable = logicPlanner.inferComposable(blade);
            }
          }

          // Determine strategy using SmartCodeGenerator
          let selectedStrategy: GenerationStrategy;
          let decision;

          if (strategy && strategy !== "auto") {
            // User forced strategy
            selectedStrategy = strategy as GenerationStrategy;
          } else {
            // Use SmartCodeGenerator to decide
            // For now, analyze first blade to determine strategy
            if (validatedPlan.blades.length > 0) {
              const firstBlade = validatedPlan.blades[0];

              // Extract entity from blade ID (remove -list, -details, -page suffixes)
              const entityToken = firstBlade.id.replace(/-list$|-details$|-page$/, "") || validatedPlan.module;

              const bladeType: "list" | "details" = firstBlade.layout === "grid" ? "list" : "details";

              const mockContext = {
                type: bladeType as "list" | "details",
                entity: entityToken, // ✅ REQUIRED: entity name
                module: validatedPlan.module, // ✅ REQUIRED: module name
                features: firstBlade.features || [],
                blade: firstBlade,
                columns: firstBlade.components?.find((c) => c.type === "VcTable")?.columns,
                fields: firstBlade.components?.find((c) => c.type === "VcForm")?.fields,
                naming: {
                  moduleName: validatedPlan.module,
                  entitySingular: entityToken.charAt(0).toUpperCase() + entityToken.slice(1),
                  entityPlural: validatedPlan.module.charAt(0).toUpperCase() + validatedPlan.module.slice(1),
                  entitySingularCamel: entityToken,
                  entityPluralCamel: validatedPlan.module,
                  entitySingularKebab: entityToken,
                  entityPluralKebab: validatedPlan.module,
                  entitySingularPascal: entityToken.charAt(0).toUpperCase() + entityToken.slice(1),
                  entityPluralPascal: validatedPlan.module.charAt(0).toUpperCase() + validatedPlan.module.slice(1),
                },
                componentName: `${entityToken.charAt(0).toUpperCase() + entityToken.slice(1)}${bladeType === "list" ? "List" : "Details"}`,
                composableName: `use${entityToken.charAt(0).toUpperCase() + entityToken.slice(1)}${bladeType === "list" ? "List" : "Details"}`,
                route: firstBlade.route || `/${validatedPlan.module}`,
                menuTitleKey: `${validatedPlan.module.toUpperCase()}.MENU_TITLE`,
                logic: firstBlade.logic,
                complexity: 0, // ✅ REQUIRED: will be calculated in decide()
              };

              decision = await smartGen.decide(mockContext);
              selectedStrategy = decision.strategy;
            } else {
              selectedStrategy = GenerationStrategy.TEMPLATE;
            }
          }

          // Handle AI_GUIDED strategy - return guide instead of generating code
          if (selectedStrategy === GenerationStrategy.AI_GUIDED && decision?.aiGuide) {
            // Return AI generation guide for AI to follow
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      mode: "ai-guided",
                      message: "AI-Guided generation: Follow the detailed instructions below to generate this blade",
                      strategy: selectedStrategy,
                      decision: {
                        reason: decision.reason,
                        complexity: decision.complexity,
                        estimatedTime: decision.estimatedTime,
                        willUseFallback: decision.willUseFallback,
                      },
                      guide: decision.aiGuide,
                      instruction:
                        "Read the guide above and generate the Vue SFC code following each step carefully. Ensure all constraints are met and the verification checklist passes.",
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          // Generate module
          // NOTE: AI_FULL is now the only supported strategy
          const effectiveMode: "ai-full" = "ai-full";

          const generator = new UnifiedCodeGenerator();
          const result = await generator.generateModule(validatedPlan, cwd, {
            writeToDisk: !dryRun,
            dryRun,
            mode: effectiveMode,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Module generated successfully using ${selectedStrategy} strategy`,
                    strategy: selectedStrategy,
                    decision: decision
                      ? {
                          reason: decision.reason,
                          complexity: decision.complexity,
                          estimatedTime: decision.estimatedTime,
                          willUseFallback: decision.willUseFallback,
                        }
                      : undefined,
                    summary: {
                      module: validatedPlan.module,
                      blades: result.summary.blades,
                      composables: result.summary.composables,
                      locales: result.summary.locales,
                      registered: result.summary.registered,
                      totalFiles: result.files.length,
                      logicInferred: validatedPlan.blades.every((b) => b.logic),
                    },
                    files: result.files.map((f) => ({
                      path: f.path.replace(cwd, ""),
                      lines: f.lines,
                    })),
                    dryRun: dryRun || false,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "infer_blade_logic": {
          const parsed = inferBladeLogicSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { blade, merge } = parsed.data;
          const planner = new LogicPlanner();

          // Infer logic
          const inferred = planner.inferLogic(blade as Blade);
          const composable = planner.inferComposable(blade as Blade);

          // Merge with existing if requested
          const finalLogic = merge && blade.logic ? planner.mergeLogic(inferred, blade.logic) : inferred;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    blade: {
                      id: blade.id,
                      layout: blade.layout,
                    },
                    inferred: {
                      logic: finalLogic,
                      composable,
                    },
                    description: planner.describeLogic(finalLogic),
                    merged: merge && !!blade.logic,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "get_composition_guide": {
          const parsed = getCompositionGuideSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { type, features, complexity } = parsed.data;
          const composer = new BladeComposer();
          const rulesProvider = getGenerationRulesProvider();

          // Get relevant patterns
          const mockContext = {
            type: type,
            entity: "example", // ✅ ADDED: placeholder entity
            module: "examples", // ✅ ADDED: placeholder module
            features: features || [],
            blade: {
              id: `example-${type}`,
              layout: type === "list" ? "grid" : "details",
              features: features || [],
            },
            naming: {
              moduleName: "examples",
              entitySingular: "Example",
              entityPlural: "Examples",
              entitySingularCamel: "example",
              entityPluralCamel: "examples",
              entitySingularKebab: "example",
              entityPluralKebab: "examples",
              entitySingularPascal: "Example",
              entityPluralPascal: "Examples",
            },
            componentName: `Example${type === "list" ? "List" : "Details"}`,
            composableName: `useExample${type === "list" ? "List" : "Details"}`,
            route: "/examples",
            menuTitleKey: "EXAMPLES.MENU_TITLE",
            complexity: complexity || 0, // ✅ ADDED: complexity field
          };

          const patterns = composer.selectPatterns(mockContext);
          const rules = rulesProvider.getRules();

          // Build guide
          let guide = `# Pattern Composition Guide for ${type.toUpperCase()} Blade\n\n`;
          guide += `**Type:** ${type}\n`;
          guide += `**Features:** ${features?.join(", ") || "Basic"}\n`;
          guide += `**Complexity:** ${complexity || "auto"}\n\n`;

          guide += `## Selected Patterns (${patterns.length})\n\n`;
          guide += composer.describePatterns(patterns);

          guide += `\n## Composition Strategy\n\n`;
          guide += `To generate this blade, AI should:\n\n`;
          guide += `1. **Study base pattern** - Understand the core structure\n`;
          guide += `2. **Apply feature patterns** - Add filters, multiselect, etc.\n`;
          guide += `3. **Compose cohesively** - Merge patterns without conflicts\n`;
          guide += `4. **Follow rules strictly** - Use only VC-Shell components\n`;
          guide += `5. **Validate thoroughly** - Ensure all parts work together\n\n`;

          guide += `## Rules\n\n`;
          guide += `**Structure:** ${type === "list" ? rules.bladeStructure.list : rules.bladeStructure.details}\n\n`;
          guide += `**Naming:**\n`;
          guide += `- ${rules.naming.components}\n`;
          guide += `- ${rules.naming.files}\n\n`;

          guide += `**i18n:**\n`;
          guide += `- ${rules.i18n.usage}\n`;
          guide += `- ${rules.i18n.case}\n\n`;

          guide += `## Pattern Details\n\n`;
          for (const pattern of patterns) {
            guide += `### ${pattern.name}\n`;
            guide += `${pattern.description}\n\n`;
            guide += `**Components:** ${pattern.requiredComponents.join(", ")}\n`;
            guide += `**Features:** ${pattern.features.join(", ") || "Basic"}\n\n`;
            if (pattern.codeExample) {
              guide += `**Example:**\n\`\`\`vue\n${pattern.codeExample.substring(0, 500)}...\n\`\`\`\n\n`;
            }
          }

          return {
            content: [
              {
                type: "text",
                text: guide,
              },
            ],
          };
        }

        case "submit_generated_code": {
          const parsed = submitGeneratedCodeSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { bladeId, code, context, composable, retry } = parsed.data;

          // Initialize validator and feedback formatter
          const validator = new CodeValidator();
          const feedback = new LLMFeedbackFormatter();

          // Validate the generated code
          const validation = validator.validateFull(code);

          const attempt = retry?.attempt || 1;
          const retryContext = {
            attempt,
            maxAttempts: feedback.getMaxAttempts(),
            previousErrors: retry?.previousErrors || [],
            bladeId,
            strategy: context.strategy,
          };

          // Format feedback message
          const feedbackMessage = feedback.formatValidationFeedback(validation, retryContext);

          // Log validation results
          if (!validation.valid) {
            const errorReport = feedback.createErrorReport(validation, retryContext);
            console.error(errorReport);
          }

          // If validation failed and no more retries, return fallback message
          if (!validation.valid && !feedbackMessage.canRetry) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      message: feedbackMessage.message,
                      errors: feedbackMessage.errors,
                      fallback: {
                        strategy: "COMPOSITION",
                        message: "Maximum retry attempts reached. System will fall back to composition strategy.",
                      },
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          // If validation failed but can retry, return detailed feedback
          if (!validation.valid) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      message: feedbackMessage.message,
                      errors: feedbackMessage.errors,
                      suggestions: feedbackMessage.suggestions,
                      retry: {
                        canRetry: true,
                        nextAttempt: feedbackMessage.retryAttempt,
                        maxAttempts: feedback.getMaxAttempts(),
                      },
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          // Validation passed! Now save the code
          try {
            // Determine file path
            const moduleDir = path.join(process.cwd(), "src", "modules", context.module);
            const bladesDir = path.join(moduleDir, "pages");
            const composablesDir = path.join(moduleDir, "composables");

            // Ensure directories exist
            if (!fs.existsSync(bladesDir)) {
              fs.mkdirSync(bladesDir, { recursive: true });
            }

            // Save blade file
            const bladeFileName = `${bladeId}.vue`;
            const bladeFilePath = path.join(bladesDir, bladeFileName);
            fs.writeFileSync(bladeFilePath, code, "utf-8");

            console.error(`✅ Saved blade: ${bladeFilePath}`);

            // Save composable if provided
            let composableFilePath;
            if (composable) {
              if (!fs.existsSync(composablesDir)) {
                fs.mkdirSync(composablesDir, { recursive: true });
              }

              const composableFileName = `${composable.name}.ts`;
              composableFilePath = path.join(composablesDir, composableFileName);
              fs.writeFileSync(composableFilePath, composable.code, "utf-8");

              console.error(`✅ Saved composable: ${composableFilePath}`);
            }

            // Return success response
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      message: feedbackMessage.message,
                      files: {
                        blade: bladeFilePath,
                        composable: composableFilePath,
                      },
                      validation: {
                        warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
                      },
                      nextSteps: [
                        composable
                          ? "Both blade and composable saved successfully"
                          : "Blade saved successfully. Consider generating the composable next.",
                        "Run the development server to test the blade",
                        "Check the browser console for any runtime errors",
                        "If needed, call submit_generated_code again with corrections",
                      ],
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          } catch (error: any) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      message: "Code validation passed but failed to save files",
                      error: error.message,
                      suggestion: "Check file permissions and ensure the project structure exists",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }
        }

        case "analyze_prompt_v2": {
          const parsed = analyzePromptV2Schema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { prompt, module } = parsed.data;

          // Build V2 analysis prompt for AI
          const analysisPrompt = buildAnalysisPromptV2(prompt);
          const schema = getPromptAnalysisSchemaV2();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    version: "V2 (Extended)",
                    message: "Follow the instructions below to perform deep analysis of the prompt",
                    userPrompt: prompt,
                    moduleOverride: module,
                    instructions: analysisPrompt,
                    schema,
                    capabilities: {
                      multipleEntities: true,
                      customRoutes: true,
                      customPermissions: true,
                      customActions: true,
                      workflows: ["linear", "branching", "parallel"],
                      bladeTypes: ["list", "details", "dashboard", "wizard", "custom"],
                      features: "40+ features supported",
                      dataSources: ["api", "graphql", "static", "computed"],
                    },
                    workflow: [
                      "1. Read the comprehensive V2 instructions above",
                      "2. Analyze the prompt deeply - extract ALL entities, relationships, workflows",
                      "3. Detect custom routes (e.g., /vendors/pending)",
                      "4. Detect custom actions (e.g., approve, reject, publish)",
                      "5. Identify workflow steps if multi-step process",
                      "6. Return ONLY valid JSON following the V2 schema",
                      "7. Use the result with create_ui_plan_from_analysis_v2 tool",
                    ],
                    nextStep: "After deep AI analysis, call create_ui_plan_from_analysis_v2 with the V2 result",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "create_ui_plan_from_analysis_v2": {
          const parsed = createUIPlanFromAnalysisV2Schema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { analysis } = parsed.data;

          // Use PlannerV2 to generate UI-Plan from V2 analysis
          const plannerV2 = new PlannerV2();

          try {
            const uiPlan = plannerV2.generatePlan({
              prompt: "", // Not used when analysis is provided
              analysis,
            });

            // Validate the generated UI-Plan
            const validator = new Validator();
            const validation = validator.validateUIPlan(uiPlan);

            if (!validation.valid) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(
                      {
                        success: false,
                        message: "Generated UI-Plan failed validation",
                        errors: validation.errors,
                        generatedPlan: uiPlan,
                        suggestion:
                          "The planner V2 generated an invalid UI-Plan. This might be due to unsupported V2 features in the current UI-Plan schema. Try simplifying the analysis or use manual UI-Plan.",
                      },
                      null,
                      2,
                    ),
                  },
                ],
                isError: true,
              };
            }

            // Extract statistics from V2 plan
            const stats = {
              entitiesCount: analysis.entities.length,
              bladesCount: uiPlan.blades.length,
              hasWorkflow: !!analysis.workflow,
              complexity: analysis.complexity,
              customActionsCount: analysis.entities.reduce(
                (acc, e) => acc + e.blades.reduce((bacc, b) => bacc + (b.actions?.length || 0), 0),
                0,
              ),
            };

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      version: "V2 (Extended)",
                      message: "Rich multi-entity UI-Plan generated successfully from V2 analysis",
                      plan: uiPlan,
                      validation: {
                        valid: true,
                      },
                      statistics: stats,
                      features: {
                        multipleEntities: stats.entitiesCount > 1,
                        workflow: stats.hasWorkflow,
                        customActions: stats.customActionsCount > 0,
                      },
                      nextSteps: [
                        "UI-Plan V2 is ready and validated",
                        "Use generate_with_composition to generate code from this plan",
                        "Or use generate_complete_module for full module generation",
                        "Note: Some advanced V2 features (workflows, custom actions) may require manual implementation",
                      ],
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      message: "Failed to generate UI-Plan from V2 analysis",
                      error: error instanceof Error ? error.message : String(error),
                      analysis,
                      suggestion:
                        "Check the V2 analysis structure. Ensure all required fields are present: moduleName, entities (array), confidence, complexity",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }
        }

        case "search_framework_apis": {
          const parsed = searchFrameworkAPIsSchema.safeParse(args || {});
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, category, type, limit, offset } = parsed.data;
          const results = frameworkSearchEngine.search({
            query,
            category,
            type,
            limit: limit || 20,
            offset: offset || 0,
          });

          // Format results
          const formatted = results
            .map((result) => {
              const parts = [
                `**${result.name}** (${result.api.type})`,
                `  Category: ${result.api.category}`,
                `  Import: ${result.api.import}`,
                `  Description: ${result.api.description}`,
              ];
              if (result.score !== undefined) {
                parts.push(`  Relevance: ${Math.abs(result.score)}`);
              }
              if (result.api.keywords && result.api.keywords.length > 0) {
                parts.push(`  Keywords: ${result.api.keywords.join(", ")}`);
              }
              return parts.join("\n");
            })
            .join("\n\n");

          return {
            content: [
              {
                type: "text",
                text: formatted || "No framework APIs found matching the criteria.",
              },
            ],
          };
        }

        case "view_framework_apis": {
          const parsed = viewFrameworkAPIsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { apis } = parsed.data;
          const results: any[] = [];

          for (const apiName of apis) {
            const api = frameworkSearchEngine.getAPI(apiName);
            if (!api) {
              results.push({
                name: apiName,
                error: `API not found: ${apiName}`,
              });
              continue;
            }

            results.push({
              name: apiName,
              import: api.import,
              type: api.type,
              category: api.category,
              description: api.description,
              keywords: api.keywords,
              methods: api.methods,
              state: api.state,
              capabilities: api.capabilities,
              examples: api.examples,
              dependencies: api.dependencies,
              relatedAPIs: api.relatedAPIs,
              requiresPlugin: api.requiresPlugin,
              requiresContext: api.requiresContext,
            });
          }

          // Format output
          const formatted = results
            .map((result) => {
              if (result.error) {
                return `## ❌ ${result.name}\n\n${result.error}`;
              }

              const parts = [
                `## ${result.name}`,
                ``,
                `**Type:** ${result.type}`,
                `**Category:** ${result.category}`,
                `**Import:** \`${result.import}\``,
                ``,
                `**Description:** ${result.description}`,
              ];

              if (result.methods && result.methods.length > 0) {
                parts.push(``, `### Methods`);
                result.methods.forEach((method: any) => {
                  parts.push(
                    ``,
                    `**${method.name}**`,
                    `- Signature: \`${method.signature}\``,
                    `- Description: ${method.description}`,
                    `- Returns: \`${method.returns}\``,
                  );
                  if (method.useCases && method.useCases.length > 0) {
                    parts.push(`- Use cases: ${method.useCases.join(", ")}`);
                  }
                });
              }

              if (result.state && result.state.length > 0) {
                parts.push(``, `### State`);
                result.state.forEach((state: any) => {
                  parts.push(`- **${state.name}**: \`${state.type}\` - ${state.description}`);
                });
              }

              if (result.capabilities) {
                const capCount = Object.keys(result.capabilities).length;
                if (capCount > 0) {
                  parts.push(``, `### Capabilities (${capCount})`);
                  Object.values(result.capabilities).forEach((cap: any) => {
                    parts.push(`- **${cap.name}** (${cap.complexity}): ${cap.description}`);
                  });
                }
              }

              if (result.examples && result.examples.length > 0) {
                parts.push(``, `### Examples`);
                result.examples.forEach((example: any, idx: number) => {
                  parts.push(
                    ``,
                    `**Example ${idx + 1}: ${example.title}**`,
                    `\`\`\`typescript`,
                    example.code,
                    `\`\`\``,
                  );
                });
              }

              if (result.relatedAPIs && result.relatedAPIs.length > 0) {
                parts.push(``, `**Related APIs:** ${result.relatedAPIs.join(", ")}`);
              }

              return parts.join("\n");
            })
            .join("\n\n---\n\n");

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        case "search_framework_by_intent": {
          const parsed = searchFrameworkByIntentSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { intent, context } = parsed.data;
          const results = frameworkSearchEngine.searchByIntent({ intent, context });

          // Format results
          const formatted = results
            .map((result, idx) => {
              const parts = [
                `${idx + 1}. **${result.name}** (Score: ${result.score})`,
                `   Type: ${result.api.type} | Category: ${result.api.category}`,
                `   Import: ${result.api.import}`,
                `   Description: ${result.api.description}`,
              ];

              if (result.method) {
                parts.push(`   Suggested method: ${result.method}()`);
              }

              if (result.capability) {
                parts.push(`   Matched capability: ${result.capability.name}`, `   ${result.capability.description}`);
              }

              return parts.join("\n");
            })
            .join("\n\n");

          return {
            content: [
              {
                type: "text",
                text: formatted || `No framework APIs found matching intent: "${intent}"`,
              },
            ],
          };
        }

        case "get_framework_capabilities": {
          const parsed = getFrameworkCapabilitiesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { api: apiName, capability: capabilityFilter, includeExamples } = parsed.data;
          const api = frameworkSearchEngine.getAPI(apiName);

          if (!api) {
            throw new Error(`Framework API not found: ${apiName}`);
          }

          if (!api.capabilities) {
            return {
              content: [
                {
                  type: "text",
                  text: `${apiName} has no documented capabilities.`,
                },
              ],
            };
          }

          const capabilities = capabilityFilter
            ? { [capabilityFilter]: api.capabilities[capabilityFilter] }
            : api.capabilities;

          if (!capabilities || Object.keys(capabilities).length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `Capability "${capabilityFilter}" not found in ${apiName}.`,
                },
              ],
            };
          }

          // Format capabilities
          const parts = [`# ${apiName} Capabilities`, ``, `**Import:** \`${api.import}\``, `**Type:** ${api.type}`, ``];

          Object.entries(capabilities).forEach(([id, cap]: [string, any]) => {
            parts.push(
              `## ${cap.name}`,
              ``,
              `**ID:** ${id}`,
              `**Type:** ${cap.type}`,
              `**Complexity:** ${cap.complexity}`,
              ``,
              `**Description:** ${cap.description}`,
              ``,
            );

            if (cap.useCases && cap.useCases.length > 0) {
              parts.push(`**Use Cases:**`);
              cap.useCases.forEach((useCase: string) => {
                parts.push(`- ${useCase}`);
              });
              parts.push(``);
            }

            // Find related examples
            if (includeExamples !== false && api.examples) {
              const relatedExamples = api.examples.filter((ex: any) => ex.method === cap.name || !ex.method);
              if (relatedExamples.length > 0) {
                parts.push(`**Examples:**`, ``);
                relatedExamples.forEach((example: any) => {
                  parts.push(`### ${example.title}`, `\`\`\`typescript`, example.code, `\`\`\``, ``);
                });
              }
            }
          });

          return {
            content: [
              {
                type: "text",
                text: parts.join("\n"),
              },
            ],
          };
        }

        case "get_framework_examples": {
          const parsed = getFrameworkExamplesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, api: apiFilter } = parsed.data;
          const allAPIs = apiFilter
            ? [frameworkSearchEngine.getAPI(apiFilter)].filter(Boolean)
            : frameworkSearchEngine.getAllAPIs();

          const matchedExamples: any[] = [];
          const queryLower = query.toLowerCase();

          for (const api of allAPIs) {
            if (!api || !api.examples) continue;

            for (const example of api.examples) {
              const titleMatch = example.title.toLowerCase().includes(queryLower);
              const codeMatch = example.code.toLowerCase().includes(queryLower);
              const methodMatch = example.method?.toLowerCase().includes(queryLower);

              if (titleMatch || codeMatch || methodMatch) {
                matchedExamples.push({
                  api: api.name,
                  import: api.import,
                  ...example,
                });
              }
            }
          }

          if (matchedExamples.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No examples found matching query: "${query}"`,
                },
              ],
            };
          }

          // Format examples
          const formatted = matchedExamples
            .map((example, idx) => {
              const parts = [
                `## Example ${idx + 1}: ${example.title}`,
                ``,
                `**API:** ${example.api}`,
                `**Import:** \`${example.import}\``,
              ];

              if (example.method) {
                parts.push(`**Method:** ${example.method}()`);
              }

              if (example.description) {
                parts.push(``, example.description);
              }

              parts.push(``, `\`\`\`typescript`, example.code, `\`\`\``);

              return parts.join("\n");
            })
            .join("\n\n---\n\n");

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      // Format error for MCP
      const errorMessage = error instanceof Error ? formatMcpError(error) : String(error);

      return {
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("VC-Shell MCP Server started");
}

/**
 * Generate fix suggestion for validation error
 */
function generateFixSuggestion(error: { path: string; message: string; severity: string }): string {
  if (error.message.includes("kebab-case")) {
    return "Use kebab-case format (e.g., 'vendor-management' instead of 'VendorManagement')";
  }

  if (error.message.includes("Route must start with")) {
    return "Add '/' at the beginning of the route (e.g., '/vendors' instead of 'vendors')";
  }

  if (error.message.includes("not found in Component Registry")) {
    return "Use only components from the VC-Shell Component Registry. Call search_components to find available components.";
  }

  if (error.message.includes("field type")) {
    return "Valid field types: VcInput, VcTextarea, VcSelect, VcCheckbox, VcSwitch, VcGallery, VcFileUpload";
  }

  if (error.message.includes("50 items")) {
    return "Reduce number of fields to maximum 50 items";
  }

  return "Review the error message and fix the plan manually";
}
