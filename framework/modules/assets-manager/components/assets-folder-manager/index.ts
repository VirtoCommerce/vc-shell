import _AssetsFolderManager from "@modules/assets-manager/components/assets-folder-manager/assets-folder-manager.vue";
import _AssetsFolderEntryDetails from "@modules/assets-manager/components/assets-folder-manager/assets-folder-entry-details.vue";

export const AssetsFolderManager = _AssetsFolderManager as typeof _AssetsFolderManager;
export const AssetsFolderEntryDetails = _AssetsFolderEntryDetails as typeof _AssetsFolderEntryDetails;
export type { BlobEntry, IAssetsFolderAction, IAssetsFolderInfoItem, AssetsFolderManagerOptions } from "./types";
