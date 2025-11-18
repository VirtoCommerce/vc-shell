import { BladeComposer, type CompositionConfig } from "./blade-composer.js";
import { TemplateAdapter } from "./template-adapter.js";
import { LogicPlanner } from "./logic-planner.js";
import { AIGenerationGuideBuilder } from "./ai-generation-guide-builder.js";
import { getGenerationRulesProvider } from "./generation-rules.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import type { Blade } from "./validator.js";
import type { UIPlan } from "./validator.js";

export enum GenerationStrategy {
  /**
   * Template-based generation with AST transformations
   * - Fast (1-2 seconds)
   * - Reliable
   * - Limited to 5 template variants
   * - Best for simple cases
   */
  TEMPLATE = "template",

  /**
   * Composition from patterns
   * - Moderate speed (3-5 seconds)
   * - AI composes from multiple patterns
   * - Flexible (can combine features)
   * - Best for standard cases with known patterns
   */
  COMPOSITION = "composition",

  /**
   * AI-Guided generation (NEW in v0.7.0)
   * - Returns detailed step-by-step instructions for AI
   * - AI (Cursor/Claude) reads instructions and generates code
   * - No Anthropic API key needed
   * - Best for complex cases (complexity > 10)
   * - Maximum quality (AI knows project context)
   */
  AI_GUIDED = "ai-guided",

  /**
   * Full AI generation (DEPRECATED - kept for compatibility)
   * - Falls back to AI_GUIDED in MCP mode
   * - Falls back to COMPOSITION in CLI mode
   * - Best for complex cases or custom logic
   */
  AI_FULL = "ai-full",
}

export interface StrategyDecision {
  strategy: GenerationStrategy;
  reason: string;
  complexity: number;
  estimatedTime: string;
  willUseFallback: boolean;
  aiGuide?: any; // AIGenerationGuide when AI_GUIDED is selected
}

export interface GenerationOptions {
  forceStrategy?: GenerationStrategy;
  allowFallback?: boolean;
  maxRetries?: number;
}

/**
 * SmartCodeGenerator intelligently selects generation strategy
 *
 * ARCHITECTURE:
 * ```
 * UI-Plan → analyze() → select strategy:
 *
 * Simple (complexity < 5):
 *   → TEMPLATE: Fast AST transformation
 *
 * Moderate (complexity 5-10):
 *   → COMPOSITION: AI composes from patterns
 *   → Fallback to TEMPLATE if fails
 *
 * Complex (complexity > 10):
 *   → AI_FULL: Complete AI generation
 *   → Retry with stricter rules if fails
 *   → Fallback to COMPOSITION if all retries fail
 * ```
 *
 * DECISION FACTORS:
 * 1. Complexity score (0-20)
 *    - Base: list=5, details=4
 *    - Features: +2 each
 *    - Custom logic: +3
 *    - Widgets: +5
 *
 * 2. Pattern availability
 *    - Known patterns → COMPOSITION
 *    - Unknown patterns → AI_FULL
 *
 * 3. Time constraints
 *    - Quick mode → prefer TEMPLATE
 *    - Quality mode → prefer COMPOSITION/AI_FULL
 */
export class SmartCodeGenerator {
  private composer: BladeComposer;
  private logicPlanner: LogicPlanner;
  private templateAdapter: TemplateAdapter;
  private guideBuilder: AIGenerationGuideBuilder;

  constructor() {
    this.composer = new BladeComposer();
    this.logicPlanner = new LogicPlanner();
    this.templateAdapter = new TemplateAdapter();

    // Initialize AIGenerationGuideBuilder with optional rules
    const rulesProvider = getGenerationRulesProvider();
    const rules = rulesProvider.getRules();

    this.guideBuilder = new AIGenerationGuideBuilder(rules);
  }

  /**
   * Analyze blade and decide generation strategy
   */
  async decide(
    context: BladeGenerationContext,
    options: GenerationOptions = {},
  ): Promise<StrategyDecision> {
    // If user forces strategy, use it
    if (options.forceStrategy) {
      return this.createDecision(
        options.forceStrategy,
        "User-specified strategy",
        0,
        options.allowFallback ?? true,
      );
    }

    // Calculate complexity
    const complexity = this.calculateComplexity(context);

    // Check pattern availability
    const hasKnownPatterns = this.hasKnownPatterns(context);

    // Decide strategy based on complexity and patterns
    if (complexity <= 5 && hasKnownPatterns) {
      // Simple case: use template
      return this.createDecision(
        GenerationStrategy.TEMPLATE,
        `Low complexity (${complexity}/20) with known patterns`,
        complexity,
        false, // No fallback needed for simple cases
      );
    } else if (complexity <= 7 && hasKnownPatterns) {
      // Moderate case: use composition
      return this.createDecision(
        GenerationStrategy.COMPOSITION,
        `Moderate complexity (${complexity}/20) with ${this.countMatchingPatterns(context)} matching patterns`,
        complexity,
        true, // Fallback to template if composition fails
      );
    } else {
      // Complex case (>7): use AI-Guided generation
      const reason = !hasKnownPatterns
        ? `No known patterns for this combination - AI guidance needed`
        : `Moderate-high complexity (${complexity}/20) requires AI-guided generation`;

      // Build AI guide for complex blades
      const aiGuide = this.guideBuilder.buildGuide(context);

      return this.createDecision(
        GenerationStrategy.AI_GUIDED,
        reason,
        complexity,
        true, // Fallback to composition if AI fails
        aiGuide,
      );
    }
  }

