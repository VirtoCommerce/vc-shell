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
      <div class="tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm class="tw-space-y-4">
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
              :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.TYPE.TITLE')"
              :model-value="entity.type"
              name="type"
              rules="required"
            >
              <VcSelect
                v-model="entity.type"
                :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.TYPE.TITLE')"
                required
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.TYPE.PLACEHOLDER')"
                :disabled="!!entity.id"
                :error="!!errors.length"
                :error-message="errorMessage"
                :options="typeOptions"
                option-value="value"
                option-label="label"
                @update:model-value="handleChange"
              ></VcSelect>
            </Field>

            <VcCard :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.DETAILS.TITLE')">
              <div class="tw-p-4 tw-space-y-4">
                <Field
                  v-slot="{ errorMessage, handleChange, errors }"
                  :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.TITLE')"
                  :model-value="entity.code"
                  rules="required|min:3"
                  name="code"
                >
                  <VcInput
                    v-model="entity.code"
                    :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.TITLE')"
                    :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.PLACEHOLDER')"
                    required
                    maxlength="50"
                    clearable
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  ></VcInput>
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
                    :rows="4"
                    :error="!!errors.length"
                    :error-message="errorMessage"
                    @update:model-value="handleChange"
                  />
                </Field>
              </div>
            </VcCard>
          </VcForm>
        </div>
      </div>
    </VcContainer>
    <!-- Widgets are automatically rendered in the widget panel by the framework -->
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  useBladeNavigation,
  usePopup,
  useBeforeUnload,
  useWidgets,
  useBlade,
  type IWidget,
} from "@vc-shell/framework";
// Example: Import your entity's composable (e.g., useOfferDetails, useProductDetails)
import { default as useEntityDetails } from "../composables/useEntityDetails";
// Example: Import widget components for this blade
import EntityRelationsWidget from "../components/EntityRelationsWidget.vue";
import EntityHistoryWidget from "../components/EntityHistoryWidget.vue";
import EntityStatsWidget from "../components/EntityStatsWidget.vue";
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
const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

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

const typeOptions = ref([
  { label: "Type A", value: "TypeA" },
  { label: "Type B", value: "TypeB" },
]);

const allLoading = computed(() => loading.value);

onMounted(async () => {
  if (props.param) {
    await loadEntity({ id: props.param });
  }
  resetModificationState();

  // Register widgets after data is loaded
  registerWidgets();
});

onBeforeUnmount(() => {
  // Cleanup: Unregister widgets to prevent memory leaks
  if (blade?.value.id) {
    unregisterWidget("entity-relations-widget", blade.value.id);
    unregisterWidget("entity-history-widget", blade.value.id);
    unregisterWidget("entity-stats-widget", blade.value.id);
  }
});

/**
 * Register all contextual widgets for this blade
 * IMPORTANT: Do NOT use markRaw() - pass component reference directly
 */
function registerWidgets() {
  if (!blade?.value.id) return;

  // Widget 1: Relations/Associations widget
  const relationsWidget: IWidget = {
    id: "entity-relations-widget",
    component: EntityRelationsWidget,
    props: {
      entityId: computed(() => entity.value?.id),
      entityType: computed(() => entity.value?.type),
    },
    // Widget is visible only when entity is loaded
    isVisible: computed(() => !!props.param && !!entity.value?.id),
  };

  // Widget 2: History/Activity widget
  const historyWidget: IWidget = {
    id: "entity-history-widget",
    component: EntityHistoryWidget,
    props: {
      entityId: computed(() => entity.value?.id),
    },
    // Show history only for existing entities
    isVisible: computed(() => !!props.param),
  };

  // Widget 3: Statistics widget
  const statsWidget: IWidget = {
    id: "entity-stats-widget",
    component: EntityStatsWidget,
    props: {
      entityId: computed(() => entity.value?.id),
      entityCode: computed(() => entity.value?.code),
      isActive: computed(() => entity.value?.isActive),
    },
    // Always visible
    isVisible: computed(() => true),
  };

  // Register all widgets
  registerWidget(relationsWidget, blade.value.id);
  registerWidget(historyWidget, blade.value.id);
  registerWidget(statsWidget, blade.value.id);
}

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
    return await showConfirmation(t("ENTITIES.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
});

useBeforeUnload(computed(() => !isDisabled.value && isModified.value));

defineExpose({
  title,
});
</script>
