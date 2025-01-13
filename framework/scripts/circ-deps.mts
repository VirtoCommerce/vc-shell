import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { globby } from "globby";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");

interface DependencyNode {
  file: string;
  imports: Set<string>;
}

interface CyclicDependency {
  cycle: string[];
  files: Set<string>;
}

class DependencyAnalyzer {
  private graph: Map<string, DependencyNode> = new Map();
  private cycles: CyclicDependency[] = [];

  async analyze(directory: string) {
    console.log(chalk.cyan("\nAnalyzing project dependencies...\n"));

    const files = await this.findFiles(directory);
    await this.buildDependencyGraph(files);
    this.findCycles();
    this.reportResults();
  }

  private async findFiles(directory: string): Promise<string[]> {
    const files = await globby(
      [
        "**/*.{ts,vue,js,jsx,tsx}",
        "!dist/**",
        "!node_modules/**",
        "!scripts/**",
        "!**/tests/**",
        "!**/*.d.ts",
        "!**/*.test.*",
        "!**/*.spec.*",
      ],
      {
        cwd: directory,
        absolute: true,
      }
    );

    console.log(chalk.gray(`Found ${files.length} files to analyze`));
    return files;
  }

  private async buildDependencyGraph(files: string[]) {
    for (const file of files) {
      const content = await fs.readFile(file, "utf8");
      const imports = this.extractImports(content);

      const relativePath = this.normalizeFilePath(file);
      this.graph.set(relativePath, { file, imports });
    }
  }

  private extractImports(content: string): Set<string> {
    const imports = new Set<string>();

    // Поиск всех типов импортов
    const importPatterns = [
      /from\s+['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]/g,  // ES6 imports
      /import\s*\(\s*['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]\s*\)/g,  // Dynamic imports
      /require\s*\(\s*['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]\s*\)/g,  // CommonJS requires
    ];

    for (const pattern of importPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const importPath = match[1];
        const normalizedPath = this.normalizeImportPath(importPath);
        if (normalizedPath) {
          imports.add(normalizedPath);
        }
      }
    }

    return imports;
  }

  private normalizeImportPath(importPath: string): string | null {
    if (importPath.startsWith('@/')) {
      return importPath.slice(2);
    }
    // Относительные пути обрабатываются в buildDependencyGraph
    return null;
  }

  private normalizeFilePath(filePath: string): string {
    return path.relative(PROJECT_DIR, filePath).replace(/\\/g, "/");
  }

  private findCycles() {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string, path: string[] = []): void => {
      if (stack.has(node)) {
        const cycle = path.slice(path.indexOf(node));
        this.addCycle(cycle);
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      stack.add(node);
      path.push(node);

      const nodeData = this.graph.get(node);
      if (nodeData) {
        for (const imp of nodeData.imports) {
          dfs(imp, [...path]);
        }
      }

      stack.delete(node);
    };

    for (const node of this.graph.keys()) {
      dfs(node);
    }
  }

  private addCycle(cycle: string[]) {
    const files = new Set(cycle);

    // Проверяем, не является ли этот цикл подмножеством уже найденного
    const isSubset = this.cycles.some(existing =>
      cycle.every(file => existing.files.has(file))
    );

    if (!isSubset) {
      this.cycles.push({ cycle, files });
    }
  }

  private reportResults() {
    if (this.cycles.length === 0) {
      console.log(chalk.green("\n✓ No circular dependencies detected!"));
      return;
    }

    console.log(chalk.red(`\n✗ Found ${this.cycles.length} circular dependencies:\n`));

    this.cycles.forEach((dependency, index) => {
      console.log(chalk.yellow(`\nCircular Dependency #${index + 1}:`));
      console.log(chalk.red(dependency.cycle.join(" ->\n") + " -> " + dependency.cycle[0]));

      console.log(chalk.yellow("\nSuggested solutions:"));
      this.suggestSolutions(dependency);
      console.log("\n" + chalk.gray("─".repeat(80)));
    });

    process.exit(1);
  }

  private suggestSolutions(dependency: CyclicDependency) {
    const commonPatterns = this.detectCommonPatterns(dependency);

    commonPatterns.forEach(pattern => {
      switch (pattern) {
        case "shared-utils":
          console.log("• Create a separate utilities module for shared functionality");
          console.log("  Example: Move shared code to '@/utilities' or '@/shared/utilities'");
          break;

        case "component-service":
          console.log("• Use dependency injection instead of direct imports");
          console.log("  Example: Inject services through Vue's provide/inject system");
          break;

        case "type-dependency":
          console.log("• Move shared types to a separate types module");
          console.log("  Example: Create '@/types' directory for shared interfaces");
          break;

        default:
          console.log("• Consider restructuring the modules to avoid circular dependencies");
          console.log("• Use event bus or state management for cross-component communication");
      }
    });
  }

  private detectCommonPatterns(dependency: CyclicDependency): string[] {
    const patterns: string[] = [];
    const files = Array.from(dependency.files);

    // Проверяем паттерны по путям файлов
    const hasUtils = files.some(f => f.includes("/utilities/") || f.includes("/utils/"));
    const hasComponents = files.some(f => f.includes("/components/"));
    const hasServices = files.some(f => f.includes("/services/"));
    const hasTypes = files.some(f => f.includes(".types.") || f.includes("/types/"));

    if (hasUtils) patterns.push("shared-utils");
    if (hasComponents && hasServices) patterns.push("component-service");
    if (hasTypes) patterns.push("type-dependency");

    return patterns;
  }
}

async function checkCircularDependencies() {
  try {
    const analyzer = new DependencyAnalyzer();
    await analyzer.analyze(PROJECT_DIR);
  } catch (error) {
    console.error(chalk.red("\nError analyzing dependencies:"), error);
    process.exit(1);
  }
}

checkCircularDependencies();
