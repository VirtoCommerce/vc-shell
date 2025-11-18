# MCP JSON Parameter Parsing Issue

## Problem Summary

When MCP clients (Claude/Cursor) send complex JSON objects as tool parameters, they may send them as **JSON strings** instead of parsed objects. This causes errors when the server tries to modify these objects.

## Root Cause Chain

1. **MCP Protocol Specification**: Defines tool arguments as `z.record(z.unknown())` (expects object)
   ```typescript
   export const CallToolRequestSchema = RequestSchema.extend({
       method: z.literal('tools/call'),
       params: BaseRequestParamsSchema.extend({
           name: z.string(),
           arguments: z.optional(z.record(z.unknown()))  // Should be object
       })
   });
   ```

2. **Client Behavior**: Some MCP clients send complex JSON objects as **strings**
   ```json
   {
     "name": "generate_with_composition",
     "arguments": {
       "plan": "{\"$schema\":\"https://...\",\"module\":\"offers\"}",  // STRING not object!
       "cwd": "/path"
     }
   }
   ```

3. **Zod Validation**: `z.record(z.unknown())` should reject strings, but somehow passes
   - Testing shows it **does reject strings** in isolation
   - But in MCP context, validation passes
   - This may be due to protocol-level JSON parsing

4. **Code Modification Error**: When code tries to modify the plan, it fails:
   ```typescript
   // This line in autoFixUIPlan() fails:
   if (!plan.$schema) {
       plan.$schema = "https://vc-shell.dev/schemas/ui-plan.v1.json";
       // ❌ Error: Cannot create property '$schema' on string
   }
   ```

## Why This Happens

The issue appears to be related to how the MCP protocol handles JSON serialization:

1. MCP uses stdio transport (JSON-RPC 2.0)
2. Everything sent over stdio is a string
3. The MCP SDK parses the JSON-RPC message
4. But nested JSON objects may remain as strings if:
   - Client double-encodes them
   - Client escapes JSON within JSON
   - Client sends them as literal strings

## Affected Tools

All tools that accept complex JSON object parameters:

1. ✅ **validate_ui_plan** - `plan` parameter
2. ✅ **generate_complete_module** - `plan` parameter
3. ✅ **generate_with_composition** - `plan` parameter
4. ✅ **validate_and_fix_plan** - `plan` parameter
5. ✅ **create_ui_plan_from_analysis_v2** - `analysis` parameter

## Solution

Add JSON parsing layer **after** zod validation for all complex object parameters:

```typescript
case "generate_with_composition": {
  const parsed = generateWithCompositionSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${parsed.error.message}`);
  }

  // ✅ Parse plan if it's a string (MCP protocol may send JSON objects as strings)
  const plan = typeof parsed.data.plan === 'string'
    ? JSON.parse(parsed.data.plan)
    : parsed.data.plan;

  // Now plan is guaranteed to be an object
  const { cwd, dryRun, mode } = parsed.data;

  // Safe to modify:
  if (!plan.$schema) {
    plan.$schema = "https://vc-shell.dev/schemas/ui-plan.v1.json";
  }
}
```

## Testing

To verify the fix:

1. **Enable debug mode**:
   ```bash
   DEBUG_MCP=true npx @vc-shell/ai-codegen mcp
   ```

2. **Look for debug output**:
   ```
   [DEBUG] generate_with_composition args type: object
   [DEBUG] args.plan type: string
   [DEBUG] args.plan is STRING: {"$schema":"https://...
   [DEBUG] After zod parse, rawPlan type: string
   ```

3. **Verify parsing works**:
   - No more "Cannot create property '$schema' on string" errors
   - Tool succeeds with both string and object inputs

## Why Not Change Zod Schema?

We could define schema as:
```typescript
plan: z.union([z.record(z.unknown()), z.string()])
```

**But this is wrong because**:
1. MCP protocol spec says it should be an object
2. Client is sending malformed data
3. Better to handle gracefully than accept wrong format

## Debug Logging

Added conditional debug logging to help diagnose:

```typescript
if (debugMode) {
  console.log(`\n[DEBUG] generate_with_composition args type: ${typeof args}`);
  console.log(`[DEBUG] args.plan type: ${typeof args?.plan}`);
  if (typeof args?.plan === 'string') {
    console.log(`[DEBUG] args.plan is STRING: ${args.plan.substring(0, 100)}...`);
  }
}
```

Enable with `DEBUG_MCP=true` environment variable.

## Related Issues

- [MCP SDK Issue #XXX](https://github.com/modelcontextprotocol/sdk/issues/XXX) - JSON object serialization
- Similar pattern in other MCP servers (needs investigation)

## Implementation Status

- ✅ validate_ui_plan - Fixed in mcp.ts:348
- ✅ generate_complete_module - Fixed in mcp.ts:741
- ✅ validate_and_fix_plan - Fixed in mcp.ts:816
- ✅ generate_with_composition - Fixed in mcp.ts:1026
- ✅ create_ui_plan_from_analysis_v2 - Fixed in mcp.ts:1565
- ✅ Debug logging added
- ✅ Documentation created
- ✅ Build verified

## Future Improvements

1. **Upstream Fix**: Report to MCP SDK maintainers
2. **Helper Function**: Create `parseJsonParam()` utility
3. **Type Safety**: Add better TypeScript types for parsed params
4. **Testing**: Add integration tests for string vs object inputs

## References

- MCP Protocol Spec: https://spec.modelcontextprotocol.io/
- MCP SDK Types: `@modelcontextprotocol/sdk/types.js`
- Zod Documentation: https://zod.dev/
