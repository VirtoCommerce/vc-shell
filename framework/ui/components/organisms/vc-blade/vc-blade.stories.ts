import type { Meta, StoryObj } from "@storybook/vue3";
import { VcBlade } from "./";

const meta: Meta<typeof VcBlade> = {
  title: "organisms/VcBlade",
  component: VcBlade,
};

export default meta;
type Story = StoryObj<typeof VcBlade>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcBlade },
    setup() {
      return { args };
    },
    template: '<vc-blade v-bind="args"><div class="p-4">Blade Contents</div></vc-blade>',
  }),
  args: {
    icon: "fas fa-star",
    title: "My Awesome Blade",
    subtitle: "Optional Subtitle",
    width: 700,
    closable: false,
    expandable: false,

    toolbarItems: [
      { id: "1", icon: "fas fa-sync-alt", title: "Refresh" },
      { id: "2", icon: "fas fa-plus", title: "Add" },
      { id: "3", icon: "fas fa-trash", title: "Delete", disabled: true },
      { id: "4", icon: "fas fa-download", title: "Import" },
      { id: "5", icon: "fas fa-upload", title: "Export" },
      { id: "6", icon: "fas fa-cut", title: "Cut", disabled: true },
      { id: "7", icon: "fas fa-paste", title: "Paste", disabled: true },
      { id: "8", icon: "fas fa-cubes", title: "Bulk export", disabled: true },
    ],
  },
};
