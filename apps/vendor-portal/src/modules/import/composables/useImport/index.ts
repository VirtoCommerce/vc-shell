import { computed, ref, unref } from "vue";
import {
  IImporterMetadata,
  ImportDataPreview,
  ImporterMetadata,
  VcmpSellerImportClient,
  PreviewDataQuery,
  ImportProfile,
  ImportDataCommand,
  ImportProfileOptions,
} from "../../../../api_client/api-client";
import { useUser } from "@virtoshell/core";

export interface IUploadedFile {
  contentType?: string;
  createdDate?: string;
  name: string;
  relativeUrl?: string;
  size: number | string;
  type?: string;
  url?: string;
}

export default () => {
  const dataImporters = ref<ImporterMetadata[]>();
  const currentImporter = ref<IImporterMetadata>();
  const previewData = ref<ImportDataPreview>();
  const uploadedFile = ref<IUploadedFile>();

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchDataImporters() {
    const client = await getApiClient();
    dataImporters.value = await client.getImporters();
    console.log(await client.getImporters());
  }

  async function showPreview() {
    const client = await getApiClient();
    const profile = new ImportProfile({
      dataImporterType: currentImporter.value.importerType,
      options: new ImportProfileOptions(currentImporter.value.importerOptions),
    });
    const previewDataQuery = new PreviewDataQuery({ importProfile: profile });
    console.log(profile, previewDataQuery);
    previewData.value = await client.preview(previewDataQuery);
    console.log(previewData.value);
  }

  return {
    currentImporter,
    uploadedFile,
    dataImporters: computed(() => dataImporters.value),
    fetchDataImporters,
    showPreview,
  };
};
