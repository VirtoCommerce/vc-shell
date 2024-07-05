import { DynamicDetailsSchema } from "@vc-shell/framework";

export const details: DynamicDetailsSchema = {
  settings: {
    id: "OrderDetails",
    url: "/order",
    component: "DynamicBladeForm",
    localizationPrefix: "ORDERS",
    composable: "useOrder",
    width: "70%",
    toolbar: [
      {
        id: "downloadPdf",
        title: "ORDERS.PAGES.DETAILS.TOOLBAR.DL_PDF",
        icon: "fas fa-file-pdf",
        method: "downloadPdf",
      },
      {
        id: "save",
        title: "ORDERS.PAGES.DETAILS.TOOLBAR.SAVE",
        icon: "fas fa-save",
        method: "saveChanges",
      },
      {
        id: "edit",
        title: "ORDERS.PAGES.DETAILS.TOOLBAR.EDIT",
        icon: "fas fa-edit",
        method: "edit",
      },
      {
        id: "cancelEdit",
        title: "ORDERS.PAGES.DETAILS.TOOLBAR.CANCEL_EDIT",
        icon: "fas fa-undo",
        method: "cancelEdit",
      },
      {
        id: "stateMachineComputed",
        method: "stateMachineComputed",
      },
    ],
  },
  content: [
    {
      id: "orderForm",
      component: "vc-form",
      children: [
        {
          id: "orderInfoFieldset",
          component: "vc-fieldset",
          columns: 2,
          fields: [
            {
              id: "orderInfoCard",
              component: "vc-card",
              label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TITLE",
              fields: [
                {
                  id: "orderInfo",
                  component: "vc-fieldset",
                  horizontalSeparator: true,
                  fields: [
                    {
                      id: "orderRefNum",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.ORDER_REF",
                      property: "number",
                      orientation: "horizontal",
                    },
                    {
                      id: "createdDate",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.CREATED_DATE",
                      property: "createdDate",
                      orientation: "horizontal",
                    },
                    {
                      id: "store",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.STORE",
                      property: "storeId",
                      orientation: "horizontal",
                      tooltip: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.STORE_TOOLTIP",
                    },
                    {
                      id: "orderStatus",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.ORDER_STATUS",
                      property: "status",
                      orientation: "horizontal",
                    },
                  ],
                },
                {
                  id: "orderTotals",
                  component: "vc-fieldset",
                  fields: [
                    {
                      id: "orderSubTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.SUBTOTAL",
                      property: "subTotal",
                      orientation: "horizontal",
                    },
                    {
                      id: "orderDiscountTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.DISCOUNT_TOTAL",
                      property: "discountTotal",
                      orientation: "horizontal",
                    },
                    {
                      id: "orderCommissionsTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.COMMISSIONS_TOTAL",
                      property: "feeTotal",
                      orientation: "horizontal",
                    },
                    {
                      id: "taxTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TAX",
                      property: "taxTotal",
                      orientation: "horizontal",
                    },
                    {
                      id: "shippingTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.SHIPPING",
                      property: "shippingTotal",
                      orientation: "horizontal",
                    },
                    {
                      id: "orderTotal",
                      component: "vc-field",
                      label: "ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TOTAL",
                      property: "total",
                      orientation: "horizontal",
                    },
                  ],
                },
              ],
            },
            {
              id: "buyerInfoCard",
              component: "vc-card",
              label: "ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.TITLE",
              fields: [
                {
                  id: "buyerInfoFieldset",
                  component: "vc-fieldset",
                  property: "shippingInfo",
                  horizontalSeparator: true,
                  fields: [
                    {
                      id: "name",
                      component: "vc-field",
                      label: "{label}",
                      property: "name",
                      orientation: "horizontal",
                      aspectRatio: [1, 2],
                    },
                    {
                      id: "address",
                      component: "vc-field",
                      property: "address",
                      orientation: "horizontal",
                      aspectRatio: [1, 2],
                      visibility: {
                        method: "addressVisibility",
                      },
                    },
                    {
                      id: "phone",
                      component: "vc-field",
                      property: "phone",
                      orientation: "horizontal",
                      aspectRatio: [1, 2],
                      visibility: {
                        method: "phoneVisibility",
                      },
                    },
                    {
                      id: "email",
                      component: "vc-field",
                      property: "email",
                      orientation: "horizontal",
                      aspectRatio: [1, 2],
                      variant: "email",
                      visibility: {
                        method: "emailVisibility",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "itemsListCard",
          component: "vc-card",
          label: "ORDERS.PAGES.DETAILS.FORM.ITEMS_LIST.TITLE",
          removePadding: true,
          fields: [
            {
              id: "orderItemsList",
              component: "vc-table",
              header: false,
              multiselect: false,
              property: "items",
              footer: false,
              // mobileTemplate: {
              //   component: "OrderOfferMobileGridView",
              // },
              columns: [
                {
                  id: "imageUrl",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.PIC",
                  width: "60px",
                  class: "tw-pr-0",
                  type: "image",
                },
                // {
                //   id: "sku",
                //   title: "ORDERS.PAGES.DETAILS.FORM.TABLE.SKU",
                //   width: 100,
                // },
                {
                  id: "name",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.NAME",
                  customTemplate: {
                    component: "OrderGridName",
                  },
                },
                {
                  id: "quantity",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.QUANTITY",
                  type: "number",
                  editable: true,
                  rules: {
                    min_value: 0,
                  },
                  onCellBlur: {
                    method: "calculateTotals",
                  },
                },
                {
                  id: "price",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.UNIT_PRICE",
                  type: "money",
                  currencyField: "currency",
                  editable: true,
                  rules: {
                    min_value: 0,
                  },
                  onCellBlur: {
                    method: "calculateTotals",
                  },
                },
                {
                  id: "extendedPrice",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.TOTAL",
                  type: "money",
                  currencyField: "currency",
                },
                {
                  id: "fee",
                  title: "ORDERS.PAGES.DETAILS.FORM.TABLE.COMMISSION",
                  customTemplate: {
                    component: "OrderGridFee",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "orderWidgets",
      component: "vc-widgets",
      children: ["ShippingWidget"],
    },
  ],
};
