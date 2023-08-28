<template>
  <VcBlade
    v-loading="loading || productLoading"
    :title="param ? productDetails?.name : $t('MP_PRODUCTS.PAGES.DETAILS.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template #actions>
      <div class="tw-flex tw-flex-row tw-items-center">
        <div class="vc-status">
          <VcSelect
            name="currentLocale"
            :model-value="currentLocale"
            :options="localesOptions"
            option-value="value"
            option-label="label"
            :disabled="disabled"
            required
            :clearable="false"
            @update:model-value="
              (e: string) => {
                setLocale(e);
              }
            "
          >
          </VcSelect>
        </div>
        <div
          v-if="(product as ISellerProduct).status !== 'Published'"
          class="tw-ml-4"
        >
          <mp-product-status :status="(product as ISellerProduct).status"></mp-product-status>
        </div>
      </div>
    </template>

    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div
        v-if="!productLoading"
        class="product-details__inner"
      >
        <div class="product-details__content">
          <div class="tw-p-4">
            <VcStatus
              v-if="statusText && (product as ISellerProduct).status !== 'Published'"
              :outline="false"
              :extend="true"
              variant="light-danger"
              class="tw-w-full tw-box-border tw-mb-5"
            >
              <div class="tw-flex tw-flex-row tw-items-center">
                <VcIcon
                  icon="fas fa-exclamation-circle"
                  class="product-details__decline-icon"
                  size="xxl"
                ></VcIcon>
                <div>
                  <div class="tw-font-bold">
                    {{ $t("MP_PRODUCTS.PAGES.DETAILS.DECLINE_REASON") }}
                  </div>
                  <div>{{ statusText }}</div>
                </div>
              </div>
            </VcStatus>
            <VcForm>
              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                name="name"
                rules="required|min:3"
                :model-value="productDetails.name"
              >
                <VcInput
                  v-bind="field"
                  v-model="productDetails.name"
                  class="tw-mb-4"
                  :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  :placeholder="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                  :disabled="disabled"
                  maxlength="64"
                  required
                  clearable
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:model-value="handleChange"
                ></VcInput>
              </Field>
              <Field
                v-slot="{ field, errorMessage, handleChange, errors }"
                :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                name="categoryId"
                rules="required"
                :model-value="productDetails.categoryId"
              >
                <VcSelect
                  v-bind="field"
                  class="tw-mb-4"
                  :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                  :model-value="productDetails.categoryId"
                  searchable
                  :placeholder="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')"
                  :options="fetchCategories"
                  option-value="id"
                  option-label="name"
                  :tooltip="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TOOLTIP')"
                  :disabled="disabled"
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :clearable="false"
                  :emit-value="false"
                  @update:model-value="
                    (e: Category) => {
                      handleChange(e.id);
                      setCategory(e);
                    }
                  "
                >
                  <template
                    v-for="item in ['option', 'selected-item']"
                    #[item]="scope"
                    :key="item"
                  >
                    <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
                      <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
                        <div class="tw-truncate">
                          {{ scope.opt.path }}
                        </div>
                        <VcHint class="tw-truncate tw-mt-1">
                          {{ $t("MP_PRODUCTS.PAGES.DETAILS.FIELDS.CODE") }}:
                          {{ scope.opt.code }}
                        </VcHint>
                      </div>
                    </div>
                  </template>
                </VcSelect>
              </Field>

              <VcCard
                v-if="(product as ISellerProduct).id || currentCategory"
                :header="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_properties')"
                @state:collapsed="handleCollapsed('product_properties', $event)"
              >
                <div class="tw-p-4">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                    name="gtin"
                    :rules="validateGtin"
                    :model-value="productDetails.gtin"
                  >
                    <VcInput
                      v-bind="field"
                      v-model="productDetails.gtin"
                      class="tw-mb-4"
                      :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                      :placeholder="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')"
                      :tooltip="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TOOLTIP')"
                      :disabled="disabled"
                      maxlength="64"
                      required
                      clearable
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:model-value="handleChange"
                    ></VcInput>
                  </Field>
                  <div
                    v-for="(lang, index) in localesOptions"
                    :key="index"
                  >
                    <Field
                      v-if="lang.value == currentLocale"
                      v-slot="{ field, errorMessage, handleChange }"
                      :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                      name="description"
                      rules="min:3|required"
                      :model-value="productDetails.descriptions.find((x) => x.languageCode == currentLocale)"
                    >
                      <VcEditor
                        v-bind="field"
                        v-model="productDetails.descriptions.find((x) => x.languageCode == currentLocale).content"
                        class="tw-mb-4"
                        :label="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                        :placeholder="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                        :disabled="disabled"
                        name="description"
                        required
                        :error-message="errorMessage"
                        :assets-folder="productData.id || productData.categoryId"
                        :languages="languages"
                        :multilanguage="true"
                        :current-language="currentLocale"
                        @update:model-value="handleChange"
                        @update:current-language="
                        (e: string) => {
                          setLocale(e);
                        }
                      "
                      ></VcEditor>
                    </Field>
                  </div>

                  <div
                    v-for="property in filteredProps"
                    :key="property.id"
                  >
                    <div v-if="property.multilanguage">
                      <div
                        v-for="lang in localesOptions"
                        :key="lang"
                      >
                        <VcDynamicProperty
                          v-if="lang.value == currentLocale"
                          class="tw-pb-4"
                          :property="property"
                          :model-value="getPropertyValue(property, currentLocale)"
                          :options-getter="loadDictionaries"
                          :required="property.required"
                          :disabled="disabled"
                          :multivalue="property.multivalue"
                          :multilanguage="true"
                          :current-language="lang.value"
                          :value-type="property.valueType"
                          :dictionary="property.dictionary"
                          :name="property.name"
                          :rules="{
                            min: property.validationRule?.charCountMin,
                            max: property.validationRule?.charCountMax,
                            regex: property.validationRule?.regExp,
                          }"
                          :display-names="property.displayNames"
                          @update:model-value="setPropertyValue"
                        >
                        </VcDynamicProperty>
                      </div>
                    </div>
                    <div v-else>
                      <VcDynamicProperty
                        class="tw-pb-4"
                        :property="property"
                        :model-value="getPropertyValue(property, currentLocale)"
                        :options-getter="loadDictionaries"
                        :required="property.required"
                        :disabled="disabled"
                        :multivalue="property.multivalue"
                        :multilanguage="false"
                        :value-type="property.valueType"
                        :dictionary="property.dictionary"
                        :name="property.name"
                        :rules="{
                          min: property.validationRule?.charCountMin,
                          max: property.validationRule?.charCountMax,
                          regex: property.validationRule?.regExp,
                        }"
                        :display-names="property.displayNames"
                        @update:model-value="setPropertyValue"
                      >
                      </VcDynamicProperty>
                    </div>
                  </div>
                </div>
              </VcCard>

              <VcCard
                v-if="productDetails.categoryId"
                :header="$t('MP_PRODUCTS.PAGES.DETAILS.FIELDS.ASSETS.TITLE')"
                class="tw-my-3 tw-relative"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_gallery')"
                @state:collapsed="handleCollapsed('product_gallery', $event)"
              >
                <VcLoading :active="fileUploading"></VcLoading>
                <div class="tw-p-2">
                  <Field
                    v-slot="{ handleChange }"
                    name="gallery"
                    :model-value="productDetails.images"
                  >
                    <VcGallery
                      :images="productDetails.images"
                      :disabled="disabled"
                      :multiple="true"
                      @upload="onGalleryUpload"
                      @item:edit="onGalleryItemEdit"
                      @item:remove="onGalleryImageRemove"
                      @sort="
                        (e) => {
                          handleChange(e);
                          editImages(e as Image[]);
                        }
                      "
                    ></VcGallery>
                  </Field>
                </div>
              </VcCard>
            </VcForm>
          </div>
        </div>
        <div class="product-details__widgets">
          <VcWidget
            icon="fas fa-tags"
            :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.OFFERS')"
            :value="offersCount"
            :disabled="!(product as ISellerProduct).isPublished"
            @click="openOffers"
          >
          </VcWidget>
          <VcWidget
            icon="far fa-file"
            :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.ASSETS')"
            :value="assetsCount"
            :disabled="disabled"
            @click="openAssets"
          >
          </VcWidget>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, unref, markRaw, watch } from "vue";
