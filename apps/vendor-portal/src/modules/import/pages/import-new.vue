<template>
  <vc-blade
    :title="(selectedImporter && selectedImporter.importerType) || 'Importer'"
    width="30%"
    :toolbarItems="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    @close="$emit('page:close')"
  >
    <vc-container>
      <vc-col v-if="!importStarted">
        <vc-row class="vc-padding_l">
          <vc-card
            :header="
              $t('IMPORT.PAGES.PRODUCT_IMPORTER.EXECUTION_SETTINGS.TITLE')
            "
          >
            <vc-row class="vc-padding_l">
              <div>
                <vc-link
                  :href="
                    selectedImporter
                      ? selectedImporter.importerOptions.templateUrl
                      : '#'
                  "
                  >{{ $t("IMPORT.PAGES.TEMPLATE.DOWNLOAD_TEMPLATE") }}</vc-link
                >
                {{ $t("IMPORT.PAGES.TEMPLATE.FOR_REFERENCE") }}
              </div>
            </vc-row>
            <vc-row class="vc-padding_l">
              <vc-file-upload
                variant="file-upload"
                @upload="uploadCsv"
                :notification="true"
                :uploadedFile="uploadedFile"
                :uploadActions="uploadActions"
                :isUploaded="isValid"
                :errorMessage="errorMessage"
                :loading="loading"
                accept=".csv"
              ></vc-file-upload>
            </vc-row>
          </vc-card>
        </vc-row>
        <vc-col class="vc-padding_l">
          <vc-card :header="$t('IMPORT.PAGES.LAST_EXECUTIONS')">
            <vc-table
              :columns="columns"
              :items="importHistory"
              :header="false"
              :footer="false"
            >
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
      <vc-col class="vc-padding_l" v-else>
        <vc-card
          :header="$t('IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.TITLE')"
        >
          <template v-slot:actions v-if="inProgress">
            <vc-button :small="true" @click="cancelImport">{{
              $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.CANCEL")
            }}</vc-button>
          </template>
          <vc-col class="vc-padding_l">
            <vc-row class="vc-padding-bottom_l" v-if="uploadedFile">
              {{ uploadedFile.name + " (" + uploadedFile.size + " Mb)" }}
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-icon icon="far fa-thumbs-up" size="xs"></vc-icon>
              &nbsp;{{
                importStatus.notification.totalCount +
                " " +
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.LINES_FOUND")
              }}
            </vc-row>
            <vc-row
              class="vc-padding-bottom_l"
              v-if="!importStatus.notification.errorCount"
            >
              <vc-icon icon="far fa-thumbs-up" size="xs"></vc-icon>
              &nbsp;{{
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.NO_ERRORS")
              }}
            </vc-row>
            <vc-row class="vc-padding-bottom_l" v-else>
              <vc-icon icon="fas fa-exclamation-triangle" size="xs"></vc-icon>
              &nbsp;{{ importStatus.notification.errorCount }} errors
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-col>
                {{
                  $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IN_PROGRESS")
                }}
                <vc-progress
                  class="vc-margin-top_m"
                  :value="importStatus.progress"
                ></vc-progress>
              </vc-col>
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-icon icon="far fa-clock" size="xs" />
              &nbsp;{{
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.STARTED_AT")
              }}
              <span
                >&nbsp;{{
                  moment(importStatus.notification.created)
                    .locale(locale)
                    .format("LTS")
                }}
                ({{
                  moment(importStatus.notification.created)
                    .locale(locale)
                    .fromNow()
                }})</span
              >
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-icon icon="far fa-thumbs-up" size="xs"></vc-icon>
              &nbsp;{{
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.LINES_READ")
              }}
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-icon icon="far fa-thumbs-up" size="xs"></vc-icon>
              &nbsp;{{
                importStatus.notification.processedCount +
                " " +
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.IMPORTED")
              }}
            </vc-row>
            <vc-row class="vc-padding-bottom_l">
              <vc-icon icon="fas fa-exclamation-triangle" size="xs"></vc-icon>
              &nbsp;{{
                $t("IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.SKIPPED")
              }}
            </vc-row>
            <vc-row class="vc-flex-grow_1">
              <vc-card
                :header="
                  $t(
                    'IMPORT.PAGES.PRODUCT_IMPORTER.UPLOAD_STATUS.SKIPPED_DETAILS'
                  )
                "
              >
              </vc-card>
            </vc-row>
          </vc-col>
        </vc-card>
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
import {
  computed,
  ComputedRef,
  defineComponent,
  onMounted,
  reactive,
  ref,
} from "vue";
import { useI18n, useUser } from "@virtoshell/core";
import { IBladeToolbar, ITableColumns } from "../../../types";
import useImport from "../composables/useImport";
import { ImportDataPreview } from "../../../api_client";
import ImportPopup from "../components/import-popup.vue";
import moment from "moment";
import ImportProfileDetails from "./import-profile-details.vue";

interface INotificationActions {
  name: string;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export default defineComponent({
  url: "importer",
  components: {
    ImportPopup,
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
      },
      {
        id: "cancel",
        title: t("IMPORT.PAGES.PRODUCT_IMPORTER.TOOLBAR.CANCEL"),
        icon: "fas fa-ban",
        clickHandler() {
          emit("page:close");
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
        id: "processedCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.PROCESSED_COUNT"),
        width: 147,
      },
      {
        id: "errorCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT"),
        width: 118,
        sortable: true,
      },
      {
        id: "finished",
        type: "date",
        format: "L LT",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.DATE"),
        width: 185,
        alwaysVisible: true,
        sortable: true,
      },
    ]);
    const uploadActions = ref<INotificationActions[]>([
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.DELETE"),
        clickHandler() {
          clearImport();
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
        outline: false,
        isVisible: computed(() => isValid.value),
      },
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.START_IMPORT"),
        async clickHandler() {
          await start();
        },
        outline: true,
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
      importStarted: computed(
        () => importStatus.value && importStatus.value.jobId
      ),
      inProgress: computed(
        () => importStatus.value && importStatus.value.inProgress
      ),
      locale: window.navigator.language,
      previewTotalNum: computed(() => preview.value.totalCount),
      initializeImporting,
      uploadCsv,
      cancelImport,
    };
  },
});
</script>

<style lang="less" scoped></style>
