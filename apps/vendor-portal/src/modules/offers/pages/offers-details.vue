<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <VcContainer :no-padding="true" ref="container">
      <div class="offer-details__inner grow basis-0 overflow-hidden">
        <div class="p-4">
          <VcForm>
            <!-- Product selector -->
            <VcSelect
              class="mb-4"
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
              <template v-slot:selectedItem="itemData">
                <div
                  class="flex items-center py-2 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  <VcImage
                    class="shrink-0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                  ></VcImage>
                  <div
                    class="grow basis-0 ml-4 text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <VcHint
                      class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                    >
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                      {{ itemData.item.sku }}
                    </VcHint>
                    <div
                      class="vc-link mt-1"
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
                  class="flex items-center py-2 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  <VcImage
                    class="shrink-0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                  ></VcImage>
                  <div
                    class="grow basis-0 ml-4 text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    <div
                      class="text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <VcHint
                      class="text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                    >
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                      {{ itemData.item.sku }}
                    </VcHint>
                  </div>
                </div>
              </template>
            </VcSelect>

            <VcCard
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')"
              class="mb-4"
            >
              <div class="p-4">
                <!-- SKU field -->
                <div class="mb-4 flex flex-row items-center">
                  <VcInput
                    class="grow basis-0"
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
                </div>

                <!-- In stock quantity fields -->
                <VcLabel class="mb-2" :required="true">
                  <span>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE") }}</span>
                </VcLabel>

                <VcRow>
                  <VcCol size="1" class="self-center mr-2 my-2">
                    <!-- Always in stock -->
                    <VcCheckbox
                      :modelValue="!offerDetails.trackInventory"
                      @update:modelValue="
                        offerDetails.trackInventory = !$event;
                        offerDetails.inStockQuantity = 0;
                      "
                      :disabled="readonly"
                      name="alwaysinstock"
                    >
                      {{
                        $t("OFFERS.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE")
                      }}
                    </VcCheckbox>
                  </VcCol>
                  <VcCol size="4" class="justify-center">
                    <!-- Quantity field -->
                    <VcInput
                      :clearable="true"
                      :required="true"
                      v-model="offerDetails.inStockQuantity"
                      type="number"
                      rules="min_value:0"
                      :placeholder="
                        $t('OFFERS.PAGES.DETAILS.FIELDS.QTY.PLACEHOLDER')
                      "
                      :disabled="readonly || !offerDetails.trackInventory"
                      name="instockqty"
                    ></VcInput>
                  </VcCol>
                </VcRow>
              </div>
            </VcCard>

            <VcCard
              class="mb-4"
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE')"
            >
              <template v-slot:actions>
                <VcButton v-if="!readonly" small @click="addPrice">
                  {{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE") }}
                </VcButton>
              </template>

              <template
                v-if="offerDetails.prices && offerDetails.prices.length"
              >
                <div :class="{ 'p-2': $isDesktop.value }">
                  <VcRow
                    v-for="(item, i) in offerDetails.prices"
                    :ref="setPriceRefs"
                    :class="[
                      {
                        'border border-solid border-[#e0e8ef] box-border rounded-[4px] relative p-2 m-4':
                          $isMobile.value,
                      },
                    ]"
                    :key="`${item.id}${i}`"
                  >
                    <VcCol size="2">
                      <div class="flex">
                        <VcCol class="p-2">
                          <!-- List price field -->
                          <VcInput
                            :clearable="true"
                            v-model="item.listPrice"
                            v-model:optionsValue="offerDetails.currency"
                            :currency="true"
                            :required="true"
                            :options="currencyList"
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
                            :name="`listprice_${i}`"
                          ></VcInput>
                        </VcCol>
                        <VcCol class="p-2">
                          <!-- Sales price field -->
                          <VcInput
                            :clearable="true"
                            v-model="item.salePrice"
                            v-model:optionsValue="offerDetails.currency"
                            :currency="true"
                            :options="currencyList"
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
                            :name="`saleprice_${i}`"
                          ></VcInput>
                        </VcCol>
                      </div>
                    </VcCol>

                    <VcCol class="p-2">
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
                        :name="`minqty_${i}`"
                      ></VcInput>
                    </VcCol>

                    <!-- Price remove button -->
                    <div
                      v-if="!readonly && offerDetails.prices.length > 1"
                      style="flex-basis: 20px"
                      :class="{
                        'offer-details__pricing-delete-btn': $isMobile.value,
                        'p-2 mt-[22px]': !$isMobile.value,
                      }"
                    >
                      <VcIcon
                        :class="[
                          { 'pt-4': !$isMobile.value },
                          'text-[#41afe6] cursor-pointer hover:text-[#319ed4]',
                        ]"
                        icon="fas fa-times-circle"
                        @click="removePrice(i)"
                      ></VcIcon>
                    </div>
                  </VcRow>
                </div>
              </template>
              <div v-else class="p-5 flex justify-center">
                <VcHint>{{
                  $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.EMPTY")
                }}</VcHint>
              </div>
            </VcCard>
            <VcCard :header="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.TITLE')">
              <div class="p-2">
                <Form>
                  <VcRow>
                    <VcCol class="p-2">
                      <VcInput
                        :label="
                          $t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_FROM')
                        "
                        type="datetime-local"
                        :modelValue="offerDetails.startDate"
                        @update:modelValue="offerDetails.startDate = $event"
                        :disabled="readonly"
                        name="startDate"
                      ></VcInput>
                    </VcCol>
                    <VcCol class="p-2">
                      <VcInput
                        :label="
                          $t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_TO')
                        "
                        type="datetime-local"
                        :modelValue="offerDetails.endDate"
                        @update:modelValue="offerDetails.endDate = $event"
                        :disabled="readonly"
                        name="endDate"
                        rules="after:@startDate"
                      ></VcInput>
                    </VcCol>
                  </VcRow>
                </Form>
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
import {
  IOfferProduct,
  OfferPrice,
} from "../../../api_client/marketplacevendor";
import { IBladeToolbar } from "../../../types";
import ProductsEdit from "../../products/pages/products-edit.vue";
import { Form } from "vee-validate";

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
  currencyList,
  fetchProducts,
  offer,
  loadOffer,
  loading,
  selectOfferProduct,
  getCurrencies,
} = useOffer();
const { debounce } = useFunctions();
const products = ref<IOfferProduct[]>();
// const isTracked = ref(false);
const priceRefs = ref([]);
const container = ref();
const { validate } = useForm({ validateOnMount: false });

onMounted(async () => {
  await getCurrencies();
  if (props.param) {
    await loadOffer({ id: props.param });
  } else {
    offerDetails.trackInventory = true;
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

const title = computed(() => {
  return props.param && offerDetails && offerDetails.name
    ? offerDetails.name + " " + t("OFFERS.PAGES.DETAILS.OFFER_DETAILS")
    : t("OFFERS.PAGES.DETAILS.TITLE");
});

// Process product dropdown search
const onProductSearch = debounce(async (value: string) => {
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

<style lang="scss">
.offer-details {
  .vc-app_phone &__inner {
    @apply flex-col;
  }

  &__pricing-delete-btn {
    @apply absolute -top-[8px] -right-[8px];

    .VcIcon {
      @apply text-[#ff4a4a];
    }
  }
}
</style>
