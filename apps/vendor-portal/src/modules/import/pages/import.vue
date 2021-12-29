<template>
  <vc-blade
    :title="$t('IMPORT.PAGES.TITLE')"
    width="100%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
    :closable="false"
  >
    <div class="csv-import__inner vc-flex vc-flex-column vc-padding_xs">
      <vc-row>
        <vc-col class="vc-padding_l">
          <!-- Import selects -->
          <vc-col class="vc-margin-bottom_xl">
            <vc-select
              :options="importersList"
              :modelValue="selectedImporter && selectedImporter.importerType"
              @change="setImporter"
              keyProperty="importerType"
              displayProperty="importerType"
              :label="$t('IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.TITLE')"
            ></vc-select>
            <p class="csv-import__importer-description">
              {{
                t(
                  "IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.DESCRIPTION.TITLE"
                )
              }}
              <span>
                <a
                  class="vc-link"
                  :href="
                    selectedImporter
                      ? selectedImporter.importerOptions.templateUrl
                      : '#'
                  "
                  >{{
                    t(
                      "IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.DESCRIPTION.LINK"
                    )
                  }}</a
                >
              </span>
            </p>
          </vc-col>
          <vc-col
            ><vc-select
              :label="$t('IMPORT.PAGES.ACTIONS.SELECTS.DELIMITER.TITLE')"
            ></vc-select
          ></vc-col>
        </vc-col>

        <!-- Import file upload and uploaded actions -->
        <vc-col
          class="vc-padding_l vc-padding-top_s"
          :class="{
            'vc-flex-justify_end vc-padding_l': !(
              uploadedFile && uploadedFile.url
            ),
          }"
        >
          <p
            class="csv-import__uploaded-title"
            v-if="uploadedFile && uploadedFile.url"
          >
            {{ t("IMPORT.PAGES.ACTIONS.UPLOADER.TITLE") }}
          </p>
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
        </vc-col>
      </vc-row>

      <!-- Import started -->
      <div
        class="csv-import__importing vc-padding_l"
        v-if="importStatus && importStatus.jobId"
      >
        <vc-card
          :header="
            importStatus && importStatus.inProgress
              ? $t('IMPORT.PAGES.IMPORTING.IMPORT_STARTED')
              : $t('IMPORT.PAGES.IMPORTING.IMPORT_SUMMARY')
          "
        >
          <div class="vc-padding_xl">
            <div v-if="importStatus && importStatus.inProgress">
              <vc-progress
                :value="importStatus.progress"
                variant="striped"
              ></vc-progress>
              <div v-if="importStatus && importStatus.notification">
                <vc-hint class="vc-margin_none vc-margin-top_m">
                  Imported {{ importStatus.notification.processedCount }} of
                  {{ importStatus.notification.totalCount }} lines
                </vc-hint>
                <vc-hint
                  class="vc-margin_none vc-margin-top_s csv-import__error"
                  v-if="importStatus.notification.errorCount > 0"
                >
                  Errors: {{ importStatus.notification.errorCount }}
                </vc-hint>
              </div>
            </div>
            <div
              v-else-if="importStatus && importStatus.notification"
              :class="{ 'vc-flex-column': $isMobile.value }"
            >
              <vc-row>
                <vc-col>
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.LINES_CREATED") }}
                  </p>
                  <p class="vc-margin_none vc-margin-top_s">
                    {{ importStatus.notification.processedCount }}
                  </p>
                </vc-col>
                <!--                <vc-col>-->
                <!--                  <p class="csv-import__importing-status-title vc-margin_none">-->
                <!--                    {{ t("IMPORT.PAGES.IMPORTING.LINES_UPDATED") }}-->
                <!--                  </p>-->
                <!--                  <p class="vc-margin_none vc-margin-top_s">4900</p>-->
                <!--                </vc-col>-->
                <vc-col>
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.ERROR_COUNT") }}
                  </p>
                  <p class="vc-margin_none vc-margin-top_s">
                    {{ importStatus.notification.errorCount }}
                  </p>
                </vc-col>
                <!--                <vc-col size="3">-->
                <!--                  <p class="csv-import__importing-status-title vc-margin_none">-->
                <!--                    {{ t("IMPORT.PAGES.IMPORTING.REPORT_URL") }}-->
                <!--                  </p>-->
                <!--                  <vc-link class="vc-margin-top_s"-->
                <!--                    >api/import/download/import_20210120234901.csv</vc-link-->
                <!--                  >-->
                <!--                </vc-col>-->
              </vc-row>
            </div>
          </div>

          <!-- Import timers -->
          <template v-slot:actions>
            <div
              class="csv-import__time-wrapper vc-flex vc-flex-row"
              v-if="importStatus && importStatus.notification"
            >
              <div
                class="csv-import__time"
                v-if="importStatus.notification.created"
              >
                {{ t("IMPORT.PAGES.IMPORTING.TIMINGS.START") }} —
                <vc-icon icon="far fa-clock" size="xs" />
                <span
                  >&nbsp;{{
                    moment(importStatus.notification.created)
                      .locale(locale)
                      .format("LTS")
                  }}</span
                >
              </div>
              <div
                class="csv-import__time"
                v-if="importStatus.notification.finished"
              >
                {{ t("IMPORT.PAGES.IMPORTING.TIMINGS.END") }} —
                <vc-icon icon="far fa-clock" size="xs" />
                <span
                  >&nbsp;{{
                    moment(importStatus.notification.finished)
                      .locale(locale)
                      .format("LTS")
                  }}</span
                >
              </div>
            </div>
          </template>
        </vc-card>
      </div>
    </div>
    <!--      Import errors-->
    <div class="csv-import__errors-wrap vc-padding_xs vc-flex" v-if="isErrors">
      <div
        class="csv-import__errors vc-padding_l vc-flex"
        v-if="!$isMobile.value"
      >
        <vc-card header="Errors">
          <vc-hint
            class="csv-import__error"
            v-for="(error, i) in importStatus.notification.errors"
            :key="i"
            >{{ error }}</vc-hint
          >
        </vc-card>
      </div>
    </div>
    <!--     Import archive -->
    <div class="csv-import__archive-wrap vc-padding_xs vc-flex">
      <div
        class="csv-import__archive vc-padding_l vc-flex"
        v-if="!$isMobile.value"
      >
        <vc-card header="Archive import">
          <vc-table :columns="columns" :items="importHistory" :header="false">
            <!-- Empty template -->
            <template v-slot:empty>
              <div
                class="
                  vc-fill_all
                  vc-flex vc-flex-column
                  vc-flex-align_center
                  vc-flex-justify_center
                "
              >
                <div
                  class="
                    vc-font-size_m
                    vc-font-weight_medium
                    csv-import__archive-empty-text
                  "
                >
                  {{ t("IMPORT.PAGES.IMPORTING.EMPTY_ARCHIVE") }}
                </div>
              </div>
            </template>

            <!-- Override name column template -->
            <template v-slot:item_name="itemData">
              <div class="vc-flex vc-flex-column">
                <div class="vc-ellipsis">{{ itemData.item.name }}</div>
                <!--                <vc-hint class="vc-ellipsis vc-margin-top_xs">-->
                <!--                  {{ itemData.item.size }} Mb-->
                <!--                </vc-hint>-->
              </div>
            </template>
          </vc-table>
        </vc-card>
      </div>
    </div>
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
  defineComponent,
  onMounted,
  ref,
  computed,
  ComputedRef,
  reactive,
} from "vue";
import { useI18n, useUser } from "@virtoshell/core";
import { IBladeToolbar, ITableColumns } from "../../../types";
import ImportPopup from "../components/import-popup.vue";
import useImport from "../composables/useImport";
import { IImporterMetadata, ImportDataPreview } from "../../../api_client";
import moment from "moment";

