import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcButton, VcButtonGroup } from "@ui/components/atoms/vc-button";

/**
 * `VcButtonGroup` groups buttons together with consistent spacing or attached borders.
 * Supports size propagation to children via provide/inject.
 */
const meta = {
  title: "Atoms/VcButtonGroup",
  component: VcButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      description: "Layout direction of the button group",
      control: "select",
      options: ["horizontal", "vertical"],
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    size: {
      description: "Size propagated to all child buttons",
      control: "select",
      options: [undefined, "sm", "default", "lg", "icon"],
      table: {
        type: { summary: "'sm' | 'default' | 'lg' | 'icon'" },
        defaultValue: { summary: "undefined" },
      },
    },
    attached: {
      description: "Whether buttons are visually joined (no gap, shared borders)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof VcButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default horizontal group with gap between buttons.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcButton, VcButtonGroup },
    setup: () => ({ args }),
    template: `
      <VcButtonGroup v-bind="args">
        <VcButton variant="secondary">Left</VcButton>
        <VcButton variant="secondary">Center</VcButton>
        <VcButton variant="secondary">Right</VcButton>
      </VcButtonGroup>
    `,
  }),
};

/**
 * Attached mode — buttons join with no gap, shared borders, and connected border radii.
 */
export const Attached: Story = {
  args: { attached: true },
  render: (args) => ({
    components: { VcButton, VcButtonGroup },
    setup: () => ({ args }),
    template: `
      <VcButtonGroup v-bind="args">
        <VcButton variant="secondary">Left</VcButton>
        <VcButton variant="secondary">Center</VcButton>
        <VcButton variant="secondary">Right</VcButton>
      </VcButtonGroup>
    `,
  }),
};

/**
 * Vertical layout.
 */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => ({
    components: { VcButton, VcButtonGroup },
    setup: () => ({ args }),
    template: `
      <VcButtonGroup v-bind="args">
        <VcButton variant="secondary">Top</VcButton>
        <VcButton variant="secondary">Middle</VcButton>
        <VcButton variant="secondary">Bottom</VcButton>
      </VcButtonGroup>
    `,
  }),
};

/**
 * Vertical attached — buttons join vertically.
 */
export const AttachedVertical: Story = {
  args: { orientation: "vertical", attached: true },
  render: (args) => ({
    components: { VcButton, VcButtonGroup },
    setup: () => ({ args }),
    template: `
      <VcButtonGroup v-bind="args">
        <VcButton variant="secondary">Top</VcButton>
        <VcButton variant="secondary">Middle</VcButton>
        <VcButton variant="secondary">Bottom</VcButton>
      </VcButtonGroup>
    `,
  }),
};

/**
 * Group-level `size` overrides individual button sizes.
 */
export const PropagatedSize: Story = {
  render: () => ({
    components: { VcButton, VcButtonGroup },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <VcButtonGroup size="sm">
          <VcButton variant="primary">SM via group</VcButton>
          <VcButton variant="secondary">SM via group</VcButton>
        </VcButtonGroup>
        <VcButtonGroup size="default">
          <VcButton variant="primary">Default via group</VcButton>
          <VcButton variant="secondary">Default via group</VcButton>
        </VcButtonGroup>
        <VcButtonGroup size="lg">
          <VcButton variant="primary">LG via group</VcButton>
          <VcButton variant="secondary">LG via group</VcButton>
        </VcButtonGroup>
      </div>
    `,
  }),
};

/**
 * Different variants in one group.
 */
export const MixedVariants: Story = {
  render: () => ({
    components: { VcButton, VcButtonGroup },
    template: `
      <VcButtonGroup>
        <VcButton variant="primary" size="icon" icon="lucide-bold" aria-label="Bold" />
        <VcButton variant="secondary" size="icon" icon="lucide-italic" aria-label="Italic" />
        <VcButton variant="secondary" size="icon" icon="lucide-underline" aria-label="Underline" />
      </VcButtonGroup>
    `,
  }),
};

/**
 * Realistic dialog footer pattern — Cancel + Confirm.
 */
export const DialogFooter: Story = {
  render: () => ({
    components: { VcButton, VcButtonGroup },
    template: `
      <div style="display: flex; justify-content: flex-end; padding: 16px; border-top: 1px solid #e5e7eb;">
        <VcButtonGroup>
          <VcButton variant="outline">Cancel</VcButton>
          <VcButton variant="primary">Confirm</VcButton>
        </VcButtonGroup>
      </div>
    `,
  }),
};
