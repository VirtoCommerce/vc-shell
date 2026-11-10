<template>
  <div
    class="vc-search-bar-editor"
    @keydown.enter.prevent="commit"
  >
    <div
      class="vc-search-bar-editor__segments"
      role="group"
      :aria-label="field.label"
    >
      <button
        v-for="o in ops"
        :key="o.id"
        type="button"
        class="vc-search-bar-editor__segment"
        :class="{ 'vc-search-bar-editor__segment--on': op === o.id }"
        :aria-pressed="op === o.id"
        @click="setOp(o.id)"
      >
        {{ $t(o.label) }}
      </button>
    </div>
    <div class="vc-search-bar-editor__range">
      <VcInput
        v-model="first"
        size="small"
        type="number"
        :aria-label="firstLabel"
        :placeholder="firstLabel"
        @blur="commit"
      />
      <VcInput
        v-if="op === 'between'"
        v-model="second"
        size="small"
        type="number"
        :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.NUMBER.MAX')"
        :placeholder="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.NUMBER.MAX')"
        @blur="commit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcInput } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import type { NumberValue, SearchBarValue } from "../../types";

const props = defineProps<{ field: BarField; value: SearchBarValue }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();
const { t } = useI18n({ useScope: "global" });

type Op = NumberValue["op"];
const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.NUMBER";
const ops: { id: Op; label: string }[] = [
  { id: "gte", label: `${P}.GTE` },
  { id: "lte", label: `${P}.LTE` },
  { id: "eq", label: `${P}.EQ` },
  { id: "between", label: `${P}.BETWEEN` },
];

const asNumber = (v: unknown): NumberValue | undefined =>
  typeof v === "object" && v !== null && "op" in v ? (v as NumberValue) : undefined;
const text = (n?: number) => (n === undefined ? "" : String(n));

const op = ref<Op>(asNumber(props.value)?.op ?? "gte");
const first = ref("");
const second = ref("");

function load(v?: NumberValue) {
  if (!v) {
    first.value = "";
    second.value = "";
    return;
  }
  op.value = v.op;
  first.value = text(v.op === "lte" ? v.max : v.min);
  second.value = v.op === "between" ? text(v.max) : "";
}
load(asNumber(props.value));
watch(
  () => props.value,
  (v) => load(asNumber(v)),
);

const firstLabel = computed(() => t(op.value === "between" ? `${P}.MIN` : `${P}.VALUE`));

const parse = (s: string | number | null | undefined): number | undefined => {
  const trimmed = String(s ?? "").trim();
  const n = trimmed === "" ? NaN : Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
};

// Never a NumberValue with a bound missing for its op
function build(): NumberValue | undefined {
  const a = parse(first.value);
  const b = parse(second.value);
  switch (op.value) {
    case "gte":
    case "eq":
      return a === undefined ? undefined : { op: op.value, min: a };
    case "lte":
      return a === undefined ? undefined : { op: "lte", max: a };
    default:
      return a === undefined || b === undefined ? undefined : { op: "between", min: a, max: b };
  }
}

function commit() {
  const next = build();
  if (next) {
    if (JSON.stringify(next) !== JSON.stringify(asNumber(props.value))) emit("update:value", next);
  } else if (parse(first.value) === undefined && parse(second.value) === undefined && asNumber(props.value)) {
    emit("update:value", undefined);
  }
}

function setOp(next: Op) {
  if (next === op.value) return;
  op.value = next;
  const built = build();
  if (built) emit("update:value", built);
}
</script>
