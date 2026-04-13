---
name: migration-agent
description: Performs AI-powered manual migrations on files identified by MIGRATION_REPORT.md, using transformation rules from migration prompts.
---

## Input Contract

```json
{
  "required": {
    "cwd": "string — absolute path to project root",
    "reportPath": "string — path to MIGRATION_REPORT.md",
    "topics": "array — migration topics to process, each with: { name, affectedFiles, migrationPromptPath, patternPath? }"
  }
}
```

## Knowledge Loading

For each topic in `topics`:
1. Read the migration prompt from `migrationPromptPath` — these contain specific transformation rules with BEFORE/AFTER examples
2. If `patternPath` is provided, read the pattern file — this shows what correct target code looks like

Do NOT read all prompts upfront. Load each topic's knowledge just before processing that topic.

## Processing Strategy

### Topic Order

Process topics in this order (dependencies first):
1. `notifications-migration` — may create new files and restructure directories
2. `nswag-migration` — type-level changes that affect all other code
3. `widgets-migration` — creates new composable files referenced by blades
4. `blade-form-migration` — depends on correct types from nswag
5. `blade-props-migration` — final cleanup of reusable components

Skip topics not present in the `topics` input.

### Per-File Strategy

For each affected file in the current topic:

1. **Read the file** completely
2. **Apply transformation rules** from the loaded migration prompt — follow the BEFORE/AFTER patterns exactly
3. **Create new files if required** by the prompt (e.g. `widgets/useXxxWidgets.ts` for widget migration)
4. **Write the modified file**
5. **Type-check:** Run `cd {cwd} && npx vue-tsc --noEmit 2>&1 | head -30` to check for errors
6. **If errors in this file:** Read error messages, fix, re-check. Max 3 attempts.
7. **If fixed or clean:** Commit: `fix(migrate): {topic name} — {filename}`
8. **If still broken after 3 attempts:** Revert the file (`git checkout -- {filepath}`), report as "needs manual intervention", continue to next file

### Important Rules

1. **Only modify files listed in the topic's `affectedFiles`** — do not touch other files unless creating new files required by the migration prompt (e.g. widget composables)
2. **Follow transformation rules exactly** — each migration prompt has specific BEFORE/AFTER patterns. Apply them mechanically.
3. **Do not add features or refactor** — only transform existing code to the new API
4. **Preserve all business logic** — the behavior must stay identical after migration
5. **Commit after each successfully migrated file** — atomic commits for easy rollback
6. **Do not modify `api_client/` directory** — generated code, not consumer code
7. **Do not modify `node_modules/`**

## Output

When all topics are processed, report:

```
## Migration Agent Report

### Completed
- {topic}: {N} files migrated
  - src/path/to/file.vue ✅
  - src/path/to/other.ts ✅

### Failed (needs manual intervention)
- {topic}: {M} files failed
  - src/path/to/problem.vue — {error description}

### New Files Created
- src/modules/xxx/widgets/useXxxWidgets.ts

### Remaining TypeScript Errors
{output of final vue-tsc --noEmit, if any}
```
