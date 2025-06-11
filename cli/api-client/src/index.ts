import { default as chalk } from "chalk";
import { sync } from "cross-spawn";
import { resolveConfig } from "vite";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { Paths } from "./paths/paths";
import mri from "mri";
import path from "node:path";

/**
 * Interface for parsed CLI arguments
 */
interface ApiClientArgs {
  APP_PLATFORM_MODULES: string;
  APP_API_CLIENT_DIRECTORY: string;
  APP_PLATFORM_URL: string;
  APP_PACKAGE_NAME?: string;
  APP_PACKAGE_VERSION?: string;
  APP_OUT_DIR?: string;
  APP_BUILD_DIR?: string;
  SKIP_BUILD?: boolean;
  VERBOSE?: boolean;
}

/**
 * Merges configuration objects preserving user customizations
 */
function mergeConfigurations<T extends Record<string, unknown>>(
  defaultConfig: T,
  existingConfig: T,
  keysToPreserve: string[] = [],
): T {
  const result = { ...defaultConfig };

  // Preserve specific keys from existing config
  for (const key of keysToPreserve) {
    if (key in existingConfig) {
      result[key as keyof T] = existingConfig[key as keyof T];
    }
  }

  // For objects, do a deep merge
  for (const [key, value] of Object.entries(existingConfig)) {
    const typedKey = key as keyof T;
    if (
      key in result &&
      typeof result[typedKey] === "object" &&
      !Array.isArray(result[typedKey]) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      result[typedKey] = { ...result[typedKey], ...value } as T[keyof T];
    } else if (!keysToPreserve.includes(key)) {
      result[typedKey] = value as T[keyof T];
    }
  }

  return result;
}

/**
 * Type definition for tsconfig.json
 */
interface TsConfig {
  extends: string;
  compilerOptions: {
    baseUrl: string;
    declarationDir: string;
    outDir: string;
    rootDir: string;
    [key: string]: unknown;
  };
  files: string[];
  include: string[];
  [key: string]: unknown;
}

/**
 * Type definition for package.json
 */
interface PackageJson {
  name: string;
  version: string;
  files: string[];
  exports: Record<string, unknown>;
  apiClientGenerator?: {
    version: string;
    generatedAt: string;
  };
  [key: string]: unknown;
}

/**
 * Interface for module export paths
 */
interface ModuleExportPaths {
  import: string;
  types: string;
}

/**
 * Handles tsconfig.json generation and updating
 */
function handleTsConfig(tsConfigPath: string, generatedFiles: string[], outDir: string, buildDir: string): TsConfig {
  const defaultTsConfig: TsConfig = {
    extends: "@vc-shell/ts-config/tsconfig.json",
    compilerOptions: {
      baseUrl: ".",
      declarationDir: path.join(outDir, "types"),
      outDir: buildDir,
      rootDir: "./",
    },
    files: [] as string[],
    include: ["*.ts"],
  };

  let tsConfig = { ...defaultTsConfig };

  if (existsSync(tsConfigPath)) {
    try {
      const fileContent = readFileSync(tsConfigPath, "utf-8");
      try {
        const existingTsConfig = JSON.parse(fileContent) as Record<string, unknown>;

        // Preserve user-specific settings while adding our required ones
        tsConfig = mergeConfigurations(defaultTsConfig, existingTsConfig as TsConfig);

        // Make sure compilerOptions are merged properly
        if (existingTsConfig.compilerOptions && typeof existingTsConfig.compilerOptions === "object") {
          tsConfig.compilerOptions = {
            ...defaultTsConfig.compilerOptions,
            ...(existingTsConfig.compilerOptions as Record<string, unknown>),
          };

          // Always update outDir to match APP_BUILD_DIR
          tsConfig.compilerOptions.outDir = buildDir;
          // Update declarationDir to be inside the build directory
          tsConfig.compilerOptions.declarationDir = path.join(buildDir, "types");
        }

        // Ensure our generated files are included without duplicates
        const existingFiles = Array.isArray(existingTsConfig.files) ? (existingTsConfig.files as string[]) : [];
        tsConfig.files = Array.from(new Set([...generatedFiles, ...existingFiles]));

        console.log("api-client-generator %s Updated existing tsconfig.json", chalk.greenBright("success"));
      } catch (parseError) {
        console.error(
          "api-client-generator %s Failed to parse existing tsconfig.json, creating new one",
          chalk.yellow("warning"),
          parseError,
        );
        // If parsing failed, create a new config
        tsConfig = { ...defaultTsConfig };
        tsConfig.files = generatedFiles;
      }
    } catch (readError) {
      console.error("api-client-generator %s Failed to read existing tsconfig.json", chalk.red("error"), readError);
    }
  } else {
    // Add generated files
    tsConfig.files = generatedFiles;
    console.log("api-client-generator %s Created new tsconfig.json", chalk.greenBright("success"));
  }

  return tsConfig;
}

