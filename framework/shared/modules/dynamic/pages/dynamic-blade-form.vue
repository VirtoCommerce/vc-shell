<template>
  <VcBlade
    v-if="!composables"
    v-loading:1000="loading"
    :expanded="expanded"
    :closable="closable"
    :width="settings?.width || '50%'"
    :toolbar-items="toolbarComputed"
    :title="title"
    :modified="isBladeEditable ? isFormModified : undefined"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template
      v-if="bladeOptions"
      #actions
    >
      <template
        v-for="(value, key, index) in bladeOptions"
        :key="`blade-actions-slot-${key}-${index}`"
      >
        <component :is="value" />
      </template>
    </template>

    <div class="blade-content-wrapper">
      <div
        v-if="multilanguage.multilanguage"
        class="language-selector-container"
      >
        <template
          v-for="(value, key, index) in multilanguage"
          :key="`blade-multilanguage-slot-${key}-${index}`"
        >
          <component :is="value" />
        </template>
      </div>

      <VcContainer :no-padding="true">
        <div
          v-if="isReady && item && Object.keys(item)"
          class="item-details__inner"
        >
          <div class="item-details__content">
            <VcForm
              ref="formItem"
              class="tw-grow tw-p-4"
            >
              <SchemaRender
                v-model="item"
                :ui-schema="form.children"
                :context="bladeContext as any"
                :current-locale="toValue(unreffedScope)?.multilanguage?.currentLocale"
              ></SchemaRender>
            </VcForm>
          </div>
        </div>
      </VcContainer>
    </div>
  </VcBlade>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useI18n } from "vue-i18n";
import {
  computed,
  h,
  nextTick,
  reactive,
  ref,
  resolveComponent,
  toValue,
  unref,
  watch,
  onBeforeMount,
  ComputedRef,
  ConcreteComponent,
  toRefs,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  markRaw,
} from "vue";
import { DynamicDetailsSchema, FormContentSchema, SettingsSchema } from "../types";
import { reactiveComputed, toReactive, useMounted } from "@vueuse/core";
import {
  DetailsBladeContext,
  DetailsBaseBladeScope,
  IParentCallArgs,
  UseDetails,
  usePopup,
  useBladeNavigation,
  CoreBladeExposed,
} from "../../../index";
import SchemaRender from "../components/SchemaRender";
import { VcDropdown, VcImage } from "../../../../ui/components";
import { useToolbarReducer } from "../composables/useToolbarReducer";
import { useBeforeUnload } from "../../../../core/composables/useBeforeUnload";
import { useLanguages, useNotifications, useBlade } from "../../../../core/composables";
import { notification } from "../../../components";
import { useWidgets } from "../../../../core/composables/useWidgets";
import { BladeInstance } from "../../../../injection-keys";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string | any;
  model?: DynamicDetailsSchema;
  options?: {
    [x: string]: unknown;
  };
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
  mixinFn?: ((...args: any[]) => any)[];
}

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { showConfirmation } = usePopup();
const { getFlag } = useLanguages();

const isMixinReady = ref(false);
const blade = useBlade();

if (typeof props.composables?.[props.model?.settings?.composable ?? ""] === "undefined") {
  throw new Error(`Composable ( ${props.model?.settings?.composable} ) is not defined`);
}

const settings = computed(() => props.model?.settings);

let { loading, item, validationState, scope, load, remove, saveChanges, bladeTitle } = props.composables
  ? (props.composables?.[props.model?.settings?.composable ?? ""]({ emit, props, mounted: useMounted() }) as UseDetails<
      Record<string, any>,
      DetailsBaseBladeScope
    >)
  : ({
      loading: true,
      item: undefined,
      validationState: undefined,
      scope: undefined,
      load: undefined,
      remove: undefined,
      saveChanges: undefined,
      bladeTitle: undefined,
    } as unknown as UseDetails<Record<string, any>, DetailsBaseBladeScope>);

if (props.mixinFn?.length) {
  const mixinResults = props.mixinFn?.map((mixin) =>
    mixin({ loading, item, validationState, scope, load, remove, saveChanges, bladeTitle }),
  );

  const mergedResults = mixinResults.reduce((acc, result) => {
    return {
      ...acc,
      ...result,
    };
  }, {});

  loading = mergedResults.loading ?? loading;
  item = mergedResults.item ?? item;
  validationState = mergedResults.validationState ?? validationState;
  scope = mergedResults.scope ?? scope;
  load = mergedResults.load ?? load;

  remove = mergedResults.remove ?? remove;
  saveChanges = mergedResults.saveChanges ?? saveChanges;
  bladeTitle = mergedResults.bladeTitle ?? bladeTitle;

  isMixinReady.value = true;
} else {
  isMixinReady.value = true;
}

const widgetService = useWidgets();
const { onBeforeClose } = useBladeNavigation();
const title = ref();
const isReady = ref(false);
const activeWidgetExposed = ref<CoreBladeExposed>();
const isBladeEditable = computed(() => !toValue("disabled" in toValue(scope || {}) && toValue(scope || {}).disabled));

