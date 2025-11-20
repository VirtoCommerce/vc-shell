# Fix: generate_with_composition Plan Resolution

## Problem
Error when calling `generate_with_composition` without explicit `plan` parameter:
```
Error: Cannot read properties of undefined (reading '$schema')
at autoFixUIPlan
```

## Root Cause
1. `generate_with_composition` required `plan` as mandatory parameter
2. When called with only `cwd` and `bladeId`, `plan` was `undefined`
3. `autoFixUIPlan(undefined)` tried to access `undefined.$schema` → crash
4. Workflow state stored plan but wasn't retrieved when plan not provided

## Solution

### 1. Made `plan` parameter optional in schema
**File:** `src/commands/mcp/tool-schemas.ts`
```typescript
export const generateWithCompositionSchema = z.object({
  plan: z.any().optional().describe(
    "UI-Plan JSON. If not provided, will be taken from workflow state (after validate_ui_plan)."
  ),
  // ... rest
});
```

### 2. Added plan retrieval from workflow state
**File:** `src/commands/mcp.ts` (line 1036-1064)
```typescript
// Parse plan if it's a string (MCP sends JSON as string)
// If plan is not provided, get it from workflow state
let plan = rawPlan
  ? (typeof rawPlan === 'string' ? JSON.parse(rawPlan) : rawPlan)
  : globalWorkflow.getState().plan;

// Check if plan is available
if (!plan) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: false,
        error: "No UI-Plan available",
        reason: "Plan was not provided in arguments and not found in workflow state",
        suggestion: "You must either:\n1. Provide the plan in the 'plan' parameter, OR\n2. Complete the workflow steps first"
      })
    }]
  };
}
```

### 3. Fixed workflow state plan storage
**File:** `src/commands/mcp/workflow-orchestrator.ts`

#### create_ui_plan_from_analysis_v2 (line 257-280)
```typescript
// Extract plan from result - it's nested in content[0].text as JSON string
let planData = result;
if (result.content && Array.isArray(result.content) && result.content[0]?.text) {
  try {
    planData = JSON.parse(result.content[0].text);
  } catch {
    // If parsing fails, use result as-is
  }
}

// Store the actual plan object
this.state.plan = planData.plan || planData;
```

#### validate_ui_plan/validate_and_fix_plan (line 298-316)
```typescript
// Store plan from validate_ui_plan or validate_and_fix_plan
if (toolName === "validate_ui_plan" || toolName === "validate_and_fix_plan") {
  // Extract plan from result
  let planData = result;
  if (result.content && Array.isArray(result.content) && result.content[0]?.text) {
    try {
      planData = JSON.parse(result.content[0].text);
    } catch {
      // If parsing fails, use result as-is
    }
  }

  // Store the plan if it's in the result
  if (planData.plan) {
    this.state.plan = planData.plan;
  } else if (planData.fixedPlan) {
    // validate_and_fix_plan returns fixedPlan
    this.state.plan = planData.fixedPlan;
  }
}
```

### 4. Added plan to validate_ui_plan result
**File:** `src/commands/mcp.ts` (line 461)
```typescript
return trackSuccess({
  content: [{
    type: "text",
    text: JSON.stringify({
      valid: validationResult.valid,
      message: validationResult.valid ? "UI-Plan is valid" : "UI-Plan has validation errors",
      errors: validationResult.errors || undefined,
      plan: plan, // Include plan in result for workflow state
    })
  }]
});
```

## Impact
- ✅ `generate_with_composition` now works without explicit `plan` parameter
- ✅ Plan is automatically retrieved from workflow state after validation
- ✅ Clear error message when plan is not available
- ✅ Workflow state correctly stores and retrieves plan across all tools
- ✅ Maintains backward compatibility - can still pass plan explicitly

## Usage
Now works both ways:

**Option 1: With workflow state (recommended)**
```typescript
// 1. Create and validate plan
create_ui_plan_from_analysis_v2({ analysis })
// 2. Generate without passing plan
generate_with_composition({ cwd, bladeId: "offers-list" })
```

**Option 2: With explicit plan**
```typescript
generate_with_composition({
  cwd,
  plan: myUIPlan,
  bladeId: "offers-list"
})
```
