# Simple Modifications - Universal Prompt Templates

Universal prompt templates for modifying VC-Shell modules. Replace `{{placeholders}}` with your actual values.

## How to Use

1. **Copy** the template you need
2. **Replace** all `{{placeholders}}` with your values
3. **Use** with AI to implement the change

**Example:**
```
Template: Add "{{columnName}}" column to {{moduleName}} list blade
Filled:   Add "email" column to customers list blade
```

---

## Workspace Blade Operations (List View)

### Add Column to Table

```
Add "{{columnName}}" column to {{moduleName}} list blade.
Column type: {{columnType}}
Position: {{position}}
Width: {{width}}
Sortable: {{isSortable}}
Mobile position: {{mobilePosition}}
Locale key: {{MODULE_NAME}}.PAGES.LIST.TABLE.HEADER.{{COLUMN_KEY}}
```

**Column types:** `text`, `image`, `date-ago`, `status-icon`, `badge`, `currency`
**Positions:** `first`, `last`, `after "{{columnName}}"`, `before "{{columnName}}"`
**Mobile positions:** `top-left`, `top-right`, `bottom-left`, `bottom-right`, `status`, `image`

---

### Remove Column from Table

```
Remove "{{columnName}}" column from {{moduleName}} list blade.
Also remove from locale: {{MODULE_NAME}}.PAGES.LIST.TABLE.HEADER.{{COLUMN_KEY}}
```

---

### Reorder Table Columns

```
Reorder columns in {{moduleName}} list blade.
New order: {{columnOrder}}
Keep all existing configurations (width, sorting, mobile position).
```

**Example:** `New order: image, name, email, status, createdDate`

---

### Change Column Type

```
Change "{{columnName}}" column type in {{moduleName}} list blade.
From: {{oldType}}
To: {{newType}}
Update display logic: {{displayLogic}}
```

---

### Add Table Sorting

```
Enable sorting for "{{columnName}}" column in {{moduleName}} list blade.
Default sort: {{defaultSort}}
Sort direction: {{sortDirection}}
Update API call with sort parameter: {{sortParameter}}
```

**Sort directions:** `ASC`, `DESC`

---

### Add Row Selection

```
Add row selection to {{moduleName}} list blade.
Selection type: {{selectionType}}
Show "Select All" option: {{showSelectAll}}
Enable bulk actions: {{bulkActions}}
```

**Selection types:** `single`, `multiple`

---

### Add Empty State

```
Customize empty state for {{moduleName}} list blade.
Icon: {{materialIcon}}
Text: "{{emptyStateText}}"
Action button: "{{actionButtonText}}"
Button action: {{buttonAction}}
Locale keys:
- Text: {{MODULE_NAME}}.PAGES.LIST.EMPTY.NO_ITEMS
- Button: {{MODULE_NAME}}.PAGES.LIST.EMPTY.ADD
```

---

### Add Not Found State

```
Customize not found state for {{moduleName}} list blade.
Icon: {{materialIcon}}
Text: "{{notFoundText}}"
Action button: "{{resetButtonText}}"
Button action: {{resetAction}}
Locale keys:
- Text: {{MODULE_NAME}}.PAGES.LIST.NOT_FOUND.EMPTY
- Button: {{MODULE_NAME}}.PAGES.LIST.NOT_FOUND.RESET
```

---

### Add Search Functionality

```
Update search in {{moduleName}} list blade.
Search placeholder: "{{placeholderText}}"
Search fields: {{searchFields}}
Debounce delay: {{debounceMs}}ms
Locale key: {{MODULE_NAME}}.PAGES.LIST.SEARCH.PLACEHOLDER
```

---

### Add Pagination

```
Configure pagination for {{moduleName}} list blade.
Page size: {{pageSize}}
Page size options: {{pageSizeOptions}}
Show total count: {{showTotalCount}}
Total count label locale: {{MODULE_NAME}}.PAGES.LIST.TABLE.TOTALS
```

---

## Details Blade Operations (Forms)

