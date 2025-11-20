/**
 * Library exports for @vc-shell/ai-codegen
 *
 * This file provides programmatic access to the AI code generation system.
 */

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

// AI Generation System
export { AIGenerationGuideBuilder } from "./core/ai-generation-guide-builder";

// Smart Code Generator
export { SmartCodeGenerator } from "./core/smart-generator";

// UI Plan Validator
export { UIPlan } from "./core/validator";

// Types
export type { UIPlan as UIPlansType } from "./schemas/zod-schemas";
