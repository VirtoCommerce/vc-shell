import { computed, ref, watch, type Ref } from "vue";
import type { AssetLike } from "@core/composables/useAssetsManager";
import type { AssetsDetailsOptions, IAssetInfoItem } from "@modules/assets/components/assets-details/types";

export type AssetExtraInfoState = "ready" | "loading" | "failed";

/** Loads the app rows for the shown file; the latest request wins. */
export function useAssetExtraInfo(asset: Ref<AssetLike | undefined>, hook: () => AssetsDetailsOptions["extraInfo"]) {
  const state = ref<AssetExtraInfoState>("ready");
  const items = ref<IAssetInfoItem[]>([]);
  let request = 0;

  // An overwrite keeps the url but changes the date, so both identify the file's content.
  const version = computed(() => (asset.value ? `${asset.value.url ?? ""}|${asset.value.modifiedDate ?? ""}` : ""));

  watch(
    version,
    async () => {
      const current = asset.value;
      const load = hook();
      const id = ++request;
      items.value = [];
      if (!current || typeof load !== "function") {
        state.value = "ready";
        return;
      }
      state.value = "loading";
      try {
        // Inside the try, a synchronous throw lands in `failed` too.
        const result = await load(current);
        if (id === request) {
          items.value = result ?? [];
          state.value = "ready";
        }
      } catch {
        if (id === request) state.value = "failed";
      }
    },
    { immediate: true },
  );

  return { state, items };
}
