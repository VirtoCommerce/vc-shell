import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const VCTABLE_PATTERN = /<VcTable[\s\n>]/;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  // Only audit .vue files
  if (!fileInfo.path.endsWith(".vue")) return null;

  if (VCTABLE_PATTERN.test(fileInfo.source)) {
    api.report(
      `${fileInfo.path}: Uses <VcTable> — must be migrated to <VcDataTable>. ` +
        `See migration guide: VcTable → VcDataTable.`,
    );
  }

  return null; // Never modify — diagnostic only
};

export default transform;
export const parser = "tsx";