### Add Form Field

```
Add "{{fieldName}}" field to {{moduleName}} details blade.
Component: {{vcComponent}}
Validation: {{validationRules}}
Required: {{isRequired}}
Position: {{position}}
Locale keys:
- Label: {{MODULE_NAME}}.PAGES.DETAILS.FIELDS.{{FIELD_KEY}}.TITLE
- Placeholder: {{MODULE_NAME}}.PAGES.DETAILS.FIELDS.{{FIELD_KEY}}.PLACEHOLDER
- Error: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_{{ERROR_TYPE}}
```

**Components:** `VcInput`, `VcSelect`, `VcEditor`, `VcSwitch`, `VcGallery`, `VcInputCurrency`, `VcMultivalue`, `VcCheckbox`, `VcRadioButton`

**Validation rules:** `required`, `email`, `min:{{value}}`, `max:{{value}}`, `regex:{{pattern}}`, `unique`

---

### Remove Form Field

```
Remove "{{fieldName}}" field from {{moduleName}} details blade.
Remove from:
- Form template
- Validation schema
- TypeScript interface ({{interfaceName}})
- API payload
- Locale keys ({{MODULE_NAME}}.PAGES.DETAILS.FIELDS.{{FIELD_KEY}}.*)
```

---

### Change Field Component Type

```
Change "{{fieldName}}" field in {{moduleName}} details blade.
From: {{oldComponent}}
To: {{newComponent}}
Update props: {{propsChanges}}
Update validation: {{validationChanges}}
```

---

### Add Field Validation

```
Add {{validationType}} validation to "{{fieldName}}" in {{moduleName}} details blade.
Validation rule: {{validationRule}}
Error message: "{{errorMessage}}"
Locale key: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_{{ERROR_TYPE}}
```

---

### Make Field Required

```
Make "{{fieldName}}" required in {{moduleName}} details blade.
Add asterisk (*) to label: {{showAsterisk}}
Validation rule: required
Error message: "{{errorMessage}}"
Locale key: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_REQUIRED
```

---

### Add Conditional Field Display

```
Show "{{fieldName}}" field in {{moduleName}} details blade only when {{condition}}.
Condition: "{{conditionField}}" {{operator}} "{{conditionValue}}"
Implementation: {{implementationMethod}}
```

**Operators:** `equals`, `not equals`, `contains`, `greater than`, `less than`
**Implementation methods:** `v-if`, `v-show`, `computed property`

---

### Group Form Fields

```
Group related fields in {{moduleName}} details blade.
Section name: "{{sectionName}}"
Fields: {{fieldsList}}
Collapsible: {{isCollapsible}}
Default state: {{defaultState}}
Locale key: {{MODULE_NAME}}.PAGES.DETAILS.SECTIONS.{{SECTION_KEY}}.TITLE
```

**Default states:** `expanded`, `collapsed`

---

### Add Form Tabs

```
Add tabs to {{moduleName}} details blade.
Tabs:
{{tabsList}}
Default active tab: {{defaultTab}}
Locale keys: {{MODULE_NAME}}.PAGES.DETAILS.TABS.{{TAB_KEY}}.TITLE
```

**Example tabs list:**
```
- Basic Info (fields: name, description)
- Advanced (fields: settings, metadata)
- History (show audit log)
```

---

### Change Form Layout

```
Change form layout in {{moduleName}} details blade.
From: {{oldLayout}}
To: {{newLayout}}
Column 1 fields: {{column1Fields}}
Column 2 fields: {{column2Fields}}
Full-width fields: {{fullWidthFields}}
Gap between fields: {{gapSize}}
```

**Layouts:** `single-column`, `two-column`, `three-column`, `custom`

---

## Toolbar Operations

### Add Toolbar Button

```
Add "{{buttonText}}" toolbar button to {{moduleName}} {{bladeType}} blade.
Position: {{position}}
Icon: {{materialIcon}}
Action: {{actionDescription}}
Disabled when: {{disabledCondition}}
Visible when: {{visibleCondition}}
Locale key: {{MODULE_NAME}}.PAGES.{{PAGE_TYPE}}.TOOLBAR.{{BUTTON_KEY}}
```

