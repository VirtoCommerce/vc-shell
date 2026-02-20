import { defineComponent, markRaw, onUnmounted } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DraggableDashboard from "@shared/components/draggable-dashboard/DraggableDashboard.vue";
import { provideDashboardService } from "@core/composables/useDashboard";
import { LAYOUT_STORAGE_KEY } from "@shared/components/draggable-dashboard";

const MetricWidget = defineComponent({
  name: "MetricWidget",
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
    subtitle: { type: String, default: "" },
  },
  template: `
    <div class="tw-h-full tw-w-full tw-rounded-md tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-4 tw-flex tw-flex-col tw-justify-between">
      <p class="tw-m-0 tw-text-sm tw-text-neutrals-500">{{ title }}</p>
      <p class="tw-m-0 tw-text-4xl tw-font-semibold tw-text-neutrals-950">{{ value }}</p>
      <p class="tw-m-0 tw-text-xs tw-text-success-500">{{ subtitle }}</p>
    </div>
  `,
});

const ListWidget = defineComponent({
  name: "ListWidget",
  props: {
    title: { type: String, required: true },
    items: { type: Array as () => string[], default: () => [] },
  },
  template: `
    <div class="tw-h-full tw-w-full tw-rounded-md tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-4 tw-flex tw-flex-col">
      <p class="tw-m-0 tw-mb-3 tw-text-sm tw-font-medium tw-text-neutrals-700">{{ title }}</p>
      <ul class="tw-m-0 tw-list-none tw-p-0 tw-space-y-2 tw-overflow-auto">
        <li
          v-for="item in items"
          :key="item"
          class="tw-rounded tw-bg-neutrals-100 tw-px-2 tw-py-1 tw-text-xs tw-text-neutrals-700"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  `,
});

function registerStoryWidgets() {
  const dashboard = provideDashboardService();
  const existingIds = new Set(dashboard.getWidgets().map((widget) => widget.id));

  const widgets = [
    {
      id: "story-orders",
      name: "Orders",
      component: markRaw(MetricWidget),
      size: { width: 4, height: 3 },
      position: { x: 0, y: 0 },
      props: {
        title: "Orders today",
        value: "148",
        subtitle: "+12.4% vs yesterday",
      },
    },
    {
      id: "story-revenue",
      name: "Revenue",
      component: markRaw(MetricWidget),
      size: { width: 4, height: 3 },
      position: { x: 4, y: 0 },
      props: {
        title: "Revenue",
        value: "$12,480",
        subtitle: "+8.1% this week",
      },
    },
    {
      id: "story-alerts",
      name: "Alerts",
      component: markRaw(ListWidget),
      size: { width: 4, height: 3 },
      position: { x: 8, y: 0 },
      props: {
        title: "Needs attention",
        items: [
          "4 offers waiting approval",
          "2 shipments delayed",
          "1 product requires changes",
        ],
      },
    },
    {
      id: "story-top-products",
      name: "Top Products",
      component: markRaw(ListWidget),
      size: { width: 6, height: 4 },
      position: { x: 0, y: 3 },
      props: {
        title: "Top products this week",
        items: [
          "Cotton Hoodie",
          "Winter Sneakers",
          "Sports Bottle",
          "Travel Backpack",
          "Sunglasses",
        ],
      },
    },
    {
      id: "story-funnel",
      name: "Funnel",
      component: markRaw(MetricWidget),
      size: { width: 6, height: 4 },
      position: { x: 6, y: 3 },
      props: {
        title: "Conversion",
        value: "4.8%",
        subtitle: "Checkout completion rate",
      },
    },
  ];

  widgets.forEach((widget) => {
    if (!existingIds.has(widget.id)) {
      dashboard.registerWidget(widget);
    }
  });
}

const meta = {
  title: "Shared/DraggableDashboard",
  component: DraggableDashboard,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
        registerStoryWidgets();
        onUnmounted(() => localStorage.removeItem(LAYOUT_STORAGE_KEY));
      },
      template: `
        <div class="tw-h-[720px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-neutrals-100 tw-overflow-hidden">
          <story />
        </div>
      `,
    }),
  ],
  args: {
    showDragHandles: false,
    resizable: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Shared dashboard container used by shell and vendor portal. Story reproduces a realistic widget composition and demonstrates drag/reorder behavior with persisted layout.",
      },
    },
  },
} satisfies Meta<typeof DraggableDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultLayout: Story = {};

export const WithDragHandles: Story = {
  args: {
    showDragHandles: true,
  },
};

export const ResizableWidgets: Story = {
  args: {
    showDragHandles: true,
    resizable: true,
  },
};
