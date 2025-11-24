/**
 * Workflows Layer Types
 *
 * Professional workflow orchestration types.
 */

import type { PromptAnalysis, UIPlan } from "../generators/types";

/**
 * Workflow State
 */
export interface WorkflowState {
  currentStep: WorkflowStep;
  analysis?: PromptAnalysis;
  discoveredComponents?: any[];
  discoveredAPIs?: any[];
  plan?: UIPlan;
  validationResult?: any;
  generationGuides?: any[];
  aiPrompts?: any[];
  generatedCode?: any[];
  validatedCode?: any[];
  errors?: string[];
}

/**
 * Workflow Steps
 */
export enum WorkflowStep {
  INITIAL = "initial",
  ANALYZING = "analyzing",
  DISCOVERING = "discovering",
  PLANNING = "planning",
  VALIDATING = "validating",
  GENERATING = "generating",
  AI_CODEGEN = "ai-codegen",
  CODE_VALIDATION = "code-validation",
  SUBMITTING = "submitting",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Workflow Step Result
 */
export interface StepResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  nextStep?: WorkflowStep;
}

/**
 * Workflow Context
 *
 * Shared context passed to all workflow steps.
 * Contains all components from architecture layers.
 */
export interface WorkflowContext {
  // Knowledge Layer
  kb: any; // KnowledgeBase

  // Intelligence Layer - Resolvers
  componentResolver: any;
  featureResolver: any;

  // Intelligence Layer - Validators
  uiPlanValidator: any;
  codeValidator: any;

  // Generators Layer - Analyzers & Planners
  analyzer: any;
  planner: any;

  // Generators Layer - Synthesizers
  vueSynthesizer: any;
  composableSynthesizer: any;
  apiClientSynthesizer: any;
  localeSynthesizer: any;
}

/**
 * Step Executor Interface
 */
export interface StepExecutor {
  execute(state: WorkflowState, context: WorkflowContext, input: any): Promise<StepResult>;
  canExecute(state: WorkflowState): boolean;
  getRequiredInput(): string[];
}
