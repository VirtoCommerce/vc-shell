#!/usr/bin/env node

import prompts from "prompts";
import minimist from "minimist";
import { default as chalk } from "chalk";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "node:url";

type Config = prompts.Answers<"appName" | "packageName" | "variant">;

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

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

const AppVariants = [
  {
    name: "classic",
    display: "Classic modules boilerplate",
  },
  {
    name: "dynamic",
    display: "Dynamic modules boilerplate",
  },
  {
    name: "both",
    display: "Classic modules + Dynamic modules boilerplate",
  },
];

const variantMap = {
  both: "variants/both",
  classic: "variants/classic",
  dynamic: "variants/dynamic",
};

async function create() {
  const cwd = process.cwd();

  const args = minimist(process.argv.slice(2));
  let dir = args._[0];
  const defaultAppName = !dir ? "vc-app" : dir;
  const getProjectName = () => (dir === "." ? path.basename(path.resolve()) : dir);

  let config: Config;

  try {
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
          type: () => (!fs.existsSync(dir) || isEmpty(dir) ? null : "confirm"),
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
      ],
      {
        onCancel: () => {
          throw new Error(chalk.red("✖") + " Creation cancelled");
        },
      }
    );
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  const { packageName, variant } = config;

  const root = path.join(cwd, dir);

  if (fs.existsSync(root)) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\nScaffolding app in ${root}...`);

  const templateRoot = path.resolve(fileURLToPath(import.meta.url), "../templates");

  const write = (file: string, content?: string) => {
    if (content) {
      fs.writeFileSync(path.join(root, file), content);
    } else {
      copy(file, root);
    }
  };

  const render = (templateName) => {
    const templateDir = path.resolve(templateRoot, templateName);
    write(templateDir);
  };

  render("base");

  render(variantMap[variant]);

  const pkg = JSON.parse(fs.readFileSync(path.join(templateRoot, `./base/package.json`), "utf-8"));

  pkg.name = packageName || getProjectName();

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  console.log(`\nDone. You can now run application:\n`);

  if (root !== cwd) {
    const cdProjectName = path.relative(cwd, root);
    console.log(
      `  ${chalk.bold(chalk.green(`cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`))}`
    );
  }
  console.log(`  ${chalk.bold(chalk.green("yarn"))}`);
  console.log(`  ${chalk.bold(chalk.green("yarn serve"))}`);
}

create().catch((e) => {
  console.error(e);
});
