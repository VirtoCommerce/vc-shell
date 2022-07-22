#!/usr/bin/env node
import { default as chalk } from "chalk";
import { spawnSync } from "child_process";
import { resolveConfig } from "vite";
import { Paths } from "./paths/paths";

async function generateApiClient(): Promise<void> {
  await resolveConfig({}, "build");

  const paths = new Paths();

  const platformUrl = process.env.APP_PLATFORM_URL;
  const platformModules = JSON.parse(
    process.env.APP_PLATFORM_MODULES
  ) as string[];

  for (const platformModule of platformModules) {
    const apiClientPaths = paths.resolveApiClientPaths(platformModule);

    console.log(
      "api-client-generator %s Generating API client for %s module on %s environment",
      chalk.green("info"),
      chalk.whiteBright(platformModule),
      chalk.whiteBright(platformUrl)
    );

    const nswag = spawnSync(
      "nswag",
      [
        "run",
        paths.nswagPaths.configuration,
        `/variables:APP_PLATFORM_URL=${platformUrl},APP_PLATFORM_MODULE=${platformModule},APP_AUTH_API_BASE_PATH=${paths.nswagPaths.authApiBase},APP_API_CLIENT_PATH=${apiClientPaths.nswag}`,
        "/runtime:Net60",
      ],
      {
        stdio: ["ignore", "ignore", "inherit"],
        shell: true,
      }
    );

    if (nswag.status === 0) {
      console.log(
        "api-client-generator %s Successfully generated %s",
        chalk.greenBright("success"),
        chalk.whiteBright(apiClientPaths.console)
      );
    } else {
      console.error(
        "api-client-generator %s Failed to generate %s",
        chalk.red("error"),
        chalk.whiteBright(apiClientPaths.console)
      );
    }
  }
}

generateApiClient();
