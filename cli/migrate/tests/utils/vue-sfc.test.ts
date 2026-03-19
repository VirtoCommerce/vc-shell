import { describe, it, expect } from "vitest";
import {
  extractScriptBlocks,
  writeBackScriptBlock,
} from "../../src/utils/vue-sfc";

const sampleVue = `<template>
  <div>Hello</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>

<style scoped>
.hello { color: red; }
</style>`;

describe("extractScriptBlocks", () => {
  it("extracts script setup block with correct offset", () => {
    const blocks = extractScriptBlocks(sampleVue);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("setup");
    expect(blocks[0].lang).toBe("ts");
    expect(blocks[0].content).toContain("import { ref }");
    expect(blocks[0].startLine).toBeGreaterThan(0);
  });

  it("returns empty for vue file without script", () => {
    const blocks = extractScriptBlocks("<template><div/></template>");
    expect(blocks).toHaveLength(0);
  });

  it("skips lang=js blocks and collects warning", () => {
    const jsVue = `<script setup>const x = 1;</script>`;
    const warnings: string[] = [];
    const blocks = extractScriptBlocks(jsVue, warnings);
    expect(blocks).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("JavaScript");
  });
});

describe("writeBackScriptBlock", () => {
  it("replaces script content preserving template and style", () => {
    const newScript = `import { computed } from "vue";\nconst doubled = computed(() => 2);`;
    const result = writeBackScriptBlock(sampleVue, 0, newScript);
    expect(result).toContain("<template>");
    expect(result).toContain("import { computed }");
    expect(result).not.toContain("import { ref }");
    expect(result).toContain("<style scoped>");
  });
});
