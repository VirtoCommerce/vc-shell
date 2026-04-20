---
name: blade-enhancer
description: Performs surgical edits on existing module files to add columns, fields, toolbar actions, logic, and blade links without regenerating code.
---

## Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory",
    "moduleAnalysis": "object — output from module-analyzer (blades, composables, locales, structure)",
    "actions": [
      {
        "type": "string — 'add-column' | 'add-field' | 'add-logic' | 'add-toolbar-action' | 'link-blades'",
        "target": "string — relative file path within targetDir (e.g., 'pages/team-list.vue')",
        "...": "action-specific fields (see Action Types below)"
      }
    ]
  },
  "optional": {
    "dataSource": "object — DATA_SOURCE if new entity involved",
    "knowledgeBase": "string — absolute path to skill/knowledge/",
    "docsRoot": "string — absolute path to skill/knowledge/docs/"
  }
}
```

### Action Schema by Type

**`add-column`:**

```json
{
  "type": "add-column",
  "target": "pages/team-list.vue",
  "column": {
    "id": "string — camelCase field name",
    "title": "string — display label for locale files",
    "columnType": "string? — VcColumn type: 'date-ago', 'money', 'status', 'status-icon', 'number', 'image'",
    "sortable": "boolean?",
    "alwaysVisible": "boolean?",
    "mobilePosition": "string? — 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
    "mobileRole": "string? — 'image' | 'status'",
    "width": "string? — e.g., '60px', '120px'",
    "hasBodySlot": "boolean? — true if custom #body slot needed",
    "bodySlotTemplate": "string? — Vue template string for #body slot content"
  },
  "after": "string? — id of column to insert after (omit to append at end)"
}
```

**`add-field`:**

```json
{
  "type": "add-field",
  "target": "pages/team-details.vue",
  "field": {
    "name": "string — camelCase field name",
    "label": "string — display label for locale files",
    "component": "string — 'VcInput' | 'VcSelect' | 'VcSwitch' | 'VcTextarea' | 'VcDatepicker' | 'VcCheckbox'",
    "bindingType": "string? — 'v-model' | ':modelValue' (default: 'v-model')",
    "props": "object? — additional component props (e.g., { clearable: true, required: true })",
    "inSavePayload": "boolean? — true if field should be included in save/update payload"
  },
  "after": "string? — name of field to insert after",
  "section": "string? — form section identifier if multiple sections exist"
}
```

**`add-logic`:**

```json
{
  "type": "add-logic",
  "target": "composables/useTeamMember/index.ts",
  "logic": {
    "kind": "string — 'function' | 'computed' | 'watcher' | 'ref'",
    "name": "string — name of the new function/computed/ref",
    "description": "string — what this logic does",
    "code": "string — TypeScript code to insert",
    "imports": ["string? — additional imports needed"],
    "affectsTemplate": "boolean? — if true, wire up in target blade template",
    "templateTarget": "string? — blade file path if affectsTemplate is true",
    "templateCode": "string? — Vue template snippet to insert if affectsTemplate is true"
  }
}
```

**`add-toolbar-action`:**

```json
{
  "type": "add-toolbar-action",
  "target": "pages/team-details.vue",
  "action": {
    "id": "string — kebab-case action identifier",
    "label": "string — display label for locale files",
    "icon": "string? — lucide icon name (e.g., 'lucide-download')",
    "handler": "string — function name for click handler",
    "handlerCode": "string — TypeScript code for the handler function",
    "disabled": "string? — Vue expression for :disabled binding"
  }
}
```

**`link-blades`:**

```json
{
  "type": "link-blades",
  "target": "pages/team-list.vue",
  "link": {
    "destinationBlade": "string — PascalCase blade component name to open",
    "destinationImport": "string? — import path for destination blade (if in different module)",
    "trigger": "string — 'row-click' | 'button' | 'row-action'",
    "buttonLabel": "string? — label if trigger is 'button'",
    "buttonIcon": "string? — icon if trigger is 'button'",
    "openBladeOptions": "object? — additional options for openBlade call (e.g., { param: 'id' })",
    "handlerCode": "string? — custom handler code if complex logic needed"
  }
}
```

## Knowledge Loading

Before making edits, Read these files if paths are provided:

1. `{knowledgeBase}/index.md` — to find relevant component docs
2. From `index.md`, identify `.docs.md` files for any components referenced in the actions (VcColumn, VcInput, VcBlade, etc.) and Read them from `{docsRoot}/`

Then, for EACH action:

1. Read the `target` file to understand its current structure
2. Read any composable files referenced by the target blade
3. Scan `{targetDir}/locales/` for ALL `.json` files — these will ALL need locale key additions

## Generation Rules

**Important:** This agent performs _surgical edits_ on existing files using the Edit tool. NEVER rewrite entire files. All code outside the edited regions must be preserved exactly. Follow existing code patterns in the module (naming conventions, import style, indentation, quote style).

### Pre-flight: Understand the module

1. Read ALL files listed in `moduleAnalysis` to understand:
   - Import style (single quotes vs double quotes, semicolons, etc.)
   - Existing i18n key patterns and prefix (e.g., `TEAM.PAGES.LIST.TABLE.HEADER.*`)
   - Composable structure (factory function pattern, return shape)
   - Template indentation and component attribute style
2. List ALL `.json` files in `{targetDir}/locales/` — every one must receive new locale keys

### Action: `add-column`

**Step 1: Edit the blade template**

1. Read the target blade file
2. Locate the insertion point:
   - If `after` is specified: find `<VcColumn` with matching `id="{after}"` and locate its closing tag (`/>` or `</VcColumn>`)
   - If `after` is omitted: find the last `<VcColumn` element's closing tag
   - If no `<VcColumn>` exists: find `<VcDataTable` and insert inside it
3. Construct the `<VcColumn>` element from the `column` schema fields:
   ```vue
   <VcColumn
     id="{column.id}"
     :title="t('{I18N_PREFIX}.PAGES.LIST.TABLE.HEADER.{SCREAMING_SNAKE(column.id)}')"
     {':sortable="true"' if column.sortable}
     {':always-visible="true"' if column.alwaysVisible}
     {'type="{column.columnType}"' if column.columnType}
     {'width="{column.width}"' if column.width}
     {'mobile-position="{column.mobilePosition}"' if column.mobilePosition}
     {'mobile-role="{column.mobileRole}"' if column.mobileRole}
   />
   ```
4. If `column.hasBodySlot` is true, use the open/close tag form with the provided `bodySlotTemplate`:
   ```vue
   <VcColumn id="{column.id}" ...attributes...>
     <template #body="{ data }">
       {column.bodySlotTemplate}
     </template>
   </VcColumn>
   ```
5. Use the Edit tool to insert after the identified closing tag

**Step 2: Add locale keys**

For EVERY `.json` file in `{targetDir}/locales/`:

1. Read the file
2. Navigate to the table header key section (e.g., `{I18N_PREFIX}.PAGES.LIST.TABLE.HEADER`)
3. Add the new key: `"{SCREAMING_SNAKE(column.id)}": "{column.title}"`
4. Use the Edit tool to insert the key after the last existing header key

### Action: `add-field`

**Step 1: Edit the blade template**

1. Read the target blade file
2. Locate the insertion point in the form section:
   - If `after` is specified: find the component bound to `after` field (look for `v-model="item.{after}"` or `:modelValue="item.{after}"`) and locate its closing tag
   - If `after` is omitted: find the last form component in the section
   - If `section` is specified: narrow search to that form section
3. Construct the form field element:
   ```vue
   <{field.component} :label="t('{I18N_PREFIX}.PAGES.DETAILS.FIELDS.{SCREAMING_SNAKE(field.name)}')" v-model="item.{field.name}" {...additional props from field.props} />
   ```
   Use `v-model` or `:modelValue` based on `field.bindingType`.
4. Use the Edit tool to insert after the identified closing tag

**Step 2: Update composable (if `inSavePayload` is true)**

1. Read the composable file for the target blade
2. Find the save/update method payload construction
3. Add the field to the payload object
4. Use the Edit tool for the insertion

**Step 3: Add locale keys**

For EVERY `.json` file in `{targetDir}/locales/`:

1. Read the file
2. Navigate to the details fields key section (e.g., `{I18N_PREFIX}.PAGES.DETAILS.FIELDS`)
3. Add the new key: `"{SCREAMING_SNAKE(field.name)}": "{field.label}"`
4. Use the Edit tool to insert the key

### Action: `add-logic`

**Step 1: Edit the composable**

1. Read the target composable file
2. Add any required imports from `logic.imports` at the top of the file (after existing imports, avoiding duplicates)
3. Determine insertion point based on `logic.kind`:
   - `ref` — insert after existing ref declarations
   - `computed` — insert after existing computed declarations
   - `watcher` — insert after existing watchers
   - `function` — insert before the return statement
4. Insert `logic.code` at the determined point using the Edit tool
5. If the new logic needs to be exposed, add it to the composable's return statement

**Step 2: Wire up in template (if `affectsTemplate` is true)**

1. Read the `logic.templateTarget` blade file
2. Insert `logic.templateCode` at the appropriate location
3. Add any necessary imports in the blade's `<script setup>` if the composable return destructuring needs updating

**Step 3: Add locale keys (if the logic introduces user-facing strings)**

For EVERY `.json` file in `{targetDir}/locales/`:

1. Add relevant locale keys following the module's existing key pattern
2. Use the Edit tool for insertion

### Action: `add-toolbar-action`

**Step 1: Edit the blade template**

1. Read the target blade file
2. Locate the toolbar slot. Look for:
   - `<template #toolbar>` — if it exists, insert inside it
   - If no toolbar slot exists, add one inside the `<VcBlade>` component:
     ```vue
     <template #toolbar>
       <VcButton
         :label="t('{I18N_PREFIX}.PAGES.{PAGE_TYPE}.TOOLBAR.{SCREAMING_SNAKE(action.id)}')"
         {'icon="{action.icon}"' if action.icon}
         {':disabled="{action.disabled}"' if action.disabled}
         @click="{action.handler}"
       />
     </template>
     ```
