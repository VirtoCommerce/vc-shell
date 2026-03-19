<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div
    class="dashboard-feed-row"
    @click="$emit('click')"
  >
    <div class="tw-flex tw-items-center tw-gap-2.5 tw-min-w-0">
      <slot />
    </div>
    <div
      v-if="$slots.trailing"
      class="tw-flex tw-items-center tw-gap-3 tw-flex-shrink-0 tw-ml-3"
    >
      <slot name="trailing" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  click: [];
}>();

defineSlots<{
  default: (props: any) => any;
  trailing: (props: any) => any;
}>();
</script>
