<template>
  <div class="vc-search-bar-editor">
    <div
      class="vc-search-bar-editor__list"
      role="radiogroup"
      :aria-label="field.label"
    >
      <button
        v-for="c in choices"
        :key="c.id"
        type="button"
        role="radio"
        class="vc-search-bar-editor__row vc-search-bar-editor__radio"
        :class="{ 'vc-search-bar-editor__radio--on': c.on }"
        :aria-checked="c.on"
        @click="!c.on && emit('update:value', c.value)"
      >
        <span
          class="vc-search-bar-editor__dot"
          aria-hidden="true"
        />
        <span class="vc-search-bar-editor__label">{{ $t(`${D}${c.key}`) }}</span>
        <span
          v-if="c.count !== undefined"
          class="vc-search-bar-editor__count"
          >{{ c.count }}</span
        >
      </button>
    </div>
    <VcDatePicker
      :model-value="pickerValue"
      size="small"
      :date-picker-options="{ range: true, teleport: true }"
      :placeholder="$t(`${D}CUSTOM_RANGE`)"
      :aria-label="$t(`${D}CUSTOM_RANGE`)"
      @update:model-value="setRange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcDatePicker } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import { isEmptyValue, pickerToRange, RELATIVE_DATES, toDate } from "../../lib/values";
import type { RelativeDate, SearchBarValue } from "../../types";

const props = defineProps<{
  field: BarField;
  value: SearchBarValue;
  /** Results per relative range id ("today", "7d", "30d") */
  counts?: Record<string, number>;
}>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

const D = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.";

type Range = { start?: string; end?: string; relative?: RelativeDate["relative"] };

const current = computed(() =>
  typeof props.value === "object" && props.value !== null ? (props.value as Range) : undefined,
);

// "Any time" clears; a custom range checks none of the rows
const choices = computed(() => [
  { id: "any", key: "ANY", value: undefined, on: isEmptyValue(props.value), count: undefined },
  ...RELATIVE_DATES.map((r) => ({
    id: r.id,
    key: r.key,
    value: { relative: r.id } as RelativeDate,
    on: current.value?.relative === r.id,
    count: props.counts?.[r.id],
  })),
]);

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

<style lang="scss">
.vc-search-bar-editor {
  &__dot {
    @apply tw-shrink-0 tw-rounded-full;
    width: 14px;
    height: 14px;
    border: 1px solid var(--neutrals-400);
    background: var(--additional-50);
  }
  &__radio--on {
    color: var(--primary-700);
    .vc-search-bar-editor__dot {
      border: 4px solid var(--primary-600);
    }
  }
}
</style>
