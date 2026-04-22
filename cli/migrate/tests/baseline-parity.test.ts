// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BASELINE_VERSIONS } from "../src/baseline-versions";

describe("BASELINE_VERSIONS mirrors configs/peer-versions.json", () => {
  it("contains the same keys and values as the canonical source", () => {
    const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
    const peerVersionsPath = join(repoRoot, "configs", "peer-versions.json");
    const peerVersions = JSON.parse(readFileSync(peerVersionsPath, "utf-8")).versions as Record<string, string>;

    expect(Object.keys(BASELINE_VERSIONS).sort()).toEqual(Object.keys(peerVersions).sort());
    for (const key of Object.keys(peerVersions)) {
      expect(BASELINE_VERSIONS[key]).toBe(peerVersions[key]);
    }
  });
});
