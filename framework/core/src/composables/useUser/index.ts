import { computed, Ref, ref, ComputedRef, inject } from "vue";
import ClientOAuth2 from "client-oauth2";
import {
  UserDetail,
  SecurityResult,
  IdentityResult,
} from "@vc-shell/api-client";
import {
  AuthData,
  IUseUserFactoryParams,
  RequestPasswordResult,
  SignInResult,
} from "../../types";
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
  const useUserFactory = inject<IUseUserFactoryParams>("useUserFactory");
  async function validateToken(
    userId: string,
    token: string
  ): Promise<boolean> {
    let result = false;
    try {
      loading.value = true;
      result = await useUserFactory.validateToken(userId, token);
    } catch (e) {
      //TODO: log error
    } finally {
      loading.value = false;
    }
    return result;
  }

  async function validatePassword(password: string): Promise<IdentityResult> {
    return useUserFactory.validatePassword(password);
  }

  async function resetPasswordByToken(
    userId: string,
    password: string,
    token: string
  ): Promise<SecurityResult> {
    return useUserFactory.resetPasswordByToken(userId, password, token);
  }

  async function signIn(
    username: string,
    password: string
  ): Promise<SignInResult> {
    console.debug(`[@vc-shell/core#useUser:signIn] - Entry point`);
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
    console.debug(`[@vc-shell/core#useUser:signOut] - Entry point`);
    user.value = undefined;
    authData.value = undefined;
    storeAuthData({});
    //todo
  }

  async function loadUser(): Promise<UserDetail> {
    console.debug(`[@vc-shell/core#useUser:loadUser] - Entry point`);
    const token = await getAccessToken();
    if (token) {
      useUserFactory.setAuthToken(token);
      try {
        loading.value = true;
        user.value = await useUserFactory.getCurrentUser();
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
    console.debug(`[@vc-shell/core#useUser:getAccessToken] - Entry point`);
    if (!authData.value) {
      authData.value = readAuthData();
    }

    if (authData.value && Date.now() >= (authData.value.expiresAt ?? 0)) {
      const token = authClient.createToken(
        authData.value.accessToken ?? authData.value.token ?? "",
        authData.value.refreshToken ?? "",
        {}
      );
      console.log(
        "[userUsers]: an access token is expired, using refresh token to receive a new"
      );
      try {
        const newToken = await token.refresh();
        if (newToken) {
          authData.value = {
            ...authData.value,
            accessToken: newToken.accessToken,
            token: newToken.accessToken,
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

    return authData.value?.accessToken ?? authData.value?.token;
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
      await useUserFactory.requestPasswordReset(loginOrEmail);
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
        result = await useUserFactory.changeUserPassword(
          oldPassword,
          newPassword,
          token
        );
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
