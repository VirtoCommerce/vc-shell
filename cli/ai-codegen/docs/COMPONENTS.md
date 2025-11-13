# VC-Shell Components Reference

Complete reference of all 35 VC-Shell UI components available for AI code generation.

## Overview

The component registry contains detailed information about all VC-Shell components including:
- Props with types and descriptions
- Events
- Slots
- Usage examples
- Common use cases
- Dependencies

## Component Categories

### Layout & Structure (5 components)

#### VcBlade
**Category:** Layout  
**Description:** Blade container that implements the blade pattern for UI organization  
**Key Props:** title, subtitle, width, expanded, closable, modified, toolbarItems  
**Events:** close, expand, collapse  
**Use Cases:** Page containers, detail views, workspace panels

#### VcCard
**Category:** Layout  
**Description:** Card container for grouping content and form sections  
**Key Props:** header, is-collapsable, is-collapsed  
**Events:** state:collapsed  
**Use Cases:** Form sections, content grouping, collapsible panels

#### VcContainer
**Category:** Layout  
**Description:** Layout container component  
**Use Cases:** Content wrapping, layout structure

#### VcRow / VcCol
**Category:** Layout  
**Description:** Grid system for responsive layouts  
**Key Props:** size (for VcCol)  
**Use Cases:** Form layouts, responsive grids

---

### Data Display (2 components)

#### VcTable
**Category:** Data  
**Description:** Highly customizable data table with sorting, pagination, filtering, multi-select  
**Key Props:** items, columns, loading, totalCount, pages, currentPage, sort, multiselect  
**Events:** item-click, header-click, pagination-click, search:change, selection-changed  
**Slots:** mobile-item, filters, item_{column}, empty, notfound  
**Use Cases:** Data lists, product catalogs, order lists, user management

#### VcField
**Category:** Display  
**Description:** READ-ONLY field for displaying label-value pairs (NOT for forms!)  
**Key Props:** label, modelValue, required, tooltip, orientation, copyable, type  
**Use Cases:** Read-only data display, detail views, information panels

---

### Form Inputs (11 components)

#### VcInput
**Category:** Form  
**Description:** Text input with validation support  
**Key Props:** modelValue, type (text/email/url/number/date/password), label, placeholder, error, errorMessage, clearable  
**Events:** update:modelValue  
**Use Cases:** Text fields, email, dates, URLs, passwords

#### VcTextarea
**Category:** Form  
**Description:** Multi-line text input  
**Key Props:** modelValue, placeholder, disabled, errorMessage, rows  
**Events:** update:modelValue  
**Use Cases:** Descriptions, comments, notes

#### VcEditor
**Category:** Form  
**Description:** Rich Markdown editor with image upload, preview, source view  
**Key Props:** modelValue, label, assetsFolder (REQUIRED), multilanguage, maxlength  
**Events:** update:modelValue  
**Dependencies:** VcLabel  
**Use Cases:** Product descriptions, blog content, rich text fields

#### VcSelect
**Category:** Form  
**Description:** Dropdown select with search, async options, custom templates  
**Key Props:** modelValue, options, optionValue, optionLabel, searchable, clearable, multiple  
**Events:** update:modelValue  
**Slots:** selected-item, option  
**Use Cases:** Dropdowns, category selection, async data selection

#### VcCheckbox
**Category:** Form  
**Description:** Checkbox input  
**Key Props:** modelValue, label, disabled  
**Events:** update:modelValue  
**Use Cases:** Boolean toggles, feature flags, agreements

#### VcSwitch
**Category:** Form  
**Description:** Toggle switch  
**Key Props:** modelValue, label, disabled  
**Events:** update:modelValue  
**Use Cases:** Feature toggles, active/inactive states

#### VcRadioButton
**Category:** Form  
**Description:** Radio button for single selection  
**Key Props:** modelValue, value, binary, checked, disabled, name, label, error, errorMessage  
**Events:** update:modelValue  
**Dependencies:** VcHint  
**Use Cases:** Filter options, settings choices, payment methods

