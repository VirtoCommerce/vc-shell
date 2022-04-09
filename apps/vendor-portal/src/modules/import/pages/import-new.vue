<template>
  <VcBlade
    v-loading="bladeLoading"
    :title="param && profileDetails?.name ? profileDetails.name : options.title"
    width="70%"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('page:close')"
  >
    <VcContainer class="import-new">
      <VcCol>
        <div class="vc-padding_m">
          <VcRow>
            <VcCard
              :header="
                uploadedFile && uploadedFile.url
                  ? $t(
                      'IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE_UPLOADED'
                    )
                  : $t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE')
              "
            >
              <!-- File upload -->
              <VcCol
                class="vc-padding_xl"
                v-if="!importStarted && !(uploadedFile && uploadedFile.url)"
              >
                <VcRow class="vc-margin-bottom_l">
                  <a class="vc-link" :href="sampleTemplateUrl">{{
                    $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE")
                  }}</a>
                  &nbsp;{{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
                </VcRow>
                <VcRow>
                  <VcFileUpload
                    variant="file-upload"
                    @upload="uploadCsv"
                    :notification="true"
                    :loading="fileLoading"
                    accept=".csv"
                  ></VcFileUpload>
                </VcRow>
              </VcCol>
              <!-- Uploaded file actions -->
              <VcCol v-else>
                <VcRow v-if="uploadedFile && uploadedFile.url">
                  <import-upload-status
                    :uploadActions="uploadActions"
                    :uploadedFile="uploadedFile"
                    :isUploaded="isValid"
                    :isStarted="importStarted"
                    class="vc-padding_xl"
                  >
                  </import-upload-status>
                </VcRow>
                <!-- Uploaded file import status -->
                <VcCol v-if="importStarted">
                  <VcRow class="import-new__progress" v-if="inProgress">
                    <VcCol class="import-new__progress-text">
                      {{
                        $t(
                          "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IN_PROGRESS"
                        )
                      }}
                      <VcProgress
                        class="vc-margin-top_m"
                        :value="importStatus.progress"
                        :variant="progressbarVariant"
                        :key="importStatus.progress"
                      ></VcProgress>
                    </VcCol>
                  </VcRow>
                  <VcRow class="import-new__upload-border">
                    <VcCol
                      v-for="(badge, i) in importBadges"
                      :key="i"
                      class="vc-flex vc-flex-row vc-flex-align_center vc-padding_xl"
                    >
                      <vc-icon
                        :icon="badge.icon"
                        size="xxl"
                        :style="{ color: badge.color }"
                      ></vc-icon>
                      <div class="vc-margin-left_m">
                        <div class="vc-font-weight_medium">
                          {{ badge.title }}
                        </div>
                        <vc-hint>{{ badge.description }}</vc-hint>
                      </div>
                    </VcCol>
                  </VcRow>
                </VcCol>
              </VcCol>
              <vc-hint
                class="vc-padding_m import-new__error"
                v-if="errorMessage"
                >{{ errorMessage }}</vc-hint
              >
            </VcCard>
          </VcRow>
        </div>
        <!-- Skipped details table -->
        <VcCol class="vc-padding_m" v-if="importStarted">
          <VcCard
            class="import-new__skipped"
            :fill="true"
            :variant="skippedColorVariant"
            :header="
              $t(
                'IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.SKIPPED_DETAILS'
              )
            "
          >
            <VcTable
              :columns="skippedColumns"
              :header="false"
              :footer="false"
              :items="importStatus.notification.errors"
            >
              <template v-slot:empty>
                <VcCol class="vc-flex-align_center vc-flex-justify_center">
                  <vc-icon
                    icon="far fa-check-circle"
                    class="import-new__no-errors-icon"
                  ></vc-icon>
                  <div class="import-new__no-errors-text vc-margin-top_l">
                    {{
                      $t(
                        "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.NO_ERRORS"
                      )
                    }}
                  </div>
                </VcCol>
              </template>
              <!-- Override errors column template -->
              <template v-slot:item_errors="itemData">
                <div class="vc-flex vc-flex-column">
                  <div class="vc-ellipsis">{{ itemData.item }}</div>
                </div>
              </template>
            </VcTable>
          </VcCard>
        </VcCol>

        <!-- History-->
        <VcCol class="vc-padding_m" v-if="!importStarted">
          <VcCard
            :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')"
            :fill="true"
            class="import-new__history"
          >
            <VcTable
              :columns="columns"
              :items="importHistory"
              :header="false"
              :loading="importLoading"
              :totalCount="totalHistoryCount"
              :pages="historyPages"
              :currentPage="currentPage"
              @paginationClick="onPaginationClick"
            >
              <!-- Override name column template -->
              <template v-slot:item_name="itemData">
                <div class="vc-flex vc-flex-column">
                  <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                </div>
              </template>
              <!-- Override finished column template -->
              <template v-slot:item_finished="itemData">
                <ImportStatus :item="itemData.item" />
              </template>
            </VcTable>
          </VcCard>
        </VcCol>
      </VcCol>
    </VcContainer>
    <ImportPopup
      v-if="importPreview"
      @close="importPreview = false"
      :columns="popupColumns"
      :items="popupItems"
      :total="previewTotalNum"
      @startImport="initializeImporting"
      :disabled="!!(importStatus && importStatus.jobId)"
    ></ImportPopup>
  </VcBlade>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, watch } from "vue";

export default defineComponent({
  url: "importer",
});
</script>

<script lang="ts" setup>
import { useI18n, useUser } from "@virtoshell/core";
import {
  IBladeToolbar,
  INotificationActions,
  ITableColumns,
} from "../../../types";
import useImport from "../composables/useImport";
import { ImportDataPreview } from "../../../api_client";
import ImportPopup from "../components/ImportPopup.vue";
import moment from "moment";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportUploadStatus from "../components/ImportUploadStatus.vue";
import ImportStatus from "../components/ImportStatus.vue";

interface IImportBadges {
  id: string;
  icon: string;
  color: string;
  title?: string | number;
  description?: string;
}

const props = defineProps({
  expanded: {
    type: Boolean,
    default: true,
  },

  closable: {
    type: Boolean,
    default: true,
  },

  param: {
    type: String,
    default: undefined,
  },

  options: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["page:open", "page:close", "parent:call"]);
const { t } = useI18n();
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
const locale = window.navigator.language;
const fileLoading = ref(false);
const preview = ref<ImportDataPreview>();
const importPreview = ref(false);
const popupColumns = ref<ITableColumns[]>([]);
const popupItems = ref<Record<string, unknown>[]>([]);
const errorMessage = ref("");
const cancelled = ref(false);
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "edit",
    title: computed(() => t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.EDIT")),
    icon: "fas fa-pencil-alt",
    clickHandler() {
      emit("page:open", {
        component: ImportProfileDetails,
        param: profile.value.id,
      });
    },
    isVisible: computed(() => profile.value),
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
    title: computed(() =>
      t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.ERROR_DESC")
    ),
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
          ? moment(importStatus.value.notification.created)
              .locale(locale)
              .format("LTS")
          : "createdDate" in importStatus.value.notification
          ? moment(importStatus.value.notification.createdDate)
              .locale(locale)
              .format("LTS")
          : null),
      description:
        "created" in importStatus.value.notification
          ? moment(importStatus.value.notification.created)
              .locale(locale)
              .fromNow()
          : "createdDate" in importStatus.value.notification
          ? moment(importStatus.value.notification.createdDate)
              .locale(locale)
              .fromNow()
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
          ? importStatus.value.notification.processedCount -
              importStatus.value.notification.errorCount >=
            0
            ? importStatus.value.notification.processedCount -
              importStatus.value.notification.errorCount
            : 0
          : "errorsCount" in importStatus.value.notification
          ? importStatus.value.notification.processedCount -
              importStatus.value.notification.errorsCount >=
            0
            ? importStatus.value.notification.processedCount -
              importStatus.value.notification.errorsCount
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
    name: computed(() => t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.DELETE")),
    clickHandler() {
      clearImport();
      clearErrorMessage();
    },
    outline: true,
    variant: "danger",
    isVisible: computed(
      () => !(importStatus.value && importStatus.value.jobId)
    ),
  },
  {
    name: computed(() => t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.PREVIEW")),
    async clickHandler() {
      try {
        preview.value = await previewData();
        popupItems.value = [];
        popupColumns.value = [];
        if (
          preview.value &&
          preview.value.records &&
          preview.value.records.length
        ) {
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
      }
    },
    variant: "primary",
    outline: true,
    isVisible: computed(() => isValid.value),
  },
  {
    name: computed(() =>
      t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.START_IMPORT")
    ),
    async clickHandler() {
      await start();
    },
    outline: false,
    variant: "primary",
    isVisible: computed(() => isValid.value),
    disabled: computed(
      () =>
        (importStatus.value && importStatus.value.inProgress) ||
        importLoading.value
    ),
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

const progressbarVariant = computed(() =>
  inProgress.value ? "striped" : "default"
);

const inProgress = computed(
  () => (importStatus.value && importStatus.value.inProgress) || false
);

const bladeLoading = computed(() => importLoading.value);

const profileDetails = computed(() => profile.value);

const importStarted = computed(
  () => !!(importStatus.value && importStatus.value.jobId)
);

const previewTotalNum = computed(() => preview.value.totalCount);

watch(importStatus, (newVal, oldVal) => {
  if (!newVal.inProgress && oldVal) {
    emit("parent:call", { method: "reload" });
  }
});

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
    const historyItem =
      importHistory.value &&
      importHistory.value.find((x) => x.jobId === props.options.importJobId);
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

async function uploadCsv(files: File) {
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
  } finally {
    fileLoading.value = false;
  }
}

async function start() {
  try {
    errorMessage.value = "";
    await startImport();
  } catch (e) {
    errorMessage.value = e.message;
  }
}

function initializeImporting() {
  importPreview.value = false;
  start();
}

function reloadParent() {
  emit("parent:call", {
    method: "reload",
  });
  emit("page:close");
}

const sampleTemplateUrl = computed(() => {
  return profile.value &&
    profile.value.importer &&
    profile.value.importer.metadata
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

<style lang="less">
:root {
  --color-error: #f14e4e;
}

.import-new {
  & .vc-container__inner {
    display: flex;
    flex-direction: column;
  }

  &__upload-border {
    border-top: 1px solid #e5e5e5;
  }

  &__progress {
    position: relative;
    padding: 40px;
    &:before {
      content: "";
      background: linear-gradient(
        180deg,
        #ecf2f7 0%,
        rgba(236, 242, 246, 0) 100%
      );
      left: 0;
      right: 0;
      position: absolute;
      height: 21px;
      top: 0;
    }

    &-text {
      color: #a1c0d4;
    }
  }

  &__no-errors-icon {
    font-size: 59px !important;
    color: #87b563;
  }

  &__no-errors-text {
    color: #87b563;
  }

  &__error {
    --hint-color: var(--color-error);
  }

  &__skipped {
    & .vc-card__body {
      display: flex;
      flex-direction: column;
    }
  }

  &__history {
    & .vc-card__body {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
