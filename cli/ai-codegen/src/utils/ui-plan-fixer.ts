/**
 * UI-Plan Auto-Fixer
 * Automatically fixes common UI-Plan validation errors
 */

export interface FixResult {
  fixed: boolean;
  changes: string[];
  plan: any;
}

/**
 * Auto-fix common UI-Plan errors
 */
export function autoFixUIPlan(plan: any): FixResult {
  const changes: string[] = [];
  let fixed = false;

  // Fix 1: Add $schema if missing
  if (!plan.$schema) {
    plan.$schema = "https://vc-shell.dev/schemas/ui-plan.v1.json";
    changes.push("Added missing $schema");
    fixed = true;
  }

  // Fix 2: Convert module object to string
  if (typeof plan.module === "object" && plan.module !== null) {
    const moduleId = plan.module.id || plan.module.name || "module";
    plan.module = toKebabCase(moduleId);
    changes.push(`Converted module object to string: "${plan.module}"`);
    fixed = true;
  }

  // Fix 3: Ensure module is kebab-case
  if (typeof plan.module === "string" && !isKebabCase(plan.module)) {
    const original = plan.module;
    plan.module = toKebabCase(plan.module);
    changes.push(`Converted module to kebab-case: "${original}" → "${plan.module}"`);
    fixed = true;
  }

  // Fix 4-N: Fix each blade
  if (Array.isArray(plan.blades)) {
    for (const blade of plan.blades) {
      const bladeChanges = fixBlade(blade, plan.module);
      if (bladeChanges.length > 0) {
        changes.push(...bladeChanges.map(c => `[${blade.id}] ${c}`));
        fixed = true;
      }
    }
  }

  return { fixed, changes, plan };
}

/**
 * Fix individual blade errors
 */
function fixBlade(blade: any, moduleName: string): string[] {
  const changes: string[] = [];

  // Fix: Add route if missing
  if (!blade.route) {
    blade.route = `/${moduleName}`;
    if (blade.layout === "details") {
      blade.route += "/:id?";
    }
    changes.push(`Added missing route: "${blade.route}"`);
  }

  // Fix: Ensure route starts with /
  if (blade.route && !blade.route.startsWith("/")) {
    blade.route = `/${blade.route}`;
    changes.push(`Fixed route format: added leading /`);
  }

  // Fix: Convert component.name to component.type
  if (Array.isArray(blade.components)) {
    for (let i = 0; i < blade.components.length; i++) {
      const comp = blade.components[i];

      if (comp.component && !comp.type) {
        comp.type = comp.component;
        delete comp.component;
        changes.push(`Renamed component.component → component.type: "${comp.type}"`);
      }

      if (comp.name && !comp.type) {
        comp.type = comp.name;
        delete comp.name;
        changes.push(`Renamed component.name → component.type: "${comp.type}"`);
      }
    }
  }

  // Fix: Remove invalid features
  if (Array.isArray(blade.features)) {
    const validFeatures = ["filters", "multiselect", "validation", "gallery", "widgets"];
    const original = [...blade.features];
    blade.features = blade.features.filter((f: string) => validFeatures.includes(f));

    const removed = original.filter(f => !blade.features.includes(f));
    if (removed.length > 0) {
      changes.push(`Removed invalid features: ${removed.join(", ")}`);
    }
  }

  // Fix: Convert logic.state values from strings to objects
  if (blade.logic?.state) {
    for (const [key, value] of Object.entries(blade.logic.state)) {
      if (typeof value === "string" || Array.isArray(value) || value === null) {
        // Infer source based on common patterns
        let source: "composable" | "local" | "prop" = "local";
        if (["loading", "items", "item", "data"].includes(key)) {
          source = "composable";
        } else if (key.endsWith("Id") || key === "param") {
          source = "prop";
        }

        const defaultValue = Array.isArray(value) ? value :
                           value === null ? null :
                           typeof value === "boolean" ? value :
                           typeof value === "number" ? value :
                           undefined;

        blade.logic.state[key] = {
          source,
          reactive: source !== "prop",
          ...(defaultValue !== undefined ? { default: defaultValue } : {})
        };
        changes.push(`Fixed state.${key}: converted to object {source:"${source}", reactive:${source !== "prop"}}`);
      }
    }
  }

  // Fix: Convert logic.toolbar from object to array
  if (blade.logic?.toolbar && !Array.isArray(blade.logic.toolbar)) {
    if (blade.logic.toolbar.actions && Array.isArray(blade.logic.toolbar.actions)) {
      blade.logic.toolbar = blade.logic.toolbar.actions;
      changes.push(`Converted toolbar.actions → toolbar array`);
    }
  }

  // Fix: Convert toolbar.onClick to toolbar.action
  if (Array.isArray(blade.logic?.toolbar)) {
    for (const item of blade.logic.toolbar) {
      if (item.onClick && !item.action) {
        item.action = item.onClick;
        delete item.onClick;
        changes.push(`Renamed toolbar.onClick → toolbar.action for "${item.id}"`);
      }
      if (item.handler && !item.action) {
        item.action = item.handler;
        delete item.handler;
        changes.push(`Renamed toolbar.handler → toolbar.action for "${item.id}"`);
      }
    }
  }

  // Fix: Convert column types to valid values
  if (Array.isArray(blade.components)) {
    for (const comp of blade.components) {
      if (comp.type === "VcTable" && Array.isArray(comp.columns)) {
        for (const col of comp.columns) {
          if (col.type) {
            const typeMap: Record<string, string | undefined> = {
              "image-thumbnail": "image",
              "clickable": "link",
              "text": undefined , // Remove type for text
              "status-icon": "status",
              "status-icon-conditional": "status",
            };

            if (typeMap[col.type] !== undefined) {
              const oldType = col.type;
              if (typeMap[col.type] === undefined) {
                delete col.type;
                changes.push(`Removed invalid column type "${oldType}" for column "${col.id}"`);
              } else {
                col.type = typeMap[col.type];
                changes.push(`Converted column type "${oldType}" → "${col.type}" for column "${col.id}"`);
              }
            }
          }
        }
      }
    }
  }

  // Fix: Convert field.as to valid component types and fix field properties
  if (Array.isArray(blade.components)) {
    for (const comp of blade.components) {
      if ((comp.type === "VcForm" || comp.type === "VcCard") && Array.isArray(comp.fields)) {
        for (const field of comp.fields) {
          // Fix: Remove VcDynamicList (not in schema)
          if (field.as === "VcDynamicList") {
            // Remove the field entirely
            const index = comp.fields.indexOf(field);
            comp.fields.splice(index, 1);
            changes.push(`Removed field "${field.key}" with invalid type "VcDynamicList" (not in schema)`);
            continue;
          }

          // Fix: Convert disabled string to boolean (remove expression)
          if (field.disabled && typeof field.disabled === "string") {
            // Just remove it - expressions not supported in schema
            delete field.disabled;
            changes.push(`Removed field.disabled expression for "${field.key}" (not supported in schema)`);
          }

          // Fix: Convert validation object to string
          if (field.validation && typeof field.validation === "object") {
            const rules = [];
            if (field.validation.required) rules.push("required");
            if (field.validation.min) rules.push(`min:${field.validation.min}`);
            if (field.validation.max) rules.push(`max:${field.validation.max}`);
            field.validation = rules.join("|");
            changes.push(`Converted validation object to string for field "${field.key}"`);
          }
        }
      }
    }
  }

  return changes;
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Check if string is kebab-case
 */
function isKebabCase(str: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(str);
}
