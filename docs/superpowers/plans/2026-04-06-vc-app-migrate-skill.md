# /vc-app migrate Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/vc-app migrate` command that runs CLI migrator + yarn install + AI-powered manual migration + type-check verification.

**Architecture:** New route in `vc-app.md`, new `migration-agent.md` subagent prompt, 4 new migration prompt files in knowledge base. The skill orchestrates: CLI → yarn → parse report → dispatch agent → verify.

**Tech Stack:** Markdown prompts (Claude Code skill system), shell commands, existing `@vc-shell/migrate` CLI

**Spec:** `docs/superpowers/specs/2026-04-06-vc-app-migrate-skill-design.md`

---

### Task 1: Create migration prompts in knowledge base

**Files:**
- Create: `cli/vc-app-skill/runtime/knowledge/migration-prompts/nswag-migration.md`
- Create: `cli/vc-app-skill/runtime/knowledge/migration-prompts/widgets-migration.md`
- Create: `cli/vc-app-skill/runtime/knowledge/migration-prompts/blade-form-migration.md`
- Create: `cli/vc-app-skill/runtime/knowledge/migration-prompts/blade-props-migration.md`
- Create: `cli/vc-app-skill/runtime/knowledge/migration-prompts/notifications-migration.md`

- [ ] **Step 1: Create `nswag-migration.md`**

Refactor from `apps/vendor-portal/NSWAG_MIGRATION_PROMPT.md`. Keep all 6 rules, error code table, and verification checklist. Remove the "Usage Instructions" wrapper — this is consumed by the migration-agent directly, not pasted by a human.

The file should start with a frontmatter header:

```markdown
---
name: nswag-migration
description: AI transformation rules for NSwag class→interface DTO migration. Handles new→literal, I-prefix removal, factory functions, Image conflicts.
---
```

Then the content — all rules from the original prompt, reformatted as direct instructions (not "You are tasked with..." wrapper).

Source to read and adapt: `/Users/symbot/DEV/vc-shell-main-dev/vc-shell/apps/vendor-portal/NSWAG_MIGRATION_PROMPT.md`

- [ ] **Step 2: Create `widgets-migration.md`**

```markdown
---
name: widgets-migration
description: AI transformation rules for useWidgets→useBladeWidgets migration. Converts imperative widget registration to declarative composable pattern.
---

# Widget System Migration

## What to transform

Files that contain `useWidgets()`, `registerWidget()`, `unregisterWidget()`, or `clearBladeWidgets()` from `@vc-shell/framework`.

## Transformation Rules

### RULE 1: Create widget composable

For each blade that uses `registerWidget()`, create a `widgets/useXxxWidgets.ts` composable:

```ts
// BEFORE (in blade page):
import { useWidgets, useBlade } from "@vc-shell/framework";
const { registerWidget, clearBladeWidgets } = useWidgets();
const blade = inject(BladeInstance);

registerWidget({
  id: "MyWidget",
  component: MyWidgetComponent,
  props: { item }
}, blade.id);

onUnmounted(() => clearBladeWidgets(blade.id));

// AFTER (new file: widgets/useXxxWidgets.ts):
import { useBladeWidgets, useBlade } from "@vc-shell/framework";
import type { UseBladeWidgetsReturn } from "@vc-shell/framework";
import { computed, type Ref, type ComputedRef } from "vue";

interface UseXxxWidgetsOptions {
  item: Ref<XxxType>;
  isVisible: ComputedRef<boolean>;
}

export function useXxxWidgets(options: UseXxxWidgetsOptions): UseBladeWidgetsReturn {
  const { item, isVisible } = options;
  const { openBlade } = useBlade();

  return useBladeWidgets([
    {
      id: "MyWidget",
      icon: "lucide-tag",  // choose appropriate lucide icon
      title: "MODULE.WIDGETS.MY_WIDGET.TITLE",  // i18n key
      badge: computed(() => item.value?.relatedCount ?? 0),
      isVisible,
      onClick: () => openBlade({ name: "RelatedBlade", options: { parentId: item.value?.id } }),
    },
  ]);
}
```

### RULE 2: Replace usage in blade page

```ts
// BEFORE:
const { registerWidget, clearBladeWidgets, updateActiveWidget } = useWidgets();
// ... registerWidget calls ...

