# UI Components Reference

Complete reference for all 45 UI components in VC-Shell framework, organized by category.

## Atoms (20 components)

### VcBadge
**Purpose**: Notification badge for status indicators

**Props**:
- `content`: string | number - Badge content
- `active`: boolean - Active state
- `disabled`: boolean - Disabled state
- `clickable`: boolean - Makes badge clickable
- `size`: 's' | 'm' - Size variant
- `isDot`: boolean - Show as dot
- `variant`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' - Color variant
- `customPosition`: boolean - Custom positioning
- `top`: string - Top position
- `right`: string - Right position

**Events**:
- `click` - Click event

**Slots**:
- `default` - Badge content

**Example**:
```vue
<VcBadge :content="5" variant="danger" />
```

### VcButton
**Purpose**: Action button with icons

**Props**:
- `icon`: string - Icon name
- `iconClass`: string - Icon CSS class
- `iconSize`: string - Icon size
- `variant`: 'primary' | 'secondary' - Button variant
- `disabled`: boolean - Disabled state
- `size`: 'xs' | 'sm' | 'base' - Button size
- `selected`: boolean - Selected state
- `text`: string - Button text

**Events**:
- `click` - Click event

**Slots**:
- `default` - Button content

**Example**:
```vue
<VcButton icon="save" variant="primary" @click="handleSave">Save</VcButton>
```

### VcCard
**Purpose**: Container card with header

**Props**:
- `header`: string - Header text
- `icon`: string - Header icon
- `isCollapsable`: boolean - Can collapse
- `isCollapsed`: boolean - Collapsed state
- `fill`: boolean - Fill container
- `variant`: 'default' | 'success' | 'danger' - Card variant

**Events**:
- `header:click` - Header click
- `state:collapsed` - Collapse state change

**Slots**:
- `default` - Card content
- `actions` - Header actions
- `header` - Custom header

**Example**:
```vue
<VcCard header="Details" icon="info">
  Content here
</VcCard>
```

### VcCol
**Purpose**: Column in grid layout

**Props**:
- `size`: number - Column size (1-12)

**Slots**:
- `default` - Column content

**Example**:
```vue
<VcCol :size="6">Left column</VcCol>
```

### VcContainer
**Purpose**: Scrollable container

**Props**:
- `shadow`: boolean - Show shadow
- `noPadding`: boolean - Remove padding
- `usePtr`: boolean - Pull to refresh

**Events**:
- `scroll:ptr` - Pull to refresh
- `scroll` - Scroll event

**Methods**:
- `scrollTop()` - Scroll to top

**Example**:
```vue
<VcContainer @scroll="handleScroll">
  Content
</VcContainer>
```

### VcHint
**Purpose**: Helper text

**Slots**:
- `default` - Hint text

**Example**:
```vue
<VcHint>This field is required</VcHint>
```

### VcIcon
**Purpose**: Universal icon component

**Props**:
- `icon`: string - Icon name (material-, bi-, lucide-, fas fa-, svg:)
- `size`: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' - Icon size
- `variant`: 'warning' | 'danger' | 'success' - Icon variant
- `customSize`: string - Custom size
- `useContainer`: boolean - Use container

**Example**:
```vue
<VcIcon icon="material-save" size="m" />
```

### VcImage
**Purpose**: Image display

**Props**:
- `src`: string - Image source
- `alt`: string - Alt text
- `size`: string - Image size
- `aspectRatio`: string - Aspect ratio
- `bordered`: boolean - Show border
- `rounded`: boolean - Rounded corners

**Example**:
```vue
<VcImage src="/path/to/image.jpg" alt="Product" />
```

### VcLabel
**Purpose**: Form label

**Props**:
- `text`: string - Label text
- `required`: boolean - Required indicator

**Slots**:
- `default` - Label content

**Example**:
```vue
<VcLabel text="Name" :required="true" />
```

### VcLink
**Purpose**: Navigation link

