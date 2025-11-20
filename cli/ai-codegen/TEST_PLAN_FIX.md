# Test Plan: generate_with_composition Fix

## Problem Fixed
`generate_with_composition` now retrieves plan from workflow state when not provided explicitly.

## Test Scenario

### Before Fix ❌
```typescript
// Step 1: Create and validate plan
mcp__vcshell-codegen__create_ui_plan_from_analysis_v2({ analysis })
// ✅ Success - plan stored in workflow state

// Step 2: Generate composition without plan
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  bladeId: "offers-list"
})
// ❌ Error: Cannot read properties of undefined (reading '$schema')
```

### After Fix ✅
```typescript
// Step 1: Create and validate plan
mcp__vcshell-codegen__create_ui_plan_from_analysis_v2({ analysis })
// ✅ Success - plan stored in workflow state

// Step 2: Generate composition without plan
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  bladeId: "offers-list"
})
// ✅ Success - plan retrieved from workflow state automatically
```

## How to Test

### Test 1: Basic Workflow (No explicit plan)
```bash
# 1. Reset workflow
mcp__vcshell-codegen__reset_workflow

# 2. Use start_module_workflow to complete analysis + plan creation
mcp__vcshell-codegen__start_module_workflow({
  prompt: "Create offers management module with list and details",
  cwd: "/Users/symbot/DEV/vc-shell/gen-apps/offers-app"
})

# 3. Generate composition WITHOUT passing plan
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/Users/symbot/DEV/vc-shell/gen-apps/offers-app",
  bladeId: "offers-list"
})

# Expected: ✅ Success - generates composition guide
```

### Test 2: Workflow State Persistence
```bash
# 1. Check workflow status
mcp__vcshell-codegen__get_workflow_status

# Expected output should show:
# - currentStep: "validated"
# - hasPlan: true
# - plan: { ...actual plan object... }
```

### Test 3: Error Handling (No plan available)
```bash
# 1. Reset workflow
mcp__vcshell-codegen__reset_workflow

# 2. Try to generate without plan and without completing workflow
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/Users/symbot/DEV/vc-shell/gen-apps/offers-app"
})

# Expected: ❌ Clear error message:
# {
#   "success": false,
#   "error": "No UI-Plan available",
#   "suggestion": "You must either:\n1. Provide the plan in the 'plan' parameter, OR\n2. Complete the workflow steps first"
# }
```

### Test 4: Backward Compatibility (Explicit plan)
```bash
# 1. Generate with explicit plan (old behavior)
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/Users/symbot/DEV/vc-shell/gen-apps/offers-app",
  plan: { /* UI-Plan JSON */ },
  bladeId: "offers-list"
})

# Expected: ✅ Success - works as before
```

## Success Criteria
- ✅ `generate_with_composition` works without explicit `plan` parameter
- ✅ Plan is retrieved from workflow state automatically
- ✅ Clear error when plan not available in state or args
- ✅ Workflow state correctly stores plan from `create_ui_plan_from_analysis_v2`
- ✅ Workflow state correctly stores plan from `validate_ui_plan`
- ✅ Backward compatibility maintained (can still pass plan explicitly)

## Files Modified
1. `src/commands/mcp/tool-schemas.ts` - Made `plan` optional in schema
2. `src/commands/mcp.ts` - Added plan retrieval from workflow state
3. `src/commands/mcp/workflow-orchestrator.ts` - Fixed plan storage in workflow state
4. `src/commands/mcp.ts` - Added plan to `validate_ui_plan` result

## Build Required
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run build
```

## Notes
- Claude Code automatically uses new build after `npm run build`
- No need to manually restart MCP servers
- Workflow state persists in: `/tmp/.vc-shell-workflow-state.json`
