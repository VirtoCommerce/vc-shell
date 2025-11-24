/**
 * IntentExtractor
 *
 * Extracts user intent from natural language prompts.
 * Identifies CRUD operations, relationships, workflows, and special requirements.
 */

export interface ExtractedIntent {
  /**
   * Primary intent (create, manage, view, analyze, etc.)
   */
  primary: string;

  /**
   * CRUD operations
   */
  operations: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  /**
   * Relationships
   */
  relationships?: {
    type: "parent-child" | "many-to-many" | "one-to-many";
    from: string;
    to: string;
  }[];

  /**
   * Workflows
   */
  workflows?: {
    name: string;
    steps: string[];
  }[];

  /**
   * Features extracted from intent
   */
  features: string[];

  /**
   * Constraints and requirements
   */
  constraints?: {
    permissions?: string[];
    validation?: string[];
    customActions?: string[];
  };

  /**
   * UI preferences
   */
  ui?: {
    layout?: "list" | "details" | "dashboard" | "wizard";
    features?: string[];
  };
}

/**
 * IntentExtractor
 *
 * Analyzes user prompts to extract structured intent.
 */
export class IntentExtractor {
  private crudKeywords = {
    create: ["create", "add", "new", "insert", "register"],
    read: ["view", "list", "show", "display", "read", "get"],
    update: ["edit", "update", "modify", "change"],
    delete: ["delete", "remove", "destroy"],
  };

  private featureKeywords = new Map<string, string[]>([
    ["filters", ["filter", "search", "find", "query"]],
    ["sort", ["sort", "order", "arrange"]],
    ["multiselect", ["multi", "batch", "bulk", "multiple"]],
    ["validation", ["validate", "verify", "check", "required"]],
    ["pagination", ["page", "pagination", "paging"]],
    ["export", ["export", "download", "save"]],
    ["import", ["import", "upload", "load"]],
    ["gallery", ["gallery", "images", "photos", "carousel"]],
    ["widgets", ["widget", "dashboard", "metrics", "stats"]],
    ["tabs", ["tabs", "sections", "categories"]],
  ]);

  private relationshipKeywords = {
    "parent-child": ["child", "children", "parent", "nested", "hierarchy"],
    "many-to-many": ["many-to-many", "association", "tag", "category"],
    "one-to-many": ["has many", "belongs to", "related"],
  };

  /**
   * Extract intent from prompt
   */
  extract(prompt: string): ExtractedIntent {
    const normalizedPrompt = prompt.toLowerCase();

    return {
      primary: this.extractPrimaryIntent(normalizedPrompt),
      operations: this.extractOperations(normalizedPrompt),
      relationships: this.extractRelationships(normalizedPrompt, prompt),
      workflows: this.extractWorkflows(normalizedPrompt),
      features: this.extractFeatures(normalizedPrompt),
      constraints: this.extractConstraints(normalizedPrompt),
      ui: this.extractUIPreferences(normalizedPrompt),
    };
  }

  /**
   * Extract primary intent
   */
  private extractPrimaryIntent(prompt: string): string {
    if (prompt.includes("manage") || prompt.includes("management")) {
      return "manage";
    }
    if (prompt.includes("create") || prompt.includes("add")) {
      return "create";
    }
    if (prompt.includes("view") || prompt.includes("list") || prompt.includes("show")) {
      return "view";
    }
    if (prompt.includes("analyze") || prompt.includes("report")) {
      return "analyze";
    }
    return "manage"; // Default
  }

  /**
   * Extract CRUD operations
   */
  private extractOperations(prompt: string): ExtractedIntent["operations"] {
    const operations: ExtractedIntent["operations"] = {};

    for (const [operation, keywords] of Object.entries(this.crudKeywords)) {
      operations[operation as keyof typeof operations] = keywords.some((kw) =>
        prompt.includes(kw),
      );
    }

    // If nothing specific found, assume full CRUD
    const hasAny = Object.values(operations).some((v) => v);
    if (!hasAny) {
      return {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
    }

    return operations;
  }

  /**
   * Extract relationships
   */
  private extractRelationships(
    prompt: string,
    originalPrompt: string,
  ): ExtractedIntent["relationships"] {
    const relationships: ExtractedIntent["relationships"] = [];

    // Simple heuristic: look for "X has Y" or "X belongs to Y"
    const hasPattern = /(\w+)\s+(?:has|have)\s+(?:many\s+)?(\w+)/gi;
    const belongsPattern = /(\w+)\s+belongs?\s+to\s+(\w+)/gi;

    let match;
    while ((match = hasPattern.exec(originalPrompt)) !== null) {
      relationships.push({
        type: "one-to-many",
        from: match[1],
        to: match[2],
      });
    }

    while ((match = belongsPattern.exec(originalPrompt)) !== null) {
      relationships.push({
        type: "one-to-many",
        from: match[2],
        to: match[1],
      });
    }

    return relationships.length > 0 ? relationships : undefined;
  }

  /**
   * Extract workflows
   */
  private extractWorkflows(prompt: string): ExtractedIntent["workflows"] {
    // Simple workflow detection
    if (
      prompt.includes("workflow") ||
      prompt.includes("process") ||
      prompt.includes("approval")
    ) {
      return [
        {
          name: "default",
          steps: ["draft", "review", "approved"],
        },
      ];
    }
    return undefined;
  }

  /**
   * Extract features from intent
   */
  private extractFeatures(prompt: string): string[] {
    const features = new Set<string>();

    for (const [feature, keywords] of this.featureKeywords.entries()) {
      if (keywords.some((kw) => prompt.includes(kw))) {
        features.add(feature);
      }
    }

    // Smart defaults based on intent
    if (prompt.includes("list") || prompt.includes("table") || prompt.includes("grid")) {
      features.add("filters");
      features.add("sort");
    }

    if (prompt.includes("form") || prompt.includes("edit") || prompt.includes("details")) {
      features.add("validation");
    }

    return Array.from(features);
  }

  /**
   * Extract constraints
   */
  private extractConstraints(prompt: string): ExtractedIntent["constraints"] | undefined {
    const constraints: ExtractedIntent["constraints"] = {};

    // Permissions
    if (prompt.includes("permission") || prompt.includes("role") || prompt.includes("access")) {
      constraints.permissions = ["read", "create", "update", "delete"];
    }

    // Validation
    if (prompt.includes("required") || prompt.includes("validate")) {
      constraints.validation = ["required", "format"];
    }

    // Custom actions
    const actionMatches = prompt.match(/custom action[s]?: ([^.]+)/i);
    if (actionMatches) {
      constraints.customActions = actionMatches[1].split(",").map((s) => s.trim());
    }

    return Object.keys(constraints).length > 0 ? constraints : undefined;
  }

  /**
   * Extract UI preferences
   */
  private extractUIPreferences(prompt: string): ExtractedIntent["ui"] | undefined {
    const ui: ExtractedIntent["ui"] = {};

    // Layout
    if (prompt.includes("wizard")) {
      ui.layout = "wizard";
    } else if (prompt.includes("dashboard")) {
      ui.layout = "dashboard";
    } else if (prompt.includes("details") || prompt.includes("form")) {
      ui.layout = "details";
    } else if (prompt.includes("list") || prompt.includes("table")) {
      ui.layout = "list";
    }

    // Features
    const features: string[] = [];
    if (prompt.includes("filter")) features.push("filters");
    if (prompt.includes("sort")) features.push("sort");
    if (prompt.includes("search")) features.push("search");

    if (features.length > 0) {
      ui.features = features;
    }

    return Object.keys(ui).length > 0 ? ui : undefined;
  }
}
