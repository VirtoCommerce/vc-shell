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
| `promote <moduleName>` | Section: `/vc-app promote` |
| `design ...`              | Section: `/vc-app design` |
| `migrate`                | Section: `/vc-app migrate` |
| empty / `help` / `--help` | Section: Help |

If no arguments match, show the help section.

---

## Help

Display this to the user:

```
/vc-app — VirtoCommerce Shell Application Generator

Commands:
  /vc-app create              Scaffold a new vc-shell standalone project
  /vc-app connect             Connect to a VirtoCommerce platform and generate API clients
  /vc-app add-module <name>   Add an empty module skeleton to the current project
  /vc-app generate            Generate a full UI module from intent (list/details blades, composables, locales)
  /vc-app promote <name>      Transition a prototype module from mock data to real API client
  /vc-app design [prompt]    Generate a full application from a free-text description (multi-module)
  /vc-app migrate             Migrate existing app to latest @vc-shell/framework (CLI + AI)

Examples:
  /vc-app create
  /vc-app connect
  /vc-app add-module orders
  /vc-app generate
  /vc-app promote team
  /vc-app design "Build a tenant management system with subscriptions and agent catalog"
  /vc-app design --from requirements.md
```

Stop after displaying help. Do not proceed to any other section.

---

## `/vc-app create`

Collect project parameters through dialog, then run CLI in **non-interactive mode** (all flags passed at once).

### Dialog

1. **Ask the user:** What is the project name? (kebab-case, e.g., `my-vendor-app`)
2. **Ask the user:** Which options do you want? (multi-select, all optional)
   - `--dashboard` — Include a dashboard page
   - `--tenant-routes` — Include tenant-aware routing
   - `--ai-agent` — Include AI agent integration scaffold
   - `--mocks` — Include sample modules with mock data (demo content to explore the framework)

### Execution

**IMPORTANT:** Always use non-interactive mode — pass ALL flags to skip CLI prompts:

```bash
npx @vc-shell/create-vc-app@alpha <projectName> \
  --type standalone \
  [--dashboard] [--tenant-routes] [--ai-agent] [--mocks]
```

**IMPORTANT:** Do NOT pass `--module-name` — the starter module is opt-in and unnecessary because this skill generates custom modules via `/vc-app generate`.

Available CLI flags (see `cli/create-vc-app/README.md` for full list):
| Flag | Description |
|------|-------------|
| `--type` | Always `standalone` |
| `--name`, `--app-name` | Application display name |
| `--package-name` | npm package name |
| `--base-path` | Base path (default: `/apps/<name>/`) |
| `--dashboard` | Include Dashboard |
| `--tenant-routes` | Include tenant routing |
| `--ai-agent` | Include AI Agent config |
| `--mocks` | Include sample modules with mock data (demo content) |
| `--overwrite` | Overwrite existing files |

If the command fails, show the stderr output and suggest the user check that `@vc-shell/create-vc-app` is installed or accessible via npx.

### Post-scaffold: install dependencies

After successful creation, `cd` into the new project directory and run:

```bash
yarn install
```

Wait for installation to complete. This is required — without installed dependencies, type-checking and code generation will fail.

If `yarn install` fails, show the error and suggest the user fix it manually before proceeding.

### Next step

After dependencies are installed, tell the user:

