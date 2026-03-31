<template>
  <VcBlade
    :title="options?.asset?.name"
    :subtitle="t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :toolbar-items="bladeToolbar"
  >
    <!-- Blade contents -->
    <div class="tw-flex tw-grow-1 tw-border-t tw-border-solid tw-border-t-[--assets-details-border]">
      <div class="assets-details__content tw-grow tw-basis-0 tw-w-full tw-overflow-hidden">
        <VcContainer :no-padding="true">
          <div class="tw-p-4">
            <VcForm>
              <div class="assets-details__header">
                <template v-if="isImage(defaultAsset.name)">
                  <VcImage
                    :src="defaultAsset.url"
                    size="xl"
                    :bordered="true"
                    class="tw-shrink-0"
                  ></VcImage>
                </template>
                <template v-else>
                  <div class="assets-details__file-preview tw-shrink-0">
                    <div
                      class="assets-details__file-badge"
                      :style="{ backgroundColor: getExtensionColor(defaultAsset.name) }"
                    >
                      {{ getExtensionLabel(defaultAsset.name) }}
                    </div>
                  </div>
                </template>
                <div class="assets-details__meta">
                  <VcField
                    :label="t('ASSETS.PAGES.DETAILS.FIELDS.SIZE')"
                    :model-value="readableSize(defaultAsset.size)"
                  />
                  <VcField
                    :label="t('ASSETS.PAGES.DETAILS.FIELDS.CREATED_DATE')"
                    :model-value="defaultAsset.createdDate"
                    type="date-ago"
                  />
                  <VcField
                    :label="t('ASSETS.PAGES.DETAILS.FIELDS.URL')"
                    :model-value="defaultAsset.url"
                    :display-value="defaultAsset.name"
                    type="link"
                    copyable
                  />
                </div>
              </div>

              <Field
                v-if="!options?.hiddenFields?.includes('name')"
                v-slot="{ errorMessage, handleChange, errors }"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                name="asset_name"
                rules="required"
                :model-value="defaultAsset.name"
              >
                <VcInput
                  v-model="assetNameClean"
                  class="tw-mb-4"
                  :label="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  clearable
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                  :disabled="readonly"
                  @update:model-value="handleChange"
                ></VcInput>
              </Field>
              <VcInput
                v-if="assetType === 'Image' && !options?.hiddenFields?.includes('altText')"
                v-model="defaultAsset.altText"
                class="tw-mb-4"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                clearable
                :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                :disabled="readonly"
              ></VcInput>
              <VcTextarea
                v-if="!options?.hiddenFields?.includes('description')"
                v-model="defaultAsset.description"
                class="tw-mb-4"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                :disabled="readonly"
              ></VcTextarea>
            </VcForm>
          </div>
        </VcContainer>
      </div>
    </div>
  </VcBlade>
</template>

<script lang="ts" setup>
import type { IBladeToolbar } from "@core/types";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { VcContainer } from "@ui/components/atoms/vc-container";
import { VcForm } from "@ui/components/molecules/vc-form";
import { VcImage } from "@ui/components/atoms/vc-image";
import { VcInput } from "@ui/components/molecules/vc-input";
import { VcTextarea } from "@ui/components/molecules/vc-textarea";
import { VcField } from "@ui/components/molecules/vc-field";
import { isImage, readableSize, getExtensionColor, getExtensionLabel } from "@core/utilities/assets";
import { useIsFormValid, Field, useForm, useIsFormDirty } from "vee-validate";
import { useBlade } from "@core/composables/useBlade";

interface AssetsDetailsOptions {
  asset: AssetLike;
  disabled?: boolean;
  hiddenFields?: string[];
  assetEditHandler?: (defaultAsset: AssetLike) => void;
  assetRemoveHandler?: (defaultAsset: AssetLike) => Promise<void>;
}

defineBlade({
  name: "AssetsDetails",
});

const { options, closeSelf } = useBlade<AssetsDetailsOptions>();

useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const { t } = useI18n({ useScope: "global" });
const defaultAsset = ref<AssetLike>({ ...options.value?.asset });

const readonly = computed(() => options.value?.disabled);

const assetNameClean = computed({
  get() {
    const name = defaultAsset.value.name;
    if (!name) return "";
    const dotIndex = name.lastIndexOf(".");
    return dotIndex > 0 ? name.slice(0, dotIndex) : name;
  },
  set(value) {
    const name = defaultAsset.value.name;
    if (!name) return;
    const dotIndex = name.lastIndexOf(".");
    const ext = dotIndex > 0 ? name.slice(dotIndex) : "";
    defaultAsset.value.name = value ? value + ext : "";
  },
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "lucide-save",
    async clickHandler() {
      if (options.value?.assetEditHandler && typeof options.value?.assetEditHandler === "function") {
        await options.value?.assetEditHandler(defaultAsset.value);
        closeSelf();
      }
    },
    disabled: computed(() => isDisabled.value || readonly.value),
  },
  {
    id: "delete",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "lucide-trash-2",
    async clickHandler() {
      if (options.value?.assetRemoveHandler && typeof options.value?.assetRemoveHandler === "function") {
        await options.value?.assetRemoveHandler(defaultAsset.value);
        closeSelf();
      }
    },
    disabled: computed(() => readonly.value),
  },
]);

const assetType = computed(() => defaultAsset.value?.typeId);

</script>

<style lang="scss">
:root {
  --assets-details-border: var(--neutrals-200);
}

.assets-details__header {
  @apply tw-flex tw-mb-4;
  @apply tw-overflow-hidden;
}

.assets-details__meta {
  @apply tw-flex tw-flex-col tw-gap-3;
  @apply tw-ml-6 tw-min-w-0 tw-flex-1;
  @apply tw-overflow-hidden;
}

.assets-details__file-preview {
  @apply tw-w-[var(--image-size-xl)] tw-h-[var(--image-size-xl)];
  @apply tw-rounded-[var(--image-border-radius)];
  @apply tw-border tw-border-solid tw-border-[color:var(--image-border-color)];
  @apply tw-bg-[var(--neutrals-50)];
  @apply tw-flex tw-flex-col tw-items-center tw-justify-center;
  @apply tw-gap-2;
  @apply tw-overflow-hidden;
}

.assets-details__file-badge {
  @apply tw-flex tw-items-center tw-justify-center;
  @apply tw-px-3.5 tw-py-1.5;
  @apply tw-rounded-md;
  @apply tw-text-sm tw-font-bold tw-tracking-wide;
  @apply tw-text-white;
}

</style>
