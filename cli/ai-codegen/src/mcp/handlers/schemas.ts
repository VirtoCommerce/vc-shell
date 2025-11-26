/**
 * MCP Tool Schemas Registration
 *
 * Register tool schemas with MCP server.
 * Uses existing schemas from commands/mcp/tool-schemas.ts
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

// Import all schemas
import {
  // Workflow schemas
  analyzePromptV2Schema,
  discoverComponentsAndAPIsSchema,
  createUIPlanFromAnalysisV2Schema,
  validateUIPlanSchema,
  generateWithCompositionSchema,
  generateApiClientSchema,
  submitGeneratedCodeSchema,
  getWorkflowStatusSchema,
  resetWorkflowSchema,
  startModuleWorkflowSchema,

  // Component schemas
  searchComponentsSchema,
  viewComponentsSchema,
  getComponentExamplesSchema,
  searchComponentsByIntentSchema,
  getComponentCapabilitiesSchema,

  // Framework schemas
  searchFrameworkAPIsSchema,
  viewFrameworkAPIsSchema,
  searchFrameworkByIntentSchema,
  getFrameworkCapabilitiesSchema,
  getFrameworkExamplesSchema,

  // Knowledge schemas
  getApplicableRulesSchema,
  getBestTemplateSchema,
  getRelevantPatternsSchema,

  // Utility schemas
  scaffoldAppSchema,
  generateWidgetSchema,
  checkTypesSchema,
  validateAndFixPlanSchema,
} from "../../commands/mcp/tool-schemas";

/**
 * Tool schema definitions
 */
