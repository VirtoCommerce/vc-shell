/**
 * Feature Resolver
 *
 * Intelligent feature resolution and validation.
 * NO HARDCODING - all features from registry.
 */

import type { FeatureRegistry } from "../../knowledge";
import type { FeatureMetadata } from "../../knowledge/types";
import { FuzzyMatcher } from "../matchers/fuzzy";
import type { MatchResult, IntentQuery } from "../types";

export class FeatureResolver {
  private fuzzyMatcher: FuzzyMatcher;

  constructor(private featureRegistry: FeatureRegistry) {
    this.fuzzyMatcher = new FuzzyMatcher({ threshold: 0.5 });
  }

  /**
   * Resolve features from intent
   */
  async resolve(intent: string, context?: "list" | "details" | "general"): Promise<MatchResult<FeatureMetadata>[]> {
    await this.featureRegistry.ensureLoaded();

    // Filter by context if provided
    let candidates = (context && context !== "general")
      ? this.featureRegistry.getByCategory(context === "list" || context === "details" ? context : "global")
      : this.featureRegistry.getAll();

    // Match by intent
    const searchItems = candidates.map((item) => ({
      item,
      searchText: this.getSearchableText(item),
      id: item.id,
    }));

    return this.fuzzyMatcher.match(searchItems, intent);
  }

  /**
   * Validate feature IDs
   */
  async validate(featureIds: string[]): Promise<{
    valid: FeatureMetadata[];
    invalid: string[];
    warnings: string[];
  }> {
    await this.featureRegistry.ensureLoaded();

    const result = this.featureRegistry.validateFeatures(featureIds);
    const valid = result.valid.map((id) => this.featureRegistry.get(id)!);
    const warnings: string[] = [];

    // Add warnings for complex features
    for (const feature of valid) {
      if (feature.complexity === "complex") {
        warnings.push(`Feature "${feature.name}" is complex and may require additional setup`);
      }
    }

    return {
      valid,
      invalid: result.invalid,
      warnings,
    };
  }

  /**
   * Get required components for features
   */
  async getRequiredComponents(featureIds: string[]): Promise<Set<string>> {
    await this.featureRegistry.ensureLoaded();

    const components = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.featureRegistry.get(featureId);
      if (feature) {
        feature.requiredComponents.forEach((c) => components.add(c));
      }
    }

    return components;
  }

  /**
   * Get required APIs for features
   */
  async getRequiredAPIs(featureIds: string[]): Promise<Set<string>> {
    await this.featureRegistry.ensureLoaded();

    const apis = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.featureRegistry.get(featureId);
      if (feature) {
        feature.requiredAPIs.forEach((a) => apis.add(a));
      }
    }

    return apis;
  }

  /**
   * Get patterns for features
   */
  async getPatterns(featureIds: string[]): Promise<Set<string>> {
    await this.featureRegistry.ensureLoaded();

    const patterns = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.featureRegistry.get(featureId);
      if (feature) {
        feature.patterns.forEach((p) => patterns.add(p));
      }
    }

    return patterns;
  }

  /**
   * Get templates for features
   */
  async getTemplates(featureIds: string[]): Promise<Set<string>> {
    await this.featureRegistry.ensureLoaded();

    const templates = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.featureRegistry.get(featureId);
      if (feature) {
        feature.templates.forEach((t) => templates.add(t));
      }
    }

    return templates;
  }

  /**
   * Suggest features based on blade type and intent
   */
  async suggest(
    bladeType: "list" | "details",
    intent: string,
    limit = 5,
  ): Promise<MatchResult<FeatureMetadata>[]> {
    const matches = await this.resolve(intent, bladeType);
    return matches.slice(0, limit);
  }

  /**
   * Get searchable text from feature
   */
  private getSearchableText(feature: FeatureMetadata): string {
    return [
      feature.id,
      feature.name,
      feature.description,
      ...feature.keywords,
      ...feature.patterns,
      ...feature.requiredComponents,
      ...feature.requiredAPIs,
    ].join(" ");
  }
}
