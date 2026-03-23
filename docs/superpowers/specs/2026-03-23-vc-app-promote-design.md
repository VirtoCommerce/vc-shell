# `/vc-app promote` — Design Spec

> Transition a module from prototype (mock data) to production (real API client).

## Problem

When prototyping with `/vc-app generate`, modules are created with mock data composables. After the backend team creates the API and the frontend runs `/vc-app connect`, the module needs to transition from mocks to real API calls. Currently this is a manual process — tedious and error-prone.

## Solution

A new `/vc-app promote <moduleName>` command that performs surgical replacement of the data layer while preserving all manual UI customizations.

## Prerequisites

- Module contains `.vc-app-prototype.json` marker file (created by generate)
- API client exists (generated via `/vc-app connect`)

## Skill Integration

**Command routing:** Add `promote` to the routing table in `vc-app.md` Step 1:
```
promote   → /vc-app promote
```

**Dispatch block** in `vc-app.md`:
```
## `/vc-app promote`

Transition a prototype module to use a real API client.

### Parse arguments
Extract module name from `$ARGUMENTS`. Format: `promote <moduleName>`.
If no name provided, ask the user.

### Execution
Follow the 5-phase flow defined below.
```

## Flow

### Phase 1: Validation

1. Read `src/modules/<moduleName>/.vc-app-prototype.json`
   - If missing → error: `"Module '<name>' is not a prototype. Only modules generated without an API client can be promoted."`
   - Validate `generatedFiles` paths — check each exists. If any are missing (user renamed/moved), warn and ask user to confirm or provide new paths.
2. Locate API client directory:
   - Check `src/api_client/` relative to project root
   - Check `APP_API_CLIENT_DIRECTORY` from `.env`
   - If not found → error: `"No API client found. Run /vc-app connect first."`

### Phase 2: Data Source Discovery

Reuse the same flow as `/vc-app generate` Phase 2:

1. Dispatch `api-analyzer` agent to discover entities
2. Present entities to user, user selects one
3. Read entity type file, extract fields
4. Present fields — user selects columns (for list, if `bladeTypes` includes "list") and form fields (for details, if `bladeTypes` includes "details")
5. Present available CRUD methods — user confirms

Output: `DATA_SOURCE` object (same structure as generate). Only the fields relevant to `bladeTypes` are populated (e.g., no `columns` for `details-only`).

### Phase 3: Field Mapping

Mock field names come from `prototypeMetadata.mockFields` (columns and/or formFields). API field names come from the newly selected `DATA_SOURCE`.

1. **Auto-match** mock fields to API fields:
   - Pass 1: exact name match (case-insensitive)
   - Pass 2: LLM semantic similarity — the orchestrator uses its own judgment to match by meaning and type compatibility (e.g., `name` → `displayName`, `status` → `orderStatus`). This is non-deterministic but reviewed by the user in step 2.
   - Pass 3: remaining fields marked as unmatched

2. **Present mapping for confirmation:**
   ```
   Field mapping (mock → API):
   ─────────────────────────────────
   ✓ name         → displayName    (auto: semantic)
   ✓ status       → orderStatus    (auto: semantic)
   ✓ createdDate  → createdDate    (auto: exact)
   ✗ priority     → ???

   Confirm mapping? (y to accept, or enter corrections)
   ```

3. **For unmatched fields**, ask per field:
   - `[D]elete` — remove from UI and composables
   - `[K]eep as stub` — leave with TODO comment
   - `[M]ap to <fieldName>` — manual mapping to an API field
   - `[C]omputed` — mark as computed, add TODO stub for user to implement

4. Store result:
   ```
   FIELD_MAP = {
     "name": { "action": "map", "apiField": "displayName", "apiType": "string" },
     "status": { "action": "map", "apiField": "orderStatus", "apiType": "string" },
     "createdDate": { "action": "map", "apiField": "createdDate", "apiType": "Date" },
     "priority": { "action": "delete" },
     "score": { "action": "keep-stub" },
     "fullName": { "action": "computed", "note": "derived from firstName + lastName" }
   }
   ```

### Phase 4: Code Transformation

Dispatch `promote-agent` subagent:

> Use the **Agent tool** with this prompt:
>
> Read the file `{SKILL_DIR}/agents/promote-agent.md` for your full instructions.
>
> Execute with these parameters:
> ```json
> {
>   "targetDir": "<absolute path to module directory>",
>   "prototypeMetadata": <contents of .vc-app-prototype.json>,
>   "dataSource": <DATA_SOURCE from Phase 2>,
>   "fieldMap": <FIELD_MAP from Phase 3>,
>   "knowledgeBase": "{KNOWLEDGE_BASE}",
>   "docsRoot": "{DOCS_ROOT}"
> }
> ```

The agent performs surgical edits (not regeneration) on each file listed in `prototypeMetadata.generatedFiles`. Files not in the list are not modified. If `bladeTypes` is `list-only`, skip details composable/blade; if `details-only`, skip list composable/blade.

