import fs from "fs-extra";
import { writeFileSync } from "node:fs";

export async function updateBoilerplatePkgVersions() {
  const version = fs.readJsonSync("package.json").version;

  const boilerplatePkgPath = "cli/create-vc-app/src/templates/base/package.json";
  const boilerplatePkg = fs.readJsonSync(boilerplatePkgPath);

  ["@vc-shell/api-client-generator", "@vc-shell/ts-config"].forEach(
    (dep) => (boilerplatePkg.devDependencies[dep] = "^" + version)
  );
  ["@vc-shell/config-generator", "@vc-shell/framework"].forEach(
    (dep) => (boilerplatePkg.dependencies[dep] = "^" + version)
  );
  writeFileSync(boilerplatePkgPath, JSON.stringify(boilerplatePkg, null, 2) + "\n");
}
