<template>
  <VcBlade
    v-loading="loading || productLoading"
    :title="param ? productDetails?.name : $t('PRODUCTS.PAGES.DETAILS.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <template v-slot:actions>
      <mp-product-status :status="product.status"></mp-product-status>
    </template>

    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div
        v-if="productDetails"
        class="product-details__inner vc-flex vc-flex-grow_1"
      >
        <div class="product-details__content vc-flex-grow_1">
          <div class="vc-padding_l">
            <VcStatus
              :outline="false"
              :extend="true"
              variant="light-danger"
              class="vc-fill_width vc-margin-bottom_xl"
              v-if="statusText"
            >
              <div class="vc-flex vc-flex-row vc-flex-align_center">
                <vc-icon
                  icon="fas fa-exclamation-circle"
                  class="product-details__decline-icon vc-margin-right_m"
                  size="xxl"
                ></vc-icon>
                <div>
                  <div class="vc-font-weight_bold">
                    {{ $t("PRODUCTS.PAGES.DETAILS.DECLINE_REASON") }}
                  </div>
                  <div>{{ statusText }}</div>
                </div>
              </div>
            </VcStatus>
            <VcForm>
              <VcInput
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                v-model="productDetails.name"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
                rules="min:3"
                name="name"
                :disabled="readonly"
              ></VcInput>
              <VcSelect
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                v-model="productDetails.categoryId"
                :isRequired="true"
                :isSearchable="true"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')
                "
                :options="categories"
                :initialItem="category"
                keyProperty="id"
                displayProperty="name"
                :tooltip="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TOOLTIP')"
                @search="onCategoriesSearch"
                @close="onCategoriesSearch"
                @update:modelValue="setCategory"
                :is-disabled="readonly"
                name="category"
              >
                <template v-slot:item="itemData">
                  <div
                    class="vc-flex vc-flex-align_center vc-padding-vertical_s vc-ellipsis"
                  >
                    <div class="flex-grow_1 vc-margin-left_l vc-ellipsis">
                      <div class="vc-ellipsis">{{ itemData.item.path }}</div>
                      <VcHint class="vc-ellipsis vc-margin-top_xs">
                        {{ $t("PRODUCTS.PAGES.DETAILS.FIELDS.CODE") }}:
                        {{ itemData.item.code }}
                      </VcHint>
                    </div>
                  </div>
                </template>
              </VcSelect>

              <VcCard
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_properties')"
                v-if="product.id || currentCategory"
                @state:collapsed="handleCollapsed('product_properties', $event)"
              >
                <div class="vc-padding_l">
                  <VcInput
                    class="vc-margin-bottom_l"
                    :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                    v-model="productDetails.gtin"
                    :clearable="true"
                    :required="true"
                    :placeholder="
                      $t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')
                    "
                    :tooltip="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TOOLTIP')"
                    rules="min:3"
                    :disabled="readonly"
                    name="gtin"
                  ></VcInput>
                  <VcTextarea
                    class="vc-margin-bottom_l"
                    :label="
                      $t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')
                    "
                    v-model="productDetails.description"
                    :required="true"
                    :placeholder="
                      $t(
                        'PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER'
                      )
                    "
                    rules="min:3"
                    :disabled="readonly"
                    name="description"
                  ></VcTextarea>

                  <VcDynamicProperty
                    v-for="property in productDetails.properties"
                    :key="property.id"
                    :property="property"
                    :optionsGetter="loadDictionaries"
                    :getter="getPropertyValue"
                    :setter="setPropertyValue"
                    class="vc-margin-bottom_l"
                    :disabled="readonly"
                  >
                  </VcDynamicProperty>
                </div>
              </VcCard>

              <VcCard
                v-if="param"
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
                class="vc-margin-vertical_m"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_gallery')"
                @state:collapsed="handleCollapsed('product_gallery', $event)"
              >
                <div class="vc-padding_s">
                  <VcGallery
                    :images="productDetails.images"
                    @upload="onGalleryUpload"
                    @item:edit="onGalleryItemEdit"
                    @item:remove="onGalleryImageRemove"
                    :disabled="readonly"
                    @sort="onGallerySort"
                  ></VcGallery>
                </div>
              </VcCard>
            </VcForm>
          </div>
        </div>
        <div class="product-details__widgets">
          <VcWidget
            icon="fas fa-file-alt"
            title="Offers"
            :value="offersCount"
            :disabled="!product.isPublished"
            @click="openOffers"
          >
          </VcWidget>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, unref } from "vue";

export default defineComponent({
  url: "product",
});
</script>

