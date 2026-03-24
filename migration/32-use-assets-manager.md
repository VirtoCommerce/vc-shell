# 32. useAssets → useAssetsManager

## What Changed

`useAssetsManager(ref, options)` replaces the low-level `useAssets()` primitives. Instead of building a handler object that wires gallery events to composable functions, you pass a reactive ref and options — the composable mutates the ref directly on upload, remove, reorder, and edit operations.

| Old (deprecated) | New |
|-------------------|-----|
| `useAssets()` | `useAssetsManager(ref, options)` |
| `ICommonAsset` | `AssetLike` |
| `IUseAssets` | `UseAssetsManagerReturn` |
| `UseAssetsReturn` | `UseAssetsManagerReturn` |

The AssetsManager blade options have also changed: instead of passing 3 separate handler functions + data array + loading ref, pass a single `manager: UseAssetsManagerReturn` instance.

## Backward Compatibility

`useAssets()` and `ICommonAsset` continue to work. `useAssets()` emits a dev-mode console warning pointing to this guide. `ICommonAsset` is now a type alias for `AssetLike` — no runtime change, only a deprecation JSDoc comment.

## Quick Reference

| Old | New |
|-----|-----|
| `const { upload, remove, edit, loading } = useAssets()` | `const assets = useAssetsManager(ref, options)` |
| `assetsHandler.upload(files, sortOrder)` | `assets.upload(files, sortOrder)` |
| `assetsHandler.remove(item)` | `assets.remove(item)` |
| `assetsHandler.edit(items)` (reorder) | `assets.reorder(items)` |
| `assetsHandler.edit(items)` (metadata) | `assets.updateItem(item)` |
| Manual `showConfirmation()` before remove | `confirmRemove: () => showConfirmation(t('...'))` in options |
| Manual array merge after upload | Automatic — composable mutates the ref |
| Manual `.map(x => ({...x}) as Image)` casts | Not needed — `AssetLike` index signature is structurally compatible |
| AssetsManager blade `options.assets`, `options.loading`, `options.assetsUploadHandler`, `options.assetsEditHandler`, `options.assetsRemoveHandler` | AssetsManager blade `options.manager` |

## Migration Examples

### 1. Gallery with confirmation (offers-details pattern)

```diff
-import { useAssets } from "@vc-shell/framework";
+import { useAssetsManager } from "@vc-shell/framework";

-const { upload, remove, edit, loading: assetsLoading } = useAssets();
-const assetsHandler = {
-  loading: assetsLoading,
-  async upload(files, startingSortOrder) {
-    const uploaded = await upload(files, `offers/${offer.value?.id}`, startingSortOrder);
-    offer.value.images = [...(offer.value?.images ?? []), ...uploaded.map(x => ({...x}) as Image)];
-  },
-  async remove(files) {
-    if (await showConfirmation(t('OFFERS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION'))) {
-      offer.value.images = remove([files], offer.value?.images ?? []).map(x => ({...x}) as Image);
-    }
-  },
-  edit(files) {
-    offer.value.images = edit(files, offer.value?.images ?? []).map(x => ({...x}) as Image);
-  },
-};
+const assets = useAssetsManager(toRef(offer.value, 'images'), {
+  uploadPath: () => `offers/${offer.value?.id}`,
+  confirmRemove: () => showConfirmation(t('OFFERS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION')),
+});
```

Template:
```diff
 <VcGallery
   :images="offer.images"
-  @upload="assetsHandler.upload"
-  @sort="assetsHandler.edit"
-  @remove="assetsHandler.remove"
+  @upload="assets.upload"
+  @sort="assets.reorder"
+  @remove="assets.remove"
   @edit="onGalleryItemEdit"
 />
```

### 2. Single image upload (team-member-details pattern)

```diff
-import { useAssets } from "@vc-shell/framework";
+import { useAssetsManager } from "@vc-shell/framework";

-const { upload, remove } = useAssets();
-
-async function uploadImage(files: FileList) {
-  const uploaded = await upload(files, `team/${member.value?.id}`);
-  member.value.photo = uploaded[0] as Image;
-}
-
-async function removeImage(image: ICommonAsset) {
-  if (await showConfirmation(t('TEAM.ALERTS.PHOTO_DELETE'))) {
-    member.value.photo = undefined;
-  }
-}
+const photo = computed({
+  get: () => member.value.photo ? [member.value.photo] : [],
+  set: (items) => { member.value.photo = items[0]; },
+});
+const assets = useAssetsManager(photo, {
+  uploadPath: () => `team/${member.value?.id}`,
+  confirmRemove: () => showConfirmation(t('TEAM.ALERTS.PHOTO_DELETE')),
+});
```

Template:
```diff
 <VcImageUpload
   :image="member.photo"
-  @upload="uploadImage"
-  @remove="removeImage"
+  @upload="assets.upload"
+  @remove="assets.remove"
 />
```

### 3. Composable (useSellerDetails pattern)

