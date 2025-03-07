import { App, Plugin } from "vue";
import { Router } from "vue-router";
import { ExtensionRegistry, createExtensionsHelper, registerModuleExtensions } from "./extensions-helper";
import { DynamicModulesKey } from "../../../injection-keys";

interface ModuleManifest {
  file: string;
  name: string;
  src: string;
  isEntry: boolean;
}

interface CssManifest {
  file: string;
  src: string;
}

interface Manifest {
  [key: string]: ModuleManifest | CssManifest;
}

interface Apps {
  [x: string]: {
    modules: { id: string; url: string }[];
  };
}

interface ModuleWithDefaultExport {
  default: {
    install: Plugin;
    extensions?: ExtensionRegistry;
  };
}

interface ModuleWithNamedExport {
  install: Plugin;
  extensions?: ExtensionRegistry;
}

type ModuleExports = ModuleWithDefaultExport | ModuleWithNamedExport;

function loadCSS(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve();
    link.onerror = (e) => reject(new Error(`Failed to load CSS: ${url}, error: ${e}`));
    document.head.appendChild(link);
  });
}

interface ModuleConfig {
  baseUrl: string;
  manifestFileName: string;
  entryPointKey: string;
}

const DEFAULT_CONFIG: Partial<ModuleConfig> = {
  manifestFileName: "manifest.json",
  entryPointKey: "isEntry",
};

export function useDynamicModules(
  app: App,
  { router, appName }: { router: Router; appName: string },
  config: Partial<ModuleConfig> = {},
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const loadedModules = new Set<string>();
  const extensionsHelper = createExtensionsHelper(app);

  async function load() {
    try {
      const appsUrl = finalConfig.baseUrl + "apps.json";
      const modules: Apps[] = await fetch(appsUrl).then((res) => res.json());

      const module = modules.find((module) => module[appName]);

      if (typeof module !== "undefined") {
        const appModules = module[appName]?.modules;

        if (!(appModules && appModules.length)) {
          throw new Error("Modules not found");
        }
        const manifestPromises = appModules.map(async (module) => {
          if (loadedModules.has(module.id)) {
            return null;
          }

          const moduleUrl = module.url.replace(/^([^/])/, "/$1").replace(/([^/])$/, "$1/");
          try {
            const response = await fetch(moduleUrl + finalConfig.manifestFileName);
            if (!response.ok) {
              throw new Error(`Failed to load manifest for module '{ ${module.id} }': ${response.statusText}`);
            }
            return {
              moduleId: module.id,
              moduleUrl,
              manifest: (await response.json()) as Manifest,
            };
          } catch (error) {
            console.error(error);
            return null;
          }
        });

        const manifestResults = await Promise.all(manifestPromises);
        const validManifests = manifestResults.filter(
          (result): result is NonNullable<typeof result> => result !== null,
        );

        for (const { moduleId, moduleUrl, manifest } of validManifests) {
          try {
            const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);
            if (!entry) {
              throw new Error(`Entry file not found for module ${moduleId}`);
            }

            const cssFiles = Object.values(manifest)
              .filter((file) => file.file.endsWith(".css"))
              .map((file) => loadCSS(moduleUrl + file.file));

            await Promise.all(cssFiles).catch((error) => {
              console.error(`Failed to load styles for module ${moduleId}:`, error);
            });

            await import(/* @vite-ignore */ moduleUrl + entry.file);

            if (typeof window !== "undefined" && window.VcShellDynamicModules) {
              Object.values(window.VcShellDynamicModules).forEach((mod) => {
                try {
                  const moduleExports = mod as ModuleExports;
                  const moduleToInstall = "default" in moduleExports ? moduleExports.default : moduleExports;

                  if ("install" in moduleToInstall) {
                    app.use(moduleToInstall.install as Plugin, { router });

                    if (moduleToInstall.extensions) {
                      registerModuleExtensions(app, moduleId, moduleToInstall.extensions);
                    }

                    loadedModules.add(moduleId);
                  } else {
                    console.error(`Module ${moduleId} does not have an 'install' function`);
                  }
                } catch (error) {
                  console.error(`Failed to register plugin for module ${moduleId}:`, error);
                }
              });
            }
          } catch (error) {
            console.error(`Failed to process module ${moduleId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load modules:", error);
    }

    app.config.globalProperties.$dynamicModules = {
      ...(app.config.globalProperties.$dynamicModules || {}),
      ...window.VcShellDynamicModules,
    };
    app.provide(DynamicModulesKey, app.config.globalProperties.$dynamicModules);
  }

  return {
    load,
    extensionsHelper,
  };
}
