import fs from "node:fs";
import path from "node:path";
import { kebabCase, camelCase, upperFirst, snakeCase } from "lodash-es";
import type { UIPlan, Blade } from "./validator.js";
import { FileWriter } from "./file-writer.js";

export interface NamingConfig {
  moduleName: string;
  moduleNamePascal: string;
  moduleNameCamel: string;
  moduleNameUpperSnake: string;
  entitySingular: string;
  entitySingularPascal: string;
  entitySingularCamel: string;
  entitySingularKebab: string;
  entityPlural: string;
  entityPluralPascal: string;
  entityPluralCamel: string;
  entityPluralKebab: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratorOptions {
  plan: UIPlan;
  cwd: string;
  dryRun?: boolean;
  generateStories?: boolean;
  generateTests?: boolean;
  verbose?: boolean;
}

/**
 * CodeGenerator for AI-based code generation
 *
 * This generator expects to receive complete, AI-generated code strings
 * and writes them to the appropriate locations in the project.
 *
 * Unlike template-based generators, this does not use Handlebars or other
 * template engines. The AI generates complete Vue SFC files, TypeScript files,
 * and JSON files based on the UI-Plan and blade patterns.
 */
export class CodeGenerator {
  private fileWriter: FileWriter;

  constructor() {
    this.fileWriter = new FileWriter();
  }

  /**
   * Generate code from UI-Plan
   *
   * Note: This method creates the module structure but expects the actual
   * code content to be provided by AI through the MCP server workflow.
   */
  async generate(options: GeneratorOptions): Promise<void> {
    const { plan, cwd, dryRun = false, verbose = false } = options;

    const modulePath = path.join(cwd, "src", "modules", plan.module);

    // Create naming configuration
    const naming = this.createNamingConfig(plan.module);

    // Create module structure
    await this.createModuleStructure(modulePath, { dryRun, verbose });

    // Generate module index (this is simple enough to generate directly)
    await this.generateModuleIndex(modulePath, { dryRun, verbose });

    // Print summary and registration instructions
    if (!dryRun) {
      const summary = this.fileWriter.getSummary();
      console.log(`\n✅ Module structure created: ${modulePath}`);
      console.log(`✅ Generated ${summary.filesWritten.length} files`);
      console.log(`✅ Updated ${summary.filesUpdated.length} files`);
      console.log(`\nℹ️  Use AI via MCP to generate blades, composables, and locales`);
      
      // Print registration instructions
      this.printRegistrationInstructions(plan.module, naming);
    }
  }

  /**
   * Write AI-generated files to disk
   *
   * This method is called by the MCP workflow after AI generates the code.
   */
  async writeGeneratedFiles(
    files: GeneratedFile[],
    options: { dryRun?: boolean; verbose?: boolean } = {}
  ): Promise<void> {
    for (const file of files) {
      await this.fileWriter.writeFile(file.path, file.content, {
        dryRun: options.dryRun || false,
        verbose: options.verbose || false,
      });
    }
  }

  /**
   * Create naming configuration for a module
   */
  createNamingConfig(moduleName: string): NamingConfig {
    const moduleNameKebab = kebabCase(moduleName);
    const moduleNamePascal = upperFirst(camelCase(moduleName));
    const moduleNameCamel = camelCase(moduleName);
    const moduleNameUpperSnake = snakeCase(moduleName).toUpperCase();

    // Try to get singular/plural forms
    const entitySingular = moduleName.endsWith("s") ? moduleName.slice(0, -1) : moduleName;
    const entityPlural = moduleName.endsWith("s") ? moduleName : moduleName + "s";

    return {
      moduleName: moduleNameKebab,
      moduleNamePascal,
      moduleNameCamel,
      moduleNameUpperSnake,
      entitySingular,
      entitySingularPascal: upperFirst(camelCase(entitySingular)),
      entitySingularCamel: camelCase(entitySingular),
      entitySingularKebab: kebabCase(entitySingular),
      entityPlural,
      entityPluralPascal: upperFirst(camelCase(entityPlural)),
      entityPluralCamel: camelCase(entityPlural),
      entityPluralKebab: kebabCase(entityPlural),
    };
  }

  /**
   * Get expected file paths for a UI-Plan
   *
   * This helps AI know where to place generated files
   */
  getExpectedFilePaths(plan: UIPlan, cwd: string): Map<string, string> {
    const modulePath = path.join(cwd, "src", "modules", plan.module);
    const naming = this.createNamingConfig(plan.module);
    const filePaths = new Map<string, string>();

    for (const blade of plan.blades) {
      // Blade file
      const bladeFileName =
        blade.layout === "grid"
          ? `${naming.entityPluralKebab}.vue`
          : `${naming.entitySingularKebab}-details.vue`;
      const bladePath = path.join(modulePath, "pages", bladeFileName);
      filePaths.set(`blade:${blade.id}`, bladePath);

      // Composable file
      const composableFileName =
        blade.layout === "grid"
          ? `use${naming.entitySingularPascal}List.ts`
          : `use${naming.entitySingularPascal}Details.ts`;
      const composablePath = path.join(modulePath, "composables", composableFileName);
      filePaths.set(`composable:${blade.id}`, composablePath);
    }

    // Locales
    filePaths.set("locales:en", path.join(modulePath, "locales", "en.json"));
    filePaths.set("locales:index", path.join(modulePath, "locales", "index.ts"));

    // Pages index
    filePaths.set("pages:index", path.join(modulePath, "pages", "index.ts"));

    return filePaths;
  }

  private async createModuleStructure(modulePath: string, options: { dryRun: boolean; verbose: boolean }) {
    const directories = [
      modulePath,
      path.join(modulePath, "pages"),
      path.join(modulePath, "composables"),
      path.join(modulePath, "locales"),
      path.join(modulePath, "components"),
      path.join(modulePath, "components", "widgets"),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir) && !options.dryRun) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async generateModuleIndex(
    modulePath: string,
    options: { dryRun: boolean; verbose: boolean }
  ) {
    const content = `import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export * from "./pages";
export * from "./composables";
`;

    const filePath = path.join(modulePath, "index.ts");
    await this.fileWriter.writeFile(filePath, content, options);
  }

  private printRegistrationInstructions(moduleName: string, naming: NamingConfig) {
    const moduleImportName = `${naming.moduleNamePascal}Module`;
    
    console.log(`\n📋 Module Registration`);
    console.log(`\n🤖 If using AI (Cursor + MCP):`);
    console.log(`   AI will automatically register the module in src/main.ts`);
    console.log(`   No manual steps required!`);
    console.log(`\n✏️  If registering manually:`);
    console.log(`\n   1. Import: import ${moduleImportName} from "./modules/${moduleName}";`);
    console.log(`   2. Register: .use(${moduleImportName}, { router }) before .use(router)`);
    console.log(`\n   See docs/MODULE_REGISTRATION.md for details`);
  }

  getSummary() {
    return this.fileWriter.getSummary();
  }
}
