<template>
  <div class="tw-flex tw-flex-col tw-flex-1">
    <div
      class="vc-file-upload tw-relative tw-h-[155px] tw-box-border tw-border tw-border-dashed tw-border-[#c8dbea] tw-rounded-[6px] tw-p-4 tw-flex tw-flex-col tw-items-center tw-justify-center"
      :class="[
        `vc-file-upload_${variant}`,
        {
          '!tw-bg-[#e8f1f9] !tw-border-solid tw-cursor-copy': isDragging,
        },
      ]"
      @drop.stop.prevent="onDrop"
      @drag.stop.prevent
      @dragstart.stop.prevent
      @dragend.stop.prevent
      @dragover.stop.prevent="dragOver"
      @dragenter.stop.prevent
      @dragleave.stop.prevent="dragLeave"
    >
      <VcLoading :active="loading"></VcLoading>
      <VcIcon
        class="tw-text-[#c8dbea]"
        icon="fas fa-cloud-upload-alt"
        size="xxl"
      ></VcIcon>

      <div class="tw-text-[#9db0be] tw-text-center tw-text-lg tw-leading-lg tw-mt-4">
        <span>Drag and drop file here or</span>&nbsp;
        <br />
        <VcLink @click="toggleUploader">browse your files</VcLink>
      </div>

      <input
        ref="uploader"
        type="file"
        hidden
        @change="upload"
        :accept="accept"
        :multiple="multiple"
        :name="name"
      />
    </div>
    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-input__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, unref } from "vue";
import { useField } from "vee-validate";
import { VcLoading, VcIcon, VcLink, VcHint } from "./../../";

export interface Props {
  variant?: "gallery" | "file-upload";
  loading?: boolean;
  accept?: string;
  multiple?: boolean;
  rules?: string | Record<string, unknown>;
  name?: string;
}

export interface Emits {
  (event: "upload", files: FileList): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "gallery",
  accept: ".jpg, .png, .jpeg",
  name: "Gallery",
});

const emit = defineEmits<Emits>();

const instance = getCurrentInstance();
// Prepare validation rules using required and rules props combination
let internalRules = unref(props.rules) || "";
const isDragging = ref(false);

// Prepare field-level validation
const { errorMessage, handleChange, validate } = useField(
  `${props.name === "Gallery" ? instance?.uid : props.name}`,
  internalRules
);

const uploader = ref();

const upload = async (event: Event) => {
  await handleChange(event.target);

  const isValid = await validate();

  if (isValid.valid) {
    const target = event.target as HTMLInputElement;
    const fileList = target.files;

    if (fileList && fileList.length) {
      emit("upload", fileList);
    }
  }
};

function toggleUploader() {
  uploader.value.value = "";
  uploader.value.click();
}

function onDrop(event: DragEvent) {
  dragLeave();
  const fileList = event.dataTransfer?.files;

  if (fileList && fileList.length) {
    emit("upload", fileList);
  }
}

function dragOver() {
  isDragging.value = true;
}

function dragLeave() {
  isDragging.value = false;
}
</script>

<style lang="scss">
.vc-file-upload {
  // variants
  &_gallery {
    @apply tw-w-[155px] tw-h-[155px];
  }

  &_file-upload {
    @apply tw-w-full tw-bg-[#f2f8fd];
  }
}
</style>
