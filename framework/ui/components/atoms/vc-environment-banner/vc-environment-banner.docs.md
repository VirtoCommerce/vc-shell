---
title: VcEnvironmentBanner
category: components
group: feedback
---

# VcEnvironmentBanner

Centered badge pinned to the top of the application that labels the current
environment (Development, QA, Demo, etc.). Mirrors the platform environment
banner (vc-env-badge). Purely presentational — it renders the colored badge and
its label, and does not know where the name comes from. Visibility and color are
decided by the caller (see `useEnvironmentName`).

## When to Use

- Inside the app shell to make non-production environments visually obvious
- When NOT to use: do not place it manually in blades — `VcApp` already mounts it

## Props

- `name: string` — environment label to render
- `color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'` — badge color (vc-shell theme tokens), default `neutral`

## Quick Start

```vue
<template>
  <VcEnvironmentBanner
    v-if="!isIgnored"
    :name="environmentName"
    :color="color"
  />
</template>

<script setup>
import { VcEnvironmentBanner } from "@vc-shell/framework";
import { useEnvironmentName } from "@vc-shell/framework";

const { environmentName, isIgnored, color } = useEnvironmentName();
</script>
```
