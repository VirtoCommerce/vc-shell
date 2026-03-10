export function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toScreamingSnakeCase(str: string): string {
  return str
    .replace(/[-\s]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

export function toSentenceCase(str: string): string {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isValidPackageName(name: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
}

export function toValidPackageName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

export function toValidBasePath(basePath: string): string {
  return basePath
    .trim()
    .toLowerCase()
    .replace(/\/+/g, "/")
    .replace(/[^a-z0-9/-]+/g, "/")
    .replace(/\/?$/, "/");
}

export function buildTemplateData(
  options: { moduleName: string; projectName?: string; packageName?: string; basePath?: string; tenantRoutes?: boolean; aiAgent?: boolean; dashboard?: boolean; mocks?: boolean },
): Record<string, string | boolean> {
  const moduleName = options.moduleName;
  const kebab = toKebabCase(moduleName);

  const data: Record<string, string | boolean> = {
    ModuleName: kebab,
    ModuleNamePascalCase: toPascalCase(moduleName),
    ModuleNameCamelCase: toCamelCase(moduleName),
    ModuleNameUppercase: kebab.toUpperCase(),
    ModuleNameScreamingSnake: toScreamingSnakeCase(moduleName),
    ModuleNameSentenceCase: toSentenceCase(moduleName),
  };

  if (options.projectName) {
    data.AppName = toKebabCase(options.projectName);
    data.AppNameSentenceCase = toSentenceCase(options.projectName);
  }

  if (options.packageName !== undefined) {
    data.PackageName = options.packageName || "";
    data.BasePath = options.basePath || "";
    data.tenantRoutes = options.tenantRoutes || false;
    data.aiAgent = options.aiAgent || false;
    data.dashboard = options.dashboard || false;
    data.mocks = options.mocks || false;
  }

  return data;
}
