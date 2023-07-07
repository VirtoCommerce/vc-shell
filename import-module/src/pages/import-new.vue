<template>
  <VcBlade
    v-loading="bladeLoading"
    :title="param && profileDetails?.name ? profileDetails.name : options?.title"
    width="70%"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="import-new">
      <VcCol>
        <div class="tw-p-3">
          <VcRow>
            <VcCard
              :header="
                importStarted
                  ? t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.IMPORT_RESULTS')
                  : uploadedFile && uploadedFile.url
                  ? t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE_UPLOADED')
                  : t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE')
              "
            >
              <!-- File upload -->
              <VcCol
                v-if="!importStarted && !(uploadedFile && uploadedFile.url)"
                class="tw-p-5"
              >
                <VcRow class="tw-mb-4">
                  <a
                    class="vc-link"
                    :href="sampleTemplateUrl"
                    >{{ t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE") }}</a
                  >
                  &nbsp;{{ t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
                </VcRow>
                <VcRow>
                  <VcCol>
                    <VcRow class="tw-mb-4">
                      <VcFileUpload
                        variant="file-upload"
                        :notification="true"
                        accept="*.*"
                        :loading="fileLoading"
                        @upload="uploadCsv"
                      ></VcFileUpload
                    ></VcRow>
                    <VcRow>
                      <Field
                        v-slot="{ field, errorMessage, handleChange, errors }"
                        :model-value="profile.importFileUrl"
                        :label="t('IMPORT.PAGES.PRODUCT_IMPORTER.EXTERNAL_URL.TITLE')"
                        rules="url"
                        name="externalUrl"
                      >
                        <VcInput
                          v-bind="field"
                          v-model="profile.importFileUrl"
                          class="tw-grow tw-basis-0"
                          :placeholder="t('IMPORT.PAGES.PRODUCT_IMPORTER.EXTERNAL_URL.PLACEHOLDER')"
                          required
                          clearable
                          :error="!!errors.length"
                          :error-message="errorMessage"
                          @update:model-value="handleChange"
                        >
                          <template #append>
                            <slot name="button">
                              <VcButton
                                :outline="true"
                                @click="saveExternalUrl()"
                              >
                                {{ t("IMPORT.PAGES.PRODUCT_IMPORTER.EXTERNAL_URL.SAVE") }}
                              </VcButton>
                            </slot>
                          </template>
                        </VcInput>
                      </Field>
                    </VcRow>
                  </VcCol>
                </VcRow>
              </VcCol>
              <!-- Uploaded file actions -->
              <VcCol v-else>
                <VcRow v-if="uploadedFile && uploadedFile.url">
                  <import-upload-status
                    :upload-actions="uploadActions"
                    :uploaded-file="uploadedFile"
                    :is-uploaded="isValid"
                    :is-started="importStarted"
                    class="tw-p-5"
                  >
                  </import-upload-status>
                </VcRow>
                <!-- Uploaded file import status -->
                <VcCol v-if="importStarted">
                  <VcRow
                    v-if="inProgress"
                    class="tw-relative tw-p-[40px] before:tw-content-[''] before:[background:linear-gradient(180deg,#ecf2f7_0%,rgba(236,242,246,0)_100%)] before:tw-left-0 before:tw-right-0 before:tw-absolute before:h-[21px] before:tw-top-0"
                  >
                    <VcCol class="tw-text-[#a1c0d4]">
                      {{ t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IN_PROGRESS") }}
                      <VcProgress
                        :key="importStatus.progress"
                        class="tw-mt-3"
                        :value="importStatus.progress"
                        :variant="progressbarVariant"
                      ></VcProgress>
                      <VcHint
                        v-if="importStatus.estimatingRemaining || importStatus.estimatedRemaining"
                        class="tw-py-3"
                      >
                        <template v-if="importStatus.estimatingRemaining">
                          {{ t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.ESTIMATING") }}
                        </template>
                        <template v-else>
                          {{ t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.ESTIMATED") }}
                          {{ estimatedRemaining }}
                        </template>
                      </VcHint>
                    </VcCol>
                  </VcRow>
                  <VcRow class="tw-border-t tw-border-solid tw-border-t-[#e5e5e5]">
                    <VcCol
                      v-for="(badge, i) in importBadges"
                      :key="i"
                      class="tw-flex !tw-flex-row tw-items-center tw-p-5"
                    >
                      <VcIcon
                        :icon="badge.icon"
                        size="xxl"
                        :style="{ color: badge.color }"
                      ></VcIcon>
                      <div class="tw-ml-3">
                        <div class="tw-font-medium">
                          {{ badge.title }}
                        </div>
                        <VcHint>{{ badge.description }}</VcHint>
                      </div>
                    </VcCol>
                  </VcRow>
                </VcCol>
              </VcCol>
              <VcHint
                v-if="errorMessage"
                class="tw-p-3 import-new__error"
              >
                {{ errorMessage }}
              </VcHint>
              <div v-if="reportUrl && reportUrl != 'DefaultDataReporter'">
                <VcHint class="tw-p-3 import-new__history"
                  >{{ t("IMPORT.PAGES.LIST.REPORT.DOWNLOAD") }}
                  <a
                    class="vc-link"
                    :href="reportUrl"
                    >{{ reportUrl }}</a
                  >
                </VcHint>
              </div>
            </VcCard>
          </VcRow>
        </div>
        <!-- Skipped details table -->
        <VcCol
          v-if="importStarted && reversedErrors.length"
          class="tw-p-3"
        >
          <VcCard
            class="import-new__skipped"
            :fill="true"
            :variant="skippedColorVariant"
            :header="t('IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.SKIPPED_DETAILS')"
          >
            <VcTable
              :columns="skippedColumns"
              :header="false"
              :footer="false"
              :items="reversedErrors"
              state-key="import_errors"
            >
              <!-- Override errors column template -->
              <template #item_errors="itemData">
                <div class="tw-flex tw-flex-col">
                  <div class="tw-truncate">
                    {{ itemData.item }}
                  </div>
                </div>
              </template>
            </VcTable>
          </VcCard>
        </VcCol>

        <!-- History-->
        <VcCol
          v-if="!importStarted"
          class="tw-p-3"
        >
          <VcCard
            :header="t('IMPORT.PAGES.LAST_EXECUTIONS')"
            :fill="true"
            class="import-new__history"
          >
            <VcTable
              :columns="columns"
              :items="importHistory"
              :header="false"
              :loading="importLoading"
              :total-count="totalHistoryCount"
              :pages="historyPages"
              :current-page="currentPage"
              state-key="import_history"
              @pagination-click="onPaginationClick"
            >
              <!-- Override name column template -->
              <template #item_profileName="itemData">
                <div class="tw-flex tw-flex-col">
                  <div class="tw-truncate">
                    {{ itemData.item.profileName }}
                  </div>
                </div>
              </template>
              <!-- Override finished column template -->
              <template #item_finished="itemData">
                <ImportStatus :item="itemData.item" />
              </template>
            </VcTable>
          </VcCard>
        </VcCol>
      </VcCol>
    </VcContainer>
    <ImportPopup
      v-if="importPreview"
      :columns="popupColumns"
      :items="popupItems"
      :total="previewTotalNum"
      :disabled="!!(importStatus && importStatus.jobId)"
      @close="importPreview = false"
      @start-import="initializeImporting"
    ></ImportPopup>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, markRaw } from "vue";
import * as _ from "lodash-es";
import ImportProfileDetails from "./import-profile-details.vue";
import {
  IParentCallArgs,
  moment,
  useUser,
  VcContainer,
  VcCol,
  VcRow,
  VcBlade,
  VcCard,
  VcFileUpload,
  VcProgress,
  VcIcon,
  VcHint,
  VcTable,
  IBladeToolbar,
  ITableColumns,
  usePermissions,
  useNotifications,
  notification,
  useBladeNavigation,
} from "@vc-shell/framework";
import { INotificationActions, UserPermissions } from "./../types";
import useImport, { ExtProfile } from "../composables/useImport";
import { ImportDataPreview, ImportPushNotification } from "./../api-client/import";
import ImportPopup from "../components/ImportPopup.vue";
import ImportUploadStatus from "../components/ImportUploadStatus.vue";
import ImportStatus from "../components/ImportStatus.vue";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    importJobId: string;
    title?: string;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

interface IImportBadges {
  id: string;
  icon: string;
  color: string;
  title?: string | number;
  description?: string;
}

defineOptions({
  url: "/importer",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { openBlade } = useBladeNavigation();

const { t } = useI18n({ useScope: "global" });
const { checkPermission } = usePermissions();
const { getAccessToken } = useUser();
const {
  loading: importLoading,
  importHistory,
  uploadedFile,
  importStatus,
  isValid,
  profile,
  historyPages,
  totalHistoryCount,
  currentPage,
  cancelImport,
  clearImport,
  previewData,
  setFile,
  startImport,
  loadImportProfile,
  fetchImportHistory,
  fetchDataImporters,
  updateStatus,
  getLongRunning,
} = useImport();
const { moduleNotifications, markAsRead } = useNotifications("ImportPushNotification");
const locale = window.navigator.language;
const fileLoading = ref(false);
const preview = ref<ImportDataPreview>();
const importPreview = ref(false);
const popupColumns = ref<ITableColumns[]>([]);
const popupItems = ref<Record<string, unknown>[]>([]);
const errorMessage = ref("");
const cancelled = ref(false);
const notificationId = ref();

watch(
  moduleNotifications,
  (newVal: ImportPushNotification[]) => {
    newVal.forEach((message) => {
      if (!message.finished) {
        if (!notificationId.value) {
          notificationId.value = notification(message.title, {
            timeout: false,
          });
        } else {
          notification.update(notificationId.value, {
            content: message.title,
          });
        }
      } else {
        if (message.title === "Import failed") {
          notification.update(notificationId.value, {
            timeout: 5000,
            content: message.title,
            type: "error",
            onClose() {
              markAsRead(message);
              notificationId.value = undefined;
            },
          });
        } else {
          notification.update(notificationId.value, {
            timeout: 5000,
            content: message.title,
            type: "success",
            onClose() {
              markAsRead(message);
              notificationId.value = undefined;
            },
          });
        }
      }
    });
  },
  { deep: true }
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "edit",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.EDIT")),
    icon: "fas fa-pencil-alt",
    clickHandler() {
      openBlade({
        blade: markRaw(ImportProfileDetails),
        options: {
          importer: profileDetails.value.importer,
        },
        param: profile.value.id,
      });
    },
    isVisible: computed(() => !!(checkPermission(UserPermissions.SellerImportProfilesEdit) && profile.value)),
    disabled: computed(() => importLoading.value || !profile.value.name),
  },
  {
    id: "cancel",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.CANCEL")),
    icon: "fas fa-ban",
    async clickHandler() {
      if (importStatus.value?.inProgress) {
        try {
          await cancelImport();
          cancelled.value = true;
        } catch (e) {
          cancelled.value = false;
          throw e;
        }
      }
    },
    disabled: computed(() => {
      return !importStatus.value?.inProgress || cancelled.value;
    }),
    isVisible: computed(() => !!props.param),
  },
  {
    id: "newRun",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.NEW_RUN")),
    icon: "fas fa-plus",
    clickHandler() {
      emit("parent:call", {
        method: "openImporter",
        args: props.param,
      });
    },
    disabled: computed(() => importStatus.value?.inProgress),
    isVisible: computed(() => !!(importStatus.value && profile.value.name)),
  },
  {
    id: "reRun",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.RE_RUN")),
    icon: "fas fa-sync",
    async clickHandler() {
      const historyItem = importHistory.value && importHistory.value.find((x) => x.jobId === props.options.importJobId);
      if (historyItem.fileUrl) {
        const correctedProfile = profile?.value;
        correctedProfile.importFileUrl = historyItem.fileUrl;
        correctedProfile.inProgress = false;
        correctedProfile.jobId = null;
        await start(correctedProfile);
      }
    },
    disabled: computed(() => {
      const historyItem = importHistory.value && importHistory.value.find((x) => x.jobId === props.options.importJobId);
      return !(historyItem?.finished && historyItem.fileUrl != null);
    }),
    isVisible: computed(() => !!(importStatus.value && profile.value.name)),
  },
]);
const columns = ref<ITableColumns[]>([
  {
    id: "profileName", // temp
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.PROFILE_NAME")),
    alwaysVisible: true,
  },
  {
    id: "createdBy",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.CREATED_BY")),
    width: 147,
  },
  {
    id: "finished",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 147,
  },
  {
    id: "createdDate",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.STARTED_AT")),
    width: 147,
    type: "date",
    format: "L LT",
  },
  {
    id: "errorsCount",
    title: computed(() => t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT")),
    width: 118,
    sortable: true,
  },
]);

const skippedColumns = ref<ITableColumns[]>([
  {
    id: "errors",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.ERROR_DESC")),
  },
]);

const importBadges = computed((): IImportBadges[] => {
  return [
    {
      id: "clock",
      icon: "far fa-clock",
      color: "#A9BFD2",
      title:
        t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.STARTED_AT") +
        " " +
        ("created" in importStatus.value.notification
          ? moment(importStatus.value.notification.created).locale(locale).format("LTS")
          : "createdDate" in importStatus.value.notification
          ? moment(importStatus.value.notification.createdDate).locale(locale).format("LTS")
          : null),
      description:
        "created" in importStatus.value.notification
          ? moment(importStatus.value.notification.created).locale(locale).fromNow()
          : "createdDate" in importStatus.value.notification
          ? moment(importStatus.value.notification.createdDate).locale(locale).fromNow()
          : null,
    },
    {
      id: "linesRead",
      icon: "fas fa-check-circle",
      color: "#87B563",
      title: importStatus.value.notification.totalCount,
      description: t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.LINES_READ"),
    },
    {
      id: "linesImported",
      icon: "fas fa-check-circle",
      color: "#87B563",
      title:
        "errorCount" in importStatus.value.notification
          ? importStatus.value.notification.processedCount - importStatus.value.notification.errorCount >= 0
            ? importStatus.value.notification.processedCount - importStatus.value.notification.errorCount
            : 0
          : "errorsCount" in importStatus.value.notification
          ? importStatus.value.notification.processedCount - importStatus.value.notification.errorsCount >= 0
            ? importStatus.value.notification.processedCount - importStatus.value.notification.errorsCount
            : 0
          : 0,
      description: t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IMPORTED"),
    },
    {
      id: "skipped",
      icon: "fas fa-exclamation-circle",
      color: "#FFBB0D",
      title:
        "errorCount" in importStatus.value.notification
          ? importStatus.value.notification.errorCount
          : "errorsCount" in importStatus.value.notification
          ? importStatus.value.notification.errorsCount
          : 0,
      description: t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.SKIPPED"),
    },
  ];
});

const uploadActions = ref<INotificationActions[]>([
  {
    name: computed(() => t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.USE_ANOTHER_ONE")),
    clickHandler() {
      clearImport();
      clearErrorMessage();
    },
    outline: true,
    variant: "danger",
    isVisible: computed(() => !inProgress.value),
  },
  {
    name: computed(() => t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.PREVIEW")),
    async clickHandler() {
      try {
        preview.value = await previewData();
        popupItems.value = [];
        popupColumns.value = [];
        if (preview.value && preview.value.records && preview.value.records.length) {
          for (const recordKey in preview.value.records[0]) {
            popupColumns.value.push({
              id: recordKey,
              title: recordKey,
              width: 130,
            });
          }
          preview.value.records.forEach((record) => {
            popupItems.value.push(record);
          });
          importPreview.value = true;
        }
      } catch (e) {
        errorMessage.value = e.message;
        throw e;
      }
    },
    outline: true,
    isVisible: computed(() => isValid.value && !importStarted.value),
  },
  {
    name: computed(() => t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.START_IMPORT")),
    async clickHandler() {
      await start(null);
    },
    outline: false,
    isVisible: computed(() => isValid.value && !importStarted.value),
    disabled: computed(() => (importStatus.value && importStatus.value.inProgress) || importLoading.value),
  },
]);

const skippedColorVariant = computed(() => {
  return !(
    importStatus.value &&
    importStatus.value.notification &&
    importStatus.value.notification.errors &&
    importStatus.value.notification.errors.length
  )
    ? "success"
    : "danger";
});

const progressbarVariant = computed(() => (inProgress.value ? "striped" : "default"));

const inProgress = computed(() => (importStatus.value && importStatus.value.inProgress) || false);

const bladeLoading = computed(() => importLoading.value);

const profileDetails = computed(() => profile.value);

const importStarted = computed(() => !!(importStatus.value && importStatus.value.jobId));

const estimatedRemaining = computed(() => {
  return importStatus.value && importStatus.value.estimatedRemaining
    ? moment.duration(importStatus.value.estimatedRemaining).locale(locale).humanize(false, "precise")
    : null;
});

const previewTotalNum = computed(() => preview.value?.totalCount);

const reversedErrors = computed(() => {
  const errors = _.cloneDeep(importStatus.value.notification.errors);

  return errors.reverse();
});

const reportUrl = computed(() => importStatus.value?.notification?.reportUrl);

watch(
  () => importStatus.value?.inProgress,
  (newVal) => {
    if (newVal === false) {
      emit("parent:call", { method: "reload" });
    }
  }
);

onMounted(async () => {
  if (props.param) {
    await fetchDataImporters();
    await loadImportProfile({ id: props.param });
    await fetchImportHistory({
      profileId: props.param,
      jobId: props.options.importJobId,
    });
  }
  if (props.options && props.options.importJobId) {
    const historyItem = importHistory.value && importHistory.value.find((x) => x.jobId === props.options.importJobId);
    if (historyItem) {
      updateStatus(historyItem);
    } else {
      getLongRunning({ id: props.param });
    }
  }
});

function clearErrorMessage() {
  errorMessage.value = "";
}

async function uploadCsv(files: FileList) {
  try {
    fileLoading.value = true;
    const formData = new FormData();
    formData.append("file", files[0]);
    const authToken = await getAccessToken();
    const result = await fetch(`/api/assets?folderUrl=/tmp`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const response = await result.json();
    if (response?.length) {
      setFile(response[0]);
    }
    files = null;
  } catch (e) {
    errorMessage.value = e.message;
    setFile({
      name: files[0].name,
      size: files[0].size / (1024 * 1024),
    });
    throw e;
  } finally {
    fileLoading.value = false;
  }
}

async function saveExternalUrl() {
  //const response = await fetch(profile.value.importFileUrl, {
  //  method: "HEAD",
  //  mode: "cors",
  //});
  setFile({
    name: profile.value.importFileUrl.substring(profile.value.importFileUrl.lastIndexOf("/") + 1),
    url: profile.value.importFileUrl,
    size: Number(0 /*response.headers.get("content-length")*/),
  });
}

async function start(profile: ExtProfile) {
  try {
    errorMessage.value = "";
    await startImport(profile);
  } catch (e) {
    errorMessage.value = e.message;
    throw e;
  }
}

function initializeImporting() {
  importPreview.value = false;
  start(null);
}

function reloadParent() {
  emit("parent:call", {
    method: "reload",
  });
  emit("close:blade");
}

const sampleTemplateUrl = computed(() => {
  return profile.value && profile.value.importer && profile.value.importer.metadata
    ? profile.value.importer.metadata.sampleCsvUrl
    : "#";
});

async function onPaginationClick(page: number) {
  await fetchImportHistory({
    skip: (page - 1) * 15,
    profileId: props.param,
  });
}

defineExpose({
  reloadParent,
});
</script>

<style lang="scss">
:root {
  --color-error: #f14e4e;
}

.import-new {
  & .vc-container__inner {
    @apply tw-flex tw-flex-col;
  }

  &__error {
    --hint-color: var(--color-error);
  }

  &__skipped {
    & .vc-card__body {
      @apply tw-flex tw-flex-col;
    }
  }

  &__history {
    & .vc-card__body {
      @apply tw-flex tw-flex-col;
    }
  }
}
</style>
