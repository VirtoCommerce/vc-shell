import { computed, Ref, ref } from "vue";
import { AppDescriptor, AppsClient } from "../../../../../core/api/platform";
import { usePermissions } from "../../../../../core/composables";
import { notification } from "./../../../notifications";
import { i18n } from "../../../../../core/plugins";
import { createLogger } from "../../../../../core/utilities";

const logger = createLogger("use-app-switcher");

interface IUseAppSwitcher {
  readonly appsList: Ref<AppDescriptor[]>;
  getApps: () => Promise<void>;
  switchApp: (app: AppDescriptor) => void;
}

export function useAppSwitcher(): IUseAppSwitcher {
  const { hasAccess } = usePermissions();
  const appsList = ref<AppDescriptor[]>([]);

  async function getApiClient(): Promise<AppsClient> {
    const client = new AppsClient();
    return client;
  }

  async function getApps() {
    const client = await getApiClient();

    try {
      appsList.value = await client.getApps();
    } catch (e) {
      logger.error("Failed to get apps:", e);
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
