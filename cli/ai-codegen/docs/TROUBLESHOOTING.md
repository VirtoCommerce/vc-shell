# Troubleshooting Guide

## MCP Tools Not Available in Cursor

### Symptoms
- Only resources are available in MCP
- Tools are not showing up
- "No tools available" message

### Solution Steps

#### 1. Verify MCP Server is Built

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run build
```

#### 2. Test MCP Server Manually

```bash
# Test that tools are exposed
node test-mcp.js
```

You should see 6 tools in the output:
- `validate_ui_plan`
- `search_components`
- `view_components`
- `get_component_examples`
- `get_audit_checklist`
- `scaffold_app`

#### 3. Restart Cursor Completely

**Important**: Not just reload window, but **full restart**:

```bash
# macOS
Command + Q (quit completely)
# Then reopen Cursor

# Windows/Linux
Close all windows
# Then reopen Cursor
```

#### 4. Check MCP Connection Status

1. Open Cursor Settings → Features → MCP
2. Find `vcshell-codegen` server
3. Check for **green dot** (connected) or **red dot** (disconnected)

#### 5. If Still Red Dot (Disconnected)

**Option A: Check Configuration**

Verify `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "vcshell-codegen": {
      "command": "node",
      "args": [
        "/Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/index.js",
        "mcp"
      ],
      "env": {},
      "description": "VC-Shell AI Code Generation"
    }
  }
}
```

**Option B: Check File Permissions**

```bash
# Ensure dist/index.js exists and is readable
ls -la /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/index.js

# Should output something like:
# -rw-r--r--  1 user  staff  67KB ... dist/index.js
```

**Option C: Check Node Version**

```bash
node --version
# Should be v18+ for MCP SDK compatibility
```

#### 6. View MCP Server Logs

Cursor may show MCP server logs in the Output panel:

1. View → Output
2. Select "MCP" from dropdown
3. Look for errors or warnings

Common errors:
- `ENOENT` - File not found (wrong path in mcp.json)
- `Cannot find module` - Missing dependencies (run `npm install`)
- `Permission denied` - File permissions issue

#### 7. Force Reconnect

If Cursor shows connected but tools still missing:

1. Settings → Features → MCP
2. Click **Disconnect** next to vcshell-codegen
3. Wait 2 seconds
4. Click **Connect**
5. Look for green dot

#### 8. Clear Cursor Cache (Last Resort)

```bash
# macOS
rm -rf ~/Library/Application\ Support/Cursor/User/globalStorage/*

# Linux
rm -rf ~/.config/Cursor/User/globalStorage/*

# Windows
# Delete C:\Users\<username>\AppData\Roaming\Cursor\User\globalStorage\*
```

Then restart Cursor and reconnect MCP.

---

## Still Not Working?

### Verify MCP Server Response

Create a test file `test-mcp-direct.js`:

```javascript
import { spawn } from "child_process";

const mcp = spawn("node", [
  "/Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/index.js",
  "mcp",
]);

mcp.stdout.on("data", (data) => console.log("OUT:", data.toString()));
mcp.stderr.on("data", (data) => console.log("ERR:", data.toString()));

setTimeout(() => {
  mcp.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/list",
      id: 1,
    }) + "\n"
  );
}, 500);

setTimeout(() => mcp.kill(), 2000);
```

Run:
```bash
node test-mcp-direct.js
```

Expected output should include:
```json
{
  "result": {
    "tools": [
      {"name": "validate_ui_plan", ...},
      {"name": "search_components", ...},
      ...
    ]
  }
}
```

If tools appear here but not in Cursor, the issue is with Cursor's MCP integration.

---

## Known Issues

### Issue: Tools showing as "string" input schema or tools not visible

**Symptom**: 
- Tools appear but with wrong input schema type (`{"type": "string"}`)
- Tools not showing in Cursor even though MCP server is connected
- Only resources visible, no tools

**Cause**: Incompatibility with newer versions of `@modelcontextprotocol/sdk` (v1.21+)

**Fix**: 
Use stable versions:
```json
{
  "@modelcontextprotocol/sdk": "^1.0.4",
  "zod": "^3.24.1"
}
```

**Why**: Versions 1.21+ of MCP SDK changed how `zodToJsonSchema` works, producing simplified schemas that Cursor cannot parse correctly. Version 1.0.4 produces proper JSON Schema with `properties`, `required`, etc.

**To fix in your project**:
```bash
cd cli/ai-codegen
# Edit package.json - set @modelcontextprotocol/sdk to ^1.0.4
npm install
npm run build
# Restart Cursor completely (Command+Q)
```

### Issue: "MCP server unavailable"

**Symptom**: Red dot in MCP settings

**Common Causes**:
1. Wrong path in `.cursor/mcp.json`
2. Node not in PATH
3. Package not built (`npm run build`)

**Fix**: Check all three, then restart Cursor

### Issue: Tools work once then disappear

**Symptom**: Tools available after first connection, then gone

**Cause**: Cursor may cache MCP capabilities incorrectly

**Fix**: 
```bash
# Disconnect, clear cache, reconnect
# See step 8 above
```

---

## Debug Mode

Enable verbose logging in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vcshell-codegen": {
      "command": "node",
      "args": [
        "/Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/index.js",
        "mcp"
      ],
      "env": {
        "DEBUG": "*"
      },
      "description": "VC-Shell AI Code Generation"
    }
  }
}
```

This will show detailed logs in Cursor's Output panel.

---

## Contact

If none of the above works:

1. Check [GitHub Issues](https://github.com/VirtoCommerce/vc-shell/issues)
2. Create a new issue with:
   - Output of `node test-mcp.js`
   - Cursor version
   - Node version
   - OS version
   - Full error logs from Cursor Output panel

