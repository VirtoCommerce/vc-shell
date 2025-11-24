/**
 * UI-Plan Validator
 *
 * Validates UI-Plan structure and content.
 * Uses both JSON Schema and business logic validation.
 */

import {
  SchemaValidator,
  type SchemaValidationResult,
  type SchemaValidationError,
} from "./schema";
import type { ComponentRegistry } from "../../knowledge/registries/components";
import type { FeatureRegistry } from "../../knowledge/registries/features";
import type { FrameworkAPIRegistry } from "../../knowledge/registries/framework";

export interface UIPlanValidationResult {
  valid: boolean;
  errors?: SchemaValidationError[];
  warnings?: string[];
  suggestions?: string[];
}

/**
 * UIPlanValidator
 *
 * Comprehensive UI-Plan validation.
 */
export class UIPlanValidator {
  private schemaValidator: SchemaValidator;

  constructor(
    private componentRegistry: ComponentRegistry,
    private featureRegistry: FeatureRegistry,
    private frameworkAPIRegistry: FrameworkAPIRegistry,
  ) {
    this.schemaValidator = new SchemaValidator();
    this.registerSchema();
  }

  /**
   * Register UI-Plan schema
   */
  private registerSchema(): void {
    // Basic UI-Plan schema
    const schema = {
      type: "object",
      required: ["module", "blades"],
      properties: {
        module: { type: "string", minLength: 1 },
        description: { type: "string" },
        blades: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["id", "type", "route", "component"],
            properties: {
              id: { type: "string", minLength: 1 },
              type: { type: "string", enum: ["list", "details"] },
              route: { type: "string", pattern: "^/" },
              isWorkspace: { type: "boolean" },
              component: {
                type: "object",
                required: ["type"],
                properties: {
                  type: { type: "string", minLength: 1 },
                  props: { type: "object" },
                  slots: { type: "object" },
                  events: { type: "object" },
                },
              },
              features: {
                type: "array",
                items: { type: "string" },
              },
              frameworkAPIs: {
                type: "array",
                items: { type: "string" },
              },
              actions: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "from", "to"],
            properties: {
              type: { type: "string", enum: ["parent-child", "navigation"] },
              from: { type: "string" },
              to: { type: "string" },
            },
          },
        },
      },
    };

    this.schemaValidator.registerSchema("ui-plan", schema);
  }

  /**
   * Validate UI-Plan
   */
  async validate(plan: any): Promise<UIPlanValidationResult> {
    await this.ensureLoaded();

    const errors: SchemaValidationError[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. Schema validation
    const schemaResult = this.schemaValidator.validate("ui-plan", plan);
    if (!schemaResult.valid) {
      errors.push(...(schemaResult.errors || []));
    }

    // 2. Business logic validation
    if (schemaResult.valid) {
      // Validate components
      const componentErrors = await this.validateComponents(plan);
      errors.push(...componentErrors);

      // Validate features
      const featureErrors = await this.validateFeatures(plan);
      errors.push(...featureErrors);

      // Validate framework APIs
      const apiErrors = await this.validateFrameworkAPIs(plan);
      errors.push(...apiErrors);

      // Validate relationships
      const relationshipErrors = this.validateRelationships(plan);
      errors.push(...relationshipErrors);

      // Generate warnings
      warnings.push(...this.generateWarnings(plan));

      // Generate suggestions
      suggestions.push(...this.generateSuggestions(plan));
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Validate components exist in registry
   */
  private async validateComponents(plan: any): Promise<SchemaValidationError[]> {
    const errors: SchemaValidationError[] = [];

    for (let i = 0; i < plan.blades.length; i++) {
      const blade = plan.blades[i];
      const componentType = blade.component?.type;

      if (!componentType) continue;

      const component = this.componentRegistry.get(componentType);
      if (!component) {
        errors.push({
          path: `/blades/${i}/component/type`,
          message: `Component '${componentType}' not found in registry`,
        });
      }
    }

    return errors;
  }

  /**
   * Validate features exist and are valid for blade type
   */
  private async validateFeatures(plan: any): Promise<SchemaValidationError[]> {
    const errors: SchemaValidationError[] = [];

    for (let i = 0; i < plan.blades.length; i++) {
      const blade = plan.blades[i];
      const features = blade.features || [];

      for (const feature of features) {
        const featureMetadata = this.featureRegistry.get(feature);
        if (!featureMetadata) {
          errors.push({
            path: `/blades/${i}/features`,
            message: `Feature '${feature}' not found in registry`,
          });
        } else {
          // Feature metadata validation would go here if bladeTypes field existed
          // Currently FeatureMetadata doesn't have bladeTypes field
          // Skipping validation for now
        }
      }
    }

    return errors;
  }

  /**
   * Validate framework APIs exist
   */
  private async validateFrameworkAPIs(plan: any): Promise<SchemaValidationError[]> {
    const errors: SchemaValidationError[] = [];

    for (let i = 0; i < plan.blades.length; i++) {
      const blade = plan.blades[i];
      const apis = blade.frameworkAPIs || [];

      for (const api of apis) {
        const apiMetadata = this.frameworkAPIRegistry.get(api);
        if (!apiMetadata) {
          errors.push({
            path: `/blades/${i}/frameworkAPIs`,
            message: `Framework API '${api}' not found in registry`,
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validate relationships
   */
  private validateRelationships(plan: any): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (!plan.relationships) return errors;

    const bladeIds = new Set(plan.blades.map((b: any) => b.id));

    for (let i = 0; i < plan.relationships.length; i++) {
      const rel = plan.relationships[i];

      if (!bladeIds.has(rel.from)) {
        errors.push({
          path: `/relationships/${i}/from`,
          message: `Blade '${rel.from}' not found in plan`,
        });
      }

      if (!bladeIds.has(rel.to)) {
        errors.push({
          path: `/relationships/${i}/to`,
          message: `Blade '${rel.to}' not found in plan`,
        });
      }
    }

    return errors;
  }

  /**
   * Generate warnings (non-critical issues)
   */
  private generateWarnings(plan: any): string[] {
    const warnings: string[] = [];

    // Check for missing workspace blade
    const hasWorkspace = plan.blades.some((b: any) => b.isWorkspace);
    if (!hasWorkspace) {
      warnings.push(
        "No workspace blade found. Module won't appear in sidebar menu.",
      );
    }

    // Check for list blades without features
    for (const blade of plan.blades) {
      if (blade.type === "list" && (!blade.features || blade.features.length === 0)) {
        warnings.push(
          `List blade '${blade.id}' has no features. Consider adding filters, sort, or multiselect.`,
        );
      }
    }

    return warnings;
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(plan: any): string[] {
    const suggestions: string[] = [];

    // Suggest missing features based on blade type
    for (const blade of plan.blades) {
      if (blade.type === "list") {
        if (!blade.features?.includes("filters")) {
          suggestions.push(`Consider adding 'filters' feature to '${blade.id}' for better UX`);
        }
        if (!blade.features?.includes("sort")) {
          suggestions.push(`Consider adding 'sort' feature to '${blade.id}' for better UX`);
        }
      }

      if (blade.type === "details") {
        if (!blade.features?.includes("validation")) {
          suggestions.push(
            `Consider adding 'validation' feature to '${blade.id}' for data integrity`,
          );
        }
      }
    }

    return suggestions;
  }

  /**
   * Ensure registries are loaded
   */
  private async ensureLoaded(): Promise<void> {
    await Promise.all([
      this.componentRegistry.ensureLoaded(),
      this.featureRegistry.ensureLoaded(),
      this.frameworkAPIRegistry.ensureLoaded(),
    ]);
  }
}
