<template>
  <div
    class="vc-file-upload vc-padding_l vc-flex vc-flex-column vc-flex-align_center vc-flex-justify_center"
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
      class="vc-file-upload__icon"
      icon="fas fa-cloud-upload-alt"
      size="xxl"
    ></VcIcon>

    <div class="vc-file-upload__label vc-margin-top_l">
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
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
defineProps({
  variant: {
    type: String,
    enum: ["gallery", "import"],
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

<style lang="less">
.vc-file-upload {
  position: relative;
  height: 145px;
  box-sizing: border-box;
  border: 1px dashed #c8dbea;
  border-radius: 6px;
  padding: var(--padding-s);

  &__icon {
    color: #c8dbea;
  }

  &__label {
    color: #9db0be;
    text-align: center;
    font-size: var(--font-size-l);
    line-height: var(--line-height-l);
  }

  // variants
  &_gallery {
    width: 155px;
    height: 155px;
  }

  &_file-upload {
    width: 100%;
    background-color: #f2f8fd;
  }
}
</style>