3. If toolbar slot already has items, insert the new `<VcButton>` after the last existing button
4. Use the Edit tool for the insertion

**Step 2: Add handler**

1. If the handler belongs in a composable:
   - Read the composable file
   - Insert `action.handlerCode` before the return statement
   - Add the handler to the return statement
   - Update the blade's composable destructuring to include the new function
2. If the handler belongs in the blade script:
   - Insert `action.handlerCode` in the blade's `<script setup>` section

**Step 3: Add locale keys**

For EVERY `.json` file in `{targetDir}/locales/`:

1. Navigate to the toolbar key section (e.g., `{I18N_PREFIX}.PAGES.{PAGE_TYPE}.TOOLBAR`)
2. Add the new key: `"{SCREAMING_SNAKE(action.id)}": "{action.label}"`
3. If the toolbar section doesn't exist in the locale structure, create it
4. Use the Edit tool for insertion

### Action: `link-blades`

**Step 1: Add blade import**

1. Read the target blade file
2. If `link.destinationImport` is provided, add the import to `<script setup>`:
   ```ts
   import {link.destinationBlade} from "{link.destinationImport}";
   ```
3. If no import path (same module), ensure the blade is imported from the module's pages barrel or directly

**Step 2: Add trigger in template**

Based on `link.trigger`:

