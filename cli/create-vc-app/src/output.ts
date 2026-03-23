import pc from "picocolors";
import type { ProjectOptions } from "./types.js";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  standalone: "Standalone App",
  "dynamic-module": "Dynamic Module",
  "host-app": "Host App",
};

export function printSuccess(options: ProjectOptions): void {
  const typeLabel = PROJECT_TYPE_LABELS[options.projectType];
  const hasModule = !!options.moduleName;

  console.log(`
  ${pc.green("╭─────────────────────────────────────────╮")}
  ${pc.green("│")}                                         ${pc.green("│")}
  ${pc.green("│")}   ${pc.bold("VC Shell App created successfully!")}    ${pc.green("│")}
  ${pc.green("│")}                                         ${pc.green("│")}
  ${pc.green("│")}   Project: ${pc.cyan(options.projectName.padEnd(28))}${pc.green("│")}
  ${pc.green("│")}   Type:    ${pc.cyan(typeLabel.padEnd(28))}${pc.green("│")}
${hasModule && options.moduleName ? `  ${pc.green("│")}   Module:  ${pc.cyan(options.moduleName.padEnd(28))}${pc.green("│")}\n` : ""}  ${pc.green("│")}                                         ${pc.green("│")}
  ${pc.green("╰─────────────────────────────────────────╯")}

  ${pc.bold("Next steps:")}

  1. cd ${options.projectName}
  2. yarn install
  3. yarn serve
${hasModule && options.moduleName ? `\n  Module is ready at:\n  src/modules/${toKebabCase(options.moduleName)}/\n` : ""}
  ${pc.dim("Docs: https://docs.virtocommerce.org/platform/developer-guide/latest/custom-apps-development/vc-shell/vc-shell-overview/")}
`);
}

function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}
