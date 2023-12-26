import { default as chalk } from "chalk";
import { spawnSync } from "node:child_process";
import { resolveConfig } from "vite";
import { Paths } from "./paths/paths";
import mri from "mri";

async function generateApiClient(): Promise<void> {
  await resolveConfig({}, "build");

  const parsedArgs = mri(process.argv.slice(2)) as {
    APP_PLATFORM_MODULES: string;
    APP_API_CLIENT_DIRECTORY: string;
    APP_PLATFORM_URL: string;
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

  const paths = new Paths(parsedArgs.APP_API_CLIENT_DIRECTORY);

  const platformModules = parsedArgs?.APP_PLATFORM_MODULES.replace(/[[\]]/g, "").split(",");

  for (const platformModule of platformModules) {
    const apiClientPaths = paths.resolveApiClientPaths(platformModule);

    console.log(
      "api-client-generator %s Generating API client for %s module on %s environment",
      chalk.green("info"),
      chalk.whiteBright(platformModule),
      chalk.whiteBright(platformUrl),
    );

    const nswag = spawnSync(
      "npx nswag",
      [
        "run",
        paths.nswagPaths.configuration,
        `/variables:APP_PLATFORM_URL=${platformUrl},APP_PLATFORM_MODULE=${platformModule},APP_AUTH_API_BASE_PATH=${paths.nswagPaths.authApiBase},APP_API_CLIENT_PATH=${apiClientPaths.nswag}`,
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
    } else {
      console.error(
        "api-client-generator %s Failed to generate %s",
        chalk.red("error"),
        chalk.whiteBright(apiClientPaths.console),
      );
    }
  }
}

generateApiClient();
