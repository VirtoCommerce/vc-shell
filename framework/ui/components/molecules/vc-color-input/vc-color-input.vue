<template>
  <div
    class="vc-color-input"
    :class="[
      {
        'vc-color-input--error': invalid,
        'vc-color-input--disabled': resolvedDisabled,
        'vc-color-input--focused': isFocused,
      },
    ]"
  >
    <!-- Label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      :html-for="inputId"
      class="vc-color-input__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="invalid"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <div
      class="vc-color-input__field-wrapper"
      :class="{
        'vc-color-input__field-wrapper--default': size === 'default',
        'vc-color-input__field-wrapper--small': size === 'small',
      }"
    >
      <div class="vc-color-input__field-container">
        <div class="vc-color-input__field">
          <input
            :id="inputId"
            ref="inputRef"
            v-model="textValue"
            :placeholder="placeholder"
            type="text"
            :disabled="resolvedDisabled"
            :name="name"
            :autofocus="autofocus"
            :aria-invalid="invalid || undefined"
            :aria-required="ariaRequired"
            :aria-describedby="ariaDescribedBy"
            :aria-labelledby="label ? labelId : undefined"
            class="vc-color-input__input"
            tabindex="0"
            @blur="handleBlur"
            @focus="handleFocus"
            @input="onTextInput"
          />

          <!-- Color picker swatch -->
          <div class="vc-color-input__color-container">
            <button
              type="button"
              class="vc-color-input__color-square"
              :style="{ backgroundColor: colorValue || '#ffffff' }"
              :aria-label="`Pick color${colorValue ? ': ' + colorValue : ''}`"
              @click="openColorPicker"
            >
              <!-- Hidden native color input -->
              <input
                ref="colorPickerRef"
                type="color"
                :value="colorValue"
                class="vc-color-input__color-picker-hidden"
                tabindex="-1"
                aria-hidden="true"
                @change="handleColorPickerChange"
              />
            </button>
          </div>

          <button
            v-if="clearable && textValue && !disabled"
            type="button"
            class="vc-color-input__clear"
            aria-label="Clear color"
            @click="onReset"
          >
            <VcIcon
              size="xs"
              icon="lucide-x"
            ></VcIcon>
          </button>
        </div>

        <div
          v-if="loading"
          class="vc-color-input__loading"
        >
          <VcIcon
            icon="lucide-loader-2"
            class="vc-color-input__loading-icon"
            size="m"
          ></VcIcon>
        </div>
      </div>
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <VcHint
          :id="errorId"
          class="vc-color-input__hint-error"
          :error="true"
          >{{ errorMessage }}</VcHint
        >
      </div>
      <div v-else>
        <VcHint
          v-if="hint"
          :id="hintId"
          class="vc-color-input__desc"
          >{{ hint }}</VcHint
        >
      </div>
    </Transition>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, watch, nextTick } from "vue";
import { useFormField } from "@ui/composables/useFormField";
import { VcLabel, VcIcon, VcHint } from "@ui/components";
import { convertColorNameToHex, isValidHexColor, normalizeHexColor } from "@shared/utilities";
import type { ITextFieldProps } from "@ui/types";

export interface VcColorInputProps extends ITextFieldProps {
  modelValue?: string | null;
}

export interface VcColorInputEmits {
  (event: "update:modelValue", value: string | null): void;
  (event: "blur", value: Event): void;
  (event: "focus"): void;
}

const props = withDefaults(defineProps<VcColorInputProps>(), {
  name: "Field",
  size: "default",
});

const emit = defineEmits<VcColorInputEmits>();

const { fieldId: inputId, labelId, errorId, hintId, invalid, resolvedDisabled, ariaRequired, ariaDescribedBy } =
  useFormField(props);

// State
const isFocused = ref(false);
const isSyncing = ref(false);
const inputRef = ref<HTMLInputElement>();
const colorPickerRef = ref<HTMLInputElement>();
const textValue = ref(props.modelValue ?? "");
const colorValue = ref("");

// Initialize color value from modelValue
function syncColorFromText(value: string) {
  if (!value || typeof value !== "string") {
    colorValue.value = "";
    return;
  }

  const trimmed = value.trim();

  if (isValidHexColor(trimmed)) {
    colorValue.value = normalizeHexColor(trimmed);
    return;
  }

  const hexColor = convertColorNameToHex(trimmed);
  if (hexColor) {
    colorValue.value = hexColor;
  }
}

// Sync external modelValue → internal (with guard to prevent loop)
watch(
  () => props.modelValue,
  (newVal) => {
    if (isSyncing.value) return;
    isSyncing.value = true;
    textValue.value = newVal ?? "";
    nextTick(() => {
      syncColorFromText(newVal ?? "");
      isSyncing.value = false;
    });
  },
  { immediate: true },
);

// Sync colorValue → hidden picker
watch(colorValue, (newColorValue) => {
  if (newColorValue && colorPickerRef.value) {
    colorPickerRef.value.value = newColorValue;
  }
});

