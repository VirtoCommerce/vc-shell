import { defineProject } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Storybook story tests. The storybookTest plugin turns every *.stories.ts file
// into a browser test suite: each story is rendered in Chromium, its play
// function runs, and axe a11y checks are applied (see a11y config in
// .storybook/preview.ts — `test: "error"` fails stories on violations).
// The plugin derives the test file list from the Storybook `stories` globs, so
// no `include` is set here (the plugin would override it anyway).
export default defineProject({
  plugins: [
    storybookTest({
      configDir: path.join(dirname, ".storybook"),
      storybookScript: "yarn storybook-serve --no-open",
    }),
  ],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./.storybook/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./storybook-static/coverage",
    },
  },
});
