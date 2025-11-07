# Quick Start Scenarios

Ready-to-use prompts for common module types. Copy, adapt to your needs, and let AI build your module.

## How to Use

1. Find the scenario closest to your needs
2. Copy the prompt
3. Modify details (field names, API endpoints, etc.)
4. Paste to AI and let it build

---

## Scenario 1: E-commerce Product Management

**Use Case:** Managing products in an online store

**Prompt:**
```
Create a complete products management module using create-vc-app CLI.

Requirements:
- Module name: products
- Entity: Product

Grid blade (list) with table columns:
- Image (thumbnail)
- Product name
- SKU
- Price
- Category
- Stock quantity
- Status (active/inactive)
- Actions (edit, delete)

Add filters:
- Search by name
- Filter by category (dropdown)
- Filter by status (dropdown)
- Price range (min-max)

Details blade (form) with fields:
- Product name (text, required)
- SKU (text, required, unique)
- Description (rich text editor)
- Short description (textarea, 3 rows)
- Price (currency, required)
- Compare at price (currency, for showing discounts)
- Cost price (currency)
- Category (select dropdown: Electronics, Clothing, Home, Books, Sports)
- Brand (text)
- Tags (multivalue input)
- Stock quantity (number, required)
- Low stock alert (number, when to alert)
- Weight (number with kg units)
- Dimensions (length x width x height)
- Images (gallery for multiple images)
- Featured product (switch toggle)
- Status (radio buttons: draft, active, inactive)
- SEO title (text)
- SEO description (textarea)

Features:
- Auto-calculate discount percentage from compare at price
- Show stock status indicator (in stock, low stock, out of stock)
- Image upload with preview
- Bulk actions in list (delete multiple)
- Export to CSV button

Use CLI to generate everything, then I'll connect API.
```

---

## Scenario 2: Order Management System

**Use Case:** Managing customer orders

**Prompt:**
```
Create an orders management module with create-vc-app.

Module: orders
Entity: Order

Grid blade with columns:
- Order number (clickable, opens details)
- Order date
- Customer name
- Email
- Total amount
- Payment status (paid, pending, refunded)
- Fulfillment status (unfulfilled, fulfilled, shipped, delivered)
- Actions

Filters:
- Date range picker
- Search by order number or customer name
- Filter by payment status
- Filter by fulfillment status

Details blade with sections:

Section 1: Order Info
- Order number (read-only, auto-generated)
- Order date (date picker, default today)
- Customer name (text, required)
- Customer email (email input, required)
- Customer phone (text)
- Payment method (select: Credit Card, PayPal, Bank Transfer, Cash)
- Payment status (select: Pending, Paid, Refunded, Failed)

Section 2: Order Items (table)
- Product name
- SKU
- Quantity
- Unit price
- Total price
- Remove button

Add item button to add more products

Section 3: Shipping
- Shipping address (textarea, required)
- Shipping method (select: Standard, Express, Overnight)
- Tracking number (text)
- Fulfillment status (select: Unfulfilled, Fulfilled, Shipped, Delivered)
- Shipped date (date picker)

Section 4: Totals
- Subtotal (calculated, read-only)
- Shipping cost (currency)
- Tax (currency or percentage)
- Discount (currency)
- Total (calculated, read-only)

Section 5: Notes
- Internal notes (textarea, for staff only)
- Customer notes (textarea, from customer)

Toolbar actions:
- Save order
- Print order
- Send email to customer
- Mark as paid
- Mark as fulfilled

Generate with CLI.
```

---

## Scenario 3: Customer/Contact Management (CRM)

**Use Case:** Managing customer database

