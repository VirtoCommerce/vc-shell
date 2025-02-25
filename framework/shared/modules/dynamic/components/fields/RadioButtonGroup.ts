/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ExtractPropTypes, h, toValue, unref } from "vue";
import { unrefNested } from "../../helpers/unrefNested";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { RadioButton } from "../factories";
import { RadioButtonSchema } from "../../types";
import { getModel } from "../../helpers/getters";
import * as _ from "lodash-es";
import { VcLabel, VcHint } from "../../../../../ui/components";

export default {
  name: "RadioButtonGroup",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: RadioButtonSchema }) {
    return () => {
      const label = unrefNested(props.baseProps).label;
      const options: any[] =
        toValue(getModel(props.element.options, props.fieldContext ?? {})) ||
        toValue(unref(props.bladeContext.scope)?.[props.element.options]);

      const fields = options.map((opt) =>
        RadioButton({
          props: Object.assign(
            {},
            {
              value: props.element.optionValue ? toValue(getModel(props.element.optionValue, opt ?? {})) : opt,
              binary: props.element.binary,
              label: props.element.optionLabel ? toValue(getModel(props.element.optionLabel, opt ?? {})) : opt,
            },
            _.omit(unrefNested(props.baseProps), "label"),
            {
              class: unrefNested(props.baseProps).classNames ?? "",
            },
          ),
        }),
      );

      const render = [
        label
          ? h(
              VcLabel,
              { required: props.element.rules?.required },
              {
                default: () => label,
                tooltip: unrefNested(props.baseProps).tooltip ? () => unrefNested(props.baseProps).tooltip : undefined,
              },
            )
          : undefined,
        fields.map((field) => h(field.component as Component, field.props)),
        h({
          props: ["error", "errorMessage"],
          components: { VcHint },
          template: `
            <VcHint v-if="error" class="vc-textarea__error">
              {{ errorMessage }}
            </VcHint>
            `,
        }),
      ];

      if (props.element.rules) {
        return h(
          ValidationField,
          {
            props: {
              rules: props.element.rules,
              modelValue: unrefNested(props.baseProps).modelValue,
              label: unrefNested(props.baseProps).label,
              name: unrefNested(props.baseProps).name,
            },
            index: props.elIndex,
            rows: props.rows,
          },
          () => render,
        );
      } else {
        return render;
      }
    };
  },
};
