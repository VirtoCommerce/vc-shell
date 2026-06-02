import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { releasePackages } from "./release-packages";

// Publishes every managed package with the real `npm` CLI (not `yarn npm
// publish`). npm publish auto-attaches provenance when run under npm Trusted
// Publishing (OIDC) — no --provenance flag needed. See .github/workflows for
// the OIDC wiring and .github/workflows/README.md → "Trusted Publishing".
//
// IMPORTANT: unlike `yarn npm publish`, the real npm CLI does NOT rewrite the
// `workspace:` protocol on publish, so any `workspace:*` spec would leak
// verbatim into the published manifest (mf-host/mf-module carry one in runtime
// `dependencies`, which would break consumer installs). All managed packages
// share a single version, so we rewrite each `@vc-shell/*` workspace ref to a
// concrete version just before publishing, then restore the on-disk manifest.

const DEP_SECTIONS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

const tagIndex = process.argv.indexOf("--tag");
const tag = tagIndex !== -1 ? process.argv[tagIndex + 1] : "latest";

if (!tag) {
  throw new Error("--tag was passed without a value");
}

function resolveWorkspaceSpec(spec: string, version: string): string {
  // workspace:* / workspace:  → exact version
  // workspace:^ / workspace:~ → caret/tilde of the version
  // workspace:^1.2.3          → explicit range kept as-is
  const range = spec.slice("workspace:".length);
  if (range === "" || range === "*") return version;
  if (range === "^") return `^${version}`;
  if (range === "~") return `~${version}`;
  return range;
}

function rewriteWorkspaceProtocol(manifest: Record<string, unknown>, version: string): boolean {
  let changed = false;
  for (const section of DEP_SECTIONS) {
    const deps = manifest[section] as Record<string, string> | undefined;
    if (!deps) continue;
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec === "string" && spec.startsWith("workspace:")) {
        deps[name] = resolveWorkspaceSpec(spec, version);
        changed = true;
      }
    }
  }
  return changed;
}

for (const pkg of releasePackages) {
  const dir = path.resolve(pkg.path);
  const manifestPath = path.join(dir, "package.json");
  const original = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(original) as Record<string, unknown>;
  const rewritten = rewriteWorkspaceProtocol(manifest, manifest.version as string);

  if (rewritten) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(`\n[publish] ${pkg.displayName} → ${tag}`);
  try {
    const result = spawnSync("npm", ["publish", "--access", "public", "--tag", tag], {
      cwd: dir,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      throw new Error(`Failed to publish ${pkg.packageName} (exit ${result.status ?? "signal " + result.signal})`);
    }
  } finally {
    if (rewritten) {
      // Restore the original manifest so the working tree (and any subsequent
      // step that reads it) keeps the `workspace:` protocol intact.
      writeFileSync(manifestPath, original);
    }
  }
}
