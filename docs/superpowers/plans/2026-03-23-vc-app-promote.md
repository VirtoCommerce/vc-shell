# `/vc-app promote` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/vc-app promote` command that transitions prototype modules (mock data) to production (real API client) via surgical code transformation.

**Architecture:** New `promote` section in `vc-app.md` skill file orchestrates 5 phases (validation → data source discovery → field mapping → code transformation → cleanup). A new `promote-agent.md` subagent handles surgical code edits guided by `// vc-app:mock-start/end` markers. Changes to existing `generate` flow add marker file creation and mock code markers.

**Tech Stack:** Markdown skill files, subagent prompts (md), JSON marker files.

**Spec:** `docs/superpowers/specs/2026-03-23-vc-app-promote-design.md`

---

## File Structure

```
cli/vc-app-skill/runtime/
  vc-app.md                          # MODIFY — add promote command routing + full flow
  agents/
    promote-agent.md                 # CREATE — surgical code transformation agent
    list-blade-generator.md          # MODIFY — add mock marker emission
    details-blade-generator.md       # MODIFY — add mock marker emission
    module-assembler.md              # MODIFY — write .vc-app-prototype.json after generation
```

---

### Task 1: Add promote-agent subagent

**Files:**
- Create: `cli/vc-app-skill/runtime/agents/promote-agent.md`

- [ ] **Step 1: Write promote-agent.md**

The agent prompt must include:
- Input contract: `targetDir`, `prototypeMetadata`, `dataSource`, `fieldMap`, optional `knowledgeBase`, `docsRoot`
- Step 1: Validate — check each file in `prototypeMetadata.generatedFiles` exists at `targetDir/<path>`, collect warnings for missing
- Step 2: Transform composables — find `// vc-app:mock-start` / `// vc-app:mock-end` markers, replace block with real API calls using `dataSource` (apiClient import, useApiClient, CRUD method calls). If markers absent → pattern-match fallback, set DONE_WITH_CONCERNS. Replace `Record<string, unknown>` with entity type. Apply `fieldMap` renames (action: map), deletions (action: delete), stubs (action: keep-stub → TODO comment), computed (action: computed → TODO comment).
- Step 3: Transform blades — rename field references in VcColumn/form bindings per fieldMap, remove elements for deleted fields
- Step 4: Transform locales — scan ALL `.json` files in `locales/`, rename keys per fieldMap, remove deleted, add placeholders for new API fields
- Step 5: Scan module dir for additional `.ts`/`.vue` files not in generatedFiles that import from modified composables → warn
- Step 6: Report — status (DONE/DONE_WITH_CONCERNS/BLOCKED), files modified, warnings

Follow the exact same prompt structure as existing agents (see `list-blade-generator.md` for format: frontmatter, Input Contract, Knowledge Loading, Generation Rules, Output Contract, Self-Review Checklist).

- [ ] **Step 2: Verify agent prompt is complete**

Check against spec Phase 4 requirements:
- Mock marker handling (primary + fallback)
- All fieldMap actions: map, delete, keep-stub, computed
- Composable edits: imports, data source, types, fields
- Blade edits: template + script
- Locale edits: ALL json files
- Additional files scan

- [ ] **Step 3: Commit**

```bash
git add cli/vc-app-skill/runtime/agents/promote-agent.md
git commit -m "feat(vc-app-skill): add promote-agent subagent for mock→API transformation"
```

---

### Task 2: Update generate flow — mock markers + prototype JSON

**Files:**
- Modify: `cli/vc-app-skill/runtime/agents/list-blade-generator.md`
- Modify: `cli/vc-app-skill/runtime/agents/details-blade-generator.md`
- Modify: `cli/vc-app-skill/runtime/vc-app.md` (generate Phase 3 section)

- [ ] **Step 1: Update list-blade-generator.md**

Add a section "Mock Mode" to the Generation Rules:

When `dataSource` fields are empty/null (no API client), the generator must:
1. Wrap mock data-source code with `// vc-app:mock-start` and `// vc-app:mock-end` markers
2. Generate mock data array with sample values matching the requested columns
3. Generate mock `fetchItems`, `removeItems` functions inside the marker block

Add the exact mock code template from the spec (the `// vc-app:mock-start` block with mockData, fetchItems, fetchItem, saveItem, removeItems).

- [ ] **Step 2: Update details-blade-generator.md**

Same mock mode section — wrap mock data-source code with markers. Template for details: mock `fetchItem`, `saveItem`, `deleteItem` functions.

- [ ] **Step 3: Update vc-app.md — generate Phase 3 post-processing**

After "Track all generated files" paragraph, add instruction: when generating without API (DATA_SOURCE is empty), after all subagents complete:

