/**
 * Quality Metrics Module
 *
 * Evaluates code completeness and quality against UI-Plan requirements.
 * Prevents AI from submitting incomplete code by detecting:
 * - Missing feature implementations
 * - TODO comments and placeholders
 * - Empty handlers and business logic gaps
 * - Missing API client usage
 *
 * @module quality-metrics
 * @since 0.9.0
 */

import type { UIPlanBlade } from "../schemas/zod-schemas";
import { ASTUtils } from "./ast-utils";

/**
 * Feature detection result
 */
export interface FeatureDetection {
  feature: string;
  implemented: boolean;
  indicators: string[];
  missingIndicators?: string[];
}

/**
 * Anti-pattern detection result
 */
export interface AntiPatternDetection {
  hasTodos: boolean;
  todoCount: number;
  hasPlaceholders: boolean;
  placeholderCount: number;
  hasEmptyHandlers: boolean;
  emptyHandlers: string[];
  hasAnyTypes: boolean;
  anyTypeCount: number;
}

/**
 * Data structure completeness
 */
export interface DataStructureCompleteness {
  columns?: {
    required: number;
    found: number;
    missing: string[];
  };
  fields?: {
    required: number;
    found: number;
    missing: string[];
  };
}

/**
 * Business logic completeness
 */
export interface BusinessLogicCompleteness {
  hasApiClientImport: boolean;
  hasApiClientUsage: boolean;
  hasEventHandlers: boolean;
  hasValidation: boolean;
  hasLoadingState: boolean;
  hasErrorHandling: boolean;
}

/**
 * Completeness evaluation result
 */
export interface CompletenessResult {
  score: number; // 0-100%
  features: {
    required: string[];
    implemented: string[];
    missing: string[];
    detections: FeatureDetection[];
  };
  dataStructures: DataStructureCompleteness;
  businessLogic: BusinessLogicCompleteness;
  antiPatterns: AntiPatternDetection;
  errors: string[];
  warnings: string[];
}

/**
 * Feature detection patterns
 * Each feature has indicators that must be present in code
 */
const FEATURE_PATTERNS: Record<string, { indicators: string[]; description: string }> = {
  filters: {
    indicators: [
      '<template #filters>',
      '<template #filters-header>',
      'const loading = ref',
      'loading.value',
    ],
    description: 'Filters slot with loading state management',
  },
  multiselect: {
    indicators: [
      'selectedItemIds',
      'multiselect',
      'const isItemSelected',
      'selectAll',
      'unselectAll',
    ],
    description: 'Multiselect functionality with item selection tracking',
  },
  validation: {
    indicators: [
      'yup.object',
      'z.object',
      'useForm',
      'validationSchema',
      'handleSubmit',
    ],
    description: 'Form validation with yup or zod schema',
  },
  gallery: {
    indicators: ['<VcGallery', 'images:', 'gallery'],
    description: 'VcGallery component for image display',
  },
  widgets: {
    indicators: ['<VcWidget', 'widgets:', 'widgetControls'],
    description: 'VcWidget component for widgets',
  },
  reorderable: {
    indicators: ['reorderableRows', 'onRowReorder', '@rowReorder'],
    description: 'Row reordering functionality',
  },
};

/**
 * QualityMetrics class for code quality evaluation
 */
export class QualityMetrics {
  /**
   * Calculate completeness score (0-100%)
   *
   * Scoring breakdown:
   * - Features: 40% (all required features implemented)
   * - Data structures: 20% (columns/fields present)
   * - Business logic: 30% (API client, handlers, validation)
   * - Anti-patterns: 10% (no TODOs, placeholders, empty handlers)
   *
   * @param code - Vue SFC code to evaluate
   * @param bladePlan - UI-Plan blade definition
   * @returns Completeness evaluation result
   */
  evaluateCompleteness(code: string, bladePlan: UIPlanBlade): CompletenessResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Features completeness (40%)
    const requiredFeatures = bladePlan.features || [];
    const featureDetections = requiredFeatures.map(feature =>
      this.detectFeature(code, feature)
    );
    const implementedFeatures = featureDetections
      .filter(d => d.implemented)
      .map(d => d.feature);
    const missingFeatures = featureDetections
      .filter(d => !d.implemented)
      .map(d => d.feature);

