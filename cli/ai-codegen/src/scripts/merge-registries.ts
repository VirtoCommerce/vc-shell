#!/usr/bin/env node

/**
 * Script to merge component-registry.json and component-registry-enhanced.json
 * into a single unified component-registry.json with capabilities section
 *
 * Usage: npx tsx src/scripts/merge-registries.ts
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🔄 Merging Component Registries");
  console.log("=" .repeat(50));

  const schemasPath = path.join(__dirname, "..", "schemas");
  
  // Load base registry
  const baseRegistryPath = path.join(schemasPath, "component-registry.json");
  const baseRegistry = JSON.parse(fs.readFileSync(baseRegistryPath, "utf-8"));
  console.log(`✅ Loaded base registry: ${Object.keys(baseRegistry).length} components`);

  // Load enhanced registry
  const enhancedRegistryPath = path.join(schemasPath, "component-registry-enhanced.json");
  let enhancedRegistry: any = {};
  
  if (fs.existsSync(enhancedRegistryPath)) {
    enhancedRegistry = JSON.parse(fs.readFileSync(enhancedRegistryPath, "utf-8"));
    console.log(`✅ Loaded enhanced registry: ${Object.keys(enhancedRegistry).length} components`);
  } else {
    console.log("⚠️  Enhanced registry not found, will create empty capabilities");
  }

  // Merge registries
  const merged: Record<string, any> = {};
  let totalCapabilities = 0;

  for (const [componentName, baseData] of Object.entries(baseRegistry)) {
    // Start with base data
    merged[componentName] = { ...baseData };

    // Add capabilities from enhanced registry if they exist
    if (enhancedRegistry[componentName]?.capabilities) {
      merged[componentName].capabilities = enhancedRegistry[componentName].capabilities;
      totalCapabilities += Object.keys(enhancedRegistry[componentName].capabilities).length;
    } else {
      // Empty capabilities object for components without enhanced data
      merged[componentName].capabilities = {};
    }
  }

  // Save merged registry
  const outputPath = baseRegistryPath;
  
  // Backup original
  const backupPath = path.join(schemasPath, "component-registry.backup.json");
  fs.copyFileSync(baseRegistryPath, backupPath);
  console.log(`📦 Created backup: ${backupPath}`);

  // Write merged
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`✅ Merged registry saved: ${outputPath}`);

  // Archive old enhanced registry
  if (fs.existsSync(enhancedRegistryPath)) {
    const archivePath = path.join(schemasPath, "component-registry-enhanced.archive.json");
    fs.renameSync(enhancedRegistryPath, archivePath);
    console.log(`📁 Archived enhanced registry: ${archivePath}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log("=".repeat(50));
  console.log(`✅ Total components: ${Object.keys(merged).length}`);
  console.log(`✅ Total capabilities: ${totalCapabilities}`);
  console.log(`✅ Components with capabilities: ${Object.values(merged).filter((c: any) => Object.keys(c.capabilities || {}).length > 0).length}`);
  
  console.log("\n✅ Registry merge complete!");
  console.log("📝 Next steps:");
  console.log("   1. Update MCP server to use single registry");
  console.log("   2. Update GenerationRulesProvider");
  console.log("   3. npm run build");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