**Blade types:** `list`, `details`
**Positions:** `start`, `end`, `after "{{buttonId}}"`, `before "{{buttonId}}"`

---

### Remove Toolbar Button

```
Remove "{{buttonId}}" toolbar button from {{moduleName}} {{bladeType}} blade.
```

---

### Change Toolbar Button Text

```
Change toolbar button text in {{moduleName}} {{bladeType}} blade.
Button ID: {{buttonId}}
From: "{{oldText}}"
To: "{{newText}}"
Update locale key: {{MODULE_NAME}}.PAGES.{{PAGE_TYPE}}.TOOLBAR.{{BUTTON_KEY}}
```

---

### Add Button Loading State

```
Add loading state to "{{buttonId}}" button in {{moduleName}} {{bladeType}} blade.
Loading indicator: {{loadingIndicator}}
Loading text: "{{loadingText}}"
Disable while loading: {{disableWhileLoading}}
```

---

### Make Button Conditional

```
Make "{{buttonId}}" button conditional in {{moduleName}} {{bladeType}} blade.
Visible when: {{visibleCondition}}
Disabled when: {{disabledCondition}}
Tooltip when disabled: "{{disabledTooltip}}"
```

---

## Widget Integration

### Add Widget to Details Blade

```
Add "{{widgetName}}" widget to {{moduleName}} details blade.
Widget displays: {{widgetContent}}
Icon: {{materialIcon}}
Click action: {{clickAction}}
Register using useWidgets() composable
Locale key: {{MODULE_NAME}}.WIDGETS.{{WIDGET_KEY}}.TITLE
```

---

### Remove Widget

```
Remove "{{widgetName}}" widget from {{moduleName}} details blade.
Unregister in blade's onBeforeUnmount hook.
Remove locale: {{MODULE_NAME}}.WIDGETS.{{WIDGET_KEY}}.*
```

---

### Change Widget Content

```
Update "{{widgetName}}" widget content in {{moduleName}} details blade.
New content: {{newContent}}
Update data source: {{dataSource}}
Update display logic: {{displayLogic}}
```

---

## Custom Cell Templates

### Create Cell Template Component

```
Create custom cell template for "{{columnName}}" in {{moduleName}} table.
Component name: {{ComponentName}}Cell.vue
Display: {{displayDescription}}
Props: {{propsInterface}}
Location: modules/{{module-name}}/components/{{ComponentName}}Cell.vue
Register in table columns with template slot
```

---

### Use Existing Cell Template

```
Apply existing cell template to "{{columnName}}" in {{moduleName}} table.
Template component: {{TemplateComponent}}
Import from: {{importPath}}
Configure with: {{configuration}}
```

---

## Composable Modifications

### Add Composable Function

```
Add {{functionName}} to {{moduleName}} composable.
Composable file: use{{EntityName}}{{Type}}.ts
Function purpose: {{functionPurpose}}
Parameters: {{functionParams}}
Return value: {{returnValue}}
Use pattern: {{pattern}}
```

**Composable types:** `List`, `Details`, `Manager`
**Patterns:** `useAsync`, `useModificationTracker`, `useTableSort`, `computed`, `watch`

---

### Update API Integration

```
Update API integration in {{moduleName}} composable.
Composable: use{{EntityName}}{{Type}}.ts
API client: {{ApiClientClass}}
Endpoint changes: {{endpointChanges}}
Request payload mapping: {{requestMapping}}
Response mapping: {{responseMapping}}
```

---

### Add Modification Tracking

```
Add modification tracking to {{moduleName}} details blade.
Use useModificationTracker composable
Track: {{itemRef}}
Show modified indicator on blade
Reset after successful save
```

---

### Add Loading State

```
Add loading state to {{action}} in {{moduleName}}.
Use useAsync composable
Show loading: {{loadingIndicator}}
Disable UI while loading: {{disableElements}}
```

