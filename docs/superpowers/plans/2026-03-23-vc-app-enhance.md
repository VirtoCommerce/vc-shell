# `/vc-app generate` Enhance Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `/vc-app generate` to detect existing modules and offer an enhance flow — surgical modifications to existing blades, composables, and locales via free-text intent.

**Architecture:** When module exists, generate dispatches `module-analyzer` agent to understand current structure, then collects free-text intent from user, parses it into an action plan, and dispatches `blade-enhancer` agent for surgical edits. New blades still use existing generators with `existingModule` context. `module-assembler` gains append mode for index.ts updates.

**Tech Stack:** Markdown skill files, subagent prompts (md).

**Spec:** `docs/superpowers/specs/2026-03-23-vc-app-enhance-design.md`

**Depends on:** `/vc-app promote` plan (Task 1 promote-agent establishes surgical editing patterns reused here).

---

## File Structure

```
cli/vc-app-skill/runtime/
  vc-app.md                          # MODIFY — add enhance flow detection + phases in generate section
  agents/
    module-analyzer.md               # CREATE — analyzes existing module structure
    blade-enhancer.md                # CREATE — surgical edits to existing blades/composables
    list-blade-generator.md          # MODIFY — add existingModule context parameter
    details-blade-generator.md       # MODIFY — add existingModule context parameter
    module-assembler.md              # MODIFY — add append mode for index.ts
```

---

### Task 1: Create module-analyzer agent

**Files:**
- Create: `cli/vc-app-skill/runtime/agents/module-analyzer.md`

- [ ] **Step 1: Write module-analyzer.md**

Agent prompt with standard format (frontmatter, Input Contract, Generation Rules, Output Contract, Self-Review):

**Input Contract:**
```json
{
  "required": {
    "targetDir": "string — absolute path to module directory"
  }
}
```

**Generation Rules:**
1. Read `index.ts` — extract blade registrations (defineAppModule blades key), imports
2. Read each `pages/*.vue` — extract: component name (defineOptions name), url, blade type (list vs details by presence of VcDataTable vs form fields), columns (VcColumn elements), form fields, toolbar actions, openBlade calls
3. Read each `composables/*.ts` — extract: function name, API client usage (useApiClient import), entity type, CRUD methods used, exported refs/functions
4. Read `locales/*.json` — collect all i18n key paths
5. Determine if API-connected: check for useApiClient imports in any composable

**Output Contract:**
```json
{
  "moduleName": "string",
  "blades": [{ "name", "type", "file", "url", "columns", "formFields", "toolbarActions", "linksTo" }],
  "composables": [{ "name", "file", "apiClient", "entity", "methods", "exports" }],
  "localeKeys": ["string"],
  "apiConnected": "boolean"
}
```

**Self-Review Checklist:**
- All blades discovered and typed correctly
- All composables with their exports listed
- API connection status accurate
- Locale keys complete

- [ ] **Step 2: Commit**

```bash
git add cli/vc-app-skill/runtime/agents/module-analyzer.md
git commit -m "feat(vc-app-skill): add module-analyzer agent for existing module introspection"
```

---

### Task 2: Create blade-enhancer agent

**Files:**
- Create: `cli/vc-app-skill/runtime/agents/blade-enhancer.md`

- [ ] **Step 1: Write blade-enhancer.md**

Agent prompt with standard format.

**Input Contract:**
```json
{
  "required": {
    "targetDir": "string — absolute path to module directory",
    "moduleAnalysis": "object — output from module-analyzer",
    "actions": "array — list of actions from confirmed plan"
  },
  "optional": {
    "dataSource": "object — DATA_SOURCE if new entity involved",
    "knowledgeBase": "string",
    "docsRoot": "string"
  }
}
```

**Action types and transformation rules:**

`add-column` — target blade file:
- Find `<VcDataTable>` or last `<VcColumn>` in template
- Insert new `<VcColumn>` after specified position (`after` field)
- Add locale key in ALL `locales/*.json` files

