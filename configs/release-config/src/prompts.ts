import prompts from "prompts";
import { valid, parse } from "semver";
import chalk from "chalk";

export interface ReleaseTypeResult {
  releaseType: "auto" | "prerelease" | "graduate" | "custom" | undefined;
}

export interface PrereleaseResult {
  preid: string | undefined;
  lernaVersionArg: string;
  lernaPreidArgs: string[];
}

/**
 * Prompts user to select the type of release to perform.
 */
export async function promptReleaseType(): Promise<string | undefined> {
  const { releaseType } = await prompts({
    type: "select",
    name: "releaseType",
    message: "Select release type",
    choices: [
      { title: "Automatic (based on commits)", value: "auto" },
      { title: "Prerelease (alpha/beta/rc)", value: "prerelease" },
      { title: "Graduate prerelease to stable", value: "graduate" },
      { title: "Custom version", value: "custom" },
    ],
  });

  return releaseType;
}

/**
 * Prompts user to select prerelease identifier and returns lerna args.
 */
export async function promptPrereleaseId(
  currentVersion: string,
): Promise<PrereleaseResult | undefined> {
  const parsed = parse(currentVersion);
  const isCurrentPrerelease = parsed && parsed.prerelease.length > 0;
  const currentPreid = isCurrentPrerelease ? (parsed.prerelease[0] as string) : null;

  const { preid } = await prompts({
    type: "select",
    name: "preid",
    message: "Select prerelease identifier",
    choices: [
      {
        title: isCurrentPrerelease && currentPreid === "alpha" ? "alpha (continue)" : "alpha",
        value: "alpha",
      },
      {
        title: isCurrentPrerelease && currentPreid === "beta" ? "beta (continue)" : "beta",
        value: "beta",
      },
      {
        title: isCurrentPrerelease && currentPreid === "rc" ? "rc (continue)" : "rc",
        value: "rc",
      },
    ],
  });

  if (!preid) return undefined;

  // If same preid, just increment; otherwise start new prerelease line
  if (isCurrentPrerelease && currentPreid === preid) {
    return { preid, lernaVersionArg: "prerelease", lernaPreidArgs: [] };
  }
  return { preid, lernaVersionArg: "prerelease", lernaPreidArgs: ["--preid", preid] };
}

/**
 * Prompts user to enter a custom semver version.
 */
export async function promptCustomVersion(currentVersion: string): Promise<string | undefined> {
  const { customVersion } = await prompts({
    type: "text",
    name: "customVersion",
    message: "Enter custom version",
    initial: currentVersion,
    validate: (v) => (valid(v) ? true : "Invalid semver version"),
  });

  return customVersion;
}

/**
 * Prompts user for final release confirmation.
 */
export async function confirmRelease(): Promise<boolean> {
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: "Ready to release. Continue?",
  });

  return !!yes;
}

/**
 * Prints cancellation message.
 */
export function cancelled(): void {
  console.log(chalk.yellow("\nRelease cancelled\n"));
}
