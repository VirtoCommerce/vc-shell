import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const RENAME_MAP: Record<string, string> = {
  ICommonAsset: "AssetLike",
};

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

  // --- Diagnostic: detect useAssets() usage ---
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (name === "useAssets") {
      console.log(
        `  ⚠️  ${fileInfo.path}: useAssets() detected — migrate to useAssetsManager(ref, options). See migration guide #32.`,
      );
    }
    if (name === "AssetsHandler") {
      console.log(
        `  ⚠️  ${fileInfo.path}: AssetsHandler detected — migrate to UseAssetsManagerReturn. See migration guide #32.`,
      );
    }
  });

  // --- Diagnostic: detect AssetsManager handler options ---
  const handlerPatterns = ["assetsEditHandler", "assetsUploadHandler", "assetsRemoveHandler"];
  const source = fileInfo.source;
  for (const pattern of handlerPatterns) {
    if (source.includes(pattern)) {
      console.log(
        `  ⚠️  ${fileInfo.path}: ${pattern} detected — AssetsManager now accepts manager: UseAssetsManagerReturn. See migration guide #32.`,
      );
      break; // one warning per file is enough
    }
  }

  if (renames.length === 0) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
