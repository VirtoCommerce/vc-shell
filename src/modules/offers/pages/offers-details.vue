<template>
  <VcBlade
    v-loading="loading || productLoading || offerLoading"
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template
      v-slot:error
      v-if="$slots['error']"
    >
      <slot name="error"></slot>
    </template>
    <!-- Blade contents -->
    <VcContainer
      :no-padding="true"
      ref="container"
    >
      <div class="offer-details__inner tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm>
            <!-- Product selector -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
              :modelValue="offerDetails.productId"
              name="product"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                class="tw-mb-4"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                required
                searchable
                v-model="offerDetails.productId"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')"
                :options="fetchProducts"
                option-value="id"
                option-label="name"
                :disabled="readonly"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:modelValue="
                  (e) => {
                    handleChange(e);
                    getProductItem();
                  }
                "
                :clearable="false"
              >
                <template v-slot:selected-item="scope">
                  <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
                    <VcImage
                      class="tw-shrink-0"
                      size="xs"
                      :src="scope.opt.imgSrc"
                      :bordered="true"
                      background="contain"
                    ></VcImage>
                    <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
                      <div class="tw-truncate">
                        {{ scope.opt.name }}
                      </div>
                      <VcHint class="tw-truncate tw-mt-1">
                        {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                        {{ scope.opt.sku }}
                      </VcHint>
                      <div
                        class="vc-link tw-mt-1"
                        v-if="scope.opt.sellerProductId"
                        @click.stop="showProductDetails(scope.opt.sellerProductId)"
                      >
                        {{ $t("OFFERS.PAGES.DETAILS.MORE_INFO") }}
                      </div>
                    </div>
                  </div>
                </template>
                <template v-slot:option="scope">
                  <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
                    <VcImage
                      class="tw-shrink-0"
                      size="xs"
                      :src="scope.opt.imgSrc"
                      :bordered="true"
                      background="contain"
                    ></VcImage>
                    <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
                      <div class="tw-truncate">
                        {{ scope.opt.name }}
                      </div>
                      <VcHint class="tw-truncate tw-mt-1">
                        {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
                        {{ scope.opt.sku }}
                      </VcHint>
                    </div>
                  </div>
                </template>
              </VcSelect>
            </Field>

            <VcCard
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')"
              class="tw-mb-4"
            >
              <div class="tw-p-4">
                <!-- SKU field -->
                <div class="tw-mb-4 tw-flex tw-flex-row tw-items-center">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                    :modelValue="offerDetails.sku"
                    rules="required|min:3"
                    name="sku"
                  >
                    <VcInput
                      v-bind="field"
                      class="tw-grow tw-basis-0"
                      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                      v-model="offerDetails.sku"
                      @update:modelValue="handleChange"
                      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                      :disabled="readonly"
                      required
                      clearable
                      :error="!!errors.length"
                      :error-message="errorMessage"
                    ></VcInput>
                  </Field>
                </div>

                <!-- In stock quantity fields -->
                <VcLabel
                  class="tw-mb-2"
                  :required="true"
                >
                  <span>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE") }}</span>
                </VcLabel>

                <VcRow>
                  <VcCol
                    size="1"
                    class="self-center tw-mr-2 tw-my-2"
                  >
                    <!-- Always in stock -->
                    <VcCheckbox
                      :modelValue="!offerDetails.trackInventory"
                      @update:modelValue="offerDetails.trackInventory = !$event"
                      :disabled="readonly"
                      name="alwaysinstock"
                    >
                      {{ $t("OFFERS.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE") }}
                    </VcCheckbox>
                  </VcCol>
                </VcRow>

                <template v-if="offerDetails.inventory && offerDetails.inventory.length">
                  <div>
                    <VcRow>
                      <VcCol size="2">
                        <VcLabel class="tw-my-2">
                          <span>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.FULFILLMENT_CENTER.TITLE") }}</span>
                        </VcLabel>
                      </VcCol>
                      <VcCol size="2">
                        <VcLabel
                          class="tw-my-2"
                          :required="true"
                        >
                          <span>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.TITLE") }}</span>
                        </VcLabel>
                      </VcCol>
                    </VcRow>
                    <VcRow
                      v-for="(item, i) in offerDetails.inventory"
                      :class="[
                        {
                          'border tw-border-solid tw-border-[#e0e8ef] tw-box-border tw-rounded-[4px] tw-relative tw-p-2 tw-m-4':
                            $isMobile.value,
                        },
                      ]"
                      :key="`${item.id}${i}`"
                    >
                      <VcCol size="2">
                        <div class="tw-flex">
                          <VcCol>
                            <!-- Fulfillment center label -->
                            <VcLabel class="tw-py-4">
                              <span class="tw-font-normal">{{ item.fulfillmentCenterName }}</span>
                            </VcLabel>
                          </VcCol>
                          <VcCol class="tw-py-2">
                            <!-- In stock qty field -->
                            <!-- TODO -->
                            <Field
                              v-slot="{ field, errorMessage, handleChange, errors }"
                              :modelValue="item.inStockQuantity"
                              :name="`availqty_${i}`"
                              rules="required|bigint"
                            >
                              <VcInput
                                v-bind="field"
                                v-model="item.inStockQuantity"
                                @update:modelValue="handleChange"
                                type="number"
                                :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER')"
                                :disabled="readonly || !offerDetails.trackInventory"
                                required
                                clearable
                                :error="!!errors.length"
                                :error-message="errorMessage"
                              ></VcInput>
                            </Field>
                          </VcCol>
                        </div>
                      </VcCol>
                    </VcRow>
                  </div>
                </template>
              </div>
            </VcCard>

            <VcCard
              class="tw-mb-4"
              :header="$t('PRODUCTS.PAGES.DETAILS.FIELDS.TITLE')"
              v-if="filteredProps"
            >
              <div class="tw-p-4">
                <VcDynamicProperty
                  v-for="property in filteredProps"
                  :key="property.id"
                  :property="property"
                  :optionsGetter="loadDictionaries"
                  :getter="getPropertyValue"
                  :setter="setPropertyValue"
                  class="tw-mb-4"
                >
                </VcDynamicProperty>
              </div>
            </VcCard>

            <VcCard
              class="tw-mb-4"
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.PRICING.TITLE')"
            >
              <template v-slot:actions>
                <VcButton
                  v-if="!readonly"
                  small
                  @click="addPrice(true)"
                >
                  {{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE") }}
                </VcButton>
              </template>

              <template v-if="offerDetails.prices && offerDetails.prices.length">
                <div :class="{ 'tw-p-2': $isDesktop.value }">
                  <VcRow
                    v-for="(item, i) in offerDetails.prices"
                    :ref="setPriceRefs"
                    :class="[
                      {
                        'border tw-border-solid tw-border-[#e0e8ef] tw-box-border tw-rounded-[4px] tw-relative tw-p-2 tw-m-4':
                          $isMobile.value,
                      },
                    ]"
                    :key="`${item.id}${i}`"
                  >
                    <VcCol size="2">
                      <div class="tw-flex">
                        <VcCol class="tw-p-2">
                          <!-- List price field -->
                          <Field
                            v-slot="{ errorMessage, handleChange, errors }"
                            :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                            :modelValue="item.listPrice"
                            :name="`listprice_${i}`"
                            rules="required"
                          >
                            <VcInputCurrency
                              v-model:modelValue.number="item.listPrice"
                              v-model:option="item.currency"
                              @update:modelValue="handleChange"
                              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                              :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')"
                              :disabled="readonly"
                              required
                              :clearable="false"
                              :error="!!errors.length"
                              :error-message="errorMessage"
                              :options="currencyList"
                              option-value="value"
                              option-label="title"
                              debounce="0"
                            ></VcInputCurrency>
                          </Field>
                        </VcCol>
                        <VcCol class="tw-p-2">
                          <!-- Sales price field -->
                          <VcInputCurrency
                            v-model:modelValue.number="item.salePrice"
                            v-model:option="item.currency"
                            :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                            :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')"
                            :disabled="readonly"
                            :clearable="false"
                            :options="currencyList"
                            option-value="value"
                            option-label="title"
                            debounce="0"
                            :name="`saleprice_${i}`"
                          ></VcInputCurrency>
                        </VcCol>
                      </div>
                    </VcCol>

                    <VcCol class="tw-p-2">
                      <!-- Minimum quantity field -->
                      <Field
                        v-slot="{ field, errorMessage, handleChange, errors }"
                        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                        :modelValue="item.minQuantity"
                        :name="`minqty_${i}`"
                        rules="required|bigint"
                      >
                        <VcInput
                          v-bind="field"
                          v-model.number="item.minQuantity"
                          @update:modelValue="handleChange"
                          type="number"
                          :label="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                          :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')"
                          :disabled="readonly"
                          required
                          clearable
                          :error="!!errors.length"
                          :error-message="errorMessage"
                        ></VcInput>
                      </Field>
                    </VcCol>

                    <!-- Price remove button -->
                    <div
                      v-if="!readonly && offerDetails.prices.length > 1"
                      style="flex-basis: 20px"
                      :class="{
                        'offer-details__pricing-delete-btn': $isMobile.value,
                        'tw-p-2 tw-mt-[22px]': !$isMobile.value,
                      }"
                    >
                      <VcIcon
                        :class="[
                          { 'tw-pt-4': !$isMobile.value },
                          'tw-text-[#41afe6] tw-cursor-pointer hover:tw-text-[#319ed4]',
                        ]"
                        icon="fas fa-times-circle"
                        @click="removePrice(i)"
                      ></VcIcon>
                    </div>
                  </VcRow>
                  <VcHint
                    class="tw-px-2 !tw-text-[#f14e4e]"
                    v-if="pricingEqual"
                  >
                    <!-- TODO: stylizing-->
                    {{ $t(`OFFERS.PAGES.DETAILS.FIELDS.PRICING.ERRORS.SIMILAR`) }}
                  </VcHint>
                </div>
              </template>
              <div
                v-else
                class="tw-p-5 tw-flex tw-justify-center"
              >
                <VcHint>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRICING.EMPTY") }}</VcHint>
              </div>
            </VcCard>
            <VcCard :header="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.TITLE')">
              <div class="tw-p-2">
                <Form>
                  <VcRow>
                    <VcCol class="tw-p-2">
                      <Field
                        v-slot="{ field, errorMessage, errors }"
                        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_FROM')"
                        :modelValue="getFilterDate('startDate')"
                        name="startDate"
                      >
                        <VcInput
                          v-bind="field"
                          :label="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_FROM')"
                          type="datetime-local"
                          :modelValue="getFilterDate('startDate')"
                          @update:modelValue="
                            (e: string) => setFilterDate('startDate', e)
                          "
                          :disabled="readonly"
                          :error="!!errors.length"
                          :error-message="errorMessage"
                        ></VcInput>
                      </Field>
                    </VcCol>
                    <VcCol class="tw-p-2">
                      <Field
                        v-slot="{ field, errorMessage, errors }"
                        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_TO')"
                        :modelValue="getFilterDate('endDate')"
                        name="endDate"
                        rules="after:@startDate"
                      >
                        <VcInput
                          v-bind="field"
                          :label="$t('OFFERS.PAGES.DETAILS.FIELDS.DATES.VALID_TO')"
                          type="datetime-local"
                          :modelValue="getFilterDate('endDate')"
                          @update:modelValue="(e: string) => setFilterDate('endDate', e)"
                          :disabled="readonly"
                          :error="!!errors.length"
                          :error-message="errorMessage"
                        ></VcInput>
                      </Field>
                    </VcCol>
                  </VcRow>
                </Form>
              </div>
            </VcCard>
            <VcCard
              v-if="offerDetails.id"
              :header="$t('OFFERS.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
              class="tw-my-3 tw-relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('offer_gallery')"
              @state:collapsed="handleCollapsed('offer_gallery', $event)"
            >
              <VcLoading :active="imageUploading"></VcLoading>
              <div class="tw-p-2">
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
import { computed, defineComponent, ref, onMounted, onBeforeUpdate, nextTick, unref, watch, shallowRef } from "vue";

