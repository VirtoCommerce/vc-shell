export type ProjectType = "standalone" | "dynamic-module";

export interface ProjectOptions {
  projectName: string;
  packageName: string;
  projectType: ProjectType;
  moduleName?: string;
  basePath: string;
  tenantRoutes: boolean;
  aiAgent: boolean;
  dashboard: boolean;
  mocks: boolean;
}

export interface ModuleOptions {
  moduleName: string;
  targetDir: string;
}

export interface GeneratorContext {
  targetDir: string;
  options: ProjectOptions;
  renderTemplate: (templatePath: string, outputPath: string, data?: Record<string, unknown>) => void;
  renderDir: (templateDir: string, outputDir: string, data?: Record<string, unknown>) => void;
}
