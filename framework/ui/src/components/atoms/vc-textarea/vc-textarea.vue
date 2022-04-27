<template>
  <div
    class="vc-textarea"
    :class="{
      'vc-textarea_error': errorMessage,
      'vc-textarea_disabled': disabled,
    }"
  >
    <!-- Textarea label -->
    <VcLabel v-if="label" class="mb-s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper vc-flex vc-flex-align_stretch">
      <textarea
        class="vc-textarea__field vc-padding-horizontal_m vc-padding-vertical_s"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      ></textarea>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-textarea__error vc-margin-top_xs">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { unref, watch, getCurrentInstance } from "vue";
import { useField } from "vee-validate";
import VcLabel from "..//vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";

const props = defineProps({
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
});

const emit = defineEmits(["update:modelValue"]);

const instance = getCurrentInstance();

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
const { errorMessage, handleChange } = useField(
  `${instance?.uid || props.name}`,
  internalRules,
  {
    initialValue: props.modelValue,
    label: props.label,
  }
);

watch(
  () => props.modelValue,
  (value) => {
    handleChange(value);
  }
);

// Handle input event to propertly validate value and emit changes
function onInput(e: InputEvent) {
  const newValue = (e.target as HTMLInputElement).value;
  emit("update:modelValue", newValue);
}
</script>

<style lang="scss">
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
    @apply border border-solid
      border-[color:var(--textarea-border-color)]
      rounded-[var(--textarea-border-radius)]
      box-border
      bg-[color:var(--textarea-background-color)];
  }

  &_error &__field-wrapper {
    @apply border border-solid border-[color:var(--textarea-border-color-error)];
  }

  &__error {
    @apply text-[color:var(--textarea-border-color-error)];
  }

  &__field {
    @apply w-full resize-y box-border border-none outline-none min-h-[var(--textarea-height)] placeholder:text-[color:var(--textarea-placeholder-color)];

    &::-webkit-input-placeholder {
      @apply text-[color:var(--textarea-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply text-[color:var(--textarea-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply text-[color:var(--textarea-placeholder-color)];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply bg-[#fafafa] text-[#424242];
  }
}
</style>
