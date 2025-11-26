/**
 * Generate Step Executor
 *
 * PAGINATED WORKFLOW:
 * 1. Build generation queue: blade1 → composable1 → blade2 → composable2 → apiClient
 * 2. Return ONE artifact guide at a time with tiered context
 * 3. AI generates code, submits, requests next artifact
 * 4. Continue until queue is empty
 *
 * CONTEXT LEVELS:
 * - METADATA: IDs, descriptions only (~2KB) - for overview
 * - ESSENTIAL: + template + top 2 patterns (~10KB) - for generation
 * - FULL: Everything (~25KB+) - only if explicitly requested
 */

import pluralize from "pluralize";
import type {
  WorkflowState,
  WorkflowContext,
  StepExecutor,
  StepResult,
  ArtifactType,
  ContextLevel,
  GenerationGuide,
  PaginationResponse,
} from "../types";
import { ArtifactType as AT, ContextLevel as CL } from "../types";
import type { UIPlan } from "../../generators/types";
import { scaffoldModule, moduleExists } from "../../utils/module-structure";

/**
 * Input parameters for generate step
 */
interface GenerateInput {
  plan: UIPlan;
  cwd: string;
  // Pagination params
  bladeId?: string;
  artifactType?: ArtifactType;
  contextLevel?: ContextLevel;
  // Legacy mode
  page?: number;
  pageSize?: number;
}

/**
 * GenerateStepExecutor
 *
 * Step 5: Prepare generation guides for AI with pagination.
 * Returns ONE artifact at a time to keep context under 25KB.
 */
