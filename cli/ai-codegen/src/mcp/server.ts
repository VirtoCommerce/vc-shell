/**
 * Clean MCP Server
 *
 * Professional MCP server implementation.
 * Uses new architecture (Knowledge → Intelligence → Generators → Workflows).
 * NO old code reuse!
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "node:path";
import { getDirname, isCompiledBuild, getExamplesPath, getRulesPath } from "../utils/paths";

// Import new architecture layers - COMPLETE
import { KnowledgeBase } from "../knowledge";
import {
  ComponentResolver,
  FeatureResolver,
  FuzzyMatcher,
  SemanticMatcher,
  HybridMatcher,
  CapabilityResolver,
  TemplateResolver,
  UIPlanValidator,
  CodeValidator,
} from "../intelligence";
import {
  SmartPromptAnalyzer,
  SmartUIPlanner,
  IntentExtractor,
  EntityExtractor,
  BladePlanner,
  WorkflowPlanner,
} from "../generators";
import {
  WorkflowOrchestrator,
  AnalyzeStepExecutor,
  DiscoverStepExecutor,
  PlanStepExecutor,
  ValidateStepExecutor,
  GenerateStepExecutor,
  AICodeGenStepExecutor,
  CodeValidationStepExecutor,
  SubmitStepExecutor,
} from "../workflows";
import { RulesLoader } from "../core/rules-loader";

import type { MCPServerContext } from "./context";

const __dirname = getDirname(import.meta.url);

/**
 * Initialize MCP Server
 */
