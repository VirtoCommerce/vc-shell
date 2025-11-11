# VC-Shell Composition Patterns

## Philosophy

**Think LEGO blocks, not templates.**

Instead of copying full 300-line templates, AI composes blades from small patterns:
- VcBlade (structure)
- VcTable (data display)
- VcForm (data input)
- VcCard (sections)
- Slots (customization)

## How It Works

### Old Approach (Template Copying)
```
AI: Copies list-filters.vue (330 lines) → Renames Entity → Done
Limitation: Only 5 variations possible
```

### New Approach (Composition)
```
AI: Combines patterns based on requirements
- Need list? → VcBlade + VcTable pattern
- Need filters? → Add filters slot pattern
- Need custom column? → Add item slot pattern
- Need multiselect? → Add multiselect pattern

Result: Unlimited combinations!
```

## Available Patterns

1. **list-basic.md** - VcBlade + VcTable (50 lines)
2. **list-with-filters.md** - + filters slot (90 lines)
3. **list-with-multiselect.md** - + multiselect & bulk actions (100 lines)
4. **list-with-custom-slots.md** - Custom column rendering
5. **form-basic.md** - VcBlade + VcForm + fields (70 lines)
6. **form-with-sections.md** - + VcCard sections (100 lines)
7. **form-with-gallery.md** - + VcGallery (90 lines)
8. **toolbar-patterns.md** - IBladeToolbar variations
9. **filter-slot-patterns.md** - VcTable filters slot
10. **custom-empty-states.md** - VcTable empty/notfound

## Real VC-Shell Components

**Layout (Organisms):**
- VcBlade, VcTable, VcGallery, VcPopup

**Form (Molecules):**
- VcForm, VcField, VcInput, VcTextarea, VcSelect
- VcCheckbox, VcRadioButton, VcSwitch

**Display (Atoms):**
- VcCard, VcContainer, VcRow, VcCol
- VcButton, VcBadge, VcStatus, VcStatusIcon
- VcImage, VcIcon, VcHint, VcLabel, VcLoading
- VcBanner, VcSkeleton, VcTooltip

## Composition Rules

1. **Always start with VcBlade** - outer container
2. **Lists:** VcBlade > VcTable
3. **Forms:** VcBlade > VcContainer > VcForm
4. **Sections:** Use VcCard inside VcForm
5. **Layout:** Use VcRow + VcCol for grid
6. **Customization:** Use slots (filters, item_{column}, empty, notfound)

## Example: Build From Patterns

**Prompt:** "Create order list with status filter and image column"

**AI Composes:**

1. Start with **list-basic** pattern (VcBlade + VcTable)
2. Add **filter-slot** pattern (filters slot with VcRadioButton)
3. Add **custom-slot** pattern (item_image with VcImage)
4. Combine logic from patterns
5. Result: Custom blade matching requirements!

Not limited to predefined templates!

## See Also

- Individual pattern files for detailed examples
- component-registry.json for component props/events
- Real vendor-portal blades for complex examples

