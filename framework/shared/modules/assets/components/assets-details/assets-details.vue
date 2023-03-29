<template>
  <VcBlade
    :title="options?.asset?.name"
    :subtitle="$t('ASSETS.PAGES.DETAILS.SUBTITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <!-- Blade contents -->
    <div class="tw-flex tw-grow-1 tw-border-t tw-border-solid tw-border-t-[#eaedf3]">
      <div class="assets-details__content tw-grow tw-basis-0">
        <VcContainer :no-padding="true">
          <div class="tw-p-4">
            <VcForm>
              <VcRow class="tw-mb-4 !tw-flex">
                <template v-if="isImage(defaultAsset.name)">
                  <VcImage
                    :src="defaultAsset.url"
                    size="xl"
                    :bordered="true"
                  ></VcImage>
                </template>
                <template v-else>
                  <VcIcon
                    :icon="getFileThumbnail(defaultAsset.name)"
                    class="tw-text-[#a9bfd2] tw-text-[128px]"
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
                    <VcCol>
                      <VcLabel>{{ $t("ASSETS.PAGES.DETAILS.FIELDS.URL") }}</VcLabel>
                      <VcRow>
                        <VcLink
                          class="vc-link tw-text-s tw-max-w-10 tw-truncate tw-w-max tw-max-w-[100px]"
                          @click="openLink(defaultAsset.url)"
                          >{{ defaultAsset.name }}</VcLink
                        >
                        <VcButton
                          icon="far fa-copy"
                          size="m"
                          class="tw-ml-2"
                          variant="onlytext"
                          @click="copyLink(defaultAsset.url)"
                          title="Copy link"
                        ></VcButton>
                      </VcRow>
                    </VcCol>
                  </VcCol>
                </VcCol>
              </VcRow>

              <VcInput
                class="tw-mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="defaultAsset.name"
                clearable
                required
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
              ></VcInput>
              <VcInput
                class="tw-mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TITLE')"
                v-model="defaultAsset.altText"
                clearable
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.PLACEHOLDER')"
                :tooltip="$t('ASSETS.PAGES.DETAILS.FIELDS.ALT.TOOLTIP')"
                required
                v-if="assetType === 'Image'"
              ></VcInput>
              <VcTextarea
                class="tw-mb-4"
                :label="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="defaultAsset.description"
                :placeholder="$t('ASSETS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                required
              ></VcTextarea>
            </VcForm>
          </div>
        </VcContainer>
      </div>
    </div>
  </VcBlade>
</template>

<script lang="ts" setup>
import { Asset } from "./../../../../../core/types";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcBlade, VcContainer, VcForm, VcImage, VcInput, VcTextarea } from "./../../../../../ui/components";
import { isImage, getFileThumbnail, readableSize } from "./../../../../utilities/assets";
import moment from "moment";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options?: {
    asset: Asset;
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
const { t } = useI18n();
const defaultAsset = ref<Asset>({ ...props.options?.asset });

const bladeToolbar = [
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
  },
];

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
