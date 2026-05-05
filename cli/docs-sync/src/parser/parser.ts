import fs from "node:fs/promises";
import matter from "gray-matter";
import { validateFrontmatter } from "./frontmatter.js";
import { findRelativeImageRefs } from "./images.js";
import type { ParsedDoc } from "../types.js";

export class FrontmatterError extends Error {
  constructor(
    public readonly file: string,
    message: string,
  ) {
    super(`[${file}] ${message}`);
    this.name = "FrontmatterError";
  }
}

export async function parseDocFile(absolutePath: string): Promise<ParsedDoc> {
  const raw = await fs.readFile(absolutePath, "utf8");
  const parsed = matter(raw);

  const validation = validateFrontmatter(parsed.data);
  if (!validation.success) {
    throw new FrontmatterError(absolutePath, validation.error);
  }

  return {
    sourcePath: absolutePath,
    frontmatter: validation.data,
    body: parsed.content,
    imageRefs: findRelativeImageRefs(parsed.content),
  };
}
