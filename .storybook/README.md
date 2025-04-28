# Storybook Configuration for VC-Shell

This directory contains the Storybook configuration for the VC-Shell project.

## Running Storybook

To run Storybook, use the following commands:

```bash
# Start Storybook development server
yarn storybook-serve

# Build Storybook for production
yarn storybook-build

# Compress Storybook build for deployment
yarn storybook-compress
```

## Adding Stories

Stories can be added to any component in the following locations:
- `framework/ui/**/*.stories.ts` - For framework components
- `apps/vendor-portal/src/**/*.stories.ts` - For vendor portal components

## Story Structure

Stories should follow this structure:

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import YourComponent from './YourComponent.vue';
import { withContainer } from '../../../.storybook/decorators';

const meta: Meta<typeof YourComponent> = {
  title: 'Category/Subcategory/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
  decorators: [withContainer],
  argTypes: {
    // Define argTypes here
  },
  args: {
    // Default args
  },
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Args for this story
  },
};
```

## Available Decorators

- `withContainer` - Wraps the component in a container with padding and border
- `withDarkBackground` - Applies a dark background to the component
- `withRouter` - Provides a Vue Router instance for components that use routing

## Testing Components

You can use the `@storybook/test` package to test your components:

```typescript
import { composeStories } from '@storybook/test';
import * as stories from './YourComponent.stories';

const { Default } = composeStories(stories);

it('renders properly', () => {
  // Test your component with the Default story
});
```

## Additional Information

For more details on how to use Storybook, refer to the [official Storybook documentation](https://storybook.js.org/docs/vue/get-started/introduction). 
