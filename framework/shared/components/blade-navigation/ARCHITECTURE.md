# Blade Navigation — Architectural Overview

> Last updated: 2026-02-14 (post-audit)

## 1. Core Concept

Blade navigation is the primary UI paradigm of vc-shell, inspired by Azure Portal.
Blades are stacked panels that open left-to-right. Each blade represents a unit of
work (list, detail form, settings). Users drill down by opening child blades and
return by closing them.

```
+-------------+  +-----------------+  +------------------+
|  Workspace  |  |  Child Blade    |  |  Grandchild      |
|  (Orders)   |→ |  (OrderDetails) |→ |  (LineItem)      |
|             |  |                 |  |                  |
|  List view  |  |  Entity form    |  |  Sub-entity      |
+-------------+  +-----------------+  +------------------+
     [0]               [1]                   [2]
```

Key properties:
- **Workspace** — the leftmost blade (index 0), always visible, acts as a "home" for a module.
- **Child blades** — opened by workspace or by another child. Closable.
- **Stack order** — blades form a linear stack. Closing blade N also closes N+1, N+2, etc.
- **Active blade** — the rightmost visible blade. Receives keyboard focus and expanded styling.

## 2. Architecture Layers

The system is organized into four layers:

```
┌──────────────────────────────────────────────────────────────┐
│                    Consumer API Layer                         │
│  useBladeContext()  ·  useBladeNavigation() (legacy adapter) │
└────────────────────────────┬─────────────────────────────────┘
                             │ inject()
┌────────────────────────────┴─────────────────────────────────┐
│                    State Machine Layer                        │
│  BladeStack  ·  BladeMessaging  ·  BladeRegistry             │
└────────────────────────────┬─────────────────────────────────┘
                             │ provide()
┌────────────────────────────┴─────────────────────────────────┐
│                    Render Layer                               │
│  VcBladeNavigation  ·  VcBladeSlot  ·  VcBlade               │
└────────────────────────────┬─────────────────────────────────┘
                             │ router guard
┌────────────────────────────┴─────────────────────────────────┐
│                    URL Sync Layer                             │
│  plugin-v2 router guard  ·  urlSync.ts  ·  restoreFromUrl.ts │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 State Machine Layer

#### BladeStack (`composables/useBladeStack.ts`)

The central state machine. Owns the canonical blade state as a reactive array of
`BladeDescriptor` objects (plain data, no VNode mutation).

```typescript
interface BladeDescriptor {
  id: string;           // Unique per open instance (generated at open time)
  name: string;         // Registered component name (e.g. "OrderDetails")
  url?: string;         // URL segment (e.g. "/order")
  param?: string;       // Entity ID
  query?: Record<string, string>;
  options?: Record<string, unknown>;  // Large context (not in URL)
  parentId?: string;    // ID of blade that opened this one
  visible: boolean;     // false for hidden blades (replaceCurrentBlade)
  error?: unknown;
  title?: string;
}
```

Operations:
| Method | Behavior |
|--------|----------|
| `openWorkspace(event)` | Clears stack, sets workspace at index 0 |
| `openBlade(event)` | Appends child blade to stack |
| `closeBlade(bladeId)` | Runs guard, removes blade + descendants |
| `replaceCurrentBlade(event)` | Hides current blade, appends replacement |
| `registerBeforeClose(id, guard)` | Registers close guard (return `true` = prevent) |
| `_restoreStack(descriptors)` | Bulk restore (URL restoration, bypasses guards) |

Invariants:
- Stack is **immutable** — every mutation creates a new array.
- `_blades` is a `Ref<BladeDescriptor[]>`; watchers see each change.
- `workspace` = `blades[0]`, `activeBlade` = last visible blade.
- IDs are monotonically increasing (`blade_1`, `blade_2`, ...).

#### BladeMessaging (`composables/useBladeMessaging.ts`)

Inter-blade RPC. Allows parent blades to expose methods that child blades can call.

```
Parent (Workspace)                    Child (OrderDetails)
───────────────────                   ────────────────────
exposeToChildren(wsId, {              callParent(childId, "reload")
  reload: () => fetchOrders(),          → finds parent via parentId
  delete: (id) => deleteOrder(id),      → calls parent's "reload" method
})                                      → returns result
```

Implementation: `Map<bladeId, Record<methodName, Function>>`.
Cleanup: `messaging.cleanup(bladeId)` called in VcBladeSlot's `onBeforeUnmount`.

#### BladeRegistry (`core/composables/useBladeRegistry/index.ts`)

Global registry mapping blade names → component + metadata.

```typescript
interface IBladeRegistrationData {
  component: BladeInstanceConstructor;
  route?: string;        // URL segment (e.g. "/orders")
  isWorkspace?: boolean;
  routable?: boolean;    // false = don't restore from URL
}
```

Features:
- **Global component registration**: `app.component(name, component)` on every `registerBlade`.
- **Reverse URL index**: `getBladeByRoute(route)` — O(1) lookup by normalized route segment.
- **Duplicate detection**: Throws on duplicate name by default (`allowOverwrite` opt-in for HMR).

### 2.2 Consumer API Layer

#### `useBladeContext()` — New API (`core/composables/useBlade/index.ts`)

Preferred API for blade components. Uses provide/inject — only works inside VcBladeSlot.

```typescript
const {
  // Identity (readonly computed)
  id, param, options, query, closable, expanded,
  // Actions
  openBlade, closeSelf, replaceWith,
  // Communication
  callParent, exposeToChildren,
  // Guards & errors
  onBeforeClose, setError, clearError,
} = useBladeContext();
```

Key design: `openBlade` auto-sets `parentId` from the current blade's descriptor.
No index arithmetic — the blade knows its own identity.

#### `useBladeNavigation()` — Legacy Adapter (`composables/useBladeNavigationAdapter.ts`)

Drop-in replacement that maps the old index-based API onto BladeStack:

```
Legacy call                          → BladeStack equivalent
─────────────────────────────────    ─────────────────────────────
openBlade({ blade: OrderDetails })   → bladeStack.openBlade({ name: "OrderDetails" })
closeBlade(2)                        → bladeStack.closeBlade(getBladeIdByIndex(2))
onParentCall(args, idx)              → messaging.callParent(callerId, method, args)
onBeforeClose(cb)                    → bladeStack.registerBeforeClose(id, invertedGuard)
```

**Guard boolean inversion**: Legacy returns `false` to prevent close; new API returns
`true` to prevent. The adapter inverts the result.

Returns `BladeVNode[]` shims (via `descriptorToShim()`) for consumers that read
`blades.value[i].props.navigation.idx`.

### 2.3 Render Layer

#### VcBladeNavigation (`components/vc-blade-navigation/vc-blade-navigation-new.vue`)

Top-level container. Renders `<VcBladeSlot>` for each `BladeDescriptor` in the stack.

Responsibilities:
- Iterates `bladeStack.blades` with `v-for` (keyed by `descriptor.id`).
- Passes `expanded`, `closable`, `visible` as props to each VcBladeSlot.
- Computes breadcrumbs from blade titles.
- Handles mobile back button.
- Emits `close` / `parentCall` events upward.
- Calls `syncUrlReplace()` on blade close.

#### VcBladeSlot (`components/vc-blade-slot/vc-blade-slot.vue`)

Per-blade wrapper. The bridge between BladeDescriptor (data) and the actual Vue component.

Responsibilities:
- **Component resolution**: `bladeRegistry.getBladeComponent(descriptor.name)` → dynamic `<component :is="...">`.
- **Injection**: `provide(BladeDescriptorKey, computed(() => descriptor))` — consumed by `useBladeContext()`.
- **Instance bridging**: Watches the component's exposed `{ title, reload, ... }` and auto-registers with BladeMessaging.
- **Title sync**: `watchEffect` reads `bladeInstanceRef.value?.title` → `bladeStack.setBladeTitle(id, title)`.
- **Cleanup**: `onBeforeUnmount` calls `messaging.cleanup(descriptor.id)`.
- **Legacy compat**: Provides `BladeInstance` injection key with `IBladeInstance` shape.

#### VcBlade (`ui/components/organisms/vc-blade/vc-blade.vue`)

Pure presentational component. Renders blade chrome: header, toolbar, content slot, widget container.
No business logic — receives everything via props and slots.

### 2.4 URL Sync Layer

Vue Router is used **only for URL synchronization**. BladeStack is the source of truth.

```
BladeStack ──(push/replace)──→ URL bar
URL bar ──(router guard)──→ restoreFromUrl() ──→ BladeStack
```

#### URL Format

```
/#/<tenantPrefix>/<workspaceUrl>/<bladeUrl>/<param>?query=value

