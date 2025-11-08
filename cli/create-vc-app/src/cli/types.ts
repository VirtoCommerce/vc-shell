export interface CLIArgs {
  _: string[];
  name?: string;
  "app-name"?: string;
  "package-name"?: string;
  "module-name"?: string;
  "base-path"?: string;
  overwrite?: boolean;
  help?: boolean;
  h?: boolean;
  version?: boolean;
  v?: boolean;
  type?: "grid" | "details";
  module?: string;
  composable?: boolean;
  locales?: boolean;
  widget?: boolean;
  "is-workspace"?: boolean;
  path?: string;
  "form-fields"?: string;
  "skip-form-editor"?: boolean;
  "skip-module-gen"?: boolean;
  "widget-module"?: string;
  "widget-blade"?: string;
  "widget-name"?: string;
  "widget-entity"?: string;
  "widget-icon"?: string;
}

export interface CreateAppConfig {
  appName: string;
  packageName: string;
  basePath: string;
  moduleName?: string;
}

