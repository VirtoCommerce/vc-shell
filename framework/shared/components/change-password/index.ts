import _ChangePassword from "./change-password.vue";

export const ChangePassword = _ChangePassword as typeof _ChangePassword;

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    ChangePassword: typeof ChangePassword;
  }
}
