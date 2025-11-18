/**
 * Prompt Analyzer V2
 *
 * Extended version supporting:
 * - Multiple entities and blades
 * - Custom routes, permissions, actions
 * - Rich feature set
 * - Data sources and relationships
 * - Multi-blade workflows
 */

/**
 * Extended PromptAnalysis for complex multi-entity scenarios
 */
export interface PromptAnalysisV2 {
  /** Primary module name (kebab-case) */
  moduleName: string;

  /** Detected entities - can be multiple */
  entities: Array<{
    /** Entity name (plural, kebab-case) */
    name: string;

    /** Singular form (kebab-case) */
    singular: string;

    /** Blades for this entity */
    blades: Array<{
      /** Blade type */
      type: "list" | "details" | "dashboard" | "wizard" | "custom";

      /** Custom route (optional, will be auto-generated if not provided) */
      route?: string;

      /** Features for this blade */
      features: string[];

      /** Columns (for list blades) */
      columns?: Array<{
        key: string;
        title: string;
        type?: string;
        sortable?: boolean;
        width?: string;
        align?: "left" | "center" | "right";
      }>;

      /** Fields (for details/form blades) */
      fields?: Array<{
        key: string;
        label: string;
        as: string;
        required?: boolean;
        type?: string;
        placeholder?: string;
        options?: string[]; // For selects
        validation?: string;
      }>;

      /** Custom actions (beyond default CRUD) */
      actions?: Array<{
        id: string;
        label: string;
        icon?: string;
        type: "primary" | "secondary" | "danger";
        condition?: string; // When to show action
      }>;

      /** Permissions required */
      permissions?: string[];

      /** Is this a workspace blade? */
      isWorkspace?: boolean;
    }>;

    /** Data source configuration */
    dataSource?: {
      type: "api" | "graphql" | "static" | "computed";
      endpoint?: string;
      query?: string;
      transform?: string;
    };

    /** Relationships to other entities */
    relationships?: Array<{
      type: "hasMany" | "belongsTo" | "manyToMany";
      entity: string;
      foreignKey?: string;
      displayIn?: "list" | "details" | "both";
    }>;
  }>;

  /** Detected workflow (if multi-step process) */
  workflow?: {
    type: "linear" | "branching" | "parallel";
    steps: Array<{
      id: string;
      title: string;
      bladeId: string;
      nextStep?: string | string[]; // For branching
      condition?: string;
    }>;
  };

  /** Global features (apply to entire module) */
  globalFeatures?: Array<{
    name: string;
    config?: Record<string, any>;
  }>;

  /** Business rules and validation */
  businessRules?: Array<{
    type: "validation" | "workflow" | "permission" | "calculation";
    description: string;
    appliesTo?: string; // Entity or blade ID
  }>;

  /** Detected integrations */
  integrations?: Array<{
    service: string;
    purpose: string;
    entities?: string[]; // Which entities use this
  }>;

  /** Confidence and metadata */
  confidence: number;
  complexity: "simple" | "moderate" | "complex";
  requiresCustomCode?: boolean;
  notes?: string[];
}

/**
 * Build analysis prompt for V2 (extended)
 */
