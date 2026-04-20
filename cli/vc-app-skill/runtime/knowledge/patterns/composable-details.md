# Details Composable Pattern (`use<Entity>`)

Generic worked example for the canonical `useTeamMember` / `useEntity` composable shape.

## Overview

The singular details composable (`use<Entity>`) handles CRUD operations for a single entity instance. It owns the modification tracking state — the blade reads `entity`, `loading`, `modified` and calls CRUD methods, but does NOT manage modification state itself.

Naming convention: `use<Entity>` (singular) for details, `use<Entity>s` (plural) for list.

---

## Full Code Skeleton

```ts
import {
  useModificationTracker,
  useApiClient,
  useAsync,
  useLoading,
} from "@vc-shell/framework";
import type { AsyncAction } from "@vc-shell/framework";
import {
  XxxClient,
  XxxType,
  CreateXxxCommand,
  UpdateXxxCommand,
} from "../../api_client/xxx-client";
import { computed, ComputedRef, Ref, ref } from "vue";

// NOTE: useI18n is NOT imported here. Translations belong in blade components.

// --- Return type interface ---
interface IUseXxx {
  loading: ComputedRef<boolean>;
  entity: Ref<XxxType>;
  modified: ComputedRef<boolean>;
  getXxx: AsyncAction<{ id: string }, void>;
  createXxx: AsyncAction<XxxType, void>;
  updateXxx: AsyncAction<XxxType, void>;
  deleteXxx: AsyncAction<{ id: string }, void>;
  resetEntries: () => void;
  resetModificationState: (value?: XxxType) => void;
}

export default (): IUseXxx => {
  // --- API client ---
  const { getApiClient } = useApiClient(XxxClient);

  // --- Entity ref and modification tracker ---
  // entityRef is internal; currentValue is exposed as `entity`
  const entityRef = ref({} as XxxType) as Ref<XxxType>;
  const { currentValue, pristineValue, resetModificationState, isModified } =
    useModificationTracker(entityRef);

  // --- CRUD operations (each has its own loading ref) ---

  const { action: getXxx, loading: getXxxLoading } = useAsync<
    { id: string },
    void
  >(async (args) => {
    if (!args?.id) {
      throw new Error("Id is required");
    }

    const client = await getApiClient();
    const result = await client.getXxx(args.id);

    if (result) {
      currentValue.value = result;
    }

    // Always reset modification state after fetch — establishes the pristine baseline
    resetModificationState();
  });

  const { action: createXxx, loading: createXxxLoading } = useAsync<
    XxxType,
    void
  >(async (details) => {
    const client = await getApiClient();

    const command = {
      // Map entity fields to command fields
      // Example:
      // name: details.name,
      // status: details.status,
      ...details,
    } as CreateXxxCommand;

    await client.createXxx(command);

    resetModificationState();
  });

  const { action: updateXxx, loading: updateXxxLoading } = useAsync<
    XxxType,
    void
  >(async (details) => {
    if (!details?.id) {
      throw new Error("Id is required");
    }

    const client = await getApiClient();

    const command = {
      // Map entity fields to command fields
      // Example:
      // xxxId: details.id,
      // userDetails: { ...details } as XxxDetails,
      ...details,
    } as UpdateXxxCommand;

    await client.updateXxx(command);

    resetModificationState();
  });

  const { action: deleteXxx, loading: deleteXxxLoading } = useAsync<
    { id: string },
    void
  >(async (args) => {
    if (!args?.id) {
      throw new Error("Id is required");
    }

    const client = await getApiClient();
    await client.deleteXxx([args.id]);
  });

  // --- Reset to last saved state ---
  // Restores entity to the pristine (last-saved) value.
  // Called by the Reset toolbar button in the blade.
  function resetEntries() {
    resetModificationState(pristineValue.value);
  }

  // --- Return ---
  return {
    // Aggregate all async loading refs into a single computed boolean
    loading: useLoading(
      getXxxLoading,
      createXxxLoading,
      updateXxxLoading,
      deleteXxxLoading,
    ),
    // currentValue is the reactive entity — alias as `entity` for the blade
    entity: currentValue,
    modified: computed(() => isModified.value),
    getXxx,
    createXxx,
    updateXxx,
    deleteXxx,
    resetEntries,
    // Expose resetModificationState so the blade can call it after
    // pre-filling a new entity from options (e.g., pre-selected product)
    resetModificationState,
  };
};
```

