<template>
  <div class="vc-menu">
    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="vc-menu__skeleton"
    >
      <div
        v-for="(section, sIdx) in skeletonSections"
        :key="sIdx"
        class="vc-menu__skeleton-section"
      >
        <!-- Section header -->
        <div class="tw-flex tw-items-center tw-h-[30px] tw-px-1.5">
          <VcSkeleton
            variant="block"
            :width="section.titleWidth"
            :height="12"
          />
        </div>

        <!-- Items -->
        <div class="tw-flex tw-flex-col tw-gap-1">
          <template
            v-for="(item, iIdx) in section.items"
            :key="iIdx"
          >
            <!-- Group/item row: icon + text -->
            <div class="tw-flex tw-items-center tw-gap-1.5 tw-h-7 tw-px-1.5">
              <VcSkeleton
                variant="circle"
                :width="18"
                :height="18"
              />
              <VcSkeleton
                variant="block"
                :width="item.width"
                :height="14"
              />
            </div>

            <!-- Nested children -->
            <div
              v-if="item.children"
              class="tw-flex tw-flex-col tw-gap-1 tw-pl-3"
            >
              <div
                v-for="(child, cIdx) in item.children"
                :key="cIdx"
                class="tw-flex tw-items-center tw-gap-1.5 tw-h-6 tw-px-1.5"
              >
                <VcSkeleton
                  variant="circle"
                  :width="16"
                  :height="16"
                />
                <VcSkeleton
                  variant="block"
                  :width="child.width"
                  :height="12"
                />
              </div>
            </div>
          </template>
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

provide(
  VcMenuExpandedKey,
  computed(() => props.expanded),
);

// Skeleton layout mimicking a realistic menu structure
const skeletonSections = [
  {
    titleWidth: 70,
    items: [{ width: 90, children: [{ width: 65 }, { width: 80 }] }, { width: 75 }, { width: 100 }],
  },
  {
    titleWidth: 55,
    items: [{ width: 85 }, { width: 110, children: [{ width: 70 }, { width: 55 }] }],
  },
];
</script>

<style lang="scss">
:root {
  --vc-menu-gap: 8px;
}
.vc-menu {
  @apply tw-h-full;
  font-family: "Lato", sans-serif;

  &__items {
    @apply tw-flex tw-flex-col tw-h-full tw-pb-4;
  }

  &__skeleton {
    @apply tw-flex tw-flex-col tw-gap-5 tw-py-2 tw-pr-2;
  }

  &__skeleton-section + &__skeleton-section {
    @apply tw-border-t tw-border-neutrals-100 tw-pt-5;
  }
}
</style>
