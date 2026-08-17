import fs from "node:fs";
import { toPascalCase, toKebabCase, toScreamingSnakeCase } from "./helpers.js";

/**
 * Replace the contents of comments — and, unless `strings` is false, of strings
 * and template literals — with spaces, keeping every offset intact.
 *
 * Structural scanning runs against the mask while text is sliced from the
 * original source, so a brace, parenthesis or semicolon inside a string can
 * never be mistaken for syntax. Pass `strings: false` when the pattern itself
 * needs to see string contents, such as a module specifier. Regex literals are
 * not masked; an unbalanced brace inside one (`/[{]/`) would still confuse the
 * scan, which no template we generate contains.
 */
function maskLiterals(code: string, { strings = true }: { strings?: boolean } = {}): string {
  const out = code.split("");
  let i = 0;

  const blank = (from: number, to: number) => {
    for (let j = from; j < to && j < code.length; j++) {
      if (out[j] !== "\n") out[j] = " ";
    }
  };

  while (i < code.length) {
    const ch = code[i];

    if (ch === "/" && code[i + 1] === "/") {
      const nl = code.indexOf("\n", i);
      const stop = nl === -1 ? code.length : nl;
      blank(i, stop);
      i = stop;
      continue;
    }

    if (ch === "/" && code[i + 1] === "*") {
      const close = code.indexOf("*/", i + 2);
      const stop = close === -1 ? code.length : close + 2;
      blank(i, stop);
      i = stop;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === ch) break;
        j++;
      }
      if (strings) blank(i + 1, j);
      i = j + 1;
      continue;
    }

    i++;
  }

  return out.join("");
}

/**
 * Offset just past the balanced bracket group opening at `open`, including a
 * trailing `;`. Returns -1 when the group never closes.
 */
function endOfCall(mask: string, open: number): number {
  let depth = 0;

  for (let i = open; i < mask.length; i++) {
    const ch = mask[i];
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) {
        return mask[i + 1] === ";" ? i + 2 : i + 1;
      }
    }
  }

  return -1;
}

/**
 * Ranges of every `name(...)` call, skipping calls nested inside an earlier one.
 * Matches arrive in source order, so a nested call always starts before the
 * enclosing call's end.
 */
function findCalls(mask: string, name: string): { start: number; end: number }[] {
  const re = new RegExp(`\\b${name}\\s*\\(`, "g");
  const calls: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = re.exec(mask)) !== null) {
    const enclosing = calls[calls.length - 1];
    if (enclosing && match.index < enclosing.end) continue;

    const end = endOfCall(mask, match.index + match[0].length - 1);
    if (end === -1) break;
    calls.push({ start: match.index, end });
  }

  return calls;
}

/**
 * Offset just past the last import statement, or -1 when there are none.
 * Scanning to the terminating `;` is what makes multi-line imports safe — a
 * line-based match would land inside the braces of `import {\n  a,\n} from "x"`.
 */
