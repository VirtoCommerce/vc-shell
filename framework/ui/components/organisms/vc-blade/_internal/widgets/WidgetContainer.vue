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
import { computed, inject, toValue, onMounted, onUnmounted, watch, ref } from "vue";
import { useWidgets } from "@core/composables/useWidgets";
import WidgetContainerDesktop from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerDesktop.vue";
import WidgetContainerMobile from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerMobile.vue";
import { BladeInstanceKey } from "@framework/injection-keys";
import { BladeDescriptorKey, BladeDataKey } from "@shared/components/blade-navigation/types";
import { IWidget } from "@core/services/widget-service";
import { DEFAULT_BLADE_INSTANCE } from "@ui/components/organisms/vc-blade/constants";
import { resolveVisibility } from "@ui/components/organisms/vc-blade/utils";
import { createLogger } from "@core/utilities";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const logger = createLogger("widget-container");

const normalizedBladeId = computed(() => props.bladeId.toLowerCase());
const widgetService = useWidgets();

const bladeInstance = inject(BladeInstanceKey, DEFAULT_BLADE_INSTANCE);
const descriptor = inject(BladeDescriptorKey, undefined);
const bladeData = inject(BladeDataKey, ref({}));

// ── External widget auto-resolution ─────────────────────────────────────────

const bladeName = computed(() => descriptor?.value.name?.toLowerCase() ?? "");
const registeredExternalWidgetIds = new Set<string>();

function registerExternalWidgets() {
  if (!bladeName.value) return;

  const allExternalWidgets = widgetService.getAllExternalWidgets();

  const matchingWidgets = allExternalWidgets.filter(
    (widget) => widget.targetBlades?.some((t) => t.toLowerCase() === bladeName.value) ?? false,
  );

  matchingWidgets.forEach((externalWidget) => {
    if (registeredExternalWidgetIds.has(externalWidget.id)) return;

    const widgetClone = widgetService.cloneWidget(externalWidget);

    const newWidget: IWidget = {
      ...widgetClone,
      props: widgetService.resolveWidgetProps(widgetClone, toValue(bladeData)),
    };

    try {
      widgetService.registerWidget(newWidget, normalizedBladeId.value);
      registeredExternalWidgetIds.add(externalWidget.id);
    } catch (error) {
      logger.error(`Failed to register external widget '${externalWidget.id}':`, error);
    }
  });
}

function updateExternalWidgetProps() {
  registeredExternalWidgetIds.forEach((widgetId) => {
    const widget = widgetService.getWidgets(normalizedBladeId.value).find((w) => w.id === widgetId);
    if (widget) {
      try {
        const resolvedProps = widgetService.resolveWidgetProps(widget, toValue(bladeData));
        widgetService.updateWidget({
          id: widget.id,
          bladeId: props.bladeId,
          widget: { props: resolvedProps },
        });
      } catch (error) {
        logger.error(`Failed to update props for widget '${widget.id}':`, error);
      }
    }
  });
}

function unregisterExternalWidgets() {
  registeredExternalWidgetIds.forEach((widgetId) => {
    try {
      widgetService.unregisterWidget(widgetId, normalizedBladeId.value);
    } catch (error) {
      logger.error(`Failed to unregister external widget '${widgetId}':`, error);
    }
  });
  registeredExternalWidgetIds.clear();
}

onMounted(registerExternalWidgets);
onUnmounted(unregisterExternalWidgets);

watch(
  () => toValue(bladeData),
  () => updateExternalWidgetProps(),
  { deep: true },
);

// ── Standard widget rendering ───────────────────────────────────────────────

const widgets = computed(() => widgetService.getWidgets(normalizedBladeId.value));

const visibleWidgets = computed(() =>
  widgets.value.filter((widget: IWidget) => resolveVisibility(widget.isVisible, toValue(bladeInstance))),
);
</script>