```diff
-import { useAssets } from "@vc-shell/framework";
+import { useAssetsManager } from "@vc-shell/framework";

 export function useSellerDetails() {
   const seller = ref<Seller>();

-  const { upload, remove, edit } = useAssets();
-  const assetsHandler = {
-    async upload(files: FileList, startingSortOrder?: number) {
-      const uploaded = await upload(files, `sellers/${seller.value?.id}`, startingSortOrder);
-      seller.value!.images = [...(seller.value?.images ?? []), ...uploaded.map(x => ({...x}) as Image)];
-    },
-    async remove(item: ICommonAsset) {
-      seller.value!.images = remove([item], seller.value?.images ?? []).map(x => ({...x}) as Image);
-    },
-    edit(items: ICommonAsset[]) {
-      seller.value!.images = edit(items, seller.value?.images ?? []).map(x => ({...x}) as Image);
-    },
-  };
+  const images = computed({
+    get: () => seller.value?.images ?? [],
+    set: (items) => { if (seller.value) seller.value.images = items as Image[]; },
+  });
+  const assets = useAssetsManager(images, {
+    uploadPath: () => `sellers/${seller.value?.id}`,
+  });

-  return { seller, assetsHandler };
+  return { seller, assets };
 }
```

### 4. Injectable image handlers (ProductDetailsBase pattern)

When a component accepts optional `imageHandlers` from parent via Props with fallback to defaults:

```diff
-import { useAssets, ICommonAsset } from "@vc-shell/framework";
+import { useAssetsManager, type AssetLike, type UseAssetsManagerReturn } from "@vc-shell/framework";

 export interface Props {
   config: ProductDetailsConfig;
-  imageHandlers?: {
-    edit?: (image: ICommonAsset) => void;
-    upload?: (files: FileList, startingSortOrder?: number) => Promise<void>;
-    remove?: (image: ICommonAsset) => Promise<void>;
-    sort?: (sortedImages: ICommonAsset[]) => Promise<void>;
-  };
+  /** Optional override — parent can provide its own manager instance */
+  assetsManager?: UseAssetsManagerReturn;
 }

-const { upload: assetsUpload, remove: assetsRemove, edit: assetsEdit, loading: assetsLoading } = useAssets();
-
-const defaultImageHandlers = {
-  loading: computed(() => assetsLoading.value),
-  async edit(image: ICommonAsset) {
-    const edited = assetsEdit([image], item.value.productData?.images || []);
-    if (item.value.productData) {
-      item.value.productData.images = edited.map((_image) => _image as ProductImage);
-    }
-  },
-  async upload(files: FileList, startingSortOrder?: number) {
-    const uploaded = await assetsUpload(files, `/catalog/${item.value.id}`, startingSortOrder);
-    if (item.value.productData) {
-      item.value.productData.images = [
-        ...(item.value.productData?.images || []),
-        ...(uploaded?.map((image) => image as ProductImage) || []),
-      ];
-    }
-  },
-  async remove(image: ICommonAsset) {
-    if (await showConfirmation(t('PRODUCTS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION'))) {
-      if (item.value.productData) {
-        const remaining = assetsRemove([image], item.value.productData.images || []);
-        item.value.productData.images = remaining.map((image) => image as ProductImage);
-      }
-    }
-  },
-  async sort(sortedImages: ICommonAsset[]) {
-    if (item.value.productData) {
-      item.value.productData.images = sortedImages.map((image) => image as ProductImage);
-    }
-  },
-};
-
-const _imageHandlers = computed(() => props.imageHandlers || defaultImageHandlers);
+// Default manager for product images
+const productImages = computed({
+  get: () => item.value.productData?.images ?? [],
+  set: (val) => { if (item.value.productData) item.value.productData.images = val as ProductImage[]; },
+});
+const defaultAssets = useAssetsManager(productImages, {
+  uploadPath: () => `/catalog/${item.value.id || item.value.gtin}`,
+  confirmRemove: () => showConfirmation(t('PRODUCTS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION')),
+});
+
+// Use parent override or default
+const assets = computed(() => props.assetsManager ?? defaultAssets);
```

Template:
```diff
 <VcGallery
-  :images="item.productData.images"
-  :loading="assetsLoading"
+  :images="assets.value.items.value"
+  :loading="assets.value.loading.value"
   @edit="onGalleryItemEdit"
-  @upload="_imageHandlers.value.upload"
-  @remove="_imageHandlers.value.remove"
-  @sort="_imageHandlers.value.sort"
+  @upload="assets.value.upload"
+  @remove="assets.value.remove"
+  @sort="assets.value.reorder"
 />
```

## How to Find

```bash
# Find all useAssets() usages
grep -rn "useAssets\b" src/

# Find all ICommonAsset type usages
grep -rn "ICommonAsset" src/

# Find assetsHandler-style objects (candidates for migration)
grep -rn "assetsHandler\|assetsUploadHandler\|assetsRemoveHandler\|assetsEditHandler" src/

# Run the automated codemod (renames ICommonAsset → AssetLike, reports useAssets usages)
npx vc-migrate use-assets-migration
```