// AFTER:
import { useXxxWidgets } from "../widgets/useXxxWidgets";
const { refreshAll } = useXxxWidgets({
  item: entity,
  isVisible: computed(() => !!param.value),
});
```

### RULE 3: Remove widget .vue components for standard sidebar widgets

If the widget `.vue` file only renders a standard sidebar item (icon + title + badge + click), it's replaced by the headless config. Delete the `.vue` file.

If the widget `.vue` file has custom rendering (charts, complex layouts), keep it as an external component-based widget.

### RULE 4: Remove old imports

Remove from the file:
- `useWidgets` import
- `BladeInstance` import (if only used for widgets)
- `registerWidget`, `unregisterWidget`, `clearBladeWidgets` destructuring
- `onUnmounted` cleanup for widgets

### Verification

After transformation:
- `useWidgets` should not appear in any migrated file
- `registerWidget` / `unregisterWidget` should not appear
- Each blade with widgets should import a `useXxxWidgets` composable
- `npx tsc --noEmit` should pass
```

- [ ] **Step 3: Create `blade-form-migration.md`**

```markdown
---
name: blade-form-migration
description: AI transformation rules for useForm (vee-validate) + onBeforeClose → useBladeForm migration.
---

# Blade Form Migration

## What to transform

Files that contain `useForm()` from `vee-validate` AND `onBeforeClose()` from useBlade. These two patterns are unified into `useBladeForm()`.

## Transformation Rules

### RULE 1: Replace useForm + onBeforeClose with useBladeForm

```ts
// BEFORE:
import { useForm, Field } from "vee-validate";
import { useBlade, usePopup } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { meta } = useForm({ validateOnMount: false });
const { showConfirmation } = usePopup();

const isModified = computed(() => /* some tracking logic */);

onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation(t("CLOSE_CONFIRMATION")));
  }
});

// AFTER:
import { Field } from "vee-validate";  // keep Field, remove useForm
import { useBlade, useBladeForm } from "@vc-shell/framework";

const form = useBladeForm({
  data: item,  // the main reactive data ref
  closeConfirmMessage: computed(() => t("CLOSE_CONFIRMATION")),
});
// form.modified, form.isValid, form.validate(), form.resetForm(), form.setBaseline()
```

### RULE 2: Remove onBeforeClose entirely

`useBladeForm()` handles close confirmation automatically. Delete the entire `onBeforeClose(...)` block.

### RULE 3: Update toolbar disabled formulas

```ts
// BEFORE:
disabled: computed(() => !meta.value.valid || !isModified.value)

// AFTER:
disabled: computed(() => !form.isValid.value || !form.modified.value)
```

### RULE 4: Keep Field from vee-validate

`Field` component is still used in templates for per-field validation. Only `useForm` is replaced.

```ts
// BEFORE:
import { Field, useForm } from "vee-validate";

// AFTER:
import { Field } from "vee-validate";
```

### RULE 5: Replace useBeforeUnload / useModificationTracker

If the file uses `useBeforeUnload()` or `useModificationTracker()` — remove them entirely. `useBladeForm()` handles both.

### Verification

- No `useForm` import from `vee-validate` in migrated files
- No `onBeforeClose` calls in files that use `useBladeForm`
- `Field` import preserved
- `npx tsc --noEmit` passes
```

- [ ] **Step 4: Create `blade-props-migration.md`**

```markdown
---
name: blade-props-migration
description: AI transformation rules for reusable blade components that were skipped by CLI migrator (no defineBlade).
---

# Reusable Blade Component Migration

## What to transform

Components that have blade props (`expanded`, `closable`) and blade emits (`close:blade`, `expand:blade`, `collapse:blade`) but were NOT converted by the CLI migrator because they don't have `defineBlade()` — they are reusable wrapper components (e.g. `BaseListBlade.vue`).

## Transformation Rules

### RULE 1: Remove blade prop forwarding from wrapper

If the component forwards blade props to a child VcBlade or base component:

```vue
<!-- BEFORE: -->
<template>
  <VcBlade
    :expanded="expanded"
    :closable="closable"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >

<!-- AFTER: -->
<template>
  <VcBlade>
```

### RULE 2: Remove blade props and emits from interface

```ts
// BEFORE:
export interface Props {
  expanded?: boolean;
  closable?: boolean;
  title: string;
  loading: boolean;
}

// AFTER:
export interface Props {
  title: string;
  loading: boolean;
}
```

Same for Emits — remove `close:blade`, `expand:blade`, `collapse:blade`, `parent:call`.

### RULE 3: Replace emit("parent:call") with callParent

If the component emits `parent:call`, add `useBlade()` and use `callParent`:

```ts
// BEFORE:
emit("parent:call", { method: "reload" });

// AFTER:
const { callParent } = useBlade();
callParent("reload");
```

### RULE 4: Replace emit("close:blade") with closeSelf

```ts
// BEFORE:
emit("close:blade");

// AFTER:
const { closeSelf } = useBlade();
closeSelf();
```

### Verification

- No `expanded` or `closable` in Props interface
- No blade event emits in Emits interface
- No `:expanded` or `:closable` in template
- `npx tsc --noEmit` passes
```