#### Mock code markers

Generate emits comment markers around mock data-source blocks:

```ts
// vc-app:mock-start
const mockData = [...];
const fetchItems = async (query) => { return mockData; };
const removeItems = async (ids) => { /* noop */ };
// vc-app:mock-end
```

**promote-agent MUST use these markers as primary replacement targets.** The agent:
1. Finds `// vc-app:mock-start` and `// vc-app:mock-end` in each composable
2. Replaces the entire block between markers with real API calls
3. Removes the markers themselves

If markers are not found (user deleted them), the agent falls back to pattern-matching mock function signatures and reports `DONE_WITH_CONCERNS`.

#### Composables (`useList.ts`, `useDetails.ts`)

1. **Imports:**
   - Add: `import { <ClientClass> } from "<entityTypePath>"`
   - Add: `import { <EntityType>, <SearchQuery>, etc. } from "<entityTypePath>"`
   - Add: `import { useApiClient } from "@vc-shell/framework"` (if not present)
   - Remove: mock type imports (if any)

2. **Data source (between mock markers):**
   - Add: `const apiClient = useApiClient(<ClientClass>)`
   - Replace mock fetch functions with real API calls:
     - `searchItems(query)` → `apiClient.<searchMethod>(query)`
     - `getItem(id)` → `apiClient.<getMethod>(id)`
     - `saveItem(item)` → `apiClient.<createMethod>(item)` / `apiClient.<updateMethod>(item)`
     - `removeItems(ids)` → `apiClient.<deleteMethod>(ids)`
   - Remove mock data objects/arrays

3. **Types:**
   - Replace `Record<string, unknown>` → `<EntityType>`
   - Replace `ref<Record<string, unknown>>({})` → `ref<EntityType>()`

4. **Fields:**
   - For `action: "map"`: rename properties per FIELD_MAP (in destructuring, dot access, template refs)
   - For `action: "delete"`: remove code blocks referencing the field
   - For `action: "keep-stub"`: add `// TODO [vc-app:promote]: <fieldName> — kept as stub, provide implementation`
   - For `action: "computed"`: add `// TODO [vc-app:promote]: <fieldName> — computed field, implement: <note>`

5. **Preserve:** all code outside mock markers — computed properties, watchers, validation, custom methods

#### Blades (`.vue` files)

1. **Template:**
   - For `action: "map"`: rename field references in `VcColumn` / form component bindings
   - For `action: "delete"`: remove the `VcColumn` / form field element entirely
   - Update `id`, `field`, `:label` attribute values

2. **Script:**
   - Update type annotations if explicit
   - Rename field references in script logic per FIELD_MAP

#### Locales — ALL locale files (handled separately from `generatedFiles`)

Locale files are NOT listed in `generatedFiles` — instead, promote-agent scans the `locales/` directory for all `.json` files (en.json, fr.json, de.json, etc.) and applies the same transformations to each:

1. Rename i18n keys per FIELD_MAP (e.g., `TEAM.LIST.NAME` → `TEAM.LIST.DISPLAY_NAME`)
2. Remove keys for deleted fields
3. Add placeholder keys for new API fields not present in mock (value = key name as placeholder)

#### Additional module files

After processing `generatedFiles`, scan the full module directory for any `.ts` / `.vue` files NOT in the list. For each, check if it imports from a modified composable. If so, warn in the report:
```
⚠ composables/useFilters.ts imports from useList — may need manual update
```

#### `index.ts`

No changes expected — `defineAppModule` with blades/locales remains the same.

### Phase 5: Cleanup & Verification

1. Dispatch `type-checker` agent to verify TypeScript compiles
2. If no type errors → delete `.vc-app-prototype.json` from module directory
3. Present summary:

   **If no type errors:**
   ```
   Module "team" promoted successfully!

   Files modified:
     composables/useList.ts      — API client connected, 3 fields mapped
     composables/useDetails.ts   — API client connected, 5 fields mapped
     pages/team-list.vue         — 3 columns updated
     pages/team-details.vue      — 5 form fields updated
     locales/en.json             — 8 keys renamed, 1 removed
     locales/ru.json             — 8 keys renamed, 1 removed

   ⚠ 1 field kept as stub (priority) — search for TODO [vc-app:promote]
   ⚠ composables/useFilters.ts imports from useList — may need manual update
   ✓ TypeScript: no errors
   ```

   **If type errors exist:**
   ```
   Module "team" promoted with errors.

   [same file list]

   ✗ TypeScript: 3 errors (see above)
   ⚠ .vc-app-prototype.json kept — run /vc-app promote team again after fixing errors
   ```

### Idempotency

- `.vc-app-prototype.json` is kept if type-checker finds errors → user can re-run promote after fixing
- On re-run, Phase 1 succeeds (marker still present), Phase 2-3 run again (user may pick different entity/mapping), Phase 4 re-applies transformations
- Mock markers will be absent on re-run (replaced in first pass) → promote-agent uses pattern-matching fallback, reports DONE_WITH_CONCERNS if structure is ambiguous