    const featuresScore =
      requiredFeatures.length > 0
        ? (implementedFeatures.length / requiredFeatures.length) * 40
        : 40;

    // Add errors for missing features
    missingFeatures.forEach(feature => {
      const pattern = FEATURE_PATTERNS[feature];
      errors.push(
        `Missing feature '${feature}': ${pattern?.description || 'Required but not implemented'}. ` +
        `Expected indicators: ${pattern?.indicators.join(', ')}`
      );
    });

    // 2. Data structures completeness (20%)
    const dataStructures = this.evaluateDataStructures(code, bladePlan);
    let dataStructuresScore = 20;

    if (dataStructures.columns) {
      const columnRatio = dataStructures.columns.found / dataStructures.columns.required;
      dataStructuresScore = columnRatio * 20;

      if (dataStructures.columns.missing.length > 0) {
        errors.push(
          `Missing columns in VcTable: ${dataStructures.columns.missing.join(', ')}. ` +
          `Found ${dataStructures.columns.found}/${dataStructures.columns.required}.`
        );
      }
    } else if (dataStructures.fields) {
      const fieldRatio = dataStructures.fields.found / dataStructures.fields.required;
      dataStructuresScore = fieldRatio * 20;

      if (dataStructures.fields.missing.length > 0) {
        errors.push(
          `Missing fields in form: ${dataStructures.fields.missing.join(', ')}. ` +
          `Found ${dataStructures.fields.found}/${dataStructures.fields.required}.`
        );
      }
    }

    // 3. Business logic completeness (30%)
    const businessLogic = this.evaluateBusinessLogic(code, bladePlan);
    let businessLogicScore = 0;

    // Each aspect contributes 5%
    if (businessLogic.hasApiClientImport) businessLogicScore += 5;
    if (businessLogic.hasApiClientUsage) businessLogicScore += 5;
    if (businessLogic.hasEventHandlers) businessLogicScore += 5;
    if (businessLogic.hasValidation) businessLogicScore += 5;
    if (businessLogic.hasLoadingState) businessLogicScore += 5;
    if (businessLogic.hasErrorHandling) businessLogicScore += 5;

    // Add errors for missing business logic
    if (!businessLogic.hasApiClientImport && this.requiresApiClient(bladePlan)) {
      errors.push('Missing API client import. Expected import from module\'s api/ directory.');
    }
    if (!businessLogic.hasApiClientUsage && this.requiresApiClient(bladePlan)) {
      errors.push('API client not used in code. Expected method calls like getList(), get(), save(), etc.');
    }
    if (!businessLogic.hasEventHandlers) {
      warnings.push('No event handlers found. Expected handlers like onItemClick, onSave, onDelete, etc.');
    }
    if (!businessLogic.hasLoadingState) {
      warnings.push('No loading state management found. Expected ref<boolean>(false) or reactive loading state.');
    }

    // 4. Anti-patterns penalty (10%)
    const antiPatterns = this.detectAntiPatterns(code);
    let antiPatternScore = 10;

    if (antiPatterns.hasTodos) {
      antiPatternScore -= 3;
      errors.push(
        `Found ${antiPatterns.todoCount} TODO/FIXME comment(s). ` +
        `All functionality must be implemented, no placeholders allowed.`
      );
    }
    if (antiPatterns.hasPlaceholders) {
      antiPatternScore -= 3;
      errors.push(
        `Found ${antiPatterns.placeholderCount} placeholder(s) like {{NAME}}, YOUR_*, etc. ` +
        `Replace all placeholders with actual implementation.`
      );
    }
    if (antiPatterns.hasEmptyHandlers) {
      antiPatternScore -= 2;
      errors.push(
        `Found ${antiPatterns.emptyHandlers.length} empty handler(s): ${antiPatterns.emptyHandlers.join(', ')}. ` +
        `All handlers must have implementation.`
      );
    }
    if (antiPatterns.hasAnyTypes) {
      antiPatternScore -= 2;
      warnings.push(
        `Found ${antiPatterns.anyTypeCount} usage(s) of 'any' type. ` +
        `Consider using specific types for better type safety.`
      );
    }

