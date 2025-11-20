import { AIGenerationGuideBuilder } from "./ai-generation-guide-builder.js";
import { getGenerationRulesProvider } from "./generation-rules.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import type { UIPlan } from "./validator.js";

export enum GenerationStrategy {
  /**
   * Full AI generation (single supported strategy)
   * - Always selected
   * - Exposes a detailed guide for LLMs
   */
  AI_FULL = "ai-full",
}

export interface StrategyDecision {
  strategy: GenerationStrategy;
  reason: string;
  complexity: number;
  estimatedTime: string;
  willUseFallback: boolean;
  aiGuide?: any; // AIGenerationGuide when AI_FULL is selected
}

export interface GenerationOptions {
  forceStrategy?: GenerationStrategy;
  allowFallback?: boolean;
  maxRetries?: number;
}

/**
 * SmartCodeGenerator (AI-full only)
 *
 * Previously this class chose between template/composition/AI-guided strategies.
 * The codebase now enforces a single AI full flow: we build a detailed guide for
 * the LLM and never fall back to templates or pattern composition. This keeps
 * behavior predictable and removes legacy branches.
 */
export class SmartCodeGenerator {
  private guideBuilder: AIGenerationGuideBuilder;

  constructor() {
    const rulesProvider = getGenerationRulesProvider();
    const rules = rulesProvider.getRules();
    this.guideBuilder = new AIGenerationGuideBuilder(rules);
  }

  /**
   * Analyze blade and decide generation strategy (always AI_FULL)
   */
  async decide(
    context: BladeGenerationContext,
    options: GenerationOptions = {},
  ): Promise<StrategyDecision> {
    // Force strategy is ignored when it is not AI_FULL
    if (options.forceStrategy && options.forceStrategy !== GenerationStrategy.AI_FULL) {
      console.warn(`Deprecated strategy '${options.forceStrategy}' requested; using AI_FULL instead.`);
    }

    const complexity = this.calculateComplexity(context);
    // Use async buildGuide to load rules from YAML files
    const aiGuide = await this.guideBuilder.buildGuide({ ...context, complexity });

    return this.createDecision(
      GenerationStrategy.AI_FULL,
      "AI full mode enforced; template and composition paths are removed",
      complexity,
      false,
      aiGuide,
    );
  }

  /**
   * Build instructions for AI based on strategy decision
   */
  async buildInstructions(
    context: BladeGenerationContext,
    decision: StrategyDecision,
  ): Promise<string> {
    // Use async buildGuide to load rules from YAML files
    const guide = decision.aiGuide ?? (await this.guideBuilder.buildGuide(context));

    return [
      "# AI-FULL GENERATION ONLY",
      "Templates and pattern composition are disabled. Use the guide below to craft the SFC and composable, then submit via submit_generated_code.",
      "",
      "```json",
      JSON.stringify(guide, null, 2),
      "```",
    ].join("\n");
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
      case GenerationStrategy.AI_FULL:
        return "10-30 seconds (LLM-driven)";
      default:
        return "Unknown";
    }
  }

  /**
   * Explain decision to user
   */
  explainDecision(decision: StrategyDecision): string {
    let explanation = `## Generation Strategy: ${decision.strategy.toUpperCase()}\n\n`;

    explanation += `**Complexity:** ${decision.complexity}/20\n`;
    explanation += `**Estimated Time:** ${decision.estimatedTime}\n`;
    explanation += `**Fallback:** Disabled (AI full is mandatory)\n\n`;

    explanation += `**Reason:** ${decision.reason}\n\n`;
    explanation += `Templates, AST-based adaptors, and pattern composition were removed. Always generate using the AI guide and submit the result for validation.`;

    return explanation;
  }

  /**
   * Get strategy recommendation for UI-Plan (always AI_FULL)
   */
  async recommendStrategy(plan: UIPlan): Promise<Map<string, StrategyDecision>> {
    const recommendations = new Map<string, StrategyDecision>();

    for (const blade of plan.blades) {
      const context: BladeGenerationContext = {
        type: blade.layout === "grid" ? "list" : "details",
        entity: blade.id,
        module: plan.module,
        naming: {
          moduleName: plan.module,
          moduleNamePascal: "",
          moduleNameCamel: "",
          moduleNameUpperSnake: "",
          entitySingular: blade.id,
          entitySingularPascal: "",
          entitySingularCamel: "",
          entitySingularKebab: blade.id,
          entityPlural: blade.id,
          entityPluralPascal: "",
          entityPluralCamel: "",
          entityPluralKebab: blade.id,
        },
        blade,
        features: blade.features || [],
        columns: blade.components?.find((c) => (c as any).type === "VcTable")?.columns,
        fields: blade.components?.find((c) => (c as any).type === "VcForm")?.fields,
        componentName: blade.id,
        composableName: `use${blade.id}`,
        route: blade.route || `/${plan.module}`,
        menuTitleKey: `${plan.module.toUpperCase()}.MENU_TITLE`,
        complexity: 0,
      };

      const decision = await this.decide(context);
      recommendations.set(blade.id, decision);
    }

    return recommendations;
  }
}
