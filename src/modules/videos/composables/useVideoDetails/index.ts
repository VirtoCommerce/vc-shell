import { reactify, useArrayFind, useDebounceFn } from "@vueuse/core";
import {
  CategorySearchResult,
  CreateNewProductCommand,
  ProductDetails,
  SearchCategoriesQuery,
  ISellerProduct,
  UpdateProductDetailsCommand,
  VcmpSellerCatalogClient,
  IProductDetails,
  EditorialReview,
  CreateNewPublicationRequestCommand,
  SellerProduct,
  Category,
  Property,
  PropertyValue,
  Image,
  ValidateProductQuery,
  ValidationFailure,
  ISearchVideosQuery,
  SearchVideosQuery,
  CreateVideoCommand,
} from "vcmp-vendor-portal-api/marketplacevendor";
import { IVideo, Video, VideoSearchResult } from "vcmp-vendor-portal-api/catalog";
import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  DynamicBladeForm,
  UseDetails,
  useDetailsFactory,
  DetailsBaseBladeScope,
  IValidationRules,
} from "@vc-shell/framework";
import { ref, computed, reactive, onMounted, ComputedRef, Ref, isRef } from "vue";
import { useI18n } from "vue-i18n";
import { useDynamicProperties, useMultilanguage, useAssets } from "../../../common";
import * as _ from "lodash-es";
import { useMarketplaceSettings } from "../../../settings";

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
      return videoItem;
    },
    remove: async ({ id }) => (await getApiClient()).deleteProducts([id]),
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { defaultProductType, productTypes, loadSettings } = useMarketplaceSettings();

  const { t } = useI18n({ useScope: "global" });

  const currentCategory = ref<Category>();

  const { currentLocale, languages, getLanguages, loading: languagesLoading } = useMultilanguage();

  const videoLoading = ref(false);
  const videoLoadedWithoutErrors = ref(true);
  const newVideoLoaded = ref(false);
  const video = ref<IVideo>();
  let videoDetailsCopy: IVideo;

  const bladeTitle = computed(() => (args.props.param ? item.value?.name : t("VIDEOS.PAGES.DETAILS.TITLE_ADD")));

  async function loadWrapper(args: { id: string }) {
    console.log("load started");
    if (args) {
      console.log("args here! " + args);

      await load(args);
    }
    console.log("load ended");
  }

  async function saveChangesWrapper(details: IProductDetails, sendToApprove = false) {
    await saveChanges({ ...details, id: item.value?.id });

    if (sendToApprove) {
      const newRequestCommand = new CreateNewPublicationRequestCommand({
        productId: item.value?.id,
      });
      await (await getApiClient()).createNewPublicationRequest(newRequestCommand);
    }

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
      console.log(isRef(item));
      item.value.uploadDate = new Date();
      videoLoadedWithoutErrors.value = true;
      //await nextTick();
      newVideoLoaded.value = true;
      videoDetailsCopy = _.cloneDeep(item.value);
    } catch (e) {
      videoLoadedWithoutErrors.value = false;
      newVideoLoaded.value = false;
      //console.error(e);
    } finally {
      videoLoading.value = false;
    }
    //item.value = video.value;
  }

  const validateUrl = useDebounceFn(async (value: string, property, context) => {
    {
      if (!videoLoadedWithoutErrors.value) {
        validationState.value.setFieldError(property, t(`VIDEOS.PAGES.DETAILS.FIELDS.ADD.ERROR`));
      } else {
        validationState.value.setFieldError(property, null);
      }
    }

    // const sellerProduct = {
    //   ...item.value,
    //   gtin: value,
    // } as ISellerProduct;
    // const productErrors = await validateProduct(sellerProduct);
    // const errors = productErrors?.filter((error) => error.propertyName.toLowerCase() === "gtin");
    // validationState.value.setFieldError(
    //   property,
    //   errors
    //     .map((error) =>
    //       t(`VIDEOS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
    //         value: error?.attemptedValue,
    //       })
    //     )
    //     .join("\n")
    // );
  }, 1000);

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

    // if (!args.props.param) {
    //   item.value = reactive(new SellerProduct());
    //   item.value = Object.assign(item.value, { descriptions: [] });
    //   item.value.descriptions = item.value.descriptions.concat(
    //     languages.value.map(
    //       (x) =>
    //         new EditorialReview({
    //           languageCode: x,
    //           content: "",
    //           reviewType: "QuickReview",
    //         })
    //     )
    //   );
    //   item.value.productData = new ProductDetails({ productType: defaultProductType.value });
    // }
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
