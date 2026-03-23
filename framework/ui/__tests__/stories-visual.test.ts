import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { composeStories } from "@storybook/vue3-vite";
import { page } from "@vitest/browser/context";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

expect.extend({ toMatchImageSnapshot });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

const compose = (entry: StoryFile): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(`There was an issue composing stories for the module: ${JSON.stringify(entry)}, ${e}`);
  }
};

const customSnapshotsDir = path.resolve(__dirname, "__image_snapshots__");

function getAllStoryFiles() {
  const storyFiles = Object.entries(
    import.meta.glob<StoryFile>(
      [
        "../components/**/*.stories.ts",
        "../../../shared/components/**/*.stories.ts",
        "../../../shell/auth/**/*.stories.ts",
        "../../../shell/pages/**/*.stories.ts",
      ],
      { eager: true },
    ),
  );

  return storyFiles.map(([filePath, storyFile]) => {
    const componentName = path.basename(filePath).replace(/\.stories\.ts$/, "");
    return { filePath, storyFile, componentName };
  });
}

describe("Stories Visual Regression", () => {
  getAllStoryFiles().forEach(({ storyFile, componentName }) => {
    const meta = storyFile.default;
    const title = meta.title || componentName;

    if ((meta.parameters as any)?.visual?.disable) {
      return;
    }

    describe(title, () => {
      const stories = Object.entries(compose(storyFile)).map(([name, story]) => ({
        name,
        story,
      }));

      stories.forEach(({ name, story }) => {
        const testFn = (story as any).parameters?.visual?.skip ? test.skip : test;

        testFn(name, async () => {
          await (story as any).run();
          // Wait for rendering to settle
          await new Promise((resolve) => setTimeout(resolve, 100));

          const image = await page.screenshot();
          expect(image).toMatchImageSnapshot({
            customSnapshotsDir,
            customSnapshotIdentifier: `${componentName}--${name}`,
            failureThreshold: 0.01,
            failureThresholdType: "percent",
          });
        });
      });
    });
  });
});
