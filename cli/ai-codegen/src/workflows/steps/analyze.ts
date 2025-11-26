/**
 * Analyze Step Executor
 *
 * Executes prompt analysis step.
 * Uses SmartPromptAnalyzer from Generators Layer.
 *
 * Returns analysis instructions and schema for AI to create the analysis.
 * AI MUST create the analysis itself based on the user's prompt.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * AnalyzeStepExecutor
 *
 * Step 1: Provide AI with instructions and schema to analyze user prompt.
 * AI creates the analysis JSON based on the prompt.
 */
export class AnalyzeStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: { prompt: string; module?: string },
  ): Promise<StepResult> {
    const { prompt, module: moduleOverride } = input;
    const { analyzer } = context;

    try {
      console.error(`[AnalyzeStep] Analyzing prompt: "${prompt.substring(0, 50)}..."`);

      // Build analysis prompt with instructions for AI
      const analysisPrompt = await analyzer.buildAnalysisPrompt(prompt);
      const schema = analyzer.getAnalysisSchema();

      console.error(`[AnalyzeStep] Returning analysis instructions for AI`);

      // Return instructions for AI to create the analysis
      return {
        success: true,
        data: {
          _analysisPrompt: analysisPrompt,
          _analysisSchema: schema,
          _moduleOverride: moduleOverride,
        },
        nextStep: "analyzing" as any,
        warnings: [],
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Analysis failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute from initial or analyzing state
    return state.currentStep === ("initial" as any) || state.currentStep === ("analyzing" as any);
  }

  getRequiredInput(): string[] {
    return ["prompt"];
  }
}
