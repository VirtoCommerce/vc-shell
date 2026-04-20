# Dashboard Widget Pattern

Dashboard widgets are cards displayed on the app's main dashboard. They are registered at module scope — outside `defineAppModule` — so they are available before the framework initializes the dashboard service.

> **v1 note**: The generator does not produce dashboard widget files. This pattern is reference-only for developers extending the generated module manually.

---

## Registration

Dashboard widgets are registered by calling `registerDashboardWidget()` at the top level of the module's `index.ts`, before `defineAppModule`:

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

### `DashboardWidget` type

```ts
interface DashboardWidget {
  id: string; // unique across all registered widgets
  name: string; // display name
  component: Component; // widget Vue component, wrapped in markRaw()
  size: { width: number; height: number }; // grid units
  position?: { x: number; y: number }; // optional initial grid position
  permissions?: string[]; // optional: restrict visibility by permission
  props?: Record<string, unknown>; // optional: static props passed to component
}
```

- `markRaw()` is **required** — prevents Vue from making the component reactive (which would cause warnings and overhead).
- `size` is in dashboard grid units (not pixels). `{ width: 6, height: 6 }` is a typical half-width card.
- `id` must be globally unique. Use `"modulename-widget"` naming convention.

---

## Widget Component

The widget component is a plain Vue SFC placed in `src/modules/xxx/components/`:

```vue
<template>
  <DashboardWidgetCard :title="$t('XXX.DASHBOARD.WIDGET.TITLE')">
    <DashboardStatItem
      :label="$t('XXX.DASHBOARD.WIDGET.TOTAL')"
      :value="totalCount"
      :loading="loading"
    />
  </DashboardWidgetCard>
</template>

<script lang="ts" setup>
import { DashboardWidgetCard, DashboardStatItem } from "@vc-shell/framework";
import { ref, onMounted } from "vue";
import useXxxs from "../composables/useXxxs";

const { getXxxs, totalCount, loading } = useXxxs();

onMounted(async () => {
  await getXxxs({ take: 0 }); // fetch count only
});
</script>
```

### Available dashboard sub-components from `@vc-shell/framework`

| Component             | Description                              |
| --------------------- | ---------------------------------------- |
| `DashboardWidgetCard` | Card wrapper with title slot             |
| `DashboardStatItem`   | Single stat row: label + value + loading |
| `DashboardBarChart`   | Horizontal bar chart for breakdown stats |

---

## components/ directory structure

```
src/modules/xxx/
└── components/
    ├── index.ts
    └── XxxDashboardCard.vue
```

`components/index.ts` barrel:

```ts
export { default as XxxDashboardCard } from "./XxxDashboardCard.vue";
```

The `registerDashboardWidget` call uses `import * as components from "./components"` then `components.XxxDashboardCard` — this avoids a named import cycle when the component file is large.

---

## Key Rules

1. **Register before `defineAppModule`** — `registerDashboardWidget()` uses a pre-registration bus that flushes into the service once it is initialized. Calling it after `defineAppModule` may miss the flush.
2. **Always `markRaw(component)`** — without `markRaw`, Vue will recursively make the component object reactive, causing performance issues and Vue warnings.
3. **`id` must be globally unique** — duplicate registration throws an error at runtime (`Widget with id X already registered`).
4. **`permissions` restricts visibility** — if the logged-in user does not have any of the listed permissions, `useDashboard().getWidgets()` will exclude this widget.
