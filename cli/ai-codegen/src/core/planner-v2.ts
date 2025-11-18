/**
 * PlannerV2 - Multi-Entity UI-Plan Generator
 *
 * Supports:
 * - Multiple entities per module
 * - Custom routes, permissions, actions
 * - Rich feature set (40+ features)
 * - Workflow definitions
 * - Data source configurations
 */

import type { UIPlan } from "./validator.js";
import { kebabCase } from "lodash-es";
import {
  validatePromptAnalysisV2,
  type PromptAnalysisV2,
  buildAnalysisPromptV2,
  getPromptAnalysisSchemaV2,
} from "./prompt-analyzer-v2.js";

export interface PlannerV2Options {
  prompt: string;
  /** Pre-analyzed prompt from AI (recommended) */
  analysis?: PromptAnalysisV2;
}

/**
 * PlannerV2 - Generates rich UI-Plans from V2 analysis
 *
 * Supports multiple entities, custom configurations, and workflows.
 */
export class PlannerV2 {
  /**
   * Generate UI-Plan from prompt or V2 analysis
   */
  generatePlan(options: PlannerV2Options): UIPlan {
    const { prompt, analysis } = options;

    if (analysis) {
      // V2 AI-powered generation
      return this.generatePlanFromAnalysisV2(analysis);
    }

    // Fallback: Basic extraction (same as V1)
    return this.generateFallbackPlan(prompt);
  }

  /**
   * Generate UI-Plan from V2 analysis
   *
   * This is the core V2 logic that handles:
   * - Multiple entities
   * - Custom routes, permissions, actions
   * - Rich features
   * - Workflows
   */
  private generatePlanFromAnalysisV2(analysis: PromptAnalysisV2): UIPlan {
    // Validate analysis
    const validation = validatePromptAnalysisV2(analysis);
    if (!validation.valid) {
      throw new Error(`Invalid V2 prompt analysis: ${validation.errors.join(", ")}`);
    }

    const blades = [];
    const dataSources: Record<string, any> = {};

    // Generate blades for each entity
    for (const entity of analysis.entities) {
      // Add data source for entity
      if (entity.dataSource) {
        dataSources[entity.name] = this.buildDataSource(entity.dataSource);
      } else {
        // Default API data source
        dataSources[entity.name] = {
          type: "api",
          endpoint: `/api/${entity.name}`,
        };
      }

      // Generate blades for this entity
      for (const bladeConfig of entity.blades) {
        const blade = this.generateBlade(entity, bladeConfig, analysis);
        blades.push(blade);
      }
    }

    const plan: UIPlan = {
      $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
      module: analysis.moduleName,
      blades,
      data: {
        sources: dataSources,
      },
    };

    // Add workflow if present
    if (analysis.workflow) {
      (plan ).workflow = analysis.workflow;
    }

    // Add global features if present
    if (analysis.globalFeatures && analysis.globalFeatures.length > 0) {
      (plan ).globalFeatures = analysis.globalFeatures;
    }

    return plan;
  }

