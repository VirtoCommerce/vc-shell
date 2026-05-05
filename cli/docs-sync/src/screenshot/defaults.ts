export const SCREENSHOT_DEFAULTS = {
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
  // PNG keeps Playwright happy across versions; webp post-processing via sharp is a follow-up if smaller files become important.
  format: "png" as const,
  theme: "light" as "light" | "dark",
  storybookUrl: "https://vc-shell-storybook.govirto.com",
};
