import fs from "fs-extra";
import { writeFileSync } from "node:fs";
import path from "node:path";

type VersionMap = Record<string, string>;

function loadPeerVersions(cwd: string): VersionMap | null {
  const peerVersionsPath = path.join(cwd, "configs/peer-versions.json");
  if (!fs.existsSync(peerVersionsPath)) {
    console.warn(
      "⚠ configs/peer-versions.json not found — scaffold template peer-dep sync skipped.\n" +
        "  Only @vc-shell/* will be bumped. Restore the file to re-enable peer sync.",
    );
    return null;
  }
  try {
    const raw = fs.readJsonSync(peerVersionsPath);
    if (!raw || typeof raw !== "object" || !raw.versions || typeof raw.versions !== "object") {
      console.warn("⚠ configs/peer-versions.json has no `versions` object — scaffold template peer-dep sync skipped.");
      return null;
    }
    return raw.versions as VersionMap;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠ Failed to parse configs/peer-versions.json (${msg}) — scaffold template peer-dep sync skipped.`);
    return null;
  }
}

// Updates the boilerplate template package versions to stay aligned with the curated peer-versions map.
export async function updateBoilerplatePkgVersions(cwd: string = process.cwd()) {
  const version = fs.readJsonSync(path.join(cwd, "package.json")).version;

  const templatePkgPaths = [
    path.join(cwd, "cli/create-vc-app/src/templates/standalone/_package.json.ejs"),
    path.join(cwd, "cli/create-vc-app/src/templates/host-app/_package.json.ejs"),
    path.join(cwd, "cli/create-vc-app/src/templates/dynamic-module/_package.json.ejs"),
  ];

  const peerVersions = loadPeerVersions(cwd);

  for (const pkgPath of templatePkgPaths) {
    if (!fs.existsSync(pkgPath)) {
      continue;
    }

    const boilerplatePkg = fs.readJsonSync(pkgPath);

    // Bump @vc-shell/* deps to current repo version.
    for (const depType of ["dependencies", "devDependencies"] as const) {
      const deps = boilerplatePkg[depType];
      if (!deps) continue;
      for (const name of Object.keys(deps)) {
        if (name.startsWith("@vc-shell/")) {
          deps[name] = `^${version}`;
        }
      }
    }

    // Apply intersection sync from peer-versions map (if loaded).
    if (peerVersions) {
      for (const depType of ["dependencies", "devDependencies"] as const) {
        const deps = boilerplatePkg[depType];
        if (!deps) continue;
        for (const name of Object.keys(deps)) {
          if (name.startsWith("@vc-shell/")) continue;
          const peerVersion = peerVersions[name];
          if (!peerVersion) continue;
          if (deps[name] === peerVersion) continue;
          deps[name] = peerVersion;
        }
      }
    }

    writeFileSync(pkgPath, JSON.stringify(boilerplatePkg, null, 2) + "\n");
    console.log(`  ✓ Updated ${path.basename(path.dirname(pkgPath))} template to ^${version}`);
  }
}
