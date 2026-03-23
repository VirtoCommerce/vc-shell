# `/vc-app generate` Enhance Flow — Design Spec

> When a module already exists, `/vc-app generate` switches to enhance mode — surgical modifications to existing blades, composables, and locales.

## Problem

Currently `/vc-app generate` only creates new modules from scratch. Developers need to iteratively add functionality to existing modules: new blades, fields, toolbar actions, navigation links, business logic. This is done manually today.

## Solution

Extend `/vc-app generate` to detect existing modules and offer an enhance flow. One command for both creation and enhancement.

## Detection Logic

In Phase 1, after the user provides a module name:

```
if src/modules/<moduleName>/ exists:
  → enhance flow
else:
  → create flow (current behavior)
```

## Enhance Flow

### Phase 1: Module Analysis + Intent

1. **Dispatch `module-analyzer` agent** to read the existing module:
   - `index.ts` — registered blades, imports
   - `pages/*.vue` — blade names, columns, form fields, toolbar, openBlade calls
   - `composables/*.ts` — exports, API connections, data fields
   - `locales/*.json` — existing i18n keys

2. **Show module summary:**
   ```
   Module "team" (enhance mode):
     Blades: TeamList (list), TeamDetails (details)
     Composables: useList (VcmpSellerSecurityClient.searchSellerUsers), useDetails (get/update/delete)
     API: VcmpSellerSecurityClient → SellerUser
     Columns: name, email, isActive, createdDate
     Form fields: name, email, roles, isActive

   What would you like to do? (describe in free text)
   ```

3. **User describes intent** in free text, e.g.:
   - "add an email column to the list and a phone field to the details form"
   - "add a blade for team roles with list+details, link from team details"
   - "add an Export button to the list toolbar that downloads CSV"
   - "add validation: name must be unique, check on blur via API"

4. **Skill parses intent into an action plan:**
   ```
   Plan:
     1. Add column "phone" to TeamList blade (after "email")
     2. Add field "phone" to TeamDetails form (type: input, required: false)
     3. Update useDetails composable — add "phone" to saved fields
     4. Add locale keys: TEAM.LIST.PHONE, TEAM.DETAILS.PHONE

   Proceed? (y/n, or describe changes)
   ```

5. User confirms or corrects.

### Phase 2: Data Source (conditional)

Only runs when the action plan requires new API entities or methods:
- **Adding a new blade with different entity** → full Phase 2 (entity selection, field selection)
- **Adding fields from the same entity** → skip, fields come from the existing API type
- **Adding logic/toolbar** → skip

### Phase 3: Execution

Dispatch agents based on the action plan:

**For new blades** → existing `list-blade-generator` / `details-blade-generator` with extra context:
```json
{
  "existingModule": {
    "blades": ["TeamList", "TeamDetails"],
    "localePrefix": "TEAM",
    "indexPath": "src/modules/team/index.ts"
  },
  "linkTo": {
    "blade": "TeamDetails",
    "trigger": "button",
    "label": "Manage Roles"
  }
}
```

**For modifications to existing files** → dispatch `blade-enhancer` agent.

**For integration** → dispatch `module-assembler` in append mode.

### Phase 4: Verify

Type-checker as usual.

## Operations

### 1. Add blade

Creates new files, updates existing ones for integration.

| Created | Updated |
|---------|---------|
| `pages/<name>-list.vue` | `index.ts` (register blade) |
| `pages/<name>-details.vue` | locales (new namespace) |
| `composables/use<Name>List.ts` | Source blade (openBlade link, if requested) |
| `composables/use<Name>Details.ts` | |

### 2. Add fields/columns

Modifies existing files only.

| File | Change |
|------|--------|
| `pages/*-list.vue` | Add `<VcColumn>` element |
| `pages/*-details.vue` | Add form field component |
| `composables/useList.ts` | Add field to type references if needed |
| `composables/useDetails.ts` | Add field to save payload, add validation |
| `locales/*.json` | Add column/field label keys |

### 3. Add logic

Modifies existing composable and/or blade.

| File | Change |
|------|--------|
| `composables/use*.ts` | Add function/computed/watcher |
| `pages/*.vue` | Wire up to template (button, computed display, etc.) |
| `locales/*.json` | Add label keys if needed |

### 4. Link blades

Modifies both blades to set up navigation.

| File | Change |
|------|--------|
| Source blade `.vue` | Add openBlade call (button click / row action / tab) |
| Source `composable` | Add handler function if complex logic needed |
| `locales/*.json` | Add button/link label key |

### 5. Toolbar actions

Modifies blade and composable.

| File | Change |
|------|--------|
| `pages/*.vue` | Add toolbar item in template |
| `composables/use*.ts` | Add handler function + any state |
| `locales/*.json` | Add action label key |

