// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import mri from "mri";
import { default as chalk } from "chalk";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { cwd as processCwd, argv, exit } from "node:process";
import mainPkg from "./../package.json";
import * as _ from "lodash-es";

type Config = prompts.Answers<"appName" | "packageName" | "variant" | "moduleName" | "appName" | "basePath" | "mocks">;

interface CLIArgs {
  _: string[];
  name?: string;
  "app-name"?: string;
  "package-name"?: string;
  variant?: string;
  "module-name"?: string;
  "base-path"?: string;
  mocks?: boolean;
  overwrite?: boolean;
  help?: boolean;
  h?: boolean;
  version?: boolean;
  v?: boolean;
}

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
  "_yarnrc.yml": ".yarnrc.yml",
  _browserslistrc: ".browserslistrc",
  "_commitlintrc.json": ".commitlintrc.json",
  _editorconfig: ".editorconfig",
  _env: ".env",
  "_env.local": ".env.local",
  _eslintignore: ".eslintignore",
  _prettierignore: ".prettierignore",
  _prettierrc: ".prettierrc",
  "_eslintrc.js": ".eslintrc.js",
  _github: ".github",
  _husky: ".husky",
  _vscode: ".vscode",
  _yarn: ".yarn",
  "_package.json": "package.json",
};

const AppVariants = [
  // {
  //   name: "dynamic",
  //   display: "Dynamic view modules boilerplate",
  // },
  {
    name: "classic",
    display: "Classic view modules boilerplate",
  },
];

const moduleMap = {
  classic: ["classic-module"],
  dynamic: ["dynamic-module"],
};

function showHelp() {
  console.log(`
${chalk.bold(chalk.green("create-vc-app"))} - Create a new VC Shell application

${chalk.bold("Usage:")}
  create-vc-app [project-name] [options]

${chalk.bold("Options:")}
  --name, --app-name <name>          Name of the application
  --package-name <name>              Package name (defaults to app name)
  --variant <variant>                Module variant (classic|dynamic) [default: classic]
  --module-name <name>               Module name (defaults to app name in title case)
  --base-path <path>                 Base path for the application [default: /apps/<app-name>/]
  --mocks                            Include additional module with sample data
  --overwrite                        Overwrite existing files without confirmation
  --help, -h                         Show this help message
  --version, -v                      Show version

${chalk.bold("Examples:")}
  create-vc-app my-app
  create-vc-app my-app --variant classic --mocks
  create-vc-app my-app --module-name "My Module" --base-path "/custom/path/"
  create-vc-app . --name existing-project --overwrite

${chalk.bold("Non-interactive mode:")}
  create-vc-app my-app --variant classic --module-name "My Module" --mocks --overwrite

${chalk.bold("Available variants:")}
${AppVariants.map((v) => `  ${v.name.padEnd(10)} - ${v.display}`).join("\n")}
`);
}

function isValidName(appName: string) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(appName);
}

