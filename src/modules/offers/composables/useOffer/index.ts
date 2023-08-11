import { computed, Ref, ref, unref, watch } from "vue";
import { useAssets, useUser } from "@vc-shell/framework";

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
  PropertyDictionaryItem,
  OfferPrice,
  InventoryInfo,
} from "../../../../api_client/marketplacevendor";
import * as _ from "lodash-es";
import { useProduct } from "../../../../modules/products";
import { useFulfillmentCenters } from "../../../settings";

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
  loading: Ref<boolean>;
  modified: Ref<boolean>;
  offerDetails: Ref<TextOfferDetails>;
  loadOffer: (args: { id: string }) => void;
  fetchProducts: (keyword?: string, skip?: number, ids?: string[]) => Promise<SearchOfferProductsResult>;
  createOffer: (details: TextOfferDetails) => void;
  updateOffer: (details: TextOfferDetails) => void;
  deleteOffer: (args: { id: string }) => void;
  makeCopy: () => void;
  searchDictionaryItems: (propertyIds: string[], keyword?: string, skip?: number) => Promise<PropertyDictionaryItem[]>;
  addPrice: () => void;
  removePrice: (idx: number) => void;
  trackInventory: () => void;
  onMountedHook: () => void;
}

export default (): IUseOffer => {
  const { user } = useUser();
  const { searchDictionaryItems } = useProduct();
  const { fulfillmentCentersList, searchFulfillmentCenters } = useFulfillmentCenters();
  const offer = ref<IOffer>({});
  const offerDetails = ref<TextOfferDetails>({} as TextOfferDetails);
  const offerDetailsCopy: Ref<TextOfferDetails> = ref();
  const modified = ref(false);

  const loading = ref(false);

  watch(
    [() => offerDetails, () => offerDetailsCopy],
    ([state, stateCopy]) => {
      modified.value = !_.isEqual(stateCopy.value, state.value);
    },
    { deep: true }
  );

  //TODO: move to utils
  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }
  async function fetchProducts(keyword?: string, skip = 0, ids?: string[]): Promise<SearchOfferProductsResult> {
    const client = await getApiClient();
    return await client.searchOfferProducts({
      objectIds: ids,
      keyword,
      skip,
      take: 20,
    } as SearchProductsForNewOfferQuery);
  }

  async function createOffer(details: TextOfferDetails) {
    console.info(`create new  offer`, details);

    const client = await getApiClient();
    const command = new CreateNewOfferCommand({
      sellerName: user.value.userName,
      productId: details.productId,
      details: new OfferDetails({
        ...details,
        properties: details.properties?.map(
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
      modified.value = false;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateOffer(details: TextOfferDetails) {
    console.info(`update offer`, details);

    const client = await getApiClient();
    const command = new UpdateOfferCommand({
      sellerName: user.value.userName,
      offerId: (details as IOffer).id,
      offerDetails: new OfferDetails(details),
    });

    try {
      loading.value = true;
      offer.value = await client.updateOffer(command);
      modified.value = false;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadOffer(args: { id: string }) {
    console.info(`Load offer ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      offer.value = (await client.getOfferByIdGET(args.id)) as IOffer;

      offerDetails.value = offer.value as IOfferDetails;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }

    makeCopy();
  }

  function makeCopy() {
    offerDetailsCopy.value = _.cloneDeep(offerDetails.value);
  }

  async function deleteOffer(args: { id: string }) {
    console.info(`Delete offer ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteOffers([args.id]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function addPrice() {
    if (!offerDetails.value.prices) {
      offerDetails.value.prices = [];
    }
    offerDetails.value.prices.push(
      new OfferPrice({
        currency: "USD",
        listPrice: null,
        minQuantity: null,
      })
    );
  }

  function removePrice(idx: number) {
    if (offerDetails.value.prices && offerDetails.value.prices.length > 1) offerDetails.value.prices.splice(idx, 1);
  }

  function trackInventory() {
    return !offerDetails.value.trackInventory;
  }

  async function addEmptyInventory() {
    offerDetails.value.inventory = [];
    await searchFulfillmentCenters({});
    fulfillmentCentersList.value.forEach((x) => {
      const inventoryInfo = new InventoryInfo();
      inventoryInfo.id = x.name;
      inventoryInfo.fulfillmentCenter = x;
      inventoryInfo.fulfillmentCenterId = x.id;
      inventoryInfo.fulfillmentCenterName = x.name;
      inventoryInfo.inStockQuantity = 0;
      inventoryInfo.createdDate = new Date();
      offerDetails.value.inventory.push(inventoryInfo);
    });
  }

  function generateSku(): string {
    // XXX(letter)-XXXXXXXX(number).
    const letterPart = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digitPart = "1234567890";
    let result = "";
    for (let i = 0; i < 3; i++) {
      result += letterPart[Math.floor(Math.random() * letterPart.length)];
    }
    result += "-";
    for (let i = 0; i < 8; i++) {
      result += digitPart[Math.floor(Math.random() * digitPart.length)];
    }
    return result;
  }

  async function onMountedHook() {
    offerDetails.value.trackInventory = true;
    await addEmptyInventory();
    addPrice();
    makeCopy();
    offerDetails.value.sku = generateSku();
  }

  return {
    offer: computed(() => offer.value),
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    offerDetails,
    loadOffer,
    createOffer,
    updateOffer,
    fetchProducts,
    deleteOffer,
    makeCopy,
    searchDictionaryItems,
    addPrice,
    removePrice,
    trackInventory,
    onMountedHook,
  };
};
