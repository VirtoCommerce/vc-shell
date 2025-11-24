/**
 * HybridMatcher
 *
 * Combines fuzzy and semantic matching for best results.
 * Uses weighted scoring to balance exact matches (fuzzy) with semantic relevance.
 */

import type { MatchResult, MatchableItem, MatchOptions } from "../types";
import { FuzzyMatcher } from "./fuzzy";
import { SemanticMatcher } from "./semantic";

export interface HybridMatchOptions extends MatchOptions {
  /**
   * Weight for fuzzy matching (0-1)
   * Default: 0.5
   */
  fuzzyWeight?: number;

  /**
   * Weight for semantic matching (0-1)
   * Default: 0.5
   */
  semanticWeight?: number;

  /**
   * Enable context-aware boosting
   */
  contextBoost?: boolean;

  /**
   * Enable synonym expansion
   */
  expandSynonyms?: boolean;
}

/**
 * HybridMatcher
 *
 * Combines fuzzy and semantic matching strategies.
 * Provides best of both: exact matching precision + semantic understanding.
 */
export class HybridMatcher {
  private fuzzyMatcher: FuzzyMatcher;
  private semanticMatcher: SemanticMatcher;

  constructor(private options: HybridMatchOptions = {}) {
    this.options.fuzzyWeight = this.options.fuzzyWeight ?? 0.5;
    this.options.semanticWeight = this.options.semanticWeight ?? 0.5;
    this.options.threshold = this.options.threshold ?? 0.4;

    // Initialize matchers
    this.fuzzyMatcher = new FuzzyMatcher({
      threshold: this.options.threshold * 0.8, // Lower threshold for fuzzy
      limit: this.options.limit,
    });

    this.semanticMatcher = new SemanticMatcher({
      threshold: this.options.threshold * 0.8, // Lower threshold for semantic
      limit: this.options.limit,
      contextBoost: this.options.contextBoost,
      expandSynonyms: this.options.expandSynonyms,
    });
  }

