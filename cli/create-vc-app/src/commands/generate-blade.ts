import prompts from "prompts";
import { default as chalk } from "chalk";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { cwd as processCwd } from "node:process";
import { kebabCase, upperFirst, camelCase, snakeCase } from "lodash-es";
import { createNamingConfig, createReplacementsMap, applyReplacements } from "../utils/naming.js";
import { formatFile } from "../utils/format.js";
import {
  promptFormFields,
  generateFormFieldsTemplate,
  generateFormFieldsLocale,
  generateDefaultFormFields,
  hasGalleryField,
  generateVcGalleryScriptAdditions,
  FormField,
} from "../utils/form-builder.js";
import { registerModuleInMainTs, registerBladesInIndex } from "../utils/register-module.js";
import { CLIError, UserCancelledError } from "../cli/errors.js";

function ensureFileDoesNotExist(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const relativePath = path.relative(processCwd(), filePath) || filePath;
  throw new CLIError(`File already exists: ${relativePath}. Remove it or rename before regenerating.`);
}

interface BladeGeneratorArgs {
  name?: string;
  type?: "grid" | "details";
  module?: string;
  composable?: boolean;
  locales?: boolean;
  widget?: boolean;
  isWorkspace?: boolean;
  path?: string;
  // Form builder args
  formFields?: string; // JSON string with form fields
  skipFormEditor?: boolean; // Skip interactive form builder
  // App creation mode - skip "What would you like to generate?" prompt
  _skipActionPrompt?: boolean;
}

type ActionType = "module" | "blade" | "widget";

interface ModuleConfig {
  moduleName: string;
  entitySingular: string;
  createBothBlades: boolean;
  createGridBlade: boolean;
  createDetailsBlade: boolean;
  gridIsWorkspace: boolean;
  detailsIsWorkspace: boolean;
  includeComposables: boolean;
  includeLocales: boolean;
  customizeForm: boolean;
}

