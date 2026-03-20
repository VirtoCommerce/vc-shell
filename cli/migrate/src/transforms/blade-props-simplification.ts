import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFCBoth } from "../utils/vue-sfc-wrapper.js";
import { removeBladeBoilerplateFromTemplate } from "../utils/template-transform.js";
import type { Transform } from "./types.js";

const BLADE_PROPS = ["expanded", "closable"];
const BLADE_EMITS = ["close:blade", "expand:blade", "collapse:blade", "parent:call"];

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // --- Detection ---

  // Find interface Props with expanded/closable
  const propsInterfaces = root.find(j.TSInterfaceDeclaration, { id: { name: "Props" } });
  let hasBladeProps = false;
  propsInterfaces.forEach((path) => {
    const body = path.node.body.body;
    hasBladeProps = body.some(
      (member) =>
        member.type === "TSPropertySignature" &&
        member.key.type === "Identifier" &&
        BLADE_PROPS.includes(member.key.name),
    );
  });

  // Find interface Emits with blade events
  const emitsInterfaces = root.find(j.TSInterfaceDeclaration, { id: { name: "Emits" } });
  let hasBladeEmits = false;
  emitsInterfaces.forEach((path) => {
    const body = path.node.body.body;
    hasBladeEmits = body.some((member) => {
      if (member.type !== "TSCallSignatureDeclaration") return false;
      const params = member.parameters;
      if (!params || params.length === 0) return false;
      const firstParam = params[0];
      // Check type annotation for literal string type
      const annotation = (firstParam as any).typeAnnotation;
      if (annotation && annotation.type === "TSTypeAnnotation") {
        const typeNode = annotation.typeAnnotation;
        if (typeNode.type === "TSLiteralType" && typeNode.literal.type === "StringLiteral") {
          return BLADE_EMITS.includes(typeNode.literal.value);
        }
      }
      return false;
    });
  });

  if (!hasBladeProps && !hasBladeEmits) return null;

  // --- Track needed useBlade members ---
  const neededMembers = new Set<string>();

  // Check props.param / props.options usage
  const usesParam =
    root
      .find(j.MemberExpression, { object: { name: "props" }, property: { name: "param" } })
      .size() > 0;
  const usesOptions =
    root
      .find(j.MemberExpression, { object: { name: "props" }, property: { name: "options" } })
      .size() > 0;

  if (usesParam) neededMembers.add("param");
  if (usesOptions) neededMembers.add("options");

  // Check emit("parent:call", ...) usage
  const parentCallEmits = root
    .find(j.CallExpression, { callee: { name: "emit" } })
    .filter((path) => {
      const args = path.node.arguments;
      return (
        args.length > 0 && args[0].type === "StringLiteral" && args[0].value === "parent:call"
      );
    });
  if (parentCallEmits.size() > 0) neededMembers.add("callParent");

  // Check emit("close:blade") usage
  const closeBladeEmits = root
    .find(j.CallExpression, { callee: { name: "emit" } })
    .filter((path) => {
      const args = path.node.arguments;
      return (
        args.length > 0 && args[0].type === "StringLiteral" && args[0].value === "close:blade"
      );
    });
  if (closeBladeEmits.size() > 0) neededMembers.add("closeSelf");

  // --- Step 3: Replace emit("parent:call", ...) → callParent(...) ---
  root
    .find(j.CallExpression, { callee: { name: "emit" } })
    .filter((path) => {
      const args = path.node.arguments;
      return (
        args.length > 0 && args[0].type === "StringLiteral" && args[0].value === "parent:call"
      );
    })
    .forEach((path) => {
      const args = path.node.arguments;
      const newArgs: any[] = [];

      if (args.length >= 2 && args[1].type === "ObjectExpression") {
        const objExpr = args[1];
        // Extract method value
        const methodProp = objExpr.properties.find(
          (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "method",
        ) as any;
        if (methodProp) {
          newArgs.push(methodProp.value);
        }
        // Extract args value
        const argsProp = objExpr.properties.find(
          (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "args",
        ) as any;
        if (argsProp) {
          newArgs.push(argsProp.value);
        }
      }

      j(path).replaceWith(j.callExpression(j.identifier("callParent"), newArgs));
    });

  // --- Step 4: Replace emit("close:blade") → closeSelf() ---
  root
    .find(j.CallExpression, { callee: { name: "emit" } })
    .filter((path) => {
      const args = path.node.arguments;
      return (
        args.length > 0 && args[0].type === "StringLiteral" && args[0].value === "close:blade"
      );
    })
    .forEach((path) => {
      j(path).replaceWith(j.callExpression(j.identifier("closeSelf"), []));
    });

  // --- Step 5: Replace props.param → param.value, props.options → options.value ---
  if (usesParam) {
    root
      .find(j.MemberExpression, { object: { name: "props" }, property: { name: "param" } })
      .forEach((path) => {
        j(path).replaceWith(j.memberExpression(j.identifier("param"), j.identifier("value")));
      });
  }
  if (usesOptions) {
    root
      .find(j.MemberExpression, { object: { name: "props" }, property: { name: "options" } })
      .forEach((path) => {
        j(path).replaceWith(j.memberExpression(j.identifier("options"), j.identifier("value")));
      });
  }

  // --- Step 6: Remove blade fields from Props interface ---
  let propsRemoved = false;
  propsInterfaces.forEach((path) => {
    const body = path.node.body.body;
    // Remove blade props + param + options (they come from useBlade now)
    const propsToRemove = [...BLADE_PROPS, ...(usesParam ? ["param"] : []), ...(usesOptions ? ["options"] : [])];
    path.node.body.body = body.filter((member) => {
      if (member.type !== "TSPropertySignature") return true;
      if (member.key.type !== "Identifier") return true;
      return !propsToRemove.includes(member.key.name);
    });

    // If Props is now empty, remove it
    if (path.node.body.body.length === 0) {
      propsRemoved = true;
      j(path).remove();
    }
  });

  // --- Step 7: Handle withDefaults/defineProps ---
  if (propsRemoved) {
    // Remove the entire defineProps/withDefaults statement
    removeDefinePropsStatement(root, j);
  } else if (hasBladeProps) {
    // Props still has non-blade fields — simplify withDefaults
    simplifyWithDefaults(root, j);
  }

  // --- Step 8: Remove Emits interface and defineEmits ---
  if (hasBladeEmits) {
    // Remove Emits interface
    root.find(j.TSInterfaceDeclaration, { id: { name: "Emits" } }).remove();

    // Remove defineEmits statement
    removeDefineEmitsStatement(root, j);
  }

  // --- Step 9: Remove IParentCallArgs from imports ---
  removeNamedImport(root, j, "IParentCallArgs");

  // --- Step 10: Add useBlade import and destructuring ---
  if (neededMembers.size > 0) {
    addUseBladeImport(root, j);
    addUseBladeCall(root, j, neededMembers);
  }

  return root.toSource();
}

function removeDefinePropsStatement(root: any, j: any): void {
  // Find variable declarations containing defineProps or withDefaults
  root.find(j.VariableDeclaration).forEach((path: any) => {
    const src = j(path).toSource();
    if (src.includes("defineProps") || src.includes("withDefaults")) {
      j(path).remove();
    }
  });

  // Also check expression statements (bare defineProps call)
  root.find(j.ExpressionStatement).forEach((path: any) => {
    const src = j(path).toSource();
    if (src.includes("defineProps") || src.includes("withDefaults")) {
      j(path).remove();
    }
  });
}

function simplifyWithDefaults(root: any, j: any): void {
  // Find withDefaults(defineProps<Props>(), { expanded: true, closable: true })
  root
    .find(j.CallExpression, { callee: { name: "withDefaults" } })
    .forEach((path: any) => {
      const args = path.node.arguments;
      if (args.length < 2) return;

      const defaultsObj = args[1];
      if (defaultsObj.type !== "ObjectExpression") return;

      // Filter out blade defaults
      const remaining = defaultsObj.properties.filter((prop: any) => {
        if (prop.type !== "ObjectProperty") return true;
        if (prop.key.type !== "Identifier") return true;
        return !BLADE_PROPS.includes(prop.key.name);
      });

      if (remaining.length === 0) {
        // All defaults were blade-only — replace withDefaults(...) with defineProps<Props>()
        j(path).replaceWith(args[0]);
      } else {
        // Keep non-blade defaults
        defaultsObj.properties = remaining;
      }
    });
}

function removeDefineEmitsStatement(root: any, j: any): void {
  root.find(j.VariableDeclaration).forEach((path: any) => {
    const src = j(path).toSource();
    if (src.includes("defineEmits")) {
      j(path).remove();
    }
  });

  root.find(j.ExpressionStatement).forEach((path: any) => {
    const src = j(path).toSource();
    if (src.includes("defineEmits")) {
      j(path).remove();
    }
  });
}

function removeNamedImport(root: any, j: any, name: string): void {
  root.find(j.ImportDeclaration).forEach((path: any) => {
    const specifiers = path.node.specifiers;
    if (!specifiers) return;

    const idx = specifiers.findIndex(
      (s: any) => s.type === "ImportSpecifier" && s.imported.type === "Identifier" && s.imported.name === name,
    );
    if (idx === -1) return;

    specifiers.splice(idx, 1);

    // If no specifiers left, remove the entire import
    if (specifiers.length === 0) {
      j(path).remove();
    }
  });
}

function addUseBladeImport(root: any, j: any): void {
  // Check if useBlade is already imported
  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });

  let alreadyImported = false;
  frameworkImports.forEach((path: any) => {
    const specifiers = path.node.specifiers || [];
    if (
      specifiers.some(
        (s: any) =>
          s.type === "ImportSpecifier" &&
          s.imported.type === "Identifier" &&
          s.imported.name === "useBlade",
      )
    ) {
      alreadyImported = true;
    }
  });

  if (alreadyImported) return;

  if (frameworkImports.size() > 0) {
    // Add to existing non-type-only framework import
    let target: any = null;
    frameworkImports.forEach((path: any) => {
      if (!target && path.node.importKind !== "type") {
        target = path;
      }
    });
    if (!target) {
      frameworkImports.forEach((path: any) => {
        if (!target) target = path;
      });
    }

    if (target) {
      const specifiers = target.node.specifiers || [];
      specifiers.push(j.importSpecifier(j.identifier("useBlade")));
    }
  } else {
    // Create new import — insert at beginning
    const newImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("useBlade"))],
      j.literal("@vc-shell/framework"),
    );
    const body = root.find(j.Program).get("body");
    body.unshift(newImport);
  }
}

function addUseBladeCall(root: any, j: any, neededMembers: Set<string>): void {
  // Check if useBlade() call already exists
  const existingCalls = root.find(j.CallExpression, { callee: { name: "useBlade" } });
  if (existingCalls.size() > 0) return;

  const members = Array.from(neededMembers).sort();
  const properties = members.map((name) => {
    const prop = j.objectProperty(j.identifier(name), j.identifier(name));
    prop.shorthand = true;
    return prop;
  });

  const declaration = j.variableDeclaration("const", [
    j.variableDeclarator(
      j.objectPattern(properties),
      j.callExpression(j.identifier("useBlade"), []),
    ),
  ]);

  // Insert after last import
  const imports = root.find(j.ImportDeclaration);
  if (imports.size() > 0) {
    const lastImport = imports.at(-1);
    lastImport.insertAfter(declaration);
  } else {
    const body = root.find(j.Program).get("body");
    body.unshift(declaration);
  }
}

function templateTransform(
  template: string,
  _filePath: string,
): { content: string; changed: boolean } {
  const result = removeBladeBoilerplateFromTemplate(template);
  return { content: result, changed: result !== template };
}

export default wrapForSFCBoth(coreTransform, templateTransform) as Transform;
export const parser = "tsx";
