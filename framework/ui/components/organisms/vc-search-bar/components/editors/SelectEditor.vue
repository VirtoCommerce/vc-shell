<template>
  <div class="vc-search-bar-editor">
    <div
      v-if="canNegate"
      class="vc-search-bar-editor__segments"
      role="group"
      :aria-label="field.label"
    >
      <button
        v-for="m in modes"
        :key="m.id"
        type="button"
        class="vc-search-bar-editor__segment"
        :class="{ 'vc-search-bar-editor__segment--on': mode === m.id }"
        :aria-pressed="mode === m.id"
        @click="setMode(m.id)"
      >
        {{ $t(m.label) }}
      </button>
    </div>

    <VcInput
      v-if="field.options.length > FIND_AFTER"
      v-model="find"
      class="vc-search-bar-editor__find"
      size="small"
      clearable
      :aria-label="$t(`${E}FIND`)"
      :placeholder="$t(`${E}FIND`)"
    >
      <template #prepend-inner>
        <VcIcon
          icon="lucide-search"
          :custom-size="14"
        />
      </template>
    </VcInput>

    <div class="vc-search-bar-editor__list">
      <template v-if="field.kind === 'multiselect'">
        <div
          v-for="o in shown"
          :key="o.value"
          class="vc-search-bar-editor__row"
          :class="{ 'vc-search-bar-editor__row--dim': isDim(o) }"
        >
          <VcCheckbox
            class="vc-search-bar-editor__check"
            :model-value="selected.includes(o.value)"
            @update:model-value="toggle(o.value, $event)"
          >
            {{ o.label }}
          </VcCheckbox>
          <span
            v-if="countOf(o) !== undefined"
            class="vc-search-bar-editor__count"
            >{{ countOf(o) }}</span
          >
          <button
            type="button"
            class="vc-search-bar-editor__only"
            :aria-label="$t(`${E}ONLY_LABEL`, { label: o.label })"
            @click="only(o.value)"
          >
            {{ $t(`${E}ONLY`) }}
          </button>
        </div>
      </template>

      <template v-else>
        <button
          v-for="o in shown"
          :key="o.value"
          type="button"
          class="vc-search-bar-editor__row vc-search-bar-editor__option"
          :class="{
            'vc-search-bar-editor__option--on': value === o.value,
            'vc-search-bar-editor__row--dim': isDim(o),
          }"
          :aria-pressed="value === o.value"
          @click="emit('update:value', value === o.value ? undefined : o.value)"
        >
          <span class="vc-search-bar-editor__label">{{ o.label }}</span>
          <span
            v-if="countOf(o) !== undefined"
            class="vc-search-bar-editor__count"
            >{{ countOf(o) }}</span
          >
        </button>
      </template>

      <p
        v-if="!shown.length"
        class="vc-search-bar-editor__empty"
      >
        {{ $t(`${E}NOTHING_FOUND`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VcIcon } from "@ui/components/atoms";
import { VcCheckbox, VcInput } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import type { FilterOption, SearchBarValue } from "../../types";

const props = defineProps<{
  field: BarField;
  value: SearchBarValue;
  /** Results per option value; given counts dim the options with none */
  counts?: Record<string, number>;
}>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

const E = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.EDITOR.";
const FIND_AFTER = 6;

type Mode = "any" | "not";
const modes: { id: Mode; label: string }[] = [
  { id: "any", label: "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.ANY" },
  { id: "not", label: "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.NOT" },
];

const notList = (v: unknown): string[] | undefined =>
  typeof v === "object" && v !== null && Array.isArray((v as { not?: unknown }).not)
    ? (v as { not: string[] }).not
    : undefined;

const canNegate = computed(() => props.field.kind === "multiselect" && props.field.operators.includes("not"));
// Local, so "Is not" can be chosen before anything is selected
const mode = ref<Mode>(notList(props.value) ? "not" : "any");
watch(
  () => props.value,
  (v) => {
    if (notList(v)) mode.value = "not";
    else if (Array.isArray(v) && v.length) mode.value = "any";
  },
);
const selected = computed<(string | number)[]>(() => {
  const list = notList(props.value) ?? (Array.isArray(props.value) ? props.value : []);
  return list as (string | number)[];
});

const find = ref("");
const shown = computed(() => {
  const q = String(find.value ?? "")
    .trim()
    .toLowerCase();
  return q ? props.field.options.filter((o) => o.label.toLowerCase().includes(q)) : props.field.options;
});

const countOf = (o: FilterOption) => props.counts?.[String(o.value)] ?? o.count;
const isSelected = (o: FilterOption) =>
  props.field.kind === "multiselect" ? selected.value.includes(o.value) : props.value === o.value;
const isDim = (o: FilterOption) => !!props.counts && countOf(o) === 0 && !isSelected(o);

function write(list: (string | number)[], m: Mode) {
  if (!list.length) return emit("update:value", undefined);
  emit("update:value", m === "not" ? { not: list } : list);
}

function toggle(v: string | number, on: unknown) {
  const next = selected.value.filter((x) => x !== v);
  if (on) next.push(v);
  write(next, mode.value);
}

function only(v: string | number) {
  write([v], mode.value);
}

function setMode(m: Mode) {
  if (m === mode.value) return;
  mode.value = m;
  if (selected.value.length) write(selected.value, m);
}
</script>

<style lang="scss">
.vc-search-bar-editor {
  @apply tw-flex tw-flex-col tw-gap-2;
  font-size: 13px;

  &__segments {
    @apply tw-flex tw-gap-1;
  }
  &__segment {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-px-2;
    min-height: 28px;
    border: 1px solid var(--neutrals-300);
    color: var(--neutrals-700);
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__segment--on {
    border-color: var(--primary-300);
    background: var(--primary-50);
    color: var(--primary-700);
  }
  &__list {
    @apply tw-flex tw-flex-col;
  }
  &__row {
    @apply tw-relative tw-flex tw-items-center tw-gap-2 tw-rounded-md tw-px-2 tw-w-full tw-text-left;
    min-height: 32px;
    color: var(--neutrals-800);
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__row--dim {
    color: var(--neutrals-400);
  }
  &__check {
    @apply tw-flex-1 tw-min-w-0;
  }
  &__label {
    @apply tw-flex-1 tw-truncate;
  }
  &__option--on {
    color: var(--primary-700);
    @apply tw-font-medium;
  }
  &__count {
    @apply tw-ms-auto tw-shrink-0 tw-tabular-nums;
    font-size: 12px;
    color: var(--neutrals-500);
  }
  // "Only" covers the count while the row is hovered or holds focus; it stays focusable
  &__only {
    @apply tw-absolute tw-opacity-0;
    inset-inline-end: 8px;
    font-size: 12px;
    color: var(--primary-600);
    &:hover {
      text-decoration: underline;
    }
  }
  &__row:hover,
  &__row:focus-within {
    .vc-search-bar-editor__only {
      @apply tw-opacity-100;
    }
    .vc-search-bar-editor__count {
      @apply tw-invisible;
    }
  }
  &__empty {
    @apply tw-px-2 tw-py-2;
    color: var(--neutrals-500);
  }
}
</style>
