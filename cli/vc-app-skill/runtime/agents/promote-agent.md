---
name: promote-agent
description: Performs surgical edits on a prototype module to replace mock data sources with real API client calls, remap fields, and update locales.
---

## Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory",
    "prototypeMetadata": {
      "generatedFiles": ["string — relative paths from targetDir (e.g., 'composables/useTeamMembers/index.ts', 'pages/team-list.vue')"],
      "bladeTypes": "string — 'list-and-details' | 'list-only' | 'details-only'",
      "moduleName": "string — kebab-case module name",
      "entityName": "string — PascalCase entity name"
    },
    "dataSource": {
      "clientClass": "string — NSwag client class name (e.g., 'MyEntityClient')",
      "entityType": "string — PascalCase entity type (e.g., 'MyEntity')",
      "entityTypePath": "string — import path for entity types (e.g., '../../api_client/virtocommerce.mymodule')",
      "searchMethod": "string? — camelCase search method on client",
      "getMethod": "string? — camelCase get method on client",
      "createMethod": "string? — camelCase create method on client",
      "updateMethod": "string? — camelCase update method on client",
      "deleteMethod": "string? — camelCase delete method on client"
    },
    "fieldMap": {
      "<mockFieldName>": {
        "action": "string — 'map' | 'delete' | 'keep-stub' | 'computed'",
        "target": "string? — real API field name (required when action is 'map')",
        "note": "string? — explanation (used for 'keep-stub' and 'computed' TODO comments)"
      }
    }
  },
  "optional": {
    "knowledgeBase": "string — absolute path to skill/knowledge/",
    "docsRoot": "string — absolute path to skill/knowledge/docs/"
  }
}
```

## Knowledge Loading

Before transforming, Read these files if paths are provided:

1. `{knowledgeBase}/patterns/composable-list.md` — composable skeleton for reference on real API call patterns
2. `{knowledgeBase}/patterns/composable-details.md` — singular composable skeleton for reference
3. `{knowledgeBase}/patterns/list-blade-pattern.md` — blade template reference
4. `{knowledgeBase}/patterns/details-blade-pattern.md` — blade template reference

These provide the canonical patterns for what the real API integration code should look like.

## Generation Rules

**Important:** This agent performs _surgical edits_ on existing files — not regeneration. All code outside the edited regions must be preserved exactly. Only files listed in `prototypeMetadata.generatedFiles` are modified (plus locale files, which are handled separately).

If `bladeTypes` is `"list-only"`, skip all details composable and details blade files.
If `bladeTypes` is `"details-only"`, skip all list composable and list blade files.

### Step 1: Validate generated files

For each path in `prototypeMetadata.generatedFiles`:

1. Check that `{targetDir}/{path}` exists on disk
2. Read the file contents
3. If a file is missing, record a warning: `"MISSING: {path} — listed in prototypeMetadata but not found on disk"`

If ALL files are missing, set status to `BLOCKED` and stop.

### Step 2: Transform composables

Process each composable file (`.ts` files under `composables/`) listed in `generatedFiles`.

#### 2a: Locate mock markers

Search for `// vc-app:mock-start` and `// vc-app:mock-end` markers in the file.

**Primary path (markers found):**

- Extract the entire block between `// vc-app:mock-start` and `// vc-app:mock-end` (inclusive of the marker lines)
- Replace the block with the real API integration code (see Step 2c)
- Remove the marker comments themselves

**Fallback path (markers NOT found):**

- Pattern-match mock function signatures: look for functions that return hardcoded arrays/objects, `const mockData`, `const mock`, `setTimeout` simulating async, or inline `Promise.resolve(...)` with literal data
- Replace matched regions with real API integration code
- Set status to `DONE_WITH_CONCERNS` with concern: `"Mock markers not found in {filePath} — used pattern-matching fallback. Verify edits manually."`

#### 2b: Update imports

At the top of the file, apply these import changes:

**Add** (if not already present):

```ts
import { useApiClient } from "@vc-shell/framework";
import { {dataSource.clientClass} } from "{dataSource.entityTypePath}";
import { {dataSource.entityType}, /* SearchQuery, SearchResult types as needed */ } from "{dataSource.entityTypePath}";
```

**Remove:**

