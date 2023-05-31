import { ComputedRef } from "vue";

enum UserPermissions {
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
