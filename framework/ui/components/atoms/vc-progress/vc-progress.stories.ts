import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcProgress } from "@ui/components/atoms/vc-progress";

/**
 * `VcProgress` is a component that visualizes the completion progress of a task or process.
 * It supports different visual styles and can be dynamically updated.
 */
const meta = {
  title: "Atoms/VcProgress",
  component: VcProgress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      description: "Current progress value (0-100)",
      control: { type: "range", min: 0, max: 100, step: 1 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    variant: {
      description: "Visual style of the progress bar",
      control: "radio",
      options: ["default", "striped"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
  },
  args: {
    value: 30,
    variant: "default",
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcProgress component provides a visual representation of progress with these features:

- Displays progress as a percentage (0-100%)
- Supports default and striped visual variants
- Striped variant includes animation for better visual feedback
- Customizable through CSS variables
        `,
      },
    },
  },
} satisfies Meta<typeof VcProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default progress bar
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcProgress },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-w-full">
        <vc-progress v-bind="args"></vc-progress>
      </div>
    `,
  }),
};

/**
 * Striped animated progress bar
 */
export const Striped: Story = {
  args: {
    variant: "striped",
    value: 50,
  },
  render: (args) => ({
    components: { VcProgress },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-w-full">
        <vc-progress v-bind="args"></vc-progress>
      </div>
    `,
  }),
};

/**
 * Progress stages example showing different completion levels
 */
export const ProgressStages: Story = {
  render: () => ({
    components: { VcProgress },
    setup() {
      return {
        stages: [
          { value: 0, label: "Not started" },
          { value: 25, label: "Initial phase" },
          { value: 50, label: "Halfway there" },
          { value: 75, label: "Almost complete" },
          { value: 100, label: "Complete" },
        ],
      };
    },
    template: `
      <div class="tw-w-full tw-space-y-6">
        <div v-for="(stage, index) in stages" :key="index" class="tw-space-y-1">
          <div class="tw-flex tw-justify-between tw-items-center">
            <span class="tw-text-sm tw-font-medium">{{ stage.label }}</span>
            <span class="tw-text-sm tw-text-gray-500">{{ stage.value }}%</span>
          </div>
          <vc-progress :value="stage.value" :variant="stage.value === 100 ? 'striped' : 'default'"></vc-progress>
        </div>
      </div>
    `,
  }),
};

/**
 * Interactive progress example with controls
 */
export const InteractiveProgress: Story = {
  render: () => ({
    components: { VcProgress },
    setup() {
      const progress = ref(30);

      function increment() {
        if (progress.value < 100) {
          progress.value += 10;
        }
      }

      function decrement() {
        if (progress.value > 0) {
          progress.value -= 10;
        }
      }

      function reset() {
        progress.value = 0;
      }

      return { progress, increment, decrement, reset };
    },
    template: `
      <div class="tw-w-full tw-space-y-4">
        <div class="tw-flex tw-justify-between tw-items-center">
          <span class="tw-text-sm tw-font-medium">Progress: {{ progress }}%</span>
          <div class="tw-space-x-2">
            <button
              @click="decrement"
              class="tw-px-3 tw-py-1 tw-bg-gray-200 tw-rounded"
              :disabled="progress <= 0"
            >
              -10%
            </button>
            <button
              @click="increment"
              class="tw-px-3 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded"
              :disabled="progress >= 100"
            >
              +10%
            </button>
            <button
              @click="reset"
              class="tw-px-3 tw-py-1 tw-bg-gray-700 tw-text-white tw-rounded"
            >
              Reset
            </button>
          </div>
        </div>
        <vc-progress :value="progress" :variant="progress === 100 ? 'striped' : 'default'"></vc-progress>
      </div>
    `,
  }),
};
