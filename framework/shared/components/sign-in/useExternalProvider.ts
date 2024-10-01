import { useLocalStorage } from "@vueuse/core";
import type { Ref } from "vue";
import { ExternalSignInClient, ExternalSignInProviderInfo } from "../../../core/api/platform";

export interface IUseExternalProvider {
  storage: Ref<{ providerType?: string | undefined }>;
  signIn: (authenticationType: string, oidcUrl: string) => void;
  signOut: (authenticationType: string) => void;
  getProviders: () => Promise<ExternalSignInProviderInfo[] | undefined>;
}

const VC_EXTERNAL_AUTH_DATA_KEY = "externalSignIn";

export const useExternalProvider = (): IUseExternalProvider => {
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

  async function externalSignIn(authenticationType: string, oidcUrl: string) {
    try {
      let url_ = window.location.origin + "externalsignin?";
      const returnUrl = window.location.pathname ?? "/";

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
      let url_ = window.location.origin + "externalsignin/signout?";

      if (authenticationType !== undefined)
        url_ += "authenticationType=" + encodeURIComponent("" + authenticationType) + "&";
      if (window.location.pathname !== undefined)
        url_ += "returnUrl=" + encodeURIComponent("" + window.location.pathname) + "&";

      url_ = url_.replace(/[?&]$/, "");
      window.location.href = url_;

      externalSignInStorage.value = {};
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function getExternalLoginProviders() {
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