const unreffedScope = reactiveComputed(() => toValue(scope) ?? {});

const { moduleNotifications, markAsRead } = useNotifications(settings.value?.pushNotificationType);

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      if (message.title && props.composables) {
        notification.success(message.title, {
          onClose() {
            markAsRead(message);
          },
        });
      }
    });
  },
  { deep: true },
);

watch(
  () => unref(bladeTitle),
  (newVal) => {
    if (newVal && props.composables) {
      title.value = newVal;
    }
  },
  { immediate: true },
);

const isFormModified = computed(() => validationState.value.modified);

useBeforeUnload(isFormModified);

const form = computed(
  (): FormContentSchema => props.model?.content.find((x) => x?.component === "vc-form") as FormContentSchema,
);

const widgets = computed(() => props.model?.content.find((x) => x?.component === "vc-widgets"));

const bladeContext = ref<DetailsBladeContext>({
  loading,
  item,
  validationState,
  scope,
  load,
  remove,
  saveChanges,
  bladeTitle,
  settings: settings as ComputedRef<SettingsSchema>,
});

const bladeStatus = computed(() => {
  if (props.model && "status" in props.model.settings && props.model.settings.status) {
    if (!("component" in props.model.settings.status))
      throw new Error(`Component is required in status: ${props.model.settings.status}`);
    return reactive(h(resolveComponent(props.model.settings.status.component), { context: bladeContext.value }));
  }

  return null;
});

const localeOptions = ref();

watch(
  () => toValue(unreffedScope).multilanguage?.localesOptions,
  (newVal) => {
    localeOptions.value = newVal;
  },
  { immediate: true, deep: true },
);

watch(
  () => localeOptions.value,
  async (newVal) => {
    for (const lang of newVal) {
      lang.flag = await getFlag(lang.value);
    }
  },
  { deep: true },
);

const bladeMultilanguage = reactiveComputed(() => {
  if (
    scope &&
    toValue(unreffedScope) &&
    "multilanguage" in toValue(unreffedScope) &&
    toValue(unreffedScope).multilanguage
  ) {
    const isOpened = ref(false);
    return {
      component: () => {
        return h(
          VcDropdown,
          {
            modelValue: isOpened.value,
            items: localeOptions.value || [],
            floating: true,
            placement: "bottom-end",
            offset: {
              mainAxis: 10,
              crossAxis: -15,
            },
            variant: "secondary",
            emptyText: t("COMMON.NO_OPTIONS"),
            itemText: (item: any) => item.label,
            isItemActive: (item: any) => item.value === toValue(unreffedScope).multilanguage?.currentLocale,
            onItemClick: (item: any) => {
              isOpened.value = false;
              toValue(unreffedScope).multilanguage?.setLocale(item.value);
            },
            "onUpdate:modelValue": (state: boolean) => {
              isOpened.value = state;
            },
          },
          {
            trigger: () => {
              const currentLocale = localeOptions.value?.find(
                (locale: any) => locale.value === toValue(unreffedScope).multilanguage?.currentLocale,
              );
              return h(
                "div",
                {
                  onClick: () => {
                    if ("disabled" in toValue(unreffedScope) && toValue(unreffedScope).disabled) return;
                    isOpened.value = !isOpened.value;
                  },
                  class:
                    "tw-flex tw-items-center tw-justify-center tw-bg-[--primary-100] tw-w-8 tw-h-8 tw-rounded-full tw-mr-1 hover:tw-bg-[--primary-200]",
                },
                [h(VcImage, { src: currentLocale?.flag, class: "tw-w-6 tw-h-6", emptyIcon: "" })],
              );
            },
            item: (props: { item: any; click: () => void }) => {
              return h("div", { class: "tw-flex tw-items-center tw-gap-2 tw-p-2" }, [
                h(VcImage, { src: props.item.flag, class: "tw-w-6 tw-h-6", emptyIcon: "" }),
                h("span", { class: "tw-text-sm" }, props.item.label),
              ]);
            },
            empty: () => h("div", {}, t("COMMON.NO_OPTIONS")),
          },
        );
      },
      currentLocale: toValue(unreffedScope).multilanguage?.currentLocale,
    };
  }

  return {};
});

const bladeOptions = reactive({
  status: bladeStatus,
  backButton: computed(() => {
    if (toValue(unreffedScope)?.backButton) {
      return toValue(unreffedScope).backButton;
    }
    return undefined;
  }),
});

const multilanguage = reactive({
  multilanguage: bladeMultilanguage.component,
});

