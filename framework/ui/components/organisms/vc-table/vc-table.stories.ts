/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryFn } from "@storybook/vue3";
import { VcTable } from "./";
import VcHint from "../../atoms/vc-hint/vc-hint.vue";
import VcImage from "../../atoms/vc-image/vc-image.vue";
import { ref, unref } from "vue";

export default {
  title: "organisms/VcTable",
  component: VcTable as Record<keyof typeof VcTable, unknown>,
  decorators: [() => ({ template: '<div class="tw-flex tw-h-[400px] tw-overflow-hidden"><story/></div>' })],
  args: {
    multiselect: true,
    stateKey: "storybook_table",

    columns: [
      {
        id: "img",
        title: "Img",
        width: "60px",
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
        width: "100px",
      },
      {
        id: "id",
        title: "ID",
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
} satisfies Meta<typeof VcTable>;

export const Primary: StoryFn<typeof VcTable> = (args) => ({
  components: { VcTable, VcHint, VcImage } as Record<keyof typeof VcTable, unknown>,
  setup() {
    return { args };
  },
  template: `
      <vc-table v-bind="args">
         <template v-slot:item_name="itemData">
            <div class= "tw-flex tw-flex-col">
               <div>{{ itemData.item.name }}</div>
               <vc-hint>{{ itemData.item.description }}</vc-hint>
            </div>
         </template>
      </vc-table>
   `,
});

export const Loading = Primary.bind({});
Loading.args = {
  loading: true,
};

export const WithoutHeader = Primary.bind({});
WithoutHeader.args = {
  header: false,
};

export const WithoutFooter = Primary.bind({});
WithoutFooter.args = {
  footer: false,
};

export const DisabledColumnsResizing = Primary.bind({});
DisabledColumnsResizing.args = {
  resizableColumns: false,
};

export const DisabledColumnsReordering = Primary.bind({});
DisabledColumnsReordering.args = {
  reorderableColumns: false,
};

export const WithReorderableRows: StoryFn<typeof VcTable> = (args) => ({
  components: { VcTable, VcHint, VcImage } as Record<keyof typeof VcTable, unknown>,
  setup() {
    const items = ref([
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
    ]);
    const itemsProxy = ref(items.value);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function sortRows(event: { dragIndex: number; dropIndex: number; value: any[] }) {
      if (event.dragIndex !== event.dropIndex) {
        const sorted = event.value.map((item, index) => {
          item.sortOrder = index;
          return item;
        });

        itemsProxy.value = sorted;
      }
    }
    return { args, itemsProxy, sortRows };
  },
  template: `

      <vc-table v-bind="args" reorderableRows :items="itemsProxy" @row:reorder="sortRows">
         <template v-slot:item_name="itemData">
            <div class= "tw-flex tw-flex-col">
               <div>{{ itemData.item.name }}</div>
               <vc-hint>{{ itemData.item.description }}</vc-hint>
            </div>
         </template>
      </vc-table>

   `,
});

export const SelectAllItems: StoryFn<typeof VcTable> = (args) => ({
  components: { VcTable, VcHint, VcImage } as Record<keyof typeof VcTable, unknown>,
  setup() {
    const selectedIds = ref();
    const onSelectionChanged = (i: any) => {
      const item = unref(i)
        .map((item: any) => item.id)
        .filter((x: any): x is string => x !== null);

      selectedIds.value = item;
    };
    return { args, onSelectionChanged, pages: 2 };
  },
  template: `
      <vc-table v-bind="args" select-all @selection-changed="onSelectionChanged" :pages="pages">
         <template v-slot:item_name="itemData">
            <div class= "tw-flex tw-flex-col">
               <div>{{ itemData.item.name }}</div>
               <vc-hint>{{ itemData.item.description }}</vc-hint>
            </div>
         </template>
      </vc-table>
   `,
});
