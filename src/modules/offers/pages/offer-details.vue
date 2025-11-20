<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    :modified="isModified"
    width="70%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="tw-p-4">
      <div class="tw-space-y-4">
        <!-- Product Selection Card -->
        <VcCard
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.PRODUCT')"
          icon="fas fa-box"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="productId"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="item.productId"
                :label="$t('OFFERS.PAGES.DETAILS.FORM.PRODUCT')"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FORM.PRODUCT_PLACEHOLDER')"
                :disabled="loading || !!props.param"
                :error-message="errorMessage"
                :options="productOptions"
                :loading="loadingProducts"
                :searchable="true"
                option-label="name"
                option-value="id"
                @update:model-value="handleChange"
                @search="searchProducts"
              >
                <template #option="{ option }">
                  <div class="tw-flex tw-items-center tw-gap-3">
                    <VcImage
                      :src="option.imgSrc"
                      size="s"
                      aspect="1x1"
                      :bordered="true"
                    />
                    <div class="tw-flex-1">
                      <div class="tw-font-medium">{{ option.name }}</div>
                      <div class="tw-text-sm tw-text-gray-500">{{ option.sku }}</div>
                    </div>
                  </div>
                </template>
              </VcSelect>
            </Field>
          </div>
        </VcCard>

        <!-- Basic Information Card -->
        <VcCard
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.BASIC_INFO')"
          icon="fas fa-info-circle"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.name"
                :label="$t('OFFERS.PAGES.DETAILS.FORM.NAME')"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FORM.NAME_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                :multilanguage="multilanguageEnabled"
                :current-language="currentLanguage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="productType"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="item.productType"
                :label="$t('OFFERS.PAGES.DETAILS.FORM.PRODUCT_TYPE')"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FORM.PRODUCT_TYPE_PLACEHOLDER')"
                :disabled="loading || !!props.param"
                :error-message="errorMessage"
                :tooltip="$t('OFFERS.PAGES.DETAILS.FORM.PRODUCT_TYPE_TOOLTIP')"
                :options="productTypeOptions"
                option-label="label"
                option-value="value"
                @update:model-value="handleChange"
              />
            </Field>
          </div>
        </VcCard>

        <!-- Inventory Card -->
        <VcCard
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.INVENTORY')"
          icon="fas fa-warehouse"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="sku"
              :rules="skuValidationRules"
            >
              <VcInput
                v-bind="field"
                v-model="item.sku"
                :label="$t('OFFERS.PAGES.DETAILS.FORM.SKU')"
                :placeholder="$t('OFFERS.PAGES.DETAILS.FORM.SKU_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage || skuError"
                :maxlength="61"
                @update:model-value="handleSkuChange($event, handleChange)"
              />
            </Field>

            <VcSwitch
              v-model="trackInventory"
              :label="$t('OFFERS.PAGES.DETAILS.FORM.TRACK_INVENTORY')"
              :tooltip="$t('OFFERS.PAGES.DETAILS.FORM.TRACK_INVENTORY_TOOLTIP')"
            />

            <!-- Fulfillment Centers Inventory -->
            <div v-if="!trackInventory && fulfillmentCenters.length" class="tw-space-y-3">
              <div
                v-for="center in fulfillmentCenters"
                :key="center.id"
                class="tw-border tw-rounded tw-p-3"
              >
                <Field
                  v-slot="{ field, errorMessage, handleChange }"
                  :name="`inventory_${center.id}`"
                  rules="required|min_value:0"
                >
                  <VcInput
                    v-bind="field"
                    v-model="inventoryQuantities[center.id]"
                    :label="center.name"
                    type="number"
                    :min="0"
                    :disabled="loading || trackInventory"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  />
                </Field>
              </div>
            </div>
          </div>
        </VcCard>

        <!-- Gallery Card -->
        <VcCard
          v-if="props.param"
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.GALLERY')"
          icon="fas fa-images"
          :is-collapsable="true"
          :is-collapsed="collapsedState.gallery"
          @state:collapsed="collapsedState.gallery = $event"
        >
          <div class="tw-p-2">
            <VcGallery
              :images="item.images || []"
              :multiple="true"
              :disabled="loading"
              :loading="uploading"
              @upload="handleImageUpload"
              @remove="handleImageRemove"
              @edit="handleImageEdit"
              @sort="handleImageSort"
            />
          </div>
        </VcCard>
      </div>
    </VcContainer>

    <!-- Language Selector -->
    <template v-if="multilanguageEnabled && languages.length > 1" #language-selector>
      <VcSelect
        v-model="currentLanguage"
        :options="languages"
        option-label="displayName"
        option-value="code"
        class="tw-w-32"
      />
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  IParentCallArgs,
  useBladeNavigation,
  useBeforeUnload,
  usePopup,
  useWidgets,
  notification,
} from "@vc-shell/framework";
import { useOfferDetails } from "../composables";
import { Field, useForm } from "vee-validate";
import { debounce } from "lodash-es";