**Props**:
- `to`: string - Router link
- `href`: string - External link
- `target`: string - Link target

**Slots**:
- `default` - Link text

**Example**:
```vue
<VcLink to="/products">Products</VcLink>
```

### VcLoading
**Purpose**: Loading indicator

**Props**:
- `active`: boolean - Show loading

**Example**:
```vue
<VcLoading :active="loading" />
```

### VcProgress
**Purpose**: Progress bar

**Props**:
- `value`: number - Progress value (0-100)
- `variant`: string - Progress variant

**Example**:
```vue
<VcProgress :value="75" />
```

### VcRow
**Purpose**: Row in grid layout

**Slots**:
- `default` - Row content

**Example**:
```vue
<VcRow>
  <VcCol :size="6">Content</VcCol>
</VcRow>
```

### VcSkeleton
**Purpose**: Loading skeleton

**Props**:
- `variant`: 'text' | 'circle' | 'rect' - Skeleton variant
- `width`: string - Width
- `height`: string - Height
- `count`: number - Number of skeletons

**Example**:
```vue
<VcSkeleton variant="text" :count="3" />
```

### VcStatus
**Purpose**: Status indicator

**Props**:
- `variant`: string - Status variant
- `outline`: boolean - Outline style
- `extend`: boolean - Extended style

**Slots**:
- `default` - Status text

**Example**:
```vue
<VcStatus variant="success">Active</VcStatus>
```

### VcStatusIcon
**Purpose**: Status icon

**Props**:
- `variant`: string - Status variant

**Example**:
```vue
<VcStatusIcon variant="success" />
```

### VcTooltip
**Purpose**: Tooltip for help text

**Props**:
- `text`: string - Tooltip text
- `placement`: string - Tooltip placement
- `width`: string - Tooltip width
- `maxWidth`: string - Max width

**Slots**:
- `default` - Trigger element

**Example**:
```vue
<VcTooltip text="Help text">
  <VcIcon icon="help" />
</VcTooltip>
```

### VcVideo
**Purpose**: Video player

**Props**:
- `src`: string - Video source
- `poster`: string - Poster image
- `controls`: boolean - Show controls
- `autoplay`: boolean - Autoplay
- `loop`: boolean - Loop video
- `muted`: boolean - Muted

**Example**:
```vue
<VcVideo src="/video.mp4" :controls="true" />
```

### VcWidget
**Purpose**: Dashboard widget

**Props**:
- `title`: string - Widget title
- `icon`: string - Widget icon
- `value`: string | number - Widget value
- `loading`: boolean - Loading state

**Events**:
- `click` - Click event

**Example**:
```vue
<VcWidget title="Orders" icon="shopping_cart" :value="42" />
```

### VcBanner
**Purpose**: Banner message

**Props**:
- `variant`: string - Banner variant
- `icon`: string - Banner icon
- `iconSize`: string - Icon size
- `iconVariant`: string - Icon variant

**Slots**:
- `title` - Banner title
- `default` - Banner content
- `trigger` - Trigger element

**Example**:
```vue
<VcBanner variant="info">
  <template #title>Information</template>
  Banner content
</VcBanner>
```

## Molecules (18 components)

### VcBreadcrumbs
**Purpose**: Navigation breadcrumbs

**Props**:
- `items`: Array<{id: string, title: string, icon?: string}> - Breadcrumb items

**Events**:
- `item:click` - Item click event

**Example**:
```vue
<VcBreadcrumbs :items="breadcrumbItems" />
```

### VcCheckbox
**Purpose**: Checkbox input

**Props**:
- `modelValue`: boolean - Checked state
- `label`: string - Checkbox label
- `disabled`: boolean - Disabled state
- `errorMessage`: string - Error message
- `hint`: string - Helper text

**Events**:
- `update:modelValue` - Value change

**Example**:
```vue
<VcCheckbox v-model="checked" label="I agree" />
```

