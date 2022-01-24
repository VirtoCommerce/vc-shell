<template>
  <div class="vc-status-icon">
    <template v-if="status">
      <vc-icon
        icon="fas fa-check-circle"
        class="vc-status-icon__active"
      ></vc-icon>
    </template>
    <template v-else>
      <vc-icon
        icon="fas fa-times-circle"
        class="vc-status-icon__disabled"
      ></vc-icon>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "./../vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcStatusIcon",
  components: {
    VcIcon,
  },
  props: {
    status: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="less" scoped>
.vc-status-icon {
  &__active {
    color: #87b563;
  }

  &__disabled {
    color: #bdd1df;
  }
}
</style>
