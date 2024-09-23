<template>
  <div class="vc-file-upload__container">
    <div
      v-loading="loading"
      class="vc-file-upload__drop-zone"
      :class="[
        `vc-file-upload__drop-zone--${variant}`,
        {
          'vc-file-upload__drop-zone--dragging': isDragging,
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
      <VcIcon
        class="vc-file-upload__icon"
        :icon="icon"
        size="xxl"
      ></VcIcon>

      <div class="vc-file-upload__text">
        <span>{{ customText?.dragHere || t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.DRAG_HERE") }}</span>
        &nbsp;
        <br />
        <VcLink
          class="vc-file-upload__link"
          @click="toggleUploader"
        >
          {{ customText?.browse || t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.BROWSE") }}
        </VcLink>
      </div>

      <input
        ref="uploader"
        type="file"
        hidden
        :accept="accept"
        :multiple="multiple"
        :name="name"
        @change="upload"
      />
    </div>
    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-file-upload__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, unref } from "vue";
import { useField } from "vee-validate";
import { VcIcon, VcLink, VcHint } from "./../../";
import { useI18n } from "vue-i18n";
import { IValidationRules } from "./../../../../core/types";

export interface Props {
  variant?: "gallery" | "file-upload";
  loading?: boolean;
  accept?: string;
  multiple?: boolean;
  rules?: keyof IValidationRules | IValidationRules;
  name?: string;
  icon?: string;
  customText?: {
    dragHere: string;
    browse: string;
  };
}

export interface Emits {
  (event: "upload", files: FileList): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "gallery",
  accept: ".jpg, .png, .jpeg, .webp, .heic, .svg",
  name: "Gallery",
  icon: "fas fa-cloud-upload-alt",
});
const emit = defineEmits<Emits>();

defineSlots<{
  error: void;
}>();

const { t } = useI18n({ useScope: "global" });

const instance = getCurrentInstance();
const internalRules = unref(props.rules) || "";
const isDragging = ref(false);

const { errorMessage, handleChange, validate } = useField(
  `${props.name === "Gallery" ? instance?.uid : props.name}`,
  internalRules as IValidationRules,
);

const uploader = ref<HTMLInputElement | null>(null);

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
  if (uploader.value) {
    uploader.value.value = "";
    uploader.value.click();
  }
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
:root {
  --file-upload-border-color: var(--secondary-200);
  --file-upload-border-color-hover: var(--secondary-400);
  --file-upload-border-color-error: var(--base-error-color, var(--danger-500));
  --file-upload-border-radius: 6px;
  --file-upload-drag-bg: var(--primary-100);
  --file-upload-icon-color: var(--secondary-200);
  --file-upload-text-color: var(--neutrals-400);
  --file-upload-error-color: var(--base-error-color, var(--danger-500));
  --file-upload-background-color: var(--primary-50);
}

.vc-file-upload {
  &__container {
    @apply tw-flex tw-flex-col tw-flex-1;
  }

  &__drop-zone {
    @apply tw-relative tw-h-40 tw-box-border tw-border tw-border-dashed tw-p-4 tw-flex tw-flex-col tw-items-center tw-justify-center;
    @apply tw-border-[color:var(--file-upload-border-color)];
    @apply tw-rounded-lg;
    @apply tw-transition-colors tw-duration-300;

    &--gallery {
      @apply tw-w-40 tw-h-40;
    }

    &--file-upload {
      @apply tw-w-full tw-bg-[var(--file-upload-background-color)];
    }

    &--dragging {
      background-color: var(--file-upload-drag-bg) !important;
      border-style: solid !important;
      cursor: copy !important;
    }

    &:hover {
      @apply tw-border-[color:var(--file-upload-border-color-hover)] #{!important};
    }
  }

  &__icon {
    color: var(--file-upload-icon-color);
  }

  &__text {
    color: var(--file-upload-text-color);
    @apply tw-text-center tw-text-sm tw-mt-4;
  }

  &__link {
    @apply tw-text-sm tw-truncate tw-w-full;
  }

  &__error {
    color: var(--file-upload-error-color);
    @apply tw-mt-1;
  }
}
</style>
