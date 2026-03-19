import semver from "semver";
import type { VersionedTransform } from "./types.js";
import { runDefineAppModule } from "./define-app-module.js";
import { runRemoveDeprecatedAliases } from "./remove-deprecated-aliases.js";
import { runNotificationMigration } from "./notification-migration.js";

// Placeholder run functions — each will be replaced by real transforms
const placeholder = () => ({
  filesModified: [],
  filesSkipped: [],
  warnings: [],
  errors: [],
});

export const transforms: VersionedTransform[] = [
  {
    name: "define-app-module",
    description: "createAppModule(pages, locales) → defineAppModule({...})",
    introducedIn: "2.0.0-alpha.5",
    migrationGuideSection: "Migrating to defineAppModule",
    run: runDefineAppModule,
  },
  {
    name: "use-blade-migration",
    description: "useBladeNavigation() → useBlade() + onBeforeClose boolean inversion",
    introducedIn: "2.0.0-alpha.8",
    migrationGuideSection: "Section 10",
    run: placeholder,
  },
  {
    name: "notification-migration",
    description: "useNotifications → useBladeNotifications",
    introducedIn: "2.0.0-alpha.10",
    migrationGuideSection: "Notifications System Redesign",
    run: runNotificationMigration,
  },
  {
    name: "rewrite-imports",
    description: "Remap imports for symbols moved to /ai-agent, /extensions",
    introducedIn: "2.0.0",
    run: placeholder,
  },
  {
    name: "remove-deprecated-aliases",
    description: "BladeInstance → BladeInstanceKey, etc.",
    introducedIn: "2.0.0",
    run: runRemoveDeprecatedAliases,
  },
  {
    name: "blade-props-simplification",
    description: "Remove boilerplate expanded/closable props and blade event emits",
    introducedIn: "2.0.0",
    run: placeholder,
  },
  {
    name: "icon-audit",
    description: "Detect Font Awesome icons, report with suggested replacements (diagnostic-only)",
    introducedIn: "2.0.0",
    diagnosticOnly: true,
    migrationGuideSection: "Section 2",
    run: placeholder,
  },
  {
    name: "scss-safe-use",
    description: "@import → @use for safe mechanical cases only",
    introducedIn: "2.0.0",
    migrationGuideSection: "Section 3.2",
    run: placeholder,
  },
];

/**
 * Select transforms that apply for a given version migration.
 * A transform runs when:
 * 1. semver.lt(currentVersion, transform.introducedIn) — current is below the breaking change
 * 2. semver.lte(transform.introducedIn, targetVersion) — the breaking change exists in target
 */
export function selectTransforms(
  currentVersion: string,
  targetVersion: string,
): VersionedTransform[] {
  const current = semver.parse(currentVersion);
  const target = semver.parse(targetVersion);

  if (!current || !target) return [];
  if (semver.gte(currentVersion, targetVersion)) return [];

  return transforms.filter((t) => {
    const introduced = semver.parse(t.introducedIn);
    if (!introduced) return false;
    return (
      semver.lt(currentVersion, t.introducedIn) &&
      semver.lte(t.introducedIn, targetVersion)
    );
  });
}
