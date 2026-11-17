import { getExtensionLabel } from "@core/utilities/assets";

// getExtensionLabel returns the whole name when there is no dot ("README" -> "README").
export function fileLabel(name: string | undefined): string {
  return name && name.lastIndexOf(".") > 0 ? getExtensionLabel(name) : "FILE";
}
