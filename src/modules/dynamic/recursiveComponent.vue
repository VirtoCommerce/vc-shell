<template>
  <div>
    <template v-if="content.type === 'form'">
      <recursiveComponent
        v-for="(child, i) in content.children"
        :key="`form_${child.type}_${i}`"
        :content="child"
        :getter="getter"
        :options-getter="optionsGetter"
      ></recursiveComponent>
    </template>
    <template v-else-if="content.type === 'vc-select'">
      <VcSelect
        :model-value="getter(content.property)"
        :options="optionsGetter(content.endpoint)"
        :option-value="content.optionValue"
        :option-label="content.optionLabel"
        :label="content.label"
        class="tw-mb-4"
      ></VcSelect>
    </template>
    <template v-else-if="content.type === 'vc-input'">
      <VcInput
        :model-value="getter(content.property)"
        :label="content.label"
        class="tw-mb-4"
      ></VcInput>
    </template>
    <template v-else-if="content.type === 'vc-card'">
      <VcCard
        :header="content.label"
        class="tw-my-3 tw-relative"
      >
        <div class="tw-p-4">
          <recursiveComponent
            v-for="(child, i) in content.children"
            :key="`card_${child.type}_${i}`"
            :content="child"
            :getter="getter"
            :options-getter="optionsGetter"
          ></recursiveComponent>
        </div>
      </VcCard>
    </template>
    <template v-else-if="content.type === 'vc-editor'">
      <VcEditor
        :model-value="getter(content.property)"
        :label="content.label"
        class="tw-mb-4"
        assets-folder=""
      >
      </VcEditor>
    </template>
    <template v-else-if="content.type === 'vc-gallery'">
      <VcGallery :images="getter(content.property)"></VcGallery>
    </template>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  content: any;
  getter: (property: string) => any;
  optionsGetter: (endpoint: string) => any;
}

defineProps<Props>();
</script>