// Import widgets
import SpecialPricesWidget from "../components/widgets/special-prices-widget.vue";

interface IOfferImage {
  id: string;
  url: string;
  name?: string;
  sortOrder?: number;
}

interface IFulfillmentCenter {
  id: string;
  name: string;
}

interface ILanguage {
  code: string;
  displayName: string;
}

interface IProduct {
  id: string;
  name: string;
  sku: string;
  imgSrc?: string;
}

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string; // Offer ID
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "OfferDetails",
  url: "/offer",
});

const { t } = useI18n({ useScope: "global" });
const { onBeforeClose, closeBlade } = useBladeNavigation();
const { showConfirmation, showInfo } = usePopup();
const { meta } = useForm({ validateOnMount: false });
const { registerWidget, unregisterWidget } = useWidgets();

// Use the details composable
const {
  item,
  loading,
  isModified,
  load,
  save,
  remove,
  enable,
  disable,
  setDefault,
  validateSku,
  searchProducts: apiSearchProducts,
  uploadImages,
  deleteImage,
  loadLanguages,
  loadSettings,
  settings,
} = useOfferDetails();

// Local state
const uploading = ref(false);
const loadingProducts = ref(false);
const productOptions = ref<IProduct[]>([]);
const skuError = ref("");
const fulfillmentCenters = ref<IFulfillmentCenter[]>([]);
const inventoryQuantities = ref<Record<string, number>>({});
const languages = ref<ILanguage[]>([]);
const currentLanguage = ref("en-US");
const multilanguageEnabled = ref(false);
const collapsedState = ref({
  gallery: false,
});

// Track inventory with inverted logic
const trackInventory = computed({
  get: () => !item.value.trackInventory,
  set: (value) => {
    item.value.trackInventory = !value;
  },
});

// Product type options
const productTypeOptions = computed(() => [
  { label: t("OFFERS.PAGES.DETAILS.FORM.PRODUCT_TYPE_PHYSICAL"), value: "Physical" },
  { label: t("OFFERS.PAGES.DETAILS.FORM.PRODUCT_TYPE_DIGITAL"), value: "Digital" },
]);

// SKU validation rules
const skuValidationRules = computed(() => ({
  required: true,
  min: 3,
  max: 61,
}));

const bladeTitle = computed(() => {
  if (props.param && item.value?.name) {
    return item.value.name;
  }
  return props.param
    ? t("OFFERS.PAGES.DETAILS.TITLE")
    : t("OFFERS.PAGES.DETAILS.TITLE_NEW");
});

