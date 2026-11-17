import type { ComputedRef } from "vue";
import type { AssetLike } from "@core/composables/useAssetsManager";

export interface IAssetInfoItem {
  label: string;
  value: string;
}

/** A row of the File section; `key` names its data-test-id. */
export interface IAssetInfoRow extends IAssetInfoItem {
  key?: string;
}

export interface AssetsDetailsOptions {
  /** Flat mode: the asset to edit. The blade works on a copy. */
  asset?: AssetLike;
  disabled?: boolean;
  hiddenFields?: string[];
  assetEditHandler?: (asset: AssetLike) => void;
  /** Resolving `false` keeps the blade open. */
  assetRemoveHandler?: (asset: AssetLike) => Promise<void | boolean>;
  /** Storage mode: the live entry. Wins over `asset`. */
  assetSource?: ComputedRef<AssetLike | undefined>;
  extraInfo?: (asset: AssetLike) => IAssetInfoItem[] | Promise<IAssetInfoItem[]>;
}
