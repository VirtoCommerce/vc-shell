---
title: Blade Navigation Composables
category: composables
group: blade-navigation
internal: true
---

# Blade Navigation Composables

The core composables that implement the blade navigation system -- the stacked-panel UI paradigm used throughout VirtoCommerce admin applications.

## Overview

Blade navigation manages an ordered stack of blade descriptors (plain data objects). Three composables divide responsibilities:

1. **useBladeStack** -- the state machine: open, close, replace blades in the stack.
2. **useBladeMessaging** -- inter-blade communication: parent-child method calls.
3. **useBladeNavigation** (adapter) -- legacy API adapter that maps the old index-based API onto the new ID-based stack and messaging systems.

## When to Use

- Build or extend the blade navigation infrastructure itself (plugin authors, framework internals)
- Need direct access to the blade stack state machine (`useBladeStack`) or inter-blade messaging (`useBladeMessaging`)
- When NOT to use: for everyday blade operations in modules -- prefer `useBlade()`, which wraps these low-level composables with a cleaner, context-aware API

<!-- internal:start -->

## Exports

```typescript
export { useBladeStack } from "@core/blade-navigation/useBladeStack";
export { useBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
export * from "@core/blade-navigation/types";
export { __registerBladeConfig, getBladeConfig, getAllBladeConfigs } from "@core/blade-navigation/bladeConfigRegistry";
export { useTableQueryState } from "@core/blade-navigation/table-query-state";
export type { UseTableQueryStateReturn, TableQueryPatch } from "@core/blade-navigation/table-query-state";
```

The `createBladeStack` / `createBladeMessaging` factories are internal (not re-exported); they are consumed directly by the framework rendering layer. `useBladeNavigation` is the adapter API documented below, which lives under `core/composables/useBladeNavigationAdapter/`, not in this package.

<!-- internal:end -->

## useBladeStack

The blade stack state machine. Manages an ordered array of `BladeDescriptor` objects.

### Factory: `createBladeStack(bladeRegistry, hasAccess?, urlSink?)`

Creates a new stack instance. Called once by the navigation plugin.

`urlSink` is where the stack writes the address bar. It defaults to a no-op, so a
stack created without one (Storybook, standalone mounts, unit tests) simply never
touches the URL. The plugin passes the router-backed sink.

### The stack owns the URL

Every navigation action syncs the URL itself, with the verb the action implies.
Callers mutate the stack and nothing else — there is no "and now sync the URL"
step to forget.

| Action                | Verb      | When                                   |
| --------------------- | --------- | -------------------------------------- |
| `openWorkspace`       | `push`    | the resulting active blade has a `url` |
| `openBlade`           | `push`    | the resulting active blade has a `url` |
| `coverCurrentBlade`   | `push`    | the resulting active blade has a `url` |
| `replaceCurrentBlade` | `replace` | the resulting active blade has a `url` |
| `closeBlade`          | `replace` | the close was not prevented by a guard |
| `closeChildren`       | `replace` | always                                 |

Everything else — `updateBladeQuery`, `setBladeTitle`, `setBladeError`,
`_restoreStack` — never writes the URL.

The router guard restores the stack **from** the URL, so it suppresses the sink
for the duration of the navigation (`RouterUrlSink.suppressWhile`): during
resolution the URL is the source, and writing back would re-enter the guard.

### API

