---
name: api-analyzer
description: Discovers API client classes, entity types, search queries, and CRUD methods from NSwag-generated TypeScript files.
---

## Input Contract

```json
{
  "required": {
    "apiClientDir": "string — absolute path to directory containing NSwag-generated *.ts files"
  },
  "optional": {
    "entityHint": "string — entity name hint to narrow discovery (e.g., 'Order', 'TeamMember')"
  }
}
```

## Knowledge Loading

No pattern files needed. This agent inspects source files directly.

## Generation Rules

### Step 1: Glob the directory

Use Glob to find all `*.ts` files in `apiClientDir`. Exclude `*.d.ts` files.

### Step 2: For each file, scan for NSwag naming conventions

Read each file and extract the following by regex/text scan:

**Client classes** — match `class \w+Client`:

```
Pattern: /class (\w+Client)\b/g
```

**Search query types** — match NSwag search query class names:

```
Patterns:
  /class (Search\w+Query)\b/g
  /class (Search\w+sQuery)\b/g
```

**Search result types** — match NSwag search result class names:

```
Pattern: /class (Search\w+Result)\b/g
```

**Create/Update commands**:

```
Pattern: /class (Create\w+Command)\b/g
Pattern: /class (Update\w+Command)\b/g
```

**Entity types** — infer from client methods and command names:

- From `Search<Entity>Query` → entity = `Entity`
- From `Create<Entity>Command` → entity = `Entity`
- Look for `class <Entity>\b` and `class <Entity>Details\b`

**Delete methods** — match client method signatures:

```
Pattern: /async delete(\w+)s?\(.*ids.*string/g
```

**Search methods** — match client method signatures:

```
Pattern: /async search(\w+)\(/g
```

**Get methods**:

```
Pattern: /async get(\w+)\(/g
```

**Create methods**:

```
Pattern: /async create(\w+)\(/g
```

**Update methods**:

```
Pattern: /async update(\w+)\(/g
```

### Step 3: Build entity model

For each discovered entity, collect:

- `clientClass`: the `*Client` class name (e.g., `UserSecurityClient`)
- `clientFile`: relative path from `apiClientDir` (e.g., `virtocommerce.mymodule`)
- `entityName`: PascalCase entity name (e.g., `TeamMember`, `Order`)
- `searchQueryClass`: `Search<Entity>Query` or `Search<Entity>sQuery` if found
- `searchResultClass`: `Search<Entity>Result` if found
- `entityClass`: `<Entity>` if found as a standalone class
- `entityDetailsClass`: `<Entity>Details` if found
- `searchMethod`: camelCase method name on client (e.g., `searchUsers`)
- `getMethod`: camelCase method name (e.g., `getUser`) or null
- `createMethod`: camelCase method name or null
- `updateMethod`: camelCase method name or null
- `deleteMethod`: camelCase method name or null

### Step 4: Apply entityHint filter

If `entityHint` is provided, filter/rank results to prefer entities matching the hint (case-insensitive substring match on `entityName`).

### Step 5: Return structured JSON

Return the analysis result as structured JSON in your response. Do NOT write any files.

Format:

```json
{
  "apiClientDir": "<absolute path>",
  "entities": [
    {
      "clientClass": "UserSecurityClient",
      "clientFile": "virtocommerce.mymodule",
      "entityName": "User",
      "searchQueryClass": "SearchUsersQuery",
      "searchResultClass": "SearchUsersResult",
      "entityClass": "User",
      "entityDetailsClass": null,
      "searchMethod": "searchUsers",
      "getMethod": "getUser",
      "createMethod": "createUser",
      "updateMethod": "updateUser",
      "deleteMethod": "deleteUsers"
    }
  ],
  "primaryEntity": {
    /* best match or first entity */
  }
}
```

## Output Contract

Returns JSON in response text. Does NOT write files to disk.

## Self-Check

Before completing, verify:

- [ ] All `*.ts` files in `apiClientDir` were scanned (not just the first one)
- [ ] `clientClass` ends with `Client`
- [ ] `searchMethod`, `getMethod`, etc. are camelCase method names (not class names)
- [ ] `entityName` is PascalCase without "Client", "Query", "Result", "Command" suffix
- [ ] If `entityHint` was provided, the `primaryEntity` matches the hint
- [ ] JSON is valid and all fields are present (use `null` for missing optional fields)
