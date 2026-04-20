---
name: locales-generator
description: Scans generated Vue/TS files for i18n keys, derives human-readable values, and writes en.json + locales/index.ts.
---

## Input Contract

```json
{
  "required": {
    "moduleName": "string — kebab-case module name (e.g., 'team', 'catalog-items')",
    "generatedFiles": ["string — absolute path to each generated .vue or .ts file"],
    "targetDir": "string — absolute path to output module directory"
  }
}
```

## Knowledge Loading

No pattern files needed. This agent reads the generated files directly.

## Generation Rules

### Step 1: Extract all i18n keys

Read each file listed in `generatedFiles`. Scan for all i18n call patterns:

```
Patterns to match (in order of priority):
  $t('KEY')           — template $t calls with single quotes
  $t("KEY")           — template $t calls with double quotes
  t('KEY')            — script t() calls with single quotes
  t("KEY")            — script t() calls with double quotes
  t(`KEY`)            — script t() calls with backtick (literal only, no interpolation)
```

Collect every unique key string found. Ignore keys with dynamic interpolation (e.g., `t(\`MODULE.${var}\`)`).

### Step 2: Derive human-readable values from keys

For each key, derive its English value using this algorithm:

1. Split the key by `.` to get segments (e.g., `TEAM.PAGES.LIST.TITLE` → `["TEAM", "PAGES", "LIST", "TITLE"]`)
2. Take the last meaningful segment (last segment that is not `TITLE`, `LABEL`, `PLACEHOLDER`, `MESSAGE` → use second-to-last for context)
3. Convert the last segment from SCREAMING_SNAKE to Title Case:
   - `TITLE` → use parent context: `LIST` + `TITLE` → `"Team"`
   - `ADD` → `"Add"`
   - `REFRESH` → `"Refresh"`
   - `SAVE` → `"Save"`
   - `CREATE` → `"Create"`
   - `DELETE` → `"Delete"`
   - `RESET` → `"Reset"`
   - `CANCEL` → `"Cancel"`
   - `CONFIRM` → `"Confirm"`
   - `NO_ITEMS` → `"No items"`
   - `TITLE_EDIT` → `"Edit {EntityName}"`
   - `TITLE_NEW` → `"New {EntityName}"`
   - `CLOSE_CONFIRMATION` → `"You have unsaved changes. Close anyway?"`
   - `ALERT.DELETE` → `"Are you sure you want to delete this item?"`

For unknown suffixes: split by `_`, convert each word to Title Case, join with space.

Examples:

- `TEAM.MENU.TITLE` → `"Team"`
- `TEAM.PAGES.LIST.TITLE` → `"Team"`
- `TEAM.PAGES.LIST.TOOLBAR.ADD` → `"Add"`
- `TEAM.PAGES.LIST.TOOLBAR.REFRESH` → `"Refresh"`
- `TEAM.PAGES.LIST.TABLE.HEADER.NAME` → `"Name"`
- `TEAM.PAGES.LIST.TABLE.HEADER.CREATED_DATE` → `"Created Date"`
- `TEAM.PAGES.LIST.EMPTY.NO_ITEMS` → `"No items"`
- `TEAM.PAGES.LIST.EMPTY.ADD` → `"Add"`
- `TEAM.PAGES.DETAILS.TITLE_EDIT` → `"Edit Team Member"`
- `TEAM.PAGES.DETAILS.TITLE_NEW` → `"New Team Member"`
- `TEAM.PAGES.DETAILS.TOOLBAR.SAVE` → `"Save"`
- `TEAM.PAGES.DETAILS.TOOLBAR.CREATE` → `"Create"`
- `TEAM.PAGES.DETAILS.TOOLBAR.RESET` → `"Reset"`
- `TEAM.PAGES.DETAILS.TOOLBAR.DELETE` → `"Delete"`
- `TEAM.PAGES.ALERTS.CLOSE_CONFIRMATION` → `"You have unsaved changes. Close anyway?"`
- `TEAM.PAGES.DETAILS.POPUP.ALERT.DELETE` → `"Are you sure you want to delete this item?"`
- `TEAM.FIELDS.NAME.LABEL` → `"Name"`
- `TEAM.FIELDS.NAME.PLACEHOLDER` → `"Enter name"`
- `TEAM.FIELDS.EMAIL.LABEL` → `"Email"`
- `TEAM.FIELDS.IS_ACTIVE.LABEL` → `"Is Active"`

### Step 3: Build nested JSON object

Convert flat key list to nested JSON object. Split each key by `.` and build a tree:

```
"TEAM.PAGES.LIST.TITLE" → { "TEAM": { "PAGES": { "LIST": { "TITLE": "Team" } } } }
```

Merge all keys into a single nested object. Keys at each level are the raw segment strings (SCREAMING_SNAKE preserved).

### Step 4: Write en.json

Write to: `{targetDir}/locales/en.json`

Output the nested JSON object, formatted with 2-space indentation.

### Step 5: Write locales/index.ts

Write to: `{targetDir}/locales/index.ts`

```ts
import en from "./en.json";
export { en };
```

**CRITICAL:** Use named `export { en }`, NOT `export default { en }`. The framework's `defineAppModule` expects `import * as locales` which requires named exports. A default export will silently break locale loading.

## Output Contract

Files written to disk:

1. `{targetDir}/locales/en.json`
2. `{targetDir}/locales/index.ts`

Returns a summary listing number of keys extracted and any keys with uncertain values.

## Self-Check

Before completing, verify:

- [ ] All files in `generatedFiles` were read (not just the first)
- [ ] Both `$t('...')` and `t('...')` patterns were captured
- [ ] Keys with template literal interpolation (`${...}`) were excluded
- [ ] JSON is valid (no trailing commas, proper nesting)
- [ ] `locales/index.ts` uses `import en from "./en.json"` (relative, not absolute)
- [ ] `locales/index.ts` uses `export { en }` (named export), NOT `export default { en }` (default export breaks `import * as locales`)
- [ ] No duplicate keys in the JSON (last value wins if duplicates exist)
- [ ] Values are human-readable strings, not the raw key segments
