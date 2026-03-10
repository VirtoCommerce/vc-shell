import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcMenu, VcMenuItem, VcMenuGroup } from ".";

const meta = {
  title: "Molecules/VcMenu",
  component: VcMenu,
  subcomponents: { VcMenuItem, VcMenuGroup },
  tags: ["autodocs"],
  argTypes: {
    expanded: {
      description: "Whether the menu is expanded (shows titles) or collapsed (icons only)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    loading: {
      description: "Show skeleton loading placeholders",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    expanded: true,
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
A compositional menu component for building navigation sidebars.

## Features

- **Compositional API** — build menus declaratively with VcMenu, VcMenuItem, VcMenuGroup
- **Section groups** — VcMenuGroup with \`variant="section"\` for top-level accordion sections
- **3-level nesting** — Section > Group > Sub-items via recursive VcMenuGroup
- **Animated** — smooth expand/collapse with CSS grid animation, chevron rotation
- **Loading skeleton** — \`loading\` prop shows placeholder skeleton
- **Persistence** — VcMenuGroup remembers open/closed state in localStorage
- **Badges** — simple resolved badge props on VcMenuItem
- **Active state** — explicit \`active\` prop, consumer controls detection logic

## Usage

\`\`\`vue
<template>
  <VcMenu :expanded="sidebarExpanded" :loading="isLoading">
    <VcMenuGroup group-id="catalog" title="Catalog" variant="section">
      <VcMenuItem icon="lucide-box" title="Products" @click="navigate('/products')" />
      <VcMenuGroup group-id="orders" icon="lucide-file" title="Orders">
        <VcMenuItem title="Accepted" icon="lucide-check" nested />
        <VcMenuItem title="Declined" icon="lucide-x" nested />
      </VcMenuGroup>
    </VcMenuGroup>
  </VcMenu>
</template>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="width: 246px; background: var(--additional-50, white); padding: 8px; border-radius: 8px; min-height: 400px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VcMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      const activeItem = ref("/dashboard");
      const handleClick = (url: string) => {
        activeItem.value = url;
      };
      return { args, activeItem, handleClick };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuItem
          icon="lucide-home"
          title="Dashboard"
          :active="activeItem === '/dashboard'"
          @click="handleClick('/dashboard')"
        />
        <VcMenuItem
          icon="lucide-shopping-cart"
          title="Orders"
          :active="activeItem === '/orders'"
          @click="handleClick('/orders')"
        />
        <VcMenuGroup group-id="sb-catalog" icon="lucide-box" title="Catalog">
          <VcMenuItem
            title="Products"
            :active="activeItem === '/products'"
            nested
            @click="handleClick('/products')"
          />
          <VcMenuItem
            title="Categories"
            :active="activeItem === '/categories'"
            nested
            @click="handleClick('/categories')"
          />
        </VcMenuGroup>
        <VcMenuItem
          icon="lucide-settings"
          title="Settings"
          :active="activeItem === '/settings'"
          @click="handleClick('/settings')"
        />
      </VcMenu>
    `,
  }),
};

export const Sections: Story = {
  render: (args) => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      const activeItem = ref("/new-orders");
      const handleClick = (url: string) => {
        activeItem.value = url;
      };
      return { args, activeItem, handleClick };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuGroup group-id="sb-activity" title="Activity" variant="section">
          <VcMenuItem icon="lucide-file-text" title="New Orders" :active="activeItem === '/new-orders'" @click="handleClick('/new-orders')" />
          <VcMenuItem icon="lucide-clock" title="Pending Reviews" @click="handleClick('/pending')" />
          <VcMenuItem icon="lucide-layers" title="Low Stock Alerts" @click="handleClick('/stock')" />
          <VcMenuItem icon="lucide-undo-2" title="Returns & Refunds" @click="handleClick('/returns')" />
        </VcMenuGroup>

        <VcMenuGroup group-id="sb-recent" title="Recent" variant="section">
          <VcMenuItem icon="lucide-file-text" title="New Orders" @click="handleClick('/new-orders')" />
          <VcMenuItem icon="lucide-undo-2" title="Returns & Refunds" @click="handleClick('/returns')" />
        </VcMenuGroup>

        <VcMenuGroup group-id="sb-dashboard" title="Dashboard" variant="section">
          <VcMenuItem icon="lucide-newspaper" title="What's new" @click="handleClick('/whats-new')" />
          <VcMenuItem icon="lucide-bar-chart-2" title="Key Performance Indicators" @click="handleClick('/kpi')" />
        </VcMenuGroup>

        <VcMenuGroup group-id="sb-marketing" title="Marketing" variant="section">
          <VcMenuItem icon="lucide-megaphone" title="Promotions" @click="handleClick('/promotions')" />
          <VcMenuItem icon="lucide-file-code" title="Dynamic content" @click="handleClick('/dynamic')" />
        </VcMenuGroup>
      </VcMenu>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Section-style groups with uppercase headers, dividers, and collapsible content.",
      },
    },
  },
};

