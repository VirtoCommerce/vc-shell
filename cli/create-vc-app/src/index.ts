#!/usr/bin/env node

import prompts from "prompts";
import minimist from "minimist";
import { default as chalk } from "chalk";
import path from "path";
import fs from "fs";
import * as ejs from "ejs";

interface Config {
  appName?: string;
  packageName?: string;
  dashboard?: boolean;
  commonPages?: boolean;
  bladeModuleStarter?: boolean;
  bladeModuleName?: string;
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

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
}

async function renderTemplate(src: string, dest: string, config: Config) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (path.basename(src) === "node_modules") {
      return;
    }

    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      if (path.parse(file).ext === ".ejs") {
        try {
          const rendered = await ejs.renderFile(path.resolve(src, file), config);
          fs.writeFileSync(path.resolve(`${dest}/${path.parse(file).name}`), rendered);

          continue;
        } catch (e) {
          console.log(e);
        }
      }
      renderTemplate(path.resolve(src, file), path.resolve(dest, file), config);
    }
    return;
  }

  if (fs.existsSync(dest)) {
    fs.writeFileSync(dest, fs.readFileSync(src, "utf8"));
    return;
  }

  fs.copyFileSync(src, dest);
}

async function create() {
  const cwd = process.cwd();

  const args = minimist(process.argv.slice(2));
  let dir = args._[0];
  const defaultAppName = !dir ? "vc-app" : dir;

  let config: Config = {};

  try {
    config = await prompts(
      [
        {
          name: "appName",
          type: dir ? null : "text",
          message: "App name:",
          initial: defaultAppName,
          onState: (state) => (dir = toValidName(String(state.value).trim()) || defaultAppName),
          format: (value) => toValidName(String(value).trim()),
        },
        {
          name: "packageName",
          type: () => (isValidName(dir) ? null : "text"),
          message: "Package name:",
          initial: () => toValidName(dir),
          validate: (dir) => isValidName(dir) || "Invalid package.json name",
        },
        {
          name: "dashboard",
          type: "toggle",
          message: "Add Dashboard page?",
          initial: false,
          active: "Yes",
          inactive: "No",
        },
        {
          name: "commonPages",
          type: "toggle",
          message: "Add Login/Invite/Reset password pages?",
          initial: false,
          active: "Yes",
          inactive: "No",
        },
        {
          name: "bladeModuleStarter",
          type: "toggle",
          message: "Add module starter?",
          initial: false,
          active: "Yes",
          inactive: "No",
        },
        {
          name: "bladeModuleName",
          type: (prev) => (prev ? "text" : null),
          message: "Module starter name:",
          format: (value) => String(value).trim().replace(/\s+/g, "").replace(/^[._]/, ""),
        },
      ],
      {
        onCancel: () => {
          throw new Error(chalk.red("Creation cancelled"));
        },
      }
    );
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  const { dashboard, commonPages, bladeModuleStarter } = config;

  const root = path.join(cwd, dir);

  if (fs.existsSync(root)) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\nScaffolding app in ${root}...`);

  const templateRoot = path.resolve(__dirname, "template");

  const render = (templateName) => {
    const templateDir = path.resolve(templateRoot, templateName);
    renderTemplate(templateDir, root, config);
  };

  render("base");

  if (dashboard) {
    render("code/dashboard");
  }

  if (commonPages) {
    render("code/commonPages");
  }

  if (bladeModuleStarter) {
    render("code/blade");
  }

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
