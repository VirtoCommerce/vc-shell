import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const RENAME_MAP: Record<string, string> = {
  ICommonAsset: "AssetLike",
};

/**
 * Detect which useAssets() usage pattern is present and provide specific guidance.
 *
 * Known patterns:
 * 1. "handler-object" — destructure useAssets() + build assetsHandler/defaultImageHandlers object
 * 2. "single-image"   — useAssets() for a single image (iconUrl, logo, photo), often with computed get/set
 * 3. "injectable"     — Props accept custom imageHandlers with fallback to default
 * 4. "composable"     — useAssets() inside a composable (not a .vue file)
 */
function detectPattern(source: string, filePath: string): string {
  const isVue = filePath.endsWith(".vue");
  const hasHandlerObject =
    /(?:assetsHandler|imageHandler|defaultImageHandler)\s*[=:]/.test(source);
  const hasInjectableProps =
    /imageHandlers\??\s*[:{]/.test(source) || /props\.imageHandlers/.test(source);
  const hasSingleImagePattern =
    /(?:iconUrl|logo|photo|avatar)\s*[=:]/.test(source) &&
    !/\.images\s*[=]/.test(source);

  if (hasInjectableProps) return "injectable";
  if (hasSingleImagePattern && !hasHandlerObject) return "single-image";
  if (hasHandlerObject) return "handler-object";
  if (!isVue) return "composable";
  return "handler-object"; // default
}

function extractUploadPath(source: string): string | null {
  // Match patterns like: upload(files, `some/path/${id}`) or upload(files, "some/path")
  const match = source.match(/(?:upload|uploadImage)\s*\([^,]+,\s*(`[^`]+`|"[^"]+"|'[^']+')/);
  return match ? match[1] : null;
}

function extractTargetRef(source: string): string | null {
  // Match patterns like: offer.value.images = [..., ...uploaded] or item.value.productData.images =
  const match = source.match(
    /(\w+\.value(?:\.\w+)*\.(?:images|image|photo|iconUrl|logo))\s*=/,
  );
  return match ? match[1] : null;
}

function hasConfirmation(source: string): boolean {
  return /showConfirmation/.test(source) && /remove|delete/i.test(source);
}

function formatDiagnostic(
  filePath: string,
  pattern: string,
  uploadPath: string | null,
  targetRef: string | null,
  hasConfirm: boolean,
): string {
  const lines: string[] = [];
  lines.push(`  ⚠️  ${filePath}:`);

  switch (pattern) {
    case "handler-object":
      lines.push(`    Pattern: useAssets() + handler object (upload/remove/edit)`);
      if (targetRef) lines.push(`    Target ref: ${targetRef}`);
      if (uploadPath) lines.push(`    Upload path: ${uploadPath}`);
      if (hasConfirm) lines.push(`    Has confirmation: yes`);
      lines.push(`    → Replace with: useAssetsManager(ref, { uploadPath: () => ..., ${hasConfirm ? "confirmRemove: () => showConfirmation(...)" : ""} })`);
      lines.push(`    → See migration guide #32, example 1`);
      break;

    case "single-image":
      lines.push(`    Pattern: useAssets() for single image (photo/logo/icon)`);
      if (targetRef) lines.push(`    Target ref: ${targetRef}`);
      if (uploadPath) lines.push(`    Upload path: ${uploadPath}`);
      lines.push(`    → Wrap single value in computed array ref, then use useAssetsManager()`);
      lines.push(`    → See migration guide #32, example 2`);
      break;

    case "injectable":
      lines.push(`    Pattern: useAssets() + injectable Props.imageHandlers with fallback`);
      if (targetRef) lines.push(`    Target ref: ${targetRef}`);
      lines.push(`    → Complex: parent can override handlers. Create useAssetsManager() for defaults,`);
      lines.push(`      accept optional manager override in Props instead of raw handler functions.`);
      lines.push(`    → See migration guide #32, example 4`);
      break;

    case "composable":
      lines.push(`    Pattern: useAssets() inside a composable function`);
      if (targetRef) lines.push(`    Target ref: ${targetRef}`);
      if (uploadPath) lines.push(`    Upload path: ${uploadPath}`);
      lines.push(`    → Replace with useAssetsManager(ref, options) inside the composable`);
      lines.push(`    → Return the manager instance instead of separate upload/remove functions`);
      lines.push(`    → See migration guide #32, example 3`);
      break;
  }

  return lines.join("\n");
}

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  // --- Automatic: rename ICommonAsset → AssetLike ---
  const renames: Array<{ old: string; new: string }> = [];
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (RENAME_MAP[name]) {
      renames.push({ old: name, new: RENAME_MAP[name] });
    }
  });

  if (renames.length > 0) {
    for (const r of renames) {
      root.find(j.Identifier, { name: r.old }).forEach((path) => {
        path.node.name = r.new;
      });
    }
  }

  // --- Smart diagnostic: detect useAssets() pattern and provide specific guidance ---
  const hasUseAssets = frameworkImports
    .find(j.ImportSpecifier)
    .filter((path) => {
      const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
      return name === "useAssets";
    })
    .size() > 0;

  if (hasUseAssets) {
    const source = fileInfo.source;
    const pattern = detectPattern(source, fileInfo.path);
    const uploadPath = extractUploadPath(source);
    const targetRef = extractTargetRef(source);
    const hasConfirm = hasConfirmation(source);

    console.log(formatDiagnostic(fileInfo.path, pattern, uploadPath, targetRef, hasConfirm));
  }

  // --- Diagnostic: detect AssetsHandler type usage ---
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (name === "AssetsHandler") {
      console.log(
        `  ⚠️  ${fileInfo.path}: AssetsHandler<T> detected — replace with UseAssetsManagerReturn. See migration guide #32.`,
      );
    }
  });

  // --- Diagnostic: detect AssetsManager blade handler options ---
  const handlerPatterns = ["assetsEditHandler", "assetsUploadHandler", "assetsRemoveHandler"];
  const source = fileInfo.source;
  for (const pattern of handlerPatterns) {
    if (source.includes(pattern)) {
      console.log(
        `  ⚠️  ${fileInfo.path}: AssetsManager handler options detected (${pattern}).`,
      );
      console.log(
        `    → Replace options.assets/assetsUploadHandler/assetsEditHandler/assetsRemoveHandler`,
      );
      console.log(
        `      with options.manager: markRaw(useAssetsManagerInstance). See migration guide #32, example 5.`,
      );
      break;
    }
  }

  // --- Diagnostic: detect openBlade calls that open AssetsManager/AssetsDetails with old options ---
  const bladeCallPattern = /name:\s*["']AssetsManager["']/;
  if (bladeCallPattern.test(source)) {
    const hasOldOptions = /assetsUploadHandler|assetsEditHandler|assetsRemoveHandler|loading:\s*\w+Loading/.test(source);
    if (hasOldOptions) {
      console.log(
        `  ⚠️  ${fileInfo.path}: openBlade("AssetsManager") uses old handler options.`,
      );
      console.log(
        `    → Replace assets/loading/assetsUploadHandler/assetsEditHandler/assetsRemoveHandler`,
      );
      console.log(
        `      with { manager: markRaw(useAssetsManagerInstance) }. See migration guide #32, example 5.`,
      );
    } else if (!source.includes("markRaw") && /manager\s*:/.test(source)) {
      console.log(
        `  ⚠️  ${fileInfo.path}: openBlade("AssetsManager") passes manager without markRaw().`,
      );
      console.log(
        `    → Wrap with markRaw() to prevent Vue reactive proxy unwrap. See migration guide #32.`,
      );
    }
  }

  const detailsCallPattern = /name:\s*["']AssetsDetails["']/;
  if (detailsCallPattern.test(source)) {
    if (/ICommonAsset/.test(source)) {
      console.log(
        `  ⚠️  ${fileInfo.path}: openBlade("AssetsDetails") uses ICommonAsset type.`,
      );
      console.log(
        `    → Replace ICommonAsset with AssetLike. See migration guide #32, example 6.`,
      );
    }
  }

  if (renames.length === 0) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
