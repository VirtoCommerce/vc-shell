# Reference Examples

**SINGLE SOURCE OF TRUTH** for VC-Shell code generation patterns.

## Purpose

This folder contains the **authoritative** examples that should be used for all code generation.
These are production-ready, well-documented templates that follow all best practices.

## Files

| File | Description | Used For |
|------|-------------|----------|
| `api-client.ts` | API client with AuthApiBase | API client generation |
| `composable-list.ts` | List composable with useAsync | List composable generation |
| `composable-details.ts` | Details composable with useModificationTracker | Details composable generation |
| `blade-list.vue` | List blade with VcTable | List blade generation |
| `blade-details.vue` | Details blade with VcForm | Details blade generation |

## Key Patterns

### 1. useAsync Generic Type (CRITICAL!)

```typescript
// ❌ WRONG - TypeScript thinks params is always defined
const { action } = useAsync(async (params: SearchQuery) => { ... });

// ✅ CORRECT - Generic type + guard
const { action } = useAsync<SearchQuery>(async (params) => {
  if (!params) return;  // Guard required!
  ...
});
```

### 2. useModificationTracker

```typescript
const item = ref<IEntity>(reactive({} as IEntity));
const { currentValue, isModified, resetModificationState } = useModificationTracker(item);

// IMPORTANT: Return currentValue, NOT item!
return { item: currentValue, isModified, resetModificationState };
```

### 3. AuthApiBase Inheritance

```typescript
export class ProductClient extends AuthApiBase {
  constructor(_baseUrl?: string, _http?: { fetch: typeof fetch }) {
    super();  // Required!
  }
}
```

### 4. defineOptions for Workspace Blades

```typescript
defineOptions({
  name: "ProductList",
  url: "/products",
  isWorkspace: true,
  menuItem: {
    title: "PRODUCTS.MENU.TITLE",
    icon: "material-inventory",
    priority: 10,
  },
  // ⚠️ DO NOT add permissions unless explicitly requested!
});
```

### 5. Blade Navigation (NO markRaw!)

```typescript
// ✅ CORRECT - Direct component reference
openBlade({ blade: ProductDetails, param: item.id });

// ❌ WRONG - markRaw is not needed
openBlade({ blade: markRaw(ProductDetails), param: item.id });
```

## Usage by AI

When generating code, the AI should:

1. **Read the appropriate reference file** for the artifact type
2. **Follow the patterns exactly** - don't deviate
3. **Adapt entity/module names** but keep the structure
4. **Include all comments and documentation**

## Maintenance

These files should be:

- Updated when framework patterns change
- Kept in sync with create-vc-app templates
- Tested before committing changes
- Reviewed for best practices compliance
