import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcButton } from "@ui/components";
import DashboardWidgetCard from "@shared/components/dashboard-widget-card/dashboard-widget-card.vue";
import DashboardStatItem from "@shared/components/dashboard-widget-card/dashboard-stat-item.vue";
import DashboardFeedList from "@shared/components/dashboard-widget-card/dashboard-feed-list.vue";
import DashboardFeedRow from "@shared/components/dashboard-widget-card/dashboard-feed-row.vue";

const rows = [
  { name: "Minimalistic Lamp", status: "Published", date: "9 hours ago" },
  { name: "HK handbag", status: "Published", date: "9 hours ago" },
  { name: "Warli Artwork Print", status: "Published", date: "9 hours ago" },
  { name: "Local Eclectic Ring", status: "Pending", date: "1 day ago" },
  { name: "Enamel Outdoor Set", status: "Published", date: "9 hours ago" },
];

const meta = {
  title: "Shared/DashboardWidgetCard",
  component: DashboardWidgetCard,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div class="tw-w-[600px] tw-h-[460px] tw-p-6 tw-bg-[var(--neutrals-100)]">
          <story />
        </div>
      `,
    }),
  ],
  args: {
    header: "Products",
    icon: "lucide-package-open",
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Modern dashboard widget card with optional KPI stats area, action buttons, and footer. Used within the GridStack dashboard layout.",
      },
    },
  },
} satisfies Meta<typeof DashboardWidgetCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-featured card with stats, activity feed content, and ghost action buttons */
export const ModernWithStats: Story = {
  render: (args) => ({
    components: { DashboardWidgetCard, DashboardStatItem, DashboardFeedList, DashboardFeedRow, VcButton },
    setup() {
      return { args, rows };
    },
    template: `
      <DashboardWidgetCard v-bind="args">
        <template #actions>
          <VcButton size="sm" variant="ghost">Add product</VcButton>
          <VcButton size="sm" variant="ghost">View all &rarr;</VcButton>
        </template>
        <template #stats>
          <DashboardStatItem :value="142" label="Total" />
          <DashboardStatItem :value="14" label="Pending" variant="warning" />
          <DashboardStatItem :value="8" label="Today" variant="success" />
        </template>
        <template #content>
          <DashboardFeedList>
            <DashboardFeedRow
              v-for="row in rows"
              :key="row.name"
            >
              <span
                class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-flex-shrink-0"
                :class="row.status === 'Published' ? 'tw-bg-[var(--success-500)]' : 'tw-bg-[var(--warning-500)]'"
              />
              <span class="tw-text-xs tw-text-[var(--neutrals-500)] tw-flex-shrink-0">{{ row.status }}</span>
              <span class="tw-text-sm tw-text-[var(--neutrals-950)] tw-truncate">{{ row.name }}</span>
              <template #trailing>
                <span class="tw-text-xs tw-text-[var(--neutrals-400)]">{{ row.date }}</span>
              </template>
            </DashboardFeedRow>
          </DashboardFeedList>
        </template>
        <template #footer>
          <a href="#" class="tw-text-sm tw-font-medium tw-text-[var(--primary-700)]">View all 142 products &rarr;</a>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Backward-compatible card with secondary action buttons (existing pattern) */
export const LegacyCompatible: Story = {
  render: (args) => ({
    components: { DashboardWidgetCard, VcButton },
    setup() {
      return { args, rows };
    },
    template: `
      <DashboardWidgetCard v-bind="args">
        <template #actions>
          <VcButton size="sm" variant="secondary">Add</VcButton>
          <VcButton size="sm" variant="secondary">All</VcButton>
        </template>
        <template #content>
          <div class="tw-p-4 tw-space-y-3">
            <div
              v-for="row in rows"
              :key="row.name"
              class="tw-flex tw-items-center tw-justify-between tw-border-0 tw-border-b tw-border-solid tw-border-[var(--neutrals-200)] tw-pb-2"
            >
              <span class="tw-text-sm tw-text-[var(--neutrals-700)]">{{ row.name }}</span>
              <span class="tw-text-sm tw-font-semibold tw-text-[var(--neutrals-950)]">{{ row.status }}</span>
            </div>
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Card with loading state */
export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    components: { DashboardWidgetCard, VcButton },
    setup() {
      return { args };
    },
    template: `
      <DashboardWidgetCard v-bind="args">
        <template #actions>
          <VcButton size="sm" variant="ghost">View all &rarr;</VcButton>
        </template>
        <template #content>
          <div class="tw-p-5 tw-text-sm tw-text-[var(--neutrals-500)]">
            Loading widget content...
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Card with custom header slot */
export const CustomHeader: Story = {
  render: (args) => ({
    components: { DashboardWidgetCard, DashboardStatItem, VcButton },
    setup() {
      return { args };
    },
    template: `
      <DashboardWidgetCard v-bind="args">
        <template #header>
          <div class="tw-flex tw-items-center tw-gap-2">
            <span class="tw-text-lg tw-font-semibold tw-text-[var(--neutrals-950)]">Orders</span>
            <span class="tw-rounded-full tw-bg-[var(--warning-100)] tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-[var(--warning-700)]">3 need review</span>
          </div>
        </template>
        <template #actions>
          <VcButton size="sm" variant="ghost">Open queue &rarr;</VcButton>
        </template>
        <template #stats>
          <DashboardStatItem :value="48" label="Total orders" />
          <DashboardStatItem :value="3" label="Need review" variant="warning" />
          <DashboardStatItem value="$12,450" label="Revenue" variant="success" />
        </template>
        <template #content>
          <div class="tw-p-5 tw-space-y-2">
            <p class="tw-m-0 tw-text-sm tw-text-[var(--neutrals-700)]">12 orders have validation issues.</p>
            <p class="tw-m-0 tw-text-sm tw-text-[var(--neutrals-700)]">Average processing time: 1h 25m.</p>
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Minimal card without stats or footer */
export const Minimal: Story = {
  args: {
    header: "Rating & Reviews",
    icon: "material-star_outline",
  },
  render: (args) => ({
    components: { DashboardWidgetCard },
    setup() {
      return { args };
    },
    template: `
      <DashboardWidgetCard v-bind="args">
        <template #content>
          <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12 tw-text-[var(--neutrals-400)]">
            <span class="tw-text-3xl tw-mb-2">&#9734;</span>
            <span class="tw-text-sm">No rating yet</span>
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};
