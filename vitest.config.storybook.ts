import { defineProject } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
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
      // Pinned to a dedicated port. The plugin reuses whatever answers on
      // storybookUrl instead of starting its own server, so with the default
      // 6006 a dev server left running from another checkout would silently
      // serve the stories under test (VCST-5619).
      storybookUrl: "http://localhost:6011",
      storybookScript: "yarn storybook-serve:test",
    }),
  ],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      // Vitest 4 takes a provider factory from its own package; the v3 string
      // form ("playwright") is gone. @storybook/addon-vitest 10.2 pins
      // @vitest/browser-playwright ^4 as a peer, which is why the v3 setup
      // never got past provider handshake (VCST-5619).
      provider: playwright(),
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
