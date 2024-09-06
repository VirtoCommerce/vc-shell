/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, Ref, ref, ComputedRef } from "vue";
import {
  UserDetail,
  SecurityClient,
  ResetPasswordConfirmRequest,
  SecurityResult,
  ValidatePasswordResetTokenRequest,
  IdentityResult,
  ExternalSignInClient,
  ChangePasswordRequest,
  LoginType,
  ExternalSignInProviderInfo,
  LoginRequest,
  SignInResult,
} from "./../../api/platform";
import { RequestPasswordResult } from "./../../types";
import { createSharedComposable, useLocalStorage } from "@vueuse/core";

const VC_EXTERNAL_AUTH_DATA_KEY = "externalSignIn";

interface IUseUser {
  user: ComputedRef<UserDetail | undefined>;
  loading: ComputedRef<boolean>;
  isAdministrator: ComputedRef<boolean | undefined>;
  // getAccessToken: () => Promise<string | undefined>;
  loadUser: () => Promise<UserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResult | { succeeded: boolean; error?: any }>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult | undefined>;
  getExternalLoginProviders: () => Promise<ExternalSignInProviderInfo[] | undefined>;
  externalSignIn: (authenticationType?: string | undefined, returnUrl?: string | undefined) => void;
  getLoginType: () => Promise<LoginType[]>;
  isAuthenticated: ComputedRef<boolean>;
}
const user: Ref<UserDetail | undefined> = ref();
function useUserFn(): IUseUser {
  const loading: Ref<boolean> = ref(false);

  const securityClient = new SecurityClient();
  const base = window.location.origin + "/";
  const externalSecurityClient = new ExternalSignInClient(base);
  const externalSignInStorage = useLocalStorage<{ providerType?: string | undefined }>(
    VC_EXTERNAL_AUTH_DATA_KEY,
    {},
    {
      listenToStorageChanges: true,
      deep: true,
    },
  );

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
    console.debug(`[@vc-shell/framework#useUser:signIn] - Entry point`);
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
      //TODO: log error
      console.log(e);
      return { succeeded: false, error: e.message, status: e.status };
    } finally {
      loading.value = false;
    }
  }

  async function signOut(): Promise<void> {
    console.debug(`[@vc-shell/framework#useUser:signOut] - Entry point`);

    user.value = undefined;

    if (externalSignInStorage.value?.providerType) {
      await externalSignOut(externalSignInStorage.value.providerType);
    } else {
      securityClient.logout();
    }
  }

  async function loadUser(): Promise<UserDetail> {
    console.debug(`[@vc-shell/framework#useUser:loadUser] - Entry point`);

    try {
      loading.value = true;
      user.value = await securityClient.getCurrentUser();
      console.log("[useUser]: an user details has been loaded", user.value);
    } catch (e: any) {
      console.error(e);
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
      console.error(e);
      throw e;
    }

    return result;
  }

  async function getExternalLoginProviders() {
    let result: ExternalSignInProviderInfo[] | undefined = undefined;
    try {
      result = await externalSecurityClient.getExternalLoginProviders();
    } catch (e) {
      console.error(e);
      // TODO check error in app!!!
    }

    return result;
  }

  async function externalSignIn(authenticationType: string | undefined, returnUrl: string | undefined) {
    try {
      let url_ = base + "externalsignin?";

      const signInData = {
        providerType: authenticationType,
      };

      externalSignInStorage.value = signInData;

      if (authenticationType === null) throw new Error("The parameter 'authenticationType' cannot be null.");
      else {
        if (authenticationType !== undefined)
          url_ += "authenticationType=" + encodeURIComponent("" + authenticationType) + "&";
        if (returnUrl !== undefined) url_ += "returnUrl=" + encodeURIComponent("" + returnUrl) + "&";
      }
      url_ = url_.replace(/[?&]$/, "");

      window.location.href = url_;
    } catch (e) {
      console.error(e);

      throw e;
    }
  }

  async function externalSignOut(authenticationType: string): Promise<void> {
    try {
      const url =
        "/externalsignin/signout?authenticationType=" + authenticationType + "&returnUrl=" + window.location.pathname;
      window.location.href = url;

      externalSignInStorage.value = {};
    } catch (e) {
      console.error(e);
      throw e;
    }
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
    getExternalLoginProviders,
    externalSignIn,
    getLoginType,
  };
}

export const useUser = createSharedComposable(() => useUserFn());
