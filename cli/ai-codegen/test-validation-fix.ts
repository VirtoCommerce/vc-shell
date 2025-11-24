/**
 * Test validation fix for hooks and template tags
 */

import { CodeValidationStepExecutor } from "./src/workflows/steps/code-validation";
import type { WorkflowState, WorkflowContext } from "./src/workflows/types";
import { KnowledgeBase } from "./src/knowledge";

// Test code with:
// 1. useI18n from vue-i18n (should NOT be flagged)
// 2. useOffersList from local composable (should NOT be flagged)
// 3. useFunctions from @vc-shell/framework (should be validated)
// 4. Nested template tags in slots (should NOT cause "unbalanced" error)
const testBladeCode = `<template>
  <VcBlade>
    <VcTable>
      <template #filters>
        <div>Filters</div>
      </template>
      <template #item_name="{ item }">
        <span>{{ item.name }}</span>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  useBladeNavigation,
  useFunctions,
  usePopup,
} from "@vc-shell/framework";
import { useOffersList } from "../composables/useOffersList";

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();
const { debounce } = useFunctions();
const { showConfirmation } = usePopup();
const { items, loading } = useOffersList();
</script>
`;

async function testValidation() {
  console.log("Testing validation fixes...\n");

  // Create test context
  const kb = new KnowledgeBase({
    componentsPath: "./knowledge/components",
    frameworkAPIsPath: "./knowledge/framework-apis",
    patternsPath: "./knowledge/patterns",
    templatesPath: "./knowledge/templates",
    capabilityExamplesPath: "./knowledge/capability-examples",
    rulesPath: "./knowledge/rules",
  });

  await kb.initialize();

  const context: WorkflowContext = {
    kb,
    codeValidator: null as any,
    uiPlanValidator: null as any,
    cwd: process.cwd(),
  };

  const state: WorkflowState = {
    prompt: "test",
    currentStep: "code-validation" as any,
    plan: {
      module: "offers",
      blades: [
        {
          id: "offers-list",
          type: "list",
          component: { type: "VcTable" },
          features: ["filters", "search"],
        },
      ],
    },
  };

  const validator = new CodeValidationStepExecutor();

  const generatedCode = [
    {
      bladeId: "offers-list",
      blade: {
        path: "offers-list.vue",
        content: testBladeCode,
      },
    },
  ];

  const result = await validator.execute(state, context, { generatedCode });

  console.log("Validation Result:", JSON.stringify(result, null, 2));

  if (result.success) {
    console.log("\n✅ Validation PASSED");
    console.log("Warnings:", result.data?.warnings?.length || 0);
  } else {
    console.log("\n❌ Validation FAILED");
    console.log("Errors:", result.errors);
  }

  // Check specific issues
  const errors = result.errors || [];
  const hasTemplateError = errors.some((e) => e.includes("Unbalanced <template> tags"));
  const hasUseI18nError = errors.some((e) => e.includes("useI18n"));
  const hasUseOffersListError = errors.some((e) => e.includes("useOffersList"));
  const hasUseScope = errors.some((e) => e.includes("useScope"));

  console.log("\n--- Specific Issue Checks ---");
  console.log(
    hasTemplateError
      ? "❌ Still has template balance error (BUG NOT FIXED)"
      : "✅ No template balance error",
  );
  console.log(
    hasUseI18nError ? "❌ Still flagging useI18n (BUG NOT FIXED)" : "✅ useI18n not flagged",
  );
  console.log(
    hasUseOffersListError
      ? "❌ Still flagging useOffersList (BUG NOT FIXED)"
      : "✅ useOffersList not flagged",
  );
  console.log(hasUseScope ? "❌ Still flagging useScope (BUG NOT FIXED)" : "✅ useScope not flagged");
}

testValidation().catch(console.error);
