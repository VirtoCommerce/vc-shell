import { defineConfig, UserConfig } from "vite";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cwd } from "node:process";
import fs from "node:fs";
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

  // Merge default externals with custom ones
  const allExternals = [...DEFAULT_EXTERNALS, ...externals, /node_modules/];
  console.log(resolve(cwd(), entry), cwd(), entry);
  return defineConfig({
    build: {
      manifest: "manifest.json",
      copyPublicDir: false,
      sourcemap: true,
      minify: false,
      lib: {
        entry: resolve(cwd(), entry),
        fileName: (format, name) => `${name}.js`,
        formats: ["umd"],
        name: moduleName,
      },
      outDir: join(cwd(), outDir),
      rollupOptions: {
        output: {
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

              // Add file with metadata about version
              const versionFileName = "version.json";
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

              // Add information about version file to manifest
              manifest[versionFileName] = {
                file: versionFileName,
                src: versionFileName,
                isVersionInfo: true, // Add special marker
              };

              // Write updated manifest
              await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

              console.log(`✓ Version information added to manifest: ${manifestPath}`);
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
