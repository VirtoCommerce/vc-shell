<template>
  <vc-layout-workspace
    :branding="branding"
    :toolbarItems="toolbarItems"
    :account="account"
    @navClick="$emit('navClick', $event)"
  >
    <component
      v-for="blade in blades"
      :key="blade.name"
      :is="blade.components.default"
    ></component>
  </vc-layout-workspace>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from "vue";
import { useRouter } from "@virtoshell/core";

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

    account: {
      type: Object,
      default() {
        return {
          name: "Unknown",
          role: undefined,
          avatar: undefined,
        };
      },
    },
  },

  setup() {
    const router = useRouter();
    let blades = ref<typeof router.currentRoute.value.matched>([]);
    watch(router.currentRoute, (value) => {
      blades.value = value.matched.filter((item) => item.name !== "root");
      console.dir(blades);
    });

    return {
      blades,
    };
  },
});
</script>
