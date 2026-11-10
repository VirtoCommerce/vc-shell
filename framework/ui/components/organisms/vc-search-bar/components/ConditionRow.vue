<template>
  <div class="vc-search-bar__crow">
    <span class="vc-search-bar__crow-conj">{{ $t(`${P}.${first ? "WHERE" : "AND"}`) }}</span>
    <span class="vc-search-bar__crow-field">{{ field.label }}</span>

    <div class="vc-search-bar__crow-op">
      <VcSelect
        v-if="opChoices"
        :model-value="opModel"
        size="small"
        :options="opChoices"
        :clearable="false"
        :aria-label="$t(`${P}.OPERATOR`)"
        @update:model-value="setOp(String($event))"
      />
      <span
        v-else
        class="vc-search-bar__op-text"
        >{{ $t(opText) }}</span
      >
    </div>

    <div
      class="vc-search-bar__crow-val"
      :class="{ 'vc-search-bar__crow-val--stack': field.kind === 'dateRange' }"
    >
      <component
        :is="custom"
        v-if="field.kind === 'custom' && custom"
        :model-value="value"
        @update:model-value="emit('update:value', $event)"
      />
      <VcSelect
        v-else-if="field.kind === 'select'"
        :model-value="value ?? null"
        size="small"
        :options="selectOptions"
        :placeholder="$t(`${P}.CHOOSE`)"
        :aria-label="field.label"
        @update:model-value="emit('update:value', $event ?? undefined)"
      />
      <VcSelect
        v-else-if="field.kind === 'multiselect'"
        :model-value="list"
        size="small"
        multiple
        :options="selectOptions"
        :clearable="false"
        :placeholder="$t(`${P}.CHOOSE`)"
        :aria-label="field.label"
        @update:model-value="writeList(($event as (string | number)[] | null) ?? [])"
      />
      <template v-else-if="field.kind === 'number'">
        <VcInput
          v-model="first1"
          size="small"
          type="number"
          :aria-label="$t(`${NUM}.${numOp === 'between' ? 'MIN' : 'VALUE'}`)"
          :placeholder="$t(`${NUM}.${numOp === 'between' ? 'MIN' : 'VALUE'}`)"
          @blur="commitNumber"
          @keydown.enter.prevent="commitNumber"
        />
        <VcInput
          v-if="numOp === 'between'"
          v-model="first2"
          size="small"
          type="number"
          :aria-label="$t(`${NUM}.MAX`)"
          :placeholder="$t(`${NUM}.MAX`)"
          @blur="commitNumber"
          @keydown.enter.prevent="commitNumber"
        />
      </template>
      <template v-else-if="field.kind === 'dateRange'">
        <VcSelect
          :model-value="period"
          size="small"
          :options="periodOptions"
          :clearable="false"
          :placeholder="$t(`${P}.PERIOD`)"
          :aria-label="$t(`${P}.PERIOD`)"
          @update:model-value="setPeriod(String($event))"
        />
        <VcDatePicker
          v-if="period === 'custom'"
          :model-value="pickerValue"
          size="small"
          :date-picker-options="{ range: true, teleport: true }"
          :placeholder="$t(`${DATE}.CUSTOM_RANGE`)"
          :aria-label="$t(`${DATE}.CUSTOM_RANGE`)"
          @update:model-value="setRange"
        />
      </template>
      <VcInput
        v-else-if="field.kind === 'text'"
        :model-value="typeof value === 'string' ? value : ''"
        size="small"
        :aria-label="field.label"
        :placeholder="field.label"
        @update:model-value="emit('update:value', String($event ?? '') || undefined)"
      />
    </div>

    <button
      type="button"
      class="vc-search-bar__crow-x"
      :aria-label="$t(`${P}.REMOVE`, { label: field.label })"
      @click="emit('remove')"
    >
      <VcIcon
        icon="lucide-x"
        size="xs"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import { VcDatePicker, VcInput, VcSelect } from "@ui/components/molecules";
import type { BarField } from "../lib/fields";
import { buildNumber, isNot, pickerToRange, RELATIVE_DATES, toDate, type NumberOp } from "../lib/values";
import type { CustomFilterConfig, NumberValue, RelativeDate, SearchBarValue } from "../types";

const props = defineProps<{ field: BarField; value: SearchBarValue; first: boolean }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined]; remove: [] }>();
const { t } = useI18n({ useScope: "global" });

const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER";
const NUM = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.NUMBER";
const DATE = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE";

const custom = computed(() =>
  props.field.kind === "custom" ? (props.field.source.filter as CustomFilterConfig).component : undefined,
);
const canNegate = computed(() => props.field.kind === "multiselect" && props.field.operators.includes("not"));

