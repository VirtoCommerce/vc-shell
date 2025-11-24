/**
 * Framework API Registry
 *
 * Loads and manages framework API metadata from framework-api-registry.json
 * Provides intelligent search for composables, plugins, utilities, and services.
 */

import fs from "node:fs";
import path from "node:path";
import { BaseRegistry } from "./base";
import type { FrameworkAPIMetadata, SearchOptions, SearchResult, RegistryOptions } from "../types";

export class FrameworkAPIRegistry extends BaseRegistry<FrameworkAPIMetadata> {
  constructor(
    private examplesDir: string,
    options?: RegistryOptions,
  ) {
    super(options);
  }

  async load(): Promise<void> {
    const registryPath = path.join(this.examplesDir, "..", "schemas", "framework-api-registry.json");

    if (!fs.existsSync(registryPath)) {
      throw new Error(`Framework API registry not found: ${registryPath}`);
    }

    const content = await fs.promises.readFile(registryPath, "utf-8");
    const registry = JSON.parse(content);

    this.cache.clear();

    // Handle nested structure: { composables: {...}, plugins: {...}, ... }
    for (const [category, apis] of Object.entries(registry)) {
      if (typeof apis === "object" && apis !== null) {
        for (const [apiName, metadata] of Object.entries(apis as Record<string, any>)) {
          this.cache.set(apiName, metadata as FrameworkAPIMetadata);
        }
      }
    }

    this.loaded = true;
  }

  /**
   * Search APIs with scoring
   */
  search(options: SearchOptions): SearchResult<FrameworkAPIMetadata>[] {
    const { query, category, type, limit = 20, offset = 0, threshold = 0.3 } = options;

    let results: SearchResult<FrameworkAPIMetadata>[] = [];

    // If no query, return all (optionally filtered)
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
      results = results.filter((r) => r.item.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by type if specified
    if (type) {
      results = results.filter((r) => r.item.type === type);
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  /**
   * Get searchable text for API
   */
  protected getSearchableText(item: FrameworkAPIMetadata, id: string): string {
    return [
      id.toLowerCase(),
      item.name.toLowerCase(),
      item.description.toLowerCase(),
      item.category.toLowerCase(),
      item.type.toLowerCase(),
      ...item.keywords.map((k) => k.toLowerCase()),
    ].join(" ");
  }

  /**
   * Get APIs by type
   */
  getByType(type: "composable" | "plugin" | "utility" | "service"): FrameworkAPIMetadata[] {
    return this.filter((item) => item.type === type);
  }

  /**
   * Get APIs by category
   */
  getByCategory(category: string): FrameworkAPIMetadata[] {
    return this.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get APIs by keywords
   */
  getByKeywords(keywords: string[]): FrameworkAPIMetadata[] {
    return this.filter((item) => keywords.some((kw) => item.keywords.includes(kw)));
  }

  /**
   * Find API by exact name
   */
  findByName(name: string): FrameworkAPIMetadata | undefined {
    return this.get(name) || this.find((item) => item.name === name);
  }

  /**
   * Get API capabilities
   */
  getCapabilities(apiName: string): FrameworkAPIMetadata["capabilities"] {
    const api = this.get(apiName);
    return api?.capabilities || [];
  }

  /**
   * Get API methods
   */
  getMethods(apiName: string): FrameworkAPIMetadata["methods"] {
    const api = this.get(apiName);
    return api?.methods || [];
  }

  /**
   * Search by intent (use cases)
   */
  searchByIntent(intent: string, context?: "list" | "details" | "general"): SearchResult<FrameworkAPIMetadata>[] {
    const lowerIntent = intent.toLowerCase();
    const results: SearchResult<FrameworkAPIMetadata>[] = [];

    for (const [id, item] of this.cache.entries()) {
      let score = 0;

      // Search in methods' use cases
      if (item.methods) {
        for (const method of item.methods) {
          const matchedUseCases = method.useCases.filter((uc) => uc.toLowerCase().includes(lowerIntent));
          if (matchedUseCases.length > 0) {
            score = Math.max(score, matchedUseCases.length / method.useCases.length);
          }
        }
      }

      // Search in capabilities
      if (item.capabilities) {
        for (const capability of item.capabilities) {
          const matchedUseCases = capability.useCases.filter((uc) => uc.toLowerCase().includes(lowerIntent));
          if (matchedUseCases.length > 0) {
            score = Math.max(score, matchedUseCases.length / capability.useCases.length);
          }
        }
      }

      // Search in keywords and description
      const textScore = this.calculateRelevanceScore(this.getSearchableText(item, id), intent);
      score = Math.max(score, textScore);

      if (score > 0.3) {
        results.push({ item, score });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 5); // Top 5
  }
}
