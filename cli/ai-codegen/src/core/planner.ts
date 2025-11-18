import type { UIPlan } from "./validator.js";
import { kebabCase } from "lodash-es";
import { buildAnalysisPrompt, getPromptAnalysisSchema, validatePromptAnalysis, type PromptAnalysis } from "./prompt-analyzer.js";

export interface PlannerOptions {
  prompt: string;
  module?: string;
  /** Optional: Pre-analyzed prompt from AI (Cursor, Claude Code) */
  analysis?: PromptAnalysis;
}

/**
 * Planner - Generates UI-Plans from prompts
 *
 * Two modes:
 * 1. With AI analysis (recommended): AI analyzes prompt → Planner builds UI-Plan
 * 2. Fallback mode: Basic entity extraction → Generic UI-Plan
 */
export class Planner {
  /**
   * Generate UI-Plan from prompt
   *
   * If analysis is provided (from AI), uses it to build rich UI-Plan.
   * Otherwise, falls back to basic entity extraction.
   */
  generatePlan(options: PlannerOptions): UIPlan {
    const { prompt, module, analysis } = options;

    if (analysis) {
      // AI-powered generation using structured analysis
      return this.generatePlanFromAnalysis(analysis, module);
    }

    // Fallback: Basic extraction
    return this.generateFallbackPlan(prompt, module);
  }

  /**
   * Generate UI-Plan from AI-analyzed prompt
   *
   * This is the preferred path when AI (Cursor, Claude Code) provides
   * structured PromptAnalysis.
   */
  private generatePlanFromAnalysis(analysis: PromptAnalysis, moduleOverride?: string): UIPlan {
    // Validate analysis
    const validation = validatePromptAnalysis(analysis);
    if (!validation.valid) {
      throw new Error(`Invalid prompt analysis: ${validation.errors.join(", ")}`);
    }

    const moduleName = moduleOverride || analysis.entityName;
    const singularName = analysis.entityNameSingular;

    const blades = [];

    // Generate list blade if columns provided
    if (analysis.columns && analysis.columns.length > 0) {
      blades.push(this.generateGridBladeFromAnalysis(moduleName, analysis));
    }

    // Generate details blade if fields provided
    if (analysis.fields && analysis.fields.length > 0) {
      blades.push(this.generateDetailsBladeFromAnalysis(moduleName, singularName, analysis));
    }

    // If no specific structure provided, generate both with defaults
    if (blades.length === 0) {
      blades.push(this.generateGridBlade(moduleName));
      blades.push(this.generateDetailsBlade(moduleName, singularName));
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

  /**
   * Generate grid blade from AI analysis
   */
  private generateGridBladeFromAnalysis(moduleName: string, analysis: PromptAnalysis) {
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
          columns: analysis.columns || [{ key: "name", title: "Name", sortable: true }],
          actions: ["add", "edit", "delete"],
          filters: [],
        },
      ],
      features: analysis.listFeatures || [],
      permissions: [`${moduleName}:read`],
      theme: { variant: "system" as const },
    };
  }

  /**
   * Generate details blade from AI analysis
   */
  private generateDetailsBladeFromAnalysis(
    moduleName: string,
    singularName: string,
    analysis: PromptAnalysis
  ) {
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
          fields: analysis.fields || [
            { key: "name", as: "VcInput", label: "Name", required: true },
          ],
        },
      ],
      features: analysis.detailsFeatures || [],
      actions: ["save", "delete"],
      permissions: [`${singularName}:update`, `${moduleName}:read`],
      theme: { variant: "system" as const },
    };
  }

  /**
   * Fallback: Generate basic UI-Plan without AI analysis
   *
   * This is used when no AI analysis is available (CLI mode without MCP).
   */
  private generateFallbackPlan(prompt: string, moduleOverride?: string): UIPlan {
    const moduleName = moduleOverride || this.extractModuleName(prompt);
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
    const candidate = tokens[0] || "items";
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
          columns: [{ key: "name", title: "Name", sortable: true }],
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

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get analysis prompt for AI
   *
   * Returns prompt that AI (Cursor, Claude Code) should use to analyze
   * user's natural language request.
   */
  getAnalysisPrompt(userPrompt: string): string {
    return buildAnalysisPrompt(userPrompt);
  }

  /**
   * Get JSON schema for PromptAnalysis
   *
   * AI tools can use this schema for structured output
   */
  getAnalysisSchema() {
    return getPromptAnalysisSchema();
  }
}

/**
 * Generate helpful prompt template for AI IDE users
 */
export function generatePromptTemplate(): string {
  return `
# UI Plan Prompt Template

Describe your UI in natural language. Examples:

- "Products management"
- "Каталог товаров"
- "Gestion des produits"
- "Vendor management with filtering and bulk operations"
- "Order tracking with approval workflow"

The AI will analyze your prompt and extract:
- Entity names
- Required features (filters, multiselect, validation, etc.)
- Table columns
- Form fields
- Relationships

You can also provide a detailed UI-Plan JSON directly for full control.
`.trim();
}
