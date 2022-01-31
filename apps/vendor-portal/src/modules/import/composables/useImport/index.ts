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

export interface IExtProfile {
  profile: ImportProfile;
  importer: IDataImporter;
}

interface IUseImport {
  loading: Ref<boolean>;
  uploadedFile: Ref<IUploadedFile>;
  importStatus: Ref<IImportStatus>;
  isValid: Ref<boolean>;
  importHistory: Ref<ImportProfile[]>;
  dataImporters: Ref<IDataImporter[]>;
  importProfiles: Ref<ImportProfile[]>;
  profileDetails: IImportProfile;
  profile: Ref<IExtProfile>;
  setFile(file: IUploadedFile): void;
  fetchDataImporters(): Promise<IDataImporter[]>;
  previewData(): Promise<ImportDataPreview>;
  startImport(): Promise<void>;
  cancelImport(): Promise<void>;
  clearImport(): void;
  getImport(jobId: string): void;
  fetchImportHistory(profileId?: string): void;
  fetchImportProfiles(): void;
  loadImportProfile(args: { id: string }): void;
  createImportProfile(details: IImportProfile): void;
  updateImportProfile(profileId: string, details: IImportProfile): void;
  deleteImportProfile(args: { id: string }): void;
}

export default (): IUseImport => {
  const logger = useLogger();
  const { notifications } = useNotifications();
  const { getAccessToken, user } = useUser();
  const loading = ref(false);
  const uploadedFile = ref<IUploadedFile>();
  const historySearchResult = ref<SearchImportProfilesResult>();
  const profileSearchResult = ref<SearchImportProfilesResult>();
  const profile = ref<IExtProfile>({
    profile: new ImportProfile(),
    importer: new IDataImporter(),
  });
  const profileDetails = reactive<IImportProfile>(new ImportProfile());
  const importCommand = ref<RunImportCommand>({
    importProfile: { settings: [] } as ImportProfile,
  } as RunImportCommand);
  const importStatus = ref<IImportStatus>();
  const dataImporters = ref<IDataImporter[]>([]);

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
    const command = new ImportProfile({
      dataImporterType: profile.value.profile.dataImporterType,
      settings: profile.value.profile.settings.map(
        (x) => new ObjectSettingEntry(x)
      ),
      importFileUrl: importCommand.value.importProfile.importFileUrl,
    });

    try {
      loading.value = true;
      const previewDataQuery = new PreviewDataQuery({
        importProfile: command,
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

    const command = new ImportProfile({
      dataImporterType: profile.value.profile.dataImporterType,
      settings: profile.value.profile.settings,
      importFileUrl: importCommand.value.importProfile.importFileUrl,
    });

    try {
      loading.value = true;
      const importDataQuery = new RunImportCommand({ importProfile: command });
      const notification = await client.runImport(importDataQuery);
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

  async function loadImportProfile(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;

      const fetchedProfile = await client.getImportProfileById(args.id);

      const importer = dataImporters.value.find(
        (x) => x.typeName === fetchedProfile.dataImporterType
      );

      profile.value = { profile: fetchedProfile, importer };

      Object.assign(profileDetails, {
        name: profile.value.profile.name,
        dataImporterType: profile.value.profile.dataImporterType,
        sellerId: profile.value.profile.sellerId,
        sellerName: profile.value.profile.sellerName,
        settings: profile.value.profile.settings,
        typeName: profile.value.profile.typeName,
        importFileUrl: profile.value.profile.importFileUrl,
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
      await loadImportProfile({ id: profile.value.profile.id });
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createImportProfile(details: IImportProfile) {
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
      profile.value.profile = await client.createImportProfile(command);
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
    uploadedFile: computed(() => uploadedFile.value),
    importStatus: computed(() => importStatus.value),
    isValid: computed(() => !!(profile.value.importer && uploadedFile.value)),
    importHistory: computed(() => historySearchResult.value?.results),
    importProfiles: computed(() => profileSearchResult.value?.results),
    dataImporters: computed(() => dataImporters.value),
    profile: computed(() => profile.value),
    profileDetails,
    setFile,
    fetchDataImporters,
    previewData,
    startImport,
    cancelImport,
    clearImport,
    getImport,
    loadImportProfile,
    fetchImportHistory,
    fetchImportProfiles,
    createImportProfile,
    updateImportProfile,
    deleteImportProfile,
  };
};
