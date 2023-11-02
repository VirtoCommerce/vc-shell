import { Ref, ref, computed, watch } from "vue";
import { useUser } from "@vc-shell/framework";
import { IVideo, Video } from "@vcmp-vendor-portal/api/catalog";
import { VcmpSellerCatalogClient, CreateVideoCommand } from "@vcmp-vendor-portal/api/marketplacevendor";
import * as _ from "lodash-es";

interface IUseVideo {
  readonly video: Ref<IVideo>;
  readonly loading: Ref<boolean>;
  readonly videoLoadedWithoutErrors: Ref<boolean>;
  readonly modified: Ref<boolean>;
  createVideo: (command: CreateVideoCommand) => Promise<IVideo>;
  saveVideo: (videoItem: IVideo) => void;
}

export default (): IUseVideo => {
  const video = ref<IVideo>();
  const loading = ref(false);
  const videoLoadedWithoutErrors = ref(true);
  const modified = ref(false);
  let videoDetailsCopy: IVideo;

  watch(
    () => video,
    (state) => {
      modified.value = !_.isEqual(videoDetailsCopy, state.value);
    },
    { deep: true }
  );

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function createVideo(command: CreateVideoCommand): Promise<IVideo> {
    console.info(`Create video from url ${command?.contentUrl} for product ${command?.ownerId}`);
    const client = await getApiClient();
    try {
      loading.value = true;
      video.value = await client.createVideo(command as CreateVideoCommand);
      video.value.uploadDate = new Date();
      videoLoadedWithoutErrors.value = true;
      videoDetailsCopy = _.cloneDeep(video.value);
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
    modified: computed(() => modified.value),
    createVideo,
    saveVideo,
  };
};
