/**
 * Library exports for @vc-shell/ai-codegen
 *
 * This file provides programmatic access to the AI code generation system.
 */

// Rules System
export { RulesLoader } from "./core/rules-loader.js";
export type {
  Rule,
  RuleCategory,
  ForbiddenPattern,
  RequiredPattern,
  PatternExample,
  ValidationCheck,
  AutoFix,
} from "./core/rules-types.js";

// Examples System
export { ExamplesLoader } from "./core/examples-loader.js";
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
} from "./core/examples-types.js";

// AI Generation System
export { AIGenerationGuideBuilder } from "./core/ai-generation-guide-builder.js";

// Smart Code Generator
export { SmartCodeGenerator } from "./core/smart-generator.js";

// UI Plan Validator
export { UIPlan } from "./core/validator.js";

// Types
export type { UIPlan as UIPlansType } from "./schemas/zod-schemas.js";
