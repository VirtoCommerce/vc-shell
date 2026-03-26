import semver from "semver";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { VersionedTransform } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const t = (name: string) => resolve(__dirname, `${name}.js`);

export const transforms: VersionedTransform[] = [
  {
    name: "define-app-module",
    description: "createAppModule(pages, locales) → defineAppModule({...})",
    introducedIn: "2.0.0-alpha.5",
    migrationGuideSection: "Migrating to defineAppModule",
    transformPath: t("define-app-module"),
  },
  {
    name: "use-blade-migration",
    description: "useBladeNavigation() → useBlade() + onBeforeClose boolean inversion",
    introducedIn: "2.0.0-alpha.8",
    migrationGuideSection: "Section 10",
    transformPath: t("use-blade-migration"),
  },
  {
    name: "notification-migration",
    description: "useNotifications → useBladeNotifications",
    introducedIn: "2.0.0-alpha.10",
    migrationGuideSection: "Notifications System Redesign",
    transformPath: t("notification-migration"),
  },
  {
    name: "rewrite-imports",
    description: "Remap imports for symbols moved to /ai-agent, /extensions",
    introducedIn: "2.0.0",
    transformPath: t("rewrite-imports"),
  },
  {
    name: "remove-deprecated-aliases",
    description: "BladeInstance → BladeInstanceKey, etc.",
    introducedIn: "2.0.0",
    transformPath: t("remove-deprecated-aliases"),
  },
  {
    name: "blade-props-simplification",
    description: "Remove boilerplate expanded/closable props and blade event emits",
    introducedIn: "2.0.0",
    transformPath: t("blade-props-simplification"),
  },
  {
    name: "define-options-to-blade",
    description: "defineOptions() → defineBlade() for blade pages (removes notifyType)",
    introducedIn: "2.0.0",
    migrationGuideSection: "defineBlade macro",
    transformPath: t("define-options-to-blade"),
    fileExtensions: [".vue"],
  },
  {
    name: "icon-audit",
    description: "Detect Font Awesome icons, report with suggested replacements (diagnostic-only)",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Section 2",
    transformPath: t("icon-audit"),
  },
  {
    name: "scss-safe-use",
    description: "@import → @use for safe mechanical cases only",
    introducedIn: "2.0.0",
    migrationGuideSection: "Section 3.2",
    scope: "project",
    transformPath: t("scss-safe-use"),
  },
  {
    name: "widgets-migration",
    description: "useWidgets() → useBladeWidgets() with manual migration warnings",
    introducedIn: "2.0.0",
    migrationGuideSection: "Registering Widgets in Blades",
    transformPath: t("widgets-migration"),
  },
  {
    name: "composable-return-types",
    description: "IUsePermissions → UsePermissionsReturn and 19 other type alias renames (20 total)",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 23",
    transformPath: t("composable-return-types"),
  },
  {
    name: "banner-variants",
    description: 'VcBanner variant="light-danger" → "danger", etc.',
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 24",
    transformPath: t("banner-variants"),
  },
  {
    name: "switch-tooltip-prop",
    description: "VcSwitch tooltip → hint prop rename",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 25",
    transformPath: t("switch-tooltip-prop"),
  },
  {
    name: "icon-container-prop",
    description: "VcIcon useContainer prop removal",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 26",
    transformPath: t("icon-container-prop"),
  },
  {
    name: "menu-group-config",
    description: "Detect deprecated group/groupIcon/inGroupPriority menu properties",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 27",
    transformPath: t("menu-group-config"),
  },
  {
    name: "shims-to-globals",
    description: "Replace manual shims-vue.d.ts / vue-i18n.d.ts with @vc-shell/framework/globals",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 30",
    scope: "project",
    transformPath: t("shims-to-globals"),
  },
  {
    name: "use-data-table-sort",
    description: "Replace manual sortField/sortOrder/sortExpression boilerplate with useDataTableSort()",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 31",
    transformPath: t("use-data-table-sort"),
    fileExtensions: [".vue"],
  },
  {
    name: "manual-migration-audit",
    description: "Detect patterns requiring manual migration (useExternalWidgets, moment, useFunctions, closeBlade)",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    transformPath: t("manual-migration-audit"),
  },
  {
    name: "nswag-class-to-interface",
    description: "Migrate consumer code from NSwag class-based to interface-based DTOs",
    introducedIn: "2.0.0-alpha.24",
    scope: "project",
    transformPath: t("nswag-class-to-interface"),
  },
  {
    name: "use-assets-migration",
    description: "ICommonAsset → AssetLike + detect useAssets() for manual migration to useAssetsManager()",
    introducedIn: "2.0.0-alpha.24",
    migrationGuideSection: "Guide 32",
    transformPath: t("use-assets-migration"),
  },
  {
    name: "app-hub-rename",
    description: "disableAppSwitcher → disableAppHub, #app-switcher → #app-hub, useAppSwitcher → useAppHub",
    introducedIn: "2.0.0-alpha.27",
    migrationGuideSection: "Guide 34",
    transformPath: t("app-hub-rename"),
    fileExtensions: [".vue", ".ts"],
  },
  {
    name: "responsive-composable",
    description: "$isMobile.value / inject(IsMobileKey) / inject('isMobile') → useResponsive()",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 36",
    transformPath: t("responsive-composable"),
    fileExtensions: [".vue"],
  },
];

export function selectTransforms(currentVersion: string, targetVersion: string): VersionedTransform[] {
  const current = semver.parse(currentVersion);
  const target = semver.parse(targetVersion);

  if (!current || !target) return [];
  if (semver.gte(currentVersion, targetVersion)) return [];

  return transforms.filter((t) => {
    const introduced = semver.parse(t.introducedIn);
    if (!introduced) return false;
    return semver.lt(currentVersion, t.introducedIn) && semver.lte(t.introducedIn, targetVersion);
  });
}
