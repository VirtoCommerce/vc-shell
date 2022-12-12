<template>
  <div
    class="vc-editor"
    :class="[
      {
        'vc-editor_error': errorMessage,
        'vc-editor_disabled': disabled
      },
    ]"
  >
    <!-- Editor label -->
    <VcLabel v-if="label" class="mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Editor field -->
    <v-ace-editor
      class="border border-solid border-[color:var(--editor-border-color)] rounded-[var(--editor-border-radius)]"
      v-model:value="content"
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
import {VAceEditor} from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-chrome";
import {ref, unref, watch} from "vue";

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

  errorMessage: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits(["update:modelValue"]);
const content = ref();
let initialValue = unref(props.modelValue);

watch(
    () => props.modelValue,
    (value) => {
        let init = unref(value);
        emit("update:modelValue", init);
    }
);

// Handle input event to propertly validate value and emit changes
function onInput() {
  emit("update:modelValue", content.value);
}
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