`add-field` — target blade file:
- Find form section in template
- Insert new component (VcInput, VcSelect, etc.) after specified position
- Update composable if field needs to be in save payload
- Add locale key in ALL `locales/*.json` files

`add-logic` — target composable and/or blade:
- Read existing composable, understand its structure
- Add new function/computed/watcher as described
- If `affectsTemplate: true`, wire up in target blade template
- Add locale keys if needed

`add-toolbar-action` — target blade:
- Add toolbar item in blade template (VcBlade toolbar slot)
- Add handler function in composable or blade script
- Add locale key for action label

`link-blades` — source blade:
- Add openBlade call with destination blade name
- Add trigger (button/row-action) in template
- Add handler in composable if complex logic needed
- Add locale key for button/link label

**Key rules:**
- Use Edit tool for surgical edits — NEVER rewrite entire files
- Follow existing code patterns in the module (naming, import style, indentation)
- Process ALL locale files in `locales/`, not just en.json
- If code structure is unexpected (custom table, non-standard composable), report DONE_WITH_CONCERNS

**Self-Review Checklist:**
- Each action applied to correct file
- Locale keys added to ALL json files
- Existing code preserved — only additions/modifications
- Imports added where needed
- No duplicate code introduced

- [ ] **Step 2: Commit**

```bash
git add cli/vc-app-skill/runtime/agents/blade-enhancer.md
git commit -m "feat(vc-app-skill): add blade-enhancer agent for surgical module modifications"
```

---

### Task 3: Update existing agents for enhance support

**Files:**
- Modify: `cli/vc-app-skill/runtime/agents/list-blade-generator.md`
- Modify: `cli/vc-app-skill/runtime/agents/details-blade-generator.md`
- Modify: `cli/vc-app-skill/runtime/agents/module-assembler.md`

- [ ] **Step 1: Update list-blade-generator.md — add existingModule parameter**

Add to Input Contract `optional` section:
```json
"existingModule": {
  "blades": "array — existing blade names for linking",
  "localePrefix": "string — existing i18n prefix",
  "indexPath": "string — path to index.ts"
},
"linkTo": {
  "blade": "string — blade to add openBlade link from",
  "trigger": "string — button|row-action|tab",
  "label": "string — i18n key for trigger label"
}
```

Add to Generation Rules a section "Existing Module Context": when `existingModule` is provided, the generator must use the same locale prefix convention, and if `linkTo` is provided, add the openBlade call to the source blade after generating the new blade.

- [ ] **Step 2: Update details-blade-generator.md — same changes**

Same `existingModule` and `linkTo` optional parameters and "Existing Module Context" section.

- [ ] **Step 3: Update module-assembler.md — add append mode**

Add to Input Contract:
```json
"mode": "string — 'create' (default) or 'append'"
```

Add to Generation Rules a section "Append Mode": when `mode: "append"`:
1. Read existing `index.ts`
2. Add new blade import statements after existing imports
3. Add new blade to the `blades` object in `defineAppModule`
4. Do NOT overwrite existing content
5. Use Edit tool, not Write tool

- [ ] **Step 4: Commit**

```bash
git add cli/vc-app-skill/runtime/agents/list-blade-generator.md cli/vc-app-skill/runtime/agents/details-blade-generator.md cli/vc-app-skill/runtime/agents/module-assembler.md
git commit -m "feat(vc-app-skill): add existingModule context and append mode to generators"
```

---

### Task 4: Add enhance flow to vc-app.md

**Files:**
- Modify: `cli/vc-app-skill/runtime/vc-app.md`

- [ ] **Step 1: Modify generate Phase 1 — add module detection**

In the generate section, after "Store all collected values: INTENT", add enhance detection:

```markdown
### Enhance Mode Detection

After collecting `INTENT.moduleName`, check if `src/modules/<moduleName>/` exists.

If it exists → switch to Enhance Flow (below).
If it doesn't exist → continue with Create Flow (current Phase 2-5).
```

