<template>
  <div class="vc-blade-toolbar-desktop">
    <div
      ref="toolbarContentRef"
      class="vc-blade-toolbar-desktop__content"
    >
      <template
        v-for="item in visibleItems"
        :key="item.id"
      >
        <ToolbarBaseButton
          v-bind="item"
          :data-item-key="item.id"
          :show-title="isExpanded"
          :on-click="item.clickHandler"
        />
      </template>

      <VcDropdown
        v-if="showMoreButton"
        :model-value="isMenuOpen"
        :items="hiddenItems"
        floating
        placement="bottom-end"
        variant="secondary"
        @item-click="handleItemClick"
        @update:model-value="isMenuOpen = $event"
      >
        <template #trigger="{ isActive }">
          <div
            data-more-button
            class="vc-blade-toolbar-desktop__more"
            :class="{ 'vc-blade-toolbar-desktop__more--active': isActive }"
            @click="isMenuOpen = !isMenuOpen"
          >
            <VcIcon icon="material-more" />
            <span
              v-if="isExpanded"
              class="vc-blade-toolbar-desktop__more-text"
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_BLADE.MORE") }}
            </span>
          </div>
        </template>

        <template #item="{ item }">
          <VcDropdownItem
            :title="toValue(item.title) ?? ''"
            :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
          />
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef, toValue, watch, nextTick } from "vue";
import { VcDropdown } from "@ui/components";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import type { IBladeToolbar } from "@core/types";
import ToolbarBaseButton from "@ui/components/organisms/vc-blade/_internal/toolbar/ToolbarBaseButton.vue";

const props = defineProps<{
  items: IBladeToolbar[];
  isExpanded: boolean;
}>();

const isMenuOpen = ref(false);
const toolbarContentRef = ref<HTMLElement | null>(null);

const { visibleItems, hiddenItems, showMoreButton, recalculate, updateObserver } = useAdaptiveItems<IBladeToolbar>({
  containerRef: toolbarContentRef,
  items: toRef(props, "items"),
  getItemKey: (item) => item.id ?? `toolbar_item_${props.items.indexOf(item)}`,
  moreButtonWidth: 70,
  initialItemWidth: 60,
});

function handleItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
  isMenuOpen.value = false;
}

watch(
  () => props.isExpanded,
  () => {
    nextTick(() => {
      recalculate();
      updateObserver();
    });
  },
);
</script>

<style lang="scss">
:root {
  --blade-toolbar-desktop-more-color: var(--neutrals-700);
  --blade-toolbar-desktop-more-hover-color: var(--primary-600);
}

.vc-blade-toolbar-desktop {
  @apply tw-w-full tw-relative;

  &__content {
    @apply tw-flex tw-items-center tw-px-4 tw-h-full;
  }

  &__more {
    @apply tw-flex tw-items-center tw-gap-1 tw-px-2 tw-cursor-pointer tw-text-[var(--blade-toolbar-desktop-more-color)] tw-flex-col;

    &-text {
      @apply tw-text-xs;
    }

    &:hover,
    &--active {
      @apply tw-text-[var(--blade-toolbar-desktop-more-hover-color)];
    }
  }

}
</style>
