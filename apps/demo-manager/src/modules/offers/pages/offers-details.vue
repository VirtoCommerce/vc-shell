<template>
  <vc-blade
    v-loading="loading"
    :title="$t('OFFERS.PAGES.DETAILS.TITLE')"
    width="600"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-container :no-padding="true">
      <div class="offer-details__inner vc-flex vc-flex-grow_1">
        <div class="offer-details__content vc-flex-grow_1">
          <div class="vc-padding_l">
            <vc-form>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                :isRequired="true"
                :isSearchable="true"
                v-model="offerDetails.productId"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')
                "
                :options="products"
                :selectedItem="offer.product"
                keyProperty="id"
                displayProperty="name"
                @search="onProductSearch"
              >
                <template v-slot:item="itemData">
                  <div
                    class="vc-flex vc-flex-align_center vc-padding-vertical_s"
                  >
                    <vc-image
                      size="xs"
                      :src="itemData.item.imgSrc"
                      :bordered="true"
                    ></vc-image>
                    <div class="flex-grow_1 vc-margin-left_l">
                      <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                      <vc-hint class="vc-ellipsis vc-margin-top_xs">
                        Code: {{ itemData.item.sku }}
                      </vc-hint>
                    </div>
                  </div>
                </template>
              </vc-select>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.TITLE')"
                :required="true"
                v-model="offerDetails.currency"
                :selectedItem="currency"
                :options="currencies"
                keyProperty="value"
                displayProperty="title"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.PLACEHOLDER')
                "
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                :clearable="true"
                :required="true"
                v-model="offerDetails.sku"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
              ></vc-input>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.listPrice"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                  :clearable="true"
                  v-model="offerDetails.salePrice"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.minQuantity"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.inStockQuantity"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.QTY.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <div class="vc-flex">
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-right_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.TITLE')"
                  :clearable="true"
                  :required="false"
                  offerDetails.startDate
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.START_DATE.PLACEHOLDER')
                  "
                ></vc-input>
                <vc-input
                  class="vc-fill_width vc-margin-bottom_l vc-margin-left_s"
                  type="date"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.TITLE')"
                  :clearable="true"
                  :required="false"
                  offerDetails.endDate
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.END_DATE.PLACEHOLDER')
                  "
                ></vc-input>
              </div>
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.TITLE')"
                :required="true"
                :options="conditions"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CONDITION.PLACEHOLDER')
                "
              ></vc-select>
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.TITLE')"
                :clearable="true"
                :required="true"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.SHIPPING_TIME.PLACEHOLDER')
                "
              ></vc-input>
            </vc-form>
          </div>
        </div>
        <div class="offer-details__widgets">
          <div class="vc-widget">
            <vc-icon
              class="vc-widget__icon"
              icon="fas fa-file-alt"
              size="xxl"
            ></vc-icon>
            <div class="vc-widget__title">Statistics</div>
          </div>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, reactive } from "vue";
import { useI18n } from "@virtoshell/core";
import { useOffer } from "../composables";
import { IOfferProduct } from "../../../api_client";

class BladeElement extends HTMLElement {
  reload: () => void;
}

export default defineComponent({
  url: "offer",

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

    const { createOffer, offerDetails, fetchProducts, offer, loadOffer } =
      useOffer();
    //TODO: bind to dropdown action
    const products = ref<IOfferProduct[]>();
    const currency = { title: "USD", value: "USD" };
    onMounted(async () => {
      if (props.param) {
        await loadOffer({ id: props.param });
      }
      products.value = await fetchProducts();
    });

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        onClick: async () => {
          await createOffer({
            ...offerDetails,
            currency: "USD",
          });
          emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(() => offer.value?.id),
      },
      {
        id: "close",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.CLOSE"),
        icon: "fas fa-times",
        onClick: () => {
          emit("page:close");
        },
      },
    ]);

    return {
      offer,
      bladeToolbar,
      offerDetails,
      products,
      currency,
      currencies: [{ title: "USD", value: "USD" }],
      conditions: [
        { title: "New", value: "New" },
        { title: "Refurbrished", value: "Refurbrished" },
        { title: "Used", value: "Used" },
      ],
      onProductSearch: async (value: string) => {
        products.value = await fetchProducts(value);
      },

      onBeforeClose: async () => {
        console.log("onBeforeClose handler called.");
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("onBeforeClose handler ended.");
            resolve(true);
          }, 1000);
        });
      },
    };
  },
});
</script>

<style lang="less">
.offer-details {
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