export async function generateBlade(args: BladeGeneratorArgs = {}) {
  console.log(`\n${chalk.bold(chalk.green("@vc-shell/create-vc-app Generator"))}\n`);

  const cwd = args.path || processCwd();

  // Check if we're in a project
  const packageJsonPath = path.join(cwd, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    throw new CLIError("❌ No package.json found. Are you in a project directory?");
  }

  try {
    // Non-interactive mode: use CLI flags
    if (args.module && args.type && args.name) {
      console.log(chalk.cyan("📝 Running in non-interactive mode\n"));

      await generateBladeNonInteractive(cwd, {
        moduleName: kebabCase(args.module), // Normalize to kebab-case
        bladeType: args.type,
        entityName: args.name,
        isWorkspace: args.isWorkspace ?? false,
        includeComposable: args.composable ?? true,
        includeLocales: args.locales ?? true,
        formFields: args.formFields,
        skipFormEditor: args.skipFormEditor,
      });
      return;
    }

    // Widget-only mode
    if (args.widget) {
      await generateWidget(cwd);
      return;
    }

    // Interactive mode - determine action
    let action: ActionType;

    if (args._skipActionPrompt) {
      // Skip action prompt when called from app creation
      action = "module";
    } else {
      // Show action selection prompt
      const actionResponse = await prompts(
        {
          type: "select",
          name: "action",
          message: "What would you like to generate?",
          choices: [
            { title: "Module (with blades)", value: "module" },
            { title: "Blade (in existing module)", value: "blade" },
            { title: "Widget (for existing blade)", value: "widget" },
          ],
        },
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );
      action = actionResponse.action;
    }

    if (action === "module") {
      await generateModule(cwd);
    } else if (action === "blade") {
      await generateBladeInExistingModule(cwd);
    } else if (action === "widget") {
      await generateWidget(cwd);
    }
  } catch (error: any) {
    if (error instanceof UserCancelledError) {
      throw new UserCancelledError();
    }

    if (error instanceof CLIError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    const details = error instanceof Error && error.stack ? `\n${error.stack}` : "";
    throw new CLIError(`\n❌ Generation failed: ${message}${details ? `\n${details}` : ""}`);
  }
}

async function generateBladeNonInteractive(
  cwd: string,
  options: {
    moduleName: string;
    bladeType: "grid" | "details";
    entityName: string;
    isWorkspace: boolean;
    includeComposable: boolean;
    includeLocales: boolean;
    formFields?: string;
    skipFormEditor?: boolean;
  },
) {
  const modulesPath = path.join(cwd, "src", "modules");
  const modulePath = path.join(modulesPath, options.moduleName);

  // Check if module exists; if not, create it
  if (!fs.existsSync(modulePath)) {
    console.log(chalk.cyan(`📦 Module "${options.moduleName}" not found. Creating new module...\n`));

    // Create module config for the new module
    const moduleConfig: ModuleConfig = {
      moduleName: options.moduleName,
      entitySingular: options.moduleName,
      createBothBlades: false,
      createGridBlade: options.bladeType === "grid",
      createDetailsBlade: options.bladeType === "details",
      gridIsWorkspace: options.isWorkspace && options.bladeType === "grid",
      detailsIsWorkspace: options.isWorkspace && options.bladeType === "details",
      includeComposables: options.includeComposable,
      includeLocales: options.includeLocales,
      customizeForm: false,
    };

    // Create module structure with the blade
    await createModuleStructure(cwd, moduleConfig, options.formFields, options.skipFormEditor);

    console.log(chalk.green(`✅ Module "${options.moduleName}" with ${options.bladeType} blade created successfully\n`));

    // Skip blade generation since it's already created by createModuleStructure
    return;
  }

  const naming = createNamingConfig(options.entityName, options.moduleName);
  const replacements = createReplacementsMap(naming);
  const templateRoot = getTemplateRoot();
  const generatedFiles: string[] = [];

  // Parse form fields for details blade
  let formFieldsTemplate = "";
  let formLocale: Record<string, string> = {};
  let parsedFields: FormField[] = [];

  if (options.bladeType === "details" && options.formFields) {
    try {
      parsedFields = JSON.parse(options.formFields);
      if (parsedFields.length > 0) {
        formFieldsTemplate = generateFormFieldsTemplate(parsedFields, naming.moduleNameUpperSnake);
        formLocale = generateFormFieldsLocale(parsedFields);
      }
    } catch (error) {
      console.error(chalk.red("❌ Invalid form-fields JSON"));
      throw error;
    }
  }

  // Generate blade
  const bladeFile = await generateBladeFile(
    templateRoot,
    modulePath,
    options.bladeType,
    replacements,
    options.isWorkspace,
    formFieldsTemplate,
    parsedFields,
  );
  generatedFiles.push(bladeFile);

  // Generate composable
  if (options.includeComposable) {
    const composableFile = await generateComposableFile(
      templateRoot,
      modulePath,
      options.bladeType,
      naming,
      replacements,
    );
    generatedFiles.push(composableFile);

    // Update composables index.ts
    const composablesIndexPath = path.join(modulePath, "composables", "index.ts");
    const composableName =
      options.bladeType === "grid"
        ? `use${naming.entitySingularPascal}List`
        : `use${naming.entitySingularPascal}Details`;
    const exportLine = `export * from "./${composableName}";\n`;

    if (fs.existsSync(composablesIndexPath)) {
      const existingContent = fs.readFileSync(composablesIndexPath, "utf-8");
      if (!existingContent.includes(exportLine)) {
        fs.appendFileSync(composablesIndexPath, exportLine);
      }
    } else {
      fs.writeFileSync(composablesIndexPath, exportLine);
    }
  }

  // Register blade in pages/index.ts
  const bladeExportName =
    options.bladeType === "grid" ? `${naming.entitySingularPascal}List` : `${naming.entitySingularPascal}Details`;
  const bladeFileName =
    options.bladeType === "grid"
      ? replacements["{{entity-name-plural}}"]
      : `${replacements["{{entity-name}}"]}-details`;

  await registerBladesInIndex(modulePath, [{ exportName: bladeExportName, fileName: bladeFileName }]);

  // Update locales with form fields
  if (options.includeLocales && Object.keys(formLocale).length > 0) {
    const localesPath = path.join(modulePath, "locales", "en.json");
    if (fs.existsSync(localesPath)) {
      const localesContent = JSON.parse(fs.readFileSync(localesPath, "utf-8"));

      if (!localesContent.PAGES) {
        localesContent.PAGES = {};
      }
      if (!localesContent.PAGES.DETAILS) {
        localesContent.PAGES.DETAILS = {};
      }
      if (!localesContent.PAGES.DETAILS.FORM) {
        localesContent.PAGES.DETAILS.FORM = {};
      }
      if (!localesContent.PAGES.DETAILS.FORM.INFO) {
        localesContent.PAGES.DETAILS.FORM.INFO = {};
      }

      // Add form field locales
      Object.assign(localesContent.PAGES.DETAILS.FORM.INFO, formLocale);

      fs.writeFileSync(localesPath, JSON.stringify(localesContent, null, 2), "utf-8");
      generatedFiles.push(localesPath);
    }
  }

  // Format all generated files
  console.log(chalk.cyan("\n✨ Formatting files with Prettier...\n"));
  for (const file of generatedFiles) {
    await formatFile(file);
  }

  console.log(chalk.green("\n✅ Blade generated successfully!\n"));
}

async function generateModule(cwd: string, config?: ModuleConfig, formFieldsJson?: string, skipFormEditor?: boolean) {
  console.log(chalk.cyan("\n📦 Creating new module\n"));

  // If config is provided (app creation mode), use it
  let finalConfig: ModuleConfig;

  if (config) {
    finalConfig = config;
  } else {
    // Interactive mode: prompt for config
    const moduleAnswers = await prompts(
      [
        {
          type: "text",
          name: "moduleName",
          message: "Module name (e.g., products, orders):",
          validate: (value) => (value.length > 0 ? true : "Module name is required"),
          format: (value) => kebabCase(value), // Normalize to kebab-case
        },
        {
          type: "text",
          name: "entitySingular",
          message: "Entity name (e.g., Product, Order):",
          validate: (value) => (value.length > 0 ? true : "Entity name is required"),
        },
        {
          type: "confirm",
          name: "createBothBlades",
          message: "Create both Grid and Details blades?",
          initial: true,
        },
      ],
      {
        onCancel: () => {
          throw new UserCancelledError();
        },
      },
    );

    let interactiveConfig: ModuleConfig = {
      ...moduleAnswers,
      createGridBlade: false,
      createDetailsBlade: false,
      gridIsWorkspace: false,
      detailsIsWorkspace: false,
      includeComposables: true,
      includeLocales: true,
      customizeForm: false,
    };

    if (interactiveConfig.createBothBlades) {
      const workspaceAnswer = await prompts(
        {
          type: "select",
          name: "workspace",
          message: "Which blade should be the workspace blade (main module blade)?",
          choices: [
            { title: "Grid blade", value: "grid" },
            { title: "Details blade", value: "details" },
            { title: "None", value: "none" },
          ],
        },
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );

      interactiveConfig.createGridBlade = true;
      interactiveConfig.createDetailsBlade = true;
      interactiveConfig.gridIsWorkspace = workspaceAnswer.workspace === "grid";
      interactiveConfig.detailsIsWorkspace = workspaceAnswer.workspace === "details";
    } else {
      const bladeTypeAnswer = await prompts(
        [
          {
            type: "select",
            name: "bladeType",
            message: "Which blade type?",
            choices: [
              { title: "Grid (List with table, search, pagination)", value: "grid" },
              { title: "Details (Form with validation and toolbar)", value: "details" },
            ],
          },
          {
            type: "confirm",
            name: "isWorkspace",
            message: "Make this a workspace blade (main module blade)?",
            initial: true,
          },
        ],
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );

      interactiveConfig.createGridBlade = bladeTypeAnswer.bladeType === "grid";
      interactiveConfig.createDetailsBlade = bladeTypeAnswer.bladeType === "details";
      interactiveConfig.gridIsWorkspace = interactiveConfig.createGridBlade && bladeTypeAnswer.isWorkspace;
      interactiveConfig.detailsIsWorkspace = interactiveConfig.createDetailsBlade && bladeTypeAnswer.isWorkspace;
    }

    if (interactiveConfig.createDetailsBlade) {
      const customizeFormAnswer = await prompts(
        {
          type: "confirm",
          name: "customizeForm",
          message: "Customize form fields interactively?",
          initial: false,
        },
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );
      interactiveConfig.customizeForm = customizeFormAnswer.customizeForm;
    }

    finalConfig = interactiveConfig;
  }

  await createModuleStructure(cwd, finalConfig, formFieldsJson, skipFormEditor);
}

async function createModuleStructure(
  cwd: string,
  config: ModuleConfig,
  formFieldsJson?: string,
  skipFormEditor?: boolean,
) {
  try {
    const naming = createNamingConfig(config.entitySingular, config.moduleName);
    const replacements = createReplacementsMap(naming);

    const modulePath = path.join(cwd, "src", "modules", config.moduleName);

    if (fs.existsSync(modulePath) && !isDirectoryEmpty(modulePath)) {
      throw new CLIError(
        `Module "${config.moduleName}" already exists and is not empty. Use the blade generator to extend it instead of recreating.`,
      );
    }

    // Create module directories
    console.log(chalk.cyan("\n📁 Creating module structure...\n"));

    const directories = [
      modulePath,
      path.join(modulePath, "pages"),
      path.join(modulePath, "composables"),
      path.join(modulePath, "locales"),
      path.join(modulePath, "components"),
      path.join(modulePath, "components", "widgets"),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(chalk.green(`✓ Created directory: ${path.relative(cwd, dir)}`));
        } catch (error: any) {
          throw new Error(`Failed to create directory ${dir}: ${error.message}`);
        }
      }
    }

    const templateRoot = getTemplateRoot();
    const generatedFiles: string[] = [];

    // Variables for form customization
    let formFieldsTemplate = "";
    let formLocale: Record<string, string> = {};

    // Generate blades
    if (config.createGridBlade) {
      const gridFile = await generateBladeFile(templateRoot, modulePath, "grid", replacements, config.gridIsWorkspace);
      generatedFiles.push(gridFile);
    }

    let parsedFormFields: FormField[] = [];

    if (config.createDetailsBlade) {
      // Handle form fields from JSON (non-interactive/app creation mode) or interactive mode
      if (formFieldsJson) {
        // Non-interactive mode: parse JSON
        try {
          parsedFormFields = JSON.parse(formFieldsJson);
          if (parsedFormFields.length > 0) {
            formFieldsTemplate = generateFormFieldsTemplate(parsedFormFields, naming.moduleNameUpperSnake);
            formLocale = generateFormFieldsLocale(parsedFormFields);
          }
        } catch (error) {
          console.error(chalk.red("❌ Invalid form-fields JSON"));
          throw error;
        }
      } else if (config.customizeForm && !skipFormEditor) {
        // Interactive mode: prompt for fields
        parsedFormFields = await promptFormFields();
        if (parsedFormFields.length > 0) {
          formFieldsTemplate = generateFormFieldsTemplate(parsedFormFields, naming.moduleNameUpperSnake);
          formLocale = generateFormFieldsLocale(parsedFormFields);
        }
      }

      const detailsFile = await generateBladeFile(
        templateRoot,
        modulePath,
        "details",
        replacements,
        config.detailsIsWorkspace,
        formFieldsTemplate,
        parsedFormFields,
      );
      generatedFiles.push(detailsFile);
    }

    // Generate composables
    if (config.includeComposables) {
      if (config.createGridBlade) {
        const gridComposable = await generateComposableFile(templateRoot, modulePath, "grid", naming, replacements);
        generatedFiles.push(gridComposable);
      }

      if (config.createDetailsBlade) {
        const detailsComposable = await generateComposableFile(
          templateRoot,
          modulePath,
          "details",
          naming,
          replacements,
        );
        generatedFiles.push(detailsComposable);
      }

      // Create composables index.ts
      const composablesIndex = await generateComposablesIndex(modulePath, config, naming);
      generatedFiles.push(composablesIndex);
    }

    // Generate locales
    if (config.includeLocales) {
      const localesFile = await generateLocalesFile(modulePath, naming, replacements, formLocale);
      generatedFiles.push(localesFile);

      // Create locales index.ts
      const localesIndexPath = path.join(modulePath, "locales", "index.ts");
      fs.writeFileSync(localesIndexPath, `import en from "./en.json";\nexport { en };\n`);
      generatedFiles.push(localesIndexPath);
    }

    // Create module index.ts
    const moduleIndexPath = path.join(modulePath, "index.ts");
    const moduleIndexContent = `import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export * from "./composables";
`;
    fs.writeFileSync(moduleIndexPath, moduleIndexContent);
    generatedFiles.push(moduleIndexPath);

    // Register blades in pages/index.ts
    const bladesToRegister: Array<{ exportName: string; fileName: string }> = [];

    if (config.createGridBlade) {
      bladesToRegister.push({
        exportName: `${naming.entitySingularPascal}List`,
        fileName: naming.entityPluralKebab,
      });
    }

    if (config.createDetailsBlade) {
      bladesToRegister.push({
        exportName: `${naming.entitySingularPascal}Details`,
        fileName: `${naming.entitySingularKebab}-details`,
      });
    }

    if (bladesToRegister.length > 0) {
      await registerBladesInIndex(modulePath, bladesToRegister);
    }

    // Format all generated files
    console.log(chalk.cyan("\n✨ Formatting files with Prettier...\n"));
    for (const file of generatedFiles) {
      await formatFile(file);
    }

    console.log(chalk.green("\n✅ Module generated successfully!"));

    // Auto-register module in main.ts
    console.log(chalk.cyan("\n📦 Registering module in main.ts...\n"));
    const registered = await registerModuleInMainTs(cwd, config.moduleName, naming.moduleNamePascal);

    console.log(chalk.cyan("\n📝 Next steps:"));
    if (!registered) {
      console.log(chalk.cyan(`  1. Import the module in your main.ts:`));
      console.log(chalk.gray(`     import ${naming.moduleNamePascal}Module from "./modules/${config.moduleName}";`));
      console.log(chalk.gray(`     app.use(${naming.moduleNamePascal}Module, { router });`));
      console.log(chalk.cyan(`  2. Update API client imports in the generated composables`));
      console.log(chalk.cyan(`  3. Customize the table columns and form fields as needed\n`));
    } else {
      console.log(chalk.cyan(`  1. Update API client imports in the generated composables`));
      console.log(chalk.cyan(`  2. Customize the table columns and form fields as needed\n`));
    }
  } catch (error: any) {
    console.error(chalk.red("\n❌ Module generation failed:"), error.message);
    throw error; // Re-throw to be caught by main handler
  }
}

