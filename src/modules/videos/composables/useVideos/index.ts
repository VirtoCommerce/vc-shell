import { Ref, ref, computed, watch } from "vue";
import { useUser } from "@vc-shell/framework";
import { IVideo, Video, VideoSearchResult } from "vcmp-vendor-portal-api/catalog";
import {
  VcmpSellerCatalogClient,
  ISearchVideosQuery,
  SearchVideosQuery,
} from "vcmp-vendor-portal-api/marketplacevendor";
import * as _ from "lodash-es";

interface IUseVideos {
  readonly videos: Ref<IVideo[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly modified: Ref<boolean>;
  searchQuery: Ref<ISearchVideosQuery>;
  currentPage: Ref<number>;
  searchVideos: (query: ISearchVideosQuery) => Promise<VideoSearchResult>;
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
  const searchQuery = ref<ISearchVideosQuery>({
    take: pageSize,
    sort: options?.sort,
    keyword: options?.keyword,
  });
  const searchResult = ref<VideoSearchResult>();
  const videos = ref<IVideo[]>();
  const loading = ref(false);
  const modified = ref(false);
  let videosCopy: IVideo[];

  watch(
    () => videos.value,
    (newVal) => {
      modified.value = !_.isEqual(newVal, videosCopy);
    },
    { deep: true }
  );

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function searchVideos(query: ISearchVideosQuery): Promise<VideoSearchResult> {
    console.info(`Load videos ${query?.skip || 1} sort by ${query?.sort || "default"}`);
    searchQuery.value = { ...searchQuery.value, ...query };
    const client = await getApiClient();
    try {
      loading.value = true;
      searchResult.value = await client.searchVideos({
        ...searchQuery.value,
      } as SearchVideosQuery);
      videos.value = searchResult.value?.results;
      videosCopy = _.cloneDeep(videos.value);
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
    videos: computed(() => videos.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    currentPage: computed(() => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1),
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    searchQuery,
    searchVideos,
    saveVideos,
    deleteVideos,
  };
};
