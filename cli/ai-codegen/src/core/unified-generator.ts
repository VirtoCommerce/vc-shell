import fs from "node:fs";
import path from "node:path";
import type { UIPlan, Blade } from "./validator.js";
import { TemplateAdapter, type AdaptConfig, type Column, type Field } from "./template-adapter.js";
import { ComposableGenerator, type ListComposableConfig, type DetailsComposableConfig } from "./composable-generator.js";
import { LocaleGenerator } from "./locale-generator.js";
import { ModuleRegistrar } from "./module-registrar.js";
import { CodeGenerator, type NamingConfig } from "./code-generator.js";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GeneratedFile {
  path: string;
  content: string;
  lines: number;
}

export interface GeneratedModule {
  files: GeneratedFile[];
  summary: {
    blades: number;
    composables: number;
    locales: number;
    registered: boolean;
  };
}

/**
 * UnifiedCodeGenerator - main code generation engine
 *
 * This orchestrates all code generation components:
 * - Template adaptation via AST
 * - Composable generation with mock data
 * - Locale generation
 * - Module registration
 */
export class UnifiedCodeGenerator {
  private templateAdapter: TemplateAdapter;
  private composableGenerator: ComposableGenerator;
  private localeGenerator: LocaleGenerator;
  private moduleRegistrar: ModuleRegistrar;
  private codeGenerator: CodeGenerator;

  constructor() {
    this.templateAdapter = new TemplateAdapter();
    this.composableGenerator = new ComposableGenerator();
    this.localeGenerator = new LocaleGenerator();
    this.moduleRegistrar = new ModuleRegistrar();
    this.codeGenerator = new CodeGenerator();
  }

  /**
   * Generate complete module from UI-Plan
   */
  async generateModule(plan: UIPlan, cwd: string): Promise<GeneratedModule> {
    const files: GeneratedFile[] = [];
    const naming = this.codeGenerator.createNamingConfig(plan.module);
    const modulePath = path.join(cwd, "src", "modules", plan.module);

    // Create module structure
    await this.createModuleStructure(modulePath);

    // Generate blades and composables for each blade in plan
    const bladeConfigs: Array<{ type: "list" | "details"; columns?: Column[]; fields?: Field[] }> = [];

    for (const blade of plan.blades) {
      // Determine blade type from layout
      const bladeType = blade.layout === "grid" ? "list" : "details";

      // Generate blade
      const bladeFile = await this.generateBlade(blade, plan, naming, modulePath);
      files.push(bladeFile);

      // Generate composable
      const composableFile = await this.generateComposable(blade, naming, modulePath);
      files.push(composableFile);

      // Track for locale generation
      if (bladeType === "list") {
        bladeConfigs.push({
          type: "list",
          columns: this.extractColumnsFromBlade(blade),
        });
      } else {
        bladeConfigs.push({
          type: "details",
          fields: this.extractFieldsFromBlade(blade),
        });
      }
    }

    // Generate locales
    const localeFiles = await this.generateLocales(naming, bladeConfigs, modulePath);
    files.push(...localeFiles);

    // Generate module files (index.ts, pages/index.ts)
    const moduleFiles = await this.generateModuleFiles(plan, naming, modulePath);
    files.push(...moduleFiles);

    // Register module in main.ts
    let registered = false;
    try {
      await this.moduleRegistrar.registerModule(plan.module, naming, cwd);
      registered = true;
    } catch (error) {
      console.warn(`Warning: Could not register module in main.ts: ${error}`);
    }

    return {
      files,
      summary: {
        blades: plan.blades.length,
        composables: plan.blades.length,
        locales: 2, // en.json + index.ts
        registered,
      },
    };
  }

