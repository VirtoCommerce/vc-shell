<template>
  <div
    class="vc-input"
    :class="[
      `vc-input_${type}`,
      {
        'vc-input_clearable': clearable,
        'vc-input_error': error,
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
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      />

      <!-- Input clear button -->
      <div
        v-if="clearable && modelValue && !disabled && type !== 'password'"
        class="
          vc-input__clear
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
        @click="onReset"
      >
        <vc-icon size="s" icon="fas fa-times"></vc-icon>
      </div>

      <div
        class="
          vc-input__showhide
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
        v-if="type === 'password' && internalType === 'password'"
        @click="internalType = 'text'"
      >
        <vc-icon size="s" icon="fas fa-eye-slash"></vc-icon>
      </div>

      <div
        class="
          vc-input__showhide
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
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
import { defineComponent, ref, unref, watch } from "vue";
import { useField } from "vee-validate";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";

export default defineComponent({
  name: "VcInput",

  components: {
    VcIcon,
    VcLabel,
  },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: String,
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
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const internalType = ref(unref(props.type));

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

    // Prepare field-level validation
    const { errorMessage, handleChange } = useField(props.name, internalRules, {
      initialValue: props.modelValue,
    });

    watch(
      () => props.modelValue,
      (value) => {
        handleChange(value);
      }
    );

    return {
      internalType,
      errorMessage,

      // Handle input event to propertly validate value and emit changes
      onInput(e: InputEvent) {
        const newValue = (e.target as HTMLInputElement).value;
        emit("update:modelValue", newValue);
      },

      // Handle input event to propertly reset value and emit changes
      onReset() {
        emit("update:modelValue", "");
      },
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
    -webkit-placeholder-color: var(--input-placeholder-color);
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
}
</style>