#### VcInputCurrency
**Category:** Form  
**Description:** Specialized input for monetary values with currency selection  
**Key Props:** modelValue, option, options, currencyDisplay, precision  
**Events:** update:modelValue, update:option  
**Dependencies:** VcInputDropdown  
**Use Cases:** Product prices, financial amounts, billing

#### VcInputDropdown
**Category:** Form  
**Description:** Combined input and dropdown for value + unit/category  
**Key Props:** modelValue, option, options, inputType  
**Events:** update:modelValue, update:option  
**Dependencies:** VcInput, VcSelect, VcButton  
**Use Cases:** Measurements with units, quantities with categories

#### VcMultivalue
**Category:** Form  
**Description:** Multi-select input for tags, categories, multiple values  
**Key Props:** modelValue, options, multivalue, type, optionValue, optionLabel  
**Events:** update:model-value, close, search  
**Slots:** option, selected-item  
**Dependencies:** VcLabel, VcIcon, VcButton, VcContainer  
**Use Cases:** Tags, category selection, email recipients, SKU lists

#### VcFileUpload
**Category:** Form  
**Description:** File upload with drag-and-drop and validation  
**Key Props:** variant, loading, accept, multiple, rules, icon  
**Events:** upload  
**Dependencies:** VcIcon, VcLink, VcHint  
**Use Cases:** Document attachments, image uploads, file uploads

---

### UI Components (14 components)

#### VcBadge
**Category:** UI  
**Description:** Notification badges and status indicators  
**Key Props:** content, variant, size, isDot, active, disabled, clickable  
**Events:** click  
**Slots:** default  
**Use Cases:** Notification counts, status indicators, new item badges

#### VcBanner
**Category:** UI  
**Description:** Informational messages, warnings, alerts  
**Key Props:** variant, closable  
**Events:** close  
**Use Cases:** System notifications, announcements, warnings

#### VcButton
**Category:** Form  
**Description:** Button with variants and states  
**Key Props:** variant, disabled, loading, icon  
**Events:** click  
**Use Cases:** Actions, filters, form submissions, toolbar buttons

#### VcIcon
**Category:** UI  
**Description:** Universal icon component (Material, Bootstrap, Lucide, FontAwesome, SVG)  
**Key Props:** icon, size, variant, useContainer, customSize, basePath  
**Use Cases:** Toolbar buttons, navigation, status indicators, empty states

#### VcImage
**Category:** UI  
**Description:** Image display with aspect ratio, sizing, placeholder  
**Key Props:** src, aspect, size, background, rounded, bordered, clickable, emptyIcon  
**Events:** click  
**Dependencies:** VcIcon  
**Use Cases:** Product images, thumbnails, profile pictures, galleries

#### VcLabel
**Category:** Form  
**Description:** Form field label with required indicator, tooltip, multilanguage  
**Key Props:** required, tooltipIcon, multilanguage, currentLanguage, error  
**Slots:** default, tooltip  
**Dependencies:** VcIcon, VcTooltip  
**Use Cases:** Form labels, required fields, multilingual fields

#### VcLink
**Category:** UI  
**Description:** Clickable link with active and disabled states  
**Key Props:** active, disabled, onClick  
**Events:** click  
**Use Cases:** Navigation, breadcrumbs, table actions, inline links

#### VcStatus
**Category:** UI  
**Description:** Status indicator with color variants and dot mode  
**Key Props:** variant, extend, dot  
**Slots:** default  
**Use Cases:** Order status, payment status, item availability

#### VcStatusIcon
**Category:** UI  
**Description:** Simple status indicator using icons for success/error  
**Key Props:** status  
**Dependencies:** VcIcon  
**Use Cases:** Service status, connection states, boolean indicators

#### VcTooltip
**Category:** UI  
**Description:** Tooltip for displaying additional information on hover  
**Key Props:** placement, offset, delay  
**Slots:** default, tooltip  
**Use Cases:** Help text, icon explanations, field descriptions

#### VcHint
**Category:** UI  
**Description:** Supplementary information or guidance text  
**Slots:** default  
**Use Cases:** Field instructions, validation hints, format requirements

