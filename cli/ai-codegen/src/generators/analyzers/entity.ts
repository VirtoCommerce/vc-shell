/**
 * EntityExtractor
 *
 * Extracts entities and their properties from prompts.
 * Identifies data models, fields, types, and relationships.
 */

export interface ExtractedEntity {
  /**
   * Entity name (singular)
   */
  name: string;

  /**
   * Display name (plural for lists)
   */
  displayName: string;

  /**
   * Entity description
   */
  description?: string;

  /**
   * Properties/fields
   */
  properties: ExtractedProperty[];

  /**
   * Primary key field
   */
  primaryKey?: string;

  /**
   * Relationships to other entities
   */
  relationships?: {
    type: "one-to-many" | "many-to-one" | "many-to-many";
    target: string;
    description?: string;
  }[];

  /**
   * Required blades
   */
  blades?: {
    list?: boolean;
    details?: boolean;
    dashboard?: boolean;
  };
}

export interface ExtractedProperty {
  /**
   * Property name (camelCase)
   */
  name: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Data type
   */
  type: "string" | "number" | "boolean" | "date" | "array" | "object" | "enum";

  /**
   * Is required?
   */
  required?: boolean;

  /**
   * Default value
   */
  defaultValue?: any;

  /**
   * Validation rules
   */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };

  /**
   * Is searchable?
   */
  searchable?: boolean;

  /**
   * Is sortable?
   */
  sortable?: boolean;

  /**
   * Show in list?
   */
  showInList?: boolean;
}

/**
 * EntityExtractor
 *
 * Extracts entity definitions from natural language.
 */
export class EntityExtractor {
  private typeKeywords = new Map<string, string>([
    ["string", "text|name|title|description|email|url"],
    ["number", "number|count|quantity|amount|price|age"],
    ["boolean", "boolean|flag|is|has|enabled|active"],
    ["date", "date|time|timestamp|created|updated"],
    ["array", "array|list|items|tags|categories"],
    ["enum", "enum|status|type|category|role"],
  ]);

  private commonProperties = [
    { name: "id", label: "ID", type: "string", required: true },
    { name: "name", label: "Name", type: "string", required: true },
    { name: "description", label: "Description", type: "string" },
    { name: "createdAt", label: "Created", type: "date" },
    { name: "updatedAt", label: "Updated", type: "date" },
    { name: "isActive", label: "Active", type: "boolean" },
  ];

  /**
   * Extract entities from prompt
   */
  extract(prompt: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Extract primary entity from module name
    const primaryEntity = this.extractPrimaryEntity(prompt);
    if (primaryEntity) {
      entities.push(primaryEntity);
    }

    // Extract related entities
    const relatedEntities = this.extractRelatedEntities(prompt, primaryEntity);
    entities.push(...relatedEntities);

    return entities;
  }

  /**
   * Extract primary entity
   */
  private extractPrimaryEntity(prompt: string): ExtractedEntity | null {
    // Extract from "Create X module" or "X management"
    const modulePattern = /(?:create|build|make)\s+(?:a\s+)?(\w+)\s+(?:module|system|management)/i;
    const managementPattern = /(\w+)\s+(?:module|management|system)/i;

    let match = modulePattern.exec(prompt);
    if (!match) {
      match = managementPattern.exec(prompt);
    }

    if (!match) {
      // Fallback: first capitalized word
      const capitalizedWordPattern = /\b([A-Z]\w+)\b/;
      const capitalizedWord = capitalizedWordPattern.exec(prompt);
      if (capitalizedWord) {
        match = capitalizedWord;
      } else {
        return null;
      }
    }

    const entityName = this.singularize(match[1]);
    const displayName = this.capitalize(entityName);

    return {
      name: entityName,
      displayName,
      description: `${displayName} entity`,
      properties: this.extractProperties(prompt, entityName),
      primaryKey: "id",
      blades: {
        list: true,
        details: true,
      },
    };
  }

  /**
   * Extract related entities (e.g., "with products")
   */
  private extractRelatedEntities(
    prompt: string,
    primaryEntity: ExtractedEntity | null,
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Look for "with X", "including X", "and X"
    const relatedPattern = /(?:with|including|and)\s+(\w+)/gi;
    let match;

    while ((match = relatedPattern.exec(prompt)) !== null) {
      const relatedName = this.singularize(match[1].toLowerCase());

      // Skip if it's the primary entity
      if (relatedName === primaryEntity?.name) continue;

      // Skip common words
      if (["filter", "sort", "validation"].includes(relatedName)) continue;

      entities.push({
        name: relatedName,
        displayName: this.capitalize(relatedName),
        description: `${this.capitalize(relatedName)} entity`,
        properties: this.inferProperties(relatedName),
        primaryKey: "id",
        blades: {
          list: false,
          details: true,
        },
      });
    }

    return entities;
  }

