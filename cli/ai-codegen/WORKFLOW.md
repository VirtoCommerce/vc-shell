# MCP Workflow Enforcement

## Overview

The MCP server now enforces a strict workflow to ensure AI follows the correct sequence when generating modules. This prevents common errors like skipping prompt analysis or attempting to generate code without validation.

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. analyze_prompt_v2 (MANDATORY)                          │
│     ↓                                                       │
│  2. create_ui_plan_from_analysis_v2                        │
│     ↓                                                       │
│  3. validate_ui_plan / validate_and_fix_plan               │
│     ↓                                                       │
│  4. generate_with_composition / generate_complete_module   │
│     ↓                                                       │
│  5. submit_generated_code (optional)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Mandatory Prompt Analysis

**Problem Solved:** AI was skipping `analyze_prompt_v2` and creating invalid UI-Plans.

**Solution:** The workflow orchestrator blocks any attempt to create UI-Plans without prior analysis.

```json
{
  "error": "Workflow violation",
  "tool": "create_ui_plan_from_analysis_v2",
  "currentStep": "init",
  "reason": "Cannot create UI-Plan without analysis. Run analyze_prompt_v2 first."
}
```

### 2. Debug Mode Fixed

**Problem Solved:** Debug logs were going to stdout, breaking MCP protocol.

**Solution:** All debug logs now use `console.error()` (stderr).

```bash
# Enable debug mode
DEBUG_MCP=true MCP_METRICS_FILE=/tmp/mcp-metrics.json npx @vc-shell/ai-codegen mcp
```

### 3. Workflow Status Tracking

Use `get_workflow_status` to check current state:

```json
{
  "workflow": {
    "currentStep": "analyzed",
    "nextStep": "Use create_ui_plan_from_analysis_v2 to create UI-Plan from analysis",
    "canProceed": true,
    "hasAnalysis": true,
    "hasPlan": false
  },
  "sequence": [
    { "step": 1, "tool": "analyze_prompt_v2", "status": "completed", "required": true },
    { "step": 2, "tool": "create_ui_plan_from_analysis_v2", "status": "pending", "required": true },
    { "step": 3, "tool": "validate_ui_plan or validate_and_fix_plan", "status": "blocked", "required": true },
    { "step": 4, "tool": "generate_with_composition", "status": "blocked", "required": true },
    { "step": 5, "tool": "submit_generated_code", "status": "blocked", "required": false }
  ]
}
```

### 4. Guided Workflow

**New Tool:** `start_module_workflow`

This tool provides a guided experience, automatically walking AI through all steps:

```typescript
// AI calls this tool
start_module_workflow({
  prompt: "Create vendor management module with list and details",
  cwd: "/path/to/project"
})

// Returns instructions for step 1 (analyze_prompt_v2)
// After AI completes analysis, automatically suggests next step
// Continues until module generation is complete
```

## Tool Descriptions

All workflow-critical tools now have ⚠️ warnings:

- `analyze_prompt_v2`: **⚠️ MANDATORY FIRST STEP ⚠️**
- `create_ui_plan_from_analysis_v2`: **⚠️ REQUIRES ANALYSIS ⚠️**
- `generate_with_composition`: **⚠️ REQUIRES VALIDATED UI-PLAN ⚠️**
- `generate_complete_module`: **⚠️ REQUIRES VALIDATED UI-PLAN ⚠️**

## Example Workflow

### ✅ Correct Workflow

```typescript
// Step 1: Analyze (MANDATORY)
analyze_prompt_v2({ prompt: "Create offers module", module: "offers" })

// Step 2: Create UI-Plan
create_ui_plan_from_analysis_v2({ analysis: { /* result from step 1 */ } })

// Step 3: Validate
validate_ui_plan({ plan: { /* result from step 2 */ } })

// Step 4: Generate
generate_with_composition({ plan: { /* validated plan */ }, cwd: "/project" })

// Step 5: Submit code
submit_generated_code({ bladeId: "offers-list", code: "..." })
```

### ❌ Incorrect Workflow (Blocked)

```typescript
// ❌ Trying to create UI-Plan without analysis
create_ui_plan_from_analysis_v2({ analysis: {} })

// Returns error:
// {
//   "error": "Workflow violation",
//   "reason": "Cannot create UI-Plan without analysis. Run analyze_prompt_v2 first."
// }
```

## Workflow States

| State | Description | Allowed Tools |
|-------|-------------|---------------|
| `init` | Initial state | `analyze_prompt_v2`, search tools |
| `analyzed` | Analysis completed | `create_ui_plan_from_analysis_v2`, search tools |
| `planned` | UI-Plan created | `validate_ui_plan`, `validate_and_fix_plan`, search tools |
| `validated` | UI-Plan validated | `generate_with_composition`, `generate_complete_module`, search tools |
| `generated` | Code generated | `submit_generated_code`, `check_types`, search tools |
| `completed` | Module completed | All tools (can start new module) |

## Search Tools (Always Allowed)

These tools can be used at any workflow step:
- `search_components`
- `view_components`
- `get_component_examples`
- `search_components_by_intent`
- `get_component_capabilities`
- `search_framework_apis`
- `view_framework_apis`
- `search_framework_by_intent`
- `get_framework_capabilities`
- `get_framework_examples`

## Benefits

1. **Prevents Invalid UI-Plans**: Analysis ensures AI understands the domain before creating plans
2. **Better Code Quality**: Validated plans lead to better generated code
3. **Consistent Workflow**: All AI agents follow the same sequence
4. **Clear Error Messages**: When workflow is violated, AI gets clear instructions on what to do
5. **Debug Friendly**: Debug mode now works correctly with stderr logging

## Migration Guide

### For AI Prompts

Update your AI instructions to always use this sequence:

```
1. Start with analyze_prompt_v2 or start_module_workflow
2. Wait for analysis before creating UI-Plan
3. Validate plan before generation
4. Generate and submit code
```

### For Claude Code / Cursor

When asking AI to create a module, the workflow will automatically enforce correct sequence. If AI tries to skip steps, it will receive a workflow violation error with clear instructions.

## Troubleshooting

### "Workflow violation" errors

**Cause:** AI tried to use a tool out of sequence.

**Solution:** Check `get_workflow_status` and follow the suggested next step.

### Debug logs not appearing

**Cause:** Debug mode not enabled or looking at stdout instead of stderr.

**Solution:**
```bash
DEBUG_MCP=true npx @vc-shell/ai-codegen mcp 2>&1 | grep "MCP DEBUG"
```

### AI skips analysis

**Cause:** Old AI prompts or instructions.

**Solution:** Tool descriptions now clearly mark analysis as mandatory. Workflow orchestrator will block invalid sequences.

## Implementation Details

- **File:** `cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts`
- **Integration:** `cli/ai-codegen/src/commands/mcp.ts`
- **Debug Helper:** `debugLog()` function (uses stderr)
- **Global State:** `globalWorkflow` singleton tracks current workflow state

## Future Enhancements

- [ ] Workflow persistence (save state between sessions)
- [ ] Multiple concurrent workflows (different modules)
- [ ] Workflow visualization in UI
- [ ] Undo/rollback functionality
- [ ] Workflow templates for common patterns