---

## Localization

### Add Module Locales

```
Add locale keys for {{moduleName}} module.
Locale file: modules/{{module-name}}/locales/en.json
Structure:
{{MODULE_NAME}}.MENU.TITLE
{{MODULE_NAME}}.PAGES.LIST.TITLE
{{MODULE_NAME}}.PAGES.LIST.TOOLBAR.*
{{MODULE_NAME}}.PAGES.LIST.TABLE.HEADER.*
{{MODULE_NAME}}.PAGES.DETAILS.TITLE
{{MODULE_NAME}}.PAGES.DETAILS.FIELDS.*
{{MODULE_NAME}}.WIDGETS.*
```

---

### Update Locale Text

```
Update locale text in {{moduleName}}.
Locale key: {{localeKey}}
From: "{{oldText}}"
To: "{{newText}}"
File: modules/{{module-name}}/locales/{{language}}.json
```

---

### Add New Language

```
Add {{language}} translation for {{moduleName}}.
Copy structure from en.json
Create: modules/{{module-name}}/locales/{{languageCode}}.json
Translate all keys
Register in locales/index.ts
```

---

## Validation Rules

### Add Email Validation

```
Add email validation to "{{fieldName}}" in {{moduleName}} details blade.
Validation rule: email
Error message: "{{errorMessage}}"
Locale key: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_EMAIL
```

---

### Add Length Validation

```
Add length validation to "{{fieldName}}" in {{moduleName}} details blade.
Min length: {{minLength}}
Max length: {{maxLength}}
Error messages:
- Min: "{{minErrorMessage}}"
- Max: "{{maxErrorMessage}}"
Locale keys:
- Min: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_MIN
- Max: {{MODULE_NAME}}.PAGES.DETAILS.VALIDATION.{{FIELD_KEY}}_MAX
```

---

### Add Custom Validation

```
Add custom validation to "{{fieldName}}" in {{moduleName}} details blade.
Validation logic: {{validationLogic}}
Error message: "{{errorMessage}}"
Async validation: {{isAsync}}
API endpoint (if async): {{validationEndpoint}}
```

---

### Add Unique Validation

```
Add unique validation to "{{fieldName}}" in {{moduleName}} details blade.
Check against API: {{apiEndpoint}}
Debounce delay: {{debounceMs}}ms
Error message: "{{errorMessage}}"
Loading indicator while checking: {{showLoading}}
```

---

## Bulk Operations

### Add Bulk Delete

```
Add bulk delete to {{moduleName}} list blade.
Selection required: {{requireSelection}}
Confirmation dialog: {{confirmationMessage}}
Delete API endpoint: {{deleteEndpoint}}
Refresh list after deletion: {{refreshAfterDelete}}
Locale keys:
- Toolbar button: {{MODULE_NAME}}.PAGES.LIST.TOOLBAR.DELETE
- Confirmation: {{MODULE_NAME}}.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE
```

---

### Add Bulk Update

```
Add bulk {{updateType}} update to {{moduleName}} list blade.
Update field: {{fieldName}}
New value: {{newValue}}
Options: {{updateOptions}}
Confirmation required: {{requireConfirmation}}
Update API endpoint: {{updateEndpoint}}
```

---

### Add Bulk Export

```
Add bulk export to {{moduleName}} list blade.
Export format: {{exportFormat}}
Include columns: {{columnsToExport}}
Filename pattern: {{filenamePattern}}
Export API endpoint: {{exportEndpoint}}
Show progress indicator: {{showProgress}}
```

**Export formats:** `CSV`, `Excel`, `JSON`, `PDF`

---

### Add Select All Functionality

```
Add "Select All" to {{moduleName}} list blade.
Select all visible items: {{selectVisible}}
Select all items (including not loaded): {{selectAll}}
Show selection count: {{showCount}}
Clear selection button: {{showClearButton}}
```

---

## Filters & Search

### Add Filter