---

## Module Barrel (`composables/index.ts`)

```ts
export { default as useXxx } from "./useXxx";
```

---

## Key Design Rules

### 1. Modification tracking lives in the composable

`useModificationTracker` is called here, not in the blade. The blade only reads `modified` (a computed) and calls `resetEntries()` or `resetModificationState()`.

- `currentValue` — the reactive entity ref, mutations are tracked automatically
- `pristineValue` — snapshot of the last `resetModificationState()` call (i.e., last saved state)
- `isModified` — true when `currentValue` diverges from `pristineValue`

### 2. Always call `resetModificationState()` after fetch and after save/update

```ts
// After fetch: establishes the loaded data as the pristine baseline
currentValue.value = result;
resetModificationState();

// After create/update: marks the just-saved state as the new baseline
await client.updateXxx(command);
resetModificationState();
```

### 3. `resetEntries()` restores to pristine

```ts
function resetEntries() {
  resetModificationState(pristineValue.value);
}
```

This is called by the Reset toolbar button. It passes `pristineValue.value` to `resetModificationState`, which sets `currentValue` back to the last-saved snapshot.

### 4. Separate `useAsync` per operation — separate loading refs

Each operation has its own `loading` ref so the blade's loading state is granular. All are combined with `useLoading(...)` into a single `loading: ComputedRef<boolean>` for the blade's `:loading` prop.

```ts
loading: useLoading(
  getXxxLoading,
  createXxxLoading,
  updateXxxLoading,
  deleteXxxLoading,
),
```

### 5. `useI18n` is NOT used in composables

Translations belong in blade components. Composables throw plain `Error` messages (for developer-facing errors), not localized strings. User-facing errors are handled in the blade via `showError(t(...))`.

### 6. Expose `resetModificationState` in the return value

The blade needs to call this directly in edge cases, e.g., when a new entity is pre-filled from `options` before `onMounted` fetch:

```ts
// In blade onMounted:
if (!param.value && options.value?.selectedProduct) {
  entity.value.productId = options.value.selectedProduct.id;
  resetModificationState(); // baseline the pre-fill so it's not treated as a modification
}
```

---

## Variant: Get-only composable (details/settings, no create/delete)

For read-only or settings-style details that only need fetch + update:

```ts
interface IUseXxx {
  loading: ComputedRef<boolean>;
  entity: Ref<XxxType>;
  modified: ComputedRef<boolean>;
  getXxx: AsyncAction<{ id: string }, void>;
  updateXxx: AsyncAction<XxxType, void>;
  resetEntries: () => void;
  resetModificationState: (value?: XxxType) => void;
}

export default (): IUseXxx => {
  // ... same pattern, omit createXxx and deleteXxx
  return {
    loading: useLoading(getXxxLoading, updateXxxLoading),
    entity: currentValue,
    modified: computed(() => isModified.value),
    getXxx,
    updateXxx,
    resetEntries,
    resetModificationState,
  };
};
```

---

## Route Params (when entity scope requires a parent ownerId / tenantId)

Some API calls require a scope parameter (e.g., `ownerId`) extracted from the route. Use `useRoute()`:

```ts
import { useRoute } from "vue-router";

export default (): IUseXxx => {
  const route = useRoute();
  const { getApiClient } = useApiClient(XxxClient);

  async function getOwnerId(): Promise<string> {
    return route?.params?.ownerId as string;
  }

  const { action: getXxx, loading: getXxxLoading } = useAsync<{ id: string }>(
    async (args) => {
      const client = await getApiClient();
      const ownerId = await getOwnerId();

      const result = await client.getXxx(args.id, ownerId);
      currentValue.value = result;
      resetModificationState();
    },
  );

  // ...
};
```
