<template>
  <div class="vc-widget-container-desktop">
    <div class="vc-widget-container-desktop__content">
      <template
        v-for="widget in displayedItems"
        :key="widget.id"
      >
        <!-- Headless: framework renders VcWidget from config -->
        <VcWidget
          v-if="widget.headless"
          v-loading:500="resolveLoading(widget)"
          :icon="widget.headless?.icon"
          :title="resolveTitle(widget)"
          :value="resolveBadge(widget)"
          :disabled="resolveDisabled(widget)"
          :widget-id="widget.id"
          @click="handleHeadlessClick(widget)"
        />

        <!-- Component-based: external widgets / legacy -->
        <WidgetProvider
          v-else
          :widget-id="widget.id"
        >
          <component
            :is="widget.component"
            v-bind="widget.props || {}"
            :widget-id="widget.id"
            v-on="widget.events || {}"
          />
        </WidgetProvider>
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
          <VcWidget
            v-if="item.headless"
            v-loading:500="resolveLoading(item)"
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
          <WidgetProvider
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
          </WidgetProvider>
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
import WidgetProvider from "./WidgetProvider.vue";
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

  // Suppress widget's own hover inside dropdown — the dropdown item wrapper provides hover feedback
  .vc-dropdown__item {
    --widget-bg-hover-color: transparent;
    --widget-icon-hover-color: var(--widget-icon-color);
    --widget-title-hover-color: var(--widget-title-color);
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