  /**
   * Generate single blade
   */
  private async generateBlade(blade: Blade, plan: UIPlan, naming: NamingConfig, modulePath: string): Promise<GeneratedFile> {
    const bladeType = blade.layout === "grid" ? "list" : "details";

    // Load template
    const template = this.loadTemplate(bladeType);

    // Prepare adapt config
    const adaptConfig: AdaptConfig = {
      naming,
      features: [],
    };

    if (bladeType === "list") {
      adaptConfig.columns = this.extractColumnsFromBlade(blade);
    } else {
      adaptConfig.fields = this.extractFieldsFromBlade(blade);
    }

    // Adapt template
    const code = bladeType === "list"
      ? this.templateAdapter.adaptListTemplate(template, adaptConfig)
      : this.templateAdapter.adaptDetailsTemplate(template, adaptConfig);

    // Determine file name
    const fileName = bladeType === "list"
      ? `${naming.entityPluralKebab}-list.vue`
      : `${naming.entitySingularKebab}-details.vue`;

    const filePath = path.join(modulePath, "pages", fileName);

    return {
      path: filePath,
      content: code,
      lines: code.split("\n").length,
    };
  }

  /**
   * Generate composable for blade
   */
  private async generateComposable(blade: Blade, naming: NamingConfig, modulePath: string): Promise<GeneratedFile> {
    const bladeType = blade.layout === "grid" ? "list" : "details";

    let code: string;
    let fileName: string;

    if (bladeType === "list") {
      const config: ListComposableConfig = {
        naming,
        columns: this.extractColumnsFromBlade(blade),
      };
      code = this.composableGenerator.generateListComposable(config);
      fileName = `use${naming.entitySingularPascal}List.ts`;
    } else {
      const config: DetailsComposableConfig = {
        naming,
        fields: this.extractFieldsFromBlade(blade),
      };
      code = this.composableGenerator.generateDetailsComposable(config);
      fileName = `use${naming.entitySingularPascal}Details.ts`;
    }

    const filePath = path.join(modulePath, "composables", fileName);

    return {
      path: filePath,
      content: code,
      lines: code.split("\n").length,
    };
  }

  /**
   * Generate locale files
   */
  private async generateLocales(
    naming: NamingConfig,
    bladeConfigs: Array<{ type: "list" | "details"; columns?: Column[]; fields?: Field[] }>,
    modulePath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate en.json
    const localeData = this.localeGenerator.generateModuleLocales(naming, bladeConfigs);
    const enJsonContent = JSON.stringify(localeData, null, 2);

    files.push({
      path: path.join(modulePath, "locales", "en.json"),
      content: enJsonContent,
      lines: enJsonContent.split("\n").length,
    });

    // Generate index.ts
    const indexContent = this.localeGenerator.generateLocalesIndex();

    files.push({
      path: path.join(modulePath, "locales", "index.ts"),
      content: indexContent,
      lines: indexContent.split("\n").length,
    });

    return files;
  }

  /**
   * Generate module structure files (index.ts, pages/index.ts)
   */
  private async generateModuleFiles(plan: UIPlan, naming: NamingConfig, modulePath: string): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate module index.ts
    const moduleIndex = `import * as pages from "./pages";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export * from "./pages";
export * from "./composables";
`;

    files.push({
      path: path.join(modulePath, "index.ts"),
      content: moduleIndex,
      lines: moduleIndex.split("\n").length,
    });

    // Generate pages/index.ts
    const pageExports = plan.blades.map((blade, index) => {
      const bladeType = blade.layout === "grid" ? "List" : "Details";
      const componentName = `${naming.entitySingularPascal}${bladeType}`;
      const fileName = blade.layout === "grid"
        ? `${naming.entityPluralKebab}-list.vue`
        : `${naming.entitySingularKebab}-details.vue`;

      return `export { default as ${componentName} } from "./${fileName.replace(".vue", "")}";`;
    }).join("\n");

    files.push({
      path: path.join(modulePath, "pages", "index.ts"),
      content: pageExports + "\n",
      lines: pageExports.split("\n").length,
    });

