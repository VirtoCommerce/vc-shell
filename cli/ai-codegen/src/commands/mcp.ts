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
  type Component,
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
      version: "0.5.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
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
  const registry: Record<string, Component> = JSON.parse(
    fs.readFileSync(registryPath, "utf-8")
  );

  // Initialize search engine
  const searchEngine = new SearchEngine(registry);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "validate_ui_plan",
          description:
            "Validate a UI-Plan JSON against the VC-Shell schema and component registry",
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
          description:
            "Search for component examples and demos. Returns full code examples from demo files.",
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
            "Create a new VC-Shell application from scratch using create-vc-app. This initializes a complete project structure with TypeScript, Vue 3, and all necessary dependencies.",
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
            "Generate complete module from UI-Plan. All files created automatically including blades, composables, locales, and registration in main.ts. This is the PRIMARY tool for module generation - use this instead of manual template adaptation.",
          inputSchema: zodToJsonSchema(generateCompleteModuleSchema),
        },
        {
          name: "validate_and_fix_plan",
          description:
            "Validate UI-Plan and suggest fixes for errors. Returns fixed plan if validation fails.",
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
            "Generate complete module using smart strategy selection (template/composition/ai-full). This is the ENHANCED version of generate_complete_module with AI-driven pattern composition. Automatically selects optimal generation strategy based on complexity analysis.",
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
          description: "Reusable Vue components for table slots and blade composition (status-badge, image-grid, actions-dropdown, widget-container)",
          mimeType: "application/json",
        },
        {
          uri: "vcshell://generation-rules",
          name: "Code Generation Rules",
          description: "Complete rules for AI code generation including blade structure, naming conventions, i18n patterns, composition patterns, and validation rules",
          mimeType: "application/json",
        },
        {
          uri: "vcshell://composition-guide",
          name: "Pattern Composition Guide",
          description: "Guide for composing blades from patterns using AI. Explains pattern selection, composition strategies, and generation workflows",
          mimeType: "text/markdown",
        },
        {
          uri: "vcshell://logic-patterns",
          name: "Common Logic Patterns",
          description: "Common blade logic patterns (handlers, toolbar, state) for list and details blades with various features",
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
        const slotComponents = registry._slotComponents?.components || [];
        const componentsPath = path.join(examplesPath, "components");
        
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

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                description: "Reusable components for custom table slots and blade composition",
                components: componentsData,
              }, null, 2),
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
                onItemClick: "openBlade({blade: markRaw(EntityDetails), param: item.id, onOpen: () => { selectedItemId.value = item.id }, onClose: () => { selectedItemId.value = undefined; load() }})",
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
                { id: "delete-selected", icon: "fas fa-trash", action: "deleteSelectedItems()", condition: "selectedItems.value.length > 0" },
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
                  2
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
            throw componentNotFoundError(
              components.join(", "),
              availableComponents
            );
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
              const templateInfo = templates.find((t: any) => t.file === `templates/${file}`);
              
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
                    2
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
            
            const result = await execa("npx", [
              "@vc-shell/create-vc-app@latest",
              projectName,
              "--skip-module-gen",
              "--overwrite"
            ], {
              cwd: targetDir,
              stdio: "pipe",
            });

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
                        `npm install`,
                        `npm run dev`,
                        ``,
                        `Then use AI to generate modules:`,
                        `"Create vendor management module with list and details"`,
                      ],
                    },
                    null,
                    2
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
                    2
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
          const templateInfo = templates.find((t: any) => t.id === templateKey);

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
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          // Generate module
          const generator = new UnifiedCodeGenerator();
          const result = await generator.generateModule(plan as ValidatorUIPlan, cwd, {
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
                      module: (plan as ValidatorUIPlan).module,
                      blades: result.summary.blades,
                      composables: result.summary.composables,
                      locales: result.summary.locales,
                      registered: result.summary.registered,
                      totalFiles: result.files.length,
                      mode: result.summary.mode || mode,
                    },
                    files: result.files.map(f => ({
                      path: f.path.replace(cwd, ""),
                      lines: f.lines,
                    })),
                    dryRun: dryRun || false,
                  },
                  null,
                  2
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
                      message: changes.length > 0
                        ? "UI-Plan fixed and validated successfully"
                        : "UI-Plan is valid, no fixes needed",
                      plan: normalizedPlan,
                      changes,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          // Generate suggested fixes for remaining errors
          const fixes = validation.errors.map(error => ({
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
                  2
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
                  2
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
            const capabilities = (component as any).capabilities || {};
            for (const [capId, capability] of Object.entries(capabilities)) {
              const capText = `${capability.name} ${capability.description} ${capability.useCases?.join(" ")}`.toLowerCase();

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
                  2
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
            for (const [capId, cap] of Object.entries(capabilities as any)) {
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
                  2
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

          const { plan, cwd, strategy, dryRun } = parsed.data;

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
                    2
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
              blade.logic = logicPlanner.inferLogic(blade as any);
            }
            if (!blade.composable) {
              blade.composable = logicPlanner.inferComposable(blade as any);
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
              const mockContext = {
                type: firstBlade.layout === "grid" ? "list" : "details",
                features: firstBlade.features || [],
                blade: firstBlade,
                columns: firstBlade.components?.find(c => c.type === "VcTable")?.columns,
                fields: firstBlade.components?.find(c => c.type === "VcForm")?.fields,
                naming: {
                  entitySingularCamel: validatedPlan.module,
                  entitySingularPascal: validatedPlan.module.charAt(0).toUpperCase() + validatedPlan.module.slice(1),
                },
                logic: firstBlade.logic,
              } as any;

              decision = await smartGen.decide(mockContext);
              selectedStrategy = decision.strategy;
            } else {
              selectedStrategy = GenerationStrategy.TEMPLATE;
            }
          }

          // Generate module
          const generator = new UnifiedCodeGenerator();
          const result = await generator.generateModule(validatedPlan, cwd, {
            writeToDisk: !dryRun,
            dryRun,
            mode: selectedStrategy === GenerationStrategy.AI_FULL ? "ai-first" :
                  selectedStrategy === GenerationStrategy.COMPOSITION ? "auto" : "template",
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
                    decision: decision ? {
                      reason: decision.reason,
                      complexity: decision.complexity,
                      estimatedTime: decision.estimatedTime,
                      willUseFallback: decision.willUseFallback,
                    } : undefined,
                    summary: {
                      module: validatedPlan.module,
                      blades: result.summary.blades,
                      composables: result.summary.composables,
                      locales: result.summary.locales,
                      registered: result.summary.registered,
                      totalFiles: result.files.length,
                      logicInferred: validatedPlan.blades.every(b => b.logic),
                    },
                    files: result.files.map(f => ({
                      path: f.path.replace(cwd, ""),
                      lines: f.lines,
                    })),
                    dryRun: dryRun || false,
                  },
                  null,
                  2
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
          const inferred = planner.inferLogic(blade as any as Blade);
          const composable = planner.inferComposable(blade as any as Blade);

          // Merge with existing if requested
          const finalLogic = merge && (blade as any).logic
            ? planner.mergeLogic(inferred, (blade as any).logic)
            : inferred;

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
                    merged: merge && !!(blade as any).logic,
                  },
                  null,
                  2
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
            features: features || [],
            blade: {
              id: `example-${type}`,
              layout: type === "list" ? "grid" : "details",
              features: features || [],
            } as any,
          } as any;

          const patterns = (composer as any).selectPatterns(mockContext);
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

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      // Format error for MCP
      const errorMessage =
        error instanceof Error ? formatMcpError(error) : String(error);

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
