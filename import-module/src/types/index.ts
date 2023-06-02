import { ComputedRef } from "vue";
import { VcButton } from "@vc-shell/framework";

enum UserPermissions {
  SellerImportProfilesEdit = "seller:import_profiles:edit",
}

interface INotificationActions {
  name: string | ComputedRef<string>;
  clickHandler(): void;
  outline: boolean;
  variant?: InstanceType<typeof VcButton>["$props"]["variant"];
  isVisible?: boolean | ComputedRef<boolean>;
  disabled?: boolean | ComputedRef<boolean>;
}

export { UserPermissions };
export type { INotificationActions };
