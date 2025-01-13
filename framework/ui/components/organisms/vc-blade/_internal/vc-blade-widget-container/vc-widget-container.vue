<template>
  <div class="widget-container">
    <!-- Measure container -->
    <div class="widget-container__measure">
      <slot />
    </div>

    <!-- Actual widgets -->
    <div
      ref="containerRef"
      class="widget-container__content"
    >
      <component
        :is="widget.component"
        v-for="widget in visibleWidgets"
        :key="widget.id"
        v-bind="widget.props || {}"
        v-on="widget.events || {}"
      />

      <GenericDropdown
        v-if="showMoreButton"
        :opened="showToolbar"
        :items="overflowWidgets"
        floating
        placement="bottom-end"
        variant="light"
        @update:opened="showToolbar = $event"
      >
        <template #trigger="{ isActive }">
          <div
            class="widget-container__more"
            :class="{ 'widget-container__more--active': isActive }"
            @click="toggleToolbar"
          >
            <VcIcon :icon="ChevronDownIcon" />
          </div>
        </template>

        <template #item="{ item }">
          <component
            :is="item.component"
            v-bind="item.props || {}"
            horizontal
            v-on="item.events || {}"
          />
        </template>
      </GenericDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWidgets } from "../../../../../../core/composables/useWidgets";
import { BladeInstance, WidgetContainerKey } from "../../../../../../injection-keys";
import { inject, provide, ref, markRaw, watchEffect, onUnmounted, computed } from "vue";
import { GenericDropdown } from "../../../../../../shared/components/generic-dropdown";
import { VcIcon, ChevronDownIcon } from "../../../..";
import { IWidget } from "../../../../../../core/services/widget-service";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const widgetService = useWidgets();

const showToolbar = ref(false);
const blade = inject(BladeInstance);

const widgets = ref<IWidget[]>([]);

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
};

const updateWidgets = () => {
  const currentWidgets = widgetService.getWidgets(props.bladeId);
  widgets.value = currentWidgets;
};

watchEffect(() => {
  if (props.bladeId) {
    updateWidgets();
  }
});

provide(WidgetContainerKey, {
  registerWidget(widget) {
    widgetService.registerWidget(
      {
        id: widget.id,
        component: markRaw(widget.component),
        props: widget.props,
        events: widget.events,
      },
      blade?.value.id ?? "",
    );

    updateWidgets();
  },
  isWidgetRegistered(id) {
    return widgetService.isWidgetRegistered(id);
  },
  setActiveWidget(ref) {
    widgetService.setActiveWidget(ref);
  },
});

const visibleWidgets = computed(() => {
  return widgets.value.slice(0, 3);
});

const showMoreButton = computed(() => {
  return widgets.value.length > visibleWidgets.value.length;
});

const overflowWidgets = computed(() => {
  return widgets.value.slice(visibleWidgets.value.length);
});

onUnmounted(() => {
  if (props.bladeId) {
    widgetService.clearBladeWidgets(props.bladeId);
  }
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color: var(--neutrals-100);
  --blade-toolbar-widgets-bg-hover-color: var(--neutrals-200);
}

.widget-container {
  position: relative;
  display: flex;
  width: fit-content;
  user-select: none;
  background-color: var(--blade-toolbar-widgets-bg-color);

  &__measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    display: flex;
    height: 0;
    overflow: hidden;
  }

  &__content {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 4px;
  }

  &__more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    height: 100%;
    cursor: pointer;
    color: var(--blade-toolbar-icon-color);

    &:hover {
      color: var(--blade-toolbar-icon-hover-color);
    }

    &--active {
      color: var(--blade-toolbar-icon-hover-color);
      background-color: var(--blade-toolbar-widgets-bg-hover-color);
    }
  }
}
</style>
