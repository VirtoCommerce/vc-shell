/**
 * Validate Step Executor
 *
 * Validates UI-Plan against schema.
 * Can auto-fix common errors.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { UIPlan } from "../../generators/types";

/**
 * ValidateStepExecutor
 *
 * Step 4: Validate UI-Plan schema and structure.
 */
export class ValidateStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: { plan: UIPlan; autoFix?: boolean },
  ): Promise<StepResult> {
    const { plan, autoFix = false } = input;

    try {
      console.log(`[ValidateStep] Validating UI-Plan for module: ${plan.module}`);

      // Basic validations
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate $schema
      if (!plan.$schema) {
        if (autoFix) {
          plan.$schema = "https://vc-shell.dev/schemas/ui-plan.v1.json";
          warnings.push("Added missing $schema");
        } else {
          errors.push("Missing $schema");
        }
      }

      // Validate module name (kebab-case)
      if (!plan.module || !/^[a-z0-9-]+$/.test(plan.module)) {
        errors.push("Invalid module name: must be kebab-case");
      }

      // Validate blades
      if (!plan.blades || plan.blades.length === 0) {
        errors.push("No blades defined");
      }

      // Validate each blade
      for (const blade of plan.blades || []) {
        // Validate blade ID
        if (!blade.id || !/^[a-z0-9-]+$/.test(blade.id)) {
          errors.push(`Invalid blade ID: ${blade.id}`);
        }

        // Validate blade type
        if (!["list", "details"].includes(blade.type)) {
          errors.push(`Invalid blade type: ${blade.type}`);
        }

        // Validate route
        if (!blade.route || !blade.route.startsWith("/")) {
          errors.push(`Invalid route for blade ${blade.id}: ${blade.route}`);
        }

        // Validate component
        if (!blade.component || !blade.component.type) {
          errors.push(`Missing component type for blade ${blade.id}`);
        }
      }

      if (errors.length > 0) {
        console.error(`[ValidateStep] ✗ Validation failed: ${errors.length} errors`);
        return {
          success: false,
          errors,
          warnings,
        };
      }

      console.log(`[ValidateStep] ✓ Validation passed`);
      if (warnings.length > 0) {
        console.warn(`[ValidateStep] Warnings:`, warnings);
      }

      return {
        success: true,
        data: {
          plan, // Save validated plan to state
          validationResult: {
            valid: true,
            errors: [],
            warnings,
          },
        },
        nextStep: "validating" as any, // Transition to validating state (not generating yet)
        warnings,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Validation failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute if we have a plan
    return (
      !!state.plan &&
      (state.currentStep === ("planning" as any) || state.currentStep === ("validating" as any))
    );
  }

  getRequiredInput(): string[] {
    return ["plan"];
  }
}
