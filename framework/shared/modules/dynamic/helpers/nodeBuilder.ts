import { unref, computed, toValue, h, UnwrapNestedRefs, MaybeRef, reactive, VNode, ref } from "vue";
import FIELD_MAP from "../components/FIELD_MAP";
import { ControlSchema } from "../types";
import { IControlBaseProps, IControlBaseOptions } from "../types/models";
import { getModel } from "./getters";
import { setModel } from "./setters";
import { unwrapInterpolation } from "./unwrapInterpolation";
import { DetailsBladeContext } from "../factories";
import * as _ from "lodash-es";
import { safeIn } from "./safeIn";

function disabledHandler(
  disabled: { method?: string } | boolean,
  context: UnwrapNestedRefs<DetailsBladeContext>
): boolean {
  if (!disabled) return false;
  if (typeof disabled === "boolean") return disabled;
  else if (disabled.method && typeof context.scope?.[disabled.method] === "function")
    return context.scope[disabled.method]();
  else if (disabled.method && context.scope?.[disabled.method]) return context.scope[disabled.method];
  return false;
}

function nodeBuilder<
  Context extends Record<string, unknown>,
  BContext extends UnwrapNestedRefs<DetailsBladeContext>,
  FormData
>({
  controlSchema,
  parentId,
  internalContext,
  bladeContext,
  currentLocale,
  formData,
}: {
  controlSchema: ControlSchema;
  parentId: string | number;
  internalContext: MaybeRef<Context>;
  bladeContext: BContext;
  currentLocale: MaybeRef<string>;
  formData: FormData;
}): VNode {
  if (!controlSchema) throw new Error("There is no controlSchema provided");

  const name = controlSchema.id;
  const rules = (safeIn("rules", controlSchema) && controlSchema.rules) || undefined;
  const placeholder = (safeIn("placeholder", controlSchema) && controlSchema.placeholder) || undefined;
  const required = safeIn("rules", controlSchema) && controlSchema.rules?.required;

  const contextProperty =
    safeIn("property", controlSchema) &&
    controlSchema.property &&
    getModel(controlSchema.property, toValue(internalContext));

  const scopedProperty =
    safeIn("property", controlSchema) &&
    controlSchema.property &&
    bladeContext.scope &&
    bladeContext.scope[controlSchema.property];

  const modelValue = scopedProperty || contextProperty || undefined;

  const tooltip = (safeIn("tooltip", controlSchema) && controlSchema.tooltip) || undefined;
  const multilanguage = safeIn("multilanguage", controlSchema) && controlSchema.multilanguage;

  const label =
    safeIn("label", controlSchema) && controlSchema.label
      ? unref(unwrapInterpolation(controlSchema.label, toValue(internalContext)))
      : undefined;

  const disabled =
    (bladeContext.scope && safeIn("disabled", bladeContext.scope) && bladeContext.scope.disabled) ||
    (safeIn("disabled", controlSchema) &&
      controlSchema.disabled &&
      disabledHandler(controlSchema.disabled, bladeContext));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpdateModelValue = (e: any) => {
    if (safeIn("property", controlSchema) && controlSchema.property) {
      setModel({
        property: controlSchema.property,
        value: e,
        context: toValue(internalContext),
        scope: bladeContext.scope,
      });

      if (
        safeIn("update", controlSchema) &&
        controlSchema.update &&
        safeIn("method", controlSchema.update) &&
        bladeContext.scope
      ) {
        const updateMethod = controlSchema.update.method;
        if (safeIn(updateMethod, bladeContext.scope) && typeof bladeContext.scope[updateMethod] === "function") {
          bladeContext.scope[updateMethod](e, controlSchema.property, toValue(internalContext));
        }
      }
    }
  };

  const baseProps: IControlBaseProps = reactive({
    key: `${parentId}`,
    label,
    disabled,
    name,
    rules,
    placeholder,
    required,
    modelValue,
    "onUpdate:modelValue": onUpdateModelValue,
    tooltip,
    multilanguage,
  });

  const baseOptions: IControlBaseOptions = reactive({
    visibility: computed(() =>
      safeIn("visibility", controlSchema) && controlSchema.visibility?.method
        ? bladeContext.scope?.[controlSchema.visibility?.method]
        : true
    ),
  });

  const component = FIELD_MAP[controlSchema.component as keyof typeof FIELD_MAP];

  const fieldsHandler = computed(() => {
    if (!("fields" in controlSchema)) return null;

    const fieldsModel =
      safeIn("property", controlSchema) &&
      controlSchema.property &&
      getModel(controlSchema.property, toValue(internalContext));

    const model = toValue(fieldsModel);

    if (model && Array.isArray(model)) {
      return model.map((modelItem: { [x: string]: unknown; id: string }) =>
        controlSchema.fields.map((fieldItem) =>
          nodeBuilder({
            controlSchema: fieldItem,
            parentId: `fieldset-${fieldItem.id}-${modelItem.id}`,
            internalContext: modelItem,
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
          internalContext: reactive(unref(internalContext)),
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
    currentLocale: unref(currentLocale),
    fields: fieldsHandler,
    formData,
    fieldContext: reactive(unref(internalContext)),
  };

  return h(component, elProps);
}

export { nodeBuilder };