  /**
   * Extract properties from prompt
   */
  private extractProperties(prompt: string, entityName: string): ExtractedProperty[] {
    const properties: ExtractedProperty[] = [];

    // Start with common properties
    properties.push(
      { name: "id", label: "ID", type: "string", required: true },
      { name: "name", label: "Name", type: "string", required: true, showInList: true },
    );

    // Extract from "with fields: X, Y, Z"
    const fieldsPattern = /(?:with\s+)?fields?:\s*([^.]+)/i;
    const fieldsMatch = fieldsPattern.exec(prompt);

    if (fieldsMatch) {
      const fieldNames = fieldsMatch[1].split(",").map((s) => s.trim());
      for (const fieldName of fieldNames) {
        const prop = this.parsePropertyFromName(fieldName);
        if (prop) {
          properties.push(prop);
        }
      }
    } else {
      // Infer properties based on entity type
      properties.push(...this.inferProperties(entityName));
    }

    // Add timestamps
    properties.push(
      { name: "createdAt", label: "Created", type: "date", showInList: false },
      { name: "updatedAt", label: "Updated", type: "date", showInList: false },
    );

    return properties;
  }

  /**
   * Parse property from name (e.g., "email", "phoneNumber", "isActive")
   */
  private parsePropertyFromName(name: string): ExtractedProperty | null {
    if (!name) return null;

    const camelName = this.toCamelCase(name);
    const label = this.toLabel(name);
    const type = this.inferType(name);

    return {
      name: camelName,
      label,
      type,
      required: false,
      showInList: ["name", "title", "email", "status"].some((key) =>
        name.toLowerCase().includes(key),
      ),
    };
  }

  /**
   * Infer properties based on entity name
   */
  private inferProperties(entityName: string): ExtractedProperty[] {
    const properties: ExtractedProperty[] = [];

    // Entity-specific properties
    const entityMap: Record<string, ExtractedProperty[]> = {
      vendor: [
        { name: "email", label: "Email", type: "string", required: true, showInList: true },
        { name: "phone", label: "Phone", type: "string", showInList: false },
        { name: "address", label: "Address", type: "string", showInList: false },
        { name: "isActive", label: "Active", type: "boolean", showInList: true },
      ],
      product: [
        { name: "sku", label: "SKU", type: "string", required: true, showInList: true },
        { name: "price", label: "Price", type: "number", required: true, showInList: true },
        { name: "stock", label: "Stock", type: "number", showInList: true },
        { name: "isActive", label: "Active", type: "boolean", showInList: true },
      ],
      offer: [
        { name: "code", label: "Code", type: "string", required: true, showInList: true },
        { name: "discount", label: "Discount", type: "number", showInList: true },
        { name: "startDate", label: "Start Date", type: "date", showInList: true },
        { name: "endDate", label: "End Date", type: "date", showInList: true },
      ],
      customer: [
        { name: "email", label: "Email", type: "string", required: true, showInList: true },
        { name: "phone", label: "Phone", type: "string", showInList: false },
        { name: "isActive", label: "Active", type: "boolean", showInList: true },
      ],
    };

    return entityMap[entityName.toLowerCase()] || [];
  }

  /**
   * Infer type from name
   */
  private inferType(name: string): ExtractedProperty["type"] {
    const lowerName = name.toLowerCase();

    for (const [type, pattern] of this.typeKeywords.entries()) {
      const regex = new RegExp(pattern);
      if (regex.test(lowerName)) {
        return type as ExtractedProperty["type"];
      }
    }

    return "string"; // Default
  }

  /**
   * Convert to camelCase
   */
  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  }

  /**
   * Convert to Label
   */
  private toLabel(str: string): string {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert to singular form (simple heuristic)
   */
  private singularize(str: string): string {
    if (str.endsWith("ies")) {
      return str.slice(0, -3) + "y";
    }
    if (str.endsWith("s") && !str.endsWith("ss")) {
      return str.slice(0, -1);
    }
    return str;
  }
}
