/**
 * Feature Registry
 *
 * Synthesizes feature metadata from all other registries.
 * Features are extracted from patterns and templates, not hardcoded.
 */

import { BaseRegistry } from "./base";
import type { ComponentRegistry } from "./components";
import type { PatternRegistry } from "./patterns";
import type { TemplateRegistry } from "./templates";
import type { FeatureMetadata, SearchOptions, SearchResult, RegistryOptions } from "../types";

export class FeatureRegistry extends BaseRegistry<FeatureMetadata> {
  constructor(
    private componentRegistry: ComponentRegistry,
    private patternRegistry: PatternRegistry,
    private templateRegistry: TemplateRegistry,
    options?: RegistryOptions,
  ) {
    super(options);
  }

  async load(): Promise<void> {
    // Ensure all dependent registries are loaded
    await Promise.all([
      this.componentRegistry.ensureLoaded(),
      this.patternRegistry.ensureLoaded(),
      this.templateRegistry.ensureLoaded(),
    ]);

    this.cache.clear();

    // Extract features from patterns
    const patterns = this.patternRegistry.getAll();
    const allPatternFeatures = new Set<string>();
    for (const pattern of patterns) {
      pattern.features.forEach((f) => allPatternFeatures.add(f));
    }

    // Extract features from templates
    const templates = this.templateRegistry.getAll();
    const allTemplateFeatures = new Set<string>();
    for (const template of templates) {
      template.features.forEach((f) => allTemplateFeatures.add(f));
    }

    // Merge all features
    const allFeatures = new Set([...allPatternFeatures, ...allTemplateFeatures]);

    // Create feature metadata for each feature
    for (const featureId of allFeatures) {
      const feature = this.synthesizeFeatureMetadata(featureId, patterns, templates);
      this.cache.set(featureId, feature);
    }

    this.loaded = true;
  }

  /**
   * Synthesize feature metadata from patterns and templates
   */
  private synthesizeFeatureMetadata(
    featureId: string,
    patterns: ReturnType<PatternRegistry["getAll"]>,
    templates: ReturnType<TemplateRegistry["getAll"]>,
  ): FeatureMetadata {
    const patternsWithFeature = patterns.filter((p) => p.features.includes(featureId));
    const templatesWithFeature = templates.filter((t) => t.features.includes(featureId));

    // Infer category from patterns
    let category: "list" | "details" | "global" = "global";
    const listCount = patternsWithFeature.filter((p) => p.applies_to.includes("list")).length;
    const detailsCount = patternsWithFeature.filter((p) => p.applies_to.includes("details")).length;

    if (listCount > detailsCount) {
      category = "list";
    } else if (detailsCount > listCount) {
      category = "details";
    }

    // Infer complexity from templates
    const complexities = templatesWithFeature.map((t) => t.complexity);
    let complexity: "simple" | "moderate" | "complex" = "simple";
    if (complexities.includes("complex")) {
      complexity = "complex";
    } else if (complexities.includes("moderate")) {
      complexity = "moderate";
    }

    // Infer required components from patterns and keywords
    const requiredComponents = this.inferRequiredComponents(featureId, patternsWithFeature);

    // Infer required APIs from patterns
    const requiredAPIs = this.inferRequiredAPIs(featureId, patternsWithFeature);

    return {
      id: featureId,
      name: this.humanizeName(featureId),
      description: this.generateDescription(featureId, patternsWithFeature),
      category,
      keywords: [featureId, ...this.generateKeywords(featureId)],
      requiredComponents,
      requiredAPIs,
      patterns: patternsWithFeature.map((p) => p.id),
      templates: templatesWithFeature.map((t) => t.id),
      complexity,
    };
  }

  /**
   * Infer required components from feature name and patterns
   */
  private inferRequiredComponents(
    featureId: string,
    patterns: ReturnType<PatternRegistry["getAll"]>,
  ): string[] {
    const components = new Set<string>();

    // Map feature to known components (based on real VC-Shell patterns)
    // Note: VcForm doesn't exist - use vee-validate Field for validation
    const featureComponentMap: Record<string, string[]> = {
      // List features
      table: ["VcTable"],
      filters: ["VcTable", "VcRadioButton", "VcCheckbox", "VcInput", "VcSelect"],
      multiselect: ["VcTable"],
      search: ["VcTable"],
      pagination: ["VcTable"],
      reorderable: ["VcTable"],
      slots: ["VcStatus", "VcStatusIcon", "VcImage", "VcBadge"],
      // Details features - NO VcForm! Use vee-validate Field
      form: ["VcInput", "VcSelect", "VcTextarea", "VcSwitch", "VcCheckbox", "VcCard"],
      validation: ["VcInput", "VcSelect"], // wrapped in vee-validate Field
      gallery: ["VcGallery"],
      widgets: ["VcWidget"],
      upload: ["VcGallery", "VcFileUpload"],
      // Common
      select: ["VcSelect"],
      input: ["VcInput"],
    };

    // Check feature name
    for (const [key, comps] of Object.entries(featureComponentMap)) {
      if (featureId.includes(key)) {
        comps.forEach((c) => components.add(c));
      }
    }

    return Array.from(components);
  }

