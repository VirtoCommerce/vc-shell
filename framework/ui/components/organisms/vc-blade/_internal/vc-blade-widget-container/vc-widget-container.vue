<template>
  <template v-if="visibleWidgets?.length > 0">
    <WidgetContainerMobile
      v-if="$isMobile.value"
      :widgets="visibleWidgets"
      :blade-id="normalizedBladeId"
    />
    <WidgetContainerDesktop
      v-else
      :widgets="visibleWidgets"
      :blade-id="normalizedBladeId"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, toValue, inject } from "vue";
import { useWidgets } from "../../../../../../core/composables/useWidgets";
import { WidgetContainerDesktop, WidgetContainerMobile } from "./_internal";
import { BladeInstance } from "../../../../../../injection-keys";
import { IBladeInstance } from "../../../../../../shared/components/blade-navigation/types";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const normalizedBladeId = computed(() => props.bladeId.toLowerCase());
const widgetService = useWidgets();
const widgets = computed(() => widgetService.getWidgets(normalizedBladeId.value));
const bladeInstance = inject<IBladeInstance>(BladeInstance);

const visibleWidgets = computed(() =>
  widgets.value.filter((widget) => {
    if (typeof widget.isVisible === "function") {
      return widget.isVisible(bladeInstance);
    } else if (typeof widget.isVisible === "boolean") {
      return widget.isVisible;
    } else if (widget.isVisible === undefined) {
      return true; // Show widget by default if isVisible is not specified
    }
    return toValue(widget.isVisible);
  }),
);
</script>

<style lang="scss">
:root {
  --blade-toolbar-widgets-bg-color: var(--neutrals-100);
  --blade-toolbar-widgets-bg-hover-color: var(--neutrals-200);
  --blade-toolbar-widgets-bg-color-mobile: var(--additional-50);
}

.widget-container {
  position: relative;
  display: flex;
  width: fit-content;
  user-select: none;
  background-color: var(--blade-toolbar-widgets-bg-color);

  &--mobile {
    position: fixed;
    bottom: 0 !important;
    left: 0;
    right: 0;
    width: 100%;
    height: var(--blade-toolbar-widgets-mobile-height);
    z-index: 100;

    .widget-container__content {
      height: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      height: 80px;
      background-color: var(--blade-toolbar-widgets-bg-color-mobile);
    }

    .widget-container__measure {
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
    }
  }

  &__measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    display: flex;
    height: 0;
    overflow: hidden;
    left: -9999px;
    gap: 4px;
    width: 100%;
  }

  &__measure-item {
    display: flex;
  }

  &__content {
    width: 100%;
    display: flex;
    flex-direction: row;

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
