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
    "entityTypePath": "string — import path for entity types (e.g., '../../api_client/virtocommerce.mymodule')",
    "clientClass": "string — NSwag client class name (e.g., 'MyEntityClient')",
    "crudMethods": {
      "get": "string? — camelCase get method on client (e.g., 'getUser')",
      "create": "string? — camelCase create method (e.g., 'createUser')",
      "update": "string? — camelCase update method (e.g., 'updateUser')",
      "delete": "string? — camelCase delete method (e.g., 'deleteUsers')"
    },
    "fields": [
      {
        "name": "string — camelCase field name",
        "type": "string — 'string' | 'text' | 'rich-text' | 'boolean' | 'number' | 'currency' | 'date-time' | 'Date' | 'enum' | 'multi-select' | 'image' | 'gallery' | 'file' | 'rating' | 'range' | 'color' | 'array'",
        "required": "boolean?",
        "label": "string? — display label override",
        "component": "string? — explicit component override (e.g., 'VcTextarea', 'VcEditor', 'VcInputCurrency'). If provided, use this instead of type-based mapping."
      }
    ],
    "isStandalone": "boolean — true if this is a workspace blade with its own URL (settings/profile page)",
    "knowledgeBase": "string — absolute path to skill/knowledge/",
    "docsRoot": "string — absolute path to skill/knowledge/docs/",
    "targetDir": "string — absolute path to output module directory"
  },
  "optional": {
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
  }
}
```

## Knowledge Loading

Before generating, Read these files in order:

1. `{knowledgeBase}/patterns/details-blade-pattern.md` — full blade template and script skeleton
2. `{knowledgeBase}/patterns/composable-details.md` — singular composable skeleton and rules
3. `{knowledgeBase}/index.md` — to find relevant component docs

From `index.md`, identify and Read docs from `{docsRoot}/` for:
- **Always:** `VcBlade`, `VcForm`, `VcInput`, `VcSelect`, `VcSwitch`
- **Based on field types present:** Read docs for each component that appears in the field type mapping below (e.g., if any field has type `text` → read `VcTextarea` docs; if `rich-text` → read `VcEditor` docs; if `currency` → read `VcInputCurrency` docs; etc.)
- **Layout:** If 5+ fields → read `VcCard` docs; if 8+ fields → read `VcAccordion` docs

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

### Existing Module Context

When `existingModule` is provided:
- Use the same `localePrefix` convention from `existingModule.localePrefix` instead of deriving a new one. This ensures i18n keys are consistent across all blades in the module.
- Reference `existingModule.blades` to avoid naming collisions with existing blade component names.

When `linkTo` is provided:
- After generating the new details blade, open the source blade file specified by `linkTo.blade` (resolve from `existingModule.indexPath` parent directory + `pages/`).
- Add an `openBlade` call to the source blade based on `linkTo.trigger`:
  - `"button"` — add a toolbar button with `linkTo.label` that calls `openBlade({ blade: {bladeComponentName} })`
  - `"row-action"` — add a row action in the VcDataTable that opens the new blade on click
  - `"tab"` — add a tab entry that renders the new blade inline
- Import the new blade component at the top of the source blade's `<script setup>`.

### Step 2: Map fields to components

For each field in `fields`, determine the component using this table. If the field already has a `component` property (from `/vc-app design`), use that directly. Otherwise, map from `type`:

| Field type | Component | Validation rules | Notes |
|------------|-----------|------------------|-------|
| `string` | `VcInput` | `required` (if required) | Default for short text. Use `rules="email"` if name contains "email", `type="tel"` if phone, `type="url"` if url/website |
| `text` | `VcTextarea` | `required` (if required) | Long text: description, notes, comments, bio, summary |
| `rich-text` | `VcEditor` | `required` (if required) | HTML/WYSIWYG: body, content, article, template |
| `boolean` | `VcSwitch` | none | No `Field` wrapper. Default for toggles (isActive, isEnabled) |
| `boolean` | `VcCheckbox` | none | No `Field` wrapper. Use for consent/accept semantics (agreeTerms) |
| `number` | `VcInput type="number"` | `required\|bigint\|min_value:0` | Plain numbers: quantity, count, age |
| `currency` | `VcInputCurrency` | `required\|min_value:0` | Money: price, cost, amount, salary. Set `currency="USD"` (or infer from context) |
| `date-time` | `VcDatePicker` | `required` (if required) | Preferred over `VcInput type="datetime-local"`. Calendar picker widget |
| `Date` | `VcDatePicker` | `required` (if required) | Legacy alias — same as `date-time` |
| `enum` | `VcSelect` | `required` (if required) | For 6+ options or dynamic options. Needs `{field}Options` computed |
| `enum` (2-5 options) | `VcRadioGroup` | `required` (if required) | More visual for small static sets. Needs `{field}Options` array |
| `multi-select` | `VcMultivalue` | none | Tags/multi-pick: tags, categories, roles. No `Field` wrapper needed |
| `multi-select` (static) | `VcCheckboxGroup` | none | Few static checkboxes. Needs `{field}Options` array |
| `rating` | `VcRating` | none | Star rating 1-5. No `Field` wrapper needed |
| `range` | `VcSlider` | none | Numeric slider: discount, percentage. Set `:min` / `:max` |
| `color` | `VcColorInput` | none | Color picker with hex. No `Field` wrapper needed |
| `image` | `VcImageUpload` | none | Single image upload with preview |
| `gallery` | `VcGallery` | none | Multi-image management grid |
| `file` | `VcFileUpload` | none | File attachment. Set `:accept` filter for allowed extensions |
| `array` | `VcDataTable` (inline) | none | Read-only nested table |

**Field name heuristics:** When field type is plain `"string"`, upgrade based on the field name:
- `description`, `notes`, `comment`, `bio`, `summary`, `about` → `text` (VcTextarea)
- `body`, `content`, `html`, `article`, `template` → `rich-text` (VcEditor)
- `price`, `cost`, `amount`, `total`, `salary`, `budget`, `fee` → `currency` (VcInputCurrency)
- `avatar`, `logo`, `photo`, `thumbnail`, `banner` → `image` (VcImageUpload)
- `tags`, `labels`, `categories`, `roles`, `permissions` → `multi-select` (VcMultivalue)
- `rating`, `score`, `stars` → `rating` (VcRating)
- `color`, `colour`, `brandColor` → `color` (VcColorInput)

Refer to `details-blade-pattern.md` → "Field Type → Component Mapping" section for full template examples of each component.

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

### Mock Mode

When `dataSource` fields are empty/null (no API client), the generator must:

1. Wrap mock data-source code with `// vc-app:mock-start` and `// vc-app:mock-end` markers
2. Generate mock `fetchItem`, `saveItem`, `deleteItem` functions inside the marker block

