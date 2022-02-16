<template>
  <vc-blade
    v-loading="loading || !currentCategory"
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
    <vc-container :no-padding="true">
      <div
        v-if="productDetails"
        class="product-details__inner vc-flex vc-flex-grow_1"
      >
        <div class="product-details__content vc-flex-grow_1">
          <div class="vc-padding_l">
            <vc-status
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
            </vc-status>
            <vc-form>
              <vc-input
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
              ></vc-input>
              <vc-select
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
              ></vc-select>

              <vc-card
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_properties')"
                v-if="product.id || currentCategory"
                @state:collapsed="handleCollapsed('product_properties', $event)"
              >
                <div class="vc-padding_l">
                  <vc-input
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
                  ></vc-input>
                  <vc-textarea
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
                  ></vc-textarea>

                  <vc-dynamic-property
                    v-for="property in productDetails.properties"
                    :key="property.id"
                    :property="property"
                    :optionsGetter="loadDictionaries"
                    :getter="getPropertyValue"
                    :setter="setPropertyValue"
                    class="vc-margin-bottom_l"
                    :disabled="readonly"
                  >
                  </vc-dynamic-property>
                </div>
              </vc-card>

              <vc-card
                v-if="param"
                :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
                class="vc-margin-vertical_m"
                is-collapsable
                :is-collapsed="restoreCollapsed('product_gallery')"
                @state:collapsed="handleCollapsed('product_gallery', $event)"
              >
                <div class="vc-padding_s">
                  <vc-gallery
                    :images="productDetails.images"
                    @upload="onGalleryUpload"
                    @item:edit="onGalleryItemEdit"
                    @item:remove="onGalleryImageRemove"
                    :disabled="readonly"
                    @sort="onGallerySort"
                  ></vc-gallery>
                </div>
              </vc-card>
            </vc-form>
          </div>
        </div>
        <div class="product-details__widgets">
          <vc-widget
            icon="fas fa-file-alt"
            title="Offers"
            :value="offersCount"
            :disabled="!product.isPublished"
            @click="openOffers"
          >
          </vc-widget>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from "vue";
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
} from "@virtoshell/api-client";
import MpProductStatus from "../components/MpProductStatus.vue";
import { AssetsDetails } from "@virtoshell/mod-assets";
import { OffersList } from "../../offers";
import { IBladeToolbar } from "../../../types";
import _ from "lodash";

export default defineComponent({
  url: "product",

  components: {
    MpProductStatus,
  },

  props: {
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
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const { validate } = useForm({ validateOnMount: false });
    const {
      modified,
      product,
      productDetails,
      loading,
      loadProduct,
      createProduct,
      updateProductDetails,
      fetchCategories,
      revertStagedChanges,
      searchDictionaryItems,
    } = useProduct();

    const { searchOffers } = useOffers();
    const { getAccessToken } = useUser();
    const { debounce } = useFunctions();

    const currentCategory = ref();
    const offersCount = ref(0);
    const categories = ref<ICategory[]>();

    const reload = async (fullReload: boolean) => {
      if (!modified.value && fullReload) {
        if (props.param) {
          await loadProduct({ id: props.param });
        }
        categories.value = await fetchCategories();
        if (productDetails?.categoryId) {
          currentCategory.value = categories.value?.find(
            (x) => x.id === productDetails.categoryId
          );
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

    const editImages = (args: Image[]) => {
      productDetails.images = args;
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
                await updateProductDetails(product.value.id, productDetails);
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
                computed(() =>
                  t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE.NOT_VALID")
                )
              )
            );
          }
        },
        disabled: computed(
          () =>
            (props.param &&
              (!product.value?.canBeModified || !modified.value)) ||
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
                product.value.id,
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
              product.value?.canBeModified &&
              (product.value?.hasStagedChanges || modified.value)
            )
        ),
      },
      {
        id: "revertStagedChanges",
        title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT")),
        icon: "fas fa-undo",
        isVisible: computed(() => !!props.param),
        async clickHandler() {
          await revertStagedChanges(product.value.id);
          emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(
          () =>
            !(
              product.value?.isPublished &&
              product.value?.hasStagedChanges &&
              product.value?.canBeModified
            )
        ),
      },
    ]);

    const statusText = computed(() => {
      if (
        product.value.publicationRequests &&
        product.value.publicationRequests.length
      ) {
        return _.orderBy(
          product.value.publicationRequests,
          ["createdDate"],
          ["desc"]
        )[0].comment;
      }
      return null;
    });

    const onGalleryUpload = async (files: FileList) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/platform/assets?folderUrl=/catalog/${product.value.id}`,
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

    let isOffersOpened = false;

    return {
      bladeToolbar,
      category: computed(() =>
        categories.value?.find((x) => x.id === productDetails.categoryId)
      ),
      currentCategory,
      setCategory,
      onCategoriesSearch: debounce(async (value: string) => {
        categories.value = await fetchCategories(value);
      }, 500),
      offersCount,
      categories,
      product: computed(() => (props.param ? product.value : productDetails)),
      productDetails,
      readonly: computed(() => props.param && !product.value?.canBeModified),
      statusText,
      reload,
      editImages,
      loading: computed(() => loading.value),
      onGalleryUpload,
      onGalleryItemEdit,
      onGallerySort,
      onGalleryImageRemove,
      async openOffers() {
        if (!isOffersOpened) {
          emit("page:open", {
            component: OffersList,
            componentOptions: {
              sellerProduct: product.value,
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
      },
      async onBeforeClose() {
        if (modified.value) {
          return confirm(
            unref(
              computed(() =>
                t("PRODUCTS.PAGES.DETAILS.ALERTS.CLOSE_CONFIRMATION")
              )
            )
          );
        }
      },

      setPropertyValue(property: IProperty, value: IPropertyValue) {
        if (
          typeof value === "object" &&
          Object.prototype.hasOwnProperty.call(value, "length")
        ) {
          property.values = (value as IPropertyValue[]).map(
            (item) => new PropertyValue(item)
          );
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
      },

      getPropertyValue(property: IProperty): Record<string, unknown> {
        return property.values[0] && property.values[0].value;
      },

      async loadDictionaries(
        property: IProperty,
        keyword?: string,
        skip?: number
      ) {
        return await searchDictionaryItems([property.id], keyword, skip);
      },

      handleCollapsed(key: string, value: boolean): void {
        localStorage?.setItem(key, `${value}`);
      },

      restoreCollapsed(key: string): boolean {
        return localStorage?.getItem(key) === "true";
      },
    };
  },
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