Examples:
  /#/orders                         → workspace: Orders
  /#/orders/order/uuid-123          → workspace: Orders, child: OrderDetails(uuid-123)
  /#/seller-1/orders/order/uuid-123 → tenant: seller-1, same blades
```

Limitation: only 1 level of child blade nesting in the URL. Deeper blades (3+) don't
change the URL — the previous blade's URL stays.

#### Flow: Blade Open → URL Push

```
1. Consumer calls openBlade({ name: "OrderDetails", param: "123" })
2. BladeStack appends descriptor to _blades
3. Adapter calls syncUrlPush()
4. syncUrlPush() → buildUrlFromStack(tenant, blades) → router.push({ path, query })
5. Router guard fires (beforeEach)
6. restoreFromUrl() sees blade already in stack (idempotency check) → no-op
```

#### Flow: Direct URL Entry (Page Load / Deep Link)

```
1. User navigates to /#/orders/order/uuid-123
2. Router guard fires (beforeEach)
3. parseBladeUrl("/orders/order/uuid-123") → { workspaceUrl: "orders", bladeUrl: "order", param: "uuid-123" }
4. restoreFromUrl():
   a. bladeRegistry.getBladeByRoute("orders") → { name: "Orders", isWorkspace: true }
   b. bladeStack.openWorkspace({ name: "Orders" })
   c. bladeRegistry.getBladeByRoute("order") → { name: "OrderDetails" }
   d. bladeStack.openBlade({ name: "OrderDetails", param: "uuid-123" })
