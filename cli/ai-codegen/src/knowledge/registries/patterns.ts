/**
 * Pattern Registry
 *
 * Loads and manages pattern metadata from examples/index.yaml
 * Patterns are architectural best practices and code examples.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { BaseRegistry } from "./base";
import type { PatternMetadata, SearchOptions, SearchResult, RegistryOptions } from "../types";

export class PatternRegistry extends BaseRegistry<PatternMetadata> {
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

    if (index.patterns && Array.isArray(index.patterns)) {
      for (const pattern of index.patterns) {
        this.cache.set(pattern.id, pattern as PatternMetadata);
      }
    }

    // Preload content if option enabled
    if (this.options.preloadContent) {
      await this.preloadAllContent();
    }

    this.loaded = true;
  }

  /**
   * Load pattern content on demand
   */
  async getContent(patternId: string): Promise<string | undefined> {
    const pattern = this.cache.get(patternId);
    if (!pattern) return undefined;

    // Return cached content if available
    if (pattern.content) return pattern.content;

    // Load from file
    const patternPath = path.join(this.examplesDir, pattern.file);
    if (!fs.existsSync(patternPath)) return undefined;

    const content = await fs.promises.readFile(patternPath, "utf-8");

    // Cache if caching enabled
    if (this.options.cacheEnabled) {
      pattern.content = content;
    }

    return content;
  }

  /**
   * Preload all pattern content
   */
  private async preloadAllContent(): Promise<void> {
    const promises = this.ids.map((id) => this.getContent(id));
    await Promise.all(promises);
  }

  /**
   * Search patterns with scoring
   */
  search(options: SearchOptions): SearchResult<PatternMetadata>[] {
    const { query, category, limit = 20, offset = 0, threshold = 0.3 } = options;

    let results: SearchResult<PatternMetadata>[] = [];

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
   * Get searchable text for pattern
   */
  protected getSearchableText(item: PatternMetadata, id: string): string {
    return [
      id.toLowerCase(),
      item.description.toLowerCase(),
      item.category.toLowerCase(),
      ...item.features.map((f) => f.toLowerCase()),
      ...item.applies_to.map((a) => a.toLowerCase()),
    ].join(" ");
  }

  /**
   * Get patterns by category
   */
  getByCategory(category: PatternMetadata["category"]): PatternMetadata[] {
    return this.filter((item) => item.category === category);
  }

  /**
   * Get patterns applicable to blade type
   */
  getForBladeType(bladeType: "list" | "details" | "all"): PatternMetadata[] {
    return this.filter((item) => item.applies_to.includes(bladeType) || item.applies_to.includes("all"));
  }

  /**
   * Get patterns by features
   */
  getByFeatures(features: string[]): PatternMetadata[] {
    return this.filter((item) => features.some((f) => item.features.includes(f)));
  }

  /**
   * Get patterns by multiple filters
   */
  getFiltered(filters: {
    category?: PatternMetadata["category"];
    bladeType?: "list" | "details" | "all";
    features?: string[];
  }): PatternMetadata[] {
    let results = this.getAll();

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.bladeType) {
      results = results.filter((p) => p.applies_to.includes(filters.bladeType!) || p.applies_to.includes("all"));
    }

    if (filters.features && filters.features.length > 0) {
      results = results.filter((p) => filters.features!.some((f) => p.features.includes(f)));
    }

    return results;
  }
}
