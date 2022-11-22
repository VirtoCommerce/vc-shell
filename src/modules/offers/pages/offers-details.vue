<template>
  <VcBlade
    v-loading="loading || productLoading || offerLoading"
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
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
              :initialItem="currentProduct"
              keyProperty="id"
              displayProperty="name"
              @search="onProductSearch"
              :is-disabled="readonly"
              name="product"
              :clearable="false"
              :onInfiniteScroll="onLoadMore"
              :optionsTotal="categoriesTotal"
              @change="getProductItem"
            >
              <template v-slot:selectedItem="itemData">
                <div
                  class="flex items-center py-2 truncate"
                >
                  <VcImage
                    class="shrink-0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                    background="contain"
                  ></VcImage>
                  <div
                    class="grow basis-0 ml-4 truncate"
                  >
                    <div
                      class="truncate"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <VcHint
                      class="truncate mt-1"
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
                  class="flex items-center py-2 truncate"
                >
                  <VcImage
                    class="shrink-0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                    background="contain"
                  ></VcImage>
                  <div
                    class="grow basis-0 ml-4 truncate"
                  >
                    <div
                      class="truncate"
                    >
                      {{ itemData.item.name }}
                    </div>
                    <VcHint
                      class="truncate mt-1"
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
                        offerDetails.inventory.forEach(
                          (x) => (x.inStockQuantity = 0)
                        );
                      "
                      :disabled="readonly"
                      name="alwaysinstock"
                    >
                      {{
                        $t("OFFERS.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE")
                      }}
                    </VcCheckbox>
                  </VcCol>
                </VcRow>

                <template
                  v-if="offerDetails.inventory && offerDetails.inventory.length"
                >
                  <div>
                    <VcRow>
                      <VcCol size="2">
                        <VcLabel class="my-2">
                          <span>{{
                            $t(
                              "OFFERS.PAGES.DETAILS.FIELDS.FULFILLMENT_CENTER.TITLE"
                            )
                          }}</span>
                        </VcLabel>
                      </VcCol>
                      <VcCol size="2">
                        <VcLabel class="my-2" :required="true">
                          <span>{{
                            $t("OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.TITLE")
                          }}</span>
                        </VcLabel>
                      </VcCol>
                    </VcRow>
                    <VcRow
                      v-for="(item, i) in offerDetails.inventory"
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
                          <VcCol>
                            <!-- Fulfillment center label -->
                            <VcLabel class="py-4">
                              <span class="font-normal">{{
                                item.fulfillmentCenterName
                              }}</span>
                            </VcLabel>
                          </VcCol>
                          <VcCol class="py-2">
                            <!-- In stock qty field -->
                            <VcInput
                              :clearable="true"
                              v-model="item.inStockQuantity"
                              type="number"
                              :required="true"
                              :placeholder="
                                $t(
                                  'OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER'
                                )
                              "
                              :disabled="
                                readonly || !offerDetails.trackInventory
                              "
                              :name="`availqty_${i}`"
                            ></VcInput>
                          </VcCol>
                        </div>
                      </VcCol>
                    </VcRow>
                  </div>
                </template>
              </div>
            </VcCard>

            <VcCard
              class="mb-4"
              :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
              v-if="filteredProps"
            >
              <div class="p-4">
                <VcDynamicProperty
                  v-for="property in filteredProps"
                  :key="property.id"
                  :property="property"
                  :optionsGetter="loadDictionaries"
                  :getter="getPropertyValue"
                  :setter="setPropertyValue"
                  class="mb-4"
                >
                </VcDynamicProperty>
              </div>
            </VcCard>

            <VcCard
              class="mb-4"
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE')"
            >
              <template v-slot:actions>
                <VcButton v-if="!readonly" small @click="addPrice(true)">
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
                        v-model.number="item.minQuantity"
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
                  <VcHint class="px-2 !text-[#f14e4e]" v-if="pricingEqual">
                    <!-- TODO: stylizing-->
                    {{
                      $t(`OFFERS.PAGES.DETAILS.FIELDS.PRICING.ERRORS.SIMILAR`)
                    }}
                  </VcHint>
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
                        :modelValue="getFilterDate('startDate')"
                        @update:modelValue="setFilterDate('startDate', $event)"
                        :disabled="readonly"
                        name="startDate"
                        max="9999-12-31T23:59"
                      ></VcInput>
                    </VcCol>
                    <VcCol class="p-2">
                      <VcInput
                        :label="
                          $t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_TO')
                        "
                        type="datetime-local"
                        :modelValue="getFilterDate('endDate')"
                        @update:modelValue="setFilterDate('endDate', $event)"
                        :disabled="readonly"
                        name="endDate"
                        rules="after:@startDate"
                        max="9999-12-31T23:59"
                      ></VcInput>
                    </VcCol>
                  </VcRow>
                </Form>
              </div>
            </VcCard>
            <VcCard
              v-if="offerDetails.id"
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
              class="my-3 relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('offer_gallery')"
              @state:collapsed="handleCollapsed('offer_gallery', $event)"
            >
              <VcLoading :active="imageUploading"></VcLoading>
              <div class="p-2">
                <VcGallery
                  :images="offerDetails.images"
                  @upload="onGalleryUpload"
                  @item:edit="onGalleryItemEdit"
                  @item:remove="onGalleryImageRemove"
                  :disabled="readonly"
                  @sort="onGallerySort"
                  :multiple="true"
                ></VcGallery>
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
  watch,
} from "vue";