### VcEditor
**Purpose**: Rich text editor (TipTap)

**Props**:
- `modelValue`: string - Editor content
- `placeholder`: string - Placeholder text
- `editable`: boolean - Editable state
- `customToolbar`: boolean - Custom toolbar

**Events**:
- `update:modelValue` - Content change

**Example**:
```vue
<VcEditor v-model="content" placeholder="Enter text" />
```

### VcField
**Purpose**: Form field wrapper

**Props**:
- `label`: string - Field label
- `required`: boolean - Required indicator
- `errorMessage`: string - Error message
- `hint`: string - Helper text
- `tooltip`: string - Tooltip text

**Slots**:
- `default` - Field input

**Example**:
```vue
<VcField label="Name" :required="true">
  <VcInput v-model="name" />
</VcField>
```

### VcForm
**Purpose**: Form container (VeeValidate)

**Events**:
- `submit` - Form submit

**Slots**:
- `default` - Form content

**Example**:
```vue
<VcForm @submit="handleSubmit">
  <!-- form fields -->
</VcForm>
```

### VcInput
**Purpose**: Text input

**Props**:
- `modelValue`: string - Input value
- `label`: string - Input label
- `placeholder`: string - Placeholder text
- `type`: string - Input type
- `disabled`: boolean - Disabled state
- `required`: boolean - Required indicator
- `clearable`: boolean - Show clear button
- `errorMessage`: string - Error message
- `tooltip`: string - Tooltip text
- `maxlength`: number - Max length
- `prefix`: string - Prefix text
- `suffix`: string - Suffix text

**Events**:
- `update:modelValue` - Value change
- `blur` - Blur event
- `focus` - Focus event
- `clear` - Clear event

**Example**:
```vue
<VcInput 
  v-model="name" 
  label="Name" 
  placeholder="Enter name"
  :required="true"
/>
```

### VcInputCurrency
**Purpose**: Currency input

**Props**:
- `modelValue`: number - Currency value
- `label`: string - Field label
- `currency`: string - Currency code
- `locale`: string - Locale
- `disabled`: boolean - Disabled state
- `required`: boolean - Required indicator
- `errorMessage`: string - Error message

**Events**:
- `update:modelValue` - Value change

**Example**:
```vue
<VcInputCurrency v-model="price" label="Price" currency="USD" />
```

### VcInputDropdown
**Purpose**: Input with dropdown

**Props**:
- `modelValue`: string - Input value
- `option`: any - Selected option
- `options`: Array<any> - Options list
- `label`: string - Field label
- `placeholder`: string - Placeholder text
- `disabled`: boolean - Disabled state

**Events**:
- `update:modelValue` - Value change
- `update:option` - Option change

**Example**:
```vue
<VcInputDropdown 
  v-model="search" 
  :options="options"
  placeholder="Search..."
/>
```

### VcMultivalue
**Purpose**: Multi-value input

**Props**:
- `modelValue`: Array<any> - Selected values
- `placeholder`: string - Placeholder text
- `disabled`: boolean - Disabled state
- `dictionary`: Array<any> - Dictionary values

**Events**:
- `update:modelValue` - Values change

**Example**:
```vue
<VcMultivalue v-model="tags" placeholder="Add tags" />
```

### VcPagination
**Purpose**: Pagination controls

**Props**:
- `pages`: number - Total pages
- `currentPage`: number - Current page
- `maxVisiblePages`: number - Max visible pages

**Events**:
- `itemClick` - Page click

**Example**:
```vue
<VcPagination 
  :pages="totalPages" 
  :current-page="currentPage"
  @item-click="handlePageChange"
/>
```

### VcRadioButton
**Purpose**: Radio button

**Props**:
- `modelValue`: any - Selected value
- `value`: any - Radio value
- `label`: string - Radio label
- `name`: string - Radio name
- `disabled`: boolean - Disabled state

**Events**:
- `update:modelValue` - Value change

