# UI-Plan Few-Shot Examples

Examples of prompts and their corresponding UI-Plans for training AI assistants.

## Example 1: Simple Grid

**Prompt:** "Products list with name, price, SKU. Search and status filter. Add product button."

**UI-Plan:**
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
            {"key": "price", "title": "Price"},
            {"key": "sku", "title": "SKU"}
          ],
          "actions": ["add"],
          "filters": [
            {"key": "status", "type": "select"}
          ]
        }
      ],
      "permissions": ["product:read"],
      "theme": {"variant": "system"}
    }
  ],
  "data": {
    "sources": {
      "products": {"type": "api", "endpoint": "/api/products"}
    }
  }
}
```

**Generated files:**
- `src/modules/products/pages/products.vue`
- `src/modules/products/composables/useProductList.ts`
- `src/modules/products/locales/en.json`
- `src/modules/products/index.ts`

---

## Example 2: Details Form

**Prompt:** "Product edit form with name (required), description (textarea), price (number), and status (select)."

**UI-Plan:**
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "products",
  "blades": [
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
              "label": "Description",
              "placeholder": "Enter product description..."
            },
            {
              "key": "price",
              "as": "Number",
              "label": "Price",
              "required": true
            },
            {
              "key": "status",
              "as": "Select",
              "label": "Status",
              "options": [
                {"label": "Active", "value": "active"},
                {"label": "Inactive", "value": "inactive"}
              ]
            }
          ]
        }
      ],
      "actions": ["save", "delete"],
      "permissions": ["product:update"],
      "theme": {"variant": "system"}
    }
  ]
}
```

**Generated files:**
- `src/modules/products/pages/product-details.vue`
- `src/modules/products/composables/useProductDetails.ts`
- `src/modules/products/locales/en.json`

---

## Example 3: Complete Module (Grid + Details)

**Prompt:** "Orders module: list with order ID, customer name, total, status filter. Details form with customer email, shipping address, items table."

**UI-Plan:**
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "orders",
  "blades": [
    {
      "id": "order-list",
      "route": "/orders",
      "layout": "grid",
      "title": "Orders",
      "isWorkspace": true,
      "components": [
        {
          "type": "DataTable",
          "dataSource": "orders",
          "columns": [
            {"key": "id", "title": "Order ID"},
            {"key": "customerName", "title": "Customer"},
            {"key": "total", "title": "Total"},
            {"key": "status", "title": "Status"}
          ],
          "actions": ["add", "edit"],
          "filters": [
            {"key": "status", "type": "select"}
          ]
        }
      ],
      "permissions": ["order:read"],
      "theme": {"variant": "system"}
    },
    {
      "id": "order-details",
      "route": "/orders/:id?",
      "layout": "details",
      "title": "Order Details",
      "components": [
        {
          "type": "Form",
          "model": "order",
          "fields": [
            {
              "key": "customerEmail",
              "as": "Email",
              "label": "Customer Email",
              "required": true
            },
            {
              "key": "shippingAddress",
              "as": "Textarea",
              "label": "Shipping Address",
              "required": true
            }
          ]
        }
      ],
      "actions": ["save", "delete"],
      "permissions": ["order:update"],
      "theme": {"variant": "system"}
    }
  ],
  "data": {
    "sources": {
      "orders": {"type": "api", "endpoint": "/api/orders"}
    }
  }
}
```

**Generated files:**
- `src/modules/orders/pages/orders.vue`
- `src/modules/orders/pages/order-details.vue`
- `src/modules/orders/composables/useOrderList.ts`
- `src/modules/orders/composables/useOrderDetails.ts`
- `src/modules/orders/locales/en.json`
- `src/modules/orders/index.ts`

---

## Example 4: Multi-Step Wizard

**Prompt:** "Vendor onboarding wizard: Step 1 - company info (name, website), Step 2 - contact person (name, email), Step 3 - review and submit."

**UI-Plan:**
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
                {
                  "key": "name",
                  "as": "Text",
                  "label": "Company Name",
                  "required": true
                },
                {
                  "key": "website",
                  "as": "Url",
                  "label": "Website",
                  "placeholder": "https://example.com"
                }
              ]
            }
          ]
        },
        {
          "id": "contact",
          "title": "Contact Person",
          "components": [
            {
              "type": "Form",
              "model": "contact",
              "fields": [
                {
                  "key": "name",
                  "as": "Text",
                  "label": "Contact Name",
                  "required": true
                },
                {
                  "key": "email",
                  "as": "Email",
                  "label": "Email",
                  "required": true
                }
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
      "permissions": ["vendor:create"],
      "theme": {"variant": "system"}
    }
  ]
}
```

