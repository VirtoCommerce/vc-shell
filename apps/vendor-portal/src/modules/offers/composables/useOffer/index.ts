import { computed, reactive, Ref, ref, unref, defineEmits } from "vue";
import { useLogger, useUser, useI18n } from "@virtoshell/core";

import {
  CreateNewOfferCommand,
  UpdateOfferCommand,
  IOffer,
  IOfferDetails,
  IOfferProduct,
  OfferDetails,
  SearchOfferProductsResult,
  SearchProductsForNewOfferQuery,
  VcmpSellerCatalogClient,
  Property,
  PropertyValue,
  Image,
  IImage,
} from "../../../../api_client/marketplacevendor";
import { StoreModuleClient } from "../../../../api_client/store";
import { AssetsDetails } from "@virtoshell/mod-assets";

export type TextOfferDetails = IOfferDetails & {
  product?: IOfferProduct;
  salePrice?: number;
  listPrice?: number;
  minQuantity?: number;
  id?: string;
  properties?: Property[];
};

interface IUseOffer {
  offer: Ref<IOffer>;
  currencyList: Ref<string[]>;
  loading: Ref<boolean>;
  offerDetails: TextOfferDetails;
  loadOffer: (args: { id: string }) => void;
  fetchProducts: (
    keyword?: string,
    skip?: number,
    ids?: string[]
  ) => Promise<SearchOfferProductsResult>;
  createOffer: (details: TextOfferDetails) => void;
  updateOffer: (details: TextOfferDetails) => void;
  deleteOffer: (args: { id: string }) => void;
  getCurrencies: () => void;
  imageUploading: Ref<boolean>;
  onGalleryUpload: (files: FileList) => void;
  onGalleryItemEdit: (item: Image) => void;
  onGallerySort: (images: Image[]) => void;
  onGalleryImageRemove: (image: Image) => void;
}

interface IStoreSettings {
  availCurencies: string[];
  masterCatalogId: string;
  vendorPortalUrl: string;
  storeId: string;
}

export default (): IUseOffer => {
  const { user, getAccessToken } = useUser();
  const logger = useLogger();
  const offer = ref<IOffer>({});
  const offerDetails = reactive<TextOfferDetails>(new OfferDetails());
  const storeSettings = ref<IStoreSettings>();
  const currencyList = ref([]);
  const imageUploading = ref(false);
  const emit = defineEmits(["page:open"]);
  const { t } = useI18n();

  const loading = ref(false);

  //TODO: move to utils
  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }
  async function fetchProducts(
    keyword?: string,
    skip = 0,
    ids?: string[]
  ): Promise<SearchOfferProductsResult> {
    const client = await getApiClient();
    return await client.searchOfferProducts({
      objectIds: ids,
      keyword,
      skip,
      take: 20,
    } as SearchProductsForNewOfferQuery);
  }

  async function createOffer(details: TextOfferDetails) {
    logger.info(`create new  offer`, details);

    const client = await getApiClient();
    const command = new CreateNewOfferCommand({
      sellerName: user.value.userName,
      productId: details.productId,
      details: new OfferDetails({
        ...details,
        properties: details.properties.map(
          (x) =>
            new Property({
              ...x,
              values: x.values.map((v) => new PropertyValue(v)),
            })
        ),
      }),
    });

    try {
      loading.value = true;
      offer.value = await client.createNewOffer(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateOffer(details: TextOfferDetails) {
    logger.info(`update offer`, details);

    const client = await getApiClient();
    const command = new UpdateOfferCommand({
      sellerName: user.value.userName,
      offerId: (details as IOffer).id,
      offerDetails: new OfferDetails(details),
    });

    try {
      loading.value = true;
      offer.value = await client.updateOffer(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadOffer(args: { id: string }) {
    logger.info(`Load offer ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      offer.value = (await client.getOfferByIdGET(args.id)) as IOffer;

      Object.assign(offerDetails, offer.value);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOffer(args: { id: string }) {
    logger.info(`Delete offer ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteOffers([args.id]);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getCurrencies() {
    const token = await getAccessToken();
    const client = new StoreModuleClient();
    client.setAuthToken(await getAccessToken());

    if (token) {
      try {
        const result = await fetch("/api/vcmp/settings", {
          method: "GET",
          headers: {},
        });

        await result.text().then((response) => {
          storeSettings.value = JSON.parse(response);
        });

        currencyList.value = storeSettings.value.availCurencies?.map(
          (currency) => ({
            title: currency,
            value: currency,
          })
        );
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }
  }

  const onGalleryUpload = async (files: FileList) => {
    try {
      imageUploading.value = true;
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const authToken = await getAccessToken();
        const result = await fetch(
          `/api/assets?folderUrl=/offers/${offerDetails.id}`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const response = await result.json();
        if (response?.length) {
          const image = new Image(response[0]);
          image.createdDate = new Date();
          if (offerDetails.images && offerDetails.images.length) {
            const lastImageSortOrder =
              offerDetails.images[offerDetails.images.length - 1].sortOrder;
            image.sortOrder = lastImageSortOrder + 1;
          } else {
            image.sortOrder = 0;
          }
          offerDetails.images.push(image);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      imageUploading.value = false;
    }

    files = null;
  };

  const onGalleryItemEdit = (item: Image) => {
    emit("page:open", {
      component: AssetsDetails,
      componentOptions: {
        editableAsset: item,
        images: offerDetails.images,
        sortHandler: sortImage,
      },
    });
  };

  function sortImage(remove = false, localImage: IImage) {
    const images = offerDetails.images;
    const image = new Image(localImage);
    if (images.length) {
      const imageIndex = images.findIndex((img) => img.id === localImage.id);

      remove ? images.splice(imageIndex, 1) : (images[imageIndex] = image);

      editImages(images);
    }
  }

  const editImages = (args: Image[]) => {
    offerDetails.images = args;
  };

  const onGallerySort = (images: Image[]) => {
    offerDetails.images = images;
  };

  const onGalleryImageRemove = (image: Image) => {
    if (
      window.confirm(
        unref(
          computed(() => t("OFFERS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION"))
        )
      )
    ) {
      const imageIndex = offerDetails.images.findIndex((img) => {
        if (img.id && image.id) {
          return img.id === image.id;
        } else {
          return img.url === image.url;
        }
      });
      offerDetails.images.splice(imageIndex, 1);
    }
  };

  return {
    offer: computed(() => offer.value),
    currencyList: computed(() => currencyList.value),
    loading: computed(() => loading.value),
    offerDetails,
    loadOffer,
    createOffer,
    updateOffer,
    fetchProducts,
    deleteOffer,
    getCurrencies,
    imageUploading,
    onGalleryUpload,
    onGalleryItemEdit,
    onGallerySort,
    onGalleryImageRemove,
  };
};
