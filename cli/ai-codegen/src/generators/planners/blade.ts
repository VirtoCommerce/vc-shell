/**
 * BladePlanner
 *
 * Plans blade structure based on entity and intent.
 * Determines component, props, slots, events, and framework APIs needed.
 */

import type { ComponentResolver } from "../../intelligence/resolvers/component-resolver";
import type { FeatureResolver } from "../../intelligence/resolvers/feature-resolver";
import type { TemplateResolver } from "../../intelligence/resolvers/template-resolver";
import type { ExtractedEntity } from "../analyzers/entity";
import type { ExtractedIntent } from "../analyzers/intent";

export interface BladePlan {
  id: string;
  type: "list" | "details";
  route: string;
  isWorkspace?: boolean;
  component: {
    type: string;
    props: Record<string, any>;
    slots?: Record<string, any>;
    events?: Record<string, any>;
  };
  features: string[];
  frameworkAPIs: string[];
  template?: string;
  complexity?: "simple" | "moderate" | "complex";
}

/**
 * BladePlanner
 *
 * Creates detailed blade plans.
 */
export class BladePlanner {
  constructor(
    private componentResolver: ComponentResolver,
    private featureResolver: FeatureResolver,
    private templateResolver: TemplateResolver,
  ) {}

  /**
   * Plan list blade
   */
  async planListBlade(
    entity: ExtractedEntity,
    intent: ExtractedIntent,
  ): Promise<BladePlan> {
    // Resolve component
    const componentIntent = `data table for ${entity.displayName}`;
    const component = await this.componentResolver.resolve({
      intent: componentIntent,
      context: "list",
      features: intent.features || [],
    });

    // Resolve features
    const features = await this.resolveFeatures(intent.features || [], "list");

    // Resolve template
    const template = await this.templateResolver.resolve({
      bladeType: "list",
      features,
      intent: componentIntent,
    });

    // Determine framework APIs
    const frameworkAPIs = this.determineFrameworkAPIs("list", features);

    return {
      id: `${entity.name}-list`,
      type: "list",
      route: `/${entity.name}s`,
      isWorkspace: true,
      component: {
        type: component?.item.component || "VcTable",
        props: this.generateListProps(entity),
        slots: this.generateListSlots(features),
        events: this.generateListEvents(),
      },
      features,
      frameworkAPIs,
      template: template?.item.id,
      complexity: template?.item.complexity,
    };
  }

  /**
   * Plan details blade
   */
  async planDetailsBlade(
    entity: ExtractedEntity,
    intent: ExtractedIntent,
  ): Promise<BladePlan> {
    // Resolve component
    const componentIntent = `form for ${entity.displayName}`;
    const component = await this.componentResolver.resolve({
      intent: componentIntent,
      context: "details",
      features: intent.features || [],
    });

    // Resolve features
    const features = await this.resolveFeatures(intent.features || [], "details");

    // Resolve template
    const template = await this.templateResolver.resolve({
      bladeType: "details",
      features,
      intent: componentIntent,
    });

    // Determine framework APIs
    const frameworkAPIs = this.determineFrameworkAPIs("details", features);

    return {
      id: `${entity.name}-details`,
      type: "details",
      route: `/${entity.name}/:id?`,
      component: {
        type: component?.item.component || "VcBlade",
        props: this.generateDetailsProps(entity),
        slots: this.generateDetailsSlots(entity),
        events: this.generateDetailsEvents(),
      },
      features,
      frameworkAPIs,
      template: template?.item.id,
      complexity: template?.item.complexity,
    };
  }

  /**
   * Resolve features for blade type
   */
  private async resolveFeatures(
    requestedFeatures: string[],
    bladeType: "list" | "details",
  ): Promise<string[]> {
    const validation = await this.featureResolver.validate(requestedFeatures);
    const validFeatures = validation.valid.map((f) => f.id);

    // Add defaults
    if (bladeType === "list") {
      if (!validFeatures.includes("filters")) validFeatures.push("filters");
      if (!validFeatures.includes("sort")) validFeatures.push("sort");
    } else {
      if (!validFeatures.includes("validation")) validFeatures.push("validation");
    }

    return validFeatures;
  }

  /**
   * Determine framework APIs needed
   */
  private determineFrameworkAPIs(bladeType: string, features: string[]): string[] {
    const apis = new Set<string>(["useApiClient", "useBladeNavigation"]);

    if (bladeType === "list") {
      apis.add("useNotifications");
      if (features.includes("multiselect")) {
        // Multiselect may need additional APIs
      }
    } else {
      apis.add("useModificationTracker");
      apis.add("useNotifications");
    }

    return Array.from(apis);
  }

  /**
   * Generate list props
   */
  private generateListProps(entity: ExtractedEntity): Record<string, any> {
    const columns = entity.properties
      .filter((p) => p.showInList)
      .map((p) => ({
        id: p.name,
        title: p.label,
        type: p.type,
        sortable: p.sortable !== false,
      }));

    return {
      columns,
      multiselect: true,
      "state-key": `${entity.name}-list`,
    };
  }

  /**
   * Generate list slots
   */
  private generateListSlots(features: string[]): Record<string, any> | undefined {
    const slots: Record<string, any> = {};

    if (features.includes("filters")) {
      slots["filters"] = true;
    }

    if (features.includes("toolbar-actions")) {
      slots["toolbar-actions"] = true;
    }

    return Object.keys(slots).length > 0 ? slots : undefined;
  }

  /**
   * Generate list events
   */
  private generateListEvents(): Record<string, any> {
    return {
      "row-click": "onRowClick",
      "selection-changed": "onSelectionChanged",
    };
  }

  /**
   * Generate details props
   */
  private generateDetailsProps(entity: ExtractedEntity): Record<string, any> {
    return {
      title: entity.displayName,
      width: "50%",
      closable: true,
    };
  }

  /**
   * Generate details slots
   */
  private generateDetailsSlots(entity: ExtractedEntity): Record<string, any> {
    return {
      content: true,
      "toolbar-actions": true,
    };
  }

  /**
   * Generate details events
   */
  private generateDetailsEvents(): Record<string, any> {
    return {
      close: "onClose",
      save: "onSave",
    };
  }
}