/**
 * Normalizes an export path, removing invalid path segments, stripping known extensions,
 * and ensuring proper format for export keys or file paths.
 */
function normalizeExportPath(filePath: string): string {
  let p = filePath;

  // Remove known extensions repeatedly to handle cases like .d.d.ts
  // Order matters: .d.ts before .ts to correctly strip .d.ts first
  const extensions = [".d.ts", ".ts", ".js"];
  let changed;
  do {
    changed = false;
    for (const ext of extensions) {
      if (p.toLowerCase().endsWith(ext.toLowerCase())) {
        p = p.substring(0, p.length - ext.length);
        changed = true;
        break; // Restart loop for correct order of stripping (e.g. .d.ts before .ts)
      }
    }
  } while (changed);

  // Remove double directory markers like /./
  p = p.replace(/\/\.\//g, "/"); // Handles multiple instances as well e.g. ./././foo -> ./foo

  // Remove duplicate slashes
  p = p.replace(/\/+/g, "/");

  // Attempt to simplify path traversal, e.g. remove ../ segments.
  // This is a simple replace and might not cover all edge cases of path traversal.
  // For more robust normalization, a library might be needed, but this covers common issues.
  p = p.replace(/\.\.\//g, "");

  // Ensure relative paths (not absolute, not just ".") start with './'
  // This is particularly for export keys. File paths in values usually already are.
  if (p !== "." && !p.startsWith("./") && !p.startsWith("/") && !path.isAbsolute(p)) {
    p = "./" + p;
  }
  // If it became '//foo' from 'foo' and then duplicate slash removal, ensure it's './foo'
  if (p.startsWith("//")) {
    p = "./" + p.substring(2);
  }
  // Ensure that after all transformations, if it's not a root export ".", it starts with a single "./"
  if (p !== "." && p.startsWith("/") && !p.startsWith("./") && !path.isAbsolute(p)) {
    p = "." + p; // if p was like "/foo" from some weird input
  }
  if (p !== "." && p.startsWith("././")) {
    p = "./" + p.substring(3);
  }

  return p;
}

/**
 * Extracts the core module name from a path or module name string.
 * e.g., "./dist/virtocommerce.myModule.d.ts" -> "myModule"
 * e.g., "./virtocommerce.myModule" -> "myModule"
 * e.g., "myModule.ts" -> "myModule"
 */
function getCoreModuleName(nameOrPath: string): string {
  // Normalize path and strip extensions first
  let p = normalizeExportPath(nameOrPath);

  // Get the basename (e.g., from "./dist/foo" to "foo")
  p = path.basename(p);

  // Remove "virtocommerce." prefix if it exists
  p = p.replace(/^virtocommerce\./i, "");

  return p.toLowerCase();
}

/**
 * Generates standardized export key formats for a core module name.
 */
function generateStandardExportKeys(coreModuleName: string): string[] {
  if (!coreModuleName) {
    return [];
  }
  // Returns standard export keys, e.g., ["./myModule", "./virtocommerce.myModule"]
  return [`./${coreModuleName}`, `./virtocommerce.${coreModuleName}`];
}

/**
 * Creates exports configuration for package.json based on generated modules and existing exports.
 */
function createExportsConfig(
  generatedModuleFiles: string[], // e.g., ["marketplacevendor.ts", "orders.ts"]
  buildDir: string,
  existingExports: Record<string, unknown> | undefined,
  verbose: boolean,
): Record<string, unknown> {
  const newStandardExports: Record<string, ModuleExportPaths> = {};
  const processedCoreModulesForNewGeneration = new Set<string>();

  // 1. Generate standard exports for all NEWLY generated modules
  for (const moduleFile of generatedModuleFiles) {
    const coreModule = getCoreModuleName(moduleFile);
    if (!coreModule) continue;

    // Define the canonical import and types paths for this core module
    // Assuming the compiled output in dist will be virtocommerce.[coreModule].js
    const compiledBaseName = `virtocommerce.${coreModule}`;
    const importPath = `./${path.join(buildDir, `${compiledBaseName}.js`)}`;
    const typesPath = `./${path.join(buildDir, "types", `${compiledBaseName}.d.ts`)}`;
    const exportValue: ModuleExportPaths = { import: importPath, types: typesPath };

    const standardKeys = generateStandardExportKeys(coreModule);
    for (const key of standardKeys) {
      newStandardExports[key] = exportValue;
      if (verbose) {
        console.log(
          "api-client-generator %s Generated standard export: %s -> { import: %s, types: %s }",
          chalk.blue("debug"),
          chalk.whiteBright(key),
          chalk.whiteBright(importPath),
          chalk.whiteBright(typesPath),
        );
      }
    }
    processedCoreModulesForNewGeneration.add(coreModule);
  }

  const finalExports: Record<string, unknown> = { ...newStandardExports };

  // 2. Merge with existing exports.
  // Preserve existing exports if they don't conflict with the standard exports of *just regenerated* modules,
  // or if they are for modules not part of the current generation.
  if (existingExports) {
    for (const [existingKey, existingValueUntyped] of Object.entries(existingExports)) {
      if (existingKey === ".") {
        // Root export is handled later
        continue;
      }
      if (typeof existingValueUntyped !== "object" || existingValueUntyped === null) {
        if (verbose)
          console.log(
            "api-client-generator %s Skipping malformed existing export value for key: %s",
            chalk.yellow("warning"),
            existingKey,
          );
        continue;
      }

      const existingValue = existingValueUntyped as Partial<ModuleExportPaths>;
      if (!existingValue.import || !existingValue.types) {
        if (verbose)
          console.log(
            "api-client-generator %s Skipping existing export with missing import/types for key: %s",
            chalk.yellow("warning"),
            existingKey,
          );
        continue;
      }

      const normalizedExistingKey = normalizeExportPath(existingKey);
      if (!normalizedExistingKey || normalizedExistingKey === ".") continue; // Skip if key normalizes to nothing or root

      const coreModuleOfExistingKey = getCoreModuleName(normalizedExistingKey);

      // If this existing key is already defined by the new generation, skip (new one takes precedence).
      // Otherwise, preserve it. This means custom keys for regenerated modules are kept,
      // and all keys for non-regenerated modules are kept.
      if (!(normalizedExistingKey in newStandardExports)) {
        const importBasePath = normalizeExportPath(existingValue.import);
        const typesBasePath = normalizeExportPath(existingValue.types);

        finalExports[normalizedExistingKey] = {
          import: `${importBasePath}.js`,
          types: `${typesBasePath}.d.ts`,
        };
        if (verbose) {
          console.log(
            "api-client-generator %s Preserved existing export: %s -> { import: %s, types: %s }",
            chalk.blue("debug"),
            chalk.whiteBright(normalizedExistingKey),
            chalk.whiteBright(`${importBasePath}.js`),
            chalk.whiteBright(`${typesBasePath}.d.ts`),
          );
        }
      } else if (verbose) {
        // This case means the existingKey was a standard key for a re-generated module.
        // Its value has already been set correctly in newStandardExports.
        console.log(
          "api-client-generator %s Existing export key '%s' was handled by new generation.",
          chalk.blue("debug"),
          chalk.whiteBright(normalizedExistingKey),
        );
      }
    }
  }

  // 3. Handle root export "."
  const allCoreModulesInFinalExports = new Set<string>();
  for (const key in finalExports) {
    if (key === ".") continue;
    const coreModule = getCoreModuleName(key);
    if (coreModule) {
      allCoreModulesInFinalExports.add(coreModule);
    }
  }
  const uniqueCoreModules = Array.from(allCoreModulesInFinalExports);

  if (uniqueCoreModules.length === 1) {
    const singleCoreModule = uniqueCoreModules[0];
    const compiledBaseName = `virtocommerce.${singleCoreModule}`;
    const rootImportPath = `./${path.join(buildDir, `${compiledBaseName}.js`)}`;
    const rootTypesPath = `./${path.join(buildDir, "types", `${compiledBaseName}.d.ts`)}`;
    finalExports["."] = {
      import: rootImportPath,
      types: rootTypesPath,
    };
    if (verbose) {
      console.log(
        "api-client-generator %s Set root export for single module '%s': { import: %s, types: %s }",
        chalk.blue("debug"),
        chalk.whiteBright(singleCoreModule),
        chalk.whiteBright(rootImportPath),
        chalk.whiteBright(rootTypesPath),
      );
    }
  } else if (existingExports && "." in existingExports) {
    // If multiple modules, but a root export existed, try to preserve it if it's valid
    const rootExportValueUntyped = existingExports["."];
    if (typeof rootExportValueUntyped === "object" && rootExportValueUntyped !== null) {
      const rootExportValue = rootExportValueUntyped as Partial<ModuleExportPaths>;
      if (rootExportValue.import && rootExportValue.types) {
        const coreModuleOfRootImport = getCoreModuleName(rootExportValue.import);
        if (coreModuleOfRootImport && uniqueCoreModules.includes(coreModuleOfRootImport)) {
          // The existing root export points to one of the modules we have in finalExports.
          // Re-evaluate its path based on that module's core name.
          const compiledBaseName = `virtocommerce.${coreModuleOfRootImport}`;
          const importPath = `./${path.join(buildDir, `${compiledBaseName}.js`)}`;
          const typesPath = `./${path.join(buildDir, "types", `${compiledBaseName}.d.ts`)}`;
          finalExports["."] = { import: importPath, types: typesPath };
          if (verbose) {
            console.log(
              "api-client-generator %s Preserved and standardized existing root export pointing to module '%s'",
              chalk.blue("debug"),
              chalk.whiteBright(coreModuleOfRootImport),
            );
          }
        } else if (verbose) {
          console.log(
            "api-client-generator %s Removed existing root export as it pointed to an unknown or unhandled module '%s'",
            chalk.yellow("warning"),
            coreModuleOfRootImport || "unknown",
          );
        }
      } else if (verbose) {
        console.log("api-client-generator %s Removed malformed existing root export.", chalk.yellow("warning"));
      }
    }
  }
  // If multiple modules and no valid existing root export, finalExports will not have a "." key.

  return finalExports;
}

/**
 * Handles package.json generation and updating
 */
function handlePackageJson(packageJsonPath: string, generatedModules: string[], args: ApiClientArgs): PackageJson {
  const verbose = args.VERBOSE ?? false;
  const buildDir = args.APP_BUILD_DIR ?? "dist";

  // Define default files array
  const defaultFiles: string[] = [];
  if (buildDir) defaultFiles.push(buildDir);
  defaultFiles.push("package.json");

  const defaultPackageJson: PackageJson = {
    name: args.APP_PACKAGE_NAME || "api-client",
    version: args.APP_PACKAGE_VERSION || "1.0.0",
    files: defaultFiles,
    exports: {},
    // Add metadata to track generated content
    apiClientGenerator: {
      version: process.env.npm_package_version || "unknown",
      generatedAt: new Date().toISOString(),
    },
  };

  let packageJson = { ...defaultPackageJson };
  let existingExports: Record<string, unknown> | undefined;
  let existingModule: string | undefined;
  let existingTypes: string | undefined;

  if (existsSync(packageJsonPath)) {
    try {
      const fileContent = readFileSync(packageJsonPath, "utf-8");
      try {
        const existingPackageJson = JSON.parse(fileContent) as Record<string, unknown>;

        // Save existing module and types if present
        if (typeof existingPackageJson.module === "string") {
          existingModule = existingPackageJson.module as string;
        }

        if (typeof existingPackageJson.types === "string") {
          existingTypes = existingPackageJson.types as string;
        }

        // Preserve user-defined fields that shouldn't be changed by the generator
        const userDefinedFields = [
          "name",
          "version",
          "description",
          "keywords",
          "author",
          "license",
          "private",
          "scripts",
          "devDependencies",
          "dependencies",
        ];
        packageJson = mergeConfigurations(defaultPackageJson, existingPackageJson as PackageJson, userDefinedFields);

        // Ensure apiClientGenerator is always updated with the latest info from the current run
        packageJson.apiClientGenerator = defaultPackageJson.apiClientGenerator;

        // Ensure files array contains what we need
        if (existingPackageJson.files && Array.isArray(existingPackageJson.files)) {
          packageJson.files = Array.from(new Set([...defaultFiles, ...(existingPackageJson.files as string[])]));
        }

        // Save existing exports for later processing
        existingExports = existingPackageJson.exports as Record<string, unknown>;

        console.log("api-client-generator %s Updated existing package.json", chalk.greenBright("success"));
      } catch (parseError) {
        console.error(
          "api-client-generator %s Failed to parse existing package.json, creating new one",
          chalk.yellow("warning"),
          parseError,
        );
      }
    } catch (readError) {
      console.error("api-client-generator %s Failed to read existing package.json", chalk.red("error"), readError);
    }
  } else {
    console.log("api-client-generator %s Creating new package.json", chalk.greenBright("success"));
  }

  // Generate exports configuration based on modules and existing exports
  packageJson.exports = createExportsConfig(generatedModules, buildDir, existingExports, verbose);

  // Check if we're dealing with a single module case based on final exports
  // Re-evaluate unique modules based on what's actually in packageJson.exports now
  const finalExportKeys = Object.keys(packageJson.exports);
  const coreModulesFromExports = new Set<string>();
  for (const key of finalExportKeys) {
    if (key === ".") continue;
    const coreModule = getCoreModuleName(key); // Use new getCoreModuleName
    if (coreModule) {
      coreModulesFromExports.add(coreModule);
    }
  }
  const uniqueFinalCoreModules = Array.from(coreModulesFromExports);
  const isSingleModuleScenario = uniqueFinalCoreModules.length === 1;

  // Handle module and types fields (top-level in package.json)
  // These are generally for older systems or when there's a clear "main" export.
  // If we have a root export ".", use its paths for top-level module/types.
  if (packageJson.exports && "." in packageJson.exports) {
    const rootExport = packageJson.exports["."] as ModuleExportPaths; // Assuming it's validated by createExportsConfig

    if (rootExport && rootExport.import) {
      packageJson.module = rootExport.import;
      if (verbose) {
        console.log(
          "api-client-generator %s Set 'module' field from root export: %s",
          chalk.blue("debug"),
          chalk.whiteBright(rootExport.import),
        );
      }
    }
    if (rootExport && rootExport.types) {
      packageJson.types = rootExport.types;
      if (verbose) {
        console.log(
          "api-client-generator %s Set 'types' field from root export: %s",
          chalk.blue("debug"),
          chalk.whiteBright(rootExport.types),
        );
      }
    }
  } else {
    // No root export, or multiple modules without a clear single main.
    // Remove top-level 'module' and 'types' if they exist, as 'exports' should be used.
    if ("module" in packageJson) {
      delete packageJson.module;
      if (verbose) {
        console.log("api-client-generator %s Removed 'module' field (no clear root export).", chalk.blue("debug"));
      }
    }
    if ("types" in packageJson) {
      delete packageJson.types;
      if (verbose) {
        console.log("api-client-generator %s Removed 'types' field (no clear root export).", chalk.blue("debug"));
      }
    }
  }

  return packageJson;
}

/**
 * Main function to generate API client
 */
async function generateApiClient(): Promise<void> {
  await resolveConfig({}, "build");

  const parsedArgs = mri(process.argv.slice(2)) as ApiClientArgs;

  const platformUrl = process.env.APP_PLATFORM_URL ?? parsedArgs.APP_PLATFORM_URL;
  const verbose = parsedArgs.VERBOSE ?? false;

  // Validate required arguments
  if (!platformUrl) {
    return console.log(
      chalk.red("error"),
      "api-client-generator APP_PLATFORM_URL is required in .env config or as api-client-generator argument",
    );
  }

  if (!parsedArgs.APP_PLATFORM_MODULES) {
    return console.log(chalk.red("error"), "api-client-generator modules command is required");
  }

  if (!parsedArgs.APP_API_CLIENT_DIRECTORY) {
    return console.log(chalk.red("error"), "api-client-generator outDir command is required");
  }

  const outDir = parsedArgs.APP_OUT_DIR ?? "./";
  const buildDir = parsedArgs.APP_BUILD_DIR ?? "dist";
  const paths = new Paths(parsedArgs.APP_API_CLIENT_DIRECTORY);

  // Ensure target directory exists
  if (!existsSync(parsedArgs.APP_API_CLIENT_DIRECTORY)) {
    try {
      mkdirSync(parsedArgs.APP_API_CLIENT_DIRECTORY, { recursive: true });
      console.log(
        "api-client-generator %s Created directory %s",
        chalk.greenBright("success"),
        chalk.whiteBright(parsedArgs.APP_API_CLIENT_DIRECTORY),
      );
    } catch (error) {
      console.error(
        "api-client-generator %s Failed to create directory %s",
        chalk.red("error"),
        chalk.whiteBright(parsedArgs.APP_API_CLIENT_DIRECTORY),
        error,
      );
      return;
    }
  }

  // Ensure build directory exists
  const fullBuildDir = path.join(parsedArgs.APP_API_CLIENT_DIRECTORY, buildDir);
  if (!existsSync(fullBuildDir)) {
    try {
      mkdirSync(fullBuildDir, { recursive: true });
      console.log(
        "api-client-generator %s Created build directory %s",
        chalk.greenBright("success"),
        chalk.whiteBright(fullBuildDir),
      );
    } catch (error) {
      console.error(
        "api-client-generator %s Failed to create build directory %s",
        chalk.red("error"),
        chalk.whiteBright(fullBuildDir),
        error,
      );
      // Continue execution, as tsc will create the directory during compilation
    }
  }

  const platformModules = parsedArgs.APP_PLATFORM_MODULES.replace(/[[\]]/g, "").split(",");
  const generatedFiles: string[] = [];

  for (const platformModule of platformModules) {
    const apiClientPaths = paths.resolveApiClientPaths(platformModule);

    console.log(
      "api-client-generator %s Generating API client for %s module on %s environment",
      chalk.green("info"),
      chalk.whiteBright(platformModule),
      chalk.whiteBright(platformUrl),
    );

    // Construct nswag command
    const nswagCommand = [
      "run",
      paths.nswagPaths.configuration,
      `/variables:APP_PLATFORM_URL=${platformUrl},APP_PLATFORM_MODULE=${platformModule},APP_AUTH_API_BASE_PATH=${paths.nswagPaths.authApiBase},APP_TEMPLATE_DIRECTORY=${paths.nswagPaths.templates},APP_API_CLIENT_PATH=${apiClientPaths.nswag}`,
      "/runtime:Net60",
    ];

    if (verbose) {
      console.log("api-client-generator %s Running command: npx nswag %s", chalk.blue("debug"), nswagCommand.join(" "));
    }

    // Execute nswag command
    const nswag = sync("npx nswag", nswagCommand, {
      stdio: ["ignore", "inherit", "ignore"],
      shell: true,
    });

    if (nswag.status === 0) {
      console.log(
        "api-client-generator %s Successfully generated %s",
        chalk.greenBright("success"),
        chalk.whiteBright(apiClientPaths.console),
      );

      // Skip configuration update if SKIP_BUILD is set
      if (!parsedArgs.SKIP_BUILD) {
        generatedFiles.push(`${platformModule.toLowerCase()}.ts`);
      }
    } else {
      console.error(
        "api-client-generator %s Failed to generate %s",
        chalk.red("error"),
        chalk.whiteBright(apiClientPaths.console),
      );
    }
  }

  // Skip compilation and package.json generation if SKIP_BUILD is set
  if (!parsedArgs.SKIP_BUILD) {
    // Handle tsconfig generation and updates
    const tsConfigPath = path.join(parsedArgs.APP_API_CLIENT_DIRECTORY, "tsconfig.json");
    const tsConfig = handleTsConfig(tsConfigPath, generatedFiles, outDir, buildDir);

    // Write updated tsconfig.json
    writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

    // Compile generated TypeScript files to JavaScript with declaration files
    console.log("api-client-generator %s Compiling TypeScript files to JavaScript", chalk.green("info"));

    const tsc = sync("npx tsc", ["--project", tsConfigPath], {
      stdio: ["ignore", "inherit", "ignore"],
      shell: true,
    });

    if (tsc.status === 0) {
      console.log("api-client-generator %s Successfully compiled TypeScript files", chalk.greenBright("success"));
    } else {
      console.error("api-client-generator %s Failed to compile TypeScript files", chalk.red("error"));
      // Continue even if compilation fails, to still generate package.json
    }

    // Handle package.json generation and updates
    const packageJsonPath = path.join(parsedArgs.APP_API_CLIENT_DIRECTORY, "package.json");
    const packageJson = handlePackageJson(packageJsonPath, generatedFiles, parsedArgs);

    // Write updated package.json with proper formatting
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("api-client-generator %s Generated package.json", chalk.greenBright("success"));
  }
}

generateApiClient();
