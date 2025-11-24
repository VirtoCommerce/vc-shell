/**
 * Base Registry
 *
 * Abstract base class for all registries with lazy loading, caching, and search.
 */

import type { RegistryOptions, SearchOptions, SearchResult } from "../types";

export abstract class BaseRegistry<T> {
  protected cache: Map<string, T> = new Map();
  protected loaded = false;
  protected options: Required<RegistryOptions>;

  constructor(options: RegistryOptions = {}) {
    this.options = {
      cacheEnabled: true,
      lazyLoad: true,
      preloadContent: false,
      ...options,
    };
  }

  /**
   * Load registry data
   * Must be implemented by subclasses
   */
  abstract load(): Promise<void>;

  /**
   * Ensure registry is loaded
   */
  async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.load();
    }
  }

  /**
   * Get all items
   */
  getAll(): T[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get item by ID
   */
  get(id: string): T | undefined {
    return this.cache.get(id);
  }

  /**
   * Check if item exists
   */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Get multiple items by IDs
   */
  getMany(ids: string[]): T[] {
    return ids.map((id) => this.cache.get(id)).filter((item): item is T => item !== undefined);
  }

  /**
   * Get count of items
   */
  get count(): number {
    return this.cache.size;
  }

  /**
   * Get all IDs
   */
  get ids(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if loaded
   */
  get isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.loaded = false;
  }

  /**
   * Filter items by predicate
   */
  filter(predicate: (item: T, id: string) => boolean): T[] {
    const results: T[] = [];
    for (const [id, item] of this.cache.entries()) {
      if (predicate(item, id)) {
        results.push(item);
      }
    }
    return results;
  }

  /**
   * Find first item matching predicate
   */
  find(predicate: (item: T, id: string) => boolean): T | undefined {
    for (const [id, item] of this.cache.entries()) {
      if (predicate(item, id)) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Map items to new values
   */
  map<R>(mapper: (item: T, id: string) => R): R[] {
    const results: R[] = [];
    for (const [id, item] of this.cache.entries()) {
      results.push(mapper(item, id));
    }
    return results;
  }

  /**
   * Abstract search method
   * Subclasses should implement specific search logic
   */
  abstract search(options: SearchOptions): SearchResult<T>[];

  /**
   * Helper: Extract searchable text from item
   * Subclasses should override to provide meaningful search strings
   */
  protected abstract getSearchableText(item: T, id: string): string;

  /**
   * Helper: Calculate relevance score
   */
  protected calculateRelevanceScore(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match
    if (lowerText === lowerQuery) return 1.0;

    // Starts with query
    if (lowerText.startsWith(lowerQuery)) return 0.9;

    // Contains exact query
    if (lowerText.includes(lowerQuery)) return 0.7;

    // Word-by-word matching
    const words = lowerQuery.split(/\s+/);
    const matchedWords = words.filter((word) => lowerText.includes(word));
    const wordScore = matchedWords.length / words.length;

    return wordScore * 0.5;
  }
}
