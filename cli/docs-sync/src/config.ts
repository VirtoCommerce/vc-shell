import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// vc-shell repo root: cli/docs-sync/src/ → ../../..
export const FRAMEWORK_ROOT = path.resolve(__dirname, "../../..");

export const FRAMEWORK_DIR = path.join(FRAMEWORK_ROOT, "framework");

export const VC_DOCS_RELATIVE_BASE = "platform/developer-guide/docs/custom-apps-development/vc-shell";

export const STORYBOOK_URL = "https://vc-shell-storybook.govirto.com";

export const ALLOWED_CATEGORIES = ["components", "composables", "concepts", "plugins", "reference"] as const;

export type Category = (typeof ALLOWED_CATEGORIES)[number];

// Allowed groups per category. Match the spec's structure section exactly.
export const ALLOWED_GROUPS: Record<Category, string[]> = {
  components: ["layout", "form", "data-display", "feedback", "navigation", "media", "misc"],
  composables: ["blade-navigation", "data", "ui-state", "services", "user", "notifications", "forms", "utilities"],
  concepts: ["root"], // concepts has no sub-grouping; group="root" → file lands at concepts/<slug>.md
  plugins: ["root"],
  reference: ["api", "api/directives", "modules", "cli"],
};

// Folders inside vc-docs that the generator MUST NOT touch.
export const MANUAL_ONLY_FOLDERS = [
  "introduction",
  "getting-started",
  "guides",
  "concepts",
  "reference/migration",
  "reference/cli",
];
