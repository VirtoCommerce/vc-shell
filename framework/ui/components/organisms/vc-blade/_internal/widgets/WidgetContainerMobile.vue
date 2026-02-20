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

      <div
        v-if="showMoreButton"
        data-more-button
        class="vc-widget-container-mobile__more"
        @click="showOverflow = true"
      >
        <VcIcon icon="lucide-chevron-up" />
      </div>
    </div>

    <VcSidebar
      :model-value="showOverflow"
      position="bottom"
      size="sm"
      draggable
      drag-handle
      :close-button="false"
      :inset="false"
      @update:model-value="showOverflow = $event"
    >
      <div class="vc-widget-container-mobile__overflow-list">
        <component
          :is="item.component"
          v-for="item in hiddenItems"
          :key="item.id"
          class="tw-w-full"
          v-bind="item.props || {}"
          horizontal
          :widget-id="item.id"
          v-on="item.events || {}"
          @click="showOverflow = false"
        />
      </div>
    </VcSidebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import { VcIcon } from "@ui/components";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { IWidget } from "@core/services";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const showOverflow = ref(false);
const isAnyVisible = computed(() => props.widgets.length > 0);

const { visibleItems, showMoreButton, hiddenItems } = useAdaptiveItems<IWidget>({
  containerRef,
  items: computed(() => props.widgets),
  getItemKey: (item: IWidget) => item.id ?? "",
  moreButtonWidth: 70,
  initialItemWidth: 80,
});
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

  &__overflow-list {
    @apply tw-flex tw-flex-col tw-gap-2 tw-p-4;
  }
}
</style>
