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

    <template v-if="field.kind === 'multiselect'">
      <VcCheckbox
        v-for="o in field.options"
        :key="o.value"
        :model-value="selected.includes(o.value)"
        @update:model-value="toggle(o.value, $event)"
      >
        {{ o.label }}
        <span
          v-if="o.count !== undefined"
          class="vc-search-bar-editor__count"
          >{{ o.count }}</span
        >
      </VcCheckbox>
    </template>

    <template v-else>
      <button
        v-for="o in field.options"
        :key="o.value"
        type="button"
        class="vc-search-bar-editor__option"
        :class="{ 'vc-search-bar-editor__option--on': value === o.value }"
        :aria-pressed="value === o.value"
        @click="emit('update:value', value === o.value ? undefined : o.value)"
      >
        {{ o.label }}
        <span
          v-if="o.count !== undefined"
          class="vc-search-bar-editor__count"
          >{{ o.count }}</span
        >
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VcCheckbox } from "@ui/components/molecules";
import type { BarField } from "../../lib/fields";
import type { SearchBarValue } from "../../types";

const props = defineProps<{ field: BarField; value: SearchBarValue }>();
const emit = defineEmits<{ "update:value": [value: SearchBarValue | undefined] }>();

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

function write(list: (string | number)[], m: Mode) {
  if (!list.length) return emit("update:value", undefined);
  emit("update:value", m === "not" ? { not: list } : list);
}

function toggle(v: string | number, on: unknown) {
  const next = selected.value.filter((x) => x !== v);
  if (on) next.push(v);
  write(next, mode.value);
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

  &__segments {
    @apply tw-flex tw-gap-1;
  }
  &__segment,
  &__option {
    @apply tw-inline-flex tw-items-center tw-justify-between tw-gap-2 tw-rounded-md tw-text-sm tw-px-2;
    min-height: 28px;
    border: 1px solid var(--neutrals-300);
    color: var(--neutrals-700);
    &:hover {
      background: var(--neutrals-50);
    }
  }
  &__segment--on,
  &__option--on {
    border-color: var(--primary-500);
    background: var(--primary-50);
    color: var(--primary-700);
  }
  &__option {
    border-color: transparent;
    width: 100%;
  }
  &__count {
    @apply tw-ms-2 tw-text-xs;
    color: var(--neutrals-500);
  }
  &__range {
    @apply tw-flex tw-items-center tw-gap-2;
  }
  &__quick {
    @apply tw-flex tw-flex-wrap tw-gap-1;
  }
}
</style>
