/**
 * App Detector
 *
 * Detects if a directory is a valid VC-Shell application.
 * Checks for required files and dependencies.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface SuggestedAction {
  tool: string;
  params: Record<string, unknown>;
  description: string;
}

export interface AppDetectionResult {
  isValid: boolean;
  isVcShellApp: boolean;
  hasPackageJson: boolean;
  hasVcShellDependencies: boolean;
  hasBootstrap: boolean;
  hasModulesDir: boolean;
  projectName?: string;
  vcShellVersion?: string;
  errors: string[];
  warnings: string[];
  suggestedAction?: SuggestedAction;
}

/**
 * Detect if a directory is a valid VC-Shell application
 *
 * Checks for:
 * 1. package.json exists
 * 2. @vc-shell dependencies in package.json
 * 3. src/bootstrap.ts exists
 * 4. src/modules directory exists
 */
export function detectVcShellApp(cwd: string): AppDetectionResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Helper to generate suggested app name from cwd
  const suggestAppName = (dir: string): string => {
    const baseName = path.basename(dir);
    // Convert to kebab-case and add -app suffix if not present
    const kebabName = baseName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
    return kebabName.endsWith("-app") ? kebabName : `${kebabName}-app`;
  };

  // Check if directory exists
  if (!fs.existsSync(cwd)) {
    const suggestedName = suggestAppName(cwd);
    return {
      isValid: false,
      isVcShellApp: false,
      hasPackageJson: false,
      hasVcShellDependencies: false,
      hasBootstrap: false,
      hasModulesDir: false,
      errors: [`Directory does not exist: ${cwd}`],
      warnings: [],
      suggestedAction: {
        tool: "scaffold_app",
        params: {
          projectName: suggestedName,
          targetDirectory: path.dirname(cwd),
        },
        description: `Create a new VC-Shell app '${suggestedName}' in ${path.dirname(cwd)}`,
      },
    };
  }

  // Check package.json
  const packageJsonPath = path.join(cwd, "package.json");
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (!hasPackageJson) {
    const suggestedName = suggestAppName(cwd);
    errors.push("package.json not found. This doesn't appear to be a Node.js project.");
    return {
      isValid: false,
      isVcShellApp: false,
      hasPackageJson: false,
      hasVcShellDependencies: false,
      hasBootstrap: false,
      hasModulesDir: false,
      errors,
      warnings,
      suggestedAction: {
        tool: "scaffold_app",
        params: {
          projectName: suggestedName,
          targetDirectory: cwd,
        },
        description: `Create a new VC-Shell app '${suggestedName}' in ${cwd}`,
      },
    };
  }

  // Parse package.json
  let packageJson: any;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  } catch (e) {
    errors.push("Failed to parse package.json");
    return {
      isValid: false,
      isVcShellApp: false,
      hasPackageJson: true,
      hasVcShellDependencies: false,
      hasBootstrap: false,
      hasModulesDir: false,
      errors,
      warnings,
    };
  }

  // Check for @vc-shell dependencies
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const vcShellDeps = Object.keys(deps).filter((dep) => dep.startsWith("@vc-shell/"));
  const hasVcShellDependencies = vcShellDeps.length > 0;

  // Get VC-Shell version from @vc-shell/framework
  const vcShellVersion = deps["@vc-shell/framework"];

  if (!hasVcShellDependencies) {
    const suggestedName = packageJson.name || suggestAppName(cwd);
    errors.push(
      "No @vc-shell/* dependencies found in package.json.",
      "This doesn't appear to be a VC-Shell application.",
    );
    return {
      isValid: false,
      isVcShellApp: false,
      hasPackageJson: true,
      hasVcShellDependencies: false,
      hasBootstrap: false,
      hasModulesDir: false,
      projectName: packageJson.name,
      errors,
      warnings,
      suggestedAction: {
        tool: "scaffold_app",
        params: {
          projectName: suggestedName,
          targetDirectory: path.dirname(cwd),
        },
        description: `Create a new VC-Shell app '${suggestedName}' (current project is not a VC-Shell app)`,
      },
    };
  }

  // Check for bootstrap.ts
  const bootstrapPath = path.join(cwd, "src", "bootstrap.ts");
  const hasBootstrap = fs.existsSync(bootstrapPath);

  if (!hasBootstrap) {
    warnings.push(
      "src/bootstrap.ts not found.",
      "Module registration may require manual setup.",
    );
  }

  // Check for modules directory
  const modulesDir = path.join(cwd, "src", "modules");
  const hasModulesDir = fs.existsSync(modulesDir);

  if (!hasModulesDir) {
    warnings.push(
      "src/modules directory not found.",
      "Directory will be created when generating modules.",
    );
  }

  // All checks passed
  const isValid = hasPackageJson && hasVcShellDependencies;
  const isVcShellApp = isValid;

  return {
    isValid,
    isVcShellApp,
    hasPackageJson,
    hasVcShellDependencies,
    hasBootstrap,
    hasModulesDir,
    projectName: packageJson.name,
    vcShellVersion,
    errors,
    warnings,
  };
}

/**
 * Validate cwd for code generation
 *
 * Returns validation result with clear error messages and suggested action.
 */
export function validateCwdForGeneration(cwd?: string): {
  valid: boolean;
  cwd: string;
  errors: string[];
  warnings: string[];
  appInfo?: AppDetectionResult;
  suggestedAction?: SuggestedAction;
} {
  // Check if cwd is provided
  if (!cwd) {
    return {
      valid: false,
      cwd: "",
      errors: [
        "Working directory (cwd) is required for code generation.",
        "Please provide 'cwd' parameter pointing to your VC-Shell project root.",
      ],
      warnings: [],
      suggestedAction: {
        tool: "scaffold_app",
        params: {
          projectName: "my-app",
          targetDirectory: process.cwd(),
        },
        description: "Create a new VC-Shell app in the current directory",
      },
    };
  }

  // Resolve to absolute path
  const absoluteCwd = path.isAbsolute(cwd) ? cwd : path.resolve(process.cwd(), cwd);

  // Detect if it's a valid VC-Shell app
  const appInfo = detectVcShellApp(absoluteCwd);

  if (!appInfo.isValid) {
    return {
      valid: false,
      cwd: absoluteCwd,
      errors: appInfo.errors,
      warnings: appInfo.warnings,
      appInfo,
      suggestedAction: appInfo.suggestedAction,
    };
  }

  return {
    valid: true,
    cwd: absoluteCwd,
    errors: [],
    warnings: appInfo.warnings,
    appInfo,
  };
}
