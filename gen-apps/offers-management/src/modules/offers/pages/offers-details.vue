<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    :modified="isModified"
    v-loading="loading"
    @close="onClose"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Language selector -->
    <template
      #header-bottom
      v-if="languages.length > 1"
    >
      <div class="tw-flex tw-justify-end tw-p-2">
        <VcSelect
          v-model="currentLanguage"
          :options="languageOptions"
          size="small"
          class="tw-w-40"
        />
      </div>
    </template>

    <VcContainer>
      <VcForm>
        <!-- Product Selection -->
        <VcCard :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.PRODUCT')">
          <Field
            v-slot="{ field, errors }"
            name="productId"
            rules="required"
          >
            <VcSelect
              v-bind="field"
              v-model="item.productId"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT')"
              :placeholder="$t('OFFERS.PAGES.DETAILS.PLACEHOLDERS.SELECT_PRODUCT')"
              :options="productOptions"
              :loading="fetchProductsLoading"
              :disabled="!!param"
              searchable
              required
              :error="errors[0]"
              @search="onProductSearch"
            >
              <template #option="{ option }">
                <div class="tw-flex tw-gap-2 tw-items-center">
                  <VcImage
                    v-if="option.image"
                    :src="option.image"
                    size="xs"
                  />
                  <div>
                    <div class="tw-font-bold">{{ option.label }}</div>
                    <div class="tw-text-xs tw-text-[#a1a7b3]">{{ option.sku }}</div>
                  </div>
                </div>
              </template>
            </VcSelect>
          </Field>
        </VcCard>

        <!-- Basic Information -->
        <VcCard :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.BASIC')">
          <Field
            v-slot="{ field, errors }"
            name="name"
            rules="required"
          >
            <VcInput
              v-bind="field"
              v-model="item.name"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME')"
              :placeholder="$t('OFFERS.PAGES.DETAILS.PLACEHOLDERS.ENTER_NAME')"
              required
              :error="errors[0]"
            />
          </Field>

          <Field
            v-slot="{ field, errors }"
            name="productType"
            rules="required"
          >
            <VcSelect
              v-bind="field"
              v-model="item.productType"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE')"
              :options="productTypeOptions"
              :disabled="!!param"
              :tooltip="$t('OFFERS.PAGES.DETAILS.TOOLTIPS.PRODUCT_TYPE')"
              required
              :error="errors[0]"
            />
          </Field>
        </VcCard>

        <!-- Inventory Section -->
        <VcCard :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.INVENTORY')">
          <Field
            v-slot="{ field, errors }"
            name="sku"
            rules="required|min:3|max:61"
          >
            <VcInput
              v-bind="field"
              v-model="item.sku"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU')"
              :placeholder="skuPlaceholder"
              required
              :error="errors[0] || skuValidationError"
              @update:model-value="onSkuChange"
            >
              <template #suffix>
                <VcButton
                  v-if="!param"
                  size="small"
                  variant="outline"
                  @click="generateSku"
                >
                  {{ $t("OFFERS.PAGES.DETAILS.ACTIONS.GENERATE_SKU") }}
                </VcButton>
              </template>
            </VcInput>
          </Field>

          <Field
            v-slot="{ field }"
            name="trackInventory"
          >
            <VcSwitch
              v-bind="field"
              v-model="item.trackInventory"
              :label="$t('OFFERS.PAGES.DETAILS.FIELDS.TRACK_INVENTORY')"
              :tooltip="$t('OFFERS.PAGES.DETAILS.TOOLTIPS.TRACK_INVENTORY')"
            />
          </Field>

          <!-- Fulfillment Centers Inventory -->
          <div
            v-if="item.trackInventory"
            class="tw-mt-4"
          >
            <div class="tw-font-bold tw-mb-2">{{ $t("OFFERS.PAGES.DETAILS.FIELDS.FULFILLMENT_INVENTORY") }}</div>
            <div
              v-for="center in fulfillmentCenters"
              :key="center.id"
              class="tw-mb-2"
            >
              <Field
                v-slot="{ field, errors }"
                :name="`inventory_${center.id}`"
                rules="required|min_value:0"
              >
                <VcInput
                  v-bind="field"
                  v-model.number="inventoryQuantities[center.id]"
                  :label="center.name"
                  type="number"
                  :min="0"
                  required
                  :error="errors[0]"
                />
              </Field>
            </div>
          </div>
        </VcCard>

        <!-- Gallery Section -->
        <VcCard
          :header="$t('OFFERS.PAGES.DETAILS.SECTIONS.GALLERY')"
          collapsible
          :collapsed="galleryCollapsed"
          @toggle="galleryCollapsed = !galleryCollapsed"
        >
          <VcGallery
            v-if="!galleryCollapsed"
            v-model="images"
            :upload-path="`offers/${param || 'temp'}`"
            :loading="uploadingImage"
            draggable
            @upload="onImageUpload"
            @remove="onImageRemove"
            @reorder="onImageReorder"
          >
            <template #item="{ item, index }">
              <div class="tw-relative">
                <VcImage
                  :src="item.url"
                  size="m"
                />
                <div class="tw-absolute tw-top-2 tw-right-2 tw-flex tw-gap-1">
                  <VcButton
                    size="small"
                    variant="danger"
                    @click="onImageRemove(index)"
                  >
                    <VcIcon
                      icon="fas fa-trash"
                      size="xs"
                    />
                  </VcButton>
                </div>
              </div>
            </template>
          </VcGallery>
        </VcCard>
      </VcForm>
    </VcContainer>

    <!-- Widgets section -->
    <template
      #widgets
      v-if="param"
    >
      <SpecialPricesWidget
        v-if="param"
        :offer-id="param"
        @click="onSpecialPricesClick"
      />
    </template>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue";
