<template>
  <div
    ref="selectRootRef"
    class="vc-select"
    :class="{
      'vc-select--opened': isOpened,
      'vc-select--error': invalid,
      'vc-select--disabled': resolvedDisabled,
      'vc-select--has-hint-or-error': invalid || hint,
      'vc-select--no-outline': !outline,
      'vc-select--focused': isFocused,
    }"
  >
    <!-- Select label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      class="vc-select__label"
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
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Select field -->
    <div class="vc-select__field-container">
      <SelectTrigger
        ref="selectTriggerRef"
        :is-opened="isOpened"
        :has-value="hasValue"
        :selected-scope="selectedScope"
        :multiple="multiple"
        :loading="loading"
        :disabled="resolvedDisabled"
        :clearable="clearable"
        :placeholder="placeholder"
        :prefix="prefix"
        :suffix="suffix"
        :size="size"
        :error="invalid"
        :error-message="errorMessage"
        :hint="hint"
        :list-loading="listLoading"
        :default-option-loading="defaultOptionLoading"
        :listbox-id="listboxId"
        :label-id="labelId"
        :label="label"
        :aria-described-by="ariaDescribedBy"
        :aria-required="ariaRequired"
        :error-id="errorId"
        :hint-id="hintId"
        :toggle-dropdown="toggleDropdown"
        :get-option-label="getOptionLabel"
        :get-emitting-option-value="getEmittingOptionValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @reset="onReset"
        @remove-at-index="removeAtIndex"
      >
        <template
          v-if="$slots['control']"
          #control="scope"
        >
          <slot
            name="control"
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
        <template
          v-if="$slots['prepend-inner']"
          #prepend-inner
        >
          <slot name="prepend-inner" />
        </template>
        <template
          v-if="$slots['append-inner']"
          #append-inner
        >
          <slot name="append-inner" />
        </template>
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
          v-if="$slots['error']"
          #error
        >
          <slot name="error" />
        </template>
        <template
          v-if="$slots['hint']"
          #hint
        >
          <slot name="hint" />
        </template>
      </SelectTrigger>

      <SelectDropdown
        ref="selectDropdownRef"
        :is-opened="isOpened"
        :listbox-id="listboxId"
        :ariaLabel="label || name"
        :dropdown-style="dropdownStyle"
        :searchable="searchable"
        :option-scope="optionScope"
        :list-loading="listLoading"
        :options-list-length="optionsList.length"
        :has-next-page="hasNextPage"
        :dropdown-toggle-ref="selectTriggerRef?.toggleRef ?? null"
        @input="onInput"
        @click-outside="onClickOutside"
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
        <template
          v-if="$slots['no-options']"
          #no-options
        >
          <slot name="no-options" />
        </template>
      </SelectDropdown>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T, P extends { results?: T[]; totalCount?: number } | undefined = undefined">
import { ref, computed, watch, watchEffect, nextTick, toRefs } from "vue";
import { useFormField } from "@ui/composables/useFormField";
import { useIntersectionObserver } from "@vueuse/core";
import { VcLabel } from "@ui/components";
import { useI18n } from "vue-i18n";
import { useKeyboardNavigation } from "@core/composables/useKeyboardNavigation";
import {
  useSelectValueMapping,
  type OptionProp,
} from "@ui/components/molecules/vc-select/composables/useSelectValueMapping";
import type { IFormFieldProps } from "@ui/types";
import { useSelectVisibility } from "@ui/components/molecules/vc-select/composables/useSelectVisibility";
import { useSelectDropdown } from "@ui/components/molecules/vc-select/composables/useSelectDropdown";
import { useSelectDefaultValue } from "@ui/components/molecules/vc-select/composables/useSelectDefaultValue";
import { useSelectOptions } from "@ui/components/molecules/vc-select/composables/useSelectOptions";
import { useSelectSearch } from "@ui/components/molecules/vc-select/composables/useSelectSearch";
import { useSelectSelection } from "@ui/components/molecules/vc-select/composables/useSelectSelection";
import SelectTrigger from "@ui/components/molecules/vc-select/_internal/SelectTrigger.vue";
import SelectDropdown from "@ui/components/molecules/vc-select/_internal/SelectDropdown.vue";

type ArrayElementType<U> = U extends Array<infer V> ? V : never;
type Option = P extends { results?: T[]; totalCount?: number } ? T & ArrayElementType<Required<P>["results"]> : T;

