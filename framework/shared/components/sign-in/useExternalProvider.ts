import { useLocalStorage } from "@vueuse/core";
import { inject, type Ref } from "vue";
import { ExternalSignInClient, ExternalSignInProviderInfo } from "../../../core/api/platform";
import { shouldEnablePlatformFeatures } from "../../../core/providers/auth-provider-utils";
import { AuthProviderKey } from "../../../injection-keys";

export interface IUseExternalProvider {
  storage: Ref<{ providerType?: string | undefined }>;
  signIn: (authenticationType?: string) => Promise<void>;
  signOut: (authenticationType: string) => Promise<void>;
  getProviders: () => Promise<ExternalSignInProviderInfo[] | undefined>;
}

const VC_EXTERNAL_AUTH_DATA_KEY = "externalSignIn";

export const useExternalProvider = (): IUseExternalProvider => {
  // Check if we're using a custom auth provider
  const authProvider = inject(AuthProviderKey);
  const isPlatformProvider = shouldEnablePlatformFeatures(authProvider);
  const externalSecurityClient = new ExternalSignInClient();
  const externalSignInStorage = useLocalStorage<{ providerType?: string | undefined }>(
    VC_EXTERNAL_AUTH_DATA_KEY,
    {},
    {
      listenToStorageChanges: true,
      deep: true,
    },
  );

  function getReturnUrlValue(): string | null {
    const { searchParams } = new URL(location.href);
    return searchParams.get("returnUrl") || searchParams.get("ReturnUrl");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function externalSignIn(authenticationType?: string) {
    try {
      const origin = window.location.origin;
      const finalReturnUrl = window.location.pathname ?? getReturnUrlValue() ?? "/";

      if (!authenticationType) {
        throw new Error("The parameter 'authenticationType' cannot be null or undefined.");
      }

      // const oidcUrlObject = new URL(oidcUrl, origin);
      // const callbackUrl = new URL("/auth/callback", origin);
      const url = new URL("/externalsignin", origin);

      // Set query parameters
      // callbackUrl.searchParams.set("returnUrl", finalReturnUrl);
      url.searchParams.set("authenticationType", authenticationType);
      // url.searchParams.set("callbackUrl", callbackUrl.href);
      url.searchParams.set("returnUrl", finalReturnUrl);

      // Store sign-in data
      externalSignInStorage.value = { providerType: authenticationType };

      // Redirect to the constructed URL
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function externalSignOut(authenticationType: string) {
    try {
      const origin = window.location.origin;
      const returnUrl = window.location.pathname ?? "/";

      const url = new URL("/externalsignin/signout", origin);

      // Set query parameters
      url.searchParams.set("authenticationType", authenticationType);
      url.searchParams.set("returnUrl", returnUrl);

      // Clear sign-in data
      externalSignInStorage.value = {};

      // Redirect to the sign-out URL
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function getExternalLoginProviders() {
    if (!isPlatformProvider) {
      console.log("[useExternalProvider] Skipping getExternalLoginProviders - custom authentication provider detected");
      return undefined;
    }

    let result: ExternalSignInProviderInfo[] | undefined = undefined;
    try {
      result = await externalSecurityClient.getExternalLoginProviders();
    } catch (e) {
      console.error(e);
      // TODO check error in app!!!
    }

    return result;
  }

  return {
    storage: externalSignInStorage,
    signIn: externalSignIn,
    signOut: externalSignOut,
    getProviders: getExternalLoginProviders,
  };
};
