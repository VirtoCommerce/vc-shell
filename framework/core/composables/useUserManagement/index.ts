import { computed, ComputedRef } from "vue";
import { createSharedComposable } from "@vueuse/core";
import { _createInternalUserLogic, IUserInternalAPI } from "@core/composables/useUser"; // Import the internal logic
import { SecurityResult, IdentityResult, LoginType, UserDetail, SignInResult } from "@core/api/platform";
import { RequestPasswordResult } from "@core/types";

// Interface for the API exposed by useUserManagement (for framework/admin use)
export interface IUserManagementAPI {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  isAuthenticated: ComputedRef<boolean>;
  // Methods specific to user management
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  getLoginType: () => Promise<LoginType[]>;
  loadUser: () => Promise<UserDetail>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
}

export const useUserManagement = createSharedComposable((): IUserManagementAPI => {
  // Utilize the same internal logic instance
  const internals: IUserInternalAPI = _createInternalUserLogic();

  return {
    user: internals.user,
    loading: internals.loading,
    isAdministrator: internals.isAdministrator,
    isAuthenticated: internals.isAuthenticated,
    validateToken: internals.validateToken,
    validatePassword: internals.validatePassword,
    resetPasswordByToken: internals.resetPasswordByToken,
    getLoginType: internals.getLoginType,
    loadUser: internals.loadUser,
    requestPasswordReset: internals.requestPasswordReset,
    changeUserPassword: internals.changeUserPassword,
    signIn: internals.signIn,
    signOut: internals.signOut,
  };
});
