import { Ref, ref, computed, watch, reactive } from "vue";
import { useLogger, useUser } from "@virtoshell/core";

import {
  VcmpSellerCatalogClient,
  IOffer,
  Offer,
  IOfferDetails,
  IOfferProduct,
  OfferDetails,
  CreateNewOfferCommand,
  SearchProductsForNewOfferQuery,
} from "../../../../api_client";
import offers from "../..";

export type TExtOffer = IOffer & { product?: IOfferProduct };

interface IUseOffer {
  offer: Ref<TExtOffer>;
  loading: Ref<boolean>;
  offerDetails: IOfferDetails;
  loadOffer: (args: { id: string }) => void;
  fetchProducts: (keyword?: string, skip?: number) => Promise<IOfferProduct[]>;
  createOffer: (details: IOfferDetails) => void;
  deleteOffer: (args: { id: string }) => void;
}

export default (): IUseOffer => {
  const { user } = useUser();
  const logger = useLogger();
  const offer = ref<TExtOffer>({});
  const offerDetails = reactive<IOfferDetails>(new OfferDetails());

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
    skip = 0
  ): Promise<IOfferProduct[]> {
    const client = await getApiClient();
    const result = await client.searchOfferProducts({
      keyword,
      skip,
      take: 20,
    } as SearchProductsForNewOfferQuery);
    return result.results;
  }

  async function createOffer(details: IOfferDetails) {
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

  async function loadOffer(args: { id: string }) {
    logger.info(`Load offer ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      offer.value = (await client.getOfferById(args.id)) as TExtOffer;
      if (offer.value) {
        const result = await client.searchOfferProducts({
          objectIds: [offer.value.productId],
          take: 1,
        } as SearchProductsForNewOfferQuery);
        offer.value.product = result.results[0];
      }
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

  return {
    offer: computed(() => offer.value),
    offerDetails,
    loading: computed(() => loading.value),
    loadOffer,
    createOffer,
    fetchProducts,
    deleteOffer,
  };
};
