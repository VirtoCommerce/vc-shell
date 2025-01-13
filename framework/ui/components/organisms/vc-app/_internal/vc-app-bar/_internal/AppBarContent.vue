<template>
  <template v-if="(isContentOpen || $isDesktop.value) && !$isMobile.value">
    <div class="app-bar-content">
      <div class="app-bar-content__main">
        <slot name="navmenu" />
      </div>
      <div class="app-bar-content__footer">
        <slot name="user-dropdown" />
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
defineProps<{
  isContentOpen: boolean;
}>();
</script>

<style lang="scss">
.app-bar-content {
  @apply tw-flex tw-flex-col tw-h-full;

  &__main {
    @apply tw-flex-grow tw-px-[var(--app-bar-padding)] tw-pt-6;
  }

  &__footer {
    @apply tw-flex-none;
  }
}
</style>