export default defineComponent({
  url: "offer",
});
</script>

<script lang="ts" setup>
import { useForm, VcRow } from "@vc-shell/framework";
import { useFunctions, useI18n, useAutosave } from "@vc-shell/framework";
import { useOffer } from "../composables";
import {
  IOfferDetails,
  IOfferProduct,
  OfferPrice,
  InventoryInfo,
} from "../../../api_client/marketplacevendor";
import { IBladeToolbar } from "../../../types";
import ProductsEdit from "../../products/pages/products-edit.vue";
import { Form, useIsFormValid } from "vee-validate";
import moment from "moment/moment";
import {
  IProperty,
  IPropertyValue,
  PropertyDictionaryItem,
  PropertyValue,
} from "../../../api_client/catalog";
import { useProduct } from "../../products";
import useFulfillmentCenters from "../../settings/composables/useFulfillmentCenters";

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

const emit = defineEmits(["parent:call", "close:blade", "open:blade"]);
const { t } = useI18n();

const {
  createOffer,
  updateOffer,
  offerDetails,
  currencyList,
  fetchProducts,
  offer,
  loadOffer,
  loading,
  modified,
  getCurrencies,
  imageUploading,
  onGalleryUpload,
  onGalleryItemEdit,
  onGallerySort,
  onGalleryImageRemove,
  makeCopy,
  deleteOffer,
} = useOffer();
const { resetAutosaved, loadAutosaved, savedValue } = useAutosave(
  offerDetails,
  modified,
  props.param ?? "offersDetails"
);
const { debounce } = useFunctions();
const { searchDictionaryItems } = useProduct();
const { setFieldError } = useForm({
  validateOnMount: false,
});
const isFormValid = useIsFormValid();
const products = ref<IOfferProduct[]>();
// const isTracked = ref(false);
const priceRefs = ref([]);
const container = ref();
const categoriesTotal = ref();
const currentProduct = ref<IOfferProduct>();
const offerLoading = ref(false);
const productLoading = ref(false);
const pricingEqual = ref(false);
const duplicates = ref([]);

const filterTypes = ["Variation"];

const filteredProps = computed(() => {
  return offerDetails.value?.properties?.filter((x) =>
    filterTypes.includes(x.type)
  );
});

const { fulfillmentCentersList, searchFulfillmentCenters } =
  useFulfillmentCenters();

onMounted(async () => {
  try {
    offerLoading.value = true;
    await getCurrencies();
    if (props.param) {
      await loadOffer({ id: props.param });
    } else {
      offerDetails.value.trackInventory = true;
      offerDetails.value.currency = "USD";
      await addEmptyInventory();
      addPrice();
      makeCopy();
    }

    if (savedValue.value) {
      offerDetails.value = Object.assign({}, savedValue.value as IOfferDetails);
    }
    const searchResult = await fetchProducts();
    products.value = searchResult.results;
    categoriesTotal.value = searchResult.totalCount;

    if (
      offer.value.productId ||
      offerDetails.value.productId ||
      props.options?.sellerProduct?.publishedProductDataId
    ) {
      await setProductItem(
        offer.value.productId ||
          props.options?.sellerProduct?.publishedProductDataId
      );
    }
  } finally {
    offerLoading.value = false;
  }
});

