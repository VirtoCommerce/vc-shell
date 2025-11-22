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
          :header="$t('ENTITIES.PAGES.DETAILS.FORM.BASIC_INFO.TITLE')"
          icon="material-info"
        >
          <!-- IMPORTANT: Always add tw-p-4 for padding inside VcCard -->
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('ENTITIES.PAGES.DETAILS.FORM.NAME.LABEL')"
              :model-value="entity.name"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="entity.name"
                :label="$t('ENTITIES.PAGES.DETAILS.FORM.NAME.LABEL')"
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FORM.NAME.PLACEHOLDER')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('ENTITIES.PAGES.DETAILS.FORM.EMAIL.LABEL')"
              :model-value="entity.email"
              name="email"
              rules="required|email"
            >
              <VcInput
                v-bind="field"
                v-model="entity.email"
                type="email"
                :label="$t('ENTITIES.PAGES.DETAILS.FORM.EMAIL.LABEL')"
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FORM.EMAIL.PLACEHOLDER')"
                :disabled="!!props.param"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('ENTITIES.PAGES.DETAILS.FORM.STATUS.LABEL')"
              :model-value="entity.status"
              name="status"
              rules="required"
            >
              <VcSelect
                v-bind="field"
                v-model="entity.status"
                :label="$t('ENTITIES.PAGES.DETAILS.FORM.STATUS.LABEL')"
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FORM.STATUS.PLACEHOLDER')"
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

            <VcSwitch
              v-if="entity.id"
              v-model="entity.isActive"
              :label="$t('ENTITIES.PAGES.DETAILS.FORM.IS_ACTIVE.LABEL')"
            />
          </div>
        </VcCard>

        <!-- Additional Details Card (Collapsible Example) -->
        <VcCard
          :header="$t('ENTITIES.PAGES.DETAILS.FORM.ADDITIONAL.TITLE')"
          icon="material-description"
          :is-collapsable="true"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange, errors }"
              :label="$t('ENTITIES.PAGES.DETAILS.FORM.DESCRIPTION.LABEL')"
              :model-value="entity.description"
              name="description"
            >
              <VcTextarea
                v-bind="field"
                v-model="entity.description"
                :label="$t('ENTITIES.PAGES.DETAILS.FORM.DESCRIPTION.LABEL')"
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FORM.DESCRIPTION.PLACEHOLDER')"
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
import { computed, ref, onMounted, unref } from "vue";
import { IParentCallArgs, IBladeToolbar, useBladeNavigation, usePopup, useBeforeUnload } from "@vc-shell/framework";
// Example: Import your entity's composable (e.g., useOfferDetails, useProductDetails)
import { default as useEntityDetails } from "../composables/useEntityDetails";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import type { Entity } from "../types";

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
  url: "/entity",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { onBeforeClose } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });

const { createEntity, updateEntity, resetModificationState, entity, loadEntity, loading, deleteEntity, isModified } =
  useEntityDetails();

const { showError, showConfirmation } = usePopup();
const { meta } = useForm({
  validateOnMount: false,
});

const statusOptions = ref([
  { label: t("ENTITIES.PAGES.DETAILS.FORM.STATUS.ACTIVE"), value: "Active" },
  { label: t("ENTITIES.PAGES.DETAILS.FORM.STATUS.INACTIVE"), value: "Inactive" },
  { label: t("ENTITIES.PAGES.DETAILS.FORM.STATUS.PENDING"), value: "Pending" },
]);

onMounted(async () => {
  if (props.param) {
    await loadEntity({ id: props.param });
  }
  resetModificationState();
});

const title = computed(() => {
  return props.param ? entity.value?.name || t("ENTITIES.PAGES.DETAILS.TITLE") : t("ENTITIES.PAGES.DETAILS.NEW_TITLE");
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