## `.vc-app-prototype.json` Format

Created by `/vc-app generate` when no API client is available.

```json
{
  "version": 1,
  "generatedAt": "2026-03-23T12:00:00Z",
  "intent": {
    "moduleName": "team",
    "bladeTypes": "list+details",
    "description": "manage team members with a searchable list and edit form",
    "menuConfig": {
      "title": "TEAM.MENU.TITLE",
      "icon": "lucide-users",
      "priority": 100
    }
  },
  "mockFields": {
    "columns": [
      { "name": "name", "type": "string", "sortable": true },
      { "name": "status", "type": "string", "sortable": false },
      { "name": "createdDate", "type": "datetime", "sortable": true }
    ],
    "formFields": [
      { "name": "name", "type": "string", "required": true },
      { "name": "status", "type": "string", "required": false },
      { "name": "description", "type": "text", "required": false }
    ]
  },
  "generatedFiles": [
    "pages/team-list.vue",
    "pages/team-details.vue",
    "composables/useList.ts",
    "composables/useDetails.ts",
    "index.ts"
  ]
}
```

### Who writes this file

The main `/vc-app generate` orchestrator writes `.vc-app-prototype.json` **after all subagents complete** in Phase 3. It aggregates:
- `intent` — from Phase 1 collected values
- `mockFields` — from the mock field definitions used to dispatch blade generators
- `generatedFiles` — collected from each subagent's reported file paths

## Changes to Existing `/vc-app generate`

When generate runs without API client (Phase 2 → user answers "no" or `api_client/` dir does not exist):

1. **Auto-detect no-API mode:** If `src/api_client/` does not exist and `APP_API_CLIENT_DIRECTORY` is not set, skip the "Should this module use an API client?" question — go directly to mock mode. Still show a note: `"No API client found — generating with mock data."`

2. **Emit mock markers in composables.** Blade generators must wrap mock data-source code with comment markers:
   ```ts
   // vc-app:mock-start
   const mockData: Record<string, unknown>[] = [
     { id: "1", name: "Item 1", status: "active", createdDate: new Date().toISOString() },
   ];

   const fetchItems = async (query?: Record<string, unknown>) => {
     return { results: mockData, totalCount: mockData.length };
   };

   const fetchItem = async (id: string) => {
     return mockData.find((item) => item.id === id) ?? {};
   };

   const saveItem = async (item: Record<string, unknown>) => {
     console.log("Mock save:", item);
     return item;
   };

   const removeItems = async (ids: string[]) => {
     console.log("Mock remove:", ids);
   };
   // vc-app:mock-end
   ```

3. **Create `.vc-app-prototype.json`** in the module directory after all subagents complete (see format above).

4. **Add promote hint** to the generation summary:
   ```
   Module generated with mock data.
   When your API is ready, run: /vc-app connect && /vc-app promote team
   ```

## New Subagent: `promote-agent.md`

### Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory",
    "prototypeMetadata": "object — contents of .vc-app-prototype.json",
    "dataSource": "object — DATA_SOURCE from Phase 2 (same format as generate)",
    "fieldMap": "object — FIELD_MAP from Phase 3"
  },
  "optional": {
    "knowledgeBase": "string — path to knowledge directory",
    "docsRoot": "string — path to docs directory"
  }
}
```

### Responsibilities

1. For each file in `prototypeMetadata.generatedFiles`:
   - Check file exists at `targetDir/<relativePath>`. If not, skip with warning.
   - Apply surgical edits per Phase 4 transformation rules
   - Use `// vc-app:mock-start/end` markers as primary edit targets in composables
   - If markers absent, fall back to pattern matching and report DONE_WITH_CONCERNS
2. Scan module directory for additional `.ts`/`.vue` files importing from modified composables
3. Process ALL locale files in `locales/`, not just `en.json`
4. Report: modified files, warnings, any issues

### Report Format

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED
Files modified: [list with change summary per file]
Warnings: [list of files needing manual attention]
Concerns: [if DONE_WITH_CONCERNS — what was ambiguous]
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No `.vc-app-prototype.json` | Error: not a prototype, check module name |
| No API client | Error: run `/vc-app connect` first |
| `generatedFiles` path not found | Warn, skip file, continue with others |
| Mock markers not found | Pattern-match fallback, DONE_WITH_CONCERNS |
| Field mapping conflict | Ask user interactively |
| Type errors after promote | Keep `.vc-app-prototype.json`, show errors, allow re-run |
| Composable heavily restructured | DONE_WITH_CONCERNS, user reviews changes |
| Additional files import from modified composables | Warn in summary |

## Command Reference

```
/vc-app promote <moduleName>

Arguments:
  moduleName    — kebab-case module name (e.g., "team", "catalog-items")

Examples:
  /vc-app promote team
  /vc-app promote order-management
```
