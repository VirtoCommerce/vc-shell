<template>
  <component
    :is="custom"
    v-if="field.kind === 'custom' && custom"
    :model-value="value"
    @update:model-value="update"
  />
  <SelectEditor
    v-else-if="field.kind === 'select' || field.kind === 'multiselect'"
    :field="field"
    :value="value"
    :counts="counts"
    @update:value="update"
  />
  <DateRangeEditor
    v-else-if="field.kind === 'dateRange'"
    :field="field"
    :value="value"
    :counts="counts"
    @update:value="update"
  />
  <NumberEditor
    v-else-if="field.kind === 'number'"
    :field="field"
    :value="value"
    @update:value="update"
  />
  <TextEditor
    v-else-if="field.kind === 'text'"
    :field="field"
    :value="value"
    @update:value="update"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BarField } from "../lib/fields";
import type { CustomFilterConfig, SearchBarValue } from "../types";
import SelectEditor from "./editors/SelectEditor.vue";
import DateRangeEditor from "./editors/DateRangeEditor.vue";
import NumberEditor from "./editors/NumberEditor.vue";
import TextEditor from "./editors/TextEditor.vue";

const props = defineProps<{
  field: BarField;
  value: SearchBarValue;
  /** The field's results per option value (or relative date id) */
  counts?: Record<string, number>;
}>();
/** The field id comes along, so a commit that lands after the editor closed still knows its field */
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined, id: string] }>();
const update = (v: SearchBarValue | undefined) => emit("update:value", v, props.field.id);

const custom = computed(() =>
  props.field.kind === "custom" ? (props.field.source.filter as CustomFilterConfig).component : undefined,
);
</script>
