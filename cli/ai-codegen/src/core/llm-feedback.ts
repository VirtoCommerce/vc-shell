/**
 * LLM Feedback System
 *
 * Provides structured feedback to AI when code validation fails.
 * Formats validation errors in a way that helps AI understand and fix issues.
 */

import type { ValidationError, ValidationResult } from "./code-validator";

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  previousErrors: ValidationError[];
  bladeId: string;
  strategy: "AI_FULL";
}

export interface FeedbackMessage {
  success: boolean;
  message: string;
  errors?: FormattedError[];
  suggestions?: string[];
  canRetry: boolean;
  retryAttempt?: number;
}

export interface FormattedError {
  category: string;
  severity: "error" | "warning";
  description: string;
  location?: string;
  fix?: string;
}

/**
 * LLMFeedbackFormatter - Formats validation results for AI consumption
 */
export class LLMFeedbackFormatter {
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Format validation result into AI-friendly feedback
   */
  formatValidationFeedback(
    validation: ValidationResult,
    context: Partial<RetryContext>
  ): FeedbackMessage {
    const attempt = context.attempt || 1;
    const canRetry = attempt < this.MAX_ATTEMPTS;

    if (validation.valid) {
      return {
        success: true,
        message: `✅ Code validation passed! ${
          validation.warnings.length > 0
            ? `Found ${validation.warnings.length} warnings (non-blocking).`
            : "No issues found."
        }`,
        canRetry: false,
      };
    }

    // Format errors for AI
    const formattedErrors = this.formatErrors(validation.errors);
    const suggestions = this.generateSuggestions(validation.errors, context);

    return {
      success: false,
      message: canRetry
        ? `❌ Code validation failed (attempt ${attempt}/${this.MAX_ATTEMPTS}). Please review errors and regenerate.`
        : `❌ Code validation failed after ${this.MAX_ATTEMPTS} attempts. AI full mode has no automated fallback; regenerate using the guide.`,
      errors: formattedErrors,
      suggestions,
      canRetry,
      retryAttempt: attempt + 1,
    };
  }

  /**
   * Format errors for AI readability
   */
  private formatErrors(errors: ValidationError[]): FormattedError[] {
    return errors.map((error) => {
      const formatted: FormattedError = {
        category: this.getCategoryLabel(error.type),
        severity: error.severity,
        description: error.message,
      };

      // Add location if available
      if (error.line) {
        formatted.location = `Line ${error.line}${error.column ? `, Column ${error.column}` : ""}`;
      }

      // Add fix suggestion
      formatted.fix = this.getFixSuggestion(error);

      return formatted;
    });
  }

  /**
   * Get human-readable category label
   */
  private getCategoryLabel(type: string): string {
    const labels: Record<string, string> = {
      syntax: "Syntax Error",
      typescript: "TypeScript Error",
      component: "Component Error",
      import: "Import Error",
      convention: "Convention Error",
    };
    return labels[type] || type;
  }

  /**
   * Generate fix suggestion based on error type
   */
  private getFixSuggestion(error: ValidationError): string {
    const message = error.message.toLowerCase();

    // Syntax errors
    if (error.type === "syntax") {
      if (message.includes("missing <template>")) {
        return "Add a <template> section with your component markup";
      }
      if (message.includes("missing <script>")) {
        return "Add a <script setup lang=\"ts\"> section with your component logic";
      }
      return "Fix the syntax error in your Vue SFC structure";
    }

    // Component errors
    if (error.type === "component") {
      const componentMatch = message.match(/'([^']+)'/);
      const componentName = componentMatch ? componentMatch[1] : "component";
      return `Check if '${componentName}' is a valid VC-Shell component. Available components: VcBlade, VcTable, VcForm, VcInput, etc.`;
    }

    // Convention errors
    if (error.type === "convention") {
      if (message.includes("defineoptions")) {
        return "Add defineOptions({ name: 'ComponentName', url: '/route' }) at the top of your script";
      }
      if (message.includes("pascalcase")) {
        return "Use PascalCase for component name (e.g., 'ProductsList' not 'products-list')";
      }
      if (message.includes("kebab-case")) {
        return "Use lowercase kebab-case for URLs (e.g., '/products' not '/Products')";
      }
      if (message.includes("vee-validate")) {
        return "Import Field from 'vee-validate' when using form validation";
      }
      if (message.includes("vcfield")) {
        return "Use <Field v-slot=\"{ field }\"><VcInput v-bind=\"field\" /></Field> for form inputs, not VcField with v-model";
      }
    }

    // Import errors
    if (error.type === "import") {
      if (message.includes("@vc-shell/framework")) {
        return "Add: import { VcBlade, ... } from '@vc-shell/framework';";
      }
      if (message.includes("vue")) {
        return "Add: import { ref, computed, onMounted } from 'vue';";
      }
    }

