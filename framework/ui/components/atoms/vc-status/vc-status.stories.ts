import type { Meta, StoryFn } from "@storybook/vue3";
import { VcStatus } from "./";
import { VcIcon } from "../vc-icon";

const VARIANT = ["info", "warning", "danger", "success", "light-danger"];

export default {
  title: "atoms/VcStatus",
  component: VcStatus,
  args: {
    variant: "info",
    outline: true,
    extend: false,
  },
  argTypes: {
    variant: {
      control: "radio",
      options: VARIANT,
      table: {
        type: {
          summary: VARIANT.join(", "),
        },
      },
    },
    outline: {
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    extend: {
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
  },
} satisfies Meta<typeof VcStatus>;

export const Primary: StoryFn<typeof VcStatus> = (args) => ({
  components: { VcStatus },
  setup() {
    return { args };
  },
  template: '<vc-status v-bind="args">Status text</vc-status>',
});

export const Extended: StoryFn<typeof VcStatus> = (args) => ({
  components: { VcStatus, VcIcon },
  setup() {
    return { args };
  },
  template: `
  <vc-status v-bind="args" extend variant="danger" >
    <div class="tw-flex tw-flex-row tw-items-center">
      <VcIcon icon="fas fa-warehouse" size="xl" variant="danger" class="tw-mr-3" />
      <div>
        <h3 class="tw-font-bold">Status</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque tortor id lacus viverra, ut mollis libero auctor. </p>
      </div>
    </div>
  </vc-status>`,
});

export const AllStates: StoryFn<typeof VcStatus> = (args) => ({
  components: { VcStatus },
  setup() {
    return { args, variants: VARIANT };
  },
  template: `
    <div class="tw-space-y-4">
      <div v-for="variant in variants" :key="variant">
        <h2 class="tw-font-bold">Color: {{variant}}</h2>
        <div class="tw-space-x-4 tw-flex tw-flex-row">
          <vc-status v-bind="{...args, variant}">Outline {{variant}}</vc-status>
          <vc-status v-bind="{...args, variant}" :outline="false">{{variant}}</vc-status>
        </div>
      </div>
    </div>
  `,
});
