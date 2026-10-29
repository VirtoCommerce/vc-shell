<template>
  <slot />
</template>

<script setup lang="ts">
import { provide, inject } from "vue";
import { WidgetServiceKey, WidgetScopeKey } from "@framework/injection-keys";
import { WidgetRenderStateKey, type IWidgetRenderState } from "@ui/components/atoms/vc-widget/widget-render-state";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import type { IWidgetTrigger, IWidgetScope } from "@core/services/widget-service";

const props = defineProps<{ widgetId: string; renderState?: IWidgetRenderState }>();

const widgetService = inject(WidgetServiceKey)!;
const descriptor = inject(BladeDescriptorKey, undefined);
const bladeId = descriptor?.value.id ?? "";

const scope: IWidgetScope = {
  setTrigger: (trigger: IWidgetTrigger) => {
    widgetService.updateWidget({ id: props.widgetId, bladeId, widget: { trigger } });
  },
};

provide(WidgetScopeKey, scope);
if (props.renderState) provide(WidgetRenderStateKey, props.renderState);
</script>
