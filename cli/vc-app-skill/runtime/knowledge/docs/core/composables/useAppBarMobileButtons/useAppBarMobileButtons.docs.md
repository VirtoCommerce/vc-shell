# useAppBarMobileButtons

Manages custom action buttons in the mobile app bar. Uses provide/inject to share a singleton service across the component tree. This composable gives any blade or module the ability to register, update, and remove buttons that appear in the top app bar on mobile devices. Buttons are sorted by their `order` property and can include icons, custom Vue components, click handlers, badges, and reactive visibility toggles. The service is scoped to the VcApp tree and automatically cleans up when the scope is disposed.

## When to Use

- Register custom buttons (icons, components) in the mobile top bar from any blade or module
- Show notification badges, filter toggles, or action shortcuts in the mobile app bar
- Dynamically show/hide buttons based on blade state (e.g., only show a "filter" button when a list blade is active)
- When NOT to use: for desktop-only toolbar actions (use `useToolbar` instead); for buttons inside blade content (just use regular template markup)

## Quick Start

```vue
<script setup lang="ts">
import { useAppBarMobileButtons } from "@vc-shell/framework";
import { onUnmounted, computed, ref } from "vue";

const { register, unregister } = useAppBarMobileButtons();
const unreadCount = ref(3);

register({
  id: "notifications-btn",
  icon: "fas fa-bell",
  onClick: () => openNotificationsPanel(),
  order: 10,
  badge: computed(() => unreadCount.value > 0),
  isVisible: computed(() => true),
});

// Always clean up when the component is destroyed
onUnmounted(() => unregister("notifications-btn"));
</script>
```

## API

### Returns

| Property            | Type                                                     | Description                                                                                      |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `registeredButtons` | `ComputedRef<AppBarButtonContent[]>`                     | All registered buttons (unfiltered, unsorted). Useful for debugging.                             |
| `register`          | `(button: AppBarButtonContent) => void`                  | Add or update a button by `id`. If a button with the same ID already exists, it is replaced.     |
| `unregister`        | `(buttonId: string) => void`                             | Remove a button by `id`. No-op if the ID does not exist.                                         |
| `getButton`         | `(buttonId: string) => AppBarButtonContent \| undefined` | Look up a single button by ID.                                                                   |
| `getButtons`        | `ComputedRef<AppBarButtonContent[]>`                     | Visible buttons sorted by `order` (ascending). Filters out buttons where `isVisible` is `false`. |

### AppBarButtonContent

| Field       | Type                      | Required | Description                                                                                             |
| ----------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `id`        | `string`                  | Yes      | Unique identifier. Used for register/unregister/lookup.                                                 |
| `icon`      | `Component \| string`     | No       | Icon component or CSS class string (e.g., `'fas fa-bell'`).                                             |
| `component` | `Component`               | No       | Custom Vue component to render instead of a default icon button.                                        |
| `props`     | `Record<string, unknown>` | No       | Props passed to the custom `component`.                                                                 |
| `onClick`   | `() => void`              | No       | Click handler for the default button rendering.                                                         |
| `onClose`   | `() => void`              | No       | Close/dismiss handler (e.g., for popover-style buttons).                                                |
| `order`     | `number`                  | No       | Sort priority. Lower values appear first. Defaults to 0 if omitted.                                     |
| `isVisible` | `MaybeRef<boolean>`       | No       | Reactive visibility toggle. When `false`, the button is excluded from `getButtons`. Defaults to `true`. |
| `badge`     | `MaybeRef<boolean>`       | No       | Show a small badge indicator on the button (e.g., for unread notifications).                            |

## Setup

`provideAppBarMobileButtonsService()` must be called once in the app root (VcApp). It is idempotent -- calling it again in the same injection tree returns the existing service. Descendant components then call `useAppBarMobileButtons()` to register buttons.

```typescript
// Inside VcApp.vue setup
import { provideAppBarMobileButtonsService } from "@vc-shell/framework";

provideAppBarMobileButtonsService();
```

## Recipe: Filter Toggle Button That Reflects Active State

```vue
<script setup lang="ts">
import { useAppBarMobileButtons } from "@vc-shell/framework";
import { ref, computed, onUnmounted } from "vue";

const { register, unregister } = useAppBarMobileButtons();
const isFilterActive = ref(false);

register({
  id: "product-list-filter",
  icon: computed(() => (isFilterActive.value ? "fas fa-filter" : "far fa-filter")),
  onClick: () => {
    isFilterActive.value = !isFilterActive.value;
    // Open or close the filter panel
  },
  order: 20,
  badge: isFilterActive,
});

onUnmounted(() => unregister("product-list-filter"));
</script>
```

## Recipe: Custom Component Button

If you need more than an icon and a click handler (e.g., a dropdown or popover), register a full Vue component:

```vue
<script setup lang="ts">
import { useAppBarMobileButtons } from "@vc-shell/framework";
import { onUnmounted, markRaw } from "vue";
import LanguageSwitcher from "./LanguageSwitcher.vue";

const { register, unregister } = useAppBarMobileButtons();

register({
  id: "language-switcher",
  component: markRaw(LanguageSwitcher),
  props: { position: "bottom-right" },
  order: 50,
});

onUnmounted(() => unregister("language-switcher"));
</script>
```

## Tips

- **Always unregister on unmount.** Forgetting to call `unregister` means the button stays in the app bar even after the blade that registered it is closed. Use `onUnmounted` or `onBeforeUnmount` as a cleanup hook.
- **Use `markRaw` for component references.** When passing a Vue component to the `component` field, wrap it in `markRaw()` to avoid making it reactive (which triggers Vue warnings and unnecessary overhead).
- **Button IDs must be globally unique.** If two blades register buttons with the same ID, the second registration overwrites the first. Use a descriptive prefix like `'order-list-filter'` to avoid collisions.
- **Calling `useAppBarMobileButtons()` outside VcApp throws.** The service is injected via provide/inject. If the injection is missing, an `InjectionError` is thrown with a descriptive message.

## Related

- `useToolbar` -- desktop toolbar actions (different service, different UI placement)
- `framework/core/services/app-bar-mobile-buttons-service.ts` -- underlying service implementation
- `VcApp` -- provides the service via `provideAppBarMobileButtonsService()`
