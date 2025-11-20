<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    :expanded="expanded"
    :closable="closable"
    width="70%"
    @close="onClose"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="false">
      <div class="tw-p-6 tw-space-y-6">
        <!-- Language Selector (top-right) -->
        <div
          v-if="languages.length > 1"
          class="tw-flex tw-justify-end tw-mb-4"
        >
          <VcSelect
            v-model="currentLanguage"
            :options="languages"
            class="tw-w-48"
            :placeholder="$t('OFFERS.PAGES.DETAILS.SELECT_LANGUAGE')"
          />
        </div>

        <!-- Basic Information -->
        <VcForm class="tw-space-y-4">
          <!-- Product Selector -->
          <Field
            v-slot="{ field, errorMessage, errors }"
            :model-value="offer.productId"
            name="productId"
            rules="required"
          >
            <VcLabel>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.LABEL") }} *</VcLabel>
            <VcSelect
              v-bind="field"
              v-model="offer.productId"
              :disabled="isEditMode && disableFieldsAfterCreate"
              :options="productOptions"
              :loading="loadingProducts"
              :searchable="true"
              :clearable="false"
              :error="!!errors.length"
              :error-message="errorMessage"
              @search="searchProducts"
            >
              <template #option="{ opt }">
                <div class="tw-flex tw-items-center tw-gap-3">
                  <img
                    v-if="opt.image"
                    :src="opt.image"
                    :alt="opt.label"
                    class="tw-w-10 tw-h-10 tw-object-cover tw-rounded"
                  />
                  <div>
                    <div class="tw-font-medium">{{ opt.label }}</div>
                    <div class="tw-text-sm tw-text-gray-500">{{ opt.sku }}</div>
                  </div>
                </div>
              </template>
            </VcSelect>
          </Field>

          <!-- Name -->
          <Field
            v-slot="{ field, errorMessage, errors }"
            :model-value="offer.name"
            name="name"
            rules="required"
          >
            <VcLabel>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.NAME.LABEL") }} *</VcLabel>
            <VcInput
              v-bind="field"
              v-model="offer.name"
              :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
              :error="!!errors.length"
              :error-message="errorMessage"
            />
          </Field>

          <!-- Product Type -->
          <Field
            v-slot="{ field, errorMessage, errors }"
            :model-value="offer.productType"
            name="productType"
            rules="required"
          >
            <VcLabel :tooltip="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TOOLTIP')">
              {{ $t("OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.LABEL") }} *
            </VcLabel>
            <VcSelect
              v-bind="field"
              v-model="offer.productType"
              :disabled="isEditMode && disableFieldsAfterCreate"
              :options="productTypeOptions"
              :error="!!errors.length"
              :error-message="errorMessage"
            />
          </Field>
        </VcForm>

        <!-- Inventory Section -->
        <VcCard :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.INVENTORY')">
          <VcForm class="tw-space-y-4">
            <!-- SKU -->
            <Field
              v-slot="{ field, errorMessage, errors }"
              :model-value="offer.sku"
              name="sku"
              :rules="skuValidationRules"
            >
              <VcLabel>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.SKU.LABEL") }} *</VcLabel>
              <VcInput
                v-bind="field"
                v-model="offer.sku"
                :error="!!errors.length || !!skuError"
                :error-message="errorMessage || skuError"
                :loading="validatingSku"
                @update:model-value="onSkuChange"
              />
              <div class="tw-text-sm tw-text-gray-500 tw-mt-1">
                {{ $t("OFFERS.PAGES.DETAILS.FIELDS.SKU.HINT") }}
              </div>
            </Field>

            <!-- Track Inventory Switch -->
            <div class="tw-flex tw-items-center tw-gap-3">
              <VcSwitch
                v-model="trackInventoryInverted"
                :label="$t('OFFERS.PAGES.DETAILS.FIELDS.TRACK_INVENTORY.LABEL')"
                :tooltip="$t('OFFERS.PAGES.DETAILS.FIELDS.TRACK_INVENTORY.TOOLTIP')"
              />
            </div>

            <!-- Fulfillment Centers -->
            <div v-if="!trackInventoryInverted">
              <VcLabel>{{ $t("OFFERS.PAGES.DETAILS.FIELDS.FULFILLMENT_CENTERS.LABEL") }}</VcLabel>
              <div class="tw-space-y-3 tw-mt-2">
                <div
                  v-for="center in fulfillmentCenters"
                  :key="center.id"
                  class="tw-flex tw-items-center tw-gap-4"
                >
                  <div class="tw-flex-1 tw-font-medium">{{ center.name }}</div>
                  <Field
                    v-slot="{ field, errorMessage, errors }"
                    :model-value="getQuantityForCenter(center.id)"
                    :name="`quantity_${center.id}`"
                    rules="required|min_value:0"
                  >
                    <VcInput
                      v-bind="field"
                      :model-value="getQuantityForCenter(center.id)"
                      type="number"
                      :min="0"
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      class="tw-w-32"
                      @update:model-value="(val) => setQuantityForCenter(center.id, val)"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </VcForm>
        </VcCard>

        <!-- Gallery Section -->
        <VcCard
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.GALLERY')"
          :collapsible="true"
          :collapsed="galleryCollapsed"
          @toggle="galleryCollapsed = !galleryCollapsed"
        >
          <VcGallery
            v-if="!galleryCollapsed"
            v-model="images"
            :upload-url="`/api/assets/offers/${offer.id || 'temp'}`"
            :loading="uploadingImages"
            multiple
            @upload="onImageUpload"
            @remove="onImageRemove"
            @reorder="onImageReorder"
            @edit="onImageEdit"
          />
        </VcCard>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useForm, Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { useBeforeUnload, useBladeNavigation, notification, usePopup } from "@vc-shell/framework";
