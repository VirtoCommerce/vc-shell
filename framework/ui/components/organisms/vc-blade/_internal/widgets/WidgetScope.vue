<template>
  <slot />
</template>

<script setup lang="ts">
import { provide, inject } from "vue";
import { WidgetServiceKey, WidgetScopeKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import type { IWidgetTrigger } from "@core/services/widget-service";
import type { IWidgetScope } from "@core/composables/useBladeWidgets";

const props = defineProps<{ widgetId: string }>();

const widgetService = inject(WidgetServiceKey)!;
const descriptor = inject(BladeDescriptorKey, undefined);
const bladeId = descriptor?.value.id ?? "";

const scope: IWidgetScope = {
  setTrigger: (trigger: IWidgetTrigger) => {
    widgetService.updateWidget({ id: props.widgetId, bladeId, widget: { trigger } });
  },
};

provide(WidgetScopeKey, scope);
</script>