## New Subagent: `module-analyzer.md`

### Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory"
  }
}
```

### Output Contract

```json
{
  "moduleName": "team",
  "blades": [
    {
      "name": "TeamList",
      "type": "list",
      "file": "pages/team-list.vue",
      "url": "/team",
      "columns": [{ "name": "name", "type": "string" }],
      "toolbarActions": ["delete"],
      "linksTo": ["TeamDetails"]
    }
  ],
  "composables": [
    {
      "name": "useList",
      "file": "composables/useList.ts",
      "apiClient": "VcmpSellerSecurityClient",
      "entity": "SellerUser",
      "methods": ["search", "delete"],
      "exports": ["data", "loading", "getItems", "removeItems"]
    }
  ],
  "localeKeys": ["TEAM.MENU.TITLE", "TEAM.LIST.NAME", "..."],
  "apiConnected": true
}
```

## New Subagent: `blade-enhancer.md`

### Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory",
    "moduleAnalysis": "object — output from module-analyzer",
    "actions": "array — list of actions from the confirmed plan"
  },
  "optional": {
    "dataSource": "object — DATA_SOURCE if new entity involved",
    "knowledgeBase": "string — path to knowledge directory",
    "docsRoot": "string — path to docs directory"
  }
}
```

### Action Format

Each action in the `actions` array:

```json
{
  "type": "add-column | add-field | add-logic | add-toolbar-action | link-blades",
  "target": "TeamList",
  "details": {
    // type-specific details
  }
}
```

**add-column:**
```json
{
  "type": "add-column",
  "target": "TeamList",
  "details": {
    "name": "phone",
    "apiField": "phoneNumber",
    "type": "string",
    "sortable": true,
    "after": "email"
  }
}
```

**add-field:**
```json
{
  "type": "add-field",
  "target": "TeamDetails",
  "details": {
    "name": "phone",
    "apiField": "phoneNumber",
    "component": "VcInput",
    "type": "string",
    "required": false,
    "after": "email"
  }
}
```

**add-logic:**
```json
{
  "type": "add-logic",
  "target": "useDetails",
  "details": {
    "description": "validate name uniqueness on blur via API call",
    "affectsTemplate": true,
    "templateTarget": "TeamDetails"
  }
}
```

**add-toolbar-action:**
```json
{
  "type": "add-toolbar-action",
  "target": "TeamList",
  "details": {
    "label": "TEAM.ACTIONS.EXPORT",
    "icon": "lucide-download",
    "handler": "exportToCsv",
    "handlerDescription": "download current list data as CSV file"
  }
}
```

**link-blades:**
```json
{
  "type": "link-blades",
  "target": "TeamDetails",
  "details": {
    "destination": "TeamRolesList",
    "trigger": "button",
    "label": "TEAM.ACTIONS.MANAGE_ROLES",
    "passParam": "item.id"
  }
}
```

### Responsibilities

1. Read target files from `moduleAnalysis`
2. Apply surgical edits using the Edit tool — never rewrite entire files
3. Follow existing code patterns in the module (naming, imports style, etc.)
4. Update locales (all `.json` files in `locales/`)
5. Report modified files and any concerns

### When to escalate

If the requested change conflicts with existing code structure (e.g., adding a column but the blade uses a custom table setup instead of VcDataTable), report DONE_WITH_CONCERNS.

## Changes to Existing `/vc-app generate`

### Phase 1 modification

After module name is collected, add detection:

```
if (fs.existsSync(path.join(projectRoot, 'src/modules', moduleName))) {
  // Enhance mode
  dispatch module-analyzer
  show summary
  collect free-text intent
  parse into action plan
  confirm with user
} else {
  // Create mode (current behavior)
}
```

### Phase 3 modification

In enhance mode, Phase 3 dispatches:
- `blade-enhancer` for modifications to existing files
- `list-blade-generator` / `details-blade-generator` for new blades (with `existingModule` context)
- `module-assembler` in append mode for index.ts updates

## Changes to `module-assembler.md`

Add `mode` parameter:
- `mode: "create"` — current behavior, generate index.ts from scratch
- `mode: "append"` — read existing index.ts, add new blade imports/registrations

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Module not found | Fall through to create flow |
| Module has no composables (manual module) | Warn, offer to create composable structure first |
| Requested field already exists | Skip, notify user |
| Blade name collision | Suggest alternative name |
| Complex custom code in target file | blade-enhancer reports DONE_WITH_CONCERNS |

## Command Reference

Same command, context-aware:

```
/vc-app generate

  If module exists → enhance mode (analyze, plan, modify)
  If module doesn't exist → create mode (current behavior)
```
