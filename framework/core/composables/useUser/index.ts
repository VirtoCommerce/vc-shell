/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, inject, ComputedRef, getCurrentInstance } from "vue";
import {
  UserDetail,
  SecurityResult,
  IdentityResult,
  LoginType,
  SignInResult,
  IUserDetail,
  ISecurityResult,
  ILoginType,
  IIdentityResult,
} from "./../../api/platform";
import { RequestPasswordResult, IAuthProvider } from "./../../types";
import { createSharedComposable } from "@vueuse/core";
import { AuthProviderKey } from "../../../injection-keys";
import { authProviderManager } from "../../providers/auth-provider-manager";

/**
 * Interface for the full internal API
 * @deprecated This interface is kept for backward compatibility but will be removed in future versions
 */
export interface IUserInternalAPI {
  user: ComputedRef<IUserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<IUserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IIdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<ISecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<ISecurityResult | undefined>;
  getLoginType: () => Promise<ILoginType[]>;
  isAuthenticated: ComputedRef<boolean>;
}

export interface IAppUserAPI {
  user: ComputedRef<IUserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAuthenticated: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<IUserDetail>;
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

/**
 * Internal user logic - delegates to auth provider
 * @deprecated This function is kept for backward compatibility but will be removed in future versions
 * Use auth provider directly or useUser/useUserManagement composables
 */
export function _createInternalUserLogic(): IUserInternalAPI {
  const authProvider = getAuthProvider();

  return {
    user: authProvider.user,
    loading: authProvider.loading,
    isAdministrator: authProvider.isAdministrator,
    isAuthenticated: authProvider.isAuthenticated,
    loadUser: authProvider.loadUser.bind(authProvider),
    signIn: authProvider.signIn.bind(authProvider),
    signOut: authProvider.signOut.bind(authProvider),
    validateToken: authProvider.validateToken.bind(authProvider),
    validatePassword: authProvider.validatePassword.bind(authProvider),
    resetPasswordByToken: authProvider.resetPasswordByToken.bind(authProvider),
    requestPasswordReset: authProvider.requestPasswordReset.bind(authProvider),
    changeUserPassword: authProvider.changeUserPassword.bind(authProvider),
    getLoginType: authProvider.getLoginType.bind(authProvider),
  };
}

export const useUser = createSharedComposable((): IAppUserAPI => {
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
    get isAuthenticated() {
      return getAuthProvider().isAuthenticated;
    },
    get isAdministrator() {
      return getAuthProvider().isAdministrator;
    },
    // Methods get provider dynamically on each call
    loadUser: () => getAuthProvider().loadUser(),
    signOut: () => getAuthProvider().signOut(),
  };
});
