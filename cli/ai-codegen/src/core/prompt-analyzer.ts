/**
 * Prompt Analyzer
 *
 * Provides schema and instructions for AI (Cursor, Claude Code) to analyze
 * user prompts and extract structured information for UI-Plan generation.
 *
 * This module does NOT call any LLM APIs directly.
 * Instead, it provides:
 * 1. JSON schema for PromptAnalysis
 * 2. System prompt with instructions
 * 3. Validation for AI-generated analysis
 */

/**
 * Structured analysis result from AI prompt analysis
 *
 * AI should fill this structure based on user's natural language prompt.
 */
export interface PromptAnalysis {
  /** Detected entity name (plural, kebab-case) */
  entityName: string;

  /** Singular form of entity (kebab-case) */
  entityNameSingular: string;

  /** Detected features for list blade */
  listFeatures: string[];

  /** Detected features for details blade */
  detailsFeatures: string[];

  /** Detected columns for table */
  columns?: Array<{
    key: string;
    title: string;
    type?: "text" | "number" | "date" | "boolean" | "image" | "badge" | "status";
    sortable?: boolean;
  }>;

  /** Detected fields for form */
  fields?: Array<{
    key: string;
    label: string;
    as: string; // VcInput, VcTextarea, VcSelect, etc.
    required?: boolean;
    type?: string;
  }>;

  /** Detected relationships */
  relationships?: Array<{
    type: "hasMany" | "belongsTo" | "manyToMany";
    entity: string;
  }>;

  /** Business rules detected */
  businessRules?: string[];

  /** Confidence score 0-1 */
  confidence: number;
}

/**
 * Build system prompt for AI to analyze user prompts
 *
 * This prompt is sent to AI IDE (Cursor, Claude Code) via MCP resources
 * or displayed to the user for manual analysis.
 */
