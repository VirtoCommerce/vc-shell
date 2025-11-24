/**
 * Component Resolver
 *
 * Intelligent component resolution based on intent and context.
 * NO HARDCODING - all decisions based on registry data.
 */

import type { ComponentRegistry } from "../../knowledge";
import type { ComponentMetadata } from "../../knowledge/types";
import { FuzzyMatcher } from "../matchers/fuzzy";
import type { MatchResult, IntentQuery, ResolveOptions } from "../types";

export class ComponentResolver {
  private fuzzyMatcher: FuzzyMatcher;

  constructor(private componentRegistry: ComponentRegistry) {
    this.fuzzyMatcher = new FuzzyMatcher({ threshold: 0.4 });
  }

  /**
   * Resolve component by intent query
   */
  async resolve(query: IntentQuery, options: ResolveOptions = {}): Promise<MatchResult<ComponentMetadata> | null> {
    await this.componentRegistry.ensureLoaded();

    const { intent, context, features = [] } = query;

    // Step 1: Filter by blade type context
    let candidates = (context && context !== "general")
      ? this.componentRegistry.getForBladeType(context)
      : this.componentRegistry.getAll();

    // Step 2: Filter by features if provided
    if (features.length > 0) {
      candidates = this.filterByFeatures(candidates, features);
    }

    // Step 3: Match by intent using fuzzy search
    const searchItems = candidates.map((item) => ({
      item,
      searchText: this.getSearchableText(item),
      id: item.component,
    }));

    const matches = this.fuzzyMatcher.match(searchItems, intent);

    if (matches.length === 0) {
      if (options.required) {
        throw new Error(`No component found for intent: "${intent}"`);
      }
      return options.fallback || null;
    }

    return matches[0];
  }

  /**
   * Resolve multiple components
   */
  async resolveMany(
    query: IntentQuery,
    options: ResolveOptions & { limit?: number } = {},
  ): Promise<MatchResult<ComponentMetadata>[]> {
    await this.componentRegistry.ensureLoaded();

    const { intent, context, features = [] } = query;
    const { limit = 5 } = options;

    // Step 1: Filter by blade type context
    let candidates = (context && context !== "general")
      ? this.componentRegistry.getForBladeType(context)
      : this.componentRegistry.getAll();

    // Step 2: Filter by features if provided
    if (features.length > 0) {
      candidates = this.filterByFeatures(candidates, features);
    }

    // Step 3: Match by intent using fuzzy search
    const searchItems = candidates.map((item) => ({
      item,
      searchText: this.getSearchableText(item),
      id: item.component,
    }));

    const matches = this.fuzzyMatcher.match(searchItems, intent);

    return matches.slice(0, limit);
  }

  /**
   * Resolve component for specific blade layout
   */
  async resolveForBladeLayout(
    layout: "grid" | "details",
    features: string[] = [],
  ): Promise<MatchResult<ComponentMetadata> | null> {
    const context = layout === "grid" ? "list" : "details";

    // Use intelligent intent for layout
    const intent = layout === "grid" ? "data table list display" : "form input fields";

    return this.resolve({ intent, context, features });
  }

  /**
   * Filter components by features
   */
  private filterByFeatures(components: ComponentMetadata[], features: string[]): ComponentMetadata[] {
    return components.filter((component) => {
      // Component matches if it has capabilities/keywords matching features
      const componentFeatures = [
        ...(component.keywords || []),
        ...(Array.isArray(component.capabilities) ? component.capabilities.map((c: any) => c.id || c) : []),
      ];

      return features.some((feature) => componentFeatures.includes(feature));
    });
  }

  /**
   * Get searchable text from component
   */
  private getSearchableText(component: ComponentMetadata): string {
    return [
      component.component,
      component.description || "",
      component.category || "",
      ...(component.keywords || []),
      ...(Array.isArray(component.capabilities)
        ? component.capabilities.map((c: any) => `${c.name || c} ${c.description || ""}`)
        : []),
    ].join(" ");
  }

  /**
   * Validate resolved component
   */
  validate(component: ComponentMetadata, requirements: { features?: string[]; dependencies?: string[] }): boolean {
    // Check if component meets requirements
    if (requirements.features) {
      const componentFeatures = component.keywords;
      const hasRequiredFeatures = requirements.features.every((f) => componentFeatures.includes(f));
      if (!hasRequiredFeatures) return false;
    }

    if (requirements.dependencies) {
      const hasRequiredDeps = requirements.dependencies.every((d) => component.dependencies.includes(d));
      if (!hasRequiredDeps) return false;
    }

    return true;
  }
}
