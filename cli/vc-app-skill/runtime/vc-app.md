---
name: vc-app
description: Generate vc-shell applications — scaffold projects, connect to platform APIs, generate UI modules with list/details blades
---

# /vc-app — VirtoCommerce Shell Application Skill

You are an expert vc-shell developer. This skill helps users scaffold projects, connect to platform APIs, and generate complete UI modules with list/details blades.

When this skill is invoked, `$ARGUMENTS` contains everything after `/vc-app`.

---

## Step 0: Resolve Paths

Before doing anything else, resolve these paths and store them for all subsequent operations.

### Skill directory

Resolve `SKILL_DIR` using this priority order:

1. **npm global install:** If this file was loaded from `~/.claude/vc-app-skill/`, set `SKILL_DIR` to that directory.
2. **npm local install:** If `node_modules/@vc-shell/vc-app-skill/runtime/` exists relative to the project root, set `SKILL_DIR` to that path.
3. **Fallback:** Set `SKILL_DIR` to the directory containing this file (works in dev/monorepo mode where this file lives at `cli/vc-app-skill/runtime/`).

### Knowledge base

```
KNOWLEDGE_BASE = {SKILL_DIR}/knowledge
```

### Framework docs (3-step fallback)

Resolve `DOCS_ROOT` using this priority:

1. **Installed framework docs:** Glob for `node_modules/@vc-shell/framework/**/*.docs.md` from the project root. If any matches found, set `DOCS_ROOT` to the `node_modules/@vc-shell/framework` directory.
2. **Env var or config:** Check for `VC_SHELL_FRAMEWORK_PATH` environment variable, or read `.vc-app.json` in the project root for a `frameworkPath` key. If found, set `DOCS_ROOT` to that path.
3. **Built-in fallback:** Set `DOCS_ROOT` to `{SKILL_DIR}/knowledge/docs/`.

Store `DOCS_ROOT` for passing to subagents.

---

## Step 1: Command Routing

Parse `$ARGUMENTS` to determine the subcommand:

| Arguments pattern | Route to |
|---|---|
| `create ...` | Section: `/vc-app create` |
| `connect ...` | Section: `/vc-app connect` |
| `add-module <name>` | Section: `/vc-app add-module` |
| `generate ...` | Section: `/vc-app generate` |
| empty / `help` / `--help` | Section: Help |

If no arguments match, show the help section.

---

## Help

Display this to the user:

```
/vc-app — VirtoCommerce Shell Application Generator

Commands:
  /vc-app create              Scaffold a new vc-shell project (standalone, dynamic-module, or host-app)
  /vc-app connect             Connect to a VirtoCommerce platform and generate API clients
  /vc-app add-module <name>   Add an empty module skeleton to the current project
  /vc-app generate            Generate a full UI module from intent (list/details blades, composables, locales)

Examples:
  /vc-app create
  /vc-app connect
  /vc-app add-module orders
  /vc-app generate
```

Stop after displaying help. Do not proceed to any other section.

---

## `/vc-app create`

Collect project parameters through dialog, then run CLI in **non-interactive mode** (all flags passed at once).

### Dialog

1. **Ask the user:** What is the project name? (kebab-case, e.g., `my-vendor-app`)
2. **Ask the user:** What project type?
   - `standalone` — Self-contained app with its own auth and routing
   - `dynamic-module` — Loadable module plugin for a host app
   - `host-app` — Shell host that loads dynamic modules
3. **Ask the user:** Initial module name? (suggest: project name in TitleCase, e.g., `my-vendor-app` → `MyVendorApp`)
4. **Ask the user:** Which options do you want? (multi-select, all optional)
   - `--dashboard` — Include a dashboard page
   - `--tenant-routes` — Include tenant-aware routing
   - `--ai-agent` — Include AI agent integration scaffold
   - `--mocks` — Include mock API data for development

### Execution

**IMPORTANT:** Always use non-interactive mode — pass ALL flags to skip CLI prompts:

```bash
npx @vc-shell/create-vc-app <projectName> \
  --type <projectType> \
  --module-name "<moduleName>" \
  [--dashboard] [--tenant-routes] [--ai-agent] [--mocks]
```

Available CLI flags (see `cli/create-vc-app/README.md` for full list):
| Flag | Description |
|------|-------------|
| `--type <type>` | `standalone` \| `dynamic-module` \| `host-app` |
| `--name`, `--app-name` | Application display name |
| `--package-name` | npm package name |
| `--module-name` | Initial module name |
| `--base-path` | Base path (default: `/apps/<name>/`) |
| `--dashboard` | Include Dashboard |
| `--tenant-routes` | Include tenant routing |
| `--ai-agent` | Include AI Agent config |
| `--mocks` | Include sample module with mock data |
| `--overwrite` | Overwrite existing files |

