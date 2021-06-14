<template>
  <i
    :class="`vc-icon vc-icon_${size} fa${
      family.toLowerCase()[0]
    } fa-${icon.toLowerCase()}`"
  />
</template>

<script>
  export default {
    props: {
      icon: {
        type: String,
        default: "square-full",
      },

      family: {
        type: String,
        default: "solid",
      },

      size: {
        type: String,
        default: "m",
      },
    },
  };
</script>
