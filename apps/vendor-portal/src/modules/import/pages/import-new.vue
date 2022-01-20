<template>
  <vc-blade
    title="Importer"
    width="70%"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('page:close')"
  >
    <vc-container>
      <vc-col>
        <div class="vc-padding_m">
          <vc-row>
            <vc-card
              :header="
                uploadedFile && uploadedFile.url
                  ? $t(
                      'IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE_UPLOADED'
                    )
                  : $t('IMPORT.PAGES.PRODUCT_IMPORTER.FILE_UPLOAD.TITLE')
              "
            >
              <!-- File upload -->
              <vc-col
                class="vc-padding_xl"
                v-if="!importStarted && !(uploadedFile && uploadedFile.url)"
              >
                <vc-row class="vc-margin-bottom_l">
                  <a
                    class="vc-link"
                    :href="
                      selectedImporter
                        ? selectedImporter.metadata.sampleCsvUrl
                        : '#'
                    "
                    >{{ $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE") }}</a
                  >
                  &nbsp;{{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
                </vc-row>
                <vc-row>
                  <vc-file-upload
                    variant="file-upload"
                    @upload="uploadCsv"
                    :notification="true"
                    :loading="loading"
                    accept=".csv"
                  ></vc-file-upload>
                </vc-row>
              </vc-col>
              <!-- Uploaded file actions -->
              <vc-col v-else>
                <vc-row v-if="uploadedFile && uploadedFile.url">
                  <import-upload-status
                    :uploadActions="uploadActions"
                    :uploadedFile="uploadedFile"
                    :isUploaded="isValid"
                    :isStarted="importStarted"
                    class="vc-padding_xl"
                  >
                  </import-upload-status>
                </vc-row>
                <!-- Uploaded file import status -->
                <vc-col v-if="importStarted">
                  <vc-row class="import-new__progress">
                    <vc-col class="import-new__progress-text">
                      {{
                        $t(
                          "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IN_PROGRESS"
                        )
                      }}
                      <vc-progress
                        class="vc-margin-top_m"
                        :value="importStatus.progress"
                        variant="striped"
                      ></vc-progress>
                    </vc-col>
                  </vc-row>
                  <vc-row class="import-new__upload-border">
                    <vc-col
                      v-for="(badge, i) in importBadges"
                      :key="i"
                      class="
                        vc-flex vc-flex-row
                        vc-flex-align_center
                        vc-padding_xl
                      "
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
                    </vc-col>
                  </vc-row>
                </vc-col>
              </vc-col>
              <vc-hint
                class="vc-padding_m import-new__error"
                v-if="errorMessage"
                >{{ errorMessage }}</vc-hint
              >
            </vc-card>
          </vc-row>
        </div>
        <!-- Skipped details table -->
        <vc-col class="vc-padding_m" v-if="importStarted">
          <vc-card
            :fill="true"
            variant="success"
            :header="
              $t(
                'IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.SKIPPED_DETAILS'
              )
            "
          >
            <vc-table :columns="skippedColumns" :header="false" :footer="false">
              <template v-slot:empty>
                <vc-col class="vc-flex-align_center vc-flex-justify_center">
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
                </vc-col>
              </template>
            </vc-table>
          </vc-card>
        </vc-col>

        <!-- History-->
        <vc-col class="vc-padding_m" v-if="!importStarted">
          <vc-card :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')" :fill="true">
            <vc-table :columns="columns" :items="importHistory" :header="false">
              <!-- Override name column template -->
              <template v-slot:item_name="itemData">
                <div class="vc-flex vc-flex-column">
                  <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                </div>
              </template>
            </vc-table>
          </vc-card>
        </vc-col>
      </vc-col>
    </vc-container>
    <import-popup
      v-if="importPreview"
      @close="importPreview = false"
      :columns="popupColumns"
      :items="popupItems"
      :total="previewTotalNum"
      @startImport="initializeImporting"
      :disabled="!!(importStatus && importStatus.jobId)"
    ></import-popup>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useI18n, useUser } from "@virtoshell/core";
import {
  IBladeToolbar,
  INotificationActions,
  ITableColumns,
} from "../../../types";
import useImport from "../composables/useImport";
import { ImportDataPreview } from "../../../api_client";
import ImportPopup from "../components/import-popup.vue";
import moment from "moment";
import ImportProfileDetails from "./import-profile-details.vue";
import ImportUploadStatus from "../components/import-upload-status.vue";

interface IImportBadges {
  id: string;
  icon: string;
  color: string;
  title: string | number;
  description: string;
}

export default defineComponent({
  url: "importer",
  components: {
    ImportPopup,
    ImportUploadStatus,
  },
  props: {
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
  },
  emits: ["page:open", "page:close"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { getAccessToken } = useUser();
    const {
      loading: importLoading,
      importHistory,
      uploadedFile,
      importStatus,
      selectedImporter,
      isValid,
      cancelImport,
      clearImport,
      previewData,
      setFile,
      startImport,
      getImport,
    } = useImport();
    const locale = window.navigator.language;
    const loading = ref(false);
    const preview = ref<ImportDataPreview>();
    const importPreview = ref(false);
    const popupColumns = ref<ITableColumns[]>([]);
    const popupItems = ref<Record<string, unknown>[]>([]);
    const errorMessage = ref("");
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "edit",
        title: t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.EDIT"),
        icon: "fas fa-pencil-alt",
        clickHandler() {
          emit("page:open", {
            component: ImportProfileDetails,
            componentOptions: {
              importer: selectedImporter.value,
            },
          });
        },
        isVisible: computed(() => !uploadedFile.value),
      },
      {
        id: "cancel",
        title: t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.CANCEL"),
        icon: "fas fa-ban",
        clickHandler() {
          emit("page:close");

          if (importStatus.value.inProgress) {
            cancelImport();
          }
        },
      },
    ]);
    const columns = ref<ITableColumns[]>([
      {
        id: "jobId", // temp
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
      },
      {
        id: "created",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.STARTED_AT"),
        width: 147,
        type: "date",
        format: "L LT",
      },
      {
        id: "errorCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT"),
        width: 118,
        sortable: true,
      },
    ]);

    const skippedColumns = ref<ITableColumns[]>([
      {
        id: "error",
        title: t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.LINE"),
        width: 147,
      },
      {
        id: "errorCount",
        title: t(
          "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TABLE.ERROR_DESC"
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
            moment(importStatus.value.notification.created)
              .locale(locale)
              .format("LTS"),
          description: moment(importStatus.value.notification.created)
            .locale(locale)
            .fromNow(),
        },
        {
          id: "linesRead",
          icon: "fas fa-check-circle",
          color: "#87B563",
          title: importStatus.value.notification.totalCount,
          description: t(
            "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.LINES_READ"
          ),
        },
        {
          id: "linesImported",
          icon: "fas fa-check-circle",
          color: "#87B563",
          title:
            importStatus.value.notification.processedCount -
            importStatus.value.notification.errorCount,
          description: t(
            "IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IMPORTED"
          ),
        },
        {
          id: "skipped",
          icon: "fas fa-exclamation-circle",
          color: "#FFBB0D",
          title: importStatus.value.notification.errorCount,
          description: t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.SKIPPED"),
        },
      ];
    });

    const uploadActions = ref<INotificationActions[]>([
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.DELETE"),
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
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.PREVIEW"),
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
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.START_IMPORT"),
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

    onMounted(() => {
      if (props.param) {
        getImport(props.param);
      }
    });

    function clearErrorMessage() {
      errorMessage.value = "";
    }

    async function uploadCsv(files: File) {
      try {
        loading.value = true;
        const formData = new FormData();
        formData.append("file", files[0]);
        const authToken = await getAccessToken();
        const result = await fetch(`/api/platform/assets?folderUrl=/tmp`, {
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
        loading.value = false;
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

    return {
      bladeToolbar,
      columns,
      moment,
      loading: computed(() => loading.value || importLoading.value),
      importHistory,
      uploadedFile,
      uploadActions,
      importPreview,
      popupColumns,
      popupItems,
      importStatus,
      isValid,
      errorMessage,
      selectedImporter,
      importBadges,
      skippedColumns,
      importStarted: computed(
        () => importStatus.value && importStatus.value.jobId
      ),
      inProgress: computed(
        () => importStatus.value && importStatus.value.inProgress
      ),
      locale,
      previewTotalNum: computed(() => preview.value.totalCount),
      initializeImporting,
      uploadCsv,
      cancelImport,
    };
  },
});
</script>

<style lang="less">
:root {
  --color-error: #f14e4e;
}

.import-new {
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
    font-size: 59px;
    color: #87b563;
  }

  &__no-errors-text {
    color: #87b563;
  }

  &__error {
    --hint-color: var(--color-error);
  }
}
</style>
