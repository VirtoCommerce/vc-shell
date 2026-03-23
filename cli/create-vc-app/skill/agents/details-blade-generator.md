---
name: details-blade-generator
description: Generates a details blade Vue component and its singular composable for viewing/editing a single entity.
---

## Input Contract

```json
{
  "required": {
    "moduleName": "string — kebab-case module name (e.g., 'team', 'catalog-items')",
    "entityName": "string — PascalCase entity name (e.g., 'TeamMember', 'Order')",
    "entityTypePath": "string — import path for entity types (e.g., '../../api_client/virtocommerce.marketplace')",
    "clientClass": "string — NSwag client class name (e.g., 'VcmpSellerSecurityClient')",
    "crudMethods": {
      "get": "string? — camelCase get method on client (e.g., 'getSellerUser')",
      "create": "string? — camelCase create method (e.g., 'createSellerUser')",
      "update": "string? — camelCase update method (e.g., 'updateSellerUser')",
      "delete": "string? — camelCase delete method (e.g., 'deleteSellerUsers')"
    },
    "fields": [
      {
        "name": "string — camelCase field name",
        "type": "string — 'string' | 'boolean' | 'number' | 'Date' | 'enum' | 'array'",
        "required": "boolean?",
        "label": "string? — display label override"
      }
    ],
    "isStandalone": "boolean — true if this is a workspace blade with its own URL (settings/profile page)",
    "knowledgeBase": "string — absolute path to skill/knowledge/",
    "docsRoot": "string — absolute path to skill/knowledge/docs/",
    "targetDir": "string — absolute path to output module directory"
  }
}
```

## Knowledge Loading

Before generating, Read these files in order:

1. `{knowledgeBase}/patterns/details-blade-pattern.md` — full blade template and script skeleton
2. `{knowledgeBase}/patterns/composable-details.md` — singular composable skeleton and rules
3. `{knowledgeBase}/index.md` — to find relevant component docs

From `index.md`, identify docs for `VcInput`, `VcSelect`, `VcSwitch`, `VcBlade`, `VcForm` and Read them from `{docsRoot}/`.

## Generation Rules

### Step 1: Derive naming variables

From inputs compute:
- `composableName` = `use` + `entityName` (e.g., `useTeamMember`)
- `entityNameLower` = camelCase of `entityName` (e.g., `teamMember`)
- `bladeComponentName` = PascalCase of `moduleName` + `Details` (e.g., `TeamDetails`)
- `i18nPrefix` = SCREAMING_SNAKE of `moduleName` (e.g., `TEAM`)
- `createCommandClass` = `Create` + `entityName` + `Command` (if `crudMethods.create` provided)
- `updateCommandClass` = `Update` + `entityName` + `Command` (if `crudMethods.update` provided)

For standalone blades:
- `url` = `"/" + moduleName + "-details"`

### Step 2: Map fields to components

For each field in `fields`, determine the component and rules:

| Field type | Component | Validation rules | Notes |
|------------|-----------|------------------|-------|
| `string` | `VcInput` | `required` (if required) | Default input |
| `boolean` | `VcSwitch` | none | No `Field` wrapper |
| `number` | `VcInput type="number"` | `required\|bigint\|min_value:0` | |
| `Date` | `VcInput type="datetime-local"` | `required` (if required) | |
| `enum` | `VcSelect` | `required` (if required) | Needs `statusOptions` computed |
| `array` | `VcDataTable` (inline) | none | Read-only nested table |

### Step 3: Generate the singular composable

Write to: `{targetDir}/composables/use{EntityName}/index.ts`

Follow `composable-details.md` skeleton exactly:
- Import `useModificationTracker`, `useApiClient`, `useAsync`, `useLoading`, `AsyncAction` from `@vc-shell/framework`
- Import entity types and command classes from `entityTypePath`
- Define `IUse{EntityName}` interface — include only methods present in `crudMethods`
- Use `useModificationTracker(entityRef)` — expose `currentValue` as `entity`
- For each method in `crudMethods`: create a `useAsync` block with separate loading ref
- Always call `resetModificationState()` after fetch and after save/update
- `resetEntries()` calls `resetModificationState(pristineValue.value)`
- `loading: useLoading(...)` aggregates all loading refs
- Export as default function

