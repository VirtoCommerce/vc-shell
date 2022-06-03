<template>
  <div
    class="relative h-[155px] box-border border border-dashed border-[#c8dbea] rounded-[6px] p-2 p-4 flex flex-col items-center justify-center"
    :class="`vc-file-upload_${variant}`"
    @drop.stop.prevent="onDrop"
    @drag.stop.prevent
    @dragstart.stop.prevent
    @dragend.stop.prevent
    @dragover.stop.prevent
    @dragenter.stop.prevent
    @dragleave.stop.prevent
  >
    <VcLoading :active="loading"></VcLoading>
    <VcIcon
      class="text-[#c8dbea]"
      icon="fas fa-cloud-upload-alt"
      size="xxl"
    ></VcIcon>

    <div class="text-[#9db0be] text-center text-lg leading-lg mt-4">
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
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
defineProps({
  variant: {
    type: String,
    enum: ["gallery", "file-upload"],
    default: "gallery",
  },

  loading: {
    type: Boolean,
    default: false,
  },

  accept: {
    type: String,
    default: ".jpg, .png, .jpeg",
  },

  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["upload"]);

const uploader = ref();
const upload = (event: InputEvent) => {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;

  if (fileList && fileList.length) {
    emit("upload", fileList);
  }
};

function toggleUploader() {
  uploader.value.value = "";
  uploader.value.click();
}

function onDrop(event: DragEvent) {
  const fileList = event.dataTransfer?.files;

  if (fileList && fileList.length) {
    emit("upload", fileList);
  }
}
</script>

<style lang="scss">
.vc-file-upload {
  // variants
  &_gallery {
    @apply w-[155px] h-[155px];
  }

  &_file-upload {
    @apply w-full bg-[#f2f8fd];
  }
}
</style>
