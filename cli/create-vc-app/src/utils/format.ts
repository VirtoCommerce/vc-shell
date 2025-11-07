import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import { default as chalk } from "chalk";

/**
 * Formats a file using Prettier
 * Automatically detects parser based on file extension and uses project's .prettierrc
 *
 * @param filePath - Path to file to format
 * @returns Promise that resolves when formatting is complete
 */
export async function formatFile(filePath: string): Promise<void> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath);

    // Determine parser based on file extension
    let parser: prettier.BuiltInParserName = "typescript";
    if (ext === ".vue") {
      parser = "vue";
    } else if (ext === ".json") {
      parser = "json";
    } else if (ext === ".md") {
      parser = "markdown";
    } else if (ext === ".css" || ext === ".scss") {
      parser = "css";
    } else if (ext === ".html") {
      parser = "html";
    } else if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
      parser = "babel";
    } else if (ext === ".ts" || ext === ".mts" || ext === ".cts") {
      parser = "typescript";
    }

    // Try to find prettier config in project directory
    // Search upwards from the file location to find project root
    let config: prettier.Options | null = null;
    try {
      config = await prettier.resolveConfig(filePath, {
        editorconfig: true,
      });
    } catch (error) {
      // Config not found or error reading it
    }

    // Default config that matches typical VC Shell projects
    const defaultConfig: prettier.Options = {
      endOfLine: "auto", // Changed from "lf" to "auto"
      singleAttributePerLine: true, // Added for Vue files
    };

    // Merge configs with project config taking precedence
    const finalConfig: prettier.Options = {
      ...defaultConfig,
      ...config,
      parser, // Always use detected parser
    };

    const formatted = await prettier.format(content, finalConfig);

    fs.writeFileSync(filePath, formatted, "utf-8");
  } catch (error: any) {
    console.warn(chalk.yellow(`⚠️  Warning: Could not format ${filePath}`));
    console.warn(chalk.yellow(`    ${error.message}`));
  }
}

/**
 * Formats multiple files
 *
 * @param filePaths - Array of file paths to format
 * @returns Promise that resolves when all files are formatted
 */
export async function formatFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    await formatFile(filePath);
  }
}

/**
 * Formats all files in a directory recursively
 *
 * @param dirPath - Directory path
 * @param extensions - File extensions to format (default: .ts, .vue, .js, .json)
 * @returns Promise that resolves when all files are formatted
 */
export async function formatDirectory(
  dirPath: string,
  extensions: string[] = [".ts", ".vue", ".js", ".json"]
): Promise<void> {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await formatDirectory(filePath, extensions);
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      await formatFile(filePath);
    }
  }
}