- [ ] **Step 2: Write the Enhance Flow section**

Add new section after the existing generate flow:

```markdown
### Enhance Flow (module exists)

#### Phase E1: Module Analysis

Dispatch `module-analyzer` agent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/module-analyzer.md` for your full instructions.
>
> Execute with: `{ "targetDir": "<absolute path to module>" }`

Show the module summary to the user (blades, composables, API status).
Ask: "What would you like to do? (describe in free text)"

#### Phase E2: Intent Parsing

Parse the user's free-text description into an action plan. Map to action types:
- Mentions of "column", "add to list/table" → `add-column`
- Mentions of "field", "input", "form" → `add-field`
- Mentions of "logic", "validation", "computed", "watcher" → `add-logic`
- Mentions of "toolbar", "button", "action", "export" → `add-toolbar-action`
- Mentions of "link", "navigate", "open blade", "connect" → `link-blades`
- Mentions of "new blade", "new list", "new details" → new blade creation

Present the parsed action plan to the user for confirmation.

#### Phase E3: Data Source (conditional)

- If action plan includes new blades with different API entity → run full Phase 2 data source discovery
- If adding fields from existing entity → skip, fields come from existing API types
- If adding logic/toolbar only → skip

#### Phase E4: Execution

For each action in the confirmed plan:

**New blades** → dispatch `list-blade-generator` / `details-blade-generator` with `existingModule` context, then `module-assembler` in append mode.

**Modifications to existing files** → dispatch `blade-enhancer`:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/blade-enhancer.md` for your full instructions.
>
> Execute with:
> ```json
> {
>   "targetDir": "<absolute path to module>",
>   "moduleAnalysis": <module-analyzer output>,
>   "actions": <confirmed action plan>,
>   "dataSource": <DATA_SOURCE if applicable>,
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}"
> }
> ```

#### Phase E5: Verify

Dispatch `type-checker` agent. Show summary of all changes.
```

- [ ] **Step 3: Verify no conflicts with existing generate flow**

Ensure the enhance detection doesn't break the create flow — it's a branch point after module name collection, not a replacement.

- [ ] **Step 4: Commit**

```bash
git add cli/vc-app-skill/runtime/vc-app.md
git commit -m "feat(vc-app-skill): add enhance flow to /vc-app generate for existing modules"
```

---

### Task 5: Reinstall and verify

- [ ] **Step 1: Reinstall skill**

```bash
node cli/vc-app-skill/bin/install.cjs
```

- [ ] **Step 2: Verify new agents deployed**

```bash
ls ~/.claude/vc-app-skill/agents/module-analyzer.md
ls ~/.claude/vc-app-skill/agents/blade-enhancer.md
```

- [ ] **Step 3: Verify enhance flow in vc-app.md**

```bash
grep -c "Enhance Flow" ~/.claude/vc-app-skill/vc-app.md
grep -c "module-analyzer" ~/.claude/vc-app-skill/vc-app.md
grep -c "blade-enhancer" ~/.claude/vc-app-skill/vc-app.md
```

All should return ≥1.

- [ ] **Step 4: Verify generator updates**

```bash
grep "existingModule" ~/.claude/vc-app-skill/agents/list-blade-generator.md
grep "append" ~/.claude/vc-app-skill/agents/module-assembler.md
```

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix(vc-app-skill): fixes from enhance flow verification"
```

---

## Execution Notes

- **Task 1-2** are independent — can be done in parallel (new agents, no shared files)
- **Task 3** is independent of 1-2 (modifies existing agents)
- **Task 4** depends on Tasks 1-3 (references all agents)
- **Task 5** depends on all previous tasks
- All work happens in worktree `.worktrees/vc-app-skill` on branch `feature/vc-app-skill`
- Execute AFTER the promote plan — promote establishes surgical editing patterns reused here
