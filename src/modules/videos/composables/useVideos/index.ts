import { Ref, ref, computed } from "vue";
import { useUser } from "@vc-shell/framework";
import {
  CatalogModuleVideosClient,
  IVideo,
  Video,
  IVideoSearchCriteria,
  VideoSearchCriteria,
  VideoSearchResult,
} from "@vc-shell/framework/core/api/catalog";

interface IUseVideos {
  readonly videos: Ref<IVideo[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  searchQuery: Ref<IVideoSearchCriteria>;
  currentPage: Ref<number>;
  searchVideos: (query: IVideoSearchCriteria) => Promise<VideoSearchResult>;
  saveVideos: (videosList: IVideo[]) => Promise<void>;
  deleteVideos: (videoIds: string[]) => Promise<void>;
}

interface IUseVideosOptions {
  pageSize?: number;
  sort?: string;
  keyword?: string;
}

export default (options?: IUseVideosOptions): IUseVideos => {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<IVideoSearchCriteria>({
    take: pageSize,
    sort: options?.sort,
    keyword: options?.keyword,
  });
  const searchResult = ref<VideoSearchResult>();
  const loading = ref(false);

  async function getApiClient(): Promise<CatalogModuleVideosClient> {
    const { getAccessToken } = useUser();
    const client = new CatalogModuleVideosClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function searchVideos(query: IVideoSearchCriteria): Promise<VideoSearchResult> {
    console.info(`Load videos ${query?.skip || 1} sort by ${query?.sort || "default"}`);
    searchQuery.value = { ...searchQuery.value, ...query };
    const client = await getApiClient();
    try {
      loading.value = true;
      searchResult.value = await client.searchVideos({
        ...searchQuery.value,
      } as VideoSearchCriteria);

      return searchResult.value;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function saveVideos(videosList: IVideo[]) {
    console.info(`Save videos`);
    const client = await getApiClient();
    try {
      loading.value = true;
      await client.update(videosList as Video[]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVideos(videoIds: string[]) {
    console.info(`Delete videos ${videoIds}`);
    const client = await getApiClient();
    try {
      loading.value = true;
      await client.delete(videoIds);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    videos: computed(() => searchResult.value?.results),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    currentPage: computed(() => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1),
    loading: computed(() => loading.value),
    searchQuery,
    searchVideos,
    saveVideos,
    deleteVideos,
  };
};