const toolSchemas = [
  // Workflow tools (10)
  {
    name: "analyze_prompt_v2",
    description: `⚠️ STEP 1 ⚠️ Analyze user prompt and get analysis template.

**RETURNS:**
- exampleAnalysis: Ready-to-use JSON template (COPY AND MODIFY THIS!)
- analysisPrompt: Detailed instructions
- analysisSchema: JSON schema

**NEXT STEP:**
Copy exampleAnalysis from response, modify for your needs, then call:
discover_components_and_apis({ analysis: <your modified exampleAnalysis> })`,
    inputSchema: zodToJsonSchema(analyzePromptV2Schema),
  },
  {
    name: "discover_components_and_apis",
    description: `⚠️ MANDATORY SECOND STEP ⚠️ Discover available components and framework APIs based on prompt analysis. This tool MUST be called AFTER analyze_prompt_v2 and BEFORE create_ui_plan_from_analysis_v2.`,
    inputSchema: zodToJsonSchema(discoverComponentsAndAPIsSchema),
  },
  {
    name: "create_ui_plan_from_analysis_v2",
    description: "⚠️ REQUIRES DISCOVERY ⚠️ Create rich multi-entity UI-Plan from V2 analysis result. This tool can ONLY be called AFTER discover_components_and_apis.",
    inputSchema: zodToJsonSchema(createUIPlanFromAnalysisV2Schema),
  },
  {
    name: "validate_ui_plan",
    description: "Validate UI-Plan against schema and component registry. Returns validation result with errors and warnings.",
    inputSchema: zodToJsonSchema(validateUIPlanSchema),
  },
  {
    name: "generate_with_composition",
    description: `⚠️ REQUIRES VALIDATED UI-PLAN ⚠️ Generate AI instructions for Vue SFC code generation. WORKFLOW: analyze → create plan → validate → generate → **submit code**.

**🚨 CRITICAL RULES - READ BEFORE USING:**
❌ NEVER use mkdir/Write/Edit to create module files - submit_generated_code creates ALL files automatically!
❌ NEVER stop after generating ONE blade - you MUST generate ALL blades from the plan!
❌ NEVER use Read/Grep/Glob to search for examples in the filesystem!
❌ NEVER read other modules' code as examples (platform.ts, vendors.vue, etc.)!
✅ Use ONLY the returned guide and MCP tools: view_components, view_framework_apis, get_best_template
✅ Generate code as STRING → call submit_generated_code → it creates all files
✅ After submitting one blade, call generate_with_composition again for the next blade
✅ Continue until ALL blades are submitted (check progress in response)

**🚨 CRITICAL: ARTIFACT GENERATION ORDER 🚨**
The system ENFORCES this generation order:
1. **API CLIENT FIRST** - defines methods and types
2. **COMPOSABLES SECOND** - use exact method names from API client
3. **BLADES LAST** - use the ready composable interface

This order ensures type consistency! Each step reads the previous artifact.
If you request a blade but composable hasn't been submitted yet, generate composable first.

**WHAT THIS TOOL DOES:**
1. Returns structured generation guide with requirements, patterns, and constraints
2. Guide contains step-by-step instructions for synthesizing Vue SFC code
3. You MUST read the guide, generate complete Vue SFC code, then call submit_generated_code tool

**🚀 MINIMAL CONTEXT MODE (DEFAULT - optimized for Cursor):**
- Default contextLevel is now MINIMAL (~5KB) for Cursor compatibility
- Returns lightweight refs with short descriptions only
- You MUST fetch full content using MCP tools BEFORE generating code:
  * view_components({components: ["VcTable", ...]}) - for component details
  * view_framework_apis({apis: ["useBladeNavigation", ...]}) - for hook details
  * get_best_template({bladeType, features}) - for full template content
  * get_relevant_patterns({bladeType, features}) - for full pattern content
- Use contextLevel: "essential" for larger context if needed (~10KB)

**🤖 SMART DEFAULTS (Auto-optimization based on module size):**
- **Large modules (>2 blades):**
  - Auto-selects first artifact
  - artifactType='composable' (step-by-step: apiClient → composable → blade)
  - pageSize=1 (one artifact at a time)
- **Small modules (1-2 blades):**
  - artifactType='all' (faster workflow)
  - pageSize=10
- **Response includes 'nextSteps'** - exact tool calls for continuing workflow
- **Response includes 'smartDefaults'** - shows which defaults were applied

**MANUAL OVERRIDE:**
All parameters are optional - specify to override smart defaults:
- bladeId: Target specific blade
- artifactType: 'all', 'blade', 'composable', or 'apiClient'
- page/pageSize: Custom pagination

**NEXT STEP AFTER THIS TOOL:**
- Generate complete Vue SFC code based on the returned guide
- Call submit_generated_code with: { bladeId, code, context }
- MCP server will validate and save the code

🚨 CRITICAL RESTRICTIONS 🚨
❌ FORBIDDEN: NEVER use Write/Edit tools to create module files manually. ALWAYS use submit_generated_code for validation and pattern compliance.
❌ NEVER bypass submit_generated_code validation
❌ NEVER attempt manual fixes after validation errors
❌ Generate ALL features from user's prompt before reporting completion
See AI_GENERATION_RULES.md for complete restrictions.`,
    inputSchema: zodToJsonSchema(generateWithCompositionSchema),
  },
  {
    name: "generate_api_client",
    description: `⚠️ MUST BE CALLED BEFORE generate_with_composition ⚠️ Generate TypeScript API client for the module.

**WHY THIS TOOL EXISTS:**
API client MUST be generated FIRST because:
1. Composables import types from the API client
2. Blades use composables that depend on API client
3. Without API client, composables will have import errors

**WORKFLOW ORDER:**
1. analyze_prompt_v2
2. discover_components_and_apis
3. create_ui_plan_from_analysis_v2
4. validate_ui_plan
5. **generate_api_client** ← YOU ARE HERE
6. submit_generated_code (for API client)
7. generate_with_composition (for blades)
8. submit_generated_code (for each blade)

**WHAT THIS TOOL RETURNS:**
- Generation guide with entity definitions
- TypeScript code structure template
- API client target path (src/api_client/{module}.api.ts)
- Submit instructions

**AFTER GENERATING CODE:**
Call submit_generated_code with:
- bladeId: "{module}"
- code: "" (empty)
- apiClient: { name: "{module}.api.ts", code: <YOUR_CODE> }
- context: { module: "{module}", layout: "details" }`,
    inputSchema: zodToJsonSchema(generateApiClientSchema),
  },
  {
    name: "submit_generated_code",
    description: `Submit AI-generated code for validation and saving. This tool CREATES all module files automatically.

**⚠️ IMPORTANT: This tool creates ALL files - DO NOT use mkdir/Write/Edit to create module files manually!**

**WHAT THIS TOOL DOES:**
1. Validates your generated code
2. Creates module directory structure (src/modules/{module}/)
3. Writes blade .vue files to pages/
4. Writes composable .ts files to composables/
5. Writes API client to api_client/
6. Merges locale translations into en.json

**VALIDATION PROTOCOL:**
- The system will validate the code and allow up to 3 retry attempts
- If validation fails (retry < 3): Read errors, re-generate code addressing issues, submit again with incremented retry.attempt
- If validation fails 3 times: STOP, generate error report, ask user for guidance

**ERROR REPORT REQUIRED AFTER 3 FAILURES:**
Generate detailed report with:
- Module/blade information
- All validation errors
- Root cause analysis
- Attempted solutions for each retry
- Recommendations for user
- Workflow state summary

**🌐 LOCALE GENERATION (CRITICAL FOR BLADES!):**
When submitting blade code, you MUST include the 'locale' parameter with JSON containing ALL $t() keys used in the blade:
\`\`\`json
{
  "MODULE_NAME": {
    "PAGES": {
      "LIST|DETAILS": {
        "TITLE": "...",
        "SUBTITLE": "...",
        "SECTIONS": { "SECTION_NAME": "..." },
        "FIELDS": { "FIELD_NAME": { "LABEL": "...", "PLACEHOLDER": "..." } },
        "ACTIONS": { "SAVE": "Save", "DELETE": "Delete", ... }
      }
    }
  }
}
\`\`\`
Missing locale keys cause runtime errors! The system will merge your locale into existing en.json.

🚨 CRITICAL: After 3 failed retries, you MUST stop and generate error report. DO NOT attempt manual fixes with Write/Edit tools.

See AI_GENERATION_RULES.md for complete error handling protocol.`,
    inputSchema: zodToJsonSchema(submitGeneratedCodeSchema),
  },
  {
    name: "get_workflow_status",
    description: "Get current workflow status and next required step. Use this to check what step you're on and what to do next.",
    inputSchema: zodToJsonSchema(getWorkflowStatusSchema),
  },
  {
    name: "reset_workflow",
    description: "Reset workflow state to initial. Use this when the workflow is stuck or when you want to start generating a new module from scratch.",
    inputSchema: zodToJsonSchema(resetWorkflowSchema),
  },
  {
    name: "start_module_workflow",
    description: "RECOMMENDED STARTING POINT: Use this tool to start a complete guided workflow for module generation. It will orchestrate all steps automatically.",
    inputSchema: zodToJsonSchema(startModuleWorkflowSchema),
  },

  // Component tools (5)
  {
    name: "search_components",
    description: "Search for VC-Shell components with optional fuzzy matching. Supports pagination and filtering.",
    inputSchema: zodToJsonSchema(searchComponentsSchema),
  },
  {
    name: "view_components",
    description: "Get detailed information about one or more components including props, events, slots, examples, and dependencies.",
    inputSchema: zodToJsonSchema(viewComponentsSchema),
  },
  {
    name: "get_component_examples",
    description: "Search for component examples and demos. Returns full code examples from demo files.",
    inputSchema: zodToJsonSchema(getComponentExamplesSchema),
  },
  {
    name: "search_components_by_intent",
    description: "Semantic search for components based on user intent. Returns components with relevant capabilities ranked by relevance.",
    inputSchema: zodToJsonSchema(searchComponentsByIntentSchema),
  },
  {
    name: "get_component_capabilities",
    description: "Get all capabilities of a component with examples. Returns detailed information about props, slots, events, features, and patterns.",
    inputSchema: zodToJsonSchema(getComponentCapabilitiesSchema),
  },

  // Framework tools (5)
  {
    name: "search_framework_apis",
    description: "Search for VC-Shell framework composables, plugins, and utilities with fuzzy matching. Find APIs by name, keywords, category, or type.",
    inputSchema: zodToJsonSchema(searchFrameworkAPIsSchema),
  },
  {
    name: "view_framework_apis",
    description: "Get detailed information about framework composables/plugins/utilities including methods, state, capabilities, examples, and usage.",
    inputSchema: zodToJsonSchema(viewFrameworkAPIsSchema),
  },
  {
    name: "search_framework_by_intent",
    description: "Find framework APIs based on user intent using semantic search. Returns top 5 most relevant APIs with matched capabilities.",
    inputSchema: zodToJsonSchema(searchFrameworkByIntentSchema),
  },
  {
    name: "get_framework_capabilities",
    description: "Get detailed capability information for a framework API. Shows what the API can do, when to use it, complexity level, and complete working examples.",
    inputSchema: zodToJsonSchema(getFrameworkCapabilitiesSchema),
  },
  {
    name: "get_framework_examples",
    description: "Search for framework API code examples. Returns complete working code snippets filtered by query and API name.",
    inputSchema: zodToJsonSchema(getFrameworkExamplesSchema),
  },

  // Knowledge tools (3)
  {
    name: "get_applicable_rules",
    description: "Get applicable rules for a blade with full context. Returns critical rules with complete YAML content including forbidden/required patterns and examples.",
    inputSchema: zodToJsonSchema(getApplicableRulesSchema),
  },
  {
    name: "get_best_template",
    description: "Get best matching production-ready Vue SFC template. Returns full .vue file content for list or details blades with features like filters, multiselect, validation, etc.",
    inputSchema: zodToJsonSchema(getBestTemplateSchema),
  },
  {
    name: "get_relevant_patterns",
    description: "Get relevant architectural patterns and examples for blade context. Returns full markdown content for patterns like workspace-blade, module-registration, etc.",
    inputSchema: zodToJsonSchema(getRelevantPatternsSchema),
  },

  // Utility tools (4)
  {
    name: "scaffold_app",
    description: "Create a new VC-Shell application from scratch using create-vc-app. IMPORTANT: Always use this tool (NOT bash/npx) when user asks to 'create new app'.",
    inputSchema: zodToJsonSchema(scaffoldAppSchema),
  },
  {
    name: "generate_widget",
    description: `Generate a widget component using create-vc-app CLI. PREFERRED method for widget creation.

**WHAT THIS TOOL DOES AUTOMATICALLY:**
- Creates widget Vue component in components/widgets/{widget-name}/
- Creates index.ts export
- Auto-adds import to parent blade: import { YourWidget } from "../components/widgets"
- Auto-adds useWidgets() and useBlade() setup
- Auto-creates registerWidget() function with proper props
- Auto-adds onBeforeUnmount cleanup with unregisterWidget()
- Auto-adds locale translations (WIDGETS.{WIDGET_NAME}.TITLE)

**WHY USE THIS TOOL:**
- Handles all boilerplate automatically
- Ensures proper widget lifecycle (register/unregister)
- No missing imports or forgotten cleanup
- Faster than manual creation

**MANUAL ALTERNATIVE:**
If you need to create widgets manually (e.g., tool fails, special requirements), use useWidgets() pattern:
- Import useWidgets, useBlade from @vc-shell/framework
- Call registerWidget() immediately after setup (NOT in onMounted)
- Use computed() for reactive props
- Always cleanup with unregisterWidget() in onBeforeUnmount
- See rule "16-widget-generation" for complete pattern

**EXAMPLE:**
generate_widget({
  cwd: "/path/to/app",
  module: "offers",
  blade: "offer-details",
  widgetName: "SpecialPrices",
  entityName: "Offer"
})`,
    inputSchema: zodToJsonSchema(generateWidgetSchema),
  },
  {
    name: "check_types",
    description: "Run vue-tsc type checking on the project to find TypeScript/Vue type errors. Returns list of errors with file paths and line numbers.",
    inputSchema: zodToJsonSchema(checkTypesSchema),
  },
  {
    name: "validate_and_fix_plan",
    description: "Validate UI-Plan and suggest fixes for errors. Returns fixed plan if validation fails.",
    inputSchema: zodToJsonSchema(validateAndFixPlanSchema),
  },
];

/**
 * Register tool schemas with MCP server
 */
export function registerToolSchemas(server: Server): void {
  console.error("[MCP Schemas] Registering 28 tool schemas...");

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolSchemas,
    };
  });

  console.error("[MCP Schemas] ✓ All 28 tool schemas registered");
}

/**
 * Get schema count by category
 */
export function getSchemaStats() {
  const categories = {
    workflow: toolSchemas.filter((t) =>
      ["analyze", "discover", "create_ui_plan", "validate", "generate", "submit", "workflow", "reset", "start_module"].some((k) => t.name.includes(k))
    ).length,
    components: toolSchemas.filter((t) => t.name.includes("component")).length,
    framework: toolSchemas.filter((t) => t.name.includes("framework")).length,
    knowledge: toolSchemas.filter((t) =>
      ["rules", "template", "patterns"].some((k) => t.name.includes(k))
    ).length,
    utilities: toolSchemas.filter((t) =>
      ["scaffold", "widget", "check_types", "validate_and_fix"].some((k) => t.name.includes(k))
    ).length,
  };

  return {
    ...categories,
    total: toolSchemas.length,
  };
}
