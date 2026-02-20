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
import { useWidgets } from "@core/composables/useWidgets";
import WidgetContainerDesktop from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerDesktop.vue";
import WidgetContainerMobile from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerMobile.vue";
import { BladeInstance } from "@framework/injection-keys";
import { IWidget } from "@core/services";
import { DEFAULT_BLADE_INSTANCE } from "@ui/components/organisms/vc-blade/constants";
import { resolveVisibility } from "@ui/components/organisms/vc-blade/utils";

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
