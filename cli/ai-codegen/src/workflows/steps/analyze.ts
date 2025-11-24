/**
 * Analyze Step Executor
 *
 * Executes prompt analysis step.
 * Uses SmartPromptAnalyzer from Generators Layer.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * AnalyzeStepExecutor
 *
 * Step 1: Analyze user prompt and extract entities, features, workflows.
 */
export class AnalyzeStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: { prompt: string },
  ): Promise<StepResult> {
    const { prompt } = input;
    const { analyzer } = context;

    try {
      console.log(`[AnalyzeStep] Analyzing prompt: "${prompt.substring(0, 50)}..."`);

      // Build analysis prompt using SmartPromptAnalyzer
      const analysisPrompt = await analyzer.buildAnalysisPrompt(prompt);
      const schema = analyzer.getAnalysisSchema();

      // Return analysis prompt and schema for AI to process
      // AI should analyze the prompt and call discover_components_and_apis with the result
      return {
        success: true,
        data: {
          _analysisPrompt: analysisPrompt,
          _analysisSchema: schema,
        },
        nextStep: "analyzing" as any, // Stay in analyzing state - waiting for AI to provide analysis
        warnings: [
          "Analysis prompt generated. This is NOT the final analysis - AI must process it.",
          "NEXT STEPS:",
          "1. Review the _analysisPrompt and _analysisSchema in the response",
          "2. Use AI to analyze the user's request and create a PromptAnalysis JSON object",
          "3. Call discover_components_and_apis tool with the analysis result",
        ],
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
