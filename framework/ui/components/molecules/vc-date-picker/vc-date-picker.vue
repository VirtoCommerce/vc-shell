<template>
  <div
    class="vc-date-picker"
    :class="[
      {
        'vc-date-picker_error': invalid,
        'vc-date-picker_disabled': resolvedDisabled,
        'vc-date-picker_focused': isFocused,
      },
    ]"
  >
    <!-- Label -->
    <VcLabel
      v-if="label"
      :id="labelId"
      class="vc-date-picker__label"
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
      class="vc-date-picker__field-wrapper"
      :class="{
        'vc-date-picker__field-wrapper--default': size === 'default',
        'vc-date-picker__field-wrapper--small': size === 'small',
      }"
    >
      <div class="vc-date-picker__field-container">
        <div class="vc-date-picker__field">
          <VueDatePicker
            v-model="internalValue"
            :placeholder="
              placeholder ||
              (type === 'datetime-local'
                ? $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_TIME_PLACEHOLDER')
                : $t('COMPONENTS.MOLECULES.VC_INPUT.DATE_PLACEHOLDER'))
            "
            :disabled="resolvedDisabled"
            :name="name"
            :autofocus="autofocus"
            :max-date="maxDate"
            time-picker-inline
            :enable-time-picker="type === 'datetime-local'"
            :format="formatDateWithLocale"
            :locale="locale"
            :start-time="{ hours: 0, minutes: 0 }"
            :clearable="false"
            :config="{ closeOnAutoApply: false }"
            auto-apply
            :teleport-center="$isMobile.value"
            :is24="isBrowserLocale24h"
            v-bind="datePickerOptions"
            :teleport="$isDesktop.value ? 'body' : undefined"
            :aria-invalid="invalid || undefined"
            :aria-required="ariaRequired"
            :aria-describedby="ariaDescribedBy"
            :aria-labelledby="label ? labelId : undefined"
            class="vc-date-picker__input"
            tabindex="0"
            @focus="handleFocus"
            @closed="handleBlur"
            @tooltip-open="handleFocus"
            @tooltip-close="handleBlur"
          />

          <button
            v-if="clearable && internalValue && !disabled"
            type="button"
            class="vc-date-picker__clear"
            aria-label="Clear date"
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
          class="vc-date-picker__loading"
        >
          <VcIcon
            icon="lucide-loader-2"
            class="vc-date-picker__loading-icon"
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
          class="vc-date-picker__hint-error"
          :error="true"
          >{{ errorMessage }}</VcHint
        >
      </div>
      <div v-else>
        <VcHint
          v-if="hint"
          :id="hintId"
          class="vc-date-picker__desc"
          >{{ hint }}</VcHint
        >
      </div>
    </Transition>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useFormField } from "@ui/composables/useFormField";
import { VcLabel, VcIcon, VcHint } from "@ui/components";
import VueDatePicker, { VueDatePickerProps, ModelValue } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import type { ITextFieldProps } from "@ui/types";

export interface VcDatePickerProps extends ITextFieldProps {
  modelValue?: ModelValue;
  type?: "date" | "datetime-local";
  datePickerOptions?: VueDatePickerProps;
}

export interface VcDatePickerEmits {
  (event: "update:modelValue", value: ModelValue | null | undefined): void;
  (event: "blur", value: Event): void;
  (event: "focus"): void;
}

const props = withDefaults(defineProps<VcDatePickerProps>(), {
  type: "date",
  name: "Field",
  size: "default",
});

const emit = defineEmits<VcDatePickerEmits>();

const { labelId, errorId, hintId, invalid, resolvedDisabled, ariaRequired, ariaDescribedBy } = useFormField(props);

// State
const isFocused = ref(false);
const locale = window.navigator.language;
const internalValue = ref<ModelValue | undefined>(props.modelValue);

const maxDate = computed(() => (props.type === "date" && "9999-12-31") || undefined);

const isBrowserLocale24h = (() => {
  const hr = new Intl.DateTimeFormat(locale, { hour: "numeric" }).format();
  return Number.isInteger(Number(hr));
})();

const formatDateWithLocale = (date: Date | Date[]) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  if (props.type === "datetime-local") {
    options.hour = "numeric";
    options.minute = "numeric";
    options.hour12 = !isBrowserLocale24h;
  }

  const formatSingleDate = (d: Date) => new Intl.DateTimeFormat(locale, options).format(d);

  if (Array.isArray(date)) {
    return date.map(formatSingleDate).join(",");
  } else {
    return formatSingleDate(date);
  }
};