function endOfLastImport(mask: string): number {
  const re = /^[ \t]*import(?=[\s{"'])/gm;
  let end = -1;
  let match: RegExpExecArray | null;

  while ((match = re.exec(mask)) !== null) {
    const semi = mask.indexOf(";", match.index);
    if (semi === -1) break;
    end = semi + 1;
    re.lastIndex = end;
  }

  return end;
}

/** Leading whitespace of the line containing `offset`. */
function indentAt(code: string, offset: number): string {
  const lineStart = code.lastIndexOf("\n", offset - 1) + 1;
  return /^[ \t]*/.exec(code.slice(lineStart, offset))?.[0] ?? "";
}

/** Apply insertions highest-offset-first so earlier offsets stay valid. */
function applyInsertions(code: string, insertions: { at: number; text: string }[]): string {
  return [...insertions]
    .sort((a, b) => b.at - a.at)
    .reduce((acc, { at, text }) => acc.slice(0, at) + text + acc.slice(at), code);
}

/**
 * Add a module import and its `app.use()` registration to main.ts.
 *
 * Throws when either anchor is missing, so the caller can tell the user what to
 * add by hand rather than reporting a change it did not make.
 */
export function addModuleToMain(mainTsPath: string, moduleName: string): void {
  const code = fs.readFileSync(mainTsPath, "utf-8");
  const mask = maskLiterals(code);
  const pascalName = toPascalCase(moduleName);
  const kebabName = toKebabCase(moduleName);

  // The template closes the plugin chain with `app.use(router)`, so modules go
  // in front of it.
  const routerUse = /^[ \t]*app\.use\(\s*router\s*\)\s*;/m.exec(mask);
  if (!routerUse) {
    throw new Error("Could not find `app.use(router)` in main.ts");
  }

  const importEnd = endOfLastImport(mask);
  if (importEnd === -1) {
    throw new Error("Could not find an import statement in main.ts");
  }

  const indent = indentAt(code, routerUse.index + routerUse[0].length);

  fs.writeFileSync(
    mainTsPath,
    applyInsertions(code, [
      { at: importEnd, text: `\nimport ${pascalName} from "./modules/${kebabName}";` },
      { at: routerUse.index, text: `${indent}app.use(${pascalName});\n` },
    ]),
  );
}

/**
 * Make sure `addMenuItem` is imported, extending the existing framework import
 * when there is one. Returns the updated source.
 */
function ensureMenuItemImport(code: string): string {
  const mask = maskLiterals(code);
  if (/\baddMenuItem\b/.test(mask)) return code;

  // This pattern matches on the module specifier, so it needs the string
  // contents that the default mask blanks out.
  const frameworkImport = /import\s*\{([^}]*)\}\s*from\s*["']@vc-shell\/framework["']/.exec(
    maskLiterals(code, { strings: false }),
  );

  if (frameworkImport) {
    const names = frameworkImport[1].trim().replace(/,$/, "");
    const end = frameworkImport.index + frameworkImport[0].length;
    return (
      code.slice(0, frameworkImport.index) +
      `import { ${names}, addMenuItem } from "@vc-shell/framework"` +
      code.slice(end)
    );
  }

  const statement = `import { addMenuItem } from "@vc-shell/framework";`;
  const importEnd = endOfLastImport(mask);
  return importEnd === -1
    ? `${statement}\n${code}`
    : applyInsertions(code, [{ at: importEnd, text: `\n${statement}` }]);
}

/**
 * Add a menu item registration to bootstrap.ts, after the last existing one.
 */
export function addMenuItemToBootstrap(bootstrapPath: string, moduleName: string): void {
  const kebabName = toKebabCase(moduleName);
  const screamingSnake = toScreamingSnakeCase(moduleName);

  // Adding the import shifts every later offset, so resolve it before locating
  // the insertion point.
  const code = ensureMenuItemImport(fs.readFileSync(bootstrapPath, "utf-8"));
  const mask = maskLiterals(code);

  const buildItem = (indent: string) =>
    [
      `${indent}addMenuItem({`,
      `${indent}  title: "${screamingSnake}.MENU.TITLE",`,
      `${indent}  icon: "lucide-box",`,
      `${indent}  priority: 10,`,
      `${indent}  url: "/${kebabName}",`,
      `${indent}});`,
    ].join("\n");

  // The import reads `addMenuItem }`, never `addMenuItem(`, so it cannot be
  // mistaken for a call here.
  const calls = findCalls(mask, "addMenuItem");
  const last = calls[calls.length - 1];

  if (last) {
    const indent = indentAt(code, last.start);
    fs.writeFileSync(bootstrapPath, applyInsertions(code, [{ at: last.end, text: `\n\n${buildItem(indent)}` }]));
    return;
  }

  // No menu items yet — a project generated without the dashboard. Append to the
  // end of the bootstrap function body.
  const closing = mask.lastIndexOf("}");
  if (closing === -1) {
    throw new Error("Could not find the bootstrap function body in bootstrap.ts");
  }

  fs.writeFileSync(bootstrapPath, applyInsertions(code, [{ at: closing, text: `${buildItem("  ")}\n` }]));
}
