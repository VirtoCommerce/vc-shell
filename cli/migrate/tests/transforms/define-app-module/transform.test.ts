import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/define-app-module";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("define-app-module (jscodeshift)", () => {
  it("transforms 2-arg createAppModule", () => {
    const input = readFileSync(join(FIXTURES, "basic.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("defineAppModule");
    expect(result).not.toContain("createAppModule");
    expect(result).toContain("blades: pages");
    expect(result).toContain("locales");
  });

  it("transforms 2-arg with aliased identifiers", () => {
    const input = readFileSync(join(FIXTURES, "aliased-args.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).toContain("blades: mpPages");
    expect(result).toContain("locales: mpLocales");
  });

  it("transforms 3-arg with notificationTemplates", () => {
    const input = readFileSync(join(FIXTURES, "three-args.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("defineAppModule");
    expect(result).toContain("blades: pages");
    expect(result).toContain("locales");
    expect(result).toContain("notificationTemplates");
    expect(result).not.toContain("createAppModule");
  });

  it("skips files without createAppModule", () => {
    const input = readFileSync(join(FIXTURES, "no-match.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).toBeNull();
  });

  it("warns on 3-arg about notificationTemplates", () => {
    const input = readFileSync(join(FIXTURES, "three-args.input.ts"), "utf8");
    const { reports } = applyTransformWithReports(transform, { path: "test.ts", source: input });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("deprecated");
  });

  it("transforms 4-arg createAppModule to object syntax", () => {
    const input = readFileSync(join(FIXTURES, "four-args.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("blades: pages");
    expect(result).toContain("locales");
    expect(result).toContain("notificationTemplates");
    expect(result).not.toMatch(/defineAppModule\([^)]*components/s);
    expect(result).not.toContain('import * as components');
  });

  it("preserves formatting of unchanged lines", () => {
    const input = readFileSync(join(FIXTURES, "basic.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    // The import line structure should be preserved (only name changes)
    expect(result).toContain('from "@vc-shell/framework"');
    // Import should use the same quote style and structure
    expect(result).toMatch(/import\s*\{\s*defineAppModule\s*\}\s*from\s*"@vc-shell\/framework"/);
  });

  it("auto-migrates notifications when notifyTypeMap is provided", () => {
    const input = readFileSync(join(FIXTURES, "notifications-auto.input.ts"), "utf8");
    const notifyTypeMap = {
      "./components/notifications": {
        OfferCreatedDomainEvent: "OfferCreatedDomainEvent.vue",
        OfferDeletedDomainEvent: "OfferDeletedDomainEvent.vue",
      },
    };
    const result = applyTransform(transform, { path: "modules/offers/index.ts", source: input }, { notifyTypeMap });
    expect(result).not.toBeNull();
    expect(result).not.toContain("notificationTemplates");
    expect(result).toContain('import OfferCreatedDomainEvent from "./components/notifications/OfferCreatedDomainEvent.vue"');
    expect(result).toContain('import OfferDeletedDomainEvent from "./components/notifications/OfferDeletedDomainEvent.vue"');
    expect(result).toContain("notifications:");
    expect(result).toContain('mode: "auto"');
    expect(result).toContain("template: OfferCreatedDomainEvent");
  });

  it("falls back to notificationTemplates when no notifyTypeMap", () => {
    const input = readFileSync(join(FIXTURES, "three-args.input.ts"), "utf8");
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).toContain("notificationTemplates");
  });

  it("handles Vue SFC files", () => {
    const vue = `<template><div/></template>
<script setup lang="ts">
import { createAppModule } from "@vc-shell/framework";
export default createAppModule(pages, locales);
</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain("<template><div/></template>");
    expect(result).toContain("defineAppModule");
    expect(result).not.toContain("createAppModule");
  });
});
