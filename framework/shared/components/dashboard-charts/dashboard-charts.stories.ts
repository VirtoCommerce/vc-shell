import { computed, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DashboardLineChart from "./DashboardLineChart.vue";
import DashboardBarChart from "./DashboardBarChart.vue";
import DashboardDonutChart from "./DashboardDonutChart.vue";
import DashboardWidgetCard from "@shared/components/dashboard-widget-card/dashboard-widget-card.vue";
import DashboardStatItem from "@shared/components/dashboard-widget-card/dashboard-stat-item.vue";
import type { ChartConfig } from "./types";

// --- Sample data ---

const revenueData = [
  { month: 0, revenue: 4200, orders: 120 },
  { month: 1, revenue: 5100, orders: 145 },
  { month: 2, revenue: 4800, orders: 132 },
  { month: 3, revenue: 6200, orders: 178 },
  { month: 4, revenue: 5900, orders: 165 },
  { month: 5, revenue: 7100, orders: 198 },
  { month: 6, revenue: 6800, orders: 184 },
  { month: 7, revenue: 7600, orders: 210 },
  { month: 8, revenue: 8200, orders: 221 },
  { month: 9, revenue: 7900, orders: 207 },
  { month: 10, revenue: 8600, orders: 236 },
  { month: 11, revenue: 9400, orders: 258 },
];

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const salesByCategory = [
  { category: 0, electronics: 12000, clothing: 8500, home: 5200 },
  { category: 1, electronics: 14000, clothing: 9200, home: 6100 },
  { category: 2, electronics: 11000, clothing: 10500, home: 7300 },
  { category: 3, electronics: 15500, clothing: 8800, home: 5800 },
];

const categoryLabels = ["Q1", "Q2", "Q3", "Q4"];

const channelTrendData = [
  { month: 0, marketplace: 1600, direct: 1100, b2b: 700 },
  { month: 1, marketplace: 1700, direct: 1200, b2b: 760 },
  { month: 2, marketplace: 1650, direct: 1160, b2b: 740 },
  { month: 3, marketplace: 1950, direct: 1300, b2b: 820 },
  { month: 4, marketplace: 1860, direct: 1260, b2b: 790 },
  { month: 5, marketplace: 2100, direct: 1400, b2b: 910 },
  { month: 6, marketplace: 2020, direct: 1370, b2b: 880 },
  { month: 7, marketplace: 2260, direct: 1520, b2b: 990 },
  { month: 8, marketplace: 2340, direct: 1600, b2b: 1030 },
  { month: 9, marketplace: 2210, direct: 1540, b2b: 980 },
  { month: 10, marketplace: 2420, direct: 1660, b2b: 1090 },
  { month: 11, marketplace: 2580, direct: 1740, b2b: 1150 },
];

const statusData = [
  { label: "Published", value: 142 },
  { label: "Pending", value: 38 },
  { label: "Draft", value: 15 },
  { label: "Archived", value: 7 },
];

// --- Configs ---

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue ($)", color: "var(--primary-500)" },
  orders: { label: "Orders", color: "var(--success-500)" },
};

const salesConfig: ChartConfig = {
  electronics: { label: "Electronics", color: "var(--primary-500)" },
  clothing: { label: "Clothing", color: "var(--success-500)" },
  home: { label: "Home & Garden", color: "var(--warning-500)" },
};

const channelTrendConfig: ChartConfig = {
  marketplace: { label: "Marketplace", color: "var(--primary-500)" },
  direct: { label: "Direct", color: "var(--success-500)" },
  b2b: { label: "B2B", color: "var(--warning-500)" },
};

const statusConfig: ChartConfig = {
  published: { label: "Published", color: "var(--success-500)" },
  pending: { label: "Pending", color: "var(--warning-500)" },
  draft: { label: "Draft", color: "var(--primary-300)" },
  archived: { label: "Archived", color: "var(--neutrals-400)" },
};

const periodOptions = [
  { id: "3m", label: "3M", size: 3 },
  { id: "6m", label: "6M", size: 6 },
  { id: "12m", label: "12M", size: 12 },
  { id: "all", label: "ALL", size: null },
] as const;

type PeriodOption = (typeof periodOptions)[number]["id"];

