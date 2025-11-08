import prompts from "prompts";
import chalk from "chalk";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { CLIArgs, CreateAppConfig } from "../cli/types.js";
import { renameFiles, SUPPORTED_TEMPLATE_EXTENSIONS } from "../cli/constants.js";
import { isValidName, toValidBasePath, toValidName } from "../cli/utils.js";
import { formatDirectory } from "../utils/format.js";
import { generateBlade } from "../commands/generate-blade.js";
import { ValidationError, UserCancelledError } from "../cli/errors.js";
import { findTemplateRoot } from "../utils/templates";

interface CreateAppContext {
  cwd: string;
  args: CLIArgs;
}

interface RenderTemplateOptions {
  templateName: string;
  targetDirectory: string;
  replacements: Map<string, string>;
}

export interface CreateAppResult {
  root: string;
  filesCreated: number;
  config: CreateAppConfig;
}

export async function createApplication(context: CreateAppContext): Promise<CreateAppResult> {
  const { args, cwd } = context;

  const projectNameArg = args._[0] || args.name || args["app-name"];
  const defaultAppName = projectNameArg || "vc-app";
  const hasAllArgs = Boolean(projectNameArg);

  const config = await resolveConfig({
    args,
    defaultAppName,
    hasAllArgs,
  });

  console.log(chalk.cyan("\n📋 Creating app with the following configuration:"));
  console.log(chalk.cyan(`   App name: ${config.appName}`));
  console.log(chalk.cyan(`   Package name: ${config.packageName}`));
  console.log(chalk.cyan(`   Base path: ${config.basePath}`));
  console.log();

  const projectDirectory = projectNameArg === "." ? cwd : path.join(cwd, config.appName);

  ensureWritableDirectory(projectDirectory, {
    overwrite: Boolean(args.overwrite),
  });

  console.log(chalk.cyan(`\n📦 Scaffolding app in ${chalk.bold(projectDirectory)}...`));

  const replacements = buildReplacementMap(config);

  const filesCreated = renderTemplate({
    templateName: "base",
    targetDirectory: projectDirectory,
    replacements,
  });

  console.log(chalk.green(`✅ Created ${filesCreated} files`));

  console.log(chalk.cyan("\n🎨 Formatting files with Prettier..."));
  await formatOutput(projectDirectory);

  if (!args["skip-module-gen"]) {
    await runInitialModuleGeneration(projectDirectory, args);
  }

  return {
    root: projectDirectory,
    filesCreated,
    config,
  };
}

interface ResolveConfigParams {
  args: CLIArgs;
  defaultAppName: string;
  hasAllArgs: boolean;
}

async function resolveConfig(params: ResolveConfigParams): Promise<CreateAppConfig> {
  const { args, defaultAppName, hasAllArgs } = params;

  if (hasAllArgs) {
    const appName = toValidName(args._[0] || args.name || args["app-name"] || defaultAppName);
    const projectName = args._[0] || args.name || args["app-name"] || appName;
    const packageName = args["package-name"] || (isValidName(projectName) ? projectName : toValidName(projectName));
    const basePath = toValidBasePath(args["base-path"] || `/apps/${toValidName(projectName)}/`);

    return {
      appName,
      packageName,
      moduleName: "",
      basePath,
    };
  }

  return promptForConfig(defaultAppName);
}