    antiPatternScore = Math.max(0, antiPatternScore);

    // Total score
    const totalScore = Math.round(
      featuresScore + dataStructuresScore + businessLogicScore + antiPatternScore
    );

    return {
      score: totalScore,
      features: {
        required: requiredFeatures,
        implemented: implementedFeatures,
        missing: missingFeatures,
        detections: featureDetections,
      },
      dataStructures,
      businessLogic,
      antiPatterns,
      errors,
      warnings,
    };
  }

  /**
   * Detect if a feature is implemented in code
   *
   * @param code - Vue SFC code
   * @param feature - Feature name (filters, multiselect, etc.)
   * @returns Detection result
   */
  detectFeature(code: string, feature: string): FeatureDetection {
    const pattern = FEATURE_PATTERNS[feature];

    if (!pattern) {
      return {
        feature,
        implemented: false,
        indicators: [],
        missingIndicators: [`Unknown feature: ${feature}`],
      };
    }

    const foundIndicators: string[] = [];
    const missingIndicators: string[] = [];

    for (const indicator of pattern.indicators) {
      if (code.includes(indicator)) {
        foundIndicators.push(indicator);
      } else {
        missingIndicators.push(indicator);
      }
    }

    // Feature is implemented if at least 50% of indicators are present
    const threshold = Math.ceil(pattern.indicators.length / 2);
    const implemented = foundIndicators.length >= threshold;

    return {
      feature,
      implemented,
      indicators: foundIndicators,
      missingIndicators: implemented ? undefined : missingIndicators,
    };
  }

  /**
   * Evaluate data structures completeness (columns for list, fields for details)
   *
   * @param code - Vue SFC code
   * @param bladePlan - UI-Plan blade definition
   * @returns Data structure completeness
   */
  evaluateDataStructures(code: string, bladePlan: UIPlanBlade): DataStructureCompleteness {
    const result: DataStructureCompleteness = {};

    // List blade: check columns
    if (bladePlan.layout === 'grid') {
      const requiredColumns = this.extractColumnsFromPlan(bladePlan);
      const foundColumns = this.extractColumnsFromCode(code);

      const missing = requiredColumns.filter(col => !foundColumns.includes(col));

      result.columns = {
        required: requiredColumns.length,
        found: foundColumns.length,
        missing,
      };
    }

    // Details blade: check fields
    if (bladePlan.layout === 'details') {
      const requiredFields = this.extractFieldsFromPlan(bladePlan);
      const foundFields = this.extractFieldsFromCode(code);

      const missing = requiredFields.filter(field => !foundFields.includes(field));

      result.fields = {
        required: requiredFields.length,
        found: foundFields.length,
        missing,
      };
    }

    return result;
  }

  /**
   * Evaluate business logic completeness
   *
   * @param code - Vue SFC code
   * @param bladePlan - UI-Plan blade definition
   * @returns Business logic completeness
   */
  evaluateBusinessLogic(code: string, bladePlan: UIPlanBlade): BusinessLogicCompleteness {
    return {
      hasApiClientImport: this.hasApiClientImport(code),
      hasApiClientUsage: this.hasApiClientUsage(code),
      hasEventHandlers: this.hasEventHandlers(code),
      hasValidation: this.hasValidation(code),
      hasLoadingState: this.hasLoadingState(code),
      hasErrorHandling: this.hasErrorHandling(code),
    };
  }

  /**
   * Detect anti-patterns in code
   *
   * @param code - Vue SFC code
   * @returns Anti-pattern detection result
   */
  detectAntiPatterns(code: string): AntiPatternDetection {
    // TODO/FIXME comments
    const todoRegex = /\/\/\s*(TODO|FIXME|XXX|HACK|NOTE:?\s*TODO)/gi;
    const todoMatches = code.match(todoRegex) || [];

    // Placeholders: {{NAME}}, YOUR_*, <REPLACE_THIS>, etc.
    const placeholderRegex = /\{\{[A-Z_]+\}\}|YOUR_[A-Z_]+|<[A-Z_]+>|REPLACE_THIS|PLACEHOLDER/g;
    const placeholderMatches = code.match(placeholderRegex) || [];

    // Empty handlers - AST-based detection
    const emptyHandlers = ASTUtils.findEmptyHandlers(code);

    // 'any' types - AST-based detection with regex fallback
    const hasAnyType = ASTUtils.hasAnyType(code);
    const anyTypeRegex = /:\s*any(?!\w)/g;
    const anyTypeMatches = code.match(anyTypeRegex) || [];

    return {
      hasTodos: todoMatches.length > 0,
      todoCount: todoMatches.length,
      hasPlaceholders: placeholderMatches.length > 0,
      placeholderCount: placeholderMatches.length,
      hasEmptyHandlers: emptyHandlers.length > 0,
      emptyHandlers,
      hasAnyTypes: hasAnyType || anyTypeMatches.length > 0,
      anyTypeCount: anyTypeMatches.length,
    };
  }

  // Helper methods

  private extractColumnsFromPlan(bladePlan: UIPlanBlade): string[] {
    const columns: string[] = [];

    for (const component of bladePlan.components) {
      if (component.columns) {
        for (const col of component.columns) {
          if (col && typeof col === 'object' && 'id' in col && typeof col.id === 'string') {
            columns.push(col.id);
          }
        }
      }
    }

    return columns;
  }

  private extractColumnsFromCode(code: string): string[] {
    // Use AST-based extraction
    return ASTUtils.extractColumnIds(code);
  }

  private extractFieldsFromPlan(bladePlan: UIPlanBlade): string[] {
    const fields: string[] = [];

    for (const component of bladePlan.components) {
      if (component.fields) {
        for (const field of component.fields) {
          if (field && typeof field === 'object' && 'key' in field && typeof field.key === 'string') {
            fields.push(field.key);
          }
        }
      }
    }

    return fields;
  }

  private extractFieldsFromCode(code: string): string[] {
    const fields: string[] = [];

    // Extract from Field components: <Field name="fieldName" or :name="'fieldName'"
    const fieldRegex = /<Field[^>]+(?:name=["']([^"']+)["']|:name=["']([^"']+)["'])/g;
    let match;

    while ((match = fieldRegex.exec(code)) !== null) {
      const fieldName = match[1] || match[2];
      if (fieldName) {
        fields.push(fieldName);
      }
    }

    return fields;
  }

  private requiresApiClient(bladePlan: UIPlanBlade): boolean {
    // Check if any component has dataSource: "api"
    return bladePlan.components.some(
      c => c.dataSource === 'api' || c.model !== undefined
    );
  }

  private hasApiClientImport(code: string): boolean {
    // Check for imports from module's api directory
    return /import\s+\{[^}]*\}\s+from\s+["'][^"']*\/api\//.test(code);
  }

  private hasApiClientUsage(code: string): boolean {
    // Check for typical API client method calls
    const apiMethods = [
      'getList',
      'get(',
      'save(',
      'create(',
      'update(',
      'delete(',
      'remove(',
      'search(',
    ];

    return apiMethods.some(method => code.includes(method));
  }

  private hasEventHandlers(code: string): boolean {
    // Check for handler functions: onSave, onItemClick, handleSubmit, etc.
    return /(?:const|function)\s+(?:on|handle)[A-Z]\w+\s*[=:]/.test(code);
  }

  private hasValidation(code: string): boolean {
    // Check for validation schema (yup or zod)
    return (
      code.includes('yup.object') ||
      code.includes('z.object') ||
      code.includes('validationSchema')
    );
  }

  private hasLoadingState(code: string): boolean {
    // Check for loading state management
    return (
      /loading\s*[=:]\s*ref<boolean>/.test(code) ||
      /loading\.value\s*=/.test(code) ||
      /const\s+\{[^}]*loading[^}]*\}/.test(code)
    );
  }

  private hasErrorHandling(code: string): boolean {
    // Check for try-catch or error handling
    return (
      code.includes('try {') ||
      code.includes('catch (') ||
      code.includes('.catch(') ||
      /notification\.error/.test(code)
    );
  }
}
