<template>
  <div
    v-if="isToolbarVisible()"
    class="vc-blade-toolbar"
    :class="{ 'vc-blade-toolbar--expanded': isExpanded }"
  >
    <div
      ref="toolbarContentRef"
      class="vc-blade-toolbar__content"
    >
      <template v-if="slots['widgets-container']">
        <template
          v-for="item in displayedItems"
          :key="item.id"
        >
          <VcBladeToolbarButton
            :id="item.id"
            :is-expanded="isExpanded"
            :icon="item.icon"
            :title="unref(item.title)"
            :disabled="item.disabled as boolean"
            :separator="item.separator"
            :click-handler="item.clickHandler"
          />
        </template>

        <GenericDropdown
          :opened="showToolbar"
          :items="overflowItems"
          floating
          placement="bottom-end"
          :on-item-click="onItemClick"
          @update:opened="showToolbar = $event"
        >
          <template #trigger>
            <div
              v-if="showMoreButton"
              class="vc-blade-toolbar__more"
              @click="toggleToolbar"
            >
              <VcIcon :icon="CircleDotsIcon" />
              <span class="vc-blade-toolbar__more-text">More</span>
            </div>
          </template>

          <template #item="{ item }">
            <div class="vc-blade-toolbar__more-item">
              <VcIcon
                class="vc-blade-toolbar-button__icon"
                :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
                size="m"
              />
              <div class="vc-blade-toolbar-button__title">{{ item.title }}</div>
            </div>
          </template>
        </GenericDropdown>
      </template>
      <template v-else>
        <template
          v-for="item in visibleItems"
          :key="item.id"
        >
          <VcBladeToolbarButton
            :id="item.id"
            :is-expanded="isExpanded"
            :icon="item.icon"
            :title="unref(item.title)"
            :disabled="item.disabled as boolean"
            :separator="item.separator"
            :click-handler="item.clickHandler"
          />
        </template>
      </template>
    </div>

    <div class="vc-blade-toolbar__toolbar-container">
      <div
        v-if="!slots['widgets-container']"
        id="vc-blade-toolbar-container"
        class="tw-w-full tw-max-w-[500px]"
      ></div>
      <div
        v-if="slots['widgets-container']"
        class="vc-blade-toolbar__toolbar-container-inner"
      >
        <slot name="widgets-container"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IBladeToolbar } from "./../../../../../../core/types";
import { unref, ref, computed, useSlots, onMounted, onBeforeUnmount, inject, ComputedRef, provide } from "vue";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";
import { VcIcon } from "./../../../../";
import { useLocalStorage } from "@vueuse/core";
import { GenericDropdown } from "../../../../../../shared/components/generic-dropdown";
import { usePermissions } from "../../../../../../core/composables";
import { CircleDotsIcon } from "../../../../atoms/vc-icon/icons";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

defineSlots<{
  "widgets-container": void;
  "custom-container": void;
}>();

const isExpanded = useLocalStorage("VC_BLADE_TOOLBAR_IS_EXPANDED", true);
const { hasAccess } = usePermissions();
const bladeExpanded = inject("$bladeExpanded") as ComputedRef<boolean>;
const toolbarContainerId = "vc-blade-toolbar-container";

const showToolbar = ref(false);

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};

const slots = useSlots();

function onItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
}

const toolbarContentRef = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);

const toolbarSpace = ref(0);

const checkOverflow = () => {
  if (toolbarContentRef.value) {
    const element = toolbarContentRef.value;
    isOverflowing.value = element.scrollWidth > element.clientWidth;
  }
};

// Setup resize observer
onMounted(() => {
  const resizeObserver = new ResizeObserver(checkOverflow);
  if (toolbarContentRef.value) {
    resizeObserver.observe(toolbarContentRef.value);
  }

  // Cleanup
  onBeforeUnmount(() => {
    resizeObserver.disconnect();
  });

  const container = document.getElementById(toolbarContainerId);
  if (container) {
    const observer = new ResizeObserver((entries) => {
      toolbarSpace.value = entries[0].contentRect.width;
    });
    observer.observe(container);
  }
});

const visibleItems = computed(() => {
  return props.items.filter(
    (item) => hasAccess(item.permissions) && (item.isVisible === undefined || item.isVisible) && !item.disabled,
  );
});

const displayedItems = computed(() => {
  console.log("displayedItems", slots);
  if (!slots["widgets-container"] || visibleItems.value.length <= 2) {
    // If not overflowing and 2 or fewer items, show all
    if (!isOverflowing.value) {
      return visibleItems.value;
    }
  }
  // If overflowing or 3+ items, show only first item
  return visibleItems.value.slice(0, 1);
});

const overflowItems = computed(() => {
  if (!slots["widgets-container"] && !isOverflowing.value) {
    return [];
  }
  // If overflowing or has 3+ items, include remaining items
  return visibleItems.value.length >= 3 || isOverflowing.value
    ? visibleItems.value.slice(1)
    : visibleItems.value.slice(2);
});

const showMoreButton = computed(() => {
  return (slots["widgets-container"] && visibleItems.value.length >= 3) || isOverflowing.value;
});

function isToolbarVisible() {
  const visibleItems = (props.items as { isVisible: boolean }[]).filter(
    (item) => item.isVisible === undefined || item.isVisible,
  );
  return !!visibleItems.length;
}

provide("toolbarContainerId", "vc-blade-toolbar-container");
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 54px;
  --blade-toolbar-height-expanded: 54px;
  --blade-toolbar-background-color: var(--additional-50);
  --blade-toolbar-border-color: var(--base-border-color, var(--neutrals-200));
  --blade-toolbar-icon-color: var(--neutrals-700);
  --blade-toolbar-icon-hover-color: var(--primary-600);
}

.vc-blade-toolbar {
  @apply tw-min-h-[var(--blade-toolbar-height)] tw-bg-[color:var(--blade-toolbar-background-color)] tw-border-b-[color:var(--blade-toolbar-border-color)] tw-border-solid tw-border-b tw-flex tw-box-border tw-w-full tw-content-center tw-items-stretch tw-shrink-0;

  /* &--expanded {
    @apply tw-h-[var(--blade-toolbar-height-expanded)] #{!important};
  } */

  &__content {
    @apply tw-flex tw-content-start tw-items-center tw-px-2;
    flex-grow: 1;
    overflow: hidden;
    width: auto;
  }

  &__toolbar-container {
    @apply tw-grow-[2] tw-basis-0 tw-flex tw-justify-end tw-shrink-0 tw-items-center;
  }

  &__icon {
    @apply tw-self-center tw-justify-self-center tw-text-[color:var(--blade-toolbar-icon-color)] tw-cursor-pointer tw-mr-4 hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)];
  }

  &__more {
    @apply tw-flex tw-flex-col tw-items-center tw-px-2 tw-cursor-pointer tw-text-[color:var(--blade-toolbar-icon-color)] hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)];
  }

  &__more-text {
    @apply tw-text-xs tw-mt-1 tw-font-normal;
  }

  &__more-item {
    @apply tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1 tw-cursor-pointer tw-text-[color:var(--blade-toolbar-icon-color)] hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)];
  }

  &__toolbar-container-inner {
    @apply tw-flex tw-flex-row tw-items-center tw-overflow-visible tw-w-full;
  }
}
</style>