```
Project created successfully! Dependencies installed.
  /vc-app connect    — to connect to your VirtoCommerce platform and generate API clients
  /vc-app generate   — to generate UI modules (with mock data if no API connected)
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
npx @vc-shell/create-vc-app@alpha add-module <moduleName>
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

### Enhance Mode Detection

After collecting `INTENT.moduleName`, check if `src/modules/<moduleName>/` already exists.

- If it **exists** → switch to the **Enhance Flow** (see section below, after Phase 4).
- If it **does not exist** → continue with the **Create Flow** (Phase 2 onwards).

### Phase 2: Data Source (Interactive Dialog)

**Auto-detect no-API mode:** Before asking, check whether an API client directory exists:
- Check `src/api_client/` relative to project root
- Check the value of `APP_API_CLIENT_DIRECTORY` from `.env`

If neither exists and `APP_API_CLIENT_DIRECTORY` is not set, skip the "Should this module use an API client?" question — go directly to mock mode (Phase 3 with empty data source). Show a note to the user:
```
No API client found — generating with mock data.
```

If an API client directory does exist, proceed with the interactive dialog:

1. **Ask the user:** Should this module use an API client to fetch data? (If they just want a static/mock module, skip to Phase 3 with empty data source.)

2. **If yes — discover API entities:**

   Determine the API client directory (already resolved above).

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

#### 3e: Write prototype metadata (mock mode only)

When generating without API (DATA_SOURCE is empty), after all subagents complete:

1. Collect `GENERATED_FILES` from all agent reports.

2. Write `.vc-app-prototype.json` to `{TARGET_DIR}/` with this structure:

```json
{
  "version": 1,
  "generatedAt": "<ISO 8601 timestamp>",
  "intent": {
    "moduleName": "<INTENT.moduleName>",
    "bladeTypes": "<INTENT.bladeTypes>",
    "description": "<INTENT.description>",
    "menuConfig": {
      "title": "<INTENT.menuConfig.title>",
      "icon": "<INTENT.menuConfig.icon>",
      "priority": "<INTENT.menuConfig.priority>"
    }
  },
  "mockFields": {
    "columns": [
      { "name": "<colName>", "type": "<colType>", "sortable": <bool> }
    ],
    "formFields": [
      { "name": "<fieldName>", "type": "<fieldType>", "required": <bool> }
    ]
  },
  "generatedFiles": [
    "<relative path from TARGET_DIR, excluding locale files>"
  ]
}
```

Populate `mockFields.columns` from the column definitions used to dispatch the list blade generator, and `mockFields.formFields` from the field definitions used for the details blade generator. `generatedFiles` should contain relative paths (from `TARGET_DIR`) of all generated files, excluding locale files (`locales/*.json`).

3. Add `.vc-app-prototype.json` to `GENERATED_FILES`.

4. Append to the Phase 4 summary output:
```
Module generated with mock data.
When your API is ready, run: /vc-app connect && /vc-app promote <moduleName>
```

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

### Enhance Flow (module exists)

When the module directory already exists, generate switches to enhance mode — surgical modifications to existing code.

#### Phase E1: Module Analysis

Dispatch `module-analyzer` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/module-analyzer.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "targetDir": "<absolute path to module directory>"
> }
> ```

Store the result as `MODULE_ANALYSIS`.

Present the module summary to the user:
```
Module "<moduleName>" analysis:
  Blades: <list blade names and types>
  Composables: <list composable names>
  API connected: yes/no
  Locale keys: <count>
```

Ask: **"What would you like to change? (describe in free text)"**

#### Phase E2: Intent Parsing

Parse the user's free-text description into an action plan. Map to action types:
- Mentions of "column", "add to list/table" → `add-column`
- Mentions of "field", "input", "form" → `add-field`
- Mentions of "logic", "validation", "computed", "watcher" → `add-logic`
- Mentions of "toolbar", "button", "action", "export" → `add-toolbar-action`
- Mentions of "link", "navigate", "open blade", "connect" → `link-blades`
- Mentions of "new blade", "new list", "new details" → new blade creation (uses existing generators)

Present the parsed action plan to the user for confirmation:
```
Proposed changes:
  1. [add-column] Add "email" column to team-list after "name"
  2. [add-field] Add "email" input field to team-details after "name"
  3. [add-toolbar-action] Add "Export CSV" button to team-list toolbar

Confirm? (y to proceed, or describe corrections)
```

#### Phase E3: Data Source (conditional)

- If action plan includes **new blades with a different API entity** → run full Phase 2 data source discovery for the new entity
- If adding fields from the **existing entity** → skip, fields come from existing API types (use `MODULE_ANALYSIS.composables` to find the entity)
- If adding **logic/toolbar only** → skip

#### Phase E4: Execution

For each action in the confirmed plan:

**New blades** → dispatch `list-blade-generator` or `details-blade-generator` with `existingModule` context:
- `existingModule.blades` = blade names from `MODULE_ANALYSIS.blades`
- `existingModule.localePrefix` = derive from existing locale keys
- `existingModule.indexPath` = path to module's `index.ts`
- If linking to existing blade, pass `linkTo` with trigger type

Then dispatch `module-assembler` with `mode: "append"`.

**Modifications to existing files** → dispatch `blade-enhancer`:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/blade-enhancer.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "targetDir": "<absolute path to module>",
>   "moduleAnalysis": <MODULE_ANALYSIS>,
>   "actions": <confirmed action plan>,
>   "dataSource": <DATA_SOURCE if applicable>,
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}"
> }
> ```

Handle agent status:
- `DONE` → proceed to Phase E5
- `DONE_WITH_CONCERNS` → show concerns to user, proceed to Phase E5
- `BLOCKED` → show error, stop

#### Phase E5: Verify

Dispatch `type-checker` agent to verify TypeScript compiles.

Present summary of all changes:
```
Module "<moduleName>" enhanced:

  Modified files:
    <list of files with change description>

  New files (if any):
    <list of new files>

  ⚠ <any concerns from blade-enhancer>
  ✓/✗ TypeScript: <status>
```

---

## `/vc-app promote`

Transition a prototype module from mock data to a real API client. This command replaces mock composables, updates blade templates, and rewires locales to use actual API entities — preserving all UI structure and layout decisions from the prototype.

### Phase 1: Validation

1. **Parse arguments.** Extract the module name from `$ARGUMENTS`. Format: `promote <moduleName>`. If no name provided, ask the user.

2. **Read prototype metadata.** Look for `.vc-app-prototype.json` in `src/modules/<moduleName>/`:
   ```bash
   cat src/modules/<moduleName>/.vc-app-prototype.json
   ```
   If the file does not exist, stop with an error:
   ```
   Error: Module '<moduleName>' is not a prototype. Only modules generated without an API client can be promoted.
   Run /vc-app generate with an API client to create a production module directly.
   ```

3. **Validate generated files.** Check that all paths listed in `generatedFiles` still exist. If any are missing (renamed or moved), warn the user and ask them to confirm continuation or provide updated paths.

4. **Locate API client directory:**
   - Check `src/api_client/` relative to project root
   - Check the value of `APP_API_CLIENT_DIRECTORY` from `.env`
   - If neither exists, stop with an error:
     ```
     Error: No API client found. Run /vc-app connect first to generate API clients.
     ```

Store:
```
MODULE_DIR = <project root>/src/modules/<moduleName>
PROTOTYPE = <parsed .vc-app-prototype.json>
API_CLIENT_DIR = <resolved api_client directory>
```

### Phase 2: Data Source Discovery

Follow the same interactive dialog flow as `/vc-app generate` Phase 2 — dispatch the `api-analyzer` agent, present entities to the user, let them select an entity, discover fields, select columns/form fields, and choose CRUD methods.

Key differences from generate:
- Only collect **columns** if `PROTOTYPE.intent.bladeTypes` includes `"list"`.
- Only collect **form fields** if `PROTOTYPE.intent.bladeTypes` includes `"details"`.

Output: `DATA_SOURCE` object (same structure as `/vc-app generate` Phase 2).

### Phase 3: Field Mapping

Map prototype mock fields to real API entity fields.

1. **Auto-match fields.** For each mock field in `PROTOTYPE.mockFields` (both `columns` and `formFields`), attempt matching against `DATA_SOURCE` fields using this priority:
   - **Exact name match** (case-insensitive): mock field `name` === API field `name`
   - **Semantic similarity** (LLM judgment): e.g., mock `fullName` ≈ API `displayName`
   - **Unmatched**: no reasonable API counterpart found

2. **Present mapping table** to the user for confirmation:
   ```
   Field Mapping (mock → API):
     name        → displayName    (semantic match)
     email       → email          (exact match)
     isActive    → isActive       (exact match)
     priority    → ???            (no match)
     score       → ???            (no match)
     fullName    → ???            (no match)

   Confirm mapping? [Y]es / [E]dit
   ```

3. **For unmatched fields**, ask the user to choose an action for each:
   - **[D]elete** — Remove from the module entirely
   - **[K]eep as stub** — Keep the field with a `// TODO: wire to real data` comment
   - **[M]ap manually** — User specifies which API field to map to
   - **[C]omputed** — Field is derived from other fields (user provides a note)

4. **Store the result** as `FIELD_MAP`:
   ```json
   {
     "name": { "action": "map", "apiField": "displayName", "apiType": "string" },
     "email": { "action": "map", "apiField": "email", "apiType": "string" },
     "isActive": { "action": "map", "apiField": "isActive", "apiType": "boolean" },
     "priority": { "action": "delete" },
     "score": { "action": "keep-stub" },
     "fullName": { "action": "computed", "note": "derived from firstName + lastName" }
   }
   ```

### Phase 4: Code Transformation

Dispatch the `promote-agent` to rewrite module files:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/promote-agent.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "targetDir": "<absolute path to module directory>",
>   "prototypeMetadata": <.vc-app-prototype.json contents>,
>   "dataSource": <DATA_SOURCE>,
>   "fieldMap": <FIELD_MAP>,
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}"
> }
> ```

Handle agent status:
- **DONE** — Proceed to Phase 5.
- **DONE_WITH_CONCERNS** — Show concerns to the user, then proceed to Phase 5.
- **BLOCKED** — Show the error to the user. Do NOT proceed. Suggest fixing the issue and re-running `/vc-app promote <moduleName>`.

### Phase 5: Cleanup & Verification

1. **Type-check.** Dispatch the `type-checker` agent:

   > Use the **Agent tool** with this prompt:
   >
   > Read the file `{SKILL_DIR}/agents/type-checker.md` for your full instructions.
   >
   > Execute with these parameters:
   > ```json
   > {
   >   "projectRoot": "<project root absolute path>",
   >   "generatedFiles": <list of files modified by promote-agent>
   > }
   > ```

2. **If type-check passes** — delete the prototype marker and show success:

   ```bash
   rm src/modules/<moduleName>/.vc-app-prototype.json
   ```

   ```
   Module "<moduleName>" promoted successfully!

   Files modified:
     {list all files modified by promote-agent}

   Field warnings:
     {list any keep-stub fields with TODO comments}
     {list any computed fields that need manual implementation}

   TypeScript: PASS — no errors.

   To test:
     yarn serve    (or: yarn dev)
   ```

3. **If type-check fails** — keep the marker file and show errors:

   ```
   Module "<moduleName>" promoted with type errors.

   Files modified:
     {list all files modified by promote-agent}

   Type errors:
     {list errors from type-checker report}

   `.vc-app-prototype.json` kept — run /vc-app promote <moduleName> again after fixing errors.
   ```

---

## `/vc-app design`

Generate a full vc-shell application from a free-text prompt. This command parses a description into a multi-module plan, shows it for confirmation, then orchestrates existing generators to build everything.

### Phase 1: Prompt Acquisition

Parse `$ARGUMENTS` (everything after `design`):

1. **If text after `design`** (not starting with `--`) → use as the prompt directly.
2. **If `--from <path>`** → read the file at `<path>` relative to project root. Use its contents as the prompt. If file doesn't exist, show error and stop.
3. **If empty** → ask the user: **"Describe the application you want to build:"**

Store the result as `DESIGN_PROMPT`.

#### Platform URL

After acquiring the prompt, ask the user for the platform address:

**Ask the user:** What is your VirtoCommerce platform URL? (e.g., `https://admin.example.com` or `https://localhost:5001`). You can skip this if you don't have a platform yet.

- **If the user provides a URL** → store as `PLATFORM_URL`
- **If the user skips** (says "skip", "no", "none", empty, "later", etc.) → set `PLATFORM_URL = null`

This URL is needed for:
- Writing `.env.local` with `APP_PLATFORM_URL` so the app can authenticate against the platform
- Enabling API client generation (via `/vc-app connect` flow) during or after design

If the prompt is very short (under 20 words) or too abstract (no concrete entities/data mentioned), ask for clarification:
```
Your description is quite abstract. To generate modules, I need to know what entities/data the app manages.

Could you describe:
- What objects does the app manage? (e.g., tenants, orders, products)
- What actions can users perform? (e.g., create, approve, export)
- How are the objects related? (e.g., tenant has subscriptions)
```

### Phase 2: Prompt Analysis

Parse `DESIGN_PROMPT` into a structured application plan. Apply these parsing rules:

**Entity extraction:**
- Nouns that represent manageable data objects → modules (e.g., "tenants", "subscriptions", "agents")
- Module names: always kebab-case english, derived from entity names, regardless of prompt language

**Field extraction:**
- Concrete field mentions ("subscription token key", "trial period", "email") → columns or formFields with inferred types
- Type inference — use the most specific type possible:

  | Signal in prompt | Field type | Component (details) | Column type (list) |
  |---|---|---|---|
  | date, deadline, birthday, created, expires | `date-time` | `VcDatePicker` | `date-ago` |
  | is*, has*, can*, enabled, active, published | `boolean` | `VcSwitch` | `status-icon` |
  | price, cost, amount, total, salary, budget, fee | `currency` | `VcInputCurrency` | `money` |
  | count, quantity, age, priority (numeric) | `number` | `VcInput type="number"` | `number` |
  | description, notes, comment, bio, summary | `text` | `VcTextarea` | — (not in list) |
  | body, content, html, article, template | `rich-text` | `VcEditor` | — (not in list) |
  | status, state, type, category (from fixed set) | `enum` | `VcSelect` or `VcRadioGroup` | `status` |
  | tags, labels, categories, roles, permissions | `multi-select` | `VcMultivalue` | — (not in list) |
  | avatar, logo, photo, thumbnail, banner | `image` | `VcImageUpload` | `image` |
  | photos, images, screenshots, gallery | `gallery` | `VcGallery` | — (not in list) |
  | file, attachment, document, contract | `file` | `VcFileUpload` | — (not in list) |
  | rating, score, stars | `rating` | `VcRating` | — (custom slot) |
  | color, colour, brandColor | `color` | `VcColorInput` | — (custom slot) |
  | discount, opacity, percentage, progress | `range` | `VcSlider` | — (custom slot) |
  | email | `string` | `VcInput` (rules="email") | plain text |
  | phone, tel | `string` | `VcInput` (type="tel") | plain text |
  | url, website, link | `string` | `VcInput` (type="url") | plain text |
  | everything else | `string` | `VcInput` | plain text |

- If a field clearly belongs to a list view (searchable, sortable characteristic) → column
- If a field clearly belongs to a form (editable, configurable) → formField
- If unclear → put in both columns and formFields

**Action extraction:**
- Concrete actions ("start trial", "upgrade plan", "approve") → toolbarActions with action name derived from the verb
- Navigation mentions ("from tenant to subscription", "drill into details") → connections

**Abstract requirement extraction:**
- Anything that cannot be mapped to a concrete field/action/connection → todos
- Quote the original text from the prompt
- Examples: "plan limits will be identified later", "integration with external billing TBD"

Produce the structured plan:

```json
DESIGN_PLAN = {
  "appName": "string — kebab-case, derived from the main concept in prompt",
  "platformUrl": "string | null — from PLATFORM_URL collected in Phase 1",
  "modules": [
    {
      "name": "string — kebab-case module name (english)",
      "description": "string — what this module does",
      "bladeTypes": "list+details | list-only | details-only",
      "readOnly": "boolean? — true if details blade is view-only (use VcField instead of VcInput). Default: false",
      "columns": [{ "name": "string", "type": "string", "sortable": true/false }],
      "formFields": [{ "name": "string", "type": "string (use specific types from type inference table above)", "required": true/false, "component": "string? — VcInput|VcTextarea|VcEditor|VcDatePicker|VcSelect|VcSwitch|VcCheckbox|VcRadioGroup|VcInputCurrency|VcMultivalue|VcRating|VcSlider|VcColorInput|VcImageUpload|VcGallery|VcFileUpload|VcField", "readOnly": "boolean? — true for display-only fields within editable form" }],
      "toolbarActions": [{ "label": "string", "action": "string (camelCase)" }],
      "widgets": "string[]? — names of related sub-entities for blade sidebar widgets (e.g., ['offers', 'videos'])",
      "dashboard": "boolean? — true to generate a DashboardWidgetCard for this module",
      "notifications": "string[]? — domain event names to generate notification templates for (e.g., ['OrderCreated'])",
      "todos": ["string — exact quote from prompt"]
    }
  ],
  "connections": [
    { "from": "string — source blade name", "to": "string — target blade name", "trigger": "row-action | toolbar | tab" }
  ],
  "needsScaffold": false
}
```

**Scaffold detection:** Check if the current directory is a vc-shell project:
- Look for `package.json` with `@vc-shell/framework` in dependencies or devDependencies
- If not found → set `needsScaffold: true`
- If found → set `needsScaffold: false`

**Blade type inference:**
- Entity with both list-worthy columns AND editable fields → `"list+details"`
- Entity that is mainly a collection/catalog with no edit form → `"list-only"`
- Entity that is a singleton/settings with no list → `"details-only"`
- Entity that is view-only (order details, transaction log, audit) → `"list+details"` but mark the details blade `readOnly: true`
- Default to `"list+details"` when unclear

**Details blade mode inference:**
- If the entity is view-only (order, transaction, audit log, payment) → set `readOnly: true` on the module — the details generator will use `VcField` for display instead of `VcInput`
- If the entity has mixed editable + read-only fields → default `readOnly: false`, individual fields marked as `readOnly` in `formFields`

**Feature inference (enrich modules based on prompt signals):**
- If entity mentions "related" sub-entities (e.g., "product has offers and videos") → add `widgets: ["sub-entity-name"]` — generates blade sidebar widgets with `useBladeWidgets()`
- If entity is a "primary" concept that would benefit from a dashboard summary → add `dashboard: true` — generates a `DashboardWidgetCard` with stats
- If entity mentions "notifications" or "events" or "alerts" → add `notifications: ["EventName"]` — generates notification template components

### Phase 3: Plan Presentation

Present the parsed plan to the user in this format:

```
Application Plan: {DESIGN_PLAN.appName}

Modules ({count}):
─────────────────────────────────────────
1. {name} ({bladeTypes}{, read-only if readOnly})
   Columns: {comma-separated column names with types, e.g. "name(string), status(enum), price(currency)"}
   Fields: {comma-separated "fieldName → Component", e.g. "name → VcInput, description → VcTextarea, price → VcInputCurrency"}
   Actions: {comma-separated action labels}
   {Widgets: sub-entity-1, sub-entity-2 — if widgets present}
   {Dashboard: yes — if dashboard present}
   {Notifications: EventName — if notifications present}
   TODO: "{todo text}"

2. {name} ({bladeTypes})
   ...

Connections:
  {from} → [{trigger}] → {to}

Platform: {DESIGN_PLAN.platformUrl or "not set (mock mode)"}
Scaffold: {yes if needsScaffold, otherwise no}

Confirm? (y to proceed, or describe corrections)
```

**Confirmation loop:**

Wait for the user's response:
- **"y" / "yes" / confirmation** → proceed to Phase 4
- **Free-text corrections** → re-parse the corrections, update `DESIGN_PLAN`, show the updated plan again. Examples of corrections the user might give:
  - "remove the agent-catalog module"
  - "add an email column to tenants"
  - "change subscriptions to details-only"
  - "the connection from tenants to subscriptions should be a tab, not toolbar"
- **No iteration limit** — keep looping until the user confirms or cancels

**Large plan warning:** If the plan has 10 or more modules, show a suggestion before the confirmation prompt:
```
This is a large application ({count} modules). Consider generating in batches:
  - Generate first {N} modules now, the rest later?
  - Or proceed with all {count}?
```

If the user chooses to split, truncate `DESIGN_PLAN.modules` to the first N and note the remainder for the user to generate later.

### Phase 4: API Detection

After the user confirms the plan:

1. Check if `src/api_client/` exists (or `APP_API_CLIENT_DIRECTORY` from `.env`)
2. **If API client exists** → dispatch `api-analyzer` agent for entity matching:

   > Use the **Agent tool** with this prompt:
   >
   > Read the file `{SKILL_DIR}/agents/api-analyzer.md` for your full instructions.
   >
   > Execute with these parameters:
   > ```json
   > {
   >   "apiClientDir": "<resolved api_client directory absolute path>",
   >   "entityHint": "<comma-separated module names from DESIGN_PLAN>"
   > }
   > ```
   >
   > Return the structured JSON result.

   For each module in `DESIGN_PLAN.modules`, attempt to match its `name` against discovered API entities:
   - Exact name match (case-insensitive)
   - Semantic match (e.g., module "tenants" ≈ entity "Tenant")
   - No match → module stays in mock mode

   Update the plan display with data source info:
   ```
   1. tenants (list+details) — Data: API (TenantEntity matched)
   2. subscriptions (details-only) — Data: API (SubscriptionEntity matched)
   3. agent-catalog (list+details) — Data: mock (no match)
   ```

   Show the updated plan to the user for final confirmation before execution.

3. **If no API client AND `DESIGN_PLAN.platformUrl` is set** → the user provided a platform URL but hasn't generated API clients yet. Ask:
   ```
   Platform URL is set ({DESIGN_PLAN.platformUrl}) but no API client found.
   Would you like to connect to the platform and generate API clients now? (y/n)
   - If yes: which platform modules? (comma-separated, e.g., VirtoCommerce.Orders,VirtoCommerce.Catalog)
   ```
   If the user says yes and provides module names → run the `/vc-app connect` execution steps (Steps 1-4 from the connect section) using `DESIGN_PLAN.platformUrl` and the provided module list. After connect completes, re-run API Detection (step 1-2 above) to match entities.

   If the user declines → proceed with mock mode for all modules.

4. **If no API client AND `DESIGN_PLAN.platformUrl` is null** → all modules use mock mode. Show:
   ```
   No API client found — all modules will use mock data.
   Run /vc-app connect when your API is ready, then /vc-app promote for each module.
   ```

### Phase 5: Execution

#### Step 1: Scaffold (if `needsScaffold: true`)

If `DESIGN_PLAN.needsScaffold` is true, run the `/vc-app create` flow:
- Use `DESIGN_PLAN.appName` as the project name
- Enable default options (no dashboard, no tenant-routes, no ai-agent, no mocks)
- After scaffold completes, `cd` into the new project directory
- Update project root for subsequent steps

If scaffold is not needed, skip to the `.env.local` step below.

#### Write `.env.local` with Platform URL

If `DESIGN_PLAN.platformUrl` is not null:

1. Write or update `.env.local` in the project root:
   ```env
   APP_PLATFORM_URL=<DESIGN_PLAN.platformUrl>
   ```
   If `.env.local` already exists, read it first and only update/add the `APP_PLATFORM_URL` line. Do NOT remove other variables.

2. This enables the app to authenticate against the platform on first launch (`yarn serve`).

If `DESIGN_PLAN.platformUrl` is null, skip this step.

#### Step 2: Generate Loop

Process each module in `DESIGN_PLAN.modules` in order:

For module at index `i`:

**2a: Build INTENT**
```json
INTENT = {
  "description": "{module.description}",
  "moduleName": "{module.name}",
  "bladeTypes": "{module.bladeTypes}",
  "menuConfig": {
    "title": "{I18N_PREFIX}.MENU.TITLE",
    "icon": "lucide-{infer icon from module description}",
    "priority": {100 + i * 10}
  },
  "isWorkspace": true
}
```
Where `I18N_PREFIX` = SCREAMING_SNAKE_CASE of `module.name`.

**2b: Build DATA_SOURCE**

- **If module matched an API entity** (from Phase 4): build full DATA_SOURCE from api-analyzer results — `entityName`, `entityTypePath`, `clientClass`, `searchMethod`, `getMethod`, `createMethod`, `updateMethod`, `deleteMethod`, columns from `module.columns` mapped to API fields, fields from `module.formFields` mapped to API fields.

- **If mock mode**: set DATA_SOURCE to empty/null. The generators will produce mock code. Use `module.columns` and `module.formFields` directly as the column/field definitions for the generators.

**2c: Dispatch generators**

Follow the same Phase 3 generation flow as `/vc-app generate`:

1. Create target directory:
   ```bash
   mkdir -p {TARGET_DIR}/pages {TARGET_DIR}/composables {TARGET_DIR}/locales
   ```
   Where `TARGET_DIR = <project root>/src/modules/{module.name}`

2. Initialize `GENERATED_FILES = []`

3. Dispatch blade generators based on `module.bladeTypes`:
   - If includes "list" → dispatch `list-blade-generator` (same parameters as `/vc-app generate` Phase 3a)
   - If includes "details" → dispatch `details-blade-generator` (same parameters as `/vc-app generate` Phase 3b)
   - If both → dispatch in parallel

4. After blade generators complete → dispatch `locales-generator` (same as `/vc-app generate` Phase 3c)

5. Dispatch `module-assembler` (same as `/vc-app generate` Phase 3d)

6. If mock mode → write `.vc-app-prototype.json` (same as `/vc-app generate` Phase 3e)

**2d: Pass context for connections**

For modules after the first, if `DESIGN_PLAN.connections` references a connection FROM an already-generated blade TO the current module's blade, pass `existingModule` context to the blade generator:
```json
"existingModule": {
  "blades": ["<list of already-generated blade names>"],
  "localePrefix": "<prefix from first module>",
  "indexPath": "<path to previously generated module's index.ts>"
},
"linkTo": {
  "blade": "<source blade name from connection>",
  "trigger": "<connection.trigger>",
  "label": "<I18N_PREFIX>.ACTIONS.<ACTION_NAME>"
}
```

**2e: Wire remaining connections**

After all modules are generated, for each connection in `DESIGN_PLAN.connections` that was NOT wired via `linkTo` in step 2d (e.g., connection from a later module to an earlier one), dispatch `blade-enhancer`:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/blade-enhancer.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "targetDir": "<absolute path to source module directory>",
>   "moduleAnalysis": { "blades": [<source blade info>] },
>   "actions": [{
>     "type": "link-blades",
>     "sourceBlade": "<connection.from>",
>     "targetBlade": "<connection.to>",
>     "trigger": "<connection.trigger>",
>     "targetModule": "<target module name>"
>   }],
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}"
> }
> ```

#### Step 3: TODO Injection

After all modules are generated, for each TODO in any module's `todos` array:

1. Find the most relevant composable file for that module: `src/modules/{module.name}/composables/use{PascalCase(module.name)}.ts`
2. Read the file and find the last import statement
3. Add a TODO comment after the imports:
   ```typescript
   // TODO [vc-app:design]: "{exact quoted text from prompt}"
   ```
4. If the composable file doesn't exist, add the TODO to the module's `index.ts` instead.

#### Step 4: Verification

After all modules are generated and TODOs injected, dispatch the `type-checker` agent once for the entire project:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/type-checker.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "projectRoot": "<project root absolute path>",
>   "generatedFiles": {ALL_GENERATED_FILES}
> }
> ```

Where `ALL_GENERATED_FILES` is the combined list of all `GENERATED_FILES` from all module generation loops.

### Phase 6: Summary

After verification, display the final summary:

```
Application "{DESIGN_PLAN.appName}" generated!

Modules created:
  {module.name} ({module.bladeTypes}) — {columns count} columns, {fields count} fields, {actions count} toolbar actions
  ...

Connections wired:
  {from} → [{trigger}] → {to}
  ...

TODOs (search for "TODO [vc-app:design]"):
  {module.name}: "{todo text}"
  ...

Platform: {DESIGN_PLAN.platformUrl or "not connected"}
Data: {mock/API summary per module}
TypeScript: {✓ no errors / ✗ N errors (see above)}
```

If all modules used mock data, append:
```
Next steps:
  /vc-app connect     — connect to platform API
  /vc-app promote     — transition each module from mock to real API
```

If some modules matched API and some didn't, append:
```
Next steps:
  /vc-app promote <name>  — transition mock modules to real API when ready
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

### Prompt too abstract (design)
If the prompt contains no identifiable entities, data objects, or concrete fields (e.g., "make me an app", "something cool"):
- Ask the user to clarify: "Describe what entities/data the app manages, what actions users perform, and how objects relate."
- Do NOT attempt to parse an empty/abstract prompt into modules.

### Large design plan (10+ modules)
If prompt analysis produces 10 or more modules:
- Show the full plan for review
- Suggest batching: "Generate first N now, rest later?"
- If user agrees to split, truncate modules list and note the remainder

### One module fails in design loop
If a single module's generation fails during the design execution loop:
- Show the error for that module
- Continue generating remaining modules
- In the final summary, list the failed module under "Skipped (errors):" with the error message
- Suggest: "Re-run /vc-app generate for the skipped module after fixing the issue."

### Prompt in non-English (design)
The prompt may be in any language. This is fine — parse entities and intent from any language, but:
- Module names → always kebab-case english
- Field names → always camelCase english
- If you cannot confidently translate an entity name, ask the user to confirm the english name

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
| promote-agent | `agents/promote-agent.md` | Transforms mock composables/blades/locales to use real API | Yes (edits only) |
| module-analyzer | `agents/module-analyzer.md` | Analyzes existing module structure (blades, composables, locales) | No (returns JSON) |
| blade-enhancer | `agents/blade-enhancer.md` | Surgical edits to existing blades/composables/locales | Yes (edits only) |

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

---

## /vc-app migrate

Fully automatic migration to the latest @vc-shell/framework version. Runs the CLI migrator for mechanical transforms, installs updated dependencies, then uses AI to complete manual migrations.

### Step 1: Pre-flight checks

1. Verify `@vc-shell/framework` exists in package.json (dependencies or devDependencies). If not found, stop: "This doesn't appear to be a vc-shell project."
2. Run `git status --porcelain` — if output is non-empty, warn: "You have uncommitted changes. Commit or stash before migrating." Ask user to confirm before proceeding.
3. Read current framework version from package.json for display.

### Step 2: Run CLI migrator

Resolve the migrate CLI binary. Run this shell snippet and use the result:

```bash
if [ -n "$VC_SHELL_MIGRATE_CLI" ] && [ -f "$VC_SHELL_MIGRATE_CLI" ]; then
  echo "node $VC_SHELL_MIGRATE_CLI"
elif [ -f "./node_modules/@vc-shell/migrate/dist/cli.js" ]; then
  echo "node ./node_modules/@vc-shell/migrate/dist/cli.js"
else
  echo "npx @vc-shell/migrate"
fi
```

Priority:
1. **Env override:** `VC_SHELL_MIGRATE_CLI` env var
2. **Project node_modules:** `./node_modules/@vc-shell/migrate/dist/cli.js`
3. **npx fallback:** `npx @vc-shell/migrate`

Run:

```bash
{resolved_migrate_command} --update-deps
```

Display the output to the user. If the command fails, stop and show the error.

### Step 3: Install dependencies

Run:

```bash
yarn install
```

If yarn fails (version conflicts, missing packages), stop and show the error. Dependencies must resolve before AI migration can type-check.

### Step 4: Parse migration report

Read `MIGRATION_REPORT.md` from project root.

Parse the "Manual Migration Required" section. Extract each topic heading and the affected files listed under it.

Map topic headings to migration prompt files and pattern files:

| Report Heading contains | Migration Prompt | Pattern |
|---|---|---|
| Widget | `{KNOWLEDGE_BASE}/migration-prompts/widgets-migration.md` | `{KNOWLEDGE_BASE}/patterns/blade-widget.md` |
| Form Management / useBladeForm | `{KNOWLEDGE_BASE}/migration-prompts/blade-form-migration.md` | `{KNOWLEDGE_BASE}/patterns/form-validation.md` |
| Injection Key | `{KNOWLEDGE_BASE}/migration-prompts/blade-props-migration.md` | `{KNOWLEDGE_BASE}/patterns/blade-navigation.md` |
| NSwag / DTO / Clone-then-mutate | `{KNOWLEDGE_BASE}/migration-prompts/nswag-migration.md` | — |
| Reusable Blade Components | `{KNOWLEDGE_BASE}/migration-prompts/blade-props-migration.md` | `{KNOWLEDGE_BASE}/patterns/child-blade-flow.md` |
| Notification | `{KNOWLEDGE_BASE}/migration-prompts/notifications-migration.md` | `{KNOWLEDGE_BASE}/patterns/signalr-notifications.md` |

Build the `topics` array for the migration-agent, including only topics that appear in the report.

### Step 5: Dispatch migration-agent

If there are topics to process, dispatch the migration-agent subagent:

**Agent:** `{SKILL_DIR}/agents/migration-agent.md`

**Input:**

```json
{
  "cwd": "<project root>",
  "reportPath": "<path to MIGRATION_REPORT.md>",
  "topics": [
    {
      "name": "<topic name>",
      "affectedFiles": ["src/path/to/file.vue"],
      "migrationPromptPath": "<absolute path to migration prompt>",
      "patternPath": "<absolute path to pattern file or null>"
    }
  ]
}
```

### Step 6: Type-check verification

After migration-agent completes, run:

```bash
npx vue-tsc --noEmit
```

If there are remaining TypeScript errors:
1. Show the errors to the user
2. Attempt to fix iteratively — read each error, fix the file, re-check (max 3 rounds)

### Step 7: Update report and summarize

Update `MIGRATION_REPORT.md`:
- For each topic the agent successfully completed, add ✅ to the heading
- Add a "Completed by AI" section listing what was done

Print summary to user:

```
Migration complete!

  Mechanical (CLI):  {N} files
  AI-assisted:       {M} files across {T} topics
  Remaining issues:  {R} (see MIGRATION_REPORT.md)

Next steps:
  1. Review the changes: git diff
  2. Run: yarn build
  3. Test the application
```
