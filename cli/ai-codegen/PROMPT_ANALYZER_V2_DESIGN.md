# Prompt Analyzer V2 - Design Document

**Status:** 🚧 Prototype Created
**Date:** 2025-01-17

---

## Current Limitations (V1)

### 1. Single Entity Only
**Problem:** V1 `PromptAnalysis` supports only ONE entity per analysis
```typescript
interface PromptAnalysis {
  entityName: string;          // Only ONE entity
  entityNameSingular: string;
  // ...
}
```

**Impact:** Cannot handle prompts like:
- "Orders and Line Items management"
- "Products with Categories and Tags"
- "Multi-entity workflows"

### 2. Fixed Blade Structure
**Problem:** Always generates exactly 1 list + 1 details blade

**Code:** [src/core/planner.ts:147-169](../src/core/planner.ts#L147-L169)
```typescript
private generateFallbackPlan(prompt: string, moduleOverride?: string): UIPlan {
  const blades = [
    this.generateGridBlade(moduleName),      // Always 1 grid
    this.generateDetailsBlade(moduleName)    // Always 1 details
  ];
  // No way to add dashboard, wizard, or custom blades
}
```

**Impact:** Cannot handle:
- Dashboard blades with widgets
- Wizard blades (multi-step forms)
- Multiple list blades (e.g., "Active Orders" + "Archived Orders")
- Custom blade types

### 3. Hardcoded Defaults
**Problem:** Routes, permissions, actions, data sources are all hardcoded

**Examples:**
```typescript
// Routes - always /${moduleName}
route: `/${moduleName}`

// Permissions - always generic pattern
permissions: [`${moduleName}:read`]

// Actions - always same 3 actions
actions: ["add", "edit", "delete"]

// Data source - always API with generic endpoint
endpoint: `/api/${moduleName}`
```

**Impact:** Cannot express:
- Custom routes (e.g., "/vendors/pending", "/orders/approved")
- Specific permissions (e.g., "orders:approve", "products:publish")
- Custom actions (e.g., "approve", "reject", "archive", "publish")
- GraphQL, computed, or static data sources

### 4. Limited Feature Set
**Problem:** Only supports 6 features total

**V1 Features:**
- List: filters, multiselect, reorderable (3 features)
- Details: validation, gallery, widgets (3 features)

**Missing:**
- export, import, pagination, grouping, pinned-columns, row-expansion, inline-editing
- tabs, accordion, autosave, version-history, comments, attachments, audit-log
- notifications, real-time, offline, search, help, themes, localization

**Impact:** Cannot handle modern UI requirements

### 5. No Workflow Support
**Problem:** No way to express multi-step processes

**Impact:** Cannot handle:
- Wizard flows (e.g., "3-step product creation")
- Approval workflows (e.g., "Order approval by manager")
- Branching logic (e.g., "If status=pending → show approval actions")

### 6. No Relationships in UI-Plan
**Problem:** `PromptAnalysis` captures relationships, but Planner ignores them

**Impact:** Related entities not shown in UI (e.g., Order → Line Items)

---

## V2 Design: Extended PromptAnalysis

### Key Improvements

#### 1. Multiple Entities ✅
```typescript
interface PromptAnalysisV2 {
  moduleName: string;
  entities: Array<{              // Multiple entities!
    name: string;
    singular: string;
    blades: Array<...>;
    // ...
  }>;
}
```

**Example:**
```json
{
  "moduleName": "order-management",
  "entities": [
    { "name": "orders", "blades": [...] },
    { "name": "line-items", "blades": [...] },
    { "name": "customers", "blades": [...] }
  ]
}
```

#### 2. Rich Blade Configuration ✅
```typescript
blades: Array<{
  type: "list" | "details" | "dashboard" | "wizard" | "custom";
  route?: string;              // Custom route
  features: string[];          // Extended feature set
  actions?: Array<{            // Custom actions
    id: string;
    label: string;
    icon?: string;
    type: "primary" | "secondary" | "danger";
    condition?: string;        // When to show
  }>;
  permissions?: string[];      // Specific permissions
  isWorkspace?: boolean;
}>
```

**Example:**
```json
{
  "type": "list",
  "route": "/vendors/pending",
  "features": ["filters", "multiselect", "export"],
  "actions": [
    { "id": "approve", "label": "Approve", "icon": "fas fa-check",
      "type": "primary", "condition": "status === 'pending'" }
  ],
  "permissions": ["vendors:read", "vendors:approve"],
  "isWorkspace": true
}
```

#### 3. Data Source Configuration ✅
```typescript
dataSource?: {
  type: "api" | "graphql" | "static" | "computed";
  endpoint?: string;
  query?: string;
  transform?: string;
}
```

**Example:**
```json
{
  "type": "graphql",
  "query": "query GetOrders { orders { id, total, status } }"
}
```

#### 4. Workflow Support ✅
```typescript
workflow?: {
  type: "linear" | "branching" | "parallel";
  steps: Array<{
    id: string;
    title: string;
    bladeId: string;
    nextStep?: string | string[];
    condition?: string;
  }>;
}
```

**Example:**
```json
{
  "type": "linear",
  "steps": [
    { "id": "create", "title": "Create Order", "bladeId": "order-details", "nextStep": "review" },
    { "id": "review", "title": "Review", "bladeId": "order-details", "nextStep": "approve" },
    { "id": "approve", "title": "Approval", "bladeId": "order-details" }
  ]
}
```

#### 5. Extended Feature Set ✅

**List Features (19 total):**
- filters, multiselect, reorderable
- export, import, pagination, grouping
- pinned-columns, row-expansion, inline-editing
- ... and more

**Details Features (15 total):**
- validation, gallery, widgets
- tabs, accordion, autosave
- version-history, comments, attachments, audit-log
- ... and more

**Global Features (7 total):**
- notifications, real-time, offline
- search, help, themes, localization

#### 6. Business Rules & Integrations ✅
```typescript
businessRules?: Array<{
  type: "validation" | "workflow" | "permission" | "calculation";
  description: string;
  appliesTo?: string;
}>;

integrations?: Array<{
  service: string;
  purpose: string;
  entities?: string[];
}>;
```

---

## Implementation Roadmap

### Phase 1: Prototype (✅ Done)
- [x] Create `prompt-analyzer-v2.ts` with extended interfaces
- [x] Add `buildAnalysisPromptV2()` with comprehensive examples
- [x] Add `validatePromptAnalysisV2()` validation logic
- [x] Add `getPromptAnalysisSchemaV2()` JSON schema

**Status:** Prototype ready in [src/core/prompt-analyzer-v2.ts](../src/core/prompt-analyzer-v2.ts)

### Phase 2: Planner V2 Integration (⏳ TODO)
- [ ] Create `PlannerV2` class that consumes `PromptAnalysisV2`
- [ ] Support multiple entities → multiple blade sets
- [ ] Respect custom routes, permissions, actions
- [ ] Generate data source configurations
- [ ] Build workflow definitions into UI-Plan

**Complexity:** High - requires changes to UI-Plan schema and code generator

### Phase 3: MCP Tools V2 (⏳ TODO)
- [ ] Add `analyze_prompt_v2` MCP tool
- [ ] Add `create_ui_plan_from_analysis_v2` MCP tool
- [ ] Update MCP resources with V2 documentation
- [ ] Maintain backward compatibility with V1 tools

**Complexity:** Medium

### Phase 4: Code Generator Updates (⏳ TODO)
- [ ] Update blade generators to handle custom actions
- [ ] Support workflow blade types (wizard, dashboard)
- [ ] Generate permission checks
- [ ] Generate data source adapters (GraphQL, computed, etc.)

**Complexity:** Very High

### Phase 5: Testing (⏳ TODO)
- [ ] Write tests for `prompt-analyzer-v2.ts`
- [ ] Write tests for `PlannerV2`
- [ ] Integration tests for multi-entity scenarios
- [ ] Workflow generation tests

**Complexity:** High

---

## Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Keep V1 tools working as-is
2. Add V2 tools alongside (analyze_prompt_v2, create_ui_plan_from_analysis_v2)
3. Update documentation to recommend V2 for complex scenarios
4. Deprecate V1 after 2-3 releases

**Pros:**
- No breaking changes
- Users can choose complexity level
- Time to gather feedback on V2

**Cons:**
- Maintain two parallel systems temporarily

### Option B: Replace V1 (Not Recommended)
1. Update existing tools to use V2 format
2. Maintain backward compatibility via converters

**Pros:**
- Single system to maintain

**Cons:**
- Risk of breaking existing workflows
- Hard to maintain backward compatibility

---

## Example Scenarios V2 Enables

### 1. Multi-Entity Order Management
```json
{
  "moduleName": "order-management",
  "entities": [
    {
      "name": "orders",
      "blades": [
        {
          "type": "list",
          "route": "/orders/pending",
          "features": ["filters", "multiselect"],
          "actions": [
            { "id": "approve", "label": "Approve", "condition": "status === 'pending'" },
            { "id": "reject", "label": "Reject", "condition": "status === 'pending'" }
          ]
        },
        { "type": "details", "features": ["validation", "audit-log"] }
      ],
      "relationships": [
        { "type": "hasMany", "entity": "line-item", "displayIn": "details" }
      ]
    },
    {
      "name": "line-items",
      "blades": [
        { "type": "list", "features": ["inline-editing"] }
      ]
    }
  ],
  "workflow": {
    "type": "linear",
    "steps": [
      { "id": "create", "bladeId": "order-details" },
      { "id": "approve", "bladeId": "order-details" }
    ]
  }
}
```

### 2. Product Analytics Dashboard
```json
{
  "moduleName": "product-analytics",
  "entities": [
    {
      "name": "products",
      "blades": [
        {
          "type": "dashboard",
          "route": "/analytics",
          "features": ["widgets", "real-time", "export"],
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
    { "name": "real-time", "config": { "updateInterval": 5000 } }
  ]
}
```

### 3. Wizard Product Creation
```json
{
  "moduleName": "products",
  "entities": [
    {
      "name": "products",
      "blades": [
        {
          "type": "wizard",
          "features": ["validation", "autosave"],
          "route": "/products/create"
        }
      ]
    }
  ],
  "workflow": {
    "type": "linear",
    "steps": [
      { "id": "basic-info", "title": "Basic Info", "bladeId": "product-wizard" },
      { "id": "pricing", "title": "Pricing", "bladeId": "product-wizard" },
      { "id": "images", "title": "Images", "bladeId": "product-wizard" }
    ]
  }
}
```

---

## Benefits of V2

### 1. Handles Real-World Complexity ✅
- Multi-entity systems
- Complex workflows
- Custom actions and permissions
- Rich feature sets

### 2. Preserves User Intent ✅
- Custom routes preserved
- Specific permissions captured
- Business rules documented
- Workflow steps defined

### 3. Enables Advanced Scenarios ✅
- Dashboard blades
- Wizard flows
- Approval workflows
- Real-time updates
- Inline editing

### 4. Better AI Analysis ✅
- More structured output
- Clearer validation rules
- Better examples for AI
- Comprehensive documentation

### 5. Future-Proof ✅
- Extensible design
- Room for new features
- Backward compatible (via separate tools)

---

## Risks & Challenges

### 1. Increased Complexity
**Risk:** V2 is significantly more complex than V1
**Mitigation:**
- Start with simple scenarios
- Provide clear examples
- Keep V1 for simple cases

### 2. Code Generator Changes
**Risk:** Code generator needs major updates to support V2
**Mitigation:**
- Incremental implementation
- Start with subset of features
- Fallback to templates for unsupported features

### 3. AI Analysis Quality
**Risk:** AI might struggle with complex analysis
**Mitigation:**
- Provide excellent examples
- Clear validation with helpful errors
- Allow manual UI-Plan override

### 4. Maintenance Burden
**Risk:** Maintaining two systems (V1 + V2)
**Mitigation:**
- Clear deprecation timeline
- Automated tests for both
- Documentation updates

---

## Decision: Next Steps

### Recommended Path Forward

**Short Term (Current Release):**
1. ✅ Ship V1 as-is (it works for simple scenarios)
2. ✅ Document V2 design (this document)
3. ✅ Create prototype (prompt-analyzer-v2.ts)

**Medium Term (Next 1-2 Releases):**
1. Implement PlannerV2 with multi-entity support
2. Add MCP tools V2 (analyze_prompt_v2, create_ui_plan_from_analysis_v2)
3. Update documentation with V2 examples
4. Add tests for V2

**Long Term (3+ Releases):**
1. Update code generator for V2 features (custom actions, workflows, etc.)
2. Gather user feedback on V2
3. Deprecate V1 if V2 proves stable
4. Comprehensive migration guide

### Why This Approach?

1. **V1 is production-ready** - It works for 80% of use cases (simple CRUD)
2. **V2 is ambitious** - Needs more validation and testing
3. **Risk mitigation** - Parallel systems allow graceful migration
4. **User choice** - Simple projects use V1, complex projects use V2

---

## Conclusion

**V1 Strengths:**
- ✅ Simple and works
- ✅ Covers basic CRUD (80% of cases)
- ✅ Fully tested
- ✅ Production ready

**V1 Limitations:**
- ❌ Single entity only
- ❌ Fixed blade structure (list + details)
- ❌ Hardcoded routes, permissions, actions
- ❌ Limited features (6 total)
- ❌ No workflow support

**V2 Vision:**
- ✅ Multiple entities
- ✅ Flexible blade types (list, details, dashboard, wizard, custom)
- ✅ Custom routes, permissions, actions
- ✅ Extended features (40+ total)
- ✅ Workflow support
- ✅ Real-world complexity

**Recommendation:** Ship V1 now, iterate toward V2 incrementally.

---

**Document Created:** 2025-01-17
**Status:** 🚧 Design Complete, Implementation Pending
**Prototype:** [src/core/prompt-analyzer-v2.ts](../src/core/prompt-analyzer-v2.ts)
