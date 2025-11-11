# UI-Plan Schema

UI-Plan is a JSON structure that declaratively describes your VC Shell application UI.

## Schema Version

Current version: `v1` (https://vc-shell.dev/schemas/ui-plan.v1.json)

## Top-Level Structure

```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "string (kebab-case)",
  "blades": [],
  "data": {}
}
```

### Required Fields

- `$schema` - Schema version URL
- `module` - Module name in kebab-case (e.g., "products", "vendor-management")
- `blades` - Array of blade definitions (min: 1, max: 3)

### Optional Fields

- `data` - Data sources configuration

## Blade Structure

```json
{
  "id": "string (kebab-case)",
  "route": "string (starts with /)",
  "layout": "grid | details | page",
  "title": "string",
  "isWorkspace": "boolean (default: false)",
  "components": [],
  "actions": [],
  "theme": {},
  "permissions": [],
  "steps": []
}
```

### Blade Fields

**Required:**
- `id` - Unique blade identifier (kebab-case)
- `route` - Blade route path (must start with `/`)
- `layout` - Blade type: `grid` (list), `details` (form), or `page` (custom)
- `title` - Blade title (display name)

**Optional:**
- `isWorkspace` - Whether this is the main workspace blade (default: false)
- `components` - Array of UI components
- `actions` - Toolbar actions (e.g., ["save", "delete", "refresh"])
- `theme` - Theme configuration
- `permissions` - Required permissions array
- `steps` - Array of wizard steps (for multi-step forms)

### Blade Layouts

**Grid Layout:**
- Used for list/table views
- Typically contains a DataTable component
- Actions: add, edit, delete, refresh
- Supports filters, search, pagination

**Details Layout:**
- Used for forms/detail views
- Typically contains Form component with fields
- Actions: save, delete
- Supports validation

**Page Layout:**
- Custom layout for special pages
- Flexible component composition

## Component Structure

```json
{
  "type": "ComponentType",
  "dataSource": "string (optional)",
  "model": "string (optional)",
  "fields": [],
  "columns": [],
  "actions": [],
  "filters": [],
  "props": {}
}
```

### Component Fields

- `type` - Component type (Form, DataTable, Button, etc.)
- `dataSource` - Reference to data source (for DataTable)
- `model` - Reference to data model (for Form)
- `fields` - Array of form fields (for Form)
- `columns` - Array of table columns (for DataTable)
- `actions` - Component-specific actions
- `filters` - Array of filters (for DataTable)
- `props` - Additional component props

## Field Structure (for Forms)

```json
{
  "key": "string",
  "as": "FieldType",
  "label": "string",
  "placeholder": "string (optional)",
  "required": "boolean (default: false)",
  "rules": [],
  "options": []
}
```

### Field Types

- `Text` - Text input
- `Email` - Email input with validation
- `Url` - URL input with validation
- `Number` - Numeric input
- `Date` - Date picker
- `Password` - Password input (masked)
- `Textarea` - Multi-line text
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Switch` - Toggle switch
- `Gallery` - Image gallery
- `FileUpload` - File upload

### Field Validation Rules

- `required` - Field is required
- `email` - Valid email format
- `url` - Valid URL format
- `min:<n>` - Minimum length/value
- `max:<n>` - Maximum length/value

## Column Structure (for Tables)

```json
{
  "key": "string",
  "title": "string",
  "sortable": "boolean (default: true)",
  "width": "string (optional, e.g., '120px')"
}
```

## Filter Structure

```json
{
  "key": "string",
  "type": "FilterType",
  "label": "string (optional)",
  "options": []
}
```

### Filter Types

- `select` - Dropdown filter
- `date` - Single date filter
- `dateRange` - Date range filter
- `text` - Text search filter
- `number` - Numeric range filter

## Data Sources

```json
{
  "data": {
    "sources": {
      "products": {
        "type": "api | localModel | localArray",
        "endpoint": "/api/products (for api type)"
      }
    }
  }
}
```

## Theme Configuration

```json
{
  "theme": {
    "variant": "light | dark | system"
  }
}
```

## Step Structure (for Wizards)

```json
{
  "id": "string",
  "title": "string",
  "components": []
}
```

## Complete Examples

### Simple Grid + Details Module

```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "products",
  "blades": [
    {
      "id": "product-list",
      "route": "/products",
      "layout": "grid",
      "title": "Products",
      "isWorkspace": true,
      "components": [
        {
          "type": "DataTable",
          "dataSource": "products",
          "columns": [
            {"key": "name", "title": "Name"},
            {"key": "price", "title": "Price", "width": "120px"},
            {"key": "status", "title": "Status"}
          ],
          "actions": ["add", "edit", "delete"],
          "filters": [
            {"key": "status", "type": "select"}
          ]
        }
      ],
      "permissions": ["product:read"]
    },
    {
      "id": "product-details",
      "route": "/products/:id?",
      "layout": "details",
      "title": "Product Details",
      "components": [
        {
          "type": "Form",
          "model": "product",
          "fields": [
            {
              "key": "name",
              "as": "Text",
              "label": "Product Name",
              "required": true,
              "rules": ["min:2"]
            },
            {
              "key": "description",
              "as": "Textarea",
              "label": "Description"
            },
            {
              "key": "price",
              "as": "Number",
              "label": "Price",
              "required": true
            }
          ]
        }
      ],
      "actions": ["save", "delete"],
      "permissions": ["product:update"]
    }
  ],
  "data": {
    "sources": {
      "products": {
        "type": "api",
        "endpoint": "/api/products"
      }
    }
  }
}
```

### Multi-Step Wizard

```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "vendor-onboarding",
  "blades": [
    {
      "id": "vendor-onboarding-wizard",
      "route": "/vendors/onboarding",
      "layout": "details",
      "title": "Vendor Onboarding",
      "steps": [
        {
          "id": "company",
          "title": "Company Information",
          "components": [
            {
              "type": "Form",
              "model": "company",
              "fields": [
                {"key": "name", "as": "Text", "label": "Company Name", "required": true},
                {"key": "email", "as": "Email", "label": "Email", "required": true}
              ]
            }
          ]
        },
        {
          "id": "review",
          "title": "Review & Submit",
          "components": []
        }
      ],
      "actions": ["next", "back", "submit"],
      "permissions": ["vendor:create"]
    }
  ]
}
```

## Validation Rules

1. Module name must be kebab-case
2. Blade IDs must be unique and kebab-case
3. Routes must start with `/`
4. No duplicate routes
5. Maximum 50 fields per form
6. All components must exist in Component Registry
7. All props must match Registry signatures

