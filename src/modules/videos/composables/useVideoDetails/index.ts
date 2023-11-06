import { useDebounceFn } from "@vueuse/core";
import { VcmpSellerCatalogClient, CreateVideoCommand } from "vcmp-vendor-portal-api/marketplacevendor";
import { IVideo, Video } from "vcmp-vendor-portal-api/catalog";
import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  DynamicBladeForm,
  UseDetails,
  useDetailsFactory,
  DetailsBaseBladeScope,
} from "@vc-shell/framework";
import { ref, computed, reactive, onMounted, ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import { useMultilanguage } from "../../../common";

export interface VideoDetailsScope extends DetailsBaseBladeScope {
  createVideo: (command: CreateVideoCommand) => Promise<void>;
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
}): UseDetails<IVideo, VideoDetailsScope> => {
  const detailsFactory = useDetailsFactory<IVideo>({
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
    const command = new CreateVideoCommand();
    command.contentUrl = item.value.videoUrl;
    command.languageCode = currentLocale.value;
    command.ownerType = "Product";
    command.ownerId = args.props.options.productId;
    const client = await getApiClient();
    try {
      videoLoading.value = true;
      item.value = await client.createVideo(command);
      item.value.uploadDate = new Date();
      videoLoadedWithoutErrors.value = true;
      newVideoLoaded.value = true;
      validationState.value.modified = true;
    } catch (e) {
      videoLoadedWithoutErrors.value = false;
      newVideoLoaded.value = false;
    } finally {
      videoLoading.value = false;
    }
  }

  const validateUrl = useDebounceFn(async (value: string, property, context) => {
    {
      if (!videoLoadedWithoutErrors.value) {
        validationState.value.setFieldError(property, t(`VIDEOS.PAGES.DETAILS.FIELDS.ADD.ERROR`));
      } else {
        validationState.value.setFieldError(property, null);
      }
    }
  }, 1000);

  async function markProductDirty() {
    args.emit("parent:call", {
      method: "markProductDirty",
    });
  }

  const scope = ref<VideoDetailsScope>({
    videoDisabled: computed(() => true),
    needShowUrl: computed(() => !args.props.param),
    needShowFields: computed(() => !!args.props.param || newVideoLoaded.value),
    createVideo,
    validateUrl,
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

  onMounted(async () => {
    if (!args.props.param) {
      item.value = reactive(new Video());
    }
    validationState.value.modified = false;
    validationState.value.dirty = false;
  });

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
