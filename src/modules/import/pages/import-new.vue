<template>
  <VcBlade
    v-loading="bladeLoading"
    :title="param && profileDetails?.name ? profileDetails.name : props.title"
    width="70%"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('close:blade')"
  >
    <VcContainer class="import-new">
      <VcCol>
        <div class="p-3">
          <VcRow>
            <VcCard
              :header="
                importStarted
                  ? $t(
                      'IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.IMPORT_RESULTS'
                    )
                  : uploadedFile && uploadedFile.url
                  ? $t(
                      'IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE_UPLOADED'
                    )
                  : $t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE')
              "
            >
              <!-- File upload -->
              <VcCol
                class="p-5"
                v-if="!importStarted && !(uploadedFile && uploadedFile.url)"
              >
                <VcRow class="mb-4">
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
                    accept="*.*"
                    :loading="fileLoading"
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
                    class="p-5"
                  >
                  </import-upload-status>
                </VcRow>
                <!-- Uploaded file import status -->
                <VcCol v-if="importStarted">
                  <VcRow
                    class="relative p-[40px] before:content-[''] before:[background:linear-gradient(180deg,#ecf2f7_0%,rgba(236,242,246,0)_100%)] before:left-0 before:right-0 before:absolute before:h-[21px] before:top-0"
                    v-if="inProgress"
                  >
                    <VcCol class="text-[#a1c0d4]">
                      {{
                        $t(
                          "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IN_PROGRESS"
                        )
                      }}
                      <VcProgress
                        class="mt-3"
                        :value="importStatus.progress"
                        :variant="progressbarVariant"
                        :key="importStatus.progress"
                      ></VcProgress>
                    </VcCol>
                  </VcRow>
                  <VcRow class="border-t border-solid border-t-[#e5e5e5]">
                    <VcCol
                      v-for="(badge, i) in importBadges"
                      :key="i"
                      class="flex !flex-row items-center p-5"
                    >
                      <VcIcon
                        :icon="badge.icon"
                        size="xxl"
                        :style="{ color: badge.color }"
                      ></VcIcon>
                      <div class="ml-3">
                        <div class="font-medium">
                          {{ badge.title }}
                        </div>
                        <VcHint>{{ badge.description }}</VcHint>
                      </div>
                    </VcCol>
                  </VcRow>
                </VcCol>
              </VcCol>
              <VcHint class="p-3 import-new__error" v-if="errorMessage">{{
                errorMessage
              }}</VcHint>
            </VcCard>
          </VcRow>
        </div>
        <!-- Skipped details table -->
        <VcCol class="p-3" v-if="importStarted && reversedErrors.length">
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
              :items="reversedErrors"
            >
              <!-- Override errors column template -->
              <template v-slot:item_errors="itemData">
                <div class="flex flex-col">
                  <div class="truncate">
                    {{ itemData.item }}
                  </div>
                </div>
              </template>
            </VcTable>
          </VcCard>
        </VcCol>

        <!-- History-->
        <VcCol class="p-3" v-if="!importStarted">
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
                <div class="flex flex-col">
                  <div class="truncate">
                    {{ itemData.item.name }}
                  </div>
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
import {
  defineComponent,
  computed,
  onMounted,
  ref,
  watch,
  shallowRef,
} from "vue";
import { cloneDeep as _cloneDeep } from "lodash-es";

export default defineComponent({
  url: "/importer",
});
</script>

<script lang="ts" setup>
import { useI18n, useUser } from "@vc-shell/core";
import {
  IBladeToolbar,
  INotificationActions,
  ITableColumns,
} from "../../../types";
import useImport from "../composables/useImport";
import { ImportDataPreview } from "../../../api_client/marketplacevendor";
import ImportPopup from "../components/ImportPopup.vue";
import moment from "moment";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportUploadStatus from "../components/ImportUploadStatus.vue";
import ImportStatus from "../components/ImportStatus.vue";
import ImportNew from "./import-new.vue";

interface IImportBadges {
  id: string;
  icon: string;
  color: string;
  title?: string | number;
  description?: string;
}

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    importJobId?: string;
    title?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits(["open:blade", "close:blade", "parent:call"]);
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
      emit("open:blade", {
        component: shallowRef(ImportProfileDetails),
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
    name: computed(() =>
      importStarted.value
        ? t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.UPLOAD")
        : t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.DELETE")
    ),
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
    isVisible: computed(() => isValid.value && !importStarted.value),
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
    isVisible: computed(() => isValid.value && !importStarted.value),
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

const previewTotalNum = computed(() => preview.value?.totalCount);

const reversedErrors = computed(() => {
  const errors = _cloneDeep(importStatus.value.notification.errors);

  return errors.reverse();
});

watch(importStatus, (newVal, oldVal) => {
  if (newVal && !newVal.inProgress && oldVal) {
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
  emit("close:blade");
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

<style lang="scss">
:root {
  --color-error: #f14e4e;
}

.import-new {
  & .vc-container__inner {
    @apply flex flex-col;
  }

  &__error {
    --hint-color: var(--color-error);
  }

  &__skipped {
    & .vc-card__body {
      @apply flex flex-col;
    }
  }

  &__history {
    & .vc-card__body {
      @apply flex flex-col;
    }
  }
}
</style>