    // Generate composables/index.ts
    const composableExports = plan.blades.map((blade) => {
      const bladeType = blade.layout === "grid" ? "List" : "Details";
      const composableName = `use${naming.entitySingularPascal}${bladeType}`;

      return `export { default as ${composableName} } from "./${composableName}";`;
    }).join("\n");

    files.push({
      path: path.join(modulePath, "composables", "index.ts"),
      content: composableExports + "\n",
      lines: composableExports.split("\n").length,
    });

    return files;
  }

  /**
   * Create module directory structure
   */
  private async createModuleStructure(modulePath: string): Promise<void> {
    const directories = [
      modulePath,
      path.join(modulePath, "pages"),
      path.join(modulePath, "composables"),
      path.join(modulePath, "locales"),
      path.join(modulePath, "components"),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Load blade template
   */
  private loadTemplate(type: "list" | "details"): string {
    // Try to load from examples/templates
    const templatesPath = __dirname.includes("/dist")
      ? path.join(__dirname, "..", "examples", "templates")
      : path.join(__dirname, "..", "..", "src", "examples", "templates");

    const templateFile = type === "list" ? "list-simple.vue" : "details-simple.vue";
    const templatePath = path.join(templatesPath, templateFile);

    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, "utf-8");
    }

    // Fallback: generate minimal template
    return this.generateMinimalTemplate(type);
  }

  /**
   * Generate minimal template as fallback
   */
  private generateMinimalTemplate(type: "list" | "details"): string {
    if (type === "list") {
      return `<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcTable
      :items="items"
      :columns="columns"
      :loading="loading"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useEntityList } from "../composables/useEntityList";

defineOptions({
  name: "EntityList",
  url: "/entities",
  isWorkspace: true,
  menuItem: {
    title: "ENTITIES.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});

const props = withDefaults(defineProps<{ expanded?: boolean; closable?: boolean }>(), {
  expanded: true,
  closable: true,
});

const { items, loading } = useEntityList();
const title = computed(() => "Entities");
const bladeToolbar = ref([]);
const columns = ref([
  { id: "name", title: "Name" },
]);

function onItemClick(item: any) {
  console.log("Item clicked:", item);
}
</script>
`;
    } else {
      return `<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcContainer>
      <VcForm>
        <Field v-slot="{ field }" name="name" rules="required">
          <VcInput v-bind="field" label="Name" required />
        </Field>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Field } from "vee-validate";

defineOptions({
  name: "EntityDetails",
  url: "/entity",
});

const title = computed(() => "Entity Details");
const bladeToolbar = ref([]);
</script>
`;
    }
  }

  /**
   * Extract columns from blade definition
   */
  private extractColumnsFromBlade(blade: Blade): Column[] {
    // Try to get columns from blade components
    const tableComponent = blade.components?.find(c => c.type === "VcTable");

    if (tableComponent?.columns) {
      return tableComponent.columns.map(col => ({
        key: col.key,
        title: col.title,
        type: (col as any).type as string | undefined,
        sortable: col.sortable,
        width: col.width,
      }));
    }

    // Default columns
    return [
      { key: "name", title: "Name", sortable: true },
      { key: "createdDate", title: "Created", type: "date-ago", sortable: true },
    ];
  }

  /**
   * Extract fields from blade definition
   */
  private extractFieldsFromBlade(blade: Blade): Field[] {
    // Try to get fields from blade components
    const formComponent = blade.components?.find(c => c.type === "VcForm");

    if (formComponent?.fields) {
      return formComponent.fields.map(field => ({
        key: field.key,
        as: field.as || "VcInput",
        label: field.label,
        type: (field as any).type as string | undefined,
        validation: field.rules?.join("|"),
        required: field.required,
        placeholder: field.placeholder,
      }));
    }

    // Default fields
    return [
      { key: "name", as: "VcInput", label: "Name", type: "text", required: true },
    ];
  }
}

