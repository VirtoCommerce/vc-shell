<template>
  <VcBlade
    v-loading="loading || productLoading"
    :title="param ? productDetails?.name : $t('PRODUCTS.PAGES.DETAILS.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <template v-slot:actions>
      <mp-product-status :status="(product as ISellerProduct).status"></mp-product-status>
    </template>

    <!-- Blade contents -->
    <VcContainer :no-padding="true">
      <div
        v-if="productDetails"
        class="product-details__inner"
      >
        <div class="product-details__content">
          <div class="tw-p-4">
            <VcStatus
              :outline="false"
              :extend="true"
              variant="light-danger"
              class="tw-w-full tw-box-border tw-mb-5"
              v-if="statusText && (product as ISellerProduct).status !== 'Published'"
            >
              <div class="tw-flex tw-flex-row tw-items-center">
                <VcIcon
                  icon="fas fa-exclamation-circle"
                  class="product-details__decline-icon"
                  size="xxl"
                ></VcIcon>
                <div>
                  <div class="tw-font-bold">
                    {{ $t("PRODUCTS.PAGES.DETAILS.DECLINE_REASON") }}
                  </div>
                  <div>{{ statusText }}</div>
                </div>
              </div>
            </VcStatus>
            <VcForm>
              <Field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                name="name"
                rules="required|min:3"
                :modelValue="productDetails.name"
                v-slot="{ field, errorMessage, handleChange, errors }"
              >
                <VcInput
                  v-bind="field"
                  class="tw-mb-4"
                  :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  v-model="productDetails.name"
                  :clearable="true"
                  :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                  :disabled="disabled"
                  maxlength="64"
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  @update:modelValue="handleChange"
                >
                </VcInput>
              </Field>
              <Field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                name="categoryId"
                rules="required"
                :modelValue="productDetails.categoryId"
                v-slot="{ field, errorMessage, handleChange, errors }"
              >
                <VcSelect
                  v-bind="field"
                  class="tw-mb-4"
                  :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                  :model-value="productDetails.categoryId"
                  searchable
                  :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')"
                  :options="fetchCategories"
                  option-value="id"
                  option-label="name"
                  :tooltip="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TOOLTIP')"
                  @update:modelValue="
                    (e) => {
                      handleChange(e.categoryId);
                      setCategory(e);
                    }
                  "
                  :disabled="disabled"
                  required
                  :error="!!errors.length"
                  :error-message="errorMessage"
                  :clearable="false"
                  :emit-value="false"
                >
                  <template
                    v-for="item in ['option', 'selected-item']"
                    v-slot:[item]="scope"
                    :key="item"
                  >
                    <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
                      <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
                        <div class="tw-truncate">
                          {{ scope.opt.path }}
                        </div>
                        <VcHint class="tw-truncate tw-mt-1">
                          {{ $t("PRODUCTS.PAGES.DETAILS.FIELDS.CODE") }}:
                          {{ scope.opt.code }}
                        </VcHint>
                      </div>
                    </div>
                  </template>
                </VcSelect>
              </Field>
              <VcCard
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_properties')"
                v-if="(product as ISellerProduct).id || currentCategory"
                @state:collapsed="handleCollapsed('product_properties', $event)"
              >
                <div class="tw-p-4">
                  <Field
                    :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                    name="gtin"
                    :rules="validateGtin"
                    :modelValue="productDetails.gtin"
                    v-slot="{ field, errorMessage, handleChange, errors }"
                  >
                    <VcInput
                      v-bind="field"
                      class="tw-mb-4"
                      :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                      v-model="productDetails.gtin"
                      :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')"
                      :tooltip="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TOOLTIP')"
                      :disabled="disabled"
                      maxlength="64"
                      required
                      clearable
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:modelValue="handleChange"
                    ></VcInput>
                  </Field>
                  <Field
                    :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                    name="description"
                    rules="min:3|required"
                    :modelValue="productDetails.description"
                    v-slot="{ field, errorMessage, handleChange }"
                  >
                    <VcTextarea
                      v-bind="field"
                      class="tw-mb-4"
                      :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                      v-model="productDetails.description"
                      :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                      :disabled="disabled"
                      name="description"
                      required
                      :error-message="errorMessage"
                      @update:modelValue="handleChange"
                    ></VcTextarea>
                  </Field>

                  <VcDynamicProperty
                    v-for="property in filteredProps"
                    :key="property.id"
                    :property="property"
                    :optionsGetter="loadDictionaries"
                    :getter="getPropertyValue"
                    :setter="setPropertyValue"
                    class="tw-mb-4"
                    :disabled="disabled"
                  >
                  </VcDynamicProperty>
                </div>
              </VcCard>

              <VcCard
                v-if="productDetails.categoryId"
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
                class="tw-my-3 tw-relative"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_gallery')"
                @state:collapsed="handleCollapsed('product_gallery', $event)"
              >
                <VcLoading :active="fileUploading"></VcLoading>
                <div class="tw-p-2">
                  <VcGallery
                    :images="productDetails.images"
                    @upload="onGalleryUpload"
                    @item:edit="onGalleryItemEdit"
                    @item:remove="onGalleryImageRemove"
                    :disabled="disabled"
                    @sort="onGallerySort"
                    :multiple="true"
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
            :disabled="!(product as ISellerProduct).isPublished"
            @click="openOffers"
          >
          </VcWidget>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, unref, shallowRef, Ref } from "vue";

export default defineComponent({
  url: "/product",
});
</script>

