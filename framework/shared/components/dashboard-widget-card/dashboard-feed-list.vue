<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="tw-divide-y tw-divide-[var(--neutrals-200)]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  default: (props: any) => any;
}>();
</script>
