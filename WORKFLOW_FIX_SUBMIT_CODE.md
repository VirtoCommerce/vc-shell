# Workflow Fix: submit_generated_code should work directly after generate_with_composition

## Problem

The MCP workflow orchestrator required `check_types` to be executed **BEFORE** `submit_generated_code`, which was incorrect for the AI_FULL generation strategy:

### Old (Incorrect) Flow:
```
1. generate_with_composition → state = "generated"
2. check_types → state = "code_submitted" ← WRONG! Code doesn't exist yet!
3. submit_generated_code → state = "completed"
```

**Why this was wrong:**
- `check_types` runs `vue-tsc` on the project
- At step 2, the code hasn't been written yet (AI only received instructions)
- This blocked the AI from submitting code immediately after generation

## Solution

Reversed the order: `submit_generated_code` first, then optional `check_types`:

### New (Correct) Flow:
```
1. generate_with_composition → state = "generated"
2. AI writes code based on instructions
3. submit_generated_code → state = "code_submitted" ← Code is now written!
4. check_types (optional) → state = "completed" ← Verify types after code exists
```

## Changes Made

### File: `cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts`

#### 1. Reordered transitions (lines 201-211)

**Before:**
```typescript
// Step 5: Type checking (MANDATORY after generation, before code submission)
check_types: {
  allowedFrom: ["generated", "code_submitted"],
  nextState: "code_submitted",
},

// Step 6: Code submission (ONLY after type checking passes)
submit_generated_code: {
  allowedFrom: ["code_submitted"],
  nextState: "completed",
},
```

**After:**
```typescript
// Step 5: Code submission (AFTER generation, AI writes code then submits)
submit_generated_code: {
  allowedFrom: ["generated", "code_submitted"], // Allow from generated or retry
  nextState: "code_submitted",
},

// Step 6: Type checking (OPTIONAL after code submission for verification)
check_types: {
  allowedFrom: ["code_submitted", "completed"],
  nextState: "completed",
},
```

#### 2. Updated state transitions (lines 244-253)

**Before:**
```typescript
check_types: "code_submitted",
submit_generated_code: "completed",
```

**After:**
```typescript
submit_generated_code: "code_submitted",
check_types: "completed",
```

#### 3. Updated quality checks availability (lines 143-153)

**Before:**
```typescript
if (["init", "analyzed", "planned", "validated"].includes(this.state.step)) {
  // Block check_types from "generated" state
}
```

**After:**
```typescript
if (["init", "analyzed", "planned", "validated", "generated"].includes(this.state.step)) {
  // Block check_types from "generated" state - must submit code first
}
```

#### 4. Added error messages for check_types (lines 363-368)

```typescript
check_types: {
  init: "Cannot check types before code is submitted. Complete workflow first.",
  analyzed: "Cannot check types before code is submitted.",
  validated: "Cannot check types before code is submitted. Generate and submit code first.",
  generated: "Cannot check types before code is submitted. Submit code using submit_generated_code first.",
},
```

#### 5. Updated next step suggestions (lines 389-394)

**Before:**
```typescript
generated: "Write Vue SFC code following the generated instructions, then use submit_generated_code to save and validate",
code_submitted: "Optionally use check_types to verify TypeScript types, or get_audit_checklist for quality review",
```

**After:**
```typescript
generated: "Read the generation guide, write Vue SFC code following the instructions, then use submit_generated_code to save and validate the code",
code_submitted: "Code submitted successfully! Optionally use check_types to verify TypeScript types, or start a new blade/module",
```

#### 6. Updated isToolCategoryAvailable (lines 436-439)

**Before:**
```typescript
return ["generated", "code_submitted", "completed"].includes(this.state.step);
```

**After:**
```typescript
return ["code_submitted", "completed"].includes(this.state.step);
```

## Impact

### ✅ Now Works:
```typescript
// AI workflow after calling generate_with_composition
1. Receive generation guide
2. Write Vue SFC code
3. Call submit_generated_code({ bladeId, code, context }) ← NOW ALLOWED!
4. (Optional) Call check_types({ cwd }) to verify types
```

### ⛔ Previously Blocked:
```typescript
// Old workflow required non-existent step
1. Receive generation guide
2. Call check_types({ cwd }) ← ERROR: Code doesn't exist yet!
```

## Testing

To verify the fix works:

```typescript
// 1. Generate instructions
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  bladeId: "offers-list",
  plan: { ... },
})

// 2. AI writes code, then submits (should now work!)
mcp__vcshell-codegen__submit_generated_code({
  bladeId: "offers-list",
  code: "<!-- generated Vue SFC code -->",
  context: { module: "offers", layout: "grid", strategy: "AI_FULL" }
})
// ✅ Should succeed and move to "code_submitted" state

// 3. Optionally check types
mcp__vcshell-codegen__check_types({ cwd: "/path/to/project" })
// ✅ Should succeed and move to "completed" state
```

## Related Files

- `cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts` - Main workflow logic
- `cli/ai-codegen/src/commands/mcp.ts` - MCP server tool handlers

## Workflow States Reference

```
init → analyzed → validated → generated → code_submitted → completed
       (optional)              ↓              ↓
                          submit_code   check_types
                                           (optional)
```
