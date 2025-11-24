/**
 * CapabilityResolver
 *
 * Resolves component capabilities based on intent and requirements.
 * Helps find which component capabilities are needed for specific features.
 */

import type { ComponentRegistry } from "../../knowledge/registries/components";
import type { ComponentMetadata } from "../../knowledge/types";
import type { IntentMatch } from "../types";
import { HybridMatcher } from "../matchers/hybrid";

export interface CapabilityQuery {
  /**
   * Natural language intent (e.g., "I need filtering and sorting")
   */
  intent: string;

  /**
   * Component to search capabilities in
   */
  component?: string;

  /**
   * Context (list/details/general)
   */
  context?: "list" | "details" | "general";

  /**
   * Required features
   */
  features?: string[];
}

export interface CapabilityMatch {
  /**
   * Capability ID
   */
  id: string;

  /**
   * Capability name
   */
  name: string;

  /**
   * Capability description
   */
  description?: string;

  /**
   * Component that provides this capability
   */
  component: string;

  /**
   * Match score (0-1)
   */
  score: number;

  /**
   * Confidence (0-1)
   */
  confidence: number;

  /**
   * Reason for match
   */
  reason: string;

  /**
   * Related props/slots/events
   */
  implementation?: {
    props?: string[];
    slots?: string[];
    events?: string[];
  };
}

/**
 * CapabilityResolver
 *
 * Resolves component capabilities from intents and features.
 */
export class CapabilityResolver {
  private matcher: HybridMatcher;

  constructor(private componentRegistry: ComponentRegistry) {
    this.matcher = new HybridMatcher({
      threshold: 0.4,
      fuzzyWeight: 0.6,
      semanticWeight: 0.4,
      contextBoost: true,
      expandSynonyms: true,
    });
  }

  /**
   * Resolve capabilities from intent
   */
  async resolve(query: CapabilityQuery): Promise<CapabilityMatch[]> {
    await this.componentRegistry.ensureLoaded();

    // Get components to search
    const components = query.component
      ? [this.componentRegistry.get(query.component)].filter(Boolean)
      : this.componentRegistry.getAll();

    if (components.length === 0) return [];

    // Extract capabilities from components
    const capabilityItems = this.extractCapabilities(components as ComponentMetadata[]);

    // Filter by features if provided
    const filteredItems = query.features
      ? this.filterByFeatures(capabilityItems, query.features)
      : capabilityItems;

    // Match using hybrid matcher
    const matchableItems = filteredItems.map((cap) => ({
      item: cap,
      id: `${cap.component}:${cap.id}`,
      searchText: this.getSearchableText(cap),
    }));

    const matches = this.matcher.match(matchableItems, query.intent, query.context);

    return matches.map((m) => m.item.item);
  }

  /**
   * Get all capabilities for a component
   */
  async getCapabilities(componentName: string): Promise<CapabilityMatch[]> {
    await this.componentRegistry.ensureLoaded();

    const component = this.componentRegistry.get(componentName);
    if (!component) return [];

    return this.extractCapabilities([component]);
  }

  /**
   * Get required capabilities for features
   */
  async getRequiredCapabilities(
    features: string[],
    context?: "list" | "details",
  ): Promise<CapabilityMatch[]> {
    await this.componentRegistry.ensureLoaded();

    const components = context
      ? this.componentRegistry.getForBladeType(context)
      : this.componentRegistry.getAll();

    const allCapabilities = this.extractCapabilities(components);

    // Filter by features
    return this.filterByFeatures(allCapabilities, features);
  }

  /**
   * Check if component has capability
   */
  async hasCapability(componentName: string, capabilityId: string): Promise<boolean> {
    const capabilities = await this.getCapabilities(componentName);
    return capabilities.some((cap) => cap.id === capabilityId);
  }

  /**
   * Extract capabilities from components
   */
  private extractCapabilities(components: ComponentMetadata[]): CapabilityMatch[] {
    const capabilities: CapabilityMatch[] = [];

    for (const component of components) {
      if (!component.capabilities || !Array.isArray(component.capabilities)) {
        continue;
      }

      for (const cap of component.capabilities) {
        const capObj = typeof cap === "string" ? { id: cap, name: cap, description: "" } : cap;

        capabilities.push({
          id: capObj.id || capObj.name,
          name: capObj.name || capObj.id,
          description: capObj.description || "",
          component: component.component,
          score: 1.0,
          confidence: 1.0,
          reason: "Direct capability",
          implementation: this.extractImplementation(component, capObj),
        });
      }
    }

    return capabilities;
  }

  /**
   * Extract implementation details (props/slots/events) for capability
   */
  private extractImplementation(
    component: ComponentMetadata,
    capability: any,
  ): { props?: string[]; slots?: string[]; events?: string[] } | undefined {
    const impl: { props?: string[]; slots?: string[]; events?: string[] } = {};

    // Extract related props
    if (capability.props && Array.isArray(capability.props)) {
      impl.props = capability.props;
    } else if (capability.id && component.props) {
      // Infer props by capability ID (e.g., "filters" -> "filters" prop)
      const relatedProps = Object.keys(component.props).filter((prop) =>
        prop.toLowerCase().includes(capability.id.toLowerCase()),
      );
      if (relatedProps.length > 0) {
        impl.props = relatedProps;
      }
    }

    // Extract related slots
    if (capability.slots && Array.isArray(capability.slots)) {
      impl.slots = capability.slots;
    } else if (capability.id && component.slots) {
      const relatedSlots = Object.keys(component.slots).filter((slot) =>
        slot.toLowerCase().includes(capability.id.toLowerCase()),
      );
      if (relatedSlots.length > 0) {
        impl.slots = relatedSlots;
      }
    }

    // Extract related events
    if (capability.events && Array.isArray(capability.events)) {
      impl.events = capability.events;
    }

    return Object.keys(impl).length > 0 ? impl : undefined;
  }

  /**
   * Filter capabilities by features
   */
  private filterByFeatures(capabilities: CapabilityMatch[], features: string[]): CapabilityMatch[] {
    return capabilities.filter((cap) => {
      const capText = `${cap.id} ${cap.name} ${cap.description || ""}`.toLowerCase();
      return features.some((feature) => capText.includes(feature.toLowerCase()));
    });
  }

  /**
   * Get searchable text for capability
   */
  private getSearchableText(cap: CapabilityMatch): string {
    return [
      cap.id,
      cap.name,
      cap.description || "",
      cap.component,
      ...(cap.implementation?.props || []),
      ...(cap.implementation?.slots || []),
      ...(cap.implementation?.events || []),
    ].join(" ");
  }
}
