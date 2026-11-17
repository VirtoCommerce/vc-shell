<template>
  <div class="assets-details__header">
    <div class="assets-details__media">
      <div
        v-if="showImage"
        class="assets-details__preview"
        data-test-id="assets-details-preview"
      >
        <VcImage
          :src="asset.url"
          size="l"
          background="contain"
          clickable
          :alt="t('ASSETS.PAGES.DETAILS.OPEN_PREVIEW')"
          @click="openPreview"
        />
      </div>
      <div
        v-else
        class="assets-details__tile"
        data-test-id="assets-details-tile"
      >
        <VcIcon
          icon="lucide-file"
          class="assets-details__tile-icon"
        />
        <span
          class="assets-details__tile-ext"
          :style="{ backgroundColor: getExtensionColor(asset.name) }"
        >
          {{ extension }}
        </span>
      </div>
      <!-- VcImage paints a background, so this hidden probe reports load errors and the natural size. -->
      <img
        v-if="showImage"
        :key="version"
        :src="asset.url"
        alt=""
        class="tw-hidden"
        @load="onImageLoad"
        @error="onImageError"
      />

      <div class="assets-details__identity">
        <div
          class="assets-details__title"
          data-test-id="assets-details-title"
        >
          {{ asset.name }}
        </div>
        <div class="assets-details__chips">
          <span class="assets-details__chip">{{ extension }}</span>
          <span
            v-if="asset.size != null"
            class="assets-details__chip"
            >{{ readableSize(asset.size) }}</span
          >
          <span
            v-if="dimensions"
            class="assets-details__chip"
            >{{ dimensions }}</span
          >
        </div>
      </div>
    </div>

    <div
      v-if="link"
      class="assets-details__url"
      data-test-id="assets-details-url"
    >
      <VcIcon
        icon="lucide-link"
        size="s"
        class="assets-details__url-icon"
      />
      <span
        class="assets-details__url-text"
        :title="link"
        >{{ link }}</span
      >
      <button
        type="button"
        class="assets-details__copy"
        data-test-id="assets-details-copy"
        :aria-label="t('ASSETS.PAGES.DETAILS.FIELDS.COPY')"
        :title="t('ASSETS.PAGES.DETAILS.FIELDS.COPY')"
        @click="emit('copy')"
      >
        <VcIcon
          icon="lucide-copy"
          size="s"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { getExtensionColor, isImage, readableSize } from "@core/utilities/assets";
import { safeAbsoluteUrl } from "@modules/assets/components/assets-details/_internal/safe-absolute-url";
import { fileLabel } from "@modules/assets/components/assets-details/_internal/file-label";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcImage } from "@ui/components/atoms/vc-image";

const props = defineProps<{ asset: AssetLike }>();
const emit = defineEmits<{
  dimensions: [value: string | undefined];
  copy: [];
}>();

const { t } = useI18n({ useScope: "global" });

const link = computed(() => (props.asset.url ? safeAbsoluteUrl(props.asset.url) : undefined));
const extension = computed(() => fileLabel(props.asset.name));

// An overwrite keeps the url but changes the date, so both identify the file's content.
const version = computed(() => `${props.asset.url ?? ""}|${props.asset.modifiedDate ?? ""}`);

const dimensions = ref<string>();
// A missing or blocked image shows the extension tile instead of a broken image.
const imageFailed = ref(false);
const showImage = computed(() => !!props.asset.url && isImage(props.asset.name) && !imageFailed.value);

function setDimensions(value: string | undefined) {
  dimensions.value = value;
  emit("dimensions", value);
}

watch(version, () => {
  imageFailed.value = false;
  setDimensions(undefined);
});

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.naturalWidth && img.naturalHeight) setDimensions(`${img.naturalWidth} × ${img.naturalHeight}`);
}

function onImageError() {
  imageFailed.value = true;
  setDimensions(undefined);
}

function openPreview() {
  if (link.value) window.open(link.value, "_blank", "noopener");
}
</script>

<style lang="scss">
.assets-details__header {
  @apply tw-flex tw-flex-col tw-gap-4;
}

.assets-details__media {
  @apply tw-flex tw-items-center tw-gap-3.5;
}

.assets-details__preview,
.assets-details__tile {
  @apply tw-flex tw-flex-none tw-items-center tw-justify-center tw-w-24 tw-h-24;
  @apply tw-rounded-md tw-overflow-hidden;
  @apply tw-border tw-border-solid tw-border-[color:var(--assets-details-border)];
}

.assets-details__preview {
  background: repeating-conic-gradient(
      var(--assets-details-checker-dark) 0 25%,
      var(--assets-details-checker-light) 0 50%
    )
    0 0 / 16px 16px;
}

.assets-details__tile {
  @apply tw-flex-col tw-gap-1.5;
  @apply tw-bg-[color:var(--assets-details-tile-background)];
}

.assets-details__tile-icon {
  @apply tw-w-[34px] tw-h-[34px] tw-text-[color:var(--assets-details-muted-color)];
}

.assets-details__tile-ext {
  @apply tw-px-[7px] tw-py-[3px] tw-rounded tw-text-[11px] tw-font-bold tw-leading-none tw-tracking-[0.03em];
  @apply tw-text-[color:var(--assets-details-tile-ext-color)];
}

.assets-details__identity {
  @apply tw-min-w-0;
}

.assets-details__title {
  @apply tw-text-base tw-font-semibold tw-text-[color:var(--assets-details-title-color)];
  overflow-wrap: anywhere;
}

.assets-details__chips {
  @apply tw-flex tw-flex-wrap tw-gap-1.5 tw-mt-1.5;
}

.assets-details__chip {
  @apply tw-px-2 tw-py-0.5 tw-rounded-full tw-text-xs;
  @apply tw-bg-[color:var(--assets-details-chip-background)] tw-text-[color:var(--assets-details-chip-color)];
}

.assets-details__url {
  @apply tw-flex tw-items-center tw-gap-2 tw-py-2 tw-px-2.5 tw-rounded-md tw-text-xs;
  @apply tw-border tw-border-solid tw-border-[color:var(--assets-details-border)];
  @apply tw-text-[color:var(--assets-details-url-color)];
}

.assets-details__url-icon {
  @apply tw-flex-none tw-text-[color:var(--assets-details-muted-color)];
}

.assets-details__url-text {
  @apply tw-flex-1 tw-min-w-0 tw-truncate;
}

.assets-details__copy {
  @apply tw-flex tw-flex-none tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-rounded;
  @apply tw-bg-transparent tw-border-0 tw-p-0 tw-cursor-pointer;
  @apply tw-text-[color:var(--assets-details-muted-color)];

  &:hover {
    @apply tw-text-[color:var(--assets-details-copy-hover)];
  }

  &:focus-visible {
    @apply tw-outline-none tw-ring-2 tw-ring-[color:var(--assets-details-focus-ring)];
  }
}
</style>
