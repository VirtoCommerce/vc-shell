<template>
  <div class="vc-gallery-upload">
    <vc-icon icon="fas fa-upload" size="xxl"></vc-icon>
    <div class="">Upload label</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcGalleryUpload",
});
</script>

<style lang="less">
.vc-gallery-upload {
  position: relative;
  width: 155px;
  height: 155px;
  border: 1px dashed #c8dbea;
  border-radius: 6px;
  padding: var(--padding-s);
}
</style>
