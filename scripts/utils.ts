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

const DEP_BLOCK_OPEN = /^\s*"(?:dependencies|devDependencies)"\s*:\s*\{\s*$/;
const DEP_BLOCK_CLOSE = /^\s*\},?\s*$/;
const DEP_ENTRY = /^(\s*")([^"]+)("\s*:\s*")([^"]*)("\s*,?\s*)$/;

/**
 * Not parsed as JSON: the templates are `.ejs` and may hold EJS tags at object
 * level, so `readJsonSync` would throw and a `JSON.stringify` write-back would
 * drop the tags. Scoped to the dependency blocks because `lint-staged` is both
 * a dev dependency and a script name.
 */
function rewriteDependencyVersions(source: string, version: string, peerVersions: VersionMap | null): string {
  let inDepBlock = false;

  return source
    .split("\n")
    .map((line) => {
      if (!inDepBlock) {
        if (DEP_BLOCK_OPEN.test(line)) inDepBlock = true;
        return line;
      }

      if (DEP_BLOCK_CLOSE.test(line)) {
        inDepBlock = false;
        return line;
      }

      const entry = DEP_ENTRY.exec(line);
      if (!entry) return line;

      const [, open, name, middle, current, close] = entry;
      const next = name.startsWith("@vc-shell/") ? `^${version}` : (peerVersions?.[name] ?? current);

      return next === current ? line : `${open}${name}${middle}${next}${close}`;
    })
    .join("\n");
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

    const source = fs.readFileSync(pkgPath, "utf-8");

    writeFileSync(pkgPath, rewriteDependencyVersions(source, version, peerVersions));
    console.log(`  ✓ Updated ${path.basename(path.dirname(pkgPath))} template to ^${version}`);
  }
}
