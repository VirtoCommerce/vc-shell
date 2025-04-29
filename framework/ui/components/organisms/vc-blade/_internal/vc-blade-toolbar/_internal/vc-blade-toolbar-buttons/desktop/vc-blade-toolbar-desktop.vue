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
        <VcBladeToolbarBaseButton
          v-bind="item"
          :data-item-key="item.id"
          :show-title="isExpanded"
          :on-click="item.clickHandler"
        />
      </template>

      <GenericDropdown
        v-if="showMoreButton"
        :opened="isMenuOpen"
        :items="hiddenItems"
        floating
        placement="bottom-end"
        variant="secondary"
        @item-click="handleItemClick"
        @update:opened="isMenuOpen = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-blade-toolbar-desktop__more"
            :class="{ 'vc-blade-toolbar-desktop__more--active': isActive }"
            @click="toggleToolbar"
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

        <template #item="{ item, click }">
          <VcBladeToolbarBaseButton
            class="tw-p-3 tw-w-full"
            v-bind="item"
            :show-title="true"
            content-direction="row"
            :on-click="
              () => {
                click();
                item.clickHandler?.();
              }
            "
          />
        </template>
      </GenericDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef, watch, nextTick } from "vue";
import { GenericDropdown } from "../../../../../../../../../shared/components/generic-dropdown";
import { VcIcon } from "../../../../../../../atoms/vc-icon";
import { useAdaptiveItems } from "../../../../../../../../composables/useAdaptiveItems";
import type { IBladeToolbar } from "../../../../../../../../../core/types";
import VcBladeToolbarBaseButton from "../_internal/vc-blade-toolbar-button/vc-blade-toolbar-base-button.vue";

const props = defineProps<{
  items: IBladeToolbar[];
  isExpanded: boolean;
}>();

const isMenuOpen = ref(false);
const toolbarContentRef = ref<HTMLElement | null>(null);

const { visibleItems, hiddenItems, showMoreButton, recalculate, updateObserver } = useAdaptiveItems<IBladeToolbar>({
  containerRef: toolbarContentRef,
  items: toRef(props, "items"),
  getItemKey: (item) => item.id ?? "",
  moreButtonWidth: 70,
  initialItemWidth: 60,
});

function handleItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
  isMenuOpen.value = false;
}

const toggleToolbar = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

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
    @apply tw-flex tw-items-center tw-gap-2 tw-px-2 tw-cursor-pointer tw-text-[var(--blade-toolbar-desktop-more-color)] tw-flex-col;

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
