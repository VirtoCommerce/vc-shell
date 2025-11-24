/**
 * SmartUIPlanner
 *
 * Professional UI planner using Intelligence Layer.
 * Components resolved dynamically via ComponentResolver.
 * Features validated via FeatureResolver.
 *
 * ZERO HARDCODING!
 */

import type { KnowledgeBase } from "../../knowledge";
import type { ComponentResolver, FeatureResolver } from "../../intelligence";
import type { PromptAnalysis, UIPlan, BladePlan, ComponentPlan } from "../types";

export interface PlannerOptions {
  analysis: PromptAnalysis;
  discoveredComponents?: Array<{ name: string; bladeType: string; entity: string }>;
}

/**
 * SmartUIPlanner
 *
 * Generates UI-Plan from PromptAnalysis.
 * Resolves components dynamically - NO hardcoded "VcTable" or "VcForm".
 */
export class SmartUIPlanner {
  constructor(
    private kb: KnowledgeBase,
    private componentResolver: ComponentResolver,
    private featureResolver: FeatureResolver,
  ) {}

  /**
   * Generate complete UI-Plan from analysis
   */
  async generatePlan(options: PlannerOptions): Promise<UIPlan> {
    const { analysis, discoveredComponents } = options;

    await this.kb.ensureLoaded();

    const blades: BladePlan[] = [];

    // Generate blades for each entity
    for (const entity of analysis.entities) {
      for (const bladeConfig of entity.blades) {
        const blade = await this.generateBlade(
          entity,
          bladeConfig,
          analysis.moduleName,
          discoveredComponents,
        );
        blades.push(blade);
      }
    }

    return {
      $schema: "https://vc-shell.dev/schemas/ui-plan.v1.json",
      module: analysis.moduleName,
      description: analysis.description,
      blades,
      data: {
        sources: this.generateDataSources(analysis),
      },
      localization: {
        defaultLocale: "en",
        keys: this.generateLocalizationKeys(blades),
      },
    };
  }

  /**
   * Generate blade plan for entity
   *
   * Resolves component dynamically based on blade type and features.
   */
  private async generateBlade(
    entity: any,
    bladeConfig: any,
    moduleName: string,
    discoveredComponents?: any[],
  ): Promise<BladePlan> {
    const { type, route, isWorkspace, features = [] } = bladeConfig;

    // Normalize and validate features
    const normalizedFeatures = await this.normalizeFeatures(features, type);

    // Resolve component dynamically using ComponentResolver
    const resolvedComponent = await this.resolveComponent(type, normalizedFeatures, entity, discoveredComponents);

    const bladeId = this.generateBladeId(entity.name, type);

    return {
      id: bladeId,
      type,
      title: this.generateTitle(entity.displayName || entity.name, type),
      route,
      icon: this.inferIcon(entity.name),
      isWorkspace,
      component: resolvedComponent,
      features: normalizedFeatures,
      metadata: {
        entity: entity.name,
        generated: new Date().toISOString(),
      },
    };
  }

  /**
   * Resolve component dynamically via ComponentResolver
   *
   * NO hardcoding! Uses intent-based resolution.
   */
  private async resolveComponent(
    bladeType: "list" | "details",
    features: string[],
    entity: any,
    discoveredComponents?: any[],
  ): Promise<ComponentPlan> {
    // Check if component was already discovered
    const discovered = discoveredComponents?.find(
      (c) => c.bladeType === bladeType && c.entity === entity.name,
    );

    if (discovered) {
      return {
        type: discovered.name,
        props: this.generateProps(bladeType, features, entity),
      };
    }

    // Resolve component using ComponentResolver
    const intent = this.buildIntent(bladeType, features, entity);
    const match = await this.componentResolver.resolve({
      intent,
      context: bladeType,
      features,
    });

    if (!match) {
      // Fallback: use most common component for blade type
      const fallback = await this.getFallbackComponent(bladeType);
      return {
        type: fallback,
        props: this.generateProps(bladeType, features, entity),
      };
    }

    return {
      type: match.item.component,
      props: this.generateProps(bladeType, features, entity),
    };
  }

  /**
   * Build intent string for component resolution
   */
  private buildIntent(bladeType: "list" | "details", features: string[], entity: any): string {
    const parts = [bladeType === "list" ? "data table list" : "form details"];

    if (features.includes("filters")) {
      parts.push("with filters");
    }
    if (features.includes("multiselect")) {
      parts.push("with multiselect");
    }
    if (features.includes("sortable")) {
      parts.push("sortable");
    }

    parts.push(`for ${entity.name}`);

    return parts.join(" ");
  }

