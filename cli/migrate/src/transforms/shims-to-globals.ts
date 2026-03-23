import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { parse, modify, applyEdits } from "jsonc-parser";
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const GLOBALS_ENTRY = "@vc-shell/framework/globals";

// Markers that identify standard boilerplate shim files
const BOILERPLATE_MARKERS = ["$mergeLocaleMessage", "CoreBladeAdditionalSettings", "*.vue"];

function isStandardBoilerplate(content: string): boolean {
  return BOILERPLATE_MARKERS.some((marker) => content.includes(marker));
}

const transform: Transform = (_fileInfo: FileInfo, api: API, options: Options): string | null => {
  const cwd = (options as any).cwd ?? ".";
  const dryRun = (options as any).dryRun ?? false;

  // Find tsconfig — prefer tsconfig.app.json, fallback to tsconfig.json
  const tsconfigAppPath = join(cwd, "tsconfig.app.json");
  const tsconfigPath = join(cwd, "tsconfig.json");
  const targetPath = existsSync(tsconfigAppPath) ? tsconfigAppPath : tsconfigPath;

  if (!existsSync(targetPath)) {
    api.report(`No tsconfig.json found in ${cwd}`);
    return null;
  }

  const content = readFileSync(targetPath, "utf-8");
  const json = parse(content);

  // Check if already has the globals entry
  const currentTypes: string[] = json?.compilerOptions?.types ?? [];
  if (currentTypes.includes(GLOBALS_ENTRY)) {
    api.report(`${targetPath}: already has ${GLOBALS_ENTRY} in types`);
  } else {
    // Add to compilerOptions.types
    const newTypes = [...currentTypes, GLOBALS_ENTRY];
    const edits = modify(content, ["compilerOptions", "types"], newTypes, {});
    const newContent = applyEdits(content, edits);
    if (!dryRun) {
      writeFileSync(targetPath, newContent, "utf-8");
    }
    api.report(`${targetPath}: added ${GLOBALS_ENTRY} to compilerOptions.types`);
  }

  // Check for shim files
  const shimFiles = ["shims-vue.d.ts", "vue-i18n.d.ts"];
  const srcDir = join(cwd, "src");

  for (const shimName of shimFiles) {
    const shimPath = join(srcDir, shimName);
    if (!existsSync(shimPath)) continue;

    const shimContent = readFileSync(shimPath, "utf-8");
    if (isStandardBoilerplate(shimContent)) {
      if (!dryRun) {
        unlinkSync(shimPath);
      }
      api.report(`${shimPath}: standard boilerplate — deleted`);
    } else {
      api.report(`${shimPath}: contains custom augmentations — review manually, do NOT delete`);
    }
  }

  return null; // tsconfig changes are done via direct file I/O, not through jscodeshift
};

export default transform;
export const parser = "tsx";
