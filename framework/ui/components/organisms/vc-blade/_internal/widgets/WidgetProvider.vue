<template>
  <slot />
</template>

<script setup lang="ts">
import { provide } from "vue";
import { WidgetIdKey } from "@framework/injection-keys";

const props = defineProps<{
  widgetId: string;
}>();

provide(WidgetIdKey, props.widgetId);
</script>
