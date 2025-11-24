/**
 * TemplateResolver
 *
 * Resolves best template for blade based on features, complexity, and requirements.
 */

import type { TemplateRegistry } from "../../knowledge/registries/templates";
import type { TemplateMetadata } from "../../knowledge/types";
import type { IntentMatch } from "../types";
import { HybridMatcher } from "../matchers/hybrid";

export interface TemplateQuery {
  /**
   * Blade type
   */
  bladeType: "list" | "details";

  /**
   * Required features
   */
  features: string[];

  /**
   * Desired complexity (if known)
   */
  complexity?: "simple" | "moderate" | "complex";

  /**
   * Natural language intent
   */
  intent?: string;

  /**
   * Entity name (for context)
   */
  entity?: string;
}

export interface TemplateMatch extends IntentMatch<TemplateMetadata> {
  /**
   * Feature match score (how many features are covered)
   */
  featureMatchScore: number;

  /**
   * Covered features
   */
  coveredFeatures: string[];

  /**
   * Missing features
   */
  missingFeatures: string[];

  /**
   * Complexity match (1.0 if exact, lower if different)
   */
  complexityScore: number;
}

/**
 * TemplateResolver
 *
 * Finds best matching template for blade requirements.
 */
export class TemplateResolver {
  private matcher: HybridMatcher;

  constructor(private templateRegistry: TemplateRegistry) {
    this.matcher = new HybridMatcher({
      threshold: 0.3,
      fuzzyWeight: 0.4,
      semanticWeight: 0.6,
      contextBoost: true,
      expandSynonyms: true,
    });
  }

  /**
   * Resolve best template for blade
   */
  async resolve(query: TemplateQuery): Promise<TemplateMatch | null> {
    await this.templateRegistry.ensureLoaded();

    // Get templates for blade type
    const templates = this.templateRegistry.getByBladeType(query.bladeType);

    if (templates.length === 0) return null;

    // Filter by complexity if specified
    const filteredTemplates = query.complexity
      ? templates.filter((t) => t.complexity === query.complexity)
      : templates;

    if (filteredTemplates.length === 0) {
      // Fallback to all templates if no complexity match
      return this.resolveFromTemplates(query, templates);
    }

    return this.resolveFromTemplates(query, filteredTemplates);
  }

