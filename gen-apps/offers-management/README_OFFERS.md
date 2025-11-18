# Offers Management Module

A complete offers management application built with VC-Shell framework.

## Features Implemented

### 📋 List Blade (offers-list)

**Table Columns:**
- Product image (thumbnail)
- Product name (clickable, opens details)
- Created date (date-ago format)
- SKU
- Enabled status (with status icon)
- Default status (with status icon, conditional based on settings)
- Actions (delete button)

**Filters:**
- Search by keywords (product name, SKU)
- Sorting by: name, createdDate, sku, isActive, isDefault

**Grid Features:**
- ✅ Multi-select rows
- ✅ Select all (with pagination support)
- ✅ Bulk delete selected offers
- ✅ Pull-to-refresh functionality
- ✅ Empty state with "Add offer" action
- ✅ Not found state with "Reset search" action

**Toolbar Actions:**
- Refresh list
- Add new offer
- Delete selected (disabled when nothing selected, desktop only)

---

### 📝 Details Blade (offers-details)

**Product Selection:**
- ✅ Product selector (async searchable dropdown, required)
- ✅ Search products by keyword
- ✅ Display with custom template (image + name + SKU)
- ✅ Disabled after offer is created
- ✅ Options loaded from API: searchOfferProducts

**Basic Information:**
- ✅ Name (text, required, placeholder: "Enter offer name")
- ✅ Product type (select dropdown, required)
  - Options: Physical, Digital
  - Disabled after creation
  - Tooltip: "Product type: Physical or Digital"

**Inventory Section (VcCard with header "Inventory"):**
- ✅ SKU (text input, required, min 3 chars, max 61 chars)
  - Debounced validation (1000ms)
  - Check uniqueness via API: validateOffer
  - Display error: "An offer with the SKU: {value} already exists"
  - Generate default SKU format: XXX-XXXXXXXX (3 letters + dash + 8 numbers)
- ✅ Track inventory (switch toggle)
  - Label: "Quantity in Stock"
  - Tooltip: "Always in stock"
  - Inverted logic: true = false, false = true
- ✅ Fulfillment centers inventory (dynamic list based on fulfillment centers)
  - For each center: quantity field (number, required, min 0, bigint validation)
  - Label: fulfillment center name
  - Disabled when track inventory is off

**Gallery Section (collapsable VcCard):**
- ✅ Multiple image upload
- ✅ Drag-to-reorder images
- ✅ Edit image details
- ✅ Remove images with confirmation
- ✅ Upload to: offers/{offerId}
- ✅ Loading indicator during upload

**Language Support:**
- ✅ Language selector in top-right corner (when multilanguage enabled)
- ✅ Localized fields support

**Form Validation:**
- ✅ VeeValidate with real-time validation
- ✅ Required fields: product, name, productType, sku
- ✅ Custom validation: SKU uniqueness check
- ✅ Show validation errors on save attempt

**Details Toolbar Actions:**
- ✅ Save (disabled when invalid or not modified, loading indicator)
- ✅ Enable offer (visible when offer exists and disabled)
- ✅ Disable offer (visible when offer exists and enabled)
- ✅ Set as default (visible when offer exists, disabled when already default, conditional on settings)
- ✅ Delete (visible when offer exists, with confirmation)

**Special Features:**
- ✅ Modification tracking (blade shows modified state)
- ✅ Warn on close if unsaved changes
- ✅ Warn on browser refresh if unsaved changes
- ✅ After save: reload parent blade
- ✅ After save new offer: open details blade for created offer
- ✅ Load languages on mount
- ✅ Load marketplace settings on mount

**Notification Handling:**
- ✅ Listen for: OfferCreatedDomainEvent, OfferDeletedDomainEvent
- ✅ Show success notification
- ✅ Mark notification as read

---

### 🔌 Widget Integration

**SpecialPricesWidget:**
- ✅ Displays on offer details blade
- ✅ Only shows when offer exists (not for new offers)
- ✅ Shows count of price tags
- ✅ Click widget opens special-prices-list blade (placeholder implemented)

---

## File Structure

```
src/modules/offers/
├── pages/
│   ├── offers-list.vue          # List blade with table, filters, multiselect
│   ├── offers-details.vue       # Details blade with form, validation, gallery
│   └── index.ts
├── composables/
│   ├── useOfferList.ts         # List logic and API calls (mocked)
│   ├── useOfferDetails.ts      # Details logic and API calls (mocked)
│   └── index.ts
├── components/
│   ├── special-prices-widget.vue  # Special prices widget
│   ├── status-badge.vue
│   └── index.ts
├── locales/
│   ├── en.json                 # Complete English translations
│   └── index.ts
└── index.ts                     # Module registration
```

---

## API Methods (Currently Mocked)

