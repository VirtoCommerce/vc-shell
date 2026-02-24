<template>
  <VcDropdownPanel
    v-model:show="isOpen"
    :anchor-ref="anchorRef"
    placement="right-start"
    width="560px"
    max-width="calc(100vw - 24px)"
    :max-height="9999"
    :content-scrollable="false"
  >
    <AppHubContent
      :apps-list="appsList"
      :show-applications="showApplications"
      @switch-app="handleSwitchApp"
    >
      <template
        v-if="$slots.applications"
        #applications="applicationsScope"
      >
        <slot
          name="applications"
          v-bind="applicationsScope"
        />
      </template>
    </AppHubContent>
  </VcDropdownPanel>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import { VcDropdownPanel } from "@ui/components";
import { useAppBarWidgets } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets";
import AppHubContent from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppHubContent.vue";

interface Props {
  show: boolean;
  anchorRef?: HTMLElement | null;
  appsList: AppDescriptor[];
  showApplications?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  anchorRef: null,
  showApplications: true,
});

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "switch-app", app: AppDescriptor): void;
}>();

defineSlots<{
  applications?: (props: { appsList: AppDescriptor[]; switchApp: (app: AppDescriptor) => void }) => unknown;
}>();

const { hideAllWidgets } = useAppBarWidgets();

const isOpen = computed({
  get: () => props.show,
  set: (value: boolean) => {
    emit("update:show", value);
  },
});

watch(
  () => props.show,
  (nextValue) => {
    if (!nextValue) {
      hideAllWidgets();
    }
  },
);

function handleSwitchApp(app: AppDescriptor): void {
  emit("switch-app", app);
  emit("update:show", false);
}
</script>
