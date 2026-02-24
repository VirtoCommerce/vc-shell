import { defineConfig, UserConfig } from "vite";
import { resolve, join } from "node:path";
import { cwd } from "node:process";
import fs from "node:fs";
import { createHash } from "node:crypto";
import vue from "@vitejs/plugin-vue";

// Default external dependencies
const DEFAULT_EXTERNALS = [
  "vue",
  "vue-router",
  "vee-validate",
  "vue-i18n",
  "moment",
  "lodash-es",
  "@vueuse/core",
  "@vc-shell/framework",
];

function sanitizeFileToken(value: string): string {
  const safeValue = value.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safeValue || "unknown";
}

/**
 * Creates a Vite configuration for building dynamic modules
 */
export default function dynamicModuleConfiguration(
  pkg: { name: string; version: string; dependencies?: Record<string, string> },
  options: UserConfig & {
    entry?: string;
    outDir?: string;
    moduleName?: string;
    compatibility: {
      framework: string;
      modules?: Record<string, string>;
    };
    externals?: string[];
  },
) {
  const { name, version, dependencies = {} } = pkg;

  // Validate required compatibility settings
  if (!options.compatibility || !options.compatibility.framework) {
    throw new Error("Required compatibility options are missing. You must specify compatibility.framework value.");
  }

  // Extract customization options with defaults
  const {
    entry = "./index.ts",
    outDir = "dist/packages/modules",
    moduleName = "VcShellDynamicModules",
    compatibility,
    externals = [],
  } = options;

  // Generate unique UMD name based on package name to avoid conflicts
  const uniqueModuleName = `VcShellModule_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Merge default externals with custom ones
  const allExternals = [...DEFAULT_EXTERNALS, ...externals, /node_modules/];
  return defineConfig({
    build: {
      manifest: "manifest.json",
      copyPublicDir: false,
      sourcemap: true,
      minify: false,
      lib: {
        entry: resolve(cwd(), entry),
        fileName: (_, name) => `${name}.js`,
        formats: ["umd"],
        name: uniqueModuleName,
      },
      outDir: join(cwd(), outDir),
      rollupOptions: {
        output: {
          // Hash-based names prevent stale assets even when semantic version is unchanged.
          entryFileNames: "[name]-[hash].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash].[ext]",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter",
            "vee-validate": "VeeValidate",
            "vue-i18n": "VueI18n",
            moment: "moment",
            "lodash-es": "_",
            "@vueuse/core": "VueUse",
            "@vc-shell/framework": "VcShellFramework",
          },
          // Add version information to generated code
          banner: () => {
            const versionInfo = {
              version,
              compatibleWith: {
                framework: compatibility.framework,
                modules: compatibility.modules || {},
              },
            };

            return `
              /* Module Version Info */
              (function() {
                if (typeof window !== 'undefined') {
                  window.__VC_SHELL_MODULE_VERSION_INFO__ = window.__VC_SHELL_MODULE_VERSION_INFO__ || {};
                  window.__VC_SHELL_MODULE_VERSION_INFO__["${name}"] = ${JSON.stringify(versionInfo)};
                }
              })();
            `;
          },
          // Add footer to properly register module in global scope
          footer: () => {
            return `
              /* Module Registration */
              (function() {
                if (typeof window !== 'undefined' && typeof ${uniqueModuleName} !== 'undefined') {
                  // Ensure global object exists
                  if (!window.VcShellDynamicModules) {
                    window.VcShellDynamicModules = {};
                  }

                  // Register module with unique name to avoid conflicts
                  window.VcShellDynamicModules["${name}"] = ${uniqueModuleName};
                  console.log('Registered module: ${name}');

                  // Dispatch custom event to notify that module is registered
                  if (typeof CustomEvent !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('vc-shell-module-registered', {
                      detail: { moduleName: '${name}', moduleObject: ${uniqueModuleName} }
                    }));
                  }

                  // For debugging: log the current state
                  console.log('Current VcShellDynamicModules:', Object.keys(window.VcShellDynamicModules));
                }
              })();
            `;
          },
        },
        external: allExternals,
      },
    },
    plugins: [
      vue(),
      {
        name: "module-version-plugin",
        apply: "build",
        enforce: "post",

        // Modify manifest.json after it is created
        closeBundle: async () => {
          const manifestPath = join(cwd(), outDir, "manifest.json");

          if (fs.existsSync(manifestPath)) {
            try {
              // Read generated manifest
              const manifestContent = await fs.promises.readFile(manifestPath, "utf-8");
              const manifest = JSON.parse(manifestContent);
              const manifestHash = sanitizeFileToken(createHash("sha256").update(manifestContent).digest("hex").slice(0, 12));
              const hashedManifestFileName = `manifest.${manifestHash}.json`;
              const hashedManifestPath = join(cwd(), outDir, hashedManifestFileName);

              // Add file with metadata about version
              const versionFileName = `version.${manifestHash}.json`;
              const versionFilePath = join(cwd(), outDir, versionFileName);

              // Create information about version
              const versionInfo = {
                version,
                compatibleWith: {
                  framework: compatibility.framework,
                  modules: compatibility.modules || {},
                },
              };

              // Write file with version
              await fs.promises.writeFile(versionFilePath, JSON.stringify(versionInfo, null, 2));

              // Remove stale version metadata records from previous builds.
              for (const key of Object.keys(manifest)) {
                if (manifest[key]?.isVersionInfo) {
                  delete manifest[key];
                }
              }

              // Add information about version file to manifest
              manifest[versionFileName] = {
                file: versionFileName,
                src: versionFileName,
                isVersionInfo: true, // Add special marker
              };

              const serializedManifest = JSON.stringify(manifest, null, 2);

              // Write updated default manifest for backward compatibility
              await fs.promises.writeFile(manifestPath, serializedManifest);

              // Write hash-based manifest for deployments that expose build hash in apps.json.
              await fs.promises.writeFile(hashedManifestPath, serializedManifest);

              console.log(
                `✓ Version information added to manifests: ${manifestPath}, ${hashedManifestFileName}`,
              );
            } catch (error) {
              console.error("Error updating manifest with version info:", error);
            }
          } else {
            console.warn(`Manifest file not found at ${manifestPath}`);
          }
        },
      },
    ],
  });
}
