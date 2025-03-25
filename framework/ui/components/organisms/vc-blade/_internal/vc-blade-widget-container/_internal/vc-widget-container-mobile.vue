<template>
  <div class="widget-container-mobile">
    <!-- Measure container -->
    <div class="widget-container-mobile__measure">
      <template
        v-for="widget in widgets"
        :key="`measure-${widget.id}`"
      >
        <div class="widget-container-mobile__measure-item">
          <component
            :is="widget.component"
            v-bind="widget.props || {}"
            :ref="(el: any) => (el && '$el' in el ? setElementRef(widget.id, el.$el) : null)"
            v-on="widget.events || {}"
          />
        </div>
      </template>
    </div>

    <!-- Actual widgets -->
    <div
      ref="containerRef"
      class="widget-container-mobile__content"
    >
      <component
        :is="widget.component"
        v-for="widget in displayedItems"
        :key="widget.id"
        v-bind="widget.props || {}"
        v-on="widget.events || {}"
      />

      <GenericDropdown
        v-if="showMoreButton"
        :opened="showToolbar"
        :items="overflowItems"
        floating
        placement="top-end"
        variant="light"
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
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { useVisibleElements } from "../../../../../../composables/useVisibleElements";
import { IWidget } from "../../../../../../../core/types/widget";
import { GenericDropdown } from "../../../../../../../shared/components/generic-dropdown";
import { VcIcon, ChevronUpIcon } from "../../../../..";

interface Props {
  widgets: IWidget[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const showToolbar = ref(false);

const { setElementRef, displayedItems, overflowItems, showMoreButton, calculateVisibleElements } =
  useVisibleElements<IWidget>({
    containerRef,
    items: computed(() => props.widgets),
    getItemId: (item: IWidget) => item.id ?? "",
    moreButtonWidth: 70,
  });

const observer = new MutationObserver(() => {
  nextTick(calculateVisibleElements);
});

onMounted(() => {
  nextTick(() => {
    if (containerRef.value) {
      observer.observe(containerRef.value, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      const resizeObserver = new ResizeObserver(() => {
        nextTick(calculateVisibleElements);
      });

      resizeObserver.observe(containerRef.value);
      calculateVisibleElements();
    }
  });
});

onBeforeUnmount(() => {
  observer.disconnect();
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

  &__measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    display: flex;
    height: 0;
    overflow: hidden;
    left: -9999px;
    gap: 4px;
    width: 100%;
    align-items: center;
    padding: 0 22px;
  }

  &__measure-item {
    display: flex;
  }

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
