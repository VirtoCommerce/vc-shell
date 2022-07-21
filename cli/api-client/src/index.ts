#!/usr/bin/env node
import { resolveConfig } from "vite";
import { spawn } from "child_process";
import { resolve } from "path";

async function generateApiClient(): Promise<void> {
  await resolveConfig({}, "build");

  const platformUrl = process.env.APP_PLATFORM_URL;
  const platformModules = JSON.parse(
    process.env.APP_PLATFORM_MODULES
  ) as string[];

  const generatorDirectory = resolve(__dirname, "..");
  const assetsDirectory = resolve(generatorDirectory, "public", "assets");
  const configurationPath = resolve(assetsDirectory, "config.nswag");
  const authApiBasePath = resolve(assetsDirectory, "authApiBase.ts");

  const workingDirectory = process.cwd();
  const apiClientDirectory = resolve(
    workingDirectory,
    process.env.APP_API_CLIENT_DIRECTORY
  );

  for (const platformModule of platformModules) {
    const apiClientPath = resolve(
      apiClientDirectory,
      `${platformModule.toLowerCase()}.ts`
    );

    spawn(
      "nswag",
      [
        "run",
        configurationPath,
        `/variables:APP_PLATFORM_URL=${platformUrl},APP_PLATFORM_MODULE=${platformModule},APP_AUTH_API_BASE_PATH=${authApiBasePath},APP_API_CLIENT_PATH=${apiClientPath}`,
        "/runtime:Net60",
      ],
      { stdio: "inherit", shell: true }
    );
  }
}

generateApiClient();

export { generateApiClient };
