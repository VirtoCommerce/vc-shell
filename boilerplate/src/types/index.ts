import { Component, ComponentPublicInstance, ComputedRef } from "vue";
import { PushNotification } from "@vc-shell/framework";

enum UserPermissions {
  SellerUsersManage = "seller:users:manage",
  SellerDetailsEdit = "seller:details:edit",
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
  variant: string;
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

export type {
  IShippingInfo,
  INotificationActions,
  IProductPushNotification,
  INewOrderPushNotification,
};

export { UserPermissions };