- [ ] **Step 5: Create `notifications-migration.md`**

```markdown
---
name: notifications-migration
description: AI transformation rules for notification template migration to new defineAppModule notifications config.
---

# Notifications Migration

## What to transform

Modules that use the old `notificationTemplates` parameter or `components/notifications/` directory pattern.

## Transformation Rules

### RULE 1: Move notification directory

```
# BEFORE:
my-module/
  components/
    notifications/
      MyEvent.vue
      index.ts

# AFTER:
my-module/
  notifications/
    MyEvent.vue
```

Remove the barrel `index.ts` from notifications — components are imported individually.

### RULE 2: Update notification template component

```vue
<!-- BEFORE: -->
<script lang="ts" setup>
import { PushNotification, NotificationTemplate } from "@vc-shell/framework";

export interface Props {
  notification: PushNotification;
}

defineProps<Props>();
defineOptions({ inheritAttrs: false });
</script>

<!-- AFTER: -->
<script lang="ts" setup>
import { useNotificationContext, NotificationTemplate, useBlade } from "@vc-shell/framework";
import { computed } from "vue";

const notificationRef = useNotificationContext();
const notification = computed(() => notificationRef.value);
</script>
```

Key changes:
- Remove `defineProps` — notification is no longer a prop
- Remove `defineOptions({ inheritAttrs: false })` — not needed
- Use `useNotificationContext()` composable instead
- Use `computed(() => notificationRef.value)` for reactive access

For typed notifications:
```ts
interface IMyNotification extends PushNotification {
  customField?: string;
}
const notificationRef = useNotificationContext<IMyNotification>();
```

### RULE 3: Update module index.ts

```ts
// BEFORE:
import * as notificationTemplates from "./components/notifications";
export default createAppModule(pages, locales, notificationTemplates);

// AFTER:
import MyEventTemplate from "./notifications/MyEvent.vue";
export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    MyDomainEvent: {
      template: MyEventTemplate,
      toast: { mode: "auto" },
    },
  },
});
```

Each notification type maps an event name to a config with `template` and `toast` options.
Toast modes: `"auto"` (show and auto-dismiss), `"progress"` (show until complete), `"silent"` (no toast).

### RULE 4: Replace useNotifications in blades

```ts
// BEFORE:
const { markAsRead, setNotificationHandler } = useNotifications("MyDomainEvent");
setNotificationHandler((message) => { ... });

// AFTER:
const { messages } = useBladeNotifications({
  types: ["MyDomainEvent"],
  onMessage: () => reloadData(),
});
```

### Verification

- No `components/notifications/` directory (moved to `notifications/`)
- No `notificationTemplates` in module index
- Notification templates use `useNotificationContext()` not props
- Module uses `notifications: {}` config in `defineAppModule`
- `npx tsc --noEmit` passes
```

- [ ] **Step 6: Commit**

```
feat(vc-app-skill): add migration prompt knowledge base (nswag, widgets, form, blade-props, notifications)
```

---

### Task 2: Create migration-agent subagent prompt

**Files:**
- Create: `cli/vc-app-skill/runtime/agents/migration-agent.md`

- [ ] **Step 1: Create the agent prompt**

```markdown
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
1. Read the migration prompt from `migrationPromptPath` — these contain specific transformation rules
2. If `patternPath` is provided, read the pattern file — this shows what correct code looks like

## Generation Rules

This agent modifies existing files. It does NOT create new projects or modules.

### Strategy: File-by-file, verify after each

For each topic:
1. Read the migration prompt (transformation rules)
2. Read the pattern file if provided (target code style)
3. For each affected file:
   a. Read the file
   b. Apply transformation rules from the prompt
   c. Write the modified file
   d. Run: `cd {cwd} && npx vue-tsc --noEmit 2>&1 | grep {filename}` to check for TS errors in this file
   e. If errors: read them, fix, re-check (max 3 attempts)
   f. If fixed or no errors: commit with message `fix(migrate): {topic} — {filename}`
   g. If still errors after 3 attempts: report as "needs manual intervention", revert file, continue

### Topic Processing Order

Process topics in this order (dependencies first):
1. `notifications-migration` — may create new files that other transforms reference
2. `nswag-migration` — type-level changes that affect other transforms
3. `widgets-migration` — may create new composable files
4. `blade-form-migration` — depends on correct types
5. `blade-props-migration` — final cleanup

### Important Rules

1. **Only modify files listed in the report** — do not touch other files
2. **Follow transformation rules exactly** — the migration prompts have specific before/after patterns
3. **Do not add features** — only transform existing code to new API
4. **Preserve business logic** — the behavior must stay identical
5. **Create new files only when the prompt says to** — e.g. widgets-migration creates `useXxxWidgets.ts`
6. **Commit after each file** — atomic commits for easy rollback
7. **Report what was done and what failed**

## Output

Report to the orchestrator:
- Files successfully migrated (per topic)
- Files that failed and why
- Remaining TypeScript errors (if any)
```

