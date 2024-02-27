<template>
  <VcWidget
    v-bind="props"
    :value="count"
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.ASSETS')"
    icon="far fa-file"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useBladeNavigation, usePopup, useAssets, useUser } from "@vc-shell/framework";
import { UnwrapNestedRefs, computed, ref, watch } from "vue";
import { Asset } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { useProductDetails } from "../../../composables/useProductDetails";

const props = defineProps<{
  // TODO Add to documentation
  modelValue: UnwrapNestedRefs<ReturnType<typeof useProductDetails>>;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", context: UnwrapNestedRefs<ReturnType<typeof useProductDetails>>): void;
}>();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });
const { edit, upload, remove, loading } = useAssets();
const { user } = useUser();
const modelValue = ref(props.modelValue);
const widgetOpened = ref(false);
const internalModel = ref();
const count = computed(() => modelValue.value?.item?.assets?.length || 0);

watch(
  () => props.modelValue,
  (newVal) => {
    if (!_.isEqual(internalModel.value, newVal)) {
      internalModel.value = newVal;
    }
  },
  { deep: true, immediate: true },
);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("AssetsManager"),
      options: {
        assets: modelValue.value?.item?.assets,
        loading: assetsHandler?.loading,
        assetsEditHandler: assetsHandler?.edit,
        assetsUploadHandler: assetsHandler?.upload,
        assetsRemoveHandler: assetsHandler?.remove,
        disabled: props.modelValue.scope?.disabled || props.modelValue.item?.createdBy !== user.value?.userName,
      },
      onOpen() {
        widgetOpened.value = true;
      },
      onClose() {
        widgetOpened.value = false;
      },
    });
  }
}

const assetsHandler = {
  loading: computed(() => loading.value),
  edit: (files: Asset[]) => {
    internalModel.value.item.assets = edit(files, internalModel.value.item.assets);
    emitAssets();
    return internalModel.value.item.assets;
  },
  async upload(files: FileList | null, lastSortOrder?: number) {
    if (files) {
      const uploaded = (await upload(files, `catalog/${internalModel.value.item.id}`, lastSortOrder)).map(
        (x) => new Asset(x),
      );

      internalModel.value.item.assets = internalModel.value.item.assets.concat(uploaded);

      files = null;

      emitAssets();
      return internalModel.value.item.assets;
    }
  },
  async remove(files: Asset[]) {
    if (
      await showConfirmation(
        computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION_ASSET", { count: files.length })),
      )
    ) {
      internalModel.value.item.assets = (await remove(files, internalModel.value.item.assets)).map((x) => new Asset(x));
    }
    emitAssets();
    return internalModel.value.item.assets;
  },
};

function emitAssets() {
  emit("update:modelValue", internalModel.value);
}
</script>
