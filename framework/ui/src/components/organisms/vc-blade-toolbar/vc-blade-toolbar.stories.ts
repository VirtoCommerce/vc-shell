/**
 * Blade Toolbar component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcBladeToolbar from "./vc-blade-toolbar.vue";

export default {
  title: "organisms/vc-blade-toolbar",
  component: VcBladeToolbar,
};

const Template: Story = (args) => ({
  components: { VcBladeToolbar },
  setup() {
    return { args };
  },
  template: '<vc-blade-toolbar v-bind="args"></vc-blade-toolbar>',
});

export const BladeToolbar = Template.bind({});
BladeToolbar.storyName = "vc-blade-toolbar";
BladeToolbar.args = {
  items: [
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
