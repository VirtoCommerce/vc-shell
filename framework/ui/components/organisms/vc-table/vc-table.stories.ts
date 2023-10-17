import type { Meta, StoryObj } from "@storybook/vue3";

import { VcTable } from "./";
// import VcHint from "../../atoms/vc-hint/vc-hint.vue";
// import VcImage from "../../atoms/vc-image/vc-image.vue";

const meta: Meta<typeof VcTable> = {
  title: "organisms/VcTable",
  // component: VcTable,
};

export default meta;
type Story = StoryObj<typeof VcTable>;

export const Primary: Story = {
  render: (args) => ({
    // components: { VcTable, VcHint, VcImage },
    setup() {
      return { args };
    },
    template: `
    <div class= "tw-flex tw-h-[400px] tw-overflow-hidden">
      <vc-table v-bind="args">
         <template v-slot:item_name="itemData">
            <div class= "tw-flex tw-flex-col">
               <div>{{ itemData.item.name }}</div>
               <vc-hint>{{ itemData.item.description }}</vc-hint>
            </div>
         </template>
      </vc-table>
    </div>
   `,
  }),
  args: {
    multiselect: true,
    stateKey: "storybook_table",

    columns: [
      {
        id: "img",
        title: "Pic",
        width: 60,
        type: "image",
      },
      {
        id: "name",
        title: "Name",
        sortable: true,
      },
      {
        id: "sku",
        title: "SKU",
        sortable: true,
        width: 100,
      },
    ],

    items: [
      {
        id: "1",
        img: "/images/1.jpg",
        name: "Lenovo IdeaCentre 310S-08",
        description: "Physical",
        sku: "990555005",
      },
      {
        id: "2",
        img: "/images/2.jpg",
        name: "BLU Win HD LTE X150Q 8GB",
        description: "Physical",
        sku: "003578948",
      },
      {
        id: "3",
        img: "/images/3.jpg",
        name: "Samsung Galaxy S6 SM-G920F 32GB",
        description: "Physical",
        sku: "334590-095",
      },
      {
        id: "4",
        img: "/images/4.jpg",
        name: "DJI Phantom 3 Professional Quadcopter",
        description: "Physical",
        sku: "000545432",
      },
      {
        id: "5",
        img: "/images/5.jpg",
        name: "3DR X8-M Octocopter for Visual-Spectr",
        description: "Physical",
        sku: "435344443",
      },
    ],
  },
};
