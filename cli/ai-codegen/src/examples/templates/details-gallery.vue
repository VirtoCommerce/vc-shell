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
            <!-- Basic Fields -->
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

            <!-- Main Gallery Section -->
            <!-- IMPORTANT: VcCard default slot has NO padding. Always add tw-p-2 for galleries -->
            <VcCard
              :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.GALLERY.TITLE')"
              class="tw-my-3 tw-relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('entity_gallery')"
              @state:collapsed="handleCollapsed('entity_gallery', $event)"
            >
              <div class="tw-p-2">
                <VcGallery
                  :images="entity.images"
                  :loading="imageUploading"
                  multiple
                  sortable
                  @upload="assetsHandler.upload"
                  @sort="assetsHandler.edit"
                  @remove="assetsHandler.remove"
                  @edit="onGalleryItemEdit"
                ></VcGallery>
              </div>
            </VcCard>

            <!-- Additional Media Section (e.g., Documents, Videos) -->
            <VcCard
              :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.DOCUMENTS.TITLE')"
              class="tw-my-3 tw-relative"
              is-collapsable
              :is-collapsed="restoreCollapsed('entity_documents')"
              @state:collapsed="handleCollapsed('entity_documents', $event)"
            >
              <div class="tw-p-2">
                <VcGallery
                  :images="entity.documents"
                  multiple
                  :loading="documentsUploading"
                  sortable
                  :allowed-types="['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']"
                  @upload="documentsHandler.upload"
                  @sort="documentsHandler.edit"
                  @remove="documentsHandler.remove"
                  @edit="onDocumentItemEdit"
                ></VcGallery>
              </div>
            </VcCard>

            <!-- File Upload Info -->
            <VcCard
              :header="$t('ENTITIES.PAGES.DETAILS.FIELDS.UPLOAD_INFO.TITLE')"
              class="tw-my-3"
              is-collapsable
              :is-collapsed="restoreCollapsed('upload_info')"
              @state:collapsed="handleCollapsed('upload_info', $event)"
            >
              <div class="tw-p-4 tw-space-y-2 tw-text-sm tw-text-gray-600">
                <p>{{ $t('ENTITIES.PAGES.DETAILS.FIELDS.UPLOAD_INFO.MAX_SIZE') }}</p>
                <p>{{ $t('ENTITIES.PAGES.DETAILS.FIELDS.UPLOAD_INFO.SUPPORTED_FORMATS') }}</p>
                <p>{{ $t('ENTITIES.PAGES.DETAILS.FIELDS.UPLOAD_INFO.TOTAL_FILES', { count: totalFilesCount }) }}</p>
              </div>
            </VcCard>
          </VcForm>
        </div>
      </div>
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
  useAssets,
  useBeforeUnload,
  useLoading,
} from "@vc-shell/framework";
// Example: Import your entity's composable (e.g., useOfferDetails, useProductDetails)
import { default as useEntityDetails } from "../composables/useEntityDetails";
import type { Entity, IImage } from "../types";
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
const { openBlade, onBeforeClose } = useBladeNavigation();
const { upload, remove, edit, loading: assetsLoading } = useAssets();
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

const imageUploading = ref(false);
const documentsUploading = ref(false);

const allLoading = useLoading(loading);

onMounted(async () => {
  if (props.param) {
    await loadEntity({ id: props.param });
  } else {
    // Initialize empty arrays for new entity
    entity.value.images = [];
    entity.value.documents = [];
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

const totalFilesCount = computed(() => {
  const imagesCount = entity.value?.images?.length || 0;
  const documentsCount = entity.value?.documents?.length || 0;
  return imagesCount + documentsCount;
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

function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

// Image assets handler
const assetsHandler = {
  loading: assetsLoading,
  async upload(files: FileList, startingSortOrder?: number) {
    imageUploading.value = true;
    try {
      // Validate file types and sizes
      const validFiles = Array.from(files).filter((file) => {
        const isValidType = file.type.startsWith("image/");
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

        if (!isValidType) {
          showError(t("ENTITIES.PAGES.ALERTS.INVALID_FILE_TYPE", { name: file.name }));
          return false;
        }
        if (!isValidSize) {
          showError(t("ENTITIES.PAGES.ALERTS.FILE_TOO_LARGE", { name: file.name }));
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      const fileList = new DataTransfer();
      validFiles.forEach((file) => fileList.items.add(file));

      const uploaded = await upload(
        fileList.files,
        `entities/${entity.value?.id || "temp"}`,
        startingSortOrder
      );
      entity.value.images = [...(entity.value?.images ?? []), ...(uploaded ?? [])];
    } catch (error) {
      showError(t("ENTITIES.PAGES.ALERTS.UPLOAD_ERROR"));
    } finally {
      imageUploading.value = false;
    }
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

// Documents assets handler
const documentsHandler = {
  loading: assetsLoading,
  async upload(files: FileList, startingSortOrder?: number) {
    documentsUploading.value = true;
    try {
      // Validate file types and sizes
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const validFiles = Array.from(files).filter((file) => {
        const isValidType = allowedTypes.includes(file.type);
        const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB max for documents

        if (!isValidType) {
          showError(t("ENTITIES.PAGES.ALERTS.INVALID_DOCUMENT_TYPE", { name: file.name }));
          return false;
        }
        if (!isValidSize) {
          showError(t("ENTITIES.PAGES.ALERTS.FILE_TOO_LARGE", { name: file.name }));
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      const fileList = new DataTransfer();
      validFiles.forEach((file) => fileList.items.add(file));

      const uploaded = await upload(
        fileList.files,
        `entities/${entity.value?.id || "temp"}/documents`,
        startingSortOrder
      );
      entity.value.documents = [...(entity.value?.documents ?? []), ...(uploaded ?? [])];
    } catch (error) {
      showError(t("ENTITIES.PAGES.ALERTS.UPLOAD_ERROR"));
    } finally {
      documentsUploading.value = false;
    }
  },
  async remove(files: IImage) {
    if (await showConfirmation(t("ENTITIES.PAGES.ALERTS.DOCUMENT_DELETE_CONFIRMATION"))) {
      const remainingDocuments = remove([files], entity.value?.documents ?? []);
      entity.value.documents = remainingDocuments;
    }
  },
  edit(files: IImage[]) {
    entity.value.documents = edit(files, entity.value?.documents ?? []);
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

const onDocumentItemEdit = (item: IImage) => {
  openBlade({
    blade: { name: "AssetsDetails" },
    options: {
      asset: item,
      assetEditHandler: (_f: IImage) => documentsHandler.edit?.([_f]),
      assetRemoveHandler: (_f: IImage) => documentsHandler.remove?.(_f),
    },
  });
};

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
