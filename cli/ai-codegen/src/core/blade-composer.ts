import { AICodeGenerator, type AIGenerationGuide } from "./ai-code-generator.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import { getGenerationRulesProvider, type CompositionPattern } from "./generation-rules.js";
import { CodeValidator } from "./code-validator.js";
import { TemplateAdapter } from "./template-adapter.js";
import { PatternMerger } from "./pattern-merger.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Blade } from "./validator.js";
import type { UIPlanBlade } from "../schemas/zod-schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  private patternMerger: PatternMerger;

  constructor() {
    this.aiGenerator = new AICodeGenerator();
    this.rulesProvider = getGenerationRulesProvider();
    this.validator = new CodeValidator();
    this.patternMerger = new PatternMerger();
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
   * This implements the pattern selection algorithm using new pattern library
   */
  selectPatterns(context: BladeGenerationContext): CompositionPattern[] {
    const patterns: CompositionPattern[] = [];
    const { type, features, blade } = context;

    // 1. BASE PATTERN (always required)
    if (type === "list") {
      const basePattern = this.loadPatternFromFile("list/list-basic.md");
      if (basePattern) patterns.push(basePattern);
    } else {
      const basePattern = this.loadPatternFromFile("details/form-basic.md");
      if (basePattern) patterns.push(basePattern);
    }

    // 2. FEATURE-SPECIFIC PATTERNS
    if (features.includes("filters")) {
      const filtersPattern = this.loadPatternFromFile("list/filters-pattern.md");
      if (filtersPattern) patterns.push(filtersPattern);
    }

    if (features.includes("multiselect")) {
      const multiselectPattern = this.loadPatternFromFile("list/multiselect.md");
      if (multiselectPattern) patterns.push(multiselectPattern);
    }

    if (features.includes("reorderable")) {
      const reorderPattern = this.loadPatternFromFile("list/reorderable-table.md");
      if (reorderPattern) patterns.push(reorderPattern);
    }

    if (features.includes("validation")) {
      const validationPattern = this.loadPatternFromFile("details/validation-patterns.md");
      if (validationPattern) patterns.push(validationPattern);
    }

    if (features.includes("gallery")) {
      const galleryPattern = this.loadPatternFromFile("details/gallery-patterns.md");
      if (galleryPattern) patterns.push(galleryPattern);
    }

    if (features.includes("widgets")) {
      const widgetsPattern = this.loadPatternFromFile("details/widgets-registration.md");
      if (widgetsPattern) patterns.push(widgetsPattern);
    }

    // 3. SHARED PATTERNS

    // Always include error handling
    const errorPattern = this.loadPatternFromFile("shared/error-handling.md");
    if (errorPattern) patterns.push(errorPattern);

    // Parent-child communication for list blades
    if (type === "list") {
      const parentChildPattern = this.loadPatternFromFile("shared/parent-child-communication.md");
      if (parentChildPattern) patterns.push(parentChildPattern);
    }

    // Async select fields detection
    if (this.hasAsyncSelectFields(context)) {
      const asyncSelectPattern = this.loadPatternFromFile("shared/async-select-patterns.md");
      if (asyncSelectPattern) patterns.push(asyncSelectPattern);
    }

    // Custom column slots for list blades with custom rendering
    if (type === "list" && this.hasCustomColumnSlots(context)) {
      const customSlotsPattern = this.loadPatternFromFile("shared/custom-column-slots.md");
      if (customSlotsPattern) patterns.push(customSlotsPattern);
    }

    // 4. REMOVE DUPLICATES (keep unique patterns)
    const uniquePatterns = this.deduplicatePatterns(patterns);

    return uniquePatterns;
  }

  /**
   * Load pattern from markdown file
   */
  private loadPatternFromFile(relativePath: string): CompositionPattern | null {
    try {
      const compositionsPath = __dirname.includes("/dist")
        ? path.join(__dirname, "examples", "compositions")
        : path.join(__dirname, "..", "examples", "compositions");

      const patternPath = path.join(compositionsPath, relativePath);

      if (!fs.existsSync(patternPath)) {
        console.warn(`Pattern file not found: ${patternPath}`);
        return null;
      }

      const content = fs.readFileSync(patternPath, "utf-8");
      const name = path.basename(relativePath, ".md");

      // Extract description from markdown (first paragraph after title)
      const descriptionMatch = content.match(/^# .+?\n\n(.+?)(?:\n\n|$)/s);
      const description = descriptionMatch ? descriptionMatch[1].trim() : "Pattern";

      // Determine category from file path
      const type: CompositionPattern["type"] = relativePath.startsWith("list/") ? "list"
        : relativePath.startsWith("details/") ? "details"
        : "shared";

      return {
        name,
        description,
        type,
        content,
        requiredComponents: this.extractComponentsFromPattern(content),
        features: this.extractFeaturesFromPattern(content),
      };
    } catch (error) {
      console.error(`Failed to load pattern ${relativePath}:`, error);
      return null;
    }
  }

  /**
   * Extract component names from pattern content
   */
  private extractComponentsFromPattern(content: string): string[] {
    const components = new Set<string>();
    const componentPattern = /(Vc[A-Z][a-zA-Z]+)/g;
    let match;

    while ((match = componentPattern.exec(content)) !== null) {
      components.add(match[1]);
    }

    return Array.from(components);
  }

  /**
   * Extract features from pattern content
   */
  private extractFeaturesFromPattern(content: string): string[] {
    const features: string[] = [];

    if (content.includes("filters") || content.includes("Filter")) features.push("filters");
    if (content.includes("multiselect") || content.includes("selection")) features.push("multiselect");
    if (content.includes("validation") || content.includes("vee-validate")) features.push("validation");
    if (content.includes("gallery") || content.includes("VcGallery")) features.push("gallery");
    if (content.includes("widgets") || content.includes("useWidgets")) features.push("widgets");
    if (content.includes("reorderable") || content.includes("drag")) features.push("reorderable");

    return features;
  }

  /**
   * Check if blade has custom column slots
   */
  private hasCustomColumnSlots(context: BladeGenerationContext): boolean {
    // Check if any columns have custom rendering needs
    if (!context.columns) return false;

    return context.columns.some(col =>
      col.type === "image" ||
      col.type === "badge" ||
      col.type === "status" ||
      col.type === "custom"
    );
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
   * Compose blade code from patterns using PatternMerger
   *
   * This generates actual Vue SFC code by intelligently merging patterns
   */
  composeBlade(context: BladeGenerationContext, patterns: CompositionPattern[]): string {
    const patternNames = patterns.map(p => p.name);

    try {
      // Use PatternMerger to compose from patterns
      const merged = this.patternMerger.merge(patterns, {
        deduplicateImports: true,
        sortImports: true,
        addComments: true,
        indentSize: 2,
      });

      // Build complete SFC
      let code = this.patternMerger.buildSFC(merged, {
        addComments: true,
        indentSize: 2,
      });

      // Add generation metadata as comment
      const metadata = `<!--
  Generated by PATTERN COMPOSITION strategy
  Patterns merged: ${patternNames.join(", ")}

  This code was dynamically composed from ${patterns.length} patterns:
  ${patterns.map(p => `  - ${p.name}: ${p.description}`).join("\n")}
-->

`;

      code = metadata + code;

      // Apply entity name replacements
      code = this.applyEntityReplacements(code, context);

      return code;
    } catch (error) {
      console.error("PatternMerger failed, falling back to TemplateAdapter:", error);

      // Fallback to template adapter if pattern merging fails
      return this.composeBladeFromTemplate(context, patterns);
    }
  }

  /**
   * Fallback method using TemplateAdapter
   */
  private composeBladeFromTemplate(context: BladeGenerationContext, patterns: CompositionPattern[]): string {
    const patternNames = patterns.map(p => p.name);
    const hasFilters = patternNames.some(p => p.includes("filter"));
    const hasMultiselect = patternNames.some(p => p.includes("multiselect"));

    // Determine template name based on features
    let templateName = context.type === "list" ? "list-simple" : "details-simple";

    if (context.type === "list") {
      if (hasFilters) {
        templateName = "list-filters";
      } else if (hasMultiselect) {
        templateName = "list-multiselect";
      }
    } else {
      if (context.features.includes("validation")) {
        templateName = "details-validation";
      }
    }

    const adapter = new TemplateAdapter();

    const config = {
      naming: context.naming,
      componentName: context.componentName,
      composableName: context.composableName,
      route: context.route,
      isWorkspace: context.isWorkspace,
      menuTitleKey: context.menuTitleKey,
      columns: context.columns,
      fields: context.fields,
      features: context.features,
    };

    const templatesPath = __dirname.includes("/dist")
      ? path.join(__dirname, "examples", "templates")
      : path.join(__dirname, "..", "examples", "templates");

    const templatePath = path.join(templatesPath, `${templateName}.vue`);
    const templateContent = fs.readFileSync(templatePath, "utf-8");

    const code = context.type === "list"
      ? adapter.adaptListTemplate(templateContent, config)
      : adapter.adaptDetailsTemplate(templateContent, config);

    const patternComment = `<!--
  Generated by TEMPLATE FALLBACK
  Attempted patterns: ${patternNames.join(", ")}

  Note: PatternMerger failed, using template adaptation
-->

`;

    return patternComment + code;
  }

  /**
   * Apply entity name replacements to generated code
   */
  private applyEntityReplacements(code: string, context: BladeGenerationContext): string {
    if (!context.naming) return code;

    const { naming } = context;

    // Replace placeholders with actual entity names
    let replaced = code;

    // Entity names
    replaced = replaced.replace(/useEntityList/g, naming.composableList || "useEntityList");
    replaced = replaced.replace(/useEntityDetails/g, naming.composableDetails || "useEntityDetails");
    replaced = replaced.replace(/EntityList/g, naming.componentList || "EntityList");
    replaced = replaced.replace(/EntityDetails/g, naming.componentDetails || "EntityDetails");

    // Routes
    if (context.route) {
      replaced = replaced.replace(/\/entity/g, context.route);
    }

    // Titles
    if (context.menuTitleKey) {
      replaced = replaced.replace(/pages\.entity/g, context.menuTitleKey);
    }

    return replaced;
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
    const validation = this.validator.validateFull(code, blade as unknown as UIPlanBlade);

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
