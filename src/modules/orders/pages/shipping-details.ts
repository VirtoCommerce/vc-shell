import { DynamicDetailsSchema } from "@vc-shell/framework";

export const shippingDetails: DynamicDetailsSchema = {
  settings: {
    id: "ShippingDetails",
    component: "DynamicBladeForm",
    localizationPrefix: "SHIPPING",
    composable: "useShippingDetails",
    width: "40%",
    toolbar: [
      {
        id: "save",
        title: "SHIPPING.PAGES.DETAILS.TOOLBAR.SAVE",
        icon: "fas fa-save",
        method: "saveChanges",
      },
      {
        id: "remove",
        title: "SHIPPING.PAGES.DETAILS.TOOLBAR.DELETE",
        icon: "fas fa-trash",
        method: "remove",
      },
    ],
  },
  content: [
    {
      id: "shippingForm",
      component: "vc-form",
      children: [
        {
          id: "itemsCard",
          component: "vc-card",
          label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.TITLE",
          fields: [
            {
              id: "itemsFieldset",
              columns: 2,
              component: "vc-fieldset",
              fields: [
                {
                  id: "itemsFieldsetLeft",
                  component: "vc-fieldset",
                  fields: [
                    {
                      id: "fulfillmentCenter",
                      component: "vc-select",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.FULFILLMENT_CENTER",
                      property: "setFulfillmentCenter",
                      optionValue: "id",
                      optionLabel: "name",
                      optionsMethod: "fulfillmentCenters",
                      emitValue: false,
                    },
                    {
                      id: "shipmentNumber",
                      component: "vc-input",
                      property: "number",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_ID",
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_ID_PLACEHOLDER",
                    },
                    {
                      id: "status",
                      component: "vc-select",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.STATUS",
                      property: "status",
                      optionValue: "value",
                      optionLabel: "label",
                      optionsMethod: "shippingStatuses",
                    },
                    {
                      id: "shipmentAmount",
                      component: "vc-input-currency",
                      property: "total",
                      currencyDisplay: "symbol",
                      optionProperty: "currency",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_AMOUNT",
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_AMOUNT_PLACEHOLDER",
                    },
                    {
                      id: "trackingNumber",
                      component: "vc-input",
                      property: "trackingNumber",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.TRACKING_NUMBER",
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.TRACKING_NUMBER_PLACEHOLDER",
                    },
                    {
                      id: "trackingUrl",
                      component: "vc-input",
                      property: "trackingUrl",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.TRACKING_URL",
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.TRACKING_URL_PLACEHOLDER",
                    },
                  ],
                },
                {
                  id: "itemsFieldsetRight",
                  component: "vc-fieldset",
                  fields: [
                    {
                      id: "shippingMethodInput",
                      component: "vc-input",
                      property: "shipmentMethodCode.name",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPPING_METHOD",
                      disabled: {
                        method: "isShippingMethodDisabled",
                      },
                      visibility: {
                        method: "isShippingMethodVisible",
                      },
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPPING_METHOD_PLACEHOLDER",
                    },
                    {
                      id: "shippingMethodSelect",
                      component: "vc-select",
                      property: "shipmentMethodCode",
                      optionsMethod: "shippingMethods",
                      optionValue: "code",
                      optionLabel: "name",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPPING_METHOD",
                      visibility: {
                        method: "isShippingMethodSelectVisible",
                      },
                      rules: {
                        required: true,
                      },
                      emitValue: false,
                    },
                    {
                      id: "dateTime",
                      component: "vc-input",
                      variant: "date",
                      property: "createdDate",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.DATE_TIME",
                      disabled: {
                        method: "disabledDateTime",
                      },
                    },
                    {
                      id: "assignedTo",
                      component: "vc-select",
                      property: "setEmployee",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.ASSIGNED_TO",
                      optionValue: "id",
                      optionLabel: "fullName",
                      optionsMethod: "employee",
                      emitValue: false,
                    },
                    {
                      id: "shipmentAmountWithTax",
                      component: "vc-input-currency",
                      property: "totalWithTax",
                      currencyDisplay: "symbol",
                      optionProperty: "currency",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_AMOUNT_WITH_TAX",
                      placeholder: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.SHIPMENT_AMOUNT_WITH_TAX_PLACEHOLDER",
                    },
                    {
                      id: "deliveryDate",
                      component: "vc-input",
                      variant: "date",
                      property: "deliveryDate",
                      label: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.DELIVERY_DATE",
                    },
                  ],
                },
              ],
            },
            {
              id: "lineItemsGrid",
              component: "vc-table",
              header: false,
              addNewRowButton: {
                title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.ADD",
                method: "addNewLineItem",
                show: true,
              },
              actions: [
                {
                  id: "deleteItem",
                  icon: "fas fa-trash",
                  title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.TABLE.ACTIONS.DELETE",
                  type: "danger",
                  position: "left",
                  method: "removeLineItem",
                },
              ],
              property: "items",
              columns: [
                {
                  id: "lineItem.imageUrl",
                  title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.TABLE.IMAGE",
                  type: "image",
                  width: "100px",
                },
                {
                  id: "lineItem.sku",
                  title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.TABLE.SKU",
                },
                {
                  id: "lineItem.quantity",
                  title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.TABLE.QTY",
                },
                {
                  id: "lineItem.priceWithTax",
                  title: "SHIPPING.PAGES.DETAILS.FORM.ITEMS.LINE_ITEMS.TABLE.PRICE",
                  type: "money",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
