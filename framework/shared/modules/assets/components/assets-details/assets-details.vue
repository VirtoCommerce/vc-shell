<template>
  <VcBlade
    :title="options?.asset?.name"
    :subtitle="t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
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
                      <VcHint class="tw-text-s">{{
                        (defaultAsset.createdDate && moment(defaultAsset.createdDate).fromNow()) || "N/A"
                      }}</VcHint>
                    </VcCol>
                    <VcCol class="tw-w-full">
                      <VcLabel>{{ t("ASSETS.PAGES.DETAILS.FIELDS.URL") }}</VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(defaultAsset.url)"
                            >{{ props.options?.asset.name }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="material-content_copy"
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
                v-if="assetType === 'Image'"
                v-model="defaultAsset.altText"
                class="tw-mb-4"
                :label="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                clearable
                :placeholder="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                :disabled="readonly"
              ></VcInput>
              <VcTextarea
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
import { ICommonAsset, IBladeToolbar } from "./../../../../../core/types";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcBlade, VcContainer, VcForm, VcImage, VcInput, VcTextarea } from "./../../../../../ui/components";
import { isImage, getFileThumbnail, readableSize } from "./../../../../utilities/assets";
import moment from "moment";
import { useIsFormValid, Field, useForm, useIsFormDirty } from "vee-validate";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options?: {
    asset: ICommonAsset;
    disabled?: boolean;
    assetEditHandler?: (defaultAsset: ICommonAsset) => void;
    assetRemoveHandler?: (defaultAsset: ICommonAsset) => Promise<void>;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "AssetsDetails",
});

useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const { t } = useI18n({ useScope: "global" });
const defaultAsset = ref<ICommonAsset>({ ...props.options?.asset });

const readonly = computed(() => props.options?.disabled);

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
    icon: "material-save",
    async clickHandler() {
      if (props.options?.assetEditHandler && typeof props.options?.assetEditHandler === "function") {
        await props.options?.assetEditHandler(defaultAsset.value);
        emit("close:blade");
      }
    },
    disabled: computed(() => isDisabled.value || readonly.value),
  },
  {
    id: "delete",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    async clickHandler() {
      if (props.options?.assetRemoveHandler && typeof props.options?.assetRemoveHandler === "function") {
        await props.options?.assetRemoveHandler(defaultAsset.value);
        emit("close:blade");
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
