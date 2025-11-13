import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface UIPlan {
  $schema: string;
  module: string;
  blades: Blade[];
  data?: {
    sources?: Record<string, DataSource>;
  };
}

export interface Blade {
  id: string;
  route: string;
  layout: "page" | "grid" | "details";
  title: string;
  isWorkspace?: boolean;
  components?: Component[];
  actions?: string[];
  features?: string[];
  customSlots?: Array<{
    name: string;
    component?: string;
    props?: Record<string, unknown>;
  }>;
  theme?: {
    variant: "light" | "dark" | "system";
  };
  permissions?: string[];
  steps?: Step[];
  logic?: {
    handlers?: Record<string, string>;
    toolbar?: Array<{
      id: string;
      icon?: string;
      action: string;
    }>;
    state?: Record<string, {
      source: "composable" | "local" | "prop";
      reactive: boolean;
      default?: unknown;
    }>;
  };
  composable?: {
    name?: string;
    methods?: string[];
    mockData?: boolean;
  };
}

export interface Step {
  id: string;
  title: string;
  components: Component[];
}

export interface Component {
  type: string;
  dataSource?: string;
  model?: string;
  fields?: Field[];
  columns?: Column[];
  actions?: string[];
  filters?: Filter[];
  props?: Record<string, unknown>;
}

export interface Field {
  key: string;
  as: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rules?: string[];
  options?: Array<{ label: string; value: string }>;
}

export interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
}

export interface Filter {
  key: string;
  type: string;
  label?: string;
  options?: unknown[];
}

export interface DataSource {
  type: "localModel" | "localArray" | "api";
  endpoint?: string;
}

export class Validator {
  private ajv: Ajv;
  private uiPlanSchema: unknown;
  private componentRegistry: Record<string, unknown>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);

    // Load schemas
    // In production (dist/index.js), schemas are in dist/schemas/
    // In development (src/core/validator.ts), schemas are in src/schemas/
    const schemasPath = __dirname.includes('/dist')
      ? path.join(__dirname, "schemas")
      : path.join(__dirname, "..", "schemas");

    this.uiPlanSchema = JSON.parse(
      fs.readFileSync(path.join(schemasPath, "ui-plan.v1.schema.json"), "utf-8")
    );
    this.componentRegistry = JSON.parse(
      fs.readFileSync(path.join(schemasPath, "component-registry.json"), "utf-8")
    );
  }

  /**
   * Validate UI-Plan against JSON Schema
   */
  validateUIPlan(plan: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    // JSON Schema validation
    const validate = this.ajv.compile(this.uiPlanSchema as any);
    const valid = validate(plan);

    if (!valid && validate.errors) {
      for (const error of validate.errors) {
        errors.push({
          path: error.instancePath || "/",
          message: error.message || "Validation error",
          severity: "error",
        });
      }
    }

    // Additional validations (always run, even if schema validation failed)
    // This provides more helpful error messages
    if (plan && typeof plan === "object" && "blades" in plan) {
      const uiPlan = plan as UIPlan;

      // Validate component usage
      const componentErrors = this.validateComponentUsage(uiPlan);
      errors.push(...componentErrors);

      // Validate naming conventions
      const namingErrors = this.validateNamingConventions(uiPlan);
      errors.push(...namingErrors);
    }

    return {
      valid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
    };
  }

  /**
   * Validate that components exist in registry and props are correct
   */
  validateComponentUsage(plan: UIPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const blade of plan.blades) {
      const components = blade.components || [];

      // Also check components in steps
      if (blade.steps) {
        for (const step of blade.steps) {
          components.push(...step.components);
        }
      }

      for (const component of components) {
        // component.type already contains "Vc" prefix (e.g., "VcTable", "VcForm")
        const componentName = component.type;

        if (!this.componentRegistry[componentName]) {
          errors.push({
            path: `/blades/${blade.id}/components`,
            message: `Component "${component.type}" not found in Component Registry. Available components: ${Object.keys(this.componentRegistry).join(", ")}`,
            severity: "error",
          });
        }

        // Validate field types for VcForm components
        if (component.type === "VcForm" && component.fields) {
          if (component.fields.length > 50) {
            errors.push({
              path: `/blades/${blade.id}/components/VcForm`,
              message: `Form has ${component.fields.length} fields, maximum is 50`,
              severity: "error",
            });
          }

          for (const field of component.fields) {
            const validTypes = [
              "VcInput",
              "VcTextarea",
              "VcSelect",
              "VcCheckbox",
              "VcSwitch",
              "VcGallery",
              "VcFileUpload",
            ];

            if (!validTypes.includes(field.as)) {
              errors.push({
                path: `/blades/${blade.id}/components/VcForm/field/${field.key}`,
                message: `Invalid field type "${field.as}". Valid types: ${validTypes.join(", ")}`,
                severity: "error",
              });
            }
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate naming conventions
   */
  validateNamingConventions(plan: UIPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    // Module name must be kebab-case
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(plan.module)) {
      errors.push({
        path: "/module",
        message: `Module name "${plan.module}" must be in kebab-case (e.g., "vendor-management")`,
        severity: "error",
      });
    }

    // Blade IDs must be kebab-case
    for (const blade of plan.blades) {
      if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(blade.id)) {
        errors.push({
          path: `/blades/${blade.id}`,
          message: `Blade ID "${blade.id}" must be in kebab-case`,
          severity: "error",
        });
      }

      // Routes must start with /
      if (!blade.route.startsWith("/")) {
        errors.push({
          path: `/blades/${blade.id}/route`,
          message: `Route must start with "/" (got "${blade.route}")`,
          severity: "error",
        });
      }

      // Check for duplicate routes
      const duplicates = plan.blades.filter((b) => b.route === blade.route);
      if (duplicates.length > 1) {
        errors.push({
          path: `/blades/${blade.id}/route`,
          message: `Duplicate route "${blade.route}" found`,
          severity: "error",
        });
      }
    }

    return errors;
  }

  /**
   * Get component registry
   */
  getComponentRegistry(): Record<string, unknown> {
    return this.componentRegistry;
  }
}

// Singleton instance
let validatorInstance: Validator | null = null;

export function getValidator(): Validator {
  if (!validatorInstance) {
    validatorInstance = new Validator();
  }
  return validatorInstance;
}

