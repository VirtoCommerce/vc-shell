import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcEnvironmentBanner } from ".";

/**
 * `VcEnvironmentBanner` is a centered badge pinned to the top of the app that
 * labels the current environment (e.g. Development). It mirrors the platform
 * environment banner (vc-env-badge) and is hidden in production by the consuming
 * logic; this component only renders the visual badge.
 */
const meta = {
  title: "Atoms/VcEnvironmentBanner",
  component: VcEnvironmentBanner,
  tags: ["autodocs"],
  argTypes: {
    name: {
      description: "Environment label to display",
      control: "text",
      table: { type: { summary: "string" } },
    },
    color: {
      description: "Color theme of the badge (vc-shell theme tokens)",
      control: "select",
      options: ["primary", "secondary", "info", "success", "warning", "danger", "neutral"],
      table: {
        type: { summary: "'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'" },
        defaultValue: { summary: "'neutral'" },
      },
    },
  },
  args: {
    name: "Development",
    color: "success",
  },
} satisfies Meta<typeof VcEnvironmentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Development: Story = {
  args: { name: "Development", color: "success" },
};

export const QA: Story = {
  args: { name: "QA", color: "warning" },
};

export const Demo: Story = {
  args: { name: "Demo", color: "info" },
};

export const Staging: Story = {
  args: { name: "UAT", color: "secondary" },
};

export const Production: Story = {
  args: { name: "Production", color: "danger" },
};

export const Unknown: Story = {
  args: { name: "Sandbox", color: "neutral" },
};
