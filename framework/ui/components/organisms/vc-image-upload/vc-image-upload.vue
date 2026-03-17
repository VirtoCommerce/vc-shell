<template>
  <div class="vc-image-upload">
    <!-- Has image: tile with tray -->
    <VcImageTile
      v-if="image?.url"
      :src="image.url"
      :alt="image.altText || image.name || ''"
      :name="image.name"
      image-fit="cover"
      :actions="resolvedActions"
      @preview="onPreviewClick"
      @remove="emit('remove', image!)"
    />

    <!-- No image: show upload zone -->
    <VcFileUpload
      v-else-if="!disabled"
      :icon="icon"
      :multiple="false"
      :rules="rules"
      :name="name"
      :loading="loading"
      :accept="accept"
      :custom-text="placeholderText"
      @upload="(files: FileList) => emit('upload', files)"
    />

    <!-- Disabled + no image -->
    <div
      v-else
      class="vc-image-upload__empty"
    >
      <VcHint>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.GALLERY_IS_EMPTY") }}</VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ICommonAsset, IValidationRules } from "@core/types";
import { VcFileUpload } from "@ui/components/molecules/vc-file-upload";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { VcImageTile } from "@ui/components/molecules/vc-image-tile";
import { useI18n } from "vue-i18n";
import { useGalleryPreview } from "@ui/components/organisms/vc-gallery/composables/useGalleryPreview";

export interface Props {
  image?: ICommonAsset;
  disabled?: boolean;
  loading?: boolean;
  accept?: string;
  rules?: keyof IValidationRules | IValidationRules;
  name?: string;
  icon?: string;
  placeholder?: { text: string; link: string };
  previewable?: boolean;
  removable?: boolean;
}

export interface Emits {
  (event: "upload", files: FileList): void;
  (event: "remove", image: ICommonAsset): void;
}

const props = withDefaults(defineProps<Props>(), {
  accept: ".jpg,.png,.jpeg,.webp,.heic,.svg",
  name: "Image",
  icon: "lucide-cloud-upload",
  previewable: true,
  removable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

const imagesArray = computed(() => (props.image ? [props.image] : []));
const preview = useGalleryPreview(imagesArray);

const resolvedActions = computed(() => ({
  preview: props.previewable,
  remove: props.removable && !props.disabled,
}));

const placeholderText = computed(() =>
  props.placeholder
    ? { dragHere: props.placeholder.text, browse: props.placeholder.link }
    : undefined,
);

function onPreviewClick() {
  if (props.previewable && props.image) {
    preview.openPreview(0);
  }
}
</script>

<style lang="scss">
.vc-image-upload {
  max-width: 200px;

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-items-center;
  }
}
</style>
