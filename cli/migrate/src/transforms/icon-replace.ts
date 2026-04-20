import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Mechanically replace well-known non-lucide icons with lucide equivalents.
 * Only replaces icons that have an unambiguous 1:1 mapping.
 * Unknown icons are left for the AI migration-agent (reported by icon-audit).
 */

const REPLACEMENTS: Record<string, string> = {
  "material-add": "lucide-plus",
  "material-refresh": "lucide-refresh-cw",
  "material-delete": "lucide-trash-2",
  "material-save": "lucide-save",
  "material-send": "lucide-send",
  "material-edit": "lucide-pencil",
  "material-edit_square": "lucide-square-pen",
  "material-mail": "lucide-mail",
  "material-schedule": "lucide-clock",
  "material-person_add": "lucide-user-plus",
  "material-content_copy": "lucide-copy",
  "material-close": "lucide-x",
  "material-check": "lucide-check",
  "material-search": "lucide-search",
  "material-settings": "lucide-settings",
  "material-file_export": "lucide-file-output",
  "material-inventory_2": "lucide-package",
  "material-how_to_reg": "lucide-user-check",
  "material-person": "lucide-user",
  "material-group": "lucide-users",
  "material-visibility": "lucide-eye",
  "material-visibility_off": "lucide-eye-off",
  "material-info": "lucide-info",
  "material-warning": "lucide-alert-triangle",
  "material-error": "lucide-alert-circle",
  "material-help": "lucide-help-circle",
  "material-arrow_back": "lucide-arrow-left",
  "material-arrow_forward": "lucide-arrow-right",
  "material-expand_more": "lucide-chevron-down",
  "material-expand_less": "lucide-chevron-up",
  "material-more_vert": "lucide-more-vertical",
  "material-more_horiz": "lucide-more-horizontal",
  "material-filter_list": "lucide-filter",
  "material-sort": "lucide-arrow-up-down",
  "material-link": "lucide-link",
  "material-open_in_new": "lucide-external-link",
  "material-lock": "lucide-lock",
  "material-lock_open": "lucide-unlock",
  "material-star": "lucide-star",
  "material-favorite": "lucide-heart",
  "material-shopping_cart": "lucide-shopping-cart",
  "material-dashboard": "lucide-layout-dashboard",
  "material-home": "lucide-home",
  "material-list": "lucide-list",
  "material-calendar_today": "lucide-calendar",
  "material-image": "lucide-image",
  "material-photo": "lucide-image",
  "material-play_arrow": "lucide-play",
  "material-pause": "lucide-pause",
  "material-stop": "lucide-square",
  "material-receipt": "lucide-receipt",
  "fa-check": "lucide-check",
  "fa-times": "lucide-x",
  "fa-plus": "lucide-plus",
  "fa-edit": "lucide-pencil",
  "fa-trash": "lucide-trash-2",
  "fa-trash-alt": "lucide-trash-2",
  "fa-search": "lucide-search",
  "fa-save": "lucide-save",
  "fa-cog": "lucide-settings",
  "fa-user": "lucide-user",
  "fa-download": "lucide-download",
  "fa-upload": "lucide-upload",
  "bi-plus": "lucide-plus",
  "bi-trash": "lucide-trash-2",
  "bi-pencil": "lucide-pencil",
  "bi-search": "lucide-search",
  "bi-x": "lucide-x",
  "bi-check": "lucide-check",
  "bi-gear": "lucide-settings",
  "bi-person": "lucide-user",
};

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  let source = fileInfo.source;
  let count = 0;

  for (const [oldIcon, newIcon] of Object.entries(REPLACEMENTS)) {
    const escaped = oldIcon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(["'])${escaped}\\1`, "g");
    if (pattern.test(source)) {
      pattern.lastIndex = 0;
      source = source.replace(pattern, `$1${newIcon}$1`);
      count++;
    }
  }

  // Handle FA class syntax: "fas fa-check" → "lucide-check"
  source = source.replace(/["'](?:fas?|far|fal|fab)\s+(fa-[\w-]+)["']/g, (match, faIcon) => {
    const replacement = REPLACEMENTS[faIcon];
    if (replacement) {
      count++;
      const quote = match[0];
      return `${quote}${replacement}${quote}`;
    }
    return match;
  });

  if (count === 0) return null;

  api.report(`${fileInfo.path}: Replaced ${count} icon(s) with lucide equivalents`);
  return source;
};

export default transform;
export const parser = "tsx";