async function generateBladeInExistingModule(cwd: string) {
  try {
    console.log(chalk.cyan("\n📄 Adding blade to existing module\n"));

    const modulesPath = path.join(cwd, "src", "modules");
    if (!fs.existsSync(modulesPath)) {
      console.error(chalk.red("❌ No modules directory found at src/modules"));
      throw new Error("Modules directory not found");
    }

    const existingModules = fs
      .readdirSync(modulesPath)
      .filter((file) => fs.statSync(path.join(modulesPath, file)).isDirectory());

    if (existingModules.length === 0) {
      console.error(chalk.red("❌ No existing modules found"));
      throw new Error("No existing modules found");
    }

    const answers = await prompts(
      [
        {
          type: "autocomplete",
          name: "moduleName",
          message: "Select existing module:",
          choices: existingModules.map((mod) => ({ title: mod, value: mod })),
        },
        {
          type: "text",
          name: "entitySingular",
          message: "Entity name (e.g., Product, Order):",
          validate: (value) => (value.length > 0 ? true : "Entity name is required"),
        },
        {
          type: "select",
          name: "bladeType",
          message: "Blade type:",
          choices: [
            { title: "Grid (List with table, search, pagination)", value: "grid" },
            { title: "Details (Form with validation and toolbar)", value: "details" },
          ],
        },
        {
          type: "confirm",
          name: "isWorkspace",
          message: "Is this a workspace blade?",
          initial: false,
        },
        {
          type: "confirm",
          name: "includeComposable",
          message: "Include composable?",
          initial: true,
        },
      ],
      {
        onCancel: () => {
          throw new UserCancelledError();
        },
      },
    );

    // Ask about form customization if it's a details blade
    let customizeForm = false;
    if (answers.bladeType === "details") {
      const formAnswer = await prompts(
        {
          type: "confirm",
          name: "customizeForm",
          message: "Customize form fields interactively?",
          initial: false,
        },
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );
      customizeForm = formAnswer.customizeForm;
    }

    const naming = createNamingConfig(answers.entitySingular, answers.moduleName);
    const replacements = createReplacementsMap(naming);
    const modulePath = path.join(modulesPath, answers.moduleName);
    const templateRoot = getTemplateRoot();
    const generatedFiles: string[] = [];

    // Handle form customization
    let formFieldsTemplate = "";
    let formLocale: Record<string, string> = {};
    let parsedFields: FormField[] = [];

    if (customizeForm && answers.bladeType === "details") {
      parsedFields = await promptFormFields();
      if (parsedFields.length > 0) {
        formFieldsTemplate = generateFormFieldsTemplate(parsedFields, naming.moduleNameUpperSnake);
        formLocale = generateFormFieldsLocale(parsedFields);
      }
    }

    // Generate blade
    const bladeFile = await generateBladeFile(
      templateRoot,
      modulePath,
      answers.bladeType,
      replacements,
      answers.isWorkspace,
      formFieldsTemplate,
      parsedFields,
    );
    generatedFiles.push(bladeFile);

    // Generate composable
    if (answers.includeComposable) {
      const composableFile = await generateComposableFile(
        templateRoot,
        modulePath,
        answers.bladeType,
        naming,
        replacements,
      );
      generatedFiles.push(composableFile);

      // Update composables index.ts
      const composablesIndexPath = path.join(modulePath, "composables", "index.ts");
      const composableName =
        answers.bladeType === "grid"
          ? `use${naming.entitySingularPascal}List`
          : `use${naming.entitySingularPascal}Details`;
      const exportLine = `export * from "./${composableName}";\n`;

      if (fs.existsSync(composablesIndexPath)) {
        const existingContent = fs.readFileSync(composablesIndexPath, "utf-8");
        if (!existingContent.includes(exportLine)) {
          fs.appendFileSync(composablesIndexPath, exportLine);
        }
      } else {
        fs.writeFileSync(composablesIndexPath, exportLine);
      }
    }

    // Update locales if custom form fields were added
    if (Object.keys(formLocale).length > 0) {
      const localesPath = path.join(modulePath, "locales", "en.json");
      if (fs.existsSync(localesPath)) {
        const existingLocales = JSON.parse(fs.readFileSync(localesPath, "utf-8"));
        const moduleKey = Object.keys(existingLocales)[0];

        if (moduleKey && existingLocales[moduleKey]?.PAGES?.DETAILS?.FORM?.INFO) {
          existingLocales[moduleKey].PAGES.DETAILS.FORM.INFO = {
            ...existingLocales[moduleKey].PAGES.DETAILS.FORM.INFO,
            ...formLocale,
          };
          fs.writeFileSync(localesPath, JSON.stringify(existingLocales, null, 2));
          console.log(chalk.green(`✓ Updated locales with custom fields`));
        }
      }
    }

    // Register blade in pages/index.ts
    const bladeExportName =
      answers.bladeType === "grid" ? `${naming.entitySingularPascal}List` : `${naming.entitySingularPascal}Details`;
    const bladeFileName =
      answers.bladeType === "grid"
        ? replacements["{{entity-name-plural}}"]
        : `${replacements["{{entity-name}}"]}-details`;

    await registerBladesInIndex(modulePath, [{ exportName: bladeExportName, fileName: bladeFileName }]);

    // Format all generated files
    console.log(chalk.cyan("\n✨ Formatting files with Prettier...\n"));
    for (const file of generatedFiles) {
      await formatFile(file);
    }

    console.log(chalk.green("\n✅ Blade generated successfully!\n"));
  } catch (error: any) {
    console.error(chalk.red("\n❌ Blade generation failed:"), error.message);
    throw error; // Re-throw to be caught by main handler
  }
}

