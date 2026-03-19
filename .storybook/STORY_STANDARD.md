# VC-Shell Story Quality Standard

This document defines the required structure and content for all Storybook story files
in the vc-shell framework. It is the single source of truth for story quality.

## Imports and Typing

All stories MUST use:

```typescript
import type { Meta, StoryObj } from "@storybook/vue3-vite";
// NOT @storybook/vue3 (legacy)
```

The meta object MUST use `satisfies Meta<typeof Component>`:

```typescript
const meta = {
  // ...
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;
```

## Tier System

Stories scale to component complexity. Each component is assigned a tier.

### Tier 1 — Simple (atoms without interactive state)

**Applies to:** VcHint, VcLabel, VcIcon, VcImage, VcLoading, VcProgress, VcSkeleton,
VcVideo, VcCol, VcRow, VcContainer, VcScrollableContainer, VcStatus, VcStatusIcon,
VcCard, VcWidget

**Minimum 3 stories.** Required:

| Requirement | Description |
|-------------|-------------|
| `tags: ["autodocs"]` | Enables automatic docs page |
| JSDoc on meta | 2-3 sentence component description |
| `argTypes` for all props | With `description`, `table.type`, `table.defaultValue` |
| `argTypes` for slots | With `table.category: "Slots"` |
| `parameters.docs.description.component` | With inline code usage example |
| Story: Default | Most common usage |
| Story: Variants/Sizes | If component has visual variants |
| Story: Real-World Context | Component used in a realistic scenario |

### Tier 2 — Standard (atoms/molecules with state and interaction)

**Applies to:** VcButton, VcBadge, VcLink, VcTooltip, VcBanner, VcInput, VcTextarea,
VcSwitch, VcCheckbox, VcRadioButton, VcSelect, VcDatePicker, VcPagination, VcToast,
VcBreadcrumbs, VcDropdown, VcMenu, VcField, VcForm, VcSlider, VcRating, VcAccordion,
VcInputCurrency, VcInputGroup, VcMultivalue, VcColorInput, VcFileUpload, VcEditor,
VcInputDropdown, VcDropdownPanel, VcCheckboxGroup, VcRadioGroup, VcImageTile

**Minimum 6 stories.** Everything from Tier 1, plus:

| Requirement | Description |
|-------------|-------------|
| Event argTypes | With `action()` and `table.category: "Events"` |
| Category grouping | `"Model"`, `"Data"`, `"Appearance"`, `"State"`, `"Layout"`, `"Events"`, `"Slots"` |
| Story: States | disabled, loading, error, required |
| Story: Interactive | Uses `ref`, responds to user actions |
| Story: Accessibility | Demonstrates aria-label, keyboard navigation |
| Story: Form Context | Component used within a form (if applicable) |

### Tier 3 — Complex (organisms)

**Applies to:** VcDataTable, VcBlade, VcPopup, VcSidebar, VcGallery, VcImageUpload,
VcApp, VcDynamicProperty, VcAuthLayout

**Minimum 10 stories.** Everything from Tier 2, plus:

| Requirement | Description |
|-------------|-------------|
| Feature stories | Each major feature as a separate named story |
| Edge cases | Empty state, error state, many items, long content |
| Mobile stories | If component has mobile variant |
| Composition stories | Used with other vc-shell components |

## Template

```typescript
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ComponentName } from "@ui/components/{level}/{component-dir}";

/**
 * `ComponentName` is a {level} for {purpose}.
 *
 * {2-3 sentences describing what it does and when to use it.}
 */
const meta = {
  title: "{Category}/{ComponentName}",
  component: ComponentName,
  tags: ["autodocs"],
  argTypes: {
    // -- Props grouped by category --
    propName: {
      description: "What this prop does",
      control: "appropriate-control",
      table: {
        type: { summary: "TypeSignature" },
        defaultValue: { summary: "defaultValue" },
        category: "Appearance", // Model | Data | Appearance | State | Layout
      },
    },
    // -- Events --
    onEventName: {
      description: "When this event fires",
      action: "eventName",
      table: {
        category: "Events",
        type: { summary: "(payload: Type) => void" },
      },
    },
    // -- Slots --
    default: {
      description: "Slot content description",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "VNode | VNode[]" },
      },
    },
  },
  args: {
    // Sensible defaults for the playground
  },
  parameters: {
    docs: {
      description: {
        component: `
