#!/usr/bin/env node

/**
 * Script to generate capability example files from enhanced registry
 * 
 * Usage: npx tsx src/scripts/generate-capability-examples.ts
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import type { EnhancedComponent, ComponentCapability } from "../core/component-analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE = `# Capability: {name}

## Type
{type}

## Description
{description}

## When to Use
{useCases}

## Required Props/Slots/Events
{requirements}

## Related Capabilities
{relatedCapabilities}

## Complexity
{complexity}

## Complete Working Example
\`\`\`vue
{codeExample}
\`\`\`

## Best Practices
- Use this capability when you need {useCaseSummary}
- Ensure proper error handling
- Follow VC-Shell naming conventions
`;

async function main() {
  console.log("🚀 Generating Capability Example Files");
  console.log("=" .repeat(50));

  // Load enhanced registry
  const registryPath = path.join(__dirname, "..", "schemas", "component-registry-enhanced.json");
  const enhanced: Record<string, EnhancedComponent> = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

  const componentsToProcess = Object.keys(enhanced).filter(
    name => name.startsWith("Vc") && !name.startsWith("_")
  );

  console.log(`\n📋 Processing ${componentsToProcess.length} components...`);

  let totalExamples = 0;

  for (const componentName of componentsToProcess) {
    const component = enhanced[componentName];
    const capabilities = component.capabilities;
    const capCount = Object.keys(capabilities).length;

    if (capCount === 0) {
      console.log(`⏭️  Skipping ${componentName} (no capabilities)`);
      continue;
    }

    console.log(`\n📦 ${componentName} (${capCount} capabilities)`);

    // Create component directory
    const componentDir = path.join(__dirname, "..", "examples", "capabilities", componentName);
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // Generate examples for each capability
    for (const [capId, capability] of Object.entries(capabilities)) {
      const filename = `${capId}.md`;
      const filePath = path.join(componentDir, filename);

      const content = generateExample(capability, component);
      fs.writeFileSync(filePath, content, "utf-8");
      totalExamples++;
    }

    console.log(`   ✅ Generated ${capCount} examples`);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Generated ${totalExamples} capability examples`);
  console.log(`📁 Location: src/examples/capabilities/`);
}

function generateExample(capability: ComponentCapability, component: EnhancedComponent): string {
  let content = TEMPLATE;

  // Replace placeholders
  content = content.replace("{name}", capability.name);
  content = content.replace("{type}", capability.type.toUpperCase());
  content = content.replace("{description}", capability.description);
  content = content.replace("{complexity}", capability.complexity.toUpperCase());

  // Use cases
  const useCases = capability.useCases.length > 0
    ? capability.useCases.map(uc => `- ${uc}`).join("\n")
    : "- General purpose usage\n- When building custom UI";
  content = content.replace("{useCases}", useCases);

  // Requirements
  const requirements: string[] = [];
  if (capability.requiredProps) {
    requirements.push("**Props:**");
    capability.requiredProps.forEach(p => requirements.push(`- \`${p}\``));
  }
  if (capability.relatedSlots) {
    requirements.push("**Slots:**");
    capability.relatedSlots.forEach(s => requirements.push(`- \`${s}\``));
  }
  if (capability.relatedEvents) {
    requirements.push("**Events:**");
    capability.relatedEvents.forEach(e => requirements.push(`- \`@${e}\``));
  }
  content = content.replace("{requirements}", requirements.join("\n"));

  // Related capabilities
  const related = "- Check other capabilities in this component for complementary features";
  content = content.replace("{relatedCapabilities}", related);

  // Code example
  const codeExample = capability.codeExample || generateBasicExample(capability, component);
  content = content.replace("{codeExample}", codeExample);

  // Use case summary
  const useCaseSummary = capability.useCases[0] || capability.description.toLowerCase();
  content = content.replace("{useCaseSummary}", useCaseSummary);

  return content;
}

function generateBasicExample(capability: ComponentCapability, component: EnhancedComponent): string {
  const componentName = component.name;

  // Generate based on capability type
  if (capability.type === "prop") {
    return `<template>
  <${componentName}
    :${capability.name}="${capability.name}Value"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ${componentName} } from "@vc-shell/framework";

const ${capability.name}Value = ref(/* initial value */);
</script>`;
  }

  if (capability.type === "slot") {
    return `<template>
  <${componentName}>
    <template #${capability.name}>
      <!-- Custom slot content -->
    </template>
  </${componentName}>
</template>

<script setup lang="ts">
import { ${componentName} } from "@vc-shell/framework";
</script>`;
  }

  if (capability.type === "event") {
    return `<template>
  <${componentName}
    @${capability.name}="handle${capitalize(capability.name)}"
  />
</template>

<script setup lang="ts">
import { ${componentName} } from "@vc-shell/framework";

function handle${capitalize(capability.name)}(event: any) {
  console.log("${capability.name} event:", event);
}
</script>`;
  }

  // Feature type - more complex
  return `<template>
  <${componentName}
    <!-- ${capability.description} -->
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ${componentName} } from "@vc-shell/framework";

// Implement ${capability.name}
</script>`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

