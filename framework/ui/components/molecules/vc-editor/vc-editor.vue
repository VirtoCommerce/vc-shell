<template>
  <div
    class="vc-editor"
    :class="{
      'vc-editor--error': errorMessage,
      'vc-editor--disabled': disabled,
    }"
  >
    <!-- Editor label -->
    <VcLabel
      v-if="label"
      class="vc-editor__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        {{ tooltip }}
      </template>
    </VcLabel>

    <!-- Editor field -->
    <QuillEditor
      :id="id"
      :key="`${id}-${disabled}`"
      ref="quillRef"
      :content="modelValue"
      class="quill-editor vc-editor__quill-editor"
      :class="{
        'vc-editor__quill-editor--disabled': disabled,
      }"
      theme="snow"
      :toolbar="toolbar"
      :modules="modules"
      content-type="html"
      :read-only="disabled"
      :placeholder="placeholder"
      :options="options"
      @ready="initializeQuill"
    />

    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-editor__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { ref, unref, onMounted, onUpdated, getCurrentInstance, Ref } from "vue";
import DOMPurify from "dompurify";
import ImageUploader from "quill-image-uploader";
import { VcLabel, VcHint } from "../..";

export interface Props {
  placeholder?: string;
  modelValue?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string;
  assetsFolder: string;
  multilanguage?: boolean;
  currentLanguage?: string;
  maxlength?: number;
}

export interface Emits {
  (event: "update:modelValue", value: string | number | Date | null | undefined): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const uid = getCurrentInstance()?.uid;
const id = `editor-${uid}`;

defineSlots<{
  error?: (props: any) => any;
}>();

const quillRef = ref(null) as Ref<typeof QuillEditor | null>;
const quill = ref();

const toolbar = {
  container: [
    { header: 1 },
    { header: 2 },
    "bold",
    "italic",
    "underline",
    "strike",
    "link",
    "image",
    "blockquote",
    { list: "ordered" },
    { list: "bullet" },
    { color: [] },
    { background: [] },
    "clean",
  ],
  handlers: {},
};

const options = {
  bounds: ".quill-editor",
};

const modules = {
  name: "imageUploader",
  module: ImageUploader,
  options: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const result = await fetch(`/api/assets?folderUrl=/${props.assetsFolder}`, {
        method: "POST",
        body: formData,
      });

      const response = await result.json();
      if (response) {
        return response[0].url;
      }
    },
  },
};

onMounted(() => {
  removeBlankClass();
});

onUpdated(() => {
  removeBlankClass();
});

function initializeQuill() {
  quill.value = quillRef.value?.getQuill();
  if (props.modelValue) {
    quill.value.root.innerHTML = DOMPurify.sanitize(unref(props.modelValue));
  }

  quill.value.on("text-change", onTextChange);
}

function removeBlankClass() {
  // fixes quill editor placeholder visibility issue when content is not empty
  const editor = document.getElementById(id)?.querySelector(".ql-editor.ql-blank");
  if (editor && props.modelValue) {
    editor.classList.remove("ql-blank");
  }
}

function onTextChange() {
  const len = quill.value.getLength();
  if (props.maxlength !== undefined && len > props.maxlength) {
    quill.value.deleteText(props.maxlength, len);
  }

  if (quill.value.getText().trim() !== props.modelValue?.trim()) {
    if (quill.value.root.innerHTML === "<p><br></p>") {
      emit("update:modelValue", "");
    } else {
      const sanitizedContent = DOMPurify.sanitize(quill.value.root.innerHTML);
      emit("update:modelValue", sanitizedContent);
    }
  }
}

defineExpose({
  quillRef,
});
</script>

<style lang="scss">
:root {
  --editor-border-radius: 3px;
  --editor-border-color: var(--secondary-200);
  --editor-border-color-error: var(--base-error-color, var(--danger-500));
  --editor-disabled-bg: var(--neutrals-50);
  --editor-disabled-text: var(--neutrals-400);
  --editor-placeholder-color: var(--neutrals-400);
}

.vc-editor {
  & {
    @apply tw-flex tw-flex-col;
  }

  &--disabled {
    @apply tw-opacity-50 tw-cursor-not-allowed;
  }

  &__label {
    @apply tw-mb-2;
  }

  &__quill-editor {
    @apply tw-border tw-border-solid tw-border-[color:var(--editor-border-color)] tw-rounded-b-[var(--editor-border-radius)] tw-h-[200px];
    transition:
      background 0.3s,
      color 0.3s,
      cursor 0.3s;

    &--disabled {
      @apply tw-bg-[color:var(--editor-disabled-bg)] tw-text-[color:var(--editor-disabled-text)] tw-cursor-default;
    }

    &.vc-editor--error {
      @apply tw-border-[color:var(--editor-border-color-error)];
    }
  }

  &__error {
    @apply tw-text-[color:var(--editor-border-color-error)] tw-mt-1;
  }
}

.quill-editor .ql-editor {
  &.ql-blank:before {
    color: var(--editor-placeholder-color);
    content: attr(data-placeholder);
    font-style: inherit;
    left: 15px;
    pointer-events: none;
    position: absolute;
    right: 15px;
  }
}

.quill-editor {
  & .ql-tooltip {
    display: flex;
    flex-flow: wrap;

    &.ql-hidden {
      display: none !important;
    }
  }
}

.ql-language.ql-picker .ql-picker-label:before {
  padding-right: 18px;
  content: attr(data-value);
}

.ql-language.ql-picker .ql-picker-item:before {
  content: attr(data-value);
}

.ql-toolbar,
.quill-editor {
  border-color: var(--editor-border-color) !important;
}
</style>
