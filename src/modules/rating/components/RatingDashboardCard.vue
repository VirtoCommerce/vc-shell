<template>
  <VcCol
    v-if="$hasAccess(UserPermissions.ManageSellerReviews)"
    class="tw-p-2 !tw-basis-2/4"
  >
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
            @click="() => onItemClick()"
          >
            <div class="tw-h-px tw-bg-[#e3e7ec] tw-w-full"></div>
            <div class="tw-text-center tw-m-4 tw-text-[26px] tw-font-medium tw-text-[#319ed4]">
              <Rating :variant="'text'">
                {{ $t("RATING.WIDGET.EMPTY") }}
              </Rating>
            </div>
          </div>
        </template>
      </Reviews>
    </VcCard>
  </VcCol>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";
import Rating from "./Rating.vue";
import { UserPermissions } from "../../types";

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function onItemClick(args?: { param: string }) {
  await openBlade(
    {
      blade: resolveBladeByName("Reviews"),
      param: args?.param,
    },
    true,
  );

  if (args?.param) {
    await openBlade({
      blade: resolveBladeByName("ReviewDetails"),
      param: args?.param,
    });
  }
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
