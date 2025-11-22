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
      type: "list" | "details" | "custom";

      /** Custom route (optional, will be auto-generated if not provided) */
      route?: string;

      /** Features for this blade */
      features: string[];

      /** Columns (for list blades) */
      columns?: Array<{
        id: string;
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

      /** Menu item configuration (REQUIRED if isWorkspace: true) */
      menuItem?: {
        /** i18n key for menu title (e.g., "PAGES.MENU.DRAFT") */
        title: string;
        /** Icon string (e.g., "fas fa-file-alt", "lucide-file") */
        icon: string;
        /** Priority in menu (lower = higher, e.g., 10, 11, 12) */
        priority: number;
      };

      /** Default filter for pre-filtering data (for workspace blades with specific views) */
      defaultFilter?: Record<string, any>;
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
- Required blades (list, details, custom)
- Custom routes (if specified, e.g., "/vendors/approved")
- Features per blade
- Columns for list views
- Fields for forms/details
- Custom actions beyond CRUD
- Permissions required
- Data source configuration

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
- widgets - Widgets
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

## VC-Shell Framework Architecture (CRITICAL)

You MUST follow these framework capabilities and constraints:

### Blade Types
- **workspace blade**: Main blade that appears in left sidebar menu
  - MUST have: \`isWorkspace: true\`, \`menuItem: {title, icon, priority}\`
  - Route pattern: \`/single-level\` only (e.g., \`/offers\`, \`/draft-pages\`)
  - Example: \`{ "type": "list", "route": "/offers", "isWorkspace": true, "menuItem": {...} }\`
- **child blade**: Opens on top of workspace blade (details, forms)
  - MUST have: \`isWorkspace: false\` or omitted
  - Route pattern: \`/single-level\` (e.g., \`/offer\`, \`/page\`)
  - Example: \`{ "type": "details", "route": "/offer" }\`

### Multiple Workspace Blades in One Module (IMPORTANT)
- ✅ **ALLOWED**: Create multiple workspace blades per module
- Each workspace blade = separate menu item in sidebar
- Use case: Different views/filters of same data (Draft pages, Active pages, Archived pages)
- Each blade MUST have unique route and menuItem configuration
- Example: 5 workspace blades for status-based navigation (Draft, Pending, Active, Archived, All)

### Route Constraints (CRITICAL - WILL FAIL VALIDATION IF VIOLATED)
- ✅ **ALLOWED PATTERNS**: \`/offers\`, \`/draft-pages\`, \`/pending-orders\`, \`/page\`
- ❌ **FORBIDDEN PATTERNS**:
  - Multi-level: \`/pages/draft\`, \`/offers/pending\`, \`/admin/users\`
  - With parameters: \`/offer/:id\`, \`/product/:id?\`, \`/user/:userId/edit\`
  - Query strings: \`/offers?status=active\`, \`/pages?filter=draft\`
  - Invalid characters: \`/Offers\` (uppercase), \`/my_offers\` (underscores), \`/offers.list\` (dots)
- **PATTERN**: \`^/[a-z0-9-]+$\` (single slash + lowercase + hyphens only)
- **NAMING**: Use plural for lists (\`/offers\`), singular for details (\`/offer\`)
- **STATUS-BASED ROUTES**: Use hyphen-separated names: \`/draft-pages\`, \`/pending-orders\`, \`/active-products\`

### Menu Items Configuration
- ✅ **CORRECT**: Define \`menuItem\` in workspace blade object
  - Structure: \`{ "title": "I18N_KEY", "icon": "fas fa-*", "priority": number }\`
  - Priority: Lower number = higher in menu (10, 11, 12, ...)
- ❌ **WRONG**: Create \`customMenuItems\` field (DOES NOT EXIST in VC-Shell)

### Interpreting User Intent for Multiple Views

**IF user describes multiple separate pages/views in navigation:**
- Examples: "Left menu with: Draft, Pending, Active", "Navigation items: 1. Orders, 2. Archived Orders", "Sidebar showing different statuses"
- **MEANS**: Create multiple workspace blades, each with \`isWorkspace: true\` and unique \`menuItem\`
- Each blade = separate menu item in sidebar

### Default Filters for Status-Based Workspace Blades
When creating multiple workspace blades for different statuses:
- Add \`defaultFilter\` property to pre-filter data
- Example: \`{ "route": "/draft-pages", "defaultFilter": { "status": "draft" } }\`

## Important Rules

1. **Multiple Entities**: If prompt mentions multiple entities (e.g., "Orders and Line Items"), create separate entity objects
2. **Multiple Workspace Blades**: If prompt mentions multiple navigation items/menu items, create separate workspace blades with unique routes
3. **Route Validation**: ALL routes MUST match \`^/[a-z0-9-]+$\` pattern (single-level, lowercase, hyphens only)
4. **Permissions**: Infer reasonable permissions (e.g., "vendors:read", "vendors:update")
5. **Actions**: Detect custom actions (e.g., "approve", "reject", "publish", "archive")
6. **Relationships**: Map relationships clearly (Order hasMany LineItems, Product belongsTo Category)
8. **Complexity**: Assess complexity (simple: 1 entity + basic CRUD, moderate: 2-3 entities + features, complex: 4+ entities + workflow)

Now analyze the user prompt deeply and return ONLY the JSON object following the extended schema defined above.

**CRITICAL REMINDERS:**
- Multiple menu/navigation items → Multiple workspace blades with \`isWorkspace: true\`
- Routes MUST be single-level: \`/draft-pages\` NOT \`/pages/draft\` or \`/pages?status=draft\`
- Each workspace blade MUST have \`menuItem: {title, icon, priority}\`
- Use \`defaultFilter\` to pre-filter data in status-based workspace blades`;
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
                    enum: ["list", "details", "custom"],
                  },
                  route: { type: "string" },
                  features: { type: "array", items: { type: "string" } },
                  columns: { type: "array" },
                  fields: { type: "array" },
                  actions: { type: "array" },
                  permissions: { type: "array", items: { type: "string" } },
                  isWorkspace: { type: "boolean" },
                  menuItem: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "i18n key for menu title" },
                      icon: { type: "string", description: "Icon string (e.g., 'fas fa-file-alt')" },
                      priority: { type: "number", description: "Priority in menu (lower = higher)" },
                    },
                    required: ["title", "icon", "priority"],
                  },
                  defaultFilter: {
                    type: "object",
                    description: "Default filter for pre-filtering data",
                    additionalProperties: true,
                  },
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
