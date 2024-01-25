<template>
  <VcBlade
    v-loading="loading || productLoading || offerLoading"
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template #actions>
      <div class="tw-flex tw-flex-row tw-items-center">
        <div class="vc-status">
          <VcSelect
            name="currentLocale"
            :model-value="currentLocale"
            :options="localesOptions"
            option-value="value"
            option-label="label"
            required
            :clearable="false"
            @update:model-value="
              (e) => {
                setLocale(e as string);
              }
            "
          >
          </VcSelect>
        </div>
      </div>
    </template>

    <!-- Blade contents -->
    <VcContainer
      ref="container"
      :no-padding="true"
    >
      <div class="offer-details__inner tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm>
            <!-- Product selector -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
              :model-value="offerDetails.productId"
              name="product"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="offerDetails.productId"
                class="tw-mb-4"
                :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
                required
                searchable
                :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')"
                :options="fetchProducts"
                option-value="id"
                option-label="name"
                :disabled="readonly"
                :error="!!errors.length"
                :error-message="errorMessage"
                :clearable="false"
                @update:model-value="
                  (e) => {
                    handleChange(e);
                    getProductItem();
                  }
                "
              >
                <template #selected-item="scope">
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
                        {{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.CODE") }}:
                        {{ scope.opt.sku }}
                      </VcHint>
                    </div>
                  </div>
                </template>
                <template #option="scope">
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
                        {{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.CODE") }}:
                        {{ scope.opt.sku }}
                      </VcHint>
                    </div>
                  </div>
                </template>
              </VcSelect>
            </Field>

            <VcCard
              :header="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')"
              class="tw-mb-4"
            >
              <div class="tw-p-4">
                <!-- SKU field -->
                <div class="tw-mb-4 tw-flex tw-flex-row tw-items-center">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, errors }"
                    :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                    :model-value="offerDetails.sku"
                    rules="required|min:3"
                    name="sku"
                  >
                    <VcInput
                      v-bind="field"
                      v-model="offerDetails.sku"
                      class="tw-grow tw-basis-0"
                      :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                      :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                      :disabled="readonly"
                      required
                      clearable
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:model-value="handleChange"
                    ></VcInput>
                  </Field>
                </div>

                <!-- In stock quantity fields -->
                <VcLabel
                  class="tw-mb-2"
                  :required="true"
                >
                  <span>{{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.QTY.TITLE") }}</span>
                </VcLabel>

                <VcRow>
                  <VcCol
                    size="1"
                    class="self-center tw-mr-2 tw-my-2"
                  >
                    <!-- Always in stock -->
                    <VcCheckbox
                      :model-value="!offerDetails.trackInventory"
                      :disabled="readonly"
                      name="alwaysinstock"
                      @update:model-value="offerDetails.trackInventory = !$event"
                    >
                      {{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.ALWAYS_IN_STOCK.TITLE") }}
                    </VcCheckbox>
                  </VcCol>
                </VcRow>

                <template v-if="offerDetails.inventory && offerDetails.inventory.length">
                  <div>
                    <VcRow>
                      <VcCol size="2">
                        <VcLabel class="tw-my-2">
                          <span>{{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.FULFILLMENT_CENTER.TITLE") }}</span>
                        </VcLabel>
                      </VcCol>
                      <VcCol size="2">
                        <VcLabel
                          class="tw-my-2"
                          :required="true"
                        >
                          <span>{{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.AVAIL_QTY.TITLE") }}</span>
                        </VcLabel>
                      </VcCol>
                    </VcRow>
                    <VcRow
                      v-for="(item, i) in offerDetails.inventory"
                      :key="`${item.id}${i}`"
                      :class="[
                        {
                          'border tw-border-solid tw-border-[#e0e8ef] tw-box-border tw-rounded-[4px] tw-relative tw-p-2 tw-m-4':
                            $isMobile.value,
                        },
                      ]"
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
                              :model-value="item.inStockQuantity"
                              :name="`availqty_${i}`"
                              rules="required|bigint|min_value:0"
                            >
                              <VcInput
                                v-bind="field"
                                v-model="item.inStockQuantity"
                                type="number"
                                :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER')"
                                :disabled="readonly || !offerDetails.trackInventory"
                                required
                                clearable
                                :error="!!errors.length"
                                :error-message="errorMessage"
                                @update:model-value="handleChange"
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
              v-if="filteredProps?.length"
              class="tw-mb-4"
              :header="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PROPERTIES.TITLE')"
            >
              <div class="tw-p-4">
                <div
                  v-for="property in filteredProps"
                  :key="property.id"
                >
                  <div v-if="property.multilanguage">
                    <div
                      v-for="lang in localesOptions"
                      :key="lang.label"
                    >
                      <VcDynamicProperty
                        v-if="lang.value == currentLocale"
                        class="tw-pb-4"
                        :property="property"
                        :model-value="getPropertyValue(property, currentLocale)"
                        :options-getter="loadDictionaries"
                        :required="property.required ?? false"
                        :multivalue="property.multivalue"
                        :multilanguage="true"
                        :current-language="lang.value"
                        :value-type="property.valueType ?? ''"
                        :dictionary="property.dictionary"
                        :name="property.name ?? ''"
                        :rules="{
                          min: property.validationRule?.charCountMin,
                          max: property.validationRule?.charCountMax,
                          regex: property.validationRule?.regExp,
                        }"
                        :display-names="property.displayNames"
                        @update:model-value="setPropertyValue"
                      >
                      </VcDynamicProperty>
                    </div>
                  </div>
                  <div v-else>
                    <VcDynamicProperty
                      class="tw-pb-4"
                      :property="property"
                      :model-value="getPropertyValue(property, currentLocale)"
                      :options-getter="loadDictionaries"
                      :required="property.required ?? false"
                      :multivalue="property.multivalue"
                      :multilanguage="false"
                      :value-type="property.valueType ?? ''"
                      :dictionary="property.dictionary"
                      :name="property.name ?? ''"
                      :rules="{
                        min: property.validationRule?.charCountMin,
                        max: property.validationRule?.charCountMax,
                        regex: property.validationRule?.regExp,
                      }"
                      :display-names="property.displayNames"
                      @update:model-value="setPropertyValue"
                    >
                    </VcDynamicProperty>
                  </div>
                </div>
              </div>
            </VcCard>

            <VcCard
              class="tw-mb-4"
              :header="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRICING.TITLE')"
            >
              <template #actions>
                <VcButton
                  v-if="!readonly"
                  small
                  @click="addPrice(true)"
                >
                  {{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRICING.ADD_PRICE") }}
                </VcButton>
              </template>

              <template v-if="offerDetails.prices && offerDetails.prices.length">
                <div :class="{ 'tw-p-2': $isDesktop.value }">
                  <VcRow
                    v-for="(item, i) in offerDetails.prices"
                    :ref="setPriceRefs as any"
                    :key="`${item.id}${i}`"
                    :class="[
                      {
                        'border tw-border-solid tw-border-[#e0e8ef] tw-box-border tw-rounded-[4px] tw-relative tw-p-2 tw-m-4':
                          $isMobile.value,
                      },
                    ]"
                  >
                    <VcCol size="2">
                      <div class="tw-flex">
                        <VcCol class="tw-p-2">
                          <!-- List price field -->
                          <Field
                            v-slot="{ errorMessage, handleChange, errors }"
                            :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                            :model-value="item.listPrice"
                            :name="`listprice_${i}`"
                            rules="required"
                          >
                            <VcInputCurrency
                              v-model:modelValue.number="item.listPrice"
                              v-model:option="item.currency"
                              :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.LIST_PRICE.TITLE')"
                              :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.LIST_PRICE.PLACEHOLDER')"
                              :disabled="readonly"
                              required
                              :clearable="false"
                              :error="!!errors.length"
                              :error-message="errorMessage"
                              :options="currencies"
                              option-value="value"
                              option-label="title"
                              debounce="0"
                              @update:model-value="handleChange"
                            ></VcInputCurrency>
                          </Field>
                        </VcCol>
                        <VcCol class="tw-p-2">
                          <!-- Sales price field -->
                          <VcInputCurrency
                            v-model:modelValue.number="item.salePrice"
                            v-model:option="item.currency"
                            :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.SALE_PRICE.TITLE')"
                            :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.SALE_PRICE.PLACEHOLDER')"
                            :disabled="readonly"
                            :clearable="false"
                            :options="currencies"
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
                        :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                        :model-value="item.minQuantity"
                        :name="`minqty_${i}`"
                        rules="required|bigint"
                      >
                        <VcInput
                          v-bind="field"
                          v-model.number="item.minQuantity"
                          type="number"
                          :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.MIN_QTY.TITLE')"
                          :placeholder="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.MIN_QTY.PLACEHOLDER')"
                          :disabled="readonly"
                          required
                          clearable
                          :error="!!errors.length"
                          :error-message="errorMessage"
                          @update:model-value="handleChange"
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
                    v-if="pricingEqual"
                    class="tw-px-2 !tw-text-[#f14e4e]"
                  >
                    <!-- TODO: stylizing-->
                    {{ $t(`OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRICING.ERRORS.SIMILAR`) }}
                  </VcHint>
                </div>
              </template>
              <div
                v-else
                class="tw-p-5 tw-flex tw-justify-center"
              >
                <VcHint>{{ $t("OFFERSCLASSIC.PAGES.DETAILS.FIELDS.PRICING.EMPTY") }}</VcHint>
              </div>
            </VcCard>
            <VcCard :header="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.DATES.TITLE')">
              <div class="tw-p-2">
                <Form>
                  <VcRow>
                    <VcCol class="tw-p-2">
                      <Field
                        v-slot="{ field, errorMessage, errors }"
                        :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.DATES.VALID_FROM')"
                        :model-value="getFilterDate('startDate')"
                        name="startDate"
                      >
                        <VcInput
                          v-bind="field"
                          :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.DATES.VALID_FROM')"
                          type="datetime-local"
                          :model-value="getFilterDate('startDate')"
                          :disabled="readonly"
                          :error="!!errors.length"
                          :error-message="errorMessage"
                          @update:model-value="(e) => setFilterDate('startDate', e as string)"
                        ></VcInput>
                      </Field>
                    </VcCol>
                    <VcCol class="tw-p-2">
                      <Field
                        v-slot="{ field, errorMessage, errors }"
                        :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.DATES.VALID_TO')"
                        :model-value="getFilterDate('endDate')"
                        name="endDate"
                        rules="after:@startDate"
                      >
                        <VcInput
                          v-bind="field"
                          :label="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.DATES.VALID_TO')"
                          type="datetime-local"
                          :model-value="getFilterDate('endDate')"
                          :disabled="readonly"
                          :error="!!errors.length"
                          :error-message="errorMessage"
                          @update:model-value="(e) => setFilterDate('endDate', e as string)"
                        ></VcInput>
                      </Field>
                    </VcCol>
                  </VcRow>
                </Form>
              </div>
            </VcCard>
            <VcCard
              v-if="offerDetails.id"
              :header="$t('OFFERSCLASSIC.PAGES.DETAILS.FIELDS.IMAGES.TITLE')"
              class="tw-my-3 tw-relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('offer_gallery')"
              @state:collapsed="handleCollapsed('offer_gallery', $event)"
            >
              <VcLoading :active="imageUploading"></VcLoading>
              <div class="tw-p-2">
                <VcGallery
                  :images="offerDetails.images"
                  :disabled="readonly"
                  :multiple="true"
                  @upload="onGalleryUpload"
                  @item:edit="onGalleryItemEdit"
                  @item:remove="onGalleryImageRemove"
                  @sort="onGallerySort"
                ></VcGallery>
              </div>
            </VcCard>
          </VcForm>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import {
  computed,
  ref,
  onMounted,
  onBeforeUpdate,
  nextTick,
  unref,
  watch,
  markRaw,
  Ref,
  VNodeRef,
  ComponentPublicInstance,
} from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  useNotifications,
  notification,
  AssetsDetails,
  useBladeNavigation,
  usePopup,
  useBeforeUnload,
} from "@vc-shell/framework";
import { useOffer } from "../composables";
import * as _ from "lodash-es";
import { OfferPrice, InventoryInfo, ISellerProduct, Image, IImage, IOfferDetails } from "@vc-app/api";
import { Form, useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import moment from "moment";
import { useI18n } from "vue-i18n";
import { useDynamicProperties, useFulfillmentCenters, useMarketplaceSettings, useMultilanguage } from "../../common";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    sellerProduct: ISellerProduct;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}
defineOptions({
  url: "/offer-cls",
  name: "OffersClassic",
  routable: false,
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { openBlade } = useBladeNavigation();
const { getLanguages, localesOptions, setLocale, currentLocale } = useMultilanguage();
const { loadDictionaries, getPropertyValue, setPropertyValue } = useDynamicProperties();
const { t } = useI18n({ useScope: "global" });

const { createOffer, updateOffer, offerDetails, fetchProducts, offer, loadOffer, loading, makeCopy, deleteOffer } =
  useOffer();
const { onBeforeClose } = useBladeNavigation();
useBeforeUnload(
  computed(
    () => !!offerDetails.value.prices && !!offerDetails.value.prices.length && !isDisabled.value && modified.value,
  ),
);

const { showError, showConfirmation } = usePopup();
const { setFieldError } = useForm({
  validateOnMount: false,
});

const { moduleNotifications, markAsRead } = useNotifications(["OfferCreatedDomainEvent", "OfferDeletedDomainEvent"]);
const isFormValid = useIsFormValid();
const isDirty = useIsFormDirty();
const priceRefs = ref<VNodeRef[]>([]);
const container = ref();
const offerLoading = ref(false);
const productLoading = ref(false);
const pricingEqual = ref(false);
const duplicates = ref([]) as Ref<string[]>;
const imageUploading = ref(false);

let offerDetailsCopy: IOfferDetails;
const modified = ref(false);

const filterTypes = ["Variation"];

const filteredProps = computed(() => {
  return offerDetails.value?.properties?.filter((x) => filterTypes.includes(x.type!));
});

const { fulfillmentCentersList, searchFulfillmentCenters } = useFulfillmentCenters();

const { currencies, loadSettings, defaultCurrency } = useMarketplaceSettings();

watch(
  () => offerDetails,
  (state) => {
    if (offerDetailsCopy) {
      modified.value = !_.isEqual(offerDetailsCopy, state.value);
    }
  },
  { deep: true },
);

onMounted(async () => {
  try {
    offerLoading.value = true;
    await getLanguages();

    await loadSettings();
    if (props.param) {
      await loadOffer({ id: props.param });
    } else {
      offerDetails.value.trackInventory = true;
      await addEmptyInventory();
      addPrice();
      makeCopy();
      offerDetails.value.sku = generateSku();
    }

    const searchableProductId =
      offer.value.productId ||
      offerDetails.value.productId ||
      props.options?.sellerProduct?.publishedProductDataId ||
      props.options?.sellerProduct?.stagedProductDataId;
    if (searchableProductId) {
      await setProductItem(searchableProductId);
    }
    offerDetailsCopy = _.cloneDeep(offerDetails.value);
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
      ? offerDetails.value.name + " " + t("OFFERSCLASSIC.PAGES.DETAILS.OFFER_DETAILS")
      : ""
    : t("OFFERSCLASSIC.PAGES.DETAILS.TITLE");
});

const isDisabled = computed(() => {
  return !isDirty.value || !isFormValid.value;
});

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      notification.success(message.title ?? "", {
        onClose() {
          markAsRead(message);
        },
      });
    });
  },
  { deep: true },
);

watch(
  () => offerDetails.value?.prices,
  () => {
    scrollToLastPrice();
  },
);

watch(
  () => offerDetails.value.inventory,
  () => {
    offerDetails.value.inventory?.forEach((x) => {
      if (!x.inStockQuantity) {
        x.inStockQuantity = 0;
      }
    });
  },
  { deep: true },
);

watch(
  () => offerDetails.value.prices,
  (newVal) => {
    nextTick(() => {
      const dupes: string[] = [];
      newVal?.forEach((o, idx) => {
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
  { deep: true },
);

watch(duplicates, (newVal, oldVal) => {
  Object.values(oldVal).forEach((x) => setFieldError(x, undefined));
  Object.values(newVal).forEach((x) => setFieldError(x, "Invalid value"));
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("OFFERSCLASSIC.PAGES.DETAILS.TOOLBAR.SAVE")),
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
        offerDetailsCopy = _.cloneDeep(offerDetails.value);
        modified.value = false;
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      } else {
        showError(unref(computed(() => t("OFFERSCLASSIC.PAGES.ALERTS.NOT_VALID"))));
      }
    },
    isVisible: true,
    disabled: computed(
      () => !(offerDetails.value.prices && offerDetails.value.prices.length && !isDisabled.value && modified.value),
    ),
  },
  {
    id: "enable",
    title: t("OFFERSCLASSIC.PAGES.DETAILS.TOOLBAR.ENABLE"),
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
    title: t("OFFERSCLASSIC.PAGES.DETAILS.TOOLBAR.DISABLE"),
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
    title: t("OFFERSCLASSIC.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "fas fa-trash",
    async clickHandler() {
      if (await showConfirmation(unref(computed(() => t("OFFERSCLASSIC.PAGES.ALERTS.DELETE_OFFER"))))) {
        if (props.param) {
          await deleteOffer({ id: props.param });
          emit("parent:call", {
            method: "reload",
          });
          emit("close:blade");
        }
      }
    },
    isVisible: computed(() => !!props.param && !offerLoading.value),
  },
]);

function scrollToLastPrice() {
  nextTick(() => {
    const element = (priceRefs.value[priceRefs.value.length - 1] as unknown as ComponentPublicInstance).$el;
    const top = element.offsetTop;
    container.value.$el.firstChild.scrollTo({ top, behavior: "smooth" });
  });
}

const addEmptyInventory = async () => {
  offerDetails.value.inventory = [];
  await searchFulfillmentCenters({});
  fulfillmentCentersList.value.forEach((x) => {
    const inventoryInfo = new InventoryInfo();
    inventoryInfo.id = x.name;
    inventoryInfo.fulfillmentCenter = x;
    inventoryInfo.fulfillmentCenterId = x.id;
    inventoryInfo.fulfillmentCenterName = x.name;
    inventoryInfo.inStockQuantity = 0;
    inventoryInfo.createdDate = new Date();
    offerDetails.value.inventory?.push(inventoryInfo);
  });
};

function addPrice(scroll = false) {
  if (!offerDetails.value.prices) {
    offerDetails.value.prices = [];
  }
  offerDetails.value.prices.push(
    new OfferPrice({
      currency: defaultCurrency.value.value,
      listPrice: 0,
      minQuantity: 0,
    }),
  );
  if (scroll) {
    scrollToLastPrice();
  }
}

function removePrice(idx: number) {
  offerDetails.value.prices?.splice(idx, 1);
  priceRefs.value.splice(idx, 1);
}

function setPriceRefs(el: VNodeRef) {
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

function setFilterDate(key: keyof typeof offerDetails.value, value: string) {
  const date = moment(value).toDate();
  if (date instanceof Date && !isNaN(date.valueOf())) {
    (offerDetails.value[key] as Date) = date;
  } else {
    (offerDetails.value[key] as undefined) = undefined;
  }
}

function getFilterDate(key: string) {
  const date = offerDetails.value[key as keyof typeof offerDetails.value] as Date;
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

const onGalleryItemEdit = (item: Image) => {
  openBlade({
    blade: markRaw(AssetsDetails),
    options: {
      asset: item,
      assetEditHandler: sortImage,
      assetRemoveHandler: onGalleryImageRemove,
    },
  });
};

async function sortImage(localImage: IImage) {
  const images = offerDetails.value.images;
  const image = new Image(localImage);
  if (images && images.length) {
    const imageIndex = images.findIndex((img) => img.id === localImage.id);

    images[imageIndex] = image;

    editImages(images);
  }
}

const editImages = (args: Image[]) => {
  offerDetails.value.images = args;
};

const onGallerySort = (images: IImage[]) => {
  offerDetails.value.images = images.map((x) => new Image(x));
};

const onGalleryImageRemove = async (image: IImage) => {
  if (await showConfirmation(unref(computed(() => t("OFFERSCLASSIC.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION"))))) {
    const imageIndex = offerDetails.value.images?.findIndex((img) => {
      if (img.id && image.id) {
        return img.id === image.id;
      } else {
        return img.url === image.url;
      }
    });

    if (imageIndex) {
      offerDetails.value.images?.splice(imageIndex, 1);
    }
  }
};

const onGalleryUpload = async (files: FileList | null) => {
  if (files) {
    try {
      imageUploading.value = true;
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        // const authToken = await getAccessToken();
        const result = await fetch(`/api/assets?folderUrl=/offers/${offerDetails.value.id}`, {
          method: "POST",
          body: formData,
        });
        const response = await result.json();
        if (response?.length) {
          const image = new Image(response[0]);
          image.createdDate = new Date();
          if (offerDetails.value.images && offerDetails.value.images.length) {
            const lastImageSortOrder = offerDetails.value.images[offerDetails.value.images.length - 1].sortOrder;
            image.sortOrder = (lastImageSortOrder ?? 0) + 1;
          } else {
            image.sortOrder = 0;
          }
          offerDetails.value.images?.push(image);
        }
      }
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      imageUploading.value = false;
    }

    files = null;
  }
};

onBeforeClose(async () => {
  if (!isDisabled.value && modified.value) {
    return await showConfirmation(unref(computed(() => t("OFFERSCLASSIC.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
  }
});

defineExpose({
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
