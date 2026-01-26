<template>
  <div
    v-if="items && items.length"
    ref="el"
    class="vc-breadcrumbs"
  >
    <div
      class="vc-breadcrumbs__content"
      :class="{
        'vc-breadcrumbs__content--separated': separated,
      }"
    >
      <GenericDropdown
        v-if="showMoreButton"
        :items="hiddenItems"
        :opened="showBreadcrumbs"
        floating
        variant="secondary"
        placement="bottom-start"
        :offset="{
          mainAxis: 10,
        }"
        @item-click="onItemClick"
        @update:opened="showBreadcrumbs = $event"
      >
        <template #trigger="{ isActive }">
          <slot
            name="trigger"
            :click="toggleBreadcrumbs"
            :is-active="isActive"
          >
            <VcButton
              text
              icon="lucide-ellipsis-vertical"
              icon-size="xl"
              class="vc-breadcrumbs__expand-button"
              :class="{
                'vc-breadcrumbs__expand-button--active': isActive,
              }"
              @click="toggleBreadcrumbs"
            />
          </slot>
        </template>
        <template #item="{ item, click }">
          <VcBreadcrumbsItem
            v-bind="item"
            :current="false"
            :variant="variant"
            class="tw-p-3 tw-w-full"
            @click="click"
          />
        </template>
      </GenericDropdown>

      <template
        v-for="(item, i) in visibleItems"
        :key="item?.id ?? `breadcrumb-item-${i}`"
      >
        <div
          v-if="item && item.title"
          class="vc-breadcrumbs__item-wrapper"
          :data-item-key="item.id"
        >
          <span
            v-if="separated && i !== 0"
            class="vc-breadcrumbs__item-separator"
          >
            /
          </span>
          <VcBreadcrumbsItem
            class="vc-breadcrumbs__item"
            v-bind="item"
            :current="i === visibleItems.length - 1"
            :variant="variant"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef, VNode, nextTick } from "vue";
import { Breadcrumbs } from "../../../types";
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";
import { GenericDropdown } from "./../../../../shared/components/generic-dropdown";
import { useAdaptiveItems } from "../../../composables/useAdaptiveItems";

export interface Props {
  items?: Breadcrumbs[];
  variant?: "default" | "light";
  separated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  variant: "default",
  separated: false,
});

defineSlots<{
  trigger: (props: { click: () => void; isActive: boolean }) => VNode;
}>();

/** Default width for the "more" button in pixels */
const MORE_BUTTON_WIDTH = 100;
/** Default initial item width for calculation in pixels */
const INITIAL_ITEM_WIDTH = 100;

const el = ref<HTMLElement | null>(null);
const showBreadcrumbs = ref(false);

const { visibleItems, hiddenItems, showMoreButton, recalculate } = useAdaptiveItems({
  containerRef: el,
  items: toRef(props, "items"),
  getItemKey: (item) => item.id!,
  moreButtonWidth: MORE_BUTTON_WIDTH,
  calculationStrategy: "reverse",
  initialItemWidth: INITIAL_ITEM_WIDTH,
});

function toggleBreadcrumbs() {
  showBreadcrumbs.value = !showBreadcrumbs.value;
}

function onItemClick(item: Breadcrumbs) {
  item.clickHandler?.(item.id);
}

nextTick(recalculate);
</script>

<style lang="scss">
:root {
  --separator-color: var(--neutrals-400);
  --breadcrumbs-item-border-color: var(--secondary-300);
  --breadcrumbs-item-border-color-hover: var(--secondary-400);
  --breadcrumbs-expand-button-color: var(--neutrals-500);
  --breadcrumbs-expand-button-color-hover: var(--neutrals-600);
}

.vc-breadcrumbs {
  @apply tw-flex tw-items-center tw-flex-wrap tw-gap-2.5;

  &__content {
    @apply tw-flex tw-items-center tw-gap-2.5;

    &--separated {
      @apply tw-gap-0;
    }
  }

  &__item-wrapper {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center;
  }

  &__item-separator {
    @apply tw-text-[color:var(--separator-color)] tw-mx-2.5;
  }

  &__expand-button {
    @apply tw-mr-1 tw-border-solid tw-rounded-[3px] tw-text-[color:var(--breadcrumbs-expand-button-color)] tw-cursor-pointer hover:tw-text-[color:var(--breadcrumbs-expand-button-color-hover)];
  }
}
</style>