export const NestedGroups: Story = {
  render: (args) => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      const activeItem = ref("/accepted");
      const handleClick = (url: string) => {
        activeItem.value = url;
      };
      return { args, activeItem, handleClick };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuGroup group-id="sb-orders-nested" title="Orders & Customers" variant="section">
          <VcMenuItem icon="lucide-file" title="All orders" @click="handleClick('/all-orders')" />

          <VcMenuGroup group-id="sb-new-orders" icon="lucide-file-plus" title="New orders" :open="true">
            <VcMenuItem title="Accepted" icon="lucide-check-square" nested :active="activeItem === '/accepted'" @click="handleClick('/accepted')" />
            <VcMenuItem title="Declined" icon="lucide-x-square" nested @click="handleClick('/declined')" />
          </VcMenuGroup>

          <VcMenuItem icon="lucide-credit-card" title="Not Paid Orders" @click="handleClick('/not-paid')" />
          <VcMenuItem icon="lucide-clock" title="Awaiting Fulfillment" @click="handleClick('/awaiting')" />
          <VcMenuItem icon="lucide-users" title="Customers" @click="handleClick('/customers')" />
          <VcMenuItem icon="lucide-undo-2" title="Returns & Refunds" @click="handleClick('/returns')" />
        </VcMenuGroup>
      </VcMenu>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Three-level nesting: Section > Group > Sub-items. The 'New orders' group expands to show Accepted/Declined.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    components: { VcMenu, VcMenuItem },
    setup() {
      return { args };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuItem icon="lucide-home" title="This should not be visible" />
      </VcMenu>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Loading state shows skeleton placeholders mimicking sections with items. Slot content is hidden.",
      },
    },
  },
};

export const Collapsed: Story = {
  args: {
    expanded: false,
  },
  render: (args) => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      return { args };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuItem icon="lucide-home" title="Dashboard" active />
        <VcMenuItem icon="lucide-shopping-cart" title="Orders" />
        <VcMenuGroup group-id="sb-catalog-c" icon="lucide-box" title="Catalog">
          <VcMenuItem title="Products" nested />
          <VcMenuItem title="Categories" nested />
        </VcMenuGroup>
        <VcMenuItem icon="lucide-settings" title="Settings" />
      </VcMenu>
    `,
  }),
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="width: 64px; background: var(--additional-50, white); padding: 8px; border-radius: 8px; min-height: 400px;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: "Collapsed state shows only icons and letter abbreviations. Tooltips appear on hover.",
      },
    },
  },
};

export const ExpandToggle: Story = {
  render: () => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      const expanded = ref(true);
      return { expanded };
    },
    template: `
      <div>
        <button
          @click="expanded = !expanded"
          style="margin-bottom: 12px; padding: 6px 16px; background: #3b82f6; color: white; border-radius: 6px; border: none; cursor: pointer;"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>

        <div :style="{ width: expanded ? '246px' : '64px', transition: 'width 0.3s ease', background: 'var(--additional-50, white)', padding: '8px', borderRadius: '8px', minHeight: '400px' }">
          <VcMenu :expanded="expanded">
            <VcMenuGroup group-id="sb-activity-t" title="Activity" variant="section">
              <VcMenuItem icon="lucide-file-text" title="New Orders" active />
              <VcMenuItem icon="lucide-clock" title="Pending Reviews" />
            </VcMenuGroup>

            <VcMenuGroup group-id="sb-orders-t" title="Orders & Customers" variant="section">
              <VcMenuItem icon="lucide-file" title="All orders" />
              <VcMenuGroup group-id="sb-new-orders-t" icon="lucide-file-plus" title="New orders">
                <VcMenuItem title="Accepted" icon="lucide-check-square" nested />
                <VcMenuItem title="Declined" icon="lucide-x-square" nested />
              </VcMenuGroup>
              <VcMenuItem icon="lucide-users" title="Customers" />
            </VcMenuGroup>
          </VcMenu>
        </div>
      </div>
    `,
  }),
  decorators: [],
  parameters: {
    docs: {
      description: {
        story: "Interactive demo: toggle between expanded and collapsed states with section groups and nested items.",
      },
    },
  },
};

export const WithBadges: Story = {
  render: (args) => ({
    components: { VcMenu, VcMenuItem, VcMenuGroup },
    setup() {
      return { args };
    },
    template: `
      <VcMenu v-bind="args">
        <VcMenuGroup group-id="sb-badges-section" title="Orders" variant="section">
          <VcMenuItem
            icon="lucide-shopping-cart"
            title="New Orders"
            :badge="{ content: 5, variant: 'primary' }"
          />
          <VcMenuItem
            icon="lucide-alert-triangle"
            title="Returns"
            :badge="{ content: 99, variant: 'danger' }"
          />
          <VcMenuItem
            icon="lucide-bell"
            title="Notifications"
            :badge="{ isDot: true, variant: 'warning' }"
          />
        </VcMenuGroup>
      </VcMenu>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Menu items with badges inside a section group.",
      },
    },
  },
};
