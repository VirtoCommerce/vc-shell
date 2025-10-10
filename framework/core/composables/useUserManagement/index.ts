import { inject, ComputedRef, getCurrentInstance } from "vue";
import { createSharedComposable } from "@vueuse/core";
import {
  SecurityResult,
  IdentityResult,
  LoginType,
  UserDetail,
  SignInResult,
  IUserDetail,
  IIdentityResult,
  ISecurityResult,
  ILoginType,
} from "./../../api/platform";
import { RequestPasswordResult, IAuthProvider } from "./../../types";
import { AuthProviderKey } from "../../../injection-keys";
import { authProviderManager } from "../../providers/auth-provider-manager";

// Interface for the API exposed by useUserManagement (for framework/admin use)
export interface IUserManagementAPI {
  user: ComputedRef<IUserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  isAuthenticated: ComputedRef<boolean>;
  // Methods specific to user management
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IIdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<ISecurityResult>;
  getLoginType: () => Promise<ILoginType[]>;
  loadUser: () => Promise<IUserDetail>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<ISecurityResult | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
}

/**
 * Get auth provider with fallback to global instance
 * This allows composables to work before Vue app context is available
 * Priority: Vue DI > Global Manager (always has default PlatformAuthProvider)
 */
function getAuthProvider(): IAuthProvider {
  // Try to get from Vue DI first (preferred method for components)
  const instance = getCurrentInstance();
  if (instance) {
    const injectedProvider = inject(AuthProviderKey, null);
    if (injectedProvider) {
      return injectedProvider;
    }
  }

  // Fallback to global provider (always available with default PlatformAuthProvider)
  return authProviderManager.getProvider();
}

export const useUserManagement = createSharedComposable((): IUserManagementAPI => {
  // Get provider dynamically on each access to ensure correct provider is used
  // This is important because custom auth providers may be set after composable creation

  return {
    // Computed properties should get provider dynamically
    get user() {
      return getAuthProvider().user;
    },
    get loading() {
      return getAuthProvider().loading;
    },
    get isAdministrator() {
      return getAuthProvider().isAdministrator;
    },
    get isAuthenticated() {
      return getAuthProvider().isAuthenticated;
    },
    // Methods get provider dynamically on each call
    validateToken: (userId: string, token: string) => getAuthProvider().validateToken(userId, token),
    validatePassword: (password: string) => getAuthProvider().validatePassword(password),
    resetPasswordByToken: (userId: string, password: string, token: string) =>
      getAuthProvider().resetPasswordByToken(userId, password, token),
    getLoginType: () => getAuthProvider().getLoginType(),
    loadUser: () => getAuthProvider().loadUser(),
    requestPasswordReset: (loginOrEmail: string) => getAuthProvider().requestPasswordReset(loginOrEmail),
    changeUserPassword: (oldPassword: string, newPassword: string) =>
      getAuthProvider().changeUserPassword(oldPassword, newPassword),
    signIn: (username: string, password: string) => getAuthProvider().signIn(username, password),
    signOut: () => getAuthProvider().signOut(),
  };
});