If the command fails, show the stderr output and suggest the user check that `@vc-shell/create-vc-app` is installed or accessible via npx.

### Next step

After successful creation, tell the user:

```
Project created successfully! Next steps:
  cd <projectName>
  yarn install
  /vc-app connect    — to connect to your VirtoCommerce platform and generate API clients
```

---

## `/vc-app connect`

Interactive platform connection dialog. This configures environment variables and generates TypeScript API clients from the platform's Swagger endpoints.

### Dialog

1. **Ask the user:** What is the platform URL? (e.g., `https://admin.example.com` or `https://localhost:5001`)
2. **Ask the user:** Which platform modules do you need API clients for? (comma-separated, e.g., `VirtoCommerce.Orders,VirtoCommerce.Catalog,VirtoCommerce.MarketplaceVendor`)

### Execution

#### Step 1: Write `.env`

Write or update the `.env` file in the project root with these values:

```env
APP_PLATFORM_MODULES=<comma-separated module list>
APP_API_CLIENT_DIRECTORY=./src/api_client
APP_TYPE_STYLE=Class
```

Do NOT put the platform URL in `.env` — it goes in `.env.local` to avoid committing credentials.

#### Step 2: Write `.env.local`

Write or update `.env.local` in the project root:

```env
APP_PLATFORM_URL=<platform URL>
```

If `.env.local` already exists, read it first and only update/add the `APP_PLATFORM_URL` line.

#### Step 3: Generate API clients

Check if the project's `package.json` has a `generate-api-client` script:

```bash
cat package.json | grep -q "generate-api-client"
```

If yes, run:
```bash
yarn generate-api-client
```

If no, run:
```bash
npx @vc-shell/api-client-generator
```

If the command fails, show stderr and suggest:
- Check that the platform URL is reachable
- Check that the module names are correct
- Try running with `--verbose` for more details

#### Step 4: Verify types

Run type checking to ensure the generated clients compile:

```bash
npx vue-tsc --noEmit
```

If `vue-tsc` is not available, fall back to:
```bash
npx tsc --noEmit
```

If type checking fails, dispatch the `type-checker` agent (see Subagent Dispatch section) with the generated files in `src/api_client/`.

#### Step 5: Print summary

List all generated API client files:

```bash
find src/api_client -name "*.ts" -type f
```

Display the list and tell the user:

```
API clients generated successfully!

Generated files:
  src/api_client/virtocommerce.orders.ts
  src/api_client/virtocommerce.catalog.ts
  ...

Next step:
  /vc-app generate    — to generate UI modules from these API clients
```

---

## `/vc-app add-module`

Add an empty module skeleton to the current project.

### Parse arguments

Extract the module name from `$ARGUMENTS`. The format is `add-module <name>`.

If no name is provided, ask the user for the module name (kebab-case).

### Execution

Run:

```bash
npx @vc-shell/create-vc-app add-module <moduleName>
```

If the command fails, show stderr and suggest manual creation following the module structure pattern.

### Summary

After success, display the created file structure:

```
Module "<moduleName>" created:
  src/modules/<moduleName>/
    index.ts
    pages/
    composables/
    locales/

Next step:
  /vc-app generate    — to generate blades and composables for this module
```

---

## `/vc-app generate`

Full intent-driven module generation. This is the main power feature — it walks the user through 4 phases to generate a complete module with blades, composables, locales, and type-checked code.

### Phase 1: Intent (Interactive Dialog)

1. **Ask the user:** What should this module do? (free-form description, e.g., "manage team members with a searchable list and edit form")

2. **Ask the user:** What should the module be named? Suggest a kebab-case name derived from their description (e.g., if they said "manage team members", suggest `team`). Let them override.

3. **Ask the user:** What blade types do you need?
   - `list+details` — A list blade with a details blade (most common)
   - `list-only` — Just a searchable/paginated list
   - `details-only` — Just a form/details blade (e.g., settings page)

4. **Ask the user:** Menu entry configuration:
   - Should this be a workspace blade (top-level navigation)? (default: yes for list, no for standalone details)
   - Icon? (suggest a lucide icon based on their description, e.g., `lucide-users` for team, `lucide-package` for orders)
   - Menu priority? (default: 100)

Store all collected values:
```
INTENT = {
  description: string,
  moduleName: string,        // kebab-case
  bladeTypes: "list+details" | "list-only" | "details-only",
  menuConfig: {
    title: "<I18N_PREFIX>.MENU.TITLE",
    icon: string,
    priority: number
  },
  isWorkspace: boolean
}
```

