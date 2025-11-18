# Fix: "undefined" Entity in AI-Guided Generation Task Description

## Date: 2025-11-18

## Problem

When using AI-guided generation strategy, the task description showed:
```
"task": "Generate a list blade with VcTable for undefined"
```

Instead of:
```
"task": "Generate a list blade with VcTable for product"
```

The entity name was showing as `undefined` instead of the actual entity name.

---

## Root Cause

### Interface Inconsistency

There were **THREE different** `BladeGenerationContext` interfaces across the codebase with **inconsistent field definitions**:

#### 1. ai-code-generator.ts (INCOMPLETE - Missing fields)
```typescript
export interface BladeGenerationContext {
  type: "list" | "details";
  naming: NamingConfig;
  blade: UIPlanBlade;
  // ❌ MISSING: entity field
  // ❌ MISSING: module field
  columns?: Column[];
  fields?: Field[];
  componentName: string;
  composableName: string;
  route: string;
  isWorkspace?: boolean;
  menuTitleKey: string;
  features: string[];
  logic?: BladeLogic;
  composableDefinition?: ComposableDefinition;
}
```

#### 2. unified-generator.ts (PARTIAL - Optional fields)
Located in return statement (lines 742-757):
```typescript
return {
  blade,
  type,
  entity: entitySingularKebab,  // ✅ Field exists
  module: moduleNaming.moduleName,  // ✅ Field exists
  naming,
  componentName,
  composableName,
  route,
  isWorkspace,
  menuTitleKey,
  features,
  columns,
  fields,
  logic,
  composableDefinition,
};
```

#### 3. ai-generation-guide-builder.ts (REQUIRED - Expected fields)
Located at line 97:
```typescript
task: isListBlade
  ? `Generate a list blade with VcTable for ${context.entity}`  // ✅ Expects entity
  : `Generate a details blade with VcForm for ${context.entity}`,  // ✅ Expects entity
```

### The Issue
- `unified-generator.ts` **provides** `entity` and `module` in the returned object
- `ai-generation-guide-builder.ts` **expects** `context.entity` to exist
- `ai-code-generator.ts` interface **doesn't define** these fields
- Result: TypeScript doesn't catch the issue, runtime shows `undefined`

---

## Solution

### 1. Update BladeGenerationContext Interface

**File:** `src/core/ai-code-generator.ts` (lines 7-23)

**Added missing fields:**
```typescript
export interface BladeGenerationContext {
  type: "list" | "details";
  naming: NamingConfig;
  blade: UIPlanBlade;
  entity: string;  // ✅ ADDED - Entity name (e.g., "offer", "vendor")
  module: string;  // ✅ ADDED - Module name (e.g., "offers", "vendors")
  columns?: Column[];
  fields?: Field[];
  componentName: string;
  composableName: string;
  route: string;
  isWorkspace?: boolean;
  menuTitleKey: string;
  features: string[];
  logic?: BladeLogic;
  composableDefinition?: ComposableDefinition;
}
```

### 2. Update Test Files

#### smart-generator.spec.ts
**File:** `src/__tests__/smart-generator.spec.ts` (lines 55-59)

**Updated createContext helper:**
```typescript
function createContext(
  type: "list" | "details",
  features: string[] = [],
  extras: Partial<BladeGenerationContext> = {},
): BladeGenerationContext {
  return {
    type,
    naming: createNaming("products"),
    entity: "product",  // ✅ ADDED
    module: "products", // ✅ ADDED
    features,
    blade: {
      id: type === "list" ? "products-list" : "product-details",
      layout: type === "list" ? "grid" : "details",
      components: [],
    },
    componentName: "ProductsList",
    composableName: "useProducts",
    route: "/products",
    menuTitleKey: "PRODUCTS.MENU_TITLE",
    ...extras,
  };
}
```

#### blade-composer.spec.ts
**File:** `src/__tests__/blade-composer.spec.ts`

**Added to all test contexts using replace_all:**
```typescript
const context: BladeGenerationContext = {
  type: "list",
  naming: { /* ... */ },
  entity: "product",  // ✅ ADDED to ALL contexts
  module: "products", // ✅ ADDED to ALL contexts
  features: [],
  blade: { /* ... */ },
  // ...
};
```

**Total contexts updated:** 11 test contexts across the file

---

## Verification

### Before Fix
```
"task": "Generate a list blade with VcTable for undefined"
```

### After Fix
```
"task": "Generate a list blade with VcTable for product"
```

### Test Results
```
✓ 397 tests passed (all test files)
✓ Build successful
✓ No TypeScript errors
```

---

## Files Modified

1. **src/core/ai-code-generator.ts** (lines 7-23)
   - Added `entity: string` field to BladeGenerationContext
   - Added `module: string` field to BladeGenerationContext

2. **src/__tests__/smart-generator.spec.ts** (lines 55-79)
   - Added `entity` and `module` to createContext helper

3. **src/__tests__/blade-composer.spec.ts** (multiple locations)
   - Added `entity: "product"` to all 11 test contexts
   - Added `module: "products"` to all 11 test contexts

---

## Impact

### Before
- AI-guided generation showed confusing "undefined" in task descriptions
- Interface inconsistency across three files
- No compile-time type safety for entity/module fields

### After
- ✅ Clear task descriptions: "Generate a list blade with VcTable for product"
- ✅ Consistent interface across all files
- ✅ Type-safe access to entity and module fields
- ✅ All 397 tests passing

---

## Related Documentation

This fix is part of the larger v0.7.5 update which includes:
- Framework API patterns corrections (PHASE_3_CORRECTIONS.md)
- MCP scaffold_app tool improvements (MCP_SCAFFOLD_APP_FIX.md)
- .cursorrules global update (CURSORRULES_UPDATE_SUMMARY.md)

---

## Status: ✅ FIXED

**Version:** 0.7.5
**Date:** 2025-11-18
**Tests:** 397/397 passing
**Build:** Successful
