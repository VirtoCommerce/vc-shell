import { computed, reactive, Ref, ref } from "vue";
import { useLogger, useUser } from "@virtoshell/core";

import {
  CreateNewOfferCommand,
  IOffer,
  IOfferDetails,
  IOfferProduct,
  OfferDetails,
  SearchOfferProductsResult,
  SearchProductsForNewOfferQuery,
  VcmpSellerCatalogClient,
} from "../../../../api_client/marketplacevendor";
import { StoreModuleClient } from "../../../../api_client/store";

export type TExtOfferDetails = IOfferDetails & {
  product?: IOfferProduct;
  salePrice?: number;
  listPrice?: number;
  minQuantity?: number;
};

interface IUseOffer {
  offer: Ref<IOffer>;
  currencyList: Ref<string[]>;
  loading: Ref<boolean>;
  offerDetails: TExtOfferDetails;
  loadOffer: (args: { id: string }) => void;
  selectOfferProduct: (args: { id: string }) => void;
  fetchProducts: (
    keyword?: string,
    skip?: number,
    ids?: string[]
  ) => Promise<SearchOfferProductsResult>;
  createOffer: (details: TExtOfferDetails) => void;
  deleteOffer: (args: { id: string }) => void;
  getCurrencies: () => void;
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
  const offerDetails = reactive<TExtOfferDetails>(new OfferDetails());
  const storeSettings = ref<IStoreSettings>();
  const currencyList = ref([]);

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

  async function createOffer(details: TExtOfferDetails) {
    logger.info(`create new  offer`, details);

    const client = await getApiClient();
    const command = new CreateNewOfferCommand({
      sellerName: user.value.userName,
      productId: details.productId,
      details: new OfferDetails(details),
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

  async function selectOfferProduct(args: { id: string }) {
    logger.info(`selectOfferProduct  ${args}`);
    offerDetails.product = await getOfferProductById({
      id: args.id,
    });
    if (offerDetails.product) {
      offerDetails.productId = args.id;
    }
  }
  async function getOfferProductById(args: {
    id: string;
  }): Promise<IOfferProduct> {
    const client = await getApiClient();
    const result = await client.searchOfferProducts({
      objectIds: [args.id],
      take: 1,
    } as SearchProductsForNewOfferQuery);
    return result.results[0];
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

  return {
    offer: computed(() => offer.value),
    currencyList: computed(() => currencyList.value),
    loading: computed(() => loading.value),
    offerDetails,
    loadOffer,
    selectOfferProduct,
    createOffer,
    fetchProducts,
    deleteOffer,
    getCurrencies,
  };
};
