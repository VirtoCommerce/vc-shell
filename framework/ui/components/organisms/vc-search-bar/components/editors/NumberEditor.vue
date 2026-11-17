<template>
  <div class="vc-search-bar-editor">
    <!-- Enter applies from the inputs only: on a preset it is that preset's click -->
    <div
      class="vc-search-bar-editor__range"
      @keydown.enter.prevent="apply"
    >
      <VcInput
        v-model="from"
        size="small"
        type="number"
        :aria-label="$t(`${N}MIN`)"
        :placeholder="$t(`${N}MIN`)"
      />
      <VcInput
        v-model="to"
        size="small"
        type="number"
        :aria-label="$t(`${N}MAX`)"
        :placeholder="$t(`${N}MAX`)"
      />
    </div>
    <div
      v-if="presets.length"
      class="vc-search-bar-editor__presets"
      role="group"
      :aria-label="field.label"
    >
      <VcButton
        v-for="p in presets"
        :key="p.label"
        class="vc-search-bar-editor__preset"
        :class="{ 'vc-search-bar-editor__preset--on': same(p.value, current) }"
        variant="secondary"
        size="2xs"
        :selected="same(p.value, current)"
        :aria-pressed="same(p.value, current)"
        @click="pick(p.value)"
      >
        {{ p.label }}
      </VcButton>
    </div>
    <div class="vc-search-bar-editor__foot">
      <span class="vc-search-bar-editor__note">{{ $t(presets.length ? `${N}NOTE_PRESETS` : `${N}NOTE`) }}</span>
      <VcButton
        class="vc-search-bar-editor__apply"
        size="sm"
        :disabled="!changed"
        @click="apply"
      >
        {{ $t(`${N}APPLY`) }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VcButton } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import { buildNumber } from "../../lib/values";
import type { NumberFilterConfig, NumberValue, SearchBarValue } from "../../types";

const props = defineProps<{ field: BarField; value: SearchBarValue }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

const N = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.NUMBER.";

const asNumber = (v: unknown): NumberValue | undefined =>
  typeof v === "object" && v !== null && "op" in v ? (v as NumberValue) : undefined;
const text = (n?: number) => (n === undefined ? "" : String(n));
const same = (a?: NumberValue, b?: NumberValue) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const current = computed(() => asNumber(props.value));
const presets = computed(() => (props.field.source.filter as NumberFilterConfig).presets ?? []);

const from = ref("");
const to = ref("");

// "Equals" shows as the same From and To
function load(v?: NumberValue) {
  from.value = v && v.op !== "lte" ? text(v.min) : "";
  to.value = !v || v.op === "gte" ? "" : text(v.op === "eq" ? v.min : v.max);
}
load(current.value);
watch(current, (v) => load(v));

const blank = (s: unknown) => String(s ?? "").trim() === "";

/** The typed range; `null` when a bound is not a number */
const draft = computed<NumberValue | undefined | null>(() => {
  const noFrom = blank(from.value);
  const noTo = blank(to.value);
  if (noFrom && noTo) return undefined;
  const built = noTo
    ? buildNumber("gte", from.value)
    : noFrom
      ? buildNumber("lte", to.value)
      : buildNumber("between", from.value, to.value);
  return built ?? null;
});

const changed = computed(() => {
  if (draft.value === null) return false;
  const loaded =
    current.value?.op === "eq" ? { op: "between", min: current.value.min, max: current.value.min } : current.value;
  return !same(draft.value, loaded as NumberValue | undefined);
});

function apply() {
  if (!changed.value) return;
  emit("update:value", draft.value ?? undefined);
}

function pick(v: NumberValue) {
  emit("update:value", same(v, current.value) ? undefined : v);
}
</script>

<style lang="scss">
.vc-search-bar-editor {
  &__range {
    @apply tw-grid tw-grid-cols-2 tw-gap-2;
  }
  &__presets {
    @apply tw-flex tw-flex-wrap tw-gap-1;
  }
  &__foot {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2;
  }
  &__note {
    font-size: 11.5px;
    color: var(--neutrals-500);
  }
  &__apply {
    @apply tw-shrink-0;
    --button-sm-height: 28px;
  }
}
</style>
