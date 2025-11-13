#!/usr/bin/env node

/**
 * Script to build enhanced component registry with capabilities
 * for all 36 components in the base registry.
 *
 * Usage: npx tsx src/scripts/build-enhanced-registry.ts
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { ComponentAnalyzer, type AnalyzerConfig } from "../core/component-analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Building Enhanced Component Registry");
  console.log("=" .repeat(50));

  // Load base registry
  const registryPath = path.join(__dirname, "..", "schemas", "component-registry.json");
  const baseRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

  console.log(`\n📋 Loaded base registry with ${Object.keys(baseRegistry).length} components`);

  // Configure analyzer
  const config: AnalyzerConfig = {
    docsPath: "/Users/symbot/DEV/vc-docs",
    frameworkPath: "/Users/symbot/DEV/vc-shell/framework",
    projectPaths: [
      "/Users/symbot/DEV/vendor-portal",
      "/Users/symbot/DEV/vc-module-marketplace-vendor-1",
      "/Users/symbot/DEV/vc-module-marketplace-registration-1",
      "/Users/symbot/DEV/vc-module-marketplace-commissions-1",
      "/Users/symbot/DEV/vc-module-marketplace-communication-1",
      "/Users/symbot/DEV/vc-module-marketplace-reviews-1",
      "/Users/symbot/DEV/vc-module-news",
      "/Users/symbot/DEV/vc-module-pagebuilder",
      "/Users/symbot/DEV/vc-module-task-management-1",
    ],
  };

  // Create analyzer
  const analyzer = new ComponentAnalyzer(config, baseRegistry);

  // Analyze all components
  const enhanced = await analyzer.analyzeAll();

  // Save results
  const outputPath = path.join(__dirname, "..", "schemas", "component-registry-enhanced.json");
  await analyzer.saveRegistry(enhanced, outputPath);

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log("=".repeat(50));

  const componentNames = Object.keys(enhanced);
  console.log(`✅ Total components analyzed: ${componentNames.length}`);

  let totalCapabilities = 0;
  const categoryStats: Record<string, number> = {};

  for (const [name, component] of Object.entries(enhanced)) {
    const capCount = Object.keys(component.capabilities).length;
    totalCapabilities += capCount;
    
    const category = component.category || "Unknown";
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  }

  console.log(`✅ Total capabilities extracted: ${totalCapabilities}`);
  console.log(`✅ Average capabilities per component: ${(totalCapabilities / componentNames.length).toFixed(1)}`);
  
  console.log("\n📊 Components by category:");
  for (const [category, count] of Object.entries(categoryStats)) {
    console.log(`   ${category}: ${count}`);
  }

  // Show top 5 components by capabilities
  const sorted = Object.entries(enhanced)
    .map(([name, comp]) => ({ name, count: Object.keys(comp.capabilities).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  console.log("\n🏆 Top 5 components by capabilities:");
  sorted.forEach(({ name, count }, i) => {
    console.log(`   ${i + 1}. ${name}: ${count} capabilities`);
  });

  console.log("\n✅ Enhanced registry built successfully!");
  console.log(`📁 Output: ${outputPath}`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

