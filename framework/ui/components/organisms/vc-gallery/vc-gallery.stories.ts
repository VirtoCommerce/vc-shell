import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { VcGallery } from "@ui/components/organisms/vc-gallery";

const sampleImages = [
  { title: "Mountain", name: "mountain.jpg", url: "https://picsum.photos/seed/mountain/400", sortOrder: 0, id: "1" },
  { title: "Ocean", name: "ocean.jpg", url: "https://picsum.photos/seed/ocean/400", sortOrder: 1, id: "2" },
  { title: "Forest", name: "forest.jpg", url: "https://picsum.photos/seed/forest/400", sortOrder: 2, id: "3" },
  { title: "City", name: "city-skyline.jpg", url: "https://picsum.photos/seed/city/400", sortOrder: 3, id: "4" },
  { title: "Desert", name: "desert.jpg", url: "https://picsum.photos/seed/desert/400", sortOrder: 4, id: "5" },
];

export default {
  title: "organisms/VcGallery",
  component: VcGallery,
  args: {
    images: sampleImages,
    size: "md",
    gap: 8,
    imagefit: "contain",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    imagefit: { control: "radio", options: ["contain", "cover"] },
    gap: { control: { type: "range", min: 0, max: 24, step: 4 } },
  },
} satisfies Meta<typeof VcGallery>;

const Template: StoryFn = (args) => ({
  components: { VcGallery },
  setup: () => ({ args }),
  template: '<div class="tw-p-4"><VcGallery v-bind="args" /></div>',
});

export const Default = Template.bind({});

export const SmallTiles = Template.bind({});
SmallTiles.args = { size: "sm" };

export const LargeTiles = Template.bind({});
LargeTiles.args = { size: "lg" };

export const CoverFit = Template.bind({});
CoverFit.args = { imagefit: "cover" };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Empty = Template.bind({});
Empty.args = { images: [] };

export const SingleImage = Template.bind({});
SingleImage.args = { images: [sampleImages[0]] };

export const Loading = Template.bind({});
Loading.args = { loading: true };

export const LimitedActions = Template.bind({});
LimitedActions.args = {
  itemActions: { preview: true, edit: false, remove: true },
};
