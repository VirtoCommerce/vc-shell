import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "FulfillmentCenterDetails",
    component: "DynamicBladeForm",
    localizationPrefix: "FULFILLMENT_CENTERS",
    composable: "useFulfillmentCenter",
    toolbar: [
      {
        id: "save",
        icon: "fas fa-save",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.SAVE",
        method: "saveChanges",
      },
      {
        id: "reset",
        icon: "fas fa-undo",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.RESET",
        method: "reset",
      },
      {
        id: "delete",
        icon: "fas fa-trash",
        title: "FULFILLMENT_CENTERS.PAGES.DETAILS.TOOLBAR.DELETE",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "fulfillmentCenterForm",
      component: "vc-form",
      children: [
        {
          id: "name",
          component: "vc-input",
          label: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.LABEL",
          property: "name",
          placeholder: "FULFILLMENT_CENTERS.PAGES.DETAILS.FORM.NAME.PLACEHOLDER",
          rules: { required: true },
        },
      ],
    },
  ],
};
