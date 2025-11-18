/**
 * Tests for submit_generated_code MCP tool
 * Tests code submission, validation, feedback, and file saving
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CodeValidator } from "../core/code-validator.js";
import { LLMFeedbackFormatter } from "../core/llm-feedback.js";
import type { SubmitGeneratedCodeInput } from "../schemas/zod-schemas.js";

// Test directory
const TEST_DIR = path.join(process.cwd(), "test-output", "submit-code-test");

describe("submit_generated_code MCP tool", () => {
  const validator = new CodeValidator();
  const feedback = new LLMFeedbackFormatter();

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("validation", () => {
    it("should accept valid Vue SFC code", () => {
      const code = `
<template>
  <VcBlade :title="$t('PRODUCTS.PAGES.LIST.TITLE')">
    <VcTable
      :items="items"
      :loading="loading"
      :columns="columns"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VcBlade, VcTable } from '@vc-shell/framework';
import { useProductList } from '../composables/useProductList';

defineOptions({
  name: 'ProductsList',
  url: '/products'
});

const { items, loading } = useProductList();
const columns = ref([
  { id: 'name', title: 'Name' }
]);

function onItemClick(item: any) {
  console.log('Clicked:', item);
}
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it("should reject code missing template section", () => {
      const code = `
<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'Test',
  url: '/test'
});

const data = ref([]);
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.message.includes("template"))).toBe(
        true
      );
    });

    it("should reject code missing defineOptions", () => {
      const code = `
<template>
  <VcBlade>
    <div>Test</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcBlade } from '@vc-shell/framework';

const data = ref([]);
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) => e.message.includes("defineOptions"))
      ).toBe(true);
    });

    it("should reject code with unknown component", () => {
      const code = `
<template>
  <VcBlade :title="$t('TEST.TITLE')">
    <VcUnknownComponent />
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from '@vc-shell/framework';

defineOptions({
  name: 'Test',
  url: '/test'
});
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) => e.message.includes("VcUnknownComponent"))
      ).toBe(true);
    });

    it("should reject code with invalid component name (not PascalCase)", () => {
      const code = `
<template>
  <VcBlade :title="$t('TEST.TITLE')">
    <div>Test</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from '@vc-shell/framework';

defineOptions({
  name: 'test-component',
  url: '/test'
});
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) => e.message.includes("PascalCase"))
      ).toBe(true);
    });

    it("should reject code with invalid URL (not starting with /)", () => {
      const code = `
<template>
  <VcBlade :title="$t('TEST.TITLE')">
    <div>Test</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from '@vc-shell/framework';

defineOptions({
  name: 'Test',
  url: 'test'
});
</script>
`;

      const validation = validator.validateFull(code);
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) => e.message.includes("must start with /"))
      ).toBe(true);
    });
  });

  describe("feedback formatting", () => {
    it("should format errors with actionable fixes", () => {
      const validation = validator.validateFull(`
<script setup lang="ts">
const data = ref([]);
</script>
`);

      const feedbackMessage = feedback.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_FULL",
      });

      expect(feedbackMessage.success).toBe(false);
      expect(feedbackMessage.errors).toBeDefined();
      expect(feedbackMessage.errors!.length).toBeGreaterThan(0);
      expect(feedbackMessage.suggestions).toBeDefined();
      expect(feedbackMessage.canRetry).toBe(true);
    });

    it("should indicate retry is available on first attempt", () => {
      const validation = validator.validateFull(`<template></template>`);

      const feedbackMessage = feedback.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_FULL",
      });

      expect(feedbackMessage.canRetry).toBe(true);
      expect(feedbackMessage.retryAttempt).toBe(2);
    });

    it("should indicate no retry after 3 attempts", () => {
      const validation = validator.validateFull(`<template></template>`);

      const feedbackMessage = feedback.formatValidationFeedback(validation, {
        attempt: 3,
        strategy: "AI_FULL",
      });

      expect(feedbackMessage.canRetry).toBe(false);
      expect(feedbackMessage.message.toLowerCase()).toContain("no automated fallback");
    });
  });

  describe("file saving", () => {
    it("should save blade file to correct location", () => {
      const moduleDir = path.join(TEST_DIR, "src", "modules", "products");
      const bladeFilePath = path.join(
        moduleDir,
        "pages",
        "products-list.vue"
      );

      // Create directory structure
      fs.mkdirSync(path.dirname(bladeFilePath), { recursive: true });

      const code = `
<template>
  <VcBlade :title="$t('PRODUCTS.PAGES.LIST.TITLE')">
    <VcTable :items="items" :loading="loading" />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcBlade, VcTable } from '@vc-shell/framework';

defineOptions({
  name: 'ProductsList',
  url: '/products'
});

const items = ref([]);
const loading = ref(false);
</script>
`;

      // Save file
      fs.writeFileSync(bladeFilePath, code, "utf-8");

      // Verify file exists and has correct content
      expect(fs.existsSync(bladeFilePath)).toBe(true);
      const savedContent = fs.readFileSync(bladeFilePath, "utf-8");
      expect(savedContent).toBe(code);
    });

    it("should save composable file when provided", () => {
      const moduleDir = path.join(TEST_DIR, "src", "modules", "products");
      const composableFilePath = path.join(
        moduleDir,
        "composables",
        "useProductList.ts"
      );

      // Create directory structure
      fs.mkdirSync(path.dirname(composableFilePath), { recursive: true });

      const composableCode = `
import { ref } from 'vue';

export function useProductList() {
  const items = ref([]);
  const loading = ref(false);

  async function loadProducts() {
    loading.value = true;
    // Load data
    loading.value = false;
  }

  return {
    items,
    loading,
    loadProducts
  };
}
`;

      // Save file
      fs.writeFileSync(composableFilePath, composableCode, "utf-8");

      // Verify file exists
      expect(fs.existsSync(composableFilePath)).toBe(true);
      const savedContent = fs.readFileSync(composableFilePath, "utf-8");
      expect(savedContent).toBe(composableCode);
    });

    it("should create directories if they don't exist", () => {
      const moduleDir = path.join(
        TEST_DIR,
        "src",
        "modules",
        "new-module",
        "pages"
      );
      const bladeFilePath = path.join(moduleDir, "test.vue");

      // Directory doesn't exist yet
      expect(fs.existsSync(moduleDir)).toBe(false);

      // Create directory and save file
      fs.mkdirSync(moduleDir, { recursive: true });
      fs.writeFileSync(bladeFilePath, "<template></template>", "utf-8");

      // Verify directory and file exist
      expect(fs.existsSync(moduleDir)).toBe(true);
      expect(fs.existsSync(bladeFilePath)).toBe(true);
    });
  });

  describe("complete workflow simulation", () => {
    it("should simulate successful code submission", () => {
      const validCode = `
<template>
  <VcBlade :title="$t('PRODUCTS.PAGES.LIST.TITLE')">
    <VcTable
      :items="items"
      :loading="loading"
      :columns="columns"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { VcBlade, VcTable } from '@vc-shell/framework';
import { useProductList } from '../composables/useProductList';

defineOptions({
  name: 'ProductsList',
  url: '/products'
});

const { t } = useI18n({ useScope: 'global' });
const { items, loading } = useProductList();

const columns = computed(() => [
  { id: 'name', title: t('PRODUCTS.PAGES.LIST.COLUMNS.NAME') }
]);

function onItemClick(item: any) {
  console.log('Item clicked:', item);
}

onMounted(async () => {
  // Load data
});
</script>
`;

      // Step 1: Validate
      const validation = validator.validateFull(validCode);

      // Step 2: Format feedback
      const feedbackMessage = feedback.formatValidationFeedback(validation, {
        attempt: 1,
        strategy: "AI_FULL",
      });

      // Step 3: Check success
      expect(feedbackMessage.success).toBe(true);
      expect(validation.valid).toBe(true);

      // Step 4: Simulate file saving
      const moduleDir = path.join(TEST_DIR, "src", "modules", "products");
      const bladeFilePath = path.join(
        moduleDir,
        "pages",
        "products-list.vue"
      );

      fs.mkdirSync(path.dirname(bladeFilePath), { recursive: true });
      fs.writeFileSync(bladeFilePath, validCode, "utf-8");

      // Verify file saved
      expect(fs.existsSync(bladeFilePath)).toBe(true);
    });

    it("should simulate failed submission with retry", () => {
      // Attempt 1: Missing defineOptions
      const invalidCode1 = `
<template>
  <VcBlade :title="$t('PRODUCTS.PAGES.LIST.TITLE')">
    <VcTable :items="items" />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcBlade, VcTable } from '@vc-shell/framework';

const items = ref([]);
</script>
`;

      const validation1 = validator.validateFull(invalidCode1);
      const feedback1 = feedback.formatValidationFeedback(validation1, {
        attempt: 1,
        strategy: "AI_FULL",
      });

      expect(feedback1.success).toBe(false);
      expect(feedback1.canRetry).toBe(true);
      expect(
        feedback1.errors?.some((e) => e.description.includes("defineOptions"))
      ).toBe(true);

      // Attempt 2: Fixed defineOptions
      const invalidCode2 = `
<template>
  <VcBlade :title="$t('PRODUCTS.PAGES.LIST.TITLE')">
    <VcTable :items="items" />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcBlade, VcTable } from '@vc-shell/framework';

defineOptions({
  name: 'ProductsList',
  url: '/products'
});

const items = ref([]);
</script>
`;

      const validation2 = validator.validateFull(invalidCode2);
      const feedback2 = feedback.formatValidationFeedback(validation2, {
        attempt: 2,
        strategy: "AI_FULL",
        previousErrors: validation1.errors,
      });

      // Now validation passes
      expect(feedback2.success).toBe(true);
      expect(validation2.valid).toBe(true);
    });

    it("should simulate max retries reached", () => {
      const invalidCode = `
<template>
  <div>Invalid</div>
</template>

<script>
// Not using setup
</script>
`;

      // Attempt 1
      const validation1 = validator.validateFull(invalidCode);
      const feedback1 = feedback.formatValidationFeedback(validation1, {
        attempt: 1,
        strategy: "AI_FULL",
      });
      expect(feedback1.canRetry).toBe(true);

      // Attempt 2
      const feedback2 = feedback.formatValidationFeedback(validation1, {
        attempt: 2,
        strategy: "AI_FULL",
      });
      expect(feedback2.canRetry).toBe(true);

      // Attempt 3 (final)
      const feedback3 = feedback.formatValidationFeedback(validation1, {
        attempt: 3,
        strategy: "AI_FULL",
      });
      expect(feedback3.canRetry).toBe(false);
      expect(feedback3.message.toLowerCase()).toContain("no automated fallback");
    });
  });

  describe("input validation", () => {
    it("should validate required fields in submission", () => {
      const input: SubmitGeneratedCodeInput = {
        bladeId: "products-list",
        code: "<template></template>",
        context: {
          module: "products",
          layout: "grid",
          strategy: "AI_FULL",
        },
      };

      expect(input.bladeId).toBeDefined();
      expect(input.code).toBeDefined();
      expect(input.context.module).toBeDefined();
      expect(input.context.layout).toBeDefined();
      expect(input.context.strategy).toBeDefined();
    });

    it("should accept optional composable", () => {
      const input: SubmitGeneratedCodeInput = {
        bladeId: "products-list",
        code: "<template></template>",
        context: {
          module: "products",
          layout: "grid",
          strategy: "AI_FULL",
        },
        composable: {
          name: "useProductList",
          code: "export function useProductList() {}",
        },
      };

      expect(input.composable).toBeDefined();
      expect(input.composable?.name).toBe("useProductList");
    });

    it("should accept optional retry information", () => {
      const input: SubmitGeneratedCodeInput = {
        bladeId: "products-list",
        code: "<template></template>",
        context: {
          module: "products",
          layout: "grid",
          strategy: "AI_FULL",
        },
        retry: {
          attempt: 2,
          previousErrors: ["Error 1"],
        },
      };

      expect(input.retry).toBeDefined();
      expect(input.retry?.attempt).toBe(2);
      expect(input.retry?.previousErrors).toHaveLength(1);
    });
  });
});