  /**
   * Calculate complexity score (0-20)
   */
  private calculateComplexity(context: BladeGenerationContext): number {
    let score = 0;

    // Base complexity
    score += context.type === "list" ? 5 : 4;

    // Features (safe access)
    const features = context.features || [];
    score += features.length * 2;

    // Special high-complexity features
    if (features.includes("widgets")) {
      score += 5; // Widgets are complex
    }
    if (features.includes("gallery")) {
      score += 2; // Gallery adds complexity
    }

    // Columns/fields count
    const fieldCount = (context.columns?.length || 0) + (context.fields?.length || 0);
    score += Math.min(fieldCount * 0.3, 3); // Max +3 for fields

    // Custom slots
    if (context.blade?.customSlots && context.blade.customSlots.length > 0) {
      score += context.blade.customSlots.length * 0.5;
    }

    // Custom logic (safe access)
    if (context.logic) {
      if (context.logic.handlers) {
        score += Object.keys(context.logic.handlers).length * 0.5;
      }
      if (context.logic.toolbar) {
        score += context.logic.toolbar.length * 0.3;
      }
      if (context.logic.state) {
        score += Object.keys(context.logic.state).length * 0.2;
      }
    }

    // Cap at 20
    return Math.min(Math.round(score), 20);
  }

  /**
   * Check if blade uses known pattern combinations
   */
  private hasKnownPatterns(context: BladeGenerationContext): boolean {
    const features = new Set(context.features || []);

    // Known simple patterns
    if (features.size === 0) {
      return true; // Basic list/details
    }

    // Known single-feature patterns
    const knownSingleFeatures = ["filters", "multiselect", "validation", "gallery"];
    if (features.size === 1 && knownSingleFeatures.some(f => features.has(f))) {
      return true;
    }

    // Known two-feature combinations
    const knownCombinations = [
      new Set(["filters", "multiselect"]),
      new Set(["filters", "gallery"]),
      new Set(["validation", "gallery"]),
    ];

    for (const combo of knownCombinations) {
      if (this.setsEqual(features, combo)) {
        return true;
      }
    }

    // Widgets always unknown
    if (features.has("widgets")) {
      return false;
    }

    // More than 2 features = unknown
    if (features.size > 2) {
      return false;
    }

    // Default: assume known
    return true;
  }

  /**
   * Count matching patterns for this context
   */
  private countMatchingPatterns(context: BladeGenerationContext): number {
    // This would use BladeComposer to count patterns
    // For now, estimate based on features
    let count = 1; // Base pattern

    for (const feature of context.features) {
      count++; // One pattern per feature
    }

    if (context.blade.customSlots && context.blade.customSlots.length > 0) {
      count++; // Custom slots pattern
    }

    return count;
  }

  /**
   * Check if two sets are equal
   */
  private setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  /**
   * Create strategy decision object
   */
  private createDecision(
    strategy: GenerationStrategy,
    reason: string,
    complexity: number,
    willUseFallback: boolean,
    aiGuide?: any,
  ): StrategyDecision {
    const estimatedTime = this.estimateTime(strategy);

    return {
      strategy,
      reason,
      complexity,
      estimatedTime,
      willUseFallback,
      aiGuide,
    };
  }

  /**
   * Estimate generation time
   */
  private estimateTime(strategy: GenerationStrategy): string {
    switch (strategy) {
      case GenerationStrategy.TEMPLATE:
        return "1-2 seconds";
      case GenerationStrategy.COMPOSITION:
        return "3-5 seconds";
      case GenerationStrategy.AI_GUIDED:
        return "AI reads guide and generates (depends on AI)";
      case GenerationStrategy.AI_FULL:
        return "10-30 seconds (fallback to AI_GUIDED)";
    }
  }

  /**
   * Build instructions for AI based on strategy
   */
  async buildInstructions(
    context: BladeGenerationContext,
    decision: StrategyDecision,
  ): Promise<string> {
    const config: CompositionConfig = { context };

    switch (decision.strategy) {
      case GenerationStrategy.TEMPLATE:
        return this.buildTemplateInstructions(context);

      case GenerationStrategy.COMPOSITION:
        return this.composer.buildInstructions(config);

      case GenerationStrategy.AI_FULL:
        return this.buildAIFullInstructions(context);
    }
  }

