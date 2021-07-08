/**
 * Table component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcTable from "./vc-table.vue";

export default {
  title: "organisms/vc-table",
  component: VcTable,
};

const Template: Story = (args) => ({
  components: { VcTable },
  setup() { return { args } },
  template: `
      <vc-Table v-bind="args">
         <template v-slot:item_img="itemData">
            <img :src="itemData.item.img" class="vc-fill_width" />
         </template>
         <template v-slot:item_name="itemData">
            <div class="vc-flex vc-flex-column">
               <div class="vc-font-size_m vc-ellipsis">{{ itemData.item.name }}</div>
               <div class="vc-font-size_s vc-ellipsis">{{ itemData.item.description }}</div>
            </div>
         </template>
      </vc-Table>
   `,
});

export const Table = Template.bind({});
Table.storyName = "vc-table";
Table.args = {
  multiselect: true,

  headers: [
    {
      id: "img",
      title: "Pic",
      width: 60,
      class: "vc-padding-right_none",
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
      id: 1,
      img: "/images/1.jpg",
      name: "Lenovo IdeaCentre 310S-08",
      description: "Physical",
      sku: "990555005",
    },
    {
      id: 2,
      img: "/images/2.jpg",
      name: "BLU Win HD LTE X150Q 8GB",
      description: "Physical",
      sku: "003578948",
    },
    {
      id: 3,
      img: "/images/3.jpg",
      name: "Samsung Galaxy S6 SM-G920F 32GB",
      description: "Physical",
      sku: "334590-095",
    },
    {
      id: 4,
      img: "/images/4.jpg",
      name: "DJI Phantom 3 Professional Quadcopter",
      description: "Physical",
      sku: "000545432",
    },
    {
      id: 5,
      img: "/images/5.jpg",
      name: "3DR X8-M Octocopter for Visual-Spectr",
      description: "Physical",
      sku: "435344443",
    },
  ],
};
