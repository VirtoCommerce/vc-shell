# @vc-shell/create-vc-app

CLI tool for creating VC Shell applications and generating blades.

## Table of Contents

- [Creating a New Application](#creating-a-new-application)
- [Blade Generator](#blade-generator)
- [Available Options](#available-options)

## Creating a New Application

Make sure you have executed `yarn` command and your current working directory is the one where you intend to create a project.

### Interactive Mode (Default)

Run following command:
```bash
$ npx create-vc-app
```

This command will execute application scaffolding tool. You will be presented with prompts:

```text
╔══════════════════════════════════════════════════╗
║  create-vc-app v1.x.x                            ║
╚══════════════════════════════════════════════════╝

✔ Project name: … <your-app-name>
✔ Package name: … <your-package-name>
✔ Base path: … /apps/<your-app-name>/

📦 Scaffolding app in ./<your-app-name>...
✅ Created 42 files

🎨 Formatting files with Prettier...
✅ All files formatted

🏗️  Creating module with blade generator...

✔ Module name (e.g., products, orders): … <your-module-name>
✔ Entity name (e.g., Product, Order): … <your-entity-name>
✔ Create both Grid and Details blades? … yes
✔ Which blade should be the workspace blade (main module blade)? › Grid blade
✔ Customize form fields interactively? … no

==================================================
✨ Application created successfully!
==================================================

📊 Summary:
   Location: /path/to/<your-app-name>
   Package: <your-package-name>
   Base path: /apps/<your-app-name>/
   Files created: 42

🚀 Next steps:

  1. cd <your-app-name>
  2. yarn
  3. yarn serve
```

The process is now streamlined - after basic app configuration, the powerful blade generator creates your first module with proper structure, composables, and locales. All files are automatically formatted with Prettier.

## Non-Interactive Mode

For automation, CI/CD, or when you want to skip prompts, you can use command line arguments:

```bash
$ npx create-vc-app my-app --skip-module-gen
```

Then add modules later using the blade generator:

```bash
$ cd my-app
$ npx create-vc-app blade
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name`, `--app-name` | Name of the application | Directory name |
| `--package-name` | Package name | App name (validated) |
| `--base-path` | Base path for the application | `/apps/<app-name>/` |
| `--skip-module-gen` | Skip module generation (create only base app) | `false` |
| `--skip-form-editor` | Skip interactive form builder | `false` |
| `--form-fields` | JSON string with form field definitions | - |
| `--overwrite` | Overwrite existing files without confirmation | `false` |
| `--help`, `-h` | Show help message | - |
| `--version`, `-v` | Show version | - |

### Examples

**Basic usage (interactive):**
```bash
npx create-vc-app my-app
# Will prompt for app config, then launch blade generator for first module
```

**With custom base path:**
```bash
npx create-vc-app my-app --base-path "/custom/path/" --package-name "@my-org/my-app"
```

**Create base app without module:**
```bash
npx create-vc-app my-app --skip-module-gen
# Then add modules later: cd my-app && npx create-vc-app blade
```

**Overwrite existing directory:**
```bash
npx create-vc-app existing-dir --overwrite
```

**Create in current directory:**
```bash
npx create-vc-app . --name my-existing-project --overwrite
```

**Full non-interactive mode with all options:**
```bash
npx create-vc-app my-app \
  --package-name "@my-org/my-app" \
  --base-path "/apps/my-custom-path/" \
  --skip-module-gen \
  --overwrite
```

**With predefined form fields:**
```bash
npx create-vc-app my-app \
  --skip-form-editor \
  --form-fields '[{"name":"title","type":"text","required":true},{"name":"price","type":"currency"}]'
```

## After Creation

Once app is created, follow the instructions to install dependencies and start dev server:
```bash
$ cd <your-app-name>
$ yarn
$ yarn serve
```

Your app will be available at `http://localhost:8080/apps/<your-app-name>/`

## Key Features

### 🎯 Professional Quality

- **Node.js Version Check**: Ensures compatibility (Node 18+)
- **Smart Validation**: Package names, base paths, and all arguments are validated
- **Graceful Error Handling**: Clear error messages and proper cancellation handling
- **Automatic Formatting**: All files formatted with Prettier based on project config

### 📊 Detailed Progress & Summary

Real-time feedback during generation:
- Progress indicators for each step
- File count tracking
- Comprehensive final summary with:
  - Project location
  - Configuration details
  - Next steps with commands

### 🎨 Automatic Code Formatting

- Respects project's `.prettierrc` configuration
- Formats TypeScript, Vue, JSON, and Markdown files
- Ensures consistent code style from the start
- No manual formatting needed

### 🚀 Streamlined Workflow

1. **Basic app scaffolding** (42+ files)
2. **Automatic formatting**
3. **Initial module generation** with blade generator
4. **Clear next steps**

Everything you need to start developing immediately!

## Interactive Generator

The interactive generator provides a powerful menu-driven interface for generating modules, blades, and widgets with best practices.

### Quick Start

Run the following command in your project directory:
```bash
$ npx create-vc-app blade
# or
$ npx create-vc-app generate
```

### Main Menu

You will see a menu with three options:

1. **Module (with blades)** - Create a complete new module
2. **Blade (in existing module)** - Add a blade to an existing module
3. **Widget (for existing blade)** - Create a widget for an existing blade

### Automatic Code Formatting 🎨

All generated files are **automatically formatted** using Prettier with your project's configuration:

✅ **Respects `.prettierrc`** in your project root  
✅ **Smart fallback defaults** if no config found  
✅ **Vue files** formatted with `singleAttributePerLine: true`  
✅ **TypeScript, JSON, and all files** properly formatted  

**Default Configuration:**
```json
{
  "singleAttributePerLine": true,
  "endOfLine": "auto"
}
```

**Example - Before Generator:**
```vue
<VcWidget v-loading:500="loading" :value="count" :title="$t('MODULE.TITLE')" icon="star" @click="handler"></VcWidget>
```

**After Generator (auto-formatted):**
```vue
<VcWidget
  v-loading:500="loading"
  :value="count"
  :title="$t('MODULE.TITLE')"
  icon="star"
  @click="handler"
></VcWidget>
```

**Why `singleAttributePerLine: true`?**
- 📖 Better readability for Vue components
- 🔍 Easier Git diffs - see exactly which prop changed
- ✨ Consistent with VC Shell framework style
- 🤝 Better for code reviews

### Creating a New Module

When you select "Module", you'll be guided through:

```text
✔ Module name (e.g., products, orders): … 
✔ Entity name (e.g., Product, Order): … 
✔ Create both Grid and Details blades? … yes / no
✔ Which blade should be the workspace blade (main module blade)? › Grid / Details / Both / None
✔ Customize form fields interactively? … yes / no
```

**Smart Naming:**
- Automatic pluralization using `pluralize` library
- Just enter singular form (e.g., "Order") → automatically generates "Orders"
- No more "offerss" bugs!
- Consistent naming throughout generated files (kebab-case, camelCase, PascalCase, snake_case)

**Workspace Blade:**
- A workspace blade is the main entry point of a module
- It gets a menu item in the app navigation
- You can choose which blade(s) should be workspace blades

**Auto-Registration:**
- Module is automatically registered in `main.ts`
- Blades are automatically exported in `pages/index.ts`
- No manual imports needed!

### Non-Interactive Mode (Scripting & CI/CD)

For automation or CI/CD pipelines, you can use command-line flags:

```bash
# Add a blade to an existing module
$ npx create-vc-app blade --module orders --type grid --name Order

# Add a details blade with workspace flag
$ npx create-vc-app blade --module products --type details --name Product --workspace

# Generate a widget
$ npx create-vc-app blade --widget
```

**Available Flags:**

| Flag | Description | Example |
|------|-------------|---------|
| `--module` | Existing module name | `--module orders` |
| `--type` | Blade type (grid\|details) | `--type grid` |
| `--name` | Entity name | `--name Product` |
| `--workspace` | Make it a workspace blade | `--workspace` |
| `--composable` | Include composable (default: true) | `--no-composable` |
| `--widget` | Generate widget only | `--widget` |
| `--path` | Project path | `--path ./my-app` |

**Security & Safety:**
- Module names are automatically normalized to kebab-case
- `"My New Module"` → `my-new-module` ✅
- Prevents filesystem issues with spaces and special characters
- Form options are properly escaped (e.g., `"Men's"` → `"Men\'s"`)

### Adding to Existing Module

When you select "Blade (in existing module)":

```text
✔ Select existing module: › products / orders / ...
✔ Entity name (e.g., Product, Order): … 
✔ Blade type: › Grid (List) / Details (Form)
✔ Is this a workspace blade? … yes / no
✔ Include composable? … yes / no
✔ Customize form fields interactively? … yes / no (for Details blade)
```

**Features:**
- Blades are automatically registered in `pages/index.ts`
- Composables are auto-exported from `composables/index.ts`
- Custom form fields update locales automatically

### Creating Widgets

When you select "Widget (for existing blade)":

```text
✔ Select module: › products / orders / ...
✔ Select blade to register widget in: › product-details / order-details / ...
✔ Widget name (e.g., Stats, Chart, Items): … 
✔ Related entity name (e.g., Offer, Review): … 
✔ Widget icon: › List / Sell / Cart / Star / Image / Custom
```

**Generated files:**
- `components/widgets/{widget-name}/{widget-name}-widget.vue`
- `components/widgets/{widget-name}/index.ts`
- Auto-export in `components/widgets/index.ts`
- **Automatic locale updates** - Adds `WIDGETS.{WIDGET_NAME}.TITLE` to `locales/en.json`
- **Automatic blade registration** - Widget is registered in the parent blade

**Features:**
- ✅ **No manual steps required!** Widget is fully integrated
- ✅ Auto-adds import: `import { YourWidget } from "../components/widgets"`
- ✅ Auto-creates `registerWidgets()` function with `registerWidget()` call
- ✅ Auto-adds `unregisterWidget()` in `onBeforeUnmount()`
- ✅ Auto-adds required imports: `useWidgets`, `useBlade`, `onBeforeUnmount`
- ✅ `registerWidget` and `unregisterWidget` come from `useWidgets()` composable
- ✅ No missing-translation warnings
- ✅ Widget ready to use immediately after generation

**What the generator adds to your blade:**

```typescript
// ✅ Widget import
import { YourWidget } from "../components/widgets";

// ✅ Framework imports (only what's needed)
import { useWidgets, useBlade } from "@vc-shell/framework";
import { onBeforeUnmount } from "vue";

// ✅ Setup composables
const blade = useBlade();
const { registerWidget, unregisterWidget } = useWidgets();
//      ^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^ 
//      From useWidgets(), NOT direct imports!

// ✅ Registration
function registerWidgets() {
  registerWidget(
    {
      id: "YourWidget",
      component: YourWidget,
      props: { item },
      updateFunctionName: "updateActiveWidgetCount",
      // isVisible: computed(() => !!props.param), // Uncomment to show widget only when blade has param
    },
    blade?.value.id ?? "",
  );
}

registerWidgets();

// ✅ Cleanup
onBeforeUnmount(() => {
  unregisterWidget("YourWidget", blade?.value.id);
});
```

**Widget Visibility:**
- By default, widgets are **always visible** (recommended for better UX)
- Uncomment `isVisible` if you want the widget to appear only when blade has a `param` (edit mode)

### Interactive Form Builder

For Details blades, you can customize form fields interactively:

```text
📝 Configure form fields:
✔ Field name (e.g., price, description): … 
✔ Field type: › Text Input / Textarea / Number / Date / Select / 
                Checkbox / Radio / Switch / Currency / Editor / 
                Image / Multivalue / Gallery
✔ Options (for Select/Radio): … option1, option2, option3
✔ Field label (optional): …
✔ Is this field required? … yes / no
✔ Add another field? … yes / no
```

**Supported Components:**
- VcInput, VcTextarea (text fields)
- VcSelect, VcRadioButton (selections)
- VcCheckbox, VcSwitch (toggles)
- VcInputCurrency, VcEditor (special inputs)
- VcImage, VcGallery (media)
- VcMultivalue (arrays)

**Generated output:**
- Proper Vc component templates
- vee-validate Field wrappers
- Auto-generated locale keys
- Type-safe v-model bindings
- Default fields replaced with custom ones

### Blade Generator Options

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Blade type: `grid` or `details` | Required (interactive) |
| `--module` | Module name (e.g., products, orders) | Required (interactive) |
| `--composable` | Include composable with useAsync and useApiClient | `true` |
| `--locales` | Include locale keys in module | `true` |
| `--widget` | Include widget component | `false` |
| `--is-workspace` | Mark as workspace blade (main module blade) | `false` |
| `--path` | Target directory | Current directory |

### Generated Features

**Grid Blade** (List view):
- Table with sorting and pagination
- Search functionality
- **Advanced Filters** (staged/applied architecture)
  - Status filters with radio buttons
  - Date range filters
  - Apply/Reset buttons
  - Active filter count indicator
- Empty and not-found states
- Toolbar with add/delete/refresh
- Notifications support

**Grid Composable:**
- Complete pagination: `totalCount`, `pages`, `currentPage`
- Filter state management: `stagedFilters`, `appliedFilters`
- Filter methods: `toggleFilter`, `applyFilters`, `resetFilters`, `resetSearch`
- Generic API client with TODO comments
- Type-safe with full TypeScript interfaces

**Details Blade** (Form view):
- Form with validation (vee-validate)
- VcInput/VcField components (no raw HTML inputs)
- Modification tracking with `useModificationTracker`
- Save/delete toolbar actions
- onBeforeClose guard
- useBeforeUnload hook

**Details Composable:**
- Correct `useModificationTracker` usage (returns `currentValue` as `item`)
- `useLoading` for combined loading states
- Reactive item management
- Generic API client with TODO comments
- Type-safe operations

### Generated Files

When you generate a blade, the following files are created:

```
src/modules/<module-name>/
├── pages/
│   └── <blade-name>.vue              # Blade component
├── composables/
│   ├── use<EntityName>s.ts           # List composable (grid)
│   ├── use<EntityName>Details.ts     # Details composable (details)
│   └── index.ts                      # Composables index
├── components/
│   └── widgets/
│       └── <widget-name>/
│           ├── <widget-name>-widget.vue
│           └── index.ts
├── locales/
│   ├── en.json                       # Locale keys
│   └── index.ts                      # Locales index
└── index.ts                          # Module entry point
```

### Example: Complete Workflow

1. Create a new application:
```bash
$ npx create-vc-app my-ecommerce-app --variant classic --module-name "Products"
$ cd my-ecommerce-app
$ yarn
```

2. Generate a list blade:
```bash
$ npx create-vc-app blade ProductsList --type grid --module products --is-workspace
```

3. Generate a details blade:
```bash
$ npx create-vc-app blade ProductDetails --type details --module products
```

4. Generate a widget:
```bash
$ npx create-vc-app blade ProductVariants --type grid --module products --widget
```

5. Start development server:
```bash
$ yarn serve
```

### Automatic Code Formatting

All generated files are automatically formatted with Prettier to ensure consistent code style.

### Customization

After generating a blade:

1. **Update API Client Methods**: 
   - Look for `TODO:` comments in composables
   - Replace `@ts-expect-error` placeholders with actual types
   - Import your API client (e.g., `ProductsClient` from `@your-app/api`)
   - Update method names to match your API

2. **Customize Columns/Fields**: 
   - Modify table columns in grid blades
   - Add/remove form fields in details blades
   - Use the interactive form builder for quick prototyping

3. **Add Business Logic**: 
   - Implement custom validation rules
   - Add calculations or derived data
   - Integrate with state machines or workflows

4. **Style Components**: 
   - Apply custom styles following framework guidelines
   - Use TailwindCSS classes with `tw-` prefix
   - Leverage framework's color palette and spacing

### Security & Safety Features

The generator includes several safety measures to prevent common issues:

**1. Safe Module Names**
- Input: `"My New Module"` → Output: `my-new-module`
- Automatic kebab-case normalization prevents:
  - Filesystem errors from spaces
  - Invalid import paths
  - Shell/bundler compatibility issues

**2. Escaped Form Options**
- Input: `"Men's Clothing"` → Output: `"Men\'s Clothing"`
- Prevents template injection
- Quotes are properly escaped in Vue templates
- Safe for Select/Radio options

**3. Automatic Locale Management**
- Widget translations automatically added
- No missing-translation warnings
- Creates namespaces when missing
- Format validation

**4. Error Handling**
- Graceful cancellation (Ctrl+C / Esc)
- Clear error messages
- File existence checks
- Rollback on failures

### Troubleshooting

**Q: Getting TypeScript errors after generation?**
A: The generated code uses `@ts-expect-error` for placeholder types. Replace them with your actual API types and imports.

**Q: API client imports are missing?**
A: Update the imports at the top of composables to point to your actual API client location. Look for `TODO:` comments.

**Q: Filter/form fields don't match my needs?**
A: Edit the blade template and composable. The generator provides a starting point - customize as needed.

**Q: Module doesn't appear in the app?**
A: Don't forget to import and register the module in your `main.ts`:
```typescript
import MyModule from "./modules/my-module";
app.use(MyModule);
```

**Q: Naming is wrong (pluralization issues)?**
A: The new generator asks for BOTH singular and plural forms to avoid "offerss" bugs. If you still see issues, check your input.

**Q: Want to regenerate with different options?**
A: Simply run the generator again. It will overwrite existing files, so make sure to commit your changes first!

### Architecture

Generated blades follow VC Shell architecture:

- **Composables**: Business logic with `useAsync`, `useApiClient`, `useModificationTracker`
- **Props & Emits**: Standard blade interface for communication
- **Localization**: i18n keys following framework conventions
- **TypeScript**: Full type safety with interfaces
- **Responsive**: Mobile-ready with responsive utilities

## Notes

### Application Creation
- If you provide a project name as the first argument, it will be used as the app name
- The `--variant` option is required for non-interactive mode
- Use `--overwrite` to automatically overwrite existing files without confirmation
- Package names are automatically validated and converted to valid npm package names

### Blade Generation
- Blade names should be in PascalCase (e.g., ProductDetails, OrdersList)
- Module names should be in lowercase (e.g., products, orders)
- Generated blades follow framework best practices and architecture
- Composables use framework utilities (useAsync, useApiClient, useModificationTracker)
- All generated code is fully typed with TypeScript
