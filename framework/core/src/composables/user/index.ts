import { computed, Ref, ref } from "vue";
import ClientOAuth2 from "client-oauth2";
import { UserDetail } from "@virtoshell/api-client";
const user: Ref<UserDetail> = ref();
const accessToken: Ref<string> = ref();
const refreshToken: Ref<string> = ref();

export default () => {
  async function signIn(username: string, password: string) {
    const authClient = new ClientOAuth2({
      accessTokenUri: `/connect/token`,
      scopes: [""],
    });

    const response = await authClient.owner.getToken(username, password);

    if (response) {
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
    }
  }
  async function signOut() {
    //todo
  }

  return {
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    refreshToken: computed(() => refreshToken.value),
    signIn,
    signOut,
  };
};
