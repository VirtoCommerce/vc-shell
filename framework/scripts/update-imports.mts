import fs from "fs-extra";
import path, { dirname } from "path";
import chalk from "chalk";
import { globby } from "globby";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRAMEWORK_DIR = path.resolve(__dirname, "..");

interface DependencyNode {
  file: string;
  imports: Set<string>;
}

function buildDependencyGraph(files: string[], importMap: Map<string, DependencyNode>): Map<string, DependencyNode> {
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const imports = new Set<string>();

    // Извлекаем все импорты из файла
    const importMatches = content.matchAll(/from\s+['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]/g);
    for (const match of importMatches) {
      const importPath = match[1];
      if (importPath.startsWith("@/")) {
        imports.add(importPath.slice(2));
      } else {
        const absolutePath = path.resolve(path.dirname(file), importPath);
        const frameworkRelativePath = path.relative(FRAMEWORK_DIR, absolutePath).replace(/\\/g, "/");
        if (!frameworkRelativePath.startsWith("..")) {
          imports.add(frameworkRelativePath);
        }
      }
    }

    const relativePath = path.relative(FRAMEWORK_DIR, file).replace(/\\/g, "/");
    importMap.set(relativePath, { file, imports });
  }
  return importMap;
}

function detectCycles(graph: Map<string, DependencyNode>): Set<string[]> {
  const cycles = new Set<string[]>();
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[] = []): void {
    if (stack.has(node)) {
      const cycle = path.slice(path.indexOf(node));
      cycles.add(cycle);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);
    path.push(node);

    const nodeData = graph.get(node);
    if (nodeData) {
      for (const imp of nodeData.imports) {
        dfs(imp, [...path]);
      }
    }

    stack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node);
  }

  return cycles;
}

async function updateImports() {
  try {
    const files = await globby(["**/*.{ts,vue}", "!dist/**", "!node_modules/**", "!scripts/**", "!**/tests/**"], {
      cwd: FRAMEWORK_DIR,
      absolute: true,
    });

    console.log(chalk.cyan("\nAnalyzing imports and dependencies...\n"));

    // Строим граф зависимостей
    const dependencyGraph = buildDependencyGraph(files, new Map());

    // Ищем циклы
    const cycles = detectCycles(dependencyGraph);

    if (cycles.size > 0) {
      console.log(chalk.yellow("\nDetected circular dependencies:"));
      for (const cycle of cycles) {
        console.log(chalk.red("\nCircular dependency chain:"));
        console.log(cycle.join(" ->\n") + " -> " + cycle[0]);

        // Предлагаем решение
        console.log(chalk.yellow("\nSuggested solutions:"));
        console.log("1. Create a separate utility module for shared functionality");
        console.log("2. Use dependency injection instead of direct imports");
        console.log("3. Restructure the modules to avoid circular dependencies");
      }
    }

    let totalReplacements = 0;

    for (const file of files) {
      let content = await fs.readFile(file, "utf8");
      const originalContent = content;

      // Заменяем относительные импорты на импорты с @
      content = content.replace(/from\s+['"]\.\.?\/.*?['"]/g, (match) => {
        const importPath = match.slice(6, -1);
        const absolutePath = path.resolve(path.dirname(file), importPath);
        const frameworkRelativePath = path.relative(FRAMEWORK_DIR, absolutePath).replace(/\\/g, "/");

        if (frameworkRelativePath.startsWith("..")) {
          return match;
        }

        // Проверяем, не создаст ли новый импорт циклическую зависимость
        const currentFile = path.relative(FRAMEWORK_DIR, file).replace(/\\/g, "/");
        const newImport = frameworkRelativePath;

        const tempGraph = new Map(dependencyGraph);
        const currentNode = tempGraph.get(currentFile);
        if (currentNode) {
          currentNode.imports.add(newImport);
          tempGraph.set(currentFile, currentNode);

          const newCycles = detectCycles(tempGraph);
          if (newCycles.size > dependencyGraph.size) {
            console.log(
              chalk.yellow(`\nSkipping import replacement in ${currentFile} to avoid creating new circular dependency`),
            );
            return match;
          }
        }

        totalReplacements++;
        return `from '@/${frameworkRelativePath}'`;
      });

      if (content !== originalContent) {
        await fs.writeFile(file, content, "utf8");
        console.log(chalk.green(`Updated imports in: ${path.relative(FRAMEWORK_DIR, file)}`));
      }
    }

    console.log(chalk.cyan(`\nTotal replacements made: ${totalReplacements}`));
    if (cycles.size === 0) {
      console.log(chalk.green("\nNo circular dependencies detected!"));
    }
    console.log(chalk.green("\nImport updates completed successfully!"));
  } catch (error) {
    console.error(chalk.red("\nError updating imports:"), error);
    process.exit(1);
  }
}

updateImports();
