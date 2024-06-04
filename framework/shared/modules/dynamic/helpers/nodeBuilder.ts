/* eslint-disable @typescript-eslint/no-explicit-any */
import { unref, computed, toValue, h, UnwrapNestedRefs, MaybeRef, reactive, VNode, ToRefs } from "vue";
import FIELD_MAP from "../components/FIELD_MAP";
import { ControlSchema } from "../types";
import { IControlBaseProps } from "../types/models";
import { getModel } from "./getters";
import { setModel } from "./setters";
import { unwrapInterpolation } from "./unwrapInterpolation";
import { DetailsBladeContext } from "../factories";
import { safeIn } from "./safeIn";
import { i18n } from "./../../../../core/plugins/i18n";
import { visibilityHandler } from "./visibilityHandler";
import { toRefs } from "@vueuse/core";
import { unrefNested } from "./unrefNested";

function disabledHandler(
  disabled: { method?: string } | boolean,
  context: UnwrapNestedRefs<DetailsBladeContext>,
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
  FormData,
>({
  controlSchema,
  parentId,
  internalContext,
  bladeContext,
  currentLocale,
  formData,
  updateFormData,
}: {
  controlSchema: ControlSchema;
  parentId: string | number;
  internalContext: ToRefs<Context>;
  bladeContext: BContext;
  currentLocale: MaybeRef<string>;
  formData: ToRefs<FormData>;
  updateFormData?: (newVal: ToRefs<unknown>) => void;
}): VNode {
  if (!controlSchema) throw new Error("There is no controlSchema provided");

  const { t } = i18n.global;

  const name = controlSchema.id;
  const rules = (safeIn("rules", controlSchema) && controlSchema.rules) || undefined;
  const placeholder = (safeIn("placeholder", controlSchema) && controlSchema.placeholder) || undefined;
  const required = safeIn("rules", controlSchema) && controlSchema.rules?.required;

  const contextProperty =
    safeIn("property", controlSchema) && controlSchema.property && getModel(controlSchema.property, internalContext);

  const scopedProperty =
    safeIn("property", controlSchema) &&
    controlSchema.property &&
    bladeContext.scope &&
    getModel(controlSchema.property, bladeContext.scope);

  const modelValue = scopedProperty ?? contextProperty ?? undefined;

  const tooltip = (safeIn("tooltip", controlSchema) && controlSchema.tooltip) || undefined;
  const multilanguage = safeIn("multilanguage", controlSchema) && controlSchema.multilanguage;

  const label =
    safeIn("label", controlSchema) && controlSchema.label
      ? unref(unwrapInterpolation(controlSchema.label, internalContext))
      : undefined;

  const hint =
    safeIn("hint", controlSchema) && controlSchema.hint
      ? (bladeContext.scope && unref(unwrapInterpolation(controlSchema.hint, bladeContext.scope))) ??
        unref(unwrapInterpolation(controlSchema.hint, internalContext)) ??
        undefined
      : undefined;

  const disabled =
    (bladeContext.scope && safeIn("disabled", bladeContext.scope) && bladeContext.scope.disabled) ||
    (safeIn("disabled", controlSchema) &&
      controlSchema.disabled &&
      disabledHandler(controlSchema.disabled, bladeContext));

  // TODO add to docs
  const onBlur = (event: Event) => {
    if (safeIn("onBlur", controlSchema) && controlSchema.onBlur) {
      const method = controlSchema.onBlur.method;
      if (method && bladeContext.scope?.[method] && typeof bladeContext.scope[method] === "function") {
        bladeContext.scope[method]({
          event,
          property: controlSchema.property,
          context: unrefNested(internalContext),
        });
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpdateModelValue = async (e: any) => {
    if (safeIn("property", controlSchema) && controlSchema.property) {
      setModel({
        property: controlSchema.property,
        value: e,
        context: internalContext,
        scope: bladeContext.scope,
      });

      updateFormData?.(formData);

      if (
        safeIn("update", controlSchema) &&
        controlSchema.update &&
        safeIn("method", controlSchema.update) &&
        bladeContext.scope
      ) {
        const updateMethod = controlSchema.update.method;
        if (safeIn(updateMethod, bladeContext.scope) && typeof bladeContext.scope[updateMethod] === "function") {
          await bladeContext.scope[updateMethod](e, controlSchema.property, unrefNested(internalContext));
        }
      }
    }
  };

  const baseProps: IControlBaseProps = reactive({
    key: `${parentId}`,
    label: computed(() => (typeof label !== "undefined" ? t(label) : undefined)),
    hint: computed(() => (typeof hint !== "undefined" ? t(hint) : undefined)),
    disabled,
    onBlur,
    name,
    rules,
    placeholder: computed(() => (typeof placeholder !== "undefined" ? t(placeholder) : undefined)),
    required,
    modelValue,
    "onUpdate:modelValue": onUpdateModelValue,
    tooltip: computed(() => (typeof tooltip !== "undefined" ? t(tooltip) : undefined)),
    multilanguage,
    classNames:
      "horizontalSeparator" in controlSchema && controlSchema.horizontalSeparator
        ? "tw-border-b tw-border-solid tw-border-b-[#e5e5e5] tw-mb-[5px] tw-pb-[21px]"
        : "",
  });

  const component = FIELD_MAP[controlSchema.component as keyof typeof FIELD_MAP];

  const fieldsHandler = computed(() => {
    if (!("fields" in controlSchema)) return null;

    const contextFieldModel =
      safeIn("property", controlSchema) && controlSchema.property && getModel(controlSchema.property, internalContext);

    const scopedFieldModel =
      safeIn("property", controlSchema) &&
      controlSchema.property &&
      getModel(controlSchema.property, toValue(bladeContext.scope ?? {}));

    const model = scopedFieldModel || contextFieldModel;

    if (toValue(model) && Array.isArray(toValue(model))) {
      return toValue(model).map((modelItem: ToRefs<{ [x: string]: unknown; id: string }>) => {
        return controlSchema.fields.reduce((arr, fieldItem) => {
          if (
            safeIn("visibility", fieldItem) &&
            fieldItem.visibility?.method &&
            !visibilityHandler(bladeContext.scope?.[fieldItem.visibility?.method], modelItem, fieldItem)
          ) {
            return arr;
          }
          return [
            ...arr,
            nodeBuilder({
              controlSchema: fieldItem,
              parentId: `fieldset-${fieldItem.id}-${modelItem.id}`,
              internalContext: modelItem,
              bladeContext,
              currentLocale,
              formData,
              updateFormData,
            }),
          ];
        }, [] as VNode[]);
      });
    }

    return [
      controlSchema.fields.reduce((arr, field) => {
        if (
          safeIn("visibility", field) &&
          field.visibility?.method &&
          !visibilityHandler(bladeContext.scope?.[field.visibility?.method], internalContext, field)
        ) {
          return arr;
        }

        return [
          ...arr,
          nodeBuilder({
            controlSchema: field,
            parentId: `fieldset-${parentId}-${field.id}`,
            internalContext,
            bladeContext,
            currentLocale,
            formData,
            updateFormData,
          }),
        ];
      }, [] as VNode[]),
    ];
  });

  const elProps = {
    baseProps: toRefs(baseProps),
    bladeContext,
    element: controlSchema,
    currentLocale: unref(currentLocale),
    fields: fieldsHandler,
    formData,
    fieldContext: internalContext,
  };

  return h(component, elProps);
}

export { nodeBuilder };
