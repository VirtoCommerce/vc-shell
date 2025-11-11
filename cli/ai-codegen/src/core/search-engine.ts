import Fuzzysort from "fuzzysort";
import type { Component } from "../schemas/zod-schemas.js";

export interface SearchOptions {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResultItem {
  name: string;
  description?: string;
  category?: string;
  score?: number;
}

export interface SearchResult {
  items: SearchResultItem[];
  total: number;
  limit?: number;
  offset?: number;
}

export class SearchEngine {
  private components: Map<string, Component> = new Map();
  private searchIndex: Array<{ name: string; keywords: string; component: Component }> = [];
  private cache: Map<string, SearchResult> = new Map();

  constructor(components: Record<string, Component>) {
    this.indexComponents(components);
  }

  /**
   * Index components for searching
   */
  private indexComponents(components: Record<string, Component>): void {
    for (const [name, component] of Object.entries(components)) {
      this.components.set(name, component);

      // Create searchable keywords from component data
      const keywords = [
        name.toLowerCase(),
        component.description?.toLowerCase() || "",
        component.category?.toLowerCase() || "",
        ...(component.keywords || []).map((k) => k.toLowerCase()),
      ].join(" ");

      this.searchIndex.push({
        name,
        keywords,
        component,
      });
    }
  }

  /**
   * Search components with fuzzy matching
   */
  search(options: SearchOptions = {}): SearchResult {
    const { query, category, limit = 20, offset = 0 } = options;

    // Generate cache key
    const cacheKey = JSON.stringify(options);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let results: SearchResultItem[] = [];

    if (!query) {
      // No query - return all components (optionally filtered by category)
      results = Array.from(this.components.entries())
        .filter(([, component]) => !category || component.category === category)
        .map(([name, component]) => ({
          name,
          description: component.description,
          category: component.category,
        }));
    } else {
      // Fuzzy search
      const searchResults = Fuzzysort.go(query, this.searchIndex, {
        keys: ["name", "keywords"],
        threshold: -10000, // Allow any result
        limit: 100, // Limit fuzzy results before filtering
      });

      results = searchResults
        .filter((result) => {
          const component = result.obj.component;
          return !category || component.category === category;
        })
        .map((result) => ({
          name: result.obj.name,
          description: result.obj.component.description,
          category: result.obj.component.category,
          score: result.score,
        }));
    }

    // Sort by score (if available) or name
    results.sort((a, b) => {
      if (a.score !== undefined && b.score !== undefined) {
        return b.score - a.score; // Higher score first
      }
      return a.name.localeCompare(b.name);
    });

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    const searchResult: SearchResult = {
      items: paginatedResults,
      total,
      limit,
      offset,
    };

    // Cache the result
    this.cache.set(cacheKey, searchResult);

    return searchResult;
  }

  /**
   * Get component by name
   */
  getComponent(name: string): Component | undefined {
    return this.components.get(name);
  }

  /**
   * Get multiple components by names
   */
  getComponents(names: string[]): Array<{ name: string; component: Component }> {
    return names
      .map((name) => {
        const component = this.components.get(name);
        return component ? { name, component } : null;
      })
      .filter((item): item is { name: string; component: Component } => item !== null);
  }

  /**
   * Get all components
   */
  getAllComponents(): Map<string, Component> {
    return this.components;
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const component of this.components.values()) {
      if (component.category) {
        categories.add(component.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Re-index components
   */
  reindex(components: Record<string, Component>): void {
    this.components.clear();
    this.searchIndex = [];
    this.cache.clear();
    this.indexComponents(components);
  }
}

