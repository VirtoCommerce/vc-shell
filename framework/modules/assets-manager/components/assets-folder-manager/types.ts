export interface BlobEntry {
  type: "folder" | "blob";
  name: string;
  url: string;
  relativeUrl?: string;
  size?: number;
  contentType?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface IAssetsFolderAction {
  id: string;
  title: string;
  icon?: string;
  permission?: string | string[];
  clickHandler: (folder: BlobEntry, ctx: { reload: () => Promise<void> }) => void | Promise<void>;
}

export interface IAssetsFolderInfoItem {
  label: string;
  value: string;
}

export interface AssetsFolderManagerOptions {
  rootUrl: string;
  title?: string;
  folderActions?: IAssetsFolderAction[];
  entryInfo?: (entry: BlobEntry) => IAssetsFolderInfoItem[] | Promise<IAssetsFolderInfoItem[]>;
  beforeDelete?: (entries: BlobEntry[]) => string | undefined | Promise<string | undefined>;
}
