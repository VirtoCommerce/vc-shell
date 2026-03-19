import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/vue3-vite';
import type { Meta, StoryFn } from '@storybook/vue3-vite';

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

const compose = (entry: StoryFile): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(entry)}, ${e}`,
    );
  }
};

function getAllStoryFiles() {
  const storyFiles = Object.entries(
    import.meta.glob<StoryFile>([
      '../components/**/*.stories.ts',
      '../../../shared/components/**/*.stories.ts',
      '../../../shell/auth/**/*.stories.ts',
      '../../../shell/pages/**/*.stories.ts',
    ], { eager: true }),
  );

  return storyFiles.map(([filePath, storyFile]) => {
    const storyDir = path.dirname(filePath);
    const componentName = path.basename(filePath).replace(/\.stories\.ts$/, '');
    return { filePath, storyFile, componentName, storyDir };
  });
}

describe('Stories Snapshots', () => {
  getAllStoryFiles().forEach(({ storyFile, componentName }) => {
    const meta = storyFile.default;
    const title = meta.title || componentName;

    if ((meta.parameters as any)?.snapshot?.disable) {
      return;
    }

    describe(title, () => {
      const stories = Object.entries(compose(storyFile)).map(([name, story]) => ({
        name,
        story,
      }));

      if (stories.length <= 0) {
        throw new Error(
          `No stories found for this module: ${title}. Make sure there is at least one valid story for this module.`,
        );
      }

      stories.forEach(({ name, story }) => {
        const testFn = (story as any).parameters?.snapshot?.skip ? test.skip : test;

        testFn(name, async () => {
          await (story as any).run();
          await new Promise((resolve) => setTimeout(resolve, 1));
          const customSnapshotPath = `./__snapshots__/${componentName}.snap`;
          await expect(document.body.firstChild).toMatchFileSnapshot(customSnapshotPath);
        });
      });
    });
  });
});
