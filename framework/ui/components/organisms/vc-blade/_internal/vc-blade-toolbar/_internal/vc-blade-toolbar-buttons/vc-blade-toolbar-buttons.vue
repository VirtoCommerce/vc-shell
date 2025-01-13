<template>
  <div class="vc-blade-toolbar-buttons">
    <div class="vc-blade-toolbar-buttons__measure">
      <VcBladeToolbarButton
        v-for="item in items"
        :id="item.id"
        :key="`measure-${item.id}`"
        :ref="(el) => (el && '$el' in el ? setElementRef(item.id!, el?.$el) : null)"
        :is-expanded="isExpanded"
        :icon="item.icon"
        :title="unref(item.title)"
        :disabled="item.disabled as boolean"
        :separator="item.separator"
      />
    </div>

    <div
      ref="toolbarContentRef"
      class="vc-blade-toolbar-buttons__content"
    >
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
        v-if="showMoreButton"
        :opened="showToolbar"
        :items="overflowItems"
        floating
        placement="bottom-end"
        variant="light"
        @item:click="onItemClick"
        @update:opened="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-blade-toolbar-buttons__more"
            :class="{ 'vc-blade-toolbar-buttons__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon :icon="CircleDotsIcon" />
            <span class="vc-blade-toolbar-buttons__more-text">More</span>
          </div>
        </template>

        <template #item="{ item, click }">
          <VcBladeToolbarButton
            :id="item.id"
            :is-expanded="isExpanded"
            :icon="item.icon"
            :title="unref(item.title)"
            :disabled="item.disabled as boolean"
            :separator="item.separator"
            :click-handler="
              () => {
                click();
                item.clickHandler?.();
              }
            "
            horizontal
          />
        </template>
      </GenericDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, unref, onMounted, onBeforeUnmount, nextTick, toRef } from "vue";
import { IBladeToolbar } from "../../../../../../../../core/types";
import { VcIcon } from "../../../../../../../../";
import { GenericDropdown } from "../../../../../../../../shared/components/generic-dropdown";
import { CircleDotsIcon } from "../../../../../../atoms/vc-icon/icons";
import { useVisibleElements } from "../../../../../../../composables/useVisibleElements";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";

export interface Props {
  items: IBladeToolbar[];
  isExpanded: boolean;
}

const props = defineProps<Props>();

const visibleItems = toRef(props, "items");

const showToolbar = ref(false);
const toolbarContentRef = ref<HTMLElement | null>(null);

const { setElementRef, displayedItems, overflowItems, showMoreButton, calculateVisibleElements, setupResizeObserver } =
  useVisibleElements({
    containerRef: toolbarContentRef,
    items: visibleItems,
    getItemId: (item) => item.id!,
    moreButtonWidth: 70,
  });

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

onBeforeUnmount(() => {
  observer.disconnect();
});

setupResizeObserver();

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};

function onItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
}
</script>

<style lang="scss">
.vc-blade-toolbar-buttons {
  @apply tw-relative tw-w-full tw-overflow-hidden tw-flex;
  width: -webkit-fill-available;
  &__measure {
    @apply tw-absolute tw-invisible tw-pointer-events-none tw-flex tw-h-0 tw-overflow-hidden;
  }

  &__content {
    @apply tw-flex tw-w-full tw-px-2 tw-gap-1;
  }

  &__more {
    @apply tw-flex tw-flex-col tw-items-center tw-px-2 tw-cursor-pointer tw-text-[color:var(--blade-toolbar-icon-color)] hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)];

    &--active {
      @apply tw-text-[color:var(--blade-toolbar-icon-hover-color)];
    }
  }

  &__more-text {
    @apply tw-text-xs tw-mt-1;
  }

  &__more-item {
    @apply tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1 tw-cursor-pointer tw-text-[color:var(--blade-toolbar-icon-color)] hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)];
  }
}
</style>
