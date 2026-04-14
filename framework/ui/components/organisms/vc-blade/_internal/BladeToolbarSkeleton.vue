<template>
  <div
    v-if="!isMobile"
    class="vc-blade-toolbar vc-blade-toolbar-skeleton"
  >
    <div class="vc-blade-toolbar__content">
      <div class="vc-blade-toolbar-skeleton__buttons">
        <div
          v-for="i in 3"
          :key="i"
          class="vc-blade-toolbar-skeleton__button"
        >
          <VcSkeleton
            variant="circle"
            :width="18"
            :height="18"
          />
          <VcSkeleton
            variant="block"
            :width="28 + i * 6"
            :height="10"
          />
        </div>
      </div>

      <div class="vc-blade-toolbar-skeleton__widgets">
        <div
          v-for="i in 2"
          :key="'w' + i"
          class="vc-blade-toolbar-skeleton__widget"
        >
          <VcSkeleton
            variant="circle"
            :width="18"
            :height="18"
          />
          <VcSkeleton
            variant="block"
            :width="30 + i * 4"
            :height="10"
            class="tw-mt-1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { useResponsive } from "@framework/core/composables/useResponsive";

defineOptions({ name: "BladeToolbarSkeleton" });

const { isMobile } = useResponsive();
</script>

<style lang="scss">
.vc-blade-toolbar-skeleton {
  &__buttons {
    @apply tw-flex tw-items-center tw-px-4 tw-flex-1 tw-min-w-0;
  }

  &__button {
    @apply tw-shrink-0 tw-px-3 tw-inline-flex tw-flex-col tw-items-center tw-gap-1;
  }

  &__widgets {
    @apply tw-flex tw-flex-row tw-gap-1 tw-shrink-0;
    background-color: var(--blade-toolbar-widgets-bg-color);
  }

  &__widget {
    @apply tw-shrink-0 tw-px-2 tw-py-1.5 tw-flex tw-flex-col tw-items-center tw-justify-center;
  }
}
</style>
