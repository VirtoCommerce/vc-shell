/**
 * WorkflowOrchestrator
 *
 * Professional workflow orchestration.
 * Executes workflow steps in sequence using step executors.
 */

import type { WorkflowState, WorkflowStep, WorkflowContext, StepExecutor, StepResult } from "./types";
import { WorkflowStateManager } from "./state";

/**
 * WorkflowOrchestrator
 *
 * Orchestrates workflow execution through step executors.
 */
export class WorkflowOrchestrator {
  private stateManager: WorkflowStateManager;
  private executors: Map<WorkflowStep, StepExecutor>;

  constructor(private context: WorkflowContext) {
    this.stateManager = new WorkflowStateManager();
    this.executors = new Map();
  }

  /**
   * Register step executor
   */
  registerExecutor(step: WorkflowStep, executor: StepExecutor): void {
    this.executors.set(step, executor);
  }

  /**
   * Execute single step
   */
  async executeStep(step: WorkflowStep, input: any): Promise<StepResult> {
    const state = this.stateManager.getState();

    // Get executor
    const executor = this.executors.get(step);
    if (!executor) {
      return {
        success: false,
        errors: [`No executor registered for step: ${step}`],
      };
    }

    // Validate step order (STRICT) - pass input for checking
    const orderValidation = this.validateStepOrder(step, state, input);
    if (!orderValidation.valid) {
      return {
        success: false,
        errors: orderValidation.errors,
        warnings: orderValidation.warnings,
      };
    }

    // Check if step can be executed
    if (!executor.canExecute(state)) {
      return {
        success: false,
        errors: [`Cannot execute step ${step} in current state: ${state.currentStep}`],
      };
    }

    // Validate input
    const requiredInput = executor.getRequiredInput();
    const missingInput = requiredInput.filter((key) => !(key in input));
    if (missingInput.length > 0) {
      return {
        success: false,
        errors: [`Missing required input: ${missingInput.join(", ")}`],
      };
    }

    try {
      // Execute step (don't transition yet - executor will decide via nextStep)
      const result = await executor.execute(state, this.context, input);

      if (result.success) {
        // Update state with result data
        if (result.data) {
          this.stateManager.updateState(result.data);
        }

        // Transition to next step if specified
        if (result.nextStep) {
          this.stateManager.transitionTo(result.nextStep);
        }
      } else {
        // Add errors to state
        if (result.errors) {
          result.errors.forEach((err) => this.stateManager.addError(err));
        }

        // Transition to failed state if critical error
        // BUT NOT if the step indicates a retry is needed (data.needsRetry)
        if (this.isCriticalError(result) && !result.data?.needsRetry) {
          this.stateManager.transitionTo("failed" as any);
        }
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      this.stateManager.addError(errorMessage);
      this.stateManager.transitionTo("failed" as any);

      return {
        success: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Execute workflow - INTERACTIVE MODE
   *
   * This workflow requires AI interaction between steps:
   * 1. Analyze: Returns prompt for AI to analyze
   * 2. AI analyzes and calls discover_components_and_apis
   * 3. Discover: Returns discovered components/APIs
   * 4. Client calls create_ui_plan_from_analysis_v2
   * 5. Continue with validation and generation
   *
   * This method ONLY executes Step 1 and returns the analysis prompt.
   * Client must call subsequent tools manually.
   */
  async executeWorkflow(input: {
    prompt: string;
    cwd?: string;
    module?: string;
  }): Promise<StepResult> {
    this.stateManager.reset();

    try {
      // Step 1: Analyze - Generate analysis prompt for AI
      console.log("[Workflow] Step 1: Generating analysis prompt for AI...");
      const analyzeResult = await this.executeStep("analyzing" as any, { prompt: input.prompt });

      if (!analyzeResult.success) {
        return analyzeResult;
      }

      // Return analysis prompt to client
      // Client (AI) should:
      // 1. Read _analysisPrompt and _analysisSchema
      // 2. Analyze the user's prompt
      // 3. Call discover_components_and_apis with analysis result
      return {
        success: true,
        data: {
          ...analyzeResult.data,
          workflowState: this.stateManager.getState(),
        },
        warnings: [
          ...(analyzeResult.warnings || []),
          "⚠️ WORKFLOW PAUSED - AI interaction required",
          "The workflow cannot continue automatically because Step 1 requires AI to analyze the prompt.",
          "",
          "WHAT TO DO NEXT:",
          "1. Extract _analysisPrompt from the response",
          "2. Use AI (Claude/GPT) to analyze the user's request based on the prompt",
          "3. Create a PromptAnalysis JSON object following _analysisSchema",
          "4. Call discover_components_and_apis MCP tool with the analysis",
          "",
          "After discovery, continue with:",
          "5. create_ui_plan_from_analysis_v2",
          "6. validate_ui_plan (if needed)",
          "7. generate_with_composition",
          "8. submit_generated_code",
        ],
      };
    } catch (error: any) {
      this.stateManager.addError(error.message || String(error));
      this.stateManager.transitionTo("failed" as any);

      return {
        success: false,
        errors: this.stateManager.getState().errors,
      };
    }
  }

  /**
   * Get current state
   */
  getState(): Readonly<WorkflowState> {
    return this.stateManager.getState();
  }

  /**
   * Update state with partial data
   */
  updateState(data: Partial<WorkflowState>): void {
    this.stateManager.updateState(data);
  }

  /**
   * Get workflow status
   */
  getStatus() {
    return this.stateManager.getStatus();
  }

  /**
   * Reset workflow
   */
  reset(): void {
    this.stateManager.reset();
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(result: StepResult): boolean {
    // Critical if multiple errors or contains "critical" keyword
    return Boolean(
      (result.errors && result.errors.length > 3) ||
      result.errors?.some((err) => err.toLowerCase().includes("critical"))
    );
  }

  /**
   * Validate step order (STRICT)
   *
   * Enforces the correct workflow sequence:
   * 1. analyzing → 2. discovering → 3. planning → 4. validating → 5. generating
   *
   * Checks for required data in EITHER state OR input parameters
   */
  private validateStepOrder(step: WorkflowStep, state: WorkflowState, input: any): {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required prerequisites for each step
    const prerequisites = {
      "discovering": {
        requiredStep: "analyzing",
        requiredData: "analysis",
        message: "Step 'discovering' requires 'analyzing' to be completed first with valid analysis data"
      },
      "planning": {
        requiredStep: "discovering",
        requiredData: "discoveredComponents",
        message: "Step 'planning' requires 'discovering' to be completed first. Missing discovered components/APIs"
      },
      "validating": {
        requiredStep: "planning",
        requiredData: "plan",
        message: "Step 'validating' requires 'planning' to be completed first. Missing UI-Plan"
      },
      "generating": {
        // NOTE: generating can be called multiple times (once per blade)
        // It can be called from validating (first blade) or from ai-codegen/submitting (next blade)
        requiredStep: null, // No strict step requirement - we check for plan instead
        requiredData: "plan",
        message: "Step 'generating' requires a validated UI-Plan"
      },
      "ai-codegen": {
        requiredStep: "generating",
        requiredData: "generationGuides",
        message: "Step 'ai-codegen' requires 'generating' to be completed first with generation guides"
      },
      "code-validation": {
        // NOTE: code-validation can be called multiple times (once per blade)
        // It can be called from ai-codegen (first time) or from submitting (next blade)
        requiredStep: null, // No strict step requirement - allows multi-blade workflow
        requiredData: "generatedCode", // This is passed in input, not state
        message: "Step 'code-validation' requires generated code"
      },
      "submitting": {
        // Submitting receives validated code as input, not from state
        requiredStep: null,
        requiredData: null,
        message: "Step 'submitting' receives validated code as input"
      }
    };

    // Check prerequisites for current step
    const prereq = prerequisites[step as keyof typeof prerequisites];
    if (prereq && prereq.requiredData) {
      // Check if required data exists in state OR input parameters
      const hasRequiredDataInState = Boolean((state as any)[prereq.requiredData]);
      const hasRequiredDataInInput = Boolean((input as any)?.[prereq.requiredData]);
      const hasRequiredData = hasRequiredDataInState || hasRequiredDataInInput;

      if (!hasRequiredData) {
        errors.push(
          `❌ WORKFLOW ORDER VIOLATION: ${prereq.message}`,
          "",
          "CORRECT WORKFLOW SEQUENCE:",
          "1. start_module_workflow (or analyze_prompt_v2)",
          "2. discover_components_and_apis",
          "3. create_ui_plan_from_analysis_v2",
          "4. validate_ui_plan (or validate_and_fix_plan)",
          "5. generate_with_composition",
          "6. submit_generated_code",
          "",
          `Current state: ${state.currentStep}`,
          `Attempting: ${step}`,
          `Missing data: ${prereq.requiredData} (not in state or input)`,
          "",
          "Please follow the workflow sequence strictly."
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
