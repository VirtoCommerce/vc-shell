/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, Ref, ref, ComputedRef } from "vue";
import {
  UserDetail,
  SecurityClient,
  ResetPasswordConfirmRequest,
  SecurityResult,
  ValidatePasswordResetTokenRequest,
  IdentityResult,
  ChangePasswordRequest,
  LoginType,
  LoginRequest,
  SignInResult,
} from "./../../api/platform";
import { RequestPasswordResult } from "./../../types";
import { createSharedComposable } from "@vueuse/core";
import { useExternalProvider } from "../../../shared/components/sign-in/useExternalProvider";
import { createLogger } from "../../utilities";

const logger = createLogger("use-user");

// Interface for the full internal API provided by _createInternalUserLogic
export interface IUserInternalAPI {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<UserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult | undefined>;
  getLoginType: () => Promise<LoginType[]>;
  isAuthenticated: ComputedRef<boolean>;
}

export interface IAppUserAPI {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAuthenticated: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  loadUser: () => Promise<UserDetail>;
  signOut: () => Promise<void>;
}

const user: Ref<UserDetail | undefined> = ref();

export function _createInternalUserLogic(): IUserInternalAPI {
  const loading: Ref<boolean> = ref(false);

  const { storage: externalSignInStorage, signOut: externalSignOut } = useExternalProvider();

  const securityClient = new SecurityClient();

  const isAuthenticated = computed(() => user.value?.userName != null);

  async function validateToken(userId: string, token: string): Promise<boolean> {
    let result = false;
    try {
      loading.value = true;
      result = await securityClient.validatePasswordResetToken(userId, {
        token,
      } as ValidatePasswordResetTokenRequest);
    } catch (e) {
      //TODO: log error
    } finally {
      loading.value = false;
    }
    return result;
  }

  async function validatePassword(password: string): Promise<IdentityResult> {
    return securityClient.validatePassword(password);
  }

  async function resetPasswordByToken(userId: string, password: string, token: string): Promise<SecurityResult> {
    return securityClient.resetPasswordByToken(userId, {
      newPassword: password,
      token,
    } as ResetPasswordConfirmRequest);
  }

  async function signIn(
    username: string,
    password: string,
  ): Promise<SignInResult | { succeeded: boolean; error?: any; status?: number }> {
    logger.debug("signIn - Entry point");
    try {
      loading.value = true;
      const result = await securityClient.login(new LoginRequest({ userName: username, password }));
      return await securityClient
        .getCurrentUser()
        .then((res) => {
          if (res) {
            user.value = res;
            return result;
          }
          throw { succeeded: false };
        })
        .catch((e) => {
          throw e;
        });
    } catch (e: any) {
      logger.error("signIn failed:", e);
      return { succeeded: false, error: e.message, status: e.status };
    } finally {
      loading.value = false;
    }
  }

  async function signOut(): Promise<void> {
    logger.debug("signOut - Entry point");

    user.value = undefined;

    if (externalSignInStorage.value?.providerType) {
      await externalSignOut(externalSignInStorage.value.providerType);
    } else {
      securityClient.logout();
    }
  }

  async function loadUser(): Promise<UserDetail> {
    logger.debug("loadUser - Entry point");

    try {
      loading.value = true;
      user.value = await securityClient.getCurrentUser();
      logger.debug("User details loaded:", user.value);
    } catch (e: any) {
      logger.error("loadUser failed:", e);
    } finally {
      loading.value = false;
    }

    return { ...user.value } as UserDetail;
  }

  async function requestPasswordReset(loginOrEmail: string): Promise<RequestPasswordResult> {
    try {
      loading.value = true;
      await securityClient.requestPasswordReset(loginOrEmail);
      return { succeeded: true };
    } catch (e) {
      //TODO: log error
      return { succeeded: false, error: e as string };
    } finally {
      loading.value = false;
    }
  }

  async function changeUserPassword(oldPassword: string, newPassword: string): Promise<SecurityResult | undefined> {
    let result;

    try {
      loading.value = true;
      const command = new ChangePasswordRequest({
        oldPassword,
        newPassword,
      });

      result = await securityClient.changeCurrentUserPassword(command);
    } catch (e: any) {
      return { succeeded: false, errors: [e.message] } as SecurityResult;
    } finally {
      loading.value = false;
    }

    return result;
  }

  async function getLoginType() {
    let result: LoginType[] | null = null;
    try {
      result = await securityClient.getLoginTypes();
    } catch (e) {
      logger.error("getLoginType failed:", e);
      throw e;
    }

    return result;
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAdministrator: computed(() => user.value?.isAdministrator),
    isAuthenticated,
    loadUser,
    signIn,
    signOut,
    validateToken,
    validatePassword,
    resetPasswordByToken,
    requestPasswordReset,
    changeUserPassword,
    getLoginType,
  };
}

export const useUser = createSharedComposable((): IAppUserAPI => {
  const internals = _createInternalUserLogic();
  return {
    user: internals.user,
    loading: internals.loading,
    isAuthenticated: internals.isAuthenticated,
    isAdministrator: internals.isAdministrator,
    loadUser: internals.loadUser,
    signOut: internals.signOut,
  };
});