async function generateWidget(cwd: string) {
  try {
    console.log(chalk.cyan("\n🧩 Creating widget\n"));

    const modulesPath = path.join(cwd, "src", "modules");
    if (!fs.existsSync(modulesPath)) {
      console.error(chalk.red("❌ No modules directory found"));
      throw new Error("Modules directory not found");
    }

    const existingModules = fs
      .readdirSync(modulesPath)
      .filter((file) => fs.statSync(path.join(modulesPath, file)).isDirectory());

    if (existingModules.length === 0) {
      console.error(chalk.red("❌ No existing modules found"));
      throw new Error("No existing modules found");
    }

    const moduleAnswer = await prompts(
      {
        type: "autocomplete",
        name: "moduleName",
        message: "Select module:",
        choices: existingModules.map((mod) => ({ title: mod, value: mod })),
      },
      {
        onCancel: () => {
          throw new UserCancelledError();
        },
      },
    );

    const modulePath = path.join(modulesPath, moduleAnswer.moduleName);
    const pagesPath = path.join(modulePath, "pages");

    if (!fs.existsSync(pagesPath)) {
      console.error(chalk.red("❌ No pages directory found in this module"));
      throw new Error("Pages directory not found");
    }

    const existingBlades = fs.readdirSync(pagesPath).filter((file) => file.endsWith(".vue"));

    if (existingBlades.length === 0) {
      console.error(chalk.red("❌ No blades found in this module"));
      throw new Error("No blades found in module");
    }

    const widgetAnswers = await prompts(
      [
        {
          type: "autocomplete",
          name: "bladeName",
          message: "Select blade to register widget in:",
          choices: existingBlades.map((blade) => ({ title: blade, value: blade.replace(".vue", "") })),
        },
        {
          type: "text",
          name: "widgetName",
          message: "Widget name (e.g., Stats, Chart, Items):",
          validate: (value) => (value.length > 0 ? true : "Widget name is required"),
        },
        {
          type: "text",
          name: "entityName",
          message: "Related entity name (e.g., Offer, Item, Review):",
          validate: (value) => (value.length > 0 ? true : "Entity name is required"),
        },
        {
          type: "select",
          name: "icon",
          message: "Widget icon:",
          choices: [
            { title: "List (material-list)", value: "material-list" },
            { title: "Sell/Price (material-sell)", value: "material-sell" },
            { title: "Shopping Cart (material-shopping_cart)", value: "material-shopping_cart" },
            { title: "Star/Rating (material-star)", value: "material-star" },
            { title: "Image (material-image)", value: "material-image" },
            { title: "Description (material-description)", value: "material-description" },
            { title: "Custom (enter manually)", value: "custom" },
          ],
        },
      ],
      {
        onCancel: () => {
          throw new UserCancelledError();
        },
      },
    );

    let icon = widgetAnswers.icon;
    if (icon === "custom") {
      const customIconAnswer = await prompts(
        {
          type: "text",
          name: "customIcon",
          message: "Enter custom icon name (e.g., material-dashboard):",
          validate: (value) => (value.length > 0 ? true : "Icon is required"),
        },
        {
          onCancel: () => {
            throw new UserCancelledError();
          },
        },
      );
      icon = customIconAnswer.customIcon;
    }

    await createWidgetFile(modulePath, widgetAnswers, icon, moduleAnswer.moduleName);
  } catch (error: any) {
    console.error(chalk.red("\n❌ Widget generation failed:"), error.message);
    throw error; // Re-throw to be caught by main handler
  }
}

