# UI Types

TypeScript interfaces for UI component props shared across all form field components in the framework.

## Overview

These types define the common prop contracts for form field atoms and molecules. All `Vc*` form components implement `IFormFieldProps`; text-input-like components extend it with `ITextFieldProps`.

**Files:** `index.ts`, `form-field.ts`

## Interfaces

### `IFormFieldProps`

Base props shared by all form field components (VcCheckbox, VcSwitch, VcRadioButton, VcInput, VcTextarea, VcSelect, VcDatePicker, VcEditor, VcFileUpload, VcColorInput, etc.).

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string?` | Field label text |
| `tooltip` | `string?` | Tooltip shown on label hover |
| `disabled` | `boolean?` | Whether the field is disabled |
| `required` | `boolean?` | Whether the field is required |
| `name` | `string?` | Form field name attribute |
| `error` | `boolean?` | External error flag |
| `errorMessage` | `string?` | Error message text (also sets error state when truthy) |

### `ITextFieldProps`

Extended props for text-input-like components (VcInput, VcTextarea, VcSelect, VcDatePicker, VcColorInput). Extends `IFormFieldProps`.

| Prop | Type | Description |
|------|------|-------------|
| `placeholder` | `string?` | Placeholder text |
| `hint` | `string?` | Hint text shown below the field |
| `clearable` | `boolean?` | Show clear button |
| `loading` | `boolean?` | Show loading indicator |
| `autofocus` | `boolean?` | Auto-focus on mount |
| `size` | `"default" \| "small"?` | Field size variant |
| `multilanguage` | `boolean?` | Whether multilanguage mode is active |
| `currentLanguage` | `string?` | Current language code for multilanguage mode |

### `Breadcrumbs`

Breadcrumb navigation item used by blade headers.

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique breadcrumb identifier |
| `title` | `MaybeRef<string \| undefined>` | Display text (can be reactive) |
| `icon` | `string?` | Icon identifier |
| `clickHandler` | `(id: string) => void \| boolean \| Promise<void \| boolean>?` | Navigation handler |

## Usage Examples

```typescript
import type { ITextFieldProps } from "@vc-shell/framework";

// Extend for a custom input component
interface IMyFieldProps extends ITextFieldProps {
  prefix?: string;
  suffix?: string;
}
```

## Related

- `framework/core/types/` -- Core types (validation rules, table columns, menus)
- `framework/ui/components/atoms/` -- Atom components implementing these props
