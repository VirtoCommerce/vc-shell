import { kebabCase, camelCase, upperFirst, snakeCase } from "lodash-es";
import pluralize from "pluralize";

/**
 * Configuration interface for entity naming conventions
 * Used throughout the generator to maintain consistent naming
 */
export interface NamingConfig {
  // User input
  entitySingular: string; // "Offer"
  entityPlural: string; // "Offers" (auto-generated)
  moduleName: string; // "offers"

  // Generated - Singular forms
  entitySingularPascal: string; // "Offer"
  entitySingularCamel: string; // "offer"
  entitySingularKebab: string; // "offer"

  // Generated - Plural forms
  entityPluralPascal: string; // "Offers"
  entityPluralCamel: string; // "offers" (valid JS identifier)
  entityPluralKebab: string; // "offers"

  // Module naming
  moduleNamePascal: string; // "Offers"
  moduleNameUpperSnake: string; // "OFFERS"
}

/**
 * Creates a complete naming configuration from user inputs
 * Ensures valid JavaScript identifiers and consistent naming throughout generated code
 * Uses pluralize library to automatically generate plural forms
 *
 * @param singular - Singular form of entity (e.g., "Offer", "Product")
 * @param module - Module name (e.g., "offers", "products")
 * @returns Complete naming configuration
 */
export function createNamingConfig(singular: string, module: string): NamingConfig {
  // Sanitize for valid JS identifiers (kebab to camel)
  const sanitizeSingular = camelCase(singular);
  
  // Auto-generate plural using pluralize library
  const plural = pluralize(singular);
  const sanitizePlural = camelCase(plural);

  return {
    entitySingular: singular,
    entityPlural: plural,
    moduleName: module,

    entitySingularPascal: upperFirst(sanitizeSingular),
    entitySingularCamel: sanitizeSingular,
    entitySingularKebab: kebabCase(singular),

    entityPluralPascal: upperFirst(sanitizePlural),
    entityPluralCamel: sanitizePlural,
    entityPluralKebab: kebabCase(plural),

    moduleNamePascal: upperFirst(camelCase(module)),
    moduleNameUpperSnake: snakeCase(module).toUpperCase(),
  };
}

/**
 * Creates replacements map for template string interpolation
 * Used to replace placeholders in template files with actual values
 *
 * @param config - Naming configuration
 * @returns Map of template keys to values
 */
export function createReplacementsMap(config: NamingConfig): Record<string, string> {
  return {
    "{{EntityName}}": config.entitySingularPascal,
    "{{EntityNamePlural}}": config.entityPluralPascal,
    "{{entityName}}": config.entitySingularCamel,
    "{{entityNamePlural}}": config.entityPluralCamel,
    "{{entity-name}}": config.entitySingularKebab,
    "{{entity-name-plural}}": config.entityPluralKebab,
    "{{entity_name}}": snakeCase(config.entitySingular),
    "{{entity_name_plural}}": snakeCase(config.entityPlural),
    "{{ModuleName}}": config.moduleNamePascal,
    "{{moduleName}}": camelCase(config.moduleName),
    "{{module-name}}": kebabCase(config.moduleName),
    "{{MODULE_NAME}}": config.moduleNameUpperSnake,
    "{{MODULE_NAME_UPPERCASE}}": config.moduleNameUpperSnake,
  };
}

/**
 * Replaces all placeholders in template content with actual values
 *
 * @param content - Template content
 * @param replacements - Map of placeholders to values
 * @returns Content with replaced placeholders
 */
export function applyReplacements(content: string, replacements: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, "g"), value);
  }
  return result;
}