export function buildAnalysisPromptV2(userPrompt: string): string {
  return `# Task: Analyze UI Module Prompt (Extended Analysis)

You are analyzing a user prompt to extract comprehensive structured information for VC-Shell module generation.

## User Prompt
"${userPrompt}"

## Your Task

Perform deep analysis and extract:

### 1. Module Structure
- Primary module name
- All entities mentioned (can be multiple)
- Relationships between entities

### 2. For Each Entity
- Entity name (plural + singular, kebab-case)
- Required blades (list, details, dashboard, wizard, custom)
- Custom routes (if specified, e.g., "/vendors/approved")
- Features per blade
- Columns for list views
- Fields for forms/details
- Custom actions beyond CRUD
- Permissions required
- Data source configuration

### 3. Workflow Detection
- Is this a multi-step process? (wizard, approval flow, etc.)
- What are the steps?
- Is it linear, branching, or parallel?

### 4. Features Detection

**List Blade Features:**
- filters - Filter panel with search
- multiselect - Bulk selection and operations
- reorderable - Drag-and-drop row reordering
- export - Export to CSV/Excel
- import - Import from CSV/Excel
- pagination - Paginated results
- grouping - Group rows by column
- pinned-columns - Pin columns to left/right
- row-expansion - Expandable row details
- inline-editing - Edit cells directly

**Details Blade Features:**
- validation - Form validation with rules
- gallery - Image/file gallery
- widgets - Dashboard widgets
- tabs - Tabbed sections
- accordion - Collapsible sections
- autosave - Auto-save drafts
- version-history - Track changes
- comments - User comments
- attachments - File attachments
- audit-log - Change history

**Global Features:**
- notifications - Push notifications
- real-time - WebSocket updates
- offline - Offline support
- search - Global search
- help - Contextual help
- themes - Theme switching
- localization - Multi-language support

### 5. Business Rules
- Validation rules (e.g., "Price must be > 0")
- Workflow rules (e.g., "Orders require approval")
- Permission rules (e.g., "Only admins can delete")
- Calculation rules (e.g., "Total = Sum of line items")

### 6. Integrations
- External services (payment, shipping, email, etc.)
- APIs to integrate
- Webhooks needed

## Important Rules

1. **Multiple Entities**: If prompt mentions multiple entities (e.g., "Orders and Line Items"), create separate entity objects
2. **Custom Routes**: If route pattern is mentioned (e.g., "/vendors/pending"), include it
3. **Permissions**: Infer reasonable permissions (e.g., "vendors:read", "vendors:update")
4. **Actions**: Detect custom actions (e.g., "approve", "reject", "publish", "archive")
5. **Relationships**: Map relationships clearly (Order hasMany LineItems, Product belongsTo Category)
6. **Workflow**: If process has steps (wizard, approval), capture workflow structure
7. **Complexity**: Assess complexity (simple: 1 entity + basic CRUD, moderate: 2-3 entities + features, complex: 4+ entities + workflow)

## Examples

### Example 1: Multi-Entity with Workflow

**Prompt:** "Order management with approval workflow. Orders have line items. Pending orders need approval from manager."

**Analysis:**
\`\`\`json
{
  "moduleName": "orders",
  "entities": [
    {
      "name": "orders",
      "singular": "order",
      "blades": [
        {
          "type": "list",
          "route": "/orders",
          "features": ["filters", "multiselect"],
          "columns": [
            { "key": "orderNumber", "title": "Order #", "type": "text", "sortable": true },
            { "key": "status", "title": "Status", "type": "status", "sortable": true },
            { "key": "total", "title": "Total", "type": "number", "sortable": true }
          ],
          "actions": [
            { "id": "approve", "label": "Approve", "icon": "fas fa-check", "type": "primary", "condition": "status === 'pending'" },
            { "id": "reject", "label": "Reject", "icon": "fas fa-times", "type": "danger", "condition": "status === 'pending'" }
          ],
          "permissions": ["orders:read", "orders:approve"],
          "isWorkspace": true
        },
        {
          "type": "details",
          "route": "/order",
          "features": ["validation", "audit-log"],
          "fields": [
            { "key": "customerName", "label": "Customer", "as": "VcInput", "required": true },
            { "key": "status", "label": "Status", "as": "VcSelect", "required": true, "options": ["pending", "approved", "rejected"] },
            { "key": "notes", "label": "Notes", "as": "VcTextarea" }
          ],
          "permissions": ["orders:read", "orders:update"]
        }
      ],
      "dataSource": {
        "type": "api",
        "endpoint": "/api/orders"
      },
      "relationships": [
        { "type": "hasMany", "entity": "line-item", "displayIn": "details" }
      ]
    },
    {
      "name": "line-items",
      "singular": "line-item",
      "blades": [
        {
          "type": "list",
          "features": ["inline-editing"],
          "columns": [
            { "key": "productName", "title": "Product", "type": "text" },
            { "key": "quantity", "title": "Qty", "type": "number" },
            { "key": "price", "title": "Price", "type": "number" },
            { "key": "total", "title": "Total", "type": "number" }
          ]
        }
      ],
      "relationships": [
        { "type": "belongsTo", "entity": "order" }
      ]
    }
  ],
  "workflow": {
    "type": "linear",
    "steps": [
      { "id": "create", "title": "Create Order", "bladeId": "order-details", "nextStep": "review" },
      { "id": "review", "title": "Review", "bladeId": "order-details", "nextStep": "approve" },
      { "id": "approve", "title": "Approval", "bladeId": "order-details" }
    ]
  },
  "businessRules": [
    { "type": "validation", "description": "Total must equal sum of line items", "appliesTo": "order" },
    { "type": "workflow", "description": "Orders require manager approval", "appliesTo": "orders" },
    { "type": "permission", "description": "Only managers can approve orders" }
  ],
  "confidence": 0.9,
  "complexity": "complex",
  "requiresCustomCode": true,
  "notes": ["Approval workflow requires custom handlers", "Line items should be editable inline"]
}
\`\`\`

### Example 2: Dashboard with Widgets

**Prompt:** "Product analytics dashboard with sales charts, inventory widgets, and top sellers"

**Analysis:**
\`\`\`json
{
  "moduleName": "product-analytics",
  "entities": [
    {
      "name": "products",
      "singular": "product",
      "blades": [
        {
          "type": "dashboard",
          "route": "/analytics",
          "features": ["widgets", "real-time"],
          "isWorkspace": true
        }
      ],
      "dataSource": {
        "type": "api",
        "endpoint": "/api/analytics/products"
      }
    }
  ],
  "globalFeatures": [
    { "name": "real-time", "config": { "updateInterval": 5000 } },
    { "name": "export", "config": { "formats": ["csv", "pdf"] } }
  ],
  "confidence": 0.85,
  "complexity": "moderate",
  "notes": ["Dashboard requires custom widget components", "Charts need data visualization library"]
}
\`\`\`

Now analyze the user prompt and return ONLY the JSON object following this extended schema.`;
}