  /**
   * Resolve from list of templates
   */
  private async resolveFromTemplates(
    query: TemplateQuery,
    templates: TemplateMetadata[],
  ): Promise<TemplateMatch | null> {
    // Calculate matches
    const matches: TemplateMatch[] = [];

    for (const template of templates) {
      const featureMatch = this.calculateFeatureMatch(template, query.features);
      const complexityScore = this.calculateComplexityScore(template, query.complexity);

      // Base score from feature match
      let score = featureMatch.score;

      // Adjust by complexity
      score = score * 0.7 + complexityScore * 0.3;

      // Use hybrid matcher if intent provided
      if (query.intent) {
        const matchableItems = [
          {
            item: template,
            id: template.id,
            searchText: this.getSearchableText(template),
          },
        ];
        const intentMatches = this.matcher.match(matchableItems, query.intent, query.bladeType);
        if (intentMatches.length > 0) {
          // Blend feature score with intent score
          score = score * 0.6 + intentMatches[0].score * 0.4;
        }
      }

      const confidence = this.calculateConfidence(
        score,
        featureMatch.score,
        complexityScore,
        template,
      );

      matches.push({
        item: template,
        score,
        confidence,
        reason: this.generateReason(featureMatch, complexityScore, template),
        matches: featureMatch.covered,
        featureMatchScore: featureMatch.score,
        coveredFeatures: featureMatch.covered,
        missingFeatures: featureMatch.missing,
        complexityScore,
      });
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Calculate feature match score
   */
  private calculateFeatureMatch(
    template: TemplateMetadata,
    requestedFeatures: string[],
  ): { score: number; covered: string[]; missing: string[] } {
    const templateFeatures = template.features || [];
    const covered: string[] = [];
    const missing: string[] = [];

    for (const feature of requestedFeatures) {
      if (templateFeatures.includes(feature)) {
        covered.push(feature);
      } else {
        missing.push(feature);
      }
    }

    // Score = covered / requested
    const score =
      requestedFeatures.length > 0 ? covered.length / requestedFeatures.length : 1.0;

    return { score, covered, missing };
  }

  /**
   * Calculate complexity score (1.0 if exact match, lower otherwise)
   */
  private calculateComplexityScore(
    template: TemplateMetadata,
    desiredComplexity?: "simple" | "moderate" | "complex",
  ): number {
    if (!desiredComplexity) return 0.5; // Neutral

    if (template.complexity === desiredComplexity) return 1.0;

    // Partial score for adjacent complexity levels
    const complexityOrder = ["simple", "moderate", "complex"];
    const templateIdx = complexityOrder.indexOf(template.complexity);
    const desiredIdx = complexityOrder.indexOf(desiredComplexity);

    const distance = Math.abs(templateIdx - desiredIdx);
    if (distance === 1) return 0.5; // Adjacent level
    return 0.2; // Far apart
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(
    finalScore: number,
    featureScore: number,
    complexityScore: number,
    template: TemplateMetadata,
  ): number {
    let confidence = finalScore;

    // Boost if all features covered
    if (featureScore === 1.0) {
      confidence = Math.min(confidence * 1.2, 1.0);
    }

    // Boost if complexity matches
    if (complexityScore === 1.0) {
      confidence = Math.min(confidence * 1.1, 1.0);
    }

    // Boost if template has many features (more complete)
    if ((template.features?.length || 0) >= 3) {
      confidence = Math.min(confidence * 1.05, 1.0);
    }

    return confidence;
  }

  /**
   * Generate reason for match
   */
  private generateReason(
    featureMatch: { score: number; covered: string[]; missing: string[] },
    complexityScore: number,
    template: TemplateMetadata,
  ): string {
    const parts: string[] = [];

    if (featureMatch.score === 1.0) {
      parts.push("All features covered");
    } else if (featureMatch.score >= 0.7) {
      parts.push(`Most features covered (${featureMatch.covered.length}/${featureMatch.covered.length + featureMatch.missing.length})`);
    } else {
      parts.push(`Partial feature match (${featureMatch.covered.length}/${featureMatch.covered.length + featureMatch.missing.length})`);
    }

    if (complexityScore === 1.0) {
      parts.push(`${template.complexity} complexity match`);
    }

    return parts.join(", ");
  }

  /**
   * Get searchable text for template
   */
  private getSearchableText(template: TemplateMetadata): string {
    return [
      template.id,
      template.description || "",
      template.blade_type,
      template.complexity,
      ...(template.features || []),
    ].join(" ");
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<TemplateMetadata | undefined> {
    await this.templateRegistry.ensureLoaded();
    return this.templateRegistry.get(id);
  }

  /**
   * Get template content
   */
  async getTemplateContent(id: string): Promise<string> {
    await this.templateRegistry.ensureLoaded();
    const content = await this.templateRegistry.getContent(id);
    return content ?? "";
  }

  /**
   * List all templates for blade type
   */
  async listTemplates(bladeType: "list" | "details"): Promise<TemplateMetadata[]> {
    await this.templateRegistry.ensureLoaded();
    return this.templateRegistry.getByBladeType(bladeType);
  }

  /**
   * Get simplest template for blade type (fallback)
   */
  async getSimplestTemplate(bladeType: "list" | "details"): Promise<TemplateMetadata | null> {
    const templates = await this.listTemplates(bladeType);
    const simple = templates.filter((t) => t.complexity === "simple");
    return simple.length > 0 ? simple[0] : templates.length > 0 ? templates[0] : null;
  }

  /**
   * Get most complex template for blade type
   */
  async getMostComplexTemplate(
    bladeType: "list" | "details",
  ): Promise<TemplateMetadata | null> {
    const templates = await this.listTemplates(bladeType);
    const complex = templates.filter((t) => t.complexity === "complex");
    return complex.length > 0 ? complex[0] : templates.length > 0 ? templates[0] : null;
  }
}