const toolbarComputed =
  (props.composables &&
    useToolbarReducer({
      defaultToolbarSchema: settings.value?.toolbar ?? [],
      defaultToolbarBindings: {
        saveChanges: {
          async clickHandler() {
            if (item.value) {
              await saveChanges(item.value);

              // WORKAROUND: Sometimes validationState is not reset after saveChanges
              validationState.value.resetValidationState();

              emit("parent:call", {
                method: "reload",
              });

              emit("parent:call", {
                method: "updateActiveWidgetCount",
              });

              widgetService.updateActiveWidget();

              if (!unref(props.param)) {
                emit("close:blade");
              }
            }
          },
          disabled: computed(() => !validationState.value.modified),
        },
        remove: {
          async clickHandler() {
            if (
              await showConfirmation(
                computed(() => t(`${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.ALERTS.DELETE`)),
              )
            ) {
              if (props.param) {
                await remove?.({ id: unref(props.param) });
              } else {
                await remove?.({ item: item.value });
              }

              emit("parent:call", {
                method: "reload",
              });
              emit("parent:call", {
                method: "updateActiveWidgetCount",
              });

              widgetService.updateActiveWidget();

              emit("close:blade");
            }
          },
          disabled: computed(() => toValue(toValue(unreffedScope)?.disabled)),
        },
      },
      customToolbarConfig: toValue(unreffedScope)?.toolbarOverrides,
      context: bladeContext.value,
    })) ??
  [];

onMounted(() => {
  if (blade?.value.id && widgets.value?.children) {
    widgets.value.children.forEach((widgetComponent) => {
      const isObjectWidget = typeof widgetComponent === "object" && "id" in widgetComponent;
      const widgetId = isObjectWidget ? widgetComponent.id : "";
      const visibilityMethod = isObjectWidget && "visibility" in widgetComponent && widgetComponent.visibility?.method;

      const component = isObjectWidget
        ? resolveComponent(widgetId)
        : typeof widgetComponent === "string"
          ? resolveComponent(widgetComponent)
          : (widgetComponent as ConcreteComponent);

      if (!component) {
        console.error(`Failed to resolve widget component: ${isObjectWidget ? widgetId : widgetComponent}`);
        return;
      }

      const finalWidgetId = isObjectWidget
        ? widgetId
        : typeof component === "object" && "__name" in component
          ? component.__name
          : `widget-${Date.now()}`;

      if (finalWidgetId) {
        widgetService.registerWidget(
          {
            id: finalWidgetId,
            component: markRaw(component as ConcreteComponent),
            props: {
              modelValue: bladeContext,
            },
            events: {
              "update:modelValue": (val: unknown) => {
                bladeContext.value = val as DetailsBladeContext;
              },
            },
            isVisible: visibilityMethod ? computed(() => bladeContext.value.scope?.[visibilityMethod]) : true,
            updateFunctionName: "updateActiveWidgetCount",
          },
          blade.value.id,
        );
      }
    });
  }
});

onBeforeUnmount(() => {
  if (blade?.value.id) {
    widgetService.clearBladeWidgets(blade.value.id);
  }
});

async function updateActiveWidgetCount() {
  if (
    activeWidgetExposed.value?.updateActiveWidgetCount &&
    typeof activeWidgetExposed.value?.updateActiveWidgetCount === "function"
  ) {
    await activeWidgetExposed.value.updateActiveWidgetCount();
  }
}

async function init() {
  await load({ id: unref(props.param) });

  await nextTick(() => {
    isReady.value = true;
  });
}

onBeforeMount(async () => {
  if (props.composables && isMixinReady.value) await init();
});

onBeforeClose(async () => {
  if (unref(isFormModified)) {
    return await showConfirmation(
      unref(
        computed(() => t(`${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.ALERTS.CLOSE_CONFIRMATION`)),
      ),
    );
  }
});

provide("bladeContext", toReactive(bladeContext));
provide("isBladeEditable", isBladeEditable);

const bladeWidgets = computed(() => {
  return widgets.value?.children?.map((x) => {
    if (typeof x === "string") return resolveComponent(x);
    else throw new Error(`Component is required in widget: ${x}`);
  });
});

defineExpose({
  title: bladeTitle ?? "",
  updateActiveWidgetCount,
  ...toRefs(toValue(unreffedScope) ?? {}),
  settings: toValue(settings),
  item,
  validationState,
});
</script>

<style lang="scss">
:root {
  --dynamic-form-decline-color: var(--danger-500);
  --dynamic-form-mobile-border: var(--primary-100);
}
.item-details {
  &__inner {
    @apply tw-overflow-hidden tw-min-h-full tw-flex tw-grow tw-basis-0;
  }

  &__content {
    @apply tw-overflow-hidden tw-grow tw-basis-0;
  }

  &__decline-icon {
    @apply tw-text-[color:var(--dynamic-form-decline-color)] tw-mr-3;
  }

  .vc-app_mobile &__inner {
    @apply tw-flex-col;
  }

  .vc-app_mobile &__content {
    @apply tw-border-r-0 tw-border-b tw-border-solid tw-border-b-[--dynamic-form-mobile-border] tw-overflow-visible;
  }
}

.blade-content-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.language-selector-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.blade-scrollable-content {
  height: 100%;
  overflow-y: auto;
}
</style>
