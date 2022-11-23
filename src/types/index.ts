import { Component, ComponentPublicInstance, ComputedRef } from "vue";
import { PushNotification } from "@vc-shell/framework";

enum UserPermissions {
  SellerUsersManage = "seller:users:manage",
  SellerDetailsEdit = "seller:details:edit",
}

interface IComponent extends ComponentPublicInstance {
  openDashboard(): void;
}

type BladeComponent = Component & {
  url?: string;
  permissions?: string | string[];
};

interface IBladeToolbar {
  id?: string;
  icon?: string;
  title?: string | ComputedRef<string>;
  isVisible?: boolean | unknown;
  isAccent?: boolean | ComputedRef<boolean>;
  component?: BladeComponent;
  bladeOptions?: Record<string, unknown> | unknown;
  disabled?: boolean | ComputedRef<boolean>;
  clickHandler?(): void;
}

interface IMenuItems extends IBladeToolbar {
  clickHandler?(app?: IComponent): void;
  children?: IMenuItems[];
}

interface ITableColumns {
  id: string;
  title: string | ComputedRef<string>;
  width?: number;
  field?: string;
  alwaysVisible?: boolean;
  type?: string;
  sortable?: boolean;
  sortDirection?: number;
  class?: string;
  format?: string;
  align?: string;
}

interface IActionBuilderResult {
  icon: string;
  title: string;
  variant: string;
  leftActions?: boolean;
  clickHandler(): void;
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
  IComponent,
  ITableColumns,
  IActionBuilderResult,
  IBladeToolbar,
  IMenuItems,
  IShippingInfo,
  INotificationActions,
  IProductPushNotification,
  INewOrderPushNotification,
};

export { UserPermissions };
