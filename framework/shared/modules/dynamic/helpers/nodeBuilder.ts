import { unref, computed, toValue, h, UnwrapNestedRefs, MaybeRef, reactive } from "vue";
import FIELD_MAP from "../components/FIELD_MAP";
import { ControlSchema } from "../types";
import { IControlBaseProps, IControlBaseOptions } from "../types/models";
import { getModel } from "./getters";
import { setModel } from "./setters";
import { unwrapInterpolation } from "./unwrapInterpolation";
import { DetailsBladeContext } from "../factories";
import * as _ from "lodash-es";

function disabledHandler(
  disabled: { method?: string } | boolean,
  context: UnwrapNestedRefs<DetailsBladeContext>
): boolean {
  if (!disabled) return false;
  if (typeof disabled === "boolean") return disabled;
  else if (typeof context.scope[disabled.method] === "function") return context.scope[disabled.method]();
  else if (context.scope[disabled.method]) return context.scope[disabled.method];
  return false;
}

function nodeBuilder<Context, BContext extends UnwrapNestedRefs<DetailsBladeContext>, FormData>(args: {
  controlSchema: ControlSchema;
  parentId: string | number;
  internalContext: Context;
  bladeContext: BContext;
  currentLocale: MaybeRef<string>;
  formData: FormData;
}) {
  const { controlSchema, parentId, internalContext, bladeContext, currentLocale, formData } = args;
  if (!controlSchema) return false;

  const baseProps = reactive<IControlBaseProps>({
    key: `${parentId}`,
    label: controlSchema.label ? unref(unwrapInterpolation(controlSchema.label, internalContext)) : undefined,
    disabled:
      ("disabled" in bladeContext.scope && bladeContext.scope.disabled) ||
      disabledHandler("disabled" in controlSchema && controlSchema.disabled, bladeContext),
    name: controlSchema.id,
    rules: controlSchema.rules,
    placeholder: controlSchema.placeholder,
    required: controlSchema.rules?.required,
    modelValue: getModel(controlSchema.property, internalContext),
    "onUpdate:modelValue": (e) => {
      setModel({ property: controlSchema.property, value: e, context: internalContext });

      if (_.has(controlSchema, "update.method")) {
        controlSchema.update.method in bladeContext.scope &&
        typeof bladeContext.scope[controlSchema.update.method] === "function"
          ? bladeContext.scope[controlSchema.update.method](e, controlSchema.property, internalContext)
          : undefined;
      }
    },
    tooltip: controlSchema.tooltip,
    multilanguage: controlSchema.multilanguage,
  });

  const baseOptions = reactive<IControlBaseOptions>({
    visibility: computed(() =>
      controlSchema.visibility?.method ? toValue(bladeContext.scope[controlSchema.visibility?.method]) : true
    ),
  });

  const component = FIELD_MAP[controlSchema.component];

  const fieldsHandler = computed(() => {
    if (!("fields" in controlSchema)) return null;
    const fieldsModel = getModel(controlSchema.property, internalContext);

    if (toValue(fieldsModel) && Array.isArray(toValue(fieldsModel))) {
      return toValue(fieldsModel).map((model) =>
        controlSchema.fields.map((fieldItem) =>
          nodeBuilder({
            controlSchema: fieldItem,
            parentId: `fieldset-${fieldItem.id}-${model.id}`,
            internalContext: model,
            bladeContext,
            currentLocale,
            formData,
          })
        )
      );
    }
    return [
      controlSchema.fields.map((field) =>
        nodeBuilder({
          controlSchema: field,
          parentId: `fieldset-${parentId}-${field.id}`,
          internalContext,
          bladeContext,
          currentLocale,
          formData,
        })
      ),
    ];
  });

  const elProps = {
    baseProps,
    baseOptions,
    bladeContext,
    element: controlSchema,
    currentLocale,
    fields: fieldsHandler,
    formData,
    fieldContext: internalContext,
  };

  return h(component, elProps);
}

export { nodeBuilder };
