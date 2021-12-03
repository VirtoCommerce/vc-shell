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
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </vc-label>

    <!-- Input field -->
    <div class="vc-input__field-wrapper vc-flex vc-flex-align_stretch">
      <input
        class="vc-input__field vc-flex-grow_1 vc-padding-left_m"
        :placeholder="placeholder"
        :type="internalType"
        :value="calcValue"
        :disabled="disabled"
        @input="onInput"
        ref="inputRef"
      />

      <!-- Dropdown button -->
      <div
        v-if="options && options.length"
        class="vc-input__dropdown-wrap vc-padding-horizontal_m vc-flex vc-flex-align_center"
      >
        <div
          @click="showDrop"
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
        class="vc-input__clear vc-padding-horizontal_m vc-flex vc-flex-align_center"
        @click="onReset"
      >
        <vc-icon size="s" icon="fas fa-times"></vc-icon>
      </div>

      <div
        class="vc-input__showhide vc-padding-horizontal_m vc-flex vc-flex-align_center"
        v-if="type === 'password' && internalType === 'password'"
        @click="internalType = 'text'"
      >
        <vc-icon size="s" icon="fas fa-eye-slash"></vc-icon>
      </div>

      <div
        class="vc-input__showhide vc-padding-horizontal_m vc-flex vc-flex-align_center"
        v-if="type === 'password' && internalType === 'text'"
        @click="internalType = 'password'"
      >
        <vc-icon size="s" icon="fas fa-eye"></vc-icon>
      </div>
    </div>

    <slot v-if="errorMessage" name="error">
      <vc-hint class="vc-input__error vc-margin-top_xs">
        {{ errorMessage }}
      </vc-hint>
    </slot>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  PropType,
  ref,
  unref,
  watch,
} from "vue";
import { useField } from "vee-validate";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";
import { createPopper, Instance } from "@popperjs/core";
import {
  useCurrencyInput,
  UseCurrencyInput,
  parse,
  CurrencyDisplay,
} from "vue-currency-input";
import { clickOutside } from "../../../directives";