export function buildAnalysisPrompt(userPrompt: string): string {
  return `# Task: Analyze UI Module Prompt

You are analyzing a user prompt to extract structured information for VC-Shell module generation.

## User Prompt
"${userPrompt}"

## Your Task
Analyze the prompt above and extract:
1. **Entity names** (plural and singular forms)
2. **Features** needed (filters, multiselect, validation, gallery, widgets, reorderable)
3. **Table columns** for list view (if applicable)
4. **Form fields** for details view (if applicable)
5. **Relationships** between entities (if mentioned)
6. **Business rules** (if mentioned)

## Important Rules
- Detect entity names in ANY language (English, Russian, French, etc.)
- Convert to kebab-case: "product-categories" not "ProductCategories"
- Be conservative with features - only add if explicitly mentioned or clearly implied
- For columns/fields, infer reasonable defaults if not specified
- Return ONLY valid JSON, no markdown formatting

## Supported Features
- **filters**: Filter panel with search
- **multiselect**: Bulk selection and actions
- **validation**: Form validation with rules
- **gallery**: Image/file gallery
- **widgets**: Dashboard widgets
- **reorderable**: Drag-and-drop reordering

## Supported Field Components
- **VcInput**: Single-line text
- **VcTextarea**: Multi-line text
- **VcSelect**: Dropdown select
- **VcCheckbox**: Checkbox
- **VcSwitch**: Toggle switch
- **VcInputCurrency**: Money input
- **VcEditor**: Rich text editor
- **VcFileUpload**: File upload

## Expected JSON Structure
Return JSON in this EXACT format:

\`\`\`json
{
  "entityName": "products",
  "entityNameSingular": "product",
  "listFeatures": ["filters", "multiselect"],
  "detailsFeatures": ["validation", "gallery"],
  "columns": [
    { "key": "name", "title": "Name", "type": "text", "sortable": true },
    { "key": "price", "title": "Price", "type": "number", "sortable": true },
    { "key": "status", "title": "Status", "type": "badge", "sortable": false }
  ],
  "fields": [
    { "key": "name", "label": "Product Name", "as": "VcInput", "required": true },
    { "key": "description", "label": "Description", "as": "VcTextarea" },
    { "key": "price", "label": "Price", "as": "VcInputCurrency", "required": true },
    { "key": "categoryId", "label": "Category", "as": "VcSelect", "required": true },
    { "key": "active", "label": "Active", "as": "VcSwitch" }
  ],
  "relationships": [
    { "type": "belongsTo", "entity": "category" }
  ],
  "businessRules": [
    "Price must be greater than zero",
    "Product name must be unique"
  ],
  "confidence": 0.9
}
\`\`\`

## Examples

### Example 1: Simple
**Prompt:** "Create product management"

**Analysis:**
\`\`\`json
{
  "entityName": "products",
  "entityNameSingular": "product",
  "listFeatures": [],
  "detailsFeatures": [],
  "columns": [
    { "key": "name", "title": "Name", "type": "text", "sortable": true },
    { "key": "price", "title": "Price", "type": "number", "sortable": true }
  ],
  "fields": [
    { "key": "name", "label": "Product Name", "as": "VcInput", "required": true },
    { "key": "price", "label": "Price", "as": "VcInputCurrency", "required": true }
  ],
  "confidence": 0.7
}
\`\`\`

### Example 2: Complex with Features
**Prompt:** "Vendor management with filtering, bulk operations, and approval workflow"

**Analysis:**
\`\`\`json
{
  "entityName": "vendors",
  "entityNameSingular": "vendor",
  "listFeatures": ["filters", "multiselect"],
  "detailsFeatures": ["validation"],
  "columns": [
    { "key": "name", "title": "Name", "type": "text", "sortable": true },
    { "key": "email", "title": "Email", "type": "text", "sortable": true },
    { "key": "status", "title": "Status", "type": "badge", "sortable": true }
  ],
  "fields": [
    { "key": "name", "label": "Vendor Name", "as": "VcInput", "required": true },
    { "key": "email", "label": "Email", "as": "VcInput", "required": true, "type": "email" },
    { "key": "status", "label": "Status", "as": "VcSelect", "required": true }
  ],
  "businessRules": [
    "Email must be unique",
    "Status changes require approval"
  ],
  "confidence": 0.85
}
\`\`\`

### Example 3: Russian Language
**Prompt:** "Каталог товаров с фильтрацией и галереей изображений"

**Analysis:**
\`\`\`json
{
  "entityName": "products",
  "entityNameSingular": "product",
  "listFeatures": ["filters"],
  "detailsFeatures": ["gallery"],
  "columns": [
    { "key": "name", "title": "Название", "type": "text", "sortable": true },
    { "key": "price", "title": "Цена", "type": "number", "sortable": true },
    { "key": "image", "title": "Изображение", "type": "image", "sortable": false }
  ],
  "fields": [
    { "key": "name", "label": "Название товара", "as": "VcInput", "required": true },
    { "key": "description", "label": "Описание", "as": "VcTextarea" },
    { "key": "price", "label": "Цена", "as": "VcInputCurrency", "required": true },
    { "key": "images", "label": "Изображения", "as": "VcFileUpload" }
  ],
  "confidence": 0.9
}
\`\`\`

Now analyze the user prompt and return ONLY the JSON object.`;
}

/**
 * Get JSON schema for PromptAnalysis
 *
 * This schema can be used by AI tools for structured output
 */
