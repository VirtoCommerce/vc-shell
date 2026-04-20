import prompts from "prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import { toKebabCase, toPascalCase, toSentenceCase, buildTemplateData } from "../engine/helpers.js";
import { renderDir } from "../engine/template.js";
import { addModuleToMain, addMenuItemToBootstrap } from "../engine/codegen.js";

export async function addModuleCommand(args: Record<string, unknown>, templateRoot: string): Promise<void> {
  const cwd = process.cwd();
  const argModuleName = (args._ as string[])?.[1];

  // Validate: is this a vc-shell project?
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error(pc.red("Error: No package.json found. Run this command from a vc-shell project root."));
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps["@vc-shell/framework"]) {
    console.error(pc.red("Error: Not a vc-shell project (@vc-shell/framework not found in dependencies)."));
    process.exit(1);
  }

  // Prompt for module name if not provided
  let moduleName = argModuleName;
  if (!moduleName) {
    const response = await prompts({
      type: "text",
      name: "moduleName",
      message: "Module name:",
      validate: (val) => val.trim().length > 0 || "Module name is required",
    });
    moduleName = response.moduleName;
  }

  if (!moduleName) {
    console.error(pc.red("Module name is required."));
    process.exit(1);
  }

  const kebabName = toKebabCase(moduleName);
  const pascalName = toPascalCase(moduleName);
  const modulesDir = path.join(cwd, "src/modules");
  const moduleDir = path.join(modulesDir, kebabName);

  // Check modules directory exists
  if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
  }

  // Check if module already exists
  if (fs.existsSync(moduleDir)) {
    console.error(pc.red(`Error: Module "${kebabName}" already exists at ${path.relative(cwd, moduleDir)}`));
    process.exit(1);
  }

  // 1. Render module template
  const templateData = buildTemplateData({ moduleName, projectName: path.basename(cwd) });
  renderDir(path.join(templateRoot, "module"), moduleDir, templateData);
  console.log(pc.green(`  ✔ Created ${path.relative(cwd, moduleDir)}/`));

  // 2. Add import + app.use() to main.ts
  const mainTsPath = path.join(cwd, "src/main.ts");
  if (fs.existsSync(mainTsPath)) {
    try {
      addModuleToMain(mainTsPath, moduleName);
      console.log(pc.green(`  ✔ Updated src/main.ts — added import & app.use(${pascalName})`));
    } catch (_e) {
      console.warn(pc.yellow(`  ⚠ Could not auto-update src/main.ts. Add manually:`));
      console.warn(pc.yellow(`    import ${pascalName} from "./modules/${kebabName}";`));
      console.warn(pc.yellow(`    app.use(${pascalName}, { router });`));
    }
  }

  // 3. Add menu item to bootstrap.ts
  const bootstrapPath = path.join(cwd, "src/bootstrap.ts");
  if (fs.existsSync(bootstrapPath)) {
    try {
      addMenuItemToBootstrap(bootstrapPath, moduleName);
      console.log(pc.green(`  ✔ Updated src/bootstrap.ts — added menu item "${toSentenceCase(moduleName)}"`));
    } catch (_e) {
      console.warn(pc.yellow(`  ⚠ Could not auto-update src/bootstrap.ts. Add addMenuItem() manually.`));
    }
  }

  console.log(`\n  Module "${kebabName}" is ready! Run ${pc.bold(pc.green("yarn serve"))} to see it.\n`);
}
