import { SyntaxKind, Node } from "ts-morph";
import type { Project, SourceFile, InterfaceDeclaration } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const BLADE_PROPS = ["expanded", "closable"];
const BLADE_EMITS = ["close:blade", "expand:blade", "collapse:blade", "parent:call"];

export function runBladePropsSimplification(
  project: Project,
  options: TransformOptions,
): TransformResult {
  const result: TransformResult = {
    filesModified: [],
    filesSkipped: [],
    warnings: [],
    errors: [],
  };

  for (const sourceFile of project.getSourceFiles()) {
    try {
      const modified = processFile(sourceFile, result);
      if (modified) {
        result.filesModified.push(sourceFile.getFilePath());
      } else {
        result.filesSkipped.push(sourceFile.getFilePath());
      }
    } catch (err) {
      result.errors.push(
        `${sourceFile.getFilePath()}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return result;
}

function processFile(sourceFile: SourceFile, result: TransformResult): boolean {
  // Detection: find Props interface with expanded/closable OR Emits with blade events
  const propsInterface = findBladePropsInterface(sourceFile);
  const emitsInterface = findBladeEmitsInterface(sourceFile);

  if (!propsInterface && !emitsInterface) {
    return false;
  }

  // Track which useBlade members we need
  const neededMembers = new Set<string>();

  // Step 1: Check if props.param or props.options are used
  const usesParam = sourceFile.getFullText().includes("props.param");
  const usesOptions = sourceFile.getFullText().includes("props.options");

  if (usesParam) neededMembers.add("param");
  if (usesOptions) neededMembers.add("options");

  // Step 2: Check emit usage before removing emits
  const usesParentCall = sourceFile.getFullText().includes('"parent:call"');
  const usesCloseBladeEmit = sourceFile.getFullText().includes('"close:blade"');

  if (usesParentCall) neededMembers.add("callParent");
  if (usesCloseBladeEmit) neededMembers.add("closeSelf");

  // Step 3: Replace emit("parent:call", ...) calls
  replaceParentCallEmits(sourceFile);

  // Step 4: Replace emit("close:blade") calls
  replaceCloseBladeEmits(sourceFile);

  // Step 5: Replace props.param → param.value, props.options → options.value
  if (usesParam) {
    replacePropsAccess(sourceFile, "param");
  }
  if (usesOptions) {
    replacePropsAccess(sourceFile, "options");
  }

  // Step 6: Remove blade fields from Props interface
  let propsRemoved = false;
  if (propsInterface) {
    const allFields = propsInterface.getProperties();
    const bladeFields = allFields.filter((p) =>
      BLADE_PROPS.includes(p.getName()),
    );
    const paramField = allFields.find((p) => p.getName() === "param");
    const optionsField = allFields.find((p) => p.getName() === "options");

    // Remove blade props
    for (const field of bladeFields) {
      field.remove();
    }
    // Remove param/options (now from useBlade)
    if (paramField) paramField.remove();
    if (optionsField) optionsField.remove();

    // Check if Props is now empty
    if (propsInterface.getProperties().length === 0) {
      propsRemoved = true;
      propsInterface.remove();
    }
  }

  // Step 7: Remove withDefaults/defineProps if Props was removed
  if (propsRemoved) {
    removeDefinePropsStatement(sourceFile);
  } else if (propsInterface) {
    // Props still has fields — simplify withDefaults to defineProps if blade defaults removed
    simplifyWithDefaults(sourceFile);
  }

  // Step 8: Remove Emits interface and defineEmits
  if (emitsInterface) {
    emitsInterface.remove();
    removeDefineEmitsStatement(sourceFile);
  }

  // Step 9: Remove IParentCallArgs from imports
  removeNamedImport(sourceFile, "IParentCallArgs");

  // Step 10: Add useBlade import and destructuring
  if (neededMembers.size > 0) {
    addUseBladeImport(sourceFile);
    addUseBladeCall(sourceFile, neededMembers);
  }

  return true;
}

function findBladePropsInterface(
  sourceFile: SourceFile,
): InterfaceDeclaration | undefined {
  const interfaces = sourceFile.getInterfaces();
  for (const iface of interfaces) {
    if (iface.getName() !== "Props") continue;
    const props = iface.getProperties();
    const hasBladeProps = props.some((p) => BLADE_PROPS.includes(p.getName()));
    if (hasBladeProps) return iface;
  }
  return undefined;
}

function findBladeEmitsInterface(
  sourceFile: SourceFile,
): InterfaceDeclaration | undefined {
  const interfaces = sourceFile.getInterfaces();
  for (const iface of interfaces) {
    if (iface.getName() !== "Emits") continue;
    const text = iface.getFullText();
    const hasBladeEmit = BLADE_EMITS.some((e) => text.includes(`"${e}"`));
    if (hasBladeEmit) return iface;
  }
  return undefined;
}

function replaceParentCallEmits(sourceFile: SourceFile): void {
  // Find emit("parent:call", { method: "X" }) or emit("parent:call", { method: "X", args: Y })
  // We need to iterate in reverse to avoid position shifts
  let callExprs = findEmitCalls(sourceFile, "parent:call");

  for (const call of callExprs) {
    const args = call.getArguments();
    if (args.length < 2) continue;

    const objArg = args[1];
    if (!Node.isObjectLiteralExpression(objArg)) continue;

    const methodProp = objArg.getProperty("method");
    if (!methodProp || !Node.isPropertyAssignment(methodProp)) continue;

    const methodValue = methodProp.getInitializer()?.getText();
    if (!methodValue) continue;

    const argsProp = objArg.getProperty("args");
    let replacement: string;
    if (argsProp && Node.isPropertyAssignment(argsProp)) {
      const argsValue = argsProp.getInitializer()?.getText();
      replacement = `callParent(${methodValue}, ${argsValue})`;
    } else {
      replacement = `callParent(${methodValue})`;
    }

    call.replaceWithText(replacement);
  }
}

function replaceCloseBladeEmits(sourceFile: SourceFile): void {
  const callExprs = findEmitCalls(sourceFile, "close:blade");

  for (const call of callExprs) {
    call.replaceWithText("closeSelf()");
  }
}

function findEmitCalls(sourceFile: SourceFile, eventName: string) {
  // Collect all matching calls, then reverse so we process from end to start
  const calls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call) => {
      const expr = call.getExpression();
      if (expr.getText() !== "emit") return false;
      const args = call.getArguments();
      if (args.length === 0) return false;
      const firstArg = args[0];
      return firstArg.getText() === `"${eventName}"`;
    });

  // Process in reverse order to avoid position invalidation
  return calls.reverse();
}

function replacePropsAccess(sourceFile: SourceFile, propName: string): void {
  // Find all PropertyAccessExpression where object is "props" and name is propName
  const accesses = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((pae) => {
      return (
        pae.getExpression().getText() === "props" &&
        pae.getName() === propName
      );
    });

  // Reverse to avoid position shifts
  for (const access of accesses.reverse()) {
    access.replaceWithText(`${propName}.value`);
  }
}

function removeDefinePropsStatement(sourceFile: SourceFile): void {
  // Find: const props = withDefaults(defineProps<Props>(), { ... })
  // or: const props = defineProps<Props>()
  const varDecls = sourceFile.getVariableStatements();
  for (const stmt of varDecls) {
    const text = stmt.getText();
    if (
      (text.includes("withDefaults") && text.includes("defineProps")) ||
      text.includes("defineProps<Props>")
    ) {
      stmt.remove();
      return;
    }
  }

  // Also check for bare withDefaults/defineProps call statements
  const exprStmts = sourceFile.getStatements();
  for (const stmt of exprStmts) {
    const text = stmt.getText();
    if (
      Node.isExpressionStatement(stmt) &&
      (text.includes("withDefaults") || text.includes("defineProps"))
    ) {
      stmt.remove();
      return;
    }
  }
}

function simplifyWithDefaults(sourceFile: SourceFile): void {
  // Find withDefaults(defineProps<Props>(), { expanded: true, closable: true })
  // If only blade defaults remain, simplify to defineProps<Props>()
  const varDecls = sourceFile.getVariableStatements();
  for (const stmt of varDecls) {
    const text = stmt.getText();
    if (!text.includes("withDefaults") || !text.includes("defineProps")) {
      continue;
    }

    // Find the withDefaults call
    const calls = stmt.getDescendantsOfKind(SyntaxKind.CallExpression).filter(
      (c) => c.getExpression().getText() === "withDefaults",
    );

    for (const call of calls) {
      const args = call.getArguments();
      if (args.length < 2) continue;

      const defaultsObj = args[1];
      if (!Node.isObjectLiteralExpression(defaultsObj)) continue;

      const props = defaultsObj.getProperties();
      // Remove blade defaults
      const remaining = props.filter((p) => {
        if (!Node.isPropertyAssignment(p)) return true;
        return !BLADE_PROPS.includes(p.getName());
      });

      if (remaining.length === 0) {
        // All defaults were blade-only, replace withDefaults(...) with defineProps<Props>()
        const definePropsCall = args[0].getText();
        call.replaceWithText(definePropsCall);
      } else {
        // Remove only blade defaults from the object
        for (const p of props) {
          if (Node.isPropertyAssignment(p) && BLADE_PROPS.includes(p.getName())) {
            p.remove();
          }
        }
      }
    }
  }
}

function removeDefineEmitsStatement(sourceFile: SourceFile): void {
  const varDecls = sourceFile.getVariableStatements();
  for (const stmt of varDecls) {
    const text = stmt.getText();
    if (text.includes("defineEmits")) {
      stmt.remove();
      return;
    }
  }

  // Check expression statements too
  const stmts = sourceFile.getStatements();
  for (const stmt of stmts) {
    if (Node.isExpressionStatement(stmt) && stmt.getText().includes("defineEmits")) {
      stmt.remove();
      return;
    }
  }
}

function removeNamedImport(sourceFile: SourceFile, name: string): void {
  const importDecls = sourceFile.getImportDeclarations();
  for (const decl of importDecls) {
    const namedImports = decl.getNamedImports();
    for (const ni of namedImports) {
      if (ni.getName() === name) {
        ni.remove();
        // If import declaration is now empty, remove it
        if (decl.getNamedImports().length === 0 && !decl.getDefaultImport()) {
          decl.remove();
        }
        return;
      }
    }
  }
}

function addUseBladeImport(sourceFile: SourceFile): void {
  // Check if useBlade is already imported
  const importDecls = sourceFile
    .getImportDeclarations()
    .filter((d) => d.getModuleSpecifierValue() === "@vc-shell/framework");

  for (const decl of importDecls) {
    const named = decl.getNamedImports();
    if (named.some((n) => n.getName() === "useBlade")) return; // already imported
  }

  if (importDecls.length > 0) {
    // Add to existing framework import (prefer the first non-type-only import)
    const target =
      importDecls.find((d) => !d.isTypeOnly()) ?? importDecls[0];
    target.addNamedImport("useBlade");
  } else {
    // Create new import
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@vc-shell/framework",
      namedImports: ["useBlade"],
    });
  }
}

function addUseBladeCall(
  sourceFile: SourceFile,
  neededMembers: Set<string>,
): void {
  // Check if useBlade() call already exists
  const existing = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .some((c) => c.getExpression().getText() === "useBlade");

  if (existing) return;

  const members = Array.from(neededMembers).sort().join(", ");
  const statement = `const { ${members} } = useBlade();`;

  // Insert after last import or at the top
  const imports = sourceFile.getImportDeclarations();
  if (imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const idx = lastImport.getChildIndex();
    sourceFile.insertStatements(idx + 1, `\n${statement}`);
  } else {
    sourceFile.insertStatements(0, statement);
  }
}