  /**
   * Infer required APIs from feature name and patterns
   */
  private inferRequiredAPIs(featureId: string, patterns: ReturnType<PatternRegistry["getAll"]>): string[] {
    const apis = new Set<string>();

    // Map feature to known framework APIs (based on real vendor-portal patterns)
    // Note: useApiClient is used ONLY in composables, not directly in blades!
    const featureAPIMap: Record<string, string[]> = {
      // List blade APIs
      table: ["useBladeNavigation", "useTableSort"],
      filter: [],  // Built into VcTable, no special API
      search: [],  // Built into VcTable
      pagination: [],  // Built into VcTable
      multiselect: [],  // Built into VcTable
      reorderable: [],  // Built into VcTable
      // Details blade APIs
      form: ["useBladeNavigation", "usePopup"],
      validation: [],  // vee-validate useForm, not framework API
      modifications: ["useBeforeUnload"],
      beforeunload: ["useBeforeUnload"],
      save: ["useBladeNavigation", "usePopup"],
      gallery: ["useAssets"],
      upload: ["useAssets"],
      // Blade widgets (NOT dashboard widgets!)
      widgets: ["useWidgets"],
      // Common blade APIs
      navigation: ["useBladeNavigation"],
      notification: ["useNotifications"],
      loading: ["useLoading"],
    };

    // Check feature name
    for (const [key, apiList] of Object.entries(featureAPIMap)) {
      if (featureId.includes(key)) {
        apiList.forEach((a) => apis.add(a));
      }
    }

    return Array.from(apis);
  }

  /**
   * Generate human-readable name from feature ID
   */
  private humanizeName(id: string): string {
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Generate description from patterns
   */
  private generateDescription(
    featureId: string,
    patterns: ReturnType<PatternRegistry["getAll"]>,
  ): string {
    if (patterns.length > 0) {
      return patterns[0].description;
    }
    return `Feature: ${this.humanizeName(featureId)}`;
  }

  /**
   * Generate keywords from feature ID
   */
  private generateKeywords(featureId: string): string[] {
    const keywords = [featureId];

    // Add variations
    const parts = featureId.split("-");
    keywords.push(...parts);

    return keywords;
  }

  /**
   * Search features with scoring
   */
  search(options: SearchOptions): SearchResult<FeatureMetadata>[] {
    const { query, category, limit = 20, offset = 0, threshold = 0.3 } = options;

    let results: SearchResult<FeatureMetadata>[] = [];

    // If no query, return all (optionally filtered by category)
    if (!query) {
      results = this.getAll().map((item) => ({ item, score: 1.0 }));
    } else {
      // Search with scoring
      for (const [id, item] of this.cache.entries()) {
        const searchText = this.getSearchableText(item, id);
        const score = this.calculateRelevanceScore(searchText, query);

        if (score >= threshold) {
          results.push({ item, score });
        }
      }
    }

    // Filter by category if specified
    if (category) {
      results = results.filter((r) => r.item.category === category);
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  /**
   * Get searchable text for feature
   */
  protected getSearchableText(item: FeatureMetadata, id: string): string {
    return [
      id.toLowerCase(),
      item.name.toLowerCase(),
      item.description.toLowerCase(),
      item.category.toLowerCase(),
      ...item.keywords.map((k) => k.toLowerCase()),
    ].join(" ");
  }

  /**
   * Get features by category
   */
  getByCategory(category: "list" | "details" | "global"): FeatureMetadata[] {
    return this.filter((item) => item.category === category);
  }

  /**
   * Validate feature IDs
   */
  validateFeatures(features: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const feature of features) {
      if (this.has(feature)) {
        valid.push(feature);
      } else {
        invalid.push(feature);
      }
    }

    return { valid, invalid };
  }

  /**
   * Get features by complexity
   */
  getByComplexity(complexity: "simple" | "moderate" | "complex"): FeatureMetadata[] {
    return this.filter((item) => item.complexity === complexity);
  }

  /**
   * Get features requiring specific component
   */
  getByRequiredComponent(componentName: string): FeatureMetadata[] {
    return this.filter((item) => item.requiredComponents.includes(componentName));
  }

  /**
   * Get features requiring specific API
   */
  getByRequiredAPI(apiName: string): FeatureMetadata[] {
    return this.filter((item) => item.requiredAPIs.includes(apiName));
  }
}