export default defineComponent({
  name: "VcInput",

  components: {
    VcIcon,
    VcLabel,
  },

  directives: {
    clickOutside,
  },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: [String, Number, Date],
      default: "",
    },

    clearable: {
      type: Boolean,
      default: false,
    },

    required: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: "text",
    },

    label: {
      type: String,
      default: undefined,
    },

    tooltip: {
      type: String,
      default: undefined,
    },

    name: {
      type: String,
      default: "Field",
    },

    rules: {
      type: [String, Object],
    },

    currency: {
      type: Boolean,
      default: false,
    },

    options: {
      type: Array as PropType<{ [x: string]: string }[]>,
      default: () => [],
    },

    optionsTitle: {
      type: String,
      default: "Select",
    },

    optionsValue: {
      type: String,
      default: "",
    },

    keyProperty: {
      type: String,
      default: "id",
    },

    displayProperty: {
      type: String,
      default: "title",
    },
  },

  emits: ["update:modelValue", "update:optionsValue"],

  setup(props, { emit }) {
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
    let internalRules = unref(props.rules) || "";
    if (props.required) {
      if (typeof internalRules === "string") {
        (internalRules as string) = `required|${internalRules}`.replace(
          /(\|)+$/,
          ""
        );
      } else {
        (internalRules as IValidationRules).required = true;
      }
    }

    let initialValue = unref(props.modelValue);
    if (props.modelValue && props.type === "datetime-local") {
      const date = new Date(props.modelValue);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      initialValue = `${year}-${month}-${day}T${hour}:${minute}:${seconds}`;
    }

    // Prepare field-level validation
    const { errorMessage, handleChange, value } = useField(
      `${instance?.uid || props.name}`,
      internalRules,
      {
        initialValue,
      }
    );

    // Init currency composable if input type === currency (created hook)
    if (props.currency) {
      currencyConverter = useCurrencyInput({
        currency: props.optionsValue,
        autoSign: false,
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

    watch(
      () => props.modelValue,
      (value) => {
        let initialValue = unref(value);
        if (value && props.type === "datetime-local") {
          const date = new Date(value);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const hour = date.getHours().toString().padStart(2, "0");
          const minute = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");
          initialValue = `${year}-${month}-${day}T${hour}:${minute}:${seconds}`;
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

    return {
      internalType,
      value,
      errorMessage,
      toggleDropRef,
      dropRef,
      dropActive,
      search,
      searchFilter,
      calcValue,
      searchInput,
      inputRef: currencyConverter && currencyConverter.inputRef,
      formattedValue: currencyConverter && currencyConverter.formattedValue,

      // Handle input event to propertly validate value and emit changes
      onInput(e: InputEvent) {
        const newValue = (e.target as HTMLInputElement).value;
        if (newValue && props.type === "datetime-local") {
          emit("update:modelValue", new Date(newValue));
        } else if (newValue && props.currency) {
          const parsed = parse(newValue, { currency: props.optionsValue });
          emit("update:modelValue", parsed);
        } else {
          emit("update:modelValue", newValue);
        }
      },

      // Handle input event to propertly reset value and emit changes
      onReset() {
        if (props.currency) {
          currencyConverter && currencyConverter.setValue(null);
        }
        emit("update:modelValue", "");
      },

      showDrop,
      closeDrop,
      onItemSelect,
    };
  },
});
</script>

<style lang="less">
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
  overflow: hidden;

  &_date,
  &_datetime-local {
    max-width: 220px;

    .vc-app_mobile & {
      max-width: 100%;
    }
  }

  &__field-wrapper {
    border: 1px solid var(--input-border-color);
    border-radius: var(--input-border-radius);
    background-color: var(--input-background-color);
  }

  &_error &__field-wrapper {
    border: 1px solid var(--input-border-color-error);
  }

  &__error {
    color: var(--input-border-color-error);
  }

  &__field {
    border: none;
    outline: none;
    height: var(--input-height);
    min-width: 0;
    box-sizing: border-box;

    &::-webkit-input-placeholder {
      color: var(--input-placeholder-color);
    }

    &::-moz-placeholder {
      color: var(--input-placeholder-color);
    }

    &::-ms-placeholder {
      color: var(--input-placeholder-color);
    }

    &::placeholder {
      color: var(--input-placeholder-color);
    }
  }

  &__clear {
    cursor: pointer;
    color: var(--input-clear-color);

    &:hover {
      color: var(--input-clear-color-hover);
    }
  }

  &__showhide {
    cursor: pointer;
    color: var(--input-placeholder-color);

    &:hover {
      color: var(--input-clear-color-hover);
    }
  }

  &__dropdown-wrap {
    position: relative;
  }

  &__dropdown-btn {
    color: var(--input-clear-color);
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    line-height: 20px;
    cursor: pointer;

    &_disabled {
      color: #7e8e9d;
      cursor: default;
    }
  }

  &__dropdown {
    position: absolute;
    background: #ffffff;
    box-shadow: 1px 1px 11px rgba(141, 152, 163, 0.6);
    border-radius: 3px;
    padding: 11px;
    width: 120px;
    box-sizing: border-box;
  }

  &__dropdown-title {
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 20px;
    color: #333333;
    padding: 0;
    margin: 0 0 7px;
  }

  &__dropdown-search {
    background: #ffffff;
    border: 1px solid #eaecf2;
    box-sizing: border-box;
    border-radius: 4px;
    height: 32px;
    width: 100%;
    outline: none;
  }

  &__dropdown-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
  }

  &__dropdown-selector {
    border: none;
    background: transparent;
    padding: 9px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    size: var(--font-size-l);
    border-radius: 3px;

    &:hover {
      background-color: #eff7fc;
    }

    &-active {
      background: #dfeef9;
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    background-color: #fafafa;
    color: #424242;
  }
}
</style>