onBeforeUpdate(() => {
  priceRefs.value = [];
});

const readonly = false; //computed(() => !!offer.value?.id);

const title = computed(() => {
  return props.param && offerDetails.value && offerDetails.value.name
    ? offerDetails.value.name + " " + t("OFFERS.PAGES.DETAILS.OFFER_DETAILS")
    : t("OFFERS.PAGES.DETAILS.TITLE");
});

// Process product dropdown search
const onProductSearch = debounce(async (value: string) => {
  const searchResult = await fetchProducts(value);
  products.value = searchResult.results;
  categoriesTotal.value = searchResult.totalCount;
}, 500);

watch(offerDetails.value.prices, () => {
  scrollToLastPrice();
});

watch(
  () => offerDetails.value.inventory,
  (newVal) => {
    offerDetails.value.inventory.forEach((x) => {
      if (!x.inStockQuantity) {
        x.inStockQuantity = 0;
      }
    });
  },
  { deep: true }
);

watch(
  () => offerDetails.value.prices,
  (newVal) => {
    nextTick(() => {
      const dupes = [];
      newVal.forEach((o, idx) => {
        if (
          newVal.some((o2, idx2) => {
            return (
              idx !== idx2 &&
              o.minQuantity &&
              o2.minQuantity &&
              o.minQuantity === o2.minQuantity
            );
          })
        ) {
          dupes.push(`minqty_${idx}`);
        }
      });

      duplicates.value = dupes;
      pricingEqual.value = !!dupes.length;
    });
  },
  { deep: true }
);

watch(duplicates, (newVal, oldVal) => {
  Object.values(oldVal).forEach((x) => setFieldError(x, undefined));
  Object.values(newVal).forEach((x) => setFieldError(x, "Invalid value"));
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isFormValid.value) {
        try {
          if (offerDetails.value.id) {
            await updateOffer({
              ...offerDetails.value,
            });
          } else {
            await createOffer({
              ...offerDetails.value,
            });
          }
          resetAutosaved();
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        } catch (err) {
          alert(err.message);
        }
      } else {
        alert(unref(computed(() => t("OFFERS.PAGES.ALERTS.NOT_VALID"))));
      }
    },
    isVisible: true, //!props.param,
    disabled: computed(
      () =>
        !(
          offerDetails.value.prices &&
          offerDetails.value.prices.length &&
          isFormValid.value &&
          modified.value
        )
    ),
  },
  {
    id: "enable",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.ENABLE"),
    icon: "fa fa-eye",
    async clickHandler() {
      if (offerDetails.value.id) {
        offerDetails.value.isActive = true;
      }
    },
    isVisible: computed(
      () => !!props.param && !offerLoading.value && !offerDetails.value.isActive
    ),
  },
  {
    id: "disable",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DISABLE"),
    icon: "fa fa-eye-slash",
    async clickHandler() {
      if (offerDetails.value.id) {
        offerDetails.value.isActive = false;
      }
    },
    isVisible: computed(
      () => !!props.param && !offerLoading.value && offerDetails.value.isActive
    ),
  },
  {
    id: "delete",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      if (
        window.confirm(
          unref(computed(() => t("OFFERS.PAGES.ALERTS.DELETE_OFFER")))
        )
      ) {
        await deleteOffer({ id: props.param });
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!props.param && !offerLoading.value),
  },
]);

function scrollToLastPrice() {
  nextTick(() => {
    const element = priceRefs.value[priceRefs.value.length - 1].$el;
    const top = element.offsetTop;
    container.value.$el.firstChild.scrollTo({ top, behavior: "smooth" });
  });
}

const addEmptyInventory = async () => {
  offerDetails.value.inventory = [];
  await searchFulfillmentCenters({});
  fulfillmentCentersList.value.forEach((x) => {
    let inventoryInfo = new InventoryInfo();
    inventoryInfo.id = x.name;
    inventoryInfo.fulfillmentCenter = x;
    inventoryInfo.fulfillmentCenterId = x.id;
    inventoryInfo.fulfillmentCenterName = x.name;
    inventoryInfo.inStockQuantity = 0;
    inventoryInfo.createdDate = new Date();
    offerDetails.value.inventory.push(inventoryInfo);
  });
};

