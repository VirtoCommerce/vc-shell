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
  getLoginType: () => Promise<LoginType[]>;
  isAuthenticated: ComputedRef<boolean>;
}
const user: Ref<UserDetail | undefined> = ref();
function useUserFn(): IUseUser {
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

export const useUser = createSharedComposable(() => useUserFn());