defineSlots<{
  /**
   * Custom select control
   */
  control: (scope: { toggleHandler: () => void; isOpened: boolean }) => any;
  /**
   * Prepend inner field
   */
  "prepend-inner": (props: any) => any;
  /**
   * Append to inner field
   */
  "append-inner": (props: any) => any;
  /**
   * Prepend outer field
   */
  prepend: (props: any) => any;
  /**
   * Append outer field
   */
  append: (props: any) => any;
  /**
   * Slot for errors
   */
  error: (props: any) => any;
  /**
   * Slot for hint text
   */
  hint: (props: any) => any;
  /**
   * Override default selection slot
   * @param scope
   */
  "selected-item": (scope: {
    /**
     * Selection index
     */
    index: number;
    /**
     * Selected option -- its value is taken from model
     */
    opt: Option;
    /**
     * Always true -- passed as prop
     */
    selected: boolean;
    /**
     * Remove selected option located at specific index
     * @param index Index at which to remove selection
     */
    removeAtIndex: (index: number) => void;
  }) => any;
  /**
   * Override default selection slot;
   */
  option: (scope: {
    /**
     * Option index
     */
    index: number;
    /**
     * Option -- its value is taken from 'options' prop
     */
    opt: Option;
    /**
     * Is option selected
     */
    selected: boolean;
    /**
     * Add/remove option from model
     * @param opt Option to add to model
     */
    toggleOption: (opt: any) => void;
  }) => any;
  "no-options": (props: any) => any;
}>();

const props = withDefaults(
  defineProps<
    IFormFieldProps & {
      modelValue?: any;
      mapOptions?: boolean;
      hint?: string;
      prefix?: string;
      suffix?: string;
      loading?: boolean;
      clearable?: boolean;
      multiple?: boolean;
      options?: ((keyword?: string, skip?: number, ids?: string[]) => Promise<P>) | T[];
      optionValue?: OptionProp<Option>;
      optionLabel?: OptionProp<Option>;
      emitValue?: boolean;
      debounce?: number | string;
      placeholder?: string;
      searchable?: boolean;
      multilanguage?: boolean;
      currentLanguage?: string;
      size?: "default" | "small";
      outline?: boolean;
      placement?:
        | "top"
        | "right"
        | "bottom"
        | "left"
        | "top-start"
        | "top-end"
        | "bottom-start"
        | "bottom-end"
        | "right-start"
        | "right-end"
        | "left-start"
        | "left-end";
    }
  >(),
  {
    optionValue: "id",
    optionLabel: "title",
    debounce: 500,
    clearable: true,
    name: "Field",
    emitValue: true,
    mapOptions: true,
    size: "default",
    options: (): T[] => [],
    outline: true,
    placement: "bottom",
  },
);

const emit = defineEmits<{
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */

  "update:modelValue": [inputValue: Option | Option[] | string | string[] | null];
  /**
   * Emitted when user wants to filter a value
   */
  search: [inputValue: string];
  /**
   * Emitted when the select options list is hidden
   */
  close: [];
}>();

const { t } = useI18n({ useScope: "global" });

const { fieldId, labelId, errorId, hintId, invalid, resolvedDisabled, resolvedName, ariaRequired, ariaDescribedBy } =
  useFormField(props);
const listboxId = computed(() => `${fieldId.value}-listbox`);

const { modelValue } = toRefs(props);

// --- Subcomponent refs ---
const selectTriggerRef = ref<InstanceType<typeof SelectTrigger> | null>(null);
const selectDropdownRef = ref<InstanceType<typeof SelectDropdown> | null>(null);

// --- Composables ---

const { selectRootRef, isSelectVisible, ensureVisibility } = useSelectVisibility();

const { getOptionValue, getOptionLabel, getOption, getEmittingOptionValue, fieldValueIsFilled } =
  useSelectValueMapping<Option>({
    optionValue: () => props.optionValue,
    optionLabel: () => props.optionLabel,
  });

const { isOpened, isFocused, dropdownToggleRef, dropdownRef, popper, dropdownStyle, toggleDropdown } =
  useSelectDropdown({
    placement: props.placement,
    outline: () => props.outline,
    isSelectVisible,
    selectRootRef,
    disabled: () => props.disabled ?? false,
    ensureVisibility,
  });

// Sync subcomponent DOM refs → Floating UI refs
watchEffect(() => {
  dropdownToggleRef.value = selectTriggerRef.value?.toggleRef ?? null;
});
watchEffect(() => {
  dropdownRef.value = selectDropdownRef.value?.dropdownElRef ?? null;
});

const filterString = ref<string | undefined>();