| Method                                | Description                                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openWorkspace(event)`                | Sets the root blade (index 0). Closes all existing blades unconditionally.                                                                         |
| `openBlade(event)`                    | Opens a child blade after a parent. Closes any blades deeper than the parent (with guard checks).                                                  |
| `closeBlade(bladeId)`                 | Closes a blade and all its children. Returns `true` if a guard prevented closing.                                                                  |
| `closeChildren(parentId)`             | Closes all blades after the given parent.                                                                                                          |
| `replaceCurrentBlade(event)`          | Destroys the current active blade and creates a new one at the same stack index with the same `parentId`.                                          |
| `coverCurrentBlade(event)`            | Hides the current active blade (keeps it in the stack) and opens a new blade on top. Closing the covering blade restores the hidden blade.         |
| `registerBeforeClose(bladeId, guard)` | Registers a guard function. Return `true` from the guard to PREVENT closing.                                                                       |
| `unregisterBeforeClose(bladeId)`      | Removes a close guard.                                                                                                                             |
| `setBladeError(bladeId, error)`       | Sets an error on a blade descriptor (displayed as error banner).                                                                                   |
| `clearBladeError(bladeId)`            | Clears a blade's error.                                                                                                                            |
| `setBladeTitle(bladeId, title)`       | Updates the blade's title in the descriptor.                                                                                                       |
| `updateBladeQuery(bladeId, patch)`    | Merges `patch` into the blade descriptor's `query`; keys with empty-string or nullish values are removed. Backs table URL-query-state persistence. |

### Computed

| Property      | Type                                        | Description              |
| ------------- | ------------------------------------------- | ------------------------ |
| `workspace`   | `ComputedRef<BladeDescriptor \| undefined>` | The root blade (index 0) |
| `blades`      | `ComputedRef<readonly BladeDescriptor[]>`   | Full ordered stack       |
| `activeBlade` | `ComputedRef<BladeDescriptor \| undefined>` | The last visible blade   |

### Composable: `useBladeStack()`

Injects the stack from the component tree. Throws if used outside the navigation plugin.

## useBladeMessaging

Inter-blade communication via exposed methods.

### Factory: `createBladeMessaging(bladeStack)`

| Method                                     | Description                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `exposeToChildren(bladeId, methods)`       | Registers methods that child blades can call                              |
| `callParent(callerBladeId, method, args?)` | Calls a method on the caller's parent blade. Returns the method's result. |
| `cleanup(bladeId)`                         | Removes exposed methods for a blade (called on close).                    |

### Composable: `useBladeMessaging()`

Injects the messaging instance from the component tree.

## useBladeNavigation (Adapter)

The primary composable for module developers. Maps the legacy `IUseBladeNavigation` API onto the new stack/messaging system.

### Key Methods

```typescript
const {
  openBlade, // Open a child blade
  closeBlade, // Close by index (deprecated -- use useBlade().closeSelf())
  resolveBladeByName, // Look up a blade component by name
  onParentCall, // Call parent blade method (deprecated -- use useBlade().callParent())
  onBeforeClose, // Register close guard (deprecated -- use useBlade().onBeforeClose())
  blades, // Reactive blade array (shim objects)
  activeWorkspace, // Current workspace blade
} = useBladeNavigation();
```

### Opening a blade

```typescript
openBlade({
  blade: resolveBladeByName("OrderDetails"),
  param: orderId,
  options: { mode: "edit" },
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});
```

### Replacing the current blade (legacy adapter)

```typescript
// Legacy: replaceCurrentBlade flag maps to coverCurrentBlade (hide + stack)
openBlade({
  blade: resolveBladeByName("AlternateView"),
  replaceCurrentBlade: true,
});

// New API — prefer useBlade() methods:
// replaceWith() — true replacement (destroy old, create new at same index)
// coverWith()   — hide old, open new on top (closing new reveals old)
```

## BladeDescriptor

The plain data object stored in the stack for each blade:

| Field         | Type                       | Description                                                                |
| ------------- | -------------------------- | -------------------------------------------------------------------------- |
| `id`          | `string`                   | Unique instance ID (auto-generated)                                        |
| `name`        | `string`                   | Blade registration name                                                    |
| `url`         | `string?`                  | URL segment for address bar sync                                           |
| `param`       | `string?`                  | Parameter passed when opening (e.g., entity ID)                            |
| `query`       | `Record<string, string>?`  | Query parameters                                                           |
| `options`     | `Record<string, unknown>?` | Arbitrary options passed to the blade                                      |
| `parentId`    | `string?`                  | ID of the parent blade                                                     |
| `visible`     | `boolean`                  | Whether the blade is rendered (false when covered via `coverCurrentBlade`) |
| `error`       | `unknown?`                 | Error state for the error banner                                           |
| `title`       | `string?`                  | Dynamic title override                                                     |
| `maximized`   | `boolean?`                 | Whether this blade is maximized (fullscreen) — set by VcBladeSlot          |
| `breadcrumbs` | `Breadcrumbs[]?`           | Navigation breadcrumbs — set by VcBladeSlot                                |

## Tips

- Prefer `useBlade()` / `useBladeContext()` for new code -- they provide a cleaner API than the legacy adapter.
- Close guards return `true` to PREVENT closing (opposite of the legacy convention where `false` prevented closing). The adapter handles the inversion.
- `replaceCurrentBlade` destroys the current blade and creates a new one at the same index with the same `parentId`. Use `coverCurrentBlade` to hide instead of destroy — the covering blade's `callParent` reaches the hidden blade's exposed methods.
- URL sync only updates the address bar for blades that have a `url` segment. Third-level detail panels without URLs leave the previous URL intact.
- The stack writes the URL, not the caller. `createUrlSync` remains for the two writes that are not stack mutations: the post-restore reconcile in `VcBladeNavigation` and the debounced table-query-state writer.
- `useBladeNavigation()` requires the navigation plugin to be installed. It throws if called before plugin initialization.

## Related

- [`useBlade`](../composables/useBlade/) -- recommended API for everyday blade operations
- [`useBladeContext`](../composables/bladeContext/index.docs.md) -- share reactive blade data with descendant components

<!-- internal:start -->

- `framework/core/composables/useBlade/` -- `useBlade()`, `useBladeContext()` (new API)
- `framework/shell/_internal/blade-navigation/plugin-v2.ts` -- plugin that creates and provides the stack/messaging
- `framework/core/blade-navigation/types/index.ts` -- `BladeDescriptor`, `IBladeStack`, `IBladeMessaging`
<!-- internal:end -->
