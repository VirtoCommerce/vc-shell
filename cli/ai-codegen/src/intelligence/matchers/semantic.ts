/**
 * SemanticMatcher
 *
 * Advanced semantic matching using vector similarity.
 * For now, uses enhanced keyword matching as a placeholder for true embeddings.
 * TODO: Integrate with OpenAI embeddings or similar when available.
 */

import type { MatchResult, MatchableItem, MatchOptions } from "../types";

export interface SemanticMatchOptions extends MatchOptions {
  /**
   * Use contextual boosting (e.g., "list" context boosts table-related matches)
   */
  contextBoost?: boolean;

  /**
   * Synonym expansion
   */
  expandSynonyms?: boolean;
}

/**
 * SemanticMatcher
 *
 * Provides semantic matching capabilities.
 * Uses enhanced keyword analysis with context awareness.
 */
export class SemanticMatcher {
  private synonymMap: Map<string, string[]> = new Map([
    // Component synonyms
    ["table", ["grid", "list", "datagrid", "data-table", "data-grid"]],
    ["form", ["input", "fields", "editor", "details"]],
    ["button", ["action", "submit", "cta"]],
    ["select", ["dropdown", "picker", "combobox"]],
    ["image", ["picture", "photo", "img"]],
    ["gallery", ["carousel", "slider", "images"]],
    ["badge", ["tag", "label", "chip"]],
    ["icon", ["glyph", "symbol"]],

    // Feature synonyms
    ["filter", ["search", "query", "find"]],
    ["sort", ["order", "ordering", "sorting"]],
    ["pagination", ["paging", "pages"]],
    ["validation", ["validate", "verify", "check"]],
    ["multiselect", ["multi-select", "multiple", "batch"]],
    ["reorder", ["drag", "reorderable", "sortable"]],
    ["export", ["download", "save"]],
    ["import", ["upload", "load"]],

    // Action synonyms
    ["create", ["add", "new"]],
    ["update", ["edit", "modify", "change"]],
    ["delete", ["remove", "destroy"]],
    ["save", ["submit", "persist"]],
    ["cancel", ["close", "dismiss"]],
  ]);

  private contextKeywords: Map<string, string[]> = new Map([
    ["list", ["table", "grid", "rows", "columns", "filter", "sort", "pagination"]],
    ["details", ["form", "fields", "input", "validation", "save", "edit"]],
    ["general", []],
  ]);

  constructor(private options: SemanticMatchOptions = {}) {
    this.options.threshold = this.options.threshold ?? 0.5;
    this.options.contextBoost = this.options.contextBoost ?? true;
    this.options.expandSynonyms = this.options.expandSynonyms ?? true;
  }

  /**
   * Match items semantically
   */
  match<T extends MatchableItem>(items: T[], query: string, context?: string): MatchResult<T>[] {
    const normalizedQuery = this.normalizeQuery(query);
    const expandedQuery = this.expandQuery(normalizedQuery);

    const results = items.map((item) => {
      const score = this.calculateSemanticScore(item, expandedQuery, context);
      const confidence = this.calculateConfidence(score);

      return {
        item: item.item,
        score,
        confidence,
        reason: this.generateReason(score, confidence),
        matches: this.extractMatches(item, expandedQuery),
      };
    });

    // Filter by threshold and sort
    return results
      .filter((r) => r.score >= (this.options.threshold || 0))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.limit || 10);
  }

  /**
   * Normalize query (lowercase, trim, remove special chars)
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Expand query with synonyms
   */
  private expandQuery(query: string): string[] {
    const words = query.split(" ");
    const expanded = new Set<string>(words);

    if (this.options.expandSynonyms) {
      for (const word of words) {
        const synonyms = this.synonymMap.get(word);
        if (synonyms) {
          synonyms.forEach((syn) => expanded.add(syn));
        }
      }
    }

    return Array.from(expanded);
  }

  /**
   * Calculate semantic score
   */
  private calculateSemanticScore(item: MatchableItem, queryTerms: string[], context?: string): number {
    const searchText = item.searchText.toLowerCase();
    let score = 0;
    let matches = 0;

    // Term matching with position weighting
    for (const term of queryTerms) {
      if (searchText.includes(term)) {
        matches++;
        // Boost if term appears early
        const position = searchText.indexOf(term);
        const positionBoost = 1 - position / searchText.length;
        score += 0.5 + positionBoost * 0.5;
      }
    }

    // Normalize by query terms count
    if (queryTerms.length > 0) {
      score = score / queryTerms.length;
    }

    // Context boost
    if (context && this.options.contextBoost) {
      const contextKeywords = this.contextKeywords.get(context) || [];
      let contextMatches = 0;
      for (const keyword of contextKeywords) {
        if (searchText.includes(keyword)) {
          contextMatches++;
        }
      }
      if (contextKeywords.length > 0) {
        const contextScore = contextMatches / contextKeywords.length;
        score = score * 0.7 + contextScore * 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate confidence based on score
   */
  private calculateConfidence(score: number): number {
    if (score >= 0.8) return 0.9 + score * 0.1;
    if (score >= 0.6) return 0.7 + score * 0.2;
    if (score >= 0.4) return 0.5 + score * 0.2;
    return score;
  }

  /**
   * Generate reason for match
   */
  private generateReason(score: number, confidence: number): string {
    if (score >= 0.8) return "Excellent semantic match";
    if (score >= 0.6) return "Good semantic match";
    if (score >= 0.4) return "Moderate semantic match";
    return "Weak semantic match";
  }

  /**
   * Extract matched terms
   */
  private extractMatches(item: MatchableItem, queryTerms: string[]): string[] {
    const searchText = item.searchText.toLowerCase();
    return queryTerms.filter((term) => searchText.includes(term));
  }

  /**
   * Add custom synonyms
   */
  addSynonyms(word: string, synonyms: string[]): void {
    const existing = this.synonymMap.get(word) || [];
    this.synonymMap.set(word, [...existing, ...synonyms]);
  }

  /**
   * Add context keywords
   */
  addContextKeywords(context: string, keywords: string[]): void {
    const existing = this.contextKeywords.get(context) || [];
    this.contextKeywords.set(context, [...existing, ...keywords]);
  }
}
