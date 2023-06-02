import _UserDropdownButton from "./user-dropdown-button.vue";

export const UserDropdownButton = _UserDropdownButton as typeof _UserDropdownButton;

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    UserDropdownButton: typeof UserDropdownButton;
  }
}
