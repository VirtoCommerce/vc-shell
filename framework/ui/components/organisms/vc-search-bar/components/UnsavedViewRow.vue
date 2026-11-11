<template>
  <div
    v-if="views.modified.value"
    ref="root"
    class="vc-search-bar__unsaved"
    :class="{ 'vc-search-bar__unsaved--touch': touch }"
  >
    <ViewNameField
      v-if="naming"
      cancelable
      :label="$t(`${K}NAME_PLACEHOLDER`)"
      @save="saveAs"
      @cancel="cancel"
    />
    <template v-else>
      <VcIcon
        icon="lucide-bookmark"
        size="s"
        class="vc-search-bar__unsaved-icon"
      />
      <span class="vc-search-bar__unsaved-label">{{ $t(`${K}UNSAVED`) }}</span>
      <button
        type="button"
        class="vc-search-bar__unsaved-revert"
        :aria-label="$t(`${K}REVERT`, { name: views.current.value.name })"
        :title="$t(`${K}REVERT`, { name: views.current.value.name })"
        @click="views.revert()"
      >
        <VcIcon
          icon="lucide-rotate-ccw"
          :custom-size="touch ? 16 : 14"
        />
        <span v-if="touch">{{ $t(`${K}REVERT_SHORT`) }}</span>
      </button>
      <button
        v-if="views.current.value.scope !== 'system'"
        type="button"
        class="vc-search-bar__view-text-btn"
        @click="views.saveChanges()"
      >
        {{ $t(`${K}SAVE`) }}
      </button>
      <VcButton
        class="vc-search-bar__unsaved-save-as"
        variant="outline"
        size="sm"
        @click="naming = true"
      >
        {{ $t(`${K}SAVE_AS_VIEW`) }}
      </VcButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { VcButton, VcIcon } from "@ui/components/atoms";
import ViewNameField from "./ViewNameField.vue";
import type { ViewsApi } from "../composables/useViews";

defineOptions({ name: "UnsavedViewRow" });

const props = defineProps<{
  views: ViewsApi;
  /** Phone sheet: bigger hit targets */
  touch?: boolean;
}>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.";

const root = ref<HTMLElement>();
const naming = ref(false);

// The row goes away once the filters match a view again; naming starts over next time
watch(props.views.modified, (m) => {
  if (!m) naming.value = false;
});

function saveAs(name: string) {
  props.views.saveAs(name);
  naming.value = false;
}

function cancel() {
  naming.value = false;
  void nextTick(() => root.value?.querySelector<HTMLElement>(".vc-search-bar__unsaved-save-as")?.focus());
}
</script>

<style lang="scss">
.vc-search-bar {
  &__unsaved {
    @apply tw-flex tw-items-center tw-gap-1.5;
    min-height: 36px;
    font-size: 12.5px;
  }
  &__unsaved-icon {
    color: var(--neutrals-400);
  }
  &__unsaved-label {
    @apply tw-flex-1 tw-truncate;
    color: var(--neutrals-600);
  }
  &__unsaved-revert {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-gap-1 tw-rounded tw-shrink-0;
    min-width: 28px;
    width: auto;
    height: 28px;
    color: var(--neutrals-600);
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__unsaved--touch {
    min-height: 48px;
    .vc-search-bar__unsaved-revert {
      min-width: 40px;
      padding-inline: 8px;
      height: 40px;
      font-size: 13px;
    }
    .vc-search-bar__view-text-btn,
    .vc-search-bar__unsaved-save-as,
    .vc-button {
      min-height: 40px;
    }
  }
}
</style>
