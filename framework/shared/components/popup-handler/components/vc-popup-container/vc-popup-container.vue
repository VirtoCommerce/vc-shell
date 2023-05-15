<template>
  <component
    v-for="popup in popupPlugin.popups"
    :is="popup.component"
    :key="popup.id"
    v-bind="{ ...popup.props, ...popup.emits }"
    @close="() => popup.close()"
  >
    <template
      v-for="(slot, key) in popup.slots"
      :key="key"
    >
      <div v-if="typeof slot === 'string'">{{ slot }}</div>
      <component
        :is="slot"
        v-else
      ></component>
    </template>
  </component>
</template>

<script setup lang="ts">
import { getPopupPlugin } from "./../../utils";
const popupPlugin = getPopupPlugin();
</script>
