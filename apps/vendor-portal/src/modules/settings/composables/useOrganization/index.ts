import { useLogger, useUser } from "@virtoshell/core";
import { computed, Ref, ref, watch } from "vue";
import {
  CustomerAddress,
  ISeller,
  ISellerDetails,
  SellerDetails,
  UpdateSellerCommand,
  VcmpSellerSecurityClient,
} from "../../../../api_client";
import { cloneDeep as _cloneDeep } from "lodash-es";

interface ICountry {
  id: string;
  name: string;
}

interface IUseOrganization {
  readonly countriesList: Ref<ICountry[]>;
  readonly modified: Ref<boolean>;
  readonly loading: Ref<boolean>;
  sellerDetails: Ref<ISeller>;
  getCurrentSeller: () => void;
  updateSeller: (seller: ISeller) => void;
  getCountries: () => void;
  setCountry: (country: ICountry) => void;
  resetEntries: () => void;
}

export default (): IUseOrganization => {
  const loading = ref(false);
  const logger = useLogger();
  const sellerDetails = ref(
    new SellerDetails({
      name: undefined,
      phones: [undefined],
      emails: [undefined],
      addresses: [new CustomerAddress()],
    })
  );
  let sellerDetailsCopy: ISellerDetails;
  const countriesList = ref([]);
  const modified = ref(false);

  watch(
    () => sellerDetails,
    (state) => {
      modified.value =
        JSON.stringify(sellerDetailsCopy) !== JSON.stringify(state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
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
        phones: [undefined],
        emails: [undefined],
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
      await client.updateSeller(command);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function getCountries() {
    const { getAccessToken } = useUser();

    const token = await getAccessToken();
    if (token) {
      // TODO temporary workaround to get push notifications without base type
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

  function setCountry(country: ICountry) {
    const countryInfo = countriesList.value.find((x) => x.id === country);
    const test = new CustomerAddress({
      countryCode: countryInfo.id,
      countryName: countryInfo.name,
    });

    sellerDetails.value.addresses = [test];

    console.log(test);
  }

  async function resetEntries() {
    sellerDetails.value = Object.assign(
      {},
      new SellerDetails(sellerDetailsCopy)
    );
  }

  return {
    countriesList: computed(() => countriesList.value),
    modified: computed(() => modified.value),
    loading: computed(() => loading.value),
    sellerDetails,
    getCurrentSeller,
    updateSeller,
    getCountries,
    setCountry,
    resetEntries,
  };
};
