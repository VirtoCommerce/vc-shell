import { CommonPageComposables } from "./../../typings";

// Declare globally
declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    CommonPageComposables: CommonPageComposables;
  }
}

export * from "./InvitePage";
export * from "./LoginPage";
export * from "./ResetPasswordPage";