  /**
   * Build instructions for template strategy
   */
  private buildTemplateInstructions(context: BladeGenerationContext): string {
    return `# Template-based Generation

This blade will be generated using template adaptation with AST transformations.

**Strategy:** TEMPLATE (fast, reliable)
**Entity:** ${context.naming.entitySingularPascal}
**Type:** ${context.type}
**Features:** ${context.features.join(", ") || "Basic"}

The template will be automatically adapted with:
- Entity name replacements
- Column/field adaptations
- Feature-specific code injection
- i18n key generation

**No AI generation needed - this is handled automatically by the system.**
`;
  }

  /**
   * Build instructions for full AI strategy
   */
  private buildAIFullInstructions(context: BladeGenerationContext): string {
    const config: CompositionConfig = { context, strategy: "complex" };
    const baseInstructions = this.composer.buildInstructions(config);

    // Add extra guidance for complex cases
    const extraGuidance = `

---

## ⚠️ IMPORTANT: Complex Generation Mode

This blade has high complexity and requires **careful, thoughtful generation**.

**Additional Requirements:**
1. **Study all patterns thoroughly** - understand the composition approach
2. **Plan before coding** - think about the structure and data flow
3. **Test your logic** - ensure all handlers and state management work correctly
4. **Use TypeScript strictly** - no shortcuts, proper types everywhere
5. **Error handling** - comprehensive try/catch blocks
6. **Edge cases** - handle empty states, loading states, error states

**Quality Checklist:**
- [ ] All VcComponents are from registry
- [ ] All strings use i18n
- [ ] All async methods have error handling
- [ ] All state is properly reactive
- [ ] All handlers are implemented
- [ ] All toolbar actions work
- [ ] TypeScript compiles without errors

**Take your time - quality matters more than speed for complex blades.**
`;

    return baseInstructions + extraGuidance;
  }

  /**
   * Explain decision to user
   */
  explainDecision(decision: StrategyDecision): string {
    let explanation = `## Generation Strategy: ${decision.strategy.toUpperCase()}\n\n`;

    explanation += `**Complexity:** ${decision.complexity}/20\n`;
    explanation += `**Estimated Time:** ${decision.estimatedTime}\n`;
    explanation += `**Fallback:** ${decision.willUseFallback ? "Yes (if primary fails)" : "No"}\n\n`;

    explanation += `**Reason:** ${decision.reason}\n\n`;

    // Strategy-specific details
    switch (decision.strategy) {
      case GenerationStrategy.TEMPLATE:
        explanation += `This blade is straightforward and will be generated using pre-built templates with AST transformations. This is the fastest and most reliable approach for simple cases.\n\n`;
        explanation += `**Process:**\n`;
        explanation += `1. Select appropriate template (list/details with features)\n`;
        explanation += `2. Parse template AST\n`;
        explanation += `3. Transform entity names and structure\n`;
        explanation += `4. Generate final code\n`;
        break;

      case GenerationStrategy.COMPOSITION:
        explanation += `This blade requires composing multiple patterns together. AI will read the patterns and compose them into a cohesive blade.\n\n`;
        explanation += `**Process:**\n`;
        explanation += `1. AI reads composition patterns\n`;
        explanation += `2. AI composes code from patterns\n`;
        explanation += `3. System validates generated code\n`;
        explanation += `4. If validation fails, fallback to template approach\n`;
        break;

      case GenerationStrategy.AI_GUIDED:
        explanation += `This blade is complex and requires AI-guided generation. The system will provide comprehensive step-by-step instructions for AI to follow.\n\n`;
        explanation += `**Process:**\n`;
        explanation += `1. System builds detailed generation guide with 5-6 steps\n`;
        explanation += `2. Guide includes code examples, component docs, constraints\n`;
        explanation += `3. AI (Cursor/Claude) reads guide through MCP\n`;
        explanation += `4. AI generates complete Vue SFC following instructions\n`;
        explanation += `5. No Anthropic API key needed - your AI does the work\n`;
        explanation += `\n**Benefits:**\n`;
        explanation += `- AI knows your project context\n`;
        explanation += `- Higher quality than template/composition\n`;
        explanation += `- No API costs\n`;
        break;

      case GenerationStrategy.AI_FULL:
        explanation += `This blade is complex and will use AI-guided generation (AI_FULL deprecated, uses AI_GUIDED).\n\n`;
        explanation += `**Process:**\n`;
        explanation += `1. Falls back to AI_GUIDED in MCP mode\n`;
        explanation += `2. Falls back to COMPOSITION in CLI mode\n`;
        explanation += `3. See AI_GUIDED strategy for details\n`;
        break;
    }

    return explanation;
  }

  /**
   * Get strategy recommendation for UI-Plan
   */
  async recommendStrategy(plan: UIPlan): Promise<Map<string, StrategyDecision>> {
    const recommendations = new Map<string, StrategyDecision>();

    // This would need full context building
    // For now, return empty map
    // In real implementation, would analyze each blade

    return recommendations;
  }
}
