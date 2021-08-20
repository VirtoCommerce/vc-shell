import { computed, Ref, ref } from "vue";
import ClientOAuth2 from "client-oauth2";
import { UserDetail } from "@virtoshell/api-client";
import { useCookies } from "@vueuse/integrations/useCookies";

const user: Ref<UserDetail> = ref();

export default () => {
  const { get: getCookie, set: setCookie } = useCookies(["vc-access-token"]);

  async function signIn(username: string, password: string) {
    const authClient = new ClientOAuth2({
      accessTokenUri: `/connect/token`,
      scopes: [""],
    });

    const response = await authClient.owner.getToken(username, password);

    if (response) {
      setCookie("vc-access-token", response.accessToken);
    }
  }
  async function signOut() {
    //todo
  }

  function getAccessToken(): string {
    return getCookie("vc-access-token");
  }

  return {
    user: computed(() => user.value),
    getAccessToken,
    signIn,
    signOut,
  };
};
