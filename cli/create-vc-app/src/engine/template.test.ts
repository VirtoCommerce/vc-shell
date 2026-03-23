import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { renderTemplate, renderDir, emptyDir, isDirEmpty } from "./template.js";

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "template-test-"));
}

describe("renderTemplate", () => {
  let dir: string;

  beforeEach(() => {
    dir = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("renders EJS variables and strips .ejs extension", () => {
    const src = path.join(dir, "input.ts.ejs");
    fs.writeFileSync(src, 'const name = "<%- Name %>";');

    const out = path.join(dir, "output.ts.ejs");
    renderTemplate(src, out, { Name: "Hello" });

    // .ejs stripped from output
    const result = fs.readFileSync(path.join(dir, "output.ts"), "utf-8");
    expect(result).toBe('const name = "Hello";');
  });

  it("copies binary files as-is", () => {
    const src = path.join(dir, "image.png");
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    fs.writeFileSync(src, buf);

    const out = path.join(dir, "out", "image.png");
    renderTemplate(src, out, {});

    expect(fs.readFileSync(out)).toEqual(buf);
  });

  it("creates parent directories if missing", () => {
    const src = path.join(dir, "file.txt");
    fs.writeFileSync(src, "hello");

    const out = path.join(dir, "a", "b", "c", "file.txt");
    renderTemplate(src, out, {});

    expect(fs.readFileSync(out, "utf-8")).toBe("hello");
  });
});

describe("renderDir", () => {
  let dir: string;

  beforeEach(() => {
    dir = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("recursively renders all files", () => {
    const tplDir = path.join(dir, "tpl");
    fs.mkdirSync(path.join(tplDir, "sub"), { recursive: true });
    fs.writeFileSync(path.join(tplDir, "root.txt"), "root <%- x %>");
    fs.writeFileSync(path.join(tplDir, "sub", "nested.txt"), "nested <%- x %>");

    const outDir = path.join(dir, "out");
    renderDir(tplDir, outDir, { x: "OK" });

    expect(fs.readFileSync(path.join(outDir, "root.txt"), "utf-8")).toBe("root OK");
    expect(fs.readFileSync(path.join(outDir, "sub", "nested.txt"), "utf-8")).toBe("nested OK");
  });

  it("renames underscore-prefixed files to dot-prefixed", () => {
    const tplDir = path.join(dir, "tpl");
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, "_gitignore"), "node_modules");

    const outDir = path.join(dir, "out");
    renderDir(tplDir, outDir, {});

    expect(fs.existsSync(path.join(outDir, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "_gitignore"))).toBe(false);
  });

  it("does nothing for non-existent template dir", () => {
    const outDir = path.join(dir, "out");
    renderDir(path.join(dir, "nope"), outDir, {});
    expect(fs.existsSync(outDir)).toBe(false);
  });
});

describe("emptyDir", () => {
  it("removes contents but keeps directory and .git", () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, "file.txt"), "data");
    fs.mkdirSync(path.join(dir, ".git"));
    fs.writeFileSync(path.join(dir, ".git", "HEAD"), "ref");
    fs.mkdirSync(path.join(dir, "subdir"));
    fs.writeFileSync(path.join(dir, "subdir", "nested.txt"), "data");

    emptyDir(dir);

    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(path.join(dir, ".git", "HEAD"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "file.txt"))).toBe(false);
    expect(fs.existsSync(path.join(dir, "subdir"))).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("isDirEmpty", () => {
  it("returns true for non-existent dir", () => {
    expect(isDirEmpty("/tmp/does-not-exist-" + Date.now())).toBe(true);
  });

  it("returns true for empty dir", () => {
    const dir = tmpDir();
    expect(isDirEmpty(dir)).toBe(true);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns true for dir with only .git", () => {
    const dir = tmpDir();
    fs.mkdirSync(path.join(dir, ".git"));
    expect(isDirEmpty(dir)).toBe(true);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns false for dir with files", () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, "file.txt"), "data");
    expect(isDirEmpty(dir)).toBe(false);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
