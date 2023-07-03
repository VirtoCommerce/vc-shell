<template>
  <div
    class="vc-editor"
    :class="[
      {
        'vc-code-editor_error': errorMessage,
        'vc-code-editor_disabled': disabled,
      },
    ]"
  >
    <!-- Editor label -->
    <VcLabel
      v-if="label"
      class="tw-mb-2"
      :required="required"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <!-- Editor field -->
    <v-ace-editor
      v-model:value="content"
      class="tw-border tw-border-solid tw-border-[color:var(--code-editor-border-color)] tw-rounded-[var(--code-editor-border-radius)] tw-h-[200px]"
      lang="html"
      theme="chrome"
      @input="onInput"
    />
    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-code-editor__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-chrome";
import { ref, onMounted } from "vue";
import { VcLabel, VcHint } from "./../../";

export interface Props {
  placeholder?: string;
  modelValue?: string | number | Date;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string;
}

export interface Emits {
  (event: "update:modelValue", value: string | number | Date | null | undefined): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits<Emits>();
const content = ref();

onMounted(() => {
  content.value = props.modelValue;
});

function onInput() {
  emit("update:modelValue", content.value);
}
</script>

<style lang="scss">
:root {
  --code-editor-border-radius: 3px;
  --code-editor-border-color: #d3dbe9;
  --code-editor-border-color-error: #f14e4e;
  --code-editor-placeholder-color: #a5a5a5;
}

.vc-code-editor {
  &__error {
    @apply tw-text-[color:var(--editor-border-color-error)] tw-mt-1;
  }

  &_error .ace_editor {
    @apply tw-border tw-border-solid tw-border-[color:var(--editor-border-color-error)];
  }
}
</style>
