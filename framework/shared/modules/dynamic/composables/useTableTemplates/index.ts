import { ConcreteComponent, MaybeRef, ShallowRef, reactive, resolveComponent, shallowRef, toValue } from "vue";
import { ListContentSchema } from "../..";

export interface IUseTableTemplates {
  tableTemplates: {
    templateOverrideComponents: Record<string, ShallowRef<ConcreteComponent>>;
    mobileView: ConcreteComponent | undefined;
    notFound: ConcreteComponent | undefined;
    empty: ConcreteComponent | undefined;
  };
}

export const useTableTemplates = (
  tableSchema: MaybeRef<ListContentSchema | undefined> | undefined,
): IUseTableTemplates => {
  const tableTemplates = reactive({
    templateOverrideComponents: templateOverrideComponents(),
    mobileView: resolveTemplateComponent("mobileTemplate"),
    notFound: resolveTemplateComponent("notFoundTemplate"),
    empty: resolveTemplateComponent("emptyTemplate"),
  });

  function resolveTemplateComponent(name: keyof ListContentSchema): ShallowRef<ConcreteComponent> | undefined {
    if (!toValue(tableSchema)) return;
    const value = toValue(tableSchema)?.[name];
    if (value && typeof value === "object" && "component" in value) {
      const componentName = value.component;
      if (componentName) {
        const component = resolveComponent(componentName);

        if (component && typeof component !== "string") return shallowRef(component);
      }
    }
  }

  function templateOverrideComponents(): Record<string, ShallowRef<ConcreteComponent>> {
    return {
      ...toValue(tableSchema)?.columns?.reduce(
        (acc, curr) => {
          if ("customTemplate" in curr && curr.customTemplate) {
            if (!("component" in curr.customTemplate)) {
              throw new Error(
                `Component name must be provided in 'customTemplate' property, column: ${JSON.stringify(curr)}`,
              );
            } else if ("component" in curr.customTemplate && curr.customTemplate.component) {
              const component = resolveComponent(curr.customTemplate.component);

              if (typeof component !== "string") {
                acc[curr.id] = shallowRef(component);
              }
            }
          }
          return acc;
        },
        {} as Record<string, ShallowRef<ConcreteComponent>>,
      ),
    };
  }

  return {
    tableTemplates,
  };
};
