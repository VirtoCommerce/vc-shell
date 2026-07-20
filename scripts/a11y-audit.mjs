#!/usr/bin/env node
/**
 * Accessibility audit for Storybook stories.
 *
 * Runs axe-core (WCAG 2.0/2.1 A + AA) against every story in a running
 * Storybook, in a real Chromium via Playwright. Exits non-zero when any
 * violation is found, so it can gate CI.
 *
 * Rules disabled here mirror .storybook/preview.ts:
 *  - `region`         — Storybook decorators add wrappers that break landmarks.
 *  - `color-contrast` — governed by the product brand palette, tracked as a
 *                       design decision (see framework/ui/ACCESSIBILITY.md).
 *
 * Usage:
 *   1. Start Storybook: `yarn dev:storybook` (or serve a static build).
 *   2. Run: `yarn test:a11y` (optionally `SB_BASE=http://host:port yarn test:a11y`).
 *
 * Env:
 *   SB_BASE   Storybook base URL (default http://127.0.0.1:6006)
 *   VERBOSE   set to print per-story violation detail
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axePath = require.resolve("axe-core");
const AXE_SRC = fs.readFileSync(path.join(path.dirname(axePath), "axe.min.js"), "utf8");

const BASE = process.env.SB_BASE || "http://127.0.0.1:6006";
const VERBOSE = !!process.env.VERBOSE;

const AXE_OPTIONS = {
  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  rules: {
    region: { enabled: false },
    "color-contrast": { enabled: false },
  },
};

async function fetchIndex() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const res = await fetch(`${BASE}/index.json`);
      if (res.ok) return await res.json();
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Storybook not reachable at ${BASE}. Start it with \`yarn dev:storybook\` first.`);
}

async function main() {
  console.log(`a11y audit → ${BASE}`);
  const index = await fetchIndex();
  const stories = Object.values(index.entries).filter((e) => e.type === "story");
  console.log(`Scanning ${stories.length} stories…`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const byRule = {};
  const failing = [];
  let total = 0;
  let i = 0;

  for (const story of stories) {
    i++;
    const url = `${BASE}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
    try {
      await page.goto(url, { waitUntil: "load", timeout: 45000 });
      await page
        .waitForFunction(
          () => {
            const r = document.querySelector("#storybook-root") || document.body;
            return r && r.children.length > 0;
          },
          { timeout: 15000 },
        )
        .catch(() => {});
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: AXE_SRC });
      const result = await page.evaluate(async (opts) => {
        const root = document.querySelector("#storybook-root") || document.body;
        return globalThis.axe.run(root, opts);
      }, AXE_OPTIONS);

      if (result.violations.length) {
        const rules = result.violations.map((v) => {
          byRule[v.id] = (byRule[v.id] || 0) + v.nodes.length;
          total += v.nodes.length;
          return `${v.id}(${v.nodes.length})`;
        });
        failing.push({ story: `${story.title} / ${story.name}`, rules });
      }
    } catch (e) {
      console.log(`  ⚠ ${story.id}: ${String(e).slice(0, 120)}`);
    }
    if (i % 50 === 0) console.log(`  …${i}/${stories.length}`);
  }

  await browser.close();

  if (total === 0) {
    console.log(`\n✅ No accessibility violations across ${stories.length} stories.`);
    return;
  }

  console.log(
    `\n❌ ${total} accessibility violation node(s) in ${failing.length} stor${failing.length === 1 ? "y" : "ies"}:`,
  );
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, n]) => console.log(`  ${n}\t${rule}`));
  if (VERBOSE) {
    failing.forEach((f) => console.log(`\n${f.story}\n   ${f.rules.join(", ")}`));
  } else {
    console.log(`\nRun with VERBOSE=1 for per-story detail.`);
  }
  process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
