import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Replaces manual sortField/sortOrder/sortExpression boilerplate with useDataTableSort().
 *
 * Before:
 *   const sortField = ref("createdDate");
 *   const sortOrder = ref<1 | -1 | 0>(-1);
 *   const sortExpression = computed(() => { ... });
 *
 * After:
 *   const { sortField, sortOrder, sortExpression } = useDataTableSort({
 *     initialField: "createdDate",
 *     initialDirection: "DESC",
 *   });
 */

function orderToDirection(order: number): string | undefined {
  if (order === 1) return "ASC";
  if (order === -1) return "DESC";
  return undefined;
}

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find `const sortField = ref(...)` — must be a ref() call
  const sortFieldDecl = root.find(j.VariableDeclarator, {
    id: { type: "Identifier", name: "sortField" },
    init: { type: "CallExpression", callee: { name: "ref" } },
  });
  if (sortFieldDecl.size() === 0) return null;

  // Find `const sortOrder = ref(...)` — must be a ref() call
  const sortOrderDecl = root.find(j.VariableDeclarator, {
    id: { type: "Identifier", name: "sortOrder" },
    init: { type: "CallExpression", callee: { name: "ref" } },
  });
  if (sortOrderDecl.size() === 0) return null;

  // Find `const sortExpression = computed(...)` — must be a computed() call
  const sortExprDecl = root.find(j.VariableDeclarator, {
    id: { type: "Identifier", name: "sortExpression" },
    init: { type: "CallExpression", callee: { name: "computed" } },
  });
  if (sortExprDecl.size() === 0) return null;

  // Extract initial field value from sortField ref("...")
  let initialField: string | undefined;
  const sortFieldInit = sortFieldDecl.get().node.init;
  if (sortFieldInit?.type === "CallExpression" && sortFieldInit.arguments.length > 0) {
    const arg = sortFieldInit.arguments[0];
    if (arg.type === "StringLiteral" || (arg.type === "Literal" && typeof arg.value === "string")) {
      initialField = arg.value as string;
    }
  }

  // Extract initial order value from sortOrder ref(...)
  let initialDirection: string | undefined;
  const sortOrderInit = sortOrderDecl.get().node.init;
  if (sortOrderInit?.type === "CallExpression" && sortOrderInit.arguments.length > 0) {
    const arg = sortOrderInit.arguments[0];
    if (arg.type === "NumericLiteral" || (arg.type === "Literal" && typeof arg.value === "number")) {
      initialDirection = orderToDirection(arg.value as number);
    }
    // Handle UnaryExpression for -1
    if (arg.type === "UnaryExpression" && arg.operator === "-") {
      const argArg = arg.argument;
      if (
        (argArg.type === "NumericLiteral" || (argArg.type === "Literal" && typeof argArg.value === "number")) &&
        (argArg.value as number) === 1
      ) {
        initialDirection = "DESC";
      }
    }
  }

  // Build useDataTableSort options object
  const optionProperties = [];
  if (initialField) {
    optionProperties.push(
      j.objectProperty(j.identifier("initialField"), j.stringLiteral(initialField)),
    );
  }
  if (initialDirection) {
    optionProperties.push(
      j.objectProperty(j.identifier("initialDirection"), j.stringLiteral(initialDirection)),
    );
  }

  // Build: const { sortField, sortOrder, sortExpression } = useDataTableSort({ ... })
  const destructured = j.variableDeclaration("const", [
    j.variableDeclarator(
      j.objectPattern([
        j.objectProperty.from({ key: j.identifier("sortField"), value: j.identifier("sortField"), shorthand: true }),
        j.objectProperty.from({ key: j.identifier("sortOrder"), value: j.identifier("sortOrder"), shorthand: true }),
        j.objectProperty.from({
          key: j.identifier("sortExpression"),
          value: j.identifier("sortExpression"),
          shorthand: true,
        }),
      ]),
      j.callExpression(
        j.identifier("useDataTableSort"),
        optionProperties.length > 0 ? [j.objectExpression(optionProperties)] : [],
      ),
    ),
  ]);

  // Replace sortField declaration's parent VariableDeclaration with the new destructured call
  const sortFieldParent = sortFieldDecl.closest(j.VariableDeclaration);
  sortFieldParent.replaceWith(destructured);

  // Remove sortOrder and sortExpression declarations
  sortOrderDecl.closest(j.VariableDeclaration).remove();
  sortExprDecl.closest(j.VariableDeclaration).remove();

  // Add useDataTableSort to @vc-shell/framework import
  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });

  if (frameworkImports.size() > 0) {
    const importDecl = frameworkImports.get();
    const specifiers = importDecl.node.specifiers || [];
    const alreadyImported = specifiers.some(
      (s: { type: string; imported?: { name: string } }) =>
        s.type === "ImportSpecifier" && s.imported?.name === "useDataTableSort",
    );
    if (!alreadyImported) {
      specifiers.push(j.importSpecifier(j.identifier("useDataTableSort")));
    }
  } else {
    // Create new import
    const newImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("useDataTableSort"))],
      j.stringLiteral("@vc-shell/framework"),
    );
    const body = root.find(j.Program).get("body");
    body.unshift(newImport);
  }

  // Clean up unused ref/computed from vue import
  const vueImports = root.find(j.ImportDeclaration, {
    source: { value: "vue" },
  });
  if (vueImports.size() > 0) {
    for (const name of ["ref", "computed"]) {
      // Check if name is still used anywhere besides the import
      const usages = root.find(j.Identifier, { name }).filter((path) => {
        // Skip import specifiers
        return path.parent.node.type !== "ImportSpecifier";
      });
      if (usages.size() === 0) {
        // Remove from vue import
        vueImports.find(j.ImportSpecifier, { imported: { name } }).remove();
      }
    }
  }

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
