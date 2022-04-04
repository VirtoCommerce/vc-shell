<template>
  <VcBlade
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
    <VcContainer :no-padding="true" ref="container">
      <div class="offer-details__inner vc-flex-grow_1">
        <div class="vc-padding_l">
          <VcForm>
            <!-- Product selector -->
            <VcSelect
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
              :customSelectedItem="true"
              name="product"
            >
              <template v-slot:customItem="itemData">
                <div
                  class="vc-flex vc-flex-align_center vc-padding-vertical_s vc-ellipsis"
                >
                  <VcImage
                    class="vc-flex-shrink_0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                  ></VcImage>
                  <div class="flex-grow_1 vc-margin-left_l vc-ellipsis">
                    <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                    <VcHint class="vc-ellipsis vc-margin-top_xs">
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                      {{ itemData.item.sku }}
                    </VcHint>
                    <div
                      class="vc-link vc-margin-top_xs"
                      v-if="itemData.item.sellerProductId"
                      @click.stop="
                        showProductDetails(itemData.item.sellerProductId)
                      "
                    >
                      {{ $t("OFFERS.PAGES.DETAILS.MORE_INFO") }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:item="itemData">
                <div
                  class="vc-flex vc-flex-align_center vc-padding-vertical_s vc-ellipsis"
                >
                  <VcImage
                    class="vc-flex-shrink_0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                  ></VcImage>
                  <div class="flex-grow_1 vc-margin-left_l vc-ellipsis">
                    <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                    <VcHint class="vc-ellipsis vc-margin-top_xs">
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                      {{ itemData.item.sku }}
                    </VcHint>
                  </div>
                </div>
              </template>
            </VcSelect>

            <VcCard
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')"
              class="vc-margin-bottom_l"
            >
              <!--              <template v-slot:actions v-if="$isDesktop.value">-->
              <!--                <VcCheckbox>{{-->
              <!--                  $t("OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TRACK")-->
              <!--                }}</VcCheckbox>-->
              <!--              </template>-->

              <div class="vc-padding_l">
                <!-- SKU field -->
                <div
                  class="vc-margin-bottom_l vc-flex vc-flex-row vc-flex-align_center"
                >
                  <VcInput
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
                  ></VcInput>
                  <!--                  <div-->
                  <!--                    class="vc-margin-left_xl vc-margin-top_xl"-->
                  <!--                    v-if="$isMobile.value"-->
                  <!--                  >-->
                  <!--                    <VcCheckbox class="vc-padding-top_s" v-model="isTracked">{{-->
                  <!--                      $t("OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TRACK")-->
                  <!--                    }}</VcCheckbox>-->
                  <!--                  </div>-->
                </div>

                <!-- Quantity in stock field -->
                <VcInput
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
                ></VcInput>
              </div>
            </VcCard>

            <VcCard :header="$t('OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE')">
              <template v-slot:actions>
                <VcButton v-if="!readonly" small @click="addPrice">
                  {{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE") }}
                </VcButton>
              </template>

              <template
                v-if="offerDetails.prices && offerDetails.prices.length"
              >
                <div :class="{ 'vc-padding_s': $isDesktop.value }">
                  <VcRow
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
                    <VcCol size="2">
                      <div class="vc-flex">
                        <VcCol class="vc-padding_s">
                          <!-- List price field -->
                          <VcInput
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
                          ></VcInput>
                        </VcCol>
                        <VcCol class="vc-padding_s">
                          <!-- Sales price field -->
                          <VcInput
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
                          ></VcInput>
                        </VcCol>
                      </div>
                    </VcCol>

                    <VcCol class="vc-padding_s">
                      <!-- Minimum quantity field -->
                      <VcInput
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
                      ></VcInput>
                    </VcCol>

                    <!-- Price remove button -->
                    <div
                      v-if="!readonly && offerDetails.prices.length > 1"
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
                  </VcRow>
                </div>
              </template>
              <div v-else class="vc-padding_xl vc-flex vc-flex-justify_center">
                <VcHint>{{
                  $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.EMPTY")
                }}</VcHint>
              </div>
            </VcCard>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  onMounted,
  onBeforeUpdate,
  nextTick,
  unref,
} from "vue";

export default defineComponent({
  url: "offer",
});
</script>

<script lang="ts" setup>
import { useForm } from "@virtoshell/ui";
import { useFunctions, useI18n } from "@virtoshell/core";
import { useOffer } from "../composables";
import { IOfferProduct, OfferPrice } from "../../../api_client";
import { IBladeToolbar } from "../../../types";
import ProductsEdit from "../../products/pages/products-edit.vue";

const props = defineProps({
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
});

const emit = defineEmits(["parent:call", "page:close", "page:open"]);
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
const { debounce } = useFunctions();
const products = ref<IOfferProduct[]>();
// const currency = { title: "USD", value: "USD" };
// const isTracked = ref(false);
const priceRefs = ref([]);
const container = ref();
const currencies = [
  { title: "USD", value: "USD" },
  { title: "EUR", value: "EUR" },
  { title: "AED", value: "AED" },
  { title: "AFN", value: "AFN" },
  { title: "CHF", value: "CHF" },
  { title: "CNY", value: "CNY" },
];
const { validate } = useForm({ validateOnMount: false });

onMounted(async () => {
  if (props.param) {
    await loadOffer({ id: props.param });
  } else {
    offerDetails.currency = "USD";
    addPrice();
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

// Process product dropdown search
const onProductSearch = () =>
  debounce(async (value: string) => {
    products.value = await fetchProducts(value);
  }, 500);

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

function addPrice() {
  if (!offerDetails.prices) {
    offerDetails.prices = [];
  }
  offerDetails.prices.push(new OfferPrice());
  scrollToLastPrice();
}

function removePrice(idx: number) {
  offerDetails.prices.splice(idx, 1);
}

function setPriceRefs(el: HTMLDivElement) {
  if (el) {
    priceRefs.value.push(el);
  }
}

function showProductDetails(id: string) {
  emit("page:open", {
    component: ProductsEdit,
    param: id,
  });
}
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
