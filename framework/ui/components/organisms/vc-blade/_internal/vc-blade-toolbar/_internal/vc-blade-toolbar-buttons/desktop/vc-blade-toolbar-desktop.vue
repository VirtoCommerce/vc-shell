<template>
  <div class="vc-blade-toolbar-desktop">
    <!-- Measure container -->
    <div class="vc-blade-toolbar-desktop__measure">
      <template
        v-for="item in items"
        :key="`measure-${item.id}`"
      >
        <div class="vc-blade-toolbar-desktop__measure-item">
          <VcBladeToolbarBaseButton
            v-bind="item"
            :ref="(el) => (el && '$el' in el ? setElementRef(item.id!, el?.$el) : null)"
            :show-title="isExpanded"
          />
        </div>
      </template>
    </div>

    <!-- Actual toolbar content -->
    <div
      ref="toolbarContentRef"
      class="vc-blade-toolbar-desktop__content"
    >
      <template
        v-for="item in displayedItems"
        :key="item.id"
      >
        <VcBladeToolbarBaseButton
          v-bind="item"
          :show-title="isExpanded"
          :on-click="item.clickHandler"
        />
      </template>

      <GenericDropdown
        v-if="showMoreButton"
        :opened="isMenuOpen"
        :items="overflowItems"
        floating
        placement="bottom-end"
        variant="light"
        @item-click="handleItemClick"
        @update:opened="isMenuOpen = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-blade-toolbar-desktop__more"
            :class="{ 'vc-blade-toolbar-desktop__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon :icon="CircleDotsIcon" />
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
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch, toRef } from "vue";
import { VcIcon } from "../../../../../../../../../";
import { GenericDropdown } from "../../../../../../../../../shared/components/generic-dropdown";
import { CircleDotsIcon } from "../../../../../../../atoms/vc-icon/icons";
import { useVisibleElements } from "../../../../../../../../composables/useVisibleElements";
import type { IBladeToolbar } from "../../../../../../../../../core/types";
import VcBladeToolbarBaseButton from "../_internal/vc-blade-toolbar-button/vc-blade-toolbar-base-button.vue";

const props = defineProps<{
  items: IBladeToolbar[];
  isExpanded: boolean;
}>();

const isMenuOpen = ref(false);
const toolbarContentRef = ref<HTMLElement | null>(null);

const { setElementRef, displayedItems, overflowItems, showMoreButton, calculateVisibleElements, setupResizeObserver } =
  useVisibleElements<IBladeToolbar>({
    containerRef: toolbarContentRef,
    items: toRef(props, "items"),
    getItemId: (item: IBladeToolbar) => item.id ?? "",
    moreButtonWidth: 70,
  });

function handleItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
  isMenuOpen.value = false;
}

const toggleToolbar = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Observe DOM changes
const observer = new MutationObserver(() => {
  nextTick(calculateVisibleElements);
});

onMounted(() => {
  nextTick(() => {
    if (toolbarContentRef.value) {
      observer.observe(toolbarContentRef.value, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      calculateVisibleElements();
    }
  });
});

// Recalculate when isExpanded changes
watch(
  () => props.isExpanded,
  () => {
    nextTick(calculateVisibleElements);
  },
);

// Set up resize observer
setupResizeObserver();

onBeforeUnmount(() => {
  observer.disconnect();
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-desktop-more-color: var(--neutrals-700);
  --blade-toolbar-desktop-more-hover-color: var(--primary-600);
}

.vc-blade-toolbar-desktop {
  @apply tw-w-full tw-relative;

  &__measure {
    @apply tw-absolute tw-px-4 tw-invisible tw-pointer-events-none tw-flex tw-h-0 tw-overflow-hidden;
    left: -9999px;
  }

  &__measure-item {
    @apply tw-flex;
  }

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
