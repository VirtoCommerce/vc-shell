import fs from "fs-extra";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { gt as isVersionGreater } from "semver";

// Updates the boilerplate template package versions to stay aligned with repository packages.
export async function updateBoilerplatePkgVersions() {
  const version = fs.readJsonSync("package.json").version;

  // v2 templates: each project type has its own _package.json.ejs
  const templatePkgPaths = [
    "cli/create-vc-app/src/templates/standalone/_package.json.ejs",
    "cli/create-vc-app/src/templates/host-app/_package.json.ejs",
    "cli/create-vc-app/src/templates/dynamic-module/_package.json.ejs",
  ];

  // Find a reference app to sync common dependency versions from
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

  const syncCommonDependencies = (
    targetDeps: Record<string, string> | undefined,
    sourceDeps: Record<string, string> | undefined,
  ) => {
    if (!targetDeps || !sourceDeps) {
      return;
    }

    Object.keys(targetDeps).forEach((dep) => {
      if (dep.startsWith("@vc-shell/") || dep.startsWith("@vcmp-")) {
        return;
      }

      if (sourceDeps[dep]) {
        const targetVersion = targetDeps[dep].replace(/^[\^~]/, "");
        const sourceVersion = sourceDeps[dep].replace(/^[\^~]/, "");

        try {
          if (isVersionGreater(sourceVersion, targetVersion)) {
            targetDeps[dep] = sourceDeps[dep];
          }
        } catch {
          // If version comparison fails, keep current version
        }
      }
    });
  };

  for (const pkgPath of templatePkgPaths) {
    if (!fs.existsSync(pkgPath)) {
      continue;
    }

    const boilerplatePkg = fs.readJsonSync(pkgPath);

    // Update @vc-shell/* framework packages (only if present in this template)
    ["@vc-shell/api-client-generator", "@vc-shell/ts-config", "@vc-shell/release-config"].forEach(
      (dep) => {
        if (boilerplatePkg.devDependencies?.[dep]) {
          boilerplatePkg.devDependencies[dep] = "^" + version;
        }
      },
    );
    ["@vc-shell/config-generator", "@vc-shell/framework"].forEach((dep) => {
      if (boilerplatePkg.dependencies?.[dep]) {
        boilerplatePkg.dependencies[dep] = "^" + version;
      }
    });

    // Sync common dependency versions from reference app
    if (matchedAppPackage) {
      syncCommonDependencies(boilerplatePkg.dependencies, matchedAppPackage.dependencies);
      syncCommonDependencies(boilerplatePkg.devDependencies, matchedAppPackage.devDependencies);
    }

    writeFileSync(pkgPath, JSON.stringify(boilerplatePkg, null, 2) + "\n");
    console.log(`  ✓ Updated ${path.basename(path.dirname(pkgPath))} template to ^${version}`);
  }
}

// Updates @vc-shell/* dependencies in all apps to match current framework version
export async function updateAppsDependencies() {
  const version = fs.readJsonSync("package.json").version;
  const appsDirectory = path.resolve("apps");

  if (!fs.existsSync(appsDirectory)) {
    return;
  }

  const appEntries = fs.readdirSync(appsDirectory, { withFileTypes: true });
  let updatedCount = 0;

  for (const entry of appEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const appPackagePath = path.join(appsDirectory, entry.name, "package.json");
    if (!fs.existsSync(appPackagePath)) {
      continue;
    }

    const appPackage = fs.readJsonSync(appPackagePath);
    let updated = false;

    // Update @vc-shell/* dependencies in both dependencies and devDependencies
    ["dependencies", "devDependencies"].forEach((depType) => {
      if (appPackage[depType]) {
        Object.keys(appPackage[depType]).forEach((dep) => {
          if (dep.startsWith("@vc-shell/")) {
            const newVersion = `^${version}`;
            if (appPackage[depType][dep] !== newVersion) {
              appPackage[depType][dep] = newVersion;
              updated = true;
            }
          }
        });
      }
    });

    if (updated) {
      writeFileSync(appPackagePath, JSON.stringify(appPackage, null, 2) + "\n");
      console.log(`  ✓ Updated ${appPackage.name} @vc-shell/* dependencies to ^${version}`);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`\n  Updated ${updatedCount} app(s) in apps/ directory`);
  }
}