/**
 * Creates widget file and registers it in the parent blade
 */
async function createWidgetFile(
  modulePath: string,
  widgetAnswers: { bladeName: string; widgetName: string; entityName: string },
  icon: string,
  moduleName: string,
) {
  try {
    const naming = createNamingConfig(widgetAnswers.entityName, moduleName);
    const templateRoot = getTemplateRoot();
    const widgetTemplatePath = path.join(templateRoot, "widgets", "widget.vue");

    if (!fs.existsSync(widgetTemplatePath)) {
      throw new Error(`Widget template not found at ${widgetTemplatePath}`);
    }

    // Determine parent entity from blade name
    const parentEntityMatch = widgetAnswers.bladeName.match(/^(.+?)(-list|-details)?$/);
    const parentEntity = parentEntityMatch ? parentEntityMatch[1] : widgetAnswers.bladeName;

    // Widget file paths
    const widgetsDir = path.join(modulePath, "components", "widgets");
    const widgetDir = path.join(widgetsDir, kebabCase(widgetAnswers.widgetName));
    const widgetFilePath = path.join(widgetDir, `${kebabCase(widgetAnswers.widgetName)}-widget.vue`);
    const widgetIndexPath = path.join(widgetDir, "index.ts");

    // Create widget directory
    if (!fs.existsSync(widgetDir)) {
      try {
        fs.mkdirSync(widgetDir, { recursive: true });
      } catch (error: any) {
        throw new Error(`Failed to create widget directory: ${error.message}`);
      }
    }

    // Read and process widget template
    let widgetContent = fs.readFileSync(widgetTemplatePath, "utf-8");

    const widgetReplacements: Record<string, string> = {
      "{{MODULE_NAME_UPPERCASE}}": snakeCase(moduleName).toUpperCase(),
      "{{WIDGET_NAME_UPPERCASE}}": snakeCase(widgetAnswers.widgetName).toUpperCase(),
      "{{WIDGET_ICON}}": icon,
      "{{EntityName}}": naming.entitySingularPascal,
      "{{entityName}}": naming.entitySingularCamel,
      "{{ParentEntity}}": upperFirst(camelCase(parentEntity)),
      "{{parentEntityCamel}}": camelCase(parentEntity),
      "{{BladeName}}": `${naming.entitySingularPascal}List`,
    };

    widgetContent = applyReplacements(widgetContent, widgetReplacements);

    fs.writeFileSync(widgetFilePath, widgetContent);
    console.log(chalk.green(`✓ Created widget: ${path.relative(process.cwd(), widgetFilePath)}`));

    // Create widget index.ts
    const widgetComponentName = `${upperFirst(camelCase(widgetAnswers.widgetName))}Widget`;
    const widgetIndexContent = `export { default as ${widgetComponentName} } from "./${kebabCase(widgetAnswers.widgetName)}-widget.vue";\n`;
    fs.writeFileSync(widgetIndexPath, widgetIndexContent);

    // Update widgets index.ts
    const widgetsIndexPath = path.join(widgetsDir, "index.ts");
    const widgetExport = `export * from "./${kebabCase(widgetAnswers.widgetName)}";\n`;

    if (fs.existsSync(widgetsIndexPath)) {
      const existingContent = fs.readFileSync(widgetsIndexPath, "utf-8");
      if (!existingContent.includes(widgetExport)) {
        fs.appendFileSync(widgetsIndexPath, widgetExport);
      }
    } else {
      fs.writeFileSync(widgetsIndexPath, widgetExport);
    }

    // Update module locales with widget translations
    const localesPath = path.join(modulePath, "locales", "en.json");
    if (fs.existsSync(localesPath)) {
      try {
        const localesContent = JSON.parse(fs.readFileSync(localesPath, "utf-8"));
        const moduleKey = Object.keys(localesContent)[0];

        if (moduleKey) {
          // Ensure WIDGETS namespace exists
          if (!localesContent[moduleKey].WIDGETS) {
            localesContent[moduleKey].WIDGETS = {};
          }

          // Add widget translations if not already present
          const widgetKey = snakeCase(widgetAnswers.widgetName).toUpperCase();
          if (!localesContent[moduleKey].WIDGETS[widgetKey]) {
            localesContent[moduleKey].WIDGETS[widgetKey] = {
              TITLE: upperFirst(widgetAnswers.widgetName),
            };
          }

          fs.writeFileSync(localesPath, JSON.stringify(localesContent, null, 2));
          await formatFile(localesPath);
          console.log(chalk.green(`✓ Updated locales with widget translations`));
        }
      } catch (error: any) {
        console.warn(chalk.yellow(`⚠️  Could not update locales: ${error.message}`));
      }
    }

    // Register widget in parent blade
    const bladeFilePath = path.join(modulePath, "pages", `${widgetAnswers.bladeName}.vue`);
    if (fs.existsSync(bladeFilePath)) {
      try {
        await registerWidgetInBlade(bladeFilePath, widgetComponentName, naming.entitySingularCamel);
        console.log(chalk.green(`✓ Registered widget in ${widgetAnswers.bladeName}.vue`));
      } catch (error: any) {
        console.warn(chalk.yellow(`⚠️  Could not auto-register widget in blade: ${error.message}`));
        console.warn(chalk.yellow(`   Please add the widget registration manually.`));
      }
    }

    // Format generated files
    await formatFile(widgetFilePath);
    await formatFile(widgetIndexPath);
    if (fs.existsSync(bladeFilePath)) {
      await formatFile(bladeFilePath);
    }

    console.log(chalk.green("\n✅ Widget generated successfully!"));
    console.log(chalk.cyan("\n📝 Widget is automatically registered in the blade!"));
    console.log(chalk.cyan("   See TODO comments in widget file for API integration.\n"));
  } catch (error: any) {
    console.error(chalk.red("\n❌ Widget file creation failed:"), error.message);
    throw error;
  }
}

