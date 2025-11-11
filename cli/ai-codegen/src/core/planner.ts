import type { UIPlan } from "./validator.js";
import { kebabCase } from "lodash-es";

export interface PlannerOptions {
  prompt: string;
  module?: string;
}

/**
 * Basic UI Plan generator from prompt
 * In real usage, this would be called by Cursor's LLM through .cursorrules
 * This is a simple fallback implementation for CLI usage
 */
export class Planner {
  /**
   * Generate UI-Plan from natural language prompt
   * This is a basic implementation - in practice, Cursor's LLM handles this
   */
  generatePlan(options: PlannerOptions): UIPlan {
    const { prompt, module } = options;

    // Extract module name from prompt or use provided
    const moduleName = module || this.extractModuleName(prompt);

    // Detect if it's a grid, details, or both
    const hasGrid = this.detectGrid(prompt);
    const hasDetails = this.detectDetails(prompt);

    const blades = [];

    if (hasGrid) {
      blades.push(this.generateGridBlade(moduleName, prompt));
    }

    if (hasDetails) {
      blades.push(this.generateDetailsBlade(moduleName, prompt));
    }

    // If no specific layout detected, default to grid
    if (blades.length === 0) {
      blades.push(this.generateGridBlade(moduleName, prompt));
    }

    return {
      $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
      module: moduleName,
      blades,
      data: {
        sources: {
          [moduleName]: {
            type: "api",
            endpoint: `/api/${moduleName}`,
          },
        },
      },
    };
  }

  private extractModuleName(prompt: string): string {
    // Look for noun at the beginning
    const words = prompt.toLowerCase().split(/\s+/);
    const firstNoun = words[0] || "items";

    return kebabCase(firstNoun);
  }

  private toSingular(word: string): string {
    // Handle common English pluralization rules
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';  // categories → category
    }
    if (word.endsWith('ses')) {
      return word.slice(0, -2);  // classes → class
    }
    if (word.endsWith('xes')) {
      return word.slice(0, -2);  // boxes → box
    }
    if (word.endsWith('s')) {
      return word.slice(0, -1);  // vendors → vendor, orders → order
    }
    return word;
  }

  private detectGrid(prompt: string): boolean {
    const gridKeywords = [
      "list",
      "grid",
      "table",
      "catalog",
      "search",
      "filter",
      "pagination",
    ];

    return gridKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword)
    );
  }

  private detectDetails(prompt: string): boolean {
    // Only trigger details for explicit form/details keywords
    // "create" and "add" are too generic and can mean just creating a module
    const detailsKeywords = [
      "form",
      "details",
      "edit",
      "update",
      "fields",
    ];

    return detailsKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword)
    );
  }

  private generateGridBlade(moduleName: string, prompt: string) {
    return {
      id: `${moduleName}-list`,
      route: `/${moduleName}`,
      layout: "grid" as const,
      title: this.capitalizeFirst(moduleName),
      isWorkspace: true,
      components: [
        {
          type: "VcTable",
          dataSource: moduleName,
          columns: [
            { key: "name", title: "Name" },
            { key: "createdDate", title: "Created" },
          ],
          actions: ["add", "edit", "delete"],
          filters: this.detectFilters(prompt),
        },
      ],
      permissions: [`${moduleName}:read`],
      theme: {
        variant: "system" as const,
      },
    };
  }

  private generateDetailsBlade(moduleName: string, prompt: string) {
    const singularName = this.toSingular(moduleName);

    return {
      id: `${singularName}-details`,
      route: `/${singularName}`,
      layout: "details" as const,
      title: `${this.capitalizeFirst(singularName)} Details`,
      isWorkspace: false,
      // NOTE: routable: false NOT added by default
      // AI should add it only when blade uses options (not just param)
      components: [
        {
          type: "VcForm",
          model: singularName,
          fields: this.detectFields(prompt),
        },
      ],
      actions: ["save", "delete"],
      permissions: [`${singularName}:update`],
      theme: {
        variant: "system" as const,
      },
    };
  }

  private detectFilters(prompt: string): Array<{ key: string; type: string }> {
    const filters = [];

    if (prompt.includes("status")) {
      filters.push({ key: "status", type: "select" });
    }

    if (prompt.includes("date")) {
      filters.push({ key: "date", type: "dateRange" });
    }

    return filters;
  }

  private detectFields(prompt: string): Array<{
    key: string;
    as: string;
    label: string;
    required: boolean;
  }> {
    // Basic field detection
    const fields = [
      {
        key: "name",
        as: "VcInput",
        label: "Name",
        required: true,
      },
    ];

    if (prompt.includes("description")) {
      fields.push({
        key: "description",
        as: "VcTextarea",
        label: "Description",
        required: false,
      });
    }

    if (prompt.includes("email")) {
      fields.push({
        key: "email",
        as: "VcInput",
        label: "Email",
        required: true,
      });
    }

    if (prompt.includes("price")) {
      fields.push({
        key: "price",
        as: "VcInput",
        label: "Price",
        required: false,
      });
    }

    return fields;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Generate helpful prompt template for Cursor
 */
export function generatePromptTemplate(): string {
  return `
# UI Plan Prompt Template

Describe your UI in natural language. Examples:

## Simple List
"Products list with name, price, SKU. Search and status filter. Add product button."

## Form
"Product edit form with name (text), description (textarea), price (number), status (select)."

## Complete Module
"Product catalog: grid with name, price, status filter. Details form with validation. Admin can add/edit/delete."

## Multi-step Wizard
"Vendor onboarding: Step 1 company info (name, address), Step 2 contacts table, Step 3 review and submit."

## Keywords
- Layout: "list", "grid", "table", "form", "details", "wizard", "steps"
- Fields: "text", "email", "number", "date", "select", "textarea", "checkbox"
- Actions: "add", "edit", "delete", "save", "refresh"
- Features: "search", "filter", "pagination", "validation"
- Permissions: "admin", "read", "write", "delete"
`.trim();
}

