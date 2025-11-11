<template>
  <VcBlade
    v-loading="allLoading"
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer :no-padding="true">
      <div class="tw-grow tw-basis-0 tw-overflow-hidden">
        <div class="tw-p-4">
          <VcForm class="tw-space-y-4">
            <!-- Product/Parent selector with async loading -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.PARENT.TITLE')"
              :model-value="entity.parentId"
              name="parent"
              rules="required"
            >
              <VcSelect
                v-model="entity.parentId"
                :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.PARENT.TITLE')"
                required
                searchable
                :loading="fetchParentsLoading"
                :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.PARENT.PLACEHOLDER')"
                :options="fetchParents"
                option-value="id"
                option-label="name"
                :disabled="!!props.param"
                :error="!!errors.length"
                :error-message="errorMessage"
                :clearable="false"
                @update:model-value="
                  (e) => {
                    handleChange(e);
                    getParentItem();
                  }
                "
              >
                <template #selected-item="{ opt }">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-font-medium">{{ opt.name }}</span>
                  </div>
                </template>
                <template #option="{ opt }">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-font-medium">{{ opt.name }}</span>
                  </div>
                </template>
              </VcSelect>
            </Field>

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
              rules="required"
              :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.TYPE.TITLE')"
              :model-value="entity.type"
              name="type"
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
                :tooltip="$t('ENTITIES.PAGES.DETAILS.FIELDS.TYPE.TOOLTIP')"
                option-value="value"
                option-label="label"
                @update:model-value="handleChange"
              ></VcSelect>
            </Field>

            <!-- Code field with validation -->
            <VcCard :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.INFO.TITLE')">
              <div class="tw-p-4 tw-space-y-4">
                <div class="tw-flex tw-flex-row tw-items-center">
                  <Field
                    v-slot="{ errorMessage, handleChange, errors }"
                    :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.TITLE')"
                    :model-value="entity.code"
                    rules="required|min:3"
                    name="code"
                  >
                    <VcInput
                      v-model="entity.code"
                      class="tw-grow tw-basis-0"
                      :label="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.TITLE')"
                      :placeholder="$t('ENTITIES.PAGES.DETAILS.FIELDS.CODE.PLACEHOLDER')"
                      required
                      maxlength="50"
                      :loading="isCodeValidating"
                      clearable
                      :error="!!errors.length"
                      :error-message="errorMessage"
                      @update:model-value="
                        (e: string) => {
                          handleChange(e);
                          validateCode(e, 'code');
                        }
                      "
                    ></VcInput>
                  </Field>
                </div>

                <VcRow>
                  <VcCol :size="1">
                    <VcSwitch
                      :model-value="entity.isActive"
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

            <!-- Gallery for images -->
            <VcCard
              :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.GALLERY.TITLE')"
              class="tw-my-3 tw-relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('entity_gallery')"
              @state:collapsed="handleCollapsed('entity_gallery', $event)"
            >
              <VcLoading :active="imageUploading"></VcLoading>
              <div class="tw-p-2">
                <VcGallery
                  :images="entity.images"
                  multiple
                  @upload="assetsHandler.upload"
                  @sort="assetsHandler.edit"
                  @remove="assetsHandler.remove"
                  @edit="onGalleryItemEdit"
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
import { computed, ref, onMounted, unref, watch } from "vue";
import {
  IParentCallArgs,
  IBladeToolbar,
  useBladeNavigation,
  usePopup,
  useAssets,
  useBeforeUnload,
  useLoading,
} from "@vc-shell/framework";
// TODO: Update import path for your entity's composable
import { useEntityDetails } from "../composables/useEntityDetails";
import type { Entity, IImage } from "../types";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { useDebounceFn } from "@vueuse/core";

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
const { openBlade, onBeforeClose } = useBladeNavigation();
const { upload, remove, edit, loading: assetsLoading } = useAssets();
const { t } = useI18n({ useScope: "global" });

const {
  createEntity,
  updateEntity,
  resetModificationState,
  fetchParents,
  fetchParentsLoading,
  entity,
  loadEntity,
  loading,
  deleteEntity,
  validateEntity,
  modified,
} = useEntityDetails();

const { showError, showConfirmation } = usePopup();
const { setFieldError, meta, errorBag } = useForm({
  validateOnMount: false,
});

const imageUploading = ref(false);
const typeOptions = ref([
  { label: "Type A", value: "TypeA" },
  { label: "Type B", value: "TypeB" },
]);
const isCodeValidating = ref(false);

const allLoading = useLoading(loading, fetchParentsLoading);

onMounted(async () => {
  if (props.param) {
    await loadEntity({ id: props.param });
  } else {
    entity.value.code = generateCode();
  }
  resetModificationState();
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
        if (entity.value.id) {
          await updateEntity(entity.value);
        } else {
          await createEntity(entity.value);
        }

        resetModificationState();
        emit("parent:call", {
          method: "reload",
        });

        if (!props.param) {
          emit("parent:call", {
            method: "onItemClick",
            args: {
              id: entity.value.id,
            },
          });
        }
      } else {
        showError(unref(computed(() => t("ENTITIES.PAGES.ALERTS.NOT_VALID"))));
      }
    },
    disabled: computed(() => isCodeValidating.value || !(meta.value.valid && modified.value)),
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

function generateCode(): string {
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

function getParentItem() {
  // Load parent item details if needed
}

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

const assetsHandler = {
  loading: assetsLoading,
  async upload(files: FileList, startingSortOrder?: number) {
    const uploaded = await upload(files, `entities/${entity.value?.id}`, startingSortOrder);
    entity.value.images = [...(entity.value?.images ?? []), ...(uploaded ?? [])];
  },
  async remove(files: IImage) {
    if (await showConfirmation(t("ENTITIES.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION"))) {
      const remainingImages = remove([files], entity.value?.images ?? []);
      entity.value.images = remainingImages;
    }
  },
  edit(files: IImage[]) {
    entity.value.images = edit(files, entity.value?.images ?? []);
  },
};

const onGalleryItemEdit = (item: IImage) => {
  openBlade({
    blade: { name: "AssetsDetails" },
    options: {
      asset: item,
      assetEditHandler: (_f: IImage) => assetsHandler.edit?.([_f]),
      assetRemoveHandler: (_f: IImage) => assetsHandler.remove?.(_f),
    },
  });
};

const validateCode = (value: string, property: string) => {
  isCodeValidating.value = true;

  const debouncedValidation = useDebounceFn(async () => {
    const _entity = {
      ...entity.value,
      code: value,
    };
    const entityErrors = await validateEntity(_entity);
    const errors = entityErrors?.filter((error) => error.propertyName?.toLowerCase() === "code");
    setFieldError(
      property,
      errors
        .map((error) =>
          t(`ENTITIES.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
            value: error?.attemptedValue,
          }),
        )
        .concat(errorBag.value[property] ?? [])
        .join("\n"),
    );
    isCodeValidating.value = false;
  }, 1000);

  debouncedValidation();
};

onBeforeClose(async () => {
  if (!isDisabled.value && modified.value && !loading.value) {
    return await showConfirmation(t("ENTITIES.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
});

useBeforeUnload(computed(() => !isDisabled.value && modified.value));

defineExpose({
  title,
});
</script>

