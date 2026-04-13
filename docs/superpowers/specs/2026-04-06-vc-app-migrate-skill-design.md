# /vc-app migrate — AI-Powered Full Migration Skill

## Context

The `@vc-shell/migrate` CLI handles mechanical code transformations (AST rewrites, import renames, prop removals). After running, it generates `MIGRATION_REPORT.md` listing items requiring manual migration — widget system rewrites, form management changes, injection key replacements, NSwag clone-mutate patterns, etc.

Currently developers must read the report and migration guides, then manually rewrite each file. This skill automates that step using AI, achieving a fully automated migration pipeline.

## Goals

1. Add `/vc-app migrate` command to the existing vc-app-skill
2. Fully automatic: CLI migrator → yarn install → AI fixes remaining manual items → type-check verification
3. Self-contained: all knowledge from migration guides + skill knowledge base, no dependency on vendor-portal or other repos
4. Iterative: AI fixes one file at a time, runs tsc after each, retries on failure

## Non-Goals

- Interactive/step-by-step mode
- Changes to `@vc-shell/migrate` CLI itself
- Migration of non-vc-shell apps (AngularJS, etc.)

---

## Architecture

### Three-Phase Pipeline

```
Phase 1: Mechanical Migration
  1. Verify project has @vc-shell/framework in package.json
  2. Verify clean git working tree (warn if dirty)
  3. Run: npx @vc-shell/migrate --update-deps
  4. Run: yarn install (needed for new framework types in tsc)
  5. Read generated MIGRATION_REPORT.md

Phase 2: AI Manual Migration
  1. Parse "Manual Migration Required" section from report
  2. For each topic: load relevant migration guide + migration prompt from knowledge base
  3. Dispatch migration-agent subagent with: affected files, guides, prompts
  4. Agent works file-by-file: read → transform → tsc check → commit

Phase 3: Verification
  1. Run vue-tsc --noEmit (full project type check)
  2. If errors remain: dispatch type-checker agent (already exists) for iterative fixing
  3. Update MIGRATION_REPORT.md — mark AI-completed items
  4. Final summary to user
```

### Knowledge Base (3 Levels)

All knowledge is self-contained within the skill:

**Level 1 — Migration Guides** (`migration/*.md`, copied to skill knowledge base):
- What changed and why
- Before/after examples
- Migration steps

**Level 2 — Patterns** (`runtime/knowledge/patterns/*.md`, already exists):
- How to write correct code in the new API
- Complete examples of composables, blade pages, widgets

**Level 3 — Migration Prompts** (`runtime/knowledge/migration-prompts/*.md`, new):
- Specific AI instructions for each migration topic
- Error patterns, transformation rules, verification checklists
- Designed for subagent consumption (not human reading)

### Topic → Knowledge Mapping

| Report Topic | Migration Guide | Migration Prompt | Pattern |
|---|---|---|---|
| Widget System Rewrite | `13-widgets.md` | `widgets-migration.md` | `blade-widget.md` |
| Form Management (useBladeForm) | `37-use-blade-form.md` | `blade-form-migration.md` | `form-validation.md` |
| Injection Key (BladeInstance) | `21-injection-keys.md` | `blade-props-migration.md` | `blade-navigation.md` |
| NSwag DTO Clone-mutate | — | `nswag-migration.md` | — |
| Reusable Blade Components | `11-blade-props.md` | `blade-props-migration.md` | `child-blade-flow.md` |
| replaceWith semantics | `12-replace-cover.md` | — (diagnostic only) | `blade-navigation.md` |
| Notification templates | `14-notifications.md` | — (diagnostic only) | `signalr-notifications.md` |

---

## New Files

### 1. `runtime/agents/migration-agent.md`

Subagent prompt for Phase 2. Receives:
- List of affected files grouped by migration topic
- Loaded migration prompts (transformation rules)
- Loaded patterns (target code style)

