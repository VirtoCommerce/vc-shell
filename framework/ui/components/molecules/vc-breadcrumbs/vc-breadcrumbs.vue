<template>
  <div
    v-if="items && items.length"
    ref="el"
    class="vc-breadcrumbs"
  >
    <VcBreadcrumbsItem
      v-if="items.length"
      :id="items[0]?.id"
      class="vc-breadcrumbs__item"
      :title="items[0]?.title"
      :current="items.length === 1"
      :variant="variant"
      @click="items[0]?.clickHandler && items[0]?.clickHandler(items[0]?.id)"
    />

    <VcIcon
      v-if="withArrow && canExpand"
      class="vc-breadcrumbs__chevron-icon"
      :icon="arrowIcon"
      :size="arrowSize"
    />

    <VcBreadcrumbsItem
      v-if="canExpand"
      id="Expand"
      class="vc-breadcrumbs__expand-button"
      :current="false"
      title="..."
      :variant="variant"
      @click="expand"
    />

    <template
      v-for="(item, i) in visibleBreadcrumbs"
      :key="item?.id ?? `breadcrumb-item-${i}`"
    >
      <div
        v-if="item && item.title && item.isVisible"
        class="vc-breadcrumbs__item-wrapper"
      >
        <VcIcon
          v-if="withArrow && i < items.length - 1"
          class="vc-breadcrumbs__item-chevron"
          :icon="arrowIcon"
          :size="arrowSize"
        />
        <VcBreadcrumbsItem
          class="vc-breadcrumbs__item"
          v-bind="item"
          :current="i === items.length - 1"
          :variant="variant"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Breadcrumbs } from "../../../types";
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";
import { VcIcon } from "./../../atoms/vc-icon";
import { useElementBounding } from "@vueuse/core";
import { MaybeRef, Ref, computed, ref, toRefs, toValue, watch } from "vue";
import * as _ from "lodash-es";

export interface Props {
  items?: Breadcrumbs[];
  variant?: "default" | "light";
  withArrow?: boolean;
  arrowIcon?: string;
  arrowSize?: InstanceType<typeof VcIcon>["$props"]["size"];
}

interface InternalBreadcrumbs extends Breadcrumbs {
  isVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  variant: "default",
  arrowIcon: "fas fa-chevron-right",
  arrowSize: "xs",
});

const el = ref<HTMLElement | null>(null);
const visibleBreadcrumbs = ref([]) as Ref<InternalBreadcrumbs[]>;

const { width } = useElementBounding(el);
const { items } = toRefs(props);

const canExpand = computed(
  () =>
    visibleBreadcrumbs.value &&
    _.some(
      visibleBreadcrumbs.value,
      (breadcrumb) => !(typeof breadcrumb?.isVisible === "undefined" ? true : breadcrumb.isVisible),
    ),
);

watch(items, computeVisibleBreadcrumbs, { deep: true });

function computeVisibleBreadcrumbs(breadcrumbs: InternalBreadcrumbs[]) {
  if (!(breadcrumbs && breadcrumbs.length)) return [];

  const expanderWidth = 40;
  const availableWidth = width.value;
  let widthOfItems = calculateTotalWidth(breadcrumbs[0].title);

  const items = _.tail(_.cloneDeep(breadcrumbs)).reverse();

  for (let i = 0; i < items.length; i++) {
    const x = items[i];
    const elWidth = calculateTotalWidth(x.title);
    if (widthOfItems + elWidth <= availableWidth) {
      x.isVisible = true;
      widthOfItems += elWidth;
    } else {
      if (i > 0) items[i - 1].isVisible = false;
      widthOfItems += expanderWidth;
      if (widthOfItems > availableWidth) break;
    }
  }

  visibleBreadcrumbs.value = items.reverse();
}

function calculateTotalWidth(title: MaybeRef<string | undefined>) {
  const unrefTitle = toValue(title);
  if (!unrefTitle) return 0;

  const maxChars = 27;
  const paddings = 40;
  const averageCharacterWidth = 4.87;

  const wordWidth =
    Math.floor((unrefTitle.length > maxChars ? maxChars : unrefTitle.length) * averageCharacterWidth) + paddings;

  return wordWidth;
}

function expand() {
  visibleBreadcrumbs.value.forEach((breadcrumb) => {
    breadcrumb.isVisible = true;
  });
}
</script>

<style lang="scss">
:root {
  --chevron-color: var(--secondary-500);
}

.vc-breadcrumbs {
  @apply tw-flex tw-items-center tw-flex-wrap tw-gap-2.5;

  &__chevron-icon {
    @apply tw-text-[color:var(--chevron-color)];
  }

  &__expand-button {
    @apply tw-text-[color:var(--chevron-color)] tw-cursor-pointer hover:tw-text-[color:var(--chevron-color)];
  }

  &__item-wrapper {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center;
  }

  &__item-chevron {
    @apply tw-text-[color:var(--chevron-color)] tw-mr-2.5;
  }
}
</style>
