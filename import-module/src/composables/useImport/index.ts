import { useRoute } from "vue-router";
import { computed, Ref, ref, watch } from "vue";
import {
  ImportClient,
  IDataImporter,
  ImportCancellationRequest,
  ImportDataPreview,
  ImportProfile,
  ImportPushNotification,
  ImportRunHistory,
  ObjectSettingEntry,
  SearchImportProfilesCriteria,
  ISearchImportRunHistoryCriteria,
  SearchImportRunHistoryCriteria,
  SearchImportRunHistoryResult,
  OrganizationInfo,
  OrganizationClient,
} from "./../../api-client/import";
import { IObjectSettingEntry, useNotifications, useUser } from "@vc-shell/framework";
import * as _ from "lodash-es";

export type INotificationHistory = ImportPushNotification | ImportRunHistory;

export interface IImportStatus {
  notification?: INotificationHistory;
  jobId?: string;
  inProgress: boolean;
  progress?: number;
  estimatingRemaining?: boolean;
  estimatedRemaining?: string;
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

export type ExtProfile = ImportProfile & {
  importer?: IDataImporter;
  inProgress?: boolean;
  jobId?: string;
};

export interface ISearchProfile extends ISearchImportRunHistoryCriteria {
  results?: ExtProfile[];
}

interface IUseImport {
  readonly loading: Ref<boolean>;
  readonly uploadedFile: Ref<IUploadedFile>;
  readonly importStatus: Ref<IImportStatus>;
  readonly isValid: Ref<boolean>;
  readonly importHistory: Ref<ImportRunHistory[]>;
  readonly dataImporters: Ref<IDataImporter[]>;
  readonly importProfiles: Ref<ExtProfile[]>;
  readonly profile: Ref<ExtProfile>;
  readonly modified: Ref<boolean>;
  readonly totalHistoryCount: Ref<number>;
  readonly historyPages: Ref<number>;
  readonly currentPage: Ref<number>;
  profileDetails: Ref<ImportProfile>;
  setFile(file: IUploadedFile): void;
  setImporter(typeName: string): void;
  fetchDataImporters(): Promise<IDataImporter[]>;
  previewData(): Promise<ImportDataPreview>;
  startImport(extProfile: ExtProfile): Promise<void>;
  cancelImport(): Promise<void>;
  clearImport(): void;
  fetchImportHistory(query?: ISearchImportRunHistoryCriteria): void;
  fetchImportProfiles(): void;
  loadImportProfile(args: { id: string }): void;
  createImportProfile(details: ImportProfile): void;
  updateImportProfile(details: ImportProfile): void;
  deleteImportProfile(args: { id: string }): void;
  updateStatus(notification: ImportPushNotification | ImportRunHistory): void;
  getLongRunning(args: { id: string }): void;
}

export default (): IUseImport => {
  const { notifications } = useNotifications();
  const { getAccessToken, user } = useUser();
  const route = useRoute();
  const loading = ref(false);
  const uploadedFile = ref<IUploadedFile>();
  const historySearchResult = ref<SearchImportRunHistoryResult>();
  const profileSearchResult = ref<ISearchProfile>();
  const profile = ref<ExtProfile>(new ImportProfile() as ExtProfile);
  const profileDetails = ref<ImportProfile>(new ImportProfile({ settings: [new ObjectSettingEntry()] }));
  let profileDetailsCopy: ImportProfile;
  const dataImporters = ref<IDataImporter[]>([]);
  const modified = ref(false);
  const importStarted = ref(false);
  const currentPage = ref(1);
  const importStatus = ref<IImportStatus>({
    inProgress: false,
  });

  //subscribe to pushnotifcation and update the import progress status
  watch(
    [() => notifications, () => importStarted],
    ([newNotifications, isStarted]) => {
      if (isStarted.value && importStatus.value) {
        const notification = newNotifications.value.find(
          (x) => x.id === importStatus.value.notification.id
        ) as ImportPushNotification;

        if (notification) {
          updateStatus(notification);
        }
      }

      if (profileSearchResult.value && profileSearchResult.value.results && profileSearchResult.value.results.length) {
        profileSearchResult.value.results = profileSearchResult.value.results.map((res) => {
          const notification = newNotifications.value.find(
            (x: ImportPushNotification) => x.profileId === res.id
          ) as ImportPushNotification;

          if (notification) {
            res.inProgress = !notification.finished;
            res.jobId = notification.jobId;
          }

          return res;
        });
      }
    },
    { deep: true, immediate: true }
  );

  watch(
    () => profileDetails,
    (state) => {
      modified.value = !_.isEqual(profileDetailsCopy, state.value);
    },
    { deep: true }
  );

  async function fetchImportHistory(query?: ISearchImportRunHistoryCriteria) {
    const importUserId = await GetSellerId();
    const client = await getApiClient();
    try {
      loading.value = true;
      const historyQuery = new SearchImportRunHistoryCriteria({
        ...(query || {}),
        take: 15,
        userId: importUserId,
      });
      historySearchResult.value = await client.searchImportRunHistory(historyQuery);
      currentPage.value = (historyQuery?.skip || 0) / Math.max(1, historyQuery?.take || 15) + 1;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setFile(file: IUploadedFile) {
    profile.value.importFileUrl = file.url;
    uploadedFile.value = file;
  }

  function updateStatus(notification: INotificationHistory) {
    const pushNotifcation = notification as ImportPushNotification;
    importStatus.value = {
      notification: notification,
      jobId: notification.jobId,
      inProgress: !notification.finished,
      progress: (notification.processedCount / notification.totalCount) * 100 || 0,
      estimatingRemaining: pushNotifcation.estimatingRemaining,
      estimatedRemaining: pushNotifcation.estimatedRemaining,
    };
  }

  async function getApiClient() {
    const client = new ImportClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getOrgApiClient() {
    const client = new OrganizationClient();
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
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchImportProfiles() {
    const importUserId = await GetSellerId();
    const client = await getApiClient();

    try {
      loading.value = true;
      const profileQuery = new SearchImportProfilesCriteria({ userId: importUserId });
      profileSearchResult.value = await client.searchImportProfiles(profileQuery);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function previewData() {
    const importUserId = await GetSellerId();
    const client = await getApiClient();

    try {
      loading.value = true;
      const previewDataQuery = new ImportProfile({
        ...profile.value,
        userId: importUserId,
      });
      return client.preview(previewDataQuery);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function startImport(extProfile: ExtProfile) {
    const client = await getApiClient();

    try {
      loading.value = true;
      const importProfile = new ImportProfile(extProfile ? extProfile : profile.value);
      const notification = await client.runImport(importProfile);

      importStarted.value = true;
      updateStatus(notification);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancelImport() {
    const client = await getApiClient();
    try {
      if (importStatus.value.inProgress) {
        await client.cancelJob(new ImportCancellationRequest({ jobId: importStatus.value.jobId }));
      }
    } catch (e) {
      console.error(e);
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

      profile.value.importer = dataImporters.value.find((x) => x.typeName === profile.value.dataImporterType);

      Object.assign(profileDetails.value, profile.value);

      profileDetailsCopy = _.cloneDeep(profileDetails.value);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function setImporter(typeName: string) {
    if (typeName) {
      const importer = dataImporters.value.find((importer) => importer.typeName === typeName);
      if (importer) {
        profileDetails.value.settings = [
          ...(importer?.availSettings.map((x) => {
            const entry = new ObjectSettingEntry(x as unknown as IObjectSettingEntry);
            if (entry.defaultValue) {
              entry.value = entry.defaultValue;
            }
            return entry;
          }) || []),
        ];
      }
    }
  }

  async function updateImportProfile(updatedProfile: ImportProfile) {
    const importUserId = await GetSellerId();
    const client = await getApiClient();

    const command = new ImportProfile({
      ...updatedProfile,
      userId: importUserId,
    });

    try {
      loading.value = true;

      await client.updateImportProfile(command);
      await loadImportProfile({ id: updatedProfile.id });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createImportProfile(newProfile: ImportProfile) {
    const importUserId = await GetSellerId();
    const client = await getApiClient();

    newProfile.userName = user.value.userName;
    newProfile.userId = importUserId; //user.value.id;
    const command = new ImportProfile({
      ...newProfile,
      userId: importUserId,
      settings: newProfile.settings.map((setting) => new ObjectSettingEntry(setting)),
    });

    try {
      loading.value = true;
      const newProfileWithId = await client.createImportProfile(command);
      await loadImportProfile({ id: newProfileWithId.id });
    } catch (e) {
      console.error(e);
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
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function getLongRunning(args: { id: string }) {
    const job = notifications.value.find((x: ImportPushNotification) => {
      return x.profileId === args.id;
    }) as ImportPushNotification;

    if (job && !job.finished) {
      updateStatus(job);
      importStarted.value = true;
    }
  }

  async function getCurrentOrganization(): Promise<OrganizationInfo> {
    const organizationDetails: Ref<OrganizationInfo> = ref();
    try {
      const client = await getOrgApiClient();
      organizationDetails.value = await client.getOrganizationInfo();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return organizationDetails.value;
  }

  async function GetSellerId(): Promise<string> {
    let result = route?.params?.userId as string;
    if (!result || result === "") {
      result = (await getCurrentOrganization())?.organizationId;
    }

    return result;
  }

  return {
    loading: computed(() => loading.value),
    uploadedFile: computed(() => uploadedFile.value),
    importStatus: computed(() => importStatus.value),
    isValid: computed(() => !!(profile.value.importer && uploadedFile.value)),
    importHistory: computed(() => historySearchResult.value?.results),
    importProfiles: computed(() => profileSearchResult.value?.results),
    dataImporters: computed(() => dataImporters.value),
    modified: computed(() => modified.value),
    profile: computed(() => profile.value),
    totalHistoryCount: computed(() => historySearchResult.value?.totalCount),
    historyPages: computed(() => Math.ceil(historySearchResult.value?.totalCount / 15)),
    currentPage: computed(() => currentPage.value),
    profileDetails,
    setFile,
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
    setImporter,
    updateStatus,
    getLongRunning,
  };
};
