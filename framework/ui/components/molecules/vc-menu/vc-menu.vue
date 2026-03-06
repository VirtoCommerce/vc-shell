<template>
  <div class="vc-menu">
    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="vc-menu__skeleton"
    >
      <div
        v-for="section in 3"
        :key="section"
        class="vc-menu__skeleton-section"
      >
        <VcSkeleton
          variant="block"
          :width="sectionWidths[section - 1]"
          height="16"
        />
        <div class="vc-menu__skeleton-items">
          <div
            v-for="item in (section === 1 ? 3 : 2)"
            :key="item"
            class="vc-menu__skeleton-item"
          >
            <VcSkeleton
              variant="circle"
              :width="18"
              :height="18"
            />
            <VcSkeleton
              variant="block"
              :width="itemWidths[(section - 1) * 3 + item - 1] ?? '60%'"
              height="14"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Menu content -->
    <div
      v-else-if="$slots.default"
      class="vc-menu__items"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, provide } from "vue";
import { VcMenuExpandedKey } from "@ui/components/molecules/vc-menu/constants";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";

interface VcMenuProps {
  expanded?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<VcMenuProps>(), {
  expanded: true,
  loading: false,
});

defineOptions({
  name: "VcMenu",
});

defineSlots<{
  default: () => unknown;
}>();

provide(VcMenuExpandedKey, computed(() => props.expanded));

// Skeleton variation widths for natural look
const sectionWidths = ["40%", "55%", "35%"];
const itemWidths = ["70%", "55%", "65%", "50%", "60%", "45%", "55%", "70%", "50%"];
</script>

<style lang="scss">
.vc-menu {
  @apply tw-h-full;

  &__items {
    @apply tw-flex tw-flex-col tw-h-full;
    gap: var(--vc-menu-gap, 2px);
  }

  &__skeleton {
    @apply tw-flex tw-flex-col tw-gap-5 tw-p-2;
  }

  &__skeleton-section {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__skeleton-items {
    @apply tw-flex tw-flex-col tw-gap-[6px] tw-pl-1;
  }

  &__skeleton-item {
    @apply tw-flex tw-items-center tw-gap-2;
  }
}
</style>
