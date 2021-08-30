<template>
  <vc-layout-workspace
    :branding="branding"
    :toolbarItems="toolbarItems"
    :account="account"
    @navClick="$emit('navClick', $event)"
  >
    <h1 v-if="loading">Loading...</h1>
    <component
      v-for="blade in blades"
      :key="blade.name"
      :is="blade.components.default"
    ></component>
  </vc-layout-workspace>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from "vue";
import { useRouter, useUser } from "@virtoshell/core";

export default defineComponent({
  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },

    toolbarItems: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  setup() {
    const router = useRouter();
    const { loading } = useUser();

    let blades = ref([]);
    watch(router.currentRoute, (value) => {
      blades.value = value.matched.filter((item) => item.name !== "root");
    });

    return {
      blades,
      loading,
    };
  },
});
</script>
