<template>
  <!-- the field keeps the focus while the suggestions are open: the list only shows the active one -->
  <VcDropdown
    class="vc-search-bar__search"
    :model-value="open"
    :items="suggestions.items"
    :item-key="(s: Suggestion) => s.text"
    :is-item-active="(s: Suggestion) => suggestions.items.indexOf(s) === active"
    role="listbox"
    :aria-label="$t(...title)"
    combobox
    floating
    :teleport="false"
    placement="bottom-start"
    :offset="{ mainAxis: 4 }"
    :max-height="400"
    :auto-focus-panel="false"
    :close-on-escape="false"
    :close-on-click-outside="false"
    @item-click="pick"
  >
    <template #trigger="{ panelId, itemId }">
      <VcInput
        ref="input"
        class="vc-search-bar__search-field"
        :model-value="text"
        :aria-label="label"
        :placeholder="short ? t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SEARCH_PLACEHOLDER') : label"
        :disabled="disabled"
        autocomplete="off"
        :input-attrs="{
          class: 'vc-search-bar__search-input',
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': open,
          'aria-controls': open ? panelId : undefined,
          'aria-activedescendant': open ? itemId(active) : undefined,
        }"
        @update:model-value="onInput(String($event ?? ''))"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="focused = false"
      >
        <template #prepend-inner>
          <VcIcon
            icon="lucide-search"
            :custom-size="16"
            class="vc-search-bar__search-icon"
          />
        </template>
        <!-- one fixed slot for the key hint and the clear button: the input keeps its width while typing -->
        <template #append-inner>
          <span class="vc-search-bar__search-end">
            <ShortcutKbd
              v-if="!hideHint && !modelValue && !focused && !disabled"
              class="vc-search-bar__search-hint"
              :parts="['/']"
              aria-hidden="true"
            />
            <VcButton
              v-if="modelValue"
              class="vc-search-bar__search-clear"
              variant="ghost"
              size="icon-sm"
              icon="lucide-x"
              icon-size="xs"
              :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.CLEAR_SEARCH')"
              :disabled="disabled"
              @click="clearText"
            />
          </span>
        </template>
      </VcInput>
    </template>
    <template #header>
      <div class="vc-search-bar__suggest-head">
        <span class="vc-search-bar__suggest-title">{{ $t(...title) }}</span>
        <ShortcutKbd
          class="vc-search-bar__suggest-key"
          aria-hidden="true"
        >
          <VcIcon
            icon="lucide-corner-down-left"
            :custom-size="10"
          />
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SUGGEST.ADD") }}
        </ShortcutKbd>
      </div>
    </template>
    <template #item="{ item: s }">
      <span
        class="vc-search-bar__suggest-item"
        :class="{ 'vc-search-bar__suggest-item--active': suggestions.items.indexOf(s) === active }"
      >
        <span class="vc-search-bar__suggest-label">{{ s.labelKey ? $t(s.labelKey) : s.label }}</span>
        <span
          v-if="s.kind === 'value'"
          class="vc-search-bar__suggest-token"
          >{{ s.text.trim() }}</span
        >
        <VcIcon
          v-if="s.selected"
          icon="lucide-check"
          size="s"
          class="vc-search-bar__suggest-check"
        />
      </span>
    </template>
  </VcDropdown>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcIcon } from "@ui/components/atoms";
import { VcDropdown, VcInput } from "@ui/components/molecules";
import { ShortcutKbd } from "@ui/components/shared/shortcut-kbd";
import type { BarField } from "../lib/fields";
import { chipFromTyped, getSuggestions, isAmbiguousTyped, type Suggestion } from "../composables/useSearchSyntax";

const props = defineProps<{
  modelValue: string;
  fields: BarField[];
  /** Current filter values by field id, to mark the suggested values already applied */
  values?: Record<string, unknown>;
  placeholder?: string;
  disabled?: boolean;
  /** No `/` key hint (a phone has no keyboard shortcut) */
  hideHint?: boolean;
  /** A narrow bar: the short default placeholder; the given one stays the accessible name */
  short?: boolean;
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
const input = ref<InstanceType<typeof VcInput>>();
// What the field shows: the model, and for a tick the typed text a chip took over (see onInput)
const text = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (text.value = v),
);
const focused = ref(false);
const dismissed = ref(false);
const active = ref(0);

const suggestions = computed(() => getSuggestions(props.modelValue, props.fields, props.values));
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

/**
 * The field shows the typed text first, then the model: a chip or a dropped space can leave the model as it
 * was, and the field would keep the typed word without the change in between
 */
function showModel(typed: string) {
  text.value = typed;
  void nextTick(() => (text.value = props.modelValue));
}

function onInput(next: string) {
  dismissed.value = false;
  const chip = chipFromTyped(next, props.fields);
  if (!chip && isAmbiguousTyped(next, props.fields)) {
    // the space would close the suggestions of a value that names several options
    emit("update:modelValue", next.slice(0, -1));
    return showModel(next);
  }
  if (!chip) return emit("update:modelValue", next);
  emit("chip", chip);
  showModel(next);
}

function pick(s: Suggestion) {
  onInput(props.modelValue.replace(/\S*$/, s.text));
}

function clearText() {
  emit("update:modelValue", "");
  input.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
  // the field's own keys; the clear button next to it keeps its own
  if (!(e.target instanceof HTMLInputElement)) return;
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
      else e.target.blur();
      return;
    case "Backspace":
      if (!props.modelValue) emit("backspace-empty");
  }
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<style lang="scss">
.vc-dropdown.vc-search-bar__search {
  --vc-dropdown-trigger-flex: 1 1 auto;
  --vc-dropdown-radius: 8px;
  --vc-dropdown-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  --vc-dropdown-accent: var(--primary-50);
  --vc-dropdown-accent-foreground: var(--neutrals-900);
  @apply tw-h-auto;
  flex: 1 1 0;
  min-width: max(200px, 22%);
}

.vc-search-bar {
  &__search-field {
    --input-border-radius: 8px;
    --input-border-color-focus: var(--primary-300);
    --input-text-color: var(--neutrals-900);
    --input-padding-start: 10px;
    --input-padding-end: 6px;
    --input-adornment-gap: 8px;
    @apply tw-flex-1 tw-min-w-0;
  }
  &__search-icon {
    @apply tw-shrink-0;
    color: var(--neutrals-400);
  }
  &__search-end {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-shrink-0;
    width: 24px;
  }
  &__search-clear {
    --button-ghost-text-color: var(--neutrals-500);
    @apply tw-shrink-0;
  }
  // the list is at least as wide as this head (the panel adds 8px of padding)
  &__suggest-head {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-3 tw-px-2 tw-py-1;
    min-width: 232px;
  }
  &__suggest-title {
    @apply tw-uppercase tw-font-semibold;
    font-size: 11px;
    color: var(--neutrals-400);
  }
  // a row is 32px with the item's own 4px padding; its text starts 12px in from the panel edge
  &__suggest-item {
    @apply tw-flex tw-flex-1 tw-items-center tw-justify-between tw-gap-3 tw-px-2 tw-min-w-0 tw-cursor-pointer;
    height: 24px;
    font-size: 13px;
  }
  &__suggest-label {
    @apply tw-flex-1 tw-truncate;
  }
  &__suggest-token {
    font-size: 11.5px;
    color: var(--neutrals-500);
  }
  &__suggest-check {
    @apply tw-shrink-0;
    color: var(--primary-600);
  }
}
</style>
