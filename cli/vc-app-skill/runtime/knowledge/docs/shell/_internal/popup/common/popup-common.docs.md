# Popup Common Components

Pre-configured popup variants for warning, error, and info dialogs. Built on a shared `VcPopupBase` component that wraps the `VcPopup` organism.

## Overview

These components provide ready-to-use modal dialogs for common scenarios. Each variant sets the appropriate visual style (color, icon) and interaction mode (confirm vs. acknowledge) so consumers only need to provide content and handle events.

## Components

### VcPopupBase

The foundation component. Wraps `VcPopup` and adds footer action buttons based on the `mode`.

| Prop                 | Type                         | Default         | Description                                                    |
| -------------------- | ---------------------------- | --------------- | -------------------------------------------------------------- |
| `title`              | `string`                     | --              | Dialog title                                                   |
| `variant`            | `PopupVariant`               | `"default"`     | Visual style: `"default"`, `"warning"`, `"error"`, `"info"`    |
| `mode`               | `"acknowledge" \| "confirm"` | `"acknowledge"` | `acknowledge` = single OK button; `confirm` = Confirm + Cancel |
| `actionLabel`        | `string`                     | `""`            | Label for the single button in acknowledge mode                |
| `confirmLabel`       | `string`                     | `""`            | Label for the confirm button                                   |
| `cancelLabel`        | `string`                     | `""`            | Label for the cancel button                                    |
| `confirmAsText`      | `boolean`                    | `false`         | Render confirm button as text-only style                       |
| `closable`           | `boolean`                    | `true`          | Show close (X) button in the header                            |
| `isMobileFullscreen` | `boolean`                    | `true`          | Expand to fullscreen on mobile                                 |
| `closeOnConfirm`     | `boolean`                    | `false`         | Auto-close the popup after confirm is emitted                  |

Events: `close`, `confirm`

Slots: `header`, `default` (content), `footer` (receives `{ close, confirm }`)

### VcPopupWarning

A confirm dialog styled with the `warning` variant. Shows Confirm and Cancel buttons.

```vue
<VcPopupWarning title="Delete item?" @close="onCancel" @confirm="onDelete">
  <p>This action cannot be undone.</p>
</VcPopupWarning>
```

| Prop    | Type     | Description  |
| ------- | -------- | ------------ |
| `title` | `string` | Dialog title |

Events: `close`, `confirm`
Slots: `header`, `default`

### VcPopupError

An acknowledge dialog styled with the `error` variant. Shows a single OK button.

```vue
<VcPopupError title="Operation Failed" @close="dismiss">
  <p>Could not save changes. Please try again.</p>
</VcPopupError>
```

| Prop    | Type     | Description  |
| ------- | -------- | ------------ |
| `title` | `string` | Dialog title |

Events: `close`
Slots: `header`, `default`

### VcPopupInfo

An acknowledge dialog styled with the `info` variant. Shows a single OK button.

```vue
<VcPopupInfo title="Information" @close="dismiss">
  <p>Your changes have been saved successfully.</p>
</VcPopupInfo>
```

| Prop    | Type     | Description  |
| ------- | -------- | ------------ |
| `title` | `string` | Dialog title |

Events: `close`
Slots: `header`, `default`

## Usage Patterns

### Confirmation before destructive action

```vue
<VcPopupWarning v-if="showDeleteConfirm" title="Delete Order" @confirm="deleteOrder" @close="showDeleteConfirm = false">
  Are you sure you want to delete this order?
</VcPopupWarning>
```

### Custom footer in VcPopupBase

```vue
<VcPopupBase variant="warning" mode="confirm" title="Custom Actions" @close="onClose">
  <template #footer="{ close, confirm }">
    <VcButton variant="danger" @click="confirm">Delete Forever</VcButton>
    <VcButton @click="close">Keep</VcButton>
  </template>
  <p>Custom footer with full control.</p>
</VcPopupBase>
```

## Tips

- Use `VcPopupWarning` for destructive actions (delete, discard changes).
- Use `VcPopupError` for error messages that need acknowledgment.
- Use `VcPopupInfo` for informational messages.
- Use `VcPopupBase` directly when you need custom button labels, mixed modes, or a custom footer.
- All popups are fullscreen on mobile by default. Set `isMobileFullscreen="false"` to keep the centered dialog style.
- Button labels default to i18n keys: `COMPONENTS.ORGANISMS.VC_POPUP.CONFIRM`, `.CANCEL`, `.OK`.

## Related

- `framework/ui/components/organisms/vc-popup/` -- the underlying `VcPopup` organism