export class GenerateStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: GenerateInput,
  ): Promise<StepResult> {
    const { plan, cwd } = input;
    const { kb, componentResolver, rulesLoader } = context;

    try {
      // Initialize or get pagination state
      const pagination = this.initializePagination(state, plan, input);

      // Check if this is a single-artifact request
      const isSingleArtifactRequest = !!(input.bladeId && input.artifactType && input.artifactType !== AT.ALL);

      // Get current artifact to generate
      const currentItem = pagination.queue[0];
      if (!currentItem) {
        // Queue is empty - check WHY it's empty

        // Check if API client is required but not generated
        if (pagination.requiredArtifacts?.apiClient?.status === "required") {
          console.log(`[GenerateStep] ❌ API client required but not generated - blocking blade generation`);
          return {
            success: false,
            data: {
              apiClientRequired: true,
              module: plan.module,
              requestedArtifact: input.artifactType,
              requestedBladeId: input.bladeId,
            },
            errors: [
              `API client must be generated FIRST before generating blades.`,
              `Use generate_api_client tool to generate the API client for module "${plan.module}".`,
              `After submitting the API client, you can generate blades with generate_with_composition.`,
            ],
          };
        }

        // For single-artifact requests: blade not found in plan
        if (isSingleArtifactRequest) {
          return {
            success: false,
            errors: [`Blade not found in plan: ${input.bladeId}`],
          };
        }
        // Empty queue with full generation request - all blades must have been already submitted
        // Return info about what's been done, but let the handler track actual completion
        return {
          success: true,
          data: {
            queueEmpty: true,
            message: "Generation queue is empty. All blades have generation guides or have been submitted.",
            hint: "Check completedBlades in workflow state to verify actual completion status.",
          },
        };
      }

      console.log(`[GenerateStep] Generating: ${currentItem.artifactType} for ${currentItem.bladeId}`);

      // Handle API client generation separately - it's not tied to a specific blade
      if (currentItem.artifactType === AT.API_CLIENT) {
        const guide = await this.buildApiClientGuide(
          currentItem,
          plan,
          cwd,
          pagination.contextLevel,
          kb,
          state.analysis,
        );

        const response = this.buildPaginationResponse(guide, pagination, plan);

        return {
          success: true,
          data: {
            ...response,
            pagination: state.pagination,
          },
          nextStep: "ai-codegen" as any,
        };
      }

      // Find blade in plan for blade/composable generation
      const blade = plan.blades.find((b) => b.id === currentItem.bladeId);
      if (!blade) {
        return {
          success: false,
          errors: [`Blade not found: ${currentItem.bladeId}`],
        };
      }

      // Scaffold module structure for NEW modules BEFORE generating first composable
      // This creates: index.ts, pages/, composables/, locales/, components/widgets/
      // And registers the module in main.ts (BEFORE router!)
      if (currentItem.artifactType === AT.COMPOSABLE && !moduleExists(cwd, plan.module)) {
        console.log(`[GenerateStep] New module detected. Scaffolding: ${plan.module}`);
        // Use module name capitalized as display name
        const displayName = plan.module.charAt(0).toUpperCase() + plan.module.slice(1);
        const scaffoldResult = await scaffoldModule(cwd, plan.module, { displayName });
        if (scaffoldResult.created) {
          console.log(`[GenerateStep] ✓ Module scaffolded: ${plan.module} (registered: ${scaffoldResult.registered})`);
        }
      }

      // Build generation guide with tiered context
      const guide = await this.buildGenerationGuide(
        currentItem,
        blade,
        plan,
        cwd,
        pagination.contextLevel,
        kb,
        componentResolver,
        rulesLoader,
      );

      // Build pagination response
      const response = this.buildPaginationResponse(guide, pagination, plan);

      // Update state with pagination and requiredArtifacts
      return {
        success: true,
        data: {
          ...response,
          pagination: state.pagination,
          // Save requiredArtifacts to state if this is first generation
          ...(pagination.requiredArtifacts && { requiredArtifacts: pagination.requiredArtifacts }),
        },
        nextStep: "ai-codegen" as any,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Generation failed: ${error.message}`],
      };
    }
  }

  /**
   * Initialize pagination state from input or state
   */
  private initializePagination(
    state: WorkflowState,
    plan: UIPlan,
    input: GenerateInput,
  ): {
    queue: Array<{ bladeId: string; artifactType: ArtifactType }>;
    contextLevel: ContextLevel;
    completedArtifacts: Map<string, boolean>;
    requiredArtifacts?: {
      blades: Array<{ id: string; status: string }>;
      apiClient: { status: string; required: boolean } | null;
      widgets: string[];
    };
  } {
    // Check if API client is required FIRST
    const hasDataOperations = plan.blades.some((b: any) =>
      b.features?.some((f: string) => ["crud", "table", "form", "save", "delete", "pagination", "search", "filters"].includes(f))
    );
    const requiresApiClient = hasDataOperations;
    const apiClientDone = state.completedArtifacts?.apiClient || false;

    // If specific artifact requested, check if API client needs to be generated first
    if (input.bladeId && input.artifactType && input.artifactType !== AT.ALL) {
      // ENFORCE: API client MUST be generated before any blade or composable
      // Return empty queue - execute() will handle this as apiClientRequired error
      if (requiresApiClient && !apiClientDone && input.artifactType !== AT.API_CLIENT) {
        console.log(`[GenerateStep] ⚠️ API client not yet generated - returning empty queue`);
        return {
          queue: [], // Empty queue signals API client is required
          contextLevel: input.contextLevel || CL.MINIMAL,
          completedArtifacts: new Map(),
          requiredArtifacts: {
            blades: plan.blades.map((b: any) => ({ id: b.id, status: "pending" })),
            apiClient: { status: "required", required: true },
            widgets: [],
          },
        };
      }

      // API client done or not required - proceed with requested artifact
      return {
        queue: [{ bladeId: input.bladeId, artifactType: input.artifactType }],
        contextLevel: input.contextLevel || CL.MINIMAL,
        completedArtifacts: new Map(),
      };
    }

    // Build full queue if not exists
    if (!state.pagination?.queue?.length) {
      const queue: Array<{ bladeId: string; artifactType: ArtifactType }> = [];

      // API client MUST be generated FIRST so composables can import it
      if (requiresApiClient) {
        // API CLIENT FIRST - composables depend on it!
        queue.push({ bladeId: plan.module || plan.blades[0]?.id || "module", artifactType: AT.API_CLIENT });
        console.log(`[GenerateStep] API client added FIRST to queue for module: ${plan.module}`);
      }

      // Then add composables FIRST, then blades
      // Order: API client → Composables → Blades
      // This ensures:
      // 1. Composables can use exact method names from API client
      // 2. Blades can use the ready composable interface
      for (const blade of plan.blades) {
        queue.push({ bladeId: blade.id, artifactType: AT.COMPOSABLE });
      }
      for (const blade of plan.blades) {
        queue.push({ bladeId: blade.id, artifactType: AT.BLADE });
      }

      // Store required artifacts info for tracking completion
      // This will be saved to state via result.data
      const requiredArtifacts = {
        blades: plan.blades.map((b: any) => ({ id: b.id, status: "pending" })),
        apiClient: requiresApiClient ? { status: "pending", required: true } : null,
        widgets: [],
      };

      return {
        queue,
        contextLevel: input.contextLevel || CL.MINIMAL,
        completedArtifacts: new Map(),
        requiredArtifacts, // Will be saved to state
      };
    }

    // Filter out completed items
    const completedBlades = new Set(state.completedArtifacts?.blades || []);
    const completedComposables = new Set(state.completedArtifacts?.composables || []);

    const queue = state.pagination.queue.filter((item) => {
      if (item.artifactType === AT.BLADE) {
        return !completedBlades.has(item.bladeId);
      }
      if (item.artifactType === AT.COMPOSABLE) {
        return !completedComposables.has(item.bladeId);
      }
      if (item.artifactType === AT.API_CLIENT) {
        return !apiClientDone;
      }
      return true;
    });

    return {
      queue,
      contextLevel: state.pagination.contextLevel || CL.MINIMAL,
      completedArtifacts: new Map(),
    };
  }

  /**
   * Build generation guide for a single artifact
   */
  private async buildGenerationGuide(
    item: { bladeId: string; artifactType: ArtifactType },
    blade: any,
    plan: UIPlan,
    cwd: string,
    contextLevel: ContextLevel,
    kb: any,
    componentResolver: any,
    rulesLoader?: any,
  ): Promise<GenerationGuide> {
    const entityName = this.extractEntityName(blade.id, blade.type);

    // Discover components and hooks (lightweight)
    const components = await this.discoverComponents(blade, componentResolver);
    const hooks = await this.discoverFrameworkHooks(blade, kb);

    // Load template
    const template = kb.templates.findBestMatch(blade.type, blade.features || []);
    if (template && (contextLevel === CL.ESSENTIAL || contextLevel === CL.FULL)) {
      template.content = await kb.templates.getContent(template.id);
    }

    // Load patterns based on context level
    const patterns = kb.patterns.getForBladeType(blade.type);
    const relevantPatterns = blade.features?.length
      ? patterns.filter((p: any) => blade.features!.some((f: string) => p.features.includes(f)))
      : patterns.slice(0, 3);

    // Load pattern content for ESSENTIAL and FULL levels
    if (contextLevel === CL.ESSENTIAL || contextLevel === CL.FULL) {
      const topPatterns = relevantPatterns.slice(0, contextLevel === CL.ESSENTIAL ? 2 : relevantPatterns.length);
      for (const pattern of topPatterns) {
        pattern.content = await kb.patterns.getContent(pattern.id);
      }
    }

    // Load applicable rules for this blade type and features
    let rules: any[] = [];
    if (rulesLoader && (contextLevel === CL.ESSENTIAL || contextLevel === CL.FULL)) {
      rules = await rulesLoader.getApplicableRules({
        bladeType: blade.type,
        isWorkspace: blade.isWorkspace,
        features: blade.features || [],
      });
      console.log(`[GenerateStep] Loaded ${rules.length} applicable rules for ${blade.id}`);
    }

    // Determine target path based on artifact type
    const targetPath = this.getTargetPath(item.artifactType, plan.module, blade.id, entityName, blade.type, cwd);

    // Build context based on level
    const context = this.buildContext(
      contextLevel,
      components,
      hooks,
      template,
      relevantPatterns,
      item.artifactType,
      rules,
    );

    // Build instructions specific to artifact type
    const instructions = this.buildInstructions(item.artifactType, blade, entityName, plan.module);

    return {
      artifactType: item.artifactType,
      bladeId: blade.id,
      module: plan.module,
      entity: entityName,
      bladeType: blade.type,
      features: blade.features || [],
      isWorkspace: blade.isWorkspace,
      targetPath,
      context,
      instructions,
      expectedOutput: this.getExpectedOutput(item.artifactType),
    };
  }

  /**
   * Build tiered context based on level
   *
   * MINIMAL (~5KB): Only refs with names and short descriptions. Use MCP tools for details.
   * METADATA (~2KB): IDs, descriptions only (deprecated - use MINIMAL)
   * ESSENTIAL (~10-14KB): + template + top 2 patterns
   * FULL (~25KB+): Everything
   */
  private buildContext(
    level: ContextLevel,
    components: any[],
    hooks: any[],
    template: any,
    patterns: any[],
    artifactType: ArtifactType,
    rules: any[] = [],
  ): GenerationGuide["context"] {
    // MINIMAL level: lightweight refs only, no content
    // AI should use view_components, view_framework_apis, get_best_template for details
    if (level === CL.MINIMAL) {
      return {
        level,
        componentRefs: components.slice(0, 5).map((c) => ({
          name: c.item?.component || c.name,
          description: (c.item?.description || c.description || "").slice(0, 80),
          relevance: c.confidence || 0.5,
        })),
        hookRefs: hooks.slice(0, 4).map((h) => ({
          name: h.name,
          import: h.import || "@vc-shell/framework",
          description: (h.description || "").slice(0, 60),
        })),
        templateRef: template
          ? {
              id: template.id,
              complexity: template.complexity,
              description: (template.description || "").slice(0, 100),
            }
          : null,
        patternRefs: patterns.slice(0, 3).map((p) => ({
          id: p.id,
          description: (p.description || "").slice(0, 80),
        })),
      };
    }

    // Level 1: METADATA - IDs and descriptions only
    const context: GenerationGuide["context"] = {
      level,
      componentRefs: components.map((c) => ({
        name: c.item?.component || c.name,
        description: c.item?.description || c.description || "",
        relevance: c.confidence || 0.5,
      })),
      hookRefs: hooks.map((h) => ({
        name: h.name,
        import: h.import || "@vc-shell/framework",
        description: h.description || "",
      })),
      templateRef: template
        ? {
            id: template.id,
            complexity: template.complexity,
            description: template.description,
          }
        : null,
      patternRefs: patterns.map((p) => ({
        id: p.id,
        description: p.description,
      })),
    };

    // Level 2: ESSENTIAL - include template, top patterns, and rules for blade/composable
    if (level === CL.ESSENTIAL || level === CL.FULL) {
      if (template?.content) {
        context.template = template.content;
      }

      // Include top 2 patterns for ESSENTIAL
      const topPatterns = patterns
        .filter((p: any) => p.content)
        .slice(0, level === CL.ESSENTIAL ? 2 : patterns.length);

      if (topPatterns.length > 0) {
        context.topPatterns = topPatterns.map((p: any) => p.content);
      }

      // Include applicable rules (formatted as strings)
      if (rules.length > 0) {
        context.rules = rules
          .filter((r: any) => r.applies !== false) // Only include applicable rules
          .slice(0, level === CL.ESSENTIAL ? 5 : rules.length) // Limit for ESSENTIAL
          .map((r: any) => this.formatRule(r));
      }
    }

    // Level 3: FULL - include everything
    if (level === CL.FULL) {
      context.allPatterns = patterns.filter((p: any) => p.content).map((p: any) => p.content);
    }

    return context;
  }

  /**
   * Format a rule for inclusion in context
   */
  private formatRule(rule: any): string {
    const parts: string[] = [];

    // Header with priority indicator
    const priorityEmoji = rule.category === "critical" ? "🔴" : rule.category === "constraint" ? "🟡" : "🟢";
    parts.push(`${priorityEmoji} **${rule.name || rule.id}** (${rule.category})`);

    // Description
    if (rule.description) {
      parts.push(rule.description.trim());
    }

    // Correct pattern
    if (rule.correct_pattern?.inline) {
      parts.push("\n✅ CORRECT:");
      parts.push(rule.correct_pattern.inline.trim());
    }

    // Wrong pattern
    if (rule.wrong_pattern?.inline) {
      parts.push("\n❌ WRONG:");
      parts.push(rule.wrong_pattern.inline.trim());
    }

    return parts.join("\n");
  }

  /**
   * Build instructions specific to artifact type
   */
  private buildInstructions(
    artifactType: ArtifactType,
    blade: any,
    entityName: string,
    moduleName: string,
  ): string {
    const lines: string[] = [];

    lines.push(`# Generate ${artifactType.toUpperCase()}: ${blade.id}`);
    lines.push("");

    switch (artifactType) {
      case AT.BLADE:
        lines.push("## Task: Generate Vue SFC Blade");
        lines.push(`- Module: ${moduleName}`);
        lines.push(`- Entity: ${entityName}`);
        lines.push(`- Type: ${blade.type} blade`);
        lines.push(`- Features: ${(blade.features || []).join(", ") || "none"}`);
        lines.push("");
        lines.push("## ⚠️ FILE EXISTS - YOU ARE REPLACING IT!");
        lines.push(`A stub blade was created by create-vc-app at:`);
        lines.push(`src/modules/${moduleName}/pages/${blade.id}.vue`);
        lines.push("");
        lines.push("The stub is basic scaffolding - REPLACE EVERYTHING with full implementation!");
        lines.push("Your generated code will OVERWRITE the stub completely.");
        lines.push("");
        lines.push("## IMPORTANT: Composable is ALREADY generated!");
        lines.push(`The composable for this blade was generated in the previous step.`);
        lines.push(`Read it FIRST to understand what methods and types are available:`);
        lines.push(`Location: src/modules/${moduleName}/composables/use${this.capitalize(entityName)}${blade.type === "list" ? "List" : "Details"}.ts`);
        lines.push("");
        lines.push("## 🔴 REF VALUE ACCESS IN SCRIPT (CRITICAL!)");
        lines.push("Composable returns Ref<IEntity>. In <script> ALWAYS use .value:");
        lines.push("```typescript");
        lines.push("// ✅ CORRECT:");
        lines.push("const title = computed(() => item.value?.name || 'New');");
        lines.push("item.value.status = 'active';");
        lines.push("if (item.value?.id) { /* ... */ }");
        lines.push("");
        lines.push("// ❌ WRONG - TypeScript error TS2339:");
        lines.push("const title = computed(() => item?.name || 'New');");
        lines.push("item.status = 'active';  // Property 'status' does not exist on type 'Ref<IEntity>'");
        lines.push("```");
        lines.push("Vue unwraps .value ONLY in <template>, NOT in <script>!");
        lines.push("");
        lines.push("## Requirements:");
        lines.push("1. Use `<script setup lang=\"ts\">`");
        lines.push("2. Import the ALREADY GENERATED composable from ./composables/");
        lines.push("3. Use VcBlade as root component");
        lines.push("4. All strings via $t() - no hardcoded text");
        lines.push("5. Use emit(\"close:blade\") for closing");
        lines.push("6. Use EXACT method names from the composable (read it first!)");
        lines.push("7. VcSelect #option slot scope is { opt, index, selected, toggleOption } - NEVER { option }");
        lines.push("8. DO NOT add permissions to defineOptions unless user EXPLICITLY requested them!");
        lines.push("");
        lines.push("## Import Paths (api_client):");
        lines.push(`- Pages: ../../../api_client/${moduleName}.client (and .api for types)`);
        lines.push(`- Composables: ../../../api_client/${moduleName}.client + ../../../api_client/${moduleName}.api`);
        lines.push(`- Widgets: ../../../../api_client/${moduleName}.client`);
        lines.push("");
        lines.push("## ICONS (Material Symbols - NOT Material Icons!):");
        lines.push("Format: material-{icon_name} with UNDERSCORES, NO -outline suffix!");
        lines.push("Examples: material-add_circle, material-delete, material-edit, material-save");
        lines.push("WRONG: material-add-circle-outline, material-addCircle");
        lines.push("Browse: https://fonts.google.com/icons?icon.set=Material+Symbols");
        lines.push("");
        if (blade.type === "list") {
          lines.push("## List-specific:");
          lines.push("9. Use VcTable with proper column slots");
          lines.push("10. Implement pagination, sorting, filters as needed");
          lines.push("11. Table column widths must be strings with units (e.g., \"100px\"), never bare numbers");
        } else {
          lines.push("## Details-specific:");
          lines.push("9. Use VcForm with VeeValidate Field components");
          lines.push("10. Implement validation rules");
          lines.push("11. Composable already has useModificationTracker - use isModified from it");
          lines.push("");
          lines.push("## WIDGETS (CRITICAL - DO NOT RENDER MANUALLY!):");
          lines.push("NEVER render widgets manually with <VcWidget> or v-for in template!");
          lines.push("Widgets are managed by the framework via useWidgets() composable.");
          lines.push("");
          lines.push("If blade needs widgets:");
          lines.push("1. Use generate_widget MCP tool to create widget component");
          lines.push("2. Or manually use useWidgets() pattern:");
          lines.push("```typescript");
          lines.push("const { registerWidget, unregisterWidget } = useWidgets();");
          lines.push("const blade = useBlade();");
          lines.push("");
          lines.push("// Register immediately after setup (NOT in onMounted!)");
          lines.push("registerWidget({");
          lines.push("  id: 'MyWidget',");
          lines.push("  component: MyWidgetComponent,");
          lines.push("  props: computed(() => ({ data: item.value })),");
          lines.push("  isVisible: computed(() => !!props.param),");
          lines.push("}, blade?.value.id ?? '');");
          lines.push("");
          lines.push("onBeforeUnmount(() => unregisterWidget('MyWidget', blade?.value.id));");
          lines.push("```");
          lines.push("The framework renders widgets automatically - NO template code needed!");
        }
        lines.push("");
        lines.push("## LOCALE GENERATION (CRITICAL!):");
        lines.push("You MUST generate locale translations for ALL $t() keys used in the blade.");
        lines.push("When calling submit_generated_code, include the 'locale' parameter with:");
        lines.push("```json");
        lines.push(`{`);
        lines.push(`  "${moduleName.toUpperCase()}": {`);
        lines.push(`    "PAGES": {`);
        lines.push(`      "${blade.type.toUpperCase()}": {`);
        lines.push(`        "TITLE": "...",`);
        lines.push(`        "SUBTITLE": "...",`);
        lines.push(`        "SECTIONS": { /* all section titles */ },`);
        lines.push(`        "FIELDS": { /* all field labels and placeholders */ },`);
        lines.push(`        "ACTIONS": { /* all button/action labels */ }`);
        lines.push(`      }`);
        lines.push(`    }`);
        lines.push(`  }`);
        lines.push(`}`);
        lines.push("```");
        lines.push("Include EVERY key used with $t() in the blade - missing keys cause runtime errors!");
        break;

      case AT.COMPOSABLE:
        const EntityName = this.capitalize(entityName);
        lines.push("## Task: Generate TypeScript Composable");
        lines.push(`- Module: ${moduleName}`);
        lines.push(`- Entity: ${entityName}`);
        lines.push(`- For: ${blade.type} blade`);
        lines.push("");
        lines.push("## ⚠️ FILE EXISTS - YOU ARE REPLACING IT!");
        lines.push(`A stub composable was created by create-vc-app at:`);
        lines.push(`src/modules/${moduleName}/composables/use${this.capitalize(entityName)}${blade.type === "list" ? "List" : "Details"}.ts`);
        lines.push("");
        lines.push("The stub contains @ts-expect-error and mock methods - REPLACE EVERYTHING!");
        lines.push("Your generated code will OVERWRITE the stub completely.");
        lines.push("");
        lines.push("## WORKFLOW: This composable will be used by the blade generated NEXT");
        lines.push("The blade will import this composable, so define a clear interface.");
        lines.push("");
        lines.push("## CRITICAL: Read API Client FIRST!");
        lines.push(`API client location: src/api_client/${moduleName}.client.ts (client) and src/api_client/${moduleName}.api.ts (types/commands)`);
        lines.push("You MUST read the API client to get:");
        lines.push("1. Exact method names (searchOffers, getOfferById, createOffer, etc.)");
        lines.push("2. Exact type names (IOffer, OfferDetails, SearchOffersQuery, etc.)");
        lines.push("3. Exact class names for commands (CreateOfferCommand, UpdateOfferCommand, etc.)");
        lines.push("");
        lines.push("COMMON MISTAKES TO AVOID:");
        lines.push("- API has `getOfferById()` but you call `getOfferByIdGET()` - WRONG!");
        lines.push("- API has `createOffer()` but you call `createNewOffer()` - WRONG!");
        lines.push("- NEVER use @ts-nocheck or @ts-expect-error to hide mismatches!");
        lines.push("");
        lines.push("## 🔴 TYPE SAFETY CHECKLIST (vue-tsc MUST pass with 0 errors!)");
        lines.push("");
        lines.push("### 1. Return Interface Types - Use ACTUAL Vue types, NOT ReturnType<>:");
        lines.push("```typescript");
        lines.push("// ❌ WRONG - verbose and confusing:");
        lines.push("export interface IUseEntityDetails {");
        lines.push("  item: ReturnType<typeof ref<IEntity>>;");
        lines.push("  loading: ReturnType<typeof ref<boolean>>;");
        lines.push("}");
        lines.push("");
        lines.push("// ✅ CORRECT - use Vue types directly:");
        lines.push("import { Ref, ComputedRef } from 'vue';");
        lines.push("export interface IUseEntityDetails {");
        lines.push("  item: Ref<IEntity>;");
        lines.push("  loading: ComputedRef<boolean>;");
        lines.push("  isModified: Readonly<Ref<boolean>>;  // For tracked refs");
        lines.push("}");
        lines.push("```");
        lines.push("");
        lines.push("### 2. useModificationTracker - EXACT destructuring (isModified NOT modified!):");
        lines.push("```typescript");
        lines.push("// ❌ WRONG - 'modified' does not exist on return type!");
        lines.push("const { modified: isModified, currentValue } = useModificationTracker(item);");
        lines.push("// TypeScript error: Property 'modified' does not exist");
        lines.push("");
        lines.push("// ✅ CORRECT - use exact property name 'isModified':");
        lines.push("const { isModified, currentValue, resetModificationState } = useModificationTracker(item);");
        lines.push("```");
        lines.push("");
        lines.push("### 3. useAsync - MUST use generic type, NOT inline type annotation:");
        lines.push("```typescript");
        lines.push("// ❌ WRONG - inline type annotation - TypeScript thinks param is ALWAYS defined:");
        lines.push("const { action: loadItem } = useAsync(async (params: { id: string }) => {");
        lines.push("  const data = await client.getById(params.id);  // Crashes! params can be undefined!");
        lines.push("});");
        lines.push("");
        lines.push("// ✅ CORRECT - generic type + guard clause:");
        lines.push("const { action: loadItem } = useAsync<{ id: string }>(async (params) => {");
        lines.push("  if (!params?.id) return;  // REQUIRED guard! params is typed as { id: string } | undefined");
        lines.push("  const data = await client.getById(params.id);");
        lines.push("});");
        lines.push("```");
        lines.push("");
        lines.push("### 4. Return currentValue NOT original ref:");
        lines.push("```typescript");
        lines.push("// ❌ WRONG - returns untracked ref:");
        lines.push("return { item, isModified };");
        lines.push("");
        lines.push("// ✅ CORRECT - return tracked currentValue:");
        lines.push("return { item: currentValue, isModified, resetModificationState };");
        lines.push("```");
        lines.push("");
        lines.push("## Requirements:");
        lines.push("1. Export composable function with TYPED INTERFACE (IUse" + EntityName + (blade.type === "list" ? "s" : "Details") + ")");
        lines.push(`2. Import EXACT types from: ../../../api_client/${moduleName}.api (correct relative path!)`);
        lines.push(`3. Import the client class from: ../../../api_client/${moduleName}.client`);
        lines.push(`4. Use: const { getApiClient } = useApiClient(${this.capitalize(moduleName)}Client)`);
        lines.push("5. Wrap async operations with useAsync and guard optional params (e.g., if (!params?.id) return) to satisfy callback types");
        lines.push("6. Reactive state with ref/computed");
        lines.push("7. Export all methods that blade will need (load, save, delete, etc.)");
        if (blade.type === "list") {
          lines.push("");
          lines.push("## List Composable Pattern:");
          lines.push("```typescript");
          lines.push(`import { Ref, ComputedRef } from 'vue';`);
          lines.push(`import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";`);
          lines.push(`import { ${this.capitalize(moduleName)}Client } from "../../../api_client/${moduleName}.client";`);
          lines.push(`import type { I${EntityName}, ISearch${EntityName}sQuery } from "../../../api_client/${moduleName}.api";`);
          lines.push("");
          lines.push(`export interface IUse${EntityName}s {`);
          lines.push(`  items: Ref<I${EntityName}[]>;`);
          lines.push(`  loading: ComputedRef<boolean>;`);
          lines.push(`  totalCount: Ref<number>;`);
          lines.push(`  loadItems: (query?: ISearch${EntityName}sQuery) => Promise<void>;`);
          lines.push(`}`);
          lines.push("");
          lines.push(`const { getApiClient } = useApiClient(${this.capitalize(moduleName)}Client);`);
          lines.push("");
          lines.push("const { action: loadItems, loading } = useAsync(async (query?: ISearch${EntityName}sQuery) => {");
          lines.push("  const client = await getApiClient();");
          lines.push(`  const result = await client.search${EntityName}s(query || {});`);
          lines.push("  items.value = result.results;");
          lines.push("  totalCount.value = result.totalCount;");
          lines.push("});");
          lines.push("```");
          lines.push("Return: items, loading, pagination, handlers");
        } else {
          lines.push("");
          lines.push("## Details Composable Pattern:");
          lines.push("```typescript");
          lines.push(`import { Ref, ComputedRef, ref, reactive } from 'vue';`);
          lines.push(`import { useApiClient, useAsync, useLoading, useModificationTracker } from "@vc-shell/framework";`);
          lines.push(`import { ${this.capitalize(moduleName)}Client } from "../../../api_client/${moduleName}.client";`);
          lines.push(`import { ${EntityName}, type I${EntityName} } from "../../../api_client/${moduleName}.api";`);
          lines.push("");
          lines.push(`export interface IUse${EntityName}Details {`);
          lines.push(`  item: Ref<I${EntityName}>;`);
          lines.push(`  loading: ComputedRef<boolean>;`);
          lines.push(`  isModified: Readonly<Ref<boolean>>;`);
          lines.push(`  load${EntityName}: (id: string) => Promise<void>;`);
          lines.push(`  save${EntityName}: (data?: I${EntityName}) => Promise<I${EntityName} | undefined>;`);
          lines.push(`  resetModificationState: () => void;`);
          lines.push(`}`);
          lines.push("");
          lines.push(`const { getApiClient } = useApiClient(${this.capitalize(moduleName)}Client);`);
          lines.push(`const item = ref<I${EntityName}>(reactive(new ${EntityName}()));`);
          lines.push("");
          lines.push("// EXACT destructuring - isModified NOT modified!");
          lines.push("const { isModified, currentValue, resetModificationState } = useModificationTracker(item);");
          lines.push("");
          lines.push("// Guard optional params in useAsync callbacks!");
          lines.push("const { action: loadItem, loading: loadingItem } = useAsync(async (id?: string) => {");
          lines.push("  if (!id) return;  // REQUIRED guard!");
          lines.push("  const client = await getApiClient();");
          lines.push(`  currentValue.value = reactive(await client.get${EntityName}ById(id));`);
          lines.push("  resetModificationState();");
          lines.push("});");
          lines.push("");
          lines.push("// Return currentValue NOT item!");
          lines.push("return {");
          lines.push("  item: currentValue,");
          lines.push("  loading: useLoading(loadingItem, savingItem),");
          lines.push("  isModified,");
          lines.push("  resetModificationState,");
          lines.push("};");
          lines.push("```");
        }
        break;

      case AT.API_CLIENT:
        lines.push("## Task: Generate API Client");
        lines.push(`- Module: ${moduleName}`);
        lines.push("");
        lines.push("## Requirements:");
        lines.push("1. Export typed API client");
        lines.push("2. Use useApiClient from @vc-shell/framework");
        lines.push("3. Implement CRUD methods with proper types");
        lines.push("4. Handle pagination for list endpoints");
        lines.push("5. Proper error types");
        lines.push("6. Client class MUST extend AuthApiBase from @vc-shell/framework (constructor(_baseUrl?, _http?: { fetch: typeof fetch }))");
        break;
    }

    lines.push("");
    lines.push("## Context Available:");
    lines.push("- Template and patterns are included in context");
    lines.push("- For additional component details, use view_components tool");
    lines.push("- For additional hook details, use view_framework_apis tool");
    lines.push("");
    lines.push("## Submit:");
    lines.push("After generating code, use submit_generated_code tool with:");
    lines.push(`- bladeId: "${blade.id}"`);
    lines.push(`- code: <your generated code>`);
    lines.push("- context: { module, layout }");
    if (artifactType === AT.BLADE) {
      lines.push("- locale: { code: '<JSON with all $t() keys>' } - REQUIRED for blades!");
    }

    return lines.join("\n");
  }

  /**
   * Build pagination response with smart nextSteps
   */
  private buildPaginationResponse(
    guide: GenerationGuide,
    pagination: {
      queue: Array<{ bladeId: string; artifactType: ArtifactType }>;
      contextLevel: ContextLevel;
    },
    plan: UIPlan,
  ): PaginationResponse {
    const current = pagination.queue[0];
    const remaining = pagination.queue.slice(1);
    const totalBlades = plan.blades.length;
    const totalComposables = plan.blades.length;
    const totalArtifacts = pagination.queue.length;

    // Build nextSteps for AI guidance
    const nextSteps: PaginationResponse["nextSteps"] = [];

    // First: generate current artifact
    nextSteps.push({
      tool: "submit_generated_code",
      params: {
        bladeId: current.bladeId,
        code: "<generated code>",
        ...(current.artifactType === AT.COMPOSABLE && {
          composable: { name: `use${this.capitalize(guide.entity)}${guide.bladeType === "list" ? "s" : "Details"}.ts`, code: "<generated code>" },
        }),
        context: {
          module: guide.module,
          layout: guide.bladeType === "list" ? "grid" : "details",
        },
      },
      description: `Submit ${current.artifactType} code for ${current.bladeId}`,
    });

    // Then: next artifact
    if (remaining.length > 0) {
      const next = remaining[0];
      nextSteps.push({
        tool: "generate_with_composition",
        params: {
          bladeId: next.bladeId,
          artifactType: next.artifactType,
        },
        description: `Generate ${next.artifactType} for ${next.bladeId}`,
      });
    }

    return {
      guide,
      pagination: {
        current: {
          bladeId: current.bladeId,
          artifactType: current.artifactType,
          index: totalArtifacts - remaining.length - 1,
        },
        total: {
          blades: totalBlades,
          composables: totalComposables,
          apiClient: pagination.queue.some((q) => q.artifactType === AT.API_CLIENT),
          totalArtifacts,
        },
        completed: totalArtifacts - remaining.length - 1,
        remaining: remaining.length + 1,
      },
      nextSteps,
      // NEVER return allComplete from buildPaginationResponse
      // This is a GENERATION step - it generates guides, not completes the workflow
      // allComplete should only be true when ALL code has been SUBMITTED and validated
      allComplete: false,
    };
  }

  /**
   * Get target path based on artifact type
   */
  private getTargetPath(
    artifactType: ArtifactType,
    module: string,
    bladeId: string,
    entityName: string,
    bladeType: "list" | "details",
    cwd: string,
  ): string {
    switch (artifactType) {
      case AT.BLADE:
        return `${cwd}/src/modules/${module}/pages/${bladeId}.vue`;
      case AT.COMPOSABLE:
        const composableName = bladeType === "list"
          ? `use${this.capitalize(entityName)}s.ts`
          : `use${this.capitalize(entityName)}Details.ts`;
        return `${cwd}/src/modules/${module}/composables/${composableName}`;
      case AT.API_CLIENT:
        return `${cwd}/src/modules/${module}/api/${module}.client.ts`;
      default:
        return `${cwd}/src/modules/${module}/pages/${bladeId}.vue`;
    }
  }

  /**
   * Get expected output format for artifact type
   */
  private getExpectedOutput(artifactType: ArtifactType): GenerationGuide["expectedOutput"] {
    switch (artifactType) {
      case AT.BLADE:
        return { format: "vue-sfc" };
      case AT.COMPOSABLE:
        return { format: "typescript", exports: ["use*"] };
      case AT.API_CLIENT:
        return { format: "typescript", exports: ["*Client", "*Api"] };
      default:
        return { format: "vue-sfc" };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute from:
    // - validating: first generation after plan validation
    // - generating: re-generation or next blade
    // - ai-codegen: after submitting one blade, generate next
    // - code-validation: after validation, generate fix
    // - submitting: after submit, generate next blade
    // - failed: allow retry after validation/generation failure
    const currentStep = state.currentStep as string;
    return (
      currentStep === "validating" ||
      currentStep === "generating" ||
      currentStep === "ai-codegen" ||
      currentStep === "code-validation" ||
      currentStep === "submitting" ||
      currentStep === "failed"
    );
  }

  getRequiredInput(): string[] {
    return ["plan", "cwd"];
  }

  /**
   * Discover relevant components using semantic search
   */
  private async discoverComponents(blade: any, componentResolver: any): Promise<any[]> {
    const components: any[] = [];

    const intent = blade.type === "list"
      ? `data table for listing ${blade.id} with ${(blade.features || []).join(", ")}`
      : `form for editing ${blade.id} with ${(blade.features || []).join(", ")}`;

    const mainResults = await componentResolver.resolveMany(
      {
        intent,
        context: blade.type === "list" ? "list" : "details",
        features: blade.features || [],
      },
      { limit: 5 },
    );

    components.push(...mainResults);

    const featureIntents: Record<string, string> = {
      filters: "filter controls dropdown select",
      multiselect: "selection checkbox bulk actions",
      gallery: "image gallery carousel",
      validation: "form validation input error",
      widgets: "widget container dashboard",
      status: "status badge icon indicator",
    };

    for (const feature of blade.features || []) {
      const featureIntent = featureIntents[feature];
      if (featureIntent) {
        const featureResults = await componentResolver.resolveMany(
          {
            intent: featureIntent,
            context: blade.type === "list" ? "list" : "details",
            features: [feature],
          },
          { limit: 3 },
        );

        for (const result of featureResults) {
          if (!components.find((c) => c.item?.component === result.item?.component)) {
            components.push(result);
          }
        }
      }
    }

    return components.slice(0, 10);
  }

  /**
   * Discover relevant framework hooks
   */
  private async discoverFrameworkHooks(blade: any, kb: any): Promise<any[]> {
    const hooks: any[] = [];

    hooks.push(kb.frameworkAPIs.findByName("useBladeNavigation"));
    hooks.push(kb.frameworkAPIs.findByName("useApiClient"));

    if (blade.type === "list") {
      hooks.push(kb.frameworkAPIs.findByName("useNotifications"));
    } else {
      hooks.push(kb.frameworkAPIs.findByName("useModificationTracker"));
      hooks.push(kb.frameworkAPIs.findByName("useNotifications"));
    }

    return hooks.filter(Boolean);
  }

  /**
   * Extract entity name from blade ID
   */
  private extractEntityName(bladeId: string, bladeType: "list" | "details"): string {
    const entityWithSuffix = bladeId.replace(new RegExp(`-(${bladeType})$`), "");

    if (bladeType === "list") {
      return pluralize.singular(entityWithSuffix);
    }

    return entityWithSuffix;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Build generation guide for API client
   *
   * API client is created in src/api_client/ directory following NSwag-like structure.
   * This is a stub that can be replaced with real generated client from Swagger.
   */
  private async buildApiClientGuide(
    item: { bladeId: string; artifactType: ArtifactType },
    plan: UIPlan,
    cwd: string,
    contextLevel: ContextLevel,
    kb: any,
    analysis: any,
  ): Promise<GenerationGuide> {
    const moduleName = plan.module;
    const entities = analysis?.entities || [];

    // Extract entity names and their operations
    const entityInfo = entities.map((e: any) => ({
      name: e.name,
      displayName: e.displayName || e.name,
      properties: e.properties || [],
      operations: this.inferOperations(e, plan),
    }));

    // Build instructions for API client
    const instructions = this.buildApiClientInstructions(moduleName, entityInfo);

    // Target path - API client goes to src/api_client/ (NOT src/modules/{module}/api/)
    // This follows the vendor-portal pattern where all API clients are in a shared location
    const clientFileName = `${moduleName}.api.ts`;
    const targetPath = `${cwd}/src/api_client/${clientFileName}`;

    return {
      artifactType: AT.API_CLIENT,
      bladeId: moduleName,
      module: moduleName,
      entity: entityInfo.map((e: any) => e.name).join(", "),
      bladeType: "list" as const, // Not really applicable for API client
      features: ["api", "crud"],
      isWorkspace: false,
      targetPath,
      context: {
        level: contextLevel,
        componentRefs: [],
        hookRefs: [{
          name: "useApiClient",
          import: "@vc-shell/framework",
          description: "Create typed API client instance",
        }],
        templateRef: null,
        patternRefs: [],
        // Include entity info for AI
        entities: entityInfo,
      },
      instructions,
      expectedOutput: {
        format: "typescript",
        exports: [`${this.capitalize(moduleName)}Client`, `I${this.capitalize(entityInfo[0]?.name || moduleName)}`, `Search${this.capitalize(entityInfo[0]?.name || moduleName)}sQuery`],
      },
    };
  }

  /**
   * Infer CRUD operations from entity blades
   */
  private inferOperations(entity: any, plan: UIPlan): string[] {
    const operations: string[] = [];
    const blades = entity.blades || [];

    for (const blade of blades) {
      const features = blade.features || [];

      if (blade.type === "list") {
        operations.push("search", "list");
        if (features.includes("crud") || features.includes("delete")) {
          operations.push("delete");
        }
      }

      if (blade.type === "details") {
        operations.push("get");
        if (features.includes("crud") || features.includes("save") || features.includes("form")) {
          operations.push("create", "update");
        }
        if (features.includes("delete")) {
          operations.push("delete");
        }
      }
    }

    // Deduplicate
    return [...new Set(operations)];
  }

  /**
   * Build COMPACT instructions for MOCK API client generation (~3KB max)
   *
   * Creates minimal instructions - AI should use get_best_template tool
   * for full code templates if needed.
   */
  private buildApiClientInstructions(moduleName: string, entities: any[]): string {
    const ModuleName = this.capitalize(moduleName);
    const EntityName = entities[0] ? this.capitalize(entities[0].name) : ModuleName;
    const props = entities[0]?.properties?.slice(0, 5).map((p: any) => p.name).join(", ") || "name, description, isActive";

    return `# MOCK API Client: ${moduleName}

## File Structure
\`\`\`
src/api_client/
├── ${moduleName}.api.ts     # Types (keep when replacing)
├── ${moduleName}.mock.ts    # Static mock data
└── ${moduleName}.client.ts  # Mock client class
\`\`\`

## Entity: ${EntityName}
- Operations: ${entities[0]?.operations?.join(", ") || "search, get, create, update, delete"}
- Key properties: ${props}

## Required Types (${moduleName}.api.ts)
- I${EntityName} - main entity interface
- I${EntityName}SearchQuery - search params
- I${EntityName}SearchResult - { results, totalCount }
- ICreate${EntityName}Command, IUpdate${EntityName}Command

## Client Methods Signatures (${moduleName}.client.ts)
\`\`\`typescript
// ⚠️ EXACT method signatures - composables depend on these!
async search${EntityName}s(query?: I${EntityName}SearchQuery): Promise<I${EntityName}SearchResult> { ... }
async get${EntityName}ById(id: string): Promise<I${EntityName}> { ... }
async create${EntityName}(command: ICreate${EntityName}Command): Promise<I${EntityName}> { ... }
async update${EntityName}(command: IUpdate${EntityName}Command): Promise<I${EntityName}> { ... }
async delete${EntityName}(id: string): Promise<void> { ... }
async delete${EntityName}s(ids: string[]): Promise<void> { ... }
\`\`\`

## CRITICAL: AuthApiBase inheritance
- Import { AuthApiBase } from "@vc-shell/framework"
- export class ${ModuleName}Client extends AuthApiBase {
    constructor(_baseUrl?: string, _http?: { fetch: typeof fetch }) {
      super();
    }
  }
- Required for useApiClient() compatibility

## ⚠️ MOCK ONLY - NO HTTP!
- Use in-memory array, NOT fetch/axios
- Add 300ms delay for realism
- Keep constructor signature: constructor(_baseUrl?, _http?: { fetch: typeof fetch })

## Submit
\`\`\`
bladeId: "${moduleName}"
code: ""
apiClient: {
  types: { name: "${moduleName}.api.ts", code: <code> },
  mock: { name: "${moduleName}.mock.ts", code: <code> },
  client: { name: "${moduleName}.client.ts", code: <code> }
}
context: { module: "${moduleName}", layout: "details" }
\`\`\`

For full template: use get_best_template({ bladeType: "details", features: ["api"] })`;
  }
}
