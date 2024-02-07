<template>
  <VcCard
    :header="$t('RATING.WIDGET.TITLE')"
    icon="fas fa-star"
    :fill="true"
  >
    <template
      v-if="$isDesktop.value"
      #actions
    >
      <div class="tw-flex tw-items-center">
        <div class="vc-card__title">
          <Rating
            class="tw-mr-5"
            :variant="'star-and-text'"
          ></Rating>
        </div>
        <vc-button
          small
          outline
          @click="() => onItemClick()"
          >{{ $t("RATING.WIDGET.ALL") }}</vc-button
        >
      </div>
    </template>
    <Reviews
      :is-widget-view="true"
      @item-click="onItemClick"
      @add="addItem"
    >
      <template #widget-mobile="{ loading }">
        <div
          v-loading="loading"
          class="tw-flex tw-flex-auto tw-flex-col"
        >
          <div class="tw-h-px tw-bg-[#e3e7ec] tw-w-full"></div>
          <div
            class="tw-flex tw-flex-auto tw-justify-center tw-my-4 tw-text-[26px] tw-font-medium tw-text-[#319ed4] tw-items-center"
          >
            <Rating :variant="'text'"></Rating>
          </div>
        </div>
      </template>
    </Reviews>
  </VcCard>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";
import Rating from "./rating.vue";

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function onItemClick(args?: { param: string }) {
  await openBlade(
    {
      blade: resolveBladeByName("Reviews"),
      param: args?.param,
    },
    true,
  );
}

async function addItem() {
  await openBlade(
    {
      blade: resolveBladeByName("Reviews"),
    },
    true,
  );
  await openBlade({
    blade: resolveBladeByName("ReviewDetails"),
  });
}
</script>
