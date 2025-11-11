# VC-Shell MCP Quick Start

Use the VC-Shell MCP server to scaffold applications, browse components, and generate code from natural language prompts.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI assistants to securely connect to external data sources and tools. With the VC-Shell MCP server, your AI assistant gains direct access to:

- **Scaffold Applications** - Create new VC-Shell applications from scratch
- **Browse Components** - List all available VC-Shell components from the registry
- **Validate Plans** - Check UI-Plan JSON against the schema
- **Generate Code** - Create Vue SFC blades with composables, routes, and i18n from prompts
- **Access Patterns** - Get examples of blade and composable patterns

## Installation

### Quick Start

Select your MCP client and follow the instructions:

#### Cursor

**1. Run the following command** in your terminal:

```bash
npx @vc-shell/ai-codegen@latest init-mcp --client cursor
```

This will automatically create or update `.cursor/mcp.json` in your project.

**2. Restart Cursor** and enable the VC-Shell MCP server in Settings.

**3. Try these prompts:**

- Create a new VC-Shell app called "my-vendor-portal"
- Show me all available VC-Shell components
- Create vendor management with list and details blades
- Generate a product catalog module with CRUD operations

#### VS Code (GitHub Copilot)

**1. Create `.vscode/mcp.json`** in your project root:

```json
{
  "mcpServers": {
    "vcshell": {
      "command": "npx",
      "args": ["@vc-shell/ai-codegen@latest", "mcp"]
    }
  }
}
```

**2. Open `.vscode/mcp.json`** and click **Start** next to the vcshell server.

**3. Try the prompts** listed above.

#### Claude Code

**1. Create `.mcp.json`** in your project root:

```json
{
  "mcpServers": {
    "vcshell": {
      "command": "npx",
      "args": ["@vc-shell/ai-codegen@latest", "mcp"]
    }
  }
}
```

**2. Restart Claude Code** and run `/mcp` to verify the server is connected.

**3. Try the prompts** listed above.

### Manual Configuration

If you prefer to configure manually, add this to your MCP configuration file:

**Cursor:** `.cursor/mcp.json`
**VS Code:** `.vscode/mcp.json`
**Claude:** `.mcp.json`

```json
{
  "mcpServers": {
    "vcshell": {
      "command": "npx",
      "args": ["@vc-shell/ai-codegen@latest", "mcp"]
    }
  }
}
```

## How It Works

### 1. Scaffold a New Application

When starting from scratch:

```
Prompt: "Create a new VC-Shell app called vendor-portal"

AI will:
1. Validate the project name
2. Provide instructions to run: npx @vc-shell/create-vc-app vendor-portal
3. Guide you through the setup
```

### 2. Generate Modules

In an existing project:

```
Prompt: "Create vendor management with list and details"

AI will:
1. Generate UI-Plan JSON (intermediate representation)
2. Create vendors-list.vue blade (grid layout)
3. Create vendor-details.vue blade (form layout)
4. Generate useVendorList.ts composable
5. Generate useVendorDetails.ts composable
6. Create en.json locale file
7. Generate pages/index.ts
8. Create module index.ts
```

### 3. Browse Components

```
Prompt: "Show me all available VC-Shell components"

AI will list:
- VcBlade, VcTable, VcField, VcInput
- VcButton, VcSelect, VcTextarea
- VcSwitch, VcCheckbox, VcDatePicker
- And more...
```

## Example Prompts

### Scaffolding

- Create a new VC-Shell app called "my-store-admin"
- Scaffold a vendor portal application

### Module Generation

- Create product management with list and details
- Build order management with list, details, and filters
- Generate a seller onboarding wizard with steps

### Component Discovery

- Show me all VC-Shell components
- What components are available for forms?
- List all table-related components

### Pattern Learning

- Show me an example of a list blade
- How do I create a details blade?
- What's the structure of a composable?

## Project Structure

Generated modules follow this structure:

```
src/modules/{module-name}/
├── pages/
│   ├── index.ts                    # Export all blades
│   ├── {entities}-list.vue         # List blade
│   └── {entity}-details.vue        # Details blade
├── composables/
│   ├── use{Entity}List.ts          # List data logic
│   └── use{Entity}Details.ts       # Details data logic
├── locales/
│   ├── en.json                     # English translations
│   └── index.ts                    # Export locales
└── index.ts                        # Module entry point
```

## Workflow

### Two-Step Generation (Recommended)

For more control, use the two-step approach:

**Step 1: Generate UI-Plan**

```
Prompt: "Create UI-Plan for vendor management with list and details"

AI generates UI-Plan JSON that you can review and edit
```

**Step 2: Generate Code**

```
Prompt: "Generate code from the UI-Plan"

AI creates all Vue SFC files, composables, and locales
```

### One-Step Generation

For quick prototyping:

```
Prompt: "Create vendor management with list and details"

AI generates both UI-Plan and code in one go
```

## Troubleshooting

### MCP Server Not Responding

1. **Check Configuration** - Verify `mcp.json` is in the correct location
2. **Restart IDE** - Restart Cursor/VS Code/Claude after configuration
3. **Check Logs** - In Cursor: View → Output → MCP: project-*
4. **Clear Cache** - Run `npx clear-npx-cache`

### No Tools Available

1. **Enable Server** - Make sure the vcshell server is enabled in settings
2. **Check Permissions** - Verify the server has network access
3. **Update Package** - Run `npx @vc-shell/ai-codegen@latest mcp` to use latest version

### Generation Errors

1. **Check Project Setup** - Ensure you're in a VC-Shell project
2. **Verify Structure** - Confirm `src/modules/` directory exists
3. **Review UI-Plan** - If using two-step, validate the UI-Plan first

## Next Steps

- Read the [complete documentation](./README.md)
- Learn about [component patterns](./llms.txt)
- Explore [blade examples](../src/examples/)
- Check out [create-vc-app](../../create-vc-app/) for scaffolding options

## Learn More

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [VC-Shell Framework](https://github.com/VirtoCommerce/vc-shell)
- [Cursor MCP Documentation](https://docs.cursor.com/advanced/mcp)
- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/mcp)

