# Module Generation Workflow

## Overview

VC-Shell uses a **two-step generation process**:

```
User Prompt → UI-Plan JSON → Vue SFC Code → Working Module
```

## Step 1: UI-Plan Generation (MANDATORY FIRST)

### What is UI-Plan?

JSON structure describing module architecture:
- Module name
- Blade definitions (list, details)
- Component types
- Fields and columns
- Routes and permissions

### Workflow

```
1. User: "Create vendor management"

2. AI: Parse requirements
   - Module: vendor-management
   - Blades: list + details
   - Fields: name, email, phone, status

3. AI: Generate UI-Plan JSON
   {
     "module": "vendor-management",
     "blades": [
       {
         "id": "vendors-list",
         "route": "/vendors",
         "layout": "grid",
         "isWorkspace": true,
         ...
       },
       {
         "id": "vendor-details",
         "route": "/vendor",
         "layout": "details",
         ...
       }
     ]
   }

4. AI: Validate with validate_ui_plan tool

5. AI: Save to __ai/ui-plan-vendor-management.json

6. AI: Show to user: "Plan created. Review?"

7. WAIT for confirmation

8. User: "Looks good"

9. Proceed to Step 2
```

### Critical: DO NOT Skip

🚨 **FORBIDDEN before plan:**
- Creating .vue files
- Creating composables
- Creating locales
- Editing main.ts
- ANY file operations

## Step 2: Code Generation from Plan

### Read Plan First

```typescript
// ALWAYS start by reading the plan
const plan = JSON.parse(readFile('__ai/ui-plan-vendor-management.json'));

// Process each blade
for (const blade of plan.blades) {
  if (blade.layout === "grid") {
    // Generate list blade
  } else if (blade.layout === "details") {
    // Generate details blade
  }
}
```

### Generation Options

**A) Use Templates** (for standard cases):
```typescript
get_blade_template({
  type: "list",
  complexity: "filters"
})
// Returns: list-filters.vue (330 lines ready code)
```

**B) Use Compositions** (for custom layouts):
```
Combine patterns from compositions/:
- list-basic.md (structure)
- list-with-filters.md (filters slot)
- custom-column-slots.md (custom rendering)
```

### Generated Files

```
src/modules/vendor-management/
├── pages/
│   ├── index.ts
│   ├── vendors-list.vue       # List blade
│   └── vendor-details.vue     # Details blade
├── composables/
│   ├── useVendorList.ts
│   └── useVendorDetails.ts
├── locales/
│   ├── en.json
│   └── index.ts               # export { en }
└── index.ts                   # createAppModule
```

### Register Module

Automatically edit `src/main.ts`:
```typescript
import VendorManagementModule from "./modules/vendor-management";

app.use(VendorManagementModule, { router })
```

## Common Issues

### Issue: AI creates files before plan
**Solution**: Strengthen Step 1 prohibitions in .cursorrules

### Issue: Plan not used for generation
**Solution**: Explicitly read plan at Step 2 start

### Issue: Wrong URLs
**Solution**: Use toSingular() for details blades

## Success Criteria

✅ Plan created and saved to __ai/
✅ Plan validated with no errors
✅ User confirms plan
✅ Code generated from plan data
✅ Correct URLs (plural/singular)
✅ Correct file names (-list, -details)
✅ isWorkspace and menuItem correct
✅ Module registered in main.ts

## See Also

- [UI-Plan Schema](../src/schemas/ui-plan.v1.schema.json)
- [Component Registry](../src/schemas/component-registry.json)
- [.cursorrules](../.cursorrules) - Full generation rules