<script lang="ts" setup>
import {
  useI18n,
  useUser,
  useForm,
  min,
  required,
  IParentCallArgs,
  IBladeEvent,
  IBladeToolbar,
  AssetsDetails,
  VcInput,
} from "@vc-shell/framework";
import { useProduct } from "../composables";
import { useOffers } from "../../offers/composables";
import MpProductStatus from "../components/MpProductStatus.vue";
import { OffersList } from "../../offers";
import { debounce, orderBy } from "lodash-es";
import {
  IImage,
  IProperty,
  IPropertyValue,
  ISellerProduct,
  Category,
  Image,
  Property,
  PropertyValue,
  PropertyDictionaryItem,
} from "../../../api_client/marketplacevendor";
import { useIsFormValid, Field } from "vee-validate";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export type IBladeOptions = IBladeEvent & {
  bladeOptions: {
    editableAsset?: Image;
    images?: Image[];
    sortHandler?: (remove: boolean, localImage: IImage) => void;
    sellerProduct?: ISellerProduct;
  };
};

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "open:blade", blade: IBladeOptions): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const {
  product: productData,
  productDetails,
  loading,
  modified,
  validateProduct,
  loadProduct,
  createProduct,
  updateProductDetails,
  fetchCategories,
  revertStagedChanges,
  searchDictionaryItems,
  deleteProduct,
} = useProduct();

const { searchOffers } = useOffers();
const { getAccessToken } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const offersCount = ref(0);
const productLoading = ref(false);
const fileUploading = ref(false);
let isOffersOpened = false;
const categoryLoading = ref(false);
const currentCategory = ref<Category>();

const filterTypes = ["Category", "Variation"];

const filteredProps = computed(() => productDetails.value.properties.filter((x) => !filterTypes.includes(x.type)));

const product = computed(() => (props.param ? productData.value : productDetails.value));

const disabled = computed(() => props.param && !productData.value?.canBeModified);

const validateGtin = [
  (value: string): string | boolean => {
    return min(value, [3]);
  },
  (value: string): string | boolean => {
    return required(value);
  },
  async (value: string): Promise<string | boolean> => await validate("gtin", value),
];

const validate = debounce(
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
          t(`PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
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
      if (isValid.value) {
        try {
          if (props.param) {
            await updateProductDetails(productData.value.id, productDetails.value);
          } else {
            await createProduct(productDetails.value);
          }
          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("close:blade");
          }
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.NOT_VALID"))));
      }
    },
    disabled: computed(
      () =>
        !isValid.value ||
        (props.param && !(productData.value?.canBeModified || modified.value)) ||
        (!props.param && !modified.value)
    ),
  },
  {
    id: "saveAndSendToApprove",
    title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.TITLE")),
    icon: "fas fa-share-square",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      if (isValid.value) {
        try {
          await updateProductDetails(productData.value.id, { ...productDetails.value }, true);
          emit("parent:call", {
            method: "reload",
          });
          if (!props.param) {
            emit("close:blade");
          }
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE.NOT_VALID"))));
      }
    },
    disabled: computed(
      () =>
        !isValid.value || !(productData.value?.canBeModified && (productData.value?.hasStagedChanges || modified.value))
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
      () => !(productData.value?.isPublished && productData.value?.hasStagedChanges && productData.value?.canBeModified)
    ),
  },
  {
    id: "delete",
    title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      if (window.confirm(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_PRODUCT"))))) {
        await deleteProduct(props.param);
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!props.param && !productLoading.value),
  },
]);

const statusText = computed(() => {
  if (productData.value.publicationRequests && productData.value.publicationRequests.length) {
    return orderBy(productData.value.publicationRequests, ["createdDate"], ["desc"])[0].comment;
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
  } finally {
    fileUploading.value = false;
  }

  files = null;
};

const onGalleryItemEdit = (item: Image) => {
  emit("open:blade", {
    component: shallowRef(AssetsDetails),
    bladeOptions: {
      editableAsset: item,
      images: productDetails.value.images,
      sortHandler: sortImage,
    },
  });
};

function sortImage(remove = false, localImage: IImage) {
  const images = productDetails.value.images;
  const image = new Image(localImage);
  if (images.length) {
    const imageIndex = images.findIndex((img) => img.id === localImage.id);

    remove ? images.splice(imageIndex, 1) : (images[imageIndex] = image);

    editImages(images);
  }
}

const editImages = (args: Image[]) => {
  productDetails.value.images = args;
};

const onGallerySort = (images: Image[]) => {
  productDetails.value.images = images;
};

const onGalleryImageRemove = (image: Image) => {
  if (window.confirm(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRMATION"))))) {
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

async function loadDictionaries(property: IProperty, keyword?: string, skip?: number) {
  return await searchDictionaryItems([property.id], keyword, skip);
}

async function openOffers() {
  if (!isOffersOpened) {
    emit("open:blade", {
      component: shallowRef(OffersList),
      bladeOptions: {
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

async function onBeforeClose() {
  if (modified.value) {
    return confirm(unref(computed(() => t("PRODUCTS.PAGES.DETAILS.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

function handleDictionaryValue(property: IProperty, valueId: string, dictionary: PropertyDictionaryItem[]) {
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

function setPropertyValue(property: IProperty, value: IPropertyValue, dictionary?: PropertyDictionaryItem[]) {
  if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "length")) {
    if (dictionary && dictionary.length) {
      property.values = (value as IPropertyValue[]).map((item) => {
        const handledValue = handleDictionaryValue(property, item.valueId, dictionary);
        return new PropertyValue(handledValue);
      });
    } else {
      property.values = (value as IPropertyValue[]).map((item) => new PropertyValue(item));
    }
  } else {
    if (dictionary && dictionary.length) {
      const handledValue = handleDictionaryValue(property, value as string, dictionary);
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

function getPropertyValue(property: IProperty, isDictionary?: boolean): Record<string, unknown> {
  if (isDictionary) {
    return property.values[0] && (property.values[0].valueId as unknown as Record<string, unknown>);
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
