import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import writeFileAtomic from "write-file-atomic";
import jscodeshift from "jscodeshift";
import { parse as parseSFC } from "@vue/compiler-sfc";
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";
import { coreTransform } from "./nswag-class-to-interface-core.js";

interface DtoRegistry {
  dtoClassNames: Set<string>;
  interfaceToClass: Map<string, string>;
  packageName?: string;
}

/**
 * Scans api_client/*.ts files to build a registry of DTO class names
 * and interface-to-class mappings.
 */
function buildDtoRegistry(apiClientDir: string): DtoRegistry {
  const dtoClassNames = new Set<string>();
  const interfaceToClass = new Map<string, string>();
  let packageName: string | undefined;

  // Try to read package.json for package name
  const pkgJsonPath = join(apiClientDir, "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      packageName = pkgJson.name;
    } catch {
      // ignore
    }
  }

  const regex = /export class (\w+) implements I(\w+)/g;

  const entries = readdirSync(apiClientDir);
  for (const entry of entries) {
    if (!entry.endsWith(".ts")) continue;
    const filePath = join(apiClientDir, entry);
    if (!statSync(filePath).isFile()) continue;

    const content = readFileSync(filePath, "utf-8");
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const className = match[1];
      // Skip client classes
      if (className.endsWith("Client")) continue;
      dtoClassNames.add(className);
      const interfaceName = `I${match[2]}`;
      interfaceToClass.set(interfaceName, className);
    }
  }

  return { dtoClassNames, interfaceToClass, packageName };
}

/**
 * Recursively finds consumer .ts and .vue files, skipping api_client dir,
 * node_modules, dist, and dotfiles.
 */
function findConsumerFiles(dir: string, apiClientDir: string): string[] {
  const results: string[] = [];

  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    if (entry === "node_modules" || entry === "dist") continue;

    const fullPath = join(dir, entry);
    const resolvedApiClient = apiClientDir.endsWith("/")
      ? apiClientDir.slice(0, -1)
      : apiClientDir;
    if (fullPath === resolvedApiClient) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findConsumerFiles(fullPath, apiClientDir));
    } else if (stat.isFile()) {
      if (entry.endsWith(".d.ts") || entry.endsWith(".generated.ts")) continue;
      if (entry.endsWith(".ts") || entry.endsWith(".vue")) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const transform: Transform = (_fileInfo: FileInfo, api: API, options: Options): string | null => {
  const cwd = (options as any).cwd ?? ".";
  const dryRun = (options as any).dryRun ?? false;

  const j = jscodeshift.withParser("tsx");

  const srcDir = join(cwd, "src");
  const apiClientDir = join(srcDir, "api_client");

  if (!existsSync(apiClientDir)) {
    api.report(`No api_client directory found at ${apiClientDir}`);
    return null;
  }

  const { dtoClassNames, interfaceToClass, packageName } = buildDtoRegistry(apiClientDir);

  api.report(
    `Registry: ${dtoClassNames.size} DTO classes, ${interfaceToClass.size} interface→class mappings` +
      (packageName ? `, package: ${packageName}` : ""),
  );

  if (dtoClassNames.size === 0) {
    api.report("No DTO classes found in api_client — nothing to migrate.");
    return null;
  }

  const consumerFiles = findConsumerFiles(srcDir, apiClientDir);
  api.report(`Found ${consumerFiles.length} consumer files to scan.`);

  let totalModified = 0;

  for (const filePath of consumerFiles) {
    try {
      const source = readFileSync(filePath, "utf-8");
      const relPath = relative(cwd, filePath);
      let result: string | null = null;

      const fileApi: API = {
        jscodeshift: j,
        j,
        stats: () => {},
        report: api.report,
      };

      const coreOptions = {
        ...options,
        dtoClassNames,
        interfaceToClass,
        packageName,
      };

      if (filePath.endsWith(".vue")) {
        const { descriptor } = parseSFC(source, { filename: filePath });
        const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
        if (!scriptBlock) continue;

        const scriptResult = coreTransform(
          { path: relPath, source: scriptBlock.content },
          fileApi,
          coreOptions,
        );

        if (scriptResult !== null) {
          const start = scriptBlock.loc.start.offset;
          const end = scriptBlock.loc.end.offset;
          result = source.substring(0, start) + scriptResult + source.substring(end);
        }
      } else {
        result = coreTransform({ path: relPath, source }, fileApi, coreOptions);
      }

      if (result !== null) {
        if (!dryRun) {
          writeFileAtomic.sync(filePath, result);
        }
        api.report(`${relPath}: modified`);
        totalModified++;
      }
    } catch (err) {
      const relPath = relative(cwd, filePath);
      api.report(
        `${relPath}: ERROR — ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  api.report(`Done. ${totalModified} file(s) modified out of ${consumerFiles.length} scanned.`);

  return null;
};

export default transform;
export const parser = "tsx";
