import fs from "fs-extra";
import { writeFileSync } from "node:fs";
import path from "node:path";

// Updates the boilerplate template package versions to stay aligned with repository packages.
export async function updateBoilerplatePkgVersions() {
  const version = fs.readJsonSync("package.json").version;

  const boilerplatePkgPath = "cli/create-vc-app/src/templates/base/_package.json";
  const boilerplatePkg = fs.readJsonSync(boilerplatePkgPath);

  ["@vc-shell/api-client-generator", "@vc-shell/ts-config", "@vc-shell/release-config"].forEach(
    (dep) => (boilerplatePkg.devDependencies[dep] = "^" + version),
  );
  ["@vc-shell/config-generator", "@vc-shell/framework"].forEach(
    (dep) => (boilerplatePkg.dependencies[dep] = "^" + version),
  );

  const appsDirectory = path.resolve("apps");
  let matchedAppPackage:
    | { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    | undefined;

  if (fs.existsSync(appsDirectory)) {
    const appEntries = fs.readdirSync(appsDirectory, { withFileTypes: true });

    for (const entry of appEntries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const appPackagePath = path.join(appsDirectory, entry.name, "package.json");
      if (!fs.existsSync(appPackagePath)) {
        continue;
      }

      const appPackage = fs.readJsonSync(appPackagePath);
      const combinedDependencies = {
        ...(appPackage.dependencies ?? {}),
        ...(appPackage.devDependencies ?? {}),
      };
      const hasModules = Object.keys(combinedDependencies).some((dep) => dep.startsWith("@vcmp-"));

      if (appPackage.name?.startsWith("app-") && hasModules) {
        matchedAppPackage = appPackage;
        break;
      }
    }
  }

  if (matchedAppPackage) {
    const syncVersions = (
      targetDeps: Record<string, string> | undefined,
      sourceDeps: Record<string, string> | undefined,
    ) => {
      if (!targetDeps || !sourceDeps) {
        return;
      }

      Object.keys(targetDeps).forEach((dep) => {
        if (sourceDeps[dep]) {
          targetDeps[dep] = sourceDeps[dep];
        }
      });
    };

    syncVersions(boilerplatePkg.dependencies, matchedAppPackage.dependencies);
    syncVersions(boilerplatePkg.devDependencies, matchedAppPackage.devDependencies);
  }
  writeFileSync(boilerplatePkgPath, JSON.stringify(boilerplatePkg, null, 2) + "\n");
}
