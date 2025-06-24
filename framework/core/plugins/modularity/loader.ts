import { App, Plugin } from "vue";
import { Router } from "vue-router";
import { ExtensionRegistry, createExtensionsHelper, registerModuleExtensions } from "./extensions-helper";
import { DynamicModulesKey } from "../../../injection-keys";
import * as semver from "semver";
import { notification } from "../../../shared";

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

interface VersionManifest {
  file: string;
  src: string;
  isVersionInfo: boolean;
}

interface Manifest {
  [key: string]: ModuleManifest | CssManifest | VersionManifest;
}

interface VersionInfo {
  version: string;
  compatibleWith: {
    framework: string;
    modules?: Record<string, string>;
  };
  appCompatibility?: {
    [appName: string]: string;
  };
}

interface Apps {
  [x: string]: {
    modules: {
      id: string;
      url: string;
      version?: string;
    }[];
  };
}

interface ModuleWithDefaultExport {
  default: {
    install: Plugin;
    extensions?: ExtensionRegistry;
    version?: VersionInfo;
  };
}

interface ModuleWithNamedExport {
  install: Plugin;
  extensions?: ExtensionRegistry;
  version?: VersionInfo;
}

type ModuleExports = ModuleWithDefaultExport | ModuleWithNamedExport;

class VersionCompatibilityError extends Error {
  moduleId: string;
  details: {
    required: string;
    current: string;
    type: "framework" | "module";
    dependencyName?: string;
  };

  constructor(
    moduleId: string,
    details: {
      required: string;
      current: string;
      type: "framework" | "module";
      dependencyName?: string;
    },
  ) {
    let message;
    if (details.type === "framework") {
      message = `Module ${moduleId} requires framework version ${details.required}, but current is ${details.current}`;
    } else if (details.type === "module") {
      message = `Module ${moduleId} requires ${details.dependencyName} version ${details.required}, but current is ${details.current}`;
    } else {
      message = `Module ${moduleId} encountered an unknown compatibility issue.`;
    }

    super(message);
    this.moduleId = moduleId;
    this.details = details;
    this.name = "VersionCompatibilityError";
  }
}

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

async function loadVersionInfo(url: string): Promise<VersionInfo | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to load version info: ${response.statusText}`);
      return null;
    }
    return (await response.json()) as VersionInfo;
  } catch (error) {
    console.warn(`Error loading version info: ${error}`);
    return null;
  }
}

interface ModuleConfig {
  baseUrl: string;
  manifestFileName: string;
  entryPointKey: string;
  frameworkVersion: string;
  skipVersionCheck?: boolean;
}

const DEFAULT_CONFIG: Partial<ModuleConfig> = {
  manifestFileName: "manifest.json",
  entryPointKey: "isEntry",
  skipVersionCheck: false,
  frameworkVersion: "1.1.0",
};

function checkVersionCompatibility(
  moduleId: string,
  moduleVersion: VersionInfo | undefined,
  frameworkVersion: string,
  loadedModulesWithVersions: Map<string, string>,
): void {
  if (!moduleVersion) return;

  if (
    moduleVersion.compatibleWith.framework &&
    !semver.satisfies(frameworkVersion, moduleVersion.compatibleWith.framework)
  ) {
    console.error(
      `Module ${moduleId} requires framework version ${moduleVersion.compatibleWith.framework}, but current framework version is ${frameworkVersion}.`,
    );
    notification.error(
      `Module ${moduleId} requires framework version ${moduleVersion.compatibleWith.framework}, but current framework version is ${frameworkVersion}.`,
    );
    throw new VersionCompatibilityError(moduleId, {
      required: moduleVersion.compatibleWith.framework,
      current: frameworkVersion,
      type: "framework",
    });
  }

  if (moduleVersion.compatibleWith.modules) {
    for (const [depModuleId, versionRange] of Object.entries(moduleVersion.compatibleWith.modules)) {
      const loadedDepVersion = loadedModulesWithVersions.get(depModuleId);

      if (!loadedDepVersion) {
        console.warn(`Module ${moduleId} depends on ${depModuleId}, but it is not loaded yet.`);
        continue;
      }

      if (!semver.satisfies(loadedDepVersion, versionRange)) {
        console.error(
          `Module ${moduleId} requires ${depModuleId} version ${versionRange}, but loaded version is ${loadedDepVersion}.`,
        );
        notification.error(
          `Module ${moduleId} requires ${depModuleId} version ${versionRange}, but loaded version is ${loadedDepVersion}.`,
        );
        throw new VersionCompatibilityError(moduleId, {
          required: versionRange,
          current: loadedDepVersion,
          type: "module",
          dependencyName: depModuleId,
        });
      }
    }
  }
}

export function useDynamicModules(
  app: App,
  { router, appName }: { router: Router; appName: string },
  config: Partial<ModuleConfig> = {},
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!config.frameworkVersion && finalConfig.frameworkVersion) {
    console.warn(
      `Framework version not specified in the configuration, using default ${finalConfig.frameworkVersion}. This may cause compatibility issues with modules.`,
    );
  }

  const loadedModules = new Set<string>();
  const loadedModulesWithVersions = new Map<string, string>();
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
              moduleVersion: module.version,
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

        for (const { moduleId, moduleUrl, manifest, moduleVersion } of validManifests) {
          try {
            const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);
            if (!entry) {
              throw new Error(`Entry file not found for module ${moduleId}`);
            }

            const versionFile = Object.values(manifest).find((file) => (file as VersionManifest).isVersionInfo) as
              | VersionManifest
              | undefined;

            let versionInfoFromFile: VersionInfo | null = null;
            if (versionFile) {
              versionInfoFromFile = await loadVersionInfo(moduleUrl + versionFile.file);
              if (versionInfoFromFile) {
                console.info(`Loaded version info for module ${moduleId}: v${versionInfoFromFile.version}`);
              }
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
                    if (!finalConfig.skipVersionCheck) {
                      const versionInfo =
                        moduleToInstall.version ||
                        versionInfoFromFile ||
                        (moduleVersion
                          ? {
                              version: moduleVersion,
                              compatibleWith: { framework: "*" },
                            }
                          : undefined);

                      if (versionInfo) {
                        try {
                          checkVersionCompatibility(
                            moduleId,
                            versionInfo,
                            finalConfig.frameworkVersion || "0.0.0",
                            loadedModulesWithVersions,
                          );

                          loadedModulesWithVersions.set(moduleId, versionInfo.version);
                        } catch (versionError) {
                          if (versionError instanceof VersionCompatibilityError) {
                            console.error(`Version compatibility error: ${versionError.message}`);
                            console.error(`Skipping installation of incompatible module: ${moduleId}`);
                            return;
                          } else {
                            throw versionError;
                          }
                        }
                      }
                    }

                    app.use(moduleToInstall.install as Plugin, { router });

                    if (moduleToInstall.extensions) {
                      registerModuleExtensions(app, moduleId, moduleToInstall.extensions);
                    }

                    loadedModules.add(moduleId);

                    if (moduleToInstall.version) {
                      console.info(`Module ${moduleId} v${moduleToInstall.version.version} loaded successfully`);
                    } else if (versionInfoFromFile) {
                      console.info(`Module ${moduleId} v${versionInfoFromFile.version} loaded successfully`);
                    } else if (moduleVersion) {
                      console.info(`Module ${moduleId} v${moduleVersion} loaded successfully`);
                    } else {
                      console.info(`Module ${moduleId} loaded successfully (no version info)`);
                    }
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
    getLoadedModulesWithVersions: () => new Map(loadedModulesWithVersions),
  };
}
