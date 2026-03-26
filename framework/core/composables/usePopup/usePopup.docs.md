# usePopup

Programmatic popup management for modal dialogs. Returns methods to open confirmation, error, and info dialogs, as well as fully custom popup components with typed props and emits. Popups are rendered in a dedicated container at the app root level, ensuring they overlay all other content including blades and sidebars.

## When to Use

- Show confirmation dialogs before destructive actions (delete, discard, bulk operations)
- Display error or info messages in a modal overlay
- Open custom popup components with typed props and emits
- When NOT to use: for passive feedback (use `notification()` toast instead), for navigation flows (use blade navigation instead)

## Quick Start

```vue
<script setup lang="ts">
import { usePopup } from "@vc-shell/framework";

const { showConfirmation, showError } = usePopup();

async function deleteProduct(id: string) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this product?"
  );
  if (!confirmed) return;

  try {
    await api.deleteProduct(id);
  } catch (error) {
    showError(error.message || "Failed to delete product.");
  }
}
</script>

<template>
  <VcBlade title="Product">
    <VcButton variant="danger" @click="deleteProduct(product.id)">
      Delete
    </VcButton>
  </VcBlade>
</template>
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `options` | `MaybeRef<UsePopupProps<T>>` | No | Configuration for a custom popup component. Omit for built-in dialogs only. |

#### `UsePopupProps<T>`

| Field | Type | Required | Description |
|---|---|---|---|
| `component` | `ComponentPublicInstanceConstructor` | Yes | The popup component to render |
| `props` | `RawProps<T>` | No | Props to pass to the component (typed from the component's `defineProps`) |
| `emits` | `RawEmits<T>` | No | Event handlers (typed from the component's `defineEmits`) |
| `slots` | `Record<string, string \| Component \| Slot>` | No | Named slots — strings render as text, components render as VNodes |

### Returns (`IUsePopup`)

| Method | Signature | Description |
|---|---|---|
| `open` | `() => void` | Push the popup onto the stack and render it |
| `close` | `() => void` | Remove the popup from the stack |
| `showConfirmation` | `(message: string \| Ref<string>) => Promise<boolean>` | Warning dialog with Confirm/Cancel buttons. Resolves `true` on confirm, `false` on cancel or close. |
| `showError` | `(message: string \| Ref<string>) => void` | Error-styled popup with a close button |
| `showInfo` | `(message: string \| Ref<string>) => void` | Info-styled popup with a close button |

## How It Works

`usePopup` is backed by the `VcPopupHandler` plugin, which maintains a reactive array of popup instances. When you call `open()` or `showConfirmation()`, a popup descriptor is pushed into this array. The `VcPopupContainer` component (mounted once at the app root) renders all active popups as an overlay stack. Calling `close()` removes the descriptor, and Vue reactivity handles the unmount.

The plugin instance is resolved via `inject(PopupPluginKey)`. If called outside the component tree (e.g., in a utility function), it falls back to the singleton `popupPluginInstance`.

Multiple popups can be open simultaneously — they stack with the most recent on top.

## Recipe: Delete Confirmation with Notification

```vue
<script setup lang="ts">
import { usePopup, useBlade } from "@vc-shell/framework";
import { useNotifications } from "@vc-shell/framework";

const { showConfirmation, showError } = usePopup();
const { closeSelf } = useBlade();

async function deleteOrder(id: string) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this order? This action cannot be undone."
  );
  if (!confirmed) return;

  try {
    await api.deleteOrder(id);
    closeSelf();
  } catch (error) {
    showError(error.message || "Failed to delete order.");
  }
}
</script>
```

## Recipe: Custom Popup with Form

For complex interactions beyond simple confirmation, create a custom popup component:

```ts
import { usePopup } from "@vc-shell/framework";
import AddNotePopup from "./AddNotePopup.vue";

const { open, close } = usePopup({
  component: AddNotePopup,
  props: { entityId: "prod-1" },
  emits: {
    onConfirm: async (note: string) => {
      await api.addNote("prod-1", note);
      close();
    },
    onCancel: () => close(),
  },
});

open();
```

## Recipe: Reactive Options

The `options` parameter accepts `MaybeRef`, so you can pass a computed or ref that updates the popup config dynamically:

```ts
import { computed } from "vue";
import { usePopup } from "@vc-shell/framework";
import ConfirmPopup from "./ConfirmPopup.vue";

const selectedCount = ref(0);

const { open, close } = usePopup(
  computed(() => ({
    component: ConfirmPopup,
    props: { message: `Delete ${selectedCount.value} items?` },
    emits: { onConfirm: () => { performDelete(); close(); } },
  }))
);
```

## Common Mistakes

**Wrong: not awaiting showConfirmation**
```ts
// The delete runs immediately — confirmation is ignored
showConfirmation("Delete?");
await api.deleteProduct(id); // runs before user clicks!
```

**Correct: await the result**
```ts
const confirmed = await showConfirmation("Delete?");
if (!confirmed) return;
await api.deleteProduct(id);
```

---

**Wrong: nesting many popups**
```ts
// 3+ deep popup stacks confuse users
const a = await showConfirmation("Step 1?");
if (a) {
  const b = await showConfirmation("Step 2?");
  if (b) {
    const c = await showConfirmation("Step 3?");
  }
}
```

**Correct: use a blade for multi-step workflows**
```ts
// Complex flows belong in blades, not popups
openBlade({ name: "WizardBlade", options: { step: 1 } });
```

## Tips

- **Always `await` showConfirmation** before proceeding with the destructive action.
- **Use `showConfirmation` for yes/no questions**, custom popups for forms or complex interactions.
- **Calling `usePopup()` without arguments** gives you only the built-in dialogs (`showConfirmation`, `showError`, `showInfo`). Pass `options` only when you need a custom component.
- **Avoid nesting popups more than 2 levels deep.** Consider blades for complex multi-step workflows.
- **The message parameter accepts `Ref<string>`** — useful for dynamic messages that update while the popup is open (e.g., progress messages).

## Related

- [VcPopup](../../../ui/components/organisms/vc-popup/vc-popup.docs.md) — the default popup shell component (header, content, actions)
- [useBlade](../useBlade/useBlade.docs.md) — for panel-based UI; use popups for modal interruptions only
- `notification()` — for passive, non-blocking feedback (toasts)
