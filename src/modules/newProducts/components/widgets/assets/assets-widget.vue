<template>
  <VcWidget
    v-bind="props"
    :value="count"
    title="Assets"
    icon="far fa-file"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { BladeContext, VcWidget, useBladeNavigation, usePopup } from "@vc-shell/framework";
import { UnwrapNestedRefs, computed, ref, watch } from "vue";
import { Asset } from "./../../../../../api_client/marketplacevendor";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { useAssets } from "../../../../common/composables";

interface Props {
  modelValue: UnwrapNestedRefs<BladeContext & { item: { assets?: Asset[] } }>;
}

interface Emits {
  (event: "update:modelValue", context);
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });
const { editBulk, upload, removeBulk, loading } = useAssets(Asset);
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
  { deep: true, immediate: true }
);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("AssetsManager"),
      options: {
        assets: modelValue.value?.item?.assets,
        assetsEditHandler: assetsHandler?.edit,
        assetsUploadHandler: assetsHandler?.upload,
        assetsRemoveHandler: assetsHandler?.remove,
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
  edit: async (assetsArr: Asset[]) => {
    internalModel.value.item.assets = editBulk(assetsArr);
    emitAssets();
    return internalModel.value.item.assets;
  },
  async upload(files: FileList) {
    internalModel.value.item.assets = await upload(
      files,
      internalModel.value.item.assets,
      internalModel.value.item.id || internalModel.value.item.categoryId,
      "catalog"
    );
    files = null;

    emitAssets();
    return internalModel.value.item.assets;
  },
  async remove(assetsArr: Asset[]) {
    if (
      await showConfirmation(
        computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION_ASSET", { count: assetsArr.length }))
      )
    ) {
      internalModel.value.item.assets = await removeBulk(internalModel.value.item.assets, assetsArr);
    }
    emitAssets();
    return internalModel.value.item.assets;
  },
};

function emitAssets() {
  emit("update:modelValue", internalModel.value);
}
</script>
