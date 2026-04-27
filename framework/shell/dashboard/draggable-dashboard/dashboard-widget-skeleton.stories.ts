import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DashboardWidgetSkeleton from "@shell/dashboard/draggable-dashboard/DashboardWidgetSkeleton.vue";

/**
 * Internal skeleton card used by `GridstackDashboard` while remote modules are
 * still loading. Stories below illustrate the shimmer state in different
 * card sizes; in production it's positioned via CSS grid inline styles.
 */
const meta = {
  title: "Shared/DashboardWidgetSkeleton",
  component: DashboardWidgetSkeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Shimmer placeholder for dashboard cards. Internal to the DraggableDashboard organism — not exported as a public API.",
      },
    },
  },
} satisfies Meta<typeof DashboardWidgetSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { DashboardWidgetSkeleton },
    template: `
      <div style="width: 480px; height: 360px;">
        <DashboardWidgetSkeleton />
      </div>
    `,
  }),
};

export const WideCard: Story = {
  render: () => ({
    components: { DashboardWidgetSkeleton },
    template: `
      <div style="width: 720px; height: 240px;">
        <DashboardWidgetSkeleton />
      </div>
    `,
  }),
};

export const Grid: Story = {
  render: () => ({
    components: { DashboardWidgetSkeleton },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; width: 720px;">
        <div style="height: 280px;"><DashboardWidgetSkeleton /></div>
        <div style="height: 280px;"><DashboardWidgetSkeleton /></div>
        <div style="height: 280px;"><DashboardWidgetSkeleton /></div>
        <div style="height: 280px;"><DashboardWidgetSkeleton /></div>
      </div>
    `,
  }),
};
