# Migration Guide: V1 (Embedded) → V2 (Lazy-Loading)

## Overview

This guide explains how to migrate from Response Templating V1 (embedded guide) to V2 (lazy-loading through MCP tools).

## Breaking Changes

### 1. BladeTaskTemplate Structure

**V1**:
```typescript
interface BladeTaskTemplate {
  guide: any;  // Full guide with all rules/patterns
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "READ_FILE",
    step_2: "GENERATE_CODE",
    step_3: "CALL_TOOL"
  };
}
```

**V2**:
```typescript
interface BladeTaskTemplate {
  context: {    // Minimal context only
    module: string;
    entity: string;
    features: string[];
    isWorkspace: boolean;
  };
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "FETCH_RULES",    // NEW: MCP tool call
    step_2: "FETCH_TEMPLATE", // NEW: MCP tool call
    step_3: "READ_BASE_FILE",
    step_4: "GENERATE_CODE",
    step_5: "CALL_TOOL"
  };
}
```

### 2. AI Workflow Changes

**V1 AI Behavior**:
```
1. Receive response with guide
2. Read base file
3. Generate code using guide.instructions
4. Call submit_generated_code
```

**V2 AI Behavior**:
```
1. Receive response with MCP tool templates
2. Call get_applicable_rules → get rules
3. Call get_best_template → get template
4. Read base file
5. Generate code using template + rules
6. Call submit_generated_code
```

## Migration Steps

### Step 1: Update TypeScript Code

**File**: `cli/ai-codegen/src/core/response-templates.ts`

**Status**: ✅ Already updated (committed)

The interface and function have been updated to use lazy-loading.

### Step 2: Verify MCP Tools are Available

Check that these tools are registered in `mcp.ts`:

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
grep -n "get_applicable_rules" src/commands/mcp.ts
grep -n "get_best_template" src/commands/mcp.ts
grep -n "get_relevant_patterns" src/commands/mcp.ts
```

**Status**: ✅ Tools already implemented (lines 313, 319, 325 in mcp.ts)

### Step 3: Build and Deploy

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run build
```

**Expected output**: ✅ Build success

### Step 4: Test New Workflow

#### Test 1: Single Blade Generation

```typescript
// Call generate_with_composition
{
  cwd: "/path/to/project",
  plan: {
    module: "offers",
    blades: [
      { id: "offers-list", type: "list", features: ["filters"] }
    ]
  }
}

// Expected response V2:
{
  workflow_started: {
    IMMEDIATE_ACTION_REQUIRED: {
      step_1: "FETCH_RULES",
      step_1_details: {
        tool: "mcp__vcshell-codegen__get_applicable_rules",
        args_template: { bladeType: "list", features: ["filters"], ... }
      },
      step_2: "FETCH_TEMPLATE",
      // ...
    },
    context: {  // ✅ Minimal context (not full guide)
      module: "offers",
      entity: "Offer",
      features: ["filters"],
      isWorkspace: true
    }
  }
}
```

#### Test 2: AI Executes MCP Calls

AI should now execute:

1. **Call get_applicable_rules**:
```typescript
mcp__vcshell-codegen__get_applicable_rules({
  bladeType: "list",
  features: ["filters"],
  isWorkspace: true,
  strategy: "AI_FULL"
})

// Response:
{
  critical_rules: [
    { id: "workspace-blade-menu", content: "...", priority: "CRITICAL" },
    { id: "filters-usage", content: "...", priority: "HIGH" }
  ]
}
```

2. **Call get_best_template**:
```typescript
mcp__vcshell-codegen__get_best_template({
  bladeType: "list",
  features: ["filters"],
  complexity: "moderate"
})

// Response:
{
  template: {
    path: "examples/templates/list-with-filters.vue",
    content: "...", // Full Vue SFC
    features: ["filters"]
  }
}
```

3. **Read base file** (unchanged)

4. **Generate code** using template + rules

5. **Submit code** (unchanged)

### Step 5: Monitor Success Rate

Track whether AI successfully:
- ✅ Calls get_applicable_rules before generating
- ✅ Calls get_best_template before generating
- ✅ Uses template as base for generation
- ✅ Applies rules from get_applicable_rules

**Metrics to track**:
- Calls to get_applicable_rules per generation
- Calls to get_best_template per generation
- Success rate of code generation
- Time to complete generation

## Common Issues

### Issue 1: AI Skips MCP Tool Calls

**Symptom**: AI generates code without calling get_applicable_rules or get_best_template

**Cause**: EXPECTED_RESPONSE not clear enough

