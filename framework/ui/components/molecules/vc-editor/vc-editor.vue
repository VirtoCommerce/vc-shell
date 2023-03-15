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
    <VcLabel
      v-if="label"
      class="tw-mb-2"
      :required="required"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        v-slot:tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <!-- Editor field -->
    <QuillEditor
      class="quill-editor tw-border tw-border-solid tw-border-[color:var(--editor-border-color)] tw-rounded-b-[var(--editor-border-radius)] tw-h-[200px]"
      v-model:content="content"
      theme="snow"
      toolbar="minimal"
      content-type="html"
      @update:content="onInput"
      :read-only="disabled"
    />
    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-editor__error !tw-text-[color:var(--editor-border-color-error)] tw-mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { ref, unref, watch } from "vue";
import { editorEmits, editorProps } from "./vc-editor-model";

const props = defineProps({ ...editorProps });

const emit = defineEmits({ ...editorEmits });
const content = ref();

watch(
  () => props.modelValue,
  (value) => {
    content.value = unref(value);
  },
  { immediate: true }
);

function onInput() {
  if (isContentChangedOnMount(content.value)) {
    if (isQuillEmpty(content.value)) {
      emit("update:modelValue", null);
    } else {
      emit("update:modelValue", content.value);
    }
  }
}

function isQuillEmpty(value: string) {
  if (value.replace(/<(.|\n)*?>/g, "").trim().length === 0) {
    return true;
  }
  return false;
}

function isContentChangedOnMount(value: string) {
  if (value.replace(/<(.|\n)*?>/g, "").trim() === props.modelValue) {
    return false;
  }
  return true;
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
  &_error .quill-editor {
    @apply tw-border tw-border-solid tw-border-[color:var(--editor-border-color-error)] #{!important};
  }
}
</style>
