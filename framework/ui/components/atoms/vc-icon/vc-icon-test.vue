<template>
  <div class="icon-test">
    <h2>Icon Size Consistency Test</h2>
    <p>All icons should appear visually the same size when using the same size value</p>



    <div
      v-for="size in sizes"
      :key="size"
      class="size-row"
    >
      <div class="size-label">Size: {{ size }}</div>
      <div class="icon-row">
        <div class="icon-box">
          <VcIcon
            icon="fas fa-home"
            :size="size"
            :use-container="useContainer"
          />
          <span>Font Awesome</span>
        </div>
        <div class="icon-box">
          <VcIcon
            icon="material-home"
            :size="size"
            :use-container="useContainer"
          />
          <span>Material</span>
        </div>
        <div class="icon-box">
          <VcIcon
            icon="bi-house"
            :size="size"
            :use-container="useContainer"
          />
          <span>Bootstrap</span>
        </div>
        <div class="icon-box">
          <VcIcon
            icon="lucide-home"
            :size="size"
            :use-container="useContainer"
          />
          <span>Lucide</span>
        </div>
      </div>

      <div class="size-label">For comparison: square with size {{ sizeValues[size] }}</div>
      <div
        class="reference-container"
        :class="`reference-${size}`"
      ></div>
    </div>

    <div class="recommendation">
      <h3>Recommendations</h3>
      <p>
        To ensure uniform icon sizes, the following approaches are used:
        <ol>
          <li>Unified size system for all icon types</li>
          <li>Optical adjustments to compensate for each library's design characteristics</li>
          <li>Containers slightly larger than the icon size for better visual appearance</li>
        </ol>
      </p>
      <p>
        Current optical adjustment settings:
        <pre>
:deep(.vc-icon) {
  /* Optical adjustments for different icon libraries */
  --material-icons-scale: {{ opticalCorrections.material }}; /* Material icons need to be larger */
  --fontawesome-icons-scale: {{ opticalCorrections.fontawesome }}; /* FontAwesome icons need to be smaller */
  --bootstrap-icons-scale: {{ opticalCorrections.bootstrap }}; /* Bootstrap icons are our baseline */
  --lucide-icons-scale: {{ opticalCorrections.lucide }}; /* Lucide icons match bootstrap */
}
        </pre>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import VcIcon from "./vc-icon.vue";
import type { IconSize } from "./vc-icon.vue";

const sizes: IconSize[] = ["xs", "s", "m", "l", "xl", "xxl", "xxxl"];
const useContainer = ref(true);

// Size values for display
const sizeValues = {
  xs: "12px",
  s: "14px",
  m: "18px",
  l: "20px",
  xl: "22px",
  xxl: "30px",
  xxxl: "64px"
};

// Optical adjustments for different icon types
const opticalCorrections = ref({
  material: 1.2,
  bootstrap: 1.0,
  lucide: 1.0,
  fontawesome: 0.9
});

// Get current values from CSS on load
onMounted(() => {
  const style = getComputedStyle(document.documentElement);

  const materialCorrection = style.getPropertyValue('--material-icons-scale').trim();
  const bootstrapCorrection = style.getPropertyValue('--bootstrap-icons-scale').trim();
  const lucideCorrection = style.getPropertyValue('--lucide-icons-scale').trim();
  const fontawesomeCorrection = style.getPropertyValue('--fontawesome-icons-scale').trim();

  if (materialCorrection) opticalCorrections.value.material = parseFloat(materialCorrection);
  if (bootstrapCorrection) opticalCorrections.value.bootstrap = parseFloat(bootstrapCorrection);
  if (lucideCorrection) opticalCorrections.value.lucide = parseFloat(lucideCorrection);
  if (fontawesomeCorrection) opticalCorrections.value.fontawesome = parseFloat(fontawesomeCorrection);
});
</script>

<style lang="scss" scoped>
.icon-test {
  padding: 20px;
  font-family: sans-serif;

  h2, h3 {
    margin-bottom: 16px;
  }



  .size-row {
    margin-bottom: 40px;
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
  }

  .size-label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 20px;
  }

  .icon-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-bottom: 30px;

    .icon-box {
      display: flex;
      flex-direction: column;
      align-items: center;

      span {
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }

  .reference-container {
    border: 1px dashed #ccc;
    background-color: rgba(200, 200, 200, 0.2);

    &.reference-xs { width: 12px; height: 12px; }
    &.reference-s { width: 14px; height: 14px; }
    &.reference-m { width: 18px; height: 18px; }
    &.reference-l { width: 20px; height: 20px; }
    &.reference-xl { width: 22px; height: 22px; }
    &.reference-xxl { width: 30px; height: 30px; }
    &.reference-xxxl { width: 64px; height: 64px; }
  }

  .recommendation {
    margin-top: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ol {
      padding-left: 20px;
      margin: 10px 0;

      li {
        margin-bottom: 10px;
      }
    }

    code {
      background-color: #eee;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }

    pre {
      background-color: #f1f1f1;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      font-family: monospace;
      font-size: 13px;
    }
  }
}
</style>
