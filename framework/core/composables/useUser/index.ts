import { computed, Ref, ref, ComputedRef, onUnmounted, getCurrentInstance, inject, watch } from "vue";
import ClientOAuth2 from "client-oauth2";
import {
  UserDetail,
  SecurityClient,
  ResetPasswordConfirmRequest,
  SecurityResult,
  ValidatePasswordResetTokenRequest,
  IdentityResult,
} from "./../../api";
import { AuthData, RequestPasswordResult, SignInResults } from "./../../types";
import * as _ from "lodash-es";
import fetchIntercept from "fetch-intercept";
import { useLocalStorage } from "@vueuse/core";
//The Platform Manager uses the same key to store authorization data in the
//local storage, so we can exchange authorization data between the Platform Manager
//and the user application that is hosted in the same domain as the sub application.
const VC_AUTH_DATA_KEY = "ls.authenticationData";

const user: Ref<UserDetail> = ref();
const loading: Ref<boolean> = ref(false);
const authData: Ref<AuthData> = ref();
const authClient = new ClientOAuth2({
  accessTokenUri: `/connect/token`,
  scopes: ["offline_access"],
});
const activeAuthenticationType = ref();
const securityClient = new SecurityClient();

export interface LoginTypes {
  enabled?: boolean;
  hasLoginForm?: boolean;
  authenticationType?: string;
  priority?: number;
}
export interface LoginProviders {
  authenticationType?: string;
  displayName?: string;
}

interface IUseUser {
  user: ComputedRef<UserDetail | null>;
  loading: ComputedRef<boolean>;
  isExternalSignedIn: Ref<boolean>;
  getAccessToken: () => Promise<string | null>;
  loadUser: () => Promise<UserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResults>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult>;
  getExternalLoginProviders: () => Promise<LoginProviders[]>;
  externalSignIn: (authenticationType?: string | undefined, returnUrl?: string | undefined) => void;
  externalSignOut: (authenticationType?: string | undefined) => void;
  getLoginTypes: () => Promise<LoginTypes[]>;
  isAzureAdAuthAvailable: () => Promise<boolean>;
  getAzureAdAuthCaption: () => Promise<string>;
}