**Example**:
```vue
<VcRadioButton 
  v-model="selected" 
  value="option1" 
  label="Option 1"
/>
```

### VcRating
**Purpose**: Star rating

**Props**:
- `modelValue`: number - Rating value
- `max`: number - Max rating
- `readonly`: boolean - Readonly state
- `size`: string - Star size

**Events**:
- `update:modelValue` - Rating change

**Example**:
```vue
<VcRating v-model="rating" :max="5" />
```

### VcSelect
**Purpose**: Dropdown select with async search

**Props**:
- `modelValue`: any - Selected value
- `options`: Array<any> - Options list
- `label`: string - Field label
- `placeholder`: string - Placeholder text
- `multiple`: boolean - Multiple selection
- `searchable`: boolean - Searchable
- `clearable`: boolean - Clearable
- `disabled`: boolean - Disabled state
- `loading`: boolean - Loading state
- `errorMessage`: string - Error message
- `optionValue`: string - Option value field
- `optionLabel`: string - Option label field
- `searchMethod`: Function - Search method
- `tooltip`: string - Tooltip text

**Events**:
- `update:modelValue` - Value change
- `search` - Search event
- `open` - Open event
- `close` - Close event

**Example**:
```vue
<VcSelect 
  v-model="category" 
  :options="categories"
  label="Category"
  searchable
/>
```

### VcSlider
**Purpose**: Range slider

**Props**:
- `modelValue`: number - Slider value
- `min`: number - Minimum value
- `max`: number - Maximum value
- `step`: number - Step value
- `disabled`: boolean - Disabled state

**Events**:
- `update:modelValue` - Value change

**Example**:
```vue
<VcSlider v-model="value" :min="0" :max="100" :step="1" />
```

### VcSwitch
**Purpose**: Toggle switch

**Props**:
- `modelValue`: boolean - Switch state
- `label`: string - Switch label
- `disabled`: boolean - Disabled state

**Events**:
- `update:modelValue` - State change

**Example**:
```vue
<VcSwitch v-model="enabled" label="Enable feature" />
```

### VcTextarea
**Purpose**: Multi-line text input

**Props**:
- `modelValue`: string - Textarea value
- `label`: string - Field label
- `placeholder`: string - Placeholder text
- `rows`: number - Number of rows
- `maxlength`: number - Max length
- `disabled`: boolean - Disabled state
- `required`: boolean - Required indicator
- `errorMessage`: string - Error message

**Events**:
- `update:modelValue` - Value change

**Example**:
```vue
<VcTextarea 
  v-model="description" 
  label="Description"
  :rows="5"
/>
```

### VcToast
**Purpose**: Toast notification

**Props**:
- `variant`: string - Toast variant
- `text`: string - Toast text
- `timeout`: number - Auto-close timeout
- `closable`: boolean - Show close button

**Usage via API**:
```typescript
notification.success('Success message');
notification.error('Error message');
```

## Organisms (7 components)

### VcApp
**Purpose**: Application shell

**Props**:
- `disableMenu`: boolean - Disable menu
- `disableAppSwitcher`: boolean - Disable app switcher
- `version`: string - App version
- `avatar`: string - User avatar
- `name`: string - User name
- `role`: string - User role
- `appsList`: Array<any> - Apps list
- `isEmbedded`: boolean - Embedded mode

**Events**:
- `menuItemClick` - Menu item click
- `switchApp` - App switch

**Slots**:
- `navmenu` - Navigation menu
- `userDropdown` - User dropdown
- `appSwitcher` - App switcher
- `toolbar` - Toolbar
- `default` - Main content

### VcBlade
**Purpose**: Blade container

**Props**:
- `title`: string - Blade title
- `toolbarItems`: IBladeToolbar[] - Toolbar items
- `expanded`: boolean - Expansion state (required)
- `closable`: boolean - Can be closed (required)
- `param`: string - Entity ID (required)
- `options`: unknown - Additional data (required)
- `width`: string - Blade width
- `modified`: boolean - Modified indicator

