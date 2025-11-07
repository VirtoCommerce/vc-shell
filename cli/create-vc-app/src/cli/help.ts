import chalk from "chalk";
import mainPkg from "../../package.json" assert { type: "json" };

export function showHelp(): void {
  console.log(`
${chalk.bold(chalk.green("create-vc-app"))} - Create a new VC Shell application or generate modules/blades

${chalk.bold("Usage:")}
  create-vc-app [project-name] [options]              Create a new application
  create-vc-app blade|generate                        Interactive generator (modules, blades, widgets)

${chalk.bold("Create App Options:")}
  --name, --app-name <name>          Name of the application
  --package-name <name>              Package name (defaults to app name)
  --base-path <path>                 Base path for the application [default: /apps/<app-name>/]
  --skip-module-gen                  Skip module generation (create only base app)
  --skip-form-editor                 Skip interactive form builder
  --form-fields <json>               JSON string with form field definitions
  --overwrite                        Overwrite existing files without confirmation
  --help, -h                         Show this help message
  --version, -v                      Show version

${chalk.bold("Blade Generator Options:")}
  --module <name>                    Target module name
  --type <grid|details>              Blade type
  --name <name>                      Blade name
  --is-workspace                     Mark blade as workspace (main module blade)
  --widget                           Generate widget instead of blade
  --composable                       Generate composable
  --locales                          Generate locales
  --path <path>                      Target path

${chalk.bold("Interactive Generator:")}
  The blade/generate command provides an interactive menu to:
  - Create new modules with Grid and/or Details blades
  - Add blades to existing modules
  - Generate widgets for existing blades
  - Customize form fields interactively with rich components
  - Automatically format generated code with Prettier

  Features:
  - Smart naming (no more "offerss" bugs)
  - Filter support in Grid blades (staged/applied architecture)
  - Proper useModificationTracker usage in Details blades
  - All Vc components: VcInput, VcSelect, VcEditor, VcSwitch, VcGallery, etc.
  - TODO comments for API client integration
  - Automatic module registration in main.ts

${chalk.bold("Examples:")}
  ${chalk.gray("# Create new application interactively")}
  ${chalk.gray("# Will prompt for: app name, package name, base path")}
  ${chalk.gray("# Then use blade generator to create initial module")}
  create-vc-app my-app

  ${chalk.gray("# Create app without module (base only)")}
  create-vc-app my-app --skip-module-gen

  ${chalk.gray("# Interactive blade/module generator")}
  create-vc-app blade

  ${chalk.gray("# Create blade with custom form fields (non-interactive)")}
  create-vc-app blade --module products --type details --name product-details \\
    --form-fields '[{"name":"price","type":"currency","required":true},{"name":"description","type":"editor","required":false}]'

  ${chalk.gray("# Generate widget interactively")}
  create-vc-app blade --widget
`);
}

export function showVersion(): void {
  console.log(`create-vc-app version ${mainPkg.version}`);
}

