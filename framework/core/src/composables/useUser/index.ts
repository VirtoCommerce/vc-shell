import { computed, Ref, ref, ComputedRef } from "vue";
import ClientOAuth2 from "client-oauth2";
import {
  UserDetail,
  SecurityClient,
  ResetPasswordConfirmRequest,
  SecurityResult,
  ValidatePasswordResetTokenRequest,
  IdentityResult,
} from "@virtoshell/api-client";
import { AuthData, RequestPasswordResult, SignInResult } from "../../types";
const VC_AUTH_DATA_KEY = "vc-auth-data";

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
  signIn: (username: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  validateToken: (userId: string, token: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<IdentityResult>;
  resetPasswordByToken: (
    userId: string,
    password: string,
    token: string
  ) => Promise<SecurityResult>;
  requestPasswordReset: (
    loginOrEmail: string
  ) => Promise<RequestPasswordResult>;
  changeUserPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<SecurityResult>;
}

export default (): IUseUser => {
  async function validateToken(
    userId: string,
    token: string
  ): Promise<boolean> {
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

  async function resetPasswordByToken(
    userId: string,
    password: string,
    token: string
  ): Promise<SecurityResult> {
    return securityClient.resetPasswordByToken(userId, {
      newPassword: password,
      token,
    } as ResetPasswordConfirmRequest);
  }

  async function signIn(
    username: string,
    password: string
  ): Promise<SignInResult> {
    console.debug(`[@virtoshell/core#useUser:signIn] - Entry point`);
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
      console.log(
        "[userUsers]: an access token has been obtained successfully",
        authData.value
      );

      storeAuthData(authData.value);
      await loadUser();
    }
    return { succeeded: true };
  }

  async function signOut(): Promise<void> {
    console.debug(`[@virtoshell/core#useUser:signOut] - Entry point`);
    user.value = undefined;
    authData.value = undefined;
    storeAuthData({});
    //todo
  }

  async function loadUser(): Promise<UserDetail> {
    console.debug(`[@virtoshell/core#useUser:loadUser] - Entry point`);
    const token = await getAccessToken();
    if (token) {
      securityClient.setAuthToken(token);
      try {
        loading.value = true;
        user.value = await securityClient.getCurrentUser();
        console.log("[userUsers]: an user details has been loaded", user.value);
      } catch (e) {
        console.dir(e);
        //TODO: log error
      } finally {
        loading.value = false;
      }
    }
    return { ...user.value } as UserDetail;
  }

  async function getAccessToken(): Promise<string | null> {
    console.debug(`[@virtoshell/core#useUser:getAccessToken] - Entry point`);
    if (!authData.value) {
      authData.value = readAuthData();
    }

    if (authData.value && Date.now() >= (authData.value.expiresAt ?? 0)) {
      const token = authClient.createToken(
        authData.value.accessToken ?? "",
        authData.value.refreshToken ?? "",
        {}
      );
      console.log(
        "[userUsers]: an access token is expired, using refresh token to recieve a new"
      );
      try {
        const newToken = await token.refresh();
        if (newToken) {
          authData.value = {
            ...authData.value,
            accessToken: newToken.accessToken,
            refreshToken: newToken.refreshToken,
            expiresAt: addOffsetToCurrentDate(
              Number(newToken.data["expires_in"])
            ),
          };
          storeAuthData(authData.value);
        }
      } catch (e) {
        console.log("[userUsers]: getAccessToken() returns error", e);
      }
    }

    return authData.value?.accessToken || null;
  }

  function storeAuthData(authData: AuthData) {
    localStorage.setItem(
      VC_AUTH_DATA_KEY,
      JSON.stringify({ ...(authData || {}) })
    );
  }
  function readAuthData(): AuthData {
    return JSON.parse(
      localStorage.getItem(VC_AUTH_DATA_KEY) || "{}"
    ) as AuthData;
  }

  function addOffsetToCurrentDate(offsetInSeconds: number): number {
    return Date.now() + offsetInSeconds * 1000;
  }

  async function requestPasswordReset(
    loginOrEmail: string
  ): Promise<RequestPasswordResult> {
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

  async function changeUserPassword(
    oldPassword: string,
    newPassword: string
  ): Promise<SecurityResult> {
    const token = await getAccessToken();
    let result;

    // TODO it's temporary workaround to get valid errors
    if (token) {
      try {
        loading.value = true;
        const res = await fetch(
          "/api/platform/security/currentuser/changepassword",
          {
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
          }
        );
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

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    getAccessToken,
    loadUser,
    signIn,
    signOut,
    validateToken,
    validatePassword,
    resetPasswordByToken,
    requestPasswordReset,
    changeUserPassword,
  };
};
