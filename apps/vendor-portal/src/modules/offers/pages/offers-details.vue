<template>
  <VcBlade
    v-loading="loading || productLoading || offerLoading"
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
                  class="flex items-center py-2 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  <VcImage
                    class="shrink-0"
                    size="xs"
                    :src="itemData.item.imgSrc"
                    :bordered="true"
                    background="contain"
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
                    background="contain"
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
                <VcRow v-if="param">
                  <VcCol size="1" class="self-center mr-2 my-2">
                    {{ $t("OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.TITLE") }}
                  </VcCol>
                  <VcCol size="4" class="justify-center">
                    {{ offerDetails.availQuantity }}
                  </VcCol>
                </VcRow>
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
                  <VcHint class="px-2 text-[#f14e4e]" v-if="!!errors.length">
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
              <VcLoading :active="fileUploading"></VcLoading>
              <div class="p-2">
                <VcGallery
                  class="my-org__gallery -m-2"
                  :images="imgHandler"
                  @upload="onImageUpload"
                  variant="file-upload"
                  :multiple="false"
                  @item:remove="onImageRemove"
                  :itemActions="{
                    preview: false,
                    edit: false,
                    remove: true,
                  }"
                  :disableDrag="true"
                  :hideAfterUpload="!!imgHandler.length"
                  name="offerImage"
                >
                </VcGallery>
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
import { useForm } from "@virtoshell/ui";
import { useFunctions, useI18n, useUser } from "@virtoshell/core";
import { useOffer } from "../composables";
import {
  IOfferProduct,
  OfferPrice,
  Image,
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
import { isEqual } from "lodash-es";

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
  updateOffer,
  offerDetails,
  currencyList,
  fetchProducts,
  offer,
  loadOffer,
  loading,
  getCurrencies,
} = useOffer();
const { debounce } = useFunctions();
const { searchDictionaryItems } = useProduct();
const { setErrors } = useForm({ validateOnMount: false });
const isFormValid = useIsFormValid();
const { getAccessToken } = useUser();
const products = ref<IOfferProduct[]>();
// const isTracked = ref(false);
const priceRefs = ref([]);
const container = ref();
const categoriesTotal = ref();
const currentProduct = ref<IOfferProduct>();
const fileUploading = ref(false);
const offerLoading = ref(false);
const productLoading = ref(false);
const errors = ref<Record<string, string>[]>([]);

const filterTypes = ["Variation"];

const filteredProps = computed(() => {
  return offerDetails?.properties?.filter((x) => filterTypes.includes(x.type));
});

onMounted(async () => {
  try {
    offerLoading.value = true;
    await getCurrencies();
    if (props.param) {
      await loadOffer({ id: props.param });
    } else {
      offerDetails.trackInventory = true;
      offerDetails.currency = "USD";
      addPrice();
    }
    const searchResult = await fetchProducts();
    products.value = searchResult.results;
    categoriesTotal.value = searchResult.totalCount;

    if (
      offer.value.productId ||
      offerDetails.productId ||
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
  return props.param && offerDetails && offerDetails.name
    ? offerDetails.name + " " + t("OFFERS.PAGES.DETAILS.OFFER_DETAILS")
    : t("OFFERS.PAGES.DETAILS.TITLE");
});

// Process product dropdown search
const onProductSearch = debounce(async (value: string) => {
  const searchResult = await fetchProducts(value);
  products.value = searchResult.results;
  categoriesTotal.value = searchResult.totalCount;
}, 500);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      if (isFormValid.value) {
        try {
          if (offerDetails.id) {
            await updateOffer({
              ...offerDetails,
            });
          } else {
            await createOffer({
              ...offerDetails,
            });
          }
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
    isVisible: true, //!props.param,
    disabled: computed(
      () =>
        !(
          offerDetails.prices &&
          offerDetails.prices.length &&
          isFormValid.value
        )
    ),
  },
]);

watch(
  () => offerDetails.prices,
  (newVal) => {
    nextTick(() => {
      const duplicates = newVal
        .map((o, idx) => {
          if (
            newVal.some((o2, idx2) => {
              return idx !== idx2 && isEqual(o, o2);
            })
          ) {
            return {
              [`minqty_${idx}`]: "Invalid input",
              [`listprice_${idx}`]: "Invalid input",
            };
          }
        })
        .filter((x) => x !== undefined);
      if (duplicates.length) {
        errors.value = duplicates;
        setErrors(Object.assign({}, ...duplicates));
      }
    });
  },
  { deep: true }
);

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

function setFilterDate(key: string, value: string) {
  const date = moment(value).toDate();
  if (date instanceof Date && !isNaN(date.valueOf())) {
    offerDetails[key] = date;
  } else {
    offerDetails[key] = undefined;
  }
}

function getFilterDate(key: string) {
  const date = offerDetails[key] as Date;
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
        offerDetails.properties = currentProduct.value.properties;
      }
    }
  } finally {
    productLoading.value = false;
  }
}

const imgHandler = computed(() =>
  offerDetails.imgSrc ? [{ url: offerDetails.imgSrc }] : []
);

async function onImageUpload(files: FileList) {
  try {
    fileUploading.value = true;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      const authToken = await getAccessToken();
      const result = await fetch(
        `/api/assets?folderUrl=/offers/${offerDetails.id}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const response = await result.json();
      if (response?.length) {
        const image = new Image(response[0]);
        image.createdDate = new Date();
        offerDetails.imgSrc = image.url;
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    fileUploading.value = false;
  }

  files = null;
}

function onImageRemove() {
  if (
    window.confirm(
      unref(computed(() => t("OFFERS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION")))
    )
  ) {
    offerDetails.imgSrc = undefined;
  }
}

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

function getProductItem() {
  if (offerDetails.productId) {
    setProductItem(offerDetails.productId);
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