function addPrice(scroll = false) {
  if (!offerDetails.value.prices) {
    offerDetails.value.prices = [];
  }
  offerDetails.value.prices.push(new OfferPrice());
  if (scroll) {
    scrollToLastPrice();
  }
}

function removePrice(idx: number) {
  offerDetails.value.prices.splice(idx, 1);
  priceRefs.value.splice(idx, 1);
}

function setPriceRefs(el: HTMLDivElement) {
  if (el) {
    priceRefs.value.push(el);
  }
}

function showProductDetails(id: string) {
  emit("open:blade", {
    component: ProductsEdit,
    param: id,
  });
}

function setFilterDate(key: string, value: string) {
  const date = moment(value).toDate();
  if (date instanceof Date && !isNaN(date.valueOf())) {
    offerDetails.value[key] = date;
  } else {
    offerDetails.value[key] = undefined;
  }
}

function getFilterDate(key: string) {
  const date = offerDetails.value[key] as Date;
  if (date) {
    return moment(date).format("YYYY-MM-DDTHH:mm");
  }
  return undefined;
}

async function onLoadMore() {
  const data = await fetchProducts(undefined, products.value.length);
  products.value.push(...data.results);
}

async function setProductItem(id: string) {
  try {
    productLoading.value = true;
    const fetchedProduct = await fetchProducts(undefined, 0, [id]);
    if (fetchedProduct.results && fetchedProduct.results.length) {
      currentProduct.value = fetchedProduct.results[0];

      if (!props.param) {
        offerDetails.value.properties = currentProduct.value.properties;
      }
    }
  } finally {
    productLoading.value = false;
  }
}

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

function getProductItem() {
  if (offerDetails.value.productId) {
    setProductItem(offerDetails.value.productId);
  }
}

async function loadDictionaries(
  property: IProperty,
  keyword?: string,
  skip?: number
) {
  return await searchDictionaryItems([property.id], keyword, skip);
}

function setPropertyValue(
  property: IProperty,
  value: IPropertyValue,
  dictionary?: PropertyDictionaryItem[]
) {
  if (value) {
    if (
      typeof value === "object" &&
      Object.prototype.hasOwnProperty.call(value, "length")
    ) {
      if (dictionary && dictionary.length) {
        property.values = (value as IPropertyValue[]).map((item) => {
          const handledValue = handleDictionaryValue(
            property,
            item.valueId,
            dictionary
          );
          return new PropertyValue(handledValue);
        });
      } else {
        property.values = (value as IPropertyValue[]).map(
          (item) => new PropertyValue(item)
        );
      }
    } else {
      if (dictionary && dictionary.length) {
        const handledValue = handleDictionaryValue(
          property,
          value as string,
          dictionary
        );
        property.values[0] = new PropertyValue({
          ...handledValue,
          isInherited: false,
        });
      } else {
        if (property.values[0]) {
          property.values[0].value = value;
        } else {
          property.values[0] = new PropertyValue({
            value,
            isInherited: false,
          });
        }
      }
    }
  } else {
    offerDetails.value.properties = offerDetails.value.properties.map((x) => {
      if (x.id === property.id) {
        x.values = [];
      }
      return x;
    });
  }
}

function getPropertyValue(
  property: IProperty,
  isDictionary?: boolean
): Record<string, unknown> {
  if (isDictionary) {
    return (
      property.values[0] &&
      (property.values[0].valueId as unknown as Record<string, unknown>)
    );
  }
  return property.values[0] && property.values[0].value;
}

function handleDictionaryValue(
  property: IProperty,
  valueId: string,
  dictionary: PropertyDictionaryItem[]
) {
  let valueName;
  const dictionaryItem = dictionary.find((x) => x.id === valueId);
  if (dictionaryItem) {
    valueName = dictionaryItem.alias;
  } else {
    valueName = property.name;
  }

  return {
    value: valueName,
    valueId,
  };
}

async function onBeforeClose() {
  if (modified.value) {
    const confirmationStatus = confirm(
      unref(computed(() => t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION")))
    );
    if (confirmationStatus) {
      resetAutosaved();
    }
    return confirmationStatus;
  }
}

defineExpose({
  onBeforeClose,
});
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
