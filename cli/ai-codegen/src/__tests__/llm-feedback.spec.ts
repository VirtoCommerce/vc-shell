/**
 * Tests for LLMFeedbackFormatter
 * Tests AI-friendly error formatting and retry mechanism
 */

import { describe, it, expect } from "vitest";
import { LLMFeedbackFormatter } from "../core/llm-feedback.js";
import type { ValidationResult } from "../core/code-validator.js";

describe("LLMFeedbackFormatter", () => {
  const formatter = new LLMFeedbackFormatter();

  describe("formatValidationFeedback", () => {
    it("should return success message for valid code", () => {
      const validation: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(feedback.success).toBe(true);
      expect(feedback.message).toContain("✅");
      expect(feedback.message).toContain("validation passed");
      expect(feedback.canRetry).toBe(false);
    });

    it("should return success message with warnings", () => {
      const validation: ValidationResult = {
        valid: true,
        errors: [],
        warnings: ["Missing import from vue-i18n"],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(feedback.success).toBe(true);
      expect(feedback.message).toContain("1 warnings");
      expect(feedback.canRetry).toBe(false);
    });

    it("should return error feedback for invalid code on first attempt", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Missing <template> section",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(feedback.success).toBe(false);
      expect(feedback.message).toContain("❌");
      expect(feedback.message).toContain("attempt 1/3");
      expect(feedback.canRetry).toBe(true);
      expect(feedback.retryAttempt).toBe(2);
      expect(feedback.errors).toBeDefined();
      expect(feedback.errors?.length).toBe(1);
      expect(feedback.suggestions).toBeDefined();
    });

    it("should format multiple errors", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Missing <template> section",
          },
          {
            type: "convention",
            severity: "error",
            message: "Missing defineOptions() call",
          },
          {
            type: "component",
            severity: "error",
            message: "Component 'VcUnknown' not found",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_FULL",
      });

      expect(feedback.success).toBe(false);
      expect(feedback.errors?.length).toBe(3);
      expect(feedback.errors?.[0].category).toBe("Syntax Error");
      expect(feedback.errors?.[1].category).toBe("Convention Error");
      expect(feedback.errors?.[2].category).toBe("Component Error");
    });

    it("should indicate no retry after 3 attempts", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Parse error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 3,
        strategy: "AI_GUIDED",
      });

      expect(feedback.success).toBe(false);
      expect(feedback.message).toContain("after 3 attempts");
      expect(feedback.message).toContain("Falling back");
      expect(feedback.canRetry).toBe(false);
    });
  });

  describe("error formatting", () => {
    it("should format syntax errors with fix suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Missing <template> section",
            line: 1,
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      expect(error?.category).toBe("Syntax Error");
      expect(error?.severity).toBe("error");
      expect(error?.location).toContain("Line 1");
      expect(error?.fix).toContain("Add a <template> section");
    });

    it("should format component errors with registry hints", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "component",
            severity: "error",
            message: "Component 'VcUnknown' not found in component registry",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      expect(error?.category).toBe("Component Error");
      expect(error?.fix).toContain("vcunknown"); // component name is lowercased in message
      expect(error?.fix).toContain("valid VC-Shell component");
    });

    it("should format convention errors with pattern guidance", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "convention",
            severity: "error",
            message: "Component name must include defineOptions", // Message must contain "defineOptions"
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      expect(error?.category).toBe("Convention Error");
      // Fix suggestion is triggered by "defineoptions" (lowercased) in message
      expect(error?.fix).toContain("defineOptions");
      expect(error?.fix).toContain("name");
      expect(error?.fix).toContain("url");
    });

    it("should provide fix for VcField usage", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "convention",
            severity: "error",
            message: "VcField should not be used with v-model", // Message must contain "VcField"
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      // Message must contain "vcfield" (lowercased) to trigger specific fix
      expect(error?.fix).toContain("Field");
      expect(error?.fix).toContain("VcInput");
    });

    it("should provide fix for vee-validate import", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "convention",
            severity: "error",
            message: "Using Field component requires import from 'vee-validate'",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      expect(error?.fix).toContain("vee-validate");
      expect(error?.fix).toContain("form validation");
    });

    it("should include location with line and column", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Parse error",
            line: 42,
            column: 10,
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      const error = feedback.errors?.[0];
      expect(error?.location).toBe("Line 42, Column 10");
    });
  });

  describe("suggestions generation", () => {
    it("should provide syntax-specific suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Parse error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(feedback.suggestions).toBeDefined();
      expect(feedback.suggestions?.some((s) => s.includes("Vue SFC"))).toBe(
        true
      );
      expect(
        feedback.suggestions?.some((s) => s.includes("<template>"))
      ).toBe(true);
    });

    it("should provide component-specific suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "component",
            severity: "error",
            message: "Unknown component",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(
        feedback.suggestions?.some((s) => s.includes("@vc-shell/framework"))
      ).toBe(true);
      expect(feedback.suggestions?.some((s) => s.includes("VcBlade"))).toBe(
        true
      );
    });

    it("should provide convention-specific suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "convention",
            severity: "error",
            message: "Convention error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(
        feedback.suggestions?.some((s) => s.includes("defineOptions"))
      ).toBe(true);
      expect(
        feedback.suggestions?.some((s) => s.includes("PascalCase"))
      ).toBe(true);
    });

    it("should provide import-specific suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "import",
            severity: "error",
            message: "Import error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(
        feedback.suggestions?.some((s) => s.includes("@vc-shell/framework"))
      ).toBe(true);
      expect(feedback.suggestions?.some((s) => s.includes("vue"))).toBe(true);
    });

    it("should add AI_GUIDED strategy-specific suggestions", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_GUIDED",
      });

      expect(
        feedback.suggestions?.some((s) => s.includes("generation guide"))
      ).toBe(true);
    });

    it("should add retry-specific suggestions for attempt 2+", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Error",
          },
        ],
        warnings: [],
      };

      const feedback = formatter.formatValidationFeedback(validation, {
        attempt: 2,
        strategy: "AI_GUIDED",
      });

      expect(
        feedback.suggestions?.some((s) => s.includes("previous attempt"))
      ).toBe(true);
      expect(
        feedback.suggestions?.some((s) => s.includes("simplifying"))
      ).toBe(true);
    });
  });

  describe("error report generation", () => {
    it("should create detailed error report", () => {
      const validation: ValidationResult = {
        valid: false,
        errors: [
          {
            type: "syntax",
            severity: "error",
            message: "Parse error",
            line: 10,
            code: "TS1234",
          },
          {
            type: "convention",
            severity: "error",
            message: "Convention error",
          },
        ],
        warnings: ["Warning 1", "Warning 2"],
      };

      const report = formatter.createErrorReport(validation, {
        attempt: 1,
        maxAttempts: 3,
        previousErrors: [],
        bladeId: "products-list",
        strategy: "AI_GUIDED",
      });

      expect(report).toContain("VALIDATION FAILED");
      expect(report).toContain("Attempt 1/3");
      expect(report).toContain("Blade: products-list");
      expect(report).toContain("Strategy: AI_GUIDED");
      expect(report).toContain("Syntax Error");
      expect(report).toContain("Convention Error");
      expect(report).toContain("Parse error");
      expect(report).toContain("Line 10");
      expect(report).toContain("Code: TS1234");
      expect(report).toContain("Warnings (2)");
      expect(report).toContain("Warning 1");
    });
  });

  describe("retry mechanism", () => {
    it("should allow retry for attempts 1-2", () => {
      expect(formatter.canRetry(1)).toBe(true);
      expect(formatter.canRetry(2)).toBe(true);
    });

    it("should not allow retry for attempt 3", () => {
      expect(formatter.canRetry(3)).toBe(false);
    });

    it("should return max attempts as 3", () => {
      expect(formatter.getMaxAttempts()).toBe(3);
    });
  });
});
