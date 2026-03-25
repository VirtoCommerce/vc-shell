<template>
  <VcBlade
    :title="options?.asset?.name"
    :subtitle="t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :toolbar-items="bladeToolbar"
  >
    <!-- Blade contents -->
    <div class="tw-flex tw-grow-1 tw-border-t tw-border-solid tw-border-t-[--assets-details-border]">
      <div class="assets-details__content tw-grow tw-basis-0 tw-w-full">
        <VcContainer :no-padding="true">
          <div class="tw-p-4">
            <VcForm>
              <VcRow class="tw-mb-4 !tw-flex">
                <template v-if="isImage(defaultAsset.name)">
                  <VcImage
                    :src="defaultAsset.url"
                    size="xl"
                    :bordered="true"
                    class="tw-shrink-0"
                  ></VcImage>
                </template>
                <template v-else>
                  <VcIcon
                    :icon="getFileThumbnail(defaultAsset.name)"
                    class="tw-text-[color:var(--assets-details-thumbnail-color)] tw-text-[128px] tw-shrink-0"
                  ></VcIcon>
                </template>
                <VcCol class="tw-ml-6">
                  <VcCol>
                    <VcCol>
                      <VcLabel>{{ t("ASSETS.PAGES.DETAILS.FIELDS.SIZE") }}</VcLabel>
                      <VcHint class="tw-text-s">{{ readableSize(defaultAsset.size) }}</VcHint>
                    </VcCol>
                    <VcCol>
                      <VcLabel>{{ t("ASSETS.PAGES.DETAILS.FIELDS.CREATED_DATE") }}</VcLabel>
                      <VcHint class="tw-text-s">{{ formatDateRelative(defaultAsset.createdDate) || "N/A" }}</VcHint>
                    </VcCol>
                    <VcCol class="tw-w-full">
                      <VcLabel>{{ t("ASSETS.PAGES.DETAILS.FIELDS.URL") }}</VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(defaultAsset.url)"
                            >{{ options?.asset.name }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="lucide-copy"
                          icon-size="m"
                          class="tw-ml-2"
                          text
                          :title="t('ASSETS.PAGES.DETAILS.FIELDS.COPY')"
                          @click="copyLink(defaultAsset.url)"
                        ></VcButton>
                      </div>
                    </VcCol>
                  </VcCol>
                </VcCol>
              </VcRow>

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
import { isImage, getFileThumbnail, readableSize } from "@core/utilities/assets";
import { formatDateRelative } from "@core/utilities/date";
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
    return defaultAsset.value.name?.split(".").shift();
  },
  set(value) {
    const fileExtension = defaultAsset.value.name?.split(".").pop();
    defaultAsset.value.name = value + "." + fileExtension;
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

function copyLink(link: string | undefined) {
  if (!link) {
    return;
  }
  if (link.charAt(0) === "/") {
    navigator.clipboard?.writeText(`${location.origin}${link}`);
  } else {
    navigator.clipboard?.writeText(link);
  }
}

function openLink(link: string | undefined) {
  if (!link) {
    return;
  }
  location.href = link;
}
</script>

<style lang="scss">
:root {
  --assets-details-border: var(--neutrals-200);
  --assets-details-thumbnail-color: var(--secondary-500);
}
</style>
