<template>
  <div class="p-1 border-0">
    <font-awesome-icon v-if="icon" :icon="icon" :size="size" />
    <span v-bind="$attrs"><slot></slot></span>
  </div>
</template>
<script>
export default {
  name: 'VcLink',
  props: {
    icon: {
      type: String,
      default: 'ban',
    },
    size: {
      type: String,
      default: 'lg',
      required: false,
    },
  },
  computed: {},
}
</script>
<style lang="scss"></style>
