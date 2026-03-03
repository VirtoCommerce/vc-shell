<template>
  <div class="vc-blade-content-skeleton">
    <!-- Section 1: main fields -->
    <div class="vc-blade-content-skeleton__section">
      <VcSkeleton
        variant="block"
        :width="130"
        :height="14"
      />
      <div class="vc-blade-content-skeleton__fields">
        <div
          v-for="i in 3"
          :key="'a' + i"
          class="vc-blade-content-skeleton__field"
        >
          <VcSkeleton
            variant="block"
            :width="60 + i * 20"
            :height="11"
          />
          <div class="vc-blade-content-skeleton__input" />
        </div>
      </div>
    </div>

    <!-- Section 2: more fields + textarea -->
    <div class="vc-blade-content-skeleton__section">
      <VcSkeleton
        variant="block"
        :width="110"
        :height="14"
      />
      <div class="vc-blade-content-skeleton__fields">
        <div
          v-for="i in 2"
          :key="'b' + i"
          class="vc-blade-content-skeleton__field"
        >
          <VcSkeleton
            variant="block"
            :width="70 + i * 15"
            :height="11"
          />
          <div class="vc-blade-content-skeleton__input" />
        </div>
        <div class="vc-blade-content-skeleton__field">
          <VcSkeleton
            variant="block"
            :width="95"
            :height="11"
          />
          <div class="vc-blade-content-skeleton__input vc-blade-content-skeleton__input--tall" />
        </div>
      </div>
    </div>

    <!-- Section 3: short section -->
    <div class="vc-blade-content-skeleton__section">
      <VcSkeleton
        variant="block"
        :width="150"
        :height="14"
      />
      <div class="vc-blade-content-skeleton__fields">
        <div
          v-for="i in 2"
          :key="'c' + i"
          class="vc-blade-content-skeleton__field"
        >
          <VcSkeleton
            variant="block"
            :width="55 + i * 25"
            :height="11"
          />
          <div class="vc-blade-content-skeleton__input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

defineOptions({ name: "BladeContentSkeleton" });
</script>

<style lang="scss">
.vc-blade-content-skeleton {
  @apply tw-flex-1 tw-overflow-auto tw-p-5 tw-flex tw-flex-col tw-gap-6;

  &__section {
    @apply tw-flex tw-flex-col tw-gap-4;
  }

  &__fields {
    @apply tw-flex tw-flex-col tw-gap-4;
  }

  &__field {
    @apply tw-flex tw-flex-col tw-gap-1.5;
  }

  &__input {
    @apply tw-h-9 tw-rounded-md tw-animate-pulse;
    @apply tw-bg-[color:var(--vc-skeleton-bg)];

    &--tall {
      @apply tw-h-20;
    }
  }
}
</style>
