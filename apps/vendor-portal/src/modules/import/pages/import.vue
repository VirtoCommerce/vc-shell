<template>
  <vc-blade
    :title="$t('IMPORT.PAGES.TITLE')"
    width="100%"
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
              v-model="selectedImporter"
              @change="setImporter"
              :label="$t('IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.TITLE')"
            ></vc-select>
            <p class="csv-import__importer-description">
              {{
                t(
                  "IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.DESCRIPTION.TITLE"
                )
              }}
              <span>
                <a class="vc-link" href="#">{{
                  t(
                    "IMPORT.PAGES.ACTIONS.SELECTS.DATA_IMPORTER.DESCRIPTION.LINK"
                  )
                }}</a>
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
            'vc-flex-justify_end vc-padding_l': !uploadedFile,
          }"
        >
          <p class="csv-import__uploaded-title" v-if="uploadedFile">
            {{ t("IMPORT.PAGES.ACTIONS.UPLOADER.TITLE") }}
          </p>
          <vc-file-upload
            variant="file-upload"
            @upload="uploadCsv"
            :notification="true"
            :uploadedFile="uploadedFile"
            :uploadActions="uploadActions"
            :isUploaded="uploadSuccessful"
            :errorMessage="errorMessage"
            :loading="loading"
            accept=".csv"
          ></vc-file-upload>
        </vc-col>
      </vc-row>

      <!-- Import started -->
      <div class="csv-import__importing vc-padding_l" v-if="importStarted">
        <vc-card
          :header="
            importing
              ? $t('IMPORT.PAGES.IMPORTING.IMPORT_STARTED')
              : $t('IMPORT.PAGES.IMPORTING.IMPORT_SUMMARY')
          "
        >
          <div class="vc-padding_xl">
            <vc-progress :value="progress" v-if="importing"></vc-progress>
            <div v-else :class="{ 'vc-flex-column': $isMobile.value }">
              <vc-row>
                <vc-col>
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.LINES_CREATED") }}
                  </p>
                  <p class="vc-margin_none vc-margin-top_s">4900</p>
                </vc-col>
                <vc-col>
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.LINES_UPDATED") }}
                  </p>
                  <p class="vc-margin_none vc-margin-top_s">4900</p>
                </vc-col>
                <vc-col>
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.ERROR_COUNT") }}
                  </p>
                  <p class="vc-margin_none vc-margin-top_s">4900</p>
                </vc-col>
                <vc-col size="3">
                  <p class="csv-import__importing-status-title vc-margin_none">
                    {{ t("IMPORT.PAGES.IMPORTING.REPORT_URL") }}
                  </p>
                  <vc-link class="vc-margin-top_s"
                    >api/import/download/import_20210120234901.csv</vc-link
                  >
                </vc-col>
              </vc-row>
            </div>
          </div>

          <!-- Import timings -->
          <template v-slot:actions>
            <div class="csv-import__time-wrapper vc-flex vc-flex-row">
              <div class="csv-import__time" v-if="timing.start">
                {{ t("IMPORT.PAGES.IMPORTING.TIMINGS.START") }} —
                <vc-icon icon="far fa-clock" size="xs" />
                <span>&nbsp;{{ timing.start }}</span>
              </div>
              <div class="csv-import__time" v-if="timing.end">
                {{ t("IMPORT.PAGES.IMPORTING.TIMINGS.END") }} —
                <vc-icon icon="far fa-clock" size="xs" />
                <span>&nbsp;{{ timing.end }}</span>
              </div>
            </div>
          </template>
        </vc-card>
      </div>
    </div>
    <!-- Import archive -->
    <div class="csv-import__archive-wrap vc-padding_xs vc-flex">
      <div
        class="csv-import__archive vc-padding_l vc-flex"
        v-if="!$isMobile.value"
      >
        <vc-card header="Archive import">
          <vc-table
            :columns="columns"
            :items="mock"
            :sort="sort"
            :header="false"
            :selectedItemId="selectedItemId"
          >
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
                <vc-hint class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.size }} Mb
                </vc-hint>
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
    ></import-popup>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useI18n, useUser } from "@virtoshell/core";
import { ITableColumns } from "../../../types";
import ImportPopup from "../components/import-popup.vue";
import moment from "moment";
import useImport from "../composables/useImport";

interface INotificationActions {
  name: string;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean;
}