/**
 * Registers a widget in a blade file by adding import, registerWidget call, and unregisterWidget
 */
async function registerWidgetInBlade(
  bladeFilePath: string,
  widgetComponentName: string,
  itemName: string,
): Promise<void> {
  let content = fs.readFileSync(bladeFilePath, "utf-8");

  // 1. Add widget import statement if not present
  const widgetImportRegex = new RegExp(
    `import\\s*\\{[^}]*\\b${widgetComponentName}\\b[^}]*\\}\\s*from\\s*["']\\.\\.\/components\/widgets["']`,
  );

  if (!widgetImportRegex.test(content)) {
    // Check if there's already an import from "../components/widgets"
    const existingWidgetImport = content.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\.\/components\/widgets["']/);

    if (existingWidgetImport) {
      // Add to existing import
      const imports = existingWidgetImport[1];
      const importsList = imports
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      if (!importsList.includes(widgetComponentName)) {
        importsList.push(widgetComponentName);
        const newImports = importsList.join(", ");
        content = content.replace(existingWidgetImport[0], `import { ${newImports} } from "../components/widgets"`);
      }
    } else {
      // Add new import statement after other imports
      const scriptSetupMatch = content.match(/<script\s+(?:setup\s+lang="ts"|lang="ts"\s+setup|setup)>/);

      if (scriptSetupMatch) {
        const scriptSetupIndex = content.indexOf(scriptSetupMatch[0]) + scriptSetupMatch[0].length;

        // Find all import statements (including multiline)
        const importMatches = [...content.slice(scriptSetupIndex).matchAll(/import\s+[\s\S]+?;/g)];

        if (importMatches.length > 0) {
          // Insert after the last import statement
          const lastImport = importMatches[importMatches.length - 1];
          const lastImportEnd = scriptSetupIndex + lastImport.index + lastImport[0].length;
          content =
            content.slice(0, lastImportEnd) +
            `\nimport { ${widgetComponentName} } from "../components/widgets";` +
            content.slice(lastImportEnd);
        } else {
          // No imports yet, add after <script setup>
          content =
            content.slice(0, scriptSetupIndex) +
            `\nimport { ${widgetComponentName} } from "../components/widgets";\n` +
            content.slice(scriptSetupIndex);
        }
      }
    }
  }

  // 2. Find or create registerWidgets function
  const widgetId = `${widgetComponentName}`;
  const registerWidgetCall = `  registerWidget(
    {
      id: "${widgetId}",
      component: ${widgetComponentName},
      props: { item },
      updateFunctionName: "updateActiveWidgetCount",
      // isVisible: computed(() => !!props.param), // Uncomment to show widget only when blade has param
    },
    blade?.value.id ?? "",
  );`;

  // Check if registerWidgets function exists
  const registerWidgetsFuncMatch = content.match(/function\s+registerWidgets\s*\(\s*\)\s*\{/);

  if (registerWidgetsFuncMatch) {
    // Add to existing registerWidgets function
    const funcStartIndex = content.indexOf(registerWidgetsFuncMatch[0]) + registerWidgetsFuncMatch[0].length;
    // Find the end of the function
    let braceCount = 1;
    let insertIndex = funcStartIndex;

    for (let i = funcStartIndex; i < content.length && braceCount > 0; i++) {
      if (content[i] === "{") braceCount++;
      if (content[i] === "}") braceCount--;
      if (braceCount === 1) insertIndex = i;
    }

    content = content.slice(0, insertIndex) + "\n" + registerWidgetCall + "\n" + content.slice(insertIndex);
  } else {
    // Create new registerWidgets function before defineExpose
    const defineExposeMatch = content.match(/defineExpose\s*\(/);

    if (defineExposeMatch) {
      const defineExposeIndex = content.indexOf(defineExposeMatch[0]);
      const registerWidgetsFunc = `
function registerWidgets() {
${registerWidgetCall}
}

registerWidgets();

`;
      content = content.slice(0, defineExposeIndex) + registerWidgetsFunc + content.slice(defineExposeIndex);
    } else {
      // No defineExpose, add before closing </script>
      const scriptCloseMatch = content.match(/<\/script>/);
      if (scriptCloseMatch) {
        const scriptCloseIndex = content.indexOf(scriptCloseMatch[0]);
        const registerWidgetsFunc = `
function registerWidgets() {
${registerWidgetCall}
}

registerWidgets();

`;
        content = content.slice(0, scriptCloseIndex) + registerWidgetsFunc + content.slice(scriptCloseIndex);
      }
    }
  }

  // 3. Add unregisterWidget in onBeforeUnmount
  const unregisterCall = `  unregisterWidget("${widgetId}", blade?.value.id);`;
  const onBeforeUnmountMatch = content.match(/onBeforeUnmount\s*\(\s*\(\s*\)\s*=>\s*\{/);

  if (onBeforeUnmountMatch) {
    const funcStartIndex = content.indexOf(onBeforeUnmountMatch[0]) + onBeforeUnmountMatch[0].length;
    content = content.slice(0, funcStartIndex) + "\n" + unregisterCall + "\n" + content.slice(funcStartIndex);
  } else {
    // Create new onBeforeUnmount before defineExpose
    const defineExposeMatch = content.match(/defineExpose\s*\(/);

    if (defineExposeMatch) {
      const defineExposeIndex = content.indexOf(defineExposeMatch[0]);
      const onBeforeUnmountFunc = `
onBeforeUnmount(() => {
${unregisterCall}
});

`;
      content = content.slice(0, defineExposeIndex) + onBeforeUnmountFunc + content.slice(defineExposeIndex);
    }
  }

  // 4. Ensure required imports are present
  const requiredImports = [
    // registerWidget and unregisterWidget come from useWidgets(), not direct imports
    { name: "useWidgets", from: "@vc-shell/framework" },
    { name: "useBlade", from: "@vc-shell/framework" },
    { name: "onBeforeUnmount", from: "vue" },
    // { name: "computed", from: "vue" }, // Not needed if isVisible is commented
  ];

  for (const { name, from } of requiredImports) {
    // Escape special regex characters in 'from' path
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const importRegex = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*["']${escapedFrom}["']`, "g");
    const matches = [...content.matchAll(importRegex)];

    if (matches.length > 0) {
      // Check if import already exists in this statement
      const match = matches[0];
      const imports = match[1];
      const importsList = imports
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      // Add new import if not already in list
      if (!importsList.includes(name)) {
        importsList.push(name);
        const newImports = importsList.join(", ");
        content = content.replace(match[0], `import { ${newImports} } from "${from}"`);
      }
    } else {
      // Add new import statement after <script setup>
      const scriptSetupMatch = content.match(/<script\s+(?:setup\s+lang="ts"|lang="ts"\s+setup|setup)>/);
      if (scriptSetupMatch) {
        const scriptSetupIndex = content.indexOf(scriptSetupMatch[0]) + scriptSetupMatch[0].length;
        const firstImportMatch = content.slice(scriptSetupIndex).match(/^[\s\n]*import/m);

        if (firstImportMatch) {
          const insertIndex = scriptSetupIndex + content.slice(scriptSetupIndex).indexOf(firstImportMatch[0]);
          content = content.slice(0, insertIndex) + `import { ${name} } from "${from}";\n` + content.slice(insertIndex);
        } else {
          content =
            content.slice(0, scriptSetupIndex) +
            `\nimport { ${name} } from "${from}";\n` +
            content.slice(scriptSetupIndex);
        }
      }
    }
  }

  // 5. Ensure blade variable is defined
  if (!content.includes("const blade = useBlade()")) {
    const bladeDeclaration = "\nconst blade = useBlade();\n";
    const lastConstMatch = content.match(/const\s+\w+\s*=\s*[^;]+;(?=[^;]*const)/g);

    if (lastConstMatch && lastConstMatch.length > 0) {
      const lastConst = lastConstMatch[lastConstMatch.length - 1];
      const lastConstIndex = content.lastIndexOf(lastConst) + lastConst.length;
      content = content.slice(0, lastConstIndex) + bladeDeclaration + content.slice(lastConstIndex);
    }
  }

  // 6. Ensure useWidgets is called
  if (!content.includes("const { registerWidget, unregisterWidget } = useWidgets()")) {
    const useWidgetsDeclaration = "\nconst { registerWidget, unregisterWidget } = useWidgets();\n";
    const bladeMatch = content.match(/const blade = useBlade\(\);/);

    if (bladeMatch) {
      const bladeIndex = content.indexOf(bladeMatch[0]) + bladeMatch[0].length;
      content = content.slice(0, bladeIndex) + useWidgetsDeclaration + content.slice(bladeIndex);
    }
  }

  fs.writeFileSync(bladeFilePath, content);
}

function getTemplateRoot(): string {
  return path.resolve(fileURLToPath(import.meta.url), "..", "templates");
}

async function generateBladeFile(
  templateRoot: string,
  modulePath: string,
  bladeType: "grid" | "details",
  replacements: Record<string, string>,
  isWorkspace: boolean,
  formFieldsTemplate?: string,
  formFields?: FormField[],
): Promise<string> {
  const templatePath = path.join(templateRoot, "blades", bladeType, "blade.vue");
  const fileName =
    bladeType === "grid"
      ? `${replacements["{{entity-name-plural}}"]}.vue`
      : `${replacements["{{entity-name}}"]}-details.vue`;
  const targetPath = path.join(modulePath, "pages", fileName);

  ensureFileDoesNotExist(targetPath);

  let content = fs.readFileSync(templatePath, "utf-8");

  // Handle isWorkspace and menuItem replacements
  if (isWorkspace) {
    content = content.replace(/{{isWorkspace}}/g, "true");
    content = content.replace(
      /{{menuItem}}/g,
      `{
    id: "${replacements["{{entityName}}"]}",
    title: "${replacements["{{MODULE_NAME_UPPERCASE}}"]}.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  }`,
    );
  } else {
    content = content.replace(/{{isWorkspace}}/g, "false");
    content = content.replace(/{{menuItem}}/g, "undefined");
  }

  // Apply form fields template
  if (bladeType === "details") {
    if (formFieldsTemplate) {
      // Если есть кастомные поля - заменяем маркер на них
      content = content.replace(/\{\{FORM_FIELDS\}\}/g, formFieldsTemplate);
    } else {
      // Если нет - используем дефолтные поля
      const defaultFields = generateDefaultFormFields(replacements["{{MODULE_NAME_UPPERCASE}}"]);
      content = content.replace(/\{\{FORM_FIELDS\}\}/g, defaultFields);
    }

    // Handle VcGallery additions if gallery field is present
    const hasGallery = formFields && hasGalleryField(formFields);

    if (hasGallery) {
      // Add useAssets and ICommonAsset imports
      content = content.replace(/\{\{GALLERY_IMPORTS\}\}/g, "\n  useAssets,\n  ICommonAsset,");

      // Add assetsHandler code
      const galleryScriptCode = generateVcGalleryScriptAdditions(replacements["{{entityName}}"]);
      content = content.replace(/\{\{GALLERY_SCRIPT_ADDITIONS\}\}/g, galleryScriptCode);
    } else {
      // Remove placeholders if no gallery
      content = content.replace(/\{\{GALLERY_IMPORTS\}\}/g, "");
      content = content.replace(/\{\{GALLERY_SCRIPT_ADDITIONS\}\}/g, "");
    }
  }

  content = applyReplacements(content, replacements);

  fs.writeFileSync(targetPath, content);
  console.log(chalk.green(`✓ Created ${bladeType} blade: ${path.relative(process.cwd(), targetPath)}`));

  return targetPath;
}

async function generateComposableFile(
  templateRoot: string,
  modulePath: string,
  bladeType: "grid" | "details",
  naming: ReturnType<typeof createNamingConfig>,
  replacements: Record<string, string>,
): Promise<string> {
  const templateFile = bladeType === "grid" ? "grid-composable.ts" : "details-composable.ts";
  const templatePath = path.join(templateRoot, "composables", templateFile);
  const fileName =
    bladeType === "grid" ? `use${naming.entitySingularPascal}List.ts` : `use${naming.entitySingularPascal}Details.ts`;
  const targetPath = path.join(modulePath, "composables", fileName);

  ensureFileDoesNotExist(targetPath);

  let content = fs.readFileSync(templatePath, "utf-8");
  content = applyReplacements(content, replacements);

  fs.writeFileSync(targetPath, content);
  console.log(chalk.green(`✓ Created composable: ${path.relative(process.cwd(), targetPath)}`));

  return targetPath;
}

function isDirectoryEmpty(targetDir: string): boolean {
  const files = fs.readdirSync(targetDir);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

async function generateComposablesIndex(
  modulePath: string,
  config: ModuleConfig,
  naming: ReturnType<typeof createNamingConfig>,
): Promise<string> {
  const composablesIndexPath = path.join(modulePath, "composables", "index.ts");
  let exports = "";

  if (config.createGridBlade) {
    exports += `export * from "./use${naming.entitySingularPascal}List";\n`;
  }

  if (config.createDetailsBlade) {
    exports += `export * from "./use${naming.entitySingularPascal}Details";\n`;
  }

  fs.writeFileSync(composablesIndexPath, exports);
  console.log(chalk.green(`✓ Created composables index`));

  return composablesIndexPath;
}

async function generateLocalesFile(
  modulePath: string,
  naming: ReturnType<typeof createNamingConfig>,
  replacements: Record<string, string>,
  formLocale?: Record<string, string>,
): Promise<string> {
  const localesPath = path.join(modulePath, "locales", "en.json");

  // Default form fields
  const defaultFormFields = {
    TITLE: "Information",
    NAME: "Name",
    NAME_PLACEHOLDER: `Enter ${naming.entitySingularCamel} name`,
    CREATED_DATE: "Created Date",
  };

  // Merge custom form fields with defaults
  const formFields =
    formLocale && Object.keys(formLocale).length > 0 ? { TITLE: "Information", ...formLocale } : defaultFormFields;

  const localesContent = {
    [naming.moduleNameUpperSnake]: {
      MENU: {
        TITLE: naming.entityPluralPascal,
      },
      PAGES: {
        LIST: {
          TITLE: naming.entityPluralPascal,
          SEARCH: {
            PLACEHOLDER: `Search ${naming.entityPluralCamel}...`,
          },
          TOOLBAR: {
            REFRESH: "Refresh",
            ADD: `Add ${naming.entitySingularPascal}`,
            DELETE: "Delete selected",
          },
          TABLE: {
            HEADER: {
              NAME: "Name",
              CREATED_DATE: "Created",
            },
            TOTALS: `{count} ${naming.entityPluralCamel}`,
            FILTER: {
              STATUS: {
                TITLE: "Status",
                Active: "Active",
                Inactive: "Inactive",
                Pending: "Pending",
              },
              DATE: {
                TITLE: "Date Range",
                START_DATE: "Start Date",
                END_DATE: "End Date",
              },
              APPLY: "Apply",
              RESET: "Reset",
            },
          },
          EMPTY: {
            NO_ITEMS: `No ${naming.entityPluralCamel} yet`,
            ADD: `Add ${naming.entitySingularPascal}`,
          },
          NOT_FOUND: {
            EMPTY: `No ${naming.entityPluralCamel} found`,
            RESET: "Reset search",
          },
        },
        DETAILS: {
          TITLE: `New ${naming.entitySingularPascal}`,
          TOOLBAR: {
            SAVE: "Save",
            DELETE: "Delete",
          },
          FORM: {
            INFO: formFields,
          },
        },
        ALERTS: {
          DELETE: `Are you sure you want to delete this ${naming.entitySingularCamel}?`,
          DELETE_SELECTED_CONFIRMATION: {
            MESSAGE: `Are you sure you want to delete {count} ${naming.entityPluralCamel}?`,
            ALL: "all {totalCount}",
          },
          CLOSE_CONFIRMATION: "You have unsaved changes. Are you sure you want to close?",
          NOT_VALID: "Please fill all required fields correctly.",
        },
      },
    },
  };

  fs.writeFileSync(localesPath, JSON.stringify(localesContent, null, 2));
  console.log(chalk.green(`✓ Created locales file`));

  return localesPath;
}
