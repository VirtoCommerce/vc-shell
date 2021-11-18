<template>
  <vc-blade
    v-loading="loading"
    :title="
      param && offerDetails
        ? offerDetails.sku
        : $t('OFFERS.PAGES.DETAILS.TITLE')
    "
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
              <!-- Product selector -->
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                is-required
                is-searchable
                v-model="offerDetails.productId"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')
                "
                :options="products"
                :initialItem="offerDetails.product"
                keyProperty="id"
                displayProperty="name"
                @search="onProductSearch"
                :is-disabled="readonly"
                name="product"
              >
                <template v-slot:item="itemData">
                  <div
                    class="
                      vc-flex
                      vc-flex-align_center
                      vc-padding-vertical_s
                      vc-ellipsis
                    "
                  >
                    <vc-image
                      class="vc-flex-shrink_0"
                      size="xs"
                      :src="itemData.item.imgSrc"
                      :bordered="true"
                    ></vc-image>
                    <div class="flex-grow_1 vc-margin-left_l vc-ellipsis">
                      <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                      <vc-hint class="vc-ellipsis vc-margin-top_xs">
                        Code: {{ itemData.item.sku }}
                      </vc-hint>
                    </div>
                  </div>
                </template>
              </vc-select>

              <!-- Currency selector -->
              <vc-select
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.TITLE')"
                :isRequired="true"
                v-model="offerDetails.currency"
                :options="currencies"
                keyProperty="value"
                displayProperty="title"
                :placeholder="
                  $t('OFFERS.PAGES.DETAILS.FIELDS.CURRENCY.PLACEHOLDER')
                "
                :isDisabled="readonly"
                name="currency"
              ></vc-select>

              <!-- SKU field -->
              <vc-input
                class="vc-margin-bottom_l"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                :clearable="true"
                :required="true"
                v-model="offerDetails.sku"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                rules="min:3"
                :disabled="readonly"
                name="sku"
              ></vc-input>

              <vc-row>
                <vc-col class="vc-margin-right_s">
                  <!-- List price field -->
                  <vc-input
                    class="vc-margin-bottom_l"
                    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                    :clearable="true"
                    :required="true"
                    v-model="offerDetails.listPrice"
                    type="number"
                    :placeholder="
                      $t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')
                    "
                    :disabled="readonly"
                    name="listprice"
                  ></vc-input>
                </vc-col>

                <!-- Sales price field -->
                <vc-col class="vc-margin-left_s">
                  <vc-input
                    class="vc-margin-bottom_l"
                    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                    :clearable="true"
                    v-model="offerDetails.salePrice"
                    type="number"
                    :placeholder="
                      $t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')
                    "
                    :disabled="readonly"
                    name="saleprice"
                  ></vc-input>
                </vc-col>
              </vc-row>

              <vc-row>
                <vc-col class="vc-margin-right_s">
                  <!-- Minimum quantity field -->
                  <vc-input
                    class="vc-margin-bottom_l"
                    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                    :clearable="true"
                    :required="true"
                    v-model="offerDetails.minQuantity"
                    type="number"
                    :placeholder="
                      $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                    "
                    :disabled="readonly"
                    name="minqty"
                  ></vc-input>
                </vc-col>
                <vc-col class="vc-margin-left_s">
                  <!-- Quantity in stock field -->
                  <vc-input
                    class="vc-margin-bottom_l"
                    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE')"
                    :clearable="true"
                    :required="true"
                    v-model="offerDetails.inStockQuantity"
                    type="number"
                    :placeholder="
                      $t('OFFERS.PAGES.DETAILS.FIELDS.QTY.PLACEHOLDER')
                    "
                    :disabled="readonly"
                    name="qty"
                  ></vc-input>
                </vc-col>
              </vc-row>
            </vc-form>
          </div>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, reactive } from "vue";
import { useForm } from "@virtoshell/ui";
import { useI18n } from "@virtoshell/core";
import { useOffer } from "../composables";
import { IOfferProduct } from "../../../api_client";

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

    const {
      createOffer,
      offerDetails,
      fetchProducts,
      offer,
      loadOffer,
      loading,
      selectOfferProduct,
    } = useOffer();

    const products = ref<IOfferProduct[]>();
    const currency = { title: "USD", value: "USD" };
    const { validate } = useForm({ validateOnMount: false });

    onMounted(async () => {
      if (props.param) {
        await loadOffer({ id: props.param });
      }
      if (props.options?.sellerProduct) {
        //Since the offers can be created only for published products we must pass the id of published product in a master catalog
        await selectOfferProduct({
          id: props.options?.sellerProduct?.publishedProductDataId,
        });
      }
      products.value = await fetchProducts();
    });

    const readonly = computed(() => !!offer.value?.id);

    const bladeToolbar = reactive([
      {
        id: "save",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
        icon: "fas fa-save",
        async clickHandler() {
          const { valid } = await validate();
          if (valid) {
            try {
              await createOffer({
                ...offerDetails,
                currency: "USD",
              });
              emit("parent:call", {
                method: "reload",
              });
              emit("page:close");
            } catch (err) {
              alert(err.message);
            }
          } else {
            alert("Form is not valid.\nPlease, check highlighted fields.");
          }
        },
        isVisible: !props.param,
      },
    ]);

    return {
      offer,
      loading,
      readonly,
      bladeToolbar,
      offerDetails,
      products,
      currency,
      currencies: [{ title: "USD", value: "USD" }],

      // Process product dropdown search
      onProductSearch: async (value: string) => {
        products.value = await fetchProducts(value);
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
