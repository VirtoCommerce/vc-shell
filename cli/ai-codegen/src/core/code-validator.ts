import * as parser from "@babel/parser";
import { parse as parseVueSFC } from "@vue/compiler-sfc";
import * as ts from "typescript";
import type { UIPlanBlade } from "../schemas/zod-schemas";
import { QualityMetrics, type CompletenessResult } from "./quality-metrics";
import { ASTUtils } from "./ast-utils";
import { loadComponentNames } from "./component-registry-loader";

export interface ValidationError {
  type: "syntax" | "typescript" | "component" | "import" | "convention" | "completeness";
  severity: "error" | "warning";
  message: string;
  line?: number;
  column?: number;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  completeness?: CompletenessResult;
}

/**
 * CodeValidator validates AI-generated code on multiple levels
 *
 * Validation levels:
 * 1. Syntax - Parse with Babel AST, check Vue SFC structure
 * 2. TypeScript - Type checking
 * 3. Component - Verify all VcComponents exist
 * 4. Import - Check all imports are valid
 * 5. Convention - Naming, i18n keys structure
 */
export class CodeValidator {
  private componentRegistry: Set<string>;
  private qualityMetrics: QualityMetrics;

  constructor(componentRegistry?: string[]) {
    // Load components from component-registry.json instead of hardcoded list
    this.componentRegistry = new Set(componentRegistry || loadComponentNames());
    this.qualityMetrics = new QualityMetrics();
  }

