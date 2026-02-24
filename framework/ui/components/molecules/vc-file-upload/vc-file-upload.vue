<template>
  <div
    class="vc-file-upload__container"
    :class="{ 'vc-file-upload__container--error': !!resolvedErrorMessage }"
  >
    <div
      v-loading="loading"
      class="vc-file-upload__drop-zone"
      :class="[
        `vc-file-upload__drop-zone--${variant}`,
        {
          'vc-file-upload__drop-zone--dragging': isDragging,
          'vc-file-upload__drop-zone--disabled': resolvedDisabled,
        },
      ]"
      @drop.stop.prevent="onDrop"
      @drag.stop.prevent
      @dragstart.stop.prevent
      @dragend.stop.prevent
      @dragover.stop.prevent="dragOver"
      @dragenter.stop.prevent
      @dragleave.stop.prevent="dragLeave"
      role="button"
      :tabindex="resolvedDisabled ? -1 : 0"
      :aria-label="customText?.dragHere || 'Upload files'"
      :aria-describedby="ariaDescribedBy"
      :aria-disabled="resolvedDisabled || undefined"
      :aria-required="ariaRequired"
      @keydown.enter="toggleUploader"
      @keydown.space.prevent="toggleUploader"
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
        :name="resolvedName"
        :disabled="resolvedDisabled"
        @change="upload"
      />
    </div>
    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="resolvedErrorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-file-upload__error"
            :error="true"
          >
            {{ resolvedErrorMessage }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, unref, computed } from "vue";
import { useField } from "vee-validate";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcLink } from "@ui/components/atoms/vc-link";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { useI18n } from "vue-i18n";
import { IValidationRules } from "@core/types";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types/form-field";

export interface Props extends IFormFieldProps {
  variant?: "gallery" | "file-upload";
  loading?: boolean;
  accept?: string;
  multiple?: boolean;
  rules?: keyof IValidationRules | IValidationRules;
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
  icon: "lucide-cloud-upload",
});
const emit = defineEmits<Emits>();

defineSlots<{
  error: (props: any) => any;
}>();

const { t } = useI18n({ useScope: "global" });

const {
  fieldId,
  errorId,
  resolvedDisabled,
  resolvedName,
  ariaRequired,
  groupContext,
} = useFormField(props);

const internalRules = unref(props.rules) || "";
const isDragging = ref(false);

const { errorMessage: veeErrorMessage, handleChange, validate } = useField(
  `${props.name === "Gallery" ? fieldId.value : props.name}`,
  internalRules as IValidationRules,
);

const resolvedErrorMessage = computed(
  () => props.errorMessage || veeErrorMessage.value,
);

const ariaDescribedBy = computed(() => {
  const ids = new Set<string>();

  if (groupContext?.describedBy.value) {
    groupContext.describedBy.value.split(/\s+/).forEach((id) => ids.add(id));
  }

  if (resolvedErrorMessage.value) {
    ids.add(errorId.value);
  }

  return ids.size ? Array.from(ids).join(" ") : undefined;
});

const uploader = ref<HTMLInputElement | null>(null);

const upload = async (event: Event) => {
  if (resolvedDisabled.value) return;

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
  if (resolvedDisabled.value) return;
  if (uploader.value) {
    uploader.value.value = "";
    uploader.value.click();
  }
}

function onDrop(event: DragEvent) {
  if (resolvedDisabled.value) return;
  dragLeave();
  const fileList = event.dataTransfer?.files;

  if (fileList && fileList.length) {
    emit("upload", fileList);
  }
}

function dragOver() {
  if (resolvedDisabled.value) return;
  isDragging.value = true;
}

function dragLeave() {
  isDragging.value = false;
}
</script>

<style lang="scss">
:root {
  --file-upload-border-color: var(--neutrals-200);
  --file-upload-border-color-hover: var(--neutrals-400);
  --file-upload-border-color-dragover: var(--primary-500);
  --file-upload-border-color-error: var(--danger-500);
  --file-upload-border-radius: 6px;
  --file-upload-drag-bg: var(--neutrals-100);
  --file-upload-icon-color: var(--neutrals-400);
  --file-upload-text-color: var(--neutrals-400);
  --file-upload-error-color: var(--danger-500);
  --file-upload-error-ring-color: rgba(239, 68, 68, 0.2);
  --file-upload-background-color: transparent;
  --file-upload-focus-ring-color: rgba(59, 130, 246, 0.3);
}

.vc-file-upload {
  &__container {
    @apply tw-flex tw-flex-col tw-flex-1;
  }

  &__container--error &__drop-zone {
    @apply tw-border-[color:var(--file-upload-border-color-error)]
      tw-ring-[3px] tw-ring-[color:var(--file-upload-error-ring-color)];
  }

  &__drop-zone {
    @apply tw-relative tw-h-40 tw-box-border tw-border tw-border-dashed tw-p-4 tw-flex tw-flex-col tw-items-center tw-justify-center
      tw-border-[color:var(--file-upload-border-color)]
      tw-rounded-[var(--file-upload-border-radius)]
      tw-transition-[color,border-color,box-shadow] tw-duration-200
      tw-bg-[color:var(--file-upload-background-color)]
      tw-outline-none;

    &--gallery {
      @apply tw-w-40 tw-h-40;
    }

    &--file-upload {
      @apply tw-w-full;
    }

    &--dragging {
      @apply tw-bg-[color:var(--file-upload-drag-bg)] tw-border-solid tw-cursor-copy
        tw-border-[color:var(--file-upload-border-color-dragover)];
    }

    &--disabled {
      @apply tw-opacity-50 tw-pointer-events-none tw-cursor-default;
    }

    &:hover {
      @apply tw-border-[color:var(--file-upload-border-color-hover)];
    }

    &:focus-within {
      @apply tw-border-primary-500
        tw-ring-[3px] tw-ring-[color:var(--file-upload-focus-ring-color)]
        tw-outline-none;
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
    @apply tw-mt-1 [--hint-error-color:var(--file-upload-error-color)];
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    @apply tw-transition-all tw-duration-[250ms] tw-ease-out;
  }

  .slide-up-enter-from {
    @apply tw-opacity-0 tw-translate-y-[5px];
  }

  .slide-up-leave-to {
    @apply tw-opacity-0 tw--translate-y-[5px];
  }
}
</style>
