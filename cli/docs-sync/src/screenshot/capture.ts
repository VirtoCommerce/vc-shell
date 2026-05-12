import { chromium, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
import { SCREENSHOT_DEFAULTS } from "./defaults.js";

export interface CaptureArgs {
  url?: string; // direct URL (e.g. dev server)
  story?: string; // Storybook story id
  selector?: string; // crop to this selector; defaults to <body>
  theme?: "light" | "dark";
  viewportWidth?: number;
  viewportHeight?: number;
  out: string; // absolute output path
}

export async function captureScreenshot(args: CaptureArgs): Promise<void> {
  if (!args.url && !args.story) {
    throw new Error("either --url or --story is required");
  }
  const url = args.url
    ? args.url
    : `${SCREENSHOT_DEFAULTS.storybookUrl}/iframe.html?id=${args.story}&viewMode=story&globals=theme:${args.theme ?? SCREENSHOT_DEFAULTS.theme}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: {
        width: args.viewportWidth ?? SCREENSHOT_DEFAULTS.viewport.width,
        height: args.viewportHeight ?? SCREENSHOT_DEFAULTS.viewport.height,
      },
      deviceScaleFactor: SCREENSHOT_DEFAULTS.deviceScaleFactor,
    });
    const page: Page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    await fs.mkdir(path.dirname(args.out), { recursive: true });

    if (args.selector) {
      await page.locator(args.selector).screenshot({
        path: args.out,
        type: SCREENSHOT_DEFAULTS.format,
      });
    } else {
      await page.screenshot({
        path: args.out,
        fullPage: false,
        type: SCREENSHOT_DEFAULTS.format,
      });
    }
  } finally {
    await browser.close();
  }
}