Work strategy:
- Process one file at a time
- Read file → apply transformation rules from prompt → write
- Run `npx tsc --noEmit` after each file (scoped to that file's errors)
- If tsc errors in this file — iterate fix (max 3 attempts)
- Commit each successfully migrated file: `fix(migrate): manual migration — <topic> in <filename>`
- If max retries exceeded — report file as "needs manual intervention" and continue

The agent must NOT:
- Modify files not listed in the report
- Add features or refactor beyond what migration requires
- Skip tsc verification

### 2. `runtime/knowledge/migration-prompts/nswag-migration.md`

Refactored from `apps/vendor-portal/NSWAG_MIGRATION_PROMPT.md`. Contains:
- 6 transformation rules (import renames, class→interface, factory functions, Image conflict, implicit any, type mismatch)
- Code patterns with before/after
- Quick reference error code table
- Verification checklist

### 3. `runtime/knowledge/migration-prompts/widgets-migration.md`

Migration prompt for widget system rewrite:
- Transformation: `useWidgets()` + `registerWidget()` → `useBladeWidgets([...])`
- Transformation: widget `.vue` component → headless config object
- Transformation: `defineExpose({ updateFn })` → `onRefresh` callback
- Transformation: manual `onUnmounted` cleanup → automatic lifecycle
- Create `useXxxWidgets.ts` composable pattern
- Before/after for each pattern

### 4. `runtime/knowledge/migration-prompts/blade-form-migration.md`

Migration prompt for useBladeForm:
- Transformation: `useForm()` (vee-validate) → `useBladeForm({ data, closeConfirmMessage })`
- Transformation: Remove `onBeforeClose` guard entirely
- Transformation: Replace `meta.value.dirty` / `isModified` with `form.modified`
- Transformation: Replace toolbar `disabled: !modified || !isValid` with form return values
- Before/after for complete blade page

### 5. `runtime/knowledge/migration-prompts/blade-props-migration.md`

Migration prompt for reusable blade components that were skipped by CLI migrator:
- Components with blade props but no `defineBlade()` (e.g. `BaseListBlade.vue`)
- Transformation: Remove forwarded blade props/emits from wrapper components
- Transformation: Child blades call `useBlade()` directly instead of receiving props
- Before/after for wrapper → child pattern

---

## Integration into vc-app.md

### Routing Table Addition

```markdown
| `migrate` | Section: `/vc-app migrate` |
```

### Section: `/vc-app migrate`

```markdown
## /vc-app migrate

Fully automatic migration to latest @vc-shell/framework.

### Step 1: Pre-flight checks

1. Verify `@vc-shell/framework` exists in package.json dependencies
2. Check git status — if dirty, warn user and suggest committing first
3. Detect current framework version from package.json

### Step 2: Run CLI migrator

Run:
  npx @vc-shell/migrate --update-deps

### Step 3: Install updated dependencies

Run:
  yarn install

If yarn fails — stop and report the error. Dependencies must resolve before proceeding.

### Step 4: Parse migration report

Read MIGRATION_REPORT.md from project root.
Extract topics from "Manual Migration Required" section.

### Step 5: Load knowledge for each topic

For each topic found, load from {KNOWLEDGE_BASE}:
- migration-prompts/{topic-prompt}.md (transformation rules)
- patterns/{related-pattern}.md (target code style)

Use the Topic → Knowledge Mapping table from the spec.

### Step 6: Dispatch migration-agent

Dispatch subagent from: `{SKILL_DIR}/agents/migration-agent.md`

Provide:
- Affected files list (from report, grouped by topic)
- Loaded migration prompts
- Loaded patterns
- Project cwd

### Step 7: Type-check verification

After migration-agent completes, run:
  npx vue-tsc --noEmit

If errors remain, dispatch the existing type-checker agent for iterative fixing.

### Step 8: Final report

Update MIGRATION_REPORT.md:
- Mark AI-completed topics with ✅
- List remaining issues (if any)

Report to user:
- Files migrated by CLI (mechanical)
- Files migrated by AI (manual topics)
- Remaining issues (if any)
- Next steps (if any)
```

---

## Testing Strategy

Test on the 4 real applications:
1. `vc-module-push-messages` — has widgets, useForm, BladeInstance, NSwag clone-mutate
2. `vc-module-news` — has complex onBeforeClose, NSwag patterns
3. `vc-module-pagebuilder` — has TSX parse edge cases, reusable components
4. `vc-module-task-management` — has widgets, assets, BladeInstance

Success criteria: After `/vc-app migrate`, `vue-tsc --noEmit` produces zero errors (excluding api_client regeneration issues which require platform access).
