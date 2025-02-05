import { App, computed, ComputedRef, InjectionKey } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $extensions: ExtensionRegistry;
  }
}

export interface ExtensionPoint {
  id: string;
  component: unknown;
}

export interface ComposableFunction {
  id: string;
  fn: (...args: unknown[]) => unknown;
}

export type Extension = Record<string, unknown>;

export interface ExtensionRegistry {
  inbound: {
    [namespace: string]: {
      [extensionPoint: string]: Extension;
    };
  };
  outbound: {
    [namespace: string]: {
      [extensionPoint: string]: ExtensionPoint[] | ComposableFunction[] | Extension;
    };
  };
}

export interface ExtensionNamespace {
  [point: string]: ExtensionPoint[] | ComposableFunction[] | Extension;
}

export interface ExtensionsHelper {
  getInboundExtensions(namespace: string, point?: string): Extension;
  getOutboundExtensions(point: string): (ExtensionPoint | ComposableFunction | Extension)[];
  getModuleExtensions(namespace: string): {
    inbound: Record<string, Extension>;
    outbound: Record<string, ExtensionPoint[] | ComposableFunction[] | Extension>;
  };
  extensions: ComputedRef<ExtensionRegistry>;
}

export const extensionsHelperSymbol = Symbol("extensionsHelper") as InjectionKey<ExtensionsHelper>;

export function createExtensionsHelper(app: App): ExtensionsHelper {
  if (!app.config.globalProperties.$extensions) {
    app.config.globalProperties.$extensions = {
      inbound: {},
      outbound: {},
    } as ExtensionRegistry;
  }

  const helper: ExtensionsHelper = {
    getInboundExtensions(namespace: string, point?: string) {
      return point
        ? app.config.globalProperties.$extensions.inbound[namespace][point]
        : app.config.globalProperties.$extensions.inbound[namespace];
    },

    getOutboundExtensions(point: string) {
      const result: (ExtensionPoint | ComposableFunction | Extension)[] = [];
      Object.values(app.config.globalProperties.$extensions.outbound).forEach((namespace: unknown) => {
        const typedNamespace = namespace as ExtensionNamespace;
        if (typedNamespace[point]) {
          const extension = typedNamespace[point];
          if (Array.isArray(extension)) {
            result.push(...extension);
          } else if (
            typeof extension === "object" &&
            "id" in extension &&
            "fn" in extension &&
            typeof extension.fn === "function"
          ) {
            result.push(extension);
          } else if (typeof extension === "object") {
            result.push(extension as Extension);
          }
        }
      });

      return result;
    },

    getModuleExtensions(namespace: string) {
      return {
        inbound: app.config.globalProperties.$extensions.inbound[namespace] || {},
        outbound: app.config.globalProperties.$extensions.outbound[namespace] || {},
      };
    },

    extensions: computed(() => app.config.globalProperties.$extensions),
  };

  // Provide access to extensions through provide/inject
  app.provide(extensionsHelperSymbol, helper);

  // Provide direct access to extensions
  app.provide("$extensions", app.config.globalProperties.$extensions);

  return helper;
}

export function registerModuleExtensions(app: App, moduleId: string, extensions: ExtensionRegistry) {
  if (!app.config.globalProperties.$extensions) {
    app.config.globalProperties.$extensions = {
      inbound: {},
      outbound: {},
    } as ExtensionRegistry;
  }

  const { inbound, outbound } = app.config.globalProperties.$extensions;

  // Register inbound extensions
  registerInboundExtensions(inbound, moduleId, extensions);

  // Register outbound extensions
  registerOutboundExtensions(outbound, moduleId, extensions);
}

function registerInboundExtensions(
  inbound: ExtensionRegistry["inbound"],
  moduleId: string,
  extensions: ExtensionRegistry,
) {
  if (!inbound[moduleId]) {
    inbound[moduleId] = {};
  }

  Object.entries(extensions.inbound || {}).forEach(([point, extension]) => {
    if (typeof extension !== "object" || Array.isArray(extension)) {
      console.warn(
        `Invalid inbound extension type for point "${point}" in module "${moduleId}". Inbound extensions must be objects.`,
      );
      return;
    }

    inbound[moduleId][point] = {
      ...(inbound[moduleId][point] || {}),
      ...extension,
    };
  });
}

function registerOutboundExtensions(
  outbound: ExtensionRegistry["outbound"],
  moduleId: string,
  extensions: ExtensionRegistry,
) {
  if (!outbound[moduleId]) {
    outbound[moduleId] = {};
  }

  Object.entries(extensions.outbound || {}).forEach(([point, extension]) => {
    initializeExtensionPoint(outbound[moduleId], point, extension);
    mergeExtension(outbound[moduleId], point, extension);
  });
}

function initializeExtensionPoint(
  moduleOutbound: ExtensionRegistry["outbound"][string],
  point: string,
  extension: ExtensionPoint[] | ComposableFunction | Extension,
) {
  if (!moduleOutbound[point]) {
    if (Array.isArray(extension)) {
      moduleOutbound[point] = [];
    } else if (typeof extension === "object" && "fn" in extension) {
      moduleOutbound[point] = [];
    } else if (typeof extension === "object") {
      moduleOutbound[point] = {};
    }
  }
}

function isComposableFunction(value: unknown): value is ComposableFunction {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "fn" in value &&
    typeof (value as ComposableFunction).fn === "function"
  );
}

function mergeExtension(
  moduleOutbound: ExtensionRegistry["outbound"][string],
  point: string,
  extension: ExtensionPoint[] | ComposableFunction | Extension,
) {
  if (Array.isArray(extension) && Array.isArray(moduleOutbound[point])) {
    (moduleOutbound[point] as ExtensionPoint[]).push(...(extension as ExtensionPoint[]));
  } else if (isComposableFunction(extension) && Array.isArray(moduleOutbound[point])) {
    (moduleOutbound[point] as ComposableFunction[]).push(extension);
  } else if (isObjectExtension(extension) && isObjectExtension(moduleOutbound[point])) {
    moduleOutbound[point] = {
      ...(moduleOutbound[point] as Extension),
      ...extension,
    };
  }
}

function isObjectExtension(value: unknown): value is Extension {
  return typeof value === "object" && !Array.isArray(value);
}