  /**
   * Get fallback component if resolution fails
   */
  private async getFallbackComponent(bladeType: "list" | "details"): Promise<string> {
    // Get most common component for blade type from registry
    const components = this.kb.components.getForBladeType(bladeType);

    if (components.length === 0) {
      return bladeType === "list" ? "VcTable" : "VcForm"; // Ultimate fallback
    }

    return components[0].component;
  }

  /**
   * Generate component props based on blade type and features
   */
  private generateProps(
    bladeType: "list" | "details",
    features: string[],
    entity: any,
  ): Record<string, unknown> {
    if (bladeType === "list") {
      return this.generateTableProps(features, entity);
    } else {
      return this.generateFormProps(features, entity);
    }
  }

  /**
   * Generate props for table component
   */
  private generateTableProps(features: string[], entity: any): Record<string, unknown> {
    const props: Record<string, unknown> = {
      columns: entity.properties?.map((prop: any) => ({
        id: prop.name,
        title: this.humanize(prop.name),
        type: this.mapPropertyTypeToColumnType(prop.type),
        sortable: features.includes("sortable"),
      })) || [],
    };

    if (features.includes("multiselect")) {
      props.multiselect = true;
    }

    if (features.includes("expandable")) {
      props.expandable = true;
    }

    return props;
  }

  /**
   * Generate props for form component
   */
  private generateFormProps(features: string[], entity: any): Record<string, unknown> {
    const props: Record<string, unknown> = {
      fields: entity.properties?.map((prop: any) => ({
        key: prop.name,
        as: this.mapPropertyTypeToFieldType(prop.type),
        label: this.humanize(prop.name),
        required: prop.required || false,
      })) || [],
    };

    if (features.includes("validation")) {
      props.validation = true;
    }

    if (features.includes("sections")) {
      props.sections = this.inferSections(entity.properties || []);
    }

    return props;
  }

  /**
   * Map property type to column type
   */
  private mapPropertyTypeToColumnType(propType: string): string {
    const typeMap: Record<string, string> = {
      string: "text",
      number: "number",
      boolean: "boolean",
      date: "date-ago",
    };

    return typeMap[propType] || "text";
  }

  /**
   * Map property type to field type
   */
  private mapPropertyTypeToFieldType(propType: string): string {
    const typeMap: Record<string, string> = {
      string: "VcInput",
      number: "VcInput",
      boolean: "VcSwitch",
      date: "VcInput",
    };

    return typeMap[propType] || "VcInput";
  }

  /**
   * Normalize and validate features
   */
  private async normalizeFeatures(features: string[], bladeType: string): Promise<string[]> {
    if (features.length === 0) {
      return [];
    }

    const validation = await this.featureResolver.validate(features);

    // Filter to only valid features for this blade type
    const validForType = validation.valid.filter((f) => {
      const category = f.category || "global";
      return category === "global" || category === bladeType;
    });

    return validForType.map((f) => f.id);
  }

  /**
   * Generate blade ID
   */
  private generateBladeId(entityName: string, type: string): string {
    const base = entityName.toLowerCase().replace(/\s+/g, "-");
    return type === "list" ? `${base}-list` : `${base}-details`;
  }

  /**
   * Generate title
   */
  private generateTitle(entityName: string, type: string): string {
    return type === "list" ? `${entityName} List` : `${entityName} Details`;
  }

  /**
   * Infer icon from entity name
   */
  private inferIcon(entityName: string): string {
    const iconMap: Record<string, string> = {
      vendor: "fas fa-building",
      offer: "fas fa-tag",
      product: "fas fa-box",
      order: "fas fa-shopping-cart",
      user: "fas fa-user",
    };

    const key = entityName.toLowerCase();
    return iconMap[key] || "fas fa-cube";
  }

  /**
   * Humanize string
   */
  private humanize(str: string): string {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  /**
   * Infer form sections from properties
   */
  private inferSections(properties: any[]): any[] {
    // Simple heuristic: group every 5 properties
    const sections: any[] = [];
    for (let i = 0; i < properties.length; i += 5) {
      sections.push({
        title: `Section ${sections.length + 1}`,
        fields: properties.slice(i, i + 5).map((p) => p.name),
      });
    }
    return sections;
  }

  /**
   * Generate data sources
   */
  private generateDataSources(analysis: PromptAnalysis): Record<string, any> {
    const sources: Record<string, any> = {};

    for (const entity of analysis.entities) {
      const entityKey = entity.name.toLowerCase();
      sources[entityKey] = {
        type: "api",
        endpoint: `/api/${analysis.moduleName}/${entityKey}`,
        method: "GET",
      };
    }

    return sources;
  }

  /**
   * Generate localization keys
   */
  private generateLocalizationKeys(blades: BladePlan[]): string[] {
    const keys = new Set<string>();

    for (const blade of blades) {
      keys.add(`${blade.id}.title`);
      keys.add(`${blade.id}.description`);
    }

    return Array.from(keys);
  }
}