If a crudMethod is null/omitted, skip that `useAsync` block entirely — do not generate stub methods.

### Step 4: Generate the details blade

Write to: `{targetDir}/pages/{moduleName}-details.vue`

Follow `details-blade-pattern.md` template exactly:

**Script setup:**
- `defineBlade({ name: "{bladeComponentName}" })` — no url/isWorkspace for child blades
- If `isStandalone: true`: `defineBlade({ name: "{bladeComponentName}", url: "{url}", isWorkspace: true })`
- `const { onBeforeClose, param, options, callParent, closeSelf } = useBlade()`
- `const { meta } = useForm({ validateOnMount: false })`
- Import and destructure `{composableName}` — only include methods that exist in `crudMethods`
- `title` computed: `param.value ? entity.value?.name ?? t("...TITLE_EDIT") : t("...TITLE_NEW")`
- `isDisabled` computed: `!meta.value.dirty || !meta.value.valid`

**Toolbar items (include only for methods present in `crudMethods`):**
- `save` button: `isVisible: !!param.value`, calls `updateXxx` then `callParent("reload"); closeSelf()`
- `create` button: `isVisible: !param.value`, calls `createXxx` then `callParent("reload"); closeSelf()`
- `reset` button: `isVisible: !!param.value`, calls `resetEntries()`
- `delete` button: `isVisible: !!param.value`, shows confirmation then calls `deleteXxx`
- If `crudMethods.create` is null: omit create button
- If `crudMethods.update` is null: omit save and reset buttons
- If `crudMethods.delete` is null: omit delete button

**Template:**
- `<VcBlade :loading="loading" :modified="modified" :title="title" :toolbar-items="bladeToolbar" width="50%">`
- `<VcContainer><VcForm><VcRow>`
- For each non-array, non-boolean field: wrap in `<Field>` with `v-slot`, `name`, `:model-value`, `rules`
- For boolean fields: `<VcSwitch v-model="entity.{name}">` without Field wrapper
- For array fields: separate `<VcRow>` with inline `<VcDataTable>`
- Use i18n keys: `{i18nPrefix}.FIELDS.{FIELD_NAME_UPPER}.LABEL` and `.PLACEHOLDER`

**Close guard:**
```ts
onBeforeClose(async () => {
  if (modified.value) {
    return !(await showConfirmation(unref(computed(() => t("{i18nPrefix}.PAGES.ALERTS.CLOSE_CONFIRMATION")))));
  }
  return false;
});
```

### Step 5: Update composable barrel

Write to: `{targetDir}/composables/index.ts`

Append (or create):
```ts
export { default as use{EntityName} } from "./use{EntityName}";
```

## Output Contract

Files written to disk:
1. `{targetDir}/composables/use{EntityName}/index.ts`
2. `{targetDir}/pages/{moduleName}-details.vue`
3. `{targetDir}/composables/index.ts` (created or appended)

Returns a summary of generated files and any field type assumptions made.

## Self-Check

Before completing, verify:
- [ ] `defineBlade` is at module scope, not inside a function
- [ ] `useForm({ validateOnMount: false })` is called
- [ ] `onBeforeClose` guard is present if `modified` is used
- [ ] After save/delete: `callParent("reload")` before `closeSelf()`
- [ ] `disabled` on toolbar items is a `computed(...)`, not a plain boolean
- [ ] `boolean` fields use `VcSwitch` without a `Field` wrapper
- [ ] `enum` fields use `VcSelect` with `option-value` and `option-label` props
- [ ] `array` fields render as inline `VcDataTable` in a separate `VcRow`
- [ ] `useModificationTracker` is used in composable (not blade)
- [ ] `resetModificationState()` called after fetch AND after create/update
- [ ] No `useI18n` import in the composable file
- [ ] Only toolbar buttons corresponding to provided `crudMethods` are generated
