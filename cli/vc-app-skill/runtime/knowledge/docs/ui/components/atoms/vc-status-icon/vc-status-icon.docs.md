# VcStatusIcon

A simple boolean status indicator that displays a green check icon for active/success or a muted cross icon for inactive/failure. It is designed for compact spaces like table cells and lists where a full text label would be too verbose.

## When to Use

- Show on/off or pass/fail state in tables and lists (e.g., "Is Active", "Email Verified")
- Display system health checks with a quick visual indicator
- Compact boolean display in dense data views
- When NOT to use: multi-state status with labels (use [VcStatus](../vc-status/) instead); when you need to show more than two states (consider VcBadge with inline mode)

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

| Prop     | Type      | Default     | Description                                                           |
| -------- | --------- | ----------- | --------------------------------------------------------------------- |
| `status` | `boolean` | `undefined` | `true` shows a green check circle; `false` shows a muted cross circle |

## Common Patterns

### Boolean Column in a Table

```vue
<template>
  <VcColumn
    id="isActive"
    header="Active"
    :width="80"
  >
    <template #default="{ row }">
      <VcStatusIcon :status="row.isActive" />
    </template>
  </VcColumn>
</template>
```

### Multiple Boolean Columns

```vue
<template>
  <VcDataTable
    :columns="columns"
    :items="users"
  >
    <VcColumn
      id="emailVerified"
      header="Email"
      :width="70"
    >
      <template #default="{ row }">
        <VcStatusIcon :status="row.emailVerified" />
      </template>
    </VcColumn>
    <VcColumn
      id="isActive"
      header="Active"
      :width="70"
    >
      <template #default="{ row }">
        <VcStatusIcon :status="row.isActive" />
      </template>
    </VcColumn>
    <VcColumn
      id="hasAvatar"
      header="Avatar"
      :width="70"
    >
      <template #default="{ row }">
        <VcStatusIcon :status="!!row.avatarUrl" />
      </template>
    </VcColumn>
  </VcDataTable>
</template>
```

### System Health Dashboard

```vue
<template>
  <div class="tw-space-y-2">
    <div
      v-for="service in services"
      :key="service.name"
      class="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b"
    >
      <span>{{ service.name }}</span>
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-text-sm">{{ service.status ? "Online" : "Offline" }}</span>
        <VcStatusIcon :status="service.status" />
      </div>
    </div>
  </div>
</template>
```

## Recipe: Status Icon with Custom Label

VcStatusIcon is intentionally minimal. If you need a text label next to the icon, compose it yourself:

```vue
<template>
  <div class="tw-flex tw-items-center tw-gap-2">
    <VcStatusIcon :status="order.isPaid" />
    <span
      class="tw-text-sm"
      :class="order.isPaid ? 'tw-text-green-600' : 'tw-text-gray-400'"
    >
      {{ order.isPaid ? "Paid" : "Unpaid" }}
    </span>
  </div>
</template>
```

## CSS Custom Properties

| Variable                       | Default               | Description             |
| ------------------------------ | --------------------- | ----------------------- |
| `--status-icon-success-color`  | `var(--success-500)`  | Color of the check icon |
| `--status-icon-inactive-color` | `var(--neutrals-300)` | Color of the cross icon |

## Tips

- The component uses Lucide icons (`lucide-circle-check` and `lucide-circle-x`) internally. The icon inherits its size from the parent font size, so you can control it with Tailwind text-size classes on a wrapper.
- When `status` is `undefined`, the component still renders the inactive (cross) icon. If you want to hide the icon entirely when the value is unknown, use `v-if` on the component.
- For theming, override `--status-icon-success-color` to change the positive indicator to a different palette (e.g., `var(--primary-500)` for brand color).

## Accessibility

- Container has `role="img"` with `aria-label` set to "Active" or "Inactive" based on `status`
- Icons are marked `aria-hidden="true"` since the container carries the label
- Uses Lucide icons (`lucide-circle-check` and `lucide-circle-x`)

## Related Components

- [VcStatus](../vc-status/) -- labeled multi-variant status badge for richer state display
- [VcIcon](../vc-icon/) -- standalone icon component used internally
- [VcBadge](../vc-badge/) -- inline pill badges for multi-state indicators
