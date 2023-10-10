<template>
  <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
    <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
      <div class="tw-truncate">
        {{ context.opt.path }}
      </div>
      <VcHint class="tw-truncate tw-mt-1">
        {{ $t("PRODUCTS.PAGES.DETAILS.FIELDS.CODE") }}:
        {{ context.opt.code }}
      </VcHint>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  context: {
    opt: { path: string; code: string };
  };
}>();
</script>
