<template>
  <div
    class="vc-multivalue"
    :class="[
      `vc-multivalue--${type}`,
      {
        'vc-multivalue--opened': isOpened,
        'vc-multivalue--error': invalid,
        'vc-multivalue--disabled': resolvedDisabled,
        'vc-multivalue--focused': isFocused,
        'vc-multivalue--has-hint-or-error': invalid || hint,
      },
    ]"
  >
    <!-- Label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      class="vc-multivalue__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="invalid"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        {{ tooltip }}
      </template>
    </VcLabel>

    <!-- Field -->
    <MultivalueTrigger
      ref="triggerComponentRef"
      :model-value="modelValue"
      :is-dictionary-mode="isDictionaryMode"
      :type="type"
      :html-input-type="htmlInputType"
      :placeholder="placeholder"
      :disabled="resolvedDisabled"
      :error="invalid"
      :loading="loading"
      :clearable="clearable"
      :option-value="optionValue"
      :input-value="inputValue"
      :format-value="formatValue"
      :is-opened="isOpened"
      :label-id="label ? labelId : undefined"
      :listbox-id="listboxId"
      :aria-described-by="ariaDescribedBy"
      :aria-required="ariaRequired"
      @remove="removeAtIndex"
      @toggle-dropdown="toggleDropdown"
      @input-submit="onInputSubmit"
      @input-change="inputValue = $event"
      @key-down="onKeyDown"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @clear-all="clearAll"
      @open-color-picker="openColorPicker"
      @set-color-picker-ref="setColorPickerRef"
      @color-change="handleColorChange"
    >
      <template
        v-if="$slots['selected-item']"
        #selected-item="scope"
      >
        <slot
          name="selected-item"
          v-bind="scope"
        />
      </template>
      <template
        v-if="$slots['prepend']"
        #prepend
      >
        <slot name="prepend" />
      </template>
      <template
        v-if="$slots['append']"
        #append
      >
        <slot name="append" />
      </template>
    </MultivalueTrigger>

    <!-- Dropdown (dictionary mode) -->
    <MultivalueDropdown
      v-if="isDictionaryMode"
      ref="dropdownComponentRef"
      :is-opened="isOpened"
      :dropdown-style="dropdownStyle"
      :available-options="availableOptions"
      :option-label="optionLabel"
      :ariaLabel="label || name"
      :listbox-id="listboxId"
      :dropdown-toggle-ref="triggerComponentRef?.triggerRef ?? null"
      @select="onItemSelect"
      @search="onSearch"
      @click-outside="closeDropdown"
    >
      <template
        v-if="$slots['option']"
        #option="scope"
      >
        <slot
          name="option"
          v-bind="scope"
        />
      </template>
    </MultivalueDropdown>

    <!-- Hint / Error -->
    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-multivalue__error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
      <div v-else>
        <slot name="hint">
          <VcHint
            v-if="hint"
            :id="hintId"
            class="vc-multivalue__hint"
          >
            {{ hint }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends { id?: string; colorCode?: string }">
import { ref, computed, watchEffect } from "vue";
import { useFormField } from "@ui/composables/useFormField";
import { VcLabel, VcHint } from "@ui/components";
import MultivalueTrigger from "@ui/components/molecules/vc-multivalue/_internal/MultivalueTrigger.vue";
import MultivalueDropdown from "@ui/components/molecules/vc-multivalue/_internal/MultivalueDropdown.vue";
import { useMultivalueMode, type MultivalueType } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueMode";
import { useMultivalueValues } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueValues";
import { useMultivalueInput } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueInput";
import { useMultivalueColor } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueColor";
import { useMultivalueDropdown } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueDropdown";
import { useMultivalueOptions } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueOptions";
import type { IFormFieldProps } from "@ui/types";

export interface Props<T> extends IFormFieldProps {
  placeholder?: string;
  modelValue?: T[];
  type?: MultivalueType;
  hint?: string;
  options?: T[];
  optionValue?: string;
  optionLabel?: string;
  multivalue?: boolean;
  multilanguage?: boolean;
  currentLanguage?: string;
  loading?: boolean;
  clearable?: boolean;
}

export interface Emits<T> {
  (event: "update:model-value", value: T[]): void;
  (event: "close"): void;
  (event: "search", value: string): void;
}

const props = withDefaults(defineProps<Props<T>>(), {
  modelValue: () => [],
  type: "text",
  name: "Field",
  options: () => [],
  optionValue: "id",
  optionLabel: "title",
  clearable: false,
});

const emit = defineEmits<Emits<T>>();

defineSlots<{
  option: (args: { item: T; index: number }) => any;
  "selected-item": (args: { value: string | number | T[keyof T]; item: T; index: number; remove: () => void }) => any;
  hint: (props: any) => any;
  error: (props: any) => any;
  prepend: (props: any) => any;
  append: (props: any) => any;
}>();

const { fieldId, labelId, errorId, hintId, invalid, resolvedDisabled, ariaRequired, ariaDescribedBy } =
  useFormField(props);
const listboxId = computed(() => `${fieldId.value}-listbox`);

// --- Sub-component refs ---
const triggerComponentRef = ref<InstanceType<typeof MultivalueTrigger> | null>(null);
const dropdownComponentRef = ref<InstanceType<typeof MultivalueDropdown> | null>(null);

// --- Composables ---

const { isDictionaryMode, htmlInputType } = useMultivalueMode({
  multivalue: () => props.multivalue ?? false,
  type: () => props.type,
});

const { formatValue, removeAtIndex, clearAll, addItem } = useMultivalueValues<T>({
  modelValue: () => props.modelValue,
  optionLabel: () => props.optionLabel,
  type: () => props.type,
  emit: {
    updateModelValue: (val: T[]) => emit("update:model-value", val),
  },
});

const { inputValue, onInputSubmit, onKeyDown } = useMultivalueInput<T>({
  type: () => props.type,
  optionLabel: () => props.optionLabel,
  addItem,
});

const { setColorPickerRef, openColorPicker, handleColorChange } = useMultivalueColor<T>({
  modelValue: () => props.modelValue,
  emit: {
    updateModelValue: (val: T[]) => emit("update:model-value", val),
  },
});

const { availableOptions } = useMultivalueOptions<T>({
  options: () => props.options,
  modelValue: () => props.modelValue,
  optionValue: () => props.optionValue,
});

const {
  isOpened,
  isFocused,
  dropdownToggleRef,
  dropdownRef,
  searchRef,
  dropdownStyle,
  toggleDropdown,
  closeDropdown,
} = useMultivalueDropdown({
  disabled: () => props.disabled ?? false,
  onItemSelect: (index: number) => {
    if (availableOptions.value[index]) {
      onItemSelect(availableOptions.value[index]);
    }
  },
  emit: {
    close: () => emit("close"),
  },
});

// --- Sync DOM refs from sub-components → composable ---
watchEffect(() => {
  dropdownToggleRef.value = triggerComponentRef.value?.triggerRef ?? null;
  dropdownRef.value = dropdownComponentRef.value?.dropdownElRef ?? null;
  searchRef.value = dropdownComponentRef.value?.searchInputRef ?? null;
});

// --- Event handlers ---

function onItemSelect(item: T) {
  addItem(item);
  closeDropdown();
}

function onSearch(event: Event) {
  emit("search", (event.target as HTMLInputElement).value);
}
</script>

<style lang="scss">
:root {
  --multivalue-height: 36px;
  --multivalue-border-radius: var(--select-border-radius, 6px);
  --multivalue-border-color: var(--select-border-color, var(--neutrals-300));
  --multivalue-background-color: var(--select-background-color, transparent);
  --multivalue-placeholder-color: var(--select-placeholder-color, var(--neutrals-400));
  --multivalue-text-color: var(--select-text-color, var(--neutrals-800));
  --multivalue-padding: 10px;

  // Dropdown — reuse select tokens
  --multivalue-dropdown-bg: var(--select-dropdown-bg, var(--additional-50));
  --multivalue-dropdown-border: var(--select-dropdown-border, var(--neutrals-200));
  --multivalue-dropdown-shadow: var(
    --select-dropdown-shadow,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1)
  );

  // Search — reuse select tokens
  --multivalue-search-border-color: var(--select-search-border-color, var(--neutrals-200));

  // Options — reuse select tokens
  --multivalue-item-hover-background-color: var(--select-option-background-color-hover, var(--neutrals-100));

  // Chips — reuse select multi tokens
  --multivalue-chip-background-color: var(--select-multiple-options-background-color, var(--neutrals-100));
  --multivalue-chip-border-color: var(--select-multiple-options-border-color, var(--neutrals-200));
  --multivalue-clear-icon-color: var(--select-clear-color, var(--neutrals-400));
  --multivalue-clear-icon-color-hover: var(--select-clear-color-hover, var(--neutrals-600));

  // Error — reuse select tokens
  --multivalue-border-color-error: var(--select-border-color-error, var(--danger-500));
  --multivalue-error-ring-color: var(--select-error-ring-color, var(--danger-100));
  --multivalue-hint-color: var(--danger-500);

  // Focus — reuse select tokens
  --multivalue-border-color-focus: var(--select-border-color-focus, var(--primary-500));
  --multivalue-focus-ring-color: var(--select-focus-ring-color, var(--primary-100));

  // Disabled
  --multivalue-disabled-text-color: var(--neutrals-500);

  // Loading
  --multivalue-loading-color: var(--select-loading-color, var(--info-500));
}

