<template>
  <vc-blade
    v-loading="loading"
    :title="param ? productDetails?.name : $t('PRODUCTS.PAGES.DETAILS.TITLE')"
    width="600"
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
                :error="
                  validator.name.$errors[0] &&
                  validator.name.$errors[0].$message
                "
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
                @update:modelValue="setCategory"
                :error="
                  validator.categoryId.$errors[0] &&
                  validator.categoryId.$errors[0].$message
                "
              ></vc-select>

              <vc-card
                header="Properties"
                is-collapsable
                v-if="product.id || currentCategory"
                v-loading="!currentCategory"
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
                    :error="
                      validator.gtin.$errors[0] &&
                      validator.gtin.$errors[0].$message
                    "
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
                    :error="
                      validator.description.$errors[0] &&
                      validator.description.$errors[0].$message
                    "
                  ></vc-textarea>

                  <div
                    v-for="property in productDetails.properties"
                    :key="property.id"
                  >
                    <vc-select
                      v-if="property.dictionary"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      :isRequired="property.required"
                      :placeholder="property.displayNames[0].name"
                      :options="dictionaries[property.id]"
                      keyProperty="id"
                      displayProperty="alias"
                    ></vc-select>

                    <vc-input
                      v-else-if="property.valueType === 'ShortText'"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      :clearable="true"
                      :required="property.required"
                      :placeholder="property.displayNames[0].name"
                    ></vc-input>

                    <vc-input
                      v-else-if="property.valueType === 'Number'"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      :clearable="true"
                      type="number"
                      :required="property.required"
                      :placeholder="property.displayNames[0].name"
                    ></vc-input>

                    <vc-input
                      v-else-if="property.valueType === 'Integer'"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      :clearable="true"
                      type="number"
                      step="1"
                      :required="property.required"
                      :placeholder="property.displayNames[0].name"
                    ></vc-input>

                    <vc-input
                      v-else-if="property.valueType === 'DateTime'"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      type="datetime-local"
                      :required="property.required"
                      :placeholder="property.displayNames[0].name"
                    ></vc-input>

                    <vc-textarea
                      v-else-if="property.valueType === 'LongText'"
                      class="vc-margin-bottom_l"
                      :label="property.displayNames[0].name || property.name"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      :required="property.required"
                      :placeholder="property.displayNames[0].name"
                    ></vc-textarea>

                    <vc-checkbox
                      v-else-if="property.valueType === 'Boolean'"
                      :modelValue="getPropertyValue(property)"
                      @update:modelValue="setPropertyValue(property, $event)"
                      class="vc-margin-bottom_l"
                    >
                      {{ property.displayNames[0].name || property.name }}
                    </vc-checkbox>
                  </div>
                </div>
              </vc-card>

              <vc-card
                header="Images"
                class="vc-margin-vertical_m"
                is-collapsable
                is-collapsed
              >
                <div class="vc-padding_l">
                  <vc-gallery
                    v-if="param"
                    :images="productDetails.images"
                    @upload="onGalleryUpload"
                    @item:edit="onGalleryItemEdit"
                  ></vc-gallery>
                </div>
              </vc-card>
            </vc-form>
          </div>
        </div>
        <div v-if="param" class="product-details__widgets">
          <vc-widget
            icon="fas fa-file-alt"
            title="Offers"
            value="3"
            @click="openOffers"
          >
          </vc-widget>
          <vc-widget icon="fas fa-comment" title="Comments" value="22">
          </vc-widget>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  unref,
} from "vue";
import { useI18n, useUser } from "@virtoshell/core";
import { useProduct } from "../composables";
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
import { useVuelidate } from "@vuelidate/core";
import { minLength, required } from "@vuelidate/validators";

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

    const currentCategory = ref();
    const { getAccessToken } = useUser();

    const dictionaries = reactive({});

    const rules = computed(() => ({
      name: {
        required,
        minLength: minLength(3),
      },
      categoryId: {
        required,
      },
      gtin: {
        required,
        minLength: minLength(3),
      },
      description: {
        required,
        minLength: minLength(10),
      },
    }));

    const validator = useVuelidate(rules, productDetails, { $autoDirty: true });

    const categories = ref<ICategory[]>();

    onMounted(async () => {
      if (props.param) {
        await loadProduct({ id: props.param });
      }
      categories.value = await fetchCategories();
      if (productDetails?.categoryId) {
        currentCategory.value = categories.value?.find(
          (x) => x.id === productDetails.categoryId
        );
      }
      productDetails?.properties?.forEach(async (property) => {
        if (property.dictionary) {
          dictionaries[property.id] = await searchDictionaryItems([
            property.id,
          ]);
        }
      });
    });

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        async clickHandler() {
          // @ts-ignore
          if (await validator.value.$validate()) {
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
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE"),
        icon: "fas fa-share-square",
        isVisible: computed(() => !!props.param),
        async clickHandler() {
          // @ts-ignore
          if (await validator.value.$validate()) {
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
          }
        },
        disabled: computed(
          () =>
            props.param && (!product.value?.canBeModified || !modified.value)
        ),
      },
      {
        id: "revertStagedChanges",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT"),
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
              product.value.canBeModified
            )
        ),
      },
    ]);

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
        productDetails.images.push(image);
      }
      files = null;
    };

    const onGalleryItemEdit = (item: Record<string, Image>) => {
      emit("page:open", {
        component: AssetsDetails,
        componentOptions: item,
      });
    };

    const setCategory = async (id: string) => {
      currentCategory.value = categories.value?.find((x) => x.id === id);
      Object.keys(dictionaries).forEach(
        (item) => (dictionaries[item] = undefined)
      );
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
        if (property.dictionary) {
          dictionaries[property.id] = await searchDictionaryItems([
            property.id,
          ]);
        }
      });
    };

    return {
      bladeToolbar,
      category: computed(() =>
        categories.value?.find((x) => x.id === productDetails.categoryId)
      ),
      currentCategory,
      setCategory,
      onCategoriesSearch: async (value: string) => {
        categories.value = await fetchCategories(value);
      },
      validator,
      dictionaries,
      categories,
      product: computed(() => (props.param ? product.value : productDetails)),
      productDetails,
      loading: computed(() => loading.value),
      onGalleryUpload,
      onGalleryItemEdit,
      async openOffers() {
        emit("page:open", {
          component: OffersList,
          componentOptions: {
            sellerProductId: product.value?.id,
          },
          url: null,
        });
      },
      async onBeforeClose() {
        if (modified.value) {
          return confirm("You have unsaved changes\nClose anyway?");
        }
      },

      setPropertyValue(property: IProperty, value: IPropertyValue) {
        if (property.values[0]) {
          property.values[0].value = value;
        } else {
          property.values[0] = new PropertyValue({ value, isInherited: false });
        }
      },

      getPropertyValue(property: IProperty) {
        return property.values[0] && property.values[0].value;
      },
    };
  },
});
</script>

<style lang="less">
.product-details {
  &__inner {
    border-top: 1px solid #eaedf3;
    overflow: hidden;
    min-height: 100%;
  }

  &__content {
    border-right: 1px solid #eaedf3;
    overflow: hidden;
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
