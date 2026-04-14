<template>
  <div
    v-show="isAnyVisible"
    class="vc-widget-container-mobile"
  >
    <div
      ref="containerRef"
      class="vc-widget-container-mobile__content"
    >
      <template
        v-for="widget in visibleItems"
        :key="widget.id"
      >
        <div
          v-if="widget.headless && resolveLoading(widget)"
          class="vc-widget-container-mobile__widget-skeleton"
          :data-item-key="widget.id"
        >
          <VcSkeleton
            variant="circle"
            :width="18"
            :height="18"
          />
          <VcSkeleton
            variant="block"
            :width="36"
            :height="10"
            class="tw-mt-1"
          />
        </div>
        <VcWidget
          v-else-if="widget.headless"
          :icon="widget.headless?.icon"
          :title="resolveTitle(widget)"
          :value="resolveBadge(widget)"
          :disabled="resolveDisabled(widget)"
          :data-item-key="widget.id"
          :widget-id="widget.id"
          @click="handleHeadlessClick(widget)"
        />
        <WidgetScope
          v-else
          :widget-id="widget.id"
        >
          <component
            :is="widget.component"
            v-bind="widget.props || {}"
            :data-item-key="widget.id"
            :widget-id="widget.id"
            v-on="widget.events || {}"
          />
        </WidgetScope>
      </template>

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
        <template
          v-for="item in hiddenItems"
          :key="item.id"
        >
          <VcSkeleton
            v-if="item.headless && resolveLoading(item)"
            variant="block"
            width="100%"
            :height="32"
          />
          <VcWidget
            v-else-if="item.headless"
            class="tw-w-full"
            :icon="item.headless?.icon"
            :title="resolveTitle(item)"
            :value="resolveBadge(item)"
            :disabled="resolveDisabled(item)"
            :widget-id="item.id"
            horizontal
            @click="
              handleHeadlessClick(item);
              showOverflow = false;
            "
          />
          <WidgetScope
            v-else
            :widget-id="item.id"
          >
            <component
              :is="item.component"
              class="tw-w-full"
              v-bind="item.props || {}"
              horizontal
              :widget-id="item.id"
              v-on="item.events || {}"
              @click="showOverflow = false"
            />
          </WidgetScope>
        </template>
      </div>
    </VcSidebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcWidget } from "@ui/components/atoms/vc-widget";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { IWidget } from "@core/services/widget-service";
import { useHeadlessWidgetHelpers } from "./useHeadlessWidgetHelpers";
import WidgetScope from "./WidgetScope.vue";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const showOverflow = ref(false);
const isAnyVisible = computed(() => props.widgets.length > 0);
const { resolveBadge, resolveLoading, resolveDisabled, resolveTitle, handleHeadlessClick } = useHeadlessWidgetHelpers();

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
  @apply tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-w-full tw-z-[var(--z-layout-widget)];
  height: var(--blade-toolbar-widgets-mobile-height);
  background-color: var(--blade-toolbar-widgets-bg-color-mobile);

  &__content {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-1 tw-px-[22px] tw-w-full tw-overflow-hidden;
    height: var(--blade-toolbar-widgets-mobile-height);
  }

  &__widget-skeleton {
    @apply tw-shrink-0 tw-px-2 tw-py-1.5 tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__more {
    @apply tw-flex tw-items-center tw-justify-center tw-px-2 tw-h-full tw-cursor-pointer tw-ml-auto;
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
