---
name: list-blade-generator
description: Generates a list blade Vue component and its plural composable for searching/paginating entities.
---

## Input Contract

```json
{
  "required": {
    "moduleName": "string — kebab-case module name (e.g., 'team', 'catalog-items')",
    "entityName": "string — PascalCase entity name (e.g., 'TeamMember', 'Order')",
    "entityTypePath": "string — import path for entity types (e.g., '../../api_client/virtocommerce.marketplace')",
    "clientClass": "string — NSwag client class name (e.g., 'VcmpSellerSecurityClient')",
    "searchMethod": "string — camelCase search method on client (e.g., 'searchSellerUsers')",
    "columns": [
      {
        "name": "string — field name (camelCase)",
        "title": "string — display label",
        "type": "string? — detected data type from API (e.g., 'string', 'Date', 'number', 'boolean')",
        "isEnum": "boolean? — true if field is a string enum (status/state)",
        "sortable": "boolean?"
      }
    ],
    "menuConfig": {
      "title": "string — i18n key for menu title (e.g., 'TEAM.MENU.TITLE')",
      "icon": "string — lucide icon name (e.g., 'lucide-users')",
      "priority": "number"
    },
    "knowledgeBase": "string — absolute path to skill/knowledge/",
    "docsRoot": "string — absolute path to skill/knowledge/docs/",
    "targetDir": "string — absolute path to output module directory"
  }
}
```

## Knowledge Loading

Before generating, Read these files in order:

1. `{knowledgeBase}/patterns/list-blade-pattern.md` — full blade template and script skeleton
2. `{knowledgeBase}/patterns/composable-list.md` — plural composable skeleton and rules
3. `{knowledgeBase}/index.md` — to find relevant component docs files

From `index.md`, identify any `.docs.md` files for `VcBlade`, `VcDataTable`, `VcColumn` and Read them from `{docsRoot}/`.

## Generation Rules

### Step 1: Derive naming variables

From inputs compute:
- `entityNamePlural` = `entityName` + "s" (e.g., `TeamMembers`, `Orders`)
- `entityNameLower` = camelCase of `entityName` (e.g., `teamMember`, `order`)
- `entityNamePluralLower` = camelCase of `entityNamePlural` (e.g., `teamMembers`, `orders`)
- `composableName` = `use` + `entityNamePlural` (e.g., `useTeamMembers`)
- `listVarName` = `entityNamePluralLower` + `List` (e.g., `teamMembersList`)
- `getFnName` = `get` + `entityNamePlural` (e.g., `getTeamMembers`)
- `bladeComponentName` = PascalCase of `moduleName` + `List` (e.g., `TeamList`)
- `detailsBladeComponentName` = PascalCase of `moduleName` + `Details` (e.g., `TeamDetails`)
- `stateKey` = snake_case of `moduleName` + `_list` (e.g., `team_list`)
- `i18nPrefix` = SCREAMING_SNAKE of `moduleName` (e.g., `TEAM`)
- `url` = `"/" + moduleName` (e.g., `"/team"`)

### Step 2: Generate the plural composable

Write to: `{targetDir}/composables/use{EntityNamePlural}/index.ts`

Follow the skeleton from `composable-list.md` exactly:
- Import `useApiClient`, `useAsync`, `useLoading` from `@vc-shell/framework`
- Import `Search{EntityName}Query`, `Search{EntityName}Result`, `{EntityName}`, `{ClientClass}` from `entityTypePath`
- Import type alias: `import type { Search{EntityName}Query as ISearch{EntityName}Query }`
- Define `IUse{EntityNamePlural}` interface with all return fields
- Export a default factory function
- Use `useAsync<ISearch{EntityName}Query>` for the `{getFnName}` action
- Return `loading`, `{listVarName}`, `totalCount`, `currentPage`, `pages`, `searchQuery`, `{getFnName}`

If the `searchMethod` uses a non-standard pluralization (e.g., `searchSellerUsers` for `SellerUser`), match the client method name exactly.

### Step 3: Classify columns and assign VcColumn attributes

For each column in `columns`, determine the VcColumn attributes using these rules:

**Column type mapping** (based on field name and data type):
- Field name contains "status" or "state" OR `isEnum: true` → `type="status"`, add `#body` slot with `VcStatus`
- Field name starts with "is", "has", "can" (boolean) → `type="status-icon"`
- Field name contains "date", "created", "modified", "updated" (Date type) → `type="date-ago"`
- Field name contains "price", "total", "amount", "cost" (monetary) → `type="money"`
- Field name contains "img", "image", "avatar", "thumbnail" → `type="image"`, `width="60px"`
- Numeric field (not monetary) → `type="number"`
- Everything else → no type (plain text)

