/**
 * Workflows Layer Types
 *
 * Professional workflow orchestration types.
 */

import type { PromptAnalysis, UIPlan } from "../generators/types";

/**
 * Artifact Type - what kind of code to generate
 */
export enum ArtifactType {
  BLADE = "blade",
  COMPOSABLE = "composable",
  API_CLIENT = "apiClient",
  ALL = "all", // Legacy mode - generate everything at once
}

/**
 * Context Level - how much detail to include
 */
export enum ContextLevel {
  METADATA = "metadata",     // IDs, descriptions only (~2KB)
  ESSENTIAL = "essential",   // + template + top 2 patterns (~10KB)
  FULL = "full",             // Everything (~25KB+)
}

/**
 * Pagination State - tracks generation progress
 */
export interface PaginationState {
  // Current position
  currentBladeId: string | null;
  currentArtifactType: ArtifactType;

  // Progress tracking
  completedArtifacts: {
    blades: Map<string, boolean>;      // bladeId -> completed
    composables: Map<string, boolean>; // bladeId -> completed
    apiClient: boolean;
  };

  // Queue of what to generate next
  queue: Array<{
    bladeId: string;
    artifactType: ArtifactType;
    priority: number;
  }>;
}

/**
 * Generation Guide - context for AI to generate one artifact
 */
export interface GenerationGuide {
  // What to generate
  artifactType: ArtifactType;
  bladeId: string;
  module: string;
  entity: string;

  // Blade info (always included)
  bladeType: "list" | "details";
  features: string[];
  isWorkspace?: boolean;

  // Target file path
  targetPath: string;

  // Context (tiered)
  context: {
    level: ContextLevel;

    // Level 1: METADATA - always present
    componentRefs: Array<{
      name: string;
      description: string;
      relevance: number;
    }>;
    hookRefs: Array<{
      name: string;
      import: string;
      description: string;
    }>;
    templateRef: {
      id: string;
      complexity: string;
      description: string;
    } | null;
    patternRefs: Array<{
      id: string;
      description: string;
    }>;

    // Level 2: ESSENTIAL - included for blade/composable generation
    template?: string;           // Full template content
    topPatterns?: string[];      // Top 2-3 pattern contents

    // Level 3: FULL - only if explicitly requested
    allPatterns?: string[];
    rules?: string[];
    componentDetails?: any[];
    hookDetails?: any[];

    // API client specific - entity info for generating typed client
    entities?: Array<{
      name: string;
      displayName: string;
      properties: Array<{ name: string; type?: string; required?: boolean }>;
      operations: string[];
    }>;
  };

  // Instructions specific to artifact type
  instructions: string;

  // Expected output format
  expectedOutput: {
    format: "vue-sfc" | "typescript" | "json";
    exports?: string[];
  };
}

/**
 * Pagination Response - what generate_with_composition returns
 */
export interface PaginationResponse {
  // Current guide
  guide: GenerationGuide;

  // Pagination info
  pagination: {
    current: {
      bladeId: string;
      artifactType: ArtifactType;
      index: number;
    };
    total: {
      blades: number;
      composables: number;
      apiClient: boolean;
      totalArtifacts: number;
    };
    completed: number;
    remaining: number;
  };

  // Smart navigation
  nextSteps: Array<{
    tool: string;
    params: Record<string, any>;
    description: string;
  }>;

  // Is everything done?
  allComplete: boolean;
}

/**
 * Workflow State
 */
export interface WorkflowState {
  currentStep: WorkflowStep;
  cwd?: string; // Working directory for code generation
  analysis?: PromptAnalysis;
  discoveredComponents?: any[];
  discoveredAPIs?: any[];
  plan?: UIPlan;
  validationResult?: any;
  generationGuides?: any[];
  aiPrompts?: any[];
  generatedCode?: any[];
  validatedCode?: any[];
  completedBlades?: string[]; // Track completed blade IDs
  completedArtifacts?: {
    blades: string[];
    composables: string[];
    apiClient: boolean;
    widgets: string[];
  };
  progress?: {
    total: number;
    completed: number;
    remaining: string[];
  };
  requiredArtifacts?: {
    blades: Array<{ id: string; status: string }>;
    apiClient: { status: string; required: boolean } | null;
    widgets: string[];
  };
  errors?: string[];

  // Pagination state for artifact-by-artifact generation
  pagination?: {
    currentBladeId: string | null;
    currentArtifactType: ArtifactType;
    queue: Array<{
      bladeId: string;
      artifactType: ArtifactType;
    }>;
    contextLevel: ContextLevel;
  };
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

  // Rules Loader - for loading YAML rules
  rulesLoader: any; // RulesLoader

  // Intelligence Layer - Resolvers
  componentResolver: any;
  featureResolver: any;
  templateResolver?: any; // TemplateResolver for finding best templates

  // Intelligence Layer - Validators
  uiPlanValidator: any;
  codeValidator: any;

  // Generators Layer - Analyzers & Planners
  analyzer: any;
  planner: any;
}

/**
 * Step Executor Interface
 */
export interface StepExecutor {
  execute(state: WorkflowState, context: WorkflowContext, input: any): Promise<StepResult>;
  canExecute(state: WorkflowState): boolean;
  getRequiredInput(): string[];
}
