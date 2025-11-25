/**
 * MCP Server Context
 *
 * Shared context for all MCP tools.
 * Initialized once at server startup.
 */

import type { KnowledgeBase } from "../knowledge";
import type {
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
import type {
  SmartPromptAnalyzer,
  SmartUIPlanner,
  IntentExtractor,
  EntityExtractor,
  BladePlanner,
  WorkflowPlanner,
} from "../generators";
import type { WorkflowOrchestrator } from "../workflows";

/**
 * MCPServerContext
 *
 * Complete context with all professional architecture components.
 */
export interface MCPServerContext {
  // Knowledge Layer
  kb: KnowledgeBase;

  // Intelligence Layer - Matchers
  fuzzyMatcher: FuzzyMatcher;
  semanticMatcher: SemanticMatcher;
  hybridMatcher: HybridMatcher;

  // Intelligence Layer - Resolvers
  componentResolver: ComponentResolver;
  featureResolver: FeatureResolver;
  capabilityResolver: CapabilityResolver;
  templateResolver: TemplateResolver;

  // Intelligence Layer - Validators
  uiPlanValidator: UIPlanValidator;
  codeValidator: CodeValidator;

  // Generators Layer - Analyzers
  intentExtractor: IntentExtractor;
  entityExtractor: EntityExtractor;
  analyzer: SmartPromptAnalyzer;

  // Generators Layer - Planners
  planner: SmartUIPlanner;
  bladePlanner: BladePlanner;
  workflowPlanner: WorkflowPlanner;

  // Workflows Layer
  orchestrator: WorkflowOrchestrator;

  // Paths
  rootPath: string;
  examplesPath: string;
}
