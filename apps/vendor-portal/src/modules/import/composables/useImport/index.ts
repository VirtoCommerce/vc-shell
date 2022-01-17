import { Ref, ref, watch, computed } from "vue";
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
  progress: number;
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
  importHistory: Ref<ImportPushNotification[]>;
  setFile(file: IUploadedFile): void;
  selectImporter(importer: IImporterMetadata): void;
  fetchDataImporters(): Promise<ImporterMetadata[]>;
  previewData(): Promise<ImportDataPreview>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
  clearImport(): void;
  getImport(jobId: string): void;
}

const selectedImporter = ref<IImporterMetadata>();
const importCommand = ref<ImportDataCommand>({
  importProfile: { options: {} as ImportProfileOptions } as ImportProfile,
} as ImportDataCommand);
export default (): IUseImport => {
  const logger = useLogger();
  const { notifications } = useNotifications();
  const { getAccessToken } = useUser();
  const importStatus = ref<IImportStatus>();
  const loading = ref(false);
  const uploadedFile = ref<IUploadedFile>();
  const importHistory = ref<ImportPushNotification[]>([]);

  //subscribe to pushnotifcation and update the import progress status
  watch(
    () => notifications,
    (newVal) => {
      const notification =
        importStatus.value &&
        (newVal.value.find(
          (x) => x.id === importStatus.value.notification.id
        ) as ImportPushNotification);

      if (notification) {
        updateStatus(notification);
      }
      createImportHistory(newVal.value as ImportPushNotification[]);
    },
    { deep: true, immediate: true }
  );

  function createImportHistory(notifications: ImportPushNotification[]) {
    console.log(notifications);
    const finishedImports = notifications.filter(
      (notification) => notification.finished
    );

    if (finishedImports && finishedImports.length) {
      importHistory.value = finishedImports;
    }
  }

  function selectImporter(importer: IImporterMetadata) {
    importCommand.value.importProfile = new ImportProfile({
      dataImporterType: importer.importerType,
      options: importer.importerOptions,
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
      progress: (notification.processedCount / notification.totalCount) * 100,
    };
  }

  async function getApiClient() {
    const client = new VcmpSellerImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchDataImporters() {
    // TODO it's temporary workaround to get raw importers data
    const token = await getAccessToken();
    if (token) {
      const importers = await fetch("/api/vcmp/import/importers", {
        method: "GET",
        headers: {
          Accept: "text/plain",
          authorization: `Bearer ${token}`,
        },
      });

      return importers.text().then((response) => {
        const importers = JSON.parse(response);
        const result = [];
        if (Array.isArray(importers)) {
          for (const item of importers) {
            const importerMeta = ImporterMetadata.fromJS(item);
            result.push({
              importerType: importerMeta.importerType,
              importerOptions: new ImportProfileOptions({
                ...importerMeta.importerOptions,
              }),
            });
          }
        }
        return result;
      });
    } else {
      return [];
    }
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

  function clearImport() {
    setFile({
      url: undefined,
      name: undefined,
      size: 0,
    });
    importStatus.value = undefined;
  }

  function getImport(jobId: string) {
    const notification = notifications.value.find(
      (notification: ImportPushNotification) => notification.jobId === jobId
    ) as ImportPushNotification;

    if (notification) {
      importStatus.value = {
        notification: notification,
        jobId: notification.jobId,
        inProgress: !notification.finished,
        progress: (notification.processedCount / notification.totalCount) * 100,
      };
    }
  }

  return {
    loading: computed(() => loading.value),
    selectedImporter: computed(() => selectedImporter.value),
    uploadedFile: computed(() => uploadedFile.value),
    importStatus: computed(() => importStatus.value),
    isValid: computed(() => !!(selectedImporter.value && uploadedFile.value)),
    importHistory: computed(() => importHistory.value),
    setFile,
    selectImporter,
    fetchDataImporters,
    previewData,
    startImport,
    cancelImport,
    clearImport,
    getImport,
  };
};