export function getPromptAnalysisSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["entityName", "entityNameSingular", "listFeatures", "detailsFeatures", "confidence"],
    properties: {
      entityName: {
        type: "string",
        description: "Entity name in plural, kebab-case (e.g., 'product-categories')",
        pattern: "^[a-z][a-z0-9-]*$",
      },
      entityNameSingular: {
        type: "string",
        description: "Entity name in singular, kebab-case (e.g., 'product-category')",
        pattern: "^[a-z][a-z0-9-]*$",
      },
      listFeatures: {
        type: "array",
        description: "Features for list blade",
        items: {
          type: "string",
          enum: ["filters", "multiselect", "reorderable"],
        },
      },
      detailsFeatures: {
        type: "array",
        description: "Features for details blade",
        items: {
          type: "string",
          enum: ["validation", "gallery", "widgets"],
        },
      },
      columns: {
        type: "array",
        description: "Table columns for list view",
        items: {
          type: "object",
          required: ["key", "title"],
          properties: {
            key: {
              type: "string",
              description: "Column key (camelCase)",
            },
            title: {
              type: "string",
              description: "Column display title",
            },
            type: {
              type: "string",
              enum: ["text", "number", "date", "boolean", "image", "badge", "status"],
              default: "text",
            },
            sortable: {
              type: "boolean",
              default: true,
            },
          },
        },
      },
      fields: {
        type: "array",
        description: "Form fields for details view",
        items: {
          type: "object",
          required: ["key", "label", "as"],
          properties: {
            key: {
              type: "string",
              description: "Field key (camelCase)",
            },
            label: {
              type: "string",
              description: "Field label",
            },
            as: {
              type: "string",
              description: "Component to use",
              enum: ["VcInput", "VcTextarea", "VcSelect", "VcCheckbox", "VcSwitch", "VcInputCurrency", "VcEditor", "VcFileUpload"],
            },
            required: {
              type: "boolean",
              default: false,
            },
            type: {
              type: "string",
              description: "Input type for validation (email, url, etc.)",
            },
          },
        },
      },
      relationships: {
        type: "array",
        description: "Relationships to other entities",
        items: {
          type: "object",
          required: ["type", "entity"],
          properties: {
            type: {
              type: "string",
              enum: ["hasMany", "belongsTo", "manyToMany"],
            },
            entity: {
              type: "string",
              description: "Related entity name (singular, kebab-case)",
            },
          },
        },
      },
      businessRules: {
        type: "array",
        description: "Business rules and validation requirements",
        items: {
          type: "string",
        },
      },
      confidence: {
        type: "number",
        description: "Confidence score 0-1",
        minimum: 0,
        maximum: 1,
      },
    },
  };
}

/**
 * Validate AI-generated prompt analysis
 *
 * Returns validation errors if analysis is invalid
 */
export function validatePromptAnalysis(analysis: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!analysis.entityName) {
    errors.push("Missing required field: entityName");
  }
  if (!analysis.entityNameSingular) {
    errors.push("Missing required field: entityNameSingular");
  }
  if (analysis.confidence === undefined) {
    errors.push("Missing required field: confidence");
  }

  // Validate entityName format (kebab-case)
  if (analysis.entityName && !/^[a-z][a-z0-9-]*$/.test(analysis.entityName)) {
    errors.push(`entityName must be kebab-case: "${analysis.entityName}"`);
  }
  if (analysis.entityNameSingular && !/^[a-z][a-z0-9-]*$/.test(analysis.entityNameSingular)) {
    errors.push(`entityNameSingular must be kebab-case: "${analysis.entityNameSingular}"`);
  }

  // Validate confidence range
  if (analysis.confidence !== undefined && (analysis.confidence < 0 || analysis.confidence > 1)) {
    errors.push(`confidence must be between 0 and 1: ${analysis.confidence}`);
  }

  // Validate features
  const validListFeatures = ["filters", "multiselect", "reorderable"];
  const validDetailsFeatures = ["validation", "gallery", "widgets"];

  if (analysis.listFeatures) {
    for (const feature of analysis.listFeatures) {
      if (!validListFeatures.includes(feature)) {
        errors.push(`Invalid list feature: "${feature}". Must be one of: ${validListFeatures.join(", ")}`);
      }
    }
  }

  if (analysis.detailsFeatures) {
    for (const feature of analysis.detailsFeatures) {
      if (!validDetailsFeatures.includes(feature)) {
        errors.push(`Invalid details feature: "${feature}". Must be one of: ${validDetailsFeatures.join(", ")}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