async function promptForConfig(defaultAppName: string): Promise<CreateAppConfig> {
  let targetDir = defaultAppName;

  try {
    const answers = await prompts(
      [
        {
          name: "appName",
          type: "text",
          message: chalk.reset("Project name:"),
          initial: defaultAppName,
          onState: (state) => {
            targetDir = toValidName(String(state.value).trim()) || defaultAppName;
          },
          format: (value) => toValidName(String(value).trim()),
        },
        {
          type: () => (!fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm"),
          name: "overwrite",
          message: () =>
            (targetDir === "." ? "Current directory" : `Target directory "${targetDir}"`) +
            " is not empty. Remove existing files and continue?",
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new UserCancelledError();
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          name: "packageName",
          type: () => (isValidName(targetDir) ? null : "text"),
          message: chalk.reset("Package name:"),
          initial: () => toValidName(targetDir),
          validate: (value) => isValidName(value) || "Invalid package.json name",
        },
        {
          name: "basePath",
          type: "text",
          message: chalk.reset("Base path:"),
          initial: () => `/apps/${toValidName(targetDir)}/`,
          format: (value) => toValidBasePath(String(value).trim()),
        },
      ],
      {
        onCancel: () => {
          throw new UserCancelledError();
        },
      },
    );

    const appName = answers.appName || toValidName(defaultAppName);
    const packageName = answers.packageName || toValidName(appName);
    const basePath = answers.basePath || `/apps/${appName}/`;

    return {
      appName,
      packageName,
      moduleName: "",
      basePath,
    };
  } catch (error) {
    if (error instanceof UserCancelledError) {
      throw error;
    }

    const err = error as Error;
    throw new ValidationError([err.message]);
  }
}

interface EnsureWritableOptions {
  overwrite: boolean;
}

function ensureWritableDirectory(targetDirectory: string, options: EnsureWritableOptions): void {
  if (fs.existsSync(targetDirectory)) {
    if (!isEmpty(targetDirectory) && !options.overwrite) {
      throw new ValidationError([
        `Target directory "${targetDirectory}" is not empty. Use --overwrite to overwrite existing files.`,
      ]);
    }
    emptyDirectory(targetDirectory);
  } else {
    fs.mkdirSync(targetDirectory, { recursive: true });
  }
}

function buildReplacementMap(config: CreateAppConfig): Map<string, string> {
  return new Map<string, string>([
    ["{{AppName}}", config.appName],
    ["{{AppNameSentenceCase}}", toSentenceCase(config.appName)],
    ["{{BasePath}}", config.basePath],
    ["{{PackageName}}", config.packageName],
  ]);
}

function renderTemplate(options: RenderTemplateOptions): number {
  const templateRoot = findTemplateRoot(import.meta.url);
  const templateDirectory = path.join(templateRoot, options.templateName);
  let filesCreated = 0;

  visitTemplate(templateDirectory, (sourcePath, relativePath) => {
    const targetPath = path.join(options.targetDirectory, relativePath);
    const resolvedTarget = applyFilenameReplacements(targetPath, options.replacements);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      fs.mkdirSync(resolvedTarget, { recursive: true });
      return;
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(resolvedTarget);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (isBinaryFile(sourcePath)) {
      fs.copyFileSync(sourcePath, resolvedTarget);
    } else {
      const content = fs.readFileSync(sourcePath, "utf-8");
      const replaced = applyContentReplacements(content, options.replacements);
      fs.writeFileSync(resolvedTarget, replaced);
    }

    filesCreated += 1;
  });

  return filesCreated;
}

function visitTemplate(templateDirectory: string, visitor: (sourcePath: string, relativePath: string) => void, prefix = ""): void {
  const entries = fs.readdirSync(templateDirectory);

  for (const entry of entries) {
    const sourcePath = path.join(templateDirectory, entry);
    const relativePath = path.join(prefix, renameFiles[entry] ?? entry);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      visitTemplate(sourcePath, visitor, relativePath);
    } else {
      visitor(sourcePath, relativePath);
    }
  }
}

function applyFilenameReplacements(targetPath: string, replacements: Map<string, string>): string {
  let resolved = targetPath;

  for (const [key, value] of replacements) {
    const regex = new RegExp(key, "g");
    resolved = resolved.replace(regex, value);
  }

  return resolved;
}

function applyContentReplacements(content: string, replacements: Map<string, string>): string {
  let updated = content;

  for (const [key, value] of replacements) {
    const regex = new RegExp(key, "g");
    updated = updated.replace(regex, value);
  }

  return updated;
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".pdf", ".zip"].includes(ext);
}

function emptyDirectory(targetDir: string): void {
  if (!fs.existsSync(targetDir)) {
    return;
  }

  for (const entry of fs.readdirSync(targetDir)) {
    const current = path.join(targetDir, entry);
    const stats = fs.lstatSync(current);

    if (stats.isDirectory()) {
      emptyDirectory(current);
    } else {
      fs.unlinkSync(current);
    }
  }
}

function isEmpty(targetDir: string): boolean {
  const files = fs.readdirSync(targetDir);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

async function formatOutput(directory: string): Promise<void> {
  try {
    await formatDirectory(directory, SUPPORTED_TEMPLATE_EXTENSIONS);
    console.log(chalk.green("✅ All files formatted"));
  } catch (error: any) {
    console.log(chalk.yellow(`⚠️  Some files could not be formatted: ${error.message}`));
  }
}

async function runInitialModuleGeneration(projectDirectory: string, args: CLIArgs): Promise<void> {
  console.log(chalk.cyan("\n🏗️  Creating module with blade generator...\n"));
  try {
    await generateBlade({
      name: undefined,
      type: undefined,
      module: undefined,
      composable: true,
      locales: true,
      widget: false,
      isWorkspace: true,
      path: projectDirectory,
      formFields: args["form-fields"],
      skipFormEditor: args["skip-form-editor"],
      _skipActionPrompt: true,
    });
  } catch (error: any) {
    if (error instanceof UserCancelledError) {
      console.log(chalk.yellow("\n⚠️  Module generation cancelled"));
      console.log(chalk.yellow("   You can add modules later using: create-vc-app blade"));
      return;
    }

    console.log(chalk.yellow(`\n⚠️  Module generation failed: ${error.message}`));
    console.log(chalk.yellow("   You can add modules later using: create-vc-app blade"));
  }
}

function toSentenceCase(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