import { Field, useForm } from "vee-validate";
import { IParentCallArgs, IBladeToolbar, useBladeNavigation, useNotifications } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { debounce } from "lodash-es";
import useOfferDetails from "../composables/useOfferDetails";
import SpecialPricesWidget from "../components/special-prices-widget.vue";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: Record<string, any>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  name: "OffersDetails",
  url: "/offers/:id?",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const notifications = useNotifications();
const { openBlade } = useBladeNavigation();

const {
  item,
  loading,
  isModified,
  loadOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  validateSku,
  enableOffer,
  disableOffer,
  setAsDefault,
  fetchProducts,
  fetchProductsLoading,
} = useOfferDetails();

// Form validation
const { validate, errors } = useForm();

// State
const productOptions = ref<any[]>([]);
const languages = ref<any[]>([]);
const currentLanguage = ref("en-US");
const marketplaceSettings = ref<any>(null);
const skuValidationError = ref("");
const galleryCollapsed = ref(false);
const images = ref<any[]>([]);
const uploadingImage = ref(false);
const inventoryQuantities = ref<Record<string, number>>({});
const fulfillmentCenters = ref<any[]>([
  { id: "1", name: "Main Warehouse" },
  { id: "2", name: "East Coast Warehouse" },
  { id: "3", name: "West Coast Warehouse" },
]);

const title = computed(() =>
  props.param
    ? t("OFFERS.PAGES.DETAILS.TITLE_EDIT", { name: item.value.name || "" })
    : t("OFFERS.PAGES.DETAILS.TITLE_NEW"),
);

const languageOptions = computed(() =>
  languages.value.map((lang) => ({
    value: lang.code,
    label: lang.name,
  })),
);

const productTypeOptions = computed(() => [
  { value: "Physical", label: t("OFFERS.PAGES.DETAILS.PRODUCT_TYPES.PHYSICAL") },
  { value: "Digital", label: t("OFFERS.PAGES.DETAILS.PRODUCT_TYPES.DIGITAL") },
]);

const skuPlaceholder = computed(() => "XXX-XXXXXXXX");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    disabled: computed(() => !isModified.value || loading.value),
    async clickHandler() {
      await onSave();
    },
  },
  {
    id: "enable",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.ENABLE")),
    icon: "fas fa-check",
    isVisible: computed(() => !!props.param && !item.value.isActive),
    async clickHandler() {
      await onEnable();
    },
  },
  {
    id: "disable",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.DISABLE")),
    icon: "fas fa-ban",
    isVisible: computed(() => !!props.param && item.value.isActive),
    async clickHandler() {
      await onDisable();
    },
  },
  {
    id: "set-default",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.SET_DEFAULT")),
    icon: "fas fa-star",
    isVisible: computed(() => !!props.param && marketplaceSettings.value?.allowSetDefault),
    disabled: computed(() => item.value.isDefault),
    async clickHandler() {
      await onSetAsDefault();
    },
  },
  {
    id: "delete",
    title: computed(() => t("OFFERS.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      await onDelete();
    },
  },
]);

// SKU validation with debounce
const onSkuChange = debounce(async (value: string) => {
  if (value && value.length >= 3 && value.length <= 61) {
    try {
      const result = await validateSku(value, props.param);
      if (!result.isValid) {
        skuValidationError.value = t("OFFERS.PAGES.DETAILS.VALIDATION.SKU_EXISTS", { value });
      } else {
        skuValidationError.value = "";
      }
    } catch (error) {
      skuValidationError.value = "";
    }
  }
}, 1000);