- [ ] **Step 2: Commit**

```
feat(vc-app-skill): add migration-agent subagent prompt
```

---

### Task 3: Add `/vc-app migrate` command to skill

**Files:**
- Modify: `cli/vc-app-skill/runtime/vc-app.md`

- [ ] **Step 1: Add route to command table**

In `runtime/vc-app.md`, find the routing table and add:

```markdown
| `migrate`                | Section: `/vc-app migrate` |
```

- [ ] **Step 2: Add migrate to Help section**

Find the Help section and add to the commands list:

```
  /vc-app migrate             Migrate existing app to latest @vc-shell/framework (CLI + AI)
```

- [ ] **Step 3: Add the `/vc-app migrate` section**

Add this section at the end of `vc-app.md` (before any closing content), following the same pattern as other sections:

```markdown
---

## /vc-app migrate

Fully automatic migration to the latest @vc-shell/framework version. Runs the CLI migrator for mechanical transforms, installs updated dependencies, then uses AI to complete manual migrations.

### Step 1: Pre-flight checks

1. Verify `@vc-shell/framework` exists in package.json (dependencies or devDependencies). If not found, stop: "This doesn't appear to be a vc-shell project."
2. Run `git status --porcelain` — if output is non-empty, warn: "You have uncommitted changes. Commit or stash before migrating." Ask user to confirm before proceeding.
3. Read current framework version from package.json for display.

### Step 2: Run CLI migrator

Run:
```bash
npx @vc-shell/migrate --update-deps
```

If the command fails, stop and show the error.

### Step 3: Install dependencies

Run:
```bash
yarn install
```

If yarn fails (version conflicts, missing packages), stop and show the error. Dependencies must resolve before AI migration can type-check.

### Step 4: Parse migration report

Read `MIGRATION_REPORT.md` from project root.

Parse the "Manual Migration Required" section. Extract each topic heading (e.g. "Widget System Rewrite", "Form Management with useBladeForm()") and the affected files listed under it.

Map topic headings to migration prompt files:

| Report Heading | Migration Prompt | Pattern |
|---|---|---|
| Widget System Rewrite | `{KNOWLEDGE_BASE}/migration-prompts/widgets-migration.md` | `{KNOWLEDGE_BASE}/patterns/blade-widget.md` |
| Form Management | `{KNOWLEDGE_BASE}/migration-prompts/blade-form-migration.md` | `{KNOWLEDGE_BASE}/patterns/form-validation.md` |
| Injection Key Migration | `{KNOWLEDGE_BASE}/migration-prompts/blade-props-migration.md` | `{KNOWLEDGE_BASE}/patterns/blade-navigation.md` |
| NSwag DTO | `{KNOWLEDGE_BASE}/migration-prompts/nswag-migration.md` | — |
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
      "affectedFiles": ["src/path/to/file.vue", ...],
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
2. Dispatch the existing `type-checker` agent from `{SKILL_DIR}/agents/type-checker.md` to attempt iterative fixing

### Step 7: Update report and summarize

Update `MIGRATION_REPORT.md`:
- For each topic the agent successfully completed, change the heading to include ✅
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

If no remaining issues, omit the "Remaining issues" line.
```

- [ ] **Step 4: Commit**

```
feat(vc-app-skill): add /vc-app migrate command with full migration pipeline
```

---

### Task 4: Test on push-messages

**Files:** none (verification only)

- [ ] **Step 1: Reset push-messages**

```bash
cd /Users/symbot/DEV/vc-module-push-messages && git checkout -- . && git clean -fd
```

- [ ] **Step 2: Run `/vc-app migrate`**

In Claude Code, navigate to the push-messages app directory and run:
```
/vc-app migrate
```

Verify the full pipeline:
1. CLI migrator runs and shows transform output
2. `yarn install` succeeds (or at least attempts — may fail without registry access)
3. MIGRATION_REPORT.md is generated
4. Migration-agent is dispatched for manual topics
5. Agent processes affected files
6. Type-check runs

- [ ] **Step 3: Verify results**

Check:
- `defineBlade` in all blade pages
- No `useWidgets` / `registerWidget` in migrated files
- `useBladeForm` replaces `useForm` + `onBeforeClose` where applicable
- No `replaceCurrentBlade` in any file
- MIGRATION_REPORT.md updated with AI completion status

- [ ] **Step 4: Document any issues found during testing**

If any migration prompt needs adjustment based on real-world results, fix the prompt file and re-test.