import {
  useUser,
  IParentCallArgs,
  IBladeToolbar,
  AssetsDetails,
  AssetsManager,
  useBladeNavigation,
  usePopup,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { useProduct } from "../composables";
import { useOffers } from "../../offers/composables";
import MpProductStatus from "../components/MpProductStatus.vue";
import { OffersList } from "../../offers";
import * as _ from "lodash-es";
import {
  IImage,
  IProperty,
  IPropertyValue,
  ISellerProduct,
  Category,
  Image,
  Asset,
  Property,
  PropertyValue,
  PropertyDictionaryItem,
  EditorialReview,
  PropertyValueValueType,
  IProductDetails,
} from "../../../api_client/marketplacevendor";
import { useIsFormValid, Field, useForm } from "vee-validate";
import { min, required } from "@vee-validate/rules";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  url: "/mp-product",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { openBlade } = useBladeNavigation();
const { showConfirmation, showError } = usePopup();

const { t } = useI18n({ useScope: "global" });
const {
  product: productData,
  productDetails,
  loading,
  validateProduct,
  loadProduct,
  createProduct,
  updateProductDetails,
  fetchCategories,
  revertStagedChanges,
  searchDictionaryItems,
  getLanguages,
} = useProduct();

const { searchOffers } = useOffers();
const { getAccessToken, user } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const offersCount = ref(0);
const productLoading = ref(false);
const fileUploading = ref(false);
const fileAssetUploading = ref(false);
let isOffersOpened = false;
let isAssetsOpened = false;
const categoryLoading = ref(false);
const currentCategory = ref<Category>();
let productDetailsCopy: IProductDetails;
const modified = ref(false);

const filterTypes = ["Category", "Variation"];

const filteredProps = computed(() => productDetails.value.properties.filter((x) => !filterTypes.includes(x.type)));

const product = computed(() => (props.param ? productData.value : productDetails.value));

const disabled = computed(() => props.param && !productData.value?.canBeModified);

const assetsDisabled = computed(() => disabled.value || productData.value.createdBy !== user.value?.userName);

const assetsCount = computed(() => productDetails.value && productDetails.value?.assets?.length);

const validateGtin = [
  (value: string): string | boolean => {
    return min(value, [3]);
  },
  (value: string): string | boolean => {
    return required(value);
  },
  async (value: string): Promise<string | boolean> => await validate("gtin", value),
];

let languages: string[];
let localesOptions;
const currentLocale = ref("en-US");

const setLocale = (locale: string) => {
  currentLocale.value = locale;
};

watch(
  () => productDetails,
  (state) => {
    if (productDetailsCopy) {
      modified.value = !_.isEqual(productDetailsCopy, state.value);
    }
  },
  { deep: true }
);

const validate = _.debounce(
  async (fieldName: string, value: string): Promise<string | boolean> => {
    const sellerProduct = {
      ...product.value,
      [fieldName]: value,
    } as ISellerProduct;
    const productErrors = await validateProduct(sellerProduct);
    const errors = productErrors?.filter((error) => error.propertyName.toLowerCase() === fieldName.toLowerCase());
    return (
      !errors ||
      errors.length === 0 ||
      errors
        .map((error) =>
          t(`MP_PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
            value: error?.attemptedValue,
          })
        )
        .join("\n")
    );
  },
  1000,
  { leading: true, trailing: false }
);

const reload = async (fullReload: boolean) => {
  languages = await getLanguages();
  localesOptions = languages.map((x) => ({ label: t(`MP_PRODUCTS.PAGES.DETAILS.LANGUAGES.${x}`, x), value: x }));

  if (!modified.value && fullReload) {
    try {
      productLoading.value = true;
      if (props.param) {
        await loadProduct({ id: props.param });
      }
    } finally {
      productLoading.value = false;
      categoryLoading.value = false;
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
  } else {
    productDetails.value.descriptions = productDetails.value.descriptions.concat(
      languages.map(
        (x) =>
          new EditorialReview({
            languageCode: x,
            content: "",
            reviewType: "QuickReview",
          })
      )
    );
  }
  productDetailsCopy = _.cloneDeep(productDetails.value);
};

onMounted(async () => {
  await reload(true);
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("MP_PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.TITLE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isValid.value) {
        if (props.param) {
          await updateProductDetails(productData.value.id, productDetails.value);
        } else {
          await createProduct(productDetails.value);
        }
        productDetailsCopy = _.cloneDeep(productDetails.value);
        modified.value = false;
        emit("parent:call", {
          method: "reload",
        });
        if (!props.param) {
          emit("close:blade");
        }
      } else {
        showError(unref(computed(() => t("MP_PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.NOT_VALID"))));
      }
    },
    disabled: computed(
      () =>
        !modified.value ||
        !isValid.value ||
        (props.param && !(productData.value?.canBeModified || modified.value)) ||
        (!props.param && !modified.value)
    ),
  },
  {
    id: "saveAndSendToApprove",
    title: computed(() => t("MP_PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.TITLE")),
    icon: "fas fa-share-square",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      if (isValid.value) {
        await updateProductDetails(productData.value.id, { ...productDetails.value }, true);
        emit("parent:call", {
          method: "reload",
        });
        if (!props.param) {
          emit("close:blade");
        }
      } else {
        showError(unref(computed(() => t("MP_PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.NOT_VALID"))));
      }
    },
    disabled: computed(
      () =>
        !isValid.value || !(productData.value?.canBeModified && (productData.value?.hasStagedChanges || modified.value))
    ),
  },
  {
    id: "revertStagedChanges",
    title: computed(() => t("MP_PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT")),
    icon: "fas fa-undo",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      await revertStagedChanges(productData.value.id);
      emit("parent:call", {
        method: "reload",
      });
    },
    disabled: computed(
      () => !(productData.value?.isPublished && productData.value?.hasStagedChanges && productData.value?.canBeModified)
    ),
  },
]);

const statusText = computed(() => {
  if (productData.value.publicationRequests && productData.value.publicationRequests.length) {
    return _.orderBy(productData.value.publicationRequests, ["createdDate"], ["desc"])[0].comment;
  }
  return null;
});

const onGalleryUpload = async (files: FileList) => {
  try {
    fileUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/assets?folderUrl=/catalog/${productData.value.id || productData.value.categoryId}`,
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
        if (productDetails.value.images && productDetails.value.images.length) {
          const lastImageSortOrder = productDetails.value.images[productDetails.value.images.length - 1].sortOrder;
          image.sortOrder = lastImageSortOrder + 1;
        } else {
          image.sortOrder = 0;
        }
        productDetails.value.images.push(image);
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    fileUploading.value = false;
  }

  files = null;
};

const onGalleryItemEdit = (item: Image) => {
  openBlade({
    blade: markRaw(AssetsDetails),
    options: {
      asset: item,
      assetEditHandler: editImage,
      assetRemoveHandler: removeImage,
    },
  });
};

function editImage(localImage: IImage) {
  const images = productDetails.value.images;
  const image = new Image(localImage);
  if (images.length) {
    const imageIndex = images.findIndex((img) => img.id === localImage.id);

    images[imageIndex] = image;

    editImages(images);
  }
}

async function removeImage(localImage: IImage) {
  if (await showConfirmation(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION"))))) {
    const images = productDetails.value.images;
    if (images.length) {
      const imageIndex = images.findIndex((img) => img.id === localImage.id);

      images.splice(imageIndex, 1);

      editImages(images);
    }
  }
}

const editImages = (args: Image[]) => {
  productDetails.value.images = args;
};

const onGalleryImageRemove = async (image: Image) => {
  if (await showConfirmation(unref(computed(() => t("MP_PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION"))))) {
    const imageIndex = productDetails.value.images.findIndex((img) => {
      if (img.id && image.id) {
        return img.id === image.id;
      } else {
        return img.url === image.url;
      }
    });
    productDetails.value.images.splice(imageIndex, 1);
  }
};

const onAssetsUpload = async (files: FileList): Promise<Asset[]> => {
  try {
    fileAssetUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/assets?folderUrl=/catalog/${productData.value.id || productData.value.categoryId}`,
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

        if (productDetails.value.assets && productDetails.value.assets.length) {
          const lastAssetSortOrder = productDetails.value.assets[productDetails.value.assets.length - 1].sortOrder;
          asset.sortOrder = lastAssetSortOrder + 1;
        } else {
          asset.sortOrder = 0;
        }
        productDetails.value.assets.push(asset);
        return productDetails.value.assets;
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

const onAssetsItemRemove = async (assets: Asset[]): Promise<Asset[]> => {
  if (await showConfirmation(unref(computed(() => t("MP_PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION"))))) {
    assets.forEach((asset) => {
      const assetIndex = productDetails.value.assets.findIndex((asst) => {
        if (asst.id && asset.id) {
          return asst.id === asset.id;
        } else {
          return asst.url === asset.url;
        }
      });
      productDetails.value.assets.splice(assetIndex, 1);
    });
  }
  return productDetails.value.assets;
};

const onAssetsEdit = (assets: Asset[]): Asset[] => {
  productDetails.value.assets = assets.map((item) => new Asset(item));

  return productDetails.value.assets;
};

const setCategory = async (selectedCategory: Category) => {
  currentCategory.value = selectedCategory;
  productDetails.value.categoryId = selectedCategory.id;
  const currentProperties = [...(productDetails.value?.properties || [])];
  productDetails.value.properties = [
    ...(selectedCategory.properties?.map((prop) => new Property({ ...prop, isReadOnly: false })) || []),
  ];
  productDetails.value.properties.forEach((property) => {
    const previousPropertyValue = currentProperties?.find((item) => item.id === property.id);
    if (previousPropertyValue) {
      property.values = previousPropertyValue.values.map((item) => new PropertyValue(item));
    }
  });
};

async function loadDictionaries(property: Property, keyword?: string, locale?: string) {
  let dictionaryItems = await searchDictionaryItems([property.id], keyword, 0);
  if (locale) {
    dictionaryItems = dictionaryItems.map((x) =>
      Object.assign(x, { value: x.localizedValues.find((v) => v.languageCode == locale)?.value ?? x.alias })
    );
  }
  return dictionaryItems;
}

async function openOffers() {
  if (!isOffersOpened) {
    openBlade({
      blade: markRaw(OffersList),
      options: {
        sellerProduct: productData.value,
      },
      onOpen() {
        isOffersOpened = true;
      },
      onClose() {
        isOffersOpened = false;
      },
    });
  }
}

async function openAssets() {
  if (!isAssetsOpened) {
    openBlade({
      blade: markRaw(AssetsManager),
      options: {
        assets: productDetails.value.assets,
        assetsEditHandler: onAssetsEdit,
        assetsUploadHandler: onAssetsUpload,
        assetsRemoveHandler: onAssetsItemRemove,
        disabled: assetsDisabled.value,
      },
      onOpen() {
        isAssetsOpened = true;
      },
      onClose() {
        isAssetsOpened = false;
      },
    });
  }
}

async function onBeforeClose() {
  if (modified.value) {
    return await showConfirmation(unref(computed(() => t("MP_PRODUCTS.PAGES.DETAILS.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

function handleDictionaryValue(
  property: IProperty,
  valueId: string,
  dictionary: PropertyDictionaryItem[],
  locale?: string
) {
  let valueValue;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (!dictionaryItem) {
    return undefined;
  }

  if (dictionaryItem["value"]) {
    valueValue = dictionaryItem["value"];
  } else {
    valueValue = dictionaryItem.alias;
  }

  return {
    propertyId: dictionaryItem.propertyId,
    alias: dictionaryItem.alias,
    languageCode: locale,
    value: valueValue,
    valueId: valueId,
  };
}

function setPropertyValue(data: {
  property: Property;
  value: string | IPropertyValue[];
  dictionary?: PropertyDictionaryItem[];
  locale?: string;
}) {
  const { property, value, dictionary, locale } = data;

  let mutatedProperty: PropertyValue[];
  if (dictionary && dictionary.length) {
    if (property.multilanguage) {
      if (Array.isArray(value)) {
        mutatedProperty = value.map((item) => {
          if (dictionary.find((x) => x.id === item.valueId)) {
            return new PropertyValue(handleDictionaryValue(property, item.valueId, dictionary, locale));
          } else {
            return new PropertyValue(item);
          }
        });
      } else {
        mutatedProperty = [new PropertyValue(handleDictionaryValue(property, value, dictionary, locale))];
      }
    } else {
      mutatedProperty = Array.isArray(value)
        ? value.map((item) => {
            if (dictionary.find((x) => x.id === item.id)) {
              const handledValue = handleDictionaryValue(property, item.id, dictionary);
              return new PropertyValue(handledValue);
            } else return new PropertyValue(item);
          })
        : [new PropertyValue(handleDictionaryValue(property, value, dictionary))];
    }
  } else {
    if (property.multilanguage) {
      if (Array.isArray(value)) {
        mutatedProperty = [
          ...property.values.filter((x) => x.languageCode !== locale),
          ...value.map((item) => new PropertyValue(item)),
        ];
      } else {
        if (property.values.find((x) => x.languageCode == locale)) {
          property.values.find((x) => x.languageCode == locale).value = value;
          mutatedProperty = property.values;
        } else {
          mutatedProperty = [new PropertyValue({ value: value, isInherited: false, languageCode: locale })];
        }
      }
    } else {
      mutatedProperty = Array.isArray(value)
        ? value.map((item) => new PropertyValue(item))
        : property.values[0]
        ? [Object.assign(property.values[0], { value: value })]
        : [new PropertyValue({ value: value, isInherited: false })];
    }
  }

  productDetails.value.properties.forEach((prop) => {
    if (prop.id === property.id) {
      prop.values = mutatedProperty;
    }
  });
}

function getPropertyValue(property: Property, locale: string) {
  if (property.multilanguage) {
    if (property.multivalue) {
      return property.values.filter((x) => x.languageCode == locale);
    } else if (property.values.find((x) => x.languageCode == locale) == undefined) {
      property.values.push(
        new PropertyValue({
          propertyName: property.name,
          propertyId: property.id,
          languageCode: locale,
          valueType: property.valueType as unknown as PropertyValueValueType,
        })
      );
    }

    if (property.dictionary) {
      return (
        property.values.find((x) => x.languageCode == locale) &&
        property.values.find((x) => x.languageCode == locale).valueId
      );
    }
    return property.values.find((x) => x.languageCode == locale).value;
  } else {
    if (property.multivalue) {
      return property.values;
    }
    if (property.dictionary) {
      return property.values[0] && property.values[0].valueId;
    }
    return property.values[0] && property.values[0].value;
  }
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
