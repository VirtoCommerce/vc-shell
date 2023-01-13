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
    <VcLabel v-if="label" class="tw-mb-2" :required="isRequired">
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
        @blur="$emit('blur')"
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
        <teleport to="#app">
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
import { VcIcon, VcLabel } from "@/ui/components";
import { createPopper, Instance } from "@popperjs/core";
import {
  useCurrencyInput,
  UseCurrencyInput,
  parse,
  CurrencyDisplay,
} from "vue-currency-input";
import { clickOutside as vClickOutside } from "@/core/directives";

export type ValueType = string | number | Date | null;

export interface Props {
    placeholder?: string;
    modelValue?: ValueType;
    clearable?: boolean;
    isRequired?: boolean;
    disabled?: boolean;
    type?: string;
    label?: string;
    tooltip?: string;
    name?: string;
    currency?: boolean;
    options?: Record<string, string>[];
    optionsTitle?: string;
    optionsValue?: string;
    keyProperty?: string;
    displayProperty?: string;
    fieldDescription?: string;
    maxchars?: string;
    max?: string | number;
    errorMessage?: string;
}

export interface Emits {
    (event: "update:modelValue", value: ValueType): void;
    (event: "update:optionsValue", value: string): void;
    (event: 'blur'): void;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "",
    modelValue: null,
    clearable: false,
    isRequired: false,
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
        return props.modelValue;
    }
});

// Init currency composable if input type === currency (created hook)
if (props.currency) {
  currencyConverter = useCurrencyInput({
    currency: props.optionsValue || "USD",
    autoSign: false,
    currencyDisplay: CurrencyDisplay.hidden,
  });
}

onMounted(() => {
    if (!props.modelValue && props.currency) {
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
        autoSign: false,
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

        emit("update:modelValue", initialValue);
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
      const parsed = parse(newValue, { currency: props.optionsValue });
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
  @apply tw-overflow-hidden;

  &_date,
  &_datetime-local {
    @apply tw-max-w-[220px];

    .vc-app_mobile & {
      @apply tw-max-w-full;
    }
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color)]
    tw-rounded-[var(--input-border-radius)]
    tw-bg-[color:var(--input-background-color)] tw-flex tw-items-stretch;
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)];
  }

  &__error {
    @apply tw-mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--multivalue-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
  }

  &__field {
    @apply tw-border-none tw-outline-none tw-h-[var(--input-height)] tw-min-w-0 tw-box-border tw-grow tw-pl-3;

    &::-webkit-input-placeholder {
      @apply tw-text-[color:var(--input-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply tw-text-[color:var(--input-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply tw-text-[color:var(--input-placeholder-color)];
    }

    &::placeholder {
      @apply tw-text-[color:var(--input-placeholder-color)];
    }

    &::-ms-reveal,
    &::-ms-clear {
      @apply tw-hidden;
    }
  }

  &__clear {
    @apply tw-cursor-pointer tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-px-3 tw-flex tw-items-center;
  }

  &__showhide {
    @apply tw-cursor-pointer tw-text-[color:var(--input-placeholder-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-px-3 tw-flex tw-items-center;
  }

  &__dropdown-wrap {
    @apply tw-relative tw-px-3 tw-flex tw-items-center;
  }

  &__dropdown-btn {
    @apply tw-text-[color:var(--input-clear-color)] tw-not-italic tw-font-medium tw-text-[13px] tw-leading-[20px] tw-cursor-pointer;

    &_disabled {
      @apply tw-text-[#7e8e9d] tw-cursor-default;
    }
  }

  &__dropdown {
    @apply tw-absolute tw-bg-white tw-shadow-[1px_1px_11px_rgba(141,152,163,0.6)] tw-rounded-[3px] tw-p-[11px] tw-w-[120px] tw-box-border;
  }

  &__dropdown-title {
    @apply tw-not-italic tw-font-normal tw-text-base tw-leading-[20px] tw-text-[#333333] tw-p-0 tw-mb-[7px];
  }

  &__dropdown-search {
    @apply tw-bg-white tw-border tw-border-solid tw-border-[#eaecf2] tw-box-border tw-rounded-[4px] tw-h-8 tw-w-full tw-outline-none tw-px-2;
  }

  &__dropdown-list {
    @apply tw-list-none tw-p-0 tw-mt-2;
  }

  &__dropdown-selector {
    @apply tw-border-none tw-bg-transparent tw-p-[9px] tw-text-left tw-w-full tw-cursor-pointer tw-text-lg tw-rounded-[3px] hover:tw-bg-[#eff7fc];

    &-active {
      @apply tw-bg-[#dfeef9];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[#fafafa] tw-text-[#424242];
  }
}
</style>
