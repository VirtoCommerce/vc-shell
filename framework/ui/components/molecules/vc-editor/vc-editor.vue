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
    <VcLabel v-if="label" class="tw-mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Editor field -->
    <v-ace-editor
      class="tw-border tw-border-solid tw-border-[color:var(--editor-border-color)] tw-rounded-[var(--editor-border-radius)] tw-h-[200px]"
      v-model:value="content"
      lang="html"
      theme="chrome"
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
import { ref, unref, watch } from "vue";
import { VcEditorProps } from "@/ui/components/molecules/vc-editor/vc-editor-model";

const props = withDefaults(defineProps<VcEditorProps>(), {
  placeholder: "",
  modelValue: null,
  required: false,
  name: "Field",
});

const emit = defineEmits(["update:modelValue"]);
const content = ref();

watch(
  () => props.modelValue,
  (value) => {
    let init = unref(value);
    emit("update:modelValue", init);
  }
);

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
    @apply tw-text-[color:var(--editor-border-color-error)] tw-mt-1;
  }

  &_error .ace_editor {
    @apply tw-border tw-border-solid tw-border-[color:var(--editor-border-color-error)];
  }
}
</style>
