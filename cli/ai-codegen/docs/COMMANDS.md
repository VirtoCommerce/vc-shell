# VC-Shell AI Codegen CLI Commands

Complete reference for all `vcgen` CLI commands.

## Installation

```bash
npm install -D @vc-shell/ai-codegen@latest
```

## Commands

### `vcgen init-mcp`

Initialize MCP configuration for your IDE (Cursor, VS Code, Claude Code, Codex).

**Usage:**
```bash
vcgen init-mcp [options]
```

**Options:**
- `--client <name>` - IDE client: cursor, vscode, claude, codex (default: cursor)
- `--cwd <path>` - Working directory (default: current directory)

**Examples:**
```bash
# Interactive selection
vcgen init-mcp

# Specific client
vcgen init-mcp --client cursor
vcgen init-mcp --client vscode
vcgen init-mcp --client claude
vcgen init-mcp --client codex
```

**What it does:**
- Creates IDE-specific MCP configuration file
- Optionally installs `@vc-shell/ai-codegen` as dev dependency
- Provides step-by-step instructions for enabling the MCP server

---

### `vcgen mcp`

Run as MCP server for AI integration.

**Usage:**
```bash
vcgen mcp
```

**Description:**
Starts the VC-Shell MCP server that provides tools and resources for AI assistants. This command is typically called by your IDE's MCP client, not manually.

**Available MCP Tools:**
- `search_components` - Search components with fuzzy matching
- `view_components` - Get detailed component information
- `get_component_examples` - Find demo files and examples
- `get_audit_checklist` - Get post-generation audit checklist
- `validate_ui_plan` - Validate UI-Plan JSON
- `scaffold_app` - Create new VC-Shell application

---

### `vcgen search`

Search for VC-Shell components with fuzzy matching.

**Usage:**
```bash
vcgen search [query] [options]
```

**Arguments:**
- `query` - Search query (optional, shows all if omitted)

**Options:**
- `--category <category>` - Filter by category (UI, Form, Layout, Data)
- `--limit <number>` - Maximum results to return (default: 20)
- `--offset <number>` - Number of results to skip (default: 0)
- `--cwd <path>` - Working directory

**Examples:**
```bash
# Show all components
vcgen search

# Search for table components
vcgen search table

# Search in specific category
vcgen search --category Form

# Paginated search
vcgen search table --limit 10 --offset 10
```

---

### `vcgen view`

View detailed information about one or more components.

**Usage:**
```bash
vcgen view <components...> [options]
```

**Arguments:**
- `components...` - One or more component names

**Options:**
- `--cwd <path>` - Working directory

**Examples:**
```bash
# View single component
vcgen view VcTable

# View multiple components
vcgen view VcTable VcField VcInput

# View with full details
vcgen view VcBlade
```

**Output includes:**
- Component description
- Category
- Import statement
- Props with types
- Events
- Slots
- Dependencies
- Code examples
- Links to demo files

---

### `vcgen plan`

Generate UI-Plan JSON from natural language prompt.

**Usage:**
```bash
vcgen plan [options]
```

**Options:**
- `--from-prompt <text>` - Natural language prompt
- `--output <path>` - Output path (default: ./__ai/ui-plan.json)

**Examples:**
```bash
vcgen plan --from-prompt "Create vendor management with list and details"
vcgen plan --from-prompt "Product catalog with search and filters" --output ./my-plan.json
```

---

### `vcgen validate`

Validate UI-Plan JSON without generating code.

**Usage:**
```bash
vcgen validate --plan <path>
```

**Options:**
- `--plan <path>` - Path to UI-Plan JSON file (required)

**Examples:**
```bash
vcgen validate --plan ./__ai/ui-plan.json
```

---

### `vcgen generate`

Generate code from UI-Plan JSON.

**Usage:**
```bash
vcgen generate --plan <path> [options]
```

**Options:**
- `--plan <path>` - Path to UI-Plan JSON file (required)
- `--dry-run` - Show diff without writing files
- `--fix` - Run ESLint/Prettier after generation
- `--story` - Generate Storybook stories
- `--test` - Generate unit/e2e tests
- `--cwd <path>` - Working directory

**Examples:**
```bash
# Basic generation
vcgen generate --plan ./__ai/ui-plan.json

# Dry run (preview changes)
vcgen generate --plan ./__ai/ui-plan.json --dry-run

# Generate with linting and stories
vcgen generate --plan ./__ai/ui-plan.json --fix --story

# Generate everything
vcgen generate --plan ./__ai/ui-plan.json --fix --story --test
```

---

## Workflow Examples

### Quick Start Workflow

1. **Initialize MCP:**
   ```bash
   npx @vc-shell/ai-codegen@latest init-mcp
   ```

2. **Restart your IDE and use AI prompts:**
   - "Create vendor management with list and details"
   - "Add product catalog module"

### Manual Workflow

1. **Search for components:**
   ```bash
   vcgen search table
   vcgen view VcTable
   ```

2. **Create UI-Plan:**
   ```bash
   vcgen plan --from-prompt "Order management module"
   ```

3. **Validate the plan:**
   ```bash
   vcgen validate --plan ./__ai/ui-plan.json
   ```

4. **Generate code:**
   ```bash
   vcgen generate --plan ./__ai/ui-plan.json --fix
   ```

---

## Tips

1. **Use fuzzy search** - `vcgen search tbl` will find VcTable
2. **View before using** - Always check component details before adding to your plan
3. **Validate early** - Validate your UI-Plan before generating code
4. **Use --dry-run** - Preview changes before applying them
5. **Explore demos** - Check component demo files for usage examples

---

## Getting Help

```bash
# General help
vcgen --help

# Command-specific help
vcgen search --help
vcgen view --help
vcgen generate --help
```

---

## See Also

- [README](../README.md) - Project overview
- [Quick Start](./QUICKSTART.md) - Getting started guide
- [MCP Setup](./MCP_SETUP.md) - MCP configuration details
- [Component Registry](../src/schemas/component-registry.json) - All available components