    // TypeScript errors
    if (error.type === "typescript") {
      return "Fix the TypeScript type error. Check variable types and function signatures.";
    }

    return "Review and fix the error";
  }

  /**
   * Generate helpful suggestions based on error patterns
   */
  private generateSuggestions(
    errors: ValidationError[],
    context: Partial<RetryContext>
  ): string[] {
    const suggestions: string[] = [];
    const errorTypes = new Set(errors.map((e) => e.type));

    // Syntax errors
    if (errorTypes.has("syntax")) {
      suggestions.push(
        "Ensure your Vue SFC has proper structure: <template>, <script setup lang=\"ts\">, and optional <style>"
      );
      suggestions.push(
        "Check that all opening tags have corresponding closing tags"
      );
    }

    // Component errors
    if (errorTypes.has("component")) {
      suggestions.push(
        "Verify all components are from @vc-shell/framework package"
      );
      suggestions.push(
        "Common VC-Shell components: VcBlade, VcTable, VcForm, VcInput, VcTextarea, VcSelect, VcButton"
      );
      suggestions.push(
        "Check component documentation at: vcshell://component-registry"
      );
    }

    // Convention errors
    if (errorTypes.has("convention")) {
      suggestions.push(
        "Follow VC-Shell conventions: defineOptions() at top, PascalCase names, kebab-case URLs"
      );
      suggestions.push(
        "Use vee-validate Field component for form inputs: <Field v-slot=\"{ field }\"><VcInput v-bind=\"field\" /></Field>"
      );
      suggestions.push(
        "Use i18n for all user-facing text: {{ $t('MODULE.PAGES.BLADE.KEY') }}"
      );
    }

    // Import errors
    if (errorTypes.has("import")) {
      suggestions.push(
        "Import all used components from '@vc-shell/framework'"
      );
      suggestions.push(
        "Import Vue Composition API functions from 'vue'"
      );
      suggestions.push(
        "Import i18n from 'vue-i18n' if using translations"
      );
    }

    // Strategy-specific suggestions
    if (context.strategy === "AI_FULL") {
      suggestions.push(
        "Re-read the AI generation guide provided for this blade and ensure every constraint is applied"
      );
      suggestions.push(
        "Validate component imports against the registry to avoid missing/invalid components"
      );
    }

    // Retry-specific suggestions
    if (context.attempt && context.attempt > 1) {
      suggestions.push(
        "Review errors from previous attempt and make targeted fixes"
      );
      suggestions.push(
        "If stuck, consider simplifying the implementation first"
      );
    }

    return suggestions;
  }

  /**
   * Create detailed error report for logging
   */
  createErrorReport(
    validation: ValidationResult,
    context: RetryContext
  ): string {
    const lines: string[] = [];

    lines.push(`\n${"=".repeat(60)}`);
    lines.push(`  VALIDATION FAILED - Attempt ${context.attempt}/${this.MAX_ATTEMPTS}`);
    lines.push(`  Blade: ${context.bladeId}`);
    lines.push(`  Strategy: ${context.strategy}`);
    lines.push(`${"=".repeat(60)}\n`);

    // Group errors by type
    const errorsByType = new Map<string, ValidationError[]>();
    for (const error of validation.errors) {
      const existing = errorsByType.get(error.type) || [];
      existing.push(error);
      errorsByType.set(error.type, existing);
    }

    // Report each error type
    for (const [type, errors] of errorsByType) {
      lines.push(`\n${this.getCategoryLabel(type)} (${errors.length}):`);
      lines.push("-".repeat(40));

      for (const error of errors) {
        lines.push(`  • ${error.message}`);
        if (error.line) {
          lines.push(`    Location: Line ${error.line}${error.column ? `, Column ${error.column}` : ""}`);
        }
        if (error.code) {
          lines.push(`    Code: ${error.code}`);
        }
        lines.push(`    Fix: ${this.getFixSuggestion(error)}`);
        lines.push("");
      }
    }

    // Add warnings if any
    if (validation.warnings.length > 0) {
      lines.push(`\nWarnings (${validation.warnings.length}):`);
      lines.push("-".repeat(40));
      for (const warning of validation.warnings) {
        lines.push(`  ⚠ ${warning}`);
      }
    }

    lines.push(`\n${"=".repeat(60)}\n`);

    return lines.join("\n");
  }

  /**
   * Check if retry is allowed
   */
  canRetry(attempt: number): boolean {
    return attempt < this.MAX_ATTEMPTS;
  }

  /**
   * Get max attempts
   */
  getMaxAttempts(): number {
    return this.MAX_ATTEMPTS;
  }
}

/**
 * Default instance
 */
export const llmFeedback = new LLMFeedbackFormatter();
