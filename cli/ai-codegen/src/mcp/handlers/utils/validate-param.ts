/**
 * Utility for validating JSON parameters from MCP clients
 *
 * Different MCP clients (Cursor, Claude Code, etc.) may serialize parameters differently:
 * - Some pass objects directly
 * - Some pass JSON strings
 * - Some may pass undefined/null
 *
 * This utility normalizes validation across all handlers.
 */

export interface ValidationSuccess {
  valid: true;
  value: Record<string, unknown>;
}

export interface ValidationFailure {
  valid: false;
  error: {
    success: false;
    errors: string[];
    hint?: string;
    receivedType?: string;
    receivedPreview?: string;
    receivedKeys?: string[];
  };
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validate and parse a JSON parameter from MCP tool call
 *
 * @param rawValue - The raw parameter value from the MCP client
 * @param paramName - Name of the parameter (for error messages)
 * @param requiredFields - Optional array of field names, at least one must be present
 * @returns ValidationResult with either the parsed object or an error response
 *
 * @example
 * const result = validateJsonParam(params.analysis, "analysis", ["module", "entities"]);
 * if (!result.valid) {
 *   return result.error;
 * }
 * const analysis = result.value;
 */
export function validateJsonParam(
  rawValue: unknown,
  paramName: string,
  requiredFields?: string[]
): ValidationResult {
  // Debug logging for MCP client troubleshooting
  console.error(`[validateJsonParam:${paramName}] Received type: ${typeof rawValue}`);
  if (typeof rawValue === "string") {
    console.error(`[validateJsonParam:${paramName}] String length: ${rawValue.length}`);
    console.error(`[validateJsonParam:${paramName}] First 100 chars: ${rawValue.substring(0, 100)}`);
  } else if (typeof rawValue === "object" && rawValue !== null) {
    console.error(`[validateJsonParam:${paramName}] Object keys: ${Object.keys(rawValue).join(", ")}`);
  }

  // Case 1: null/undefined - parameter is missing
  if (rawValue === undefined || rawValue === null) {
    return {
      valid: false,
      error: {
        success: false,
        errors: [`Missing required parameter: ${paramName}.`],
        hint: `This parameter must be provided. Check if the previous workflow step completed successfully.`,
      },
    };
  }

  let value = rawValue;

  // Case 2: String - try to parse as JSON
  if (typeof rawValue === "string") {
    // Empty string is invalid
    if (!rawValue.trim()) {
      return {
        valid: false,
        error: {
          success: false,
          errors: [`Invalid ${paramName}: received empty string.`],
          hint: `The ${paramName} parameter must be a valid JSON object, not an empty string.`,
          receivedType: "string (empty)",
        },
      };
    }

    // Try to parse JSON - first try standard JSON, then try fixing Python-style syntax
    try {
      value = JSON.parse(rawValue);
    } catch (e) {
      // Try to fix common issues from AI/Cursor:
      // 1. Single quotes instead of double quotes: 'key': 'value' -> "key": "value"
      // 2. Python booleans: True/False -> true/false
      // 3. Python None -> null
      try {
        let fixed = rawValue
          // Replace single quotes with double quotes (careful with apostrophes in text)
          .replace(/'/g, '"')
          // Fix Python booleans (must be after quote replacement)
          .replace(/:\s*True\b/g, ': true')
          .replace(/:\s*False\b/g, ': false')
          .replace(/,\s*True\b/g, ', true')
          .replace(/,\s*False\b/g, ', false')
          .replace(/\[\s*True\b/g, '[true')
          .replace(/\[\s*False\b/g, '[false')
          // Fix Python None
          .replace(/:\s*None\b/g, ': null')
          .replace(/,\s*None\b/g, ', null')
          .replace(/\[\s*None\b/g, '[null');

        value = JSON.parse(fixed);
        console.error(`[validateJsonParam:${paramName}] Fixed Python-style JSON to valid JSON`);
      } catch (fixError) {
        const parseError = e as Error;
        return {
          valid: false,
          error: {
            success: false,
            errors: [
              `Invalid ${paramName}: failed to parse JSON string.`,
              `Parse error: ${parseError.message}`,
            ],
            hint: `Ensure the ${paramName} parameter is valid JSON with double quotes ("key": "value") not single quotes ('key': 'value'). Use true/false not True/False.`,
            receivedType: "string (invalid JSON)",
            receivedPreview: rawValue.length > 200 ? rawValue.substring(0, 200) + "..." : rawValue,
          },
        };
      }
    }
  }

  // Case 3: Not an object after parsing
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    return {
      valid: false,
      error: {
        success: false,
        errors: [`Invalid ${paramName}: expected object, got ${actualType}.`],
        hint: `The ${paramName} parameter must be a JSON object, not ${actualType === "array" ? "an array" : `a ${actualType}`}.`,
        receivedType: actualType,
      },
    };
  }

  // Case 4: Check for required fields (at least one must be present)
  if (requiredFields && requiredFields.length > 0) {
    const hasAnyRequired = requiredFields.some((f) => f in value);
    if (!hasAnyRequired) {
      return {
        valid: false,
        error: {
          success: false,
          errors: [
            `Invalid ${paramName}: missing required fields.`,
            `Expected at least one of: ${requiredFields.join(", ")}`,
          ],
          hint: `The ${paramName} parameter must contain at least one of these fields: ${requiredFields.join(", ")}.`,
          receivedKeys: Object.keys(value),
        },
      };
    }
  }

  // Validation passed
  return {
    valid: true,
    value: value as Record<string, unknown>,
  };
}
