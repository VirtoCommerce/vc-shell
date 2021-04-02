<template>
  <font-awesome-icon :icon="icon" :size="size" />
</template>
<script>
export default {
  name: 'VcIcon',
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
