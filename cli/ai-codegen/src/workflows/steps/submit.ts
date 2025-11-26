/**
 * Submit Step Executor
 *
 * Validates and saves generated code.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import {
  updateComposablesIndex,
  updatePagesIndex,
  bladeIdToComponentName,
} from "../../utils/module-structure";

/**
 * Deep merge two objects recursively
 * New values override existing, nested objects are merged
 */
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(target[key], source[key]);
    } else {
      // Override with new value
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Extract all $t() and t() locale keys from Vue SFC code
 *
 * Extracts keys from BOTH sections:
 * 1. <template> - uses $t('KEY')
 * 2. <script> - uses t('KEY') from useI18n()
 */
function extractLocaleKeysFromCode(code: string): string[] {
  const keys: string[] = [];

  const patterns = [
    // $t('KEY') from template section
    /\$t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    // t('KEY') from script section (with negative lookbehind to not match $t)
    /(?<!\$)\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      keys.push(match[1]);
    }
  }

  return [...new Set(keys)]; // Unique keys
}

/**
 * Check if a nested key exists in locale JSON
 * e.g., "MODULE.PAGES.LIST.TITLE" checks localeJson.MODULE.PAGES.LIST.TITLE
 */
function keyExistsInLocale(key: string, localeJson: Record<string, any>): boolean {
  const parts = key.split(".");
  let current: any = localeJson;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Validate that all $t() and t() keys in code exist in locale JSON
 * Returns array of missing keys
 */
function validateLocaleKeys(code: string, localeJson: Record<string, any>): string[] {
  const usedKeys = extractLocaleKeysFromCode(code);
  const missingKeys: string[] = [];

  for (const key of usedKeys) {
    if (!keyExistsInLocale(key, localeJson)) {
      missingKeys.push(key);
    }
  }

  return missingKeys;
}

/**
 * SubmitStepExecutor
 *
 * Step 6: Submit and validate generated code.
 */
export class SubmitStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      bladeId: string;
      code: string;
      cwd?: string;
      composable?: { name: string; code: string };
      // API client can be either single file (legacy) or 3 files (new mock pattern)
      apiClient?:
        | { name: string; code: string } // Legacy: single file
        | { // New: 3 files for mock API client
            types?: { name: string; code: string };
            mock?: { name: string; code: string };
            client?: { name: string; code: string };
          };
      locale?: { code: string }; // Locale JSON content to merge into en.json
      artifactType?: "blade" | "composable" | "apiClient"; // Track what type of artifact this is
    },
  ): Promise<StepResult> {
    const { bladeId, code, cwd, composable, apiClient, locale, artifactType } = input;

    try {
      // Determine artifact type from explicit param or by inspecting what's provided
      const isApiClientOnly = artifactType === "apiClient" || (!code && apiClient && !composable);
      const isComposableOnly = artifactType === "composable" || (!code && composable && !apiClient);

      const submissionType = isApiClientOnly ? "API client" : isComposableOnly ? "composable" : "blade";
      console.log(`[SubmitStep] Validating ${submissionType}: ${bladeId}`);

      // Basic validation
      const errors: string[] = [];

      if (isApiClientOnly) {
        // API client validation - supports both legacy (single file) and new (3 files) format
        const isLegacyFormat = apiClient && "code" in apiClient && "name" in apiClient;
        const isNewFormat = apiClient && ("types" in apiClient || "mock" in apiClient || "client" in apiClient);

        if (isLegacyFormat) {
          // Legacy: single file with name and code
          const legacyClient = apiClient as { name: string; code: string };
          if (!legacyClient.code || legacyClient.code.trim().length === 0) {
            errors.push("API client code is empty");
          }
          if (legacyClient.code && !legacyClient.code.includes("export")) {
            errors.push("API client must export functions or classes");
          }
        } else if (isNewFormat) {
          // New: 3 files (types, mock, client)
          const newClient = apiClient as {
            types?: { name: string; code: string };
            mock?: { name: string; code: string };
            client?: { name: string; code: string };
          };

          // At least client file is required
          if (!newClient.client?.code || newClient.client.code.trim().length === 0) {
            errors.push("API client file (client) is required and must not be empty");
          }
          // Validate client has exports
          if (newClient.client?.code && !newClient.client.code.includes("export")) {
            errors.push("API client must export the Client class");
          }
        } else {
          errors.push("Invalid API client format: expected either { name, code } or { types, mock, client }");
        }
      } else if (isComposableOnly) {
        // Composable-only validation
        if (!composable?.code || composable.code.trim().length === 0) {
          errors.push("Composable code is empty");
        }
        // Check for valid TypeScript composable structure
        if (composable?.code && !composable.code.includes("export")) {
          errors.push("Composable must export a function");
        }
        // Check for use* naming convention
        if (composable?.name && !composable.name.startsWith("use")) {
          errors.push("Composable file name should start with 'use' (e.g., useOfferList.ts)");
        }
      } else {
        // Blade validation (Vue SFC)
        // Check code is not empty
        if (!code || code.trim().length === 0) {
          errors.push("Code is empty");
        }

        // Check code contains Vue SFC structure
        if (code && !code.includes("<template>") && !code.includes("<script")) {
          errors.push("Invalid Vue SFC structure");
        }

        // Check code uses Composition API
        if (code && !code.includes("setup") && !code.includes("<script setup")) {
          errors.push("Must use Vue 3 Composition API");
        }
      }

      if (errors.length > 0) {
        console.error(`[SubmitStep] ✗ Validation failed: ${errors.length} errors`);
        return {
          success: false,
          errors,
        };
      }

      // Warnings to return to AI (non-blocking)
      const warnings: string[] = [];

      // Save code if cwd provided
      if (cwd) {
        console.log(`[SubmitStep] Saving code to: ${cwd}`);

        const fs = await import("node:fs");
        const path = await import("node:path");

        const plan = state.plan;
        if (!plan) {
          return {
            success: false,
            errors: ["No plan found in state"],
          };
        }

        // Save blade file (only if not API client-only and not composable-only submission)
        if (!isApiClientOnly && !isComposableOnly && code) {
          const bladePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "pages",
            `${bladeId}.vue`,
          );

          const dir = path.dirname(bladePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(bladePath, code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved blade: ${bladePath}`);

          // Update pages/index.ts with new export
          const componentName = bladeIdToComponentName(bladeId);
          await updatePagesIndex(cwd, plan.module, bladeId, componentName);
        }

        // Save composable if provided
        if (composable) {
          const composablePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "composables",
            composable.name,
          );

          const composableDir = path.dirname(composablePath);
          if (!fs.existsSync(composableDir)) {
            fs.mkdirSync(composableDir, { recursive: true });
          }

          fs.writeFileSync(composablePath, composable.code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved composable: ${composablePath}`);

          // Update composables/index.ts with new export
          await updateComposablesIndex(cwd, plan.module, composable.name);
        }

        // Save API client if provided
        // API client goes to src/api_client/ (NOT src/modules/{module}/api/)
        // This follows vendor-portal pattern where all API clients are in a shared location
        if (apiClient) {
          const apiClientDir = path.join(cwd, "src", "api_client");
          if (!fs.existsSync(apiClientDir)) {
            fs.mkdirSync(apiClientDir, { recursive: true });
          }

          // Check if legacy or new format
          const isLegacyFormat = "code" in apiClient && "name" in apiClient;

          if (isLegacyFormat) {
            // Legacy: single file
            const legacyClient = apiClient as { name: string; code: string };
            const clientPath = path.join(apiClientDir, legacyClient.name);
            fs.writeFileSync(clientPath, legacyClient.code, "utf-8");
            console.log(`[SubmitStep] ✓ Saved API client: ${clientPath}`);
          } else {
            // New: 3 files for mock API client
            const newClient = apiClient as {
              types?: { name: string; code: string };
              mock?: { name: string; code: string };
              client?: { name: string; code: string };
            };

            // Save types file (if provided)
            if (newClient.types?.code) {
              const typesPath = path.join(apiClientDir, newClient.types.name);
              fs.writeFileSync(typesPath, newClient.types.code, "utf-8");
              console.log(`[SubmitStep] ✓ Saved API types: ${typesPath}`);
            }

            // Save mock data file (if provided)
            if (newClient.mock?.code) {
              const mockPath = path.join(apiClientDir, newClient.mock.name);
              fs.writeFileSync(mockPath, newClient.mock.code, "utf-8");
              console.log(`[SubmitStep] ✓ Saved API mock data: ${mockPath}`);
            }

            // Save client file (required)
            if (newClient.client?.code) {
              const clientPath = path.join(apiClientDir, newClient.client.name);
              fs.writeFileSync(clientPath, newClient.client.code, "utf-8");
              console.log(`[SubmitStep] ✓ Saved API client: ${clientPath}`);
            }
          }
        }

        // Save/merge locale if provided
        // Locales are merged into existing en.json to preserve previously generated keys
        let mergedLocale: Record<string, any> = {};
        if (locale?.code) {
          const localePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "locales",
            "en.json",
          );

          const localeDir = path.dirname(localePath);
          if (!fs.existsSync(localeDir)) {
            fs.mkdirSync(localeDir, { recursive: true });
          }

          try {
            // Parse new locale content
            const newLocale = JSON.parse(locale.code);

            // Load existing locale if it exists
            let existingLocale = {};
            if (fs.existsSync(localePath)) {
              const existingContent = fs.readFileSync(localePath, "utf-8");
              existingLocale = JSON.parse(existingContent);
            }

            // Deep merge locales (new values override existing)
            mergedLocale = deepMerge(existingLocale, newLocale);

            // Write merged locale with pretty formatting
            fs.writeFileSync(localePath, JSON.stringify(mergedLocale, null, 2), "utf-8");
            console.log(`[SubmitStep] ✓ Merged locale: ${localePath}`);
          } catch (parseError: any) {
            console.warn(`[SubmitStep] ⚠ Failed to parse/merge locale: ${parseError.message}`);
            // Don't fail the submission for locale errors - just warn
          }
        }

        // Validate locale keys in blade code (only for blade submissions)
        if (!isApiClientOnly && !isComposableOnly && code && Object.keys(mergedLocale).length > 0) {
          const missingKeys = validateLocaleKeys(code, mergedLocale);
          if (missingKeys.length > 0) {
            const warning = `⚠️ Missing locale keys detected:\n${missingKeys.map((k) => `  - ${k}`).join("\n")}\nPlease add these keys to the locale parameter in submit_generated_code.`;
            warnings.push(warning);
            console.warn(`[SubmitStep] ${warning}`);
          }
        }
      }

      console.log(`[SubmitStep] ✓ Code validated and saved successfully`);

      // Check if there are more blades to generate
      // Do NOT transition to "completed" - let the handler manage workflow state
      // The handler tracks completedBlades and determines when all are done
      return {
        success: true,
        data: {
          savedBladeId: bladeId,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        // Do NOT set nextStep here - the workflow handler manages state transitions
        // nextStep: "completed" would break multi-blade generation
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Submit failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute from various states during the generation workflow
    // The workflow is: validating → generating → ai-codegen → code-validation → submitting
    // Also allow retry from "failed" state after validation/submission failure
    const currentStep = state.currentStep as string;
    return (
      currentStep === "generating" ||
      currentStep === "ai-codegen" ||
      currentStep === "code-validation" ||
      currentStep === "submitting" ||
      currentStep === "failed"
    );
  }

  getRequiredInput(): string[] {
    // bladeId is always required (for API client, it's the module name)
    // code is only required for blade submissions (not for API client-only)
    // The validation logic handles the different artifact types
    return ["bladeId"];
  }
}
