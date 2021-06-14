<template>
  <div class="vc-checkbox">
    <label class="vc-checkbox__label">
      <input type="checkbox" class="vc-checkbox__input" />
      <span class="vc-checkbox__checkmark"></span>
    </label>
  </div>
</template>

<script>
  export default {
    props: {
      checked: {
        type: Boolean,
      },
    },
  };
</script>
