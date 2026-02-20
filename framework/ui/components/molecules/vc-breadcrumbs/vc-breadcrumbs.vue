<template>
  <nav
    v-if="items && items.length"
    aria-label="Breadcrumb"
    class="vc-breadcrumbs"
  >
    <ol
      ref="contentRef"
      class="vc-breadcrumbs__content"
      :class="{
        'vc-breadcrumbs__content--separated': separated,
      }"
    >
      <VcDropdown
        v-if="showMoreButton"
        :items="hiddenItems"
        :model-value="showBreadcrumbs"
        floating
        variant="secondary"
        placement="bottom-start"
        :offset="{
          mainAxis: 10,
        }"
        @item-click="onItemClick"
        @update:model-value="showBreadcrumbs = $event"
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
              data-more-button
              class="vc-breadcrumbs__expand-button"
              :class="{
                'vc-breadcrumbs__expand-button--active': isActive,
              }"
              @click="toggleBreadcrumbs"
            />
          </slot>
        </template>
        <template #item="{ item, click }">
          <VcDropdownItem
            :title="typeof item.title === 'string' ? item.title : item.title?.value ?? ''"
            :icon="item.icon"
            @click="click"
          />
        </template>
      </VcDropdown>

      <template
        v-for="(item, i) in visibleItems"
        :key="item?.id ?? `breadcrumb-item-${i}`"
      >
        <li
          v-if="item && item.title"
          class="vc-breadcrumbs__item-wrapper"
          :data-item-key="item.id"
        >
          <span
            v-if="separated && i !== 0"
            class="vc-breadcrumbs__item-separator"
            aria-hidden="true"
          >
            /
          </span>
          <VcBreadcrumbsItem
            class="vc-breadcrumbs__item"
            v-bind="item"
            :current="i === visibleItems.length - 1"
            :aria-current="i === visibleItems.length - 1 ? 'page' : undefined"
            :variant="variant"
          />
        </li>
      </template>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
import { ref, computed, toRef, VNode, nextTick } from "vue";
import type { Breadcrumbs } from "../../../types/index";
import VcBreadcrumbsItem from "@ui/components/molecules/vc-breadcrumbs/_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";
import { VcDropdown } from "..";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";

export interface Props {
  items?: Breadcrumbs[];
  variant?: "default" | "light";
  separated?: boolean;
  /** When true, all items are placed in the dropdown behind the trigger. */
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  variant: "default",
  separated: false,
  collapsed: false,
});

defineSlots<{
  trigger: (props: { click: () => void; isActive: boolean }) => VNode;
}>();

/** Width of the "more" button — the icon-only VcButton is ~36px */
const MORE_BUTTON_WIDTH = 36;
/** Conservative estimate per breadcrumb item (icon + truncated text) */
const INITIAL_ITEM_WIDTH = 60;

const contentRef = ref<HTMLElement | null>(null);
const showBreadcrumbs = ref(false);

const adaptive = useAdaptiveItems({
  containerRef: contentRef,
  items: toRef(props, "items"),
  getItemKey: (item) => item.id!,
  moreButtonWidth: MORE_BUTTON_WIDTH,
  calculationStrategy: "reverse",
  initialItemWidth: INITIAL_ITEM_WIDTH,
});

const visibleItems = computed(() => (props.collapsed ? [] : adaptive.visibleItems.value));
const hiddenItems = computed(() => (props.collapsed ? props.items : adaptive.hiddenItems.value));
const showMoreButton = computed(() => hiddenItems.value.length > 0);
const recalculate = adaptive.recalculate;

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
  @apply tw-flex tw-flex-grow tw-items-center tw-min-w-0 tw-overflow-hidden;

  &__content {
    @apply tw-flex tw-flex-grow tw-items-center tw-gap-2.5 tw-min-w-0 tw-list-none tw-m-0 tw-p-0;

    &--separated {
      @apply tw-gap-0;
    }
  }

  &__item-wrapper {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center tw-shrink-0;
  }

  &__item-separator {
    @apply tw-text-[color:var(--separator-color)] tw-mx-2.5;
  }

  &__expand-button {
    @apply tw-mr-1 tw-border-solid tw-rounded-[3px] tw-text-[color:var(--breadcrumbs-expand-button-color)] tw-cursor-pointer hover:tw-text-[color:var(--breadcrumbs-expand-button-color-hover)];
  }
}
</style>
