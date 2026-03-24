import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

export interface NswagCoreOptions {
  dtoClassNames: Set<string>;
  interfaceToClass: Map<string, string>;
  packageName?: string;
}

/**
 * Returns true if the import source looks like an api_client import.
 * Matches if source contains "api_client" or starts with the given packageName.
 */
export function isApiClientImport(source: string, packageName?: string): boolean {
  if (source.includes("api_client")) return true;
  if (packageName && source.startsWith(packageName)) return true;
  return false;
}

/**
 * Collects all imported names from ImportDeclarations that match api_client sources.
 */
export function collectApiClientImportedNames(
  root: ReturnType<API["jscodeshift"]>,
  j: API["jscodeshift"],
  packageName?: string,
): Set<string> {
  const names = new Set<string>();
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (typeof source === "string" && isApiClientImport(source, packageName)) {
      for (const specifier of path.node.specifiers ?? []) {
        if (specifier.type === "ImportSpecifier" && specifier.local) {
          names.add(specifier.local.name as string);
        } else if (specifier.type === "ImportDefaultSpecifier" && specifier.local) {
          names.add(specifier.local.name as string);
        }
      }
    }
  });
  return names;
}

/**
 * Core AST transform for nswag-class-to-interface migration.
 * Rule C: Replace `new DtoClass()` (no args) with `{} as DtoClass`.
 */
export function coreTransform(
  fileInfo: FileInfo,
  api: API,
  options: Options & NswagCoreOptions,
): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const { dtoClassNames, packageName } = options;
  if (!dtoClassNames || dtoClassNames.size === 0) return null;

  // Collect names actually imported from api_client in this file
  const importedNames = collectApiClientImportedNames(root, j, packageName);
  if (importedNames.size === 0) return null;

  // Effective DTOs: intersection of dtoClassNames and actually-imported names
  const effectiveDtos = new Set<string>();
  for (const name of importedNames) {
    if (dtoClassNames.has(name)) {
      effectiveDtos.add(name);
    }
  }
  if (effectiveDtos.size === 0) return null;

  let changed = false;

  // Find all NewExpression where callee is an Identifier in effectiveDtos
  root.find(j.NewExpression, {
    callee: { type: "Identifier" },
  }).forEach((path) => {
    const callee = path.node.callee;
    if (callee.type !== "Identifier") return;
    const className = callee.name;
    if (!effectiveDtos.has(className)) return;

    const args = path.node.arguments;

    let replacement;

    if (args.length === 0) {
      // Rule C: no args → `{} as ClassName`
      replacement = j.tsAsExpression(
        j.objectExpression([]),
        j.tsTypeReference(j.identifier(className)),
      );
    } else {
      const arg = args[0];
      if (
        (arg.type === "Identifier" && (arg as any).name === "undefined") ||
        (arg.type === "NullLiteral") ||
        (arg.type === "Literal" && (arg as any).value === null)
      ) {
        // null/undefined literal → Rule C (empty object)
        replacement = j.tsAsExpression(
          j.objectExpression([]),
          j.tsTypeReference(j.identifier(className)),
        );
      } else if (arg.type === "ObjectExpression") {
        // Rule A: new Dto({...}) → {...} as Dto
        replacement = j.tsAsExpression(
          arg,
          j.tsTypeReference(j.identifier(className)),
        );
      } else {
        // Rule B: new Dto(variable) → { ...variable } as Dto
        replacement = j.tsAsExpression(
          j.objectExpression([j.spreadElement(arg as any)]),
          j.tsTypeReference(j.identifier(className)),
        );
      }
    }

    // Check parent for TSAsExpression — collapse double-cast
    const parent = path.parent;
    if (parent && parent.node.type === "TSAsExpression") {
      // Parent is already `expr as SomeType`, replace with `{obj} as SomeType` using parent's type
      parent.replace(
        j.tsAsExpression(replacement.expression, parent.node.typeAnnotation),
      );
    } else {
      path.replace(replacement);
    }
    changed = true;
  });

  return changed ? root.toSource() : null;
}

export default coreTransform as Transform;
export const parser = "tsx";