- Any imports that reference mock data files or mock type definitions that no longer exist
- Do NOT remove other existing imports (framework composables, Vue imports, etc.)

#### 2c: Replace mock data source with real API calls

Insert in place of the mock block:

```ts
const apiClient = useApiClient({dataSource.clientClass});
```

Then replace mock function bodies:

- **List composable** (`useList` / `use{EntityPlural}`):
  - Mock search/fetch function → `apiClient.{dataSource.searchMethod}(query)`
  - Mock remove function → `apiClient.{dataSource.deleteMethod}(ids)`
- **Details composable** (`useDetails` / `use{EntitySingular}`):
  - Mock get function → `apiClient.{dataSource.getMethod}(id)`
  - Mock save/create function → `apiClient.{dataSource.createMethod}(item)` / `apiClient.{dataSource.updateMethod}(item)`
  - Mock delete function → `apiClient.{dataSource.deleteMethod}(ids)`

If a method is not provided in `dataSource` (e.g., `deleteMethod` is undefined), leave a TODO comment:

```ts
// TODO [vc-app:promote]: deleteMethod not provided — implement manually
```

#### 2d: Update types

- Replace `Record<string, unknown>` with `{dataSource.entityType}` wherever it appears as a type annotation or generic parameter
- Replace `ref<Record<string, unknown>>({})` with `ref<{dataSource.entityType}>()`
- Replace `ref<Record<string, unknown>[]>([])` with `ref<{dataSource.entityType}[]>([])`

#### 2e: Apply fieldMap to composable code

For each entry in `fieldMap`:

- **`action: "map"`** — Rename all references to the mock field name (`<mockFieldName>`) to the target field name (`target`) throughout the composable. This includes:
  - Object property access: `item.mockField` → `item.targetField`
  - Destructuring: `{ mockField }` → `{ targetField }`
  - String literals used as field identifiers: `"mockField"` → `"targetField"`
  - Computed property keys and template literals referencing the field

- **`action: "delete"`** — Remove code blocks that reference the deleted field. If the field appears in a return statement or interface, remove it. If it appears in logic that cannot be cleanly removed, comment it out with:

  ```ts
  // TODO [vc-app:promote]: removed field "{mockFieldName}" — clean up surrounding logic
  ```

- **`action: "keep-stub"`** — Leave the existing code for this field in place and add a comment:

  ```ts
  // TODO [vc-app:promote]: {mockFieldName} — kept as stub, provide implementation
  ```

- **`action: "computed"`** — Leave the existing code for this field in place and add a comment:
  ```ts
  // TODO [vc-app:promote]: {mockFieldName} — computed field, implement: {note}
  ```

#### 2f: Preserve untouched code

All code outside the mock block and the renamed/deleted field references must remain exactly as-is. This includes:

- Computed properties
- Watchers
- Validation logic
- Custom helper methods
- Comments (except mock marker comments)

### Step 3: Transform blades

Process each Vue blade file (`.vue` files under `pages/`) listed in `generatedFiles`.

#### 3a: Template section

For each entry in `fieldMap`:

- **`action: "map"`** — Rename field references in:
  - `<VcColumn>` elements: update `id`, `field` attributes, and `:title` i18n key suffixes
  - Form component bindings: `:modelValue="item.mockField"` → `:modelValue="item.targetField"`, `v-model="item.mockField"` → `v-model="item.targetField"`
  - `#body` slot template variable access: `data.mockField` → `data.targetField`
  - Any other attribute or interpolation referencing the field

- **`action: "delete"`** — Remove the entire element:
  - For `<VcColumn id="mockField" ...>` — remove the full `<VcColumn>` element including any `#body` slot content
  - For form fields — remove the entire form component element (`<VcInput>`, `<VcSelect>`, `<VcSwitch>`, etc.) that binds to the deleted field
  - If the element is wrapped in a layout container (`<div>`, `<VcRow>`) that contains only this field, remove the container too

- **`action: "keep-stub"` / `action: "computed"`** — Leave the template element as-is (no changes needed in template; the TODO is in the composable)

#### 3b: Script section

