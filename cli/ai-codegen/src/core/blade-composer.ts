import { AICodeGenerator, type BladeGenerationContext, type AIGenerationGuide } from "./ai-code-generator.js";
import { getGenerationRulesProvider, type CompositionPattern } from "./generation-rules.js";
import { CodeValidator } from "./code-validator.js";
import type { Blade } from "./validator.js";

export interface CompositionConfig {
  context: BladeGenerationContext;
  strategy?: "simple" | "moderate" | "complex";
}

export interface CompositionResult {
  guide: AIGenerationGuide;
  selectedPatterns: CompositionPattern[];
  complexity: number;
  strategy: string;
}

/**
 * BladeComposer intelligently selects and composes patterns for AI generation
 *
 * ARCHITECTURE:
 * 1. Analyzes blade requirements (features, columns, logic)
 2. Selects relevant composition patterns
 * 3. Builds comprehensive guidance for AI
 * 4. AI reads guidance and generates code
 * 5. Validates generated code
 *
 * PATTERN SELECTION STRATEGY:
 * - Base pattern (list-basic or form-basic) - always included
 * - Feature patterns (filters, multiselect, validation) - based on features
 * - Custom patterns (custom-slots, toolbar) - based on blade customization
 * - Shared patterns (error-handling, async-select) - based on field types
 *
 * WORKFLOW:
 * ```
 * User → UI-Plan → BladeComposer
 *                     ↓
 *              selectPatterns()
 *                     ↓
 *              buildCompositionGuide()
 *                     ↓
 *              AI reads guide → generates code
 *                     ↓
 *              validateResult()
 * ```
 */
export class BladeComposer {
  private aiGenerator: AICodeGenerator;
  private rulesProvider: ReturnType<typeof getGenerationRulesProvider>;
  private validator: CodeValidator;

  constructor() {
    this.aiGenerator = new AICodeGenerator();
    this.rulesProvider = getGenerationRulesProvider();
    this.validator = new CodeValidator();
  }

  /**
   * Compose blade generation guide from patterns
   *
   * This is the main entry point for AI-driven composition
   */
  async compose(config: CompositionConfig): Promise<CompositionResult> {
    const { context } = config;

    // 1. Select relevant patterns
    const patterns = this.selectPatterns(context);

    // 2. Get generation rules
    const rules = this.rulesProvider.getRules();

    // 3. Build comprehensive guide for AI
    const guide = this.aiGenerator.buildGenerationGuide(context, patterns, rules);

    // 4. Determine strategy
    const strategy = config.strategy || this.determineStrategy(guide.estimatedComplexity);

    return {
      guide,
      selectedPatterns: patterns,
      complexity: guide.estimatedComplexity,
      strategy,
    };
  }

  /**
   * Select relevant composition patterns based on context
   *
   * This implements the pattern selection algorithm
   */
  private selectPatterns(context: BladeGenerationContext): CompositionPattern[] {
    const patterns: CompositionPattern[] = [];
    const { type, features, blade } = context;

    // 1. BASE PATTERN (always required)
    const baseName = type === "list" ? "list-basic" : "form-basic";
    const basePattern = this.rulesProvider.getPattern(baseName);
    if (basePattern) {
      patterns.push(basePattern);
    }

    // 2. FEATURE-SPECIFIC PATTERNS
    if (features.includes("filters")) {
      const filtersPattern = this.rulesProvider.getPattern("filters-pattern");
      if (filtersPattern) {
        patterns.push(filtersPattern);
      }

      // If list with filters, also need list-with-filters pattern
      if (type === "list") {
        const listFiltersPattern = this.rulesProvider.getPattern("list-with-filters");
        if (listFiltersPattern) {
          patterns.push(listFiltersPattern);
        }
      }
    }

    if (features.includes("multiselect")) {
      const multiselectPattern = this.rulesProvider.getPattern("list-with-multiselect");
      if (multiselectPattern) {
        patterns.push(multiselectPattern);
      }
    }

    if (features.includes("validation")) {
      // Form validation patterns would go here
      // For now, validation is part of form-basic
    }

    if (features.includes("gallery")) {
      // Gallery pattern for image uploads
      // Would be in form-with-gallery pattern
    }

    if (features.includes("widgets")) {
      // Dashboard widgets pattern
      // This is a complex case
    }

    // 3. CUSTOM SLOTS PATTERN
    if (blade.customSlots && blade.customSlots.length > 0) {
      const customSlotsPattern = this.rulesProvider.getPattern("custom-column-slots");
      if (customSlotsPattern) {
        patterns.push(customSlotsPattern);
      }
    }

    // 4. TOOLBAR PATTERN
    // If blade has custom toolbar actions beyond standard
    if (context.logic?.toolbar && context.logic.toolbar.length > 2) {
      const toolbarPattern = this.rulesProvider.getPattern("toolbar-patterns");
      if (toolbarPattern) {
        patterns.push(toolbarPattern);
      }
    }

    // 5. SHARED PATTERNS
    // Error handling (always good to include)
    const errorPattern = this.rulesProvider.getPattern("error-handling");
    if (errorPattern) {
      patterns.push(errorPattern);
    }

    // Async select fields detection
    if (this.hasAsyncSelectFields(context)) {
      const asyncSelectPattern = this.rulesProvider.getPattern("async-select-patterns");
      if (asyncSelectPattern) {
        patterns.push(asyncSelectPattern);
      }
    }

    // Reorderable table
    if (features.includes("reorderable")) {
      const reorderPattern = this.rulesProvider.getPattern("reorderable-table");
      if (reorderPattern) {
        patterns.push(reorderPattern);
      }
    }

    // 6. REMOVE DUPLICATES (keep unique patterns)
    const uniquePatterns = this.deduplicatePatterns(patterns);

    return uniquePatterns;
  }

