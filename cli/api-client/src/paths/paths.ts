import { join, resolve, relative } from "path";
import { ApiClientPaths } from "./api-client";
import { NswagPaths } from "./nswag";

export class Paths {
  workingDirectory: string;
  generatorDirectory: string;
  assetsDirectory: string;
  apiClientDirectory: string;
  nswagPaths: NswagPaths;

  constructor() {
    this.workingDirectory = process.cwd();
    this.generatorDirectory = resolve(__dirname, "../..");
    this.assetsDirectory = join(this.generatorDirectory, "public", "assets");
    this.apiClientDirectory = resolve(this.workingDirectory, process.env.APP_API_CLIENT_DIRECTORY);
    this.nswagPaths = {
      configuration: join(relative(this.workingDirectory, this.assetsDirectory), "config.nswag"),
      authApiBase: "authApiBase.ts",
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
