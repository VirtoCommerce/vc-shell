/**
 * Code Validation Step Executor
 *
 * Validates AI-generated code against:
 * 1. UI-Plan specifications
 * 2. TypeScript type correctness
 * 3. VC-Shell framework requirements
 *
 * If validation fails:
 * - Collects all errors
 * - Sends back to AI for retry (up to 3 attempts)
 * - After 3 failures, marks as failed
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { AIGeneratedCode } from "./ai-codegen";
import { ASTValidator } from "../../intelligence/validators/ast-validator";

export interface ValidationError {
  type: "plan-mismatch" | "type-error" | "framework-violation" | "syntax-error";
  file: string;
  line?: number;
  message: string;
  severity: "error" | "warning";
}

/**
 * CodeValidationStepExecutor
 *
 * Step 7: Validate AI-generated code.
 *
 * Validation steps:
 * 1. Parse generated code
 * 2. Check against UI-Plan
 * 3. Run TypeScript type check
 * 4. Check framework usage
 * 5. If errors → retry with AI (up to 3 times)
 * 6. If success → proceed to Submit
 */
export class CodeValidationStepExecutor implements StepExecutor {
  private maxRetries = 3;

  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      generatedCode: AIGeneratedCode[];
      retryCount?: number;
    },
  ): Promise<StepResult> {
    const { generatedCode, retryCount = 0 } = input;
    const { codeValidator, uiPlanValidator } = context;

    try {
      console.log(`[CodeValidationStep] Validating ${generatedCode.length} generated files`);
      console.log(`[CodeValidationStep] Retry attempt: ${retryCount}/${this.maxRetries}`);

      const allErrors: ValidationError[] = [];
      const validatedCode: AIGeneratedCode[] = [];

      // Validate each generated blade
      for (const code of generatedCode) {
        console.log(`[CodeValidationStep] Validating blade: ${code.bladeId}`);

        // Step 1: Validate against UI-Plan
        const planErrors = await this.validateAgainstPlan(code, state.plan, uiPlanValidator);
        allErrors.push(...planErrors);

        // Step 2: Validate TypeScript
        const typeErrors = await this.validateTypeScript(code, codeValidator);
        allErrors.push(...typeErrors);

        // Step 3: Validate framework usage
        const frameworkErrors = await this.validateFrameworkUsage(code, context);
        allErrors.push(...frameworkErrors);

        // Step 4: Validate syntax
        const syntaxErrors = await this.validateSyntax(code);
        allErrors.push(...syntaxErrors);

        if (planErrors.length === 0 && typeErrors.length === 0 && frameworkErrors.length === 0 && syntaxErrors.length === 0) {
          validatedCode.push(code);
          console.log(`[CodeValidationStep] ✓ ${code.bladeId} validated successfully`);
        } else {
          console.log(`[CodeValidationStep] ✗ ${code.bladeId} has ${allErrors.length} errors`);
        }
      }

      // Check if all code is valid
      const criticalErrors = allErrors.filter((e) => e.severity === "error");

      if (criticalErrors.length === 0) {
        console.log(`[CodeValidationStep] ✅ All code validated successfully`);
        console.log(`[CodeValidationStep] Warnings: ${allErrors.filter((e) => e.severity === "warning").length}`);

        return {
          success: true,
          data: {
            validatedCode,
            warnings: allErrors.filter((e) => e.severity === "warning"),
          },
          nextStep: "submitting" as any,
        };
      }

      // Has critical errors - check if we can retry
      if (retryCount < this.maxRetries) {
        console.log(`[CodeValidationStep] ⚠️  Found ${criticalErrors.length} critical errors`);
        console.log(`[CodeValidationStep] 🔄 Retrying with AI (attempt ${retryCount + 1}/${this.maxRetries})`);

        return {
          success: false,
          data: {
            validationErrors: criticalErrors,
            retryCount: retryCount + 1,
            needsRetry: true,
          },
          nextStep: "ai-codegen" as any, // Go back to AI generation
          errors: criticalErrors.map((e) => `${e.file}: ${e.message}`),
        };
      }

      // Max retries exceeded
      console.log(`[CodeValidationStep] ❌ Max retries (${this.maxRetries}) exceeded`);
      console.log(`[CodeValidationStep] Failed with ${criticalErrors.length} critical errors`);

      return {
        success: false,
        errors: criticalErrors.map((e) => `${e.file}:${e.line || 0} - ${e.message}`),
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Code validation failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute if:
    // 1. We have generated code in state, OR
    // 2. We have aiPrompts (ai-codegen output), OR
    // 3. Current step is in generation phase (we receive code as input)
    // 4. Current step is submitting (for multi-blade generation - next blade)
    // 5. Current step is failed (allow retry after validation failure)
    const currentStep = state.currentStep as string;
    return (
      !!state.generatedCode ||
      !!state.aiPrompts ||
      currentStep === "ai-codegen" ||
      currentStep === "generating" ||
      currentStep === "submitting" ||
      currentStep === "code-validation" ||
      currentStep === "failed"
    );
  }

  getRequiredInput(): string[] {
    return ["generatedCode"];
  }

  /**
   * Validate code against UI-Plan
   */
  private async validateAgainstPlan(
    code: AIGeneratedCode,
    plan: any,
    validator: any,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check if this is an API client-only submission
    const hasBladeContent = code.blade?.content && code.blade.content.trim().length > 0;
    const isApiClientOnly = !hasBladeContent && code.apiClient?.content;

    // API client doesn't need blade-level plan validation
    if (isApiClientOnly) {
      // Just verify the module matches
      if (plan?.module && code.bladeId !== plan.module) {
        // This is okay - bladeId for API client can be the module name
        console.log(`[CodeValidationStep] API client submission for module: ${code.bladeId}`);
      }
      return errors;
    }

    try {
      // Find corresponding blade in plan
      const bladePlan = plan?.blades?.find((b: any) => b.id === code.bladeId);
      if (!bladePlan) {
        errors.push({
          type: "plan-mismatch",
          file: code.blade?.path || code.bladeId,
          message: `Blade ${code.bladeId} not found in UI-Plan`,
          severity: "error",
        });
        return errors;
      }

      // Check if required components are used (only if blade content exists)
      if (hasBladeContent) {
        const requiredComponent = bladePlan.component?.type;
        if (requiredComponent && !code.blade.content.includes(requiredComponent)) {
          errors.push({
            type: "plan-mismatch",
            file: code.blade.path,
            message: `Required component ${requiredComponent} not found in blade`,
            severity: "error",
          });
        }

        // Check if required features are implemented
        for (const feature of bladePlan.features || []) {
          const isFeatureImplemented = this.checkFeatureImplementation(feature, code.blade.content);
          if (!isFeatureImplemented) {
            errors.push({
              type: "plan-mismatch",
              file: code.blade.path,
              message: `Feature "${feature}" does not appear to be implemented`,
              severity: "warning",
            });
          }
        }
      }
    } catch (error: any) {
      errors.push({
        type: "plan-mismatch",
        file: code.blade?.path || code.bladeId,
        message: `Plan validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Validate TypeScript types
   */
  private async validateTypeScript(
    code: AIGeneratedCode,
    validator: any,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check if this is an API client-only submission
    const hasBladeContent = code.blade?.content && code.blade.content.trim().length > 0;

    try {
      // Validate blade (Vue SFC) - only if blade content exists
      if (hasBladeContent) {
        const bladeResult = validator.validateVueSFC(code.blade.content);
        if (!bladeResult.valid) {
          bladeResult.errors?.forEach((err: any) => {
            errors.push({
              type: "type-error",
              file: code.blade.path,
              line: err.line,
              message: err.message,
              severity: "error",
            });
          });
        }
      }

      // Validate composable (TypeScript file)
      if (code.composable) {
        const composableResult = validator.validateTypeScriptCode(code.composable.content);
        if (!composableResult.valid) {
          composableResult.errors?.forEach((err: any) => {
            errors.push({
              type: "type-error",
              file: code.composable!.path,
              line: err.line,
              message: err.message,
              severity: "error",
            });
          });
        }
      }

      // Validate API client (TypeScript file)
      if (code.apiClient) {
        const apiResult = validator.validateTypeScriptCode(code.apiClient.content);
        if (!apiResult.valid) {
          apiResult.errors?.forEach((err: any) => {
            errors.push({
              type: "type-error",
              file: code.apiClient!.path,
              line: err.line,
              message: err.message,
              severity: "error",
            });
          });
        }
      }
    } catch (error: any) {
      errors.push({
        type: "type-error",
        file: code.blade?.path || code.apiClient?.path || "unknown",
        message: `TypeScript validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Whitelist of external components that are NOT VC-Shell but are allowed
   * These come from vee-validate, Vue, VueUse, and other trusted libraries
   */
  private readonly EXTERNAL_COMPONENTS_WHITELIST = new Set([
    // vee-validate components
    "Field",
    "Form",
    "ErrorMessage",
    "FieldArray",
    // Vue built-in components
    "Teleport",
    "Suspense",
    "KeepAlive",
    "Transition",
    "TransitionGroup",
    "component",
    "slot",
    "template",
    // Vue Router components
    "RouterView",
    "RouterLink",
    // Common third-party components
    "Draggable",
    "VueDraggable",
  ]);

  /**
   * Whitelist of external hooks that are NOT VC-Shell but are allowed
   * These come from Vue, VueUse, vee-validate, vue-i18n, and other trusted libraries
   */
  private readonly EXTERNAL_HOOKS_WHITELIST = new Set([
    // Vue core
    "ref",
    "reactive",
    "computed",
    "watch",
    "watchEffect",
    "onMounted",
    "onUnmounted",
    "onBeforeMount",
    "onBeforeUnmount",
    "onUpdated",
    "onBeforeUpdate",
    "provide",
    "inject",
    "toRef",
    "toRefs",
    "unref",
    "shallowRef",
    "triggerRef",
    "customRef",
    "markRaw",
    "toRaw",
    "nextTick",
    "defineProps",
    "defineEmits",
    "defineExpose",
    "defineOptions",
    "withDefaults",
    // vee-validate
    "useForm",
    "useField",
    "useFieldArray",
    "useFieldError",
    "useFieldValue",
    "useFormErrors",
    "useFormValues",
    "useIsFieldDirty",
    "useIsFieldTouched",
    "useIsFieldValid",
    "useIsFormDirty",
    "useIsFormTouched",
    "useIsFormValid",
    "useIsSubmitting",
    "useResetForm",
    "useSubmitCount",
    "useSubmitForm",
    "useValidateField",
    "useValidateForm",
    // vue-i18n
    "useI18n",
    // VueUse
    "useDebounceFn",
    "useThrottleFn",
    "useLocalStorage",
    "useSessionStorage",
    "useMouse",
    "useWindowSize",
    "useElementSize",
    "useIntersectionObserver",
    "useMutationObserver",
    "useResizeObserver",
    "useEventListener",
    "onClickOutside",
    "useFetch",
    "useAsyncState",
    "useClipboard",
    "useFullscreen",
    "usePermission",
    "usePreferredDark",
    "useMediaQuery",
    "useScroll",
    "useInfiniteScroll",
    "useVirtualList",
    // Vue Router
    "useRoute",
    "useRouter",
  ]);

  /**
   * Validate VC-Shell framework usage
   */
  private async validateFrameworkUsage(
    code: AIGeneratedCode,
    context: WorkflowContext,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check if this is an API client-only submission
    const hasBladeContent = code.blade?.content && code.blade.content.trim().length > 0;

    try {
      const { kb } = context;
      const astValidator = new ASTValidator();

      // Only validate blade if it has content
      if (hasBladeContent) {
        // Parse Vue SFC using AST
        const astResult = astValidator.parseVueSFC(code.blade.content);

        // Check that only registered or whitelisted components are used
        const registeredComponents = kb.components.getAll().map((c: any) => c.component);

        astResult.components.forEach((comp) => {
          // Skip if it's a whitelisted external component
          if (this.EXTERNAL_COMPONENTS_WHITELIST.has(comp)) {
            return;
          }
          if (!registeredComponents.includes(comp)) {
            errors.push({
              type: "framework-violation",
              file: code.blade.path,
              message: `Component <${comp}> is not a registered VC-Shell component`,
              severity: "error",
            });
          }
        });

        // Get framework hooks that need validation
        const frameworkHooks = astValidator.getFrameworkHooks(astResult.hooks);
        const registeredHooks = kb.frameworkAPIs.getAll().map((api: any) => api.name);

        frameworkHooks.forEach((hook) => {
          // Skip if it's a whitelisted external hook
          if (this.EXTERNAL_HOOKS_WHITELIST.has(hook)) {
            return;
          }
          if (!registeredHooks.includes(hook)) {
            errors.push({
              type: "framework-violation",
              file: code.blade.path,
              message: `Hook ${hook} is not a registered VC-Shell framework API`,
              severity: "error",
            });
          }
        });
      }

      // Validate composable if present
      if (code.composable) {
        const composableResult = astValidator.parseTypeScript(code.composable.content);
        const composableFrameworkHooks = astValidator.getFrameworkHooks(composableResult.hooks);
        const registeredHooks = kb.frameworkAPIs.getAll().map((api: any) => api.name);

        composableFrameworkHooks.forEach((hook) => {
          // Skip if it's a whitelisted external hook
          if (this.EXTERNAL_HOOKS_WHITELIST.has(hook)) {
            return;
          }
          if (!registeredHooks.includes(hook)) {
            errors.push({
              type: "framework-violation",
              file: code.composable!.path,
              message: `Hook ${hook} is not a registered VC-Shell framework API`,
              severity: "error",
            });
          }
        });
      }

      // Validate API client if present
      if (code.apiClient) {
        const apiClientResult = astValidator.parseTypeScript(code.apiClient.content);
        const apiClientHooks = astValidator.getFrameworkHooks(apiClientResult.hooks);
        const registeredHooks = kb.frameworkAPIs.getAll().map((api: any) => api.name);

        apiClientHooks.forEach((hook) => {
          // Skip if it's a whitelisted external hook
          if (this.EXTERNAL_HOOKS_WHITELIST.has(hook)) {
            return;
          }
          if (!registeredHooks.includes(hook)) {
            errors.push({
              type: "framework-violation",
              file: code.apiClient!.path,
              message: `Hook ${hook} is not a registered VC-Shell framework API`,
              severity: "error",
            });
          }
        });
      }
    } catch (error: any) {
      errors.push({
        type: "framework-violation",
        file: code.blade?.path || code.apiClient?.path || "unknown",
        message: `Framework validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Validate syntax
   */
  private async validateSyntax(code: AIGeneratedCode): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Check if this is a blade (Vue SFC) or API client-only submission
      const hasBladeContent = code.blade?.content && code.blade.content.trim().length > 0;
      const isApiClientOnly = !hasBladeContent && code.apiClient?.content;

      if (isApiClientOnly) {
        // API client validation - TypeScript file
        if (!code.apiClient!.content.includes("export")) {
          errors.push({
            type: "syntax-error",
            file: code.apiClient!.path || "api-client.ts",
            message: "No exports found in API client",
            severity: "error",
          });
        }

        // Check for common syntax errors in API client
        const openBraces = (code.apiClient!.content.match(/{/g) || []).length;
        const closeBraces = (code.apiClient!.content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push({
            type: "syntax-error",
            file: code.apiClient!.path || "api-client.ts",
            message: `Mismatched braces: ${openBraces} open, ${closeBraces} close`,
            severity: "error",
          });
        }
      } else if (hasBladeContent) {
        // Blade validation - Vue SFC
        if (!code.blade.content.includes("<template>") || !code.blade.content.includes("</template>")) {
          errors.push({
            type: "syntax-error",
            file: code.blade.path,
            message: "Missing <template> section in Vue SFC",
            severity: "error",
          });
        }

        if (!code.blade.content.includes("<script")) {
          errors.push({
            type: "syntax-error",
            file: code.blade.path,
            message: "Missing <script> section in Vue SFC",
            severity: "error",
          });
        }

        // Check for common syntax errors
        const openBraces = (code.blade.content.match(/{/g) || []).length;
        const closeBraces = (code.blade.content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push({
            type: "syntax-error",
            file: code.blade.path,
            message: `Mismatched braces: ${openBraces} open, ${closeBraces} close`,
            severity: "error",
          });
        }
      }

      // Check TypeScript files (composables)
      if (code.composable) {
        if (!code.composable.content.includes("export")) {
          errors.push({
            type: "syntax-error",
            file: code.composable.path,
            message: "No exports found in composable",
            severity: "warning",
          });
        }
      }

      // Check for forbidden Font Awesome icons (legacy)
      // Allowed: material-, bi-, lucide-, svg:
      // Forbidden: fas fa-, far fa-, fab fa-, fa-
      const contentToCheck = [
        code.blade?.content,
        code.composable?.content,
      ].filter(Boolean).join("\n");

      const fontAwesomePatterns = [
        /["']fas fa-[a-z]/gi,
        /["']far fa-[a-z]/gi,
        /["']fab fa-[a-z]/gi,
        /icon:\s*["']fa-[a-z]/gi,
      ];

      for (const pattern of fontAwesomePatterns) {
        const matches = contentToCheck.match(pattern);
        if (matches) {
          for (const match of matches) {
            errors.push({
              type: "syntax-error",
              file: code.blade?.path || code.composable?.path || "unknown",
              message: `Font Awesome icons are FORBIDDEN (legacy). Found: ${match}. Use material-, bi-, or lucide- prefix instead.`,
              severity: "error",
            });
          }
        }
      }
    } catch (error: any) {
      errors.push({
        type: "syntax-error",
        file: code.blade?.path || code.apiClient?.path || "unknown",
        message: `Syntax validation failed: ${error.message}`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Check if a feature is implemented in the code
   *
   * Uses real VC-Shell patterns.
   * Each feature has multiple indicators based on actual implementation.
   */
  private checkFeatureImplementation(feature: string, content: string): boolean {
    const lowerContent = content.toLowerCase();

    // Real VC-Shell feature detection patterns from vendor-portal
    const featureDetectors: Record<string, (content: string, lowerContent: string) => boolean> = {
      // ============ LIST FEATURES ============

      // Filters: #filters slot, stagedFilters/appliedFilters, toggleFilter/applyFilters/resetFilters
      filters: (c, lc) =>
        c.includes("#filters") ||                    // Template slot
        lc.includes("stagedfilters") ||              // State: staged filter changes
        lc.includes("appliedfilters") ||             // State: applied filters
        lc.includes("togglefilter") ||               // Method
        lc.includes("applyfilters") ||               // Method
        lc.includes("resetfilters") ||               // Method
        lc.includes("activefiltercount") ||          // Computed/prop
        c.includes(":active-filter-count"),          // Prop on VcTable

      // Multiselect: multiselect prop, @selection-changed, selectedIds array
      multiselect: (c, lc) =>
        c.includes(":multiselect") ||                // Prop
        c.includes("multiselect") ||                 // Prop (boolean shorthand)
        c.includes("@selection-changed") ||          // Event
        c.includes("@select:all") ||                 // Event for select all
        lc.includes("onselectionchanged") ||         // Handler
        lc.includes("selectedofferids") ||           // Real pattern from offers
        lc.includes("selecteditemids") ||            // Generic pattern
        lc.includes("allselected"),                  // State for select all

      // Sortable: sortable column config, @sort-changed event
      sortable: (c, lc) =>
        c.includes("sortable: true") ||              // Column config
        c.includes("@sort-changed") ||               // Event
        lc.includes("sortingkey") ||                 // State
        lc.includes("sortdirection"),                // State

      // Pagination: :pages, :current-page, @pagination-click
      pagination: (c, lc) =>
        c.includes(":pages=") ||                     // Prop
        c.includes(":current-page=") ||              // Prop
        c.includes(":total-count=") ||               // Prop
        c.includes("@pagination-click") ||           // Event
        lc.includes("onpaginationclick") ||          // Handler
        lc.includes("searchquery.skip") ||           // Pagination calculation
        lc.includes("searchquery.take"),             // Page size

      // Search: :search-value, @search:change, keyword in query
      search: (c, lc) =>
        c.includes(":search-value=") ||              // Prop
        c.includes(":search-placeholder=") ||        // Prop
        c.includes("@search:change") ||              // Event
        lc.includes("onsearchlist") ||               // Handler (real pattern)
        lc.includes("searchquery.keyword") ||        // Query property
        lc.includes("resetsearch"),                  // Reset method

      // Expandable rows: expandable prop, #expandedRow slot
      expandable: (c, _lc) =>
        c.includes(":expandable") ||                 // Prop
        c.includes("#expandedRow") ||                // Slot
        c.includes("#expanded-row"),                 // Slot (kebab-case)

      // ============ DETAILS FEATURES ============

      // Validation: Field component from vee-validate, rules prop, useForm
      validation: (c, lc) =>
        c.includes("<Field") ||                      // vee-validate Field component
        c.includes('rules="') ||                     // Rules prop
        c.includes(":rules=") ||                     // Dynamic rules prop
        lc.includes("useform") ||                    // vee-validate useForm
        lc.includes("meta.value.valid") ||           // Form validity check
        lc.includes("meta.value.dirty") ||           // Form dirty check
        lc.includes("setfielderror") ||              // Set field error method
        lc.includes("errormessage"),                 // Error message in template

      // Gallery: VcGallery component with upload/remove/edit events, useAssets
      gallery: (c, lc) =>
        c.includes("<VcGallery") ||                  // Component
        c.includes("@upload=") ||                    // Upload event
        c.includes("@remove=") ||                    // Remove event
        c.includes("@sort=") ||                      // Sort event (reorder)
        lc.includes("useassets") ||                  // Composable
        lc.includes("assetshandler"),                // Handler object pattern

      // Widgets: VcWidget component, registerWidget, useWidgets
      widgets: (c, lc) =>
        c.includes("<VcWidget") ||                   // Component
        lc.includes("registerwidget") ||             // Registration method
        lc.includes("usewidgets") ||                 // Composable
        lc.includes("useexternalwidgets") ||         // External widgets hook
        lc.includes("widgetopened"),                 // Widget state

      // Rich text editor: VcEditor component
      editor: (c, _lc) =>
        c.includes("<VcEditor") ||                   // Component
        c.includes("<vc-editor"),                    // kebab-case

      // File upload: VcFileUpload component
      upload: (c, lc) =>
        c.includes("<VcFileUpload") ||               // Component
        c.includes("<vc-file-upload") ||             // kebab-case
        lc.includes("useassets") ||                  // Assets composable includes upload
        c.includes("@upload="),                      // Upload event

      // ============ GLOBAL FEATURES ============

      // Navigation: useBladeNavigation, openBlade/closeBlade, markRaw
      navigation: (c, lc) =>
        lc.includes("usebladenavigation") ||         // Composable
        lc.includes("openblade") ||                  // Method
        lc.includes("closeblade") ||                 // Method
        lc.includes("resolvebladebyname") ||         // Method
        c.includes("markRaw(") ||                    // Required for blade components
        lc.includes("onparentcall") ||               // Parent-child communication
        lc.includes("onbeforeclose"),                // Close handler

      // Permissions: usePermissions, hasAccess, permissions in defineOptions
      permissions: (c, lc) =>
        lc.includes("usepermissions") ||             // Composable
        lc.includes("hasaccess") ||                  // Method
        c.includes("permissions:") ||                // defineOptions
        c.includes("UserPermissions."),              // Permission enum

      // Notifications: useNotifications, notifyType in defineOptions
      notifications: (c, lc) =>
        lc.includes("usenotifications") ||           // Composable
        lc.includes("setnotificationhandler") ||     // Handler setup
        lc.includes("markasread") ||                 // Mark as read method
        c.includes("notifyType:") ||                 // defineOptions
        c.includes("notification.success"),          // Success notification

      // ============ BLADE CONFIGURATION ============

      // Workspace blade: isWorkspace in defineOptions, menuItem config
      workspace: (c, _lc) =>
        c.includes("isWorkspace: true") ||           // defineOptions
        c.includes("menuItem:"),                     // Menu configuration

      // Toolbar: bladeToolbar ref with IBladeToolbar items
      toolbar: (c, lc) =>
        c.includes(":toolbar-items=") ||             // Prop on VcBlade
        lc.includes("bladetoolbar") ||               // Ref name
        c.includes("IBladeToolbar"),                 // Type import

      // Empty state: empty/notfound objects with icon, text, action
      "empty-state": (c, lc) =>
        lc.includes("const empty =") ||              // Empty state object
        lc.includes("const notfound =") ||           // Not found state
        c.includes(":empty=") ||                     // Prop
        c.includes(":notfound="),                    // Prop

      // ============ DATA OPERATIONS ============

      // Async operations: useAsync pattern
      async: (_c, lc) =>
        lc.includes("useasync") ||                   // Composable
        lc.includes("useloading"),                   // Loading state composable

      // Localization: $t() or t() function calls
      localization: (c, _lc) =>
        c.includes("$t(") ||                         // Global $t
        c.includes("t(") ||                          // Imported t
        c.includes("useI18n"),                       // i18n composable
    };

    // Check using detector function if available
    const detector = featureDetectors[feature];
    if (detector) {
      return detector(content, lowerContent);
    }

    // Fallback: simple keyword match for unknown features
    return lowerContent.includes(feature.replace(/-/g, "")) || lowerContent.includes(feature);
  }
}
