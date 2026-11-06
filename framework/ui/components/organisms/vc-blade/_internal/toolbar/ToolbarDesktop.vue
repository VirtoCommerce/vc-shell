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
        <!-- Props one by one: the button forwards unknown attrs to <button>, so a spread
             item would leak clickHandler, isVisible, bladeId into the DOM -->
        <ToolbarBaseButton
          :id="item.id"
          :icon="item.icon"
          :title="item.title"
          :disabled="item.disabled"
          :separator="item.separator"
          :shortcut="item.shortcut"
          :data-item-key="item.id"
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
        :is-item-disabled="(item) => !!toValue(item.disabled)"
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
            <VcIcon icon="lucide-ellipsis" />
            <span
              v-if="isExpanded"
              class="vc-blade-toolbar-desktop__more-text"
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_BLADE.MORE") }}
            </span>
          </div>
        </template>

        <template #item="{ item }">
          <!-- The same test id the command carries on the bar, so automation finds it after it overflows -->
          <VcDropdownItem
            :data-test-id="item.id"
            :title="toValue(item.title) ?? ''"
            :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
            :disabled="!!toValue(item.disabled)"
          />
        </template>
      </VcDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef, toValue, watch, nextTick } from "vue";
import { VcDropdown } from "@ui/components/molecules/vc-dropdown";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";
import { useAdaptiveItems } from "@ui/composables/useAdaptiveItems";
import type { ResolvedToolbarItem } from "@ui/components/organisms/vc-blade/_internal/composables/useToolbarRegistration";
import ToolbarBaseButton from "@ui/components/organisms/vc-blade/_internal/toolbar/ToolbarBaseButton.vue";

const props = defineProps<{
  items: ResolvedToolbarItem[];
  isExpanded: boolean;
}>();

const isMenuOpen = ref(false);
const toolbarContentRef = ref<HTMLElement | null>(null);

const { visibleItems, hiddenItems, showMoreButton, recalculate, updateObserver } =
  useAdaptiveItems<ResolvedToolbarItem>({
    containerRef: toolbarContentRef,
    items: toRef(props, "items"),
    getItemKey: (item) => item.id ?? `toolbar_item_${props.items.indexOf(item)}`,
    moreButtonWidth: 70,
    initialItemWidth: 60,
  });

function handleItemClick(item: ResolvedToolbarItem) {
  // a disabled command in the "more" menu stays disabled, as it is on the bar
  if (toValue(item.disabled)) return;
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
