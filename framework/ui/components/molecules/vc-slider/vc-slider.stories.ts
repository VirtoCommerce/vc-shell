import type { Meta, StoryObj } from "@storybook/vue3";
import { VcSlider } from ".";
import { VcImage, VcIcon } from "../..";

/**
 * VcSlider component is used to create a content carousel with customizable number of slides,
 * navigation, and overflow options.
 */
const meta = {
  title: "molecules/VcSlider",
  component: VcSlider,
  tags: ["autodocs"],
  args: {
    navigation: true,
    slidesPerView: "2",
    overflow: false,
    spaceBetweenSlides: 10,
    slides: [
      {
        title: "Title1",
        name: "Name1",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title2",
        name: "Name2",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title3",
        name: "Name3",
        url: "https://picsum.photos/400",
      },
      {
        title: "Title4",
        name: "Name4",
        url: "https://picsum.photos/400",
      },
    ],
  },
  argTypes: {
    navigation: {
      description: "Enables/disables navigation buttons for the slider",
      control: { type: "boolean" },
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    slidesPerView: {
      description: "Number of slides visible simultaneously. Can be a number or 'auto'",
      control: { type: "text" },
      table: {
        type: { summary: "string | 'auto'" },
        defaultValue: { summary: "'auto'" },
      },
    },
    spaceBetweenSlides: {
      description: "Space between slides in pixels",
      control: { type: "number" },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "10" },
      },
    },
    overflow: {
      description: "Allows slides to be visible outside the container",
      control: { type: "boolean" },
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    slides: {
      description: "Array of objects representing slides to display",
      control: { type: "object" },
      table: {
        type: { summary: "Array<Record<string, unknown>>" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
VcSlider is a versatile carousel component based on the Swiper.js library.
The component allows you to create sliders with customizable parameters and supports slots for custom content.

### Key features:
- Customizable number of visible slides
- Enable/disable navigation buttons
- Configure space between slides
- Overflow effect (visibility of slides outside the container)
- Custom navigation button configuration via slots
`,
      },
    },
  },
} satisfies Meta<typeof VcSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Standard slider with two visible slides and navigation buttons
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcSlider, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-slider v-bind="args" class="tw-w-full">
        <template v-slot:default="{slide}">
          <vc-image :src="slide.url" class="tw-rounded-md"></vc-image>
          <div class="tw-mt-2 tw-font-medium">{{ slide.title }}</div>
          <div class="tw-text-sm tw-text-gray-500">{{ slide.name }}</div>
        </template>
      </vc-slider>
    `,
  }),
};

/**
 * Slider with auto-sized slides and enabled overflow effect
 */
export const AutoWidth: Story = {
  args: {
    slidesPerView: "auto",
    overflow: true,
  },
  render: (args) => ({
    components: { VcSlider, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-slider v-bind="args" class="tw-w-full">
        <template v-slot:default="{slide}">
          <div class="tw-w-48">
            <vc-image :src="slide.url" class="tw-rounded-md"></vc-image>
            <div class="tw-mt-2 tw-font-medium">{{ slide.title }}</div>
          </div>
        </template>
      </vc-slider>
    `,
  }),
};

/**
 * Slider with increased space between slides
 */
export const SpacedSlides: Story = {
  args: {
    spaceBetweenSlides: 30,
  },
  render: (args) => ({
    components: { VcSlider, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-slider v-bind="args" class="tw-w-full">
        <template v-slot:default="{slide}">
          <vc-image :src="slide.url" class="tw-rounded-md"></vc-image>
        </template>
      </vc-slider>
    `,
  }),
};

/**
 * Slider with customized navigation buttons
 */
export const CustomNavigation: Story = {
  render: (args) => ({
    components: { VcSlider, VcImage, VcIcon },
    setup() {
      return { args };
    },
    template: `
      <vc-slider v-bind="args" class="tw-w-full">
        <template v-slot:default="{slide}">
          <vc-image :src="slide.url" class="tw-rounded-md"></vc-image>
        </template>
        <template v-slot:prevBtn>
          <button class="tw-bg-blue-500 tw-text-white tw-p-2 tw-rounded-full">
            <vc-icon icon="fas fa-arrow-left"></vc-icon>
          </button>
        </template>
        <template v-slot:nextBtn>
          <button class="tw-bg-blue-500 tw-text-white tw-p-2 tw-rounded-full">
            <vc-icon icon="fas fa-arrow-right"></vc-icon>
          </button>
        </template>
      </vc-slider>
    `,
  }),
};

/**
 * Example of a slider with only one visible slide
 */
export const SingleSlide: Story = {
  args: {
    slidesPerView: "1",
  },
  render: (args) => ({
    components: { VcSlider, VcImage },
    setup() {
      return { args };
    },
    template: `
      <vc-slider v-bind="args" class="tw-w-full">
        <template v-slot:default="{slide}">
          <vc-image :src="slide.url" class="tw-rounded-md"></vc-image>
          <div class="tw-mt-2 tw-font-medium tw-text-center">{{ slide.title }}</div>
        </template>
      </vc-slider>
    `,
  }),
};
