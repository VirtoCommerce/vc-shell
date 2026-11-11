<template>
  <div
    class="vc-search-bar__search"
    :class="{ 'vc-search-bar__search--disabled': disabled }"
  >
    <VcIcon
      icon="lucide-search"
      size="s"
      class="vc-search-bar__search-icon"
    />
    <input
      ref="input"
      class="vc-search-bar__search-input"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="open ? `${listId}-${active}` : undefined"
      :aria-label="label"
      :placeholder="label"
      :value="modelValue"
      :disabled="disabled"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @keydown="onKeydown"
      @focus="focused = true"
      @blur="focused = false"
    />
    <kbd
      v-if="!modelValue && !focused && !disabled"
      class="vc-search-bar__search-hint"
      aria-hidden="true"
      >/</kbd
    >
    <button
      v-if="modelValue"
      type="button"
      class="vc-search-bar__search-clear"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.CLEAR_SEARCH')"
      :disabled="disabled"
      @click="clearText"
    >
      <VcIcon
        icon="lucide-x"
        size="xs"
      />
    </button>
    <div
      v-if="open"
      class="vc-search-bar__suggest"
    >
      <div class="vc-search-bar__suggest-title">{{ $t(...title) }}</div>
      <ul
        :id="listId"
        role="listbox"
        :aria-label="$t(...title)"
        class="vc-search-bar__suggest-list"
      >
        <li
          v-for="(s, i) in suggestions.items"
          :id="`${listId}-${i}`"
          :key="s.text"
          role="option"
          class="vc-search-bar__suggest-item"
          :class="{ 'vc-search-bar__suggest-item--active': i === active }"
          :aria-selected="i === active"
          @mousedown.prevent="pick(s)"
        >
          {{ s.labelKey ? $t(s.labelKey) : s.label }}
          <span
            v-if="s.kind === 'value'"
            class="vc-search-bar__suggest-token"
            >{{ s.text.trim() }}</span
          >
        </li>
      </ul>
      <div class="vc-search-bar__suggest-foot">{{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SUGGEST.ENTER") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { chipFromTyped, getSuggestions, type Suggestion } from "../composables/useSearchSyntax";

const props = defineProps<{
  modelValue: string;
  fields: BarField[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** Typed `field:value` and a space; `rest` is the text left in the search */
  chip: [chip: { fieldId: string; value: unknown; rest: string }];
  /** Backspace in an empty search */
  "backspace-empty": [];
}>();

const { t } = useI18n({ useScope: "global" });
const label = computed(() => props.placeholder ?? t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SEARCH_PLACEHOLDER"));
const listId = `vc-search-bar-suggest-${useId()}`;

const input = ref<HTMLInputElement>();
const focused = ref(false);
const dismissed = ref(false);
const active = ref(0);

const suggestions = computed(() => getSuggestions(props.modelValue, props.fields));
const open = computed(() => focused.value && !dismissed.value && suggestions.value.items.length > 0);
// key and params for $t: "Filter by Status" after `status:`, else "Filter by field"
const title = computed<[string, Record<string, string>]>(() => {
  const S = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SUGGEST.";
  if (!suggestions.value.explicit) return [`${S}BY_FIELD`, {}];
  const field = props.fields.find((f) => f.id === suggestions.value.items[0]?.fieldId);
  return [`${S}BY`, { field: field?.label ?? "" }];
});

watch(
  () => props.modelValue,
  () => {
    active.value = 0;
  },
);

function onInput(next: string) {
  dismissed.value = false;
  const chip = chipFromTyped(next, props.fields);
  if (!chip) return emit("update:modelValue", next);
  // the typed word is gone even when the text before it equals the old value
  if (input.value) input.value.value = chip.rest;
  emit("chip", chip);
}

function pick(s: Suggestion) {
  onInput(props.modelValue.replace(/\S*$/, s.text));
}

function clearText() {
  emit("update:modelValue", "");
  input.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
  const items = suggestions.value.items;
  switch (e.key) {
    case "ArrowDown":
    case "ArrowUp":
      if (!open.value) return;
      e.preventDefault();
      active.value = (active.value + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      return;
    case "Enter":
      if (!open.value) return;
      e.preventDefault();
      pick(items[active.value]);
      return;
    case "Escape":
      // handled here, so the blade does not close
      e.preventDefault();
      if (open.value) dismissed.value = true;
      else if (props.modelValue) emit("update:modelValue", "");
      else input.value?.blur();
      return;
    case "Backspace":
      if (!props.modelValue) emit("backspace-empty");
  }
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<style lang="scss">
.vc-search-bar {
  &__search {
    @apply tw-relative tw-flex tw-items-center tw-gap-2;
    flex: 1 1 0;
    min-width: max(200px, 22%);
    height: 36px;
    padding-inline: 10px 6px;
    border: 1px solid var(--neutrals-300);
    border-radius: 8px;
    background: var(--additional-50);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

    &:focus-within {
      border-color: var(--primary-300);
      box-shadow: 0 0 0 3px var(--primary-100);
    }
    &--disabled {
      @apply tw-opacity-50;
    }
  }
  &__search-icon {
    @apply tw-shrink-0;
    color: var(--neutrals-400);
  }
  &__search-input {
    @apply tw-flex-1 tw-min-w-0 tw-h-full tw-bg-transparent tw-outline-none;
    font-size: 13.5px;
    color: var(--neutrals-900);

    &::placeholder {
      color: var(--neutrals-400);
    }
  }
  &__search-hint {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-shrink-0 tw-rounded;
    min-width: 18px;
    height: 18px;
    font-size: 11px;
    font-family: inherit;
    color: var(--neutrals-500);
    border: 1px solid var(--neutrals-300);
  }
  &__search-clear {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-shrink-0 tw-rounded;
    width: 24px;
    height: 24px;
    color: var(--neutrals-500);

    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__suggest {
    @apply tw-absolute tw-rounded-lg tw-py-1;
    top: calc(100% + 4px);
    left: 0;
    min-width: 240px;
    z-index: var(--z-overlay-dropdown);
    background: var(--additional-50);
    box-shadow:
      0 0 0 1px var(--neutrals-200),
      0 8px 24px rgb(0 0 0 / 12%);
  }
  &__suggest-title,
  &__suggest-foot {
    @apply tw-px-3 tw-py-1;
    font-size: 11px;
    color: var(--neutrals-500);
  }
  &__suggest-title {
    @apply tw-uppercase tw-font-semibold;
  }
  &__suggest-item {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-3 tw-px-3 tw-cursor-pointer;
    height: 32px;
    font-size: 13px;

    &--active {
      background: var(--primary-50);
    }
  }
  &__suggest-token {
    font-size: 11.5px;
    color: var(--neutrals-500);
  }
}
</style>