function toValidName(appName: string) {
  return appName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

function toValidBasePath(basePath: string) {
  return basePath
    .trim()
    .toLowerCase()
    .replace(/\/+/g, "/")
    .replace(/[^a-z0-9/-]+/g, "/")
    .replace(/\/?$/, "/");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  } else {
    // remove directory contents
    fs.readdirSync(dir).forEach((file) => {
      const current = path.join(dir, file);
      if (fs.lstatSync(current).isDirectory()) {
        emptyDir(current);
      } else {
        fs.unlinkSync(current);
      }
    });
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function validateArgs(args: CLIArgs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (args.variant && !AppVariants.some((v) => v.name === args.variant)) {
    errors.push(`Invalid variant: ${args.variant}. Available variants: ${AppVariants.map((v) => v.name).join(", ")}`);
  }

  if (args["package-name"] && !isValidName(args["package-name"])) {
    errors.push(`Invalid package name: ${args["package-name"]}`);
  }

  return { valid: errors.length === 0, errors };
}

function parseArgs(): CLIArgs {
  return mri(argv.slice(2), {
    alias: {
      h: "help",
      v: "version",
    },
    boolean: ["help", "version", "mocks", "overwrite"],
    string: ["name", "app-name", "package-name", "variant", "module-name", "base-path"],
  });
}

async function create() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  if (args.version) {
    console.log(`create-vc-app version ${mainPkg.version}`);
    return;
  }

  const validation = validateArgs(args);
  if (!validation.valid) {
    console.error(chalk.red("Error:"));
    validation.errors.forEach((error) => console.error(chalk.red(`  ${error}`)));
    process.exit(1);
  }

  console.log(`  ${chalk.bold(chalk.green(`\ncreate-vc-app version: ${mainPkg.version}\n`))}`);

  const cwd = processCwd();

  let dir = args._[0] || args.name || args["app-name"];
  const defaultAppName = !dir ? "vc-app" : dir;
  const getProjectName = () => (dir === "." ? path.basename(path.resolve()) : dir!);

  // Check if we have all required arguments for non-interactive mode
  const hasAllArgs = !!(dir || args.name || args["app-name"]);

  let config: Config;

  try {
    if (hasAllArgs && args.variant) {
      // Non-interactive mode - use provided arguments
      dir = dir || args.name || args["app-name"] || defaultAppName;

      if (!dir) {
        console.error(chalk.red("Project name is required"));
        process.exit(1);
      }

      // Check if directory exists and handle overwrite
      if (fs.existsSync(dir) && !isEmpty(dir) && !args.overwrite) {
        console.error(
          chalk.red(`Target directory "${dir}" is not empty. Use --overwrite to overwrite existing files.`),
        );
        process.exit(1);
      }

      const projectName = getProjectName();
      const packageName = args["package-name"] || (isValidName(projectName) ? projectName : toValidName(projectName));
      const moduleName = args["module-name"] || _.startCase(projectName);
      const basePath = args["base-path"] || toValidBasePath(`/apps/${toValidName(projectName)}/`);

      config = {
        appName: toValidName(dir),
        packageName,
        variant: args.variant,
        moduleName,
        basePath,
        mocks: args.mocks || false,
      };

      console.log(chalk.cyan("Creating app with the following configuration:"));
      console.log(chalk.cyan(`  App name: ${config.appName}`));
      console.log(chalk.cyan(`  Package name: ${config.packageName}`));
      console.log(chalk.cyan(`  Variant: ${config.variant}`));
      console.log(chalk.cyan(`  Module name: ${config.moduleName}`));
      console.log(chalk.cyan(`  Base path: ${config.basePath}`));
      console.log(chalk.cyan(`  Mocks: ${config.mocks ? "Yes" : "No"}`));
      console.log();
    } else {
      // Interactive mode
      config = await prompts(
        [
          {
            name: "appName",
            type: dir ? null : "text",
            message: chalk.reset("Project name:"),
            initial: defaultAppName,
            onState: (state) => (dir = toValidName(String(state.value).trim()) || defaultAppName),
            format: (value) => toValidName(String(value).trim()),
          },
          {
            type: () => (!fs.existsSync(dir!) || isEmpty(dir!) ? null : "confirm"),
            name: "overwrite",
            message: () =>
              (dir === "." ? "Current directory" : `Target directory "${dir}"`) +
              ` is not empty. Remove existing files and continue?`,
          },
          {
            type: (_, { overwrite }: { overwrite?: boolean }) => {
              if (overwrite === false) {
                throw new Error(chalk.red("✖") + " Operation cancelled");
              }
              return null;
            },
            name: "overwriteChecker",
          },
          {
            name: "packageName",
            type: () => (isValidName(getProjectName()) ? null : "text"),
            message: chalk.reset("Package name:"),
            initial: () => toValidName(getProjectName()),
            validate: (dir) => isValidName(dir) || "Invalid package.json name",
          },
          {
            name: "basePath",
            type: "text",
            message: chalk.reset("Base path:"),
            initial: () => "/apps/" + toValidName(getProjectName()) + "/",
            format: (value) => toValidBasePath(String(value).trim()),
          },
          {
            type: "select",
            name: "variant",
            message: chalk.reset("Select module variant:"),
            choices: AppVariants.map((variant) => {
              return {
                title: variant.display,
                value: variant.name,
              };
            }),
          },
          {
            name: "moduleName",
            type: "text",
            message: chalk.reset("Module name:"),
            initial: () => _.startCase(getProjectName()),
            format: (value) => String(value).trim(),
          },
          {
            name: "mocks",
            type: "confirm",
            message: "Do you want to include additional module with sample data?",
            initial: false,
          },
        ],
        {
          onCancel: () => {
            throw new Error(chalk.red("✖") + " Creation cancelled");
          },
        },
      );
    }
  } catch (e) {
    console.log((e as Error).message);
    exit(1);
  }

  const { packageName, variant, moduleName, appName, basePath, mocks } = config;

  const stringsToReplace = new Map<string, string>([
    ["{{ModuleName}}", toValidName(moduleName)],
    ["{{ModuleNamePascalCase}}", _.upperFirst(_.camelCase(moduleName))],
    ["{{ModuleNameUppercase}}", moduleName.toUpperCase()],
    ["{{ModuleNameUppercaseSnakeCase}}", _.snakeCase(moduleName).toUpperCase()],
    ["{{ModuleNameExports}}", _.lowerFirst(_.camelCase(moduleName))],
    ["{{ModuleNameSentenceCase}}", _.startCase(moduleName)],
    ["{{AppName}}", appName],
    ["{{AppNameSentenceCase}}", _.startCase(appName)],
    ["{{BasePath}}", basePath],
    ["{{PackageName}}", packageName || getProjectName()],
  ]);

  const root = path.join(cwd, dir!);

  if (fs.existsSync(root)) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\nScaffolding app in ${root}...`);

  const templateRoot = path.resolve(fileURLToPath(import.meta.url), "..", "templates");

  function render(templateName: string, targetPath: string = "") {
    const templateDir = path.resolve(templateRoot, templateName);
    const files = fs.readdirSync(templateDir);

    for (const file of files) {
      const sourcePath = path.join(templateDir, file);
      let targetFileName = renameFiles[file] ?? file; // Get the target file/directory name from the mapping

      // Apply replacements to the target file/directory name
      for (const [key, value] of stringsToReplace.entries()) {
        const regex = new RegExp(key, "g");
        targetFileName = targetFileName.replace(regex, value);
      }

      const targetFilePath = path.join(root, targetPath, targetFileName);

      if (fs.statSync(sourcePath).isDirectory()) {
        // If the source file is a directory, create a directory with the new name in the target path
        fs.mkdirSync(targetFilePath, { recursive: true });

        // Recursively process the contents of the directory
        render(path.join(templateName, file), path.join(targetPath, targetFileName));
      } else {
        // If the source file is a binary file, copy it without modification
        const isBinary = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".pdf", ".zip"].includes(
          path.extname(file).toLowerCase(),
        );
        if (isBinary) {
          fs.copyFileSync(sourcePath, targetFilePath);
        } else {
          // If the source file is a text file, read its content
          let content = fs.readFileSync(sourcePath, "utf-8");

          // Replace all variables in the file content
          for (const [key, value] of stringsToReplace.entries()) {
            const regex = new RegExp(key, "g");
            content = content.replace(regex, value);
          }

          // Write the modified content to the target file
          fs.writeFileSync(targetFilePath, content);
        }
      }
    }
  }

  render("base");

  // Render each module
  moduleMap[variant as keyof typeof moduleMap].forEach((module) => {
    render(`modules/${module}`, "src/modules/" + stringsToReplace.get("{{ModuleName}}"));
  });

  if (mocks) {
    if (variant === "dynamic") {
      moduleMap[variant as keyof typeof moduleMap].forEach((module) => {
        render(`sample/${module}`, "src/modules/sample");
      });
    }

    if (variant === "classic") {
      moduleMap[variant as keyof typeof moduleMap].forEach((module) => {
        render(`sample/${module}`, "src/modules/sample");
      });
    }
    render("mocks", "src/modules/sample");
    render("sample/overrides", "src");
  }

  console.log(`\nDone. You can now run application:\n`);

  if (root !== cwd) {
    const cdProjectName = path.relative(cwd, root);
    console.log(
      `  ${chalk.bold(chalk.green(`cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`))}`,
    );
  }
  console.log(`  ${chalk.bold(chalk.green("yarn"))}`);
  console.log(`  ${chalk.bold(chalk.green("yarn serve"))}`);
}

create().catch((e) => {
  console.error(e);
});
