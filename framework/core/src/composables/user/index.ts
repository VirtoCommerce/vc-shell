import { computed, Ref, ref } from "vue";
import ClientOAuth2 from "client-oauth2";
import { UserDetail } from "@virtoshell/api-client";
const user: Ref<UserDetail | undefined> = ref();
const accessToken: Ref<string | undefined> = ref();
const refreshToken: Ref<string | undefined> = ref();

interface IUseUser {
  user: typeof user;
  accessToken: typeof accessToken;
  refreshToken: typeof refreshToken;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export default (): IUseUser => {
  async function signIn(username: string, password: string): Promise<void> {
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
  async function signOut(): Promise<void> {
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
