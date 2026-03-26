<template>
  <WidgetContainerMobile
    v-if="visibleWidgets.length > 0 && isMobile"
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
import { computed, inject, onMounted, onUnmounted } from "vue";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { useWidgets } from "@core/composables/useWidgets";
import WidgetContainerDesktop from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerDesktop.vue";
import WidgetContainerMobile from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainerMobile.vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { IWidget } from "@core/services/widget-service";
import { resolveVisibility } from "@ui/components/organisms/vc-blade/utils";
import { createLogger } from "@core/utilities";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const { isMobile } = useResponsive();
const logger = createLogger("widget-container");

const normalizedBladeId = computed(() => props.bladeId.toLowerCase());
const widgetService = useWidgets();

const descriptor = inject(BladeDescriptorKey, undefined);

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

    try {
      widgetService.registerWidget(
        {
          id: externalWidget.id,
          component: externalWidget.component,
          isVisible: externalWidget.isVisible,
          title: externalWidget.title,
        },
        normalizedBladeId.value,
      );
      registeredExternalWidgetIds.add(externalWidget.id);
    } catch (error) {
      logger.error(`Failed to register external widget '${externalWidget.id}':`, error);
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

// ── Standard widget rendering ───────────────────────────────────────────────

const widgets = computed(() => widgetService.getWidgets(normalizedBladeId.value));

const visibleWidgets = computed(() =>
  widgets.value.filter((widget: IWidget) => resolveVisibility(widget.isVisible, descriptor?.value)),
);
</script>