const { defaultValue, defaultOptionLoading } = useSelectDefaultValue<Option>({
  modelValue,
  isSelectVisible,
  emitValue: () => props.emitValue ?? true,
  multiple: () => props.multiple,
  mapOptions: () => props.mapOptions ?? true,
  options: () => props.options as any,
  getOptionValue,
});

const {
  optionsList,
  optionsTemp,
  totalItems,
  listLoading,
  hasNextPage,
  loadOptionsForOpenDropdown,
  onLoadMore,
  onDropdownClose,
} = useSelectOptions<Option>({
  options: () => props.options as any,
  filterString,
  isOpened,
  isSelectVisible,
});

const { searchRef, onInput, clearSearch } = useSelectSearch<Option>({
  debounce: () => props.debounce ?? 500,
  options: () => props.options as any,
  optionsList,
  optionsTemp,
  totalItems,
  listLoading,
  filterString,
  getOptionLabel,
  emit: {
    search: (val: string) => emit("search", val),
  },
});

const { selectedScope, hasValue, optionScope, toggleOption, removeAtIndex, onReset } = useSelectSelection<Option>({
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  emitValue: () => props.emitValue ?? true,
  mapOptions: () => props.mapOptions ?? true,
  optionsList,
  defaultValue,
  getOptionValue,
  getOptionLabel,
  getOption,
  fieldValueIsFilled,
  isOpened,
  popperUpdate: () => popper.update(),
  emit: {
    updateModelValue: (val: any) => emit("update:modelValue", val),
    close: () => emit("close"),
  },
});

// --- Intersection observer for infinite scroll ---
// Use computed refs from dropdown subcomponent
const loadMoreEl = computed(() => selectDropdownRef.value?.loadMoreRef ?? null);
const viewportRoot = computed(() => selectDropdownRef.value?.viewportRef ?? null);

useIntersectionObserver(
  loadMoreEl,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasNextPage.value) {
      onLoadMore();
    }
  },
  { threshold: 1, root: viewportRoot },
);

// --- Keyboard navigation ---
const keyboardNavigation = useKeyboardNavigation({
  onEnter: (element: HTMLElement) => {
    const index = parseInt(element.getAttribute("data-index") || "0", 10);
    if (optionScope.value && optionScope.value[index]) {
      optionScope.value[index].toggleOption(optionScope.value[index].opt);
    }
  },
  onEscape: () => {
    isOpened.value = false;
    emit("close");
    nextTick(() => {
      const toggleEl = selectTriggerRef.value?.toggleRef?.querySelector('[role="combobox"]') as HTMLElement | null;
      toggleEl?.focus();
    });
  },
});

// --- Event handlers for subcomponents ---
function onClickOutside() {
  isOpened.value = false;
  emit("close");
}

// --- Orchestration watchers ---

// When dropdown opens/closes: load options, init keyboard nav, focus
watch(
  [isOpened, isSelectVisible],
  async ([newIsOpened, newIsSelectVisible]) => {
    if (newIsOpened && newIsSelectVisible) {
      const needsLoad =
        optionsList.value.length === 0 ||
        (props.options && typeof props.options === "function" && filterString.value && !listLoading.value);

      if (needsLoad) {
        if (props.options && typeof props.options === "function") {
          await loadOptionsForOpenDropdown();
        } else if (props.options && Array.isArray(props.options)) {
          optionsList.value = [...props.options] as Option[];
          optionsTemp.value = optionsList.value;
          totalItems.value = optionsList.value.length;
        }
      }

      nextTick(() => {
        popper.update();
        const dropdownEl = selectDropdownRef.value?.dropdownElRef;
        const searchInput = selectDropdownRef.value?.searchInputRef;

        if (dropdownEl) {
          keyboardNavigation.initKeyboardNavigation(dropdownEl);
          if (props.searchable && searchInput) {
            searchInput.focus();
          } else {
            const firstFocusable = dropdownEl.querySelector(
              '.vc-select__option[tabindex="0"], .vc-select__search-input[tabindex="0"]',
            ) as HTMLElement | null;

            if (firstFocusable) {
              firstFocusable.focus();
            } else {
              keyboardNavigation.focusFirstElement();
            }
          }
        }
      });
    } else if (!newIsOpened) {
      keyboardNavigation.cleanupKeyboardNavigation();
      clearSearch();
      await onDropdownClose();
    }
  },
  { immediate: false },
);
</script>