export function useUser(): IUseUser {
  const base = inject("platformUrl");
  const isExternalSignedIn = useLocalStorage("VC_EXTERNAL_LOGIN", false);

  watch(
    () => isExternalSignedIn,
    (newVal) => {
      if (newVal.value) {
        initInterceptor();
      } else {
        fetchIntercept.clear();
      }
    },
    { immediate: true }
  );

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

  async function signIn(username: string, password: string): Promise<SignInResults> {
    console.debug(`[@vc-shell/framework#useUser:signIn] - Entry point`);
    let token = undefined;
    try {
      loading.value = true;
      token = await authClient.owner.getToken(username, password);
    } catch (e) {
      //TODO: log error
      return { succeeded: false, error: e as string };
    } finally {
      loading.value = false;
    }

    if (token) {
      authData.value = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: addOffsetToCurrentDate(Number(token.data["expires_in"])),
        userName: username,
      };
      console.log("[useUser]: an access token has been obtained successfully", authData.value);

      storeAuthData(authData.value);
      isExternalSignedIn.value = false;
    }
    await loadUser();
    return { succeeded: true };
  }

  async function signOut(): Promise<void> {
    console.debug(`[@vc-shell/framework#useUser:signOut] - Entry point`);

    if (!isExternalSignedIn.value) {
      user.value = undefined;
      authData.value = undefined;
      storeAuthData({});
    } else {
      externalSignOut(activeAuthenticationType.value);
      activeAuthenticationType.value = undefined;
    }
  }

  async function loadUser(): Promise<UserDetail> {
    console.debug(`[@vc-shell/framework#useUser:loadUser] - Entry point`);
    const token = await getAccessToken();
    if (token) {
      securityClient.setAuthToken(token);
    }

    try {
      loading.value = true;
      user.value = await securityClient.getCurrentUser();
      console.log("[useUser]: an user details has been loaded", user.value);
    } catch (e) {
      console.dir(e);
      throw e;
    } finally {
      loading.value = false;
    }

    return { ...user.value } as UserDetail;
  }

  async function getAccessToken(): Promise<string | null> {
    console.debug(`[@vc-shell/framework#useUser:getAccessToken] - Entry point`);
    if (!authData.value || Object.keys(authData.value).length === 0) {
      authData.value = await readAuthData();
    }

    if (authData.value && Date.now() >= (authData.value.expiresAt ?? 0)) {
      const token = authClient.createToken(
        authData.value.accessToken ?? authData.value.token ?? "",
        authData.value.refreshToken ?? "",
        {}
      );

      console.log("[useUser]: an access token is expired, using refresh token to receive a new");
      try {
        const newToken = await token.refresh();
        if (newToken) {
          authData.value = {
            ...authData.value,
            accessToken: newToken.accessToken,
            token: newToken.accessToken,
            refreshToken: newToken.refreshToken,
            expiresAt: addOffsetToCurrentDate(Number(newToken.data["expires_in"])),
          };
          storeAuthData(authData.value);
        }
      } catch (e) {
        console.log("[useUser]: getAccessToken() returns error", e);
      }
    }

    return authData.value?.accessToken ?? authData.value?.token;
  }

  function storeAuthData(authData: AuthData) {
    localStorage.setItem(VC_AUTH_DATA_KEY, JSON.stringify({ ...(authData || {}) }));
  }
  async function readAuthData(): Promise<AuthData> {
    return (await JSON.parse(localStorage.getItem(VC_AUTH_DATA_KEY) || "{}")) as AuthData;
  }

  function addOffsetToCurrentDate(offsetInSeconds: number): number {
    return Date.now() + offsetInSeconds * 1000;
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

  async function changeUserPassword(oldPassword: string, newPassword: string): Promise<SecurityResult> {
    const token = await getAccessToken();
    let result;

    // TODO it's temporary workaround to get valid errors
    if (token) {
      try {
        loading.value = true;
        const res = await fetch("/api/platform/security/currentuser/changepassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json-patch+json",
            Accept: "text/plain",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        });
        if (res.status !== 500) {
          result = await res.text().then((response) => {
            return JSON.parse(response);
          });
        }
      } catch (e) {
        return { succeeded: false, errors: [e.message] } as SecurityResult;
      } finally {
        loading.value = false;
      }
    }

    return result as SecurityResult;
  }

  async function getLoginTypes(): Promise<LoginTypes[]> {
    let result = null as LoginTypes[];
    try {
      const fetchResult = await fetch("/api/platform/security/logintypes", {
        method: "GET",
        headers: {},
      });

      const response = await fetchResult.text();
      if (response && response.trim()) {
        result = JSON.parse(response) as LoginTypes[];
      }
    } catch (e) {
      console.error(e);

      throw e;
    }

    return result;
  }

  async function getExternalLoginProviders(): Promise<LoginProviders[]> {
    let result = null as LoginProviders[];
    try {
      const fetchResult = await fetch(base + "externalsignin/providers", {
        method: "GET",
      });

      const response = await fetchResult.text();
      if (response && response.trim()) {
        result = JSON.parse(response) as LoginProviders[];
      }
    } catch (e) {
      console.error(e);

      throw e;
    }

    return result;
  }

  async function externalSignIn(authenticationType?: string | undefined, returnUrl?: string | undefined) {
    activeAuthenticationType.value = authenticationType;
    try {
      let url_ = base + "externalsignin?";
      if (authenticationType === null) throw new Error("The parameter 'authenticationType' cannot be null.");
      else {
        if (authenticationType !== undefined)
          url_ += "authenticationType=" + encodeURIComponent("" + authenticationType) + "&";
        if (returnUrl !== undefined) url_ += "returnUrl=" + encodeURIComponent("" + returnUrl) + "&";
      }
      url_ = url_.replace(/[?&]$/, "");
      isExternalSignedIn.value = true;

      window.location.href = url_;
    } catch (e) {
      isExternalSignedIn.value = false;
      console.error(e);

      throw e;
    }
  }

  async function externalSignOut(authenticationType?: string | undefined): Promise<void> {
    try {
      let url_ = base + "externalsignin/signout?";
      if (authenticationType === null) throw new Error("The parameter 'authenticationType' cannot be null.");
      else {
        if (authenticationType !== undefined)
          url_ += "authenticationType=" + encodeURIComponent("" + authenticationType) + "&";
      }
      url_ = url_.replace(/[?&]$/, "");

      await fetch(url_, {
        method: "GET",
        headers: {},
      });
    } catch (e) {
      console.error(e);

      throw e;
    }
    isExternalSignedIn.value = false;
  }

  async function isAzureAdAuthAvailable(): Promise<boolean> {
    const loginTypes = await getLoginTypes();
    if (loginTypes) {
      return (
        loginTypes.filter((x) => x.authenticationType === "AzureAD").length > 0 &&
        loginTypes.find((x) => x.authenticationType === "AzureAD").enabled
      );
    }
    return false;
  }

  async function getAzureAdAuthCaption(): Promise<string> {
    const loginProviders = await getExternalLoginProviders();
    if (loginProviders) {
      return loginProviders.find((x) => x.authenticationType === "AzureAD").displayName;
    }
    return null;
  }

  /* Intercepting requests to explicitly remove auth token when we use AzureAd authentication */
  function initInterceptor() {
    console.log("[@vc-shell/framework#useUser:initInterceptor]: Entry point");
    // store external login in localStorage
    return fetchIntercept.register({
      request: function (_url, config) {
        if (isExternalSignedIn.value) {
          const edited = _.omit(config.headers, "authorization");
          config.headers = edited;
        }

        return [_url, config];
      },
    });
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isExternalSignedIn,
    getAccessToken,
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
    externalSignOut,
    getLoginTypes,
    isAzureAdAuthAvailable,
    getAzureAdAuthCaption,
  };
}
