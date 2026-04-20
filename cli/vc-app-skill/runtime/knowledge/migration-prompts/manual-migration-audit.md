---
name: manual-migration-audit
description: AI transformation rules for findings emitted by manual-migration-audit transform.
---

# Manual Migration Audit Fixes

Apply targeted refactors for diagnostics emitted by `manual-migration-audit`.

## RULE 1: `useExternalWidgets` is removed

Replace `useExternalWidgets(...)` with module-level widget composables based on `useBladeWidgets()`.

**BEFORE:**

```typescript
import { useExternalWidgets } from "@vc-shell/framework";

useExternalWidgets({ bladeId, item });
```

**AFTER:**

```typescript
import { useEntityWidgets } from "../widgets";

useEntityWidgets({
  item,
  isVisible: computed(() => !!param.value),
  disabled,
});
```

If widget migration is not yet done, perform it first (`widgets-migration` topic).

## RULE 2: Replace `moment` usage with framework date utilities

**BEFORE:**

```typescript
import moment from "moment";

const formatted = moment(item.value.createdDate).format("L LT");
```

**AFTER:**

```typescript
import { formatDateWithPattern } from "@vc-shell/framework";

const formatted = formatDateWithPattern(item.value.createdDate, "L LT", currentLocale.value);
```

For relative dates, use `formatDateRelative` from `@vc-shell/framework`.

## RULE 3: Replace `useFunctions().debounce` with `useDebounceFn`

**BEFORE:**

```typescript
import { useFunctions } from "@vc-shell/framework";

const { debounce } = useFunctions();
const debouncedSearch = debounce(runSearch, 300);
```

**AFTER:**

```typescript
import { useDebounceFn } from "@vueuse/core";

const debouncedSearch = useDebounceFn(runSearch, 300);
```

## RULE 4: Replace `closeBlade()` with `closeSelf()` from `useBlade()`

**BEFORE:**

```typescript
const { closeBlade } = useBlade();
await closeBlade();
```

**AFTER:**

```typescript
const { closeSelf } = useBlade();
await closeSelf();
```

If `closeBlade(index)` was used to close by index, refactor to close current blade only (or use explicit navigation logic) — do not keep index-based close calls.

## RULE 5: Consolidate multiple `useBlade()` calls per file

Use one `useBlade()` destructuring per component/composable unless there is a strong technical reason.

**BEFORE:**

```typescript
const { openBlade } = useBlade();
const { closeSelf } = useBlade();
```

**AFTER:**

```typescript
const { openBlade, closeSelf, callParent, param } = useBlade();
```

## Verification

After migration:

1. Search and remove stale APIs: `useExternalWidgets`, `import moment`, `useFunctions(`, `closeBlade(`.
2. Search for duplicate `useBlade()` calls in the same file and consolidate.
3. Run `npx vue-tsc --noEmit`.
4. Run `yarn build`.
