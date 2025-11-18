# Dashboard Page Examples

This directory contains examples for creating a Dashboard page in a VC-Shell application.

## Important: Dashboard is NOT a Blade!

**Dashboard is a separate page**, not a blade. It should be registered through the router and bootstrap script, not as a blade component.

## File Structure

```
src/
├── pages/
│   └── Dashboard.vue              # Dashboard page component
├── components/
│   └── dashboard-widgets/         # Dashboard widget components
│       ├── WelcomeWidget.vue
│       ├── StatsWidget.vue
│       └── ActivityWidget.vue
├── router/
│   └── routes.ts                  # Route configuration
└── bootstrap.ts                    # Widget registration
```

## How to Use

### 1. Create Dashboard Page

Create `src/pages/Dashboard.vue`:

```vue
<template>
  <DraggableDashboard />
</template>

<script lang="ts" setup>
import { DraggableDashboard } from "@vc-shell/framework";
</script>
```

The `DraggableDashboard` component is provided by `@vc-shell/framework` and handles:
- Widget grid layout
- Drag-and-drop widget positioning
- Widget resizing
- Layout persistence

### 2. Create Dashboard Widgets

Create widget components in `src/components/dashboard-widgets/`:

```vue
<!-- WelcomeWidget.vue -->
<template>
  <VcCard class="tw-h-full">
    <div class="tw-p-6">
      <!-- Widget content -->
    </div>
  </VcCard>
</template>

<script lang="ts" setup>
// Widget logic
</script>
```

**Widget Requirements:**
- Must be wrapped in a component (not inline)
- Should use `VcCard` for consistent styling
- Use `class="tw-h-full"` on VcCard to fill widget container
- Handle loading states internally

### 3. Register Widgets in Bootstrap

Create `src/bootstrap.ts`:

```typescript
import { addMenuItem, registerDashboardWidget } from "@vc-shell/framework";
import { App, markRaw } from "vue";
import WelcomeWidget from "./components/dashboard-widgets/WelcomeWidget.vue";

export function bootstrap(app: App) {
  // Add Dashboard menu item
  addMenuItem({
    title: "ENTITIES.MENU.DASHBOARD",
    icon: "lucide-home",
    priority: 0,
    url: "/",
  });

  // Register dashboard widget
  registerDashboardWidget({
    id: "welcome-widget",           // Unique widget ID
    name: "Welcome",                 // Widget display name
    component: markRaw(WelcomeWidget), // Widget component (MUST use markRaw!)
    size: { width: 6, height: 6 },  // Grid size (12 columns total)
    position: { x: 0, y: 0 },       // Initial position
  });
}
```

**Important:**
- Use `markRaw()` when registering widget components
- `size.width` is in grid columns (12 columns total)
- `size.height` is in grid rows
- `position.x` and `position.y` are initial positions (users can drag)

### 4. Register Route

In `src/router/routes.ts`:

```typescript
import { RouteRecordRaw } from "vue-router";
import App from "../pages/App.vue";
import Dashboard from "../pages/Dashboard.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: App,
    children: [
      {
        name: "Dashboard",
        path: "",
        component: Dashboard,
      },
    ],
  },
  // ... other routes
];
```

### 5. Call Bootstrap in main.ts

In `src/main.ts`:

```typescript
import { bootstrap } from "./bootstrap";

async function startApp() {
  const app = createApp(RouterView);

  // ... app setup

  app.use(router);

  // Call bootstrap AFTER router is registered
  bootstrap(app);

  // ... rest of setup

  app.mount("#app");
}
```

## Widget Grid System

The dashboard uses a **12-column grid system**:

- Total width: 12 columns
- Widget `width`: 1-12 columns
- Widget `height`: Number of rows (each row ~150px by default)

### Common Widget Sizes

```typescript
// Small widget (quarter width)
size: { width: 3, height: 4 }

// Medium widget (half width)
size: { width: 6, height: 6 }

// Large widget (full width)
size: { width: 12, height: 8 }

// Wide widget (full width, short)
size: { width: 12, height: 4 }
```

## Widget Types

### 1. Standard Widget with DashboardWidgetCard

Most dashboard widgets should use the **DashboardWidgetCard** component from framework:

```vue
<template>
  <DashboardWidgetCard
    :header="$t('ENTITIES.WIDGET.TITLE')"
    icon="lucide-package-open"
    :loading="loading"
  >
    <template #actions>
      <VcButton @click="addItem">Add</VcButton>
    </template>

    <template #content>
      <VcTable
        :items="items?.slice(0, 5)"
        :columns="columns"
        :header="false"
        :footer="false"
        @item-click="onItemClick"
      />
    </template>
  </DashboardWidgetCard>
</template>
```

**Features:**
- Built-in header with icon
- Actions slot for buttons
- Loading state support
- Consistent styling
- Empty state handling

**Example:** [EntityDashboardCard.vue](../components/dashboard-widgets/EntityDashboardCard.vue)

### 2. Custom Widget (Advanced)

For unique designs, create a custom widget without DashboardWidgetCard:

```vue
<template>
  <div class="custom-widget">
    <!-- Custom layout with full control -->
  </div>
</template>

<style lang="scss">
.custom-widget {
  @apply tw-h-full tw-p-6;
  // Custom styles
}
</style>
```

**When to use:**
- Unique visual design (e.g., gradient backgrounds)
- Special layouts not fitting the card pattern
- Marketing/promotional content

**Example:** [WelcomeWidget.vue](../components/dashboard-widgets/WelcomeWidget.vue)

## Best Practices

1. **Always use markRaw()** when registering widget components
2. **Use VcCard** for consistent widget styling
3. **Handle loading states** within widgets
4. **Make widgets responsive** to different sizes
5. **Persist layout** (handled automatically by DraggableDashboard)
6. **Keep widgets focused** - one purpose per widget
7. **Use i18n** for all text strings

## Anti-Patterns to Avoid

❌ **DON'T** create dashboard as a blade:
```vue
<!-- WRONG! -->
<VcBlade>
  <DraggableDashboard />
</VcBlade>
```

✅ **DO** create dashboard as a page:
```vue
<!-- CORRECT! -->
<template>
  <DraggableDashboard />
</template>
```

❌ **DON'T** forget markRaw():
```typescript
// WRONG!
registerDashboardWidget({
  component: WelcomeWidget, // Missing markRaw!
});
```

✅ **DO** use markRaw():
```typescript
// CORRECT!
registerDashboardWidget({
  component: markRaw(WelcomeWidget),
});
```

## See Also

- [DraggableDashboard Documentation](https://docs.vc-shell.dev/components/draggable-dashboard)
- [Widget Registration API](https://docs.vc-shell.dev/api/register-dashboard-widget)
- [Vendor Portal Example](../../../../apps/vendor-portal/src/pages/Dashboard.vue)