const bladeToolbar = computed((): IBladeToolbar[] => {
  const toolbar: IBladeToolbar[] = [
    {
      id: "save",
      title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
      icon: "fas fa-save",
      disabled: computed(() => !isModified.value || !meta.value.valid),
      async clickHandler() {
        await handleSave();
      },
    },
  ];

  // Add enable/disable buttons for existing offers
  if (props.param) {
    if (!item.value.isActive) {
      toolbar.push({
        id: "enable",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.ENABLE"),
        icon: "fas fa-check",
        async clickHandler() {
          await handleEnable();
        },
      });
    } else {
      toolbar.push({
        id: "disable",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DISABLE"),
        icon: "fas fa-ban",
        async clickHandler() {
          await handleDisable();
        },
      });
    }

    // Set as default (conditional on settings)
    if (settings.value?.allowMultipleOffers) {
      toolbar.push({
        id: "set-default",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SET_DEFAULT"),
        icon: "fas fa-star",
        disabled: computed(() => item.value.isDefault),
        async clickHandler() {
          await handleSetDefault();
        },
      });
    }

    // Delete button
    toolbar.push({
      id: "delete",
      title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE"),
      icon: "fas fa-trash",
      async clickHandler() {
        await handleDelete();
      },
    });
  }

  return toolbar;
});

// Debounced SKU validation
const validateSkuDebounced = debounce(async (sku: string) => {
  if (!sku || sku.length < 3) {
    skuError.value = "";
    return;
  }

  try {
    const isValid = await validateSku(sku, item.value.id);
    if (!isValid) {
      skuError.value = t("OFFERS.PAGES.DETAILS.VALIDATION.SKU_EXISTS", { sku });
    } else {
      skuError.value = "";
    }
  } catch (error) {
    console.error("[OfferDetails] SKU validation error:", error);
  }
}, 1000);