- Update type annotations if the entity type is explicitly referenced: `Record<string, unknown>` → `{dataSource.entityType}`
- Rename field references in script logic per `fieldMap` (same rules as Step 2e for `"map"` and `"delete"` actions)
- Update imports if the entity type needs to be imported

### Step 4: Transform locales

Locale files are NOT listed in `generatedFiles`. Instead:

1. Scan `{targetDir}/locales/` for ALL `.json` files
2. For each `.json` file, apply the following transformations:

For each entry in `fieldMap`:

- **`action: "map"`** — Find i18n keys that contain the mock field name (in SCREAMING_SNAKE_CASE) and rename them to use the target field name:
  - `"NAME": "Name"` → `"DISPLAY_NAME": "Display Name"` (when mapping `name` → `displayName`)
  - Match keys at any nesting level under the module's namespace

- **`action: "delete"`** — Remove the i18n key entry for the deleted field

- **Add placeholders** — For any field in `dataSource` that appears in the API entity but has no corresponding key in the locale file and is not in `fieldMap` as a deletion, add a placeholder entry:
  ```json
  "NEW_FIELD_NAME": "New Field Name"
  ```
  (Convert camelCase field name to SCREAMING_SNAKE_CASE for the key, and to Title Case for the placeholder value)

3. Write the updated JSON back to each locale file, preserving existing formatting (indentation level)

### Step 5: Scan for additional affected files

After processing all `generatedFiles` and locale files:

1. List all `.ts` and `.vue` files in `{targetDir}/` recursively
2. Exclude files already processed (those in `generatedFiles` and locale files)
3. For each remaining file, check if it imports from any composable that was modified in Step 2
4. If such imports are found, record a warning:
   ```
   WARNING: {filePath} imports from modified composable {composablePath} — may need manual updates for renamed/deleted fields
   ```

Do NOT modify these files — only warn about them.

### Step 6: Generate report

Compile the final report with:

- **Status:**
  - `DONE` — all transformations applied cleanly using mock markers
  - `DONE_WITH_CONCERNS` — transformations applied but with fallback pattern-matching or ambiguities
  - `BLOCKED` — cannot proceed (all files missing, or critical error)

- **Files modified:** list each file with a one-line summary of changes (e.g., `"composables/useTeamMembers/index.ts — replaced mock data source with UserSecurityClient API calls, renamed 3 fields"`)

- **Warnings:** list all warnings collected during Steps 1-5

- **Concerns:** (only if `DONE_WITH_CONCERNS`) describe what was ambiguous and what the developer should verify

## Output Contract

Report format:

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED
Files modified:
  - {relativePath} — {change summary}
  - ...
Warnings:
  - {warning message}
  - ...
Concerns:
  - {concern description (only if DONE_WITH_CONCERNS)}
  - ...
```

No new files are created. Only existing files are modified in-place.

## Self-Check

Before completing, verify:

- [ ] Every file in `prototypeMetadata.generatedFiles` was checked for existence
- [ ] Mock markers (`// vc-app:mock-start` / `// vc-app:mock-end`) were the primary replacement targets
- [ ] If markers were absent, pattern-matching fallback was used AND status set to `DONE_WITH_CONCERNS`
- [ ] `useApiClient({clientClass})` call was added in each composable
- [ ] Import for `{clientClass}` and `{entityType}` was added from `{entityTypePath}`
- [ ] `import { useApiClient } from "@vc-shell/framework"` was added if not present
- [ ] All `Record<string, unknown>` type references were replaced with `{entityType}`
- [ ] All `fieldMap` entries were applied — each action type handled:
  - [ ] `map` — field renamed in composables, blade templates, blade scripts, and locale keys
  - [ ] `delete` — field removed from composables, blade elements removed, locale keys removed
  - [ ] `keep-stub` — TODO comment added in composable
  - [ ] `computed` — TODO comment with note added in composable
- [ ] ALL `.json` files in `locales/` directory were processed (not just one locale)
- [ ] Placeholder keys were added for new API fields not present in mock
- [ ] Code outside mock markers and field references was NOT modified
- [ ] Additional `.ts`/`.vue` files importing from modified composables were detected and warned about
- [ ] `bladeTypes` was respected — skipped irrelevant files for `list-only` / `details-only`
- [ ] Report includes status, files modified, warnings, and concerns (if applicable)
