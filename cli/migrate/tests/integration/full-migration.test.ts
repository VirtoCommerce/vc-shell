import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

function createSampleProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "migrate-integration-"));

  // package.json with old version
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      dependencies: { "@vc-shell/framework": "1.0.0" },
    }),
  );

  mkdirSync(join(dir, "src"), { recursive: true });

  // File 1: Uses createAppModule
  writeFileSync(
    join(dir, "src", "module.ts"),
    `import { createAppModule } from "@vc-shell/framework";
export default createAppModule(pages, locales);
`,
  );

  // File 2: Uses deprecated aliases
  writeFileSync(
    join(dir, "src", "services.ts"),
    `import { BladeInstance, TOOLBAR_SERVICE } from "@vc-shell/framework";
const blade = inject(BladeInstance);
const toolbar = inject(TOOLBAR_SERVICE);
`,
  );

  // File 3: Uses useNotifications
  writeFileSync(
    join(dir, "src", "notifications.ts"),
    `import { useNotifications } from "@vc-shell/framework";
const { notification } = useNotifications();
`,
  );

  // File 4: Uses useBladeNavigation with onBeforeClose
  writeFileSync(
    join(dir, "src", "blade.ts"),
    `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return false;
});
`,
  );

  // File 5: Uses AI agent imports (should be split)
  writeFileSync(
    join(dir, "src", "ai.ts"),
    `import { useAiAgent, ref } from "@vc-shell/framework";
const agent = useAiAgent();
const count = ref(0);
`,
  );

  // File 6: Uses extension imports (should be split)
  writeFileSync(
    join(dir, "src", "extensions.ts"),
    `import { defineExtensionPoint, computed } from "@vc-shell/framework";
const ep = defineExtensionPoint("test");
const val = computed(() => 1);
`,
  );

  return dir;
}

describe("full migration integration test", () => {
  it("migrates a 1.x project to 2.0.0 applying all transforms", async () => {
    const dir = createSampleProject();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await run({ cwd: dir, to: "2.0.0", dryRun: false, list: false });

    consoleSpy.mockRestore();

    // Verify File 1: createAppModule → defineAppModule
    const moduleText = readFileSync(join(dir, "src", "module.ts"), "utf-8");
    expect(moduleText).toContain("defineAppModule");
    expect(moduleText).toContain("defineAppModule({ pages, locales })");
    expect(moduleText).not.toContain("createAppModule");

    // Verify File 2: deprecated aliases renamed
    const servicesText = readFileSync(join(dir, "src", "services.ts"), "utf-8");
    expect(servicesText).toContain("BladeInstanceKey");
    expect(servicesText).toContain("ToolbarServiceKey");
    expect(servicesText).not.toMatch(/\bBladeInstance\b(?!Key)/);
    expect(servicesText).not.toMatch(/\bTOOLBAR_SERVICE\b/);

    // Verify File 3: useNotifications → useBladeNotifications
    const notifText = readFileSync(join(dir, "src", "notifications.ts"), "utf-8");
    expect(notifText).toContain("useBladeNotifications");
    expect(notifText).not.toMatch(/\buseNotifications\b/);

    // Verify File 4: useBladeNavigation → useBlade + boolean inversion
    const bladeText = readFileSync(join(dir, "src", "blade.ts"), "utf-8");
    expect(bladeText).toContain("useBlade");
    expect(bladeText).not.toMatch(/\buseBladeNavigation\b/);
    expect(bladeText).toContain("!false"); // inverted return

    // Verify File 5: AI agent import split
    const aiText = readFileSync(join(dir, "src", "ai.ts"), "utf-8");
    expect(aiText).toContain("@vc-shell/framework/ai-agent");
    expect(aiText).toContain("useAiAgent");

    // Verify File 6: Extensions import split
    const extText = readFileSync(join(dir, "src", "extensions.ts"), "utf-8");
    expect(extText).toContain("@vc-shell/framework/extensions");
    expect(extText).toContain("defineExtensionPoint");
  });

  it("dry-run mode does not modify any files", async () => {
    const dir = createSampleProject();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await run({ cwd: dir, to: "2.0.0", dryRun: true, list: false });

    consoleSpy.mockRestore();

    // All files should be unchanged
    const moduleText = readFileSync(join(dir, "src", "module.ts"), "utf-8");
    expect(moduleText).toContain("createAppModule");

    const servicesText = readFileSync(join(dir, "src", "services.ts"), "utf-8");
    expect(servicesText).toContain("BladeInstance");
  });
});
