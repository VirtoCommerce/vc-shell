import { unref, computed, toValue, h, UnwrapNestedRefs, MaybeRef, reactive, VNode } from "vue";
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

type AllKeys<T> = T extends unknown ? keyof T : never;
type FilterByKnownKey<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T : never) : never;

function safeIn<K extends AllKeys<T>, T extends object>(key: K, obj: T): obj is FilterByKnownKey<T, K> {
  return key in obj ?? undefined;
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
}): VNode | false {
  if (!controlSchema) return false;

  const name = controlSchema.id;
  const rules = (safeIn("rules", controlSchema) && controlSchema.rules) || undefined;
  const placeholder = (safeIn("placeholder", controlSchema) && controlSchema.placeholder) || undefined;
  const required = safeIn("rules", controlSchema) && controlSchema.rules?.required;
  const modelValue =
    (safeIn("property", controlSchema) && getModel(controlSchema.property, toValue(internalContext))) || undefined;
  const tooltip = (safeIn("tooltip", controlSchema) && controlSchema.tooltip) || undefined;
  const multilanguage = safeIn("multilanguage", controlSchema) && controlSchema.multilanguage;

  const label = safeIn("label", controlSchema)
    ? unref(unwrapInterpolation(controlSchema.label, toValue(internalContext)))
    : undefined;

  const disabled =
    (safeIn("disabled", bladeContext.scope) && bladeContext.scope.disabled) ||
    disabledHandler("disabled" in controlSchema && controlSchema.disabled, bladeContext);

  const onUpdateModelValue = (e: unknown) => {
    if (safeIn("property", controlSchema)) {
      setModel({ property: controlSchema.property, value: e, context: toValue(internalContext) });

      if (_.has(controlSchema, "update.method")) {
        const updateMethod = safeIn("update", controlSchema) && controlSchema.update.method;
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
        ? bladeContext.scope[controlSchema.visibility?.method]
        : true
    ),
  });

  const component = FIELD_MAP[controlSchema.component as keyof typeof FIELD_MAP];

  const fieldsHandler = computed(() => {
    if (!("fields" in controlSchema)) return null;

    const fieldsModel = safeIn("property", controlSchema) && getModel(controlSchema.property, toValue(internalContext));

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
