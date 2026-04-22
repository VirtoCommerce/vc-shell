// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { updateBoilerplatePkgVersions } from "../../../../scripts/utils";

const TEMPLATE_REL = "cli/create-vc-app/src/templates";

function setupRepo(opts: {
  repoVersion: string;
  templates: Record<string, unknown>;
  peerVersions?: Record<string, string> | "missing" | "malformed";
}): string {
  const root = mkdtempSync(join(tmpdir(), "vc-utils-test-"));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: "@vc-shell/root", version: opts.repoVersion }, null, 2),
  );
  for (const [tplName, tplPkg] of Object.entries(opts.templates)) {
    const dir = join(root, TEMPLATE_REL, tplName);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "_package.json.ejs"), JSON.stringify(tplPkg, null, 2) + "\n");
  }
  if (opts.peerVersions === "missing") {
    // do nothing — file not created
  } else if (opts.peerVersions === "malformed") {
    const configsDir = join(root, "configs");
    mkdirSync(configsDir, { recursive: true });
    writeFileSync(join(configsDir, "peer-versions.json"), "{ not valid json");
  } else if (opts.peerVersions) {
    const configsDir = join(root, "configs");
    mkdirSync(configsDir, { recursive: true });
    writeFileSync(
      join(configsDir, "peer-versions.json"),
      JSON.stringify({ description: "", versions: opts.peerVersions }, null, 2),
    );
  }
  return root;
}

function readTemplate(
  root: string,
  name: string,
): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } {
  return JSON.parse(readFileSync(join(root, TEMPLATE_REL, name, "_package.json.ejs"), "utf-8"));
}

describe("updateBoilerplatePkgVersions (rewritten)", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  const cleanupPaths: string[] = [];

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    for (const p of cleanupPaths.splice(0)) {
      rmSync(p, { recursive: true, force: true });
    }
  });

  it("bumps @vc-shell/* in templates to current repo version", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: { "@vc-shell/framework": "^1.0.0" },
          devDependencies: { "@vc-shell/ts-config": "^1.0.0" },
        },
      },
      peerVersions: {},
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.dependencies!["@vc-shell/framework"]).toBe("^2.0.0-alpha.50");
    expect(tpl.devDependencies!["@vc-shell/ts-config"]).toBe("^2.0.0-alpha.50");
  });

  it("syncs intersection versions from peer map with exact-match (including downgrades)", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: {},
          devDependencies: { vite: "^7.0.0", eslint: "^8.0.0" },
        },
      },
      peerVersions: { vite: "^6.3.3", eslint: "^9.35.0" },
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.devDependencies!.vite).toBe("^6.3.3");
    expect(tpl.devDependencies!.eslint).toBe("^9.35.0");
  });

  it("does not add packages from peer map that are absent in template", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: {},
          devDependencies: { vite: "^5.0.0" },
        },
      },
      peerVersions: { vite: "^6.3.3", vitest: "^1.6.0", jsdom: "^24.1.0" },
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.devDependencies).not.toHaveProperty("vitest");
    expect(tpl.devDependencies).not.toHaveProperty("jsdom");
    expect(tpl.devDependencies!.vite).toBe("^6.3.3");
  });

  it("leaves template deps untouched when they are absent from the peer map", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: {},
          devDependencies: { moment: "^2.30.1" },
        },
      },
      peerVersions: { eslint: "^9.35.0" },
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.devDependencies!.moment).toBe("^2.30.1");
  });

  it("does not override @vc-shell/* even if peer map contains matching keys", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: { "@vc-shell/framework": "^1.0.0" },
          devDependencies: {},
        },
      },
      peerVersions: { "@vc-shell/framework": "^9.9.9" },
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.dependencies!["@vc-shell/framework"]).toBe("^2.0.0-alpha.50");
  });

  it("warns and falls back to @vc-shell/*-only sync when peer-versions.json is missing", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: { "@vc-shell/framework": "^1.0.0" },
          devDependencies: { vite: "^5.0.0" },
        },
      },
      peerVersions: "missing",
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.dependencies!["@vc-shell/framework"]).toBe("^2.0.0-alpha.50");
    expect(tpl.devDependencies!.vite).toBe("^5.0.0");
    expect(warnSpy).toHaveBeenCalled();
    const warnMsg = warnSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(warnMsg).toMatch(/peer-versions\.json/);
  });

  it("warns and falls back to @vc-shell/*-only sync when peer-versions.json is malformed", async () => {
    const root = setupRepo({
      repoVersion: "2.0.0-alpha.50",
      templates: {
        standalone: {
          dependencies: { "@vc-shell/framework": "^1.0.0" },
          devDependencies: { vite: "^5.0.0" },
        },
      },
      peerVersions: "malformed",
    });
    cleanupPaths.push(root);

    await updateBoilerplatePkgVersions(root);

    const tpl = readTemplate(root, "standalone");
    expect(tpl.dependencies!["@vc-shell/framework"]).toBe("^2.0.0-alpha.50");
    expect(tpl.devDependencies!.vite).toBe("^5.0.0");
    expect(warnSpy).toHaveBeenCalled();
  });

  it("warns and falls back when peer-versions.json has no `versions` object", async () => {
    const root = mkdtempSync(join(tmpdir(), "vc-utils-test-"));
    cleanupPaths.push(root);
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ name: "@vc-shell/root", version: "2.0.0-alpha.50" }, null, 2),
    );
    const tplDir = join(root, "cli/create-vc-app/src/templates/standalone");
    mkdirSync(tplDir, { recursive: true });
    writeFileSync(
      join(tplDir, "_package.json.ejs"),
      JSON.stringify(
        {
          dependencies: { "@vc-shell/framework": "^1.0.0" },
          devDependencies: { vite: "^5.0.0" },
        },
        null,
        2,
      ) + "\n",
    );
    const configsDir = join(root, "configs");
    mkdirSync(configsDir, { recursive: true });
    writeFileSync(join(configsDir, "peer-versions.json"), JSON.stringify({ description: "no versions key" }, null, 2));

    await updateBoilerplatePkgVersions(root);

    const tpl = JSON.parse(readFileSync(join(tplDir, "_package.json.ejs"), "utf-8"));
    expect(tpl.dependencies["@vc-shell/framework"]).toBe("^2.0.0-alpha.50");
    expect(tpl.devDependencies.vite).toBe("^5.0.0");
    expect(warnSpy).toHaveBeenCalled();
  });
});