**Mobile layout assignment** (assign to the first matching column):
- First image column → `mobile-role="image"`, `:always-visible="true"`
- First identifier column (name, number, title) → `mobile-position="top-left"`, `:always-visible="true"`
- First status column → `mobile-role="status"`, `:always-visible="true"`
- First monetary/value column → `mobile-position="top-right"`
- First secondary text column → `mobile-position="bottom-left"`
- First date column → `mobile-position="bottom-right"`

### Step 4: Generate the list blade

Write to: `{targetDir}/pages/{moduleName}-list.vue`

Follow the template from `list-blade-pattern.md` exactly.

**CRITICAL: Template section — explicit VcColumn declarations (NO v-for):**

Each column must be declared as a separate `<VcColumn>` element in the template. Do NOT use `v-for` with a computed array. This enables:
- `#body` slots for status badges, images, and custom rendering
- Per-column `mobile-role` / `mobile-position` attributes
- Better readability and maintainability

Example of correct column declarations:
```vue
<VcColumn
  id="number"
  :title="t('ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER')"
  :always-visible="true"
  :sortable="true"
  mobile-position="top-left"
/>
<VcColumn
  id="status"
  :title="t('ORDERS.PAGES.LIST.TABLE.HEADER.STATUS')"
  :always-visible="true"
  :sortable="true"
  type="status"
  mobile-role="status"
>
  <template #body="{ data }">
    <VcStatus :variant="statusVariant(data.status)">
      {{ data.status }}
    </VcStatus>
  </template>
</VcColumn>
<VcColumn
  id="total"
  :title="t('ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL')"
  :sortable="true"
  type="money"
  mobile-position="top-right"
/>
<VcColumn
  id="createdDate"
  :title="t('ORDERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE')"
  :sortable="true"
  type="date-ago"
  mobile-position="bottom-right"
/>
```

**Script setup section:**
- `defineBlade({ name: "{bladeComponentName}", url: "{url}", isWorkspace: true, permissions: ["{i18nPrefix_lower}:manage"], menuItem: { title: "{menuConfig.title}", icon: "{menuConfig.icon}", priority: {menuConfig.priority} } })`
- Import and destructure `{composableName}` with correct variable names
- `useDataTableSort({ initialField: "createdDate", initialDirection: "DESC" })`
- If any status column exists: generate `statusVariant()` mapping function (see `list-blade-pattern.md` → Status Column Pattern)
- Use `{i18nPrefix}.PAGES.LIST.*` key pattern for all i18n calls
- Include `watch(sortExpression, ...)`, `onMounted`, `reload`, `onPaginationClick`, `onItemClick`, `onAddItem`, `exposeToChildren({ reload })`
- Do NOT create a `simpleColumns` computed array — columns are in the template

### Step 5: Create composable barrel if it doesn't exist

Write to: `{targetDir}/composables/index.ts`

```ts
export { default as use{EntityNamePlural} } from "./use{EntityNamePlural}";
```

If the file already exists, append the export line (do not overwrite).

## Output Contract

Files written to disk:
1. `{targetDir}/composables/use{EntityNamePlural}/index.ts`
2. `{targetDir}/pages/{moduleName}-list.vue`
3. `{targetDir}/composables/index.ts` (created or appended)

Returns a summary of generated files and any assumptions made.

## Self-Check

Before completing, verify:
- [ ] `defineBlade` is at module scope (top-level of `<script setup>`), not inside any function
- [ ] `state-key` is snake_case and unique (based on `moduleName`)
- [ ] `useDataTableSort` destructures `sortField`, `sortOrder`, `sortExpression` — all three used
- [ ] `watch(sortExpression, ...)` calls `{getFnName}` with `sort: value`
- [ ] `exposeToChildren({ reload })` is called once at end of setup
- [ ] Composable uses default export (factory function), not named export
- [ ] `useLoading(...)` wraps the loading ref in the composable return
- [ ] All `t(...)` calls use `{i18nPrefix}.PAGES.LIST.*` key pattern
- [ ] **Each VcColumn is declared explicitly in the template — NO v-for with computed array**
- [ ] Date columns use `type="date-ago"` (NOT `"date-time"`)
- [ ] Status/state columns use `type="status"` with `#body` slot containing `VcStatus` component
- [ ] Boolean columns (is*, has*, can*) use `type="status-icon"`
- [ ] Monetary columns use `type="money"`
- [ ] Mobile layout attributes (`mobile-position`, `mobile-role`) are assigned to key columns
- [ ] If status column exists, `statusVariant()` function is defined in script setup
- [ ] No `simpleColumns` computed array exists in script — columns are purely in template
