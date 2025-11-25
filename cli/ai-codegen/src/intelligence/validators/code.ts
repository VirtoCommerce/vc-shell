/**
 * Code Validator
 *
 * Validates generated Vue/TypeScript code for syntax, imports, and patterns.
 */

import type { SchemaValidationError } from "./schema";

export interface CodeValidationOptions {
  /**
   * Check for Vue SFC structure
   */
  checkVueSFC?: boolean;

  /**
   * Check for TypeScript syntax (basic)
   */
  checkTypeScript?: boolean;

  /**
   * Check for required imports
   */
  checkImports?: boolean;

  /**
   * Check for VC-Shell patterns
   */
  checkPatterns?: boolean;

  /**
   * Required imports (e.g., ['vue', '@vc-shell/framework'])
   */
  requiredImports?: string[];

  /**
   * Forbidden patterns (e.g., ['console.log', 'debugger'])
   */
  forbiddenPatterns?: string[];
}

export interface CodeValidationResult {
  valid: boolean;
  errors?: SchemaValidationError[];
  warnings?: string[];
  codeQuality?: {
    hasScript: boolean;
    hasTemplate: boolean;
    hasStyle: boolean;
    hasTypeScript: boolean;
    importsCount: number;
    linesOfCode: number;
  };
}

/**
 * CodeValidator
 *
 * Validates generated code quality and correctness.
 */
export class CodeValidator {
  constructor(private options: CodeValidationOptions = {}) {
    this.options.checkVueSFC = this.options.checkVueSFC ?? true;
    this.options.checkTypeScript = this.options.checkTypeScript ?? true;
    this.options.checkImports = this.options.checkImports ?? true;
    this.options.checkPatterns = this.options.checkPatterns ?? true;
  }

