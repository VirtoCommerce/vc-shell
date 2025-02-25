<template>
  <template v-if="widgets.length > 0">
  <WidgetContainerMobile
    v-if="$isMobile.value"
    :widgets="widgets"
    :blade-id="bladeId"
  />
  <WidgetContainerDesktop
    v-else
    :widgets="widgets"
    :blade-id="bladeId"
  />
</template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWidgets } from "../../../../../../core/composables/useWidgets";
import { WidgetContainerDesktop, WidgetContainerMobile } from "./_internal";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const widgetService = useWidgets();
const widgets = computed(() => widgetService.getWidgets(props.bladeId));
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
