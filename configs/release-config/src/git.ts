import { sync } from "cross-spawn";
import chalk from "chalk";

/**
 * Finds the last git tag matching `<prefix><majorMinor>.*`.
 * Returns the tag string or null if none found.
 */
export function findLastMatchingTag(majorMinor: string, tagPrefix: string): string | null {
  const result = sync("git", ["describe", "--tags", "--abbrev=0", "--match", `${tagPrefix}${majorMinor}.*`], {
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

/**
 * Gets the repo URL for changelog commit links.
 */
export function getRepoUrl(): string | null {
  const result = sync("git", ["remote", "get-url", "origin"], {
    stdio: "pipe",
    encoding: "utf-8",
  });
  if (result.status === 0 && result.stdout) {
    return result.stdout
      .toString()
      .trim()
      .replace(/\.git$/, "")
      .replace(/^git@github\.com:/, "https://github.com/");
  }
  return null;
}

/**
 * Checks if a git tag exists.
 */
export function tagExists(tag: string): boolean {
  const result = sync("git", ["rev-parse", "--verify", `refs/tags/${tag}`], {
    stdio: "pipe",
  });
  return result.status === 0;
}

/**
 * Checks if a ref (tag/commit) is an ancestor of HEAD.
 */
export function isAncestorOfHead(ref: string): boolean {
  const result = sync("git", ["merge-base", "--is-ancestor", ref, "HEAD"], {
    stdio: "pipe",
  });
  return result.status === 0;
}

/**
 * Gets the merge base between two refs.
 */
export function getMergeBase(ref1: string, ref2: string): string | null {
  const result = sync("git", ["merge-base", ref1, ref2], {
    stdio: "pipe",
    encoding: "utf-8",
  });
  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

export interface ConventionalCommit {
  hash: string;
  shortHash: string;
  type: string;
  scope: string | null;
  subject: string;
  breaking: boolean;
}

/**
 * Gets conventional commits in a range, optionally filtered by path.
 */
export function getConventionalCommitsInRange(
  from: string,
  to: string,
  commitPath?: string,
): ConventionalCommit[] {
  const gitArgs = ["log", "--format=%H %s", `${from}..${to}`];
  if (commitPath) {
    gitArgs.push("--", commitPath);
  }

  const result = sync("git", gitArgs, {
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status !== 0 || !result.stdout) return [];

  const commits: ConventionalCommit[] = [];
  const lines = result.stdout.toString().trim().split("\n").filter(Boolean);
  const pattern = /^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/;

  for (const line of lines) {
    const spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) continue;

    const hash = line.substring(0, spaceIdx);
    const message = line.substring(spaceIdx + 1);
    const match = message.match(pattern);

    if (match) {
      commits.push({
        hash,
        shortHash: hash.substring(0, 7),
        type: match[1],
        scope: match[2] || null,
        subject: match[4],
        breaking: !!match[3],
      });
    }
  }

  return commits;
}

/**
 * Gets the latest tag on current HEAD (created by Lerna).
 */
export function getLatestTag(): string | null {
  const result = sync("git", ["describe", "--tags", "--abbrev=0"], {
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

/**
 * Stages all modified tracked files and amends the last commit (created by Lerna).
 * Uses `git add -u` to capture all release changes including custom hook modifications
 * (e.g. boilerplate template versions, app dependency updates).
 * Exits on failure.
 */
export function stageAndAmendCommit(): void {
  const addResult = sync("git", ["add", "-u"], { stdio: "inherit" });
  if (addResult.status !== 0) {
    console.error(chalk.red("\nFailed to stage changes\n"));
    process.exit(1);
  }

  const commitResult = sync("git", ["commit", "--amend", "--no-edit"], { stdio: "inherit" });
  if (commitResult.status !== 0) {
    console.error(chalk.red("\nFailed to amend commit\n"));
    process.exit(1);
  }
}

/**
 * Deletes and recreates the tag as an annotated tag on the amended commit.
 */
export function recreateAnnotatedTag(tag: string): void {
  const result = sync("git", ["tag", "-f", "-a", tag, "-m", tag], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(chalk.red("\nFailed to recreate tag\n"));
    process.exit(1);
  }
}

/**
 * Pushes the amended commit and tag to origin.
 * Uses --force-with-lease for the commit (safe force) and --force for the tag.
 */
export function pushToRemote(tag: string): void {
  console.log(chalk.cyan("\nPushing changes to remote...\n"));

  const pushResult = sync("git", ["push", "origin", "HEAD", "--force-with-lease"], { stdio: "inherit" });
  if (pushResult.status !== 0) {
    console.error(chalk.red("\nFailed to push commit\n"));
    process.exit(1);
  }

  const pushTagResult = sync("git", ["push", "origin", tag, "--force"], { stdio: "inherit" });
  if (pushTagResult.status !== 0) {
    console.error(chalk.red("\nFailed to push tag\n"));
    process.exit(1);
  }
}
