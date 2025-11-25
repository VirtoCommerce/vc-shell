# AI Code Generation Rules for VC-Shell

> **CRITICAL**: These rules are MANDATORY for all AI-powered code generation in VC-Shell. Violations will result in generation failure.

## Table of Contents
1. [Workflow Overview](#workflow-overview)
2. [Critical Restrictions](#critical-restrictions)
3. [Validation & Retry Protocol](#validation--retry-protocol)
4. [Task Completion Requirements](#task-completion-requirements)
5. [Code Generation Standards](#code-generation-standards)

---

## Workflow Overview

### 10-Step Pipeline

AI code generation is **STEP 6** in a 10-step automated workflow:

```
✓ STEP 1: ANALYZING (analyze_prompt_v2)
✓ STEP 2: DISCOVERING (discover_components_and_apis)
✓ STEP 3: PLANNING (create_ui_plan_from_analysis_v2)
✓ STEP 4: VALIDATING (validate_ui_plan)
✓ STEP 5: GENERATING (generate_with_composition)
→ STEP 6: AI CODE GENERATION ← YOU ARE HERE
→ STEP 7: CODE VALIDATION (automatic)
→ STEP 8: SUBMITTING (submit_generated_code)
→ STEP 9: TYPE CHECKING (vue-tsc)
→ STEP 10: COMPLETION
```

### Your Responsibilities at Step 6

1. **Receive** enriched generation guide from `generate_with_composition`
2. **Read** system prompt and user prompt in tool response message
3. **Generate** complete Vue SFC code following guides exactly
4. **Submit** code via `submit_generated_code` tool
5. **Handle** validation failures with retry protocol (max 3 attempts)
6. **Continue** until ALL blades complete

---

## Critical Restrictions

### ❌ FORBIDDEN ACTIONS - NEVER DO THESE

```
❌ NEVER use Write tool to create module files
❌ NEVER use Edit tool to modify module files
❌ NEVER use Read tool to inspect existing base files
❌ NEVER bypass submit_generated_code validation
❌ NEVER attempt manual fixes after validation errors
❌ NEVER create workarounds when validation fails
❌ NEVER stop after partial completion
❌ NEVER ask "Would you like me to continue?" if instructions are clear
❌ NEVER skip steps in the workflow
❌ NEVER report completion without generating all required artifacts
❌ NEVER abandon MCP workflow when encountering issues
❌ NEVER cite "token limitations" as reason to bypass workflow
❌ NEVER say "Let me read the existing files first"
```

### ✅ ALLOWED ACTIONS - ONLY DO THESE

```
✅ Generate complete code from scratch using generation guides
✅ Submit code via submit_generated_code tool
✅ Read validation errors from failed submissions
✅ Re-generate code with fixes on validation failure
✅ Increment retry.attempt on each resubmission
✅ Follow nextSteps array from tool responses
✅ Continue generating until allComplete: true
✅ Report completion only when workflow confirms it
```

---

## Validation & Retry Protocol

### When Validation Fails

Every `submit_generated_code` call may return validation errors. You have **3 retry attempts** maximum.

#### IF `retry.attempt < 3`:

1. **Read errors carefully**
   - Identify specific issues (props, imports, types, patterns)
   - Check line numbers and error descriptions

2. **Re-generate ONLY failing code**
   - Fix identified issues
   - Keep working parts unchanged
   - DO NOT switch to Write/Edit tools

3. **Resubmit with incremented retry**
   ```typescript
   submit_generated_code({
     bladeId: "same-blade-id",
     code: "fixed-code",
     retry: { attempt: previousAttempt + 1, previousErrors: [...] }
   })
   ```

4. **Repeat** until validation passes or retry >= 3

#### IF `retry.attempt >= 3`:

**STOP IMMEDIATELY** and generate this error report:

```markdown
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
{Explain WHY validation failed - wrong UI-Plan? Missing component capability?
Type mismatch? Incorrect prop usage?}

## Attempted Solutions
- Retry 1: {Specific changes made}
- Retry 2: {Specific changes made}
- Retry 3: {Specific changes made}

## Recommendations
{Suggest user actions:
- Modify original prompt?
- Fix UI-Plan manually?
- Update component registry?
- Check template quality?}

## Workflow State
- Analysis: [✓]
- Discovery: [✓]
- UI-Plan: [✓]
- Validation: [✓]
- Generation: [✗] ← FAILED HERE

---
**WORKFLOW STOPPED** - Manual intervention required.
```

Then **ASK USER FOR GUIDANCE**. Do NOT attempt manual fixes.

---

## Task Completion Requirements

### Completeness is MANDATORY

You MUST implement **ALL features** from the user's original prompt.
**Partial implementation = FAILURE.**

### Pre-Completion Checklist

Before reporting completion, verify:

```
✓ ALL blades from UI-Plan generated and submitted
✓ ALL composables created for each blade
✓ API client created (if CRUD or multiple entities)
✓ Locale files updated with all i18n keys
✓ ALL widgets generated (if specified in prompt)
✓ Type checking passed (vue-tsc --noEmit)
✓ No validation errors remaining
✓ Response says "allComplete: true"
```

### Self-Check Questions

Answer these **BEFORE** reporting completion:

1. Are ALL requirements from user's prompt implemented? **[YES/NO]**
2. Are ALL blades in UI-Plan generated? **[YES/NO]**
3. Are there ANY validation errors? **[YES/NO]**
4. Did type checking pass? **[YES/NO]**
5. Is final report ready? **[YES/NO]**

**IF ANY ANSWER IS "NO" → DO NOT REPORT COMPLETION**

### Progress Tracking

- Check `progress` field in each `submit_generated_code` response
- Format: `"completed: X, total: Y, remaining: [blade-ids]"`
- Continue until `remaining: []`
- Follow `nextSteps` array automatically
- Only stop when `allComplete: true`

### FORBIDDEN Completion Behaviors

```
❌ Stopping after one blade when multiple required
❌ Asking "Should I implement the rest?" when prompt is clear
❌ Reporting completion with items in nextSteps
❌ Skipping API client when response indicates it's needed
❌ Ignoring type errors
❌ Creating "partial" implementations
❌ Providing implementation guides instead of completed code
```

### REQUIRED Completion Behaviors

```
✅ Generate ALL artifacts in ONE continuous session
✅ Follow ALL nextSteps automatically
✅ Only report completion when allComplete: true
✅ Fix type errors immediately when detected
✅ Provide detailed final report (see template below)
```

---

## Code Generation Standards

### Technical Requirements

1. **Vue 3 Composition API** with `<script setup lang="ts">`
2. **TypeScript** with strict types (avoid `any`)
3. **VC-Shell components** ONLY from provided registry
4. **Framework hooks** ONLY from provided registry
5. **Follow templates** and patterns EXACTLY
6. **Complete code** - no placeholders, no TODOs, no `// implement X` comments
7. **Error handling** - try/catch where appropriate
8. **Match UI-Plan** specifications exactly (props, events, slots)
9. **Close blades** with `emit("close:blade")` (NOT `closeBlade()`)
10. **Internationalization** - all strings via `$t()`, NO hardcoded text

### Working Directory

- `cwd` parameter is saved to workflow state automatically
- You do NOT specify `cwd` in subsequent `submit_generated_code` calls
- System retrieves cwd from state and creates files in correct location

### Automatic Type Checking

- When all artifacts complete, system runs `vue-tsc --noEmit`
- If type errors found: Response includes `needsTypeFixing: true` + error list
- You MUST fix type errors and resubmit corrected code
- Only after type checking passes can you report completion

### Output Format

For code generation, return ONLY valid JSON (no markdown, no explanations):

```json
{
  "blade": "<!-- complete .vue file content -->",
  "composable": "// complete .ts file content",
  "apiClient": "// complete API client .ts (if needed)",
  "locale": { "key": "value" }
}
```

**Do NOT include final report inside JSON.**
Final report is sent separately as text/markdown when workflow requests it.

---

## Final Report Format

**USE ONLY when workflow explicitly asks for final report** (after `allComplete: true`).

```markdown
# ✅ Module Generation Complete

## Generated Files
- [module-list.vue](src/modules/{module}/pages/{module}-list.vue) - List blade with {features}
- [entity-details.vue](src/modules/{module}/pages/{entity}-details.vue) - Details blade with {features}
- [useEntityList.ts](src/modules/{module}/composables/useEntityList.ts) - List composable
- [useEntityDetails.ts](src/modules/{module}/composables/useEntityDetails.ts) - Details composable
- [module.client.ts](src/modules/{module}/api/{module}.client.ts) - API client with CRUD
- [en.json](src/modules/{module}/locales/en.json) - i18n translations

## Implementation Summary
ALL requirements from the original prompt have been implemented:
✓ {Requirement 1}
✓ {Requirement 2}
✓ {Requirement 3}
...

## Type Checking
✓ vue-tsc --noEmit: PASSED (0 errors)

## Next Steps
1. Start dev server: `yarn serve`
2. Navigate to: http://localhost:8080/app-base/{module-url}
3. Test list blade features
4. Test details blade
5. Check console for runtime errors

## Module Registration
✓ Module registered in src/main.ts
✓ Routes configured
✓ Menu item added (if workspace blade)
```

### FORBIDDEN Final Reports

```
❌ "What's Already Created / What Still Needs Implementation" format
❌ Asking "Would you like me to..." questions
❌ Listing incomplete/partial implementations
❌ Providing implementation guides instead of completed work
❌ Skipping final report when required
```

---

## Summary

**Your Goal:** Complete ALL requirements fully in ONE session.

**Trust the Process:**
1. Read system prompt in tool response message
2. Generate code from guides (no Read/Edit/Write)
3. Submit via submit_generated_code
4. Handle validation errors with retry protocol (max 3)
5. Continue until allComplete: true
6. Report completion with final report

**Partial execution = FAILURE**
**Follow the pipeline strictly**
**No manual workarounds**

---

## References

- System Prompt: See `src/workflows/steps/ai-codegen.ts` (lines 126-442)
- Workflow Handler: `src/mcp/handlers/workflow.ts`
