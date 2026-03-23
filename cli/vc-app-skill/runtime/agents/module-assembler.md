---
name: module-assembler
description: Creates the module index.ts barrel, pages/index.ts, composables/index.ts (if missing), and registers the module in the app's module registry.
---

## Input Contract

```json
{
  "required": {
    "moduleName": "string — kebab-case module name (e.g., 'team', 'catalog-items')",
    "generatedFiles": ["string — absolute paths to all generated files in this module"],
    "appModulesRegistryPath": "string — absolute path to app's src/modules/index.ts"
  }
}
```

## Knowledge Loading

Before generating, Read:

1. `{knowledgeBase}/patterns/module-structure.md` — `defineAppModule`, barrel file format, and module registry rules

(Use `knowledgeBase` from the parent skill context, or infer from the `targetDir` if not provided: look for `skill/knowledge/patterns/module-structure.md` relative to the worktree root.)

## Generation Rules

### Step 1: Derive naming variables

From `moduleName` compute:
- `moduleClassName` = PascalCase of `moduleName` (e.g., `Team`, `CatalogItems`)
- `targetDir` = directory containing the generated files (parent of `pages/`, `composables/`, `locales/`)

To find `targetDir`: take the directory of the first file in `generatedFiles` that lives under `pages/` or `composables/` and navigate up one level.

### Step 2: Identify generated pages and composables

From `generatedFiles`, classify each file:
- Files under `*/pages/*.vue` → page components
- Files under `*/composables/**/*.ts` but NOT `*/composables/index.ts` → composable implementations

For each page file, derive its export name:
- `team-list.vue` → `TeamList`
- `team-details.vue` → `TeamDetails`
- `{moduleName}-list.vue` → PascalCase(`moduleName`) + `List`
- `{moduleName}-details.vue` → PascalCase(`moduleName`) + `Details`

For each composable directory (e.g., `useTeamMembers/`), derive its export name from the directory name.

### Step 3: Write or update pages/index.ts

Write to: `{targetDir}/pages/index.ts`

Export each page component as a named export:
```ts
export { default as TeamList } from "./team-list.vue";
export { default as TeamDetails } from "./team-details.vue";
```

If the file already exists, read it first and only add exports for pages not already present.

### Step 4: Write or update composables/index.ts

Write to: `{targetDir}/composables/index.ts`

If the file was already created by a generator agent (list-blade-generator or details-blade-generator), read it and ensure all composables have an export. Otherwise create it with all discovered composables.

Format:
```ts
export { default as useTeamMembers } from "./useTeamMembers";
export { default as useTeamMember } from "./useTeamMember";
```

### Step 5: Write module index.ts

Write to: `{targetDir}/index.ts`

Follow `module-structure.md` exactly:
```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({ blades: pages, locales });

export * from "./pages";
export * from "./composables";
```

Do NOT re-export locales. Do NOT use a default export for locales.

### Step 6: Register module in app's module registry

Read `appModulesRegistryPath` (e.g., `src/modules/index.ts`).

Parse existing exports to detect if the module is already registered:
- Check for `export { default as {moduleClassName} }` or `export * from "./{moduleName}"`

If NOT already registered, append:
```ts
export { default as {moduleClassName} } from "./{moduleName}";
```

**Critical rules for registry update:**
- Read the existing file first — NEVER overwrite it from scratch
- Append the new export at the end of the file
- Preserve all existing export lines exactly
- If the module name is already exported (any form), skip — do not add duplicate
- Add a blank line before the new export only if the file does not end with a blank line

## Output Contract

Files written to disk:
1. `{targetDir}/pages/index.ts` (created or updated)
2. `{targetDir}/composables/index.ts` (created or updated)
3. `{targetDir}/index.ts` (created)
4. `{appModulesRegistryPath}` (appended — module export added)

Returns a summary of all files created/modified and confirmation of registry registration.

## Self-Check

Before completing, verify:
- [ ] `defineAppModule({ blades: pages, locales })` — both `pages` and `locales` are passed
- [ ] `export * from "./pages"` and `export * from "./composables"` are in module `index.ts`
- [ ] `locales` is NOT re-exported (no `export * from "./locales"`)
- [ ] `pages/index.ts` uses named exports with `{ default as ComponentName }` pattern
- [ ] App registry was READ before modifying — existing exports preserved
- [ ] No duplicate export for `{moduleClassName}` in registry
- [ ] Module `index.ts` uses `import * as pages` (namespace import), not named imports
