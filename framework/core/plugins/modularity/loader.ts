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

      for (const module of modules) {
        const appModules = module[appName].modules;

        if (!appModules.length) {
          throw new Error("Modules not found");
        }

        for (const module of appModules) {
          const moduleUrl = module.url.replace(/^([^/])/, "/$1").replace(/([^/])$/, "$1/");
          const manifestResponse = await fetch(moduleUrl + "manifest.json");

          if (!manifestResponse.ok) {
            throw new Error(`Failed to load manifest: ${manifestResponse.statusText}`);
          }

          const manifest: Manifest = await manifestResponse.json();

          // Find entry point
          const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);

          if (!entry) {
            throw new Error("Entry file not found");
          }

          await Promise.all(
            Object.values(manifest)
              .filter((file) => file.file.endsWith(".css"))
              .map((file) => loadCSS(moduleUrl + `${file.file}`)),
          ).catch((error) => {
            console.error("Failed to load styles", error);
          });

          await import(/* @vite-ignore */ moduleUrl + entry.file).catch((error) => {
            console.error("Failed to load module", error);
          });

          Object.values(window.VcShellDynamicModules).forEach((mod) => {
            app.use((mod as Record<"default", Plugin>)?.default, { router });
          });

          app.config.globalProperties.$dynamicModules = window.VcShellDynamicModules;
          app.provide("$dynamicModules", app.config.globalProperties.$dynamicModules);
        }
      }
    } catch (error) {
      console.error("Failed to load modules", error);
    }
  }

  return {
    load,
  };
}
