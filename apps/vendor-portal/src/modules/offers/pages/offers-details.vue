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
    <vc-container :no-padding="true" ref="container">
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
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                      {{ itemData.item.sku }}
                    </vc-hint>
                  </div>
                </div>
              </template>
            </vc-select>

            <vc-card
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')"
              class="vc-margin-bottom_l"
            >
              <template v-slot:actions v-if="$isDesktop.value">
                <vc-checkbox>{{
                  $t("OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TRACK")
                }}</vc-checkbox>
              </template>

              <div class="vc-padding_l">
                <!-- SKU field -->
                <div
                  class="
                    vc-margin-bottom_l
                    vc-flex vc-flex-row
                    vc-flex-align_center
                  "
                >
                  <vc-input
                    class="vc-flex-grow_1"
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
                  <div
                    class="vc-margin-left_xl vc-margin-top_xl"
                    v-if="$isMobile.value"
                  >
                    <vc-checkbox class="vc-padding-top_s" v-model="isTracked">{{
                      $t("OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TRACK")
                    }}</vc-checkbox>
                  </div>
                </div>

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
                  v-if="$isDesktop.value || ($isMobile && isTracked)"
                ></vc-input>
              </div>
            </vc-card>

            <vc-card :header="$t('OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE')">
              <template v-slot:actions>
                <vc-button v-if="!readonly" small @click="addPrice">
                  {{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE") }}
                </vc-button>
              </template>

              <template
                v-if="offerDetails.prices && offerDetails.prices.length"
              >
                <div :class="{ 'vc-padding_s': $isDesktop.value }">
                  <vc-row
                    v-for="(item, i) in offerDetails.prices"
                    :ref="setPriceRefs"
                    :class="[
                      {
                        'offer-details__pricing-border vc-padding_s vc-margin_l':
                          $isMobile.value,
                      },
                    ]"
                    :key="`${item.id}${i}`"
                  >
                    <vc-col size="2">
                      <div class="vc-flex">
                        <vc-col class="vc-padding_s">
                          <!-- List price field -->
                          <vc-input
                            :clearable="true"
                            v-model="item.listPrice"
                            v-model:optionsValue="offerDetails.currency"
                            :currency="true"
                            :required="true"
                            :options="currencies"
                            keyProperty="value"
                            displayProperty="title"
                            :optionsTitle="
                              $t(
                                'OFFERS.PAGES.DETAILS.FIELDS.PRICING.CHOOSE_CURRENCY'
                              )
                            "
                            :label="
                              $t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')
                            "
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
                            v-model:optionsValue="offerDetails.currency"
                            :currency="true"
                            :options="currencies"
                            keyProperty="value"
                            displayProperty="title"
                            :optionsTitle="
                              $t(
                                'OFFERS.PAGES.DETAILS.FIELDS.PRICING.CHOOSE_CURRENCY'
                              )
                            "
                            :label="
                              $t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')
                            "
                            :placeholder="
                              $t(
                                'OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER'
                              )
                            "
                            :disabled="readonly"
                            name="saleprice"
                          ></vc-input>
                        </vc-col>
                      </div>
                    </vc-col>

                    <vc-col class="vc-padding_s">
                      <!-- Minimum quantity field -->
                      <vc-input
                        :clearable="true"
                        v-model="item.minQuantity"
                        type="number"
                        :required="true"
                        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                        :placeholder="
                          $t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')
                        "
                        :disabled="readonly"
                        name="minqty"
                      ></vc-input>
                    </vc-col>

                    <!-- Price remove button -->
                    <div
                      v-if="!readonly"
                      style="flex-basis: 20px"
                      :class="{
                        'offer-details__pricing-delete-btn': $isMobile.value,
                        'vc-padding_s vc-margin-top_l': !$isMobile.value,
                      }"
                    >
                      <vc-icon
                        :class="[
                          { 'vc-padding-top_l': !$isMobile.value },
                          'offer-details__remove-price',
                        ]"
                        icon="fas fa-times-circle"
                        @click="removePrice(i)"
                      ></vc-icon>
                    </div>
                  </vc-row>
                </div>
              </template>
              <div v-else class="vc-padding_xl vc-flex vc-flex-justify_center">
                <vc-hint>{{
                  $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.EMPTY")
                }}</vc-hint>
              </div>
            </vc-card>
          </vc-form>
        </div>
      </div>
    </vc-container>
  </vc-blade>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  onMounted,
  reactive,
  onBeforeUpdate,
  nextTick,
  unref,
} from "vue";
import { useForm } from "@virtoshell/ui";
import { useI18n } from "@virtoshell/core";
import { useOffer } from "../composables";
import { IOfferProduct, OfferPrice } from "../../../api_client";
import { IBladeToolbar } from "../../../types";

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
    const isTracked = ref(false);
    const priceRefs = ref([]);
    const container = ref();
    const { validate } = useForm({ validateOnMount: false });

    onMounted(async () => {
      if (props.param) {
        await loadOffer({ id: props.param });
      } else {
        offerDetails.currency = "USD";
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

    onBeforeUpdate(() => {
      priceRefs.value = [];
    });

    const readonly = computed(() => !!offer.value?.id);

    const bladeToolbar = ref<IBladeToolbar[]>([
      {
        id: "save",
        title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE")),
        icon: "fas fa-save",
        async clickHandler() {
          const { valid } = await validate();
          if (valid) {
            try {
              await createOffer({
                ...offerDetails,
              });
              emit("parent:call", {
                method: "reload",
              });
              emit("page:close");
            } catch (err) {
              alert(err.message);
            }
          } else {
            alert(unref(computed(() => t("OFFERS.PAGES.ALERTS.NOT_VALID"))));
          }
        },
        isVisible: !props.param,
        disabled: computed(
          () => !(offerDetails.prices && offerDetails.prices.length)
        ),
      },
    ]);

    function scrollToLastPrice() {
      nextTick(() => {
        const element = priceRefs.value[priceRefs.value.length - 1].$el;
        const top = element.offsetTop;
        container.value.$el.firstChild.scrollTo({ top, behavior: "smooth" });
      });
    }

    return {
      offer,
      loading,
      readonly,
      bladeToolbar,
      offerDetails,
      products,
      currency,
      isTracked,
      container,
      currencies: [
        { title: "USD", value: "USD" },
        { title: "EUR", value: "EUR" },
        { title: "AED", value: "AED" },
        { title: "AFN", value: "AFN" },
        { title: "CHF", value: "CHF" },
        { title: "CNY", value: "CNY" },
      ],

      // Process product dropdown search
      onProductSearch: async (value: string) => {
        products.value = await fetchProducts(value);
      },

      addPrice() {
        if (!offerDetails.prices) {
          offerDetails.prices = [];
        }
        offerDetails.prices.push(new OfferPrice());
        scrollToLastPrice();
      },

      removePrice(idx: number) {
        offerDetails.prices.splice(idx, 1);
      },

      setPriceRefs(el: HTMLDivElement) {
        if (el) {
          priceRefs.value.push(el);
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

    &_mobile {
      position: absolute;
    }

    &:hover {
      color: #319ed4;
    }
  }

  &__pricing-border {
    border: 1px solid #e0e8ef;
    box-sizing: border-box;
    border-radius: 4px;
    position: relative;
  }

  &__pricing-delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;

    .vc-icon {
      color: #ff4a4a;
    }
  }
}
</style>
