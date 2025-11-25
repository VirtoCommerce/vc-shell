/**
 * Library exports for @vc-shell/ai-codegen
 *
 * This file provides programmatic access to the AI code generation system.
 */

// ============================================
// LEGACY EXPORTS (DEPRECATED - use new architecture)
// ============================================

// Rules System
export { RulesLoader } from "./core/rules-loader";
export type {
  Rule,
  RuleCategory,
  ForbiddenPattern,
  RequiredPattern,
  PatternExample,
  ValidationCheck,
  AutoFix,
} from "./core/rules-types";

// Examples System
export { ExamplesLoader } from "./core/examples-loader";
export type {
  ExampleMetadata,
  ExampleType,
  ExampleComplexity,
  ExamplesIndex,
  Example,
  CapabilityExample,
  PatternExample as ExamplePattern,
  CompositionExample,
  FrameworkAPIExample,
  ExampleSearchQuery,
} from "./core/examples-types";

// UI Plan Validator
export { UIPlan } from "./core/validator";

// Code Validator
export { CodeValidator } from "./core/code-validator";
export type { ValidationResult, ValidationError } from "./core/code-validator";

// Quality Metrics
export { QualityMetrics } from "./core/quality-metrics";

// AST Utils
export { ASTUtils } from "./core/ast-utils";

// Component Registry Loader
export {
  loadComponentNames,
  loadComponentRegistry,
  isValidComponent,
  getComponentCount
} from "./core/component-registry-loader";

// Types
export type { UIPlan as UIPlansType } from "./schemas/zod-schemas";

// ============================================
// NEW ARCHITECTURE EXPORTS (5-Layer System)
// ============================================

// Layer 1: Knowledge Base
export { KnowledgeBase } from "./knowledge";
export type {
  ComponentMetadata,
  FrameworkAPIMetadata,
  PatternMetadata,
  TemplateMetadata,
  FeatureMetadata,
} from "./knowledge/types";

// Layer 2: Intelligence Layer
export {
  ComponentResolver,
  FeatureResolver,
  CapabilityResolver,
  TemplateResolver,
} from "./intelligence";
export type {
  IntentMatch,
  IntentQuery,
  MatchResult,
  MatchableItem,
  ValidationResult as IntelligenceValidationResult,
  ValidationError as IntelligenceValidationError,
} from "./intelligence/types";

// Layer 3: Generators Layer
export {
  SmartPromptAnalyzer,
  IntentExtractor,
  EntityExtractor,
  SmartUIPlanner,
  BladePlanner,
  WorkflowPlanner,
} from "./generators";

// Layer 4: Workflows Layer
export { WorkflowOrchestrator } from "./workflows";
export type {
  WorkflowState,
  WorkflowStep,
  StepResult,
  WorkflowContext,
  StepExecutor,
} from "./workflows/types";

// Layer 5: MCP Server (programmatic access)
export { registerToolHandlers, allHandlers } from "./mcp/handlers";
