import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { copyImageAssets } from "../src/writer/assets.js";

describe("copyImageAssets", () => {
  let tmpSrc: string;
  let tmpDst: string;
  beforeEach(async () => {
    tmpSrc = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-src-"));
    tmpDst = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-dst-"));
    await fs.mkdir(path.join(tmpSrc, "images"), { recursive: true });
    await fs.writeFile(path.join(tmpSrc, "images/a.png"), "PNGDATA");
    await fs.writeFile(path.join(tmpSrc, "images/b.png"), "PNGDATA-B");
  });
  afterEach(async () => {
    await fs.rm(tmpSrc, { recursive: true, force: true });
    await fs.rm(tmpDst, { recursive: true, force: true });
  });

  it("copies referenced images to parallel target path", async () => {
    const result = await copyImageAssets({
      sourceFile: path.join(tmpSrc, "doc.docs.md"),
      targetFile: path.join(tmpDst, "components/misc/doc.md"),
      imageRefs: ["./images/a.png", "./images/b.png"],
    });
    expect(result.copied).toEqual(["./images/a.png", "./images/b.png"]);
    const a = await fs.readFile(path.join(tmpDst, "components/misc/images/a.png"), "utf8");
    expect(a).toBe("PNGDATA");
  });

  it("rejects forbidden file types", async () => {
    await fs.writeFile(path.join(tmpSrc, "images/c.mp4"), "MP4");
    await expect(
      copyImageAssets({
        sourceFile: path.join(tmpSrc, "doc.docs.md"),
        targetFile: path.join(tmpDst, "components/misc/doc.md"),
        imageRefs: ["./images/c.mp4"],
      }),
    ).rejects.toThrow(/disallowed file type/);
  });
});
