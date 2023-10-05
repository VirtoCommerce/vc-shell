import { Ref, ref, computed } from "vue";
import { useUser } from "@vc-shell/framework";
import { CatalogModuleVideosClient, IVideo, Video, VideoCreateRequest } from "@vc-shell/framework/core/api/catalog";

interface IUseVideo {
  readonly video: Ref<IVideo>;
  readonly loading: Ref<boolean>;
  readonly videoLoadedWithoutErrors: Ref<boolean>;
  createVideo: (command: VideoCreateRequest) => Promise<IVideo>;
  saveVideo: (videoItem: IVideo) => void;
}

export default (): IUseVideo => {
  const video = ref<IVideo>();
  const loading = ref(false);
  const videoLoadedWithoutErrors = ref(true);

  async function getApiClient(): Promise<CatalogModuleVideosClient> {
    const { getAccessToken } = useUser();
    const client = new CatalogModuleVideosClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function createVideo(command: VideoCreateRequest): Promise<IVideo> {
    console.info(`Create video from url ${command?.contentUrl} for product ${command?.ownerId}`);
    const client = await getApiClient();
    try {
      loading.value = true;
      video.value = await client.createVideo(command as VideoCreateRequest);
      video.value.uploadDate = new Date();
      videoLoadedWithoutErrors.value = true;
    } catch (e) {
      videoLoadedWithoutErrors.value = false;
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
    return video.value;
  }

  async function saveVideo(videoItem: IVideo): Promise<void> {
    console.info(`Save video with url ${videoItem?.contentUrl} for product ${videoItem?.ownerId}`);
    const client = await getApiClient();
    try {
      loading.value = true;
      await client.update([videoItem as Video]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    video: computed(() => video.value),
    loading: computed(() => loading.value),
    videoLoadedWithoutErrors: computed(() => videoLoadedWithoutErrors.value),
    createVideo,
    saveVideo,
  };
};
