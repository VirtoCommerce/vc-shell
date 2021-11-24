<template>
  <vc-blade
    v-loading="loading"
    :title="
      param && offerDetails
        ? offerDetails.sku
        : $t('OFFERS.PAGES.DETAILS.TITLE')
    "
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-container :no-padding="true">
      <div class="offer-details__inner vc-flex-grow_1">
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

            <vc-card header="Inventory" class="vc-margin-bottom_l">
              <template v-slot:actions>
                <vc-checkbox>Track inventory</vc-checkbox>
              </template>

              <div class="vc-padding_l">
                <!-- SKU field -->
                <vc-input
                  class="vc-margin-bottom_l"
                  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                  :clearable="true"
                  :required="true"
                  v-model="offerDetails.sku"
                  :placeholder="
                    $t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')
                  "
                  rules="min:3"
                  :disabled="readonly"
                  name="sku"
                ></vc-input>

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
              </div>
            </vc-card>

            <vc-card header="Offer Info" class="vc-margin-bottom_l">
              <div class="vc-padding_l">
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
              </div>
            </vc-card>

            <vc-card header="Pricing">
              <template v-slot:actions>
                <vc-button v-if="!readonly" small @click="addPrice">
                  Add price
                </vc-button>
              </template>

              <template
                v-if="offerDetails.prices && offerDetails.prices.length"
              >
                <div class="vc-padding_s vc-padding-top_l">
                  <vc-row>
                    <vc-col class="vc-padding-horizontal_s vc-font-weight_bold"
                      >List price</vc-col
                    >
                    <vc-col class="vc-padding-horizontal_s vc-font-weight_bold"
                      >Sales price</vc-col
                    >
                    <vc-col class="vc-padding-horizontal_s vc-font-weight_bold"
                      >Min quantity</vc-col
                    >
                    <vc-col
                      v-if="!readonly"
                      size="0"
                      class="vc-padding-horizontal_s"
                      style="flex-basis: 20px"
                    ></vc-col>
                  </vc-row>
                  <vc-row
                    v-for="(item, i) in offerDetails.prices"
                    :key="`${item.id}${i}`"
                  >
                    <vc-col class="vc-padding_s">
                      <!-- List price field -->
                      <vc-input
                        :clearable="true"
                        v-model="item.listPrice"
                        type="number"
                        :placeholder="
                          $t(
                            'OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER'
                          )
                        "
                        :disabled="readonly"
                        name="listprice"
                      ></vc-input>
                    </vc-col>
                    <vc-col class="vc-padding_s">
                      <!-- Sales price field -->
                      <vc-input
                        :clearable="true"
                        v-model="item.salePrice"
                        type="number"
                        :placeholder="
                          $t(
                            'OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER'
                          )
                        "
                        :disabled="readonly"
                        name="saleprice"
                      ></vc-input>
                    </vc-col>
                    <vc-col class="vc-padding_s">
                      <!-- Minimum quantity field -->
                      <vc-input
                        :clearable="true"
                        v-model="item.minQuantity"
                        type="number"
                        :placeholder="
                          $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                        "
                        :disabled="readonly"
                        name="minqty"
                      ></vc-input>
                    </vc-col>
                    <vc-col
                      v-if="!readonly"
                      size="0"
                      style="flex-basis: 20px"
                      class="
                        vc-padding_s
                        vc-padding-top_l
                        vc-flex
                        vc-flex-align_end
                      "
                    >
                      <vc-icon
                        class="offer-details__remove-price"
                        icon="fas fa-times-circle"
                        @click="removePrice(i)"
                      ></vc-icon>
                    </vc-col>
                  </vc-row>
                </div>
              </template>
              <div v-else class="vc-padding_xl vc-flex vc-flex-justify_center">
                <vc-hint>No prices for this offer</vc-hint>
              </div>
            </vc-card>
          </vc-form>
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
import { IOfferProduct, OfferPrice } from "../../../api_client";

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
      if (
        offer.value.productId ||
        props.options?.sellerProduct?.publishedProductDataId
      ) {
        await selectOfferProduct({
          id:
            offer.value.productId ||
            props.options?.sellerProduct?.publishedProductDataId,
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

      addPrice() {
        if (!offerDetails.prices) {
          offerDetails.prices = [];
        }
        offerDetails.prices.push(new OfferPrice());
      },

      removePrice(idx: number) {
        if (confirm("Remove selected price?")) {
          offerDetails.prices.splice(idx, 1);
        }
      },
    };
  },
});
</script>

<style lang="less">
.offer-details {
  &__inner {
    overflow: hidden;
  }

  .vc-app_phone &__inner {
    flex-direction: column;
  }

  &__remove-price {
    color: #41afe6;
    cursor: pointer;

    &:hover {
      color: #319ed4;
    }
  }
}
</style>