#### VcRating
**Category:** UI  
**Description:** Rating display with stars, text, or combined  
**Key Props:** modelValue, max, variant, label, placeholder  
**Slots:** details  
**Dependencies:** VcLabel, VcIcon  
**Use Cases:** Product ratings, review scores, quality indicators

#### VcSlider
**Category:** UI  
**Description:** Carousel/slider for horizontal scrollable content  
**Key Props:** slides, navigation, overflow, slidesPerView, spaceBetweenSlides  
**Slots:** default, prevBtn, nextBtn  
**Dependencies:** VcIcon  
**Use Cases:** Product carousels, image galleries, featured items

#### VcVideo
**Category:** UI  
**Description:** Video embed with label and tooltip  
**Key Props:** label, tooltip, source  
**Dependencies:** VcLabel, VcIcon  
**Use Cases:** Product demos, tutorials, promotional content

---

### Navigation (1 component)

#### VcBreadcrumbs
**Category:** Navigation  
**Description:** Adaptive navigation breadcrumbs with overflow handling  
**Key Props:** items, variant, separated  
**Slots:** trigger  
**Dependencies:** VcButton  
**Use Cases:** Page hierarchy, file navigation, multi-step forms

---

### Organisms (2 components)

#### VcForm
**Category:** Form  
**Description:** Form container, use with vee-validate Field  
**Use Cases:** Form wrapping, validation context

#### VcGallery
**Category:** Form  
**Description:** Image gallery with upload, preview, edit, delete, drag-to-reorder  
**Key Props:** images, disabled, required, label, multiple, variant, itemActions  
**Events:** upload, sort, edit, remove  
**Dependencies:** VcLabel, VcFileUpload, VcHint  
**Use Cases:** Product images, profile pictures, media galleries

---

## Component Usage Patterns

### List Blade Pattern
```vue
<VcBlade>
  <VcTable :items="items" :columns="columns">
    <template #item_status="{ item }">
      <VcStatus :variant="item.statusVariant">
        {{ item.statusText }}
      </VcStatus>
    </template>
    <template #item_image="{ item }">
      <VcImage :src="item.imageUrl" size="s" />
    </template>
    <template #item_rating="{ item }">
      <VcRating :model-value="item.rating" />
    </template>
  </VcTable>
</VcBlade>
```

### Details Blade Pattern
```vue
<VcBlade>
  <VcContainer>
    <VcCard header="Information">
      <Field v-slot="{ field, errorMessage, errors }">
        <VcInput
          v-bind="field"
          label="Name"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
        />
      </Field>
      
      <VcTextarea label="Description" />
      
      <VcSelect
        label="Category"
        :options="categories"
      />
      
      <VcCheckbox label="Is Active" />
    </VcCard>
    
    <VcCard header="Media">
      <VcGallery
        :images="images"
        @upload="handleUpload"
      />
    </VcCard>
  </VcContainer>
</VcBlade>
```

## Quick Reference

### Most Used Components

**List Blades:**
- VcTable (required)
- VcBlade (container)
- VcStatus (status display)
- VcImage (thumbnails)
- VcBadge (counts, labels)
- VcRating (ratings)
- VcLink (clickable names)

**Details Blades:**
- VcBlade (container)
- VcCard (sections)
- VcContainer (wrapper)
- VcInput (text fields)
- VcTextarea (descriptions)
- VcSelect (dropdowns)
- VcCheckbox/VcSwitch (toggles)
- VcEditor (rich text)
- VcGallery (images)
- VcInputCurrency (prices)

**Common Utilities:**
- VcButton (actions)
- VcIcon (icons)
- VcLabel (labels)
- VcHint (hints)
- VcTooltip (tooltips)

## Component Registry

Full component information is available in:
- `src/schemas/component-registry.json` - Complete registry
- `src/examples/components/` - Individual component demos
- `src/examples/compositions/` - Real-world composition examples

## Resources

- [VC-Shell Storybook](https://vc-shell-storybook.govirto.com) - Live component demos
- [VC-Shell Documentation](https://docs.virtocommerce.org/custom-apps-development/vc-shell/) - Full guides
- Component Registry (via MCP) - Available in AI tools

