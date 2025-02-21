import { default as chalk } from "chalk";
import { sync } from "cross-spawn";
import { resolveConfig } from "vite";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { Paths } from "./paths/paths";
import mri from "mri";
import path from "node:path";

async function generateApiClient(): Promise<void> {
  await resolveConfig({}, "build");

  const parsedArgs = mri(process.argv.slice(2)) as {
    APP_PLATFORM_MODULES: string;
    APP_API_CLIENT_DIRECTORY: string;
    APP_PLATFORM_URL: string;
    APP_PACKAGE_NAME?: string;
    APP_PACKAGE_VERSION?: string;
    APP_OUT_DIR?: string;
    SKIP_BUILD?: boolean;
  };

  const platformUrl = process.env.APP_PLATFORM_URL ?? parsedArgs.APP_PLATFORM_URL;

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
  const paths = new Paths(parsedArgs.APP_API_CLIENT_DIRECTORY);

  const platformModules = parsedArgs.APP_PLATFORM_MODULES.replace(/[[\]]/g, "").split(",");
  const exports: Record<string, unknown> = {};

  let tsConfigPath: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tsConfig: Record<string, any> | undefined;

  // Пропускаем генерацию tsconfig если установлен SKIP_BUILD
  if (!parsedArgs.SKIP_BUILD) {
    // Check if tsconfig.json exists and read it
    tsConfigPath = path.join(parsedArgs.APP_API_CLIENT_DIRECTORY, "tsconfig.json");
    tsConfig = {
      extends: "@vc-shell/ts-config/tsconfig.json",
      compilerOptions: {
        baseUrl: ".",
        declarationDir: path.join(outDir, "types"),
        outDir: outDir,
        rootDir: "./",
      },
      files: [] as string[],
      include: ["*.ts"],
    };

    if (existsSync(tsConfigPath)) {
      const existingTsConfig = JSON.parse(readFileSync(tsConfigPath, "utf-8"));
      tsConfig = { ...tsConfig, ...existingTsConfig };

      if (tsConfig) {
        tsConfig.compilerOptions = { ...tsConfig.compilerOptions, ...existingTsConfig.compilerOptions };
        tsConfig.files = Array.from(new Set(tsConfig.files.concat(existingTsConfig.files || [])));
        tsConfig.include = Array.from(new Set(tsConfig.include.concat(existingTsConfig.include || [])));
      } // <-- Добавлена закрывающая скобка

      console.log("api-client-generator %s Generated tsconfig.json", chalk.greenBright("success"));
    }
  }

  for (const platformModule of platformModules) {
    const apiClientPaths = paths.resolveApiClientPaths(platformModule);

    console.log(
      "api-client-generator %s Generating API client for %s module on %s environment",
      chalk.green("info"),
      chalk.whiteBright(platformModule),
      chalk.whiteBright(platformUrl),
    );

    const nswag = sync(
      "npx nswag",
      [
        "run",
        paths.nswagPaths.configuration,
        `/variables:APP_PLATFORM_URL=${platformUrl},APP_PLATFORM_MODULE=${platformModule},APP_AUTH_API_BASE_PATH=${paths.nswagPaths.authApiBase},APP_TEMPLATE_DIRECTORY=${paths.nswagPaths.templates},APP_API_CLIENT_PATH=${apiClientPaths.nswag}`,
        "/runtime:Net60",
      ],
      {
        stdio: ["ignore", "inherit", "ignore"],
        shell: true,
      },
    );

    if (nswag.status === 0) {
      console.log(
        "api-client-generator %s Successfully generated %s",
        chalk.greenBright("success"),
        chalk.whiteBright(apiClientPaths.console),
      );

      // Пропускаем обновление конфигурации если установлен SKIP_BUILD
      if (!parsedArgs.SKIP_BUILD && tsConfig) {
        const platformModuleLower = platformModule.toLowerCase();

        // Add generated TypeScript files to tsconfig.json files array
        if (!tsConfig.files.includes(`${platformModuleLower}.ts`)) {
          tsConfig.files.push(`${platformModuleLower}.ts`);
        }

        const newExportPath = {
          import: outDir !== "./" ? `./${outDir}/${platformModuleLower}.js` : `./${platformModuleLower}.js`,
          types:
            outDir !== "./" ? `./${outDir}/types/${platformModuleLower}.d.ts` : `./types/${platformModuleLower}.d.ts`,
        };

        const existingKey = Object.keys(exports).find((key) =>
          (exports[key] as { import: string }).import.includes(`${platformModuleLower}.js`),
        );

        if (existingKey) {
          exports[existingKey] = newExportPath;
        } else {
          exports[`./${platformModuleLower}`] = newExportPath;
        }
      }
    } else {
      console.error(
        "api-client-generator %s Failed to generate %s",
        chalk.red("error"),
        chalk.whiteBright(apiClientPaths.console),
        nswag,
      );
    }
  }

  // Пропускаем компиляцию и генерацию package.json если установлен SKIP_BUILD
  if (!parsedArgs.SKIP_BUILD && tsConfigPath && tsConfig) {
    // Write the updated tsconfig.json with the included files
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
    }

    // Check if package.json exists and read it
    const packageJsonPath = path.join(parsedArgs.APP_API_CLIENT_DIRECTORY, "package.json");
    let packageJson = {
      name: parsedArgs.APP_PACKAGE_NAME || "api-client",
      version: parsedArgs.APP_PACKAGE_VERSION || "1.0.0",
      files: outDir !== "./" ? [outDir, "package.json"] : ["package.json"],
      exports,
    };

    if (existsSync(packageJsonPath)) {
      const existingPackageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      packageJson = { ...packageJson, ...existingPackageJson };
      packageJson.files = Array.from(new Set(packageJson.files.concat(existingPackageJson.files || [])));
      packageJson.exports = { ...existingPackageJson.exports, ...packageJson.exports };

      // Update exports based on the new files
      for (const [key, value] of Object.entries(exports)) {
        const exportPath = (value as { import: string }).import;
        const fileName = path.basename(exportPath);
        const existingKey = Object.keys(packageJson.exports).find((k) =>
          (packageJson.exports[k] as { import: string }).import.includes(fileName),
        );
        if (existingKey) {
          packageJson.exports[existingKey] = value;
        } else {
          packageJson.exports[key] = value;
        }
      }
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log("api-client-generator %s Generated package.json", chalk.greenBright("success"));
  }
}

generateApiClient();