**Events**:
- `parent:call` - Communication with parent
- `close:blade` - Close blade
- `collapse:blade` - Collapse blade
- `expand:blade` - Expand blade

**Slots**:
- `default` - Blade content
- `toolbar` - Custom toolbar
- `actions` - Action buttons

**Example**:
```vue
<VcBlade 
  :expanded="true"
  :closable="true"
  :param="id"
  :options="undefined"
  title="Details"
>
  Content
</VcBlade>
```

### VcDynamicProperty
**Purpose**: Dynamic properties form

**Props**:
- `properties`: Array<any> - Property definitions
- `modelValue`: any - Property values
- `disabled`: boolean - Disabled state

**Events**:
- `update:modelValue` - Values change

**Example**:
```vue
<VcDynamicProperty 
  :properties="properties"
  v-model="values"
/>
```

### VcGallery
**Purpose**: Image gallery

**Props**:
- `images`: Array<string> - Image URLs
- `activeIndex`: number - Active image index

**Events**:
- `update:activeIndex` - Index change
- `close` - Close gallery

**Example**:
```vue
<VcGallery :images="images" v-model:active-index="index" />
```

### VcLoginForm
**Purpose**: Login form

**Props**:
- `logo`: string - Logo URL
- `title`: string - Form title

**Events**:
- `submit` - Form submit

**Example**:
```vue
<VcLoginForm @submit="handleLogin" />
```

### VcPopup
**Purpose**: Modal popup

**Props**:
- `modelValue`: boolean - Show popup
- `title`: string - Popup title
- `variant`: string - Popup variant
- `width`: string - Popup width
- `maxWidth`: string - Max width
- `closable`: boolean - Show close button

**Events**:
- `update:modelValue` - Visibility change
- `close` - Close event

**Slots**:
- `default` - Popup content
- `actions` - Action buttons
- `title` - Custom title

**Example**:
```vue
<VcPopup v-model="showPopup" title="Confirm">
  <template #actions>
    <VcButton @click="confirm">Confirm</VcButton>
  </template>
</VcPopup>
```

### VcTable
**Purpose**: Data table with sorting, pagination, selection

**Props**:
- `items`: Array<any> - Table items
- `columns`: ITableColumn[] - Column definitions
- `loading`: boolean - Loading state
- `selectedItemId`: string - Selected item ID
- `totalCount`: number - Total items count
- `pages`: number - Total pages
- `currentPage`: number - Current page
- `enableItemActions`: boolean - Enable row actions
- `itemActionBuilder`: Function - Action builder
- `multiselect`: boolean - Multiple selection
- `stateKey`: string - State persistence key

**Events**:
- `itemClick` - Item click
- `selectionChanged` - Selection change
- `headerClick` - Header click
- `pageChanged` - Page change
- `reorder` - Column reorder

**Slots**:
- `header` - Custom header
- `filters` - Filter row
- `mobile-item` - Mobile item template
- `item_[field]` - Custom field cell
- `header_[field]` - Custom header cell
- `notfound` - No results template
- `empty` - Empty state template
- `footer` - Table footer

**Column Definition**:
```typescript
interface ITableColumn {
  id: string;
  title: string;
  field: string;
  type?: string;
  sortable?: boolean;
  width?: number | string;
  alwaysVisible?: boolean;
}
```

**Example**:
```vue
<VcTable 
  :items="items"
  :columns="columns"
  :loading="loading"
  @item-click="handleItemClick"
/>
```

## Best Practices

1. Always use proper TypeScript types
2. Handle all events appropriately
3. Use slots for customization
4. Follow component naming (Vc prefix)
5. Use proper validation with VeeValidate
6. Implement loading states
7. Handle errors gracefully
8. Use localization for text
9. Follow accessibility guidelines
10. Test all component interactions

