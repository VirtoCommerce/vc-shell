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
        <VcWidget
          v-if="widget.kind === 'headless'"
          v-loading:500="resolveLoading(widget)"
          :icon="widget.headless?.icon"
          :title="resolveTitle(widget)"
          :value="resolveBadge(widget)"
          :data-item-key="widget.id"
          :widget-id="widget.id"
          @click="handleHeadlessClick(widget)"
        />
        <component
          v-else
          :is="widget.component"
          v-bind="widget.props || {}"
          :data-item-key="widget.id"
          :widget-id="widget.id"
          v-on="widget.events || {}"
        />
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
          <VcWidget
            v-if="item.kind === 'headless'"
            v-loading:500="resolveLoading(item)"
            class="tw-w-full"
            :icon="item.headless?.icon"
            :title="resolveTitle(item)"
            :value="resolveBadge(item)"
            :widget-id="item.id"
            horizontal
            @click="handleHeadlessClick(item); showOverflow = false"
          />
          <component
            v-else
            :is="item.component"
            class="tw-w-full"
            v-bind="item.props || {}"
            horizontal
            :widget-id="item.id"
            v-on="item.events || {}"
            @click="showOverflow = false"
          />
        </template>
      </div>
    </VcSidebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcWidget } from "@ui/components/atoms/vc-widget";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { IWidget } from "@core/services/widget-service";
import { useWidgets } from "@core/composables/useWidgets";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const { t } = useI18n({ useScope: "global" });
const containerRef = ref<HTMLElement | null>(null);
const showOverflow = ref(false);
const widgetService = useWidgets();
const isAnyVisible = computed(() => props.widgets.length > 0);

const { visibleItems, showMoreButton, hiddenItems } = useAdaptiveItems<IWidget>({
  containerRef,
  items: computed(() => props.widgets),
  getItemKey: (item: IWidget) => item.id ?? "",
  moreButtonWidth: 70,
  initialItemWidth: 80,
});

function resolveBadge(widget: IWidget): string | number | undefined {
  const badge = widget.headless?.badge;
  if (badge === undefined) return undefined;
  return toValue(badge);
}

function resolveLoading(widget: IWidget): boolean {
  const loading = widget.headless?.loading;
  if (loading === undefined) return false;
  return toValue(loading);
}

function resolveTitle(widget: IWidget): string {
  const title = widget.title ?? "";
  return widget.kind === "headless" ? t(title) : title;
}

function handleHeadlessClick(widget: IWidget) {
  widgetService.setActiveWidget({ widgetId: widget.id });
  widget.headless?.onClick?.();
}
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