  /**
   * Generate a single blade from entity and blade config
   */
  private generateBlade(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0],
    analysis: PromptAnalysisV2
  ): any {
    const bladeId = this.generateBladeId(entity, bladeConfig);
    const route = bladeConfig.route || this.generateDefaultRoute(entity, bladeConfig);

    const blade: any = {
      id: bladeId,
      route,
      layout: this.mapBladeTypeToLayout(bladeConfig.type),
      title: this.generateTitle(entity, bladeConfig),
      isWorkspace: bladeConfig.isWorkspace ?? bladeConfig.type === "list",
    };

    // Add components based on blade type
    if (bladeConfig.type === "list") {
      blade.components = [this.generateTableComponent(entity, bladeConfig)];
    } else if (bladeConfig.type === "details") {
      blade.components = [this.generateFormComponent(entity, bladeConfig)];
    } else if (bladeConfig.type === "dashboard") {
      blade.components = [this.generateDashboardComponent(entity, bladeConfig)];
    } else if (bladeConfig.type === "wizard") {
      blade.components = [this.generateWizardComponent(entity, bladeConfig)];
    }

    // Add features (normalize to valid feature set)
    blade.features = this.normalizeFeatures(bladeConfig.features || []);

    // Add custom actions if provided (normalize to valid actions)
    if (bladeConfig.actions && bladeConfig.actions.length > 0) {
      const { validActions, customActions } = this.normalizeActions(bladeConfig.actions);
      blade.actions = validActions;
      if (customActions.length > 0) {
        blade.customActions = customActions; // Store full action config for invalid actions
      }
    } else {
      // Default actions based on blade type
      if (bladeConfig.type === "list") {
        blade.actions = ["add", "edit", "delete"];
      } else if (bladeConfig.type === "details") {
        blade.actions = ["save", "delete"];
      }
    }

    // Add permissions
    if (bladeConfig.permissions && bladeConfig.permissions.length > 0) {
      blade.permissions = bladeConfig.permissions;
    } else {
      // Default permissions
      blade.permissions = this.generateDefaultPermissions(entity, bladeConfig);
    }

    // Add theme
    blade.theme = { variant: "system" as const };

    return blade;
  }

  /**
   * Generate blade ID
   */
  private generateBladeId(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): string {
    if (bladeConfig.type === "list") {
      return `${entity.name}-list`;
    } else if (bladeConfig.type === "details") {
      return `${entity.singular}-details`;
    } else if (bladeConfig.type === "dashboard") {
      return `${entity.name}-dashboard`;
    } else if (bladeConfig.type === "wizard") {
      return `${entity.singular}-wizard`;
    }
    return `${entity.name}-custom`;
  }

  /**
   * Generate default route if not provided
   */
  private generateDefaultRoute(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): string {
    if (bladeConfig.type === "list" || bladeConfig.type === "dashboard") {
      return `/${entity.name}`;
    } else if (bladeConfig.type === "details" || bladeConfig.type === "wizard") {
      return `/${entity.singular}`;
    }
    return `/${entity.name}`;
  }

  /**
   * Map blade type to layout
   */
  private mapBladeTypeToLayout(type: string): "grid" | "details" | "page" {
    if (type === "list") return "grid";
    if (type === "details" || type === "wizard") return "details";
    return "page"; // dashboard, custom
  }

  /**
   * Generate title
   */
  private generateTitle(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): string {
    const entityTitle = this.capitalizeFirst(entity.name.replace(/-/g, " "));

    if (bladeConfig.type === "list") {
      return entityTitle;
    } else if (bladeConfig.type === "details") {
      return `${this.capitalizeFirst(entity.singular.replace(/-/g, " "))} Details`;
    } else if (bladeConfig.type === "dashboard") {
      return `${entityTitle} Dashboard`;
    } else if (bladeConfig.type === "wizard") {
      return `Create ${this.capitalizeFirst(entity.singular.replace(/-/g, " "))}`;
    }
    return entityTitle;
  }

  /**
   * Generate VcTable component
   */
  private generateTableComponent(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): any {
    const columns = (bladeConfig.columns || [
      { id: "name", title: "Name", sortable: true },
    ]).map(col => this.normalizeColumn(col));

    return {
      type: "VcTable",
      dataSource: entity.name,
      columns,
      actions: bladeConfig.actions?.map((a) => a.id) || ["add", "edit", "delete"],
      filters: [],
    };
  }

  /**
   * Normalize column types to match schema
   */
  private normalizeColumn(column: any): any {
    const validTypes = ["text", "number", "money", "date", "date-ago", "status", "boolean", "image", "email", "link", "badge", "actions", "custom"];

    let type = column.type;

    // Map invalid types to valid ones
    if (type === "status-icon") {
      type = "status";
    }
    // If type is not valid, use "custom"
    if (type && !validTypes.includes(type)) {
      type = "custom";
    }

    return {
      ...column,
      ...(type && { type }),
    };
  }

  /**
   * Generate VcForm component
   */
  private generateFormComponent(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): any {
    const fields = (bladeConfig.fields || [
      { key: "name", as: "VcInput", label: "Name", required: true },
    ]).map(field => this.normalizeField(field));

    return {
      type: "VcForm",
      model: entity.singular,
      fields,
    };
  }

  /**
   * Normalize field to match schema
   */
  private normalizeField(field: any): any {
    const validAs = ["VcInput", "VcTextarea", "VcSelect", "VcCheckbox", "VcSwitch", "VcGallery", "VcFileUpload"];
    const validTypes = ["text", "email", "number", "date", "boolean", "url", "tel"];

    let { type, options, as, ...rest } = field;

    // Normalize "as" field
    if (as && !validAs.includes(as)) {
      // Map common invalid types to valid ones
      if (as === "VcDynamicList") {
        as = "VcGallery"; // Best approximation
      } else {
        as = "VcInput"; // Default fallback
      }
    }

    // Normalize type field
    if (type && !validTypes.includes(type)) {
      // Remove invalid types like "async", "select", "array"
      if (type === "async") {
        // Move to separate async flag
        rest.async = true;
        type = undefined;
      } else if (type === "select") {
        // VcSelect doesn't need type
        type = undefined;
      } else if (type === "array") {
        type = undefined;
      } else {
        // Default to text
        type = "text";
      }
    }

    // Normalize options to {label, value} format
    if (options && Array.isArray(options)) {
      options = options.map(opt => {
        if (typeof opt === "string") {
          return { label: opt, value: opt };
        }
        return opt;
      });
    }

    return {
      ...rest,
      as,
      ...(type && { type }),
      ...(options && { options }),
    };
  }

  /**
   * Generate dashboard component (placeholder)
   */
  private generateDashboardComponent(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): any {
    return {
      type: "VcContainer",
      layout: "dashboard",
      widgets: [], // TODO: Generate from globalFeatures
    };
  }

  /**
   * Generate wizard component (placeholder)
   */
  private generateWizardComponent(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): any {
    const fields = bladeConfig.fields || [
      { key: "name", as: "VcInput", label: "Name", required: true },
    ];

    return {
      type: "VcForm",
      model: entity.singular,
      fields,
      mode: "wizard",
    };
  }

  /**
   * Build data source config
   */
  private buildDataSource(dataSource: PromptAnalysisV2["entities"][0]["dataSource"]): any {
    if (!dataSource) {
      return { type: "api" };
    }

    const config: any = { type: dataSource.type };

    if (dataSource.endpoint) {
      config.endpoint = dataSource.endpoint;
    }
    if (dataSource.query) {
      config.query = dataSource.query;
    }
    if (dataSource.transform) {
      config.transform = dataSource.transform;
    }

    return config;
  }

  /**
   * Generate default permissions
   */
  private generateDefaultPermissions(
    entity: PromptAnalysisV2["entities"][0],
    bladeConfig: PromptAnalysisV2["entities"][0]["blades"][0]
  ): string[] {
    const permissions: string[] = [`${entity.name}:read`];

    if (bladeConfig.type === "details" || bladeConfig.type === "wizard") {
      permissions.push(`${entity.singular}:update`);
    }

    return permissions;
  }

  /**
   * Fallback: Generate basic UI-Plan (same as V1)
   */
  private generateFallbackPlan(prompt: string): UIPlan {
    const moduleName = this.extractModuleName(prompt);
    const singularName = this.toSingular(moduleName);

    const blades = [
      this.generateGridBlade(moduleName),
      this.generateDetailsBlade(moduleName, singularName),
    ];

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
    const tokens = prompt.split(/[\s,]+/).filter(Boolean);

    // Improved: Try to extract meaningful entity name from prompt
    // Handle cases like "vendor management", "product catalog", etc.
    // Stop at action words or common separators
    const actionWords = new Set([
      "with", "for", "and", "or", "by", "that", "which", "create",
      "manage", "show", "display", "list", "view", "edit", "add",
    ]);

    const entityTokens = [];
    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      if (actionWords.has(lowerToken)) {
        break; // Stop at action words
      }
      entityTokens.push(token);

      // Max 3 words for entity name
      if (entityTokens.length >= 3) break;
    }

    const candidate = entityTokens.join(" ") || tokens[0] || "items";
    return kebabCase(candidate);
  }

  private toSingular(word: string): string {
    if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
    if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("ches") || word.endsWith("shes")) {
      return word.slice(0, -2);
    }
    if (word.endsWith("s") && word.length > 1) return word.slice(0, -1);
    return word;
  }

  private generateGridBlade(moduleName: string) {
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
          columns: [{ id: "name", title: "Name", sortable: true }],
          actions: ["add", "edit", "delete"],
          filters: [],
        },
      ],
      features: [],
      permissions: [`${moduleName}:read`],
      theme: { variant: "system" as const },
    };
  }

  private generateDetailsBlade(moduleName: string, singularName: string) {
    return {
      id: `${singularName}-details`,
      route: `/${singularName}`,
      layout: "details" as const,
      title: `${this.capitalizeFirst(singularName)} Details`,
      isWorkspace: false,
      components: [
        {
          type: "VcForm",
          model: singularName,
          fields: [
            { key: "name", as: "VcInput", label: "Name", required: true },
          ],
        },
      ],
      actions: ["save", "delete"],
      permissions: [`${singularName}:update`, `${moduleName}:read`],
      theme: { variant: "system" as const },
    };
  }

  /**
   * Normalize features to valid feature set
   */
  private normalizeFeatures(features: string[]): string[] {
    const validFeatures = ["filters", "multiselect", "validation", "gallery", "widgets"];
    return features.filter(f => validFeatures.includes(f));
  }

  /**
   * Normalize actions - separate valid schema actions from custom actions
   */
  private normalizeActions(actions: any[]): { validActions: string[], customActions: any[] } {
    const validActionIds = ["save", "delete", "refresh", "add", "edit", "remove", "next", "back", "submit"];

    const validActions: string[] = [];
    const customActions: any[] = [];

    for (const action of actions) {
      const actionId = typeof action === "string" ? action : action.id;

      if (validActionIds.includes(actionId)) {
        validActions.push(actionId);
      } else {
        // Custom action - store full config
        customActions.push(action);
      }
    }

    return { validActions, customActions };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get analysis prompt for V2
   */
  getAnalysisPrompt(userPrompt: string): string {
    return buildAnalysisPromptV2(userPrompt);
  }

  /**
   * Get JSON schema for V2
   */
  getAnalysisSchema() {
    return getPromptAnalysisSchemaV2();
  }
}

/**
 * Generate helpful prompt template for V2
 */
export function generatePromptTemplateV2(): string {
  return `
# UI Plan Prompt Template (V2 - Extended)

Describe your UI in natural language. V2 supports complex multi-entity scenarios.

## Simple Examples:
- "Products management"
- "Vendor management with filtering"

## Complex Examples:
- "Order management with approval workflow. Orders have line items."
- "Product analytics dashboard with sales charts and inventory widgets"
- "Multi-step product creation wizard with validation"
- "Vendor management: pending vendors need approval, approved vendors can create orders"

## What V2 Can Detect:
- Multiple entities (Orders, Line Items, Customers)
- Custom routes (/vendors/pending, /orders/approved)
- Custom actions (approve, reject, publish, archive)
- Workflows (linear, branching, parallel)
- Rich features (40+ features)
- Permissions per blade
- Data sources (API, GraphQL, static)

The AI will analyze your prompt and extract all this information automatically.
`.trim();
}
