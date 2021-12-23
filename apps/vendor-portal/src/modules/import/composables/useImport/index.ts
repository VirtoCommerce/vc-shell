import { onMounted, Ref, ref, watch, computed } from "vue";
import {
  IImporterMetadata,
  ImporterMetadata,
  VcmpSellerImportClient,
  PreviewDataQuery,
  ImportProfile,
  ImportProfileOptions,
  ImportDataPreview,
  ImportCancellationRequest,
  ImportPushNotification,
  ImportDataCommand,
} from "../../../../api_client/api-client";
import { useUser, useLogger, useNotifications } from "@virtoshell/core";

export interface IImportStatus {
  notification?: ImportPushNotification;
  jobId?: string;
  inProgress: boolean;
}

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
  loading: Ref<boolean>;
  selectedImporter: Ref<IImporterMetadata>;
  uploadedFile: Ref<IUploadedFile>;
  importStatus: Ref<IImportStatus>;
  isValid: Ref<boolean>;
  setFile(file: IUploadedFile): void;
  selectImporter(importer: IImporterMetadata): void;
  fetchDataImporters(): Promise<ImporterMetadata[]>;
  previewData(): Promise<ImportDataPreview>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
}

export default (): IUseImport => {
  const logger = useLogger();
  const { notifications } = useNotifications();
  const importCommand = ref<ImportDataCommand>({
    importProfile: { options: {} as ImportProfileOptions } as ImportProfile,
  } as ImportDataCommand);
  const importStatus = ref<IImportStatus>();
  const loading = ref(false);
  const uploadedFile = ref<IUploadedFile>();
  const selectedImporter = ref<IImporterMetadata>();

  //subscribe to pushnotifcation and update the import progress status
  watch(
    () => notifications,
    (newVal) => {
      if (importStatus.value) {
        const notification = newVal.value.find(
          (x) => x.id === importStatus.value.notification.id
        ) as ImportPushNotification;
        if (notification) {
          updateStatus(notification);
        }
      }
    },
    { deep: true }
  );

  function selectImporter(importer: IImporterMetadata) {
    importCommand.value.importProfile = new ImportProfile({
      dataImporterType: importer.importerType,
      options: new ImportProfileOptions(importer.importerOptions),
    });
    selectedImporter.value = importer;
  }

  function setFile(file: IUploadedFile) {
    importCommand.value.importProfile.options.importFileUrl = file.url;
    uploadedFile.value = file;
  }

  function updateStatus(notification: ImportPushNotification) {
    importStatus.value = {
      notification: notification,
      jobId: notification.jobId,
      inProgress: !notification.finished,
    };
  }

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchDataImporters() {
    const client = await getApiClient();
    return client.getImporters();
  }

  async function previewData() {
    const client = await getApiClient();
    try {
      loading.value = true;
      const previewDataQuery = new PreviewDataQuery({
        importProfile: importCommand.value.importProfile,
      });
      return client.preview(previewDataQuery);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function startImport() {
    const client = await getApiClient();
    try {
      loading.value = true;
      const notification = await client.runImport(importCommand.value);
      updateStatus(notification);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancelImport() {
    const client = await getApiClient();
    try {
      if (importStatus.value.inProgress) {
        await client.cancelJob(
          new ImportCancellationRequest({ jobId: importStatus.value.jobId })
        );
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  return {
    loading: computed(() => loading.value),
    selectedImporter: computed(() => selectedImporter.value),
    uploadedFile: computed(() => uploadedFile.value),
    importStatus: computed(() => importStatus.value),
    isValid: computed(() => !!(selectedImporter.value && uploadedFile.value)),
    setFile,
    selectImporter,
    fetchDataImporters,
    previewData,
    startImport,
    cancelImport,
  };
};