```
Add {{filterType}} filter to {{moduleName}} list blade.
Filter by: {{filterField}}
Filter options: {{filterOptions}}
Default value: {{defaultValue}}
Multiple selection: {{allowMultiple}}
Position: {{filterPosition}}
```

**Filter types:** `select`, `date-range`, `status`, `checkbox`, `custom`

---

### Add Date Range Filter

```
Add date range filter to {{moduleName}} list blade.
Filter field: {{dateField}}
Presets: {{datePresets}}
Date format: {{dateFormat}}
Apply on change: {{applyOnChange}}
```

**Date presets:** `today`, `yesterday`, `last-7-days`, `last-30-days`, `this-month`, `last-month`, `custom`

---

### Add Status Filter

```
Add status filter to {{moduleName}} list blade.
Status field: {{statusField}}
Status options: {{statusOptions}}
Default: {{defaultStatus}}
Show count per status: {{showCounts}}
```

---

### Update Search Behavior

```
Update search behavior in {{moduleName}} list blade.
Search in fields: {{searchFields}}
Search type: {{searchType}}
Minimum characters: {{minChars}}
Debounce delay: {{debounceMs}}ms
Case sensitive: {{caseSensitive}}
```

**Search types:** `contains`, `starts-with`, `exact`, `fuzzy`

---

## Row Actions

### Add Row Action Menu

```
Add row action menu to {{moduleName}} list blade.
Menu items:
{{menuItems}}
Menu position: {{menuPosition}}
Icon: {{menuIcon}}
```

**Example menu items:**
```
- Edit (opens details blade)
- Duplicate (creates copy)
- Archive (soft delete)
- Delete (with confirmation)
```

---

### Add Inline Action

```
Add inline action to {{moduleName}} list rows.
Action: {{actionName}}
Icon: {{actionIcon}}
Position: {{actionPosition}}
Condition: {{showCondition}}
Action handler: {{actionHandler}}
```

---

## Blade Configuration

### Change Blade Width

```
Change {{moduleName}} {{bladeType}} blade width.
From: {{oldWidth}}
To: {{newWidth}}
```

**Width values:** `30%`, `40%`, `50%`, `60%`, `70%`, `80%`, `90%`, `100%`, `500px`

---

### Make Blade Non-Closable

```
Make {{moduleName}} {{bladeType}} blade non-closable.
Set closable prop to false
Remove close button from toolbar
```

---

### Add Blade Modified Indicator

```
Add modified indicator to {{moduleName}} details blade.
Use useModificationTracker composable
Show indicator when: {{showCondition}}
Warning on close when modified: {{showWarning}}
```

---

### Add Blade Loading State

```
Add loading state to {{moduleName}} {{bladeType}} blade.
Use v-loading directive
Loading conditions: {{loadingConditions}}
Loading text: "{{loadingText}}"
```

---

## Navigation

### Open Blade on Row Click

```
Open {{targetBlade}} when clicking row in {{moduleName}} list blade.
Pass parameter: {{parameter}}
Blade options: {{bladeOptions}}
Update selected item indicator: {{updateSelected}}
```

---

### Add Breadcrumbs

```
Add breadcrumbs to {{moduleName}} blade.
Breadcrumb items: {{breadcrumbItems}}
Clickable: {{clickableBreadcrumbs}}
Show on: {{showCondition}}
```

---

### Close Blade After Action

```
Close {{moduleName}} details blade after {{action}}.
Delay: {{delayMs}}ms
Show notification: {{notificationMessage}}
Refresh parent blade: {{refreshParent}}
```

---

## Dashboard Cards

### Add Dashboard Card

```
Add dashboard card for {{moduleName}}.
Card component: {{ComponentName}}DashboardCard.vue
Display: {{cardContent}}
Position in dashboard: {{cardPosition}}
Size: {{cardSize}}
Refresh interval: {{refreshInterval}}
```

---

### Update Card Data

