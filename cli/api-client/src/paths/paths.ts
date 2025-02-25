import { join, resolve, relative, dirname } from "node:path";
import { ApiClientPaths } from "./api-client";
import { NswagPaths } from "./nswag";
import { fileURLToPath } from "node:url";
import { cwd } from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Paths {
  workingDirectory: string;
  generatorDirectory: string;
  assetsDirectory: string;
  apiClientDirectory: string;
  nswagPaths: NswagPaths;

  constructor(apiDirectory: string) {
    this.workingDirectory = cwd();
    this.generatorDirectory = resolve(__dirname, "..");
    this.assetsDirectory = join(this.generatorDirectory, "public", "assets");
    this.apiClientDirectory = resolve(this.workingDirectory, apiDirectory);

    this.nswagPaths = {
      configuration: join(relative(this.workingDirectory, this.assetsDirectory), "config.nswag"),
      authApiBase: "authApiBase.ts",
      templates: "templates",
    };
  }

  resolveApiClientPaths(platformModule: string): ApiClientPaths {
    const fileName = `${platformModule.toLowerCase()}.ts`;
    return {
      fileName,
      nswag: join(relative(this.assetsDirectory, this.apiClientDirectory), fileName),
      console: join(relative(this.workingDirectory, this.apiClientDirectory), fileName),
    };
  }
}
