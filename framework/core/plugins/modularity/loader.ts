import { App, Plugin } from "vue";
import { Router } from "vue-router";
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
    version?: VersionInfo;
  };
}

interface ModuleWithNamedExport {
  install: Plugin;
  version?: VersionInfo;
}

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
    !semver.satisfies(frameworkVersion, moduleVersion.compatibleWith.framework, { includePrerelease: true })
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

      if (!semver.satisfies(loadedDepVersion, versionRange, { includePrerelease: true })) {
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

/**
 * Recursively searches for a module with an 'install' function.
 *
 * This function is designed to handle various module export structures,
 * including default exports, named exports, or nested objects, ensuring
 * the installable part of a module is always found.
 *
 * @param module - The module object to search within.
 * @returns The sub-module containing the 'install' function, or null if not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getModuleInstall(module: any): { install: Plugin } | null {
  if (!module) {
    return null;
  }

  // Case 1: The module itself has an 'install' function (most common for simple modules).
  if (typeof module.install === "function") {
    return module;
  }

  // Case 2: The module uses a 'default' export which may contain the 'install' function.
  if (module.default && typeof module.default.install === "function") {
    return module.default;
  }

  // Case 3: The module is an object containing other objects, one of which might be the installable module.
  // This handles complex exports where the installable part is a named export.
  if (typeof module === "object") {
    for (const key of Object.keys(module)) {
      const nestedModule = getModuleInstall(module[key]);
      if (nestedModule) {
        return nestedModule;
      }
    }
  }

  return null;
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

        // Parallel loading of all modules
        const moduleLoadPromises = validManifests.map(async ({ moduleId, moduleUrl, manifest, moduleVersion }) => {
          try {
            const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);
            if (!entry) {
              throw new Error(`Entry file not found for module ${moduleId}`);
            }

            const versionFile = Object.values(manifest).find((file) => (file as VersionManifest).isVersionInfo) as
              | VersionManifest
              | undefined;

            // Load version info and CSS in parallel
            const [versionInfoFromFile] = await Promise.all([
              versionFile ? loadVersionInfo(moduleUrl + versionFile.file) : Promise.resolve(null),
              // Load CSS files in parallel
              Promise.all(
                Object.values(manifest)
                  .filter((file) => file.file.endsWith(".css"))
                  .map((file) => loadCSS(moduleUrl + file.file)),
              ).catch((error) => {
                console.error(`Failed to load styles for module ${moduleId}:`, error);
              }),
            ]);

            if (versionInfoFromFile) {
              console.info(`Loaded version info for module ${moduleId}: v${versionInfoFromFile.version}`);
            }

            // Import module
            await import(/* @vite-ignore */ moduleUrl + entry.file);

            return {
              moduleId,
              moduleUrl,
              moduleVersion,
              versionInfoFromFile,
              success: true,
            };
          } catch (error) {
            console.error(`Failed to load module ${moduleId}:`, error);
            return {
              moduleId,
              moduleUrl,
              moduleVersion,
              versionInfoFromFile: null,
              success: false,
              error,
            };
          }
        });

        // Wait for all modules to be loaded
        const moduleLoadResults = await Promise.all(moduleLoadPromises);

        // Create a map for easy lookup of load results
        const loadResultsMap = new Map(
          moduleLoadResults.filter((result) => result.success).map((result) => [result.moduleId, result]),
        );

        console.log("🔍 LoadResultsMap keys:", Array.from(loadResultsMap.keys()));

        // Wait for all modules to register themselves in the global scope
        const expectedModuleIds = Array.from(loadResultsMap.keys());

        const getAvailableModules = () =>
          typeof window !== "undefined" && window.VcShellDynamicModules
            ? Object.keys(window.VcShellDynamicModules)
            : [];

        const isModuleRegistered = (moduleId: string, availableModules: string[]) =>
          availableModules.some(
            (registeredId) =>
              registeredId === moduleId || registeredId.includes(moduleId) || moduleId.includes(registeredId),
          );

        const areAllModulesRegistered = () => {
          const availableModules = getAvailableModules();
          return (
            expectedModuleIds.length > 0 &&
            expectedModuleIds.every((moduleId) => isModuleRegistered(moduleId, availableModules)) &&
            availableModules.length > 0
          );
        };

        // Check if modules are already registered
        if (areAllModulesRegistered()) {
          console.log("✅ All modules are already registered, proceeding with installation");
        } else {
          console.log(`🔍 Waiting for ${expectedModuleIds.length} modules to register:`, expectedModuleIds);

          // Wait for module registration with timeout
          await new Promise<void>((resolve) => {
            let timeoutId: NodeJS.Timeout | null = null;
            let eventListener: EventListener | null = null;
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait time

            const cleanup = () => {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              if (eventListener && typeof window !== "undefined") {
                window.removeEventListener("vc-shell-module-registered", eventListener);
              }
            };

            const checkAndResolve = () => {
              if (areAllModulesRegistered()) {
                console.log("✅ All modules are registered, proceeding with installation");
                cleanup();
                resolve();
                return true;
              }
              return false;
            };

            // Set up event listener for immediate response
            if (typeof window !== "undefined") {
              eventListener = () => checkAndResolve();
              window.addEventListener("vc-shell-module-registered", eventListener);
            }

            // Fallback polling with timeout
            const poll = async () => {
              while (attempts < maxAttempts) {
                const availableModules = getAvailableModules();
                console.log(
                  `🔍 Attempt ${attempts + 1}: Available modules:`,
                  availableModules,
                  `(${availableModules.length}/${expectedModuleIds.length})`,
                );

                if (checkAndResolve()) return;

                attempts++;
                await new Promise((r) => setTimeout(r, 100));
              }

              console.warn("⚠️ Timeout waiting for all modules to register, proceeding with available modules");
              cleanup();
              resolve();
            };

            poll();
          });
        }

        const moduleVersions = new Map<string, VersionInfo>();
        for (const [moduleId, result] of loadResultsMap.entries()) {
          if (result.versionInfoFromFile) {
            moduleVersions.set(moduleId, result.versionInfoFromFile);
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modulesToProcess: [string, any][] = Object.entries(window.VcShellDynamicModules || {});

        console.log(
          `🚀 Found ${modulesToProcess.length} modules to process:`,
          modulesToProcess.map(([name]) => name),
        );

        for (const [moduleName, moduleObject] of modulesToProcess) {
          if (loadedModules.has(moduleName)) {
            console.log(`⏭️ Skipping already loaded module: ${moduleName}`);
            continue;
          }

          console.log(`📦 Processing module: ${moduleName}`);

          // Try to find the corresponding load result by matching module names
          const loadResult =
            loadResultsMap.get(moduleName) ||
            Array.from(loadResultsMap.entries()).find(
              ([moduleId]) => moduleId.includes(moduleName) || moduleName.includes(moduleId),
            )?.[1];

          const versionFromFile =
            moduleVersions.get(moduleName) ||
            Array.from(moduleVersions.entries()).find(
              ([moduleId]) => moduleId.includes(moduleName) || moduleName.includes(moduleId),
            )?.[1];

          const mainModule = getModuleInstall(moduleObject);

          console.log(`🔍 Module ${moduleName} exports:`, Object.keys(moduleObject));
          console.log(`🔍 Module ${moduleName} has install function:`, !!mainModule);

          if (mainModule) {
            const moduleVersionInfo = (mainModule as ModuleWithNamedExport).version || versionFromFile;

            try {
              if (!finalConfig.skipVersionCheck) {
                console.log(
                  `🔎 Checking compatibility for ${moduleName} (version: ${moduleVersionInfo?.version || "N/A"})`,
                );
                checkVersionCompatibility(
                  moduleName,
                  moduleVersionInfo,
                  finalConfig.frameworkVersion || "0.0.0",
                  loadedModulesWithVersions,
                );
              }

              console.log(`🔧 Installing module: ${moduleName}`, {
                hasLoadResult: !!loadResult,
                versionFromFile: versionFromFile?.version,
                moduleVersion: moduleVersionInfo?.version,
              });

              // Install the module plugin
              app.use(mainModule.install, { router });

              // Track loaded module
              loadedModules.add(moduleName);
              if (moduleVersionInfo?.version) {
                loadedModulesWithVersions.set(moduleName, moduleVersionInfo.version);
              }

              console.log(
                `✅ Module ${moduleName} installed successfully (version: ${
                  moduleVersionInfo?.version || "no version info"
                })`,
              );
            } catch (e) {
              if (e instanceof VersionCompatibilityError) {
                console.error(`Compatibility error in module ${e.moduleId}:`, e.details);
              } else {
                console.error(`Failed to install module ${moduleName}:`, e);
                notification.error(`Failed to install module ${moduleName}`);
              }
            }
          } else {
            console.error(`❌ Module ${moduleName} does not have an 'install' function`);
            notification.error(
              `Module ${moduleName} is not a valid module because it does not have an 'install' function.`,
            );
          }
        }

        console.log("🏁 Final loadedModules set:", Array.from(loadedModules));
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
    getLoadedModulesWithVersions: () => new Map(loadedModulesWithVersions),
  };
}
