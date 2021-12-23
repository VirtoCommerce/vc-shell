import { onMounted, Ref, ref, watch } from "vue";
import {
  IImporterMetadata,
  ImporterMetadata,
  VcmpSellerImportClient,
  PreviewDataQuery,
  ImportProfile,
  ImportProfileOptions,
  ImportDataPreview,
  ImportCancellationRequest,
} from "../../../../api_client/api-client";
import { useUser, useLogger, useNotifications } from "@virtoshell/core";
import moment from "moment";
import { BulkActionPushNotification } from "@virtoshell/api-client";

export interface IUploadedFile {
  contentType?: string;
  createdDate?: string;
  name: string;
  relativeUrl?: string;
  size: number | string;
  type?: string;
  url?: string;
}

interface IUseImport {
  currentImporter: Ref<IImporterMetadata>;
  uploadedFile: Ref<IUploadedFile>;
  importLoading: Ref<boolean>;
  previewData: Ref<ImportDataPreview>;
  importing: Ref<boolean>;
  importStarted: Ref<boolean>;
  uploadSuccessful: Ref<boolean>;
  dataImporters: Ref<ImporterMetadata[]>;
  status: Ref<BulkActionPushNotification>;
  timer: Ref<{ start: string; end: string }>;
  fetchDataImporters(): Promise<void>;
  fetchPreviewData(): Promise<void>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
  deleteUpload(): void;
}

export default (): IUseImport => {
  const logger = useLogger();
  const { dropNotifications } = useNotifications();
  const dataImporters = ref<ImporterMetadata[]>();
  const previewData = ref<ImportDataPreview>();
  const importLoading = ref(false);
  const currentImporter = ref<IImporterMetadata>();
  const uploadedFile = ref<IUploadedFile>();
  const importStarted = ref(false);
  const importing = ref(false);
  const uploadSuccessful = ref(false);
  const jobId = ref("");
  const timer = ref({
    start: "",
    end: "",
  });
  const status = ref<BulkActionPushNotification>();

  watch(
    () => dropNotifications,
    (newVal) => {
      loadPersistedData();
      if (uploadSuccessful.value) {
        const newImportNotifications = newVal.value.filter(
          (notif) => notif.isNew && notif.notifyType === "ImportPushNotifaction"
        ) as BulkActionPushNotification[];

        status.value =
          newImportNotifications && newImportNotifications.length
            ? newImportNotifications[0]
            : null;

        if (status.value) {
          jobId.value = status.value.jobId;

          switch (status.value.description) {
            case "Import has started":
              setTime();
              break;
            case "Import finished":
              setTime();
              importStarted.value = true;
              importing.value = false;
              break;
          }
        }
      }
    },
    { deep: true }
  );

  function setTime() {
    timer.value.start =
      status.value.created && moment(status.value.created).format("h:mm:ss a");
    timer.value.end =
      status.value.finished &&
      moment(status.value.finished).format("h:mm:ss a");
  }

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchDataImporters() {
    const client = await getApiClient();
    dataImporters.value = await client.getImporters();
  }

  async function fetchPreviewData() {
    const client = await getApiClient();

    try {
      importLoading.value = true;
      const previewDataQuery = new PreviewDataQuery({
        importProfile: createImportProfile(),
      });
      previewData.value = await client.preview(previewDataQuery);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      importLoading.value = false;
    }
  }

  async function startImport() {
    const client = await getApiClient();
    try {
      importStarted.value = true;
      importing.value = true;
      persistData();
      await client.runImport({ importProfile: createImportProfile() });
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async function cancelImport() {
    const client = await getApiClient();
    try {
      importStarted.value = false;
      importing.value = false;
      uploadSuccessful.value = false;
      uploadedFile.value = undefined;
      persistData(true);
      if (jobId.value) {
        await client.cancelJob(
          new ImportCancellationRequest({ jobId: jobId.value })
        );
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  function deleteUpload() {
    uploadedFile.value = undefined;
    persistData(true);
  }

  function createImportProfile() {
    return new ImportProfile({
      dataImporterType: currentImporter.value.importerType,
      options: new ImportProfileOptions(currentImporter.value.importerOptions),
    });
  }

  function persistData(clear = false) {
    if (clear) {
      localStorage.removeItem("VC_IMPORT_PERSISTENCE");
    } else {
      localStorage.setItem(
        "VC_IMPORT_PERSISTENCE",
        JSON.stringify({
          currentImporter: currentImporter.value,
          uploadedFile: uploadedFile.value,
          uploadSuccessful: uploadSuccessful.value,
        })
      );
    }
  }

  function loadPersistedData() {
    const data = JSON.parse(localStorage.getItem("VC_IMPORT_PERSISTENCE"));
    if (data) {
      currentImporter.value = data.currentImporter;
      uploadedFile.value = data.uploadedFile;
      uploadSuccessful.value = data.uploadSuccessful;
    }
  }

  return {
    currentImporter,
    uploadedFile,
    importLoading,
    previewData,
    importing,
    importStarted,
    uploadSuccessful,
    timer,
    dataImporters,
    status,
    fetchDataImporters,
    fetchPreviewData,
    startImport,
    cancelImport,
    deleteUpload,
  };
};
