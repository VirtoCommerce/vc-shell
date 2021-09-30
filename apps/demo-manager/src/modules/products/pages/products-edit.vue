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
    <!-- Blade contents -->
    <vc-container :no-padding="true">
      <div
        v-if="productDetails"
        class="product-details__inner vc-flex vc-flex-grow_1"
      >
        <div class="product-details__content vc-flex-grow_1">
          <div class="vc-padding_l">
            <div v-if="param" class="vc-margin-bottom_l">
              <mp-product-status :status="product.status"></mp-product-status>
            </div>
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
                :error="
                  validator.categoryId.$errors[0] &&
                  validator.categoryId.$errors[0].$message
                "
              ></vc-select>
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
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                v-model="productDetails.description"
                :required="true"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
                :error="
                  validator.description.$errors[0] &&
                  validator.description.$errors[0].$message
                "
              ></vc-textarea>
              <vc-gallery
                v-if="param"
                label="Gallery"
                :images="productDetails.images"
                @upload="onGalleryUpload"
                @item:edit="onGalleryItemEdit"
              ></vc-gallery>
            </vc-form>
          </div>
        </div>
        <div v-if="param" class="product-details__widgets">
          <div class="vc-widget">
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-file-alt"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Offers</div>
            <div class="vc-widget__value">3</div>
          </div>
          <div class="vc-widget">
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-comment"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Comments</div>
            <div class="vc-widget__value">22</div>
          </div>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useI18n } from "@virtoshell/core";
import { useProduct } from "../composables";
import { ICategory, Image } from "@virtoshell/api-client";
import MpProductStatus from "../components/MpProductStatus.vue";
import { AssetsDetails } from "@virtoshell/mod-assets";
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
      changeProductStatus,
    } = useProduct();

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
    });

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        onClick: async () => {
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
        onClick: async () => {
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
        onClick: async () => {
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
      {
        id: "approve",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.APPROVE"),
        icon: "fas fa-check-circle",
        isVisible: computed(() => !!props.param),
        onClick: async () => {
          await changeProductStatus(product.value.id, "Approved");
          emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "requestChanges",
        title: "Request changes (test only)",
        icon: "fas fa-sticky-note",
        isVisible: computed(() => !!props.param),
        onClick: async () => {
          await changeProductStatus(product.value.id, "RequestChanges");
          emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "reject",
        title: "Reject (test only)",
        icon: "fas fa-ban",
        isVisible: computed(() => !!props.param),
        onClick: async () => {
          await changeProductStatus(product.value.id, "Rejected");
          emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "close",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        onClick: () => {
          emit("page:close");
        },
      },
    ]);

    const onGalleryUpload = async (files: FileList) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      const result = await fetch(
        `/api/platform/assets?folderUrl=/catalog/${product.value.id}`,
        {
          method: "POST",
          body: formData,
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

    return {
      bladeToolbar,
      category: computed(() =>
        categories.value?.find((x) => x.id === productDetails.categoryId)
      ),
      onCategoriesSearch: async (value: string) => {
        categories.value = await fetchCategories(value);
      },
      validator,

      categories,
      product: computed(() => (props.param ? product.value : productDetails)),
      productDetails,
      loading: computed(() => loading.value),
      onGalleryUpload,
      onGalleryItemEdit,
      async onBeforeClose() {
        if (modified.value) {
          return confirm("You have unsaved changes\nClose anyway?");
        }
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
  }

  &__content {
    border-right: 1px solid #eaedf3;
  }

  .vc-app_phone &__inner {
    flex-direction: column;
  }

  .vc-app_phone &__content {
    border-right: none;
    border-bottom: 1px solid #eaedf3;
  }

  .vc-app_phone &__widgets {
    display: flex;
    flex-direction: row;
  }
}

.vc-widget {
  display: flex;
  width: 100px;
  overflow: hidden;
  padding: var(--padding-xl);
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eaedf3;
  cursor: pointer;
  background-color: #ffffff;

  &:hover {
    background-color: #dfeef9;
  }

  &__icon {
    color: #a9bfd2;
  }

  &__title {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-s);
    color: #333333;
    margin: var(--margin-m) 0 var(--margin-xs);
  }

  &__value {
    font-weight: var(--font-weight-medium);
    font-size: 22px;
    color: #43b0e6;
  }
}
</style>
