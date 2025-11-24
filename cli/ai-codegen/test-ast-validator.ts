/**
 * Test AST-based validator
 */

import { ASTValidator } from "./src/intelligence/validators/ast-validator";

const testCode = `<template>
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

console.log("Testing AST-based validator...\n");

const validator = new ASTValidator();
const result = validator.parseVueSFC(testCode);

console.log("=== Extracted Components ===");
console.log(result.components);
console.log("");

console.log("=== Extracted Hooks ===");
result.hooks.forEach((hook) => {
  console.log(`- ${hook.name}`);
  console.log(`  source: ${hook.source || "(framework)"}`);
  console.log(`  isLocal: ${hook.isLocal}`);
  console.log(`  isExternal: ${hook.isExternal}`);
});
console.log("");

console.log("=== Framework Hooks (to validate) ===");
const frameworkHooks = validator.getFrameworkHooks(result.hooks);
console.log(frameworkHooks);
console.log("");

console.log("=== Validation Results ===");
const expectedComponents = ["VcBlade", "VcTable"];
const expectedFrameworkHooks = ["useBladeNavigation", "useFunctions", "usePopup"];
const shouldNotInclude = ["useI18n", "useOffersList"];

const componentsOk =
  expectedComponents.every((c) => result.components.includes(c)) &&
  result.components.length === expectedComponents.length;

const frameworkHooksOk =
  expectedFrameworkHooks.every((h) => frameworkHooks.includes(h)) &&
  !shouldNotInclude.some((h) => frameworkHooks.includes(h));

console.log(`Components extraction: ${componentsOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`  Expected: ${expectedComponents.join(", ")}`);
console.log(`  Got: ${result.components.join(", ")}`);
console.log("");

console.log(`Framework hooks extraction: ${frameworkHooksOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`  Expected: ${expectedFrameworkHooks.join(", ")}`);
console.log(`  Should NOT include: ${shouldNotInclude.join(", ")}`);
console.log(`  Got: ${frameworkHooks.join(", ")}`);
console.log("");

if (componentsOk && frameworkHooksOk) {
  console.log("✅ ALL TESTS PASSED!");
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
