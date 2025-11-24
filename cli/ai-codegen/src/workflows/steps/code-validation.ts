/**
 * Code Validation Step Executor
 *
 * Validates AI-generated code against:
 * 1. UI-Plan specifications
 * 2. TypeScript type correctness
 * 3. VC-Shell framework requirements
 *
 * If validation fails:
 * - Collects all errors
 * - Sends back to AI for retry (up to 3 attempts)
 * - After 3 failures, marks as failed
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { AIGeneratedCode } from "./ai-codegen";
import { ASTValidator } from "../../intelligence/validators/ast-validator";

export interface ValidationError {
  type: "plan-mismatch" | "type-error" | "framework-violation" | "syntax-error";
  file: string;
  line?: number;
  message: string;
  severity: "error" | "warning";
}

/**
 * CodeValidationStepExecutor
 *
 * Step 7: Validate AI-generated code.
 *
 * Validation steps:
 * 1. Parse generated code
 * 2. Check against UI-Plan
 * 3. Run TypeScript type check
 * 4. Check framework usage
 * 5. If errors → retry with AI (up to 3 times)
 * 6. If success → proceed to Submit
 */
export class CodeValidationStepExecutor implements StepExecutor {
  private maxRetries = 3;

  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      generatedCode: AIGeneratedCode[];
      retryCount?: number;
    },
  ): Promise<StepResult> {
    const { generatedCode, retryCount = 0 } = input;
    const { codeValidator, uiPlanValidator } = context;

    try {
      console.log(`[CodeValidationStep] Validating ${generatedCode.length} generated files`);
      console.log(`[CodeValidationStep] Retry attempt: ${retryCount}/${this.maxRetries}`);

      const allErrors: ValidationError[] = [];
      const validatedCode: AIGeneratedCode[] = [];

      // Validate each generated blade
      for (const code of generatedCode) {
        console.log(`[CodeValidationStep] Validating blade: ${code.bladeId}`);

        // Step 1: Validate against UI-Plan
        const planErrors = await this.validateAgainstPlan(code, state.plan, uiPlanValidator);
        allErrors.push(...planErrors);

        // Step 2: Validate TypeScript
        const typeErrors = await this.validateTypeScript(code, codeValidator);
        allErrors.push(...typeErrors);

        // Step 3: Validate framework usage
        const frameworkErrors = await this.validateFrameworkUsage(code, context);
        allErrors.push(...frameworkErrors);

        // Step 4: Validate syntax
        const syntaxErrors = await this.validateSyntax(code);
        allErrors.push(...syntaxErrors);

        if (planErrors.length === 0 && typeErrors.length === 0 && frameworkErrors.length === 0 && syntaxErrors.length === 0) {
          validatedCode.push(code);
          console.log(`[CodeValidationStep] ✓ ${code.bladeId} validated successfully`);
        } else {
          console.log(`[CodeValidationStep] ✗ ${code.bladeId} has ${allErrors.length} errors`);
        }
      }

      // Check if all code is valid
      const criticalErrors = allErrors.filter((e) => e.severity === "error");

      if (criticalErrors.length === 0) {
        console.log(`[CodeValidationStep] ✅ All code validated successfully`);
        console.log(`[CodeValidationStep] Warnings: ${allErrors.filter((e) => e.severity === "warning").length}`);

        return {
          success: true,
          data: {
            validatedCode,
            warnings: allErrors.filter((e) => e.severity === "warning"),
          },
          nextStep: "submitting" as any,
        };
      }

      // Has critical errors - check if we can retry
      if (retryCount < this.maxRetries) {
        console.log(`[CodeValidationStep] ⚠️  Found ${criticalErrors.length} critical errors`);
        console.log(`[CodeValidationStep] 🔄 Retrying with AI (attempt ${retryCount + 1}/${this.maxRetries})`);

        return {
          success: false,
          data: {
            validationErrors: criticalErrors,
            retryCount: retryCount + 1,
            needsRetry: true,
          },
          nextStep: "ai-codegen" as any, // Go back to AI generation
          errors: criticalErrors.map((e) => `${e.file}: ${e.message}`),
        };
      }

      // Max retries exceeded
      console.log(`[CodeValidationStep] ❌ Max retries (${this.maxRetries}) exceeded`);
      console.log(`[CodeValidationStep] Failed with ${criticalErrors.length} critical errors`);

      return {
        success: false,
        errors: criticalErrors.map((e) => `${e.file}:${e.line || 0} - ${e.message}`),
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Code validation failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    return !!state.generatedCode || !!state.aiPrompts;
  }

  getRequiredInput(): string[] {
    return ["generatedCode"];
  }

  /**
   * Validate code against UI-Plan
   */
  private async validateAgainstPlan(
    code: AIGeneratedCode,
    plan: any,
    validator: any,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Find corresponding blade in plan
      const bladePlan = plan?.blades?.find((b: any) => b.id === code.bladeId);
      if (!bladePlan) {
        errors.push({
          type: "plan-mismatch",
          file: code.blade.path,
          message: `Blade ${code.bladeId} not found in UI-Plan`,
          severity: "error",
        });
        return errors;
      }

      // Check if required components are used
      const requiredComponent = bladePlan.component?.type;
      if (requiredComponent && !code.blade.content.includes(requiredComponent)) {
        errors.push({
          type: "plan-mismatch",
          file: code.blade.path,
          message: `Required component ${requiredComponent} not found in blade`,
          severity: "error",
        });
      }

      // Check if required features are implemented
      for (const feature of bladePlan.features || []) {
        // Simple check - can be improved
        const featureKeywords = {
          filters: ["filters", "filter"],
          multiselect: ["multiselect", "selection"],
          validation: ["validate", "rules"],
          sort: ["sort", "sortable"],
        };

        const keywords = featureKeywords[feature as keyof typeof featureKeywords];
        if (keywords && !keywords.some((kw) => code.blade.content.toLowerCase().includes(kw))) {
          errors.push({
            type: "plan-mismatch",
            file: code.blade.path,
            message: `Feature "${feature}" does not appear to be implemented`,
            severity: "warning",
          });
        }
      }
    } catch (error: any) {
      errors.push({
        type: "plan-mismatch",
        file: code.blade.path,
        message: `Plan validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Validate TypeScript types
   */
  private async validateTypeScript(
    code: AIGeneratedCode,
    validator: any,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Validate blade (Vue SFC)
      const bladeResult = await validator.validateVueSFC(code.blade.content);
      if (!bladeResult.valid) {
        bladeResult.errors?.forEach((err: any) => {
          errors.push({
            type: "type-error",
            file: code.blade.path,
            line: err.line,
            message: err.message,
            severity: "error",
          });
        });
      }

      // Validate composable
      if (code.composable) {
        const composableResult = await validator.validateTypeScript(code.composable.content);
        if (!composableResult.valid) {
          composableResult.errors?.forEach((err: any) => {
            errors.push({
              type: "type-error",
              file: code.composable!.path,
              line: err.line,
              message: err.message,
              severity: "error",
            });
          });
        }
      }

      // Validate API client
      if (code.apiClient) {
        const apiResult = await validator.validateTypeScript(code.apiClient.content);
        if (!apiResult.valid) {
          apiResult.errors?.forEach((err: any) => {
            errors.push({
              type: "type-error",
              file: code.apiClient!.path,
              line: err.line,
              message: err.message,
              severity: "error",
            });
          });
        }
      }
    } catch (error: any) {
      errors.push({
        type: "type-error",
        file: code.blade.path,
        message: `TypeScript validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Validate VC-Shell framework usage
   */
  private async validateFrameworkUsage(
    code: AIGeneratedCode,
    context: WorkflowContext,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      const { kb } = context;
      const astValidator = new ASTValidator();

      // Parse Vue SFC using AST
      const astResult = astValidator.parseVueSFC(code.blade.content);

      // Check that only registered components are used
      const registeredComponents = kb.components.getAll().map((c: any) => c.component);

      astResult.components.forEach((comp) => {
        if (!registeredComponents.includes(comp)) {
          errors.push({
            type: "framework-violation",
            file: code.blade.path,
            message: `Component <${comp}> is not a registered VC-Shell component`,
            severity: "error",
          });
        }
      });

      // Get framework hooks that need validation
      const frameworkHooks = astValidator.getFrameworkHooks(astResult.hooks);
      const registeredHooks = kb.frameworkAPIs.getAll().map((api: any) => api.name);

      frameworkHooks.forEach((hook) => {
        if (!registeredHooks.includes(hook)) {
          errors.push({
            type: "framework-violation",
            file: code.blade.path,
            message: `Hook ${hook} is not a registered VC-Shell framework API`,
            severity: "error",
          });
        }
      });

      // Also validate composable if present
      if (code.composable) {
        const composableResult = astValidator.parseTypeScript(code.composable.content);
        const composableFrameworkHooks = astValidator.getFrameworkHooks(composableResult.hooks);

        composableFrameworkHooks.forEach((hook) => {
          if (!registeredHooks.includes(hook)) {
            errors.push({
              type: "framework-violation",
              file: code.composable!.path,
              message: `Hook ${hook} is not a registered VC-Shell framework API`,
              severity: "error",
            });
          }
        });
      }
    } catch (error: any) {
      errors.push({
        type: "framework-violation",
        file: code.blade.path,
        message: `Framework validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Validate syntax
   */
  private async validateSyntax(code: AIGeneratedCode): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Check Vue SFC structure
      if (!code.blade.content.includes("<template>") || !code.blade.content.includes("</template>")) {
        errors.push({
          type: "syntax-error",
          file: code.blade.path,
          message: "Missing <template> section in Vue SFC",
          severity: "error",
        });
      }

      if (!code.blade.content.includes("<script")) {
        errors.push({
          type: "syntax-error",
          file: code.blade.path,
          message: "Missing <script> section in Vue SFC",
          severity: "error",
        });
      }

      // Check for common syntax errors
      const openBraces = (code.blade.content.match(/{/g) || []).length;
      const closeBraces = (code.blade.content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push({
          type: "syntax-error",
          file: code.blade.path,
          message: `Mismatched braces: ${openBraces} open, ${closeBraces} close`,
          severity: "error",
        });
      }

      // Check TypeScript files
      if (code.composable) {
        if (!code.composable.content.includes("export")) {
          errors.push({
            type: "syntax-error",
            file: code.composable.path,
            message: "No exports found in composable",
            severity: "warning",
          });
        }
      }
    } catch (error: any) {
      errors.push({
        type: "syntax-error",
        file: code.blade.path,
        message: `Syntax validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

}
