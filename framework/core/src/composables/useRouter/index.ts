import { App, ref, computed, ComputedRef, watch, reactive } from "vue";
import { v1 as uuid } from "uuid";
import pattern from "url-pattern";
import { IBladeData } from "../../types";

interface IAppOptions {
  blades?: IBladeData[];
}

interface IUseRouter {
  registerBlade: (blade: IBladeData) => void;
  openBlade: (
    parent: string | null,
    name: string,
    options?: Record<string, unknown>
  ) => void;
  closeBlade: (index: number) => void;
  closeChildren: (uid: string) => void;
  parseUrl: (url: string) => void;
  openDashboard: () => void;
  openWorkspace: (name: string, options?: Record<string, unknown>) => void;
  registry: ComputedRef<IBladeData[]>;
  workspace: IBladeData[];
}

/**
 * Router URL pattern.
 */
const urlPattern = new pattern("(/:workspace(/:blade(/:param)))");

/**
 * Application blade registry.
 */
const registry = ref<IBladeData[]>([]);

/**
 * Current workspace blade list.
 */
const workspace = reactive<IBladeData[]>([]);

/**
 * Watch workspace changes to update URL.
 */
watch(
  () => [...workspace],
  (value) => {
    console.log("Workspace changed");
    setTimeout(() => {
      if (value && value.length) {
        const ws = value[0].url;
        let lastBladeWithUrlIndex = -1;
        value.forEach((item, i) => {
          if (item.url) {
            lastBladeWithUrlIndex = i;
          }
        });
        const lastBladeWithUrl = value[lastBladeWithUrlIndex];
        const blade =
          (lastBladeWithUrl &&
            lastBladeWithUrl.url !== ws &&
            lastBladeWithUrl.url) ||
          undefined;
        const param =
          (lastBladeWithUrl &&
            lastBladeWithUrl.url !== ws &&
            lastBladeWithUrl.param) ||
          undefined;

        const url = urlPattern.stringify({
          workspace: ws,
          blade,
          param,
        });
        window?.history?.pushState(null, "", url);

        value[0].closable = false;
        value[value.length - 1].expanded = true;
        if (value.length > 1) {
          value[value.length - 2].expanded = false;
        }
      } else {
        window?.history?.pushState(null, "", "/");
      }
    }, 0);
  }
);

/**
 * Insert blade data into registry.
 * @param blade Blade data.
 */
const registerBlade = (blade: IBladeData) => {
  console.debug(`[@virtoshell/core#useRouter:registerBlade] - "${blade.name}"`);
  if (registry.value.some((item) => item.name === blade.name)) {
    console.warn(`Blade "${blade.name}" already registered, overriding...`);
  }
  registry.value.push(blade);
};

/**
 * Parse given URL and open corresponding workspace and blade.
 * @param url Url path (ex.: /products/product-edit/32)
 */
const parseUrl = (url: string) => {
  console.debug(`[@virtoshell/core#useRouter:parseUrl] - "${url}"`);
  const data = urlPattern.match(url);
  if (data?.workspace) {
    const ws = registry.value.find((item) => item.url === data.workspace);
    if (ws) {
      openWorkspace(ws.name);

      if (data.blade) {
        const blade = registry.value.find((item) => item.url === data.blade);
        if (blade) {
          openBlade(null, blade.name, { param: data.param });
        }
      }
    }
  }
};

/**
 * Open blade from registry by name with optional overriden componentOptions.
 * @param name Blade name.
 * @param options Custom object with overriden blade componentOptions.
 */
const openBlade = (
  parent: string | null,
  name: string,
  options?: Record<string, unknown>
) => {
  console.debug(`[@virtoshell/core#useRouter:openBlade] - "${name}"`);
  const blade = registry.value.find((item) => item.name === name);
  if (!blade) {
    console.error(`Blade "${name}" is not registered.`);
  } else {
    if (parent) {
      closeChildren(parent);
    }

    const uid = uuid();

    // Open new blade.
    workspace.splice(workspace.length, 0, {
      ...blade,
      componentOptions: {
        ...(blade.componentOptions || {}),
        ...(options || {}),
      },
      url: options?.url === undefined ? blade.url : (options?.url as string),
      closable: true,
      uid,
      param: options?.param as string,
    });
  }
};

/**
 * Close blade by uid and its children.
 * @param uid Blade uid.
 */
const closeBlade = async (index: number) => {
  console.debug(`[@virtoshell/core#useRouter:closeBlade] - "${index}"`);

  // We don't allow closing first blade
  if (index > 0) {
    workspace.splice(index);
  }
};

/**
 * Close blade children by uid.
 * @param uid Blade uid.
 */
const closeChildren = (uid: string) => {
  console.debug(`[@virtoshell/core#useRouter:closeChildren] - "${uid}"`);
  const bladeIndex = workspace.findIndex((item) => item.uid === uid);

  // We have no children of last blade
  if (bladeIndex < workspace.length - 1) {
    workspace.splice(bladeIndex + 1);
  }
};

/**
 * Open dashboard (close all blades).
 */
const openDashboard = () => {
  console.debug(`[@virtoshell/core#useRouter:openDashboard] - Entry point`);
  workspace.splice(0);
};

/**
 * Open new workspace starting with blade by its name and optional overriden componentOptions.
 * @param name Blade name.
 * @param options Custom object with overriden blade componentOptions.
 */
const openWorkspace = (name: string, options?: Record<string, unknown>) => {
  console.debug(`[@virtoshell/core#useRouter:openWorkspace] - "${name}"`);
  const blade = registry.value.find((item) => item.name === name);
  if (!blade) {
    console.error(`Blade "${name}" is not registered.`);
  } else {
    const uid = uuid();
    workspace.splice(0, workspace.length, {
      ...blade,
      componentOptions: {
        ...(blade.componentOptions || {}),
        ...(options || {}),
      },
      uid,
    });
  }
};

/**
 * Init Vue3 plugin and register application globals.
 * @param app Application instande.
 * @param options Optional object with default options.
 * @returns Updated application instance.
 */
export function init(app: App, options?: IAppOptions): App {
  console.debug("[@virtoshell/core#useRouter:init] - Entry point");

  options?.blades?.forEach((blade) => registerBlade(blade));
  app.config.globalProperties.$openDashboard = openDashboard;
  app.config.globalProperties.$openWorkspace = openWorkspace;
  app.config.globalProperties.$openBlade = openBlade;
  app.config.globalProperties.$closeBlade = closeBlade;

  return app;
}

/**
 * Composable export.
 */
export default function useRouter(): IUseRouter {
  console.debug("[@virtoshell/core#useRouter] - Entry point");

  return {
    registerBlade,
    openBlade,
    closeBlade,
    closeChildren,
    openWorkspace,
    openDashboard,
    parseUrl,
    registry: computed(() => registry.value),
    workspace,
  };
}
