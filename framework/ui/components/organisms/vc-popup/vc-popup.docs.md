# VcPopup

A modal dialog component built on [HeadlessUI Dialog](https://headlessui.com/vue/dialog). Use it for confirmations, alerts, error messages, and focused form interactions that require the user's immediate attention.

## When to Use

| Scenario                                          | Component   |
| ------------------------------------------------- | ----------- |
| Confirmation prompt ("Delete this item?")         | **VcPopup** |
| Error or success alert after an API call          | **VcPopup** |
| Short form that must block background interaction | **VcPopup** |
| Side panel for contextual workflows               | VcSidebar   |
| Stacked detail views (master-detail)              | VcBlade     |

> **Tip:** Prefer blades for CRUD workflows. Reserve popups for brief, interruptive interactions such as confirmations and alerts.

---

## Quick Start

```vue
<template>
  <VcButton @click="showPopup = true">Open Popup</VcButton>

  <VcPopup
    v-model="showPopup"
    title="Hello World"
  >
    <template #content>
      <p>This is a simple popup with a title and content.</p>
    </template>
    <template #footer="{ close }">
      <VcButton @click="close">OK</VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcPopup, VcButton } from "@vc-shell/framework";

const showPopup = ref(false);
</script>
```

---

## Features

### Variants

The `variant` prop adds a semantic icon and color to the popup. Available values: `"default"`, `"info"`, `"success"`, `"warning"`, `"error"`.

```vue
<VcPopup v-model="open" title="Item saved" variant="success">
  <template #content>Your changes have been saved successfully.</template>
</VcPopup>

<VcPopup v-model="open" title="Connection lost" variant="error">
  <template #content>Could not reach the server. Please try again later.</template>
</VcPopup>
```

When `variant` is anything other than `"default"`, a large icon is rendered to the left of the content area:

| Variant   | Icon                    | Color token     |
| --------- | ----------------------- | --------------- |
| `warning` | `lucide-triangle-alert` | `--warning-500` |
| `error`   | `lucide-circle-alert`   | `--danger-500`  |
| `success` | `lucide-circle-check`   | `--success-500` |
| `info`    | `lucide-info`           | `--info-500`    |

### Title

Pass a string via the `title` prop. For richer markup, use the `#header` slot instead (see [Custom Header](#custom-header)).

```vue
<VcPopup v-model="open" title="Confirm Deletion" variant="warning">
  <!-- ... -->
</VcPopup>
```

### Custom Header

The `#header` slot replaces the default title text entirely. The close button (X) is rendered outside the slot, so it remains available.

```vue
<VcPopup v-model="open">
  <template #header>
    <div class="tw-flex tw-items-center tw-gap-2">
      <VcIcon icon="lucide-settings" class="tw-text-[var(--primary-500)]" />
      <span class="tw-font-bold">Advanced Settings</span>
    </div>
  </template>
  <template #content>
    <!-- ... -->
  </template>
</VcPopup>
```

### Dismissal Behavior

By default a closable popup can be dismissed three ways:

1. **Close button (X)** in the title bar
2. **Clicking the overlay** backdrop
3. **Pressing Escape**

Fine-tune each channel independently:

```vue
<!-- Allow close button only; prevent overlay and Escape -->
<VcPopup v-model="open" title="Mandatory Action" :close-on-overlay="false" :close-on-escape="false">
  <!-- ... -->
</VcPopup>
```

Set `:closable="false"` to disable all three at once (the close button is hidden, overlay and Escape are blocked).

> **Important:** When `closeOnOverlay` or `closeOnEscape` are not explicitly set, they inherit the value of `closable`.

### The `close` Event

The `close` event carries a `PopupCloseReason` string so you can react differently depending on how the user dismissed the popup:

```vue
<VcPopup v-model="open" title="Details" @close="onClose">
  <!-- ... -->
</VcPopup>

<script setup lang="ts">
import type { PopupCloseReason } from "@vc-shell/framework";

function onClose(reason?: PopupCloseReason) {
  // reason is "overlay" | "escape" | "action"
  if (reason === "action") {
    // User clicked a button
  }
}
</script>
```

### Slots

#### `#content`

The main body of the popup. Place text, form fields, tables, or any Vue template here.

```vue
<template #content>
  <div class="tw-space-y-3">
    <p>Are you sure you want to archive 5 items?</p>
    <p class="tw-text-sm tw-text-[var(--neutrals-500)]">This action cannot be undone.</p>
  </div>
</template>
```

#### `#footer`

The footer area sits below a separator line. It exposes a scoped `close` function you can call from any button.

```vue
<template #footer="{ close }">
  <div class="tw-flex tw-justify-end tw-w-full tw-gap-3">
    <VcButton
      variant="outline"
      @click="close"
      >Cancel</VcButton
    >
    <VcButton
      color="danger"
      @click="
        deleteItem();
        close();
      "
      >Delete</VcButton
    >
  </div>
</template>
```

> **Note:** If you omit the `#footer` slot entirely, no footer is rendered. If you provide it without content, a default "Close" button appears via the slot fallback.

### Controlled Popup (v-model)

Use `v-model` to bind visibility to a reactive boolean. The popup emits `update:modelValue` on every close attempt.

```vue
<template>
  <VcButton @click="isOpen = true">Open</VcButton>
  <VcPopup
    v-model="isOpen"
    title="Controlled"
  >
    <template #content>Visible state: {{ isOpen }}</template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
const isOpen = ref(false);
</script>
```

> **Tip:** You can also use `v-if` instead of `v-model` for a simpler pattern when you do not need animated exit transitions:
>
> ```vue
> <VcPopup v-if="showPopup" title="Simple" @close="showPopup = false">
> ```

### Custom Width

The `modalWidth` prop accepts a Tailwind CSS max-width class. The default is `"tw-max-w-md"` (448px).

```vue
<!-- Small popup -->
<VcPopup v-model="open" title="Narrow" modal-width="tw-max-w-sm" />

<!-- Large popup for forms -->
<VcPopup v-model="open" title="Wide Form" modal-width="tw-max-w-2xl" />

<!-- Extra large -->
<VcPopup v-model="open" title="Gallery" modal-width="tw-max-w-5xl" />
```

### Fullscreen Mode

Two props control fullscreen behavior:

| Prop                 | Effect                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| `isFullscreen`       | Full viewport on **all** screen sizes                                   |
| `isMobileFullscreen` | Full viewport on **mobile only** (detected via `IsMobileKey` injection) |

```vue
<VcPopup v-model="open" title="Image Editor" is-fullscreen>
  <template #content>
    <div class="tw-h-full tw-w-full">
      <!-- Full-height content -->
    </div>
  </template>
</VcPopup>
```

---

## Recipes

### Confirmation Dialog

The most common pattern. Uses the `warning` variant and a two-button footer.

```vue
<template>
  <VcButton
    color="danger"
    @click="confirmDelete"
    >Delete Order</VcButton
  >

  <VcPopup
    v-model="showConfirm"
    title="Confirm Deletion"
    variant="warning"
    :close-on-overlay="false"
  >
    <template #content> Are you sure you want to delete this order? This action cannot be undone. </template>
    <template #footer="{ close }">
      <div class="tw-flex tw-justify-end tw-w-full tw-gap-3">
        <VcButton
          variant="outline"
          @click="close"
          >Cancel</VcButton
        >
        <VcButton
          color="danger"
          @click="onDeleteConfirmed(close)"
          >Delete</VcButton
        >
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcPopup, VcButton } from "@vc-shell/framework";

const showConfirm = ref(false);

function confirmDelete() {
  showConfirm.value = true;
}

async function onDeleteConfirmed(close: () => void) {
  await api.deleteOrder(orderId);
  close();
  emit("parent:call", { method: "reload" });
}
</script>
```

#### Programmatic Confirmation with `usePopup`

For toolbar handlers and composables, use the `usePopup()` composable instead of template markup:

```ts
import { usePopup } from "@vc-shell/framework";

const { showConfirmation, showError, showInfo } = usePopup();

// Returns a Promise<boolean>
async function handleDelete() {
  const confirmed = await showConfirmation("Are you sure you want to delete this item?");
  if (confirmed) {
    await deleteItem();
  }
}
```

The composable provides three convenience methods:

| Method                      | Variant | Returns            |
| --------------------------- | ------- | ------------------ |
| `showConfirmation(message)` | warning | `Promise<boolean>` |
| `showError(message)`        | error   | `void`             |
| `showInfo(message)`         | info    | `void`             |

### Popup with Form and Validation

Use `Field` from `vee-validate` inside the popup content for inline validation.

```vue
<template>
  <VcPopup
    v-model="showForm"
    title="Add Note"
    modal-width="tw-max-w-lg"
  >
    <template #content>
      <VcForm class="tw-space-y-4">
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :model-value="form.title"
          name="title"
          rules="required"
        >
          <VcInput
            v-model="form.title"
            label="Title"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>

        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :model-value="form.body"
          name="body"
          rules="required|min:10"
        >
          <VcTextarea
            v-model="form.body"
            label="Note"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>
      </VcForm>
    </template>
    <template #footer="{ close }">
      <div class="tw-flex tw-justify-end tw-w-full tw-gap-3">
        <VcButton
          variant="outline"
          @click="close"
          >Cancel</VcButton
        >
        <VcButton
          :disabled="!meta.valid"
          @click="save(close)"
          >Save</VcButton
        >
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Field, useForm } from "vee-validate";
import { VcPopup, VcButton, VcForm, VcInput, VcTextarea } from "@vc-shell/framework";

const showForm = ref(false);
const form = reactive({ title: "", body: "" });
const { meta } = useForm({ validateOnMount: false });

async function save(close: () => void) {
  await api.createNote(form);
  close();
}
</script>
```

### Error Popup from API Catch

Display server errors using the programmatic `showError`:

```ts
import { usePopup } from "@vc-shell/framework";

const { showError } = usePopup();

async function saveOffer() {
  try {
    await api.updateOffer(offer.value);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "An unexpected error occurred.";
    showError(message);
  }
}
```

Or display a richer error popup in-template:

```vue
<VcPopup v-model="showApiError" title="Save Failed" variant="error">
  <template #content>
    <p>{{ errorMessage }}</p>
    <p class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mt-2">
      If the problem persists, contact support.
    </p>
  </template>
  <template #footer="{ close }">
    <VcButton @click="close">Dismiss</VcButton>
  </template>
</VcPopup>
```

---

## Common Mistakes

### Forgetting `v-model` or `v-if`

```vue
<!-- BAD: popup is always open with no way to control visibility -->
<VcPopup title="Oops">
  <template #content>Stuck open forever.</template>
</VcPopup>

<!-- GOOD: controlled with v-model -->
<VcPopup v-model="isOpen" title="Controlled">
  <template #content>Can be opened and closed.</template>
</VcPopup>

<!-- GOOD: controlled with v-if -->
<VcPopup v-if="isOpen" title="Conditional" @close="isOpen = false">
  <template #content>Mounted only when open.</template>
</VcPopup>
```

### Not calling `close()` in footer actions

```vue
<!-- BAD: popup stays open after Confirm click -->
<template #footer>
  <VcButton @click="doSomething()">Confirm</VcButton>
</template>

<!-- GOOD: call close from the slot scope -->
<template #footer="{ close }">
  <VcButton
    @click="
      doSomething();
      close();
    "
    >Confirm</VcButton
  >
</template>
```

### Using `closable="false"` without a close mechanism

```vue
<!-- BAD: user is permanently trapped -->
<VcPopup v-model="open" title="Trap" :closable="false">
  <template #content>No way out!</template>
</VcPopup>

<!-- GOOD: provide at least one action button to close -->
<VcPopup v-model="open" title="Mandatory" :closable="false">
  <template #content>Please acknowledge this message.</template>
  <template #footer>
    <VcButton @click="open = false">I Understand</VcButton>
  </template>
</VcPopup>
```

---

## Props

| Prop                 | Type                                                       | Default             | Description                                                                                     |
| -------------------- | ---------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `modelValue`         | `boolean`                                                  | `undefined`         | Controlled visibility via `v-model`. When omitted, the popup is visible if mounted.             |
| `title`              | `string`                                                   | `undefined`         | Dialog title text rendered in the header bar.                                                   |
| `closable`           | `boolean`                                                  | `true`              | Show the close button (X) and allow dismissal. When `false`, all dismiss channels are disabled. |
| `variant`            | `"default" \| "error" \| "warning" \| "success" \| "info"` | `"default"`         | Semantic variant that determines the icon and its color.                                        |
| `modalWidth`         | `string`                                                   | `"tw-max-w-md"`     | Tailwind max-width class applied to the dialog panel.                                           |
| `isMobileFullscreen` | `boolean`                                                  | `false`             | Expand to fullscreen on mobile viewports only.                                                  |
| `isFullscreen`       | `boolean`                                                  | `false`             | Expand to fullscreen on all viewports.                                                          |
| `closeOnOverlay`     | `boolean`                                                  | Inherits `closable` | Whether clicking the backdrop overlay closes the popup.                                         |
| `closeOnEscape`      | `boolean`                                                  | Inherits `closable` | Whether pressing the Escape key closes the popup.                                               |

## Events

| Event               | Payload            | Description                                                               |
| ------------------- | ------------------ | ------------------------------------------------------------------------- |
| `update:modelValue` | `boolean`          | Emitted with `false` when the popup requests to close. Used by `v-model`. |
| `close`             | `PopupCloseReason` | Reason the popup was closed: `"overlay"`, `"escape"`, or `"action"`.      |

## Slots

| Slot      | Scoped Props            | Description                                                                                    |
| --------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `header`  | --                      | Replaces the default title text. The close button (X) remains visible beside the slot content. |
| `content` | --                      | Main body area of the popup.                                                                   |
| `footer`  | `{ close: () => void }` | Footer area below a separator line. Call `close()` to dismiss the popup from any button.       |

## CSS Custom Properties

| Variable                     | Default                | Description                          |
| ---------------------------- | ---------------------- | ------------------------------------ |
| `--popup-border-radius`      | `6px`                  | Border radius of the dialog panel    |
| `--popup-shadow`             | `var(--shadow-md)`     | Box shadow around the panel          |
| `--popup-overlay-blur`       | `var(--overlay-blur)`  | Backdrop blur amount                 |
| `--popup-bg`                 | `var(--additional-50)` | Background color of the dialog panel |
| `--popup-header-color`       | `var(--primary-700)`   | Title text color                     |
| `--popup-content-text-color` | `var(--primary-700)`   | Content text color                   |
| `--popup-footer-separator`   | `var(--neutrals-200)`  | Footer top border color              |
| `--popup-overlay`            | `var(--overlay-bg)`    | Overlay background color             |

## Accessibility

- Built on HeadlessUI `Dialog`, which provides:
  - **Focus trap** -- focus is locked inside the popup while open
  - **`aria-labelledby`** -- automatically linked to the `DialogTitle` element
  - **Inert background** -- content behind the popup is marked inert for screen readers
- **Escape key** handling respects the `closeOnEscape` prop
- **Overlay click** handling respects the `closeOnOverlay` prop
- The close button (X) has an `aria-label` for screen readers
- Animated enter/leave transitions use opacity and scale for smooth motion

## Related Components

- **VcSidebar** -- slide-over panel for contextual workflows (not centered modal)
- **VcBlade** -- stacked panel navigation for CRUD detail views
- **`usePopup()`** -- composable for programmatic confirmation, error, and info popups without template markup