export default defineComponent({
  components: { ImportPopup },
  url: "import",

  setup() {
    const { t } = useI18n();
    const { getAccessToken } = useUser();
    const {
      fetchDataImporters,
      dataImporters,
      currentImporter,
      showPreview,
      uploadedFile,
    } = useImport();
    const selectedImporter = ref();
    const importersList = ref<{ id: number; title: string }[]>([]);
    const sort = ref("date:DESC");
    const selectedItemId = ref();
    const loading = ref(false);
    const errorMessage = ref("");
    const importPreview = ref(false);
    const importing = ref(false);
    const importStarted = ref(false);
    const progress = ref(0);
    const file = ref<File>();
    const timing = ref({
      start: "",
      end: "",
    });
    const uploadSuccessful = ref(false);
    const uploadActions = ref<INotificationActions[]>([
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.DELETE"),
        clickHandler() {
          deleteUpload();
        },
        outline: true,
        variant: "danger",
        isVisible: true,
      },
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.PREVIEW"),
        clickHandler() {
          showPreview();
          // importPreview.value = true;
        },
        variant: "primary",
        outline: false,
        isVisible: true,
      },
      {
        name: t("IMPORT.PAGES.ACTIONS.UPLOADER.ACTIONS.START_IMPORT"),
        clickHandler() {
          startImport();
        },
        outline: true,
        variant: "primary",
        isVisible: true,
      },
    ]);

    const mock = ref([
      {
        id: "1",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "2",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "10.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "3",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "4",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "5",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "6",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
      {
        id: "7",
        name: "contacts-new-2203-2021.csv",
        linesCreated: "4900",
        linesUpdated: "500",
        errorCount: "200",
        date: "08.12.21 - 1:49:01 AM",
        reportUrl: "api/import/download/import_20210120234901.csv",
        size: "2.9",
      },
    ]);

    const columns = ref<ITableColumns[]>([
      {
        id: "name",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.NAME"),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "linesCreated",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.LINES_CREATED"),
        width: 147,
        sortable: true,
      },
      {
        id: "linesUpdated",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.LINES_UPDATED"),
        width: 130,
        sortable: true,
      },
      {
        id: "errorCount",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.ERROR_COUNT"),
        width: 118,
        sortable: true,
      },
      {
        id: "date",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.DATE"),
        width: 185,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "reportUrl",
        title: t("IMPORT.PAGES.LIST.TABLE.HEADER.REPORT_URL"),
        type: "link",
      },
    ]);

    const popupColumns = ref<ITableColumns[]>([
      {
        id: "fullName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.FULL_NAME"),
        width: 130,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "firstName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.FIRST_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "lastName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.LAST_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "contactId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "outerId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgOuterId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountOuterId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountLogin",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_LOGIN"),
        width: 130,
        sortable: true,
      },
      {
        id: "storeId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.STORE_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "fullName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.FULL_NAME"),
        width: 130,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "firstName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.FIRST_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "lastName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.LAST_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "contactId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "outerId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgOuterId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "orgName",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ORG_NAME"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountOuterId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_OUTER_ID"),
        width: 130,
        sortable: true,
      },
      {
        id: "accountLogin",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.ACCOUNT_LOGIN"),
        width: 130,
        sortable: true,
      },
      {
        id: "storeId",
        title: t("IMPORT.PAGES.IMPORTING.TABLE.HEADER.STORE_ID"),
        width: 130,
        sortable: true,
      },
    ]);

    const popupItems = ref([
      {
        id: "1",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "2",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "3",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "4",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "5",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "6",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "7",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "8",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "9",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
      {
        id: "10",
        fullName: "Bessie Cooper",
        firstName: "Cody",
        lastName: "Fox",
        contactId: "7j5...422",
        outerId: "904...4f2",
        orgId: "444...897",
        orgOuterId: "112...4jh",
        orgName: "Microsoft",
        accountId: "morris-ad",
        accountOrderId: "",
        accountLogin: "",
        storeId: "998...3ee",
      },
    ]);

    onMounted(async () => {
      await fetchDataImporters();
      createImportersList();
      selectedImporter.value = 1;
      setImporter(1);
    });

    function createImportersList() {
      for (let i = 0; i < dataImporters.value.length; i++) {
        importersList.value.push({
          id: i + 1,
          title: dataImporters.value[i].importerType,
        });
      }
    }

    async function uploadCsv(files: File) {
      loading.value = true;
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     file.value = e[0];
      //     resolve(file.value);
      //   }, 1000);
      // })
      //   .then((res: File) => {
      //     uploadedFile.value = {
      //       file_name: res.name,
      //       size: (res.size / (1024 * 1024)).toFixed(2),
      //       status: true,
      //     };
      //   })
      //   .finally(() => {
      //     loading.value = false;
      //   });
      try {
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
          uploadSuccessful.value = true;
          uploadedFile.value = response[0];
          currentImporter.value.importerOptions.importFileUrl =
            uploadedFile.value.url;
        }
        files = null;
      } catch (e) {
        uploadSuccessful.value = false;
        errorMessage.value = e;
        uploadedFile.value = {
          name: files[0].name,
          size: files[0].size / (1024 * 1024),
        };
      } finally {
        loading.value = false;
      }
    }

    function startImport() {
      importStarted.value = true;
      importing.value = true;
      timing.value.start = moment().format("h:mm:ss a");
      const prog = setInterval(() => {
        if (progress.value === 100) {
          timing.value.end = moment().format("h:mm:ss a");
          importing.value = false;
          uploadActions.value.forEach((action) => (action.isVisible = false));
          clearInterval(prog);
        }
        progress.value += 10;
      }, 500);
    }

    function deleteUpload() {
      // file.value = null;
      // importStarted.value = false;
      // uploadedFile.value = {
      //   file_name: "",
      //   size: null,
      //   status: false,
      // };
      // progress.value = 0;
      // timing.value = {
      //   start: "",
      //   end: "",
      // };
      // uploadActions.value.forEach((action) => (action.isVisible = true));
    }

    function setImporter(id: number) {
      const selected = importersList.value.find((imp) => imp.id === id).title;
      currentImporter.value = dataImporters.value.find((importer) => {
        return importer.importerType === selected;
      });
    }

    return {
      title: t("IMPORT.MENU.TITLE"),
      t,
      columns,
      mock,
      sort,
      selectedItemId,
      uploadedFile: computed(() => uploadedFile.value),
      uploadActions,
      errorMessage,
      importing,
      importStarted,
      progress,
      timing,
      importPreview,
      popupColumns,
      popupItems,
      loading,
      importersList,
      selectedImporter,
      uploadSuccessful,
      currentImporter,
      uploadCsv,
      setImporter,
    };
  },
});
</script>

<style lang="less" scoped>
.csv-import {
  &__archive-wrap {
    flex: 1;
  }

  &__archive {
    flex: 1 1 auto;

    :deep(.vc-card__body) {
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
}
</style>
