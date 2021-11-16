<template>
  <div
    class="vc-textarea"
    :class="{ 'vc-textarea_error': error, 'vc-textarea_disabled': disabled }"
  >
    <!-- Textarea label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </vc-label>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper vc-flex vc-flex-align_stretch">
      <textarea
        class="vc-textarea__field vc-padding-horizontal_m vc-padding-vertical_s"
        :placeholder="placeholder"
        :value="internalValue"
        :disabled="disabled"
        @input="onInput"
      ></textarea>
    </div>

    <slot v-if="errorMessage" name="error">
      <vc-hint class="vc-textarea__error vc-margin-top_xs">
        {{ errorMessage }}
      </vc-hint>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, unref } from "vue";
import { useField } from "vee-validate";
import VcLabel from "..//vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";

export default defineComponent({
  name: "VcTextarea",

  components: {
    VcLabel,
  },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: String,
      default: undefined,
    },

    required: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
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
    const {
      value: internalValue,
      errorMessage,
      handleChange,
    } = useField(props.name, internalRules, {
      initialValue: props.modelValue,
      label: props.label,
    });

    return {
      internalValue,
      errorMessage,

      // Handle input event to propertly validate value and emit changes
      onInput(e: InputEvent) {
        const newValue = (e.target as HTMLInputElement).value;
        handleChange(newValue);
        emit("update:modelValue", newValue);
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --textarea-height: 120px;
  --textarea-border-color: #d3dbe9;
  --textarea-border-color-error: #f14e4e;
  --textarea-border-radius: 3px;
  --textarea-background-color: #ffffff;
  --textarea-placeholder-color: #a5a5a5;
}

.vc-textarea {
  &__field-wrapper {
    border: 1px solid var(--textarea-border-color);
    border-radius: var(--textarea-border-radius);
    box-sizing: border-box;
    background-color: var(--textarea-background-color);
  }

  &_error &__field-wrapper {
    border: 1px solid var(--textarea-border-color-error);
  }

  &__error {
    color: var(--textarea-border-color-error);
  }

  &__field {
    width: 100%;
    resize: vertical;
    box-sizing: border-box;
    border: none;
    outline: none;
    min-height: var(--textarea-height);
    -webkit-placeholder-color: var(--textarea-placeholder-color);
  }
}
</style>
