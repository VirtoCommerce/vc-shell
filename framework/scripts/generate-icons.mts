import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SVG_DIR = join(__dirname, "../assets/svg");
const ICON_DIR = join(__dirname, "../ui/components/atoms/vc-icon/icons");

const template = (svg: string, name: string) => `
<template>
${svg
  .replace(/<svg([^>]*)>/, (match, attributes) => {
    return '<svg' +
      attributes
        .replace(/\s+width="[^"]*"/g, '')
        .replace(/\s+height="[^"]*"/g, '')
        .replace(/\s+class="[^"]*"/g, '') +
      ' :width="width" :height="height">';
  })
  .replace(/stroke="[^"]+"/g, 'stroke="currentColor"')}
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
`;

// Function to convert kebab-case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function generateIcons() {
  if (!existsSync(ICON_DIR)) {
    mkdirSync(ICON_DIR, { recursive: true });
  }

  const svgFiles = readdirSync(SVG_DIR).filter((file) => file.endsWith(".svg"));

  let indexContent = "";

  svgFiles.forEach((file) => {
    const name = file.replace(".svg", "");
    const componentName = `${toPascalCase(name)}Icon`;
    const svg = readFileSync(join(SVG_DIR, file), "utf-8");

    writeFileSync(join(ICON_DIR, `${componentName}.vue`), template(svg, componentName));

    indexContent += `export { default as ${componentName} } from "./${componentName}.vue"\n`;
  });

  writeFileSync(join(ICON_DIR, "index.ts"), indexContent);

  console.log("Icons generated successfully!");
}

generateIcons();
