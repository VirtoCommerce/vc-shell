import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

export interface CopyAssetsArgs {
  sourceFile: string; // absolute path to the source *.docs.md
  targetFile: string; // absolute path to the target *.md (already resolved)
  imageRefs: string[]; // relative paths from the source body
}

export interface CopyAssetsResult {
  copied: string[];
}

export async function copyImageAssets(args: CopyAssetsArgs): Promise<CopyAssetsResult> {
  const sourceDir = path.dirname(args.sourceFile);
  const targetDir = path.dirname(args.targetFile);
  const copied: string[] = [];

  for (const ref of args.imageRefs) {
    const ext = path.extname(ref).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new Error(`disallowed file type for ${ref}: only png/jpg/jpeg/gif/webp/svg are allowed`);
    }
    const srcAbs = path.resolve(sourceDir, ref);
    const dstAbs = path.resolve(targetDir, ref);
    await fs.mkdir(path.dirname(dstAbs), { recursive: true });
    await fs.copyFile(srcAbs, dstAbs);
    copied.push(ref);
  }

  return { copied };
}
