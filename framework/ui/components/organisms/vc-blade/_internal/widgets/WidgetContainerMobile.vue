<template>
  <div
    v-show="isAnyVisible"
    class="vc-widget-container-mobile"
  >
    <div
      ref="containerRef"
      class="vc-widget-container-mobile__content"
    >
      <component
        :is="widget.component"
        v-for="widget in visibleItems"
        :key="widget.id"
        v-bind="widget.props || {}"
        :data-item-key="widget.id"
        :widget-id="widget.id"
        v-on="widget.events || {}"
      />

      <VcDropdown
        v-if="showMoreButton"
        :model-value="showToolbar"
        :items="hiddenItems"
        floating
        placement="top-end"
        variant="secondary"
        class="vc-widget-container-mobile__more-dropdown"
        @update:model-value="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-widget-container-mobile__more"
            :class="{ 'vc-widget-container-mobile__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon icon="lucide-chevron-up" />
          </div>
        </template>

        <template #item="{ item }">
          <component
            :is="item.component"
            class="tw-p-3 tw-w-full"
            v-bind="item.props || {}"
            horizontal
            :widget-id="item.id"
            v-on="item.events || {}"
          />
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAdaptiveItems } from "../../../../../composables/useAdaptiveItems";
import { VcDropdown, VcIcon } from "../../../..";
import { IWidget } from "../../../../../../core/services";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const showToolbar = ref(false);
const isAnyVisible = computed(() => props.widgets.length > 0);

const { visibleItems, showMoreButton, hiddenItems } = useAdaptiveItems<IWidget>({
  containerRef,
  items: computed(() => props.widgets),
  getItemKey: (item: IWidget) => item.id ?? "",
  moreButtonWidth: 70,
  initialItemWidth: 80,
});

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color-mobile: var(--additional-50);
  --blade-toolbar-widgets-mobile-height: 80px;
}

.vc-widget-container-mobile {
  @apply tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-w-full tw-z-[54];
  height: var(--blade-toolbar-widgets-mobile-height);
  background-color: var(--blade-toolbar-widgets-bg-color-mobile);

  &__content {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-1 tw-px-[22px];
    height: var(--blade-toolbar-widgets-mobile-height);
  }

  &__more {
    @apply tw-flex tw-items-center tw-justify-center tw-px-2 tw-h-full tw-cursor-pointer;
    color: var(--blade-toolbar-icon-color);

    &:hover,
    &--active {
      color: var(--blade-toolbar-icon-hover-color);
      background-color: var(--blade-toolbar-widgets-bg-hover-color);
    }
  }

  &__more-dropdown {
    @apply tw-w-auto tw-ml-auto;
  }
}
</style>
