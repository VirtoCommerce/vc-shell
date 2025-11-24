/**
 * Fuzzy Matcher
 *
 * Professional fuzzy matching using fuzzysort library.
 * Replaces hardcoded string matching with intelligent fuzzy search.
 */

import Fuzzysort from "fuzzysort";
import type { MatchResult, MatcherConfig } from "../types";

export class FuzzyMatcher {
  private config: Required<MatcherConfig>;

  constructor(config: MatcherConfig = {}) {
    this.config = {
      threshold: config.threshold ?? 0.3,
      limit: config.limit ?? 20,
      fuzzy: config.fuzzy ?? true,
      semantic: config.semantic ?? false,
      caseSensitive: config.caseSensitive ?? false,
    };
  }

  /**
   * Match items against query with fuzzy search
   */
  match<T>(
    items: Array<{ item: T; searchText: string; id: string }>,
    query: string,
  ): MatchResult<T>[] {
    if (!query) {
      return items.map(({ item, id }) => ({
        item,
        score: 1.0,
        confidence: 1.0,
        reason: "No query provided",
        matches: [],
      }));
    }

    // Prepare items for fuzzysort
    const targets = items.map(({ item, searchText, id }) => ({
      item,
      id,
      target: this.config.caseSensitive ? searchText : searchText.toLowerCase(),
    }));

    // Perform fuzzy search
    const results = Fuzzysort.go(
      this.config.caseSensitive ? query : query.toLowerCase(),
      targets,
      {
        key: "target",
        threshold: this.config.threshold,
        limit: this.config.limit,
        all: false, // Don't include items with no match
      },
    );

    // Convert to MatchResult format
    return results.map((result) => {
      const score = this.normalizeScore(result.score);
      return {
        item: result.obj.item,
        score,
        confidence: this.calculateConfidence(score, result),
        reason: this.generateReason(result),
        matches: this.extractMatches(result),
        metadata: {
          fuzzysortScore: result.score,
          id: result.obj.id,
        },
      };
    });
  }

  /**
   * Match single item
   */
  matchSingle<T>(
    item: { item: T; searchText: string; id: string },
    query: string,
  ): MatchResult<T> | null {
    const results = this.match([item], query);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Normalize fuzzysort score to 0-1 range
   */
  private normalizeScore(fuzzysortScore: number): number {
    // Fuzzysort returns negative scores (lower is better)
    // Convert to 0-1 range (higher is better)
    const maxNegativeScore = -10000;
    const normalized = 1 - Math.min(Math.abs(fuzzysortScore), Math.abs(maxNegativeScore)) / Math.abs(maxNegativeScore);
    return Math.max(0, Math.min(1, normalized));
  }

  /**
   * Calculate confidence based on score and result quality
   */
  private calculateConfidence(score: number, result: Fuzzysort.Result): number {
    // Higher confidence for:
    // - High scores
    // - Matches at the beginning
    // - Continuous matches
    let confidence = score;

    // Bonus for match at start
    if (result.indexes[0] === 0) {
      confidence = Math.min(1, confidence + 0.1);
    }

    // Bonus for continuous matches
    const continuous = this.areIndexesContinuous(result.indexes);
    if (continuous) {
      confidence = Math.min(1, confidence + 0.1);
    }

    return confidence;
  }

  /**
   * Check if match indexes are continuous
   */
  private areIndexesContinuous(indexes: readonly number[]): boolean {
    if (indexes.length <= 1) return true;

    for (let i = 1; i < indexes.length; i++) {
      if (indexes[i] !== indexes[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Generate human-readable reason for match
   */
  private generateReason(result: Fuzzysort.Result): string {
    const score = this.normalizeScore(result.score);

    if (score > 0.9) {
      return "Excellent match";
    } else if (score > 0.7) {
      return "Good match";
    } else if (score > 0.5) {
      return "Moderate match";
    } else {
      return "Weak match";
    }
  }

  /**
   * Extract matched substrings
   */
  private extractMatches(result: Fuzzysort.Result): string[] {
    const matches: string[] = [];
    const target = result.target;

    if (result.indexes.length === 0) return matches;

    let start = result.indexes[0];
    let end = start;

    for (let i = 1; i < result.indexes.length; i++) {
      if (result.indexes[i] === end + 1) {
        end = result.indexes[i];
      } else {
        matches.push(target.slice(start, end + 1));
        start = result.indexes[i];
        end = start;
      }
    }

    matches.push(target.slice(start, end + 1));

    return matches;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<MatcherConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