interface INotificationActions {
  name: string;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export default defineComponent({
  components: { ImportPopup },
  url: "import",

  setup() {
    const { t } = useI18n();
    const { getAccessToken } = useUser();
    const {
      loading: importLoading,
      uploadedFile,
      fetchDataImporters,
      previewData,
      startImport,
      cancelImport,
      selectImporter,
      setFile,
      clearImport,
      selectedImporter,
      importStatus,
      isValid,
      importHistory,
    } = useImport();
    const loading = ref(false);
    const errorMessage = ref("");
    const importPreview = ref(false);
    const importersList = ref<IImporterMetadata[]>([]);
    const preview = ref<ImportDataPreview>();
    const bladeToolbar = reactive<IBladeToolbar[]>([
      {
        id: "new",
        title: t("IMPORT.PAGES.TOOLBAR.NEW_IMPORT"),
        icon: "fas fa-plus",
        clickHandler() {
          clearImport();
        },
        disabled: computed(
          () => !(importStatus.value && importStatus.value.jobId)
        ),
      },
      // {
      //   id: "edit",
      //   title: t("IMPORT.PAGES.TOOLBAR.EDIT"),
      //   icon: "fas fa-pencil-alt",
      //   clickHandler() {},
      // },
      // {
      //   id: "delete",
      //   title: t("IMPORT.PAGES.TOOLBAR.DELETE"),
      //   icon: "fas fa-trash",
      //   clickHandler() {
      //   },
      // },
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
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.CANCEL_IMPORT"),
        async clickHandler() {
          await cancelImport();
        },
        outline: true,
        variant: "danger",
        isVisible: computed(
          () => importStatus.value && importStatus.value.inProgress
        ),
      },
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.PREVIEW"),
        async clickHandler() {
          preview.value = await previewData();
          popupItems.value = [];
          popupColumns.value = [];
          if (preview.value) {
            preview.value.records.forEach((record) => {
              for (const recordKey in record) {
                popupColumns.value.push({
                  id: recordKey,
                  title: recordKey,
                  width: 130,
                });
              }
              popupItems.value.push(record);
            });
            importPreview.value = true;
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
    const popupColumns = ref<ITableColumns[]>([]);
    const popupItems = ref<Record<string, unknown>[]>([]);
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
    const isErrors = computed(
      () =>
        importStatus.value &&
        importStatus.value.notification &&
        importStatus.value.notification.errors &&
        importStatus.value.notification.errors.length
    );

    onMounted(async () => {
      importersList.value = await fetchDataImporters();

      if (importersList.value.length) {
        selectImporter(importersList.value[0]);
      }
    });

    function initializeImporting() {
      importPreview.value = false;
      start();
    }

    async function start() {
      try {
        errorMessage.value = "";
        await startImport();
      } catch (e) {
        errorMessage.value = e.message;
      }
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
    function setImporter(type: string) {
      const importer = importersList.value.find(
        (importer) => importer.importerType === type
      );
      selectImporter(importer);
    }
    return {
      title: t("IMPORT.MENU.TITLE"),
      t,
      uploadedFile,
      uploadActions,
      errorMessage,
      importPreview,
      popupColumns,
      popupItems,
      importersList,
      loading: computed(() => loading.value || importLoading.value),
      selectedImporter,
      importLoading,
      importStatus,
      isValid,
      columns,
      importHistory,
      isErrors,
      status,
      moment,
      bladeToolbar,
      previewTotalNum: computed(() => preview.value.totalCount),
      locale: window.navigator.language,
      uploadCsv,
      setImporter,
      startImport,
      initializeImporting,
    };
  },
});
</script>

<style lang="less">
:root {
  --color-error: #f14e4e;
}

.csv-import {
  &__archive-wrap {
    flex: 1;
  }

  &__archive {
    flex: 1 1 auto;

    .vc-card__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
    }
  }

  &__inner {
    overflow: hidden;
  }

  &__archive-empty-text {
    color: #838d9a;
    margin: 31px;
  }

  &__importer-description {
    font-style: normal;
    font-weight: normal;
    color: var(--tooltips-color);
    font-size: var(--font-size-s);
    line-height: var(--line-height-xs);
    margin: 7px 0 0;
    padding: 0;
  }

  &__uploaded-title {
    font-size: 18px;
    line-height: 24px;
    color: #6d889b;
    margin: 0 0 6px;
  }

  &__time-wrapper {
    gap: 20px;
  }

  &__time {
    color: var(--hint-color);
  }

  &__importing-status-title {
    color: var(--basic-black-color);
    font-size: var(--font-size-l);
    line-height: var(--line-height-l);
    font-weight: var(--font-weight-medium);
  }

  &__error {
    --hint-color: var(--color-error);
  }

  &__errors-wrap {
    height: 300px;
  }

  &__errors {
    .vc-card__body {
      overflow: auto;
      padding: var(--padding-xl);
    }
  }
}
</style>