**Prompt:**
```
Create a customers CRM module using create-vc-app CLI.

Module: customers
Entity: Customer

List blade with columns:
- Avatar (image or initials)
- Full name
- Email
- Phone
- Company
- Total orders
- Total spent
- Last order date
- Status (active, inactive)
- Actions

Filters:
- Search by name, email, or phone
- Filter by status
- Filter by total spent (ranges)
- Sort by: name, total spent, last order

Details blade with tabs:

Tab 1: Profile
- First name (text, required)
- Last name (text, required)
- Email (email input, required, unique)
- Phone (text)
- Date of birth (date picker)
- Gender (radio: Male, Female, Other, Prefer not to say)
- Avatar (image upload)
- Company name (text)
- Job title (text)
- Website (url input)
- Status (switch: Active/Inactive)

Tab 2: Addresses
- Address type (select: Billing, Shipping, Both)
- Address line 1 (text, required)
- Address line 2 (text)
- City (text, required)
- State/Province (text)
- ZIP/Postal code (text, required)
- Country (select dropdown with countries)
- Is default address (checkbox)

Add multiple addresses capability

Tab 3: Notes
- Customer notes (rich text editor)
- Tags (multivalue: VIP, Wholesale, Retail, etc.)

Tab 4: Activity (read-only summary)
- Total orders (number)
- Total spent (currency)
- Average order value (currency)
- Last order date (date)
- Customer since (date, calculated)

Generate module with CLI.
```

---

## Scenario 4: Content Management (Blog/Articles)

**Use Case:** Managing blog posts or articles

**Prompt:**
```
Create a blog posts management module using CLI.

Module: blog
Entity: Post

List blade with columns:
- Featured image thumbnail
- Title
- Author
- Category
- Status (draft, published, scheduled)
- Views count
- Published date
- Actions

Filters:
- Search by title or content
- Filter by category
- Filter by status
- Filter by author
- Date range

Details blade with fields:
- Title (text, required, max 120 chars)
- Slug (text, auto-generated from title, editable)
- Featured image (image upload, single image)
- Excerpt (textarea, 3 rows, max 250 chars)
- Content (rich text editor, required)
- Category (select: News, Tutorial, Review, Guide, Opinion)
- Tags (multivalue: technology, business, lifestyle, etc.)
- Author (text or select, required)
- Status (select: Draft, Published, Scheduled)
- Published date (date-time picker)
- Enable comments (switch toggle)
- Featured post (switch toggle)

SEO Section:
- Meta title (text, max 60 chars)
- Meta description (textarea, max 160 chars)
- Focus keyword (text)

Settings:
- Allow comments (switch)
- Notify subscribers (switch)

Generate with create-vc-app.
```

---

## Scenario 5: Inventory Management

**Use Case:** Managing warehouse inventory

**Prompt:**
```
Create inventory management module with CLI.

Module: inventory
Entity: InventoryItem

Grid blade with columns:
- Product image
- Product name
- SKU
- Location (warehouse/bin)
- Quantity in stock
- Reserved quantity
- Available quantity (calculated)
- Reorder level
- Status indicator (in stock, low stock, out of stock)
- Last updated
- Actions

Filters:
- Search by name or SKU
- Filter by location
- Filter by stock status
- Show only low stock items (toggle)

Details blade with sections:

Section 1: Product Info
- Product name (text, required)
- SKU (text, required)
- Barcode (text)
- Product image (single image)

Section 2: Stock
- Quantity in stock (number, required)
- Reserved quantity (number, read-only)
- Available quantity (calculated: stock - reserved)
- Reorder level (number, when to reorder)
- Reorder quantity (number, how many to order)
- Unit of measure (select: pcs, kg, lbs, etc.)

Section 3: Locations
- Warehouse (select: Main, Secondary, Store A, Store B)
- Bin/Shelf location (text)
- Aisle (text)
- Zone (text)

Section 4: Costs
- Cost per unit (currency, required)
- Total value (calculated: quantity × cost)
- Average cost (currency, read-only)

Section 5: Movement History (read-only table)
- Date
- Type (in, out, adjustment, transfer)
- Quantity
- Reference (order/transfer number)
- User
- Notes

Actions:
- Adjust stock (increase/decrease)
- Transfer to another location
- Record damage/loss
- Generate stock report

Generate using create-vc-app CLI.
```

---

## Scenario 6: Category/Taxonomy Management

**Use Case:** Managing product categories or taxonomy

**Prompt:**
```
Create categories management module with create-vc-app.

Module: categories
Entity: Category

List blade with tree view or table:
- Category name (with hierarchy indent)
- Description
- Products count
- Status (active/inactive)
- Sort order
- Actions (edit, add child, delete)

Enable drag-and-drop reordering

Details blade with fields:
- Category name (text, required)
- Slug (text, auto-generated, editable)
- Parent category (select, hierarchical)
- Description (rich text editor)
- Short description (textarea)
- Category image (single image upload)
- Sort order (number, for ordering)
- Status (switch: Active/Inactive)
- Show in menu (checkbox)

SEO Section:
- Meta title (text)
- Meta description (textarea)
- Meta keywords (multivalue)

Settings:
- Products display (select: Grid, List, Both)
- Products per page (number, default 20)
- Default sort (select: Name, Price, Newest)

Generate with CLI.
```

