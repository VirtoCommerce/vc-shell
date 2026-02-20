<template>
  <div class="vc-widget-container-desktop">
    <div class="vc-widget-container-desktop__content">
      <component
        :is="widget.component"
        v-for="widget in displayedItems"
        :key="widget.id"
        v-bind="widget.props || {}"
        :widget-id="widget.id"
        v-on="widget.events || {}"
      />

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
          <WidgetDropdownItem
            v-if="item.trigger"
            :icon="item.trigger.icon"
            :title="item.trigger.title || item.title || ''"
            :badge="item.trigger.badge"
            :disabled="resolveDisabled(item.trigger.disabled)"
            @click="handleTriggerClick(item)"
          />
          <component
            v-else
            :is="item.component"
            class="tw-w-full"
            v-bind="item.props || {}"
            horizontal
            :widget-id="item.id"
            v-on="item.events || {}"
            @click="showToolbar = false"
          />
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toValue, type Ref, type ComputedRef } from "vue";
import { IWidget } from "@core/services";
import { useWidgets } from "@core/composables";
import { VcDropdown, VcIcon } from "@ui/components";
import WidgetDropdownItem from "./WidgetDropdownItem.vue";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const showToolbar = ref(false);
const widgetService = useWidgets();

const displayedItems = computed(() => props.widgets.slice(0, 3));
const overflowItems = computed(() => props.widgets.slice(3));
const showMoreButton = computed(() => props.widgets.length > 3);

function resolveDisabled(disabled: Ref<boolean> | ComputedRef<boolean> | boolean | undefined): boolean {
  if (disabled === undefined) return false;
  return typeof disabled === "boolean" ? disabled : toValue(disabled);
}

function handleTriggerClick(widget: IWidget) {
  showToolbar.value = false;
  if (widget.trigger?.onClick) {
    widget.trigger.onClick();
  }
  widgetService.setActiveWidget({ widgetId: widget.id });
}
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
