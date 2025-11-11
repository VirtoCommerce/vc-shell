import dedent from "dedent";

export interface AuditChecklistOptions {
  includeTypeScript?: boolean;
  includeLinting?: boolean;
  includeI18n?: boolean;
  includeDependencies?: boolean;
  includeImports?: boolean;
  includeCustomChecks?: string[];
}

/**
 * Generate an audit checklist for after code generation
 */
export function generateAuditChecklist(
  options: AuditChecklistOptions = {}
): string {
  const {
    includeTypeScript = true,
    includeLinting = true,
    includeI18n = true,
    includeDependencies = true,
    includeImports = true,
    includeCustomChecks = [],
  } = options;

  const sections: string[] = [];

  sections.push(dedent`
    ## Post-Generation Audit Checklist

    After generating or adding components, please verify the following:
  `);
  sections.push("");

  if (includeImports) {
    sections.push(dedent`
      ### Imports

      - [ ] All imports are correct and resolved
      - [ ] Named imports vs default imports are used correctly
      - [ ] No circular dependencies exist
      - [ ] All @vc-shell/framework imports are available
    `);
    sections.push("");
  }

  if (includeTypeScript) {
    sections.push(dedent`
      ### TypeScript

      - [ ] Run \`npm run typecheck\` or \`tsc --noEmit\` to check for TypeScript errors
      - [ ] All props have proper type definitions
      - [ ] No \`any\` types used without justification
      - [ ] Event emits have proper type signatures
    `);
    sections.push("");
  }

  if (includeLinting) {
    sections.push(dedent`
      ### Linting

      - [ ] Run \`npm run lint\` to check for linting errors
      - [ ] Fix any ESLint warnings
      - [ ] Code follows Vue 3 Composition API best practices
      - [ ] No console.log statements in production code
    `);
    sections.push("");
  }

  if (includeDependencies) {
    sections.push(dedent`
      ### Dependencies

      - [ ] All required dependencies are installed in package.json
      - [ ] Run \`npm install\` if new dependencies were added
      - [ ] Check for any peer dependency warnings
      - [ ] Verify @vc-shell/framework version is compatible
    `);
    sections.push("");
  }

  if (includeI18n) {
    sections.push(dedent`
      ### Internationalization (i18n)

      - [ ] All user-facing strings use \`$t()\` for translation
      - [ ] No hardcoded strings in templates
      - [ ] All translation keys are defined in locales/en.json
      - [ ] Translation keys follow the naming convention: MODULE.PAGES.BLADE.SECTION.KEY
    `);
    sections.push("");
  }

  sections.push(dedent`
    ### VC-Shell Specific

    - [ ] Blade components use \`defineOptions\` with name, url, and optional menuItem
    - [ ] Composables follow use{Entity}{Type} naming convention
    - [ ] Module index.ts exports pages and composables correctly
    - [ ] Empty and notfound states are configured properly in VcTable
    - [ ] Form validation rules are defined using vee-validate
    - [ ] Modification tracking is implemented in details blades (isModified)
  `);
  sections.push("");

  sections.push(dedent`
    ### Testing & Build

    - [ ] Run \`npm run dev\` to test the application locally
    - [ ] Verify all routes are accessible
    - [ ] Test create/read/update/delete operations
    - [ ] Check browser console for any errors
    - [ ] Run \`npm run build\` to ensure production build works
  `);
  sections.push("");

  if (includeCustomChecks.length > 0) {
    sections.push("### Custom Checks\n");
    for (const check of includeCustomChecks) {
      sections.push(`- [ ] ${check}`);
    }
    sections.push("");
  }

  sections.push(dedent`
    ### Final Steps

    - [ ] Review generated code for any AI hallucinations or incorrect patterns
    - [ ] Test the feature end-to-end with realistic data
    - [ ] Update documentation if needed
    - [ ] Commit changes with a descriptive message
  `);
  sections.push("");

  return sections.join("\n");
}

/**
 * Generate a minimal audit checklist for MCP tool
 */
export function generateMinimalAuditChecklist(): string {
  return dedent`
    ## Component Audit Checklist

    After adding or generating components, check the following common issues:

    - [ ] Ensure imports are correct (named vs default imports)
    - [ ] All dependencies are installed
    - [ ] Check for linting errors or warnings
    - [ ] Check for TypeScript errors
    - [ ] Verify all i18n keys are defined
    - [ ] Test the component in the browser
    - [ ] No console errors in browser console

    **VC-Shell Specific:**

    - [ ] VcTable empty/notfound states are objects (not booleans)
    - [ ] Module index.ts exports pages and composables
    - [ ] Composables use proper naming: use{Entity}List, use{Entity}Details
    - [ ] Forms use vee-validate Field component for validation
  `;
}

/**
 * Generate audit checklist for specific component types
 */
export function generateComponentTypeChecklist(
  componentType: "blade-list" | "blade-details" | "composable" | "module"
): string {
  const sections: string[] = [];

  switch (componentType) {
    case "blade-list":
      sections.push(dedent`
        ## List Blade Checklist

        - [ ] VcBlade with proper width (e.g., 50%)
        - [ ] VcTable with items, columns, loading props
        - [ ] Toolbar with refresh and add buttons
        - [ ] Empty and notfound states configured as objects
        - [ ] Mobile-item slot implemented
        - [ ] Sort and pagination handlers
        - [ ] defineOptions with name, url, isWorkspace, menuItem
        - [ ] useEntityList composable integrated
      `);
      break;

    case "blade-details":
      sections.push(dedent`
        ## Details Blade Checklist

        - [ ] VcBlade with proper width (e.g., 70%)
        - [ ] vee-validate Field + VcInput/VcSelect for each form input
        - [ ] Toolbar with save and delete buttons
        - [ ] Modification tracking (isModified) implemented
        - [ ] Form validation rules defined
        - [ ] defineOptions with name, url
        - [ ] useEntityDetails composable integrated
        - [ ] Deep watcher for tracking changes
      `);
      break;

    case "composable":
      sections.push(dedent`
        ## Composable Checklist

        - [ ] Proper naming: use{Entity}List or use{Entity}Details
        - [ ] Returns all necessary reactive refs
        - [ ] CRUD methods implemented
        - [ ] Error handling in place
        - [ ] Loading states managed
        - [ ] Watcher for auto-reload (list) or modification tracking (details)
        - [ ] TypeScript types defined for all data
      `);
      break;

    case "module":
      sections.push(dedent`
        ## Module Structure Checklist

        - [ ] pages/index.ts exports all blade components
        - [ ] composables directory with use* files
        - [ ] locales/en.json with all translation keys
        - [ ] locales/index.ts exporting locales
        - [ ] index.ts with createAppModule and exports
        - [ ] index.ts exports: pages, composables
        - [ ] No TypeScript errors in the module
        - [ ] Module registered in app if needed
      `);
      break;
  }

  return sections.join("\n");
}