Where `I18N_PREFIX` = SCREAMING_SNAKE_CASE of `moduleName` (e.g., `team` → `TEAM`, `catalog-items` → `CATALOG_ITEMS`).

### Phase 2: Data Source (Interactive Dialog)

1. **Ask the user:** Should this module use an API client to fetch data? (If they just want a static/mock module, skip to Phase 3 with empty data source.)

2. **If yes — discover API entities:**

   Determine the API client directory. Check in order:
   - `src/api_client/` relative to project root
   - The value of `APP_API_CLIENT_DIRECTORY` from `.env`

   Dispatch the `api-analyzer` agent to discover available entities:

   > Use the **Agent tool** with this prompt:
   >
   > Read the file `{SKILL_DIR}/agents/api-analyzer.md` for your full instructions.
   >
   > Execute with these parameters:
   > ```json
   > {
   >   "apiClientDir": "<resolved api_client directory absolute path>",
   >   "entityHint": "<first word of INTENT.description that looks like an entity name, or empty>"
   > }
   > ```
   >
   > Return the structured JSON result.

3. **Present discovered entities to the user.** Show a numbered list:
   ```
   Discovered API entities:
     1. SellerUser (VcmpSellerSecurityClient) — search, get, create, update, delete
     2. TeamMember (VcmpSellerSecurityClient) — search, get, update
     ...
   Select an entity (number):
   ```

4. **Ask the user:** Which entity to use? (number from list)

5. **Read the entity's type file** to discover available fields. Use Grep to find the entity class definition and extract its properties. Present them to the user:
   ```
   Fields on SellerUser:
     1. id (string)
     2. userName (string)
     3. email (string)
     4. isActive (boolean)
     5. createdDate (Date)
     6. roles (array)
     ...
   ```

6. **If list blade requested — ask:** Which fields should appear as table columns? (comma-separated numbers, e.g., `2,3,5`)
   For each selected column, ask if it should be sortable (default: yes for string/date, no for boolean/array).

7. **If details blade requested — ask:** Which fields should appear in the form? (comma-separated numbers, e.g., `2,3,4`)
   For each selected field, ask if it's required (default: yes for string fields, no for boolean).

8. **Ask the user:** Which CRUD operations are needed?
   - Show only operations that exist on the selected entity's client
   - Default: all available operations checked
   ```
   Available CRUD methods:
     [x] search (searchSellerUsers)
     [x] get (getSellerUser)
     [x] create (createSellerUser)
     [x] update (updateSellerUser)
     [x] delete (deleteSellerUsers)
   Uncheck any you don't need (comma-separated numbers to toggle, or Enter to accept all):
   ```

Store all collected values:
```
DATA_SOURCE = {
  clientClass: string,
  clientFile: string,         // import path
  entityName: string,         // PascalCase
  entityTypePath: string,     // relative import path from module to api_client
  searchMethod: string | null,
  getMethod: string | null,
  createMethod: string | null,
  updateMethod: string | null,
  deleteMethod: string | null,
  columns: [ { name, title, type?, sortable? } ],
  fields: [ { name, type, required?, label? } ]
}
```

### Phase 3: Generation (Dispatch Subagents)

Determine the target directory for the module:
```
TARGET_DIR = <project root>/src/modules/{INTENT.moduleName}
```

Create the directory if it doesn't exist:
```bash
mkdir -p {TARGET_DIR}/pages {TARGET_DIR}/composables {TARGET_DIR}/locales
```

Track all generated files in a list: `GENERATED_FILES = []`.

#### 3a: Generate list blade (if `bladeTypes` includes "list")

Dispatch the `list-blade-generator` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/list-blade-generator.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "moduleName": "{INTENT.moduleName}",
>   "entityName": "{DATA_SOURCE.entityName}",
>   "entityTypePath": "{DATA_SOURCE.entityTypePath}",
>   "clientClass": "{DATA_SOURCE.clientClass}",
>   "searchMethod": "{DATA_SOURCE.searchMethod}",
>   "columns": {DATA_SOURCE.columns},
>   "menuConfig": {INTENT.menuConfig},
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}",
>   "targetDir": "{TARGET_DIR}"
> }
> ```

Collect the generated file paths and add them to `GENERATED_FILES`.

#### 3b: Generate details blade (if `bladeTypes` includes "details")

Dispatch the `details-blade-generator` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/details-blade-generator.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "moduleName": "{INTENT.moduleName}",
>   "entityName": "{DATA_SOURCE.entityName}",
>   "entityTypePath": "{DATA_SOURCE.entityTypePath}",
>   "clientClass": "{DATA_SOURCE.clientClass}",
>   "crudMethods": {
>     "get": "{DATA_SOURCE.getMethod}",
>     "create": "{DATA_SOURCE.createMethod}",
>     "update": "{DATA_SOURCE.updateMethod}",
>     "delete": "{DATA_SOURCE.deleteMethod}"
>   },
>   "fields": {DATA_SOURCE.fields},
>   "isStandalone": {true if bladeTypes is "details-only" AND isWorkspace},
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}",
>   "targetDir": "{TARGET_DIR}"
> }
> ```

