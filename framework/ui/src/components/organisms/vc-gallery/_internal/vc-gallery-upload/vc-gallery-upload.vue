<template>
  <div
    class="
      vc-gallery-upload
      vc-padding_l
      vc-flex vc-flex-column
      vc-flex-align_center
      vc-flex-justify_center
    "
  >
    <vc-icon
      class="vc-gallery-upload__icon"
      icon="fas fa-cloud-upload-alt"
      size="xxl"
    ></vc-icon>

    <div class="vc-gallery-upload__label vc-margin-top_l">
      <span>Drag and drop file here or</span>&nbsp;
      <vc-link @click="$refs.uploader.click()">browse your files</vc-link>
    </div>

    <input ref="uploader" type="file" hidden @change="upload" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcGalleryUpload",

  emits: ["upload"],

  setup(_props, { emit }) {
    const upload = (event: InputEvent) => {
      const target = event.target as HTMLInputElement;
      const fileList = target.files;

      if (fileList && fileList.length) {
        emit("upload", fileList);
      }
    };

    return {
      upload,
    };
  },
});
</script>

<style lang="less">
.vc-gallery-upload {
  position: relative;
  width: 155px;
  height: 155px;
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
}
</style>