Instead of the normal composable that imports API client classes, generate this mock composable body:

```ts
// vc-app:mock-start
const mockData: Record<string, unknown>[] = [
  { id: "1", name: "Item 1", status: "active", createdDate: new Date().toISOString() },
];

const fetchItem = async (id: string) => {
  return mockData.find((item) => item.id === id) ?? {};
};

const saveItem = async (item: Record<string, unknown>) => {
  console.log("Mock save:", item);
  return item;
};

const deleteItem = async (id: string) => {
  console.log("Mock delete:", id);
};
// vc-app:mock-end
```

Adapt the mock data entries to include all fields from the input `fields` array with appropriate sample values for each type. The details blade template and composable return shape remain the same — only the data-fetching internals change.

The markers `// vc-app:mock-start` and `// vc-app:mock-end` MUST appear exactly as shown — they are used by `/vc-app promote` to locate and replace mock code with real API calls.

### Step 4: Generate the details blade

Write to: `{targetDir}/pages/{moduleName}-details.vue`

Follow `details-blade-pattern.md` template exactly:

**Script setup:**
- `defineBlade({ name: "{bladeComponentName}" })` — no url/isWorkspace for child blades
- If `isStandalone: true`: `defineBlade({ name: "{bladeComponentName}", url: "{url}", isWorkspace: true, menuItem: { title: "{menuConfig.title}", icon: "{menuConfig.icon}", priority: {menuConfig.priority} } })` — standalone details blades that serve as the module entry point need a menu item to be accessible from navigation
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
- `<VcContainer>`