---

## Scenario 7: User/Staff Management

**Use Case:** Managing application users and permissions

**Prompt:**
```
Create user management module using CLI.

Module: users
Entity: User

List blade with columns:
- Avatar
- Full name
- Email
- Role (Admin, Manager, Staff, Viewer)
- Status (active, inactive, invited)
- Last login
- Actions

Filters:
- Search by name or email
- Filter by role
- Filter by status

Details blade with tabs:

Tab 1: Profile
- First name (text, required)
- Last name (text, required)
- Email (email, required, unique)
- Username (text, required, unique)
- Phone (text)
- Avatar (image upload)
- Status (select: Active, Inactive, Suspended)

Tab 2: Account
- Role (select: Admin, Manager, Staff, Viewer)
- Department (select or text)
- Job title (text)
- Employee ID (text)
- Start date (date picker)

Tab 3: Permissions
- Can view products (checkbox)
- Can edit products (checkbox)
- Can delete products (checkbox)
- Can view orders (checkbox)
- Can process orders (checkbox)
- Can view customers (checkbox)
- Can edit customers (checkbox)
- Can access reports (checkbox)
- Can manage users (checkbox)
- Can change settings (checkbox)

Or use role-based permissions instead

Tab 4: Security
- Two-factor authentication (switch)
- Force password change on next login (checkbox)
- Account locked (checkbox)
- Failed login attempts (number, read-only)
- Last login (date-time, read-only)
- Last IP address (text, read-only)

Actions:
- Send password reset email
- Send invitation email
- Deactivate account
- View activity log

Generate with create-vc-app CLI.
```

---

## Scenario 8: Invoice Management

**Use Case:** Creating and managing invoices

**Prompt:**
```
Create invoice management module with CLI.

Module: invoices
Entity: Invoice

List blade with columns:
- Invoice number
- Invoice date
- Due date
- Customer name
- Amount
- Status (draft, sent, paid, overdue)
- Payment received
- Balance due
- Actions

Filters:
- Search by invoice number or customer
- Filter by status
- Date range
- Amount range

Details blade with sections:

Section 1: Invoice Info
- Invoice number (text, auto-generated, read-only)
- Invoice date (date picker, default today)
- Due date (date picker, required)
- Purchase order (text, optional)

Section 2: Customer
- Customer name (select or text, required)
- Customer email (text, required)
- Billing address (textarea)
- Shipping address (textarea, optional)

Section 3: Line Items (table)
- Description (text)
- Quantity (number)
- Unit price (currency)
- Tax rate (percentage)
- Total (calculated)

Add line button

Section 4: Totals
- Subtotal (calculated)
- Tax (calculated)
- Discount (currency or percentage)
- Shipping (currency)
- Total (calculated)
- Amount paid (currency, read-only)
- Balance due (calculated)

Section 5: Payment Info
- Payment method (select: Bank Transfer, Credit Card, PayPal, Check, Cash)
- Payment terms (text: Net 30, Due on receipt, etc.)
- Status (select: Draft, Sent, Paid, Partially Paid, Overdue, Cancelled)

Section 6: Notes
- Notes to customer (textarea, visible on invoice)
- Internal notes (textarea, for staff only)

Actions:
- Send invoice via email
- Download PDF
- Record payment
- Mark as paid
- Duplicate invoice
- Convert to credit note

Generate with create-vc-app.
```

---

## Scenario 9: Task/Project Management

**Use Case:** Simple task and project tracking

