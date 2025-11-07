export function isValidName(appName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(appName);
}

export function toValidName(appName: string): string {
  return appName
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