Description of the component.

\`\`\`vue
<ComponentName prop="value">Content</ComponentName>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Stories organized by category --

/** Default state — the most common usage. */
export const Default: Story = {
  render: (args) => ({
    components: { ComponentName },
    setup: () => ({ args }),
    template: '<ComponentName v-bind="args">{{ args.default }}</ComponentName>',
  }),
};

/** All visual variants side by side. */
export const AllVariants: Story = { /* ... */ };

// ... more stories per tier requirements
```

## `.docs.md` Co-Located Documentation

Each component gets a `.docs.md` file next to its source:

```
framework/ui/components/molecules/vc-input/
  vc-input.vue
  vc-input.stories.ts
  vc-input.docs.md          <-- documentation
  index.ts
```

Structure:

```markdown
# ComponentName

Brief description (1-2 sentences).

## When to Use
- Use case 1
- When NOT to use

## Basic Usage
(code example)

## Key Props
(table with most important props only — full list in Storybook autodocs)

## Common Patterns
(2-3 real-world code examples)

## Accessibility
(keyboard, screen reader, ARIA notes)

## Related Components
(links to related components)
```

## Assessment Protocol

Before modifying any existing story file:

1. Read the file completely
2. Score against the tier checklist (count met requirements / total requirements)
3. Decide:
   - **>=80%** -> Preserve. Only add missing items. Never rewrite existing code.
   - **40-79%** -> Augment. Keep all existing stories intact, append new ones, enrich argTypes.
   - **<40% or missing** -> Generate from scratch using the template above.

## Preservation Rules

1. Never delete or rename existing exported stories
2. Never change existing story templates, setup functions, or render logic
3. Never rewrite argTypes that already have descriptions
4. Append only — new stories go at the end of the file
5. `satisfies Meta` annotation and `@storybook/vue3-vite` import may be updated
6. Verify: diff must show only additions, never modifications to existing lines

## Category Reference

Stories use functional categories instead of Atomic Design levels. Use the category that matches the component's primary purpose.

| Category | Components |
|---|---|
| **Form** | VcInput, VcTextarea, VcSelect, VcCheckbox, VcCheckboxGroup, VcRadioButton, VcRadioGroup, VcSwitch, VcDatePicker, VcInputCurrency, VcInputDropdown, VcInputGroup, VcColorInput, VcSlider, VcRating, VcFileUpload, VcEditor, VcMultivalue, VcField, VcForm |
| **Data Display** | VcDataTable, VcBadge, VcStatus, VcStatusIcon, VcLabel, VcHint, VcImage, VcVideo, VcCard, VcWidget, VcDynamicProperty, VcGallery, VcImageUpload |
| **Navigation** | VcBreadcrumbs, VcMenu, VcPagination, VcBlade, VcBladeNavigation |
| **Overlay** | VcPopup, VcTooltip, VcDropdown, VcDropdownPanel, VcToast, VcSidebar |
| **Layout** | VcContainer, VcScrollableContainer, VcRow, VcCol, VcSkeleton, VcProgress, VcIcon, VcLoading, VcApp, VcAuthLayout |
| **Action** | VcButton, VcButtonGroup, VcLink, VcBanner, VcAccordion, VcImageTile |
| **Shared** | App-level components (settings, notifications, auth pages) |

## Automated Testing

All stories are automatically tested via `@storybook/addon-vitest`:

- **HTML Snapshots** — each story is rendered and its DOM output is captured as a file snapshot via `composeStories()` + `toMatchFileSnapshot()`
- **Visual Regression** — each story is screenshotted via Playwright and compared with `jest-image-snapshot`
- **Coverage** — run `yarn test:coverage` to generate coverage reports for unit tests

### Opting Out

To disable snapshot testing for a story or entire component:

```typescript
const meta = {
  parameters: {
    snapshot: { disable: true },  // Skip all snapshot tests for this component
    visual: { disable: true },    // Skip all visual tests for this component
  },
};
```

To skip individual stories: use `parameters: { snapshot: { skip: true } }` on the story.
