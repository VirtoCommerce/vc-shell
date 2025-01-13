<template>
  <div
    v-if="items && items.length"
    ref="el"
    class="vc-breadcrumbs"
  >
    <div class="vc-breadcrumbs__measure">
      <template
        v-for="(item, i) in items"
        :key="`measure-${item?.id}`"
      >
        <div
          v-if="item && item.title"
          :ref="
            (el) => (el && '$el' in el ? setElementRef(item.id!, el?.$el) : el ? setElementRef(item.id!, el) : null)
          "
          class="vc-breadcrumbs__item-wrapper"
        >
          <span
            v-if="withArrow && i !== 0"
            class="vc-breadcrumbs__item-chevron"
          >
            /
          </span>
          <VcBreadcrumbsItem
            class="vc-breadcrumbs__item"
            v-bind="item"
            :current="false"
            :variant="variant"
          />
        </div>
      </template>
      <!-- <VcBreadcrumbsItem
        v-for="item in items"
        :key="`measure-${item?.id}`"
        :ref="(el) => (el && '$el' in el ? setElementRef(item.id!, el?.$el) : null)"
        v-bind="item"
        :current="false"
        :variant="variant"
      /> -->
    </div>

    <div class="vc-breadcrumbs__content">
      <GenericDropdown
        v-if="showMoreButton"
        :items="hiddenItems"
        :opened="showBreadcrumbs"
        floating
        variant="light"
        placement="bottom-start"
        @item:click="onItemClick"
        @update:opened="showBreadcrumbs = $event"
      >
        <template #trigger="{ isActive }">
          <slot
            name="trigger"
            :click="toggleBreadcrumbs"
            :is-active="isActive"
          >
            <VcBreadcrumbsItem
              id="Expand"
              class="vc-breadcrumbs__expand-button"
              :class="{
                'vc-breadcrumbs__expand-button--active': isActive,
              }"
              :current="false"
              title="..."
              :variant="variant"
              @click="toggleBreadcrumbs"
            />
          </slot>
        </template>
        <template #item="{ item, click }">
          <VcBreadcrumbsItem
            v-bind="item"
            :current="false"
            :variant="variant"
            @click="click"
          />
        </template>
      </GenericDropdown>

      <template
        v-for="(item, i) in displayedItems"
        :key="item?.id ?? `breadcrumb-item-${i}`"
      >
        <div
          v-if="item && item.title"
          class="vc-breadcrumbs__item-wrapper"
        >
          <span
            v-if="withArrow && i !== 0"
            class="vc-breadcrumbs__item-chevron"
          >
            /
          </span>
          <VcBreadcrumbsItem
            class="vc-breadcrumbs__item"
            v-bind="item"
            :current="i === displayedItems.length - 1"
            :variant="variant"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRef, VNode } from "vue";
import { useElementBounding } from "@vueuse/core";
import { Breadcrumbs } from "../../../types";
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";
import { GenericDropdown } from "./../../../../shared/components/generic-dropdown";
import { useVisibleElements } from "./../../../composables/useVisibleElements";

export interface Props {
  items?: Breadcrumbs[];
  variant?: "default" | "light";
  withArrow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  variant: "default",
  withArrow: false,
});

defineSlots<{
  trigger: (props: { click: () => void; isActive: boolean }) => VNode;
}>();

const el = ref<HTMLElement | null>(null);
const showBreadcrumbs = ref(false);

const {
  setElementRef,
  displayedItems,
  overflowItems: hiddenItems,
  showMoreButton,
  setupResizeObserver,
} = useVisibleElements({
  containerRef: el,
  items: toRef(props, "items"),
  getItemId: (item) => item.id!,
  moreButtonWidth: 100,
  reverseCalculation: true,
});

function toggleBreadcrumbs() {
  showBreadcrumbs.value = !showBreadcrumbs.value;
}

function onItemClick(item: Breadcrumbs) {
  item.clickHandler?.(item.id);
}

setupResizeObserver();
</script>

<style lang="scss">
:root {
  --separator-color: var(--neutrals-400);
  --breadcrumbs-item-border-color: var(--secondary-300);
  --breadcrumbs-item-border-color-hover: var(--secondary-400);
}

.vc-breadcrumbs {
  @apply tw-flex tw-items-center tw-flex-wrap tw-gap-2.5;

  &__measure {
    @apply tw-absolute tw-invisible tw-pointer-events-none tw-flex tw-h-0 tw-overflow-hidden;
  }

  &__content {
    @apply tw-flex tw-items-center;
  }

  &__item-wrapper {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center;
  }

  &__item-chevron {
    @apply tw-text-[color:var(--separator-color)] tw-mx-2.5;
  }

  &__expand-button {
    @apply tw-px-3 tw-mr-2.5 tw-border-solid  tw-rounded-[3px] tw-border tw-border-[color:var(--breadcrumbs-item-border-color)] tw-text-[color:var(--separator-color)] tw-cursor-pointer hover:tw-text-[color:var(--chevron-color)];

    &--active,
    &:hover {
      @apply tw-border tw-border-solid tw-border-[color:var(--breadcrumbs-item-border-color-hover)];
    }
  }
}
</style>
