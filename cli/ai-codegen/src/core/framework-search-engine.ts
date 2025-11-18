import Fuzzysort from "fuzzysort";
import type { FrameworkAPI, FrameworkRegistry } from "../schemas/zod-schemas.js";

export interface FrameworkAPISearchOptions {
  query?: string;
  category?: string;
  type?: "composable" | "plugin" | "utility" | "service";
  limit?: number;
  offset?: number;
}

export interface FrameworkAPISearchResult {
  name: string;
  api: FrameworkAPI;
  score?: number;
}

export interface FrameworkIntentSearchOptions {
  intent: string;
  context?: "list" | "details" | "general";
}

export interface FrameworkIntentSearchResult {
  name: string;
  api: FrameworkAPI;
  method?: string;
  capability?: {
    id: string;
    name: string;
    description: string;
  };
  score: number;
}

/**
 * Framework API Search Engine
 * Provides fuzzy search and intent-based search for framework composables, plugins, and utilities
 */
export class FrameworkAPISearchEngine {
  private apis: Map<string, FrameworkAPI> = new Map();
  private searchIndex: Array<{
    name: string;
    keywords: string;
    api: FrameworkAPI;
  }> = [];
  private searchCache: Map<string, FrameworkAPISearchResult[]> = new Map();

  constructor(registry: FrameworkRegistry) {
    this.indexAPIs(registry);
  }

  /**
   * Index all framework APIs for fast searching
   */
  private indexAPIs(registry: FrameworkRegistry): void {
    // Index composables
    for (const [name, api] of Object.entries(registry.composables)) {
      this.apis.set(name, api);
      this.indexAPI(name, api);
    }

    // Index plugins
    for (const [name, api] of Object.entries(registry.plugins)) {
      this.apis.set(name, api);
      this.indexAPI(name, api);
    }

    // Index utilities
    for (const [name, api] of Object.entries(registry.utilities)) {
      this.apis.set(name, api);
      this.indexAPI(name, api);
    }

    // Index services
    for (const [name, api] of Object.entries(registry.services)) {
      this.apis.set(name, api);
      this.indexAPI(name, api);
    }
  }

  /**
   * Create searchable index entry for an API
   */
  private indexAPI(name: string, api: FrameworkAPI): void {
    const keywords = [
      name.toLowerCase(),
      api.description.toLowerCase(),
      api.category.toLowerCase(),
      ...api.keywords.map((k) => k.toLowerCase()),
      // Include method names for better discoverability
      ...(api.methods?.map((m) => m.name.toLowerCase()) || []),
    ].join(" ");

    this.searchIndex.push({ name, keywords, api });
  }

  /**
   * Search for framework APIs using fuzzy matching
   */
  search(options: FrameworkAPISearchOptions): FrameworkAPISearchResult[] {
    const { query, category, type, limit = 100, offset = 0 } = options;

    // Check cache
    const cacheKey = JSON.stringify(options);
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    let results: FrameworkAPISearchResult[];

    if (!query) {
      // No query - return all, optionally filtered by category/type
      results = this.searchIndex
        .filter((item) => {
          if (category && item.api.category !== category) return false;
          if (type && item.api.type !== type) return false;
          return true;
        })
        .map((item) => ({
          name: item.name,
          api: item.api,
        }));
    } else {
      // Fuzzy search
      const fuzzyResults = Fuzzysort.go(query.toLowerCase(), this.searchIndex, {
        keys: ["name", "keywords"],
        threshold: -10000, // Accept any result
        limit: 100, // Pre-filter limit
      });

      results = fuzzyResults
        .filter((result) => {
          const item = result.obj;
          if (category && item.api.category !== category) return false;
          if (type && item.api.type !== type) return false;
          return true;
        })
        .map((result) => ({
          name: result.obj.name,
          api: result.obj.api,
          score: result.score,
        }));

      // Sort by score (higher is better in Fuzzysort, but score is negative)
      results.sort((a, b) => {
        if (a.score !== undefined && b.score !== undefined) {
          return b.score - a.score; // Higher score (less negative) first
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    // Cache results
    this.searchCache.set(cacheKey, paginatedResults);

    return paginatedResults;
  }

  /**
   * Search for framework APIs based on user intent
   * Searches through capabilities and use cases
   */
  searchByIntent(options: FrameworkIntentSearchOptions): FrameworkIntentSearchResult[] {
    const { intent, context } = options;
    const keywords = intent.toLowerCase().split(/\s+/);
    const results: FrameworkIntentSearchResult[] = [];

    for (const [name, api] of this.apis.entries()) {
      let score = 0;
      let bestCapability: { id: string; name: string; description: string } | undefined;
      let bestMethod: string | undefined;

      // Search in capabilities
      if (api.capabilities) {
        for (const capability of Object.values(api.capabilities)) {
          const capabilityText = [
            capability.name,
            capability.description,
            ...capability.useCases,
          ]
            .join(" ")
            .toLowerCase();

          for (const keyword of keywords) {
            if (capabilityText.includes(keyword)) {
              score += 10;
              if (!bestCapability) {
                bestCapability = {
                  id: capability.id,
                  name: capability.name,
                  description: capability.description,
                };
                // Try to find associated method
                if (capability.type === "method" && api.methods) {
                  const method = api.methods.find((m) => m.name === capability.name);
                  if (method) {
                    bestMethod = method.name;
                  }
                }
              }
            }
          }
        }
      }

      // Search in method use cases
      if (api.methods) {
        for (const method of api.methods) {
          const methodText = [
            method.name,
            method.description,
            ...(method.useCases || []),
          ]
            .join(" ")
            .toLowerCase();

          for (const keyword of keywords) {
            if (methodText.includes(keyword)) {
              score += 5;
              if (!bestMethod) {
                bestMethod = method.name;
              }
            }
          }
        }
      }

      // Context-specific scoring
      if (context) {
        if (context === "list" && name.includes("List")) score += 5;
        if (context === "details" && name.includes("Details")) score += 5;
      }

      // Navigation APIs are common
      if (api.category === "Navigation") score += 2;

      if (score > 0) {
        results.push({
          name,
          api,
          method: bestMethod,
          capability: bestCapability,
          score,
        });
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Return top 5 most relevant
    return results.slice(0, 5);
  }

  /**
   * Get framework API by name
   */
  getAPI(name: string): FrameworkAPI | undefined {
    return this.apis.get(name);
  }

  /**
   * Get all framework APIs
   */
  getAllAPIs(): FrameworkAPI[] {
    return Array.from(this.apis.values());
  }

  /**
   * Get APIs by category
   */
  getAPIsByCategory(category: string): FrameworkAPI[] {
    return Array.from(this.apis.values()).filter((api) => api.category === category);
  }

  /**
   * Get APIs by type
   */
  getAPIsByType(type: "composable" | "plugin" | "utility" | "service"): FrameworkAPI[] {
    return Array.from(this.apis.values()).filter((api) => api.type === type);
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }
}
