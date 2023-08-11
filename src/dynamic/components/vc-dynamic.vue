<template>
  <div>
    <render v-if="controls"></render>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { h, ref, watch } from "vue";

import { DynamicControl } from "./dynamic-control";
import { ControlType, FormFields } from "./models";

const props = defineProps<{
  form?: FormFields;
}>();

const emit = defineEmits<{
  (event: "set", data: { property: any; value: any; context: any });
  (event: "call:method", data: { method; arg }): void;
}>();

const controls = ref<FormFields | ControlType[]>();

watch(
  () => props.form,
  (newVal) => {
    controls.value = newVal;
  },
  { deep: true, immediate: true }
);

function render() {
  if (Array.isArray(controls.value)) {
    return controls.value.map((control) => dynamicControlRender(control));
  } else {
    return Object.entries(controls.value).map(([, control]) => dynamicControlRender(control));
  }
}

function dynamicControlRender(control: ControlType) {
  return h(DynamicControl, {
    control,
    onUpdate: set,
    "onCall:method": (e) => emit("call:method", e),
  });
}

function set(e: { property: any; value: any; context: any; dictionary?: any[] }) {
  if (e.property) {
    emit("set", {
      property: e.property,
      value: e.value,
      context: e.context,
    });
  }
}
</script>
