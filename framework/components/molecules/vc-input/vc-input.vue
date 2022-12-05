<template>
  <div
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': errorMessage,
        'vc-input_disabled': disabled,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel v-if="label" class="mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Input field -->
    <div class="vc-input__field-wrapper">
      <input
        class="vc-input__field"
        :placeholder="placeholder"
        :type="internalType"
        :value="calcValue"
        :disabled="disabled"
        @input="onInput"
        ref="inputRef"
        :max="max"
        :name="name"
        :maxlength="maxchars"
      />

      <!-- Dropdown button -->
      <div v-if="options && options.length" class="vc-input__dropdown-wrap">
        <div
          @click.stop="showDrop"
          aria-describedby="tooltip"
          ref="toggleDropRef"
          :class="[
            { 'vc-input__dropdown-btn_disabled': disabled },
            'vc-input__dropdown-btn',
          ]"
        >
          {{ optionsValue }}
        </div>
        <teleport to="body">
          <div
            v-if="dropActive"
            ref="dropRef"
            role="tooltip"
            class="vc-input__dropdown"
            v-click-outside="closeDrop"
          >
            <p class="vc-input__dropdown-title">{{ optionsTitle }}</p>
            <input
              class="vc-input__dropdown-search"
              v-model="search"
              ref="searchInput"
            />
            <ul class="vc-input__dropdown-list">
              <li v-for="(item, i) in searchFilter" :key="i">
                <button
                  @click="onItemSelect(item)"
                  :class="[
                    'vc-input__dropdown-selector',
                    {
                      'vc-input__dropdown-selector-active':
                        item[displayProperty] === optionsValue,
                    },
                  ]"
                >
                  {{ item[displayProperty] }}
                </button>
              </li>
            </ul>
          </div>
        </teleport>
      </div>

      <!-- Input clear button -->
      <div
        v-if="clearable && modelValue && !disabled && type !== 'password'"
        class="vc-input__clear"
        @click="onReset"
      >
        <VcIcon size="s" icon="fas fa-times"></VcIcon>
      </div>

      <div
        class="vc-input__showhide"
        v-if="type === 'password' && internalType === 'password'"
        @click="internalType = 'text'"
      >
        <VcIcon size="s" icon="fas fa-eye-slash"></VcIcon>
      </div>

      <div
        class="vc-input__showhide"
        v-if="type === 'password' && internalType === 'text'"
        @click="internalType = 'password'"
      >
        <VcIcon size="s" icon="fas fa-eye"></VcIcon>
      </div>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-input__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
    <slot v-if="fieldDescription" name="error">
      <VcHint class="vc-input__desc">
        {{ fieldDescription }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  ref,
  unref,
  watch,
} from "vue";
import { GenericValidateFunction, useField } from "vee-validate";
import { VcIcon, VcLabel } from "@components";
import { IValidationRules } from "@types";
import { createPopper, Instance } from "@popperjs/core";
import {
  useCurrencyInput,
  UseCurrencyInput,
  CurrencyDisplay,
} from "vue-currency-input";
import { clickOutside as vClickOutside } from "@directives";
import { required as requiredRule } from "@plugins";

export type ValueType = string | number | Date | null;

export interface Props {
  placeholder?: string;
  modelValue?: ValueType;
  clearable?: boolean;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  label?: string;
  tooltip?: string;
  name?: string;
  rules?:
    | string
    | IValidationRules
    | GenericValidateFunction<ValueType>
    | GenericValidateFunction<ValueType>[];
  currency?: boolean;
  options?: Record<string, string>[];
  optionsTitle?: string;
  optionsValue?: string;
  keyProperty?: string;
  displayProperty?: string;
  fieldDescription?: string;
  maxchars?: string;
  max?: string | number;
}

export interface Emits {
  (event: "update:modelValue", value: ValueType): void;
  (event: "update:optionsValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  modelValue: null,
  clearable: false,
  required: false,
  disabled: false,
  type: "text",
  name: "Field",
  currency: false,
  options: () => [],
  optionsTitle: "Select",
  optionsValue: "",
  keyProperty: "id",
  displayProperty: "title",
  fieldDescription: "",
  maxchars: "1024",
});

const emit = defineEmits<Emits>();

let currencyConverter: UseCurrencyInput | undefined = undefined;
const internalType = ref(unref(props.type));
const toggleDropRef = ref();
const dropRef = ref();
const dropActive = ref(false);
const instance = getCurrentInstance();
const popper = ref<Instance>();
const search = ref("");
const searchInput = ref();
const calcValue = computed(() => {
  if (props.currency) {
    return currencyConverter?.formattedValue.value;
  } else {
    return value.value;
  }
});

// Prepare validation rules using required and rules props combination
let internalRules = unref(props.rules);
if (props.required) {
  switch (typeof internalRules) {
    case "undefined":
      internalRules = "required";
      break;
    case "string":
      internalRules = `required|${internalRules as string}`;
      break;
    case "function":
      internalRules = [requiredRule, internalRules];
      break;
    case "object":
      if (Array.isArray(internalRules)) {
        internalRules.unshift(requiredRule);
      } else {
        (internalRules as IValidationRules).required = true;
      }
      break;
  }
}

let initialValue = unref(props.modelValue);

// Prepare field-level validation
const { errorMessage, handleChange, value } = useField<ValueType>(
  `${props.name === "Field" ? instance?.uid : props.name}`,
  internalRules,
  {
    initialValue,
  }
);