// Operator cell: a select when the kind has a choice, plain text otherwise
const opChoices = computed(() => {
  if (props.field.kind === "number")
    return [
      { id: "gte", title: "≥" },
      { id: "lte", title: "≤" },
      { id: "eq", title: "=" },
      { id: "between", title: t(`${NUM}.BETWEEN`) },
    ];
  if (canNegate.value)
    return [
      { id: "any", title: t(`${P}.IS_ANY_OF`) },
      { id: "not", title: t(`${P}.IS_NOT`) },
    ];
  return undefined;
});
const opText = computed(() => {
  switch (props.field.kind) {
    case "toggle":
      return `${P}.IS_ON`;
    case "text":
      return `${P}.CONTAINS`;
    default:
      return `${P}.IS`;
  }
});

// select / multiselect
const selectOptions = computed(() =>
  props.field.options.map((o) => ({
    id: o.value,
    title: o.count !== undefined ? `${o.label} (${o.count})` : o.label,
  })),
);
const list = computed<(string | number)[]>(
  () => (isNot(props.value) ? props.value.not : Array.isArray(props.value) ? props.value : []) as (string | number)[],
);
// Local, so "is not" can be chosen before anything is selected
const mode = ref<"any" | "not">(isNot(props.value) ? "not" : "any");
watch(
  () => props.value,
  (v) => {
    if (isNot(v)) mode.value = "not";
    else if (Array.isArray(v) && v.length) mode.value = "any";
  },
);
function writeList(l: (string | number)[]) {
  if (!l.length) return emit("update:value", undefined);
  emit("update:value", mode.value === "not" ? { not: l } : l);
}

// number
const asNumber = (v: unknown): NumberValue | undefined =>
  typeof v === "object" && v !== null && "op" in v ? (v as NumberValue) : undefined;
const txt = (n?: number) => (n === undefined ? "" : String(n));
const numOp = ref<NumberOp>(asNumber(props.value)?.op ?? "gte");
const first1 = ref("");
const first2 = ref("");
function loadNumber(v?: NumberValue) {
  if (!v) {
    first1.value = "";
    first2.value = "";
    return;
  }
  numOp.value = v.op;
  first1.value = txt(v.op === "lte" ? v.max : v.min);
  first2.value = v.op === "between" ? txt(v.max) : "";
}
loadNumber(asNumber(props.value));
watch(
  () => props.value,
  (v) => loadNumber(asNumber(v)),
);
function commitNumber() {
  const next = buildNumber(numOp.value, first1.value, first2.value);
  const cur = asNumber(props.value);
  if (next) {
    if (JSON.stringify(next) !== JSON.stringify(cur)) emit("update:value", next);
  } else if (!first1.value.trim() && !first2.value.trim() && cur) emit("update:value", undefined);
}

// date range
type Range = { start?: string; end?: string; relative?: RelativeDate["relative"] };
const range = computed(() =>
  typeof props.value === "object" && props.value !== null ? (props.value as Range) : undefined,
);
const customPicked = ref(!!range.value && !range.value.relative);
const period = computed(() => range.value?.relative ?? (customPicked.value || range.value ? "custom" : null));
const periodOptions = computed(() => [
  ...RELATIVE_DATES.map((r) => ({ id: r.id, title: t(`${DATE}.${r.key}`) })),
  { id: "custom", title: t(`${DATE}.CUSTOM_RANGE`) },
]);
const pickerValue = computed(() => {
  const r = range.value;
  if (!r || r.relative || (!r.start && !r.end)) return null;
  return [toDate(r.start), toDate(r.end)] as unknown as Date[];
});

function setPeriod(id: string) {
  customPicked.value = id === "custom";
  if (id !== "custom") emit("update:value", { relative: id as RelativeDate["relative"] });
  else if (range.value?.relative) emit("update:value", undefined);
}
function setRange(v: unknown) {
  const next = pickerToRange(v);
  const cur = range.value;
  // VcDatePicker echoes every new model back; writing the same range again would loop
  if (cur && !cur.relative && cur.start === next?.start && cur.end === next?.end) return;
  if (!cur && !next) return;
  emit("update:value", next);
}

// one operator handler for both kinds that have a choice
function setOp(id: string) {
  if (props.field.kind === "number") {
    if (id === numOp.value) return;
    numOp.value = id as NumberOp;
    const built = buildNumber(numOp.value, first1.value, first2.value);
    if (built) emit("update:value", built);
    return;
  }
  if (id === mode.value) return;
  mode.value = id as "any" | "not";
  if (list.value.length) writeList(list.value);
}

const opModel = computed(() => (props.field.kind === "number" ? numOp.value : mode.value));
</script>
