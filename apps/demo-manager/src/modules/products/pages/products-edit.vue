<template>
  <vc-blade
    v-loading="loading"
    :uid="uid"
    :title="product?.sellerName"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$closeBlade(uid)"
  >
    <!-- Blade contents -->
    <mp-product-status :status="product.status"></mp-product-status>
    <div
      v-if="productDetails"
      class="product-details__inner vc-flex vc-flex-grow_1"
    >
      <div class="product-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
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
              ></vc-input>
              <vc-autocomplete
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                v-model="productDetails.categoryId"
                :required="true"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')
                "
                :options="categories"
              ></vc-autocomplete>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                v-model="productDetails.gtin"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')
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
              ></vc-textarea>
              <vc-gallery
                label="Gallery"
                :images="productDetails.images"
              ></vc-gallery>
            </vc-form>
          </div>
        </vc-container>
      </div>
      <div class="product-details__widgets">
        <vc-container :no-padding="true">
          <div
            class="vc-widget"
            @click="$openBlade(uid, 'offers-list', { url: null })"
          >
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-file-alt"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Offers</div>
            <div class="vc-widget__value">3</div>
          </div>
          <div class="vc-widget" @click="$openBlade(uid, 'comments-list')">
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-comment"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Comments</div>
            <div class="vc-widget__value">22</div>
          </div>
        </vc-container>
      </div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useI18n, useRouter } from "@virtoshell/core";
import { useProduct } from "../composables";
import { ICategory } from "@virtoshell/api-client";
import MpProductStatus from "../components/MpProductStatus.vue";

export default defineComponent({
  components: {
    MpProductStatus,
  },

  props: {
    uid: {
      type: String,
      default: undefined,
    },

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

  setup(props) {
    const { t } = useI18n();
    const { closeBlade } = useRouter();
    const {
      modified,
      product,
      productDetails,
      loading,
      loadProduct,
      updateProductDetails,
      fetchCategories,
      revertStagedChanges,
      changeProductStatus,
    } = useProduct();

    const categories = ref<ICategory[]>();

    onMounted(async () => {
      await loadProduct({ id: props.param });
      categories.value = await fetchCategories();
    });

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        onClick: async () => {
          await updateProductDetails(product.value.id, { ...productDetails });
        },
        disabled: computed(
          () => !product.value?.canBeModified || !modified.value
        ),
      },
      {
        id: "saveAndSendToApprove",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE"),
        icon: "fas fa-share-square",
        onClick: async () => {
          await updateProductDetails(
            product.value.id,
            { ...productDetails },
            true
          );
        },
        disabled: computed(
          () => !product.value?.canBeModified || !modified.value
        ),
      },
      {
        id: "revertStagedChanges",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.REVERT"),
        icon: "fas fa-undo",
        onClick: async () => {
          await revertStagedChanges(product.value.id);
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
        onClick: async () => {
          await changeProductStatus(product.value.id, "approve");
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "requestChanges",
        title: "Request changes (test only)",
        icon: "fas fa-sticky-note",
        onClick: async () => {
          await changeProductStatus(product.value.id, "requestChanges");
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "reject",
        title: "Reject (test only)",
        icon: "fas fa-ban",
        onClick: async () => {
          await changeProductStatus(product.value.id, "reject");
        },
        disabled: computed(() => product.value.canBeModified),
      },
      {
        id: "close",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        onClick: () => {
          closeBlade(props.uid);
        },
      },
    ]);

    return {
      bladeToolbar,
      categories: computed(() =>
        categories.value?.map((x) => ({ title: x.name, value: x.id }))
      ),
      product: computed(() => product.value),
      productDetails,
      loading: computed(() => loading.value),
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