<style lang="scss">
:root {
  --select-height: 36px;
  --select-height-small: 32px;
  --select-border-radius: 6px;
  --select-border-color: var(--neutrals-300);
  --select-text-color: var(--neutrals-800);
  --select-padding: 12px;

  // Trigger — transparent bg
  --select-background-color: var(--additional-50);

  --select-placeholder-color: var(--neutrals-400);

  // Chevron & Clear — muted instead of primary
  --select-chevron-color: var(--neutrals-500);
  --select-chevron-color-hover: var(--neutrals-700);
  --select-clear-color: var(--neutrals-400);
  --select-clear-color-hover: var(--neutrals-600);

  --select-loading-color: var(--info-500);

  // Options — neutral hover, soft selected
  --select-option-background-color-hover: var(--neutrals-100);
  --select-option-background-color-selected: var(--accent-100);
  --select-option-check-color: var(--primary-500);

  // Multi-select chips
  --select-multiple-options-background-color: var(--neutrals-100);
  --select-multiple-options-border-color: var(--neutrals-200);

  // Dropdown
  --select-dropdown-bg: var(--additional-50);
  --select-dropdown-border: var(--neutrals-200);
  --select-dropdown-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);

  // Search
  --select-search-border-color: var(--neutrals-200);
  --select-search-background-color: var(--additional-50);
  --select-border-color-input: var(--secondary-200);

  // Focus
  --select-border-color-focus: var(--primary-500);
  --select-focus-ring-color: var(--primary-100);

  // Disabled
  --select-background-color-disabled: var(--neutrals-200);
  --select-disabled-text-color: var(--neutrals-500);

  // Error
  --select-border-color-error: var(--danger-500);
  --select-error-ring-color: var(--danger-100);
}