function generateSku() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let sku = "";

  // Generate 3 random letters
  for (let i = 0; i < 3; i++) {
    sku += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  sku += "-";

  // Generate 8 random numbers
  for (let i = 0; i < 8; i++) {
    sku += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  item.value.sku = sku;
}

async function onProductSearch(keyword: string) {
  try {
    const result = await fetchProducts(keyword);
    productOptions.value = result.map((product) => ({
      value: product.id,
      label: product.name,
      sku: product.sku,
      image: product.image,
    }));
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.PRODUCT_SEARCH_FAILED") });
  }
}

async function onSave() {
  const result = await validate();
  if (!result.valid) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.VALIDATION_FAILED") });
    return;
  }

  if (skuValidationError.value) {
    notifications.error({ text: skuValidationError.value });
    return;
  }

  try {
    if (props.param) {
      await updateOffer({ ...item.value, id: props.param } as any);
      notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.UPDATED") });

      // Emit event to parent to reload
      emit("parent:call", {
        method: "reload",
      });
    } else {
      const newOffer = await createOffer(item.value);
      notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.CREATED") });

      // Dispatch domain event
      window.dispatchEvent(new CustomEvent("OfferCreatedDomainEvent", { detail: newOffer }));

      // Open details blade for the new offer
      emit("close:blade");
      await openBlade({
        blade: OffersDetails,
        param: newOffer.id,
      });
    }
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.SAVE_FAILED") });
  }
}

async function onEnable() {
  try {
    await enableOffer(props.param!);
    notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.ENABLED") });
    await loadOffer({ id: props.param! });
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.ENABLE_FAILED") });
  }
}

async function onDisable() {
  try {
    await disableOffer(props.param!);
    notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.DISABLED") });
    await loadOffer({ id: props.param! });
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.DISABLE_FAILED") });
  }
}

async function onSetAsDefault() {
  try {
    await setAsDefault(props.param!);
    notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.SET_DEFAULT") });
    await loadOffer({ id: props.param! });
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.SET_DEFAULT_FAILED") });
  }
}

async function onDelete() {
  if (confirm(t("OFFERS.PAGES.DETAILS.CONFIRM.DELETE"))) {
    try {
      await deleteOffer({ id: props.param! });
      notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.DELETED") });

      // Dispatch domain event
      window.dispatchEvent(new CustomEvent("OfferDeletedDomainEvent", { detail: { id: props.param } }));

      emit("close:blade");
    } catch (error) {
      notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.DELETE_FAILED") });
    }
  }
}

function onClose() {
  if (isModified.value) {
    if (confirm(t("OFFERS.PAGES.DETAILS.CONFIRM.UNSAVED_CHANGES"))) {
      emit("close:blade");
    }
  } else {
    emit("close:blade");
  }
}

async function onImageUpload(files: File[]) {
  uploadingImage.value = true;
  try {
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    files.forEach((file) => {
      images.value.push({
        url: URL.createObjectURL(file),
        name: file.name,
      });
    });
    notifications.success({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.IMAGE_UPLOADED") });
  } catch (error) {
    notifications.error({ text: t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.IMAGE_UPLOAD_FAILED") });
  } finally {
    uploadingImage.value = false;
  }
}

function onImageRemove(index: number) {
  if (confirm(t("OFFERS.PAGES.DETAILS.CONFIRM.DELETE_IMAGE"))) {
    images.value.splice(index, 1);
  }
}

function onImageReorder(newOrder: any[]) {
  images.value = newOrder;
}

function onSpecialPricesClick() {
  // Open special prices list blade
  notifications.info({ text: "Opening special prices..." });
}

// Load data on mount
onMounted(async () => {
  // Load languages
  languages.value = [
    { code: "en-US", name: "English" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
  ];

  // Load marketplace settings
  marketplaceSettings.value = {
    allowSetDefault: true,
  };

  if (props.param) {
    await loadOffer({ id: props.param });

    // Load images if offer exists
    if (item.value.images) {
      images.value = item.value.images;
    }

    // Load inventory quantities
    if (item.value.inventoryInfo) {
      item.value.inventoryInfo.forEach((info: any) => {
        inventoryQuantities.value[info.fulfillmentCenterId] = info.quantity;
      });
    }
  } else {
    // Generate SKU for new offer
    generateSku();
  }

  // Load initial products
  onProductSearch("");
});

// Warn on browser refresh if unsaved changes
onBeforeUnmount(() => {
  if (isModified.value) {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });
  }
});

// Listen for domain events
onMounted(() => {
  window.addEventListener("OfferCreatedDomainEvent", () => {
    // Mark notification as read
  });

  window.addEventListener("OfferDeletedDomainEvent", () => {
    // Mark notification as read
  });
});

defineExpose({
  title,
});
</script>
