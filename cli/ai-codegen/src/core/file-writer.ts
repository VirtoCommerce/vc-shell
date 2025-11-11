import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

export interface FileToWrite {
  path: string;
  content: string;
  operation: "create" | "update" | "append";
}

export interface WriteOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export class FileWriter {
  private filesWritten: string[] = [];
  private filesUpdated: string[] = [];

  /**
   * Write or update a file
   */
  async writeFile(
    filePath: string,
    content: string,
    options: WriteOptions = {}
  ): Promise<void> {
    const { dryRun = false, verbose = false } = options;

    const exists = fs.existsSync(filePath);
    const operation = exists ? "update" : "create";

    if (dryRun) {
      if (verbose) {
        console.log(chalk.yellow(`[DRY RUN] Would ${operation}: ${filePath}`));
      }
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, content, "utf-8");

    if (operation === "create") {
      this.filesWritten.push(filePath);
      if (verbose) {
        console.log(chalk.green(`✓ Created: ${filePath}`));
      }
    } else {
      this.filesUpdated.push(filePath);
      if (verbose) {
        console.log(chalk.blue(`✓ Updated: ${filePath}`));
      }
    }
  }

  /**
   * Append content to a file
   */
  async appendFile(
    filePath: string,
    content: string,
    options: WriteOptions = {}
  ): Promise<void> {
    const { dryRun = false, verbose = false } = options;

    if (dryRun) {
      if (verbose) {
        console.log(chalk.yellow(`[DRY RUN] Would append to: ${filePath}`));
      }
      return;
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    fs.appendFileSync(filePath, content, "utf-8");
    this.filesUpdated.push(filePath);

    if (verbose) {
      console.log(chalk.blue(`✓ Appended to: ${filePath}`));
    }
  }

  /**
   * Update a specific line or section in a file
   */
  async updateFileSection(
    filePath: string,
    searchPattern: RegExp,
    replacement: string,
    options: WriteOptions = {}
  ): Promise<boolean> {
    const { dryRun = false, verbose = false } = options;

    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const updated = content.replace(searchPattern, replacement);

    if (content === updated) {
      return false; // No changes
    }

    if (dryRun) {
      if (verbose) {
        console.log(chalk.yellow(`[DRY RUN] Would update section in: ${filePath}`));
      }
      return true;
    }

    fs.writeFileSync(filePath, updated, "utf-8");
    this.filesUpdated.push(filePath);

    if (verbose) {
      console.log(chalk.blue(`✓ Updated section in: ${filePath}`));
    }

    return true;
  }

  /**
   * Merge JSON content into existing JSON file
   */
  async mergeJsonFile(
    filePath: string,
    newData: Record<string, unknown>,
    options: WriteOptions = {}
  ): Promise<void> {
    const { dryRun = false, verbose = false } = options;

    let existingData: Record<string, unknown> = {};

    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const merged = this.deepMerge(existingData, newData);

    if (dryRun) {
      if (verbose) {
        console.log(chalk.yellow(`[DRY RUN] Would merge JSON: ${filePath}`));
      }
      return;
    }

    await this.writeFile(filePath, JSON.stringify(merged, null, 2) + "\n", {
      dryRun,
      verbose,
    });
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const output = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        output[key] = this.deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }

  /**
   * Get summary of operations
   */
  getSummary(): { filesWritten: string[]; filesUpdated: string[] } {
    return {
      filesWritten: [...new Set(this.filesWritten)],
      filesUpdated: [...new Set(this.filesUpdated)],
    };
  }

  /**
   * Reset summary
   */
  reset(): void {
    this.filesWritten = [];
    this.filesUpdated = [];
  }
}

