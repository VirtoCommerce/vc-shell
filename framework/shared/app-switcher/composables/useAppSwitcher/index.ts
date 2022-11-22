import { computed, Ref, ref } from "vue";
import { AppDescriptor, AppsClient } from "../../../../core/api";
import {
  useLogger,
  useUser,
  usePermissions,
} from "../../../../core/composables";

interface IUseAppSwitcher {
  readonly appsList: Ref<AppDescriptor[]>;
  getApps: () => void;
  switchApp: (app: AppDescriptor) => void;
}

export default (): IUseAppSwitcher => {
  const logger = useLogger();
  const { checkPermission } = usePermissions();
  const appsList = ref<AppDescriptor[]>([]);

  async function getApiClient(): Promise<AppsClient> {
    const { getAccessToken } = useUser();
    const client = new AppsClient();
    client.setAuthToken((await getAccessToken()) as string);
    return client;
  }

  async function getApps() {
    const client = await getApiClient();

    try {
      appsList.value = await client.getApps();
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  function switchApp(app: AppDescriptor) {
    if (app.permission && checkPermission(app.permission)) {
      if (app.relativeUrl) {
        window.location.href = window.location.origin + app.relativeUrl;
      }
    } else {
      // TODO temporary alert
      alert("Access restricted");
    }
  }

  return {
    appsList: computed(() => appsList.value),
    getApps,
    switchApp,
  };
};
