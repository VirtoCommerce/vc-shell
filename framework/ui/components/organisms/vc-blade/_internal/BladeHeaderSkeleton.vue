<template>
  <div class="vc-blade-header-skeleton">
    <!-- Icon placeholder -->
    <div class="vc-blade-header-skeleton__icon">
      <VcSkeleton
        variant="circle"
        :width="24"
        :height="24"
      />
    </div>

    <div class="vc-blade-header-skeleton__text">
      <!-- Title placeholder -->
      <VcSkeleton
        variant="block"
        :width="180"
        :height="19"
      />
      <!-- Subtitle placeholder -->
      <div class="tw-mt-1.5">
        <VcSkeleton
          variant="block"
          :width="120"
          :height="12"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

defineOptions({ name: "BladeHeaderSkeleton" });
</script>

<style lang="scss">
.vc-blade-header-skeleton {
  @apply tw-shrink-0 tw-flex tw-items-center tw-gap-3 tw-px-6
    tw-border-solid tw-border-b tw-border-b-[color:var(--blade-header-border-color)]
    tw-bg-[color:var(--blade-header-background-color)];
  height: var(--blade-header-height, 70px);

  &__icon {
    @apply tw-shrink-0;
  }

  &__text {
    @apply tw-overflow-hidden;
  }
}
</style>