/**
 * Validate V2 analysis
 */
export function validatePromptAnalysisV2(analysis: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required top-level fields
  if (!analysis.moduleName) {
    errors.push("Missing required field: moduleName");
  }
  if (!analysis.entities || !Array.isArray(analysis.entities) || analysis.entities.length === 0) {
    errors.push("Missing required field: entities (must be non-empty array)");
  }
  if (analysis.confidence === undefined) {
    errors.push("Missing required field: confidence");
  }

  // Validate moduleName format
  if (analysis.moduleName && !/^[a-z][a-z0-9-]*$/.test(analysis.moduleName)) {
    errors.push(`moduleName must be kebab-case: "${analysis.moduleName}"`);
  }

  // Validate entities
  if (analysis.entities && Array.isArray(analysis.entities)) {
    analysis.entities.forEach((entity: any, idx: number) => {
      if (!entity.name) {
        errors.push(`Entity ${idx}: missing name`);
      }
      if (!entity.singular) {
        errors.push(`Entity ${idx}: missing singular`);
      }
      if (!entity.blades || !Array.isArray(entity.blades) || entity.blades.length === 0) {
        errors.push(`Entity ${idx} (${entity.name}): must have at least one blade`);
      }

      // Validate entity name format
      if (entity.name && !/^[a-z][a-z0-9-]*$/.test(entity.name)) {
        errors.push(`Entity ${idx}: name must be kebab-case: "${entity.name}"`);
      }
      if (entity.singular && !/^[a-z][a-z0-9-]*$/.test(entity.singular)) {
        errors.push(`Entity ${idx}: singular must be kebab-case: "${entity.singular}"`);
      }

      // Validate blades
      if (entity.blades && Array.isArray(entity.blades)) {
        entity.blades.forEach((blade: any, bidx: number) => {
          if (!blade.type) {
            errors.push(`Entity ${idx}, Blade ${bidx}: missing type`);
          }
          if (!blade.features || !Array.isArray(blade.features)) {
            errors.push(`Entity ${idx}, Blade ${bidx}: features must be an array`);
          }
        });
      }
    });
  }

  // Validate confidence range
  if (analysis.confidence !== undefined && (analysis.confidence < 0 || analysis.confidence > 1)) {
    errors.push(`confidence must be between 0 and 1: ${analysis.confidence}`);
  }

  // Validate complexity
  if (analysis.complexity && !["simple", "moderate", "complex"].includes(analysis.complexity)) {
    errors.push(`complexity must be one of: simple, moderate, complex`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get JSON schema for V2
 */
export function getPromptAnalysisSchemaV2() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["moduleName", "entities", "confidence"],
    properties: {
      moduleName: {
        type: "string",
        description: "Primary module name (kebab-case)",
        pattern: "^[a-z][a-z0-9-]*$",
      },
      entities: {
        type: "array",
        description: "Detected entities (can be multiple)",
        minItems: 1,
        items: {
          type: "object",
          required: ["name", "singular", "blades"],
          properties: {
            name: {
              type: "string",
              pattern: "^[a-z][a-z0-9-]*$",
            },
            singular: {
              type: "string",
              pattern: "^[a-z][a-z0-9-]*$",
            },
            blades: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["type", "features"],
                properties: {
                  type: {
                    type: "string",
                    enum: ["list", "details", "dashboard", "wizard", "custom"],
                  },
                  route: { type: "string" },
                  features: { type: "array", items: { type: "string" } },
                  columns: { type: "array" },
                  fields: { type: "array" },
                  actions: { type: "array" },
                  permissions: { type: "array", items: { type: "string" } },
                  isWorkspace: { type: "boolean" },
                },
              },
            },
            dataSource: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["api", "graphql", "static", "computed"] },
                endpoint: { type: "string" },
                query: { type: "string" },
                transform: { type: "string" },
              },
            },
            relationships: { type: "array" },
          },
        },
      },
      workflow: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["linear", "branching", "parallel"] },
          steps: { type: "array" },
        },
      },
      globalFeatures: { type: "array" },
      businessRules: { type: "array" },
      integrations: { type: "array" },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      complexity: {
        type: "string",
        enum: ["simple", "moderate", "complex"],
      },
      requiresCustomCode: { type: "boolean" },
      notes: { type: "array", items: { type: "string" } },
    },
  };
}