// Sync external modelValue → internal
watch(
  () => props.modelValue,
  (newVal) => {
    if (internalValue.value !== newVal) {
      internalValue.value = newVal;
    }
  },
);

// Sync internal → emit (with guard to prevent watch loop)
watch(internalValue, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal !== props.modelValue) {
    emit("update:modelValue", newVal);
  }
});

function onReset() {
  internalValue.value = null;
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
}

.vc-date-picker {
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

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--input-error-ring-color)];
  }

  &_disabled &__field-wrapper {
    @apply tw-opacity-50;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
  }

  &_focused &__field-wrapper {
    @apply tw-border-[color:var(--input-border-color-focus)]
      tw-ring-[3px] tw-ring-[color:var(--input-focus-ring-color)]
      tw-outline-none;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.25s ease-out;
  }

  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(5px);
  }

  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
}

/* VueDatePicker theme integration - shared with VcInput */
.dp__main {
  @apply tw-flex tw-items-center tw-h-full;

  & > div {
    @apply tw-w-full tw-h-full tw-flex tw-items-center;
  }

  .vc-app_mobile & {
    & > div {
      @apply tw-w-auto tw-h-auto tw-flex-auto tw-items-center;
    }
  }
}

.dp__pm_am_button {
  background: var(--dp-primary-color) !important;
  color: var(--dp-primary-text-color) !important;
  border: none !important;
  padding: var(--dp-common-padding) !important;
  border-radius: var(--dp-border-radius) !important;
  cursor: pointer !important;
}

.dp__input_icons {
  padding: 6px 0 !important;
}

.dp__input_wrap {
  @apply tw-w-full tw-h-full;
  box-sizing: border-box !important;
}

.dp__input {
  @apply tw-font-jakarta tw-border-none tw-outline-none tw-h-full tw-min-w-0 tw-w-full tw-box-border tw-grow tw-text-sm tw-text-[color:var(--input-text-color)] !important;

  --dp-input-padding: 0;

  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  line-height: 1.25rem !important;

  &::-ms-reveal,
  &::-ms-clear {
    @apply tw-hidden;
  }
}

input.dp__input {
  background-color: transparent !important;
  height: auto;
}

input.dp__input.dp__input_icon_pad {
  padding-inline-start: 28px !important;
}

input.dp__input::placeholder {
  color: var(--input-placeholder-color) !important;
  opacity: 1;
}

input.dp__input:disabled {
  background-color: transparent;
}

.dp__menu_inner {
  @apply tw-font-jakarta tw-text-[14px] !important;
}

.dp--tp-wrap {
  min-width: var(--dp-menu-min-width);
  max-width: 100% !important;
}

.dp__theme_light {
  --dp-background-color: var(--additional-50);
  --dp-text-color: var(--neutrals-800);
  --dp-hover-color: var(--neutrals-200);
  --dp-hover-text-color: var(--neutrals-800);
  --dp-hover-icon-color: var(--neutrals-400);
  --dp-primary-color: var(--primary-500);
  --dp-primary-disabled-color: var(--secondary-400);
  --dp-primary-text-color: var(--neutrals-50);
  --dp-secondary-color: var(--secondary-300);
  --dp-border-color: var(--neutrals-300);
  --dp-menu-border-color: var(--neutrals-300);
  --dp-border-color-hover: var(--neutrals-400);
  --dp-border-color-focus: var(--neutrals-400);
  --dp-disabled-color: var(--input-disabled-bg-color);
  --dp-disabled-color-text: var(--input-disabled-text-color);
  --dp-scroll-bar-background: var(--neutrals-200);
  --dp-scroll-bar-color: var(--neutrals-400);
  --dp-success-color: var(--success-500);
  --dp-success-color-disabled: var(--success-200);
  --dp-icon-color: var(--neutrals-400);
  --dp-danger-color: var(--danger-500);
  --dp-marker-color: var(--danger-500);
  --dp-tooltip-color: var(--additional-50);
  --dp-disabled-color-text: var(--neutrals-400);
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
  --dp-range-between-dates-background-color: var(--dp-hover-color);
  --dp-range-between-dates-text-color: var(--dp-hover-text-color);
  --dp-range-between-border-color: var(--dp-hover-color);
}
</style>
