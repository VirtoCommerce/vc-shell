/**
 * Simple test for hook extraction fix
 */

// Simulate the extractImportedHooks method
function extractImportedHooks(bladeContent: string, composableContent?: string): Set<string> {
  const importedHooks = new Set<string>();

  // Patterns for imports from external libraries or local files
  const importPatterns = [
    // Named imports: import { useI18n } from "vue-i18n"
    /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g,
    // Default imports: import useRouter from "vue-router"
    /import\s+(\w+)\s+from\s+["']([^"']+)["']/g,
  ];

  [bladeContent, composableContent].forEach((content) => {
    if (!content) return;

    importPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importSource = match[2];

        // Check if import is from external library or local file
        // Exclude only imports from @vc-shell/framework
        if (!importSource.includes("@vc-shell/framework")) {
          // Extract hook names from named imports
          if (match[1] && match[1].includes(",") || (match[1] && !match[1].match(/^\w+$/))) {
            // Named imports
            const hooks = match[1].split(",").map((h) => h.trim());
            hooks.forEach((h) => {
              // Extract hook name (remove 'as' aliases)
              const hookName = h.split(/\s+as\s+/)[0].trim();
              if (hookName.startsWith("use")) {
                importedHooks.add(hookName);
              }
            });
          } else if (match[1]) {
            // Could be single named import or default import
            const hookName = match[1].trim();
            if (hookName.startsWith("use")) {
              importedHooks.add(hookName);
            }
          }
        }
      }
    });
  });

  return importedHooks;
}

function extractUsedHooks(bladeContent: string, composableContent?: string): string[] {
  const hooks = new Set<string>();

  // Extract all hook usages from code
  const hookRegex = /use[A-Z][a-zA-Z]*/g;

  [bladeContent, composableContent].forEach((content) => {
    if (content) {
      let match;
      while ((match = hookRegex.exec(content)) !== null) {
        hooks.add(match[0]);
      }
    }
  });

  // Extract imported hooks to distinguish between framework hooks and external/local hooks
  const importedHooks = extractImportedHooks(bladeContent, composableContent);

  // Filter out:
  // 1. Vue built-ins
  // 2. Hooks imported from external libraries (vue-i18n, @vueuse/core, etc.)
  // 3. Local composables (imported from relative paths like '../composables')
  const vueBuiltins = ["useSlots", "useAttrs", "useCssModule", "useCssVars"];

  return Array.from(hooks).filter((h) => {
    // Always exclude Vue built-ins
    if (vueBuiltins.includes(h)) return false;

    // If hook is imported from external library or local file, exclude it
    if (importedHooks.has(h)) return false;

    // Only validate hooks that are NOT imported (should be from @vc-shell/framework)
    return true;
  });
}

const testCode = `
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
`;

console.log("Testing hook extraction...\n");

console.log("Test Code:");
console.log(testCode);
console.log("\n--- Results ---\n");

const importedHooks = extractImportedHooks(testCode);
console.log("Imported hooks (should be excluded from validation):");
console.log(Array.from(importedHooks));
console.log("");

const hooksToValidate = extractUsedHooks(testCode);
console.log("Hooks to validate (should only be framework hooks):");
console.log(hooksToValidate);
console.log("");

console.log("--- Expected vs Actual ---");
console.log("Expected imported: useI18n, useOffersList");
console.log("Actual imported:", Array.from(importedHooks).join(", "));
console.log("");
console.log("Expected to validate: useBladeNavigation, useFunctions, usePopup");
console.log("Actual to validate:", hooksToValidate.join(", "));
console.log("");

const success =
  importedHooks.has("useI18n") &&
  importedHooks.has("useOffersList") &&
  hooksToValidate.includes("useBladeNavigation") &&
  hooksToValidate.includes("useFunctions") &&
  hooksToValidate.includes("usePopup") &&
  !hooksToValidate.includes("useI18n") &&
  !hooksToValidate.includes("useOffersList");

if (success) {
  console.log("✅ Test PASSED - Hook extraction working correctly!");
} else {
  console.log("❌ Test FAILED - Hook extraction not working as expected");
}
