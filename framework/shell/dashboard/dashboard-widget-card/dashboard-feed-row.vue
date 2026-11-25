<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div
    class="dashboard-feed-row"
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown.enter="onKeydown"
    @keydown.space="onKeydown"
  >
    <div class="tw-flex tw-items-center tw-gap-2.5 tw-min-w-0">
      <slot />
    </div>
    <div
      v-if="$slots.trailing"
      class="tw-flex tw-items-center tw-gap-3 tw-flex-shrink-0 tw-ms-3"
    >
      <slot name="trailing" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();

// The row looks and acts clickable, so it opens from the keyboard too; a control in the
// trailing slot keeps its own Enter/Space
function onKeydown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return;
  event.preventDefault();
  emit("click");
}

defineSlots<{
  default: (props: any) => any;
  trailing: (props: any) => any;
}>();
</script>
