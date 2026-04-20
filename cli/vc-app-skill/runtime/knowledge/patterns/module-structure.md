# Module Structure Pattern

Describes how a generated module is organized: folder layout, barrel files, and `defineAppModule` registration.

---

## Folder Layout

### List + Details (e.g., "manage team members")

```
src/modules/team/
├── composables/
│   ├── index.ts
│   ├── useTeamMembers/index.ts    # Search, pagination, sort (plural)
│   └── useTeamMember/index.ts     # Get, create, update, delete (singular)
├── locales/
│   ├── index.ts
│   └── en.json
├── pages/
│   ├── index.ts
│   ├── team-list.vue              # VcBlade + VcDataTable
│   └── team-member-details.vue    # VcBlade + VcForm
└── index.ts                       # defineAppModule({ blades: pages, locales })
```

### Details Only (e.g., "seller profile settings page")

```
src/modules/seller-details/
├── composables/
│   ├── index.ts
│   └── useSellerDetails/index.ts  # Get + update only
├── locales/
│   ├── index.ts
│   └── en.json
├── pages/
│   ├── index.ts
│   └── seller-details-edit.vue    # VcBlade + VcForm (isWorkspace: true, has url)
└── index.ts
```

### List Only (e.g., "read-only catalog view")

```
src/modules/catalog/
├── composables/
│   ├── index.ts
│   └── useCatalogItems/index.ts   # Search only, no CRUD
├── locales/
│   ├── index.ts
│   └── en.json
├── pages/
│   ├── index.ts
│   └── catalog-list.vue           # VcBlade + VcDataTable (isWorkspace: true, has url)
└── index.ts
```

---

## `index.ts` — Module Entry Point

```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({ blades: pages, locales });

export * from "./pages";
export * from "./composables";
```

**Rules:**

- `blades: pages` — passes the pages namespace object (all named exports from `pages/index.ts`)
- `locales` — passes the locales namespace object
- Re-export `pages` and `composables` so callers can import blades/composables directly from the module package
- Do NOT re-export `locales` (they are loaded by the framework internally)

---

## `pages/index.ts` — Pages Barrel

Named exports, no default:

```ts
export { default as XxxList } from "./xxx-list.vue";
export { default as XxxDetails } from "./xxx-details.vue";
```

Real example:

```ts
export { default as TeamList } from "./team-list.vue";
export { default as TeamMemberDetails } from "./team-member-details.vue";
```

---

## `composables/index.ts` — Composables Barrel

Named exports, no default:

```ts
export { default as useXxxs } from "./useXxxs";
export { default as useXxx } from "./useXxx";
```

Real example:

```ts
export { default as useTeamMembers } from "./useTeamMembers";
export { default as useTeamMember } from "./useTeamMember";
```

For list-only modules, only the plural composable is exported:

```ts
export { default as useCatalogItems } from "./useCatalogItems";
```

---

## `locales/index.ts` — Locales Barrel

```ts
import en from "./en.json";
export { en };
```

---

## Notification Registration (optional)

Add a `notifications/` directory with template components, then register in `index.ts`:

```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";
import XxxCreatedDomainEvent from "./notifications/XxxCreatedDomainEvent.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    XxxCreatedDomainEvent: {
      template: XxxCreatedDomainEvent,
      toast: { mode: "auto" },
    },
  },
});

export * from "./pages";
export * from "./composables";
```

`notifications/index.ts` barrel:

```ts
export { default as XxxCreatedDomainEvent } from "./XxxCreatedDomainEvent.vue";
```

---

## Dashboard Widget Registration (optional)

Dashboard widgets are registered at module scope — OUTSIDE `defineAppModule`. Must be called before `defineAppModule`:

```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";
import * as components from "./components";

registerDashboardWidget({
  id: "xxx-widget",
  name: "Xxx",
  component: markRaw(components.XxxDashboardCard),
  size: { width: 6, height: 6 },
});

export default defineAppModule({ blades: pages, locales });

export * from "./pages";
export * from "./composables";
```

---

## App Module Registry

The module assembler registers the new module in the app's module registry, typically at `src/modules/index.ts`:

```ts
export { default as Orders } from "./orders";
export { default as Team } from "./team"; // ← added by assembler
```

The assembler must:

1. Read existing `src/modules/index.ts`
2. Parse existing exports to avoid duplicates
3. Append a new named export for the new module
4. Preserve all existing module registrations (do not rewrite the file from scratch)