import type { IBladeToolbar, ICommonAsset } from "@vc-shell/framework";
import useOfferDetails from "../composables/useOfferDetails";
import { debounce } from "lodash-es";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

interface Emits {
  (event: "parent:call", args: { method: string; args?: unknown }): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

defineOptions({
  name: "OfferDetails",
  url: "/offer",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });
const { closeBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

// Composable
const {
  offer,
  loading,
  modified,
  settings,
  languages,
  fulfillmentCenters,
  loadOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  validateSku,
  searchOfferProducts,
  enableOffer,
  disableOffer,
  setAsDefault,
} = useOfferDetails();

// Prevent browser unload with unsaved changes
useBeforeUnload(modified);

// Form validation
const { meta } = useForm();

// Local state
const currentLanguage = ref("en-US");
const productOptions = ref<any[]>([]);
const loadingProducts = ref(false);
const validatingSku = ref(false);
const skuError = ref("");
const images = ref<ICommonAsset[]>([]);
const uploadingImages = ref(false);
const galleryCollapsed = ref(false);
const disableFieldsAfterCreate = ref(true);

// Computed
const title = computed(() =>
  offer.value?.id
    ? t("OFFERS.PAGES.DETAILS.TITLE_EDIT", { name: offer.value.name })
    : t("OFFERS.PAGES.DETAILS.TITLE_NEW"),
);

const isEditMode = computed(() => !!offer.value?.id);

const trackInventoryInverted = computed({
  get: () => !offer.value.trackInventory,
  set: (val) => {
    offer.value.trackInventory = !val;
  },
});

const productTypeOptions = [
  { label: "Physical", value: "Physical" },
  { label: "Digital", value: "Digital" },
];

const skuValidationRules = "required|min:3|max:61";

// Generate default SKU
function generateDefaultSku(): string {
  const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
  const numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  return `${letters}-${numbers}`;
}

// Search products with debounce
const searchProducts = debounce(async (query: string) => {
  if (!query || query.length < 2) return;

  loadingProducts.value = true;
  try {
    const results = await searchOfferProducts(query);
    productOptions.value = results.map((p: any) => ({
      label: p.name,
      value: p.id,
      image: p.imgSrc,
      sku: p.code,
    }));
  } catch (error) {
    console.error("Error searching products:", error);
  } finally {
    loadingProducts.value = false;
  }
}, 300);

// SKU validation with debounce
const onSkuChange = debounce(async (value: string) => {
  if (!value || value.length < 3) {
    skuError.value = "";
    return;
  }

  validatingSku.value = true;
  skuError.value = "";

  try {
    const result = await validateSku(value, offer.value?.id);
    if (!result.isValid) {
      skuError.value = t("OFFERS.PAGES.DETAILS.FIELDS.SKU.ERROR_EXISTS", { sku: value });
    }
  } catch (error) {
    console.error("Error validating SKU:", error);
  } finally {
    validatingSku.value = false;
  }
}, 1000);

// Fulfillment center quantities
function getQuantityForCenter(centerId: string): number {
  return offer.value.fulfillmentCenterQuantities?.[centerId] || 0;
}

function setQuantityForCenter(centerId: string, quantity: unknown) {
  const numValue = Number(quantity);
  if (!offer.value.fulfillmentCenterQuantities) {
    offer.value.fulfillmentCenterQuantities = {};
  }
  offer.value.fulfillmentCenterQuantities[centerId] = numValue;
}

// Image handlers
async function onImageUpload(files: File[]) {
  uploadingImages.value = true;
  try {
    // Upload logic here
    notification.success(t("OFFERS.PAGES.DETAILS.IMAGE_UPLOAD_SUCCESS"));
  } catch (error) {
    notification.error(t("OFFERS.PAGES.DETAILS.IMAGE_UPLOAD_ERROR"));
  } finally {
    uploadingImages.value = false;
  }
}

function onImageRemove(image: ICommonAsset) {
  const confirmed = confirm(t("OFFERS.PAGES.DETAILS.CONFIRM_REMOVE_IMAGE"));
  if (!confirmed) return;

  images.value = images.value.filter((img) => img.id !== image.id);
  notification.success(t("OFFERS.PAGES.DETAILS.IMAGE_REMOVE_SUCCESS"));
}

function onImageReorder(reorderedImages: ICommonAsset[]) {
  images.value = reorderedImages;
}

function onImageEdit(image: ICommonAsset) {
  // Open image editor
}

// CRUD Handlers
async function onSave() {
  if (!meta.value.valid || !!skuError.value) {
    notification.warning(t("COMMON.VALIDATION_ERRORS"));
    return;
  }

  try {
    if (offer.value.id) {
      await updateOffer();
      notification.success(t("OFFERS.PAGES.DETAILS.SAVE_SUCCESS"));
      emit("parent:call", { method: "reload" });
    } else {
      const created = await createOffer();
      notification.success(t("OFFERS.PAGES.DETAILS.CREATE_SUCCESS"));
      // Open details blade for the created offer
      emit("parent:call", { method: "reload" });
      emit("parent:call", { method: "openDetails", args: created.id });
    }
  } catch (error) {
    console.error("Error saving offer:", error);
    notification.error(t("OFFERS.PAGES.DETAILS.SAVE_ERROR"));
  }
}

async function onEnableOffer() {
  if (!offer.value?.id) return;

  try {
    await enableOffer(offer.value.id);
    notification.success(t("OFFERS.PAGES.DETAILS.ENABLE_SUCCESS"));
    await loadOffer(offer.value.id);
  } catch (error) {
    notification.error(t("OFFERS.PAGES.DETAILS.ENABLE_ERROR"));
  }
}

async function onDisableOffer() {
  if (!offer.value?.id) return;

  try {
    await disableOffer(offer.value.id);
    notification.success(t("OFFERS.PAGES.DETAILS.DISABLE_SUCCESS"));
    await loadOffer(offer.value.id);
  } catch (error) {
    notification.error(t("OFFERS.PAGES.DETAILS.DISABLE_ERROR"));
  }
}

async function onSetAsDefault() {
  if (!offer.value?.id) return;

  try {
    await setAsDefault(offer.value.id);
    notification.success(t("OFFERS.PAGES.DETAILS.SET_DEFAULT_SUCCESS"));
    await loadOffer(offer.value.id);
  } catch (error) {
    notification.error(t("OFFERS.PAGES.DETAILS.SET_DEFAULT_ERROR"));
  }
}

async function onDelete() {
  if (!offer.value?.id) return;

  const confirmed = await showConfirmation(t("OFFERS.PAGES.DETAILS.CONFIRM_DELETE"));
  if (!confirmed) return;

  try {
    await deleteOffer(offer.value.id);
    notification.success(t("OFFERS.PAGES.DETAILS.DELETE_SUCCESS"));
    emit("close:blade");
  } catch (error) {
    notification.error(t("OFFERS.PAGES.DETAILS.DELETE_ERROR"));
  }
}

function onClose() {
  if (modified.value) {
    const confirmed = confirm(t("COMMON.UNSAVED_CHANGES"));
    if (!confirmed) return;
  }
  emit("close:blade");
}

// Toolbar
const bladeToolbar = computed<IBladeToolbar[]>(() => {
  const toolbar: IBladeToolbar[] = [
    {
      id: "save",
      title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE"),
      icon: "fas fa-save",
      disabled: !meta.value.valid || !modified.value || !!skuError.value,
      async clickHandler() {
        await onSave();
      },
    },
  ];

  // Add enable/disable/set default buttons only for existing offers
  if (offer.value?.id) {
    if (!offer.value.isActive) {
      toolbar.push({
        id: "enable",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.ENABLE"),
        icon: "fas fa-check-circle",
        async clickHandler() {
          await onEnableOffer();
        },
      });
    } else {
      toolbar.push({
        id: "disable",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DISABLE"),
        icon: "fas fa-times-circle",
        async clickHandler() {
          await onDisableOffer();
        },
      });
    }

    if (settings.value?.allowDefault && !offer.value.isDefault) {
      toolbar.push({
        id: "set-default",
        title: t("OFFERS.PAGES.DETAILS.TOOLBAR.SET_DEFAULT"),
        icon: "fas fa-star",
        disabled: offer.value.isDefault,
        async clickHandler() {
          await onSetAsDefault();
        },
      });
    }

    toolbar.push({
      id: "delete",
      title: t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE"),
      icon: "fas fa-trash",
      async clickHandler() {
        await onDelete();
      },
    });
  }

  return toolbar;
});

// Initialize
onMounted(async () => {
  if (props.param) {
    await loadOffer(props.param);
    images.value = offer.value.images || [];
  } else {
    // Generate default SKU for new offers
    offer.value.sku = generateDefaultSku();
  }
});

// Watch for browser refresh with unsaved changes
watch(modified, (isModified) => {
  if (isModified) {
    window.onbeforeunload = () => t("COMMON.UNSAVED_CHANGES");
  } else {
    window.onbeforeunload = null;
  }
});

// Expose
defineExpose({
  title,
  reload: () => {
    if (props.param) {
      return loadOffer(props.param);
    }
  },
  save: onSave,
});
</script>
