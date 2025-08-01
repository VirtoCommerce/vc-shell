<template>
  <div class="widget-container-desktop">
    <div class="widget-container-desktop__content">
      <component
        :is="widget.component"
        v-for="widget in displayedItems"
        :key="widget.id"
        v-bind="widget.props || {}"
        :widget-id="widget.id"
        v-on="widget.events || {}"
      />

      <GenericDropdown
        v-if="showMoreButton"
        :opened="showToolbar"
        :items="overflowItems"
        floating
        placement="bottom-end"
        variant="secondary"
        @update:opened="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="widget-container-desktop__more"
            :class="{ 'widget-container-desktop__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon icon="lucide-chevron-down" />
          </div>
        </template>

        <template #item="{ item }">
          <component
            :is="item.component"
            class="tw-p-3 tw-w-full"
            v-bind="item.props || {}"
            horizontal
            :widget-id="item.id"
            v-on="item.events || {}"
            @click="toggleToolbar"
          />
        </template>
      </GenericDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IWidget } from "../../../../../../../core/services";
import { GenericDropdown } from "../../../../../../../shared/components/generic-dropdown";
import { VcIcon } from "../../../../..";

interface Props {
  widgets: IWidget[];
  bladeId: string;
}

const props = defineProps<Props>();
const showToolbar = ref(false);

const displayedItems = computed(() => props.widgets.slice(0, 3));

const overflowItems = computed(() => {
  return props.widgets.slice(3);
});

const showMoreButton = computed(() => props.widgets.length > 3);

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};
</script>

<style lang="scss">
.widget-container-desktop {
  position: relative;
  display: flex;
  width: fit-content;
  user-select: none;
  background-color: var(--blade-toolbar-widgets-bg-color);

  &__content {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    height: 100%;
    cursor: pointer;
    color: var(--blade-toolbar-icon-color);

    &:hover,
    &--active {
      color: var(--blade-toolbar-icon-hover-color);
      background-color: var(--blade-toolbar-widgets-bg-hover-color);
    }
  }
}
</style>
