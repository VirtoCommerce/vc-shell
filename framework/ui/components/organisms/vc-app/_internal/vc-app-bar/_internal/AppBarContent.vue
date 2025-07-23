<template>
  <div
    class="app-bar-content"
    :class="{ 'app-bar-content--collapsed': !expanded, 'app-bar-content--embedded': isEmbedded }"
  >
    <div class="app-bar-content__main">
      <slot name="navmenu" />
    </div>
    <div
      v-if="!isEmbedded"
      class="app-bar-content__footer"
    >
      <slot name="user-dropdown" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MaybeRef, inject } from "vue";
import { EMBEDDED_MODE } from "../../../../../../../injection-keys";

defineProps<{
  expanded: MaybeRef<boolean>;
}>();

const isEmbedded = inject(EMBEDDED_MODE);
</script>

<style lang="scss">
.app-bar-content {
  @apply tw-flex tw-flex-col;
  height: calc(100% - var(--app-bar-height));

  &--collapsed {
    height: calc(100% - var(--app-bar-height));
  }

  &--embedded {
    height: 100%;
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
