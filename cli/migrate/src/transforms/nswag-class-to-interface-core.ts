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

  const { dtoClassNames, interfaceToClass, packageName } = options;

  // Collect names actually imported from api_client in this file
  const importedNames = collectApiClientImportedNames(root, j, packageName);
  if (importedNames.size === 0) return null;

  // Effective DTOs: intersection of dtoClassNames and actually-imported names
  const effectiveDtos = new Set<string>();
  if (dtoClassNames) {
    for (const name of importedNames) {
      if (dtoClassNames.has(name)) {
        effectiveDtos.add(name);
      }
    }
  }

  // Effective renames: intersection of interfaceToClass keys and actually-imported names
  const effectiveRenames = new Map<string, string>();
  if (interfaceToClass) {
    for (const [iName, className] of interfaceToClass) {
      if (importedNames.has(iName)) {
        effectiveRenames.set(iName, className);
      }
    }
  }

  if (effectiveDtos.size === 0 && effectiveRenames.size === 0) return null;

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

  // Rule D/E: Rename IPrefix → ClassName in imports and type references
  // Collect renames that were applied so we can do text replacement for type positions
  // (jscodeshift doesn't traverse into TSTypeParameterInstantiation on CallExpressions)
  const appliedRenames = new Map<string, string>();

  if (effectiveRenames.size > 0) {
    root
      .find(j.ImportDeclaration)
      .filter((path) => {
        const source = path.node.source.value;
        return typeof source === "string" && isApiClientImport(source, packageName);
      })
      .forEach((importPath) => {
        const specifiers = importPath.node.specifiers ?? [];
        const toRemove: number[] = [];

        specifiers.forEach((spec, idx) => {
          if (spec.type !== "ImportSpecifier" || spec.imported.type !== "Identifier") return;
          const importedName = spec.imported.name;
          const targetName = effectiveRenames.get(importedName);
          if (!targetName) return;

          // Rule E: Check if targetName already imported in same declaration
          const alreadyImported = specifiers.some(
            (s) =>
              s.type === "ImportSpecifier" &&
              s.imported.type === "Identifier" &&
              s.imported.name === targetName,
          );

          if (alreadyImported) {
            toRemove.push(idx); // Remove duplicate IPrefix specifier
          } else {
            // Rule D: Rename the specifier
            spec.imported = j.identifier(targetName);
            if (spec.local && (spec.local as any).name === importedName) {
              spec.local = j.identifier(targetName);
            }
          }

          appliedRenames.set(importedName, targetName);
          changed = true;
        });

        // Remove deduplicated specifiers (reverse to preserve indices)
        for (const idx of toRemove.reverse()) {
          specifiers.splice(idx, 1);
        }
      });
  }

  if (!changed) return null;

  // Generate source from AST, then apply text-based renames for type references
  // that jscodeshift cannot traverse (e.g. TSTypeParameterInstantiation in CallExpression)
  let output = root.toSource();
  for (const [oldName, newName] of appliedRenames) {
    output = output.replace(new RegExp(`\\b${oldName}\\b`, "g"), newName);
  }

  return output;
}

export default coreTransform as Transform;
export const parser = "tsx";