**Offers:**
- `searchOffers(query: SearchOffersQuery)` - Search offers list
- `getOfferByIdGET(id: string)` - Get single offer
- `createNewOffer(command: CreateNewOfferCommand)` - Create offer
- `updateOffer(command: UpdateOfferCommand)` - Update offer
- `deleteOffers(ids: string[])` - Delete offers
- `bulkDeleteOffers(command: BulkOffersDeleteCommand)` - Bulk delete
- `validateOffer(query: ValidateOfferQuery)` - Validate offer SKU
- `changeOfferDefault(command: ChangeOfferDefaultCommand)` - Set default offer
- `searchOfferProducts(query: SearchProductsForNewOfferQuery)` - Search products for dropdown

---

## Mock Data

The application includes comprehensive mock data for development:

**Mock Offers (5 items):**
- Summer Collection T-Shirt
- Winter Jacket Premium
- Spring Sneakers
- Fall Boots Leather
- Classic Denim Jeans

**Mock Products (5 items):**
- Product A through E with SKUs and images

**Mock Fulfillment Centers (3 items):**
- Main Warehouse
- East Coast Warehouse
- West Coast Warehouse

---

## Installation & Running

### 1. Install Dependencies

```bash
cd /Users/symbot/DEV/vc-shell/gen-apps/offers-management
yarn install
```

### 2. Run Development Server

```bash
yarn serve
```

The application will be available at `http://localhost:8080`

### 3. Build for Production

```bash
yarn build
```

---

## Usage

### Creating a New Offer

1. Click "Add Offer" from the toolbar or empty state
2. Select a product from the searchable dropdown
3. Enter offer name
4. Select product type (Physical/Digital) - disabled after save
5. Enter SKU or click "Generate" for auto-generated SKU
6. Toggle "Track Inventory" if needed
7. If tracking inventory, enter quantities for each fulfillment center
8. Upload images in the Gallery section (optional)
9. Click "Save"

### Editing an Offer

1. Click on an offer row in the list
2. Modify fields as needed
3. Click "Save" when done
4. Use toolbar actions: Enable/Disable, Set as Default, Delete

### Bulk Operations

1. Select multiple offers using checkboxes
2. Click "Delete Selected" from toolbar (desktop only)
3. Confirm deletion

### Filtering & Sorting

1. Use the search box to filter by name or SKU
2. Select sort order from the dropdown
3. Click column headers to sort (asc/desc/none)
4. Click "Reset Search" to clear filters

---

## Features Highlights

### ✨ Advanced Features Implemented

1. **Real-time Search & Filter**
   - Debounced search input
   - Multiple sort options
   - Filter by keywords

2. **Form Validation**
   - VeeValidate integration
   - Async SKU validation with debounce
   - Real-time error display
   - Custom validation messages

3. **State Management**
   - Modification tracking
   - Unsaved changes warning
   - Browser refresh protection

4. **User Experience**
   - Loading states
   - Success/error notifications
   - Confirmation dialogs
   - Empty states
   - Not found states
   - Mobile-responsive design

5. **Domain Events**
   - OfferCreatedDomainEvent
   - OfferDeletedDomainEvent
   - Auto-refresh on events

6. **Multi-language Support**
   - Language selector
   - Complete i18n coverage
   - Extensible locale system

7. **Image Gallery**
   - Drag-to-reorder
   - Upload with progress
   - Delete with confirmation
   - Preview images

---

## Next Steps

To connect this to a real API:

1. Replace mock data in `useOfferList.ts` with actual API client calls
2. Replace mock data in `useOfferDetails.ts` with actual API client calls
3. Update API client configuration
4. Add authentication/authorization
5. Implement actual image upload to backend storage
6. Connect SpecialPricesWidget to real special prices module

---

## Technologies Used

- **Vue 3** - Composition API with TypeScript
- **VC-Shell Framework** - UI components and blade system
- **VeeValidate** - Form validation
- **Vue I18n** - Internationalization
- **Moment.js** - Date formatting
- **Lodash** - Utility functions (debounce)

---

## Component Documentation

All VC-Shell components used are fully documented. Key components:

- **VcBlade** - Blade container with toolbar
- **VcTable** - Data table with sorting, pagination, multiselect
- **VcForm** - Form container with validation
- **VcInput** - Text input with validation
- **VcSelect** - Dropdown select (searchable, async)
- **VcSwitch** - Toggle switch
- **VcCard** - Card container (collapsible)
- **VcGallery** - Image gallery with drag-and-drop
- **VcStatus** - Status badge
- **VcButton** - Button component
- **VcIcon** - Icon component
- **VcImage** - Image component with size variants
- **VcWidget** - Widget card for dashboard

---

## License

This module is part of the VC-Shell ecosystem.
