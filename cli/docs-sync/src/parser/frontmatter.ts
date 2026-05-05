import { z } from "zod";
import { ALLOWED_CATEGORIES, ALLOWED_GROUPS } from "../config.js";
import type { Frontmatter } from "../types.js";

const schema = z
  .object({
    title: z.string().min(1),
    category: z.enum(ALLOWED_CATEGORIES),
    group: z.string().min(1),
    slug: z.string().optional(),
    internal: z.boolean().optional(),
  })
  .refine(
    (data) => ALLOWED_GROUPS[data.category]?.includes(data.group) ?? false,
    (data) => ({
      message: `group "${data.group}" is not allowed for category "${data.category}". Allowed: ${ALLOWED_GROUPS[data.category]?.join(", ") ?? "none"}`,
      path: ["group"],
    }),
  );

export type ValidationResult = { success: true; data: Frontmatter } | { success: false; error: string };

export function validateFrontmatter(input: unknown): ValidationResult {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as Frontmatter };
  }
  const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return { success: false, error: message };
}