  /**
   * Match items using hybrid approach
   */
  match<T extends MatchableItem>(items: T[], query: string, context?: string): MatchResult<T>[] {
    // Prepare items for fuzzy matcher
    const fuzzyItems = items.map((item) => ({
      item,
      searchText: `${item.name || ""} ${item.description || ""} ${(item.keywords || []).join(" ")}`,
      id: item.id,
    }));

    // Get fuzzy matches
    const fuzzyMatches = this.fuzzyMatcher.match(fuzzyItems, query);
    const fuzzyScores = new Map<string, MatchResult<T>>();
    for (const match of fuzzyMatches) {
      const id = this.getItemId(match.item, items);
      if (id) fuzzyScores.set(id, match);
    }

    // Get semantic matches
    const semanticMatches = this.semanticMatcher.match(items, query, context);
    const semanticScores = new Map<string, MatchResult<T>>();
    for (const match of semanticMatches) {
      const id = this.getItemId(match.item, items);
      if (id) semanticScores.set(id, match);
    }

    // Combine scores
    const allIds = new Set([...fuzzyScores.keys(), ...semanticScores.keys()]);
    const hybridResults: MatchResult<T>[] = [];

    for (const id of allIds) {
      const fuzzyMatch = fuzzyScores.get(id);
      const semanticMatch = semanticScores.get(id);

      const fuzzyScore = fuzzyMatch?.score || 0;
      const semanticScore = semanticMatch?.score || 0;

      // Weighted combination
      const combinedScore =
        fuzzyScore * (this.options.fuzzyWeight || 0.5) +
        semanticScore * (this.options.semanticWeight || 0.5);

      // Boost if both matchers agree (high scores from both)
      const agreementBoost = this.calculateAgreementBoost(fuzzyScore, semanticScore);
      const finalScore = Math.min(combinedScore + agreementBoost, 1.0);

      // Use whichever match exists (prefer fuzzy for item data)
      const baseMatch = fuzzyMatch || semanticMatch;
      if (!baseMatch) continue;

      // Calculate hybrid confidence
      const confidence = this.calculateHybridConfidence(finalScore, fuzzyScore, semanticScore);

      hybridResults.push({
        item: baseMatch.item,
        score: finalScore,
        confidence,
        reason: this.generateHybridReason(finalScore, fuzzyScore, semanticScore, confidence),
        matches: this.combineMatches(fuzzyMatch, semanticMatch),
      });
    }

    // Filter and sort
    return hybridResults
      .filter((r) => r.score >= (this.options.threshold || 0))
      .sort((a, b) => {
        // Sort by score, then by confidence
        if (Math.abs(b.score - a.score) > 0.01) {
          return b.score - a.score;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, this.options.limit || 10);
  }

  /**
   * Get item ID for deduplication
   */
  private getItemId<T extends MatchableItem>(item: T, items: T[]): string | undefined {
    return item.id;
  }

  /**
   * Calculate agreement boost when both matchers agree
   */
  private calculateAgreementBoost(fuzzyScore: number, semanticScore: number): number {
    if (fuzzyScore === 0 || semanticScore === 0) return 0;

    // Both high scores = strong agreement
    if (fuzzyScore >= 0.7 && semanticScore >= 0.7) {
      return 0.1;
    }

    // Both moderate scores = moderate agreement
    if (fuzzyScore >= 0.5 && semanticScore >= 0.5) {
      return 0.05;
    }

    return 0;
  }

  /**
   * Calculate hybrid confidence
   */
  private calculateHybridConfidence(
    finalScore: number,
    fuzzyScore: number,
    semanticScore: number,
  ): number {
    // Base confidence from score
    let confidence = finalScore;

    // Boost if both matchers contribute
    if (fuzzyScore > 0 && semanticScore > 0) {
      confidence = Math.min(confidence * 1.1, 1.0);
    }

    // Boost if scores are similar (agreement)
    const scoreDiff = Math.abs(fuzzyScore - semanticScore);
    if (scoreDiff < 0.2) {
      confidence = Math.min(confidence * 1.05, 1.0);
    }

    return confidence;
  }

  /**
   * Generate hybrid match reason
   */
  private generateHybridReason(
    finalScore: number,
    fuzzyScore: number,
    semanticScore: number,
    confidence: number,
  ): string {
    const hasStrong = finalScore >= 0.8;
    const hasGood = finalScore >= 0.6;
    const hasBoth = fuzzyScore > 0 && semanticScore > 0;

    if (hasStrong && hasBoth) {
      return "Excellent match (fuzzy + semantic agreement)";
    }
    if (hasStrong) {
      return fuzzyScore > semanticScore
        ? "Excellent fuzzy match with semantic support"
        : "Excellent semantic match with fuzzy support";
    }
    if (hasGood && hasBoth) {
      return "Good match (fuzzy + semantic)";
    }
    if (hasGood) {
      return fuzzyScore > semanticScore ? "Good fuzzy match" : "Good semantic match";
    }
    if (hasBoth) {
      return "Moderate match (fuzzy + semantic)";
    }
    return fuzzyScore > semanticScore ? "Moderate fuzzy match" : "Moderate semantic match";
  }

  /**
   * Combine matches from both matchers
   */
  private combineMatches<T extends MatchableItem>(
    fuzzyMatch?: MatchResult<T>,
    semanticMatch?: MatchResult<T>,
  ): string[] {
    const combined = new Set<string>();

    if (fuzzyMatch?.matches) {
      fuzzyMatch.matches.forEach((m) => combined.add(m));
    }

    if (semanticMatch?.matches) {
      semanticMatch.matches.forEach((m) => combined.add(m));
    }

    return Array.from(combined);
  }

  /**
   * Update fuzzy weight
   */
  setFuzzyWeight(weight: number): void {
    this.options.fuzzyWeight = Math.max(0, Math.min(1, weight));
    this.options.semanticWeight = 1 - this.options.fuzzyWeight;
  }

  /**
   * Update semantic weight
   */
  setSemanticWeight(weight: number): void {
    this.options.semanticWeight = Math.max(0, Math.min(1, weight));
    this.options.fuzzyWeight = 1 - this.options.semanticWeight;
  }

  /**
   * Add synonyms to semantic matcher
   */
  addSynonyms(word: string, synonyms: string[]): void {
    this.semanticMatcher.addSynonyms(word, synonyms);
  }

  /**
   * Add context keywords to semantic matcher
   */
  addContextKeywords(context: string, keywords: string[]): void {
    this.semanticMatcher.addContextKeywords(context, keywords);
  }
}