```
Update data source for {{moduleName}} dashboard card.
API endpoint: {{apiEndpoint}}
Data transformation: {{dataTransformation}}
Loading state: {{showLoading}}
Error handling: {{errorHandling}}
```

---

## Notifications

### Add Success Notification

```
Show success notification after {{action}} in {{moduleName}}.
Message: "{{notificationMessage}}"
Duration: {{durationMs}}ms
Position: {{position}}
Locale key: {{MODULE_NAME}}.NOTIFICATIONS.{{ACTION_KEY}}_SUCCESS
```

---

### Add Error Notification

```
Show error notification on {{errorCondition}} in {{moduleName}}.
Message: "{{errorMessage}}"
Show retry button: {{showRetry}}
Log to console: {{logToConsole}}
Locale key: {{MODULE_NAME}}.NOTIFICATIONS.{{ACTION_KEY}}_ERROR
```

---

### Add Unsaved Changes Warning

```
Add unsaved changes warning to {{moduleName}} details blade.
Show when: {{showCondition}}
Dialog message: "{{warningMessage}}"
Actions: {{dialogActions}}
Locale key: {{MODULE_NAME}}.ALERTS.UNSAVED_CHANGES
```

---

## Styling

### Change Colors

```
Change colors in {{moduleName}}.
Target: {{target}}
From: {{oldColor}}
To: {{newColor}}
Apply to: {{applyTo}}
```

**Targets:** `primary`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`

---

### Change Icons

```
Change icons in {{moduleName}}.
Location: {{iconLocation}}
From: {{oldIcon}}
To: {{newIcon}}
Icon library: {{iconLibrary}}
```

**Icon libraries:** `material-icons`, `fontawesome`, `custom`

---

### Update Spacing

```
Update spacing in {{moduleName}} {{location}}.
Element: {{elementType}}
Padding: {{padding}}
Margin: {{margin}}
Gap: {{gap}}
```

---

### Add Custom CSS Class

```
Add custom CSS class to {{element}} in {{moduleName}}.
Class name: {{className}}
Style definitions: {{styleDefinitions}}
Location: {{cssFileLocation}}
```

---

## Mobile Responsiveness

### Optimize for Mobile

```
Optimize {{moduleName}} for mobile devices.
Breakpoint: {{breakpoint}}
Changes:
- {{mobileChange1}}
- {{mobileChange2}}
- {{mobileChange3}}
Test on viewport: {{testViewport}}
```

---

### Configure Mobile Column Positions

```
Configure mobile column positions for {{moduleName}} list blade.
Column: {{columnName}}
Mobile position: {{mobilePosition}}
```

**Mobile positions:** `top-left`, `top-right`, `bottom-left`, `bottom-right`, `status`, `image`, `hidden`

---

## Performance

### Add Debounce

```
Add {{debounceMs}}ms debounce to {{action}} in {{moduleName}}.
Function: {{functionName}}
Trigger: {{triggerEvent}}
```

---

### Add Caching

```
Add caching to {{dataSource}} in {{moduleName}}.
Cache duration: {{cacheDuration}}
Cache key: {{cacheKey}}
Invalidate on: {{invalidateConditions}}
Storage: {{storageType}}
```

**Storage types:** `memory`, `localStorage`, `sessionStorage`

---

### Add Lazy Loading

```
Add lazy loading to {{content}} in {{moduleName}}.
Load trigger: {{loadTrigger}}
Batch size: {{batchSize}}
Show loading indicator: {{showLoading}}
```

---

## Tips for Using These Templates

1. **Be Specific**: Replace ALL placeholders with exact values
2. **Check Syntax**: Ensure locale keys use uppercase and dots
3. **Test Changes**: Always test after implementation
4. **Format Code**: Run Prettier after changes
5. **Update Types**: Keep TypeScript interfaces in sync

---

## Need More Help?

- **Adapting existing modules**: See `adapt-existing-module.md`
- **Complete workflows**: See `guides/complete-workflow.md`
- **Advanced scenarios**: See `advanced-scenarios.md`
- **API integration**: See `api-client-generation.md`
