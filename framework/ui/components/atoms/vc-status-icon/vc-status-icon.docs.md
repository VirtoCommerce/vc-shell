# VcStatusIcon

A simple boolean status indicator that displays a green check icon for active/success or a muted cross icon for inactive/failure.

## When to Use

- Show on/off or pass/fail state in tables and lists (e.g., "Is Active", "Email Verified")
- Display system health checks with a quick visual indicator
- When NOT to use: multi-state status with labels (use [VcStatus](../vc-status/) instead)

## Basic Usage

```vue
<template>
  <VcStatusIcon :status="user.isActive" />
</template>

<script setup lang="ts">
import { VcStatusIcon } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `boolean` | `undefined` | `true` shows a green check circle; `false` shows a muted cross circle |

## Common Patterns

### Boolean Column in a Table

```vue
<template>
  <VcColumn id="isActive" header="Active" :width="80">
    <template #default="{ row }">
      <VcStatusIcon :status="row.isActive" />
    </template>
  </VcColumn>
</template>
```

### System Health Dashboard

```vue
<template>
  <div class="tw-space-y-2">
    <div v-for="service in services" :key="service.name" class="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b">
      <span>{{ service.name }}</span>
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-text-sm">{{ service.status ? 'Online' : 'Offline' }}</span>
        <VcStatusIcon :status="service.status" />
      </div>
    </div>
  </div>
</template>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--status-icon-success-color` | `var(--success-500)` | Color of the check icon |
| `--status-icon-inactive-color` | `var(--neutrals-300)` | Color of the cross icon |

## Accessibility

- Container has `role="img"` with `aria-label` set to "Active" or "Inactive" based on `status`
- Icons are marked `aria-hidden="true"` since the container carries the label
- Uses Lucide icons (`lucide-circle-check` and `lucide-circle-x`)

## Related Components

- [VcStatus](../vc-status/) -- labeled multi-variant status badge for richer state display
- [VcIcon](../vc-icon/) -- standalone icon component used internally
