import { App, ref, computed } from "vue";
import { v1 as uuid } from "uuid";

interface IAppOptions {
  blades?: IBladeData[];
}

interface IBladeData {
  name: string;
  component?: any;
  uid?: string;
  url?: string;
  componentOptions?: Record<string, unknown>;
  expanded?: boolean;
  closable?: boolean;
}

/**
 * Application blade registry.
 */
const registry = ref<IBladeData[]>([]);

/**
 * Current workspace blade list.
 */
const workspace = ref<IBladeData[]>([]);

/**
 * Insert blade data into registry.
 * @param blade Blade data.
 */
const registerBlade = (blade: IBladeData) => {
  console.debug(`[@virtoshell/core#useBlade:registerBlade] - "${blade.name}"`);
  if (registry.value.some((item) => item.name === blade.name)) {
    console.warn(`Blade "${blade.name}" already registered, overriding...`);
  }
  registry.value.push({
    ...blade,
    uid: uuid(),
  });
};

/**
 * Open blade from registry by name with optional overriden componentOptions.
 * @param name Blade name.
 * @param options Custom object with overriden blade componentOptions.
 */
const openBlade = (name: string, options?: Partial<IBladeData>) => {
  console.debug(`[@virtoshell/core#useBlade:openBlade] - "${name}"`);
  const blade = registry.value.find((item) => item.name === name);
  if (!blade) {
    console.error(`Blade "${name}" is not registered.`);
  } else {
    // Collapse previous blade.
    workspace.value[workspace.value.length - 1].expanded = false;

    // Open new blade.
    workspace.value.push({
      ...blade,
      componentOptions: {
        ...(blade.componentOptions || {}),
        ...(options || {}),
      },
      expanded: true,
      closable: true,
    });

    // Change URL if needed.
    if (blade.url) {
      window?.history?.pushState(null, "", blade.url);
    }
  }
};

/**
 * Close blade by uid and its children.
 * @param uid Blade uid.
 */
const closeBlade = (uid: string) => {
  console.debug(`[@virtoshell/core#useBlade:closeBlade] - "${uid}"`);
  const bladeIndex = workspace.value.findIndex((item) => item.uid === uid);
  if (bladeIndex > 0) {
    // We don't allow closing first blade
    workspace.value.splice(bladeIndex);
    workspace.value[workspace.value.length - 1].expanded = true;
  }
};

/**
 * Expand blade by uid.
 * @param uid Blade uid.
 */
const expandBlade = (uid: string) => {
  console.debug(`[@virtoshell/core#useBlade:expandBlade] - "${uid}"`);
  const blade = workspace.value.find((item) => item.uid === uid);
  if (blade) {
    blade.expanded = true;
  }
};

/**
 * Collapse blade by uid.
 * @param uid  Blade uid.
 */
const collapseBlade = (uid: string) => {
  console.debug(`[@virtoshell/core#useBlade:collapseBlade] - "${uid}"`);
  const blade = workspace.value.find((item) => item.uid === uid);
  if (blade) {
    blade.expanded = false;
  }
};

/**
 * Open dashboard (close all blades).
 */
const openDashboard = () => {
  console.debug(`[@virtoshell/core#useBlade:openDashboard] - Entry point`);
  workspace.value = [];
  window?.history?.pushState(null, "", "/");
};

/**
 * Open new workspace starting with blade by its name and optional overriden componentOptions.
 * @param name Blade name.
 * @param options Custom object with overriden blade componentOptions.
 */
const openWorkspace = (name: string, options?: Partial<IBladeData>) => {
  console.debug(`[@virtoshell/core#useBlade:openWorkspace] - "${name}"`);
  const blade = registry.value.find((item) => item.name === name);
  if (!blade) {
    console.error(`Blade "${name}" is not registered.`);
  } else {
    workspace.value = [
      {
        ...blade,
        componentOptions: {
          ...(blade.componentOptions || {}),
          ...(options || {}),
        },
        expanded: true,
        closable: false,
      },
    ];

    if (blade.url) {
      window?.history?.pushState(null, "", `/${blade.url}`);
    }
  }
};

/**
 * Init Vue3 plugin and register application globals.
 * @param app Application instande.
 * @param options Optional object with default options.
 * @returns Updated application instance.
 */
export function init(app: App, options?: IAppOptions): App {
  console.debug("[@virtoshell/core#useBlade:init] - Entry point");

  options?.blades?.forEach((blade) => registerBlade(blade));
  app.config.globalProperties.$openDashboard = openDashboard;
  app.config.globalProperties.$openWorkspace = openWorkspace;
  app.config.globalProperties.$openBlade = openBlade;
  app.config.globalProperties.$closeBlade = closeBlade;
  app.config.globalProperties.$expandBlade = expandBlade;
  app.config.globalProperties.$collapseBlade = collapseBlade;

  return app;
}

/**
 * Composable export.
 */
export default function useBlade() {
  console.debug("[@virtoshell/core#useBlade] - Entry point");

  return {
    registerBlade,
    openBlade,
    closeBlade,
    openWorkspace,
    openDashboard,
    expandBlade,
    collapseBlade,
    registry: computed(() => registry.value),
    workspace: computed(() => workspace.value),
  };
}
