<template>
  <WidgetContainerMobile
    v-if="visibleWidgets.length > 0 && $isMobile.value"
    :widgets="visibleWidgets"
    :blade-id="normalizedBladeId"
  />
  <WidgetContainerDesktop
    v-else-if="visibleWidgets.length > 0"
    :widgets="visibleWidgets"
    :blade-id="normalizedBladeId"
  />
</template>

<script setup lang="ts">
import { computed, inject, toValue } from "vue";
import { useWidgets } from "../../../../../../core/composables/useWidgets";
import WidgetContainerDesktop from "./WidgetContainerDesktop.vue";
import WidgetContainerMobile from "./WidgetContainerMobile.vue";
import { BladeInstance } from "../../../../../../injection-keys";
import { IWidget } from "../../../../../../core/services";
import { DEFAULT_BLADE_INSTANCE } from "../../constants";
import { resolveVisibility } from "../../utils";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const normalizedBladeId = computed(() => props.bladeId.toLowerCase());
const widgetService = useWidgets();
const widgets = computed(() => widgetService.getWidgets(normalizedBladeId.value));

const bladeInstance = inject(BladeInstance, DEFAULT_BLADE_INSTANCE);

const visibleWidgets = computed(() =>
  widgets.value.filter((widget: IWidget) => resolveVisibility(widget.isVisible, toValue(bladeInstance))),
);
</script>
