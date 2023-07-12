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
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <!-- Editor field -->
    <QuillEditor
      :key="disabled.toString()"
      v-model:content="content"
      class="quill-editor tw-border tw-border-solid tw-border-[color:var(--editor-border-color)] tw-rounded-b-[var(--editor-border-radius)] tw-h-[200px]"
      :class="{ 'tw-bg-[#fafafa] tw-text-[#424242] tw-cursor-default': disabled }"
      theme="snow"
      :toolbar="toolbar"
      :modules="modules"
      content-type="html"
      :read-only="disabled"
      @update:content="onInput"
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
import { useUser } from "./../../../../core/composables";
import { ref, unref, watch } from "vue";
import ImageUploader from "quill-image-uploader";
import { VcLabel, VcHint } from "./../../";

export interface Props {
  placeholder?: string;
  modelValue?: string | number | Date;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string;
  assetsFolder: string;
}

export interface Emits {
  (event: "update:modelValue", value: string | number | Date | null | undefined): void;
}

const { getAccessToken } = useUser();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits<Emits>();

const content = ref();
const toolbar = [
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
];

const modules = {
  name: "imageUploader",
  module: ImageUploader,
  options: {
    upload: async (file: File) => {
      const authToken = await getAccessToken();

      const formData = new FormData();
      formData.append("image", file);

      const result = await fetch(`/api/assets?folderUrl=/catalog/${props.assetsFolder}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const response = await result.json();
      if (response) {
        return response[0].url;
      }
    },
  },
};

watch(
  () => props.modelValue,
  (value) => {
    content.value = unref(value);
  },
  { immediate: true }
);

function onInput() {
  if (isQuillEmpty(content.value)) {
    emit("update:modelValue", null);
  } else {
    emit("update:modelValue", content.value);
  }
}

function isQuillEmpty(value: string) {
  if (value.replace(/<(.|\n)*?>/g, "").trim().length === 0) {
    return true;
  }
  return false;
}
</script>

<style lang="scss">
:root {
  --editor-border-radius: 3px;
  --editor-border-color: #d3dbe9;
  --editor-border-color-error: #f14e4e;
  --editor-placeholder-color: #a5a5a5;

  --editor-scroll-width: 8px;
  --editor-scroll-color-hover: #cce4f5;
}

.vc-editor {
  &_error .quill-editor {
    @apply tw-border tw-border-solid tw-border-[color:var(--editor-border-color-error)] #{!important};
  }

  .quill-editor .ql-editor {
    &::-webkit-scrollbar {
      @apply tw-w-[var(--editor-scroll-width)] tw-bg-transparent;
    }

    &::-webkit-scrollbar-track {
      @apply tw-bg-transparent;
    }

    &::-webkit-scrollbar-thumb {
      @apply tw-bg-[color:var(--editor-scroll-color)]
      tw-rounded-[calc(var(--editor-scroll-width)/2)]
      tw-overflow-x-hidden
      hover:tw-bg-[color:var(--editor-scroll-color-hover)];
    }
  }
}
</style>
