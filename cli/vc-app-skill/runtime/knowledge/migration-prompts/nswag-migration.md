---
name: nswag-migration
description: AI transformation rules for NSwag class→interface DTO migration.
---

# NSwag API Client Migration: Class to Interface

You are tasked with fixing TypeScript errors caused by migrating NSwag-generated API clients from class-based to interface-based data models.

**Context:**
- API Client CLASSES (e.g., `*Client` classes) remain unchanged — they still have constructors
- DATA MODEL types (DTOs, Commands, Queries, etc.) are now INTERFACES instead of classes
- Interfaces cannot be instantiated with `new` — use object literals with type assertions instead

## RULE 1: Import Name Changes (Remove "I" Prefix)

**Error:** `error TS2724: has no exported member named 'IXxx'. Did you mean 'Xxx'?`

**Fix:** Remove the "I" prefix from all data model interface imports.

```typescript
// BEFORE
import { IOffer, ISeller, ISearchQuery } from "@your-api-package";

// AFTER
import { Offer, Seller, SearchQuery } from "@your-api-package";
```

Also update all type annotations in the file:

```typescript
// BEFORE
const item = ref<IOffer>(...);
function process(data: IOffer): IOffer { ... }

// AFTER
const item = ref<Offer>(...);
function process(data: Offer): Offer { ... }
```

## RULE 2: Class Instantiation → Object Literals

**Error:** `error TS2693: 'Xxx' only refers to a type, but is being used as a value here`

**Fix:** Replace `new TypeName({...})` with `{...} as TypeName` or typed variable declaration.

**Pattern A — Command/Query objects:**

```typescript
// BEFORE
const command = new CreateCommand({
  id: "123",
  name: "Test",
  details: new Details({ value: 100 }),
});

// AFTER
const command: CreateCommand = {
  id: "123",
  name: "Test",
  details: { value: 100 } as Details,
};
```

**Pattern B — Search/Query criteria:**

```typescript
// BEFORE
const criteria = new SearchQuery({
  take: 20,
  skip: 0,
  sort: "name:asc",
});

// AFTER
const criteria: SearchQuery = {
  take: 20,
  skip: 0,
  sort: "name:asc",
};
```

**Pattern C — Empty/default objects:**

```typescript
// BEFORE
const item = ref<IEntity>(new Entity());

// AFTER
const item = ref<Entity>({} as Entity);
```

**Pattern D — Nested objects:**

```typescript
// BEFORE
const data = ref(new Parent({ child: new Child() }));

// AFTER
const data = ref<Parent>({
  child: {} as Child,
} as Parent);
```

**Pattern E — With Vue reactive():**

```typescript
// BEFORE
const item = ref<Order>(reactive(new Order()));

// AFTER
const item = ref<Order>(reactive({} as Order));
```

## RULE 3: Factory Functions for Framework Callbacks

**Error:** `error TS2693: 'PropertyValue' only refers to a type, but is being used as a value here`

When a framework function expects a constructor function (callable with `new`), create factory functions:

```typescript
// BEFORE — Framework expects constructor
const { loadItems } = useFrameworkHook<Type1, Type2>(
  fetchFunction,
  ItemClass,
  OtherClass,
);

// AFTER — Create factory functions
const createItem = (data?: Partial<ItemType>): ItemType =>
  ({ ...data } as ItemType);

const createOther = (data?: Partial<OtherType>): OtherType =>
  ({ ...data } as OtherType);

const { loadItems } = useFrameworkHook<Type1, Type2>(
  fetchFunction,
  createItem,
  createOther,
);
```

## RULE 4: Image Import Conflict with Global DOM Type

**Error:** `error TS2866: Import 'Image' conflicts with global value used in this file`

**Fix:** Use type-only import or rename:

```typescript
// BEFORE
import { Image, Entity } from "@your-api-package";

// AFTER — Option 1: Type-only import
import { type Image, Entity } from "@your-api-package";

// AFTER — Option 2: Rename import
import { Image as ApiImage, Entity } from "@your-api-package";
```

## RULE 5: Implicit Any Types

**Error:** `error TS7006: Parameter 'x' implicitly has an 'any' type`

**Fix:** Add explicit type annotations to callback parameters:

```typescript
// BEFORE
items.map((x) => x.id)
items.filter((item) => item.active)
data.forEach((d) => process(d))

// AFTER
items.map((x: ItemType) => x.id)
items.filter((item: ItemType) => item.active)
data.forEach((d: DataType) => process(d))
```

## RULE 6: Type Mismatch in Function Arguments

**Error:** `error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'`

Check if the function signature expects a different type (often an ID instead of a full object):

```typescript
// BEFORE
someFunction(asset)  // asset is full object

// AFTER
someFunction(asset.id)  // pass the id property
```

## Important Notes

1. **API Client Classes are NOT affected** — Do NOT modify client classes like `*Client`. They remain classes with constructors:
   ```typescript
   const { getApiClient } = useApiClient(MyApiClient); // No change needed
   ```

2. **Spread operators work with interfaces:**
   ```typescript
   const updated = { ...existingItem, name: "New Name" }; // Works fine
   ```

3. **Required properties must be provided** when using type assertions:
   ```typescript
   const details: ItemDetails = {
     sku: item.sku || "",
     ...otherProps,
   };
   ```

4. **Generic type parameters need updating too:**
   ```typescript
   // BEFORE
   const { action } = useAsync<ISearchQuery>(...)

   // AFTER
   const { action } = useAsync<SearchQuery>(...)
   ```

5. **Interfaces with all optional properties** can use empty object:
   ```typescript
   const query: SearchQuery = {}; // OK if all properties are optional
   ```

6. **Interfaces with required properties** need those properties:
   ```typescript
   const item: Item = { id: "default" }; // Must provide 'id'
   ```

## Quick Reference Table

| Error Code | Pattern | Fix |
|------------|---------|-----|
| TS2724 | `IXxx` not found | Remove "I" prefix from import |
| TS2693 | Type used as value | Replace `new Type({})` with `{} as Type` |
| TS2866 | Import conflicts with global | Use `type` import or rename |
| TS7006 | Implicit any | Add explicit type annotation |
| TS2345 | Type not assignable | Check if property (like `.id`) should be passed |

## Verification

After making changes:

1. Run TypeScript compiler: `npx tsc --noEmit` or `npx vue-tsc --noEmit`
2. Verify no new errors were introduced
3. Build the project to ensure everything compiles
4. Test affected functionality if possible