**Prompt:**
```
Create task management module using CLI.

Module: tasks
Entity: Task

List blade with columns:
- Status icon (to-do, in progress, done)
- Task title
- Project
- Assigned to
- Priority (low, medium, high, urgent)
- Due date
- Progress (percentage)
- Actions

Filters:
- Search by title
- Filter by project
- Filter by assigned user
- Filter by status
- Filter by priority
- Date range

Details blade with fields:
- Task title (text, required)
- Project (select dropdown, required)
- Description (rich text editor)
- Assigned to (select user, can be multiple)
- Reporter (select user, default current user)
- Priority (radio: Low, Medium, High, Urgent)
- Status (select: To Do, In Progress, Review, Done, Blocked)
- Due date (date picker)
- Estimated time (number, hours)
- Actual time (number, hours, read-only)
- Progress (slider, 0-100%)
- Tags (multivalue: bug, feature, improvement, etc.)

Checklist section:
- Add sub-tasks as checklist items
- Each item: text, checkbox, assigned user

Attachments:
- File upload (multiple files)
- Show file list with download links

Comments:
- Rich text area for comments
- List of previous comments with user and date

Generate with create-vc-app CLI.
```

---

## Scenario 10: Settings/Configuration Page

**Use Case:** Application settings (no list, just form)

**Prompt:**
```
Create application settings module with create-vc-app.

Module: settings
Type: Details blade only (no list)

Settings form with sections:

Section 1: General
- Application name (text, required)
- Company name (text, required)
- Contact email (email, required)
- Support email (email)
- Phone number (text)
- Address (textarea)
- Logo (image upload)
- Favicon (image upload, small icon)
- Timezone (select with all timezones)
- Date format (select: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time format (radio: 12h, 24h)

Section 2: Localization
- Default language (select: English, Spanish, French, German, etc.)
- Currency (select: USD, EUR, GBP, etc.)
- Currency format (text: $1,000.00)
- Decimal separator (text: . or ,)
- Thousand separator (text: , or .)

Section 3: Email
- SMTP host (text, required)
- SMTP port (number, default 587)
- SMTP username (text)
- SMTP password (password)
- From email (email, required)
- From name (text, required)
- Use SSL/TLS (checkbox)
- Test email button (sends test email)

Section 4: Security
- Enable two-factor authentication (switch)
- Session timeout (number, minutes, default 30)
- Password minimum length (number, default 8)
- Require special characters (checkbox)
- Require uppercase (checkbox)
- Require numbers (checkbox)
- Max login attempts (number, default 5)
- Lockout duration (number, minutes, default 15)

Section 5: Notifications
- Enable email notifications (switch)
- Enable push notifications (switch)
- Daily summary email (checkbox)
- Weekly report email (checkbox)
- Notification email (email)

Section 6: Maintenance
- Maintenance mode (switch)
- Maintenance message (textarea)
- Allow IP addresses (textarea, one per line)
- Clear cache button
- Clear logs button
- Database backup button

Actions:
- Save settings
- Reset to defaults
- Export settings (JSON)
- Import settings (upload JSON)

Generate with CLI (details blade only, mark as workspace).
```

---

## How to Adapt These Prompts

### 1. Change Field Names
Replace field names with your specific requirements:
```
Original: Product name (text, required)
Your needs: Service title (text, required)
```

### 2. Add/Remove Fields
Add fields you need, remove ones you don't:
```
Add: License key (text, read-only, auto-generated)
Remove: Tags field (not needed)
```

### 3. Change Component Types
Use different form components:
```
Original: Category (select dropdown)
Your needs: Category (radio buttons: Cat A, Cat B, Cat C)
```

### 4. Modify Workflows
Adjust to your business process:
```
Original: Status (draft, active, inactive)
Your needs: Status (submitted, approved, rejected, pending review)
```

### 5. Add Custom Logic
Describe special requirements:
```
Add: Auto-calculate shipping cost based on weight and destination
Add: Send email notification when status changes to "approved"
Add: Generate PDF receipt when payment is confirmed
```

---

## Next Steps After Generation

1. **Install dependencies:**
   ```bash
   cd your-app
   yarn
   ```

2. **Connect API:**
   See [API Client Generation Guide](./api-client-generation.md)

3. **Test module:**
   ```bash
   yarn serve
   ```
   Open: `http://localhost:8080/apps/your-app/`

4. **Customize:**
   - Update TODO comments in composables
   - Add validation rules
   - Connect real API endpoints
   - Customize styling
   - Add business logic

---

## Related Documentation

- [CLI Usage Guide](./cli-usage.md) - Complete CLI reference
- [API Client Generation](./api-client-generation.md) - Connect to backend
- [Simple Modifications](./simple-modifications.md) - Modify existing modules
- [Complete Workflow](../guides/complete-workflow.md) - Full development process

