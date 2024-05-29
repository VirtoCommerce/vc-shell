<template>
  <VcBlade
    v-if="!composables"
    v-loading="loading"
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
      <div class="tw-flex tw-flex-row tw-items-center tw-gap-3">
        <template
          v-for="(value, key, index) in bladeOptions"
          :key="`blade-actions-slot-${key}-${index}`"
        >
          <component :is="value" />
        </template>
      </div>
    </template>

    <VcContainer :no-padding="true">
      <div
        v-if="isReady && item && Object.keys(item)"
        class="item-details__inner"
      >
        <div class="item-details__content">
          <VcForm class="tw-grow tw-p-4">
            <SchemaRender
              v-model="item"
              :ui-schema="form.children"
              :context="bladeContext"
              :current-locale="toValue(unreffedScope)?.multilanguage?.currentLocale"
            ></SchemaRender>
          </VcForm>
        </div>
        <div
          v-if="bladeWidgets && bladeWidgets.length"
          class="item-details__widgets"
        >
          <div
            v-for="(item, index) in bladeWidgets"
            :key="index"
          >
            <component
              :is="item"
              :ref="(el: HTMLElement) => widgetsRefs.set({ component: item, el })"
              v-model="bladeContext"
              @click="setActiveWidget(item)"
            ></component>
          </div>
        </div>
      </div>
    </VcContainer>
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
  type Component,
  ConcreteComponent,
  toRefs,
  provide,
  toRef,
} from "vue";
import { DynamicDetailsSchema, FormContentSchema, SettingsSchema } from "../types";
import { reactiveComputed, refDefault, toReactive, useMounted, useTemplateRefsList } from "@vueuse/core";
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
import { VcSelect } from "../../../../ui/components";
import { useToolbarReducer } from "../composables/useToolbarReducer";
import { useBeforeUnload } from "../../../../core/composables/useBeforeUnload";
import * as _ from "lodash-es";
import { useNotifications } from "../../../../core/composables";
import { notification } from "../../../components";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string | any;
  model?: DynamicDetailsSchema;
  options?: {
    [x: string]: unknown;
  };
  composables?: Record<string, (...args: any[]) => Record<string, any>>;
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

const widgetsRefs = useTemplateRefsList<{ el: HTMLDivElement; component: ConcreteComponent }>();

if (typeof props.composables?.[props.model?.settings?.composable ?? ""] === "undefined") {
  throw new Error(`Composable ( ${props.model?.settings?.composable} ) is not defined`);
}
const { loading, item, validationState, scope, load, remove, saveChanges, bladeTitle } = props.composables
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

const { onBeforeClose } = useBladeNavigation();
const title = ref();
const isReady = ref(false);
const activeWidgetExposed = ref<CoreBladeExposed>();
const isBladeEditable = computed(() => !toValue("disabled" in toValue(scope || {}) && toValue(scope || {}).disabled));
const settings = computed(() => props.model?.settings);
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

const isFormModified = computed(() => validationState.value.dirty || validationState.value.modified);

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

const bladeMultilanguage = reactiveComputed(() => {
  if (
    scope &&
    toValue(unreffedScope) &&
    "multilanguage" in toValue(unreffedScope) &&
    toValue(unreffedScope).multilanguage
  ) {
    return {
      component: () => {
        return h(VcSelect as Component, {
          name: "currentLocale",
          modelValue: toValue(unreffedScope).multilanguage?.currentLocale,
          options: toValue(unreffedScope).multilanguage?.localesOptions,
          optionValue: "value",
          optionLabel: "label",
          disabled: "disabled" in toValue(unreffedScope) && toValue(unreffedScope).disabled,
          required: true,
          clearable: false,
          "onUpdate:modelValue": (e: string) => {
            toValue(unreffedScope).multilanguage?.setLocale(e);
          },
        });
      },
      currentLocale: toValue(unreffedScope).multilanguage?.currentLocale,
    };
  }

  return {};
});

const bladeWidgets = computed(() => {
  return widgets.value?.children?.map((x) => {
    if (typeof x === "string") return resolveComponent(x);
    else throw new Error(`Component is required in widget: ${x}`);
  });
});

const bladeOptions = reactive({
  multilanguage: bladeMultilanguage.component,
  status: bladeStatus,
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

              emit("parent:call", {
                method: "reload",
              });

              emit("parent:call", {
                method: "updateActiveWidgetCount",
              });

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

async function setActiveWidget(widget: string | ConcreteComponent) {
  const component = typeof widget === "string" ? resolveComponent(widget) : widget;

  await nextTick(
    () =>
      (activeWidgetExposed.value = widgetsRefs.value.find((x) =>
        _.isEqual(x.component, typeof component !== "string" ? component : resolveComponent(component)),
      )?.el),
  );
}

async function updateActiveWidgetCount() {
  if (
    activeWidgetExposed.value?.updateActiveWidgetCount &&
    typeof activeWidgetExposed.value?.updateActiveWidgetCount === "function"
  ) {
    await activeWidgetExposed.value.updateActiveWidgetCount();
  }
}

async function init() {
  if (props.param && unref(props.param)) {
    await load({ id: unref(props.param) });
  }

  await nextTick(() => {
    isReady.value = true;
  });
}

onBeforeMount(async () => {
  if (props.composables) await init();
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

defineExpose({
  title: bladeTitle ?? "",
  updateActiveWidgetCount,
  ...toRefs(toValue(unreffedScope) ?? {}),
  settings: toValue(settings),
});
</script>

<style lang="scss">
.item-details {
  &__inner {
    @apply tw-overflow-hidden tw-min-h-full tw-flex tw-grow tw-basis-0;
  }

  &__content {
    @apply tw-border-r tw-border-solid tw-border-r-[#eaedf3] tw-overflow-hidden tw-grow tw-basis-0;
  }

  &__decline-icon {
    @apply tw-text-[#ff4a4a] tw-mr-3;
  }

  .app_phone &__inner {
    @apply tw-flex-col;
  }

  .app_phone &__content {
    @apply tw-border-r-0 tw-border-b tw-border-solid tw-border-b-[#eaedf3] tw-overflow-visible;
  }

  .app_phone &__widgets {
    @apply tw-flex tw-flex-row;
  }
}
</style>
