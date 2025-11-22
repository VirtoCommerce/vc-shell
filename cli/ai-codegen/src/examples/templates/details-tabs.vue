<template>
  <VcBlade
    v-loading="allLoading"
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    :modified="isModified"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="true">
      <div class="tw-grow tw-basis-0 tw-overflow-hidden tw-flex tw-flex-col">
        <!-- Tabs Navigation -->
        <div class="tw-border-b tw-border-gray-200 tw-bg-white">
          <nav class="tw-flex tw-px-4" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                'tw-py-4 tw-px-6 tw-text-sm tw-font-medium tw-border-b-2 tw-transition-colors',
                currentTab === tab.id
                  ? 'tw-border-primary tw-text-primary'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              ]"
              @click="currentTab = tab.id"
            >
              <VcIcon
                v-if="tab.icon"
                :icon="tab.icon"
                class="tw-mr-2"
              />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="tw-flex-1 tw-overflow-auto">
          <div class="tw-p-4">
            <VcForm class="tw-space-y-4">
              <!-- General Tab -->
              <div v-show="currentTab === 'general'">
                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  rules="required"
                  :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                  :model-value="entity.name"
                  name="name"
                >
                  <VcInput
                    v-model="entity.name"
                    :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.NAME.TITLE')"
                    required
                    :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcInput>
                </Field>

                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                  :model-value="entity.sku"
                  rules="required|min:3"
                  name="sku"
                >
                  <VcInput
                    v-model="entity.sku"
                    :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SKU.TITLE')"
                    required
                    :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
                    maxlength="50"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcInput>
                </Field>

                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                  :model-value="entity.description"
                  name="description"
                >
                  <VcTextarea
                    v-model="entity.description"
                    :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
                    :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
                    :rows="6"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  />
                </Field>

                <VcRow>
                  <VcCol :size="1">
                    <VcSwitch
                      v-model="entity.isActive"
                      name="isactive"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.IS_ACTIVE.TITLE')"
                    />
                  </VcCol>
                </VcRow>
              </div>

              <!-- Pricing Tab -->
              <div v-show="currentTab === 'pricing'">
                <VcCard :header="$t('ENTITIES.PAGES.DETAILS.TABS.PRICING.BASE_PRICE')">
                  <div class="tw-p-4 tw-space-y-4">
                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.PRICE.TITLE')"
                      :model-value="entity.price"
                      rules="required"
                      name="price"
                    >
                      <VcInput
                        v-model="entity.price"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.PRICE.TITLE')"
                        type="number"
                        required
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.PRICE.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>

                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.COMPARE_PRICE.TITLE')"
                      :model-value="entity.comparePrice"
                      name="comparePrice"
                    >
                      <VcInput
                        v-model="entity.comparePrice"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.COMPARE_PRICE.TITLE')"
                        type="number"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.COMPARE_PRICE.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>

                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.COST.TITLE')"
                      :model-value="entity.cost"
                      name="cost"
                    >
                      <VcInput
                        v-model="entity.cost"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.COST.TITLE')"
                        type="number"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.COST.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>
                  </div>
                </VcCard>

                <VcCard :header="$t('ENTITIES.PAGES.DETAILS.TABS.PRICING.TAX')" class="tw-mt-4">
                  <div class="tw-p-4 tw-space-y-4">
                    <VcRow>
                      <VcCol :size="1">
                        <VcSwitch
                          v-model="entity.taxable"
                          name="taxable"
                          :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.TAXABLE.TITLE')"
                        />
                      </VcCol>
                    </VcRow>
                  </div>
                </VcCard>
              </div>

              <!-- Inventory Tab -->
              <div v-show="currentTab === 'inventory'">
                <VcCard :header="$t('ENTITIES.PAGES.DETAILS.TABS.INVENTORY.STOCK')">
                  <div class="tw-p-4 tw-space-y-4">
                    <VcRow>
                      <VcCol :size="1">
                        <VcSwitch
                          v-model="entity.trackInventory"
                          name="trackInventory"
                          :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.TRACK_INVENTORY.TITLE')"
                        />
                      </VcCol>
                    </VcRow>

                    <Field
                      v-if="entity.trackInventory"
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.QUANTITY.TITLE')"
                      :model-value="entity.quantity"
                      name="quantity"
                    >
                      <VcInput
                        v-model="entity.quantity"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.QUANTITY.TITLE')"
                        type="number"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.QUANTITY.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>

                    <Field
                      v-if="entity.trackInventory"
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.LOW_STOCK_THRESHOLD.TITLE')"
                      :model-value="entity.lowStockThreshold"
                      name="lowStockThreshold"
                    >
                      <VcInput
                        v-model="entity.lowStockThreshold"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.LOW_STOCK_THRESHOLD.TITLE')"
                        type="number"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.LOW_STOCK_THRESHOLD.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>
                  </div>
                </VcCard>

                <VcCard :header="$t('ENTITIES.PAGES.DETAILS.TABS.INVENTORY.PHYSICAL')" class="tw-mt-4">
                  <div class="tw-p-4 tw-space-y-4">
                    <VcRow>
                      <VcCol :size="1">
                        <Field
                          v-slot="{ errorMessage, handleChange, errors }"
                          :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.WEIGHT.TITLE')"
                          :model-value="entity.weight"
                          name="weight"
                        >
                          <VcInput
                            v-model="entity.weight"
                            :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.WEIGHT.TITLE')"
                            type="number"
                            :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.WEIGHT.PLACEHOLDER')"
                            :error="!!errors.length"
                            :error-message="errorMessage"
                            @update:model-value="handleChange"
                          ></VcInput>
                        </Field>
                      </VcCol>
                    </VcRow>
                  </div>
                </VcCard>
              </div>

              <!-- SEO Tab -->
              <div v-show="currentTab === 'seo'">
                <VcCard :header="$t('ENTITIES.PAGES.DETAILS.TABS.SEO.META_INFO')">
                  <div class="tw-p-4 tw-space-y-4">
                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_TITLE.TITLE')"
                      :model-value="entity.seoTitle"
                      name="seoTitle"
                    >
                      <VcInput
                        v-model="entity.seoTitle"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_TITLE.TITLE')"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_TITLE.PLACEHOLDER')"
                        maxlength="60"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>

                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_DESCRIPTION.TITLE')"
                      :model-value="entity.seoDescription"
                      name="seoDescription"
                    >
                      <VcTextarea
                        v-model="entity.seoDescription"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_DESCRIPTION.TITLE')"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.SEO_DESCRIPTION.PLACEHOLDER')"
                        maxlength="160"
                        :rows="3"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      />
                    </Field>

                    <Field
                      v-slot="{ errorMessage, handleChange, errors }"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.URL_SLUG.TITLE')"
                      :model-value="entity.urlSlug"
                      name="urlSlug"
                    >
                      <VcInput
                        v-model="entity.urlSlug"
                        :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.URL_SLUG.TITLE')"
                        :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.URL_SLUG.PLACEHOLDER')"
                        :error="!!errors.length"
                        :error-message="errorMessage"
                        @update:model-value="handleChange"
                      ></VcInput>
                    </Field>
                  </div>
                </VcCard>
              </div>
            </VcForm>
          </div>
        </div>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  useBladeNavigation,
  usePopup,
  useBeforeUnload,
  useLoading,
} from "@vc-shell/framework";
// Example: Import your entity's composable (e.g., useOfferDetails, useProductDetails)
import { default as useEntityDetails } from "../composables/useEntityDetails";
import type { Entity } from "../types";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

