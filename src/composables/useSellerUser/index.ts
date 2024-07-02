import { VcmpSellerSecurityClient, SellerUser } from "@vcmp-vendor-portal/api/marketplacevendor";

interface IUseSellerUser {
  getCurrentUser: () => Promise<SellerUser>;
}

export default (): IUseSellerUser => {
  async function getApiClient(): Promise<VcmpSellerSecurityClient> {
    const client = new VcmpSellerSecurityClient();
    return client;
  }

  async function getCurrentUser() {
    return await (await getApiClient()).getCurrentSellerUser();
  }

  return {
    getCurrentUser,
  };
};