5. VcBladeNavigation reactively renders the new blades
```

#### Key Utilities (`utils/urlSync.ts`)

| Function | Purpose |
|----------|---------|
| `buildUrlFromStack(tenant, blades)` | Stack → `{ path, query }` |
| `parseBladeUrl(path, tenant?)` | Path → `{ workspaceUrl, bladeUrl, param }` |
| `getTenantPrefix(router)` | Extract tenant from current route params |
| `createUrlSync(router, bladeStack)` | Factory returning `syncUrlPush` / `syncUrlReplace` |

## 3. Module Registration

Blades are registered during module installation via `createAppModule()` in
`core/plugins/modularity/index.ts`.

```typescript
// Module definition (e.g. in orders module)
export default createAppModule(
  { OrderList, OrderDetails },           // pages (blade components)
  { en: enLocale, de: deLocale },        // locales
  { OrderNotification },                 // notification templates
  { OrderBadge },                        // module components
  { dependsOn: ["ProductDetails"] },     // module options
);
```

Registration flow:
```
1. app.use(ordersModule, { router })
2. createAppModule.install():
   a. Validates dependsOn (checks bladeRegistry for each dependency)
   b. For each page component:
      - Reads defineOptions() metadata: name, url, isWorkspace, routable, menuItem
      - Calls bladeRegistry._registerBladeFn(name, { component, route, isWorkspace, routable })
      - Registers menuItem if present
   c. Merges locales via i18n.global.mergeLocaleMessage()
   d. Registers notification templates
```

Blade components declare their metadata via `defineOptions()`:
```typescript
defineOptions({
  name: "OrderDetails",
  url: "/order",
  isWorkspace: false,
  routable: true,
});
```

## 4. Injection Key Chain

```
App (plugin-v2 install)
├── provide(BladeStackKey, bladeStack)
├── provide(BladeMessagingKey, messaging)
│
└── VcBladeNavigation
    └── VcBladeSlot (per blade)
        ├── provide(BladeDescriptorKey, computed(() => descriptor))
        ├── provide(BladeInstance, { id, expandable, maximized, ... })
        ├── provide(BLADE_BACK_BUTTON, backButton)
        │
        └── <BladeComponent>   ← user's blade component
            ├── useBladeContext()    → inject(BladeDescriptorKey, BladeStackKey, BladeMessagingKey)
            └── useBlade()          → inject(BladeInstance)  [legacy]
