<template>
  <div
    class="vc-file-upload__container"
    :class="{ 'vc-file-upload__container--error': !!resolvedErrorMessage }"
  >
    <div
      class="vc-file-upload__drop-zone"
      :class="{
        'vc-file-upload__drop-zone--dragging': isDragging,
        'vc-file-upload__drop-zone--disabled': resolvedDisabled,
        'vc-file-upload__drop-zone--loading': loading,
        'vc-file-upload__drop-zone--mobile': isMobile,
      }"
      role="button"
      :tabindex="resolvedDisabled ? -1 : 0"
      :aria-label="customText?.dragHere || 'Upload files'"
      :aria-describedby="ariaDescribedBy"
      :aria-disabled="resolvedDisabled || undefined"
      :aria-required="ariaRequired"
      @drop.stop.prevent="onDrop"
      @drag.stop.prevent
      @dragstart.stop.prevent
      @dragend.stop.prevent
      @dragover.stop.prevent="dragOver"
      @dragenter.stop.prevent
      @dragleave.stop.prevent="dragLeave"
      @keydown.enter="toggleUploader"
      @keydown.space.prevent="toggleUploader"
    >
      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="vc-file-upload__loading"
      >
        <VcIcon
          icon="lucide-loader-2"
          size="xl"
          class="vc-file-upload__spinner"
        />
        <span class="vc-file-upload__loading-text">{{ t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.UPLOADING") }}</span>
      </div>

      <template v-else>
        <VcIcon
          class="vc-file-upload__icon"
          :icon="icon"
          size="xl"
        />

        <div class="vc-file-upload__text">
          <template v-if="isMobile">
            <VcLink
              class="vc-file-upload__link"
              @click="toggleUploader"
            >
              {{ customText?.browse || t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.TAP_TO_UPLOAD") }}
            </VcLink>
          </template>
          <template v-else>
            <span>{{ customText?.dragHere || t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.DRAG_HERE") }}</span>
            <br />
            <VcLink
              class="vc-file-upload__link"
              @click="toggleUploader"
            >
              {{ customText?.browse || t("COMPONENTS.MOLECULES.VC_FILE_UPLOAD.BROWSE") }}
            </VcLink>
          </template>
        </div>
      </template>

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
<script lang="ts" setup>
import { ref, unref, computed, type VNode } from "vue";
import { useField } from "vee-validate";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcLink } from "@ui/components/atoms/vc-link";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { useI18n } from "vue-i18n";
import { IValidationRules } from "@core/types";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types/form-field";
import { useResponsive } from "@framework/core/composables/useResponsive";

export interface Props extends IFormFieldProps {
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
  accept: ".jpg, .png, .jpeg, .webp, .heic, .svg",
  name: "Gallery",
  icon: "lucide-cloud-upload",
});
const emit = defineEmits<Emits>();

defineSlots<{
  error: (props: Record<string, never>) => VNode[];
}>();

const { t } = useI18n({ useScope: "global" });

const { fieldId, errorId, resolvedDisabled, resolvedName, ariaRequired, groupContext } = useFormField(props);

const internalRules = unref(props.rules) || "";
const isDragging = ref(false);
const { isMobile } = useResponsive();

const {
  errorMessage: veeErrorMessage,
  handleChange,
  validate,
} = useField(`${props.name === "Gallery" ? fieldId.value : props.name}`, internalRules as IValidationRules);

const resolvedErrorMessage = computed(() => props.errorMessage || veeErrorMessage.value);

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
  --file-upload-border-color: var(--secondary-300);
  --file-upload-border-color-hover: var(--secondary-400);
  --file-upload-border-color-dragover: var(--primary-400);
  --file-upload-border-color-error: var(--danger-500);
  --file-upload-border-width: 1.5px;
  --file-upload-border-radius: 6px;
  --file-upload-drag-bg: var(--primary-50);
  --file-upload-icon-color: var(--secondary-400);
  --file-upload-text-color: var(--secondary-500);
  --file-upload-error-color: var(--danger-500);
  --file-upload-error-ring-color: var(--danger-100);
  --file-upload-focus-ring-color: var(--primary-100);
}

.vc-file-upload {
  &__container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__container--error &__drop-zone {
    border-color: var(--file-upload-border-color-error);
    box-shadow: 0 0 0 3px var(--file-upload-error-ring-color);
  }

  &__drop-zone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    padding: 24px;
    gap: 8px;
    min-height: 120px;
    border-width: var(--file-upload-border-width);
    border-style: dashed;
    border-color: var(--file-upload-border-color);
    border-radius: var(--file-upload-border-radius);
    background: transparent;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

    &--dragging {
      cursor: copy;
      border-style: solid;
      border-color: var(--file-upload-border-color-dragover);
      background: var(--file-upload-drag-bg);
    }

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
      cursor: default;
    }

    &--loading {
      pointer-events: none;
    }

    &--mobile {
      border-color: transparent;
    }

    &:hover {
      border-color: var(--file-upload-border-color-hover);
    }

    &:focus-within {
      border-color: var(--file-upload-border-color-dragover);
      box-shadow: 0 0 0 3px var(--file-upload-focus-ring-color);
      outline: none;
    }
  }

  &__icon {
    color: var(--file-upload-icon-color);
  }

  &__text {
    color: var(--file-upload-text-color);
    text-align: center;
    font-size: 12px;
    line-height: 1.625;
  }

  &__link {
    font-size: 12px;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__spinner {
    color: var(--primary-500);
    animation: file-upload-spin 1s linear infinite;
  }

  &__loading-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--file-upload-text-color);
  }

  &__error {
    margin-top: 4px;
    --hint-error-color: var(--file-upload-error-color);
  }
}

@keyframes file-upload-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
