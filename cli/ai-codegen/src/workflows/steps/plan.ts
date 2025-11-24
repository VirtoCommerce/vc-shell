/**
 * Plan Step Executor
 *
 * Creates UI-Plan from analysis and discovered components.
 * Uses SmartUIPlanner from Generators Layer.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { PromptAnalysis } from "../../generators/types";

/**
 * PlanStepExecutor
 *
 * Step 3: Create comprehensive UI-Plan.
 */
export class PlanStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      analysis: PromptAnalysis;
      discoveredComponents?: any[];
      discoveredAPIs?: any[];
    },
  ): Promise<StepResult> {
    const { analysis, discoveredComponents, discoveredAPIs } = input;
    const { planner, analyzer } = context;

    try {
      console.log(`[PlanStep] Creating UI-Plan for module: ${analysis.moduleName}`);

      // Validate analysis first
      const validation = await analyzer.validateAnalysis(analysis);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }

      // Log validation warnings
      if (validation.warnings.length > 0) {
        console.warn(`[PlanStep] Warnings:`, validation.warnings);
      }

      // Generate UI-Plan using SmartUIPlanner
      const plan = await planner.generatePlan({
        analysis,
        discoveredComponents,
      });

      console.log(`[PlanStep] ✓ UI-Plan created: ${plan.blades.length} blades`);

      return {
        success: true,
        data: {
          analysis,
          discoveredComponents,
          discoveredAPIs,
          plan,
        },
        nextStep: "validating" as any,
        warnings: validation.warnings,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Planning failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute if we have analysis and discovered components
    return (
      !!state.analysis &&
      (state.currentStep === ("discovering" as any) || state.currentStep === ("planning" as any))
    );
  }

  getRequiredInput(): string[] {
    return ["analysis"];
  }
}
