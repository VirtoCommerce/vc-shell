<template>
  <div
    class="vc-editor"
    :class="[
      {
        'vc-editor_error': errorMessage,
        'vc-editor_disabled': disabled,
      },
    ]"
  >
    <!-- Editor label -->
    <VcLabel v-if="label" class="mb-s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Editor field -->
    <v-ace-editor
      class="border border-solid border-[color:var(--editor-border-color)] rounded-[var(--editor-border-radius)]"
      v-model:value="value"
      lang="html"
      theme="chrome"
      style="height: 200px"
      @input="onInput"
    />
    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-editor__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-chrome";
import { getCurrentInstance, ref, unref, watch } from "vue";
import { useField } from "vee-validate";
import { IValidationRules } from "../../../typings";

const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },

  modelValue: {
    type: [String, Number, Date],
    default: null,
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
const content = ref();
const instance = getCurrentInstance();
let initialValue = unref(props.modelValue);

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
const { errorMessage, handleChange, value } = useField(
  `${instance?.uid || props.name}`,
  internalRules,
  {
    initialValue,
  }
);

// Handle input event to propertly validate value and emit changes
function onInput() {
  emit("update:modelValue", value.value);
}

watch(
  () => props.modelValue,
  (value) => {
    let initialValue = unref(value);
    handleChange(initialValue);
  }
);
</script>

<style lang="scss">
:root {
  --editor-border-radius: 3px;
  --editor-border-color: #d3dbe9;
  --editor-border-color-error: #f14e4e;
  --editor-placeholder-color: #a5a5a5;
}

.vc-editor {
  &__error {
    @apply text-[color:var(--editor-border-color-error)] mt-1;
  }

  &_error .ace_editor {
    @apply border border-solid border-[color:var(--editor-border-color-error)];
  }
}
</style>