<script lang="ts" setup>
import { useFunctions, useI18n, useUser } from "@virtoshell/core";
import { useForm } from "@virtoshell/ui";
import { useProduct } from "../composables";
import { useOffers } from "../../offers/composables";
import {
  ICategory,
  Image,
  IProperty,
  IPropertyValue,
  PropertyValue,
  PropertyDictionaryItem,
} from "@virtoshell/api-client";
import MpProductStatus from "../components/MpProductStatus.vue";
import { AssetsDetails } from "@virtoshell/mod-assets";
import { OffersList } from "../../offers";
import { IBladeToolbar } from "../../../types";
import _ from "lodash-es";

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["parent:call", "page:close", "page:open"]);
const { t } = useI18n();
const { validate } = useForm({ validateOnMount: false });
const {
  modified,
  product: productData,
  productDetails,
  loading: prodLoading,
  loadProduct,
  createProduct,
  updateProductDetails,
  fetchCategories,
  revertStagedChanges,
  searchDictionaryItems,
} = useProduct();

const { searchOffers } = useOffers();
const { getAccessToken, user } = useUser();
const { debounce } = useFunctions();

const currentCategory = ref();
const offersCount = ref(0);
const categories = ref<ICategory[]>();
const productLoading = ref(false);
let isOffersOpened = false;

const reload = async (fullReload: boolean) => {
  if (!modified.value && fullReload) {
    try {
      productLoading.value = true;
      if (props.param) {
        await loadProduct({ id: props.param });
      }
      categories.value = await fetchCategories();
      if (productDetails?.categoryId) {
        currentCategory.value = categories.value?.find(
          (x) => x.id === productDetails.categoryId
        );
      }
    } finally {
      productLoading.value = false;
    }
  }
  //Load offers count to populate widget
  if (props.param) {
    offersCount.value = (
      await searchOffers({
        take: 0,
        sellerProductId: props.param,
      })
    )?.totalCount;
  }
};

onMounted(async () => {
  await reload(true);
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.TITLE")),
    icon: "fas fa-save",
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          if (props.param) {
            await updateProductDetails(productData.value.id, productDetails);
          } else {
            await createProduct(productDetails);
          }
          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("page:close");
          }
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(
          unref(
            computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.NOT_VALID"))
          )
        );
      }
    },
    disabled: computed(
      () =>
        (props.param &&
          (!productData.value?.canBeModified || !modified.value)) ||
        (!props.param && !modified.value)
    ),
  },
  {
    id: "saveAndSendToApprove",
    title: computed(() =>
      t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.TITLE")
    ),
    icon: "fas fa-share-square",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      const { valid } = await validate();
      if (valid) {
        try {
          await updateProductDetails(
            productData.value.id,
            { ...productDetails },
            true
          );
          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("page:close");
          }
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(
          unref(
            computed(() =>
              t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.NOT_VALID")
            )
          )
        );
      }
    },
    disabled: computed(
      () =>
        !(
          productData.value?.canBeModified &&
          (productData.value?.hasStagedChanges || modified.value)
        )
    ),
  },
  {
    id: "revertStagedChanges",
    title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT")),
    icon: "fas fa-undo",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      await revertStagedChanges(productData.value.id);
      emit("parent:call", {
        method: "reload",
      });
    },
    disabled: computed(
      () =>
        !(
          productData.value?.isPublished &&
          productData.value?.hasStagedChanges &&
          productData.value?.canBeModified
        )
    ),
  },
]);

const statusText = computed(() => {
  if (
    productData.value.publicationRequests &&
    productData.value.publicationRequests.length
  ) {
    return _.orderBy(
      productData.value.publicationRequests,
      ["createdDate"],
      ["desc"]
    )[0].comment;
  }
  return null;
});

const category = computed(() =>
  categories.value?.find((x) => x.id === productDetails.categoryId)
);

const product = computed(() =>
  props.param ? productData.value : productDetails
);
const readonly = computed(
  () =>
    (props.param && !productData.value?.canBeModified) ||
    (productData.value.sellerId && productData.value.sellerId !== user.value.id)
);
const loading = computed(() => prodLoading.value);

const onGalleryUpload = async (files: FileList) => {
  const formData = new FormData();
  formData.append("file", files[0]);
  const authToken = await getAccessToken();
  const result = await fetch(
    `/api/assets?folderUrl=/catalog/${productData.value.id}`,
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
    const image = new Image(response[0]);
    image.createdDate = new Date();
    if (productDetails.images && productDetails.images.length) {
      const lastImageSortOrder =
        productDetails.images[productDetails.images.length - 1].sortOrder;
      image.sortOrder = lastImageSortOrder + 1;
    } else {
      image.sortOrder = 0;
    }
    productDetails.images.push(image);
  }
  files = null;
};