export async function startMCPServer() {
  // Guard against silent crashes that surface as "Transport closed"
  process.on("uncaughtException", (error) => {
    console.error("[MCP Server] Uncaught exception:", error);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[MCP Server] Unhandled rejection:", reason);
  });

  const server = new Server(
    {
      name: "vcshell-codegen",
      version: "1.0.0", // New architecture version
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  console.error("[MCP Server] Initializing professional architecture...");

  // Setup paths (cross-platform compatible)
  const rootPath = path.join(__dirname, "..", "..");
  const examplesPath = getExamplesPath(__dirname);

  // Layer 1: Knowledge Base
  console.error("[MCP Server] Loading Knowledge Base...");
  const kb = new KnowledgeBase(examplesPath);
  await kb.loadAll();
  console.error(`[MCP Server] ✓ Knowledge Base: ${JSON.stringify(kb.stats)}`);

  // Layer 2: Intelligence Layer
  console.error("[MCP Server] Initializing Intelligence Layer...");
  const fuzzyMatcher = new FuzzyMatcher({ threshold: 0.4 });
  const semanticMatcher = new SemanticMatcher();
  const hybridMatcher = new HybridMatcher();
  const componentResolver = new ComponentResolver(kb.components);
  const featureResolver = new FeatureResolver(kb.features);
  const capabilityResolver = new CapabilityResolver(kb.components);
  const templateResolver = new TemplateResolver(kb.templates);
  const uiPlanValidator = new UIPlanValidator(kb.components, kb.features, kb.frameworkAPIs);
  const codeValidator = new CodeValidator({ checkVueSFC: true, checkTypeScript: true });
  console.error("[MCP Server] ✓ Intelligence Layer ready (10 components)");

  // Layer 3: Generators Layer
  console.error("[MCP Server] Initializing Generators Layer...");
  const intentExtractor = new IntentExtractor();
  const entityExtractor = new EntityExtractor();
  const analyzer = new SmartPromptAnalyzer(kb, featureResolver);
  const planner = new SmartUIPlanner(kb, componentResolver, featureResolver);
  const bladePlanner = new BladePlanner(componentResolver, featureResolver, templateResolver);
  const workflowPlanner = new WorkflowPlanner();
  console.error("[MCP Server] ✓ Generators Layer ready (6 components)");

  // Layer 4: Workflows Layer
  console.error("[MCP Server] Initializing Workflows Layer...");

  // Initialize RulesLoader for YAML rules (cross-platform compatible)
  const rulesDir = getRulesPath(__dirname);
  const examplesDir = getExamplesPath(__dirname);
  const rulesLoader = new RulesLoader({ rulesDir, examplesDir, cache: true });

  const workflowContext = {
    kb,
    rulesLoader,
    componentResolver,
    featureResolver,
    templateResolver,
    uiPlanValidator,
    codeValidator,
    analyzer,
    planner,
  };

  const orchestrator = new WorkflowOrchestrator(workflowContext);

  // Register step executors (complete workflow)
  orchestrator.registerExecutor("analyzing" as any, new AnalyzeStepExecutor());
  orchestrator.registerExecutor("discovering" as any, new DiscoverStepExecutor());
  orchestrator.registerExecutor("planning" as any, new PlanStepExecutor());
  orchestrator.registerExecutor("validating" as any, new ValidateStepExecutor());
  orchestrator.registerExecutor("generating" as any, new GenerateStepExecutor());
  orchestrator.registerExecutor("ai-codegen" as any, new AICodeGenStepExecutor());
  orchestrator.registerExecutor("code-validation" as any, new CodeValidationStepExecutor());
  orchestrator.registerExecutor("submitting" as any, new SubmitStepExecutor());

  console.error("[MCP Server] ✓ Workflows Layer ready");

  // Create MCP context
  const context: MCPServerContext = {
    // Knowledge Layer
    kb,
    // Intelligence Layer - Matchers
    fuzzyMatcher,
    semanticMatcher,
    hybridMatcher,
    // Intelligence Layer - Resolvers
    componentResolver,
    featureResolver,
    capabilityResolver,
    templateResolver,
    // Intelligence Layer - Validators
    uiPlanValidator,
    codeValidator,
    // Generators Layer - Analyzers
    intentExtractor,
    entityExtractor,
    analyzer,
    // Generators Layer - Planners
    planner,
    bladePlanner,
    workflowPlanner,
    // Workflows Layer
    orchestrator,
    // Paths
    rootPath,
    examplesPath,
  };

  // Layer 5: Register MCP tools and resources
  console.error("[MCP Server] Registering MCP tools...");

  // Import handlers
  const { registerToolSchemas } = await import("./handlers/schemas.js");
  const { registerToolHandlers, getHandlerStats } = await import("./handlers/index.js");

  // Register tool schemas (26 tools)
  registerToolSchemas(server);

  // Register tool handlers (26 tools)
  registerToolHandlers(server, context);

  // Log stats
  const stats = getHandlerStats();
  console.error(`[MCP Server] ✓ Registered ${stats.total} tools:`);
  console.error(`  - Workflow: ${stats.workflow} tools`);
  console.error(`  - Components: ${stats.components} tools`);
  console.error(`  - Framework: ${stats.framework} tools`);
  console.error(`  - Knowledge: ${stats.knowledge} tools`);
  console.error(`  - Utilities: ${stats.utilities} tools`);

  console.error("[MCP Server] ✅ Professional architecture initialized!");
  console.error("[MCP Server] Architecture Summary:");
  console.error("  Layer 1: Knowledge Base (11 files, 5 registries)");
  console.error("  Layer 2: Intelligence (13 files: 3 matchers, 4 resolvers, 3 validators)");
  console.error("  Layer 3: Generators (6 files: 3 analyzers, 3 planners)");
  console.error("  Layer 4: Workflows (10 files: orchestrator + 8 step executors)");
  console.error("  Layer 5: MCP Server (7 files: server + 26 tool handlers)");

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[MCP Server] Connected via stdio");
}

/**
 * CLI entry point
 */
export async function mcpServerCommand() {
  try {
    await startMCPServer();
  } catch (error) {
    console.error("[MCP Server] Fatal error:", error);
    process.exit(1);
  }
}
