import fs from "node:fs";
import path from "node:path";
import type { UIPlan, Blade } from "./validator.js";
import { TemplateAdapter, type AdaptConfig, type Column, type Field } from "./template-adapter.js";
import {
  ComposableGenerator,
  type ListComposableConfig,
  type DetailsComposableConfig,
} from "./composable-generator.js";
import { LocaleGenerator } from "./locale-generator.js";
import { ModuleRegistrar } from "./module-registrar.js";
import { CodeGenerator, type NamingConfig } from "./code-generator.js";
import { AICodeGenerator } from "./ai-code-generator.js";
import { CodeValidator } from "./code-validator.js";
import { getGenerationRulesProvider } from "./generation-rules.js";
import { LogicPlanner, type BladeLogic, type ComposableDefinition } from "./logic-planner.js";
import { BladeComposer } from "./blade-composer.js";
import { SmartCodeGenerator } from "./smart-generator.js";
import type { BladeGenerationContext } from "../types/blade-context.js";
import { fileURLToPath } from "node:url";
import { camelCase, upperFirst, kebabCase } from "lodash-es";

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
    mode?: "ai-full";
  };
}

export type GenerationMode = "ai-full";

/**
 * UnifiedCodeGenerator - main code generation engine
 *
 * This orchestrates all code generation components:
 * - AI-first generation (primary)
 * - Template adaptation via AST (fallback)
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
  private aiGenerator: AICodeGenerator;
  private validator: CodeValidator;
  private rulesProvider: ReturnType<typeof getGenerationRulesProvider>;
  private logicPlanner: LogicPlanner;
  private bladeComposer: BladeComposer;
  private smartGenerator: SmartCodeGenerator;

  constructor() {
    this.templateAdapter = new TemplateAdapter();
    this.composableGenerator = new ComposableGenerator();
    this.localeGenerator = new LocaleGenerator();
    this.moduleRegistrar = new ModuleRegistrar();
    this.codeGenerator = new CodeGenerator();
    this.aiGenerator = new AICodeGenerator();
    this.validator = new CodeValidator();
    this.rulesProvider = getGenerationRulesProvider();
    this.logicPlanner = new LogicPlanner();
    this.bladeComposer = new BladeComposer();
    this.smartGenerator = new SmartCodeGenerator();
  }

  private normalizeBladeLogic(logic?: Blade["logic"]): BladeLogic | undefined {
    if (!logic) return undefined;

    return {
      handlers: logic.handlers || {},
      toolbar: (logic.toolbar || []).map((action) => ({
        ...action,
        icon: action.icon || "",
      })),
      state: logic.state || {},
    };
  }

  /**
   * Generate complete module from UI-Plan
   */
  async generateModule(
    plan: UIPlan,
    cwd: string,
    options: { writeToDisk?: boolean; dryRun?: boolean; mode?: GenerationMode } = {},
  ): Promise<GeneratedModule> {
    const { writeToDisk = false, dryRun = false, mode = "ai-full" } = options;
    const files: GeneratedFile[] = [];
    const moduleNaming = this.codeGenerator.createNamingConfig(plan.module);
    const modulePath = path.join(cwd, "src", "modules", plan.module);

    await this.createModuleStructure(modulePath);

    const bladeContexts: BladeGenerationContext[] = [];

    for (const blade of plan.blades) {
      // Auto-infer logic if not provided
      let logic = this.normalizeBladeLogic(blade.logic);
      if (!logic) {
        logic = this.logicPlanner.inferLogic(blade);
      }
      blade.logic = logic;

      // Auto-infer composable definition if not provided
      if (!blade.composable) {
        blade.composable = this.logicPlanner.inferComposable(blade, {
          entitySingularCamel: moduleNaming.entitySingularCamel,
          entitySingularPascal: moduleNaming.entitySingularPascal,
        });
      }

      const context = this.createBladeContext(blade, moduleNaming, modulePath);
      bladeContexts.push(context);

      const bladeFile = await this.generateBladeWithMode(context, mode);
      files.push(bladeFile);

      const composableFile = await this.generateComposableWithMode(context, mode);
      files.push(composableFile);
    }

    const localeFiles = await this.generateLocales(moduleNaming, bladeContexts, modulePath);
    files.push(...localeFiles);

    const moduleFiles = await this.generateModuleFiles(bladeContexts, modulePath);
    files.push(...moduleFiles);

    const componentFiles = this.generateComponentStubs(bladeContexts, modulePath);
    files.push(...componentFiles);

    let registered = false;
    try {
      await this.moduleRegistrar.registerModule(plan.module, moduleNaming, cwd);
      registered = true;
    } catch (error) {
      console.warn(`Warning: Could not register module in main.ts: ${error}`);
    }

    if (writeToDisk && !dryRun) {
      this.writeFilesToDisk(files);
    }

    return {
      files,
      summary: {
        blades: bladeContexts.length,
        composables: bladeContexts.length,
        locales: 2,
        registered,
        mode: "ai-full",
      },
    };
  }

  /**
   * Generate single blade
   */
  private async generateBlade(context: BladeGenerationContext): Promise<GeneratedFile> {
    const template = this.loadTemplate(context.type, context.blade.features);

    const adaptConfig: AdaptConfig = {
      naming: context.naming,
      columns: context.type === "list" ? context.columns : undefined,
      fields: context.type === "details" ? context.fields : undefined,
      customSlots: context.blade.customSlots,
      features: context.blade.features,
      componentName: context.componentName,
      composableName: context.composableName,
      route: context.route,
      isWorkspace: context.isWorkspace,
      menuTitleKey: context.menuTitleKey,
    };

    const code =
      context.type === "list"
        ? this.templateAdapter.adaptListTemplate(template, adaptConfig)
        : this.templateAdapter.adaptDetailsTemplate(template, adaptConfig);

    return {
      path: context.filePath!,
      content: code,
      lines: code.split("\n").length,
    };
  }

  /**
   * Generate composable for blade
   */
  private async generateComposable(context: BladeGenerationContext): Promise<GeneratedFile> {
    let code: string;

    if (context.type === "list") {
      const config: ListComposableConfig = {
        naming: context.naming,
        columns: context.columns || this.extractColumnsFromBlade(context.blade),
      };
      code = this.composableGenerator.generateListComposable(config);
    } else {
      const config: DetailsComposableConfig = {
        naming: context.naming,
        fields: context.fields || this.extractFieldsFromBlade(context.blade),
      };
      code = this.composableGenerator.generateDetailsComposable(config);
    }

    return {
      path: context.composablePath!,
      content: code,
      lines: code.split("\n").length,
    };
  }

  /**
   * Generate blade with smart strategy selection
   * Uses SmartCodeGenerator to choose best approach based on complexity
   */
  private async generateBladeWithMode(context: BladeGenerationContext, mode: GenerationMode): Promise<GeneratedFile> {
    const bladeGenerationContext = {
      type: context.type,
      entity: context.naming.entitySingularKebab,
      module: context.naming.moduleName,
      naming: context.naming,
      blade: context.blade,
      columns: context.columns,
      fields: context.fields,
      componentName: context.componentName,
      composableName: context.composableName,
      route: context.route,
      isWorkspace: context.isWorkspace,
      menuTitleKey: context.menuTitleKey,
      features: context.blade.features || [],
      logic: context.logic,
      composableDefinition: context.composableDefinition,
      complexity: 0, // ✅ ADDED: Will be calculated by SmartCodeGenerator.decide()
    };

    const decision = await this.smartGenerator.decide(bladeGenerationContext);

    console.log(`\n🎯 Strategy selected for ${context.componentName}: ${decision.strategy.toUpperCase()}`);
    console.log(`   Complexity: ${decision.complexity}/20`);
    console.log(`   Reason: ${decision.reason}`);
    console.log(`   Estimated time: ${decision.estimatedTime}\n`);
    const instructions = await this.smartGenerator.buildInstructions(bladeGenerationContext, decision);
    const content = `<!-- AI-FULL: ${context.componentName} -->\n${instructions}\n`;

    return {
      path: context.filePath!,
      content,
      lines: content.split("\n").length,
    };
  }

  /**
   * Generate blade using pattern composition
   * Uses BladeComposer to compose from multiple patterns
   */
  private async generateBladeWithComposition(context: BladeGenerationContext): Promise<GeneratedFile> {
    // Use BladeComposer to select and compose patterns from file-based pattern library
    const compositionContext = {
      type: context.type,
      entity: context.entity,
      module: context.module,
      naming: context.naming,
      blade: context.blade,
      columns: context.columns,
      fields: context.fields,
      componentName: context.componentName,
      composableName: context.composableName,
      route: context.route,
      isWorkspace: context.isWorkspace,
      menuTitleKey: context.menuTitleKey,
      features: context.blade.features || [],
      logic: context.logic,
      composableDefinition: context.composableDefinition,
      complexity: context.complexity,
    };

    // Let BladeComposer handle pattern selection and composition
    const compositionResult = await this.bladeComposer.compose({
      context: compositionContext,
    });

    const code = this.bladeComposer.composeBlade(compositionContext, compositionResult.selectedPatterns);

    return {
      path: context.filePath || "",
      content: code,
      lines: code.split("\n").length,
    };
  }

  /**
   * Generate composable with AI-first approach
   * NOTE: Removed in favor of MCP-based AI generation via submit_generated_code tool
   */
  private async generateComposableWithMode(
    context: BladeGenerationContext,
    mode: GenerationMode,
  ): Promise<GeneratedFile> {
    const composableNotes = `// AI-FULL: implement ${context.composableName} for ${context.componentName}\n` +
      `// Generate this composable with the same guide used for the blade and submit via submit_generated_code.\n`;

    return {
      path: context.composablePath!,
      content: composableNotes,
      lines: composableNotes.split("\n").length,
    };
  }

  /**
   * Generate locale files
   */
  private async generateLocales(
    naming: NamingConfig,
    contexts: BladeGenerationContext[],
    modulePath: string,
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate en.json
    const bladeConfigs = contexts
      .filter((context) => context.type === "list" || context.type === "details")
      .map((context) => ({
        type: context.type === "page" ? "details" : context.type,
        columns: context.columns,
        fields: context.fields,
      }));

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
  private async generateModuleFiles(contexts: BladeGenerationContext[], modulePath: string): Promise<GeneratedFile[]> {
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
    const pageExports = contexts
      .map((context) => `export { default as ${context.componentName} } from "./${context.fileName}";`)
      .join("\n");

    files.push({
      path: path.join(modulePath, "pages", "index.ts"),
      content: pageExports + "\n",
      lines: pageExports.split("\n").length,
    });

    // Generate composables/index.ts
    const composableExports = contexts
      .filter((context) => Boolean(context.composableFileName))
      .map((context) => {
        const importPath = context.composableFileName!.replace(/\.ts$/, "");
        return `export { default as ${context.composableName} } from "./${importPath}";`;
      })
      .join("\n");

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
  private loadTemplate(type: "list" | "details" | "page", features?: string[]): string {
    const templatesPath = path.join(this.getExamplesPath(), "templates");
    const candidates = this.resolveTemplateCandidates(type, features);

    for (const candidate of candidates) {
      const templatePath = path.join(templatesPath, candidate);
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, "utf-8");
      }
    }

    return this.generateMinimalTemplate(type);
  }

  private resolveTemplateCandidates(type: "list" | "details" | "page", features?: string[]): string[] {
    const options: string[] = [];

    if (type === "page") {
      // Page layout for dashboards
      options.push("page-dashboard.vue");
      return options;
    }

    if (type === "list") {
      if (features?.includes("multiselect")) {
        options.push("list-multiselect.vue");
      } else if (features?.includes("filters")) {
        options.push("list-filters.vue");
      }
      options.push("list-simple.vue");
      return options;
    }

    // Details blade - check for widgets/gallery features
    if (features?.includes("widgets")) {
      options.push("details-widgets.vue");
    }
    if (features?.includes("gallery")) {
      options.push("details-gallery.vue");
    }
    if (features?.includes("validation")) {
      options.push("details-validation.vue");
    }
    options.push("details-simple.vue");
    return options;
  }

  private getExamplesPath(): string {
    return __dirname.includes("/dist")
      ? path.join(__dirname, "..", "examples")
      : path.join(__dirname, "..", "..", "src", "examples");
  }

  /**
   * Generate minimal template as fallback
   */
  private generateMinimalTemplate(type: "list" | "details" | "page"): string {
    if (type === "page") {
      return `<template>
  <VcContainer>
    <DraggableDashboard
      :widgets="widgets"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DraggableDashboard } from "@vc-shell/framework";

const widgets = ref([]);

onMounted(async () => {
  // Load widgets configuration
  widgets.value = [];
});

defineOptions({
  name: "Dashboard",
  url: "/dashboard",
  isWorkspace: true
});

defineExpose({
  widgets,
});
</script>
`;
    } else if (type === "list") {
      return `<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :items="items"
      :columns="columns"
      :loading="loading"
      state-key="uniquie-list-key"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { IParentCallArgs } from "@vc-shell/framework";
import { ref, computed } from "vue";
import { default as useEntityList } from "../composables/useEntityList";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

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

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emits = defineEmits<Emits>();

const { items, loading } = useEntityList();
const title = computed(() => "Entities");
const bladeToolbar = ref([]);
const columns = ref([
  { id: "name", title: "Name" },
]);

function onItemClick(item: any) {
  console.log("Item clicked:", item);
}

defineExpose({
   title,
   onItemClick,
});
</script>
`;
    } else {
      return `<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
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
import { IParentCallArgs } from "@vc-shell/framework";

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: Record<string, any>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  name: "EntityDetails",
  url: "/entity",
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const title = computed(() => "Entity Details");
const bladeToolbar = ref([]);

defineExpose({
  title,
});
</script>
`;
    }
  }

  private createBladeContext(blade: Blade, moduleNaming: NamingConfig, modulePath: string): BladeGenerationContext {
    const type = this.resolveBladeType(blade);
    const entityToken = this.resolveEntityToken(blade, moduleNaming);
    const entitySingularKebab = this.toSingularToken(entityToken);
    const entityPluralKebab = this.toPluralToken(entitySingularKebab);

    const componentBaseToken = this.toSingularToken(this.stripBladeSuffix(blade.id) || entityPluralKebab);
    const componentBasePascal = this.toPascalCase(componentBaseToken);
    const suffix = type === "list" ? "List" : type === "page" ? "Dashboard" : "Details";
    const componentName = componentBasePascal.endsWith(suffix)
      ? componentBasePascal
      : `${componentBasePascal}${suffix}`;
    const composableName = type === "page" ? `useDashboard` : `use${componentName}`;

    const naming: NamingConfig = {
      ...moduleNaming,
      entitySingular: entitySingularKebab,
      entitySingularKebab,
      entitySingularCamel: camelCase(entitySingularKebab),
      entitySingularPascal: this.toPascalCase(entitySingularKebab),
      entityPlural: entityPluralKebab,
      entityPluralKebab,
      entityPluralCamel: camelCase(entityPluralKebab),
      entityPluralPascal: this.toPascalCase(entityPluralKebab),
      composableList: `use${this.toPascalCase(entitySingularKebab)}List`,
      composableDetails: `use${this.toPascalCase(entitySingularKebab)}Details`,
      componentList: `${this.toPascalCase(entitySingularKebab)}List`,
      componentDetails: `${this.toPascalCase(entitySingularKebab)}Details`,
    };

    const fileName = blade.id.endsWith(".vue") ? blade.id : `${blade.id}.vue`;
    const filePath = path.join(modulePath, "pages", fileName);
    const composableFileName = `${composableName}.ts`;
    const composablePath = path.join(modulePath, "composables", composableFileName);

    const columns = type === "list" ? this.extractColumnsFromBlade(blade) : undefined;
    const fields = type === "details" ? this.extractFieldsFromBlade(blade) : undefined;
    // Status badge only needed if there's a status column (not based on features)
    const requiresStatusBadge = Boolean(
      columns?.some((column) => {
        if (!column) return false;
        if (column.type && column.type.toLowerCase().includes("status")) return true;
        return /status/i.test(column.id);
      }),
    );

    const normalizedRoute = blade.route?.startsWith("/") ? blade.route : `/${blade.route ?? naming.entityPluralKebab}`;
    const logic = this.normalizeBladeLogic(blade.logic) || this.logicPlanner.inferLogic(blade);
    const composableDefinition: ComposableDefinition =
      blade.composable && blade.composable.name
        ? {
            name: blade.composable.name,
            methods: blade.composable.methods || [],
            mockData: blade.composable.mockData,
          }
        : this.logicPlanner.inferComposable(blade, {
            entitySingularCamel: naming.entitySingularCamel,
            entitySingularPascal: naming.entitySingularPascal,
          });

    blade.logic = logic;
    blade.composable = composableDefinition;

    return {
      blade,
      type,
      entity: entitySingularKebab,
      module: moduleNaming.moduleName,
      naming,
      columns,
      fields,
      componentName,
      fileName,
      filePath,
      composableName,
      composableFileName,
      composablePath,
      menuTitleKey: `${moduleNaming.moduleNameUpperSnake}.MENU.TITLE`,
      route: normalizedRoute,
      isWorkspace: blade.isWorkspace,
      requiresStatusBadge,
      features: blade.features || [],
      complexity: 0, // Will be calculated by SmartCodeGenerator if needed
      logic,
      composableDefinition,
    };
  }

  private resolveBladeType(blade: Blade): "list" | "details" | "page" {
    if (blade.layout === "grid") {
      return "list";
    }

    if (blade.layout === "details") {
      return "details";
    }

    if (blade.layout === "page") {
      return "page";
    }

    // Fallback: choose list if there is a table, otherwise details
    const hasTable = blade.components?.some((component) => component.type === "VcTable");
    console.warn(`Unsupported blade layout "${blade.layout}", falling back to "${hasTable ? "list" : "details"}" type`);
    return hasTable ? "list" : "details";
  }

  private resolveEntityToken(blade: Blade, moduleNaming: NamingConfig): string {
    for (const component of blade.components || []) {
      if (component.model) {
        return kebabCase(component.model);
      }
      if (component.dataSource) {
        return kebabCase(component.dataSource);
      }
    }

    return this.stripBladeSuffix(blade.id) || moduleNaming.entitySingularKebab;
  }

  private stripBladeSuffix(id: string): string {
    if (!id) {
      return id;
    }

    const normalized = kebabCase(id);
    const suffixes = ["-list", "-details", "-page"];
    for (const suffix of suffixes) {
      if (normalized.endsWith(suffix)) {
        const value = normalized.slice(0, -suffix.length);
        return value || normalized;
      }
    }
    return normalized;
  }

  private toSingularToken(token: string): string {
    const segments = token.split("-");
    const last = segments.pop() || token;
    const singularLast = this.basicSingular(last);
    return [...segments, singularLast].filter(Boolean).join("-") || singularLast;
  }

  private toPluralToken(token: string): string {
    const segments = token.split("-");
    const last = segments.pop() || token;
    const pluralLast = this.basicPlural(last);
    return [...segments, pluralLast].filter(Boolean).join("-") || pluralLast;
  }

  private basicSingular(word: string): string {
    if (word.endsWith("ies")) {
      return `${word.slice(0, -3)}y`;
    }
    if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("ches") || word.endsWith("shes")) {
      return word.slice(0, -2);
    }
    if (word.endsWith("s") && word.length > 1) {
      return word.slice(0, -1);
    }
    return word;
  }

  private basicPlural(word: string): string {
    if (word.endsWith("y")) {
      return `${word.slice(0, -1)}ies`;
    }
    if (/(s|x|z|ch|sh)$/.test(word)) {
      return `${word}es`;
    }
    return `${word}s`;
  }

  private toPascalCase(value: string): string {
    return upperFirst(camelCase(value));
  }

  private writeFilesToDisk(files: GeneratedFile[]): void {
    for (const file of files) {
      const dir = path.dirname(file.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file.path, file.content, "utf-8");
    }
  }

  private generateComponentStubs(contexts: BladeGenerationContext[], modulePath: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const needsStatusBadge = contexts.some((context) => context.requiresStatusBadge);

    if (!needsStatusBadge) {
      return files;
    }

    const badgeContent = this.loadStatusBadgeTemplate();
    const badgePath = path.join(modulePath, "components", "status-badge.vue");
    files.push({
      path: badgePath,
      content: badgeContent,
      lines: badgeContent.split("\n").length,
    });

    const indexContent = `export { default as StatusBadge } from "./status-badge.vue";\n`;
    files.push({
      path: path.join(modulePath, "components", "index.ts"),
      content: indexContent,
      lines: indexContent.split("\n").length,
    });

    return files;
  }

  private loadStatusBadgeTemplate(): string {
    const componentPath = path.join(this.getExamplesPath(), "components", "status-badge.vue");
    if (fs.existsSync(componentPath)) {
      return fs.readFileSync(componentPath, "utf-8");
    }

    return `<template>\n  <span class="tw-text-sm">Status</span>\n</template>\n`;
  }

  /**
   * Extract columns from blade definition
   */
  private extractColumnsFromBlade(blade: Blade): Column[] {
    // Try to get columns from blade components
    const tableComponent = blade.components?.find((c) => c.type === "VcTable");

    if (tableComponent?.columns) {
      return tableComponent.columns.map((col) => ({
        id: col.id,
        title: col.title,
        type: col.type as string | undefined,
        sortable: col.sortable,
        width: col.width,
      }));
    }

    // Default columns
    return [
      { id: "name", title: "Name", sortable: true },
      { id: "createdDate", title: "Created", type: "date-ago", sortable: true },
    ];
  }

  /**
   * Extract fields from blade definition
   */
  private extractFieldsFromBlade(blade: Blade): Field[] {
    // Try to get fields from blade components
    const formComponent = blade.components?.find((c) => c.type === "VcForm");

    if (formComponent?.fields) {
      return formComponent.fields.map((field) => ({
        key: field.key,
        as: field.as || "VcInput",
        label: field.label,
        type: field.type as string | undefined,
        validation: field.rules?.join("|"),
        required: field.required,
        placeholder: field.placeholder,
      }));
    }

    // Default fields
    return [{ key: "name", as: "VcInput", label: "Name", type: "text", required: true }];
  }
}
