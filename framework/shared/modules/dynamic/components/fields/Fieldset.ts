import { Ref, h, inject, nextTick, toRefs } from "vue";
import componentProps from "./props";
import * as _ from "lodash-es";
import { VcButton, VcCol, VcRow } from "../../../../../ui/components";

export default {
  name: "Fieldset",
  props: componentProps,
  setup(props) {
    const isMobile = inject<Ref<boolean>>("isMobile");

    const { fields: fieldsetFields } = toRefs(props);

    return () =>
      fieldsetFields.value.map((fields, index, arr) => {
        const divideByCols = _.chunk(fields, props.element.columns || 1);

        return h(
          "div",
          {
            class: "tw-flex tw-row tw-relative",
            key: `fieldset-${index}`,
          },
          [
            h("div", { class: "tw-flex-1 tw-gap-4 tw-flex tw-flex-col" }, [
              divideByCols.map((itemsArr, colIndex) => {
                return h(
                  VcRow,
                  {
                    key: `col-${colIndex}-${index}`,
                    class: {
                      "tw-relative": true,
                      "tw-gap-4": true,
                    },
                  },
                  () => [
                    ...itemsArr.map((item, itemIndex) => {
                      return h(
                        VcCol,
                        {
                          key: `col-${itemIndex}-${colIndex}-${index}`,
                        },
                        () =>
                          h(item, {
                            elIndex: index,
                            rows: arr.length,
                            key: `item-${itemIndex}-${colIndex}-${index}`,
                          })
                      );
                    }),
                  ]
                );
              }),
            ]),
            props.element.remove
              ? h(VcButton, {
                  iconSize: "m",
                  icon: "fas fa-times-circle",
                  text: true,
                  class: {
                    "tw-m-2": !isMobile.value,
                    "tw-absolute tw-top-0 tw-right-0": isMobile.value,
                    "!tw-hidden": arr.length === 1,
                  },
                  onClick: () => {
                    props.scope[props.element.remove?.method](index);

                    nextTick(() => {
                      props.bladeContext.validationState.validate();
                    });
                  },
                })
              : undefined,
          ]
        );
      });
  },
};
