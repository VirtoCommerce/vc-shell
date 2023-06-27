import { computed, Ref, ref, ComputedRef, getCurrentInstance, inject } from "vue";
import ClientOAuth2 from "client-oauth2";
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
} from "./../../api";
import { AuthData, RequestPasswordResult, SignInResults } from "./../../types";
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
const securityClient = new SecurityClient();

interface IUseUser {
  user: ComputedRef<UserDetail | null>;
  loading: ComputedRef<boolean>;
  getAccessToken: () => Promise<string | null>;
  loadUser: () => Promise<UserDetail>;
  signIn: (username: string, password: string) => Promise<SignInResults>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (userId: string, password: string, token: string) => Promise<SecurityResult>;
  requestPasswordReset: (loginOrEmail: string) => Promise<RequestPasswordResult>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<SecurityResult>;
  getExternalLoginProviders: () => Promise<ExternalSignInProviderInfo[]>;
  externalSignIn: (authenticationType?: string | undefined, returnUrl?: string | undefined) => void;
  getLoginType: () => Promise<LoginType[]>;
  isAuthenticated: () => Promise<boolean>;
}

export function useUser(): IUseUser {
  const instance = getCurrentInstance();
  const base = instance && inject<string>("platformUrl");
  const externalSecurityClient = new ExternalSignInClient(base);
  const externalSignInStorage = useLocalStorage<{ providerType: string }>("externalSignIn", { providerType: null });

  const isAuthenticated = async () => {
    return !!((externalSignInStorage.value && externalSignInStorage.value.providerType) ?? (await getAccessToken()));
  };

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
    }
    await loadUser();
    return { succeeded: true };
  }

  async function signOut(): Promise<void> {
    console.debug(`[@vc-shell/framework#useUser:signOut] - Entry point`);

    if (externalSignInStorage.value && externalSignInStorage.value.providerType) {
      externalSignOut(externalSignInStorage.value.providerType);
    } else {
      user.value = undefined;
      authData.value = undefined;
      storeAuthData({});
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

    if (token) {
      try {
        loading.value = true;
        const command = new ChangePasswordRequest({
          oldPassword,
          newPassword,
        });

        result = await securityClient.changeCurrentUserPassword(command);
      } catch (e) {
        return { succeeded: false, errors: [e.message] } as SecurityResult;
      } finally {
        loading.value = false;
      }
    }

    return result;
  }

  async function getLoginType(): Promise<LoginType[]> {
    let result = null as LoginType[];
    try {
      result = await securityClient.getLoginTypes();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return result;
  }

  async function getExternalLoginProviders(): Promise<ExternalSignInProviderInfo[]> {
    let result = null as ExternalSignInProviderInfo[];
    try {
      result = await externalSecurityClient.getExternalLoginProviders();
    } catch (e) {
      console.error(e);
    }

    return result;
  }

  async function externalSignIn(authenticationType: string, returnUrl: string) {
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
      externalSecurityClient.signOut(authenticationType);

      externalSignInStorage.value = null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
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
    getLoginType,
  };
}
