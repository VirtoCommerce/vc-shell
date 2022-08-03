import { useLogger, useUser } from "@virtoshell/core";
import { computed, Ref, ref, watch } from "vue";
import {
  CustomerAddress,
  ISeller,
  ISellerDetails,
  SellerDetails,
  UpdateSellerCommand,
  VcmpSellerSecurityClient,
} from "../../../../api_client/marketplacevendor";
import { cloneDeep as _cloneDeep } from "lodash-es";

interface ILocation {
  id: string;
  name: string;
}

interface IUseSellerDetails {
  readonly countriesList: Ref<ILocation[]>;
  readonly regionsList: Ref<ILocation[]>;
  readonly modified: Ref<boolean>;
  readonly loading: Ref<boolean>;
  sellerDetails: Ref<ISeller>;
  getCurrentSeller: () => void;
  updateSeller: (seller: ISeller) => void;
  getCountries: () => void;
  setCountry: (country: string) => void;
  resetEntries: () => void;
  getRegions: (countryId: string) => void;
  setRegion: (regionId: string) => void;
}

export default (): IUseSellerDetails => {
  const logger = useLogger();
  const { getAccessToken } = useUser();
  const sellerDetails = ref(
    new SellerDetails({
      name: undefined,
      phones: [],
      emails: [],
      addresses: [new CustomerAddress()],
    })
  );
  let sellerDetailsCopy: ISellerDetails;
  const countriesList = ref<ILocation[]>([]);
  const regionsList = ref<ILocation[]>([]);
  const modified = ref(false);
  const loading = ref(false);

  watch(
    () => sellerDetails,
    (state) => {
      modified.value =
        JSON.stringify(sellerDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const client = new VcmpSellerSecurityClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getCurrentSeller() {
    const client = await getApiClient();

    try {
      loading.value = true;
      const seller = (await client.getCurrentSeller()) as SellerDetails;
      sellerDetails.value = new SellerDetails({
        ...seller,
        phones: [],
        emails: [],
        addresses: [
          new CustomerAddress(
            seller.addresses && seller.addresses.length && seller.addresses[0]
          ),
        ],
      });
      sellerDetailsCopy = _cloneDeep(sellerDetails.value);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function updateSeller(seller: ISeller) {
    const client = await getApiClient();

    const command = new UpdateSellerCommand({
      sellerId: seller.id,
      sellerDetails: new SellerDetails({
        ...(seller as ISellerDetails),
        addresses: seller.addresses.map(
          (address) => new CustomerAddress(address)
        ),
      }),
      commissionFeeId: seller.commissionFee.id,
    });

    try {
      loading.value = true;
      modified.value = false;
      await client.updateSeller(command);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getCountries() {
    const token = await getAccessToken();
    if (token) {
      try {
        const result = await fetch("/api/platform/common/countries", {
          method: "GET",
          headers: {
            "Content-Type": "application/json-patch+json",
            Accept: "application/json",
            authorization: `Bearer ${token}`,
          },
        });

        result.text().then((response) => {
          countriesList.value = JSON.parse(response);
        });
      } catch (e) {
        logger.error(e);
      }
    }
  }

  async function getRegions(countryId: string) {
    const token = await getAccessToken();
    if (token) {
      try {
        const result = await fetch(
          `api/platform/common/countries/${countryId}/regions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json-patch+json",
              Accept: "application/json",
              authorization: `Bearer ${token}`,
            },
          }
        );

        result.text().then((response) => {
          regionsList.value = JSON.parse(response);
        });
      } catch (e) {
        logger.error(e);
      }
    }
  }

  function setCountry(countryId: string) {
    const countryInfo = countriesList.value.find((x) => x.id === countryId);
    sellerDetails.value.addresses[0].countryCode = countryInfo.id;
    sellerDetails.value.addresses[0].countryName = countryInfo.name;
  }

  function setRegion(regionId: string) {
    const regionInfo = regionsList.value.find((x) => x.id === regionId);
    sellerDetails.value.addresses[0].regionId = regionInfo.id;
    sellerDetails.value.addresses[0].regionName = regionInfo.name;
  }

  async function resetEntries() {
    sellerDetails.value = Object.assign(
      {},
      new SellerDetails(sellerDetailsCopy)
    );
  }

  return {
    countriesList: computed(() => countriesList.value),
    regionsList: computed(() => regionsList.value),
    modified: computed(() => modified.value),
    loading: computed(() => loading.value),
    sellerDetails,
    getCurrentSeller,
    updateSeller,
    getCountries,
    getRegions,
    setCountry,
    setRegion,
    resetEntries,
  };
};