```

## 5. replaceCurrentBlade — Hide-Don't-Destroy Pattern

When replacing a blade, the original is hidden (not destroyed):

```
Before:  [Workspace] → [OrderDetails(visible)]
After:   [Workspace] → [OrderDetails(hidden)] → [ProductDetails(visible)]
```

Why: The replacement blade can `callParent()` to reach the hidden blade's exposed methods.
This is critical for scenarios like: OrderDetails opens EditOrder as replacement,
EditOrder calls `callParent("reload")` which reaches OrderDetails.reload().

Trade-off: Stack grows by 1 for each replace. In chains (A→B→C→D), stack size = N+1
where N is the chain length. Closing the replacement also cleans up the hidden blade.

## 6. Guard System

Blades can register before-close guards to prevent accidental data loss:

```typescript
// In a blade component (new API)
const { onBeforeClose } = useBladeContext();
onBeforeClose(async () => {
  if (hasUnsavedChanges.value) {
    return true;  // PREVENT close
  }
  return false;   // ALLOW close
});
```

Guard evaluation:
1. `closeBlade(id)` collects all blades to close (target + descendants).
2. Calls each blade's guard in order.
3. If ANY guard returns `true` → close is prevented, no blades are removed.
4. Guards are unregistered on blade removal (`_cleanupBlade`).

**Boolean convention (new API)**: `true` = prevent, `false` = allow.
**Boolean convention (legacy)**: `false` = prevent, `undefined`/`true` = allow.
The adapter inverts the result.

## 7. File Map

```
blade-navigation/
├── ARCHITECTURE.md              ← this file
├── MIGRATION.md                 ← legacy → useBladeContext() migration guide
├── types/index.ts               ← BladeDescriptor, IBladeStack, IBladeMessaging, injection keys
├── plugin-v2.ts                 ← Vue plugin: creates singletons, installs router guard
│
├── composables/
│   ├── useBladeStack.ts         ← BladeStack state machine (createBladeStack)
│   ├── useBladeStack.test.ts
│   ├── useBladeMessaging.ts     ← Inter-blade RPC (createBladeMessaging)
│   ├── useBladeMessaging.test.ts
│   ├── useBladeNavigationAdapter.ts  ← Legacy API adapter
│   └── index.ts                 ← barrel exports
│
├── components/
│   ├── vc-blade-navigation/
│   │   └── vc-blade-navigation-new.vue  ← top-level container
│   └── vc-blade-slot/
│       └── vc-blade-slot.vue    ← per-blade wrapper (injection, component resolution)
│
└── utils/
    ├── urlSync.ts               ← URL building/parsing utilities
    ├── urlSync.test.ts
    ├── restoreFromUrl.ts        ← URL → BladeStack restoration
    └── restoreFromUrl.test.ts

core/
├── composables/
│   ├── useBlade/index.ts        ← useBladeContext() (new API), useBlade() (legacy)
│   └── useBladeRegistry/
│       ├── index.ts             ← createBladeRegistry, IBladeRegistry
│       └── index.test.ts
└── plugins/
    └── modularity/index.ts      ← createAppModule (blade registration during module install)
```

## 8. Test Coverage

| File | Tests | Covers |
|------|-------|--------|
| `useBladeStack.test.ts` | 35 | All stack operations, guards, edge cases |
| `useBladeMessaging.test.ts` | 11 | RPC, multi-level, cleanup, error cases |
| `urlSync.test.ts` | 24 | URL building, parsing, query strings |
| `restoreFromUrl.test.ts` | 12 | Restoration, idempotency, non-routable |
| `useBladeRegistry/index.test.ts` | 17 | Registration, duplicates, reverse index |
| **Total** | **99** | |

## 9. Known Limitations

1. **URL depth**: Only 1 child blade level in URL. Third-level+ blades don't appear in address bar.
2. **No max stack depth**: Stack can grow unbounded (theoretical; in practice ~5 blades).
3. **replaceCurrentBlade accumulation**: Hidden blades persist until replacement is closed.
4. **Module-level singletons**: `bladeStackInstance` etc. prevent SSR and multi-app scenarios. Reset functions exist for testing.
5. **Vue SFC type checking**: `.vue` files lack type declarations — TypeScript doesn't verify props/emits at build time.
6. **Legacy adapter overhead**: `descriptorToShim()` creates fake BladeVNode objects on every computed re-evaluation.

## 10. Migration Status

| API | Status | Usage |
|-----|--------|-------|
| `useBladeNavigation()` | Deprecated (adapter) | ~80% of existing blades |
| `useBladeContext()` | Current | New development |
| `useBlade()` | Legacy | Read-only blade identity |

See [MIGRATION.md](./MIGRATION.md) for step-by-step migration guide.
