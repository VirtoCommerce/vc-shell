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

// ✅ Import from refactored modules
import {
  searchComponentsSchema,
  viewComponentsSchema,
  getComponentExamplesSchema,
  scaffoldAppSchema,
  validateUIPlanSchema,
  generateCompleteModuleSchema,
  validateAndFixPlanSchema,
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
  checkTypesSchema,
  getWorkflowStatusSchema,
  resetWorkflowSchema,
  startModuleWorkflowSchema,
  // NEW: Transparent tools for rules, templates, patterns
  getApplicableRulesSchema,
  getBestTemplateSchema,
  getRelevantPatternsSchema,
} from "./mcp/tool-schemas.js";

import { type Component, type ComponentRegistry, type FrameworkRegistry } from "../schemas/zod-schemas.js";

import { RegistryLoader } from "./mcp/registry-loader.js";
import { getResourceDefinitions, readResource } from "./mcp/resources.js";
import { MCPMetricsTracker } from "./mcp/mcp-metrics.js";
import { formatMultipleComponentDetails, formatSearchResults, formatMcpError } from "../utils/formatters.js";
import { globalWorkflow } from "./mcp/workflow-orchestrator.js";
import { generateMinimalAuditChecklist } from "../utils/audit-checklist.js";
import { componentNotFoundError } from "../utils/errors.js";
import { UnifiedCodeGenerator } from "../core/unified-generator.js";
import type { UIPlan as ValidatorUIPlan, Blade } from "../core/validator.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import { LogicPlanner, type BladeLogic } from "../core/logic-planner.js";
import { BladeComposer } from "../core/blade-composer.js";
import { SmartCodeGenerator } from "../core/smart-generator.js";
import { getGenerationRulesProvider } from "../core/generation-rules.js";
import { autoFixUIPlan } from "../utils/ui-plan-fixer.js";
import { CodeValidator, type ValidationError } from "../core/code-validator.js";
import { LLMFeedbackFormatter } from "../core/llm-feedback.js";
import { PlannerV2 } from "../core/planner-v2.js";
import { CodeGenerator } from "../core/code-generator.js";
import { buildAnalysisPromptV2, getPromptAnalysisSchemaV2 } from "../core/prompt-analyzer-v2.js";
import type { Column, Field } from "../core/template-adapter.js";
import { camelCase, kebabCase, upperFirst } from "lodash-es";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeBladeLogic = (logic?: Blade["logic"]): BladeLogic | undefined => {
  if (!logic) return undefined;

  return {
    handlers: logic.handlers || {},
    toolbar: (logic.toolbar || []).map((action) => ({
      ...action,
      icon: action.icon || "",
    })),
    state: logic.state || {},
  } as BladeLogic;
};

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

  // ✅ Use RegistryLoader for loading registries
  const rootPath = __dirname.includes("/dist") ? __dirname : path.join(__dirname, "..");
  const registryLoader = new RegistryLoader({ rootPath });

  // Load unified component registry with capabilities
  const registry: ComponentRegistry = registryLoader.loadComponentRegistry();

  // Initialize search engine
  const searchEngine = new SearchEngine(registry);

  // Load framework API registry
  const frameworkRegistry: FrameworkRegistry = registryLoader.loadFrameworkRegistry();

  // Initialize framework search engine
  const frameworkSearchEngine = new FrameworkAPISearchEngine(frameworkRegistry);

  // Get examples path for tool handlers (still needed for component examples, templates, etc.)
  const examplesPath = path.join(rootPath, "src", "examples");

  // ✅ Initialize MCP Metrics Tracker
  // Enable debug mode by default (always log to file)
  const debugMode = process.env.DEBUG_MCP !== "false"; // Default: true
  const metricsTracker = new MCPMetricsTracker(debugMode);
  const metricsFile = process.env.MCP_METRICS_FILE || path.join(__dirname, "..", "..", ".mcp-metrics.json");
  const debugLogFile = process.env.MCP_DEBUG_LOG || "/tmp/mcp-debug.log";

  // Helper function for debug logging (writes to both stderr and file)
  const debugLog = (...args: any[]) => {
    if (debugMode) {
      const message = `[MCP DEBUG ${new Date().toISOString()}] ${args.join(" ")}`;
      console.error(message);

      // Also write to file if specified
      if (debugLogFile) {
        try {
          fs.appendFileSync(debugLogFile, message + "\n");
        } catch (err) {
          console.error(`Failed to write to debug log: ${err}`);
        }
      }
    }
  };

  if (debugMode) {
    debugLog("Debug mode enabled");
    if (metricsFile) {
      debugLog(`Metrics will be saved to: ${metricsFile}`);
    }
    if (debugLogFile) {
      debugLog(`Debug logs will be written to: ${debugLogFile}`);
      // Clear previous log on startup
      try {
        fs.writeFileSync(debugLogFile, `=== MCP Debug Session Started at ${new Date().toISOString()} ===\n`);
      } catch (err) {
        console.error(`Failed to initialize debug log: ${err}`);
      }
    }
  }

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
          name: "generate_complete_module",
          description:
            "⚠️ REQUIRES VALIDATED UI-PLAN ⚠️ This tool generates AI INSTRUCTION GUIDES only (AI_FULL strategy), NOT actual code files. It creates detailed per-blade guides that AI must follow to manually write code. WORKFLOW REQUIREMENT: Can only be called after UI-Plan has been created and validated (steps: analyze → create plan → validate). Attempting to use without validated plan will result in workflow violation.",
          inputSchema: zodToJsonSchema(generateCompleteModuleSchema),
        },
        {
          name: "validate_and_fix_plan",
          description: "Validate UI-Plan and suggest fixes for errors. Returns fixed plan if validation fails.",
          inputSchema: zodToJsonSchema(validateAndFixPlanSchema),
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
            "⚠️ REQUIRES VALIDATED UI-PLAN ⚠️ Generate AI instructions for Vue SFC code generation (AI_FULL strategy). WORKFLOW: analyze → create plan → validate → generate → **submit code**.\n\n" +
            "**WHAT THIS TOOL DOES:**\n" +
            "1. Returns structured generation guide with requirements, patterns, and constraints\n" +
            "2. Guide contains step-by-step instructions for synthesizing Vue SFC code\n" +
            "3. You MUST read the guide, generate complete Vue SFC code, then call submit_generated_code tool\n\n" +
            "**NEXT STEP AFTER THIS TOOL:**\n" +
            "- Generate complete Vue SFC code based on the returned guide\n" +
            "- Call submit_generated_code with: { bladeId, code, context }\n" +
            "- MCP server will validate and save the code\n\n" +
            "❌ FORBIDDEN: NEVER use Write/Edit tools to create module files manually. ALWAYS use submit_generated_code for validation and pattern compliance.",
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
            "Submit AI-generated code for validation and saving. Use this tool when you have generated Vue SFC code following a generation guide (AI_GUIDED or AI_FULL strategy). The system will validate the code, provide detailed feedback if there are errors, and allow up to 3 retry attempts. If validation fails after 3 attempts, the system will fall back to composition strategy.\n\n❌ FORBIDDEN: NEVER write code directly to files using Write/Edit tools. ALWAYS use this tool to submit code. This ensures validation, type checking, and pattern compliance.",
          inputSchema: zodToJsonSchema(submitGeneratedCodeSchema),
        },
        {
          name: "check_types",
          description:
            "Run vue-tsc type checking on the project to find TypeScript/Vue type errors. Returns list of errors with file paths and line numbers. Use this after code generation to ensure type safety. Optionally can attempt to auto-fix common errors.",
          inputSchema: zodToJsonSchema(checkTypesSchema),
        },
        {
          name: "analyze_prompt_v2",
          description:
            "⚠️ MANDATORY FIRST STEP ⚠️ This tool MUST be used before creating any UI-Plan. It performs deep analysis of user prompts to extract entities, relationships, workflows, custom routes/actions/permissions, and features. Returns comprehensive analysis with schema. ALL module generation workflows MUST start with this tool. Skipping this step will result in workflow violation errors.",
          inputSchema: zodToJsonSchema(analyzePromptV2Schema),
        },
        {
          name: "create_ui_plan_from_analysis_v2",
          description:
            "⚠️ REQUIRES ANALYSIS ⚠️ Create rich multi-entity UI-Plan from V2 analysis result. This tool can ONLY be called AFTER analyze_prompt_v2. It converts deep prompt analysis into a validated UI-Plan with multiple entities, custom routes/permissions/actions, dashboard/wizard blades, workflows, and 40+ features. Attempting to use this without prior analysis will result in workflow violation.",
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
        {
          name: "get_workflow_status",
          description:
            "Get current workflow status and next required step. Use this to check what step you're on and what to do next. The workflow enforces: 1) analyze_prompt_v2 (MANDATORY) → 2) create_ui_plan_from_analysis_v2 → 3) validate_ui_plan → 4) generate_with_composition → 5) submit_generated_code.",
          inputSchema: zodToJsonSchema(getWorkflowStatusSchema),
        },
        {
          name: "reset_workflow",
          description:
            "Reset workflow state to initial. Use this when the workflow is stuck, encounters errors, or when you want to start generating a new module from scratch. This clears all workflow state including analysis, plan, and generated guides.",
          inputSchema: zodToJsonSchema(resetWorkflowSchema),
        },
        {
          name: "start_module_workflow",
          description:
            "RECOMMENDED STARTING POINT: Use this tool to start a complete guided workflow for module generation. It will orchestrate all steps automatically: prompt analysis → UI-Plan creation → validation → guide generation. This ensures you follow the correct sequence and don't skip mandatory steps like prompt analysis.",
          inputSchema: zodToJsonSchema(startModuleWorkflowSchema),
        },
        // ====================================================================
        // NEW TRANSPARENT TOOLS - Rules, Templates, Patterns
        // ====================================================================
        {
          name: "get_applicable_rules",
          description:
            "Get applicable rules for a blade with full context. Returns critical rules (e.g., workspace blade menu items, module registration, form validation) with complete YAML content including forbidden/required patterns, correct/wrong examples, and instructions. Replaces implicit rule embedding with explicit MCP tool call for transparency.",
          inputSchema: zodToJsonSchema(getApplicableRulesSchema),
        },
        {
          name: "get_best_template",
          description:
            "Get best matching production-ready Vue SFC template. Returns full .vue file content for list or details blades with features like filters, multiselect, validation, gallery, widgets, etc. Templates are organized by complexity (simple ~150 lines, moderate ~250-300 lines, complex ~300-400+ lines). Use this to get complete working code as a starting point.",
          inputSchema: zodToJsonSchema(getBestTemplateSchema),
        },
        {
          name: "get_relevant_patterns",
          description:
            "Get relevant architectural patterns and examples for blade context. Returns full markdown content for patterns like workspace-blade.md, module-registration.md, parent-child-communication.md, error-handling.md, etc. Patterns are organized by category (architectural, blade-specific, communication, component-usage, best-practice). Use this to understand how to implement specific features correctly.",
          inputSchema: zodToJsonSchema(getRelevantPatternsSchema),
        },
      ],
    };
  });

  // ✅ List available resources using getResourceDefinitions()
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resourceDefinitions = getResourceDefinitions(rootPath);
    return {
      resources: resourceDefinitions,
    };
  });

  // ✅ Read resource content using readResource()
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    try {
      // Prepare context for dynamic resources
      const { getGenerationRulesProvider } = await import("../core/generation-rules.js");
      const resourceContext = {
        registry,
        buildAnalysisPromptV2,
        getPromptAnalysisSchemaV2,
        getGenerationRulesProvider,
      };

      // Get resource content
      const content = await readResource(uri, rootPath, resourceContext);

      // Determine MIME type from resource definitions
      const resourceDef = getResourceDefinitions(rootPath).find((r) => r.uri === uri);
      const mimeType = resourceDef?.mimeType || "text/plain";

      return {
        contents: [
          {
            uri,
            mimeType,
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    debugLog(`\n${"=".repeat(60)}`);
    debugLog(`Tool call: ${name}`);
    if (args && Object.keys(args).length > 0) {
      debugLog(`Arguments:`, JSON.stringify(args, null, 2));
    }
    debugLog(`${"=".repeat(60)}`);

    // ✅ Check workflow before executing tool
    const workflowCheck = globalWorkflow.canExecuteTool(name);
    if (!workflowCheck.allowed) {
      const currentState = globalWorkflow.getState();
      debugLog(`Workflow blocked: ${name} at step ${currentState.step}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: "Workflow violation",
                tool: name,
                currentStep: currentState.step,
                reason: workflowCheck.reason,
                nextStep: workflowCheck.nextStep || currentState.nextStep,
                suggestion:
                  "You MUST follow the correct workflow sequence:\n" +
                  "1. analyze_prompt_v2 (MANDATORY FIRST STEP)\n" +
                  "2. create_ui_plan_from_analysis_v2\n" +
                  "3. validate_ui_plan or validate_and_fix_plan\n" +
                  "4. generate_with_composition\n" +
                  "5. submit_generated_code\n\n" +
                  "Use get_workflow_status to see current state, or use start_module_workflow for guided experience.",
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    // ✅ Track tool call start
    const startTime = metricsTracker.startToolCall(name, args);

    // Helper to track success and return result
    const trackSuccess = <T extends Record<string, any>>(result: T): T => {
      metricsTracker.endToolCall(name, startTime, true);
      debugLog(`✓ Tool completed successfully: ${name}`);

      // ✅ Update workflow state after successful tool execution
      // 🔥 Don't update workflow state if result is an error
      if (!result.isError) {
        globalWorkflow.updateState(name, result);
      }
      return result;
    };

    try {
      switch (name) {
        case "validate_ui_plan": {
          const parsed = validateUIPlanSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          // Parse plan if it's a string (MCP protocol may send JSON objects as strings)
          const plan = typeof parsed.data.plan === 'string' ? JSON.parse(parsed.data.plan) : parsed.data.plan;

          const validator = new Validator();
          const validationResult = validator.validateUIPlan(plan);

          return trackSuccess({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    valid: validationResult.valid,
                    message: validationResult.valid ? "UI-Plan is valid" : "UI-Plan has validation errors",
                    errors: validationResult.errors || undefined,
                    plan: plan, // Include plan in result for workflow state
                  },
                  null,
                  2,
                ),
              },
            ],
          });
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

          return trackSuccess({
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          });
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
              [
                "tsx",
                path.resolve(__dirname, "..", "..", "create-vc-app", "src", "index.ts"),
                projectName,
                "--skip-module-gen",
                "--overwrite",
              ],
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

        case "generate_complete_module": {
          const parsed = generateCompleteModuleSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          // Parse plan if it's a string (MCP protocol may send JSON objects as strings)
          const plan = typeof parsed.data.plan === 'string' ? JSON.parse(parsed.data.plan) : parsed.data.plan;
          const { cwd, dryRun, mode } = parsed.data;

          // Validate plan first
          const validator = new Validator();
          const validation = validator.validateUIPlan(plan);

          if (!validation.valid) {
            return trackSuccess({
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
            });
          }

          // Generate module
          const validatedPlan = plan as unknown as ValidatorUIPlan;
          const generator = new UnifiedCodeGenerator();
          const generateResult = await generator.generateModule(validatedPlan, cwd, {
            writeToDisk: !dryRun,
            dryRun,
            mode,
          });

          return trackSuccess({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Module generated successfully`,
                    summary: {
                      module: validatedPlan.module,
                      blades: generateResult.summary.blades,
                      composables: generateResult.summary.composables,
                      locales: generateResult.summary.locales,
                      registered: generateResult.summary.registered,
                      totalFiles: generateResult.files.length,
                      mode: generateResult.summary.mode || mode,
                    },
                    files: generateResult.files.map((f) => ({
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
          });
        }

        case "validate_and_fix_plan": {
          const parsed = validateAndFixPlanSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          // Parse plan if it's a string (MCP protocol may send JSON objects as strings)
          const plan = typeof parsed.data.plan === 'string' ? JSON.parse(parsed.data.plan) : parsed.data.plan;
          const validator = new Validator();

          // First, normalize the plan (auto-fix id → key, width, etc.)
          const { plan: normalizedPlan, changes } = validator.normalizePlan(plan);

          // Then validate normalized plan
          const validation = validator.validateUIPlan(normalizedPlan);

          if (validation.valid) {
            return trackSuccess({
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
            });
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

          const componentData: Component = registry[component] as Component;
          let capabilities: Record<string, any> = { ...(componentData as any).capabilities };

          // Filter by specific capability if requested
          if (capability) {
            capabilities = { [capability]: capabilities[capability] };
            if (!capabilities[capability]) {
              throw new Error(`Capability ${capability} not found for ${component}`);
            }
          }

          // Load examples if requested
          if (includeExamples) {
            for (const [capId, cap] of Object.entries(capabilities) as [string, any][]) {
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
          // Debug: Log what we actually received
          debugLog(`generate_with_composition args type: ${typeof args}`);
          debugLog(`args.plan type: ${typeof args?.plan}`);
          if (typeof args?.plan === 'string') {
            debugLog(`args.plan is STRING: ${args.plan.substring(0, 100)}...`);
          }

          const parsed = generateWithCompositionSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const parsedData = parsed.data as { plan?: any; cwd: string; dryRun?: boolean; strategy?: "ai-full"; bladeId?: string };
          const { plan: rawPlan, cwd, dryRun, bladeId } = parsedData;

          // Debug: Log what zod returned
          debugLog(`After zod parse, rawPlan type: ${typeof rawPlan}`);

          // Parse plan if it's a string (MCP sends JSON as string)
          // If plan is not provided, get it from workflow state
          let plan = rawPlan
            ? (typeof rawPlan === 'string' ? JSON.parse(rawPlan) : rawPlan)
            : globalWorkflow.getState().plan;

          // Check if plan is available
          if (!plan) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "No UI-Plan available",
                      reason: "Plan was not provided in arguments and not found in workflow state",
                      suggestion:
                        "You must either:\n" +
                        "1. Provide the plan in the 'plan' parameter, OR\n" +
                        "2. Complete the workflow steps first: analyze_prompt_v2 → create_ui_plan_from_analysis_v2 → validate_ui_plan\n\n" +
                        "Use get_workflow_status to check current workflow state.",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          // Auto-fix common UI-Plan errors
          const fixResult = autoFixUIPlan(plan);
          if (fixResult.fixed) {
            console.error(`\n🔧 Auto-fixed ${fixResult.changes.length} UI-Plan issues:`);
            fixResult.changes.forEach((change) => console.error(`   - ${change}`));
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
                        "Auto-fix attempted but validation still failed. Common issues:\\n" +
                        "1. module must be STRING in kebab-case, not object\\n" +
                        "2. components must have 'type' field, not 'name' or 'component'\\n" +
                        "3. route is REQUIRED for each blade\\n" +
                        "4. state values must be OBJECTS with {source, reactive}, not strings\\n" +
                        "5. toolbar must have 'action' field, not 'onClick' or 'handler'\\n" +
                        "6. features can only be: filters, multiselect, validation, gallery, widgets\\n\\n" +
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

          const validatedPlan = plan as unknown as ValidatorUIPlan;
          const smartGen = new SmartCodeGenerator();
          const logicPlanner = new LogicPlanner();
          const codeGenerator = new CodeGenerator();

          const guides: Array<{ bladeId: string; decision: any; instructions: string }> = [];

          // Filter blades if bladeId is specified
          const bladesToGenerate = bladeId
            ? validatedPlan.blades.filter(b => b.id === bladeId)
            : validatedPlan.blades;

          if (bladeId && bladesToGenerate.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    error: `Blade '${bladeId}' not found in UI-Plan`,
                    availableBlades: validatedPlan.blades.map(b => b.id),
                    suggestion: `Specify one of the available blade IDs or omit bladeId to generate all blades`
                  }, null, 2)
                }
              ],
              isError: true
            };
          }

          for (const blade of bladesToGenerate) {
            if (!blade.logic) {
              blade.logic = logicPlanner.inferLogic(blade as Blade);
            }
            if (!blade.composable) {
              blade.composable = logicPlanner.inferComposable(blade as Blade);
            }

            const bladeLogic: BladeLogic = normalizeBladeLogic(blade.logic) ?? logicPlanner.inferLogic(blade as Blade);

            const normalizedBlade: Blade = {
              ...(blade as Blade),
              route: blade.route || `/${validatedPlan.module}`,
              title: blade.title || blade.id,
              logic: bladeLogic,
            };
            const namingBase = codeGenerator.createNamingConfig(validatedPlan.module);
            const entityToken = blade.id.replace(/-list$|-details$|-page$/, "") || validatedPlan.module;
            const entityPascal = upperFirst(camelCase(entityToken));
            const entityCamel = camelCase(entityToken);
            const entityKebab = kebabCase(entityToken);

            const naming = {
              ...namingBase,
              entitySingular: entityKebab,
              entitySingularPascal: entityPascal,
              entitySingularCamel: entityCamel,
              entitySingularKebab: entityKebab,
            } as BladeGenerationContext["naming"];

            const bladeType: "list" | "details" = blade.layout === "grid" ? "list" : "details";

            const context: BladeGenerationContext = {
              type: bladeType,
              entity: entityToken,
              module: validatedPlan.module,
              features: blade.features || [],
              blade: normalizedBlade,
              columns: normalizedBlade.components?.find?.((c) => (c as any).type === "VcTable")?.columns as
                | Column[]
                | undefined,
              fields: normalizedBlade.components?.find?.((c) => (c as any).type === "VcForm")?.fields as
                | Field[]
                | undefined,
              naming,
              componentName: `${entityPascal}${bladeType === "list" ? "List" : "Details"}`,
              composableName: `use${entityPascal}${bladeType === "list" ? "List" : "Details"}`,
              route: normalizedBlade.route || `/${validatedPlan.module}`,
              menuTitleKey: `${validatedPlan.module.toUpperCase()}.MENU_TITLE`,
              logic: normalizedBlade.logic as BladeLogic,
              complexity: 0,
            };

            const decision = await smartGen.decide(context);
            const instructions = await smartGen.buildInstructions(context, decision);
            guides.push({ bladeId: blade.id, decision, instructions });
          }

          // 🔥 Check response size before returning
          const responsePayload = {
            success: true,
            strategy: "AI_FULL",
            message:
              "✅ Generation guides created successfully!\n\n" +
              "NEXT STEPS:\n" +
              "1. Read the generation guide for each blade (contains requirements, patterns, constraints)\n" +
              "2. Generate complete Vue SFC code based on the guide instructions\n" +
              "3. Call submit_generated_code tool with the generated code\n" +
              "4. MCP server will validate and save the code, providing feedback if needed\n\n" +
              "⚠️ DO NOT write files manually with Write/Edit tools - use submit_generated_code instead!",
            guides,
          };

          const responseText = JSON.stringify(responsePayload, null, 2);
          const estimatedTokens = Math.ceil(responseText.length / 4); // Rough estimate: 1 token ≈ 4 chars

          // If response is too large, suggest using bladeId parameter
          if (estimatedTokens > 20000) {
            return trackSuccess({
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "Response too large",
                      bladesCount: bladesToGenerate.length,
                      estimatedTokens,
                      maxTokens: 25000,
                      suggestion: "Response exceeds MCP token limit. Use 'bladeId' parameter to generate one blade at a time.",
                      availableBlades: bladesToGenerate.map(b => ({
                        id: b.id,
                        layout: b.layout,
                        title: b.title,
                      })),
                      example: {
                        tool: "generate_with_composition",
                        bladeId: bladesToGenerate[0].id,
                        cwd: parsedData.cwd,
                        plan: "<same UI-Plan>",
                        strategy: "ai-full",
                      },
                      workflow: [
                        `1. Call generate_with_composition with bladeId: "${bladesToGenerate[0].id}"`,
                        "2. Generate code for this blade following the returned instructions",
                        "3. Submit code using submit_generated_code",
                        `4. Repeat for remaining blades: ${bladesToGenerate.slice(1).map(b => b.id).join(", ")}`,
                      ],
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            });
          }

          return trackSuccess({
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          });
        }

        case "infer_blade_logic": {
          const parsed = inferBladeLogicSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { blade, merge } = parsed.data;
          const planner = new LogicPlanner();
          const bladeWithLogic = blade as Blade & { logic?: Blade["logic"] };

          // Infer logic
          const inferred = planner.inferLogic(bladeWithLogic);
          const composable = planner.inferComposable(bladeWithLogic);

          // Merge with existing if requested
          const existingLogic = normalizeBladeLogic(bladeWithLogic.logic);
          const finalLogic = merge && existingLogic ? planner.mergeLogic(inferred, existingLogic) : inferred;

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
                    merged: merge && !!existingLogic,
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
          const complexityScore =
            complexity === "simple" ? 1 : complexity === "moderate" ? 5 : complexity === "complex" ? 8 : 0;

          // Get relevant patterns
          const mockContext = {
            type: type,
            entity: "example", // ✅ ADDED: placeholder entity
            module: "examples", // ✅ ADDED: placeholder module
            features: features || [],
            blade: {
              id: `example-${type}`,
              layout: type === "list" ? ("grid" as const) : ("details" as const),
              features: features || [],
              route: `/examples/${type}`,
              title: `Example ${type}`,
            },
            naming: {
              moduleName: "examples",
              moduleNamePascal: "Examples",
              moduleNameCamel: "examples",
              moduleNameUpperSnake: "EXAMPLES",
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
            complexity: complexityScore, // ✅ ADDED: complexity field
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
          const previousErrors: ValidationError[] = (retry?.previousErrors || []).map(
            (message) =>
              ({
                type: "typescript",
                severity: "error",
                message,
              }) as ValidationError,
          );

          const retryContext = {
            attempt,
            maxAttempts: feedback.getMaxAttempts(),
            previousErrors,
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
                        strategy: "AI_FULL",
                        message:
                          "Maximum retry attempts reached. Regenerate using the AI guide and resubmit your code.",
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

        case "check_types": {
          const parsed = checkTypesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { cwd, fix } = parsed.data;

          try {
            // Run vue-tsc --noEmit in the specified directory
            const { execSync } = await import("child_process");

            try {
              execSync("npx vue-tsc --noEmit", {
                cwd,
                encoding: "utf-8",
                stdio: ["pipe", "pipe", "pipe"],
              });

              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: true,
                      message: "No type errors found!",
                      errors: [],
                    }, null, 2),
                  },
                ],
              };
            } catch (error: any) {
              // Parse error output
              const stderr = error.stderr || error.stdout || "";
              const errors = stderr
                .split("\n")
                .filter((line: string) => line.includes("error TS"))
                .map((line: string) => {
                  const match = line.match(/(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)/);
                  if (match) {
                    return {
                      file: match[1],
                      line: parseInt(match[2]),
                      column: parseInt(match[3]),
                      code: match[4],
                      message: match[5],
                    };
                  }
                  return { raw: line };
                });

              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      message: `Found ${errors.length} type errors`,
                      errors,
                      suggestion: fix
                        ? "Auto-fix is not yet implemented. Please review and fix errors manually."
                        : "Run with fix: true to attempt auto-fixing common errors.",
                    }, null, 2),
                  },
                ],
              };
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: false,
                    message: "Failed to run vue-tsc",
                    error: error instanceof Error ? error.message : String(error),
                  }, null, 2),
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

          // Parse analysis if it's a string (MCP protocol may send JSON objects as strings)
          const analysis = typeof parsed.data.analysis === 'string' ? JSON.parse(parsed.data.analysis) : parsed.data.analysis;

          // Use PlannerV2 to generate UI-Plan from V2 analysis
          const plannerV2 = new PlannerV2();

          try {
            let uiPlan = plannerV2.generatePlan({
              prompt: "", // Not used when analysis is provided
              analysis,
            });

            // Auto-fix common UI-Plan errors before validation
            const fixResult = autoFixUIPlan(uiPlan);
            if (fixResult.fixed) {
              console.error(`\n🔧 Auto-fixed ${fixResult.changes.length} UI-Plan issues during V2 plan creation:`);
              fixResult.changes.forEach((change) => console.error(`   - ${change}`));
              uiPlan = fixResult.plan;
            }

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
                (acc: number, e: any) =>
                  acc + e.blades.reduce((bacc: number, b: any) => bacc + (b.actions?.length || 0), 0),
                0,
              ),
            };

            return trackSuccess({
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
                        "✅ UI-Plan V2 is ready and validated (workflow state: validated)",
                        "✅ Validation step completed during plan creation - no separate validation needed",
                        "Use generate_with_composition to generate code guides (AI_FULL strategy)",
                        "Or use generate_complete_module for full module generation",
                        "Note: Some advanced V2 features (workflows, custom actions) may require manual implementation",
                      ],
                    },
                    null,
                    2,
                  ),
                },
              ],
            });
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

        case "get_workflow_status": {
          const currentState = globalWorkflow.getState();
          const progress = globalWorkflow.getProgress();

          // Determine status for each step
          const getStepStatus = (stepName: string): "completed" | "current" | "pending" | "blocked" => {
            const stepOrder = ["init", "analyzed", "planned", "validated", "generated", "code_submitted", "completed"];
            const currentIndex = stepOrder.indexOf(currentState.step);

            if (stepName === "analyze_prompt_v2") {
              return currentIndex > 0 ? "completed" : "current";
            } else if (stepName === "create_ui_plan_from_analysis_v2") {
              if (currentIndex > 1) return "completed";
              if (currentIndex === 1) return "current";
              return "blocked";
            } else if (stepName === "validate_ui_plan") {
              if (currentIndex > 2) return "completed";
              if (currentIndex === 2) return "current";
              return "blocked";
            } else if (stepName === "generate") {
              if (currentIndex > 3) return "completed";
              if (currentIndex === 3) return "current";
              return "blocked";
            } else if (stepName === "submit_generated_code") {
              if (currentIndex > 4) return "completed";
              if (currentIndex === 4) return "current";
              return "blocked";
            } else if (stepName === "check_types") {
              if (currentIndex >= 6) return "completed";
              if (currentIndex === 5) return "current";
              return "blocked";
            }
            return "pending";
          };

          return trackSuccess({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    workflow: {
                      currentStep: currentState.step,
                      progress: `${progress}%`,
                      nextStep: currentState.nextStep,
                      canProceed: currentState.canProceed,
                      hasAnalysis: !!currentState.analysis,
                      hasPlan: !!currentState.plan,
                      hasGeneratedGuides: !!currentState.generatedGuides,
                    },
                    sequence: [
                      {
                        step: 1,
                        tool: "analyze_prompt_v2",
                        status: getStepStatus("analyze_prompt_v2"),
                        required: true,
                        description: "Deep analysis of user prompt to extract entities, relationships, features"
                      },
                      {
                        step: 2,
                        tool: "create_ui_plan_from_analysis_v2",
                        status: getStepStatus("create_ui_plan_from_analysis_v2"),
                        required: true,
                        description: "Create UI-Plan JSON from analysis result"
                      },
                      {
                        step: 3,
                        tool: "validate_ui_plan or validate_and_fix_plan",
                        status: getStepStatus("validate_ui_plan"),
                        required: true,
                        description: "Validate UI-Plan against schema and component registry"
                      },
                      {
                        step: 4,
                        tool: "generate_with_composition or generate_complete_module",
                        status: getStepStatus("generate"),
                        required: true,
                        description: "Generate AI instructions for writing Vue SFC code"
                      },
                      {
                        step: 5,
                        tool: "submit_generated_code",
                        status: getStepStatus("submit_generated_code"),
                        required: false,
                        description: "Submit and validate AI-written code"
                      },
                      {
                        step: 6,
                        tool: "check_types",
                        status: getStepStatus("check_types"),
                        required: false,
                        description: "Run TypeScript type checking"
                      },
                    ],
                    availableToolCategories: {
                      discovery: "Always available - search/view components and framework APIs",
                      workflowManagement: "Always available - get_workflow_status, start_module_workflow",
                      scaffolding: "Always available - scaffold_app",
                      planHelpers: globalWorkflow.isToolCategoryAvailable("plan_helpers")
                        ? "Available - infer_blade_logic, get_composition_guide"
                        : "Blocked - requires analysis first",
                      qualityChecks: globalWorkflow.isToolCategoryAvailable("quality_checks")
                        ? "Available - get_audit_checklist, check_types"
                        : "Blocked - requires code generation first",
                    },
                    recommendation: currentState.step === "init"
                      ? "RECOMMENDED: Use start_module_workflow for guided experience, or use analyze_prompt_v2 to start manually."
                      : `Next: ${currentState.nextStep}`,
                  },
                  null,
                  2
                ),
              },
            ],
          });
        }

        case "reset_workflow": {
          // Reset workflow state to initial
          globalWorkflow.reset();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "Workflow state has been reset to initial",
                    currentStep: "init",
                    nextStep: "Start by analyzing the user prompt using analyze_prompt_v2 tool",
                    note: "Use this when workflow is stuck or you want to start a new module generation",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "start_module_workflow": {
          const parsed = startModuleWorkflowSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { prompt, cwd, module: moduleOverride } = parsed.data;

          debugLog("Starting guided workflow for:", prompt);

          // Reset workflow
          globalWorkflow.reset();

          // Step 1: Analyze prompt
          const analysisPrompt = buildAnalysisPromptV2(prompt);
          const analysisSchema = getPromptAnalysisSchemaV2();

          return trackSuccess({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    workflow: "started",
                    step: 1,
                    stepName: "analyze_prompt_v2",
                    message: "Guided workflow started. Follow the instructions below to analyze the prompt.",
                    userPrompt: prompt,
                    cwd,
                    moduleOverride,
                    instructions: analysisPrompt,
                    schema: analysisSchema,
                    nextSteps: [
                      "1. Read the comprehensive V2 instructions above",
                      "2. Analyze the prompt deeply - extract ALL entities, relationships, workflows",
                      "3. Detect custom routes, actions, permissions, workflows",
                      "4. Return ONLY valid JSON following the V2 schema",
                      "5. After analysis, call create_ui_plan_from_analysis_v2 automatically",
                      "6. The workflow will guide you through validation and generation",
                    ],
                    autoNext: {
                      tool: "create_ui_plan_from_analysis_v2",
                      description: "After you complete the analysis, automatically proceed to create UI-Plan",
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          });
        }

        // ========================================================================
        // NEW TRANSPARENT TOOLS - Rules, Templates, Patterns
        // ========================================================================

        case "get_applicable_rules": {
          const parsed = getApplicableRulesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { bladeType, isWorkspace, features, strategy } = parsed.data;

          debugLog("Getting applicable rules for:", { bladeType, isWorkspace, features, strategy });

          // Use RulesLoader to get applicable rules
          const { RulesLoader } = await import("../core/rules-loader.js");
          const rulesLoader = new RulesLoader();

          const applicableRules = await rulesLoader.getApplicableRules({
            bladeType,
            isWorkspace,
            features,
            strategy: strategy as any,
          });

          // Format output with full rule content
          let output = `# Applicable Rules for ${bladeType.charAt(0).toUpperCase() + bladeType.slice(1)} Blade\n\n`;

          if (isWorkspace !== undefined) {
            output += `**Workspace Blade:** ${isWorkspace ? "Yes" : "No"}\n`;
          }
          if (features && features.length > 0) {
            output += `**Features:** ${features.join(", ")}\n`;
          }
          output += `**Strategy:** ${strategy || "AI_FULL"}\n\n`;
          output += `**Found ${applicableRules.length} applicable rules**\n\n`;
          output += "---\n\n";

          for (const rule of applicableRules) {
            output += `## Rule ${rule.id}: ${rule.name}\n\n`;
            output += `**Category:** ${rule.category}\n`;
            output += `**Priority:** ${rule.priority}\n`;
            output += `**Applies:** ${rule.applies ? "✅ Yes" : "❌ No"}\n`;
            output += `**Reason:** ${rule.reason}\n\n`;

            if (rule.description) {
              output += `### Description\n\n${rule.description}\n\n`;
            }

            if (rule.rationale) {
              output += `### Rationale\n\n${rule.rationale}\n\n`;
            }

            if (rule.correct_pattern) {
              output += `### ✅ Correct Pattern\n\n`;
              if (rule.correct_pattern.inline) {
                output += `${rule.correct_pattern.inline}\n\n`;
              }
              if (rule.correct_pattern.description) {
                output += `${rule.correct_pattern.description}\n\n`;
              }
            }

            if (rule.wrong_pattern) {
              output += `### ❌ Wrong Pattern\n\n`;
              if (rule.wrong_pattern.inline) {
                output += `${rule.wrong_pattern.inline}\n\n`;
              }
            }

            if (rule.instructions) {
              output += `### Instructions\n\n${rule.instructions}\n\n`;
            }

            if (rule.forbidden && rule.forbidden.length > 0) {
              output += `### 🚫 Forbidden Patterns\n\n`;
              for (const forbidden of rule.forbidden) {
                output += `- **Pattern:** \`${forbidden.pattern}\`\n`;
                output += `  **Reason:** ${forbidden.reason}\n`;
                output += `  **Severity:** ${forbidden.severity}\n\n`;
              }
            }

            if (rule.required && rule.required.length > 0) {
              output += `### ✔️ Required Patterns\n\n`;
              for (const required of rule.required) {
                output += `- **Pattern:** \`${required.pattern}\`\n`;
                if (required.when) {
                  output += `  **When:** ${required.when}\n`;
                }
                output += `  **Severity:** ${required.severity}\n\n`;
              }
            }

            if (rule.examples && rule.examples.length > 0) {
              output += `### 📚 Examples\n\n`;
              for (const examplePath of rule.examples) {
                output += `- ${examplePath}\n`;
              }
              output += "\n";
            }

            output += "---\n\n";
          }

          return trackSuccess({
            content: [
              {
                type: "text",
                text: output,
              },
            ],
          });
        }

        case "get_best_template": {
          const parsed = getBestTemplateSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { bladeType, features, complexity } = parsed.data;

          debugLog("Getting best template for:", { bladeType, features, complexity });

          // Use PatternsLoader to get best template
          const { PatternsLoader } = await import("../core/patterns-loader.js");
          const patternsLoader = new PatternsLoader();

          const template = await patternsLoader.getBestTemplate({
            bladeType,
            features,
          });

          if (!template) {
            return trackSuccess({
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      message: `No template found for ${bladeType} blade`,
                      suggestion: `Available blade types: list, details`,
                    },
                    null,
                    2
                  ),
                },
              ],
            });
          }

          // Filter by complexity if specified
          if (complexity && template.complexity !== complexity) {
            // Try to find another template with matching complexity
            const allTemplates = await patternsLoader.loadAllTemplates();
            const complexityMatch = allTemplates.find(
              (t) => t.bladeType === bladeType && t.complexity === complexity
            );
            if (complexityMatch) {
              const output = `# Template: ${complexityMatch.id}\n\n` +
                `**Blade Type:** ${complexityMatch.bladeType}\n` +
                `**Complexity:** ${complexityMatch.complexity}\n` +
                `**Features:** ${complexityMatch.features.join(", ")}\n` +
                `**Lines:** ${complexityMatch.lines || "N/A"}\n\n` +
                `**File:** ${complexityMatch.file}\n\n` +
                `---\n\n` +
                `## Full Vue SFC Content\n\n` +
                `\`\`\`vue\n${complexityMatch.content}\n\`\`\`\n`;

              return trackSuccess({
                content: [
                  {
                    type: "text",
                    text: output,
                  },
                ],
              });
            }
          }

          // Return best match template
          const output = `# Template: ${template.id}\n\n` +
            `**Blade Type:** ${template.bladeType}\n` +
            `**Complexity:** ${template.complexity}\n` +
            `**Features:** ${template.features.join(", ")}\n` +
            `**Lines:** ${template.lines || "N/A"}\n` +
            `**Match Reason:** Best match for requested features\n\n` +
            `**File:** ${template.file}\n\n` +
            `---\n\n` +
            `## Full Vue SFC Content\n\n` +
            `\`\`\`vue\n${template.content}\n\`\`\`\n`;

          return trackSuccess({
            content: [
              {
                type: "text",
                text: output,
              },
            ],
          });
        }

        case "get_relevant_patterns": {
          const parsed = getRelevantPatternsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { bladeType, features, isWorkspace, patterns: specificPatterns } = parsed.data;

          debugLog("Getting relevant patterns for:", { bladeType, features, isWorkspace, specificPatterns });

          // Use PatternsLoader to get relevant patterns
          const { PatternsLoader } = await import("../core/patterns-loader.js");
          const patternsLoader = new PatternsLoader();

          let patterns = await patternsLoader.getRelevantPatterns({
            bladeType: bladeType as any,
            features,
            isWorkspace,
          });

          // If specific pattern IDs requested, filter to those
          if (specificPatterns && specificPatterns.length > 0) {
            patterns = patterns.filter((p) => specificPatterns.includes(p.id));
          }

          // Format output with full pattern content
          let output = `# Relevant Patterns for ${bladeType.charAt(0).toUpperCase() + bladeType.slice(1)} Blade\n\n`;

          if (isWorkspace !== undefined) {
            output += `**Workspace Blade:** ${isWorkspace ? "Yes" : "No"}\n`;
          }
          if (features && features.length > 0) {
            output += `**Features:** ${features.join(", ")}\n`;
          }
          output += `\n**Found ${patterns.length} relevant patterns**\n\n`;
          output += "---\n\n";

          for (const pattern of patterns) {
            output += `## Pattern: ${pattern.title || pattern.id}\n\n`;
            output += `**ID:** ${pattern.id}\n`;
            output += `**Category:** ${pattern.category}\n`;
            if (pattern.bladeType) {
              output += `**Blade Type:** ${pattern.bladeType}\n`;
            }
            if (pattern.features && pattern.features.length > 0) {
              output += `**Features:** ${pattern.features.join(", ")}\n`;
            }
            output += `**File:** ${pattern.file}\n\n`;
            output += "---\n\n";
            output += `${pattern.content}\n\n`;
            output += "---\n\n";
          }

          return trackSuccess({
            content: [
              {
                type: "text",
                text: output,
              },
            ],
          });
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      // ✅ Track tool call failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      metricsTracker.endToolCall(name, startTime, false, errorMessage);

      // Format error for MCP
      const formattedError = error instanceof Error ? formatMcpError(error) : String(error);

      return {
        content: [
          {
            type: "text",
            text: formattedError,
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

  // ✅ Handle graceful shutdown and print metrics
  process.on("SIGINT", () => {
    if (metricsTracker.hasActivity()) {
      metricsTracker.printSummary();

      if (metricsFile) {
        try {
          fs.writeFileSync(metricsFile, metricsTracker.exportJSON());
          console.log(`\n[MCP] Metrics saved to: ${metricsFile}`);
        } catch (error) {
          console.error(`[MCP] Failed to save metrics: ${error}`);
        }
      }
    }
    process.exit(0);
  });
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