// Generate default SKU
function generateDefaultSku(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const numbers = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${letters}-${numbers}`;
}

// Event handlers
function handleSkuChange(value: string, veeHandleChange: (value: unknown) => void) {
  veeHandleChange(value);
  validateSkuDebounced(value);
}

async function searchProducts(keyword: string) {
  if (!keyword || keyword.length < 2) {
    productOptions.value = [];
    return;
  }

  loadingProducts.value = true;
  try {
    const results = await apiSearchProducts(keyword);
    productOptions.value = results;
  } catch (error) {
    console.error("[OfferDetails] Error searching products:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.SEARCH_PRODUCTS"));
  } finally {
    loadingProducts.value = false;
  }
}

async function handleSave() {
  if (!meta.value.valid) {
    await showInfo({
      title: t("OFFERS.PAGES.DETAILS.ALERTS.NOT_VALID"),
    });
    return;
  }

  if (skuError.value) {
    await showInfo({
      title: t("OFFERS.PAGES.DETAILS.ALERTS.SKU_NOT_VALID"),
    });
    return;
  }

  try {
    // Update inventory info from quantities
    if (!trackInventory.value) {
      item.value.inventoryInfo = fulfillmentCenters.value.map((center) => ({
        fulfillmentCenterId: center.id,
        fulfillmentCenterName: center.name,
        inStockQuantity: inventoryQuantities.value[center.id] || 0,
      }));
    }

    const isNew = !props.param;
    await save();
    
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.SAVED"));

    // Emit parent:call to reload parent blade
    emit("parent:call", { method: "reload" });

    // For new offers, open details blade
    if (isNew && item.value.id) {
      closeBlade();
      // Parent will handle opening the new details blade
    }
  } catch (error) {
    console.error("[OfferDetails] Error saving offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.SAVE"));
  }
}

async function handleEnable() {
  try {
    await enable();
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.ENABLED"));
    emit("parent:call", { method: "reload" });
  } catch (error) {
    console.error("[OfferDetails] Error enabling offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.ENABLE"));
  }
}

async function handleDisable() {
  try {
    await disable();
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.DISABLED"));
    emit("parent:call", { method: "reload" });
  } catch (error) {
    console.error("[OfferDetails] Error disabling offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.DISABLE"));
  }
}

async function handleSetDefault() {
  try {
    await setDefault();
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.SET_DEFAULT"));
    emit("parent:call", { method: "reload" });
  } catch (error) {
    console.error("[OfferDetails] Error setting default offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.SET_DEFAULT"));
  }
}

async function handleDelete() {
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.DETAILS.DELETE.CONFIRMATION")
  );

  if (!confirmed) return;

  try {
    await remove();
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.DELETED"));
    closeBlade();
  } catch (error) {
    console.error("[OfferDetails] Error deleting offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.DELETE"));
  }
}

async function handleImageUpload(files: File[]) {
  if (!item.value.id) {
    notification.warning(t("OFFERS.PAGES.DETAILS.WARNINGS.SAVE_BEFORE_UPLOAD"));
    return;
  }

  uploading.value = true;
  try {
    const uploadedImages = await uploadImages(item.value.id, files);
    item.value.images = [...(item.value.images || []), ...uploadedImages];
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.IMAGES_UPLOADED"));
  } catch (error) {
    console.error("[OfferDetails] Error uploading images:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.UPLOAD_IMAGES"));
  } finally {
    uploading.value = false;
  }
}

async function handleImageRemove(imageId: string) {
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.DETAILS.DELETE.IMAGE_CONFIRMATION")
  );

  if (!confirmed) return;

  try {
    await deleteImage(imageId);
    item.value.images = item.value.images?.filter((img: IOfferImage) => img.id !== imageId);
    notification.success(t("OFFERS.PAGES.DETAILS.MESSAGES.IMAGE_DELETED"));
  } catch (error) {
    console.error("[OfferDetails] Error deleting image:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.ERRORS.DELETE_IMAGE"));
  }
}

function handleImageEdit(image: IOfferImage) {
  // Handle image edit (could open a dialog for editing metadata)
  console.log("Edit image:", image);
}

function handleImageSort(images: IOfferImage[]) {
  item.value.images = images;
}

// Widget registration
function registerWidgets() {
  if (!props.param) return; // Only show widget for existing offers

  registerWidget(
    {
      id: "SpecialPricesWidget",
      component: SpecialPricesWidget,
      props: {
        offerId: computed(() => item.value.id),
        priceCount: computed(() => item.value.priceList?.length || 0),
      },
      isVisible: computed(() => !!props.param),
    },
    props.param
  );
}

// Prevent browser unload if modified
useBeforeUnload(isModified);

// Prevent blade close if modified
onBeforeClose(async () => {
  if (isModified.value) {
    const confirmed = await showConfirmation(
      t("OFFERS.PAGES.DETAILS.ALERTS.UNSAVED_CHANGES")
    );
    return confirmed;
  }
  return true;
});

// Watch for SKU changes to auto-generate if empty
watch(
  () => item.value.productId,
  (newProductId) => {
    if (newProductId && !item.value.sku) {
      item.value.sku = generateDefaultSku();
    }
  }
);

onMounted(async () => {
  // Load languages
  const loadedLanguages = await loadLanguages();
  languages.value = loadedLanguages;
  multilanguageEnabled.value = loadedLanguages.length > 1;

  // Load marketplace settings
  await loadSettings();

  // Load offer if editing
  if (props.param) {
    await load(props.param);

    // Initialize inventory quantities
    if (item.value.inventoryInfo) {
      item.value.inventoryInfo.forEach((info: any) => {
        inventoryQuantities.value[info.fulfillmentCenterId] = info.inStockQuantity || 0;
        
        // Add to fulfillment centers if not already present
        if (!fulfillmentCenters.value.find((c) => c.id === info.fulfillmentCenterId)) {
          fulfillmentCenters.value.push({
            id: info.fulfillmentCenterId,
            name: info.fulfillmentCenterName,
          });
        }
      });
    }
  }

  // Register widgets
  registerWidgets();

  // Listen for domain events
  // This would typically be done via SignalR or event bus
});

onBeforeUnmount(() => {
  if (props.param) {
    unregisterWidget("SpecialPricesWidget", props.param);
  }
});

defineExpose({
  reload: () => load(props.param!),
  title: bladeTitle,
});
</script>