function onTextInput() {
  if (isSyncing.value) return;
  isSyncing.value = true;
  emit("update:modelValue", textValue.value || null);
  nextTick(() => {
    syncColorFromText(textValue.value);
    isSyncing.value = false;
  });
}

function handleColorPickerChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target?.value) {
    const hexColor = normalizeHexColor(target.value);
    colorValue.value = hexColor;
    textValue.value = hexColor;
    emit("update:modelValue", hexColor);
  }
}

function openColorPicker() {
  colorPickerRef.value?.click();
}

function onReset() {
  textValue.value = "";
  colorValue.value = "";
  emit("update:modelValue", null);
}

function handleBlur(e: Event) {
  isFocused.value = false;
  emit("blur", e);
}

function handleFocus() {
  isFocused.value = true;
  emit("focus");
}

function focus() {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>

<style lang="scss">
/* CSS variables are also defined in vc-input; duplicated here for standalone use */
:root {
  --input-height: 36px;
  --input-height-small: 32px;
  --input-border-radius: 6px;
  --input-border-color: var(--neutrals-300);
  --input-padding: 12px;
  --input-background-color: var(--additional-50);
  --input-placeholder-color: var(--neutrals-400);
  --input-clear-color: var(--neutrals-400);
  --input-clear-color-hover: var(--neutrals-600);
  --input-text-color: var(--neutrals-800);
  --input-disabled-text-color: var(--neutrals-500);
  --input-disabled-bg-color: var(--neutrals-200);
  --input-text-color-error: var(--danger-500);
  --input-border-color-error: var(--danger-500);
  --input-border-color-focus: var(--primary-500);
  --input-focus-ring-color: var(--primary-100);
  --input-error-ring-color: var(--danger-100);

  --color-input-swatch-size: 20px;
  --color-input-swatch-border-radius: 4px;
  --color-input-swatch-border-color: var(--neutrals-300);
  --color-input-swatch-border-color-hover: var(--neutrals-400);
}

.vc-color-input {
  &__label {
    @apply tw-mb-2;
  }

  &__field-wrapper {
    @apply tw-px-[var(--input-padding)] tw-relative tw-flex tw-flex-nowrap tw-w-full tw-min-w-0 tw-box-border tw-grow
      tw-border tw-border-solid tw-border-[color:var(--input-border-color)]
      tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)]
      tw-shadow-sm tw-transition-[color,box-shadow] tw-duration-150 tw-ease-in-out
      tw-outline-none;

    &--default {
      @apply tw-h-[var(--input-height)];
    }

    &--small {
      @apply tw-h-[var(--input-height-small)];
    }
  }

  &__field-container {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full;
  }

  &__field {
    @apply tw-w-auto tw-min-w-0 tw-max-w-full tw-relative tw-flex tw-flex-row tw-flex-auto tw-flex-nowrap [height:inherit];

    input.vc-color-input__input {
      @apply tw-border-none tw-outline-none tw-h-full tw-min-w-0 tw-w-full tw-box-border tw-grow tw-text-sm tw-text-[color:var(--input-text-color)];
      background: transparent;

      &::placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm;
      }
    }
  }

  &__color-container {
    @apply tw-relative tw-flex tw-items-center;
  }

  &__color-square {
    @apply tw-cursor-pointer tw-flex tw-items-center tw-justify-center tw-ml-2
      tw-border tw-border-solid tw-bg-transparent tw-p-0 tw-outline-none;
    width: var(--color-input-swatch-size);
    height: var(--color-input-swatch-size);
    border-radius: var(--color-input-swatch-border-radius);
    border-color: var(--color-input-swatch-border-color);

    &:hover {
      border-color: var(--color-input-swatch-border-color-hover);
    }

    &:focus-visible {
      @apply tw-ring-[3px] tw-ring-[color:var(--input-focus-ring-color)] tw-outline-none;
    }
  }

  &__color-picker-hidden {
    @apply tw-opacity-0 tw-absolute tw-pointer-events-none tw-w-0 tw-h-0;
  }

  &__clear {
    @apply tw-cursor-pointer tw-pl-3 tw-text-[color:var(--input-clear-color)]
      hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center
      tw-border-none tw-bg-transparent tw-outline-none tw-p-0;
  }

  &__loading {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3;
  }

  &__loading-icon {
    @apply tw-animate-spin tw-text-[color:var(--input-clear-color)];
  }

  &__hint-error {
    @apply tw-mt-1 [--hint-error-color:var(--input-text-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--input-placeholder-color)] tw-text-sm tw-mt-1;
  }

  &--error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--input-error-ring-color)];
  }

  &--error &__field input {
    @apply tw-text-[color:var(--input-text-color-error)];
  }

  &--disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &--disabled &__field-wrapper,
  &--disabled &__field,
  &--disabled input {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &--focused &__field-wrapper {
    @apply tw-border-[color:var(--input-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--input-focus-ring-color)]
      tw-outline-none;
  }

}
</style>