  /**
   * Validate syntax - Parse Vue SFC and check structure
   */
  validateSyntax(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Parse Vue SFC
      const { descriptor, errors: parseErrors } = parseVueSFC(code);

      if (parseErrors.length > 0) {
        for (const error of parseErrors) {
          errors.push({
            type: "syntax",
            severity: "error",
            message: `Vue SFC parse error: ${error.message}`,
            line: 'loc' in error && error.loc ? error.loc.start.line : undefined,
            column: 'loc' in error && error.loc ? error.loc.start.column : undefined,
          });
        }
        return { valid: false, errors, warnings };
      }

      // Check required sections
      if (!descriptor.template) {
        errors.push({
          type: "syntax",
          severity: "error",
          message: "Missing <template> section",
        });
      }

      if (!descriptor.script && !descriptor.scriptSetup) {
        errors.push({
          type: "syntax",
          severity: "error",
          message: "Missing <script> or <script setup> section",
        });
      }

      // Parse script section with Babel
      const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content;
      if (scriptContent) {
        try {
          parser.parse(scriptContent, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
          });
        } catch (error: any) {
          errors.push({
            type: "syntax",
            severity: "error",
            message: `Script parse error: ${error.message}`,
            line: error.loc?.line,
            column: error.loc?.column,
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [{
          type: "syntax",
          severity: "error",
          message: `Unexpected error during syntax validation: ${error.message}`,
        }],
        warnings,
      };
    }
  }

  /**
   * Validate TypeScript types
   *
   * Note: This uses ts.transpileModule which has limitations:
   * - Cannot check types from external modules
   * - Cannot verify import paths
   * - Only catches syntax-level type errors
   *
   * For full validation, use the IDE's TypeScript language server.
   */
  validateTypes(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Extract script content from Vue SFC
      const { descriptor } = parseVueSFC(code);
      const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content;

      if (!scriptContent) {
        return { valid: true, errors, warnings };
      }

      // Additional static checks before TypeScript compilation
      this.performStaticChecks(scriptContent, errors, warnings);

      // Transpile TypeScript with stricter options
      const result = ts.transpileModule(scriptContent, {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          strictFunctionTypes: true,
          noUnusedLocals: false, // Don't block on unused vars in generated code
          noUnusedParameters: false,
          skipLibCheck: true,
          noEmit: true,
          jsx: ts.JsxEmit.Preserve,
        },
        reportDiagnostics: true,
      });

      // Check diagnostics
      if (result.diagnostics && result.diagnostics.length > 0) {
        for (const diagnostic of result.diagnostics) {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
          const severity = diagnostic.category === ts.DiagnosticCategory.Error ? "error" : "warning";

          // Filter out some expected diagnostics for generated code
          if (this.shouldIgnoreDiagnostic(diagnostic.code || 0)) {
            continue;
          }

          if (severity === "error") {
            errors.push({
              type: "typescript",
              severity,
              message: `TypeScript error: ${message}`,
              code: `TS${diagnostic.code}`,
            });
          } else {
            warnings.push(message);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      // TypeScript validation errors are warnings, not blocking
      warnings.push(`TypeScript validation failed: ${error.message}`);
      return { valid: true, errors, warnings };
    }
  }

  /**
   * Perform static checks on code that can't be caught by ts.transpileModule
   */
  private performStaticChecks(code: string, errors: ValidationError[], warnings: string[]): void {
    // Check for common issues

    // 1. Missing type imports
    if (code.includes(': ITableColumns') && !code.includes('ITableColumns')) {
      warnings.push('ITableColumns type is used but may not be imported');
    }

    if (code.includes(': IBladeToolbar') && !code.includes('IBladeToolbar')) {
      warnings.push('IBladeToolbar type is used but may not be imported');
    }

    // 2. Check for any types (anti-pattern)
    const anyTypeRegex = /:\s*any(?!\w)/g;
    const anyMatches = code.match(anyTypeRegex);
    if (anyMatches && anyMatches.length > 0) {
      warnings.push(`Found ${anyMatches.length} usage(s) of 'any' type - consider using specific types`);
    }

    // 3. Check for missing await on async calls
    const asyncCallsWithoutAwait = code.match(/(?<!await\s+)\b(get|save|delete|load|fetch)\w+\(/g);
    if (asyncCallsWithoutAwait && asyncCallsWithoutAwait.length > 0) {
      warnings.push('Some async function calls may be missing await');
    }
  }

  /**
   * Check if diagnostic code should be ignored for generated code
   */
  private shouldIgnoreDiagnostic(code: number): boolean {
    const ignoredCodes = [
      2307, // Cannot find module (imports are not resolved by transpileModule)
      2304, // Cannot find name (external types)
      7016, // Could not find declaration file for module
    ];

    return ignoredCodes.includes(code);
  }

  /**
   * Validate components - Check all VcComponents exist in registry
   */
  validateComponents(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Use AST-based component tag extraction
      const usedComponents = ASTUtils.extractComponentTags(code);

      for (const componentName of usedComponents) {
        if (!this.componentRegistry.has(componentName)) {
          errors.push({
            type: "component",
            severity: "error",
            message: `Component '${componentName}' not found in component registry`,
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [{
          type: "component",
          severity: "error",
          message: `Component validation failed: ${error.message}`,
        }],
        warnings,
      };
    }
  }

  /**
   * Validate imports - Check all imports are valid
   */
  validateImports(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const { descriptor } = parseVueSFC(code);
      const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content;

      if (!scriptContent) {
        return { valid: true, errors, warnings };
      }

      // Use AST-based import extraction
      const importSources = ASTUtils.extractImportSources(scriptContent);

      // Check if required imports are present
      let hasFrameworkImport = false;
      let hasVueImport = false;

      for (const imported of importSources) {
        if (imported.includes("@vc-shell/framework")) hasFrameworkImport = true;
        if (imported === "vue") hasVueImport = true;
      }

      if (!hasFrameworkImport) {
        warnings.push("Missing import from @vc-shell/framework");
      }

      if (!hasVueImport) {
        warnings.push("Missing import from vue");
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      warnings.push(`Import validation failed: ${error.message}`);
      return { valid: true, errors, warnings };
    }
  }

  /**
   * Validate conventions - Naming, i18n keys, file structure
   */
  validateConventions(code: string, plan?: UIPlanBlade): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const { descriptor } = parseVueSFC(code);
      const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || "";
      const templateContent = descriptor.template?.content || "";

      // 1. Check defineOptions (must exist exactly once) - AST-based
      const defineOptionsCount = ASTUtils.countDefineOptions(scriptContent);

      if (defineOptionsCount === 0) {
        errors.push({
          type: "convention",
          severity: "error",
          message: "Missing defineOptions() call",
        });
      } else if (defineOptionsCount > 1) {
        errors.push({
          type: "convention",
          severity: "error",
          message: `Duplicate defineOptions() call (found ${defineOptionsCount} times). It should appear only once.`,
        });
      }

      // Continue validation only if exactly one defineOptions exists
      const defineOptions = ASTUtils.extractDefineOptions(scriptContent);
      if (defineOptions) {
        // Check name property (PascalCase)
        if (defineOptions.name) {
          const name = defineOptions.name;
          if (!/^[A-Z][a-zA-Z]+$/.test(name)) {
            errors.push({
              type: "convention",
              severity: "error",
              message: `Component name '${name}' must be PascalCase`,
            });
          }
        } else {
          errors.push({
            type: "convention",
            severity: "error",
            message: "Missing 'name' in defineOptions",
          });
        }

        // Check url property
        if (defineOptions.url) {
          const url = defineOptions.url;
          if (!url.startsWith("/")) {
            errors.push({
              type: "convention",
              severity: "error",
              message: `URL '${url}' must start with /`,
            });
          }
          if (!/^\/[a-z0-9/-]*$/.test(url)) {
            errors.push({
              type: "convention",
              severity: "error",
              message: `URL '${url}' must be lowercase kebab-case`,
            });
          }
        }
      }

      // 2. Check i18n usage - should use $t() for all strings
      const hardcodedStrings = templateContent.match(/["'](?!tw-|material-|#|@|\/)[A-Z][^"']*["']/g);
      if (hardcodedStrings && hardcodedStrings.length > 0) {
        warnings.push(`Found ${hardcodedStrings.length} potentially hardcoded strings. Use $t() for i18n.`);
      }

      // 3. Check i18n key format (MODULE.PAGES.BLADE.SECTION.KEY)
      const i18nMatches = scriptContent.matchAll(/\$t\s*\(\s*["']([^"']+)["']\s*\)/g);
      for (const match of i18nMatches) {
        const key = match[1];
        const parts = key.split(".");
        if (parts.length < 3) {
          warnings.push(`i18n key '${key}' should follow MODULE.PAGES.BLADE.SECTION.KEY pattern`);
        }
        // Check if all parts are SCREAMING_SNAKE_CASE
        for (const part of parts) {
          if (!/^[A-Z][A-Z0-9_]*$/.test(part)) {
            warnings.push(`i18n key part '${part}' should be SCREAMING_SNAKE_CASE`);
          }
        }
      }

      // 4. Check for Field usage with vee-validate
      if (templateContent.includes("<Field")) {
        const veeValidateImport = scriptContent.includes("from \"vee-validate\"") ||
                                  scriptContent.includes("from 'vee-validate'");
        if (!veeValidateImport) {
          errors.push({
            type: "convention",
            severity: "error",
            message: "Using Field component requires import from 'vee-validate'",
          });
        }
      }

      // 5. Check VcField is not used for form inputs
      if (templateContent.match(/<VcField[^>]*v-model/)) {
        errors.push({
          type: "convention",
          severity: "error",
          message: "VcField is for read-only display only. Use Field from vee-validate with VcInput for form inputs",
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      warnings.push(`Convention validation failed: ${error.message}`);
      return { valid: true, errors, warnings };
    }
  }

  /**
   * Validate that generated code matches the UI-Plan blade definition
   * Checks: route, layout, features, permissions
   */
  validateAgainstPlan(code: string, bladePlan: UIPlanBlade): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Parse Vue SFC to extract defineOptions
      const { descriptor } = parseVueSFC(code);
      if (!descriptor.script && !descriptor.scriptSetup) {
        errors.push({
          type: "convention",
          severity: "error",
          message: "No script section found in Vue SFC",
        });
        return { valid: false, errors, warnings };
      }

      const scriptContent = descriptor.scriptSetup?.content || descriptor.script?.content || "";

      // Extract defineOptions call using AST
      const defineOptions = ASTUtils.extractDefineOptions(scriptContent);
      if (!defineOptions) {
        errors.push({
          type: "convention",
          severity: "error",
          message: "defineOptions() not found in code. Cannot validate against plan.",
        });
        return { valid: false, errors, warnings };
      }

      // Validate route
      if (defineOptions.url) {
        const codeRoute = defineOptions.url;
        if (codeRoute !== bladePlan.route) {
          errors.push({
            type: "convention",
            severity: "error",
            message: `Route mismatch: code has "${codeRoute}" but plan requires "${bladePlan.route}"`,
          });
        }
      } else {
        warnings.push(`Route not found in defineOptions. Expected: ${bladePlan.route}`);
      }

      // Validate layout (if it exists in code)
      if (defineOptions.layout) {
        const codeLayout = defineOptions.layout;
        if (codeLayout !== bladePlan.layout) {
          errors.push({
            type: "convention",
            severity: "error",
            message: `Layout mismatch: code has "${codeLayout}" but plan requires "${bladePlan.layout}"`,
          });
        }
      }

      // Validate blade ID (if it exists in defineOptions)
      if (defineOptions.blade) {
        const codeBladeId = defineOptions.blade;
        if (codeBladeId !== bladePlan.id) {
          errors.push({
            type: "convention",
            severity: "error",
            message: `Blade ID mismatch: code has "${codeBladeId}" but plan requires "${bladePlan.id}"`,
          });
        }
      }

      return { valid: errors.length === 0, errors, warnings };
    } catch (error) {
      errors.push({
        type: "syntax",
        severity: "error",
        message: `Failed to validate against plan: ${error instanceof Error ? error.message : String(error)}`,
      });
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate code completeness against UI-Plan
   *
   * This is a STRICT validation that checks if all required features,
   * data structures, and business logic are fully implemented.
   *
   * Minimum acceptable score: 80%
   * - Features: all required features must be implemented
   * - Data structures: all columns/fields must be present
   * - Business logic: API client, handlers, validation required
   * - Anti-patterns: no TODOs, placeholders, or empty handlers
   *
   * @param code - Vue SFC code to validate
   * @param bladePlan - UI-Plan blade definition
   * @returns Validation result with completeness score
   */
  validateCompleteness(code: string, bladePlan: UIPlanBlade): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: string[] = [];

    // Evaluate completeness using QualityMetrics
    const completeness = this.qualityMetrics.evaluateCompleteness(code, bladePlan);

    // Convert completeness errors to ValidationError format
    for (const error of completeness.errors) {
      allErrors.push({
        type: "completeness",
        severity: "error",
        message: error,
      });
    }

    // Add warnings
    allWarnings.push(...completeness.warnings);

    // STRICT: Require minimum 80% completeness score
    const MIN_SCORE = 80;
    if (completeness.score < MIN_SCORE) {
      allErrors.push({
        type: "completeness",
        severity: "error",
        message:
          `Code completeness score is ${completeness.score}%, but minimum required is ${MIN_SCORE}%. ` +
          `Missing implementations: ${completeness.features.missing.join(', ') || 'none'}. ` +
          `Anti-patterns found: ${completeness.antiPatterns.hasTodos ? 'TODOs' : ''} ` +
          `${completeness.antiPatterns.hasPlaceholders ? 'Placeholders' : ''} ` +
          `${completeness.antiPatterns.hasEmptyHandlers ? 'Empty handlers' : ''}`.trim(),
      });
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      completeness,
    };
  }

  /**
   * Run all validations
   */
  validateFull(code: string, plan?: UIPlanBlade): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: string[] = [];

    // 1. Syntax validation (blocking)
    const syntaxResult = this.validateSyntax(code);
    allErrors.push(...syntaxResult.errors);
    allWarnings.push(...syntaxResult.warnings);

    if (!syntaxResult.valid) {
      // If syntax is invalid, stop here
      return { valid: false, errors: allErrors, warnings: allWarnings };
    }

    // 2. TypeScript validation (non-blocking, warnings only)
    const typeResult = this.validateTypes(code);
    allErrors.push(...typeResult.errors);
    allWarnings.push(...typeResult.warnings);

    // 3. Component validation (blocking)
    const componentResult = this.validateComponents(code);
    allErrors.push(...componentResult.errors);
    allWarnings.push(...componentResult.warnings);

    // 4. Import validation (non-blocking, warnings only)
    const importResult = this.validateImports(code);
    allErrors.push(...importResult.errors);
    allWarnings.push(...importResult.warnings);

    // 5. Convention validation (mix of errors and warnings)
    const conventionResult = this.validateConventions(code, plan);
    allErrors.push(...conventionResult.errors);
    allWarnings.push(...conventionResult.warnings);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
}

