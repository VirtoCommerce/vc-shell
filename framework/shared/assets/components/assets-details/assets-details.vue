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
              <VcImage
                class="tw-mb-4"
                :src="defaultAsset.url"
                size="xl"
                :bordered="true"
                v-if="assetType === 'Image'"
              ></VcImage>
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
import { Asset } from "./../../../../core/types";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcBlade, VcContainer, VcForm, VcImage, VcInput, VcTextarea } from "./../../../../ui/components";

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
</script>