**Fix**: The template now includes explicit 5-step instructions:
```typescript
EXPECTED_RESPONSE:
  "✅ Your NEXT message must:\n" +
  "1. Call mcp__vcshell-codegen__get_applicable_rules\n" +
  "2. Call mcp__vcshell-codegen__get_best_template\n" +
  "3. Call Read tool for base file\n" +
  "4. Generate complete Vue SFC code\n" +
  "5. Call submit_generated_code with complete code\n" +
  "NO explanatory text between steps, NO confirmation questions."
```

### Issue 2: AI Asks for Confirmation

**Symptom**: AI says "Should I proceed with step 1?"

**Cause**: FORBIDDEN_ACTIONS not clear

**Fix**: Added explicit forbidden action:
```typescript
FORBIDDEN_ACTIONS: [
  '❌ NEVER ask "Should I proceed?" or "Would you like me to..."',
  '❌ NEVER say "Let me generate..." - JUST DO IT',
  "❌ NEVER skip steps 1-2 (fetching rules/template) - they are MANDATORY",
  // ...
]
```

### Issue 3: MCP Tool Returns Error

**Symptom**: get_applicable_rules or get_best_template returns error

**Possible causes**:
1. Invalid bladeType (must be "list" or "details")
2. Empty features array
3. Rules/templates not found

**Debug**:
```bash
# Check if rules exist
ls /Users/symbot/DEV/vc-shell/cli/ai-codegen/rules/critical/

# Check if templates exist
ls /Users/symbot/DEV/vc-shell/cli/ai-codegen/examples/templates/
```

## Rollback Plan

If V2 causes issues, you can temporarily revert:

### Option 1: Keep V2 Code, Disable Lazy-Loading

Modify `buildBladeTaskTemplate` to temporarily return full guide:

```typescript
export function buildBladeTaskTemplate(...) {
  // V2 code
  const v2Template = { ... };

  // Temporary: Add guide back for compatibility
  return {
    ...v2Template,
    guide: guide.instructions || guide.decision.aiGuide  // V1 fallback
  };
}
```

### Option 2: Git Revert

```bash
git log --oneline cli/ai-codegen/src/core/response-templates.ts
# Find commit before V2 changes
git revert <commit-hash>
```

## Success Criteria

V2 migration is successful if:

- ✅ Build completes without errors
- ✅ `generate_with_composition` returns response **without** `guide` field
- ✅ `generate_with_composition` returns response **with** `context` field
- ✅ IMMEDIATE_ACTION_REQUIRED has 5 steps (not 3)
- ✅ AI calls get_applicable_rules before generating
- ✅ AI calls get_best_template before generating
- ✅ Generated code matches template + rules
- ✅ Success rate ≥ V1 success rate (80-90%)

## Performance Benchmarks

### Before V2 (Baseline)

**Scenario**: 2 blades (list + details)

| Metric | Value |
|--------|-------|
| Initial response size | 30K tokens |
| Total tokens (2 blades) | 58K tokens |
| Average generation time | ~60s |
| Success rate | 80-90% |

### After V2 (Target)

| Metric | Target | Actual |
|--------|--------|--------|
| Initial response size | 3-4K tokens | ⏳ TBD |
| Total tokens (2 blades) | 24-26K tokens | ⏳ TBD |
| Average generation time | ~30-40s | ⏳ TBD |
| Success rate | ≥80% | ⏳ TBD |

## Next Steps

1. **Deploy V2** to testing environment
2. **Monitor metrics** (payload size, success rate, generation time)
3. **Collect feedback** from AI behavior
4. **Iterate** on MCP tool responses if needed
5. **Document results** in this file

## Questions?

- Check [LAZY_LOADING_ARCHITECTURE.md](LAZY_LOADING_ARCHITECTURE.md) for architecture details
- Check [PAYLOAD_COMPARISON.md](PAYLOAD_COMPARISON.md) for size comparisons
- Check existing MCP tool implementations in [mcp.ts](src/commands/mcp.ts)

## Change Log

### 2024-11-20: V2 Initial Implementation

**Files changed**:
- `src/core/response-templates.ts` - Updated BladeTaskTemplate interface and buildBladeTaskTemplate function

**Features**:
- ✅ Removed `guide` field from response
- ✅ Added `context` field with minimal data
- ✅ Added 5-step IMMEDIATE_ACTION_REQUIRED with MCP tool calls
- ✅ Updated EXPECTED_RESPONSE to include MCP tool call instructions

**Status**: ✅ Built successfully, ready for testing
