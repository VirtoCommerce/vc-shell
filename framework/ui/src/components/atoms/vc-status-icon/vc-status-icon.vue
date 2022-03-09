<template>
  <div class="vc-status-icon">
    <template v-if="status">
      <VcIcon
        icon="fas fa-check-circle"
        class="vc-status-icon__active"
      ></VcIcon>
    </template>
    <template v-else>
      <VcIcon
        icon="fas fa-times-circle"
        class="vc-status-icon__disabled"
      ></VcIcon>
    </template>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "./../vc-icon/vc-icon.vue";

defineProps({
  status: {
    type: Boolean,
    default: false,
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
