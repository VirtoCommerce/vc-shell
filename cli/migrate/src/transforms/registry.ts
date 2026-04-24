import semver from "semver";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import type { VersionedTransform } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const t = (name: string) => resolve(__dirname, `${name}.js`);

export const transforms: VersionedTransform[] = [
  {
    name: "remove-release-config",
    description: "Remove deprecated @vc-shell/release-config and scripts/release.ts",
    introducedIn: "2.0.0",
    scope: "project",
    transformPath: t("remove-release-config"),
  },
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
    after: ["define-options-to-blade"],
  },
  {
    name: "define-expose-to-children",
    description: "defineExpose() → exposeToChildren() from useBlade() in blade pages",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 11",
    transformPath: t("define-expose-to-children"),
    fileExtensions: [".vue"],
    after: ["define-options-to-blade"],
  },
  {
    name: "blade-events-cleanup",
    description: "Remove @parent:call, @close:blade, @collapse:blade, @expand:blade from all .vue files",
    introducedIn: "2.0.0",
    transformPath: t("blade-events-cleanup"),
    fileExtensions: [".vue"],
    after: ["blade-props-simplification"],
  },
  {
    name: "define-options-to-blade",
    description: "defineOptions() → defineBlade() for blade pages (removes notifyType)",
    introducedIn: "2.0.0",
    migrationGuideSection: "defineBlade macro",
    transformPath: t("define-options-to-blade"),
    fileExtensions: [".vue"],
    after: ["use-blade-migration"],
  },
  {
    name: "icon-replace",
    description: "Replace well-known material-/bi-/fa- icons with lucide equivalents",
    introducedIn: "2.0.0",
    transformPath: t("icon-replace"),
  },
  {
    name: "icon-audit",
    description: "Detect non-lucide icons (material-/bi-/fa-) and suggest lucide replacements (diagnostic-only)",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Section 2",
    transformPath: t("icon-audit"),
    after: ["icon-replace"],
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
    name: "vctable-audit",
    description: "Detect <VcTable> usage for migration to <VcDataTable> (diagnostic-only)",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "VcTable → VcDataTable",
    transformPath: t("vctable-audit"),
    fileExtensions: [".vue"],
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
    name: "replace-cover-method",
    description: "openBlade({ replaceCurrentBlade: true }) → coverWith()",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 12",
    transformPath: t("replace-cover-method"),
    fileExtensions: [".vue", ".ts"],
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
  {
    name: "use-blade-form",
    description: "Detect useForm + useBeforeUnload + useModificationTracker patterns for migration to useBladeForm()",
    introducedIn: "2.0.0-alpha.31",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 37",
    transformPath: t("use-blade-form"),
    fileExtensions: [".vue", ".ts"],
  },
  {
    name: "remove-pathmatch-route",
    description: "Remove /:pathMatch(.*)*  catch-all route (now built into framework)",
    introducedIn: "2.0.0",
    transformPath: t("remove-pathmatch-route"),
    fileExtensions: [".ts"],
    after: ["use-blade-migration"],
  },
  {
    name: "locale-imports",
    description: "@vc-shell/framework/dist/locales/*.json → @vc-shell/framework/locales/*",
    introducedIn: "2.0.0",
    migrationGuideSection: "Guide 33",
    transformPath: t("locale-imports"),
    fileExtensions: [".ts"],
  },
  {
    name: "dynamic-properties-refactor",
    description:
      "useDynamicProperties<A,B,C,D,E>(fn, Class, Class, fn) → useDynamicProperties({ searchDictionary, searchMeasurements })",
    introducedIn: "2.0.0-alpha.31",
    migrationGuideSection: "Guide 38",
    transformPath: t("dynamic-properties-refactor"),
    fileExtensions: [".vue"],
  },
  {
    name: "window-globals",
    description: "Detect removed window.Vue/window._/window.moment globals",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 04",
    transformPath: t("window-globals"),
  },
  {
    name: "remove-global-components",
    description: "Add explicit imports for globally registered Vc* components and directives",
    introducedIn: "2.0.0-alpha.32",
    migrationGuideSection: "Guide 40",
    transformPath: t("remove-global-components"),
    fileExtensions: [".vue"],
  },
  {
    name: "remove-expose-title",
    description: "Remove deprecated `title` from exposeToChildren({...}) — computed refs no longer allowed",
    introducedIn: "2.0.0-alpha.33",
    transformPath: t("remove-expose-title"),
    fileExtensions: [".vue", ".ts"],
    after: ["define-expose-to-children"],
  },
  {
    name: "remove-app-module-options",
    description:
      "Remove `{ router }` second argument from .use(AppModule, { router }) — defineAppModule takes no options",
    introducedIn: "2.0.0-alpha.33",
    transformPath: t("remove-app-module-options"),
    fileExtensions: [".ts"],
    after: ["define-app-module"],
  },
  {
    name: "vc-blade-loading-prop",
    description: 'Convert <VcBlade v-loading="X"> to <VcBlade :loading="X"> — use built-in blade loading prop',
    introducedIn: "2.0.0-alpha.33",
    transformPath: t("vc-blade-loading-prop"),
    fileExtensions: [".vue"],
  },
  {
    name: "use-data-table-pagination-audit",
    description:
      "Detect manual pagination boilerplate (totalCount/pages/currentPage triple, onPaginationClick) — migrate to useDataTablePagination",
    introducedIn: "2.0.0-alpha.33",
    diagnosticOnly: true,
    migrationGuideSection: "Guide 41",
    transformPath: t("use-data-table-pagination-audit"),
    fileExtensions: [".ts", ".vue"],
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

    const afterCurrent = semver.lt(currentVersion, t.introducedIn);

    // When current is a prerelease (e.g. 2.0.0-alpha.28), include transforms
    // introduced in earlier prereleases of the same release (e.g. 2.0.0-alpha.5).
    // Users may not have run the migrator at every alpha bump, so these transforms
    // could still be unapplied. The transforms are idempotent (return null if
    // nothing to change), so re-running is safe.
    const isPrereleaseRetrofit =
      !afterCurrent &&
      current.prerelease.length > 0 &&
      introduced.prerelease.length > 0 &&
      current.major === introduced.major &&
      current.minor === introduced.minor &&
      current.patch === introduced.patch;

    if (!afterCurrent && !isPrereleaseRetrofit) return false;

    // Normal case: introducedIn <= targetVersion
    if (semver.lte(t.introducedIn, targetVersion)) return true;

    // Special case: target is a prerelease (e.g. 2.0.0-alpha.32) and introducedIn
    // is the corresponding stable release (e.g. 2.0.0) with no prerelease tag.
    // Prereleases are on the path to that release, so include the transform.
    // Without this, semver.lte("2.0.0", "2.0.0-alpha.32") returns false.
    if (
      target.prerelease.length > 0 &&
      introduced.prerelease.length === 0 &&
      target.major === introduced.major &&
      target.minor === introduced.minor &&
      target.patch === introduced.patch
    ) {
      return true;
    }

    return false;
  });
}
