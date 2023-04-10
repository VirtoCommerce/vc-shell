import { ComputedRef } from "vue";
import { PushNotification } from "@vc-shell/framework";

enum UserPermissions {
  SellerUsersManage = "seller:users:manage",
  SellerDetailsEdit = "seller:details:edit",
  SellerProductsSearchFromAllSellers = "seller:products:search_from_all_sellers",
  ManageSellerFulfillmentCenters = "seller:fulfillment_centers:manage",
  ManageSellerReviews = "seller:reviews:manage",
  SellerImportProfilesEdit = "seller:import_profiles:edit",
}

interface IShippingInfo {
  label: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface INotificationActions {
  name: string | ComputedRef<string>;
  clickHandler(): void;
  outline: boolean;
  variant: "primary" | "secondary" | "special" | "danger" | "widget" | "onlytext" | undefined;
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

interface IProductPushNotification extends PushNotification {
  profileName?: string;
  newStatus?: string;
  productId?: string;
  productName?: string;
}

interface INewOrderPushNotification extends PushNotification {
  orderId?: string;
}

export type { IShippingInfo, INotificationActions, IProductPushNotification, INewOrderPushNotification };

export { UserPermissions };