export default defineComponent({
  url: "/offer",
});
</script>

<script lang="ts" setup>
import { IParentCallArgs, IBladeEvent, IBladeToolbar } from "@vc-shell/framework";
import { useOffer } from "../composables";
import {
  IProperty,
  IPropertyValue,
  OfferPrice,
  InventoryInfo,
  PropertyDictionaryItem,
  PropertyValue,
  SellerProduct,
} from "../../../api_client/marketplacevendor";
import ProductsEdit from "../../products/pages/products-edit.vue";
import { Form, useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import moment from "moment/moment";
import { useProduct } from "../../products";
import useFulfillmentCenters from "../../settings/composables/useFulfillmentCenters";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    sellerProduct?: SellerProduct;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "open:blade", blade: IBladeEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

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

const { searchDictionaryItems } = useProduct();
const { setFieldError } = useForm({
  validateOnMount: false,
});

const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();
const priceRefs = ref([]);
const container = ref();
const offerLoading = ref(false);
const productLoading = ref(false);
const pricingEqual = ref(false);
const duplicates = ref([]);

const filterTypes = ["Variation"];

const filteredProps = computed(() => {
  return offerDetails.value?.properties?.filter((x) => filterTypes.includes(x.type));
});

const { fulfillmentCentersList, searchFulfillmentCenters } = useFulfillmentCenters();

onMounted(async () => {
  try {
    offerLoading.value = true;
    await getCurrencies();
    if (props.param) {
      await loadOffer({ id: props.param });
    } else {
      offerDetails.value.trackInventory = true;
      await addEmptyInventory();
      addPrice();
      makeCopy();
      offerDetails.value.sku = generateSku();
    }

    let searchableProductId =
      offer.value.productId ||
      offerDetails.value.productId ||
      props.options?.sellerProduct?.publishedProductDataId ||
      props.options?.sellerProduct?.stagedProductDataId;
    if (searchableProductId) {
      await setProductItem(searchableProductId);
    }
  } finally {
    offerLoading.value = false;
  }
});

onBeforeUpdate(() => {
  priceRefs.value = [];
});

const readonly = false;

const title = computed(() => {
  return props.param
    ? offerDetails.value?.name
      ? offerDetails.value.name + " " + t("OFFERS.PAGES.DETAILS.OFFER_DETAILS")
      : ""
    : t("OFFERS.PAGES.DETAILS.TITLE");
});

const isDisabled = computed(() => {
  return !isDirty.value || !isFormValid.value;
});

watch(offerDetails.value.prices, () => {
  scrollToLastPrice();
});

watch(
  () => offerDetails.value.inventory,
  () => {
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
              o.minQuantity === o2.minQuantity &&
              o.currency === o2.currency
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
        if (offerDetails.value.id) {
          await updateOffer({
            ...offerDetails.value,
          });
        } else {
          await createOffer({
            ...offerDetails.value,
          });
        }
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      } else {
        alert(unref(computed(() => t("OFFERS.PAGES.ALERTS.NOT_VALID"))));
      }
    },
    isVisible: true,
    disabled: computed(
      () => !(offerDetails.value.prices && offerDetails.value.prices.length && !isDisabled.value && modified.value)
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
    isVisible: computed(() => !!props.param && !offerLoading.value && !offerDetails.value.isActive),
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
    isVisible: computed(() => !!props.param && !offerLoading.value && offerDetails.value.isActive),
  },
  {
    id: "delete",
    title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      if (window.confirm(unref(computed(() => t("OFFERS.PAGES.ALERTS.DELETE_OFFER"))))) {
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
  offerDetails.value.prices.push(
    new OfferPrice({
      currency: "USD",
      listPrice: null,
      minQuantity: null,
    })
  );
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

function generateSku(): string {
  // XXX(letter)-XXXXXXXX(number).
  const letterPart = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digitPart = "1234567890";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += letterPart[Math.floor(Math.random() * letterPart.length)];
  }
  result += "-";
  for (let i = 0; i < 8; i++) {
    result += digitPart[Math.floor(Math.random() * digitPart.length)];
  }
  return result;
}
async function showProductDetails(id: string) {
  emit("open:blade", {
    component: shallowRef(ProductsEdit),
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

async function setProductItem(id: string) {
  try {
    productLoading.value = true;
    const fetchedProduct = (await fetchProducts(undefined, 0, [id])).results;

    if (fetchedProduct && fetchedProduct.length) {
      const currentProduct = fetchedProduct[0];

      if (!props.param) {
        offerDetails.value.properties = currentProduct.properties;
      }

      if (props.options && props.options.sellerProduct) {
        offerDetails.value.productId = currentProduct.id;
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

async function loadDictionaries(property: IProperty, keyword?: string, skip?: number) {
  return await searchDictionaryItems([property.id], keyword, skip);
}

function setPropertyValue(property: IProperty, value: IPropertyValue, dictionary?: PropertyDictionaryItem[]) {
  if (value) {
    if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "length")) {
      if (dictionary && dictionary.length) {
        property.values = (value as IPropertyValue[]).map((item) => {
          const handledValue = handleDictionaryValue(property, item.valueId, dictionary);
          return new PropertyValue(handledValue);
        });
      } else {
        property.values = (value as IPropertyValue[]).map((item) => new PropertyValue(item));
      }
    } else {
      if (dictionary && dictionary.length) {
        const handledValue = handleDictionaryValue(property, value as string, dictionary);
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

function getPropertyValue(property: IProperty, isDictionary?: boolean): Record<string, unknown> {
  if (isDictionary) {
    return property.values[0] && (property.values[0].valueId as unknown as Record<string, unknown>);
  }
  return property.values[0] && property.values[0].value;
}

function handleDictionaryValue(property: IProperty, valueId: string, dictionary: PropertyDictionaryItem[]) {
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
  if (!isDisabled.value && modified.value) {
    return confirm(unref(computed(() => t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
  }
}

defineExpose({
  onBeforeClose,
  title,
});
</script>

<style lang="scss">
.offer-details {
  .vc-app_phone &__inner {
    @apply tw-flex-col;
  }

  &__pricing-delete-btn {
    @apply tw-absolute -tw-top-[8px] -tw-right-[8px];

    .VcIcon {
      @apply tw-text-[#ff4a4a];
    }
  }
}
</style>