.vc-multivalue {
  &--date,
  &--datetime-local {
    @apply tw-max-w-[220px];

    .vc-app_mobile & {
      @apply tw-max-w-full;
    }
  }

  &__label {
    @apply tw-mb-2;
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid
      tw-border-[color:var(--multivalue-border-color)]
      tw-rounded-[var(--multivalue-border-radius)]
      tw-flex tw-items-stretch tw-min-h-[var(--multivalue-height)]
      tw-bg-[color:var(--multivalue-background-color)] tw-text-[color:var(--multivalue-text-color)]
      tw-shadow-sm tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out
      tw-outline-none;
  }

  &__control {
    @apply tw-flex tw-flex-auto tw-items-center tw-min-w-0;
  }

  &__content {
    @apply tw-items-center tw-flex tw-flex-wrap tw-flex-grow tw-min-w-0;
  }

  &__chip-wrapper {
    @apply tw-ml-2 tw-flex tw-items-center tw-py-1;
  }

  &__chip {
    @apply tw-bg-[color:var(--multivalue-chip-background-color)] tw-border tw-border-solid tw-border-[color:var(--multivalue-chip-border-color)]
      tw-rounded-[4px] tw-flex tw-items-center tw-h-6 tw-box-border tw-px-2 tw-text-xs tw-gap-1 tw-max-w-[150px];
  }

  &__chip-label {
    @apply tw-truncate tw-text-sm;
  }

  &__chip-remove {
    @apply tw-text-[color:var(--multivalue-clear-icon-color)] tw-cursor-pointer
      hover:tw-text-[color:var(--multivalue-clear-icon-color-hover)] tw-flex-shrink-0;
  }

  &__prepend,
  &__append {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-px-3;
  }

  &__clear {
    @apply tw-cursor-pointer tw-flex tw-items-center tw-px-3 tw-flex-shrink-0
      tw-text-[color:var(--multivalue-clear-icon-color)]
      hover:tw-text-[color:var(--multivalue-clear-icon-color-hover)];
  }

  &__add-button {
    @apply tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0
      tw-border-none tw-bg-transparent
      tw-text-xs tw-text-[color:var(--multivalue-clear-icon-color)]
      tw-cursor-pointer tw-select-none tw-whitespace-nowrap
      tw-rounded-[4px] tw-h-6 tw-my-auto tw-ml-1
      tw-transition-colors tw-duration-150
      hover:tw-text-[color:var(--multivalue-text-color)]
      hover:tw-bg-[color:var(--multivalue-chip-background-color)]
      disabled:tw-cursor-not-allowed disabled:tw-opacity-50;
  }

  &__input {
    @apply tw-border-none tw-outline-none tw-min-h-[var(--multivalue-height)] tw-bg-[color:var(--multivalue-background-color)]
      tw-flex-grow tw-flex-shrink tw-w-auto tw-box-border tw-px-[var(--multivalue-padding)]
      placeholder:tw-text-[color:var(--multivalue-placeholder-color)] tw-text-sm
      tw-rounded-[var(--multivalue-border-radius)];

    &::-webkit-input-placeholder {
      @apply tw-text-[color:var(--multivalue-placeholder-color)];
    }

    &[type="number"]::-webkit-inner-spin-button,
    &[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__loading {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-px-3 tw-text-[color:var(--multivalue-loading-color)] tw-flex-shrink-0;
  }

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border
      tw-max-h-[300px] tw-z-[101] tw-overflow-hidden
      tw-absolute tw-bg-[color:var(--multivalue-dropdown-bg)]
      tw-border tw-border-solid tw-border-[color:var(--multivalue-dropdown-border)]
      tw-rounded-[var(--multivalue-border-radius)]
      tw-p-1;
    box-shadow: var(--multivalue-dropdown-shadow);
  }

  &__viewport {
    @apply tw-overflow-y-auto tw-overflow-x-hidden tw-flex-1;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__scroll-button {
    @apply tw-flex tw-items-center tw-justify-center tw-py-1
      tw-cursor-default tw-shrink-0
      tw-text-[color:var(--multivalue-placeholder-color)]
      tw-transition-opacity tw-duration-150;
  }

  &__search {
    @apply tw-w-full tw-box-border tw-border tw-border-solid
      tw-border-[color:var(--multivalue-search-border-color)]
      tw-bg-transparent tw-rounded-[var(--multivalue-border-radius)] tw-h-8 tw-leading-8
      tw-outline-none tw-mb-2 tw-px-2 tw-text-sm
      focus:tw-border-[color:var(--multivalue-border-color-focus)] focus:tw-ring-[3px] focus:tw-ring-[color:var(--multivalue-focus-ring-color)]
      tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out;
  }

  &__item {
    @apply tw-flex tw-items-center tw-min-h-8 tw-py-1.5 tw-px-2 tw-rounded-[4px] tw-cursor-pointer tw-text-sm tw-select-none
      hover:tw-bg-[color:var(--multivalue-item-hover-background-color)];
  }

  &__no-options {
    @apply tw-w-full tw-box-border tw-flex tw-items-center tw-justify-center tw-p-4 tw-text-sm tw-text-[color:var(--multivalue-placeholder-color)];
  }

  // Focus state
  &--focused &__field-wrapper {
    @apply tw-border-[color:var(--multivalue-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--multivalue-focus-ring-color)]
      tw-outline-none;
  }

  // Opened state
  &--opened &__field-wrapper {
    @apply tw-border-[color:var(--multivalue-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--multivalue-focus-ring-color)]
      tw-outline-none;
  }

  // Error state
  &--error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--multivalue-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--multivalue-error-ring-color)];
  }

  &__error {
    @apply tw-mt-1 [--hint-color:var(--multivalue-hint-color)];
  }

  &__hint {
    @apply tw-text-[color:var(--multivalue-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
  }

  // Disabled state
  &--disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &--disabled &__field-wrapper,
  &--disabled &__input {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  // Hint/error spacing
  &--has-hint-or-error {
    @apply tw-pb-5;
  }

  // Color square
  &__color-square {
    @apply tw-w-5 tw-h-5 tw-rounded tw-border tw-border-solid tw-border-neutrals-300
      tw-cursor-pointer tw-mr-2 tw-flex-shrink-0 tw-relative;
  }

  &__color-picker-hidden {
    @apply tw-opacity-0 tw-absolute tw-w-0 tw-h-0 tw-pointer-events-none;
  }

}

// Dropdown enter/leave transition
.multivalue-dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.multivalue-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.multivalue-dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.multivalue-dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
