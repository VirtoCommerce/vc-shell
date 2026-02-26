import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { VcImageUpload } from "@ui/components/organisms/vc-image-upload";

export default {
  title: "organisms/VcImageUpload",
  component: VcImageUpload,
} satisfies Meta<typeof VcImageUpload>;

const Template: StoryFn = (args) => ({
  components: { VcImageUpload },
  setup: () => ({ args }),
  template: '<div class="tw-p-4 tw-max-w-md"><VcImageUpload v-bind="args" /></div>',
});

export const Empty = Template.bind({});
Empty.args = {};

export const WithImage = Template.bind({});
WithImage.args = {
  image: {
    name: "avatar.jpg",
    url: "https://picsum.photos/seed/avatar/200",
    readableSize: "45 KB",
    id: "1",
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  image: {
    name: "logo.png",
    url: "https://picsum.photos/seed/logo/200",
    id: "1",
  },
  disabled: true,
};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholder: { text: "Drag your photo here", link: "or click to browse" },
  icon: "material-camera",
};

export const WithValidation = Template.bind({});
WithValidation.args = {
  rules: { fileWeight: 300 },
};