  /**
   * Validate Vue SFC code
   */
  validate(code: string): CodeValidationResult {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    // 1. Check Vue SFC structure
    if (this.options.checkVueSFC) {
      const sfcErrors = this.validateVueSFCInternal(code);
      errors.push(...sfcErrors.errors);
      warnings.push(...sfcErrors.warnings);
    }

    // 2. Check TypeScript
    if (this.options.checkTypeScript) {
      const tsErrors = this.validateTypeScriptInternal(code);
      errors.push(...tsErrors.errors);
      warnings.push(...tsErrors.warnings);
    }

    // 3. Check imports
    if (this.options.checkImports) {
      const importErrors = this.validateImports(code);
      errors.push(...importErrors.errors);
      warnings.push(...importErrors.warnings);
    }

    // 4. Check patterns
    if (this.options.checkPatterns) {
      const patternErrors = this.validatePatterns(code);
      errors.push(...patternErrors.errors);
      warnings.push(...patternErrors.warnings);
    }

    // 5. Calculate code quality metrics
    const codeQuality = this.calculateCodeQuality(code);

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      codeQuality,
    };
  }


  /**
   * Validate imports
   */
  private validateImports(code: string): {
    errors: SchemaValidationError[];
    warnings: string[];
  } {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    const requiredImports = this.options.requiredImports || [];

    for (const requiredImport of requiredImports) {
      const hasImport = code.includes(`from "${requiredImport}"`) || code.includes(`from '${requiredImport}'`);
      if (!hasImport) {
        warnings.push(`Missing import from '${requiredImport}'`);
      }
    }

    // Check for unused imports (simple heuristic)
    const importMatches = code.matchAll(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const namedImports = match[1]?.split(",").map((s) => s.trim()) || [];
      const defaultImport = match[2];
      const allImports = [...namedImports, defaultImport].filter(Boolean);

      for (const imp of allImports) {
        // Simple check: is import used anywhere in code?
        const usageRegex = new RegExp(`\\b${imp}\\b`, "g");
        const matches = code.match(usageRegex);
        // Should appear at least twice (once in import, once in usage)
        if (!matches || matches.length < 2) {
          warnings.push(`Import '${imp}' appears to be unused`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate patterns (forbidden and required)
   */
  private validatePatterns(code: string): {
    errors: SchemaValidationError[];
    warnings: string[];
  } {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    const forbiddenPatterns = this.options.forbiddenPatterns || [
      "console.log",
      "debugger",
      "alert(",
    ];

    for (const pattern of forbiddenPatterns) {
      if (code.includes(pattern)) {
        warnings.push(`Found forbidden pattern: '${pattern}'`);
      }
    }

    // Check for VC-Shell best practices
    if (code.includes("defineComponent")) {
      warnings.push("Consider using <script setup> instead of defineComponent");
    }

    if (code.includes("this.")) {
      warnings.push("Avoid 'this.' in Composition API - use refs and composables");
    }

    return { errors, warnings };
  }

  /**
   * Calculate code quality metrics
   */
  private calculateCodeQuality(code: string): {
    hasScript: boolean;
    hasTemplate: boolean;
    hasStyle: boolean;
    hasTypeScript: boolean;
    importsCount: number;
    linesOfCode: number;
  } {
    const hasScript = code.includes("<script");
    const hasTemplate = code.includes("<template>");
    const hasStyle = code.includes("<style");
    const hasTypeScript = code.includes('lang="ts"');

    const importMatches = code.match(/import\s+/g);
    const importsCount = importMatches ? importMatches.length : 0;

    const linesOfCode = code.split("\n").length;

    return {
      hasScript,
      hasTemplate,
      hasStyle,
      hasTypeScript,
      importsCount,
      linesOfCode,
    };
  }

  /**
   * Quick syntax check (lighter validation)
   */
  quickCheck(code: string): boolean {
    return (
      code.includes("<template>") &&
      code.includes("<script") &&
      code.includes("</template>") &&
      code.includes("</script>")
    );
  }

  /**
   * Public method to validate Vue SFC code
   * Returns validation result with errors and warnings
   */
  validateVueSFC(code: string): CodeValidationResult {
    const sfcResult = this.validateVueSFCInternal(code);
    const tsResult = this.validateTypeScriptInternal(code);

    const errors = [...sfcResult.errors, ...tsResult.errors];
    const warnings = [...sfcResult.warnings, ...tsResult.warnings];

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      codeQuality: this.calculateCodeQuality(code),
    };
  }

  /**
   * Public method to validate TypeScript code (non-SFC)
   * For composables, API clients, and other .ts files
   */
  validateTypeScriptCode(code: string): CodeValidationResult {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    // Check for basic syntax errors
    const unbalancedBraces =
      (code.match(/{/g) || []).length !== (code.match(/}/g) || []).length;
    if (unbalancedBraces) {
      errors.push({
        path: "file",
        message: "Unbalanced braces in TypeScript file",
      });
    }

    const unbalancedParens =
      (code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length;
    if (unbalancedParens) {
      errors.push({
        path: "file",
        message: "Unbalanced parentheses in TypeScript file",
      });
    }

    // Check for 'any' type usage
    if (code.includes(": any")) {
      warnings.push("Avoid using 'any' type - use specific types instead");
    }

    // Check for export
    if (!code.includes("export")) {
      warnings.push("No exports found in TypeScript file");
    }

    // Check for proper async/await
    if (code.includes("async ") && !code.includes("await ")) {
      warnings.push("Async function without await - consider if async is needed");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Internal Vue SFC validation (renamed from private validateVueSFC)
   */
  private validateVueSFCInternal(code: string): {
    errors: SchemaValidationError[];
    warnings: string[];
  } {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    // Check for <template>
    if (!code.includes("<template>")) {
      errors.push({
        path: "template",
        message: "Missing <template> block",
      });
    }

    // Check for <script>
    if (!code.includes("<script")) {
      errors.push({
        path: "script",
        message: "Missing <script> block",
      });
    }

    // Check for setup attribute
    if (!code.includes("<script setup")) {
      warnings.push("Consider using <script setup> for Composition API");
    }

    // Check for TypeScript
    if (!code.includes('lang="ts"')) {
      warnings.push("Consider using TypeScript (lang=\"ts\")");
    }

    // Check for balanced tags
    const allTemplateOpenTags = (code.match(/<template[>\s]/g) || []).length;
    const allTemplateCloseTags = (code.match(/<\/template>/g) || []).length;
    if (allTemplateOpenTags !== allTemplateCloseTags) {
      errors.push({
        path: "template",
        message: "Unbalanced <template> tags",
      });
    }

    const scriptCount = (code.match(/<script/g) || []).length;
    const scriptCloseCount = (code.match(/<\/script>/g) || []).length;
    if (scriptCount !== scriptCloseCount) {
      errors.push({
        path: "script",
        message: "Unbalanced <script> tags",
      });
    }

    return { errors, warnings };
  }

  /**
   * Internal TypeScript validation (renamed from private validateTypeScript)
   */
  private validateTypeScriptInternal(code: string): {
    errors: SchemaValidationError[];
    warnings: string[];
  } {
    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];

    // Extract script content
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) return { errors, warnings };

    const scriptContent = scriptMatch[1];

    // Check for basic syntax errors
    const unbalancedBraces =
      (scriptContent.match(/{/g) || []).length !== (scriptContent.match(/}/g) || []).length;
    if (unbalancedBraces) {
      errors.push({
        path: "script",
        message: "Unbalanced braces in script",
      });
    }

    const unbalancedParens =
      (scriptContent.match(/\(/g) || []).length !== (scriptContent.match(/\)/g) || []).length;
    if (unbalancedParens) {
      errors.push({
        path: "script",
        message: "Unbalanced parentheses in script",
      });
    }

    // Check for 'any' type usage
    if (scriptContent.includes(": any")) {
      warnings.push("Avoid using 'any' type - use specific types instead");
    }

    // Check for proper typing
    if (scriptContent.includes("defineProps(") && !scriptContent.includes("withDefaults")) {
      warnings.push("Consider using withDefaults for props with default values");
    }

    return { errors, warnings };
  }
}
