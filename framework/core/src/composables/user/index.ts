import { computed, Ref, ref } from "vue";
import ClientOAuth2 from "client-oauth2";
import { UserDetail, SecurityClient } from "@virtoshell/api-client";
import { AuthData, SignInResult } from "../../types";
import sleep from "../_functions/sleep";
const VC_AUTH_DATA_KEY = "vc-auth-data";

const user: Ref<UserDetail | null> = ref(null);
const loading: Ref<boolean> = ref(false);
const authData: Ref<AuthData | null> = ref(null);
const authClient = new ClientOAuth2({
  accessTokenUri: `/connect/token`,
  scopes: ["offline_access"],
});
const securityClient = new SecurityClient();

export default () => {
  async function signIn(
    username: string,
    password: string
  ): Promise<SignInResult> {
    let token = undefined;
    try {
      loading.value = true;
      //TODO: remove after demo
      await sleep(1000);
      token = await authClient.owner.getToken(username, password);
    } catch (e) {
      //TODO: log error
      return { succeeded: false, error: e };
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

  async function signOut() {
    user.value = null;
    authData.value = null;
    storeAuthData({});
    //todo
  }

  async function loadUser(): Promise<UserDetail> {
    const token = await getAccessToken();
    if (token) {
      securityClient.setAuthToken(token);
      try {
        loading.value = true;
        //TODO: remove after demo
        await sleep(1000);
        user.value = await securityClient.getCurrentUser();
        console.log("[userUsers]: an user details has been loaded", user.value);
      } catch (e) {
        //TODO: log error
      } finally {
        loading.value = false;
      }
    }
    return { ...user.value } as UserDetail;
  }

  async function getAccessToken(): Promise<string | null> {
    if (!authData.value) {
      authData.value = readAuthData();
    }

    const result = authData.value?.accessToken || null;

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
    return result;
  }

  function storeAuthData(authData: AuthData) {
    localStorage.setItem(VC_AUTH_DATA_KEY, JSON.stringify({ ...authData }));
  }
  function readAuthData(): AuthData {
    return JSON.parse(localStorage.getItem(VC_AUTH_DATA_KEY) ?? "") as AuthData;
  }

  function addOffsetToCurrentDate(offsetInSeconds: number): number {
    return Date.now() + offsetInSeconds * 1000;
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    getAccessToken,
    loadUser,
    signIn,
    signOut,
  };
};
