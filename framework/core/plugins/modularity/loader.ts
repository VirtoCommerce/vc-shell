import { App, Plugin } from "vue";
import { Router } from "vue-router";

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

function loadCSS(url: string) {
  return new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
    document.head.appendChild(link);
  });
}

export function useDynamicModules(app: App, { router, appName }: { router: Router; appName: string }) {
  async function load() {
    try {
      const appsUrl = "/Modules/$(VirtoCommerce.MarketplaceVendor)/Content/apps.json";
      const modules: Apps[] = await fetch(appsUrl).then((res) => res.json());

      const module = modules.find((module) => module[appName]);

      if (typeof module !== "undefined") {
        const appModules = module[appName]?.modules;

        if (!(appModules && appModules.length)) {
          throw new Error("Modules not found");
        }

        for (const module of appModules) {
          try {
            const moduleUrl = module.url.replace(/^([^/])/, "/$1").replace(/([^/])$/, "$1/");
            const manifestResponse = await fetch(moduleUrl + "manifest.json");

            if (!manifestResponse.ok) {
              console.error(`Failed to load manifest for module ${module.id}:`, manifestResponse.statusText);
              continue;
            }

            const manifest: Manifest = await manifestResponse.json();

            // Find entry point
            const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);

            if (!entry) {
              console.error(`Entry file not found for module ${module.id}`);
              continue;
            }

            // Load CSS files
            await Promise.all(
              Object.values(manifest)
                .filter((file) => file.file.endsWith(".css"))
                .map((file) => loadCSS(moduleUrl + `${file.file}`)),
            ).catch((error) => {
              console.error(`Failed to load styles for module ${module.id}:`, error);
            });

            // Load module
            await import(/* @vite-ignore */ moduleUrl + entry.file).catch((error) => {
              console.error(`Failed to load module ${module.id}:`, error);
              return; // Skip to next module
            });

            // Register plugins
            Object.values(window.VcShellDynamicModules).forEach((mod) => {
              try {
                app.use((mod as Record<"default", Plugin>)?.default, { router });
              } catch (error) {
                console.error(`Failed to register plugin for module ${module.id}:`, error);
              }
            });

            app.config.globalProperties.$dynamicModules = {
              ...(app.config.globalProperties.$dynamicModules || {}),
              ...window.VcShellDynamicModules,
            };
            app.provide("$dynamicModules", app.config.globalProperties.$dynamicModules);
          } catch (error) {
            console.error(`Failed to process module ${module.id}:`, error);
            continue; // Skip to next module
          }
        }
      }
    } catch (error) {
      console.error("Failed to load modules:", error);
    }
  }

  return {
    load,
  };
}
