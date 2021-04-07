<template>
  <i :class="['fas', icon]"> </i>
</template>
<script>
export default {
  name: 'VcIcon',
  props: {
    icon: {
      type: String,
      default: 'fa-ban',
    },
  },
  computed: {},
}
</script>
<style lang="scss"></style>