  /**
   * Detect if blade has async select fields
   */
  private hasAsyncSelectFields(context: BladeGenerationContext): boolean {
    if (!context.fields) return false;

    return context.fields.some(field =>
      field.as === "VcSelect" &&
      (field.type === "async" || field.key.includes("category") || field.key.includes("type"))
    );
  }

  /**
   * Remove duplicate patterns (by name)
   */
  private deduplicatePatterns(patterns: CompositionPattern[]): CompositionPattern[] {
    const seen = new Set<string>();
    const unique: CompositionPattern[] = [];

    for (const pattern of patterns) {
      if (!seen.has(pattern.name)) {
        seen.add(pattern.name);
        unique.push(pattern);
      }
    }

    return unique;
  }

  /**
   * Determine generation strategy based on complexity
   */
  private determineStrategy(complexity: number): string {
    if (complexity <= 5) {
      return "simple"; // Can use template approach
    } else if (complexity <= 10) {
      return "moderate"; // Use composition from patterns
    } else {
      return "complex"; // Full AI generation with multiple retries
    }
  }

  /**
   * Build detailed instructions for AI
   *
   * This is what AI reads via MCP tools
   */
  buildInstructions(config: CompositionConfig): string {
    const { context } = config;
    const patterns = this.selectPatterns(context);
    const rules = this.rulesProvider.getRules();

    if (context.type === "list") {
      return this.aiGenerator.buildBladeInstructions(context, patterns, rules);
    } else {
      return this.aiGenerator.buildBladeInstructions(context, patterns, rules);
    }
  }

  /**
   * Build composable instructions
   */
  buildComposableInstructions(config: CompositionConfig): string {
    const { context } = config;
    const patterns = this.selectPatterns(context);
    const rules = this.rulesProvider.getRules();

    return this.aiGenerator.buildComposableInstructions(context, patterns, rules);
  }

  /**
   * Validate generated code
   */
  validateResult(code: string, blade: Blade): { valid: boolean; errors: string[] } {
    const validation = this.validator.validateFull(code, blade);

    return {
      valid: validation.valid,
      errors: validation.errors.map(e => e.message),
    };
  }

  /**
   * Get pattern descriptions for user feedback
   */
  describePatterns(patterns: CompositionPattern[]): string {
    if (patterns.length === 0) {
      return "No patterns selected";
    }

    let description = `Selected ${patterns.length} composition patterns:\n\n`;

    for (const pattern of patterns) {
      description += `- **${pattern.name}**: ${pattern.description}\n`;
      description += `  Components: ${pattern.requiredComponents.join(", ")}\n`;
      if (pattern.features.length > 0) {
        description += `  Features: ${pattern.features.join(", ")}\n`;
      }
      description += "\n";
    }

    return description;
  }

  /**
   * Explain composition strategy to user
   */
  explainStrategy(result: CompositionResult): string {
    const { strategy, complexity, selectedPatterns } = result;

    let explanation = `## Composition Strategy: ${strategy.toUpperCase()}\n\n`;

    explanation += `**Complexity:** ${complexity}/20\n`;
    explanation += `**Patterns:** ${selectedPatterns.length}\n\n`;

    if (strategy === "simple") {
      explanation += "This blade is straightforward and can be generated quickly using template adaptation with AST transformations.\n\n";
      explanation += "**Approach:** Template + AST (1-2 seconds)\n";
    } else if (strategy === "moderate") {
      explanation += "This blade requires composition from multiple patterns.\n\n";
      explanation += "**Approach:** AI composes from patterns (3-5 seconds)\n";
      explanation += "\n**Patterns used:**\n";
      for (const pattern of selectedPatterns) {
        explanation += `- ${pattern.name}\n`;
      }
    } else {
      explanation += "This blade is complex and requires full AI generation with careful validation.\n\n";
      explanation += "**Approach:** Full AI generation with retries (10-30 seconds)\n";
      explanation += "\n**Patterns for context:**\n";
      for (const pattern of selectedPatterns) {
        explanation += `- ${pattern.name}\n`;
      }
    }

    return explanation;
  }

  /**
   * Get pattern by name (for testing/debugging)
   */
  getPattern(name: string): CompositionPattern | undefined {
    return this.rulesProvider.getPattern(name);
  }

  /**
   * Get all available patterns
   */
  getAllPatterns(): CompositionPattern[] {
    const rules = this.rulesProvider.getRules();
    return Array.from(rules.patterns.values());
  }

  /**
   * Search patterns by feature
   */
  searchPatternsByFeature(feature: string): CompositionPattern[] {
    return this.rulesProvider.getPatternsByFeatures([feature]);
  }
}
