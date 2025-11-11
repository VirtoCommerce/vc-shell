# Complete VC-Shell Component List

## Layout Components (Organisms)

### VcBlade
- **Purpose:** Blade container, always outer wrapper
- **Props:** title, width, expanded, closable, modified, toolbar-items
- **Events:** close, expand, collapse
- **Usage:** Outer container for all blades

### VcTable
- **Purpose:** Data table with sorting, pagination, filtering
- **Props:** items, columns, loading, sort, pages, current-page, total-count, multiselect, search-value, active-filter-count, state-key
- **Events:** item-click, header-click, pagination-click, search:change, selection-changed, select:all
- **Slots:** filters, item_{columnId}, empty, notfound, mobile-item
- **Usage:** Display lists of data

### VcGallery
- **Purpose:** Image/file gallery with upload
- **Props:** images, multiple, variant, rules, item-actions, loading
- **Events:** upload, remove, sort, edit
- **Usage:** Image galleries in forms

### VcPopup
- **Purpose:** Modal popup (rarely used directly, use usePopup composable)

## Form Components (Molecules)

### VcForm
- **Purpose:** Form container
- **Usage:** Wrap form fields, use with vee-validate

### VcField  
- **Purpose:** Display read-only data with label-value pairs
- **Props:** label, model-value, orientation, aspect-ratio, copyable, type
- **Usage:** Show read-only information (order summaries, details view)
- **NOT for forms!** Use Field from vee-validate for form inputs

### VcInput
- **Props:** v-model, type, label, placeholder, error, error-message, loading, clearable, maxlength, disabled, required
- **Types:** text, email, date, number, password
- **Events:** update:model-value

### VcTextarea
- **Props:** v-model, label, placeholder, rows, error, error-message

### VcSelect
- **Props:** v-model, label, options, option-value, option-label, searchable, loading, error, error-message, clearable, disabled, required
- **Slots:** selected-item, option (for custom templates)
- **Usage:** Dropdown select, supports async options

### VcCheckbox
- **Props:** v-model, label, disabled

### VcRadioButton
- **Props:** v-model, value, label, disabled
- **Usage:** Radio groups for filters or forms

### VcSwitch
- **Props:** v-model, label, true-value, false-value, disabled

### VcFileUpload
- **Props:** Upload files
- **Usage:** File input

### VcEditor
- **Purpose:** Rich text editor
- **Usage:** WYSIWYG content editing

### VcRating
- **Purpose:** Star rating input

### VcSlider
- **Purpose:** Slider input

### VcBreadcrumbs
- **Purpose:** Breadcrumb navigation

### VcPagination
- **Purpose:** Pagination control (VcTable handles this internally)

### VcToast
- **Purpose:** Toast notifications (use notification composable)

### VcMultivalue
- **Purpose:** Multi-value input

### VcInputCurrency
- **Purpose:** Currency input with formatting

### VcInputDropdown
- **Purpose:** Input with dropdown

## Display Components (Atoms)

### VcCard
- **Props:** header, is-collapsable, is-collapsed
- **Events:** state:collapsed
- **Usage:** Group content, form sections

### VcContainer
- **Props:** no-padding
- **Usage:** Content container (used inside VcBlade for forms)

### VcRow
- **Purpose:** Grid row
- **Usage:** Layout rows, use with VcCol

### VcCol
- **Props:** size (1-12)
- **Usage:** Grid columns

### VcButton
- **Props:** variant, disabled, loading, icon, size
- **Variants:** primary, secondary, danger, text
- **Events:** click

### VcBadge
- **Props:** variant
- **Usage:** Badges, tags

### VcStatus
- **Props:** variant, outline, dot, extend
- **Variants:** success, warning, danger, info, primary, light-danger, info-dark
- **Usage:** Status indicators

### VcStatusIcon
- **Props:** status (boolean)
- **Usage:** Simple status icon (checkmark/cross)

### VcImage
- **Props:** src, size, bordered, aspect
- **Sizes:** xs, s, m, l, xl
- **Aspect:** 1x1, 16x9, etc.

### VcIcon
- **Props:** icon, size
- **Prefixes:** material-, fas fa-, lucide-
- **Sizes:** xs, s, m, l, xl, xxl

### VcLabel
- **Props:** required
- **Usage:** Form labels (optional, VcInput has built-in label)

### VcHint
- **Usage:** Helper text, hints

### VcLoading
- **Props:** active
- **Usage:** Loading overlay

### VcSkeleton
- **Purpose:** Skeleton loading state

### VcBanner
- **Props:** variant, icon, icon-size
- **Variants:** info-dark, warning, danger, success
- **Usage:** Info messages at top of forms

### VcTooltip
- **Props:** text
- **Usage:** Tooltips

### VcVideo
- **Purpose:** Video player

### VcWidget
- **Purpose:** Widget container

### VcLink
- **Purpose:** Link component

### VcProgress
- **Purpose:** Progress bar

## Components That DON'T Exist

- ❌ VcChart
- ❌ VcStat
- ❌ VcTabs
- ❌ VcDivider
- ❌ VcMenuItem
- ❌ VcDropdownMenu

Use alternatives:
- Charts → External library (recharts, chart.js)
- Tabs → Custom divs or multiple VcCard
- Divider → CSS borders
- Dropdown menu → VcInputDropdown or item-action-builder

