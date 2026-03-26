<template>
  <div
    class="vc-blade-toolbar vc-blade-toolbar-skeleton"
    :class="{
      'vc-blade-toolbar--mobile': isMobile,
    }"
  >
    <div class="vc-blade-toolbar__content">
      <div class="vc-blade-toolbar-skeleton__buttons">
        <VcSkeleton
          v-for="i in 3"
          :key="i"
          variant="block"
          :width="60"
          :height="32"
        />
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
    @apply tw-flex tw-items-center tw-gap-3 tw-px-4;
  }
}
</style>
