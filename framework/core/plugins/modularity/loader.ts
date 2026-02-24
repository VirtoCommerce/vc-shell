import { App, Plugin } from "vue";
import { Router } from "vue-router";
import { DynamicModulesKey } from "@framework/injection-keys";
import * as semver from "semver";
import { notification } from "@shared/components/notifications/core";
import { createLogger } from "@core/utilities";

const logger = createLogger("module-loader");

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
      hash?: string;
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

async function loadVersionInfo(url: string, options?: RequestInit): Promise<VersionInfo | null> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      logger.warn(`Failed to load version info: ${response.statusText}`);
      return null;
    }
    return (await response.json()) as VersionInfo;
  } catch (error) {
    logger.warn(`Error loading version info: ${error}`);
    return null;
  }
}

function sanitizeFileToken(value: string): string {
  const safeValue = value.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safeValue || "unknown";
}

function appendQueryParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

function hashString(value: string): string {
  // Fast deterministic hash for cache keys in browser runtime.
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function normalizeModuleUrl(url: string): string {
  return url.replace(/^([^/])/, "/$1").replace(/([^/])$/, "$1/");
}

interface ModuleConfig {
  baseUrl: string;
  manifestFileName: string;
  entryPointKey: string;
  frameworkVersion: string;
  skipVersionCheck?: boolean;
  forceFreshAssets?: boolean;
}

const DEFAULT_CONFIG: Partial<ModuleConfig> = {
  manifestFileName: "manifest.json",
  entryPointKey: "isEntry",
  skipVersionCheck: false,
  frameworkVersion: "1.1.0",
  forceFreshAssets: true,
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
    logger.error(
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
        logger.warn(`Module ${moduleId} depends on ${depModuleId}, but it is not loaded yet.`);
        continue;
      }

      if (!semver.satisfies(loadedDepVersion, versionRange, { includePrerelease: true })) {
        logger.error(
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
    logger.warn(
      `Framework version not specified in the configuration, using default ${finalConfig.frameworkVersion}. This may cause compatibility issues with modules.`,
    );
  }

  const loadedModules = new Set<string>();
  const loadedModulesWithVersions = new Map<string, string>();

  async function load() {
    try {
      const shouldForceFreshAssets = finalConfig.forceFreshAssets !== false;
      const requestTimestamp = Date.now().toString();
      const fetchOptions: RequestInit | undefined = shouldForceFreshAssets ? { cache: "no-store" } : undefined;
      const withCacheBust = (url: string, cacheKey?: string) =>
        shouldForceFreshAssets ? appendQueryParam(url, "v", cacheKey ?? requestTimestamp) : url;

      const appsUrl = withCacheBust(finalConfig.baseUrl + "apps.json");
      const modules: Apps[] = await fetch(appsUrl, fetchOptions).then((res) => res.json());

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

          const moduleUrl = normalizeModuleUrl(module.url);
          const manifestRequestCacheKey = module.hash || module.version || requestTimestamp;
          const manifestCandidates = [
            ...(module.hash ? [`manifest.${sanitizeFileToken(module.hash)}.json`] : []),
            ...(module.version ? [`manifest.${sanitizeFileToken(module.version)}.json`] : []),
            finalConfig.manifestFileName,
          ];
          try {
            let manifest: Manifest | null = null;
            let moduleCacheKey = manifestRequestCacheKey;

            for (const manifestFileName of manifestCandidates) {
              const manifestUrl = withCacheBust(moduleUrl + manifestFileName, manifestRequestCacheKey);
              const response = await fetch(manifestUrl, fetchOptions);
              if (response.ok) {
                const manifestText = await response.text();
                manifest = JSON.parse(manifestText) as Manifest;
                moduleCacheKey = module.hash || hashString(manifestText) || requestTimestamp;
                break;
              }

              if (response.status !== 404) {
                logger.warn(
                  `Failed to load manifest '${manifestFileName}' for module '{ ${module.id} }': ${response.statusText}`,
                );
              }
            }

            if (!manifest) {
              throw new Error(`Failed to load manifest for module '{ ${module.id} }'`);
            }

            return {
              moduleId: module.id,
              moduleUrl,
              moduleVersion: module.version,
              moduleCacheKey,
              manifest,
            };
          } catch (error) {
            logger.error("Error loading module manifest:", error);
            return null;
          }
        });

        const manifestResults = await Promise.all(manifestPromises);
        const validManifests = manifestResults.filter(
          (result): result is NonNullable<typeof result> => result !== null,
        );

        // Parallel loading of all modules
        const moduleLoadPromises = validManifests.map(
          async ({ moduleId, moduleUrl, manifest, moduleVersion, moduleCacheKey }) => {
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
                versionFile
                  ? loadVersionInfo(withCacheBust(moduleUrl + versionFile.file, moduleCacheKey), fetchOptions)
                  : Promise.resolve(null),
                // Load CSS files in parallel
                Promise.all(
                  Object.values(manifest)
                    .filter((file) => file.file.endsWith(".css"))
                    .map((file) => loadCSS(withCacheBust(moduleUrl + file.file, moduleCacheKey))),
                ).catch((error) => {
                  logger.error(`Failed to load styles for module ${moduleId}:`, error);
                }),
              ]);

              if (versionInfoFromFile) {
                logger.info(`Loaded version info for module ${moduleId}: v${versionInfoFromFile.version}`);
              }

              // Import module
              await import(/* @vite-ignore */ withCacheBust(moduleUrl + entry.file, moduleCacheKey));

              return {
                moduleId,
                moduleUrl,
                moduleVersion,
                versionInfoFromFile,
                success: true,
              };
            } catch (error) {
              logger.error(`Failed to load module ${moduleId}:`, error);
              return {
                moduleId,
                moduleUrl,
                moduleVersion,
                versionInfoFromFile: null,
                success: false,
                error,
              };
            }
          },
        );

        // Wait for all modules to be loaded
        const moduleLoadResults = await Promise.all(moduleLoadPromises);

        // Create a map for easy lookup of load results
        const loadResultsMap = new Map(
          moduleLoadResults.filter((result) => result.success).map((result) => [result.moduleId, result]),
        );

        logger.debug("LoadResultsMap keys:", Array.from(loadResultsMap.keys()));

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
          logger.debug("All modules are already registered, proceeding with installation");
        } else {
          logger.debug(`Waiting for ${expectedModuleIds.length} modules to register:`, expectedModuleIds);

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
                logger.debug("All modules are registered, proceeding with installation");
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
                logger.debug(
                  `Attempt ${attempts + 1}: Available modules:`,
                  availableModules,
                  `(${availableModules.length}/${expectedModuleIds.length})`,
                );

                if (checkAndResolve()) return;

                attempts++;
                await new Promise((r) => setTimeout(r, 100));
              }

              logger.warn("Timeout waiting for all modules to register, proceeding with available modules");
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

        logger.debug(
          `Found ${modulesToProcess.length} modules to process:`,
          modulesToProcess.map(([name]) => name),
        );

        for (const [moduleName, moduleObject] of modulesToProcess) {
          if (loadedModules.has(moduleName)) {
            logger.debug(`Skipping already loaded module: ${moduleName}`);
            continue;
          }

          logger.debug(`Processing module: ${moduleName}`);

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

          logger.debug(`Module ${moduleName} exports:`, Object.keys(moduleObject));
          logger.debug(`Module ${moduleName} has install function:`, !!mainModule);

          if (mainModule) {
            const moduleVersionInfo = (mainModule as ModuleWithNamedExport).version || versionFromFile;

            try {
              if (!finalConfig.skipVersionCheck) {
                logger.debug(
                  `Checking compatibility for ${moduleName} (version: ${moduleVersionInfo?.version || "N/A"})`,
                );
                checkVersionCompatibility(
                  moduleName,
                  moduleVersionInfo,
                  finalConfig.frameworkVersion || "0.0.0",
                  loadedModulesWithVersions,
                );
              }

              logger.debug(`Installing module: ${moduleName}`, {
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

              logger.info(
                `Module ${moduleName} installed successfully (version: ${
                  moduleVersionInfo?.version || "no version info"
                })`,
              );
            } catch (e) {
              if (e instanceof VersionCompatibilityError) {
                logger.error(`Compatibility error in module ${e.moduleId}:`, e.details);
              } else {
                logger.error(`Failed to install module ${moduleName}:`, e);
                notification.error(`Failed to install module ${moduleName}`);
              }
            }
          } else {
            logger.error(`Module ${moduleName} does not have an 'install' function`);
            notification.error(
              `Module ${moduleName} is not a valid module because it does not have an 'install' function.`,
            );
          }
        }

        logger.debug("Final loadedModules set:", Array.from(loadedModules));
      }
    } catch (error) {
      logger.error("Failed to load modules:", error);
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
