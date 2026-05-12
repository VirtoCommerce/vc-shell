import mri from "mri";
import pc from "picocolors";
import path from "node:path";
import { argv, exit } from "node:process";
import { fileURLToPath } from "node:url";
import mainPkg from "../package.json";
import { initCommand } from "./commands/init";
import { addModuleCommand } from "./commands/add-module";
import type { CLIArgs } from "./types.js";

// Resolved from entry point — works both in source (tsx) and built (dist/index.js)
const templateRoot = path.resolve(fileURLToPath(import.meta.url), "..", "templates");

function showHelp() {
  console.log(`
${pc.bold(pc.green("create-vc-app"))} — Create VC Shell applications and modules

${pc.bold("Usage:")}
  create-vc-app [project-name] [options]     Create a new project
  create-vc-app add-module <module-name>     Add a module to existing project

${pc.bold("Options (create):")}
  --type <type>              Project type: standalone | dynamic-module
  --name, --app-name <name>  Application name
  --package-name <name>      npm package name
  --module-name <name>       Initial module name (opt-in for standalone)
  --base-path <path>         Base path [default: /apps/<name>/]
  --tenant-routes            Include tenant routing (/:tenantId prefix)
  --ai-agent                 Include AI Agent configuration
  --dashboard                Include Dashboard with widgets
  --mocks                    Include sample module with mock data
  --overwrite                Overwrite existing files
  --help, -h                 Show this help
  --version, -v              Show version

${pc.bold("Examples:")}
  create-vc-app my-app
  create-vc-app my-app --type standalone --dashboard --mocks
  create-vc-app my-module --type dynamic-module --module-name "Reviews"
  create-vc-app add-module orders

${pc.bold("Docs:")} https://docs.virtocommerce.org/platform/developer-guide/latest/custom-apps-development/vc-shell/vc-shell-overview/
`);
}

async function main() {
  const args = mri<CLIArgs>(argv.slice(2), {
    alias: { h: "help", v: "version" },
    boolean: ["help", "version", "mocks", "overwrite", "tenant-routes", "ai-agent", "dashboard"],
    string: ["type", "name", "app-name", "package-name", "module-name", "base-path"],
  });

  if (args.help) {
    showHelp();
    return;
  }

  if (args.version) {
    console.log(`create-vc-app v${mainPkg.version}`);
    return;
  }

  const subcommand = args._[0];

  if (subcommand === "add-module") {
    await addModuleCommand(args, templateRoot);
  } else {
    await initCommand(args, templateRoot);
  }
}

main().catch((e) => {
  console.error(pc.red(e.message || String(e)));
  exit(1);
});