// --- Stories ---

const meta = {
  title: "Shared/DashboardCharts",
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div class="tw-w-[600px] tw-p-6 tw-bg-[var(--neutrals-100)]">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Dashboard chart components built on Unovis with hover tooltips and optional range filtering for time-based datasets.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Line chart showing revenue trend over time */
export const LineChart: Story = {
  render: () => ({
    components: { DashboardLineChart, DashboardWidgetCard, DashboardStatItem },
    setup() {
      return { revenueData, revenueConfig, monthLabels };
    },
    template: `
      <DashboardWidgetCard header="Revenue Trend" icon="material-trending_up">
        <template #stats>
          <DashboardStatItem value="$83,800" label="Total revenue" />
          <DashboardStatItem value="+18%" label="vs last period" variant="success" />
        </template>
        <template #content>
          <div class="tw-px-4 tw-py-3" style="height: 400px;">
            <DashboardLineChart
              :data="revenueData"
              :config="revenueConfig"
              x-key="month"
              :y-keys="['revenue']"
              :x-tick-format="(v) => monthLabels[v] ?? v"
              :y-tick-format="(v) => '$' + (v / 1000).toFixed(0) + 'k'"
              :num-x-ticks="6"
            />
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Multi-line chart with two data series */
export const MultiLineChart: Story = {
  render: () => ({
    components: { DashboardLineChart, DashboardWidgetCard },
    setup() {
      return { revenueData, revenueConfig, monthLabels };
    },
    template: `
      <DashboardWidgetCard header="Revenue & Orders" icon="material-analytics">
        <template #content>
          <div class="tw-px-4 tw-py-3" style="height: 400px;">
            <DashboardLineChart
              :data="revenueData"
              :config="revenueConfig"
              x-key="month"
              :y-keys="['revenue', 'orders']"
              :x-tick-format="(v) => monthLabels[v] ?? v"
              :num-x-ticks="6"
            />
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Grouped bar chart showing quarterly sales by category */
export const BarChart: Story = {
  render: () => ({
    components: { DashboardBarChart, DashboardWidgetCard },
    setup() {
      return { salesByCategory, salesConfig, categoryLabels };
    },
    template: `
      <DashboardWidgetCard header="Sales by Category" icon="material-bar_chart">
        <template #content>
          <div class="tw-px-4 tw-py-3" style="height: 400px;">
            <DashboardBarChart
              :data="salesByCategory"
              :config="salesConfig"
              x-key="category"
              :y-keys="['electronics', 'clothing', 'home']"
              :x-tick-format="(v) => categoryLabels[v] ?? v"
              :y-tick-format="(v) => '$' + (v / 1000).toFixed(0) + 'k'"
            />
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Donut chart showing product status distribution */
export const DonutChart: Story = {
  render: () => ({
    components: { DashboardDonutChart, DashboardWidgetCard, DashboardStatItem },
    setup() {
      const total = statusData.reduce((sum, d) => sum + d.value, 0);
      return { statusData, statusConfig, total };
    },
    template: `
      <DashboardWidgetCard header="Product Status" icon="lucide-package-open">
        <template #stats>
          <DashboardStatItem :value="total" label="Total products" />
        </template>
        <template #content>
          <div class="tw-px-4 tw-py-3" style="height: 400px;">
            <DashboardDonutChart
              :data="statusData"
              :config="statusConfig"
              value-key="value"
              :central-label="String(total)"
              central-sub-label="Products"
            />
          </div>
        </template>
      </DashboardWidgetCard>
    `,
  }),
};

/** Compact donut without legend — for small widgets */
export const DonutCompact: Story = {
  render: () => ({
    components: { DashboardDonutChart },
    setup() {
      return { statusData, statusConfig };
    },
    template: `
      <div style="width: 200px; height: 400px;">
        <DashboardDonutChart
          :data="statusData"
          :config="statusConfig"
          value-key="value"
          :show-legend="false"
          :show-tooltip="false"
          :arc-width="40"
        />
      </div>
    `,
  }),
};

/** Interactive example: hover tooltips + selectable period */
export const InteractiveRangeAndTooltips: Story = {
  render: () => ({
    components: { DashboardLineChart, DashboardBarChart, DashboardDonutChart, DashboardWidgetCard },
    setup() {
      const selectedPeriod = ref<PeriodOption>("6m");
      const tooltipEnabled = ref(true);

      const maxMonth = computed(() => revenueData[revenueData.length - 1]?.month ?? 0);

      const rangeStart = computed(() => {
        const option = periodOptions.find(({ id }) => id === selectedPeriod.value);
        if (!option || option.size === null) {
          return undefined;
        }
        return Math.max(0, maxMonth.value - (option.size - 1));
      });

      const rangeLabel = computed(
        () =>
          periodOptions.find(({ id }) => id === selectedPeriod.value)?.label ?? "ALL",
      );

      const totalProducts = statusData.reduce((sum, item) => sum + item.value, 0);

      return {
        revenueData,
        revenueConfig,
        channelTrendData,
        channelTrendConfig,
        statusData,
        statusConfig,
        monthLabels,
        periodOptions,
        selectedPeriod,
        tooltipEnabled,
        rangeStart,
        rangeEnd: maxMonth,
        rangeLabel,
        totalProducts,
      };
    },
    template: `
      <div class="tw-flex tw-flex-col tw-gap-4">
        <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-3">
          <div class="tw-inline-flex tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-neutrals-200">
            <button
              v-for="option in periodOptions"
              :key="option.id"
              class="tw-border-0 tw-bg-transparent tw-px-3 tw-py-1.5 tw-text-xs tw-font-semibold tw-transition-colors"
              :class="selectedPeriod === option.id
                ? 'tw-bg-[var(--primary-500)] tw-text-additional-50'
                : 'tw-text-neutrals-600 hover:tw-bg-neutrals-100'"
              @click="selectedPeriod = option.id"
            >
              {{ option.label }}
            </button>
          </div>

          <label class="tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-font-medium tw-text-neutrals-700">
            <input
              v-model="tooltipEnabled"
              type="checkbox"
              class="tw-h-4 tw-w-4 tw-cursor-pointer tw-rounded tw-border tw-border-solid tw-border-neutrals-300"
            >
            Hover tooltip
          </label>
        </div>

        <DashboardWidgetCard :header="'Revenue by Period (' + rangeLabel + ')'" icon="material-timeline">
          <template #content>
            <div class="tw-px-4 tw-py-3" style="height: 340px;">
              <DashboardLineChart
                :data="revenueData"
                :config="revenueConfig"
                x-key="month"
                :y-keys="['revenue', 'orders']"
                :show-tooltip="tooltipEnabled"
                :range-start="rangeStart"
                :range-end="rangeEnd"
                :x-tick-format="(v) => monthLabels[v] ?? v"
                :y-tick-format="(v) => '$' + (v / 1000).toFixed(1) + 'k'"
                :num-x-ticks="6"
              />
            </div>
          </template>
        </DashboardWidgetCard>

        <DashboardWidgetCard :header="'Channel Performance (' + rangeLabel + ')'" icon="material-stacked_bar_chart">
          <template #content>
            <div class="tw-px-4 tw-py-3" style="height: 340px;">
              <DashboardBarChart
                :data="channelTrendData"
                :config="channelTrendConfig"
                x-key="month"
                :y-keys="['marketplace', 'direct', 'b2b']"
                :show-tooltip="tooltipEnabled"
                :range-start="rangeStart"
                :range-end="rangeEnd"
                :x-tick-format="(v) => monthLabels[v] ?? v"
                :y-tick-format="(v) => '$' + (v / 1000).toFixed(1) + 'k'"
                :num-x-ticks="6"
              />
            </div>
          </template>
        </DashboardWidgetCard>

        <DashboardWidgetCard header="Status Breakdown" icon="material-donut_large">
          <template #content>
            <div class="tw-px-4 tw-py-3" style="height: 320px;">
              <DashboardDonutChart
                :data="statusData"
                :config="statusConfig"
                value-key="value"
                :show-tooltip="tooltipEnabled"
                :central-label="String(totalProducts)"
                central-sub-label="Products"
              />
            </div>
          </template>
        </DashboardWidgetCard>
      </div>
    `,
  }),
};
