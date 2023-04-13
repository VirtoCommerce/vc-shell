<template>
  <VcBlade
    :title="options?.asset?.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <div class="tw-flex tw-grow-1 tw-border-t tw-border-solid tw-border-t-[#eaedf3]">
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
                    class="tw-text-[#a9bfd2] tw-text-[128px] tw-shrink-0"
                  ></VcIcon>
                </template>
                <VcCol class="tw-ml-6">
                  <VcCol>
                    <VcCol>
                      <VcLabel>{{ $t("ASSETS.PAGES.DETAILS.FIELDS.SIZE") }}</VcLabel>
                      <VcHint class="tw-text-s">{{ readableSize(defaultAsset.size) }}</VcHint>
                    </VcCol>
                    <VcCol>
                      <VcLabel>{{ $t("ASSETS.PAGES.DETAILS.FIELDS.CREATED_DATE") }}</VcLabel>
                      <VcHint class="tw-text-s">{{
                        (defaultAsset.createdDate && moment(defaultAsset.createdDate).fromNow()) || "N/A"
                      }}</VcHint>
                    </VcCol>
                    <VcCol class="tw-w-full">
                      <VcLabel>{{ $t("ASSETS.PAGES.DETAILS.FIELDS.URL") }}</VcLabel>
                      <div class="tw-flex tw-flex-row tw-justify-stretch tw-truncate">
                        <div class="tw-truncate">
                          <VcLink
                            class="vc-link tw-text-s tw-truncate tw-w-full"
                            @click="openLink(defaultAsset.url)"
                            >{{ props.options?.asset.name }}</VcLink
                          >
                        </div>
                        <VcButton
                          icon="far fa-copy"
                          size="m"
                          class="tw-ml-2"
                          variant="onlytext"
                          @click="copyLink(defaultAsset.url)"
                          title="Copy link"
                        ></VcButton>
                      </div>
                    </VcCol>
                  </VcCol>
                </VcCol>
              </VcRow>

              <Field
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                name="asset_name"
                rules="required"
                :modelValue="defaultAsset.name"
                v-slot="{ errorMessage, handleChange, errors }"
              >
                <VcInput
                  class="tw-mb-4"
                  :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  v-model="assetNameClean"
                  @update:modelValue="handleChange"
                  clearable
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                  :disabled="readonly"
                ></VcInput>
              </Field>
              <VcInput
                class="tw-mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="defaultAsset.altText"
                clearable
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                v-if="assetType === 'Image'"
                :disabled="readonly"
              ></VcInput>
              <VcTextarea
                class="tw-mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="defaultAsset.description"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
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
import { Asset, IBladeToolbar } from "./../../../../../core/types";
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
    asset: Asset;
    disabled?: boolean;
    assetEditHandler?: (defaultAsset: Asset) => void;
    assetRemoveHandler?: (defaultAsset: Asset) => void;
  };
}

export interface Emits {
  (event: "close:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const { t } = useI18n();
const defaultAsset = ref<Asset>({ ...props.options?.asset });

const readonly = computed(() => props.options.disabled);

const assetNameClean = computed({
  get() {
    return defaultAsset.value.name.split(".").shift();
  },
  set(value: string) {
    const fileExtension = defaultAsset.value.name.split(".").pop();
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
    icon: "fas fa-save",
    clickHandler() {
      if (props.options?.assetEditHandler && typeof props.options?.assetEditHandler === "function") {
        props.options?.assetEditHandler(defaultAsset.value);
        emit("close:blade");
      }
    },
    disabled: computed(() => isDisabled.value || readonly.value),
  },
  {
    id: "delete",
    title: t("ASSETS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    clickHandler() {
      if (props.options?.assetRemoveHandler && typeof props.options?.assetRemoveHandler === "function") {
        props.options?.assetRemoveHandler(defaultAsset.value);
        emit("close:blade");
      }
    },
    disabled: computed(() => readonly.value),
  },
]);

const assetType = computed(() => defaultAsset.value?.typeId);

function copyLink(link: string) {
  if (link.charAt(0) === "/") {
    navigator.clipboard?.writeText(`${location.origin}${link}`);
  } else {
    navigator.clipboard?.writeText(link);
  }
}

function openLink(link: string) {
  location.href = link;
}
</script>