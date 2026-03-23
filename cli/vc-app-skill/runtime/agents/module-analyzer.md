---
name: module-analyzer
description: Analyzes an existing module directory and produces a structured report of its blades, composables, locale keys, and API connectivity.
---

## Input Contract

```json
{
  "required": {
    "targetDir": "string — absolute path to module directory"
  }
}
```

## Knowledge Loading

No external knowledge files are needed — this agent reads the module source directly.

## Generation Rules

This agent does NOT write files. It reads the module source tree and produces a structured JSON report.

### Step 1: Read `index.ts` — extract module registration

Read `{targetDir}/index.ts` (or `{targetDir}/index.js` if TypeScript variant is absent).

Extract:
- **Module name** — from the `defineAppModule` call's first argument or the `id` / `name` field in the object argument
- **Blade registrations** — from the `blades` key in `defineAppModule`. Each entry maps a blade component import to its registration. Collect the import paths to locate blade files.
- **All imports** — record import paths and specifiers for cross-referencing

If `defineAppModule` is not present, fall back to looking for `createAppModule`, `createDynamicModule`, or a default Vue plugin export with an `install` method that registers blades.

### Step 2: Read each `pages/*.vue` — extract blade metadata

For every `.vue` file in `{targetDir}/pages/`:

1. **Component name** — from `defineOptions({ name: "..." })` or `defineBlade({ name: "..." })`
2. **URL** — from `defineBlade({ url: "..." })` if present; otherwise `null`
3. **Blade type** — classify as:
   - `"list"` if template contains `<VcDataTable` or `<VcTable`
   - `"details"` if template contains form field components (`<VcInput`, `<VcSelect`, `<VcTextarea`, `<VcEditor`, `<VcFieldContent`, `<VcDynamicProperty`) or a details-style layout without a data table
   - `"custom"` otherwise
4. **Columns** — if blade type is `"list"`, extract all `<VcColumn` elements and record their attributes: `id`, `title`, `type`, `sortable`, `always-visible`, `mobile-position`, `mobile-role`, `width`
5. **Form fields** — if blade type is `"details"`, extract form input components and record: component type (e.g. `VcInput`, `VcSelect`), `label` or `title` prop, bound `v-model` or `:modelValue`
6. **Toolbar actions** — extract items from `<VcBladeToolbar>` children or `useToolbar` / `useBladeToolbar` calls. Record each action's `id`, `title`/`label`, `icon`, and handler function name.
7. **openBlade calls** — find all `openBlade(...)`, `openDetailsBlade(...)`, or router-based navigation calls. Record the target blade component name or route. These become `linksTo` entries.
8. **Composable imports** — record which composables from the module are imported (e.g. `useOrders`, `useOrder`)

### Step 3: Read each `composables/*.ts` — extract composable metadata

For every `.ts` file in `{targetDir}/composables/` (including nested `composables/useFoo/index.ts` patterns):

1. **Function name** — the exported function name (default export or named export)
2. **API client usage** — check for `useApiClient` import from `@vc-shell/framework`. If present, extract:
   - The client class passed to `useApiClient<ClientClass>(ClientClass)`
   - The import path for the client class
3. **Entity type** — infer from type parameters, search query types, or result types referenced in the file (e.g. `SearchOrderQuery`, `Order`, `IOrder`)
4. **CRUD methods** — identify which client methods are called (e.g. `searchOrders`, `getOrderById`, `createOrder`, `updateOrder`, `deleteOrders`). Record the method names as strings.
5. **Exported refs/functions** — list all items in the return statement of the composable factory function. Distinguish between:
   - Reactive state (refs, computed): variable names like `items`, `loading`, `totalCount`, `currentPage`
   - Functions: names like `getOrders`, `saveOrder`, `removeItems`, `reload`

### Step 4: Read `locales/*.json` — collect i18n key paths

For every `.json` file in `{targetDir}/locales/`:

1. Read the JSON structure
2. Flatten all nested keys into dot-notation paths (e.g. `ORDERS.PAGES.LIST.TITLE`)
3. Collect into a single `localeKeys` array, prefixed with the top-level namespace if present

If the `locales/` directory does not exist, set `localeKeys` to an empty array.

### Step 5: Determine API connectivity

Set `apiConnected` to `true` if ANY composable in `{targetDir}/composables/` imports `useApiClient` from `@vc-shell/framework` or imports a client class from a path containing `api_client` or `api-client`.

Set `apiConnected` to `false` otherwise (module uses mock data or static content).

### Step 6: Assemble the output

Combine all extracted data into the output contract structure.

## Output Contract

```json
{
  "moduleName": "string — module name from defineAppModule or index.ts",
  "blades": [
    {
      "name": "string — component name from defineOptions/defineBlade",
      "type": "string — 'list' | 'details' | 'custom'",
      "file": "string — relative path from targetDir (e.g. 'pages/orders-list.vue')",
      "url": "string | null — route URL if registered",
      "columns": [
        {
          "id": "string",
          "title": "string — raw title prop or i18n key",
          "type": "string? — VcColumn type attribute",
          "sortable": "boolean?"
        }
      ],
      "formFields": [
        {
          "component": "string — e.g. 'VcInput', 'VcSelect'",
          "label": "string — label/title prop value or i18n key",
          "model": "string — v-model binding expression"
        }
      ],
      "toolbarActions": [
        {
          "id": "string?",
          "title": "string — label or i18n key",
          "icon": "string?",
          "handler": "string — function name"
        }
      ],
      "linksTo": ["string — target blade component names or route paths"]
    }
  ],
  "composables": [
    {
      "name": "string — exported function name",
      "file": "string — relative path from targetDir",
      "apiClient": "string | null — client class name if useApiClient is used",
      "entity": "string | null — inferred entity type name",
      "methods": ["string — client method names called"],
      "exports": {
        "state": ["string — reactive ref/computed names"],
        "functions": ["string — exported function names"]
      }
    }
  ],
  "localeKeys": ["string — dot-notation i18n key paths"],
  "apiConnected": "boolean"
}
```

## Self-Check

Before completing, verify:
- [ ] All `.vue` files in `pages/` have been discovered and typed correctly as `list`, `details`, or `custom`
- [ ] All composables in `composables/` (including nested index.ts patterns) have been discovered with their exports listed
- [ ] API connection status is accurate — reflects actual `useApiClient` usage, not just the presence of import paths
- [ ] Locale keys are complete — all `.json` files in `locales/` have been flattened
- [ ] `linksTo` edges are populated for blades that open other blades
- [ ] Column and form field extraction matches what is actually in the template (not inferred from composables)
- [ ] Output JSON is valid and all required fields are present (use `null` or empty arrays for absent data, never omit keys)