- **`row-click`**: Ensure `@item-click` handler on `<VcDataTable>` calls the open blade function. If `@item-click` already exists, update its handler.

- **`button`**: Add a `<VcButton>` at the appropriate location:

  ```vue
  <VcButton
    :label="t('{I18N_PREFIX}.PAGES.{PAGE_TYPE}.ACTIONS.{SCREAMING_SNAKE(link.destinationBlade)}')"
    {'icon="{link.buttonIcon}"' if link.buttonIcon}
    @click="openBladeFn"
  />
  ```

- **`row-action`**: Add an action to the VcDataTable's row actions configuration.

**Step 3: Add handler function**

1. In the blade's `<script setup>` (or composable if complex):
   ```ts
   const open{link.destinationBlade} = (item?: EntityType) => {
     openBlade({
       component: {link.destinationBlade},
       param: item?.id,
       ...link.openBladeOptions,
     });
   };
   ```
2. If `link.handlerCode` is provided, use that instead of the default pattern
3. Ensure `openBlade` is available (imported from `useBlade()` or already destructured)

**Step 4: Add locale keys**

For EVERY `.json` file in `{targetDir}/locales/`:

1. Add the button/link label key following the module's key pattern
2. Use the Edit tool for insertion

### Handling unexpected structures

If the target file has a non-standard structure (e.g., custom table component instead of VcDataTable, non-standard composable pattern, inline script without composable):

1. Attempt the edit using best-effort pattern matching
2. Set status to `DONE_WITH_CONCERNS`
3. Record a concern describing what was unexpected and what the developer should verify

## Output Contract

Report format:

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED
Actions applied:
  - {action.type} "{action description}" -> {target file} — {change summary}
  - ...
Locale files updated:
  - {locale file path} — {N} keys added
  - ...
Warnings:
  - {warning message}
  - ...
Concerns:
  - {concern description (only if DONE_WITH_CONCERNS)}
  - ...
```

No new files are created (unless a new composable directory is needed for `add-logic`). Only existing files are modified in-place, plus locale key additions.

## Self-Check

Before completing, verify:

- [ ] Each action was applied to the correct target file
- [ ] Locale keys were added to ALL `.json` files in `{targetDir}/locales/` (not just `en.json`)
- [ ] Existing code was preserved — only additions and targeted modifications were made
- [ ] Imports were added where needed (no missing imports)
- [ ] No duplicate code was introduced (checked for existing similar columns, fields, functions)
- [ ] Indentation and code style matches the existing file conventions
- [ ] All `t(...)` calls follow the module's existing i18n key pattern
- [ ] For `add-column`: VcColumn attributes match the column schema (type, sortable, mobile attrs)
- [ ] For `add-field`: binding type (v-model vs :modelValue) is correct for the component
- [ ] For `add-logic`: new logic is added to composable return statement if it needs to be exposed
- [ ] For `add-toolbar-action`: handler is accessible from the template (in scope of `<script setup>`)
- [ ] For `link-blades`: `openBlade` is available and destination blade is imported
- [ ] Edit tool was used for all modifications — no files were rewritten entirely
