import prompts from "prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import type { ProjectOptions, ProjectType } from "../types.js";
import {
  isValidPackageName,
  toValidPackageName,
  toValidBasePath,
  toSentenceCase,
  toKebabCase,
  buildTemplateData,
} from "../engine/helpers.js";
import { renderDir, emptyDir, isDirEmpty } from "../engine/template.js";
import { printSuccess } from "../output.js";

const PROJECT_TYPES: { title: string; value: ProjectType }[] = [
  { title: "Standalone App — full application with bundled modules", value: "standalone" },
  { title: "Dynamic Module — remote module loaded by host via Module Federation", value: "dynamic-module" },
  { title: "Host App — shell application that loads dynamic modules", value: "host-app" },
];

export async function initCommand(args: Record<string, unknown>, templateRoot: string): Promise<void> {
  const cwd = process.cwd();
  const argName = (args._ as string[])?.[0] || (args.name as string) || (args["app-name"] as string);
  let dir = argName;
  const defaultAppName = !dir ? "vc-app" : dir;
  const getProjectName = () => (dir === "." ? path.basename(path.resolve()) : dir!);

  const hasAllArgs = !!(dir && args.type);

  let options: ProjectOptions;

  if (hasAllArgs) {
    // Non-interactive mode
    dir = dir || defaultAppName;
    const root = path.resolve(cwd, dir);

    if (fs.existsSync(root) && !isDirEmpty(root) && !args.overwrite) {
      console.error(pc.red(`Target directory "${dir}" is not empty. Use --overwrite to overwrite.`));
      process.exit(1);
    }

    const projectName = getProjectName();
    const projectType = args.type as ProjectType;

    options = {
      projectName: toKebabCase(projectName),
      packageName: (args["package-name"] as string) || (isValidPackageName(projectName) ? projectName : toValidPackageName(projectName)),
      projectType,
      moduleName: (args["module-name"] as string) || toSentenceCase(projectName),
      basePath: (args["base-path"] as string) || toValidBasePath(`/apps/${toKebabCase(projectName)}/`),
      tenantRoutes: (args["tenant-routes"] as boolean) || false,
      aiAgent: (args["ai-agent"] as boolean) || false,
      dashboard: (args.dashboard as boolean) || false,
      mocks: (args.mocks as boolean) || false,
    };
  } else {
    // Interactive mode — split into phases so computed defaults are resolved before use
    const onCancel = () => {
      throw new Error(pc.red("✖") + " Creation cancelled");
    };

    try {
      // Phase 1: project name, overwrite, package name, project type
      const phase1 = await prompts(
        [
          {
            name: "projectName",
            type: dir ? null : "text",
            message: pc.reset("Project name:"),
            initial: defaultAppName,
            onState: (state) => {
              dir = toKebabCase(String(state.value).trim()) || defaultAppName;
            },
            format: (value) => toKebabCase(String(value).trim()),
          },
          {
            type: () => (!fs.existsSync(path.resolve(cwd, dir!)) || isDirEmpty(path.resolve(cwd, dir!)) ? null : "confirm"),
            name: "overwrite",
            message: () =>
              (dir === "." ? "Current directory" : `Target directory "${dir}"`) +
              " is not empty. Remove existing files and continue?",
          },
          {
            type: (_, { overwrite }: { overwrite?: boolean }) => {
              if (overwrite === false) {
                throw new Error(pc.red("✖") + " Operation cancelled");
              }
              return null;
            },
            name: "overwriteChecker",
          },
          {
            name: "packageName",
            type: () => (isValidPackageName(getProjectName()) ? null : "text"),
            message: pc.reset("Package name:"),
            initial: () => toValidPackageName(getProjectName()),
            validate: (val) => isValidPackageName(val) || "Invalid package.json name",
          },
          {
            type: "select",
            name: "projectType",
            message: pc.reset("Project type:"),
            choices: PROJECT_TYPES,
          },
        ],
        { onCancel },
      );

      const projectName = dir ? toKebabCase(dir) : phase1.projectName;
      const projectType: ProjectType = phase1.projectType || "standalone";

      // Compute defaults between phases — avoids function-style `initial` issues
      const defaultModuleName = toSentenceCase(projectName);
      const defaultBasePath = "/apps/" + toKebabCase(projectName) + "/";

      // Phase 2: text inputs first (module name, base path), then confirm toggles.
      // Confirm prompts with non-Latin keyboard layouts can leak unrecognized
      // characters into the stdin buffer, so text prompts must come before them.
      const phase2 = await prompts(
        [
          {
            name: "moduleName",
            type: projectType === "host-app" ? null : "text",
            message: pc.reset("Module name:"),
            initial: defaultModuleName,
            format: (value: string) => String(value).trim(),
          },
          {
            name: "basePath",
            type: projectType === "dynamic-module" ? null : "text",
            message: pc.reset("Base path:"),
            initial: defaultBasePath,
            format: (value: string) => toValidBasePath(String(value).trim()),
          },
          {
            type: projectType === "dynamic-module" ? null : "confirm",
            name: "tenantRoutes",
            message: "Include tenant routing (/:tenantId prefix)?",
            initial: false,
          },
          {
            type: projectType === "dynamic-module" ? null : "confirm",
            name: "aiAgent",
            message: "Include AI Agent configuration?",
            initial: false,
          },
          {
            type: projectType === "dynamic-module" ? null : "confirm",
            name: "dashboard",
            message: "Include Dashboard with widgets?",
            initial: true,
          },
          {
            name: "mocks",
            type: projectType === "host-app" ? null : "confirm",
            message: "Include sample module with mock data?",
            initial: false,
          },
        ],
        { onCancel },
      );

      options = {
        projectName,
        packageName: phase1.packageName || (isValidPackageName(projectName) ? projectName : toValidPackageName(projectName)),
        projectType,
        moduleName: phase2.moduleName || defaultModuleName,
        basePath: phase2.basePath || toValidBasePath(defaultBasePath),
        tenantRoutes: phase2.tenantRoutes || false,
        aiAgent: phase2.aiAgent || false,
        dashboard: phase2.dashboard ?? true,
        mocks: phase2.mocks || false,
      };
    } catch (e) {
      console.log((e as Error).message);
      process.exit(1);
    }
  }

  const root = path.resolve(cwd, dir!);

  if (fs.existsSync(root) && !isDirEmpty(root)) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  console.log(`\n  Scaffolding ${pc.cyan(options.projectType)} in ${pc.green(root)}...\n`);

  const templateData = buildTemplateData(options);

  // 1. Render project type template
  renderDir(path.join(templateRoot, options.projectType), root, templateData);

  // 2. Render module (standalone and dynamic-module only)
  if (options.projectType !== "host-app") {
    const moduleKebab = toKebabCase(options.moduleName);
    const moduleTargetDir =
      options.projectType === "dynamic-module"
        ? path.join(root, "src/modules")
        : path.join(root, "src/modules", moduleKebab);

    renderDir(path.join(templateRoot, "module"), moduleTargetDir, templateData);
  }

  // 3. Render sample module (standalone and dynamic-module, if requested)
  if (options.mocks && options.projectType !== "host-app") {
    renderDir(path.join(templateRoot, "sample-module"), path.join(root, "src/modules/sample"), templateData);
  }

  printSuccess(options);
}
