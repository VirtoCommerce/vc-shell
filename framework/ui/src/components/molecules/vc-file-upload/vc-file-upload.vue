<template>
  <div
    class="
      vc-file-upload
      vc-padding_l
      vc-flex vc-flex-column
      vc-flex-align_center
      vc-flex-justify_center
    "
    :class="`vc-file-upload_${variant}`"
    @drop.stop.prevent="onDrop"
    @drag.stop.prevent
    @dragstart.stop.prevent
    @dragend.stop.prevent
    @dragover.stop.prevent
    @dragenter.stop.prevent
    @dragleave.stop.prevent
    v-if="!isUploaded"
    v-loading="loading"
  >
    <vc-icon
      class="vc-file-upload__icon"
      icon="fas fa-cloud-upload-alt"
      size="xxl"
    ></vc-icon>

    <div class="vc-file-upload__label vc-margin-top_l">
      <span>Drag and drop file here or</span>&nbsp;
      <br />
      <vc-link @click="$refs.uploader.click()">browse your files</vc-link>
    </div>

    <input
      ref="uploader"
      type="file"
      hidden
      @change="upload"
      :accept="accept"
    />
  </div>
  <div v-else>
    <VcUploadNotification
      :uploadActions="uploadActions"
      :uploadedFile="uploadedFile"
      :isUploaded="isUploaded"
    />
    <slot v-if="errorMessage" name="error">
      <vc-hint class="vc-input__error vc-margin-top_m vc-font-size_m">
        {{ errorMessage }}
      </vc-hint>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcUploadNotification from "./_internal/vc-file-upload-notification/vc-file-upload-notification.vue";

export default defineComponent({
  name: "VcFileUpload",

  components: {
    VcUploadNotification,
  },

  props: {
    variant: {
      type: String,
      enum: ["gallery", "import"],
      default: "gallery",
    },

    uploadedFile: {
      type: Object,
      default: () => ({}),
    },

    uploadActions: {
      type: Array,
      default: () => [],
    },

    isUploaded: {
      type: Boolean,
      default: false,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    loading: {
      type: Boolean,
      default: false,
    },

    accept: {
      type: String,
      default: ".jpg, .png, .jpeg",
    },
  },

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

      onDrop(event: DragEvent) {
        const fileList = event.dataTransfer?.files;

        if (fileList && fileList.length) {
          emit("upload", fileList);
        }
      },
    };
  },
});
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