.vc-select {
  &--no-outline {
    .vc-select__chevron-container {
      display: none;
    }

    .vc-select__field-wrapper {
      border: none;
      background-color: transparent !important;
      box-shadow: none;
    }
  }

  &__container {
    @apply tw-box-border tw-w-full;
  }

  &__label {
    @apply tw-mb-2;
  }

  &__field-container {
    @apply tw-flex tw-flex-nowrap tw-items-start tw-relative tw-rounded-[var(--select-border-radius)];
  }

  &__dropdown-toggle {
    @apply tw-flex tw-flex-auto tw-text-left tw-max-w-full;
  }

  &__control {
    @apply tw-relative tw-flex tw-flex-auto tw-text-left tw-max-w-full;
  }

  &__prepend,
  &__append {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pr-3;
  }

  &__field-wrapper {
    @apply tw-relative tw-flex tw-flex-auto tw-overflow-x-clip tw-truncate tw-rounded-[var(--select-border-radius)]
      tw-border tw-border-solid tw-border-[color:var(--select-border-color)]
      tw-bg-[color:var(--select-background-color)]
      tw-shadow-sm tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out;

    &--default {
      @apply tw-min-h-[var(--select-height)];
    }

    &--small {
      @apply tw-min-h-[var(--select-height-small)];
    }
  }

  &__field {
    @apply tw-truncate tw-relative tw-box-border tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-items-stretch tw-text-[color:var(--select-text-color)];
  }

  &__field-inner {
    @apply tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-relative;
  }

  &__field-content {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-px-[var(--select-padding)];
  }

  &__prepend-inner,
  &__append-inner {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pr-3;
  }

  &__field-main {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-truncate;
  }

  &__prefix,
  &__suffix {
    @apply tw-flex tw-items-center tw-flex-wrap tw-pr-3 tw-pointer-events-none tw-text-sm;
  }

  &__input {
    @apply tw-appearance-none tw-border-none tw-outline-none tw-flex tw-items-center tw-w-full tw-box-border tw-cursor-pointer invalid:tw-text-[color:var(--select-placeholder-color)] tw-truncate;

    &--default {
      @apply tw-min-h-10;
    }

    &--small {
      @apply tw-min-h-7;
    }
  }

  &__placeholder {
    @apply tw-text-[color:var(--select-placeholder-color)] tw-text-sm;
  }

  &__selected {
    @apply tw-flex tw-flex-wrap tw-gap-1 tw-py-1;
  }

  &__selected-item {
    @apply tw-flex tw-items-center tw-text-sm;
  }

  &__multiple-item {
    @apply tw-bg-[color:var(--select-multiple-options-background-color)] tw-border tw-border-solid
      tw-border-[color:var(--select-multiple-options-border-color)] tw-rounded-[4px]
      tw-flex tw-items-center tw-h-6 tw-box-border tw-px-2 tw-text-xs tw-gap-1;
  }

  &__loading {
    @apply tw-text-[color:var(--select-loading-color)];
  }

  &__icon-remove {
    @apply tw-text-[color:var(--select-clear-color)] tw-cursor-pointer hover:tw-text-[color:var(--select-clear-color-hover)];
  }

  &__chip-remove {
    @apply tw-appearance-none tw-border-0 tw-bg-transparent tw-p-0 tw-cursor-pointer tw-flex tw-items-center tw-rounded-full;

    &:focus-visible {
      @apply tw-outline-none tw-ring-2 tw-ring-[color:var(--select-focus-ring-color)];
    }
  }

  &__clear {
    @apply tw-cursor-pointer tw-flex tw-items-center tw-pl-3 tw-text-[color:var(--select-clear-color)] hover:tw-text-[color:var(--select-clear-color-hover)];
  }

  &__loading-icon {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3 tw-text-[color:var(--select-loading-color)];
  }

  &__chevron-container {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3 tw-cursor-pointer;
  }

  &__chevron {
    @apply tw-flex-nowrap tw-text-[color:var(--select-chevron-color)] tw-opacity-50
      tw-transition-transform tw-duration-200
      hover:tw-text-[color:var(--select-chevron-color-hover)] hover:tw-opacity-100;
  }

  &__hint-error {
    @apply tw-absolute tw-translate-y-full tw-left-0 tw-right-0 tw-bottom-0 tw-min-h-5;
  }

  &__error-message {
    @apply tw-mt-1 [--hint-color:var(--select-border-color-error)];
  }

  &__hint {
    @apply tw-text-[color:var(--select-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
  }

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border tw-max-h-72 tw-h-auto tw-z-[101]
      tw-overflow-hidden tw-absolute
      tw-bg-[color:var(--select-dropdown-bg)]
      tw-border tw-border-solid tw-border-[color:var(--select-dropdown-border)]
      tw-rounded-[var(--select-border-radius)]
      tw-p-1;
    box-shadow: var(--select-dropdown-shadow);
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
      tw-text-[color:var(--select-placeholder-color)]
      tw-transition-opacity tw-duration-150;
  }

  &__search-input {
    @apply tw-w-full tw-box-border tw-border tw-border-solid tw-border-[color:var(--select-search-border-color)] tw-bg-transparent tw-rounded-[var(--select-border-radius)] tw-h-8 tw-leading-8 tw-outline-none tw-mb-2 tw-px-2 tw-text-sm
      focus:tw-border-[color:var(--select-border-color-focus)] focus:tw-ring-[3px] focus:tw-ring-[color:var(--select-focus-ring-color)]
      tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out;
  }

  &__no-options {
    @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__no-options-text {
    @apply tw-m-4 tw-text-lg tw-font-medium;
  }

  &__option {
    @apply tw-flex tw-items-center tw-min-h-8 tw-box-border
      tw-py-1.5 tw-pr-8 tw-pl-2
      tw-rounded-[4px]
      tw-cursor-pointer tw-text-sm tw-relative tw-select-none
      hover:tw-bg-[color:var(--select-option-background-color-hover)];

    &--selected {
      @apply tw-bg-[color:var(--select-option-background-color-selected)]
        hover:tw-bg-[color:var(--select-option-background-color-selected)];
    }
  }

  &__check-icon {
    @apply tw-absolute tw-right-2 tw-flex tw-items-center tw-justify-center
      tw-text-[color:var(--select-option-check-color)];
  }

  &__list-loading-indicator {
    @apply tw-flex tw-items-center tw-justify-center tw-p-2 tw-text-sm tw-text-[color:var(--select-text-color)];

    span {
      @apply tw-mr-2;
    }
  }

  &__load-more-trigger {
    @apply tw-block tw-h-[1px]; /* Ensures it's in layout flow for intersection observer */
  }

  &.vc-select--opened &__chevron {
    @apply tw-rotate-180 tw-opacity-100;
  }

  &.vc-select--opened &__field-wrapper {
    @apply tw-border-[color:var(--select-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--select-focus-ring-color)]
      tw-outline-none;
  }

  &.vc-select--error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--select-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--select-error-ring-color)];
  }

  &.vc-select--disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &.vc-select--disabled &__field-wrapper,
  &.vc-select--disabled &__field,
  &.vc-select--disabled &__input {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &--focused .vc-select__field-wrapper {
    @apply tw-border-[color:var(--select-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--select-focus-ring-color)]
      tw-outline-none;
  }

  &.vc-select--has-hint-or-error {
    @apply tw-pb-5;
  }

}

// Dropdown enter/leave transition (fade + scale)
.select-dropdown-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.select-dropdown-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.select-dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.select-dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