// Init currency composable if input type === currency (created hook)
if (props.currency) {
  currencyConverter = useCurrencyInput({
    currency: props.optionsValue || "USD",
    currencyDisplay: CurrencyDisplay.hidden,
  });
}

onMounted(() => {
  if (!value.value && props.currency) {
    currencyConverter && currencyConverter.setValue(null);
  }
});

// Change currency settings
watch(
  () => props.optionsValue,
  (newVal) => {
    currencyConverter &&
      currencyConverter.setOptions({
        currency: newVal,
        currencyDisplay: CurrencyDisplay.hidden,
      });
  }
);

const searchFilter = computed(() => {
  return props.options.filter((opt) =>
    opt[props.displayProperty]
      .toLowerCase()
      .includes(search.value.toLowerCase())
  );
});

const inputRef = currencyConverter && currencyConverter.inputRef;

watch(
  () => props.modelValue,
  (value) => {
    let initialValue = unref(value);
    if (
      initialValue &&
      initialValue.toString().length >= parseInt(props.maxchars)
    ) {
      initialValue.toString().slice(0, parseInt(props.maxchars));

      return;
    }

    handleChange(initialValue);
  }
);

function showDrop() {
  if (!dropActive.value && !props.disabled) {
    dropActive.value = true;
    nextTick(() => {
      searchInput.value.focus();
      popper.value = createPopper(toggleDropRef.value, dropRef.value, {
        placement: "bottom-end",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [13, 15],
            },
          },
        ],
      });
    });
  } else {
    closeDrop();
  }
}

function closeDrop() {
  dropActive.value = false;
  search.value = "";
  popper.value?.destroy();
}

function onItemSelect(item: { [x: string]: string }) {
  emit("update:optionsValue", item[props.keyProperty]);
  closeDrop();
}

// Handle input event to properly validate value and emit changes
function onInput(e: Event) {
  const newValue = (e.target as HTMLInputElement).value;
  if (newValue) {
    if (props.currency) {
      const parsed = currencyConverter.numberValue.value;
      emit("update:modelValue", parsed);
    } else {
      emit("update:modelValue", newValue);
    }
  } else {
    emit("update:modelValue", null);
  }
}

// Handle input event to propertly reset value and emit changes
function onReset() {
  if (props.currency) {
    currencyConverter && currencyConverter.setValue(null);
  }
  emit("update:modelValue", null);
}
</script>

<style lang="scss">
:root {
  --input-height: 38px;
  --input-border-radius: 3px;
  --input-border-color: #d3dbe9;
  --input-border-color-error: #f14e4e;
  --input-background-color: #ffffff;
  --input-placeholder-color: #a5a5a5;
  --input-clear-color: #43b0e6;
  --input-clear-color-hover: #319ed4;
}

.vc-input {
  @apply overflow-hidden;

  &_date,
  &_datetime-local {
    @apply max-w-[220px];

    .vc-app_mobile & {
      @apply max-w-full;
    }
  }

  &__field-wrapper {
    @apply border border-solid border-[color:var(--input-border-color)]
    rounded-[var(--input-border-radius)]
    bg-[color:var(--input-background-color)] flex items-stretch;
  }

  &_error &__field-wrapper {
    @apply border border-solid border-[color:var(--input-border-color-error)];
  }

  &__error {
    @apply mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply text-[color:var(--multivalue-placeholder-color)] mt-1 break-words p-0;
  }

  &__field {
    @apply border-none outline-none h-[var(--input-height)] min-w-0 box-border grow pl-3;

    &::-webkit-input-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::placeholder {
      @apply text-[color:var(--input-placeholder-color)];
    }

    &::-ms-reveal,
    &::-ms-clear {
      @apply hidden;
    }
  }

  &__clear {
    @apply cursor-pointer text-[color:var(--input-clear-color)] hover:text-[color:var(--input-clear-color-hover)] px-3 flex items-center;
  }

  &__showhide {
    @apply cursor-pointer text-[color:var(--input-placeholder-color)] hover:text-[color:var(--input-clear-color-hover)] px-3 flex items-center;
  }

  &__dropdown-wrap {
    @apply relative px-3 flex items-center;
  }

  &__dropdown-btn {
    @apply text-[color:var(--input-clear-color)] not-italic font-medium text-[13px] leading-[20px] cursor-pointer;

    &_disabled {
      @apply text-[#7e8e9d] cursor-default;
    }
  }

  &__dropdown {
    @apply absolute bg-white shadow-[1px_1px_11px_rgba(141,152,163,0.6)] rounded-[3px] p-[11px] w-[120px] box-border;
  }

  &__dropdown-title {
    @apply not-italic font-normal text-base leading-[20px] text-[#333333] p-0 mb-[7px];
  }

  &__dropdown-search {
    @apply bg-white border border-solid border-[#eaecf2] box-border rounded-[4px] h-8 w-full outline-none px-2;
  }

  &__dropdown-list {
    @apply list-none p-0 mt-2;
  }

  &__dropdown-selector {
    @apply border-none bg-transparent p-[9px] text-left w-full cursor-pointer text-lg rounded-[3px] hover:bg-[#eff7fc];

    &-active {
      @apply bg-[#dfeef9];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply bg-[#fafafa] text-[#424242];
  }
}
</style>
