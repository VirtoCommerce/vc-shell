/**
 * Submit Step Executor
 *
 * Validates and saves generated code.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * SubmitStepExecutor
 *
 * Step 6: Submit and validate generated code.
 */
export class SubmitStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      bladeId: string;
      code: string;
      cwd?: string;
      composable?: { name: string; code: string };
      apiClient?: { name: string; code: string };
      artifactType?: "blade" | "composable" | "apiClient"; // Track what type of artifact this is
    },
  ): Promise<StepResult> {
    const { bladeId, code, cwd, composable, apiClient, artifactType } = input;

    try {
      // Determine if this is an API client submission (no blade code, only apiClient)
      const isApiClientOnly = artifactType === "apiClient" || (!code && apiClient);

      console.log(`[SubmitStep] Validating ${isApiClientOnly ? "API client" : "blade"}: ${bladeId}`);

      // Basic validation
      const errors: string[] = [];

      if (isApiClientOnly) {
        // API client validation
        if (!apiClient?.code || apiClient.code.trim().length === 0) {
          errors.push("API client code is empty");
        }
        // Check for valid TypeScript structure
        if (apiClient?.code && !apiClient.code.includes("export")) {
          errors.push("API client must export functions or classes");
        }
      } else {
        // Blade validation (Vue SFC)
        // Check code is not empty
        if (!code || code.trim().length === 0) {
          errors.push("Code is empty");
        }

        // Check code contains Vue SFC structure
        if (code && !code.includes("<template>") && !code.includes("<script")) {
          errors.push("Invalid Vue SFC structure");
        }

        // Check code uses Composition API
        if (code && !code.includes("setup") && !code.includes("<script setup")) {
          errors.push("Must use Vue 3 Composition API");
        }
      }

      if (errors.length > 0) {
        console.error(`[SubmitStep] ✗ Validation failed: ${errors.length} errors`);
        return {
          success: false,
          errors,
        };
      }

      // Save code if cwd provided
      if (cwd) {
        console.log(`[SubmitStep] Saving code to: ${cwd}`);

        const fs = await import("node:fs");
        const path = await import("node:path");

        const plan = state.plan;
        if (!plan) {
          return {
            success: false,
            errors: ["No plan found in state"],
          };
        }

        // Save blade file (only if not API client-only submission)
        if (!isApiClientOnly && code) {
          const bladePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "pages",
            `${bladeId}.vue`,
          );

          const dir = path.dirname(bladePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(bladePath, code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved blade: ${bladePath}`);
        }

        // Save composable if provided
        if (composable) {
          const composablePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "composables",
            composable.name,
          );

          const composableDir = path.dirname(composablePath);
          if (!fs.existsSync(composableDir)) {
            fs.mkdirSync(composableDir, { recursive: true });
          }

          fs.writeFileSync(composablePath, composable.code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved composable: ${composablePath}`);
        }

        // Save API client if provided
        // API client goes to src/api_client/ (NOT src/modules/{module}/api/)
        // This follows vendor-portal pattern where all API clients are in a shared location
        if (apiClient) {
          // Determine the correct path for API client
          // If name ends with ".api.ts", save to src/api_client/
          // Otherwise, use legacy path in src/modules/{module}/api/
          const isSharedApiClient = apiClient.name.endsWith(".api.ts");
          const clientPath = isSharedApiClient
            ? path.join(cwd, "src", "api_client", apiClient.name)
            : path.join(cwd, "src", "modules", plan.module, "api", apiClient.name);

          const clientDir = path.dirname(clientPath);
          if (!fs.existsSync(clientDir)) {
            fs.mkdirSync(clientDir, { recursive: true });
          }

          fs.writeFileSync(clientPath, apiClient.code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved API client: ${clientPath}`);
        }
      }

      console.log(`[SubmitStep] ✓ Code validated and saved successfully`);

      // Check if there are more blades to generate
      // Do NOT transition to "completed" - let the handler manage workflow state
      // The handler tracks completedBlades and determines when all are done
      return {
        success: true,
        data: {
          savedBladeId: bladeId,
        },
        // Do NOT set nextStep here - the workflow handler manages state transitions
        // nextStep: "completed" would break multi-blade generation
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Submit failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute from various states during the generation workflow
    // The workflow is: validating → generating → ai-codegen → code-validation → submitting
    // Also allow retry from "failed" state after validation/submission failure
    const currentStep = state.currentStep as string;
    return (
      currentStep === "generating" ||
      currentStep === "ai-codegen" ||
      currentStep === "code-validation" ||
      currentStep === "submitting" ||
      currentStep === "failed"
    );
  }

  getRequiredInput(): string[] {
    // bladeId is always required (for API client, it's the module name)
    // code is only required for blade submissions (not for API client-only)
    // The validation logic handles the different artifact types
    return ["bladeId"];
  }
}
