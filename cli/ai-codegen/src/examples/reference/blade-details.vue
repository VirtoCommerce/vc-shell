<!--
  @file Reference Details Blade
  @description SINGLE SOURCE OF TRUTH for details blade pattern
  @version 2.0.0
  @lastUpdated 2025-11-26

  This is the authoritative example for details blades in VC-Shell.
  All details blades should follow this pattern exactly.

  KEY PATTERNS:
  1. VcBlade with :modified for unsaved changes indicator
  2. VcForm + VcCard structure
  3. Field (vee-validate) wrapping all inputs
  4. usePopup for confirmations/errors
  5. useBeforeUnload for browser close warning
  6. onBeforeClose for blade close confirmation
  7. parent:call to notify parent of changes
-->

<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="70%"
    :closable="closable"
    :expanded="expanded"
    :toolbar-items="bladeToolbar"
    :modified="isModified"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer>
      <VcForm class="tw-space-y-4">
        <!-- Basic Information Card -->
        <VcCard
          :header="$t('PRODUCTS.PAGES.DETAILS.SECTIONS.BASIC_INFO')"
          icon="material-info"
        >
          <!-- IMPORTANT: Always add tw-p-4 for padding inside VcCard -->
          <div class="tw-p-4 tw-space-y-4">
            <!-- Name Field - Required -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.LABEL')"
              :model-value="item.name"
              name="name"
              rules="required|min:3"
            >
              <VcInput
                v-bind="field"
                v-model="item.name"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.LABEL')"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- SKU Field -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.SKU.LABEL')"
              :model-value="item.sku"
              name="sku"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.sku"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.SKU.LABEL')"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                :disabled="!!props.param"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Price Field - Number -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.PRICE.LABEL')"
              :model-value="item.price"
              name="price"
              rules="required|min_value:0"
            >
              <VcInput
                v-bind="field"
                v-model="item.price"
                type="number"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.PRICE.LABEL')"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.PRICE.PLACEHOLDER')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Status Select -->
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.LABEL')"
              :model-value="item.status"
              name="status"
              rules="required"
            >
              <!-- @vue-generic {IProduct} -->
              <VcSelect
                v-bind="field"
                v-model="item.status"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.LABEL')"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.PLACEHOLDER')"
                :options="statusOptions"
                option-value="value"
                option-label="label"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                :clearable="false"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Active Switch (only for existing items) -->
            <VcSwitch
              v-if="item.id"
              v-model="item.isActive"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.IS_ACTIVE.LABEL')"
            />
          </div>
        </VcCard>

        <!-- Description Card (Collapsible) -->
        <VcCard
          :header="$t('PRODUCTS.PAGES.DETAILS.SECTIONS.DESCRIPTION')"
          icon="material-description"
          :is-collapsable="true"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.LABEL')"
              :model-value="item.description"
              name="description"
            >
              <VcTextarea
                v-bind="field"
                v-model="item.description"
                :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.LABEL')"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                :rows="4"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </div>
        </VcCard>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  useBladeNavigation,
  usePopup,
  useBeforeUnload,
} from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

// Import composable from same module
import { useProductDetails } from "../composables/useProductDetails";
// Import types from API client
import type { IProduct } from "../api_client/products.api";

// =============================================================================
// COMPONENT OPTIONS
// =============================================================================

defineOptions({
  name: "ProductDetails",
  url: "/product",
  // ⚠️ Details blades are NOT workspace - no menuItem!
  // isWorkspace: false is implied
});

// =============================================================================
// PROPS & EMITS
// =============================================================================

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

// =============================================================================
// COMPOSABLES
// =============================================================================

const { onBeforeClose } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });
const { showError, showConfirmation } = usePopup();

// Use details composable
const {
  item,
  loading,
  isModified,
  loadProduct,
  saveProduct,
  deleteProduct,
  resetModificationState,
} = useProductDetails();

// Form validation
const { meta } = useForm({
  validateOnMount: false,
});

// =============================================================================
// LOCAL STATE
// =============================================================================

const statusOptions = ref([
  { label: t("PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.ACTIVE"), value: "Active" },
  { label: t("PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.INACTIVE"), value: "Inactive" },
  { label: t("PRODUCTS.PAGES.DETAILS.FIELDS.STATUS.PENDING"), value: "Pending" },
]);

// =============================================================================
// COMPUTED
// =============================================================================

const title = computed(() => {
  return props.param
    ? item.value?.name || t("PRODUCTS.PAGES.DETAILS.TITLE")
    : t("PRODUCTS.PAGES.DETAILS.NEW_TITLE");
});

const canSave = computed(() => meta.value.valid && isModified.value);

// =============================================================================
// TOOLBAR
// =============================================================================

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    disabled: computed(() => !canSave.value),
    async clickHandler() {
      await handleSave();
    },
  },
  {
    id: "delete",
    title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      await handleDelete();
    },
  },
]);

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(async () => {
  if (props.param) {
    await loadProduct(props.param);
  }
  resetModificationState();
});

// =============================================================================
// HANDLERS
// =============================================================================

async function handleSave() {
  if (!meta.value.valid) {
    showError(t("PRODUCTS.PAGES.DETAILS.ALERTS.NOT_VALID"));
    return;
  }

  try {
    const result = await saveProduct(item.value);

    // Notify parent to reload list
    emit("parent:call", { method: "reload" });

    // Close blade if creating new item
    if (!props.param && result?.id) {
      emit("close:blade");
    }
  } catch (error) {
    showError(t("PRODUCTS.PAGES.DETAILS.ALERTS.SAVE_ERROR"));
  }
}

async function handleDelete() {
  if (!props.param) return;

  const confirmed = await showConfirmation(
    t("PRODUCTS.PAGES.DETAILS.ALERTS.DELETE_CONFIRM")
  );

  if (confirmed) {
    await deleteProduct(props.param);
    emit("parent:call", { method: "reload" });
    emit("close:blade");
  }
}

// =============================================================================
// BLADE CLOSE PROTECTION
// =============================================================================

/**
 * onBeforeClose - called when user tries to close blade
 * Return false to prevent close, true to allow
 */
onBeforeClose(async () => {
  if (isModified.value && !loading.value) {
    return await showConfirmation(
      t("PRODUCTS.PAGES.DETAILS.ALERTS.UNSAVED_CHANGES")
    );
  }
  return true;
});

/**
 * useBeforeUnload - browser tab close warning
 * Pass computed that returns true when warning should show
 */
useBeforeUnload(computed(() => isModified.value && !loading.value));

// =============================================================================
// EXPOSE
// =============================================================================

defineExpose({
  title,
});
</script>
