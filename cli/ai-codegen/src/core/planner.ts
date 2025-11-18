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
          columns: analysis.columns || [{ id: "name", title: "Name", sortable: true }],
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
    const features = this.extractFeatures(prompt);
    const columns = this.extractColumns(prompt);

    const blades = [
      this.generateGridBlade(moduleName, features.list, columns),
      this.generateDetailsBlade(moduleName, singularName, features.details),
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
    // Try to extract entity name from common patterns
    const patterns = [
      /(?:create|manage|build|generate|make|add)\s+(?:a\s+)?(?:module\s+for\s+)?(\w+)/i,
      /(?:CRUD|crud)\s+(?:for\s+)?(\w+)/i,
      /(\w+)\s+(?:management|manager|list|catalog|module)/i,
      /(?:module|entity|resource)\s+(?:called\s+)?(\w+)/i,
    ];

    // Try each pattern
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return kebabCase(match[1]);
      }
    }

    // Fallback: get first meaningful word (skip common verbs/articles)
    const skipWords = new Set(['create', 'make', 'build', 'generate', 'add', 'new', 'a', 'an', 'the', 'for', 'module', 'entity']);
    const tokens = prompt.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const candidate = tokens.find(t => !skipWords.has(t)) || tokens[0] || "items";

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

  private extractFeatures(prompt: string): { list: string[], details: string[] } {
    const lower = prompt.toLowerCase();
    const listFeatures: string[] = [];
    const detailsFeatures: string[] = [];

    // List features
    if (lower.includes("filter") || lower.includes("search")) {
      listFeatures.push("filters");
    }
    if (lower.includes("multiselect") || lower.includes("bulk") || lower.includes("multi-select")) {
      listFeatures.push("multiselect");
    }
    if (lower.includes("reorder") || lower.includes("drag") || lower.includes("sort order")) {
      listFeatures.push("reorderable");
    }

    // Details features
    if (lower.includes("validat") || lower.includes("require")) {
      detailsFeatures.push("validation");
    }
    if (lower.includes("image") || lower.includes("photo") || lower.includes("gallery")) {
      detailsFeatures.push("gallery");
    }
    if (lower.includes("widget") || lower.includes("dashboard")) {
      detailsFeatures.push("widgets");
    }

    return { list: listFeatures, details: detailsFeatures };
  }

  private extractColumns(prompt: string): Array<{ id: string, title: string, sortable?: boolean, type?: string }> {
    const lower = prompt.toLowerCase();
    const columns: Array<{ id: string, title: string, sortable?: boolean, type?: string }> = [];

    // Common field patterns
    const fieldPatterns = [
      { keywords: ['name', 'title'], id: 'name', title: 'Name', sortable: true },
      { keywords: ['email', 'mail'], id: 'email', title: 'Email', sortable: true },
      { keywords: ['status'], id: 'status', title: 'Status', sortable: true },
      { keywords: ['date', 'created'], id: 'createdDate', title: 'Created', sortable: true, type: 'date-ago' },
      { keywords: ['price', 'cost', 'amount'], id: 'price', title: 'Price', sortable: true },
      { keywords: ['description', 'desc'], id: 'description', title: 'Description' },
    ];

    // Add columns based on keywords found
    for (const pattern of fieldPatterns) {
      if (pattern.keywords.some(kw => lower.includes(kw))) {
        const col: { id: string, title: string, sortable?: boolean, type?: string } = {
          id: pattern.id,
          title: pattern.title,
        };
        if (pattern.sortable) col.sortable = pattern.sortable;
        if (pattern.type) col.type = pattern.type;
        columns.push(col);
      }
    }

    // Always include at least name and createdDate if nothing found
    if (columns.length === 0) {
      columns.push({ id: 'name', title: 'Name', sortable: true });
      columns.push({ id: 'createdDate', title: 'Created', sortable: true, type: 'date-ago' });
    }

    return columns;
  }

  private generateGridBlade(moduleName: string, features: string[] = [], columns?: Array<{ id: string, title: string, sortable?: boolean, type?: string }>) {
    const defaultColumns = [{ id: "name", title: "Name", sortable: true }];
    const tableColumns = columns && columns.length > 0 ? columns : defaultColumns;

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
          columns: tableColumns,
          actions: ["add", "edit", "delete"],
          filters: [],
        },
      ],
      features,
      permissions: [`${moduleName}:read`],
      theme: { variant: "system" as const },
    };
  }

  private generateDetailsBlade(moduleName: string, singularName: string, features: string[] = []) {
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
      features,
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
