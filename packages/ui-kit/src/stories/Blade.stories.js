/**
 * Blade story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcBlade from "../components/vc-blade";

export default {
  title: "Blade",
  component: VcBlade,
  argTypes: {
    collapse: { action: "collapse", name: "collapse" },
    expand: { action: "expand", name: "expand" }
  }
};

const Template = (args, { argTypes }) => ({
  components: { VcBlade },
  props: Object.keys(argTypes),
  template: '<vc-blade v-bind="$props" v-on="$props"><div class="vc-padding_l">Blade Contents</div></vc-blade>'
});

export const Blade = Template.bind({});
Blade.args = {
  icon: "star",
  title: "My Awesome Blade",
  subtitle: "Optional Subtitle",
  width: 700,
  closable: false,
  searchable: false,

  toolbarItems: [
    { id: 1, icon: "sync-alt", title: "Refresh" },
    { id: 2, icon: "plus", title: "Add" },
    { id: 3, icon: "trash", title: "Delete", disabled: true },
    { id: 4, icon: "download", title: "Import" },
    { id: 5, icon: "upload", title: "Export" },
    { id: 6, icon: "cut", title: "Cut", disabled: true },
    { id: 7, icon: "paste", title: "Paste", disabled: true },
    { id: 8, icon: "cubes", title: "Bulk export", disabled: true }
  ],

  breadcrumbs: [
    {
      id: 0,
      title: "Back",
      icon: "arrow-left"
    },
    {
      id: 1,
      title: "Electronics"
    },
    {
      id: 2,
      title: "Desktop"
    }
  ]
};