defineOptions({
  name: "EntityDetails",
  url: "/entity-details",
  routable: false,
  notifyType: ["EntityCreatedDomainEvent", "EntityDeletedDomainEvent"],
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { onBeforeClose } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });

const {
  createEntity,
  updateEntity,
  resetModificationState,
  entity,
  loadEntity,
  loading,
  deleteEntity,
  isModified,
} = useEntityDetails();

const { showError, showConfirmation } = usePopup();
const { meta } = useForm({
  validateOnMount: false,
});

const allLoading = useLoading(loading);
const currentTab = ref<string>("general");

// Save current tab to localStorage for persistence
watch(currentTab, (newTab) => {
  localStorage?.setItem("entity-details-current-tab", newTab);
});

// Define tabs
const tabs = computed<Tab[]>(() => [
  {
    id: "general",
    label: t("ENTITIES.PAGES.DETAILS.TABS.GENERAL"),
    icon: "fas fa-info-circle",
  },
  {
    id: "pricing",
    label: t("ENTITIES.PAGES.DETAILS.TABS.PRICING.TITLE"),
    icon: "fas fa-dollar-sign",
  },
  {
    id: "inventory",
    label: t("ENTITIES.PAGES.DETAILS.TABS.INVENTORY.TITLE"),
    icon: "fas fa-boxes",
  },
  {
    id: "seo",
    label: t("ENTITIES.PAGES.DETAILS.TABS.SEO.TITLE"),
    icon: "fas fa-search",
  },
]);

onMounted(async () => {
  if (props.param) {
    await loadEntity({ id: props.param });
  }
  resetModificationState();

  // Restore last viewed tab
  const savedTab = localStorage?.getItem("entity-details-current-tab");
  if (savedTab && tabs.value.some((tab) => tab.id === savedTab)) {
    currentTab.value = savedTab;
  }
});

const title = computed(() => {
  return props.param
    ? entity.value?.name
      ? entity.value.name
      : ""
    : t("ENTITIES.PAGES.DETAILS.TITLE");
});

const isDisabled = computed(() => {
  return !meta.value.dirty || !meta.value.valid;
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("ENTITIES.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        try {
          if (entity.value.id) {
            await updateEntity({ ...entity.value, id: entity.value.id });
          } else {
            const { id, ...entityWithoutId } = entity.value;
            const created = await createEntity(entityWithoutId);
            if (created?.id) {
              emit("close:blade");
              emit("parent:call", {
                method: "reload",
              });
              return;
            }
          }

          resetModificationState();
          emit("parent:call", {
            method: "reload",
          });

          if (!props.param) {
            emit("close:blade");
          }
        } catch (error) {
          showError(t("ENTITIES.PAGES.ALERTS.SAVE_ERROR"));
        }
      } else {
        showError(t("ENTITIES.PAGES.ALERTS.NOT_VALID"));
      }
    },
    disabled: computed(() => !(meta.value.valid && isModified.value)),
  },
  {
    id: "delete",
    title: t("ENTITIES.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    async clickHandler() {
      if ((await showConfirmation(t("ENTITIES.PAGES.ALERTS.DELETE"))) && props.param) {
        await deleteEntity({ id: props.param });
        emit("parent:call", {
          method: "reload",
        });
        emit("close:blade");
      }
    },
    isVisible: computed(() => !!props.param),
  },
]);

onBeforeClose(async () => {
  if (!isDisabled.value && isModified.value && !loading.value) {
    return await showConfirmation(t("ENTITIES.PAGES.DETAILS.ALERTS.CLOSE_CONFIRMATION"));
  }
});

useBeforeUnload(computed(() => !isDisabled.value && isModified.value));

defineExpose({
  title,
});
</script>
