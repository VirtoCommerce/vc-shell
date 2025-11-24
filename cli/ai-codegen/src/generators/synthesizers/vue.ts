/**
 * VueSFCSynthesizer
 *
 * Uses create-vc-app to generate base Vue SFC, then modifies it according to UI-Plan.
 * NO manual code generation - leverages existing create-vc-app infrastructure!
 */

import { generateBlade } from "@vc-shell/create-vc-app/src/commands/generate-blade.js";
import type { BladePlan } from "../planners/blade";
import fs from "node:fs/promises";
import path from "node:path";

export interface VueSynthesisOptions {
  /**
   * Project working directory
   */
  cwd: string;

  /**
   * Module name
   */
  moduleName: string;

  /**
   * Entity name
   */
  entityName: string;

  /**
   * Form fields for details blade (JSON string)
   */
  formFields?: string;
}

export interface VueSynthesisResult {
  /**
   * Path to generated blade file
   */
  bladePath: string;

  /**
   * Success flag
   */
  success: boolean;

  /**
   * Error message if failed
   */
  error?: string;
}

/**
 * VueSFCSynthesizer
 *
 * Wraps create-vc-app blade generator and modifies output according to UI-Plan.
 */
export class VueSFCSynthesizer {
  /**
   * Synthesize Vue SFC using create-vc-app + modifications
   */
  async synthesize(
    plan: BladePlan,
    options: VueSynthesisOptions,
  ): Promise<VueSynthesisResult> {
    try {
      // Step 1: Use create-vc-app to generate base blade
      await this.generateBaseBlade(plan, options);

      // Step 2: Modify generated blade according to UI-Plan
      const bladePath = await this.modifyBlade(plan, options);

      return {
        bladePath,
        success: true,
      };
    } catch (error) {
      return {
        bladePath: "",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Step 1: Generate base blade using create-vc-app
   */
  private async generateBaseBlade(
    plan: BladePlan,
    options: VueSynthesisOptions,
  ): Promise<void> {
    // Prepare form fields for details blade
    let formFieldsJson: string | undefined;
    if (plan.type === "details" && plan.component.props) {
      formFieldsJson = this.generateFormFieldsJson(plan);
    }

    // Call create-vc-app in non-interactive mode
    await generateBlade({
      module: options.moduleName,
      type: plan.type === "list" ? "grid" : "details",
      name: options.entityName,
      isWorkspace: plan.isWorkspace,
      composable: true,
      locales: true,
      path: options.cwd,
      formFields: formFieldsJson || options.formFields,
      skipFormEditor: true, // Non-interactive
    });
  }

  /**
   * Step 2: Modify generated blade according to UI-Plan
   */
  private async modifyBlade(plan: BladePlan, options: VueSynthesisOptions): Promise<string> {
    const bladePath = this.getBladePath(plan, options);

    // Read generated blade
    let content = await fs.readFile(bladePath, "utf-8");

    // Apply modifications based on plan
    content = await this.applyPlanModifications(content, plan, options);

    // Write modified content
    await fs.writeFile(bladePath, content, "utf-8");

    return bladePath;
  }

  /**
   * Apply UI-Plan modifications to generated blade
   */
  private async applyPlanModifications(
    content: string,
    plan: BladePlan,
    options: VueSynthesisOptions,
  ): Promise<string> {
    let modified = content;

    // Add framework API imports if needed
    if (plan.frameworkAPIs && plan.frameworkAPIs.length > 0) {
      modified = this.addFrameworkAPIImports(modified, plan.frameworkAPIs);
    }

    // Customize component props
    if (plan.component.props) {
      modified = this.customizeComponentProps(modified, plan);
    }

    // Add slots if specified
    if (plan.component.slots) {
      modified = this.addSlots(modified, plan);
    }

    // Add events if specified
    if (plan.component.events) {
      modified = this.addEvents(modified, plan);
    }

    return modified;
  }

  /**
   * Add framework API imports
   */
  private addFrameworkAPIImports(content: string, apis: string[]): string {
    // Check if framework imports already exist
    const frameworkImportRegex = /import\s+{([^}]+)}\s+from\s+["']@vc-shell\/framework["']/;
    const match = content.match(frameworkImportRegex);

    if (match) {
      // Add missing APIs to existing import
      const existingApis = match[1].split(",").map((s) => s.trim());
      const missingApis = apis.filter((api) => !existingApis.includes(api));

      if (missingApis.length > 0) {
        const newImports = [...existingApis, ...missingApis].join(", ");
        return content.replace(frameworkImportRegex, `import { ${newImports} } from "@vc-shell/framework"`);
      }
    } else {
      // Add new framework import
      const importStatement = `import { ${apis.join(", ")} } from "@vc-shell/framework";\n`;
      // Insert after existing imports
      const lastImportIndex = content.lastIndexOf("import ");
      if (lastImportIndex !== -1) {
        const endOfLineIndex = content.indexOf("\n", lastImportIndex);
        return content.slice(0, endOfLineIndex + 1) + importStatement + content.slice(endOfLineIndex + 1);
      }
    }

    return content;
  }

  /**
   * Customize component props
   */
  private customizeComponentProps(content: string, plan: BladePlan): string {
    // This is a simplified version - real implementation would parse Vue SFC
    // and modify props more intelligently
    return content;
  }

  /**
   * Add slots to template
   */
  private addSlots(content: string, plan: BladePlan): string {
    // Simplified - real implementation would use Vue template parser
    return content;
  }

  /**
   * Add events to template
   */
  private addEvents(content: string, plan: BladePlan): string {
    // Simplified - real implementation would use Vue template parser
    return content;
  }

  /**
   * Generate form fields JSON for create-vc-app
   */
  private generateFormFieldsJson(plan: BladePlan): string {
    // Extract form fields from plan.component.props
    const fields: any[] = [];

    // This is simplified - real implementation would map plan props to form fields
    if (plan.component.props) {
      // Example: convert props to form fields
      Object.entries(plan.component.props).forEach(([key, value]: [string, any]) => {
        if (typeof value === "object" && value.type) {
          fields.push({
            name: key,
            type: this.mapTypeToFormField(value.type),
            required: value.required || false,
            label: value.label || key,
          });
        }
      });
    }

    return JSON.stringify(fields);
  }

  /**
   * Map prop type to form field type
   */
  private mapTypeToFormField(type: string): string {
    const typeMap: Record<string, string> = {
      string: "text",
      number: "number",
      boolean: "checkbox",
      date: "date",
      array: "multivalue",
    };

    return typeMap[type] || "text";
  }

  /**
   * Get blade file path
   */
  private getBladePath(plan: BladePlan, options: VueSynthesisOptions): string {
    const modulePath = path.join(options.cwd, "src", "modules", options.moduleName);
    const bladeName = plan.id + ".vue";
    return path.join(modulePath, "pages", bladeName);
  }
}
