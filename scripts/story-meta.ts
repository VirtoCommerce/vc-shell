/**
 * Static reading of `*.stories.ts` files: which component a story file documents, its title,
 * its story exports and its hand-written argTypes. Shared by the argTypes check and the
 * component manifest generator.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createChecker } from "vue-component-meta";

export const ROOT = path.resolve(__dirname, "..");
export const FRAMEWORK_DIR = path.join(ROOT, "framework");

/** argTypes in this category are story-only controls, not component API. */
export const STORY_ONLY_CATEGORY = "Story";

const ALIASES: Record<string, string> = {
  "@ui/": "ui/",
  "@shell/": "shell/",
  "@core/": "core/",
  "@framework/": "",
  "@modules/": "modules/",
};

export interface StoryFileMeta {
  file: string;
  title?: string;
  tags: string[];
  component?: { file: string; exportName: string; localName: string };
  argTypes: { key: string; storyOnly: boolean }[];
  stories: { exportName: string; tags: string[] }[];
}

export function findStoryFiles(dir: string = FRAMEWORK_DIR, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith("_spike")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findStoryFiles(full, out);
    else if (entry.name.endsWith(".stories.ts")) out.push(full);
  }
  return out.sort();
}

export function resolveModule(specifier: string, fromFile: string): string | undefined {
  let base: string | undefined;
  if (specifier.startsWith(".")) base = path.resolve(path.dirname(fromFile), specifier);
  else {
    const alias = Object.keys(ALIASES).find((a) => specifier.startsWith(a));
    if (alias) base = path.join(FRAMEWORK_DIR, ALIASES[alias], specifier.slice(alias.length));
  }
  if (!base) return undefined;
  for (const candidate of [base, `${base}.ts`, `${base}.vue`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

/** Follows `export { default as VcX } from "./vc-x.vue"` (and `export *`) through barrel files to the SFC. */
export function resolveComponent(
  file: string,
  exportName: string,
  depth = 0,
): { file: string; exportName: string } | undefined {
  if (file.endsWith(".vue")) return { file, exportName: "default" };
  if (depth > 5) return undefined;
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  for (const node of source.statements) {
    if (!ts.isExportDeclaration(node) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const target = resolveModule(node.moduleSpecifier.text, file);
    if (!target) continue;
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      const match = node.exportClause.elements.find((el) => el.name.text === exportName);
      if (match) return resolveComponent(target, (match.propertyName ?? match.name).text, depth + 1);
    } else if (!node.exportClause) {
      const found = resolveComponent(target, exportName, depth + 1);
      if (found) return found;
    }
  }
  return undefined;
}

/** True when `name` is exported from `file`, directly or through `export { }` / `export *` chains. */
export function exportsName(file: string, name: string, depth = 0): boolean {
  if (depth > 8 || !file.endsWith(".ts")) return false;
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  for (const node of source.statements) {
    const exported =
      ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (exported && ts.isVariableStatement(node)) {
      if (node.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name)) return true;
    }
    if (exported && (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name?.text === name)
      return true;
    if (!ts.isExportDeclaration(node) || node.isTypeOnly) continue;
    const target =
      node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
        ? resolveModule(node.moduleSpecifier.text, file)
        : undefined;
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      if (node.exportClause.elements.some((el) => el.name.text === name && !el.isTypeOnly)) return true;
    } else if (!node.exportClause && target && exportsName(target, name, depth + 1)) {
      return true;
    }
  }
  return false;
}

function propName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function unwrap(expr: ts.Expression): ts.Expression {
  while (ts.isSatisfiesExpression(expr) || ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
    expr = expr.expression;
  }
  return expr;
}

function readTags(obj: ts.ObjectLiteralExpression): string[] {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      propName(prop.name) === "tags" &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      return prop.initializer.elements.filter(ts.isStringLiteral).map((e) => e.text);
    }
  }
  return [];
}

export function readStoryFile(file: string): StoryFileMeta {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const imports = new Map<string, { specifier: string; imported: string }>();
  const result: StoryFileMeta = { file, tags: [], argTypes: [], stories: [] };
  let metaObject: ts.ObjectLiteralExpression | undefined;

  for (const node of source.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.importClause) {
      const specifier = node.moduleSpecifier.text;
      const clause = node.importClause;
      if (clause.name) imports.set(clause.name.text, { specifier, imported: "default" });
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          imports.set(el.name.text, { specifier, imported: (el.propertyName ?? el.name).text });
        }
      }
    }
    if (!ts.isVariableStatement(node)) continue;
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      const init = unwrap(decl.initializer);
      if (decl.name.text === "meta" && ts.isObjectLiteralExpression(init)) metaObject = init;
      else if (exported) {
        result.stories.push({
          exportName: decl.name.text,
          tags: ts.isObjectLiteralExpression(init) ? readTags(init) : [],
        });
      }
    }
  }
  if (!metaObject) return result;

  result.tags = readTags(metaObject);
  for (const prop of metaObject.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = propName(prop.name);
    if (name === "title" && ts.isStringLiteral(prop.initializer)) result.title = prop.initializer.text;
    if (name === "component" && ts.isIdentifier(prop.initializer)) {
      const imported = imports.get(prop.initializer.text);
      const resolved = imported && resolveModule(imported.specifier, file);
      const component = imported && resolved ? resolveComponent(resolved, imported.imported) : undefined;
      if (component) result.component = { ...component, localName: prop.initializer.text };
    }
    if (name === "argTypes" && ts.isObjectLiteralExpression(prop.initializer)) {
      for (const argType of prop.initializer.properties) {
        if (!ts.isPropertyAssignment(argType)) continue;
        const key = propName(argType.name);
        if (!key) continue;
        const storyOnly = argType.initializer.getText().includes(`category: "${STORY_ONLY_CATEGORY}"`);
        result.argTypes.push({ key, storyOnly });
      }
    }
  }
  return result;
}

export function createComponentChecker() {
  return createChecker(path.join(FRAMEWORK_DIR, "tsconfig.json"), { forceUseTs: true, printer: { newLine: 1 } });
}

export const camelize = (s: string) => s.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());
export const eventHandlerName = (event: string) => `on${camelize(event).replace(/^\w/, (c) => c.toUpperCase())}`;
