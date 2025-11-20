/**
 * Type definitions for external rule system
 *
 * Rules can be defined in YAML files and loaded dynamically.
 * This allows for easy customization without code changes.
 */

export type RuleCategory = "critical" | "constraint" | "best-practice" | "custom";
export type RuleSeverity = "error" | "warning" | "info";
export type BladeType = "list" | "details" | "edit" | "all";
export type GenerationStrategy = "AI_FULL" | "COMPOSITION" | "TEMPLATE" | "ALL";

/**
 * Forbidden pattern definition
 */
export interface ForbiddenPattern {
  /** Regex pattern or literal string to match */
  pattern?: string;
  /** File name or path pattern to forbid */
  file?: string;
  /** Reason why this pattern is forbidden */
  reason: string;
  /** Severity level */
  severity: RuleSeverity;
  /** Only applies to specific strategy */
  strategy?: GenerationStrategy;
  /** Exception description (when this pattern IS allowed) */
  exception?: string;
}

/**
 * Required pattern definition
 */
export interface RequiredPattern {
  /** Regex pattern that must exist */
  pattern: string;
  /** Condition when this is required */
  when?: string;
  /** Severity if missing */
  severity: RuleSeverity;
  /** Strategy where this is required */
  strategy?: GenerationStrategy;
}

/**
 * Code pattern example
 */
export interface PatternExample {
  /** Path to example file (relative to /examples) */
  file?: string;
  /** Inline code example */
  inline?: string;
  /** Description of this pattern */
  description?: string;
}

/**
 * Validation check configuration
 */
export interface ValidationCheck {
  /** Type of validation */
  type: "regex" | "required_import" | "forbidden_file" | "forbidden_function" | "custom";
  /** Regex pattern to check */
  pattern?: string;
  /** File pattern to check */
  file?: string;
  /** Import name to require */
  import?: string;
  /** Import source */
  from?: string;
  /** Function name to forbid */
  function?: string;
  /** Condition when to apply this check */
  when?: string;
  /** Error/warning message */
  message: string;
  /** Strategy where this applies */
  strategy?: GenerationStrategy;
}

/**
 * Auto-fix transformation
 */
export interface AutoFixTransform {
  /** Pattern to find (regex) */
  find: string;
  /** Replacement pattern */
  replace: string;
  /** Import to add if fix is applied */
  add_import?: {
    name: string;
    from: string;
  };
}

/**
 * Auto-fix configuration
 */
export interface AutoFix {
  /** Whether auto-fix is enabled */
  enabled: boolean;
  /** List of transformations */
  transforms?: AutoFixTransform[];
}

/**
 * Complete rule definition
 */
export interface Rule {
  /** Rule ID (e.g., "01", "09", "13") */
  id: string;
  /** Human-readable name */
  name: string;
  /** Category */
  category: RuleCategory;
  /** Priority (higher = more important) */
  priority: number;
  /** Whether this rule is enabled */
  enabled: boolean;
  /** Strategy where this applies */
  strategy?: GenerationStrategy;
  /** Blade types where this applies */
  applies_to?: BladeType[];
  /** Rule description */
  description: string;
  /** Forbidden patterns */
  forbidden?: ForbiddenPattern[];
  /** Required patterns */
  required?: RequiredPattern[];
  /** Correct pattern example */
  correct_pattern?: PatternExample;
  /** Wrong pattern example */
  wrong_pattern?: PatternExample;
  /** Additional examples */
  examples?: string[];
  /** Validation checks */
  validations?: ValidationCheck[];
  /** Auto-fix configuration */
  auto_fix?: AutoFix;
  /** Additional instructions */
  instructions?: string;
  /** Why this rule exists */
  rationale?: string;
}

/**
 * Validation result
 */
export interface ValidationError {
  /** Rule that failed */
  rule: string;
  /** Error message */
  message: string;
  /** Line number (if applicable) */
  line?: number;
  /** Severity */
  severity?: RuleSeverity;
}

/**
 * Auto-fix suggestion
 */
export interface AutoFixSuggestion {
  /** Rule that generated this fix */
  rule: string;
  /** Description of the fix */
  description: string;
  /** Transformation to apply */
  transform: AutoFixTransform;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether code passes validation */
  valid: boolean;
  /** List of errors */
  errors: ValidationError[];
  /** List of warnings */
  warnings: ValidationError[];
  /** Auto-fix suggestions */
  autoFixes?: AutoFixSuggestion[];
}

/**
 * Rules loader options
 */
export interface RulesLoaderOptions {
  /** Base directory for rules */
  rulesDir?: string;
  /** Base directory for examples */
  examplesDir?: string;
  /** Enable caching */
  cache?: boolean;
}