Collect the generated file paths and add them to `GENERATED_FILES`.

**Important:** If both list and details blades are requested, dispatch 3a and 3b **in parallel** (two Agent tool calls in the same message). They write to different files and have no dependencies on each other.

#### 3c: Generate locales

After blade generators complete (wait for both if parallel), dispatch the `locales-generator` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/locales-generator.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "moduleName": "{INTENT.moduleName}",
>   "generatedFiles": {GENERATED_FILES},
>   "targetDir": "{TARGET_DIR}"
> }
> ```

Add the locale files to `GENERATED_FILES`.

#### 3d: Assemble module

After locales are generated, dispatch the `module-assembler` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/module-assembler.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "moduleName": "{INTENT.moduleName}",
>   "generatedFiles": {GENERATED_FILES},
>   "appModulesRegistryPath": "<project root>/src/modules/index.ts"
> }
> ```

Add any new files to `GENERATED_FILES`.

### Phase 4: Verification

After all generation is complete, dispatch the `type-checker` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/type-checker.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "projectRoot": "<project root absolute path>",
>   "generatedFiles": {GENERATED_FILES}
> }
> ```

#### Present results

If type-checker returns **PASS**:

```
Module "{INTENT.moduleName}" generated successfully!

Files created:
  {list all GENERATED_FILES with relative paths}

The module has been registered in src/modules/index.ts.
Type checking passed with no errors.

To test:
  yarn serve    (or: yarn dev)
```

If type-checker returns **FAIL**:

```
Module "{INTENT.moduleName}" generated with type errors.

Files created:
  {list all GENERATED_FILES}

Remaining type errors:
  {list errors from type-checker report}

You may need to manually fix these errors, or run /vc-app generate again after adjusting your API clients.
```

---

## Error Handling

Apply these rules throughout all sections:

### CLI command fails
If any `npx` or `yarn` command exits with non-zero status:
- Show the stderr/stdout output to the user
- Suggest a manual fix or alternative command
- Do NOT proceed to subsequent steps that depend on the failed step

### `vue-tsc` / `tsc` fails during connect
If type checking fails after API client generation:
- Dispatch the `type-checker` agent with the generated files in `src/api_client/`
- Show the type-checker's report to the user

### User cancels mid-dialog
If the user indicates they want to cancel (says "cancel", "stop", "nevermind", etc.) at any dialog step:
- Stop immediately
- Do NOT write any partial files
- Confirm cancellation: "Generation cancelled. No files were created."

### Agent returns error
If any subagent reports an error or fails to complete:
- Show the error details to the user
- Suggest retrying: "You can retry with `/vc-app generate` — your previous answers will need to be re-entered."
- Do NOT proceed to subsequent phases that depend on the failed agent

### Missing API client directory
If `src/api_client/` does not exist and the user wants API-backed generation:
- Suggest running `/vc-app connect` first
- Do NOT proceed with generation

---

## Subagent Dispatch Reference

All agents live at `{SKILL_DIR}/agents/`. Each agent file contains its own Input Contract, Knowledge Loading, Generation Rules, Output Contract, and Self-Check.

| Agent | File | Purpose | Writes files? |
|---|---|---|---|
| api-analyzer | `agents/api-analyzer.md` | Discovers entities/methods in API client files | No (returns JSON) |
| list-blade-generator | `agents/list-blade-generator.md` | Generates list blade + plural composable | Yes |
| details-blade-generator | `agents/details-blade-generator.md` | Generates details blade + singular composable | Yes |
| locales-generator | `agents/locales-generator.md` | Scans generated files for i18n keys, writes en.json | Yes |
| module-assembler | `agents/module-assembler.md` | Creates barrel files, registers module | Yes |
| type-checker | `agents/type-checker.md` | Runs vue-tsc, fixes type errors iteratively | Yes (fixes only) |

### How to dispatch an agent

Use the **Agent tool** with a prompt structured as:

```
Read the file {SKILL_DIR}/agents/<agent-name>.md for your full instructions.

Execute with these parameters:
<JSON parameters matching the agent's Input Contract>

Additional context:
- KNOWLEDGE_BASE = {KNOWLEDGE_BASE}
- DOCS_ROOT = {DOCS_ROOT}
- Project root = {PROJECT_ROOT}
```

The agent will read its own instruction file, load any required knowledge/pattern files, execute its generation rules, perform its self-check, and report back.
