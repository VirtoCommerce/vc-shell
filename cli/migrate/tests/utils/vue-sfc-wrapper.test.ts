// @vitest-environment node
import { describe, it, expect } from "vitest";
import jscodeshift from "jscodeshift";
import { wrapForSFC, wrapForSFCTemplate, wrapForSFCBoth } from "../../src/utils/vue-sfc-wrapper";
import type { Transform } from "../../src/transforms/types";

const mockApi = () => {
  const j = jscodeshift.withParser("tsx");
  return { jscodeshift: j, j, stats: () => {}, report: () => {} } as any;
};

describe("wrapForSFC", () => {
  it("passes .ts files directly to coreTransform", () => {
    const core: Transform = (fileInfo) => fileInfo.source.replace("foo", "bar");
    const wrapped = wrapForSFC(core);
    const result = wrapped({ path: "test.ts", source: "const foo = 1;" }, mockApi(), {});
    expect(result).toBe("const bar = 1;");
  });

  it("extracts script setup from .vue and reconstructs", () => {
    const core: Transform = (fileInfo) => fileInfo.source.replace("foo", "bar");
    const wrapped = wrapForSFC(core);
    const vue = `<template><div/></template>
<script setup lang="ts">
const foo = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain("const bar = 1;");
    expect(result).toContain("<template><div/></template>");
  });

  it("handles $emit in transformed script without corruption", () => {
    const core: Transform = (fileInfo) => fileInfo.source.replace("oldFn", "newFn");
    const wrapped = wrapForSFC(core);
    const vue = `<template><div/></template>
<script setup lang="ts">
emit("$emit");
const oldFn = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain('emit("$emit")');
    expect(result).toContain("const newFn = 1;");
  });

  it("returns null for .vue without script block", () => {
    const core: Transform = () => "changed";
    const wrapped = wrapForSFC(core);
    const result = wrapped({ path: "test.vue", source: "<template><div/></template>" }, mockApi(), {});
    expect(result).toBeNull();
  });

  it("returns null when coreTransform returns null", () => {
    const core: Transform = () => null;
    const wrapped = wrapForSFC(core);
    const vue = `<template><div/></template>
<script setup lang="ts">
const x = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toBeNull();
  });
});

describe("wrapForSFCTemplate", () => {
  it("extracts template and applies transform", () => {
    const tmplTransform = (t: string) => ({
      content: t.replace("old", "new"),
      changed: true,
    });
    const wrapped = wrapForSFCTemplate(tmplTransform);
    const vue = `<template>
<div class="old"/>
</template>
<script setup lang="ts">
const x = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain('class="new"');
    expect(result).toContain("const x = 1;");
  });

  it("returns null for .ts files", () => {
    const wrapped = wrapForSFCTemplate(() => ({ content: "", changed: true }));
    expect(wrapped({ path: "test.ts", source: "" }, mockApi(), {})).toBeNull();
  });

  it("returns null when template unchanged", () => {
    const wrapped = wrapForSFCTemplate((t) => ({ content: t, changed: false }));
    const vue = `<template><div/></template>`;
    expect(wrapped({ path: "test.vue", source: vue }, mockApi(), {})).toBeNull();
  });
});

describe("wrapForSFCBoth", () => {
  it("applies both script and template transforms", () => {
    const scriptCore: Transform = (fileInfo) => fileInfo.source.replace("oldVar", "newVar");
    const tmplTransform = (t: string) => ({
      content: t.replace("old-class", "new-class"),
      changed: true,
    });
    const wrapped = wrapForSFCBoth(scriptCore, tmplTransform);
    const vue = `<template>
<div class="old-class"/>
</template>
<script setup lang="ts">
const oldVar = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain("new-class");
    expect(result).toContain("newVar");
  });

  it("returns result when only script changes", () => {
    const scriptCore: Transform = (fileInfo) => fileInfo.source.replace("old", "new");
    const tmplTransform = (t: string) => ({ content: t, changed: false });
    const wrapped = wrapForSFCBoth(scriptCore, tmplTransform);
    const vue = `<template><div/></template>
<script setup lang="ts">
const old = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain("const new = 1;");
  });

  it("returns result when only template changes", () => {
    const scriptCore: Transform = () => null;
    const tmplTransform = (t: string) => ({
      content: t.replace("old", "new"),
      changed: true,
    });
    const wrapped = wrapForSFCBoth(scriptCore, tmplTransform);
    const vue = `<template>
<div class="old"/>
</template>
<script setup lang="ts">
const x = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toContain('class="new"');
  });

  it("returns null when neither changes", () => {
    const scriptCore: Transform = () => null;
    const tmplTransform = (t: string) => ({ content: t, changed: false });
    const wrapped = wrapForSFCBoth(scriptCore, tmplTransform);
    const vue = `<template><div/></template>
<script setup lang="ts">
const x = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, mockApi(), {});
    expect(result).toBeNull();
  });

  it("applies template transform when script transform throws", () => {
    const scriptCore: Transform = () => {
      throw new Error("parse error");
    };
    const tmplTransform = (t: string) => ({
      content: t.replace("old-class", "new-class"),
      changed: true,
    });
    const reports: string[] = [];
    const api = {
      ...mockApi(),
      report: (msg: string) => reports.push(msg),
    };
    const wrapped = wrapForSFCBoth(scriptCore, tmplTransform);
    const vue = `<template>
<div class="old-class"/>
</template>
<script setup lang="ts">
const x = 1;
</script>`;
    const result = wrapped({ path: "test.vue", source: vue }, api, {});
    expect(result).toContain("new-class");
    expect(result).toContain("const x = 1;");
    expect(reports[0]).toContain("Script transform failed");
  });
});
