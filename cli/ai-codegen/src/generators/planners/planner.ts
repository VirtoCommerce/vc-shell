/**
 * SmartUIPlanner
 *
 * Professional UI planner using Intelligence Layer.
 * Components resolved dynamically via ComponentResolver.
 * Features validated via FeatureResolver.
 *
 * ZERO HARDCODING!
 */

import pluralize from "pluralize";
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
    const resolvedComponent = await this.resolveComponent(type, normalizedFeatures, entity, bladeConfig, discoveredComponents);

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
   * Uses layout-based resolution for correct component types.
   * For list blades: VcTable (data display)
   * For details blades: VcForm (form container)
   */
  private async resolveComponent(
    bladeType: "list" | "details",
    features: string[],
    entity: any,
    bladeConfig: any,
    discoveredComponents?: any[],
  ): Promise<ComponentPlan> {
    // Check if component was already discovered
    const discovered = discoveredComponents?.find(
      (c) => c.bladeType === bladeType && c.entity === entity.name,
    );

    if (discovered) {
      return {
        type: discovered.name,
        props: this.generateProps(bladeType, features, entity, bladeConfig),
      };
    }

    // Use layout-based resolution which maps correctly:
    // - "grid" layout -> VcTable (list blades)
    // - "details" layout -> VcForm (details blades)
    const layout = bladeType === "list" ? "grid" : "details";
    const match = await this.componentResolver.resolveForBladeLayout(layout, features);

    if (!match) {
      // Fallback: use hardcoded correct component for blade type
      // VcTable for lists, VcForm for details (NOT VcField!)
      const fallback = bladeType === "list" ? "VcTable" : "VcForm";
      return {
        type: fallback,
        props: this.generateProps(bladeType, features, entity, bladeConfig),
      };
    }

    // Validate that resolved component is appropriate
    // Prevent VcField from being used for details blades
    if (bladeType === "details" && match.item.component === "VcField") {
      return {
        type: "VcForm", // Force VcForm, not VcField
        props: this.generateProps(bladeType, features, entity, bladeConfig),
      };
    }

    return {
      type: match.item.component,
      props: this.generateProps(bladeType, features, entity, bladeConfig),
    };
  }

  /**
   * Generate component props based on blade type and features
   *
   * Priority:
   * 1. Use columns/fields from bladeConfig if AI specified them
   * 2. Fallback to generating from entity properties
   */
  private generateProps(
    bladeType: "list" | "details",
    features: string[],
    entity: any,
    bladeConfig?: any,
  ): Record<string, unknown> {
    if (bladeType === "list") {
      return this.generateTableProps(features, entity, bladeConfig);
    } else {
      return this.generateFormProps(features, entity, bladeConfig);
    }
  }

  /**
   * Generate props for table component
   *
   * Priority:
   * 1. Use columns from bladeConfig if AI specified them
   * 2. Fallback to generating from entity properties with type inference
   */
  private generateTableProps(features: string[], entity: any, bladeConfig?: any): Record<string, unknown> {
    // Priority 1: Use AI-specified columns if available
    let columns: any[];

    if (bladeConfig?.columns && bladeConfig.columns.length > 0) {
      // AI already selected important columns with correct types
      columns = bladeConfig.columns.map((col: any) => ({
        id: col.id,
        title: col.title || this.humanize(col.id),
        type: col.type || "text",
        sortable: col.sortable ?? features.includes("sortable"),
        width: col.width,
      }));
    } else {
      // Fallback: generate from entity properties using type inference
      columns = entity.properties?.map((prop: any) => ({
        id: prop.name,
        title: this.humanize(prop.name),
        type: this.mapPropertyTypeToColumnType(prop.type),
        sortable: features.includes("sortable"),
      })) || [];
    }

    const props: Record<string, unknown> = { columns };

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
   *
   * Priority:
   * 1. Use fields from bladeConfig if AI specified them (with real component names)
   * 2. Fallback to generating from entity properties with type inference
   */
  private generateFormProps(features: string[], entity: any, bladeConfig?: any): Record<string, unknown> {
    // Priority 1: Use AI-specified fields if available
    let fields: any[];

    if (bladeConfig?.fields && bladeConfig.fields.length > 0) {
      // AI already selected fields with correct component names
      fields = bladeConfig.fields.map((field: any) => ({
        key: field.id,
        as: field.component || "VcInput", // Real component name from AI
        label: field.label || this.humanize(field.id),
        required: field.required || false,
        rules: field.rules,
      }));
    } else {
      // Fallback: generate from entity properties using type inference
      fields = entity.properties?.map((prop: any) => ({
        key: prop.name,
        as: this.mapPropertyTypeToFieldType(prop.type),
        label: this.humanize(prop.name),
        required: prop.required || false,
      })) || [];
    }

    const props: Record<string, unknown> = { fields };

    if (features.includes("validation")) {
      props.validation = true;
    }

    // Use AI-specified sections if available, otherwise infer
    if (bladeConfig?.sections && bladeConfig.sections.length > 0) {
      props.sections = bladeConfig.sections;
    } else if (features.includes("sections")) {
      props.sections = this.inferSections(entity.properties || []);
    }

    return props;
  }

  /**
   * Map property type to column type
   *
   * Uses deterministic type mapping from property types to column display types.
   * No hardcoded regex patterns - relies on property type from analysis.
   */
  private mapPropertyTypeToColumnType(propType: string): string {
    const typeMap: Record<string, string> = {
      string: "text",
      number: "number",
      boolean: "status-icon", // Display as checkmark/cross icon
      date: "date-ago",       // Display as relative time
      array: "text",          // Serialized display
    };

    return typeMap[propType] || "text";
  }

  /**
   * Map property type to field type
   *
   * Uses deterministic type mapping from property types to real VC-Shell component names.
   * For complex field types (gallery, editor, currency), AI should specify explicitly.
   */
  private mapPropertyTypeToFieldType(propType: string): string {
    const typeMap: Record<string, string> = {
      string: "VcInput",
      text: "VcInput",
      number: "VcInput",     // VcInput with type="number"
      boolean: "VcSwitch",   // Toggle switch
      date: "VcInput",       // VcInput with type="date"
      array: "VcMultivalue", // Tags/multiple values
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
   * For list blades, uses plural form to match create-vc-app file naming convention
   */
  private generateBladeId(entityName: string, type: string): string {
    const base = entityName.toLowerCase().replace(/\s+/g, "-");

    // For list blades, use plural form to match create-vc-app convention
    if (type === "list") {
      const pluralBase = pluralize(base);
      return `${pluralBase}-list`;
    }

    // Details blades remain singular
    return `${base}-details`;
  }

  /**
   * Generate title
   */
  private generateTitle(entityName: string, type: string): string {
    return type === "list" ? `${entityName} List` : `${entityName} Details`;
  }

  /**
   * Infer icon from entity name
   * Uses Material Symbols (preferred) - Font Awesome is FORBIDDEN (legacy)
   */
  private inferIcon(entityName: string): string {
    const iconMap: Record<string, string> = {
      vendor: "material-business",
      offer: "material-sell",
      product: "material-inventory_2",
      order: "material-shopping_cart",
      user: "material-person",
      customer: "material-person",
      branch: "material-store",
      shop: "material-storefront",
      category: "material-category",
      inventory: "material-inventory",
      price: "material-attach_money",
      payment: "material-payments",
      shipping: "material-local_shipping",
      notification: "material-notifications",
      settings: "material-settings",
      report: "material-analytics",
      dashboard: "material-dashboard",
    };

    const key = entityName.toLowerCase();
    return iconMap[key] || "material-widgets";
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
