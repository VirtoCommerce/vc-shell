/**
 * Component Registry
 *
 * Loads and manages component metadata from component-registry.json
 * Provides intelligent search and filtering capabilities.
 */

import fs from "node:fs";
import path from "node:path";
import { BaseRegistry } from "./base";
import type { ComponentMetadata, SearchOptions, SearchResult, RegistryOptions } from "../types";

export class ComponentRegistry extends BaseRegistry<ComponentMetadata> {
  constructor(
    private examplesDir: string,
    options?: RegistryOptions,
  ) {
    super(options);
  }

  async load(): Promise<void> {
    const registryPath = path.join(this.examplesDir, "..", "schemas", "component-registry.json");

    if (!fs.existsSync(registryPath)) {
      throw new Error(`Component registry not found: ${registryPath}`);
    }

    const content = await fs.promises.readFile(registryPath, "utf-8");
    const registry = JSON.parse(content);

    this.cache.clear();
    for (const [componentName, metadata] of Object.entries(registry)) {
      this.cache.set(componentName, metadata as ComponentMetadata);
    }

    this.loaded = true;
  }

  /**
   * Search components with scoring
   */
  search(options: SearchOptions): SearchResult<ComponentMetadata>[] {
    const { query, category, limit = 20, offset = 0, threshold = 0.3 } = options;

    let results: SearchResult<ComponentMetadata>[] = [];

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
      results = results.filter((r) => r.item.category.toLowerCase() === category.toLowerCase());
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  /**
   * Get searchable text for component
   */
  protected getSearchableText(item: ComponentMetadata, id: string): string {
    return [
      id.toLowerCase(),
      item.component.toLowerCase(),
      item.description.toLowerCase(),
      item.category.toLowerCase(),
      ...item.keywords.map((k) => k.toLowerCase()),
    ].join(" ");
  }

  /**
   * Get components by category
   */
  getByCategory(category: string): ComponentMetadata[] {
    return this.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get components suitable for blade type
   */
  getForBladeType(bladeType: "list" | "details"): ComponentMetadata[] {
    if (bladeType === "list") {
      return this.filter(
        (item) =>
          item.component === "VcTable" ||
          item.category === "Data Display" ||
          (item.keywords && item.keywords.includes("table")) ||
          (item.keywords && item.keywords.includes("list")),
      );
    } else {
      return this.filter(
        (item) =>
          item.component === "VcForm" ||
          item.category === "Form" ||
          (item.keywords && item.keywords.includes("form")) ||
          (item.keywords && item.keywords.includes("input")),
      );
    }
  }

  /**
   * Get components by keywords
   */
  getByKeywords(keywords: string[]): ComponentMetadata[] {
    return this.filter((item) => keywords.some((kw) => item.keywords.includes(kw)));
  }

  /**
   * Find component by exact name
   */
  findByName(name: string): ComponentMetadata | undefined {
    return this.get(name) || this.find((item) => item.component === name);
  }

  /**
   * Get component capabilities
   */
  getCapabilities(componentName: string): ComponentMetadata["capabilities"] {
    const component = this.get(componentName);
    return component?.capabilities || [];
  }

  /**
   * Get component templates
   */
  getTemplates(componentName: string): ComponentMetadata["templates"] {
    const component = this.get(componentName);
    return component?.templates || [];
  }
}
