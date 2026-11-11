import { computed, defineComponent, ref, type PropType } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VcBlade } from "@ui/components/organisms/vc-blade";
import { VcColumn, VcDataTable } from "@ui/components/organisms/vc-data-table";
import type { IBladeToolbar } from "@core/types";
import { VcSearchBar } from "./index";
import { freshKey, provideStoryUrl } from "./vc-search-bar.story-helpers";
import {
  ORDERS,
  StoryBladeScope,
  matchesOrder,
  orderFields,
  orderViews,
  provideStoryStack,
  useOrdersQuery,
  type Order,
} from "./vc-search-bar.in-blade.story-helpers";
import { withMobileView, withVcApp } from "../../../../../.storybook/decorators";

const meta = {
  title: "Data Display/VcSearchBar/In a Blade",
  component: VcSearchBar,
  tags: ["!autodocs"],
  decorators: [withVcApp],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VcSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const LIST_ID = "orders";
const DETAIL_ID = "order-details";

/** An "Orders" list blade: the table with the search bar, filtered and paged on the client */
const OrdersListBlade = defineComponent({
  name: "OrdersListBlade",
  components: { StoryBladeScope, VcBlade, VcDataTable, VcColumn },
  props: {
    stateKey: { type: String, required: true },
    variant: { type: String as PropType<"inline" | "summary">, default: "inline" },
    width: { type: String, default: "50%" },
    activeId: { type: String, default: undefined },
    /** Fewer columns for a narrow blade */
    compact: Boolean,
  },
  emits: ["open"],
  setup() {
    const q = useOrdersQuery();
    const refreshing = ref(false);
    const toolbar: IBladeToolbar[] = [
      { id: "add", icon: "lucide-plus", title: "Add" },
      {
        id: "refresh",
        icon: "lucide-refresh-cw",
        title: "Refresh",
        clickHandler: () => {
          refreshing.value = true;
          setTimeout(() => (refreshing.value = false), 400);
        },
      },
    ];
    return { ...q, toolbar, refreshing, fields: orderFields, views: orderViews, listId: LIST_ID };
  },
  template: `
    <StoryBladeScope :id="listId" name="OrdersList">
      <VcBlade title="Orders" :width="width" :toolbar-items="toolbar" :loading="refreshing">
        <VcDataTable
          class="tw-grow"
          :items="items"
          :state-key="stateKey"
          searchable
          search-bar
          search-placeholder="Search by number or customer"
          :search-bar-variant="variant"
          :global-filters="fields"
          :search-views="views"
          :total-count="total"
          :unfiltered-count="unfiltered"
          :pagination="pagination"
          :active-item-id="activeId"
          @filter="onFilter"
          @search="onSearch"
          @pagination-click="onPage"
          @row-click="$emit('open', $event.data)"
        >
          <VcColumn id="number" field="number" title="Number" />
          <VcColumn id="customer" field="customer" title="Customer" />
          <VcColumn id="status" field="status" title="Status" />
          <VcColumn v-if="!compact" id="createdDate" field="createdDate" title="Created" type="date" />
          <VcColumn id="total" field="total" title="Total" type="money" align="end" />
          <VcColumn v-if="!compact" id="flags" title="Flags">
            <template #body="{ data }">
              <span class="tw-text-xs tw-text-[color:var(--neutrals-600)]">
                {{ [data.overdue && "Overdue", data.unpaid && "Unpaid"].filter(Boolean).join(" · ") }}
              </span>
            </template>
          </VcColumn>
        </VcDataTable>
      </VcBlade>
    </StoryBladeScope>`,
});

interface ListOpts {
  /** The width of the blade, inside a wide canvas (below ~1024px the shell is a phone) */
  width?: number;
  variant?: "inline" | "summary";
  /** Saved user views stay under this key between reloads; omit it for a fresh key per run */
  key?: string;
  /** `<key>_filters` in the blade URL, with `<key>_view=open` */
  urlFilters?: string;
}

const listBlade =
  (o: ListOpts = {}): Story["render"] =>
  () => ({
    components: { OrdersListBlade },
    setup() {
      const stateKey = o.key ? `story-orders-${o.key}` : freshKey("orders");
      provideStoryStack(ref(LIST_ID));
      provideStoryUrl(o.urlFilters ? { [`${stateKey}_filters`]: o.urlFilters, [`${stateKey}_view`]: "open" } : {});
      return {
        stateKey,
        variant: o.variant,
        frame: o.width ? `${o.width}px` : "100%",
        compact: (o.width ?? 1000) < 500,
      };
    },
    template: `
      <div style="height: 640px; padding: 16px; box-sizing: border-box; display: flex">
        <div :style="{ width: frame, maxWidth: '100%', display: 'flex' }">
          <OrdersListBlade :state-key="stateKey" :variant="variant" :compact="compact" />
        </div>
      </div>`,
  });

/** Wide blade: chips in the row and the view selector by the title. Try a view, edit a chip, save it as your own view. */
export const WideBlade: Story = {
  render: listBlade({ key: "wide" }),
};

/** Medium blade (600px): no chips, everything behind "Filters N ×". Open Filters and change the status or the date. */
export const MediumBlade: Story = {
  render: listBlade({ key: "medium", width: 600 }),
};

/** Narrow blade (440px): Filters is a funnel with a badge. Search "acme" with a filter on to see the empty state. */
export const NarrowBlade: Story = {
  render: listBlade({ key: "narrow", width: 440 }),
};

/** List and detail: click a row and the detail blade opens beside the list, which gets narrower; close it to widen the list again. */
export const ListAndDetail: Story = {
  render: () => ({
    components: { OrdersListBlade, StoryBladeScope, VcBlade },
    setup() {
      const active = ref(LIST_ID);
      const selected = ref<Order>();
      provideStoryStack(active, (id) => {
        if (id !== DETAIL_ID) return;
        selected.value = undefined;
        active.value = LIST_ID;
      });
      provideStoryUrl({});
      const open = (o: Order) => {
        selected.value = o;
        active.value = DETAIL_ID;
      };
      const rows = computed(() => {
        const o = selected.value;
        if (!o) return [];
        return [
          ["Customer", o.customer],
          ["Status", o.status],
          ["Created", o.createdDate.toLocaleDateString()],
          ["Total", `$${o.total.toFixed(2)}`],
          ["Overdue", o.overdue ? "Yes" : "No"],
          ["Unpaid", o.unpaid ? "Yes" : "No"],
        ];
      });
      const detailToolbar: IBladeToolbar[] = [
        { id: "edit", icon: "lucide-pencil", title: "Edit" },
        { id: "delete", icon: "lucide-trash-2", title: "Delete" },
      ];
      return {
        selected,
        rows,
        open,
        detailToolbar,
        stateKey: "story-orders-list-detail",
        detailId: DETAIL_ID,
        listId: LIST_ID,
      };
    },
    template: `
      <div style="height: 640px; padding: 16px; box-sizing: border-box; display: flex; gap: 2px">
        <OrdersListBlade :state-key="stateKey" width="60%" :active-id="selected?.id" @open="open" />
        <StoryBladeScope v-if="selected" :id="detailId" name="OrderDetails" :parent-id="listId">
          <VcBlade :title="selected.number" subtitle="Order details" :toolbar-items="detailToolbar">
            <dl class="tw-grid tw-grid-cols-[auto_1fr] tw-gap-x-6 tw-gap-y-3 tw-p-5 tw-text-sm">
              <template v-for="[label, value] in rows" :key="label">
                <dt class="tw-text-[color:var(--neutrals-600)]">{{ label }}</dt>
                <dd class="tw-m-0">{{ value }}</dd>
              </template>
            </dl>
          </VcBlade>
        </StoryBladeScope>
      </div>`,
  }),
};

/** Phone: the search and a funnel, a summary line under the bar; Filters opens a bottom sheet with the views as chips. */
export const Phone: Story = {
  decorators: [withMobileView],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => ({
    components: { OrdersListBlade },
    setup() {
      provideStoryStack(ref(LIST_ID));
      provideStoryUrl({});
      return { stateKey: "story-orders-phone" };
    },
    template: `
      <div style="height: 100vh; display: flex">
        <OrdersListBlade :state-key="stateKey" compact />
      </div>`,
  }),
};

/** Summary variant: the Filters button names the applied fields instead of chips. Add a toggle and watch the button text. */
export const SummaryVariant: Story = {
  render: listBlade({ key: "summary", variant: "summary" }),
};

/** Opened from a link: the URL holds the "Open orders" view with one more filter, so the view starts as "Modified". */
export const FromUrl: Story = {
  render: listBlade({ urlFilters: "status:New,Processing;overdue:1" }),
};

// Hidden from the sidebar and docs, still run by the story tests
const TEST_ONLY = ["!dev", "!autodocs", "test"];

const countOf = (f: Record<string, unknown>) => ORDERS.filter((o) => matchesOrder(o, f, "")).length;

/** Test: a status picked in the Filters panel narrows the rows and marks the view; footer Clear all brings every row back. */
export const FilterFlowTest: Story = {
  name: "Filter flow in a blade (test)",
  tags: TEST_ONLY,
  render: listBlade(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const range = () => canvasElement.querySelector(".vc-data-table__page-info")?.textContent ?? "";
    const open = countOf({ status: ["New", "Processing"] });
    const newOnly = countOf({ status: ["New"] });

    // the default view applies on load
    await canvas.findByRole("button", { name: "View: Open orders" });
    await waitFor(() => expect(range()).toMatch(new RegExp(`of ${open}\\b`)));

    await userEvent.click(canvas.getByRole("button", { name: /^Filters/ }));
    const panel = within(await body.findByRole("dialog", { name: /Filters/ }));
    await userEvent.click(await panel.findByRole("checkbox", { name: /Processing/ }));

    await waitFor(() => expect(range()).toMatch(new RegExp(`of ${newOnly}\\b`)));
    await expect(newOnly).toBeLessThan(open);
    await expect(await canvas.findByText(/filtered from 42/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "View: Open orders, Modified" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    const footer = within(canvasElement.querySelector<HTMLElement>(".vc-data-table__pagination")!);
    await userEvent.click(footer.getByRole("button", { name: "Clear all" }));
    await waitFor(() => expect(range()).toMatch(new RegExp(`of ${ORDERS.length}\\b`)));
    await expect(canvas.queryByText(/filtered from/)).toBeNull();
  },
};
