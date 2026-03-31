<template>
  <div class="vc-widget-container-desktop">
    <div class="vc-widget-container-desktop__content">
      <template
        v-for="widget in displayedItems"
        :key="widget.id"
      >
        <!-- Headless: framework renders VcWidget from config -->
        <VcSkeleton
          v-if="widget.headless && resolveLoading(widget)"
          variant="block"
          :width="48"
          :height="48"
        />
        <VcWidget
          v-else-if="widget.headless"
          :icon="widget.headless?.icon"
          :title="resolveTitle(widget)"
          :value="resolveBadge(widget)"
          :disabled="resolveDisabled(widget)"
          :widget-id="widget.id"
          @click="handleHeadlessClick(widget)"
        />

        <!-- Component-based: external widgets / legacy -->
        <WidgetScope
          v-else
          :widget-id="widget.id"
        >
          <component
            :is="widget.component"
            v-bind="widget.props || {}"
            :widget-id="widget.id"
            v-on="widget.events || {}"
          />
        </WidgetScope>
      </template>

      <VcDropdown
        v-if="showMoreButton"
        :model-value="showToolbar"
        :items="overflowItems"
        floating
        placement="bottom-end"
        variant="secondary"
        @update:model-value="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-widget-container-desktop__more"
            :class="{ 'vc-widget-container-desktop__more--active': isActive }"
            @click="showToolbar = !showToolbar"
          >
            <VcIcon icon="lucide-chevron-down" />
          </div>
        </template>

        <template #item="{ item }">
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
              showToolbar = false;
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
              @click="showToolbar = false"
            />
          </WidgetScope>
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IWidget } from "@core/services/widget-service";
import { VcDropdown } from "@ui/components/molecules/vc-dropdown";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcWidget } from "@ui/components/atoms/vc-widget";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import WidgetScope from "./WidgetScope.vue";
import { useHeadlessWidgetHelpers } from "./useHeadlessWidgetHelpers";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const showToolbar = ref(false);
const { resolveBadge, resolveLoading, resolveDisabled, resolveTitle, handleHeadlessClick } = useHeadlessWidgetHelpers();

const displayedItems = computed(() => props.widgets.slice(0, 3));
const overflowItems = computed(() => props.widgets.slice(3));
const showMoreButton = computed(() => props.widgets.length > 3);
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color: var(--neutrals-100);
  --blade-toolbar-widgets-bg-hover-color: var(--neutrals-200);
}

.vc-widget-container-desktop {
  @apply tw-relative tw-flex tw-select-none tw-shrink-0;
  width: fit-content;
  background-color: var(--blade-toolbar-widgets-bg-color);

  &__content {
    @apply tw-flex tw-flex-row tw-gap-1;
  }

  // Style widgets inside dropdown to match VcDropdownItem appearance
  .vc-dropdown__item {
    // Suppress widget's own hover — the dropdown item wrapper provides hover feedback
    --widget-bg-hover-color: transparent;
    --widget-bg-color: transparent;
    --widget-icon-hover-color: var(--widget-icon-color);
    --widget-title-hover-color: var(--widget-title-color);
    --widget-border-radius: 0;

    .vc-widget--horizontal {
      @apply tw-px-2 tw-py-[6px] tw-gap-2;

      .vc-widget__icon-container {
        @apply tw-flex tw-items-center tw-justify-center;
      }

      .vc-widget__icon {
        font-size: 14px;
      }

      .vc-widget__content {
        @apply tw-ml-0;
      }

      .vc-widget__title {
        @apply tw-mt-0 tw-text-xs tw-font-normal;
      }
    }
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
}
</style>
