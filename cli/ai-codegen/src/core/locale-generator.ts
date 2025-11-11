import type { NamingConfig } from "./code-generator.js";
import type { Column, Field } from "./template-adapter.js";

export interface LocaleJSON {
  [key: string]: string | LocaleJSON;
}

/**
 * LocaleGenerator extracts i18n keys and generates locale JSON files
 *
 * Follows the pattern: MODULE.PAGES.BLADE.SECTION.KEY
 */
export class LocaleGenerator {
  /**
   * Generate complete locale structure for a module
   */
  generateModuleLocales(
    naming: NamingConfig,
    blades: Array<{ type: "list" | "details"; columns?: Column[]; fields?: Field[] }>
  ): LocaleJSON {
    const moduleKey = naming.moduleNameUpperSnake;
    const locale: LocaleJSON = {};

    // Menu
    locale[moduleKey] = {
      MENU: {
        TITLE: naming.entityPluralPascal,
      },
      PAGES: {},
    };

    // Generate for each blade
    blades.forEach(blade => {
      if (blade.type === "list") {
        (locale[moduleKey] as LocaleJSON).PAGES = {
          ...(locale[moduleKey] as LocaleJSON).PAGES as LocaleJSON,
          LIST: this.generateListLocale(naming, blade.columns || []),
        };
      } else if (blade.type === "details") {
        (locale[moduleKey] as LocaleJSON).PAGES = {
          ...(locale[moduleKey] as LocaleJSON).PAGES as LocaleJSON,
          DETAILS: this.generateDetailsLocale(naming, blade.fields || []),
        };
      }
    });

    return locale;
  }

  /**
   * Generate locale for list blade
   */
  private generateListLocale(naming: NamingConfig, columns: Column[]): LocaleJSON {
    const locale: LocaleJSON = {
      TITLE: naming.entityPluralPascal,
      TOOLBAR: {
        REFRESH: "Refresh",
        ADD: `Add ${naming.entitySingularPascal}`,
      },
      TABLE: {
        TOTALS: `{count} ${naming.entityPluralCamel}`,
        HEADER: {},
      },
      EMPTY: {
        NO_ITEMS: `No ${naming.entityPluralCamel} found`,
        ADD: `Add ${naming.entitySingularCamel}`,
      },
      NOT_FOUND: {
        EMPTY: `No ${naming.entityPluralCamel} match your search`,
        RESET: "Reset filters",
      },
    };

    // Add column headers
    const headers: LocaleJSON = {};
    columns.forEach(col => {
      headers[col.key.toUpperCase()] = col.title;
    });
    (locale.TABLE as LocaleJSON).HEADER = headers;

    return locale;
  }

  /**
   * Generate locale for details blade
   */
  private generateDetailsLocale(naming: NamingConfig, fields: Field[]): LocaleJSON {
    const locale: LocaleJSON = {
      TITLE: `${naming.entitySingularPascal} Details`,
      NEW_TITLE: `New ${naming.entitySingularPascal}`,
      TOOLBAR: {
        SAVE: "Save",
        DELETE: "Delete",
        CANCEL_EDIT: "Cancel",
        EDIT: "Edit",
      },
      FORM: {
        INFO: {},
      },
      ALERTS: {
        SAVE_SUCCESS: `${naming.entitySingularPascal} saved successfully`,
        DELETE_SUCCESS: `${naming.entitySingularPascal} deleted successfully`,
        DELETE: `Are you sure you want to delete this ${naming.entitySingularCamel}?`,
        CLOSE_CONFIRMATION: "You have unsaved changes. Are you sure you want to close?",
        NOT_VALID: "Please fix validation errors before saving",
      },
    };

    // Add form field labels
    const formFields: LocaleJSON = {};
    fields.forEach(field => {
      const fieldKey = field.key.toUpperCase();
      formFields[fieldKey] = field.label;
      formFields[`${fieldKey}_PLACEHOLDER`] = field.placeholder || `Enter ${field.label.toLowerCase()}`;
    });
    (locale.FORM as LocaleJSON).INFO = formFields;

    return locale;
  }

  /**
   * Extract i18n keys from code
   */
  extractI18nKeys(code: string): string[] {
    const keys: string[] = [];

    // Match $t("KEY") and t("KEY")
    const regex = /(?:\$t|t)\(["']([^"']+)["']\)/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
      keys.push(match[1]);
    }

    return [...new Set(keys)]; // Remove duplicates
  }

  /**
   * Generate locale structure from keys
   */
  generateLocaleStructure(keys: string[], moduleUpperSnake: string): LocaleJSON {
    const locale: LocaleJSON = {};

    keys.forEach(key => {
      const parts = key.split(".");
      let current = locale;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Last part - set value
          current[part] = this.generateDefaultTranslation(part);
        } else {
          // Create nested object if doesn't exist
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part] as LocaleJSON;
        }
      });
    });

    return locale;
  }

  /**
   * Generate default translation from key
   */
  private generateDefaultTranslation(key: string): string {
    // Convert SCREAMING_SNAKE_CASE to Title Case
    return key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Generate locales index.ts file
   */
  generateLocalesIndex(): string {
    return `import en from "./en.json";

export {
  en,
};
`;
  }
}

