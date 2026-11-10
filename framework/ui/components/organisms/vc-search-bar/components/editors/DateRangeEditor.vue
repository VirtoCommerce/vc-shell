<template>
  <div class="vc-search-bar-editor">
    <div
      class="vc-search-bar-editor__quick"
      role="group"
      :aria-label="field.label"
    >
      <button
        v-for="r in RELATIVE_DATES"
        :key="r.id"
        type="button"
        class="vc-search-bar-editor__segment"
        :class="{ 'vc-search-bar-editor__segment--on': current?.relative === r.id }"
        :aria-pressed="current?.relative === r.id"
        @click="emit('update:value', { relative: r.id })"
      >
        {{ $t(`COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.${r.key}`) }}
      </button>
    </div>
    <VcDatePicker
      :model-value="pickerValue"
      size="small"
      :date-picker-options="{ range: true, teleport: true }"
      :placeholder="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.CUSTOM_RANGE')"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.CUSTOM_RANGE')"
      @update:model-value="setRange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcDatePicker } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import { pickerToRange, RELATIVE_DATES, toDate } from "../../lib/values";
import type { RelativeDate, SearchBarValue } from "../../types";

const props = defineProps<{ field: BarField; value: SearchBarValue }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

type Range = { start?: string; end?: string; relative?: RelativeDate["relative"] };

const current = computed(() =>
  typeof props.value === "object" && props.value !== null ? (props.value as Range) : undefined,
);

const pickerValue = computed(() => {
  const c = current.value;
  if (!c || c.relative || (!c.start && !c.end)) return null;
  return [toDate(c.start), toDate(c.end)] as unknown as Date[];
});

function setRange(v: unknown) {
  const next = pickerToRange(v);
  const cur = current.value;
  // VcDatePicker echoes every new model back; writing the same range again would loop
  if (cur && !cur.relative && cur.start === next?.start && cur.end === next?.end) return;
  if (!cur && !next) return;
  emit("update:value", next);
}
</script>
