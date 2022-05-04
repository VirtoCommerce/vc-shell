/**
 * Blade component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBlade from "./vc-blade.vue";

export default {
  title: "organisms/vc-blade",
  component: VcBlade,
  argTypes: {
    collapse: { action: "collapse", name: "collapse" },
    expand: { action: "expand", name: "expand" },
  },
};

const Template: Story = (args) => ({
  components: { VcBlade },
  setup() {
    return { args };
  },
  template:
    '<vc-blade v-bind="args"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const Blade = Template.bind({});
Blade.storyName = "vc-blade";
Blade.args = {
  icon: "fas fa-star",
  title: "My Awesome Blade",
  subtitle: "Optional Subtitle",
  width: 700,
  closable: false,
  searchable: false,

  toolbarItems: [
    { id: 1, icon: "fas fa-sync-alt", title: "Refresh" },
    { id: 2, icon: "fas fa-plus", title: "Add" },
    { id: 3, icon: "fas fa-trash", title: "Delete", disabled: true },
    { id: 4, icon: "fas fa-download", title: "Import" },
    { id: 5, icon: "fas fa-upload", title: "Export" },
    { id: 6, icon: "fas fa-cut", title: "Cut", disabled: true },
    { id: 7, icon: "fas fa-paste", title: "Paste", disabled: true },
    { id: 8, icon: "fas fa-cubes", title: "Bulk export", disabled: true },
  ],
};
