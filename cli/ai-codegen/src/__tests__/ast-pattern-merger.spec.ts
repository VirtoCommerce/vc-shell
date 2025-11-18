/**
 * Tests for AST Pattern Merger
 */

import { describe, it, expect } from "vitest";
import { ASTPatternMerger } from "../core/ast-pattern-merger.js";

describe("ASTPatternMerger", () => {
  const merger = new ASTPatternMerger();

  describe("parseVueSFC", () => {
    it("should parse complete Vue SFC", () => {
      const sfc = `
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const message = ref('Hello');
</script>

<style scoped>
div { color: red; }
</style>
      `.trim();

      const parsed = merger.parseVueSFC(sfc);

      expect(parsed.template).toContain("{{ message }}");
      expect(parsed.script).toContain("import { ref }");
      expect(parsed.script).toContain("const message");
      expect(parsed.style).toContain("color: red");
    });

    it("should handle SFC with only template", () => {
      const sfc = `<template><div>Test</div></template>`;
      const parsed = merger.parseVueSFC(sfc);

      expect(parsed.template).toContain("Test");
      expect(parsed.script).toBe("");
      expect(parsed.style).toBe("");
    });

    it("should handle SFC with complex template slots", () => {
      const sfc = `
<template>
  <VcTable>
    <template #mobile-item="{ item }">
      <div v-if="item.status === 'active'">{{ item.name }}</div>
    </template>
  </VcTable>
</template>
      `.trim();

      const parsed = merger.parseVueSFC(sfc);

      expect(parsed.template).toContain("#mobile-item");
      expect(parsed.template).toContain("v-if");
    });
  });

  describe("parseScript", () => {
    it("should categorize imports correctly", () => {
      const script = `
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Product } from './types';
      `.trim();

      const parsed = merger.parseScript(script);

      expect(parsed.imports).toHaveLength(3);
      expect(parsed.imports[0].source.value).toBe("vue");
    });

    it("should detect composables (useXxx)", () => {
      const script = `
import { useRouter } from 'vue-router';
import { useNotifications } from './composables';

const router = useRouter();
const notifications = useNotifications();
      `.trim();

      const parsed = merger.parseScript(script);

      expect(parsed.composables).toHaveLength(2);
    });

    it("should detect reactive refs", () => {
      const script = `
import { ref, reactive, computed } from 'vue';

const count = ref(0);
const state = reactive({ name: 'Test' });
const double = computed(() => count.value * 2);
      `.trim();

      const parsed = merger.parseScript(script);

      expect(parsed.refs).toHaveLength(3);
    });

    it("should detect functions", () => {
      const script = `
function handleClick() {
  console.log('clicked');
}

function processData(data) {
  return data.map(x => x * 2);
}
      `.trim();

      const parsed = merger.parseScript(script);

      expect(parsed.functions).toHaveLength(2);
    });

    it("should handle nested composables in functions", () => {
      const script = `
import { useRouter } from 'vue-router';

function navigateTo(path) {
  const router = useRouter();
  router.push(path);
}
      `.trim();

      const parsed = merger.parseScript(script);

      // The useRouter inside function should be detected
      expect(parsed.imports).toHaveLength(1);
      expect(parsed.functions).toHaveLength(1);
    });
  });

  describe("mergeImports", () => {
    it("should deduplicate imports from same source", () => {
      const script1 = `import { ref } from 'vue';`;
      const script2 = `import { computed } from 'vue';`;

      const parsed1 = merger.parseScript(script1);
      const parsed2 = merger.parseScript(script2);

      const merged = merger.mergeImports(parsed1.imports, parsed2.imports);

      expect(merged).toHaveLength(1);
      expect(merged[0].source.value).toBe("vue");
      expect(merged[0].specifiers).toHaveLength(2);
    });

    it("should not duplicate same specifiers", () => {
      const script1 = `import { ref } from 'vue';`;
      const script2 = `import { ref, computed } from 'vue';`;

      const parsed1 = merger.parseScript(script1);
      const parsed2 = merger.parseScript(script2);

      const merged = merger.mergeImports(parsed1.imports, parsed2.imports);

      expect(merged).toHaveLength(1);
      expect(merged[0].specifiers).toHaveLength(2); // ref + computed, not 3
    });

    it("should keep imports from different sources", () => {
      const script1 = `import { ref } from 'vue';`;
      const script2 = `import { useRouter } from 'vue-router';`;

      const parsed1 = merger.parseScript(script1);
      const parsed2 = merger.parseScript(script2);

      const merged = merger.mergeImports(parsed1.imports, parsed2.imports);

      expect(merged).toHaveLength(2);
    });
  });

  describe("mergeScripts", () => {
    it("should merge two simple scripts", () => {
      const script1 = `
import { ref } from 'vue';
const count = ref(0);
      `.trim();

      const script2 = `
import { computed } from 'vue';
const double = computed(() => count.value * 2);
      `.trim();

      const merged = merger.mergeScripts(script1, script2);

      expect(merged).toContain("import");
      expect(merged).toContain("ref");
      expect(merged).toContain("computed");
      expect(merged).toContain("count");
      expect(merged).toContain("double");
    });

    it("should handle complex composables", () => {
      const script1 = `
import { ref } from 'vue';
import { useNotifications } from './composables';

const notifications = useNotifications();
const data = ref([]);
      `.trim();

      const script2 = `
import { useRouter } from 'vue-router';

const router = useRouter();
      `.trim();

      const merged = merger.mergeScripts(script1, script2);

      expect(merged).toContain("useNotifications");
      expect(merged).toContain("useRouter");
      expect(merged).toContain("notifications");
      expect(merged).toContain("router");
    });
  });

  describe("mergeVueSFCs", () => {
    it("should merge complete Vue SFC files", () => {
      const base = `
<template>
  <div>Base</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const message = ref('Hello');
</script>
      `.trim();

      const pattern = `
<template>
  <div>Pattern</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const upper = computed(() => message.value.toUpperCase());
</script>

<style scoped>
div { color: blue; }
</style>
      `.trim();

      const merged = merger.mergeVueSFCs(base, pattern);

      expect(merged.template).toContain("Pattern"); // Pattern template wins
      expect(merged.script).toContain("ref");
      expect(merged.script).toContain("computed");
      expect(merged.style).toContain("color: blue");
    });
  });

  describe("merge (end-to-end)", () => {
    it("should merge complete SFC with all sections", () => {
      const base = `
<template>
  <div class="base">{{ count }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>

<style scoped>
.base { padding: 10px; }
</style>
      `.trim();

      const pattern = `
<template>
  <div class="pattern">
    <button @click="increment">+</button>
    {{ double }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const double = computed(() => count.value * 2);
function increment() {
  count.value++;
}
</script>

<style scoped>
button { background: blue; }
</style>
      `.trim();

      const result = merger.merge(base, pattern);

      // Check structure
      expect(result).toContain("<template>");
      expect(result).toContain("<script setup lang=\"ts\">");
      expect(result).toContain("<style scoped>");

      // Check imports merged
      expect(result).toContain("import");
      expect(result.match(/import.*vue/g)?.length).toBe(1); // Single import from vue

      // Check all code present
      expect(result).toContain("count");
      expect(result).toContain("double");
      expect(result).toContain("increment");

      // Check styles merged
      expect(result).toContain("background: blue");
    });

    it("should handle SFC with complex nested slots", () => {
      const base = `
<template>
  <VcTable :items="items" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
const items = ref([]);
</script>
      `.trim();

      const pattern = `
<template>
  <VcTable :items="items">
    <template #mobile-item="{ item, index }">
      <div v-if="item.active" :key="index">
        {{ item.name }}
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const activeItems = computed(() => items.value.filter(x => x.active));
</script>
      `.trim();

      const result = merger.merge(base, pattern);

      // Should handle complex template (pattern wins)
      expect(result).toContain("#mobile-item");
      expect(result).toContain("v-if");

      // Should merge scripts correctly
      expect(result).toContain("items");
      expect(result).toContain("activeItems");
    });
  });
});