**Banners (contextual alerts):**
- Add `<VcBanner>` at the top of the form (before `<VcForm>`) for state-dependent alerts. See `details-blade-pattern.md` → "Contextual Banners Pattern".
- Use `variant="info"` for creation hints, `variant="danger"` for errors, `variant="warning"` for missing data.
- Example: `<VcBanner v-if="!entity.id" variant="info" icon="lucide-lightbulb" icon-size="l">{{ $t("...CREATE_HINT") }}</VcBanner>`

**Form fields:**
- `<VcForm>` wraps all editable fields
- Use the component determined in Step 2 for each field. Refer to `details-blade-pattern.md` for full template examples of each component type.
- Components that need `<Field>` wrapper (for validation): `VcInput`, `VcTextarea`, `VcEditor`, `VcDatePicker`, `VcSelect`, `VcRadioGroup`, `VcInputCurrency`, `VcFileUpload`
- Components that do NOT need `<Field>` wrapper: `VcSwitch`, `VcCheckbox`, `VcMultivalue`, `VcRating`, `VcSlider`, `VcColorInput`, `VcImageUpload`, `VcGallery`
- For array fields: separate `<VcRow>` with inline `<VcDataTable>`
- Use i18n keys: `{i18nPrefix}.FIELDS.{FIELD_NAME_UPPER}.LABEL` and `.PLACEHOLDER`

**Read-only fields (VcField):**
- For fields that should display data without editing (computed values, IDs, timestamps on existing entities), use `<VcField>` instead of `<VcInput>`:
  ```vue
  <VcField :label="$t('...')" :model-value="entity.number" orientation="horizontal" :aspect-ratio="[1, 2]" copyable type="text" />
  ```
- See `details-blade-pattern.md` → "Read-Only Details Pattern".
- Use `VcField` when: the blade is view-only, or for specific non-editable fields within an editable form (order number, creation date).

**Layout — ALWAYS use VcCard sections:**
- Group related fields in `<VcCard :header="$t('...')">` sections. This is how real vc-shell apps are built — flat forms without cards look unfinished.
- If 3+ fields → at minimum 1 card. If 5+ fields → 2+ cards grouped by topic.
- If 8+ fields → consider `<VcAccordion>` for secondary/advanced fields.
- **Grid:** Use `<VcRow><VcCol>` to arrange short fields in 2 columns. Wide fields (`VcTextarea`, `VcEditor`, `VcGallery`, `VcDataTable`) span full width.

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
- [ ] `boolean` fields use `VcSwitch` (or `VcCheckbox` for consent) without a `Field` wrapper
- [ ] `enum` fields use `VcSelect` (6+ options) or `VcRadioGroup` (2-5 options) with `option-value` and `option-label` props
- [ ] `text` fields use `VcTextarea`, NOT `VcInput`
- [ ] `rich-text` fields use `VcEditor`, NOT `VcTextarea`
- [ ] `currency` fields use `VcInputCurrency`, NOT `VcInput type="number"`
- [ ] `date-time` fields use `VcDatePicker`, NOT `VcInput type="datetime-local"`
- [ ] `multi-select` fields use `VcMultivalue` or `VcCheckboxGroup`
- [ ] `image` fields use `VcImageUpload`, `gallery` uses `VcGallery`, `file` uses `VcFileUpload`
- [ ] `rating` fields use `VcRating`, `range` uses `VcSlider`, `color` uses `VcColorInput`
- [ ] `array` fields render as inline `VcDataTable` in a separate `VcRow`
- [ ] Components without `Field` wrapper: `VcSwitch`, `VcCheckbox`, `VcMultivalue`, `VcRating`, `VcSlider`, `VcColorInput`, `VcImageUpload`, `VcGallery`
- [ ] Wide components (`VcTextarea`, `VcEditor`, `VcGallery`, `VcDataTable`) span full width, not in 2-col grid
- [ ] `useModificationTracker` is used in composable (not blade)
- [ ] `resetModificationState()` called after fetch AND after create/update
- [ ] No `useI18n` import in the composable file
- [ ] Only toolbar buttons corresponding to provided `crudMethods` are generated
