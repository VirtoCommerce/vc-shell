import { useDebounceFn } from "@vueuse/core";
import { VcmpSellerCatalogClient, CreateVideoCommand } from "@vcmp-vendor-portal/api/marketplacevendor";
import { IVideo, Video } from "@vcmp-vendor-portal/api/catalog";
import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  DynamicBladeForm,
  UseDetails,
  useDetailsFactory,
  DetailsBaseBladeScope,
} from "@vc-shell/framework";
import { ref, computed, reactive, onMounted, ComputedRef, Ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useMultilanguage } from "../../../common";

export interface VideoDetailsScope extends DetailsBaseBladeScope {
  createVideo: (command: CreateVideoCommand) => Promise<void>;
  previewDisabled: ComputedRef<boolean>;
  videoDisabled: ComputedRef<boolean>;
  needShowUrl: ComputedRef<boolean>;
  needShowFields: ComputedRef<boolean>;
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    remove: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useVideoDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<IVideo, VideoDetailsScope> => {
  const detailsFactory = useDetailsFactory<IVideo & { videoUrl?: string }>({
    load: async ({ id }) => await (await getApiClient()).getVideoById(id),
    saveChanges: async (videoItem) => {
      await (await getApiClient()).update([videoItem as Video]);
      await markProductDirty();
      return videoItem;
    },
    remove: async ({ id }) => {
      await markProductDirty();
      (await getApiClient()).delete([id]);
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { t } = useI18n({ useScope: "global" });
  const { currentLocale } = useMultilanguage();

  const videoLoading = ref(false);
  const videoLoadedWithoutErrors = ref(true);
  const newVideoLoaded = ref(false);

  const bladeTitle = computed(() =>
    args.props.param ? t("VIDEOS.PAGES.DETAILS.TITLE") : t("VIDEOS.PAGES.DETAILS.TITLE_ADD")
  );

  async function loadWrapper(args: { id: string }) {
    if (args) {
      await load(args);
    }
  }

  async function saveChangesWrapper(video: IVideo) {
    await saveChanges(video);

    if (item.value?.id) {
      await loadWrapper({ id: item.value.id });
    }
  }

  async function createVideo(): Promise<void> {
    const command = new CreateVideoCommand({
      contentUrl: item.value.videoUrl,
      languageCode: currentLocale.value,
      ownerType: "Product",
      ownerId: args.props.options.productId as string,
    });

    const client = await getApiClient();
    try {
      videoLoading.value = true;
      item.value = await client.createVideo(command);
      item.value.uploadDate = new Date();
      videoLoadedWithoutErrors.value = true;
      newVideoLoaded.value = true;
      validationState.value.modified = true;
    } catch (e) {
      console.log(e);
      videoLoadedWithoutErrors.value = false;
      newVideoLoaded.value = false;
    } finally {
      videoLoading.value = false;
      validateUrl();
    }
  }

  const validateUrl = async () => {
    {
      if (!videoLoadedWithoutErrors.value) {
        validationState.value.setFieldError("videoUrl", t(`VIDEOS.PAGES.DETAILS.FIELDS.ADD.ERROR`));
      } else {
        validationState.value.setFieldError("videoUrl", null);
      }
    }
  };

  async function markProductDirty() {
    args.emit("parent:call", {
      method: "markProductDirty",
    });
  }

  const scope = ref<VideoDetailsScope>({
    videoDisabled: computed(() => true),
    previewDisabled: computed(() => validationState.value.disabled),
    needShowUrl: computed(() => !args.props.param),
    needShowFields: computed(() => !!args.props.param || newVideoLoaded.value),
    createVideo,
    toolbarOverrides: {
      saveChanges: {
        isVisible: computed(() => !args.props.param),
        disabled: computed(() => !newVideoLoaded.value),
      },
      remove: {
        isVisible: computed(() => !!args.props.param),
      },
    },
  });

  watch(
    () => args?.mounted.value,
    async () => {
      if (!args.props.param) {
        item.value = reactive(new Video());
      }
      validationState.value.modified = false;
      validationState.value.dirty = false;
    }
  );

  return {
    load: loadWrapper,
    saveChanges: saveChangesWrapper,
    remove,
    scope: computed(() => scope.value),
    item,
    validationState,
    loading: useLoading(loading, videoLoading),
    bladeTitle,
  };
};