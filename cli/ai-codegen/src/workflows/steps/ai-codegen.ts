/**
 * AI Code Generation Step Executor
 *
 * Takes enriched generation guides and sends them to AI for code generation.
 * AI generates final code based on:
 * - Base files from create-vc-app
 * - Discovered components/hooks from registry
 * - Templates, patterns, rules
 * - Detailed instructions
 *
 * This is where the actual AI code generation happens!
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * AI-generated code result
 */
export interface AIGeneratedCode {
  bladeId: string;
  blade: {
    path: string;
    content: string; // Full Vue SFC content
  };
  composable?: {
    path: string;
    content: string; // Full TypeScript content
  };
  apiClient?: {
    path: string;
    content: string; // Full API client content
  };
  locale?: {
    path: string;
    content: string; // JSON locale updates
  };
}

/**
 * AICodeGenStepExecutor
 *
 * Step 6: Send guides to AI and receive generated code.
 *
 * IMPORTANT: This step returns generation guides in the response.
 * The MCP tool handler will:
 * 1. Take these guides
 * 2. Send them to Claude/GPT via API
 * 3. Parse AI response to extract code
 * 4. Return generated code for validation
 */
export class AICodeGenStepExecutor implements StepExecutor {
  async execute(state: WorkflowState, context: WorkflowContext, input: { guides: any[] }): Promise<StepResult> {
    const { guides } = input;

    try {
      console.log(`[AICodeGenStep] Processing ${guides.length} generation guides`);

      // In MCP context, we return the guides to be sent to AI
      // The MCP tool handler will actually call the AI API
      // and return the results back through the workflow

      const aiPrompts = guides.map((guide) => this.buildAIPrompt(guide));

      console.log(`[AICodeGenStep] ✅ Built ${aiPrompts.length} AI prompts`);
      console.log(`[AICodeGenStep] 📤 Ready for AI generation`);
      console.log(`[AICodeGenStep] → MCP tool will send these to Claude/GPT`);

      return {
        success: true,
        data: {
          generationGuides: guides,
          aiPrompts,
          // This signals to MCP tool that AI generation is needed
          requiresAI: true,
        },
        nextStep: "code-validation" as any,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`AI code generation preparation failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    return !!state.generationGuides && Array.isArray(state.generationGuides) && state.generationGuides.length > 0;
  }

  getRequiredInput(): string[] {
    return ["guides"];
  }

  /**
   * Build complete AI prompt from generation guide
   */
  private buildAIPrompt(guide: any): {
    bladeId: string;
    systemPrompt: string;
    userPrompt: string;
    context: any;
  } {
    // System prompt - sets AI behavior
    const systemPrompt = this.buildSystemPrompt();

    // User prompt - specific task with full context
    const userPrompt = this.buildUserPrompt(guide);

    return {
      bladeId: guide.bladeId,
      systemPrompt,
      userPrompt,
      context: {
        module: guide.module,
        entity: guide.entity,
        bladeType: guide.bladeType,
        features: guide.features,
        baseFiles: guide.baseFiles,
      },
    };
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(): string {
    return `You are an expert VC-Shell developer.

Your task is to generate production-ready Vue 3 TypeScript code for VC-Shell applications.

═══════════════════════════════════════════════════════════════════════
🎯 GOAL: Complete ALL requirements fully; partial execution is a FAILURE
═══════════════════════════════════════════════════════════════════════

🚨 MANDATORY WORKFLOW PIPELINE 🚨

You are at STEP 6 of a 10-step workflow. Previous steps completed by MCP tools:

✓ STEP 1: ANALYZING
  - Tool: analyze_prompt_v2
  - Created PromptAnalysis JSON with entities, features, workflows

✓ STEP 2: DISCOVERING
  - Tool: discover_components_and_apis
  - Found relevant components (VcTable, VcForm, VcSelect, etc.)
  - Found framework hooks (useBladeNavigation, useApiClient, etc.)

✓ STEP 3: PLANNING
  - Tool: create_ui_plan_from_analysis_v2
  - Created complete UI-Plan with blades, features, components

✓ STEP 4: VALIDATING
  - Tool: validate_ui_plan (or validate_and_fix_plan)
  - Validated plan against schema, no errors

✓ STEP 5: GENERATING
  - Tool: generate_with_composition
  - Prepared generation guides with:
    * Base file paths (blade.vue, composable.ts, locale.json)
    * Discovered components (props, events, slots, examples)
    * Discovered hooks (methods, params, examples)
    * Templates, patterns, rules
    * Detailed instructions

→ STEP 6: AI CODE GENERATION (YOUR CURRENT TASK)
  - You receive enriched generation guide
  - Generate complete Vue SFC code following guide exactly
  - Return JSON: { blade, composable, apiClient?, locale? }
  - NO markdown, NO explanations in JSON response

→ STEP 7: CODE VALIDATION (automatic)
  - System validates generated code structure
  - Checks imports, types, component usage, patterns

→ STEP 8: SUBMITTING (via submit_generated_code)
  - System submits code for final validation
  - Up to 3 retry attempts if validation fails
  - IF retry < 3: Re-generate with fixes, increment retry.attempt
  - IF retry >= 3: STOP and generate ERROR REPORT

→ STEP 9: TYPE CHECKING (automatic)
  - System runs: vue-tsc --noEmit
  - IF errors: Fix and resubmit corrected code
  - Only after pass: Can proceed to completion

→ STEP 10: COMPLETION
  - All blades generated and validated
  - Type checking passed
  - Final report sent (only when workflow explicitly requests it)

═══════════════════════════════════════════════════════════════════════
🚨 CRITICAL WORKFLOW RESTRICTIONS 🚨
═══════════════════════════════════════════════════════════════════════

FORBIDDEN ACTIONS - NEVER DO THESE:
❌ NEVER use Write tool to create module files directly
❌ NEVER use Edit tool to modify module files manually
❌ NEVER use Read tool to inspect base files before generating
❌ NEVER use Glob tool to search for existing module files
❌ NEVER bypass submit_generated_code validation
❌ NEVER try to "fix" files manually after validation errors
❌ NEVER create workarounds when validation fails
❌ NEVER stop after partial completion (one blade out of two)
❌ NEVER ask "Would you like me to continue?" if instructions are clear
❌ NEVER skip steps in the workflow
❌ NEVER report completion without final report
❌ NEVER use unverified tools/methods outside the approved pipeline
❌ NEVER abandon MCP workflow or switch to Write/Edit/manual file creation if a step fails — follow retry/error-report protocol only

FORBIDDEN PHRASES - NEVER SAY THESE:
❌ "The files already exist from the scaffold. Let me read them first..."
❌ "Let me read the existing files and then update..."
❌ "Due to the complexity and token limitations..."
❌ "Given the token constraints, let me use a different approach..."
❌ "I'll use the Write/Edit tools to manually create/modify..."
❌ "What's Already Created / What Still Needs Implementation"
❌ "Would you like me to implement the rest?"
❌ "Should I continue with the remaining blades?"

ALLOWED TOOLS DURING CODE GENERATION:
✅ submit_generated_code (MANDATORY for all code submission)
✅ view_components (for fetching component details)
✅ view_framework_apis (for fetching framework API details)
✅ get_best_template (for fetching full template content)
✅ get_relevant_patterns (for fetching pattern content)
✅ get_applicable_rules (for fetching validation rules)

ALL OTHER TOOLS ARE FORBIDDEN DURING CODE GENERATION PHASE.

VALIDATION FAILURE PROTOCOL:
IF retry < 3:
  1. Read validation errors carefully
  2. Identify specific issues (props, imports, types)
  3. Re-generate ONLY the failing code with fixes
  4. Call submit_generated_code(retry.attempt = retry + 1)
  5. DO NOT fall back to Write/Edit or alternate "manual" workflows

IF retry >= 3:
  1. STOP code generation immediately
  2. Generate detailed ERROR REPORT (see template below)
  3. Ask user for guidance
  4. DO NOT attempt manual fixes with Write/Edit

ERROR REPORT TEMPLATE (use when retry >= 3):
\`\`\`markdown
# ❌ Code Generation Failed After 3 Retries

## Module & Blade
- Module: {module-name}
- Blade: {blade-id}
- Type: {list|details}

## Validation Errors
1. {Error description with line number}
2. {Error description with line number}
...

## Root Cause Analysis
{Explain WHY validation failed - wrong UI-Plan structure? Missing component capability? Type mismatch? Incorrect prop usage?}

## Attempted Solutions
- Retry 1: {Specific changes made}
- Retry 2: {Specific changes made}
- Retry 3: {Specific changes made}

## Recommendations
{Suggest user actions - modify prompt? Fix UI-Plan? Update component registry? Check template?}

## Workflow State
- Analysis: [✓]
- Discovery: [✓]
- UI-Plan: [✓]
- Validation: [✓]
- Generation: [✗] ← FAILED HERE

---
**WORKFLOW STOPPED** - Manual intervention required.
\`\`\`

═══════════════════════════════════════════════════════════════════════
📋 PLANNING RULES 📋
═══════════════════════════════════════════════════════════════════════

WHEN PLAN IS MANDATORY:
✓ Task requires 3+ distinct steps
✓ Task involves multiple blades/composables/widgets
✓ User provides detailed feature list
✓ Task is non-trivial (complexity score > 5)

WHEN PLAN IS NOT NEEDED:
✗ Single trivial operation (e.g., fix typo, add one field)
✗ Task can be completed in <3 steps
✗ Purely informational request

PLAN FORMAT:
1. Use numbered list (flat, no nesting)
2. Be specific (not "generate files" but "generate {module}-list.vue blade with {features}")
3. Include acceptance criteria (what defines completion)
4. One task = one action
5. Order by execution sequence

PLAN EXAMPLE (generic template):
1. Generate {module}-list.vue blade with {list-features}
2. Generate {entity}-details.vue blade with {details-features}
3. Generate use{Entity}List.ts composable
4. Generate use{Entity}Details.ts composable
5. Generate {module}.client.ts API client (if CRUD required)
6. Submit all code for validation
7. Fix any type errors reported by vue-tsc
8. Report completion with file paths and next steps

FORBIDDEN IN PLANS:
❌ "Optionally..." (be definitive)
❌ "If needed..." (clarify BEFORE planning)
❌ Vague tasks like "Handle edge cases"
❌ Nested sub-lists

═══════════════════════════════════════════════════════════════════════
🎯 TASK COMPLETION PROTOCOL 🎯
═══════════════════════════════════════════════════════════════════════

COMPLETENESS REQUIREMENT:
You MUST implement ALL features specified in the user's original prompt.
Partial implementation is UNACCEPTABLE.

BEFORE REPORTING COMPLETION, VERIFY ALL:
✓ ALL blades from UI-Plan generated and submitted successfully
✓ ALL composables created for each blade
✓ API client created (if multiple entities or CRUD required)
✓ Locale files updated with all i18n keys
✓ ALL widgets generated (if specified in prompt)
✓ Type checking passed (vue-tsc --noEmit)
✓ No validation errors remaining

SELF-CHECK QUESTIONS (answer BEFORE reporting completion):
1. Are ALL requirements from user's prompt implemented? [YES/NO]
2. Are ALL blades in UI-Plan generated? [YES/NO]
3. Are there ANY validation errors? [YES/NO]
4. Did type checking pass? [YES/NO]
5. Is the final report with file paths ready? [YES/NO]

IF ANY ANSWER IS "NO" → DO NOT REPORT COMPLETION, CONTINUE WORK

PROGRESS TRACKING:
- After each submit_generated_code, check "progress" field in response
- Response format: "completed: X, total: Y, remaining: [blade-ids]"
- Continue generating until: "remaining: []"
- Then check if API client needed (response indicates this)
- Follow "nextSteps" array from each response

FORBIDDEN BEHAVIORS:
❌ Stopping after one blade when multiple are required
❌ Asking "Should I implement the rest?" when prompt is clear
❌ Reporting completion with items remaining in "nextSteps"
❌ Skipping API client when response indicates it's required
❌ Ignoring type errors
❌ Creating "partial" implementations

REQUIRED BEHAVIORS:
✅ Generate ALL artifacts from prompt in ONE continuous session
✅ Follow ALL "nextSteps" from responses automatically
✅ Only report completion when response says "allComplete: true"
✅ Fix type errors immediately when detected
✅ Provide detailed final report (see template below)

═══════════════════════════════════════════════════════════════════════
📊 FINAL REPORT FORMAT (MANDATORY WHEN REQUESTED) 📊
═══════════════════════════════════════════════════════════════════════

USE THIS ONLY WHEN THE WORKFLOW EXPLICITLY ASKS FOR A FINAL REPORT MESSAGE (text/markdown). DO NOT emit this in code generation JSON responses.

CORRECT FINAL REPORT STRUCTURE:
\`\`\`markdown
# ✅ Module Generation Complete

## Generated Files
- [{module}-list.vue](src/modules/{module}/pages/{module}-list.vue) - List blade with {features-summary}
- [{entity}-details.vue](src/modules/{module}/pages/{entity}-details.vue) - Details blade with {features-summary}
- [use{Entity}List.ts](src/modules/{module}/composables/use{Entity}List.ts) - List composable
- [use{Entity}Details.ts](src/modules/{module}/composables/use{Entity}Details.ts) - Details composable
- [{module}.client.ts](src/modules/{module}/api/{module}.client.ts) - API client with CRUD (if applicable)
- [en.json](src/modules/{module}/locales/en.json) - i18n translations

## Implementation Summary
ALL requirements from the original prompt have been implemented:
✓ {Requirement 1 from user prompt}
✓ {Requirement 2 from user prompt}
✓ {Requirement 3 from user prompt}
...

## Type Checking
✓ vue-tsc --noEmit: PASSED (0 errors)
OR
✗ vue-tsc --noEmit: {N} errors (MUST FIX BEFORE REPORTING COMPLETION)

## Next Steps
1. Start dev server: \`yarn serve\`
2. Navigate to: http://localhost:5173/{module-url}
3. Test list blade features ({list-features})
4. Test details blade ({details-features})
5. Check console for any runtime errors

## Module Registration
✓ Module registered in src/main.ts
✓ Routes configured
✓ Menu item added to sidebar (if isWorkspace: true)
\`\`\`

FORBIDDEN FINAL REPORTS:
❌ "What's Already Created / What Still Needs Implementation" format
❌ Asking "Would you like me to..." questions
❌ Listing incomplete/partial implementations
❌ Providing implementation guides instead of completed work
❌ Skipping the final report entirely

═══════════════════════════════════════════════════════════════════════
⚙️ CODE GENERATION REQUIREMENTS ⚙️
═══════════════════════════════════════════════════════════════════════

TECHNICAL REQUIREMENTS:
1. Use Vue 3 Composition API with <script setup lang="ts">
2. Use TypeScript with strict types (no 'any' unless absolutely necessary)
3. Use VC-Shell components and framework hooks ONLY from provided registry
4. Follow provided templates and patterns EXACTLY
5. Respect all rules and constraints from generation guide
6. Generate complete, working code (no placeholders, no TODOs, no comments like "// implement X")
7. Add proper error handling with try/catch where appropriate
8. Match UI-Plan specifications exactly (props, events, slots)
9. Use emit("close:blade") for closing current blade (NOT closeBlade())
10. All strings through i18n with $t() - NO hardcoded text

WORKING DIRECTORY:
- "cwd" parameter is saved to workflow state automatically
- You do NOT specify "cwd" in subsequent submit_generated_code calls
- System retrieves cwd from state and creates files in correct location

AUTOMATIC TYPE CHECKING:
- When all artifacts complete, system runs: vue-tsc --noEmit
- If type errors found: Response returns "needsTypeFixing: true" + error list
- You MUST fix type errors and resubmit corrected code
- Only after type checking passes can you report completion

OUTPUT FORMAT (for code generation responses):
Return ONLY valid JSON with this structure (no markdown, no explanations):
{
  "blade": "<!-- complete .vue file content -->",
  "composable": "// complete .ts file content",
  "apiClient": "// complete API client .ts content (if needed)",
  "locale": { "key": "value" } // locale updates (if needed)
}

Do NOT include the final report inside this JSON payload. The final report is sent separately only if the workflow explicitly requests it.

═══════════════════════════════════════════════════════════════════════
📖 COMPLETE DOCUMENTATION 📖
═══════════════════════════════════════════════════════════════════════

See AI_GENERATION_RULES.md for complete rule documentation.
See WORKFLOW_RESTRICTIONS_RU.md for user-facing documentation (RU).

═══════════════════════════════════════════════════════════════════════

Remember: Your goal is to complete ALL requirements fully in ONE session.
Partial execution = FAILURE. Trust the process. Follow the pipeline.`;
  }

  /**
   * Build user prompt with full context
   */
  private buildUserPrompt(guide: any): string {
    const sections: string[] = [];

    // Task
    sections.push("# TASK");
    sections.push(`Generate ${guide.bladeType} blade: ${guide.bladeId}`);
    sections.push(`Module: ${guide.module}`);
    sections.push(`Entity: ${guide.entity}`);
    sections.push(`Features: ${guide.features.join(", ")}`);
    sections.push("");

    // Base files
    sections.push("# TARGET FILE PATHS");
    sections.push("Generate COMPLETE NEW CODE for these file paths:");
    sections.push(`- Blade: ${guide.baseFiles.blade}`);
    sections.push(`- Composable: ${guide.baseFiles.composable}`);
    sections.push(`- Locale: ${guide.baseFiles.locale}`);
    sections.push("");
    sections.push("⚠️ CRITICAL RULES FOR CODE GENERATION:");
    sections.push("❌ DO NOT use Read tool to read existing files");
    sections.push("❌ DO NOT use Edit tool to modify existing files");
    sections.push("❌ DO NOT use Write tool to create files directly");
    sections.push("✅ ONLY generate fresh code from scratch using generation guides");
    sections.push("✅ ONLY submit code via submit_generated_code tool");
    sections.push("❌ NEVER say 'Let me read the existing files first'");
    sections.push("❌ NEVER cite 'token limitations' or 'complexity' as reasons to bypass workflow");
    sections.push("");
    sections.push("The base files may exist from scaffolding but you MUST ignore them.");
    sections.push("Generate complete, production-ready code based on the requirements below.");
    sections.push("");

    // Components from registry
    if (guide.components?.length > 0) {
      sections.push("# VC-SHELL COMPONENTS (Use ONLY these)");
      guide.components.forEach((comp: any) => {
        sections.push(`\n## ${comp.name} (Confidence: ${(comp.confidence * 100).toFixed(0)}%)`);
        sections.push(`Description: ${comp.description}`);
        sections.push(`Match: ${comp.matchReason}`);

        if (comp.props) {
          sections.push("\n### Props:");
          sections.push("```typescript");
          sections.push(JSON.stringify(comp.props, null, 2));
          sections.push("```");
        }

        if (comp.slots?.length > 0) {
          sections.push("\n### Slots:");
          comp.slots.forEach((slot: any) => {
            sections.push(`- ${slot.name}: ${slot.description}`);
          });
        }

        if (comp.events?.length > 0) {
          sections.push("\n### Events:");
          comp.events.forEach((event: any) => {
            sections.push(`- ${event.name}: ${event.description}`);
          });
        }

        if (comp.examples?.length > 0) {
          sections.push("\n### Examples:");
          comp.examples.forEach((ex: string) => {
            sections.push("```vue");
            sections.push(ex);
            sections.push("```");
          });
        }
      });
      sections.push("");
    }

    // Framework hooks
    if (guide.hooks?.length > 0) {
      sections.push("# VC-SHELL FRAMEWORK HOOKS (Use ONLY these)");
      guide.hooks.forEach((hook: any) => {
        sections.push(`\n## ${hook.name}`);
        sections.push(`Import: import { ${hook.name} } from "${hook.import}";`);
        sections.push(`Description: ${hook.description}`);

        if (hook.methods?.length > 0) {
          sections.push("\n### Methods:");
          hook.methods.forEach((method: any) => {
            sections.push(
              `- ${method.name}(${method.params?.map((p: any) => `${p.name}: ${p.type}`).join(", ") || ""}): ${method.returns || "void"}`,
            );
            sections.push(`  ${method.description}`);
          });
        }

        if (hook.examples?.length > 0) {
          sections.push("\n### Examples:");
          hook.examples.forEach((ex: string) => {
            sections.push("```typescript");
            sections.push(ex);
            sections.push("```");
          });
        }
      });
      sections.push("");
    }

    // Template
    if (guide.template) {
      sections.push("# TEMPLATE (Use as base structure)");
      sections.push(`Template: ${guide.template.id} (${guide.template.complexity})`);
      sections.push(`Description: ${guide.template.description}`);
      sections.push("\n```vue");
      sections.push(guide.template.content);
      sections.push("```");
      sections.push("");
    }

    // Patterns
    if (guide.patterns?.length > 0) {
      sections.push("# PATTERNS (Follow these patterns)");
      guide.patterns.forEach((pattern: any) => {
        sections.push(`\n## ${pattern.id}`);
        sections.push(pattern.description);
        sections.push(pattern.content);
      });
      sections.push("");
    }

    // Rules
    if (guide.rules?.length > 0) {
      sections.push("# RULES (Must follow)");
      guide.rules.forEach((rule: any) => {
        sections.push(`\n## ${rule.id}`);
        sections.push(rule.description);
        sections.push(rule.content);
      });
      sections.push("");
    }

    // Instructions
    sections.push("# INSTRUCTIONS");
    sections.push(guide.instructions);
    sections.push("");

    // Expected output
    sections.push("# EXPECTED OUTPUT");
    sections.push("Return JSON object with:");
    Object.entries(guide.expectedOutput).forEach(([key, desc]) => {
      if (desc) {
        sections.push(`- ${key}: ${desc}`);
      }
    });

    return sections.join("\n");
  }
}
