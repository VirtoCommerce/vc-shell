# Component Registry

Available components for UI-Plan generation in VC Shell.

## Form Components

### VcForm
**Import:** `@vc-shell/framework`  
**Description:** Form container with validation support

**Props:**
- `model: object` - Form data model
- `fields: Field[]` - Array of form fields

**Constraints:**
- Maximum 50 fields per form
- Supports validation through vee-validate

**Usage in UI-Plan:**
```json
{
  "type": "Form",
  "model": "product",
  "fields": [
    {"key": "name", "as": "Text", "label": "Product Name", "required": true}
  ]
}
```

### VcField
**Import:** `@vc-shell/framework`  
**Description:** Form field wrapper with label and validation display

**Props:**
- `label: string` - Field label
- `required: boolean` - Whether field is required
- `rules: ValidationRule[]` - Validation rules

### VcInput
**Import:** `@vc-shell/framework`  
**Description:** Text input field with various types

**Props:**
- `type: text | email | url | number | date | password` - Input type
- `placeholder: string` - Placeholder text
- `label: string` - Input label
- `required: boolean` - Whether input is required
- `disabled: boolean` - Whether input is disabled

**Field Types (for forms):**
- `Text` - Regular text input
- `Email` - Email input with validation
- `Url` - URL input with validation
- `Number` - Numeric input
- `Date` - Date picker
- `Password` - Password input (masked)

**Usage in UI-Plan:**
```json
{
  "key": "email",
  "as": "Email",
  "label": "Email Address",
  "required": true,
  "rules": ["email"]
}
```

### VcTextarea
**Import:** `@vc-shell/framework`  
**Description:** Multi-line text input

**Props:**
- `rows: number` - Number of visible rows
- `maxlength: number` - Maximum character length
- `placeholder: string` - Placeholder text
- `label: string` - Textarea label

**Usage in UI-Plan:**
```json
{
  "key": "description",
  "as": "Textarea",
  "label": "Description",
  "placeholder": "Enter detailed description..."
}
```

### VcSelect
**Import:** `@vc-shell/framework`  
**Description:** Dropdown select component

**Props:**
- `options: SelectOption[]` - Array of options
- `multiple: boolean` - Allow multiple selections
- `label: string` - Select label

**Usage in UI-Plan:**
```json
{
  "key": "status",
  "as": "Select",
  "label": "Status",
  "options": [
    {"label": "Active", "value": "active"},
    {"label": "Inactive", "value": "inactive"}
  ]
}
```

## Data Display Components

### VcTable
**Import:** `@vc-shell/framework`  
**Description:** Data table with sorting, pagination, and filtering

**Props:**
- `items: any[]` - Array of data items
- `columns: Column[]` - Table column definitions
- `multiselect: boolean` - Enable row selection
- `sort: string` - Sort expression (e.g., "name:asc")
- `totalCount: number` - Total number of items
- `pages: number` - Total number of pages
- `currentPage: number` - Current page number

**Constraints:**
- Supports row selection
- Built-in pagination support
- Sortable columns

**Usage in UI-Plan:**
```json
{
  "type": "DataTable",
  "dataSource": "products",
  "columns": [
    {"key": "name", "title": "Name", "sortable": true},
    {"key": "price", "title": "Price", "width": "120px"}
  ],
  "actions": ["add", "edit", "delete"]
}
```

## Layout Components

### VcBlade
**Import:** `@vc-shell/framework`  
**Description:** Blade container component (main UI container in VC Shell)

**Props:**
- `title: string` - Blade title
- `width: string` - Blade width (e.g., "50%", "70%")
- `closable: boolean` - Whether blade can be closed
- `expanded: boolean` - Whether blade is expanded
- `toolbarItems: IBladeToolbar[]` - Toolbar action buttons

**Note:** Automatically used as container in generated blades.

### VcButton
**Import:** `@vc-shell/framework`  
**Description:** Button component with variants

**Props:**
- `variant: primary | secondary | danger` - Button variant
- `disabled: boolean` - Whether button is disabled
- `icon: string` - Icon name (material-*, bootstrap-*, etc.)

## Actions

Available actions in UI-Plan:
- `add` - Add new item
- `edit` - Edit existing item
- `delete` - Delete item(s)
- `save` - Save changes
- `refresh` - Refresh data
- `next` - Next step (wizard)
- `back` - Previous step (wizard)
- `submit` - Submit form

## Filters

Available filter types:
- `select` - Dropdown selection
- `date` - Single date picker
- `dateRange` - Date range picker
- `text` - Text search
- `number` - Numeric range

## Permissions

Format: `<resource>:<action>`

Examples:
- `product:read` - Read products
- `product:update` - Update products
- `product:delete` - Delete products
- `admin:*` - Admin full access

## Examples

### Simple Form
```json
{
  "type": "Form",
  "model": "product",
  "fields": [
    {"key": "name", "as": "Text", "label": "Name", "required": true},
    {"key": "description", "as": "Textarea", "label": "Description"},
    {"key": "price", "as": "Number", "label": "Price", "required": true}
  ]
}
```

### Data Table with Filters
```json
{
  "type": "DataTable",
  "dataSource": "orders",
  "columns": [
    {"key": "id", "title": "Order ID"},
    {"key": "customer", "title": "Customer"},
    {"key": "total", "title": "Total"}
  ],
  "actions": ["add", "edit"],
  "filters": [
    {"key": "status", "type": "select"},
    {"key": "date", "type": "dateRange"}
  ]
}
```

