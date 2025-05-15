<template>
  <div
    v-show="isAnyVisible"
    class="widget-container-mobile"
  >
    <div
      ref="containerRef"
      class="widget-container-mobile__content"
    >
      <component
        :is="widget.component"
        v-for="widget in visibleItems"
        :key="widget.id"
        v-bind="widget.props || {}"
        :data-item-key="widget.id"
        v-on="widget.events || {}"
      />

      <GenericDropdown
        v-if="showMoreButton"
        :opened="showToolbar"
        :items="hiddenItems"
        floating
        placement="top-end"
        variant="secondary"
        class="widget-container-mobile__more-dropdown"
        @update:opened="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="widget-container-mobile__more"
            :class="{ 'widget-container-mobile__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon :icon="ChevronUpIcon" />
          </div>
        </template>

        <template #item="{ item }">
          <component
            :is="item.component"
            class="tw-p-3 tw-w-full"
            v-bind="item.props || {}"
            horizontal
            v-on="item.events || {}"
          />
        </template>
      </GenericDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useAdaptiveItems } from "../../../../../../composables/useAdaptiveItems";

import { GenericDropdown } from "../../../../../../../shared/components/generic-dropdown";
import { VcIcon, ChevronUpIcon } from "../../../../..";
import { IWidget } from "../../../../../../../core/services";
import { BladeInstance } from "../../../../../../../injection-keys";
import { IBladeInstance } from "../../../../../../../shared/components/blade-navigation/types";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const showToolbar = ref(false);
const bladeInstance = inject<IBladeInstance>(BladeInstance);

const isAnyVisible = computed(() =>
  props.widgets.some((widget) => {
    if (typeof widget.isVisible === "function") {
      return widget.isVisible(bladeInstance);
    } else if (typeof widget.isVisible === "boolean") {
      return widget.isVisible;
    }
    return widget.isVisible;
  }),
);

const { visibleItems, showMoreButton, recalculate, hiddenItems, updateObserver } = useAdaptiveItems<IWidget>({
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
  --blade-toolbar-widgets-mobile-height: 80px;
}

.widget-container-mobile {
  position: fixed;
  bottom: 0;
  left: 0 !important;
  right: 0;
  width: 100%;
  height: var(--blade-toolbar-widgets-mobile-height);
  z-index: 54;
  background-color: var(--blade-toolbar-widgets-bg-color-mobile);

  &__content {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 22px;
    gap: 4px;
    height: var(--blade-toolbar-widgets-mobile-height);
  }

  &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    height: 100%;
    cursor: pointer;
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
