/**
 * Plan Normalizer - Preprocesses UI-Plans to fix common issues
 *
 * Handles:
 * - id → key migration for fields/columns
 * - width number → string conversion
 * - Schema URL normalization
 */

export interface NormalizationResult {
  plan: Record<string, unknown>;
  changes: string[];
}

export class PlanNormalizer {
  /**
   * Normalize UI-Plan to fix common issues
   */
  normalize(plan: Record<string, unknown>): NormalizationResult {
    const changes: string[] = [];
    const normalized = JSON.parse(JSON.stringify(plan)); // Deep clone

    // Fix schema URL if wrong
    if (normalized.$schema && normalized.$schema !== "https://vc-shell.dev/schemas/ui-plan.v1.json") {
      changes.push(`Updated $schema from '${normalized.$schema}' to 'https://vc-shell.dev/schemas/ui-plan.v1.json'`);
      normalized.$schema = "https://vc-shell.dev/schemas/ui-plan.v1.json";
    }

    // Normalize blades
    if (Array.isArray(normalized.blades)) {
      normalized.blades.forEach((blade: any, bladeIndex: number) => {
        // Normalize components
        if (Array.isArray(blade.components)) {
          blade.components.forEach((component: any, compIndex: number) => {
            // Normalize fields (id → key)
            if (Array.isArray(component.fields)) {
              component.fields.forEach((field: any, fieldIndex: number) => {
                if (field.id && !field.key) {
                  changes.push(`blade[${bladeIndex}].components[${compIndex}].fields[${fieldIndex}]: Migrated 'id' → 'key' (${field.id})`);
                  field.key = field.id;
                  delete field.id;
                } else if (field.id && field.key) {
                  // Both exist, remove id
                  changes.push(`blade[${bladeIndex}].components[${compIndex}].fields[${fieldIndex}]: Removed duplicate 'id' (kept 'key')`);
                  delete field.id;
                }
              });
            }

            // Normalize columns (id → key, width number → string)
            if (Array.isArray(component.columns)) {
              component.columns.forEach((column: any, colIndex: number) => {
                // id → key
                if (column.id && !column.key) {
                  changes.push(`blade[${bladeIndex}].components[${compIndex}].columns[${colIndex}]: Migrated 'id' → 'key' (${column.id})`);
                  column.key = column.id;
                  delete column.id;
                } else if (column.id && column.key) {
                  changes.push(`blade[${bladeIndex}].components[${compIndex}].columns[${colIndex}]: Removed duplicate 'id' (kept 'key')`);
                  delete column.id;
                }

                // width: number → string
                if (typeof column.width === 'number') {
                  changes.push(`blade[${bladeIndex}].components[${compIndex}].columns[${colIndex}]: Converted width ${column.width} → '${column.width}px'`);
                  column.width = `${column.width}px`;
                }
              });
            }
          });
        }
      });
    }

    return {
      plan: normalized,
      changes,
    };
  }

  /**
   * Check if plan needs normalization
   */
  needsNormalization(plan: Record<string, unknown>): boolean {
    try {
      const result = this.normalize(plan);
      return result.changes.length > 0;
    } catch {
      return false;
    }
  }
}