const onGalleryItemEdit = (item: Image) => {
  emit("page:open", {
    component: AssetsDetails,
    componentOptions: {
      editableAsset: item,
      images: productDetails.images,
    },
  });
};

const editImages = (args: Image[]) => {
  productDetails.images = args;
};

const onGallerySort = (images: Image[]) => {
  productDetails.images = images;
};

const onGalleryImageRemove = (image: Image) => {
  const imageIndex = productDetails.images.findIndex((img) => {
    if (img.id && image.id) {
      return img.id === image.id;
    } else {
      return img.url === image.url;
    }
  });
  productDetails.images.splice(imageIndex, 1);
};

const setCategory = async (id: string) => {
  currentCategory.value = categories.value?.find((x) => x.id === id);
  const currentProperties = [...(productDetails?.properties || [])];
  productDetails.properties = [...(currentCategory.value.properties || [])];
  productDetails.properties.forEach(async (property) => {
    const previousPropertyValue = currentProperties?.find(
      (item) => item.id === property.id
    );
    if (previousPropertyValue) {
      property.values = previousPropertyValue.values.map(
        (item) => new PropertyValue(item)
      );
    }
  });
};

async function loadDictionaries(
  property: IProperty,
  keyword?: string,
  skip?: number
) {
  return await searchDictionaryItems([property.id], keyword, skip);
}

const onCategoriesSearch = debounce(async (value: string) => {
  categories.value = await fetchCategories(value);
}, 500);
async function openOffers() {
  if (!isOffersOpened) {
    emit("page:open", {
      component: OffersList,
      componentOptions: {
        sellerProduct: productData.value,
      },
      url: null,
      onOpen() {
        isOffersOpened = true;
      },
      onClose() {
        isOffersOpened = false;
      },
    });
  }
}

async function onBeforeClose() {
  if (modified.value) {
    return confirm(
      unref(
        computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.CLOSE_CONFIRMATION"))
      )
    );
  }
}

function handleDictionaryValue(
  property: IProperty,
  valueId: string,
  dictionary: PropertyDictionaryItem[]
) {
  let valueName;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (dictionaryItem) {
    valueName = dictionaryItem.alias;
  } else {
    valueName = property.name;
  }

  return {
    value: valueName,
    valueId,
  };
}

function setPropertyValue(
  property: IProperty,
  value: IPropertyValue,
  dictionary?: PropertyDictionaryItem[]
) {
  if (
    typeof value === "object" &&
    Object.prototype.hasOwnProperty.call(value, "length")
  ) {
    if (dictionary && dictionary.length) {
      property.values = (value as IPropertyValue[]).map((item) => {
        const handledValue = handleDictionaryValue(
          property,
          item.valueId,
          dictionary
        );
        return new PropertyValue(handledValue);
      });
    } else {
      property.values = (value as IPropertyValue[]).map(
        (item) => new PropertyValue(item)
      );
    }
  } else {
    if (dictionary && dictionary.length) {
      const handledValue = handleDictionaryValue(
        property,
        value as string,
        dictionary
      );
      property.values[0] = new PropertyValue({
        ...handledValue,
        isInherited: false,
      });
    } else {
      if (property.values[0]) {
        property.values[0].value = value;
      } else {
        property.values[0] = new PropertyValue({
          value,
          isInherited: false,
        });
      }
    }
  }
}

function getPropertyValue(
  property: IProperty,
  isDictionary?: boolean
): Record<string, unknown> {
  if (isDictionary) {
    return (
      property.values[0] &&
      (property.values[0].valueId as unknown as Record<string, unknown>)
    );
  }
  return property.values[0] && property.values[0].value;
}

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

defineExpose({
  editImages,
  onBeforeClose,
});
</script>

<style lang="less">
.product-details {
  &__inner {
    overflow: hidden;
    min-height: 100%;
  }

  &__content {
    border-right: 1px solid #eaedf3;
    overflow: hidden;
  }

  &__decline-icon {
    color: #ff4a4a;
  }

  .vc-app_phone &__inner {
    flex-direction: column;
  }

  .vc-app_phone &__content {
    border-right: none;
    border-bottom: 1px solid #eaedf3;
    overflow: visible;
  }

  .vc-app_phone &__widgets {
    display: flex;
    flex-direction: row;
  }
}
</style>
