import { cwd } from "node:process";
import path from "node:path";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync(path.join(cwd(), "package.json"), "utf-8"));

const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
];

// Create a regex to match external packages
const externalRegex = new RegExp(`^(${externalPackages.join("|").replace(/\//g, "\\/")})($|\\/)`);

/**
 * Function to determine if a module should be treated as external
 * @param {string} id - The module ID
 * @returns {boolean} - True if the module is external, false otherwise
 */
export const external = (id: string): boolean => {
  const isExternal = externalRegex.test(id);
  if (id.includes("lodash")) {
    console.log(`[EXTERNAL_CHECK] id: '${id}', isExternal: ${isExternal}`);
  }
  return isExternal;
};
