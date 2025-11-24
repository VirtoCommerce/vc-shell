/**
 * Intelligence Layer Types
 *
 * Types for smart matching, resolution, and validation.
 */

/**
 * Base matchable item interface
 */
export interface MatchableItem {
  id: string;
  name?: string;
  description?: string;
  keywords?: string[];
  [key: string]: any;
}

/**
 * Match options
 */
export interface MatchOptions {
  threshold?: number;
  limit?: number;
  caseSensitive?: boolean;
}

/**
 * Match result with scoring and reasoning
 */
export interface MatchResult<T> {
  item: T;
  score: number;
  confidence: number;
  reason: string;
  matches: string[];
  metadata?: Record<string, any>;
}

/**
 * Intent query for semantic matching
 */
export interface IntentQuery {
  intent: string;
  context?: "list" | "details" | "general";
  entity?: string;
  features?: string[];
  constraints?: Record<string, any>;
}

/**
 * Resolution options
 */
export interface ResolveOptions {
  required?: boolean;
  fallback?: any;
  validate?: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code?: string;
  severity: "error";
}

export interface ValidationWarning {
  path: string;
  message: string;
  code?: string;
  severity: "warning";
}

/**
 * Matcher configuration
 */
export interface MatcherConfig {
  threshold?: number;
  limit?: number;
  fuzzy?: boolean;
  semantic?: boolean;
  caseSensitive?: boolean;
}

/**
 * Intent match result with generic item type
 * NOTE: TemplateMatch is defined in resolvers/template-resolver.ts
 */
export interface IntentMatch<T = any> {
  item: T;
  score: number;
  confidence: number;
  reason: string;
  matches?: string[];
}
