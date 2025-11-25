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
  // Workflow tools (9)
  {
    name: "analyze_prompt_v2",
    description: "⚠️ MANDATORY FIRST STEP ⚠️ Analyze user prompt to extract entities, relationships, workflows, custom routes/actions/permissions, and features. Returns comprehensive analysis with schema. ALL module generation workflows MUST start with this tool.",
    inputSchema: zodToJsonSchema(analyzePromptV2Schema),
  },
  {
    name: "discover_components_and_apis",
    description: "⚠️ MANDATORY SECOND STEP ⚠️ Discover available components and framework APIs based on prompt analysis. This tool MUST be called AFTER analyze_prompt_v2 and BEFORE create_ui_plan_from_analysis_v2.",
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

**WHAT THIS TOOL DOES:**
1. Returns structured generation guide with requirements, patterns, and constraints
2. Guide contains step-by-step instructions for synthesizing Vue SFC code
3. You MUST read the guide, generate complete Vue SFC code, then call submit_generated_code tool

**🚀 LAZY LOADING MODE (New!):**
- This tool now returns LIGHTWEIGHT guides with only metadata (IDs, names, descriptions)
- NO full content for templates, patterns, examples
- You MUST fetch full content using MCP tools BEFORE generating code:
  * view_components({components: ["VcTable", ...]}) - for component details
  * view_framework_apis({apis: ["useBladeNavigation", ...]}) - for hook details
  * get_best_template({bladeType, features}) - for full template content
  * get_relevant_patterns({bladeType, features}) - for full pattern content

**🤖 SMART DEFAULTS (Auto-optimization based on module size):**
- **Large modules (>2 blades):**
  - Auto-selects first blade
  - artifactType='blade' (step-by-step: blade → composable → apiClient)
  - pageSize=1 (one blade at a time)
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
    name: "submit_generated_code",
    description: `Submit AI-generated code for validation and saving. Use this tool when you have generated Vue SFC code following a generation guide.

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
    description: "Generate a widget component using create-vc-app CLI. Widgets are self-contained Vue components that can be embedded in blade details pages.",
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
  console.error("[MCP Schemas] Registering 26 tool schemas...");

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolSchemas,
    };
  });

  console.error("[MCP Schemas] ✓ All 26 tool schemas registered");
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
