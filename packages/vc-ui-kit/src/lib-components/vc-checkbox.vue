<template>
  <div class="vc-checkbox">
    <label class="vc-checkbox__label">
      <input type="checkbox" class="vc-checkbox__input" />
      <span class="vc-checkbox__checkmark"></span>
    </label>
  </div>
</template>

<script>
  import { defineComponent } from "@vue/composition-api";

  export default defineComponent({
    props: {
      checked: {
        type: Boolean,
      },
    },
  });
</script>
