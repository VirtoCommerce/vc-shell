import { computed, Ref, ref, inject } from "vue";
import { AppDescriptor, AppsClient } from "../../../../../core/api/platform";
import { usePermissions } from "../../../../../core/composables";
import { notification } from "./../../../notifications";
import { i18n } from "../../../../../core/plugins";
import { AuthProviderKey } from "../../../../../injection-keys";
import { IAuthProvider } from "../../../../../core/types/auth-provider";
import { shouldEnablePlatformFeatures } from "../../../../../core/providers/auth-provider-utils";

interface IUseAppSwitcher {
  readonly appsList: Ref<AppDescriptor[]>;
  getApps: () => Promise<void>;
  switchApp: (app: AppDescriptor) => void;
}

export function useAppSwitcher(): IUseAppSwitcher {
  const { hasAccess } = usePermissions();
  const appsList = ref<AppDescriptor[]>([]);

  // Inject auth provider to check if platform features should be enabled
  const authProvider = inject(AuthProviderKey);

  async function getApiClient(): Promise<AppsClient> {
    const client = new AppsClient();
    return client;
  }

  async function getApps() {
    // Skip loading apps for custom authentication providers
    if (!shouldEnablePlatformFeatures(authProvider)) {
      console.log("[useAppSwitcher] Skipping getApps - custom authentication provider detected");
      appsList.value = []; // Ensure empty list for custom providers
      return;
    }

    console.log("[useAppSwitcher] Loading apps from platform");
    const client = await getApiClient();

    try {
      appsList.value = await client.getApps();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  function switchApp(app: AppDescriptor) {
    if (hasAccess(app.permission)) {
      if (app.relativeUrl) {
        window.location.href = window.location.origin + app.relativeUrl;
      }
    } else {
      notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
        timeout: 3000,
      });
    }
  }

  return {
    appsList: computed(() => appsList.value),
    getApps,
    switchApp,
  };
}