**Generated files:**
- `src/modules/vendor-onboarding/pages/vendor-onboarding-wizard.vue`
- `src/modules/vendor-onboarding/composables/useVendorOnboardingDetails.ts`
- `src/modules/vendor-onboarding/locales/en.json`

---

## Example 5: With Date Range Filter

**Prompt:** "Sales report: list with order date, customer, amount. Date range filter and export button."

**UI-Plan:**
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "sales-report",
  "blades": [
    {
      "id": "sales-report-list",
      "route": "/reports/sales",
      "layout": "grid",
      "title": "Sales Report",
      "isWorkspace": true,
      "components": [
        {
          "type": "DataTable",
          "dataSource": "sales",
          "columns": [
            {"key": "orderDate", "title": "Date"},
            {"key": "customer", "title": "Customer"},
            {"key": "amount", "title": "Amount"}
          ],
          "actions": ["refresh"],
          "filters": [
            {"key": "dateRange", "type": "dateRange"}
          ]
        }
      ],
      "permissions": ["report:read"],
      "theme": {"variant": "system"}
    }
  ],
  "data": {
    "sources": {
      "sales": {"type": "api", "endpoint": "/api/reports/sales"}
    }
  }
}
```

---

## Example 6: Admin-Only Module

**Prompt:** "User management for admins: list with name, email, role. Add/edit form with name (required), email (required), role (select), active status (switch). Admin permission required."

**UI-Plan:**
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "users",
  "blades": [
    {
      "id": "user-list",
      "route": "/users",
      "layout": "grid",
      "title": "Users",
      "isWorkspace": true,
      "components": [
        {
          "type": "DataTable",
          "dataSource": "users",
          "columns": [
            {"key": "name", "title": "Name"},
            {"key": "email", "title": "Email"},
            {"key": "role", "title": "Role"}
          ],
          "actions": ["add", "edit", "delete"]
        }
      ],
      "permissions": ["admin:users"],
      "theme": {"variant": "system"}
    },
    {
      "id": "user-details",
      "route": "/users/:id?",
      "layout": "details",
      "title": "User Details",
      "components": [
        {
          "type": "Form",
          "model": "user",
          "fields": [
            {
              "key": "name",
              "as": "Text",
              "label": "Name",
              "required": true
            },
            {
              "key": "email",
              "as": "Email",
              "label": "Email",
              "required": true
            },
            {
              "key": "role",
              "as": "Select",
              "label": "Role",
              "options": [
                {"label": "Admin", "value": "admin"},
                {"label": "User", "value": "user"}
              ]
            },
            {
              "key": "active",
              "as": "Switch",
              "label": "Active"
            }
          ]
        }
      ],
      "actions": ["save", "delete"],
      "permissions": ["admin:users"],
      "theme": {"variant": "system"}
    }
  ],
  "data": {
    "sources": {
      "users": {"type": "api", "endpoint": "/api/users"}
    }
  }
}
```

---

## Pattern Recognition Guide

### Keywords → Layouts

**Grid Layout Indicators:**
- "list", "table", "catalog", "grid"
- "search", "filter", "pagination"
- "view all", "browse"

**Details Layout Indicators:**
- "form", "edit", "create", "add"
- "details", "wizard", "steps"
- "update", "manage single"

### Keywords → Components

**DataTable:**
- "list", "table", "catalog", "grid"
- "columns", "rows", "search"

**Form:**
- "form", "fields", "input"
- "create", "edit", "update"

**Filters:**
- "filter by", "search by"
- "date range", "status filter"

### Keywords → Field Types

- "email" → Email field
- "password" → Password field
- "description", "notes" → Textarea
- "price", "amount", "quantity" → Number
- "date", "time" → Date
- "status", "type", "category" → Select
- "active", "enabled" → Switch/Checkbox
- "images", "photos" → Gallery
- "upload", "attach" → FileUpload

### Keywords → Permissions

- "admin" → admin:*
- "view only" → {module}:read
- "can edit" → {module}:update
- "can delete" → {module}:delete
- "full access" → {module}:*

