<template>
  <VcBlade
    v-loading="loading"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="toolbarComputed"
    :title="title"
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
              :current-locale="scope.multilanguage?.currentLocale"
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
              v-model="bladeContext"
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
  UnwrapRef,
} from "vue";
import { DynamicDetailsSchema, FormContentSchema } from "../types";
import { reactiveComputed } from "@vueuse/core";
import * as _ from "lodash-es";
import { IBladeToolbar } from "../../../../core/types";
import { DetailsBladeContext, DetailsBaseBladeScope, IParentCallArgs, UseDetails, usePopup } from "../../../index";
import SchemaRender from "../components/SchemaRender";
import { VcSelect } from "../../../../ui/components";
import { toolbarReducer } from "../helpers/toolbarReducer";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
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

defineOptions({
  isBladeComponent: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { showConfirmation } = usePopup();

const { loading, item, validationState, scope, load, remove, saveChanges, bladeTitle } = props.composables[
  props.model?.settings?.composable
]({ emit, props }) as UseDetails<Record<string, any>, DetailsBaseBladeScope>;

const title = ref();
const isReady = ref(false);

const unwatchTitle = watch(
  () => bladeTitle.value,
  (newVal) => {
    if (newVal) {
      title.value = newVal;

      nextTick(() => unwatchTitle());
    }
  },
  { immediate: true }
);

const settings = computed(() => props.model?.settings);

const form = computed(
  (): FormContentSchema => props.model?.content.find((x) => x.component === "vc-form") as FormContentSchema
);

const widgets = computed(() => props.model.content.find((x) => x.component === "vc-widgets"));

const bladeContext = ref<DetailsBladeContext>({
  loading,
  item,
  validationState,
  scope,
  load,
  remove,
  saveChanges,
  bladeTitle,
  settings,
});

const bladeStatus = computed(() => {
  if ("status" in props.model.settings && props.model.settings.status) {
    if (!("component" in props.model.settings.status))
      throw new Error(`Component is required in status: ${props.model.settings.status}`);
    return reactive(h(resolveComponent(props.model.settings.status.component), { context: bladeContext.value }));
  }

  return null;
});

const bladeMultilanguage = reactiveComputed(() => {
  if ("multilanguage" in toValue(scope) && toValue(scope).multilanguage) {
    return {
      component: () =>
        h(VcSelect as any, {
          name: "currentLocale",
          modelValue: toValue(scope).multilanguage.currentLocale,
          options: toValue(scope).multilanguage.localesOptions,
          optionValue: "value",
          optionLabel: "label",
          disabled: "disabled" in toValue(scope) && toValue(scope).disabled,
          required: true,
          clearable: false,
          "onUpdate:modelValue": (e: string) => {
            toValue(scope).multilanguage.setLocale(e);
          },
        }),
      currentLocale: toValue(scope).multilanguage.currentLocale,
    };
  }

  return {};
});

const bladeWidgets = computed(() => {
  return widgets.value?.children?.map((x) => resolveComponent(x));
});

const bladeOptions = reactive({
  multilanguage: bladeMultilanguage.component,
  status: bladeStatus,
});

const toolbarComputed = toolbarReducer({
  defaultToolbarSchema: settings.value.toolbar,
  defaultToolbarBindings: {
    saveChanges: {
      async clickHandler() {
        await saveChanges(item.value);

        emit("parent:call", {
          method: "reload",
        });
        if (!props.param) {
          emit("close:blade");
        }
      },
      disabled: computed(() => !validationState.value.validated),
    },
    remove: {
      async clickHandler() {
        if (
          await showConfirmation(
            computed(() => t(`${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.DETAILS.ALERTS.DELETE`))
          )
        ) {
          if (props.param) {
            await remove({ id: props.param });
            emit("parent:call", {
              method: "reload",
            });
            emit("close:blade");
          }
        }
      },
      disabled: computed(() => toValue(scope)?.disabled),
    },
  },
  customToolbarConfig: toValue(scope)?.toolbarOverrides,
  context: bladeContext.value,
});

onBeforeMount(async () => {
  if (props.param) {
    await load({ id: props.param });
  }

  await nextTick(() => {
    isReady.value = true;
  });
});

async function onBeforeClose() {
  if (validationState.value.modified) {
    return await showConfirmation(
      unref(
        computed(() => t(`${settings.value?.localizationPrefix.trim().toUpperCase()}.PAGES.ALERTS.CLOSE_CONFIRMATION`))
      )
    );
  }
}

defineExpose({
  title: bladeTitle,
  onBeforeClose,
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
