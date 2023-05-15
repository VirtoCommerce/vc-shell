import { ComputedRef } from "vue";

enum UserPermissions {
  SellerUsersManage = "seller:users:manage",
  SellerDetailsEdit = "seller:details:edit",
  SellerProductsSearchFromAllSellers = "seller:products:search_from_all_sellers",
  ManageSellerFulfillmentCenters = "seller:fulfillment_centers:manage",
  ManageSellerReviews = "seller:reviews:manage",
  SellerImportProfilesEdit = "seller:import_profiles:edit",
}

interface INotificationActions {
  name: string | ComputedRef<string>;
  clickHandler(): void;
  outline: boolean;
  variant: "primary" | "secondary" | "special" | "danger" | "widget" | "onlytext" | undefined;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export { UserPermissions };
export type { INotificationActions };
