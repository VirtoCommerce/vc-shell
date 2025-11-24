/**
 * Template Registry
 *
 * Loads and manages template metadata from examples/index.yaml
 * Templates are production-ready Vue SFC files for blades.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { BaseRegistry } from "./base";
import type { TemplateMetadata, SearchOptions, SearchResult, RegistryOptions } from "../types";

export class TemplateRegistry extends BaseRegistry<TemplateMetadata> {
  constructor(
    private examplesDir: string,
    options?: RegistryOptions,
  ) {
    super(options);
  }

  async load(): Promise<void> {
    const indexPath = path.join(this.examplesDir, "index.yaml");

    if (!fs.existsSync(indexPath)) {
      throw new Error(`Examples index not found: ${indexPath}`);
    }

    const content = await fs.promises.readFile(indexPath, "utf-8");
    const index = yaml.parse(content);

    this.cache.clear();

    if (index.templates && Array.isArray(index.templates)) {
      for (const template of index.templates) {
        this.cache.set(template.id, template as TemplateMetadata);
      }
    }

    // Preload content if option enabled
    if (this.options.preloadContent) {
      await this.preloadAllContent();
    }

    this.loaded = true;
  }

  /**
   * Load template content on demand
   */
  async getContent(templateId: string): Promise<string | undefined> {
    const template = this.cache.get(templateId);
    if (!template) return undefined;

    // Return cached content if available
    if (template.content) return template.content;

    // Load from file
    const templatePath = path.join(this.examplesDir, template.file);
    if (!fs.existsSync(templatePath)) return undefined;

    const content = await fs.promises.readFile(templatePath, "utf-8");

    // Cache if caching enabled
    if (this.options.cacheEnabled) {
      template.content = content;
    }

    return content;
  }

  /**
   * Preload all template content
   */
  private async preloadAllContent(): Promise<void> {
    const promises = this.ids.map((id) => this.getContent(id));
    await Promise.all(promises);
  }

  /**
   * Search templates with scoring
   */
  search(options: SearchOptions): SearchResult<TemplateMetadata>[] {
    const { query, limit = 20, offset = 0, threshold = 0.3 } = options;

    let results: SearchResult<TemplateMetadata>[] = [];

    // If no query, return all
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

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  /**
   * Get searchable text for template
   */
  protected getSearchableText(item: TemplateMetadata, id: string): string {
    return [
      id.toLowerCase(),
      item.description.toLowerCase(),
      item.blade_type.toLowerCase(),
      item.complexity.toLowerCase(),
      ...item.features.map((f) => f.toLowerCase()),
    ].join(" ");
  }

  /**
   * Get templates by blade type
   */
  getByBladeType(bladeType: "list" | "details"): TemplateMetadata[] {
    return this.filter((item) => item.blade_type === bladeType);
  }

  /**
   * Get templates by complexity
   */
  getByComplexity(complexity: "simple" | "moderate" | "complex"): TemplateMetadata[] {
    return this.filter((item) => item.complexity === complexity);
  }

  /**
   * Get templates by features
   */
  getByFeatures(features: string[]): TemplateMetadata[] {
    return this.filter((item) => features.some((f) => item.features.includes(f)));
  }

  /**
   * Find best matching template
   */
  findBestMatch(
    bladeType: "list" | "details",
    features: string[],
    complexity?: "simple" | "moderate" | "complex",
  ): TemplateMetadata | undefined {
    let candidates = this.getByBladeType(bladeType);

    // Filter by complexity if specified
    if (complexity) {
      candidates = candidates.filter((t) => t.complexity === complexity);
    }

    // Score by feature match
    const scored = candidates.map((template) => {
      const matchedFeatures = features.filter((f) => template.features.includes(f));
      const score = matchedFeatures.length / Math.max(features.length, template.features.length);
      return { template, score, matchedFeatures };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.template;
  }

  /**
   * Find templates matching all features
   */
  findByAllFeatures(bladeType: "list" | "details", features: string[]): TemplateMetadata[] {
    return this.filter((item) => item.blade_type === bladeType && features.every((f) => item.features.includes(f)));
  }

  /**
   * Find templates matching any feature
   */
  findByAnyFeature(bladeType: "list" | "details", features: string[]): TemplateMetadata[] {
    return this.filter((item) => item.blade_type === bladeType && features.some((f) => item.features.includes(f)));
  }

  /**
   * Get templates ordered by complexity
   */
  getOrderedByComplexity(bladeType: "list" | "details", ascending = true): TemplateMetadata[] {
    const complexityOrder = { simple: 1, moderate: 2, complex: 3 };
    const templates = this.getByBladeType(bladeType);

    return templates.sort((a, b) => {
      const diff = complexityOrder[a.complexity] - complexityOrder[b.complexity];
      return ascending ? diff : -diff;
    });
  }
}
