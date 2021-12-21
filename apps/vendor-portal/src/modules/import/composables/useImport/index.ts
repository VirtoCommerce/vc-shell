import { computed, ComputedRef, Ref, ref } from "vue";
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
import { useUser, useLogger } from "@virtoshell/core";
import moment from "moment";

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
  dataImporters: ComputedRef<ImporterMetadata[]>;
  timer: Ref<{ start: string; end: string }>;
  fetchDataImporters(): Promise<void>;
  fetchPreviewData(): Promise<void>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
}

export default (): IUseImport => {
  const logger = useLogger();
  const dataImporters = ref<ImporterMetadata[]>();
  const previewData = ref<ImportDataPreview>();
  const importLoading = ref(false);
  const currentImporter = ref<IImporterMetadata>();
  const uploadedFile = ref<IUploadedFile>();
  const importStarted = ref(false);
  const importing = ref(false);
  const uploadSuccessful = ref(false);
  const timer = ref({
    start: "",
    end: "",
  });

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchDataImporters() {
    loadPersistedData();
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
      timer.value.start = moment().format("h:mm:ss a");
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
      await client.cancelJob(new ImportCancellationRequest({ jobId: "" }));
    } catch (e) {
      logger.error(e);
      throw e;
    }
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
          importStarted: importStarted.value,
          importing: importing.value,
          uploadSuccessful: uploadSuccessful.value,
          timer: timer.value,
        })
      );
    }
  }

  function loadPersistedData() {
    const data = JSON.parse(localStorage.getItem("VC_IMPORT_PERSISTENCE"));
    if (data) {
      currentImporter.value = data.currentImporter;
      uploadedFile.value = data.uploadedFile;
      importStarted.value = data.importStarted;
      importing.value = data.importing;
      uploadSuccessful.value = data.uploadSuccessful;
      timer.value = data.timer;
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
    dataImporters: computed(() => dataImporters.value),
    fetchDataImporters,
    fetchPreviewData,
    startImport,
    cancelImport,
  };
};
