import type { Meta, StoryFn } from "@storybook/vue3";
import { VcBlade } from "./";
import { ref } from "vue";

export default {
  title: "organisms/VcBlade",
  component: VcBlade,
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
  decorators: [() => ({ template: "<div><VcPopupContainer/><story/></div>" })],
} satisfies Meta<typeof VcBlade>;

export const Primary: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    return { args };
  },
  template: '<vc-blade v-bind="args"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const BladeWithError: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    const error = ref("This is an error message");
    return { args, error };
  },
  template: '<vc-blade v-bind="args" :error="error"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const BladeWithLoading: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    return { args };
  },
  template: '<vc-blade v-bind="args" v-loading="true"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const ClosableBlade: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    const closeBlade = () => {
      alert("Blade Closed");
    };
    return { args, closeBlade };
  },
  template: '<vc-blade v-bind="args" closable @close="closeBlade"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const ExpandableBlade: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    const expandBlade = () => {
      alert("Blade Expanded");
    };
    return { args, expandBlade };
  },
  template: '<vc-blade v-bind="args" expandable @expand="expandBlade"><div class="p-4">Blade Contents</div></vc-blade>',
});

export const bladeWithoutToolbar: StoryFn<typeof VcBlade> = (args) => ({
  components: { VcBlade },
  setup() {
    return { args };
  },
  template: '<vc-blade v-bind="args" :toolbarItems="[]"><div class="p-4">Blade Contents</div></vc-blade>',
});
