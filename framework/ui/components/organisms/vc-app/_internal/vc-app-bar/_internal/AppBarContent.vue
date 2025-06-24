<template>
  <div
    class="app-bar-content"
    :class="{ 'app-bar-content--collapsed': !expanded }"
  >
    <div class="app-bar-content__main">
      <slot name="navmenu" />
    </div>
    <div class="app-bar-content__footer">
      <slot name="user-dropdown" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MaybeRef } from "vue";

defineProps<{
  expanded: MaybeRef<boolean>;
}>();
</script>

<style lang="scss">
.app-bar-content {
  @apply tw-flex tw-flex-col;
  height: calc(100% - var(--app-bar-height));

  &--collapsed {
    height: calc(100% - var(--app-bar-height));
  }

  &__main {
    @apply tw-flex-grow tw-overflow-auto;
    padding: var(--app-bar-padding);
    padding-top: 1.5rem;
  }

  &__footer {
    @apply tw-flex-none tw-mt-auto;
  }

  &:before {
    content: "";
    @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px] tw-z-[1];
    background-color: var(--app-bar-border);
  }
}
</style>
