<template>
  <!-- Skeleton mode -->
  <div
    v-if="bladeLoading"
    class="vc-input-dropdown vc-input-dropdown--skeleton"
  >
    <VcSkeleton
      v-if="label"
      variant="block"
      :width="60 + (label?.length || 0) * 4"
      :height="11"
    />
    <VcSkeleton
      variant="block"
      width="100%"
      :height="36"
    />
  </div>

  <!-- Normal mode -->
  <VcSelect
    v-else
    class="vc-input-dropdown"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :searchable="searchable"
    :debounce="debounce"
    :disabled="disabled"
    :label="label"
    :required="required"
    :model-value="option"
    :tooltip="tooltip"
    :multilanguage="multilanguage"
    :current-language="currentLanguage"
    @update:model-value="$emit('update:option', $event)"
  >
    <template #option="scope">
      <slot
        name="option"
        v-bind="scope"
      ></slot>
    </template>
    <template #control="{ toggleHandler, isOpened }">
      <VcInput
        :placeholder="placeholder"
        :hint="hint"
        :clearable="clearable"
        :prefix="prefix"
        :suffix="suffix"
        :name="name"
        :model-value="modelValue"
        :loading="loading"
        :disabled="disabled"
        :autofocus="autofocus"
        :error="error"
        :error-message="errorMessage"
        :maxlength="maxlength"
        :type="inputType"
        class="vc-input-dropdown__input"
        @update:model-value="$emit('update:model-value', $event)"
        @blur="$emit('blur', $event)"
      >
        <template #append-inner>
          <div class="tw-flex tw-items-center">
            <slot
              name="button"
              :toggle-handler="toggleHandler"
            >
              <template v-if="options && options.length">
                <button
                  type="button"
                  class="vc-input-dropdown__toggle-button"
                  tabindex="0"
                  aria-label="Select option"
                  :aria-expanded="isOpened"
                  aria-haspopup="listbox"
                  @click.stop.prevent="toggleHandler"
                  @keydown.enter.stop.prevent="toggleHandler"
                  @keydown.space.stop.prevent="toggleHandler"
                >
                  {{ unref(option) }}
                </button>
              </template>
            </slot>
            <VcButton
              v-if="options && options.length"
              :icon="isOpened ? 'lucide-chevron-up' : 'lucide-chevron-down'"
              icon-size="s"
              text
              aria-label="Toggle dropdown"
              icon-class="vc-input-dropdown__toggle-button-icon"
              @click.stop.prevent="toggleHandler"
            ></VcButton>
          </div>
          <slot
            v-if="$slots['append-inner']"
            name="append-inner"
          ></slot>
        </template>
        <template
          v-if="$slots.control"
          #control="scope"
        >
          <slot
            name="control"
            v-bind="scope"
          ></slot>
        </template>
        <template
          v-if="$slots['prepend-inner']"
          #prepend-inner
        >
          <slot name="prepend-inner"></slot>
        </template>
        <template
          v-if="$slots['append']"
          #append
        >
          <slot name="append"></slot>
        </template>
        <template
          v-if="$slots['prepend']"
          #prepend
        >
          <slot name="prepend"></slot>
        </template>
      </VcInput>
    </template>
  </VcSelect>
</template>
<script lang="ts" setup>
import { unref } from "vue";
import { VcSelect } from "@ui/components/molecules/vc-select";
import { VcInput } from "@ui/components/molecules/vc-input";
import { type OptionProp } from "@ui/components/molecules/vc-select";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import type { ITextFieldProps } from "@ui/types/form-field";

export interface VcInputDropdownProps extends ITextFieldProps {
  /**
   * Model of the input component
   */
  modelValue: string | number | Date | null | undefined;
  /**
   * Prefix
   */
  prefix?: string;
  /**
   * Suffix
   */
  suffix?: string;
  /**
   * Debounce amount (in milliseconds) for search input
   * Default: 0
   */
  debounce?: string | number;
  /**
   * Specify a max length of model
   * Default value: 1024
   */
  maxlength?: string | number;
  /**
   * Default selected option from dropdown
   */
  option: unknown;
  /**
   * Available options that the user can select from.
   * Default value: []
   */
  options?: unknown[];
  /**
   * Property of option which holds the 'value'
   * Default value: id
   * @param option The current option being processed
   * @returns Value of the current option
   */
  optionValue?: OptionProp<unknown>;
  /**
   * Property of option which holds the 'label'
   * Default value: title
   * @param option The current option being processed
   * @returns Label of the current option
   */
  optionLabel?: OptionProp<unknown>;
  /**
   * Enable search in dropdown
   */
  searchable?: boolean;
  /**
   * Type of the input field
   * Default: text
   */
  inputType?: "text" | "password" | "email" | "tel" | "number" | "integer" | "url" | "time" | "date" | "datetime-local";
}

export interface VcInputDropdownEmits {
  (event: "update:model-value", value: string | number | Date | null | undefined): void;
  (event: "update:option", value: unknown): void;
  (event: "change", value: unknown): void;
  (event: "blur", value: Event): void;
}

const props = withDefaults(defineProps<VcInputDropdownProps>(), {
  debounce: 0,
  searchable: false,
  inputType: "text",
});

defineSlots<{
  /**
   * Slot for custom dropdown open handler
   */
  button: (scope: {
    /**
     * Dropdown open/close handler
     */
    toggleHandler: () => void;
  }) => unknown;
  /**
   * Slot for custom append-inner content
   */
  "append-inner": (props: Record<string, never>) => unknown;
  /**
   * Slot for custom prepend-inner content
   */
  "prepend-inner": (props: Record<string, never>) => unknown;
  /**
   * Slot for custom append content
   */
  append: (props: Record<string, never>) => unknown;
  /**
   * Slot for custom prepend content
   */
  prepend: (props: Record<string, never>) => unknown;
  /**
   * Slot for custom input control
   */
  control: (scope: {
    placeholder?: string;
    focused?: boolean;
    modelValue: string | number | Date | null | undefined;
    emitValue: (value: string | number | Date | null) => void;
  }) => unknown;
  option: (scope: {
    index: number;
    //todo: Create generic component
    opt: unknown;
    selected: boolean;
    toggleOption: (opt: unknown) => void;
  }) => unknown;
}>();

defineEmits<VcInputDropdownEmits>();

const bladeLoading = useBladeLoading();
</script>

<style lang="scss">
:root {
  --input-dropdown-toggle-color: var(--primary-500);
}

.vc-input-dropdown {
  &--skeleton {
    @apply tw-flex tw-flex-col tw-gap-1.5;
  }

  &__input {
    @apply tw-w-full;
  }

  &__toggle-button {
    @apply tw-text-[color:var(--input-dropdown-toggle-color)] tw-not-italic tw-font-medium tw-text-sm tw-cursor-pointer;
  }

  &__toggle-button-icon {
    @apply tw-text-[color:var(--input-dropdown-toggle-color)] tw-ml-3;
  }
}
</style>
