import { computed, reactive, Ref, ref, watch } from "vue";
import {
  CreateProfileCommand,
  IDataImporter,
  IImportProfile,
  ImportCancellationRequest,
  ImportDataPreview,
  ImportProfile,
  ImportPushNotification,
  ObjectSettingEntry,
  PreviewDataQuery,
  RunImportCommand,
  SearchImportProfilesHistoryQuery,
  SearchImportProfilesQuery,
  SearchImportProfilesResult,
  UpdateProfileCommand,
  VcmpSellerImportClient,
} from "../../../../api_client/api-client";
import { useLogger, useNotifications, useUser } from "@virtoshell/core";

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
  selectedImporter: Ref<IDataImporter>;
  uploadedFile: Ref<IUploadedFile>;
  importStatus: Ref<IImportStatus>;
  isValid: Ref<boolean>;
  importHistory: Ref<ImportProfile[]>;
  dataImporters: Ref<IDataImporter[]>;
  importProfiles: Ref<ImportProfile[]>;
  profileDetails: IImportProfile;
  profile: Ref<ImportProfile>;
  setFile(file: IUploadedFile): void;
  selectProfile(profile: ImportProfile): void;
  fetchDataImporters(): Promise<IDataImporter[]>;
  previewData(): Promise<ImportDataPreview>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
  clearImport(): void;
  fetchImportHistory(profileId?: string): void;
  fetchImportProfiles(): void;
  loadImportProfile(args: { id: string }): void;
  createImportProfile(details: IImportProfile): void;
  updateImportProfile(profileId: string, details: IImportProfile): void;
  deleteImportProfile(args: { id: string }): void;
}
const selectedImporter = ref<IDataImporter>();
const importCommand = ref<RunImportCommand>({
  importProfile: { settings: [] } as ImportProfile,
} as RunImportCommand);
const importStatus = ref<IImportStatus>();
const dataImporters = ref<IDataImporter[]>([]);
export default (): IUseImport => {
  const logger = useLogger();
  const { notifications } = useNotifications();
  const { getAccessToken, user } = useUser();
  const loading = ref(false);
  const uploadedFile = ref<IUploadedFile>();
  const historySearchResult = ref<SearchImportProfilesResult>();
  const profileSearchResult = ref<SearchImportProfilesResult>();
  const profile = ref<ImportProfile>();
  const profileDetails = reactive<IImportProfile>(new ImportProfile());

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
    },
    { deep: true, immediate: true }
  );

  async function fetchImportHistory(profileId?: string) {
    const client = await getApiClient();
    try {
      loading.value = true;
      const historyQuery = new SearchImportProfilesHistoryQuery({ profileId });
      historySearchResult.value = await client.searchImportProfilesHistory(
        historyQuery
      );
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function selectProfile(profile: ImportProfile) {
    importCommand.value.importProfile = new ImportProfile({
      dataImporterType: profile.dataImporterType,
      settings: profile.settings,
    });
    selectedImporter.value = dataImporters.value.find(
      (importer) => importer.typeName === profile.dataImporterType
    );
    importStatus.value = undefined;
  }

  function setFile(file: IUploadedFile) {
    importCommand.value.importProfile.importFileUrl = file.url;
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
    const client = await getApiClient();
    try {
      loading.value = true;

      dataImporters.value = await client.getImporters();

      return dataImporters.value;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchImportProfiles() {
    const client = await getApiClient();

    try {
      loading.value = true;
      const profileQuery = new SearchImportProfilesQuery();
      profileSearchResult.value = await client.searchImportProfiles(
        profileQuery
      );
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
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

  async function loadImportProfile(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;

      profile.value = await client.getImportProfileById(args.id);

      Object.assign(profileDetails, {
        name: profile.value.name,
        dataImporterType: profile.value.dataImporterType,
        sellerId: profile.value.sellerId,
        sellerName: profile.value.sellerName,
        settings: profile.value.settings,
        typeName: profile.value.typeName,
        importFileUrl: profile.value.importFileUrl,
      } as IImportProfile);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateImportProfile(
    profileId: string,
    details: IImportProfile
  ) {
    const client = await getApiClient();

    const command = new UpdateProfileCommand({
      importProfileId: profileId,
      importProfile: new ImportProfile(details),
    });

    try {
      loading.value = true;

      await client.updateImportProfile(command);
      await loadImportProfile({ id: profile.value.id });
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createImportProfile(details: IImportProfile) {
    console.log(profile);
    const client = await getApiClient();

    const command = new CreateProfileCommand({
      importProfile: new ImportProfile({
        dataImporterType: details.typeName,
        typeName: details.typeName,
        settings: details.settings.map(
          (setting) => new ObjectSettingEntry(setting)
        ),
        name: details.name,
        sellerName: user.value.userName,
        sellerId: user.value.id,
      }),
    });

    try {
      loading.value = true;
      profile.value = await client.createImportProfile(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteImportProfile(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteProfile(args.id);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: computed(() => loading.value),
    selectedImporter: computed(() => selectedImporter.value),
    uploadedFile: computed(() => uploadedFile.value),
    importStatus: computed(() => importStatus.value),
    isValid: computed(() => !!(selectedImporter.value && uploadedFile.value)),
    importHistory: computed(() => historySearchResult.value?.results),
    importProfiles: computed(() => profileSearchResult.value?.results),
    dataImporters: computed(() => dataImporters.value),
    profile: computed(() => profile.value),
    profileDetails,
    setFile,
    selectProfile,
    fetchDataImporters,
    previewData,
    startImport,
    cancelImport,
    clearImport,
    loadImportProfile,
    fetchImportHistory,
    fetchImportProfiles,
    createImportProfile,
    updateImportProfile,
    deleteImportProfile,
  };
};
