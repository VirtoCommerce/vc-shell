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
    <div v-if="product" class="product-details__inner vc-flex vc-flex-grow_1">
      <div class="product-details__content vc-flex-grow_1">
        <vc-container :no-padding="true">
          <div class="vc-padding_l">
            <vc-form>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
              >
                <vc-input
                  v-model="product.sellerName"
                  :clearable="true"
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')
                  "
                ></vc-input>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.TITLE')"
              >
                <vc-select
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.CATEGORY.PLACEHOLDER')
                  "
                ></vc-select>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.TITLE')"
              >
                <vc-input
                  v-model="product.gtin"
                  :clearable="true"
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.PLACEHOLDER')
                  "
                ></vc-input>
              </vc-form-field>
              <vc-form-field
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
              >
                <vc-textarea
                  :placeholder="
                    $t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')
                  "
                ></vc-textarea>
              </vc-form-field>
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
import { computed, defineComponent, onBeforeMount } from "vue";
import { useI18n, useRouter } from "@virtoshell/core";
import { useProduct } from "../composables";

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
    const { product, loading, loadProduct } = useProduct();

    onBeforeMount(async () => {
      await loadProduct({ id: props.param });
    });

    const bladeToolbar = [
      {
        id: "save",
        title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
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
          closeBlade(props.uid);
        },
      },
    ];

    return {
      bladeToolbar,
      product: computed(() => product.value),
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
