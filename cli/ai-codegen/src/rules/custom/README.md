# Custom Rules

This directory is for your custom AI generation rules.

## How to Add Custom Rules

1. Create a YAML file in this directory (e.g., `my-custom-rule.yaml`)
2. Follow the schema from existing rules in `/critical` or `/constraints`
3. Set appropriate priority (lower number = less important than built-in rules)
4. Enable/disable as needed

## Example Custom Rule

```yaml
id: "custom-01"
name: "My Custom Pattern"
category: "custom"
priority: 50  # Lower than built-in critical rules (100)
enabled: true
applies_to:
  - "all"  # or ["list"], ["details"], etc.

description: |
  Your custom rule description here.

forbidden:
  - pattern: "somePattern"
    reason: "Why this pattern is forbidden"
    severity: "warning"  # or "error"

correct_pattern:
  inline: |
    ```typescript
    // ✅ CORRECT way to do it
    const example = "code";
    ```

wrong_pattern:
  inline: |
    ```typescript
    // ❌ WRONG way
    const bad = "example";
    ```

validations:
  - type: "regex"
    pattern: "somePattern"
    message: "⚠️ Warning message for AI"

auto_fix:
  enabled: true
  transforms:
    - find: "oldPattern"
      replace: "newPattern"
```

## Rule Schema Reference

### Top-level Fields

- **id**: Unique identifier (string)
- **name**: Human-readable name (string)
- **category**: "critical" | "constraint" | "best-practice" | "custom"
- **priority**: Number (higher = more important, built-in critical rules use 100)
- **enabled**: Boolean (true/false)
- **applies_to**: Array of blade types: ["all"] or ["list", "details", "edit"]
- **description**: Rule description (multiline string)
- **rationale**: Optional, why this rule exists

### Pattern Definitions

#### forbidden

Array of forbidden patterns:
```yaml
forbidden:
  - pattern: "regex or literal string"
    file: "file name or path pattern"
    reason: "Why forbidden"
    severity: "error" | "warning" | "info"
    exception: "When this IS allowed"  # Optional
```

#### required

Array of required patterns:
```yaml
required:
  - pattern: "regex pattern that must exist"
    when: "Condition when required"
    severity: "error" | "warning" | "info"
```

#### correct_pattern / wrong_pattern

```yaml
correct_pattern:
  file: "path/to/example.md"  # Relative to /examples
  inline: |
    ```typescript
    // Inline code example
    ```
  description: "Pattern description"
```

### Validation Checks

```yaml
validations:
  - type: "regex" | "required_import" | "forbidden_file" | "forbidden_function" | "custom"
    pattern: "regex pattern"  # For type: regex
    file: "file pattern"  # For type: forbidden_file
    import: "import name"  # For type: required_import
    from: "import source"  # For type: required_import
    function: "function name"  # For type: forbidden_function
    when: "Condition"  # Optional
    message: "Validation message"
```

### Auto-fix

```yaml
auto_fix:
  enabled: true | false
  transforms:
    - find: "regex pattern to find"
      replace: "replacement string"
      add_import:  # Optional
        name: "importName"
        from: "@package/name"
```

## Priority Guidelines

- **100**: Critical rules (built-in, required for functionality)
- **90**: Important constraints (built-in, prevent common errors)
- **80**: Best practices (built-in, recommended patterns)
- **50**: Custom rules (your organization's standards)
- **30**: Project-specific rules
- **10**: Optional/experimental rules

## Disabling Built-in Rules

To disable a built-in rule, create a file with the same ID and set `enabled: false`:

```yaml
# custom/09-module-registration.yaml
id: "09"
enabled: false  # This will override the built-in rule
```

## Examples Directory

You can reference examples from `/src/examples`:

```yaml
examples:
  - "patterns/my-pattern.md"
  - "compositions/list/my-composition.md"
  - "framework/composables/myComposable.md"
```

The loader will automatically resolve paths relative to `/src/examples`.

## Testing Your Rules

After adding custom rules, rebuild the package:

```bash
cd cli/ai-codegen
yarn build
```

Rules are loaded automatically on next generation run.

## Need Help?

- Check existing rules in `/critical` and `/constraints` for examples
- See `/core/rules-types.ts` for TypeScript interfaces
- Read `/core/rules-loader.ts` for loading logic
