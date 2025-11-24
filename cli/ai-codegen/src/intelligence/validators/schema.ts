/**
 * Schema Validator
 *
 * JSON Schema validation for UI-Plan and other data structures.
 */

import Ajv, { type ValidateFunction, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export interface SchemaValidationResult {
  valid: boolean;
  errors?: SchemaValidationError[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, any>;
}

/**
 * SchemaValidator
 *
 * Validates data against JSON schemas.
 */
export class SchemaValidator {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });

    // Add formats (date, email, uri, etc.)
    addFormats(this.ajv);
  }

  /**
   * Register a schema
   */
  registerSchema(schemaId: string, schema: object): void {
    this.ajv.addSchema(schema, schemaId);
    const validator = this.ajv.getSchema(schemaId);
    if (validator) {
      this.validators.set(schemaId, validator);
    }
  }

  /**
   * Validate data against schema
   */
  validate(schemaId: string, data: any): SchemaValidationResult {
    const validator = this.validators.get(schemaId);

    if (!validator) {
      return {
        valid: false,
        errors: [
          {
            path: "",
            message: `Schema '${schemaId}' not found. Please register it first.`,
          },
        ],
      };
    }

    const valid = validator(data);

    if (valid) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: this.formatErrors(validator.errors || []),
    };
  }

  /**
   * Validate data against inline schema (without registration)
   */
  validateInline(schema: object, data: any): SchemaValidationResult {
    const validator = this.ajv.compile(schema);
    const valid = validator(data);

    if (valid) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: this.formatErrors(validator.errors || []),
    };
  }

  /**
   * Format AJV errors to our SchemaValidationError format
   */
  private formatErrors(ajvErrors: ErrorObject[]): SchemaValidationError[] {
    return ajvErrors.map((err) => ({
      path: err.instancePath || err.schemaPath || "",
      message: err.message || "Validation error",
      keyword: err.keyword,
      params: err.params,
    }));
  }

  /**
   * Get all registered schema IDs
   */
  getRegisteredSchemas(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Remove schema
   */
  removeSchema(schemaId: string): void {
    this.ajv.removeSchema(schemaId);
    this.validators.delete(schemaId);
  }

  /**
   * Clear all schemas
   */
  clearSchemas(): void {
    this.validators.clear();
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(this.ajv);
  }
}
