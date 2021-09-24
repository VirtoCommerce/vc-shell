<template>
  <vc-blade
    :uid="uid"
    :title="$t('PRODUCTS.PAGES.DETAILS.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <div class="product-details__inner vc-flex vc-flex-grow_1">
      <div class="product-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
          <div class="vc-padding_l">
            <vc-form>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                :clearable="true"
                :required="true"
                v-model="product.name"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                "
              ></vc-input>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
                :required="true"
                v-model="product.categoryId"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')
                "
                :options="categories"
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
                :clearable="true"
                :required="true"
                v-model="product.gtin"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')
                "
              ></vc-input>
              <vc-textarea
                class="vc-margin-bottom_l"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                :required="true"
                v-model="product.description"
                :placeholder="
                  $t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                "
              ></vc-textarea>
            </vc-form>
          </div>
        </vc-container>
      </div>
      <div class="product-details__widgets">
        <vc-container :no-padding="true">
          <div class="vc-widget" @click="$openBlade(uid, 'offers-list')">
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
import { computed, defineComponent, onMounted, ref } from "vue";
import { useI18n, useRouter } from "@virtoshell/core";
import { useProduct } from "../composables";
import { ICategory } from "@virtoshell/api-client";

export default defineComponent({
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

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const { closeBlade } = useRouter();
    const { createProduct, productDetails, fetchCategories } = useProduct();

    const bladeToolbar = [
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        onClick: () => {
          createProduct({ ...productDetails });
        },
      },
      {
        id: "saveAndApprove",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVEANDAPPROVE"),
        icon: "fas fa-share-square",
      },
      {
        id: "close",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        onClick: () => {
          emit("close");
        },
      },
    ];
    const categories = ref<ICategory[]>();
    onMounted(async () => {
      categories.value = await fetchCategories();
    });

    return {
      bladeToolbar,
      product: computed(() => productDetails),
      categories,
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
