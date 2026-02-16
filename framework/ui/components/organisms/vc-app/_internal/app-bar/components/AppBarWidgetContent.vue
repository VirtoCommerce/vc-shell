<template>
  <div
    v-if="isAnyWidgetVisible && currentWidget?.component"
    class="app-bar-widget-content"
    :class="{ 'app-bar-widget-content--mobile': mobile }"
  >
    <component
      :is="currentWidget?.component"
      v-bind="widgetProps"
      @close="hideAllWidgets"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useAppBarWidgets } from "../composables/useAppBarWidgets";

withDefaults(
  defineProps<{
    mobile?: boolean;
  }>(),
  {
    mobile: false,
  },
);

const { currentWidget, hideAllWidgets, isAnyWidgetVisible } = useAppBarWidgets();

const widgetProps = computed(() => ({
  ...(currentWidget.value?.props ?? {}),
  onClose: hideAllWidgets,
}));
</script>

<style lang="scss">
.app-bar-widget-content {
  @apply tw-overflow-auto tw-max-h-[250px];
}
</style>