1. Collect `GENERATED_FILES` from all agent reports
2. Write `.vc-app-prototype.json` to `TARGET_DIR/` with:
   - `version: 1`
   - `generatedAt: ISO timestamp`
   - `intent: INTENT object from Phase 1`
   - `mockFields: { columns, formFields }` from mock field definitions
   - `generatedFiles: GENERATED_FILES` (relative paths, excluding locale files)
3. Add to summary output: `"Module generated with mock data.\nWhen your API is ready, run: /vc-app connect && /vc-app promote <moduleName>"`

- [ ] **Step 4: Commit**

```bash
git add cli/vc-app-skill/runtime/agents/list-blade-generator.md cli/vc-app-skill/runtime/agents/details-blade-generator.md cli/vc-app-skill/runtime/vc-app.md
git commit -m "feat(vc-app-skill): add mock markers and prototype JSON to generate flow"
```

---

### Task 3: Add promote command to vc-app.md

**Files:**
- Modify: `cli/vc-app-skill/runtime/vc-app.md`

- [ ] **Step 1: Add promote to command routing table**

Find the command routing section (Step 1 in vc-app.md). Add entry:
```
promote   → /vc-app promote
```

- [ ] **Step 2: Write the full promote section**

Add after the `/vc-app generate` section (before any closing content). The section must include all 5 phases as described in the spec:

**Phase 1: Validation**
- Read `.vc-app-prototype.json` from `src/modules/<moduleName>/`
- Validate generatedFiles paths exist
- Locate API client directory

**Phase 2: Data Source Discovery**
- Reference: "Follow the same flow as `/vc-app generate` Phase 2" — dispatch api-analyzer, entity selection, field selection, CRUD methods
- Note: only collect columns if `bladeTypes` includes "list", form fields if includes "details"

**Phase 3: Field Mapping**
- Auto-match: exact name → LLM semantic similarity → unmatched
- Present mapping table for user confirmation
- For unmatched: Delete / Keep as stub / Map manually / Computed
- Store as FIELD_MAP

**Phase 4: Code Transformation**
- Dispatch promote-agent with the exact Agent tool dispatch block:
```
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
```

**Phase 5: Cleanup & Verification**
- Dispatch type-checker
- If clean → delete `.vc-app-prototype.json`, show success
- If errors → keep marker, show errors, suggest re-run after fixing

- [ ] **Step 3: Verify no duplicate sections**

Search vc-app.md for "promote" — should appear only in routing table and the new section.

- [ ] **Step 4: Commit**

```bash
git add cli/vc-app-skill/runtime/vc-app.md
git commit -m "feat(vc-app-skill): add /vc-app promote command with 5-phase flow"
```

---

### Task 4: Update commands for installer deployment

**Files:**
- Create: `cli/vc-app-skill/commands/vc-app/promote.md` (optional — only if promote needs its own slash command entry)

- [ ] **Step 1: Decide if separate command file needed**

Check how existing commands work: `commands/vc-app.md` is the entry point that loads the skill and routes by argument. Since promote is routed via `$ARGUMENTS` parsing in `vc-app.md`, a separate command file is NOT needed — it's handled by `/vc-app promote <args>`.

Skip file creation. No changes needed.

- [ ] **Step 2: Commit (if any changes)**

Only if changes were made.

---

### Task 5: Reinstall and verify

- [ ] **Step 1: Reinstall skill locally**

```bash
node cli/vc-app-skill/bin/install.cjs
```

Verify updated files deployed to `~/.claude/vc-app-skill/`.

- [ ] **Step 2: Verify vc-app.md has promote section**

```bash
grep -c "promote" ~/.claude/vc-app-skill/vc-app.md
```

Should show multiple matches (routing table + section).

- [ ] **Step 3: Verify promote-agent.md deployed**

```bash
ls ~/.claude/vc-app-skill/agents/promote-agent.md
```

- [ ] **Step 4: Verify mock markers in blade generators**

```bash
grep "vc-app:mock-start" ~/.claude/vc-app-skill/agents/list-blade-generator.md
grep "vc-app:mock-start" ~/.claude/vc-app-skill/agents/details-blade-generator.md
```

Both should match.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix(vc-app-skill): fixes from promote integration verification"
```

---

## Execution Notes

- **Tasks 1-2** are independent and can be done in parallel
- **Task 3** depends on Task 1 (references promote-agent.md) and Task 2 (references mock markers)
- **Task 4** is a quick check, likely no-op
- **Task 5** depends on all previous tasks
- All work happens in worktree `.worktrees/vc-app-skill` on branch `feature/vc-app-skill`
