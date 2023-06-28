<template>
  <VcBlade
    v-loading="loading"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="data.settings.toolbar"
    :title="data.settings.titleTemplate"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="true">
      <div
        v-if="!loading"
        class="product-details__inner"
      >
        <div class="product-details__content">
          <VcForm class="tw-grow tw-p-4">
            <RecursiveComponent
              :content="form"
              :getter="getter"
              :options-getter="optionsGetter"
            >
            </RecursiveComponent>
          </VcForm>
        </div>
        <div
          v-if="widgets"
          class="product-details__widgets"
        >
          <VcWidget
            v-for="(widget, i) in widgets.children"
            :key="`${widget}_${i}`"
            :icon="widget.icon"
            :title="widget.label"
            @click="widgetClickHandler(widget)"
          >
          </VcWidget>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { IParentCallArgs, useBladeNavigation, usePopup, useUser } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import data from "./data.json";
import { computed, markRaw, onMounted, ref } from "vue";
import { Asset } from "../../api_client/marketplacevendor";
import RecursiveComponent from "./recursiveComponent.vue";
interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  url: data.settings.url as `/${string}`,
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { showConfirmation } = usePopup();

const { getAccessToken } = useUser();

const bladeData = ref();
const loading = ref(true);
const fileAssetUploading = ref(false);
const form = data.content.find((x) => x.type === "form");
const widgets = data.content.find((x) => x.type === "widgets") as {
  type: string;
  children: {
    label: string;
    icon: string;
    navigate: string;
    context: string;
  }[];
};

onMounted(async () => {
  await load();
});

function getter(property: string) {
  if (property) {
    // return bladeData.value[property];
    console.log(property);
    return property.split(".").reduce((p: { [x: string]: unknown }, c: string) => {
      console.log(p, c);
      if (p && Array.isArray(p) && p.length) {
        return (p && p[0][c]) || null;
      }
      return (p && p[c]) || null;
    }, bladeData.value);
  }
}

function optionsGetter(endpoint: string) {
  return loadSelectData(endpoint);
}

function widgetClickHandler(args: { navigate: string; context: string }) {
  if (args.navigate) {
    const blade = resolveBladeByName(args.navigate);

    if (blade) {
      openBlade({
        blade: markRaw(blade),
        options: {
          [args.context]: bladeData.value,
          assets: bladeData.value?.productData?.assets,
          assetsEditHandler: onAssetsEdit,
          assetsUploadHandler: onAssetsUpload,
          assetsRemoveHandler: onAssetsItemRemove,
        },
      });
    }
  }
}

async function load() {
  try {
    loading.value = true;
    const token = await getAccessToken();
    const url_ = data.settings.endpoint + "/" + props.param;

    const options_: RequestInit = {
      method: "GET",
      headers: {
        Accept: "text/plain",
        authorization: `Bearer ${token}`,
      },
    };

    const res = await fetch(url_, options_);

    res.text().then((response) => {
      bladeData.value = JSON.parse(response) ?? {};
    });
  } finally {
    loading.value = false;
  }
}

function loadSelectData(endpoint: string) {
  if (!endpoint) {
    return;
  }

  return async function () {
    try {
      const token = await getAccessToken();
      const url_ = endpoint;

      const options_: RequestInit = {
        body: JSON.stringify({
          skip: 0,
          take: 20,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "text/plain",
          authorization: `Bearer ${token}`,
        },
      };

      const res = await fetch(url_, options_);

      const data = await res.text();

      return JSON.parse(data);
    } catch (e) {
      console.log(e);
    }
  };
}

const onAssetsItemRemove = async (assets: Asset[]): Promise<Asset[]> => {
  if (await showConfirmation(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION")))) {
    bladeData.value.productData.assets = bladeData.value?.productData?.assets.filter(
      (asset) => !assets.includes(asset)
    );
  }
  return bladeData.value.productData.assets;
};

const onAssetsEdit = (assets: Asset[]): Asset[] => {
  bladeData.value.productData.assets = assets.map((item) => new Asset(item));

  return bladeData.value.productData.assets;
};

const onAssetsUpload = async (files: FileList): Promise<Asset[]> => {
  try {
    fileAssetUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/assets?folderUrl=/catalog/${bladeData.value?.productData.id || bladeData.value?.productData.categoryId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const response = await result.json();
      if (response?.length) {
        const asset = new Asset(response[0]);
        asset.createdDate = new Date();
        asset.size = files[i].size;

        if (bladeData.value?.productData?.assets && bladeData.value?.productData?.assets.length) {
          const lastAssetSortOrder =
            bladeData.value?.productData?.assets[bladeData.value?.productData?.assets.length - 1].sortOrder;
          asset.sortOrder = lastAssetSortOrder + 1;
        } else {
          asset.sortOrder = 0;
        }
        console.log(bladeData.value);
        bladeData.value?.productData?.assets?.push(asset);
        return bladeData.value?.productData?.assets;
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    fileAssetUploading.value = false;
  }

  files = null;
};
</script>

<style lang="scss">
.product-details {
  &__inner {
    @apply tw-overflow-hidden tw-min-h-full tw-flex tw-grow tw-basis-0;
  }

  &__content {
    @apply tw-border-r tw-border-solid tw-border-r-[#eaedf3] tw-overflow-hidden tw-grow tw-basis-0;
  }

  &__decline-icon {
    @apply tw-text-[#ff4a4a] tw-mr-3;
  }

  .vc-app_phone &__inner {
    @apply tw-flex-col;
  }

  .vc-app_phone &__content {
    @apply tw-border-r-0 tw-border-b tw-border-solid tw-border-b-[#eaedf3] tw-overflow-visible;
  }

  .vc-app_phone &__widgets {
    @apply tw-flex tw-flex-row;
  }
}
</style>
