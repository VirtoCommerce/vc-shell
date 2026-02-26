import { describe, it, expect, vi, beforeAll } from "vitest";
import { ref } from "vue";
import { useGalleryUpload } from "./useGalleryUpload";
import type { ICommonAsset } from "@core/types";

// jsdom does not provide DataTransfer — supply a minimal polyfill
beforeAll(() => {
  if (typeof globalThis.DataTransfer === "undefined") {
    class DataTransferPolyfill {
      private _files: File[] = [];
      readonly items = {
        add: (file: File) => {
          this._files.push(file);
        },
      };
      get files(): FileList {
        // Build a FileList-like object backed by the internal array
        const list = Object.create(FileList.prototype);
        this._files.forEach((f, i) => {
          list[i] = f;
        });
        Object.defineProperty(list, "length", { value: this._files.length });
        list.item = (index: number) => this._files[index] ?? null;
        list[Symbol.iterator] = function* () {
          for (let i = 0; i < list.length; i++) yield list[i];
        };
        return list as FileList;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DataTransfer = DataTransferPolyfill;
  }
});

function createFileList(...names: string[]): FileList {
  const dt = new DataTransfer();
  names.forEach((name) => dt.items.add(new File(["x"], name, { type: "image/png" })));
  return dt.files;
}

describe("useGalleryUpload", () => {
  it("deduplicates filenames against existing images", () => {
    const images = ref<ICommonAsset[]>([{ name: "photo.png", sortOrder: 0 }]);
    const onEmit = vi.fn();
    const { onUpload } = useGalleryUpload(images, { onUpload: onEmit });

    onUpload(createFileList("photo.png"));

    expect(onEmit).toHaveBeenCalledOnce();
    const [files, startingSortOrder] = onEmit.mock.calls[0];
    expect(files[0].name).toBe("photo_1.png");
    expect(startingSortOrder).toBe(0);
  });

  it("passes through files without name collision", () => {
    const images = ref<ICommonAsset[]>([]);
    const onEmit = vi.fn();
    const { onUpload } = useGalleryUpload(images, { onUpload: onEmit });

    onUpload(createFileList("new.jpg"));

    const [files] = onEmit.mock.calls[0];
    expect(files[0].name).toBe("new.jpg");
  });

  it("does nothing for empty FileList", () => {
    const images = ref<ICommonAsset[]>([]);
    const onEmit = vi.fn();
    const { onUpload } = useGalleryUpload(images, { onUpload: onEmit });

    onUpload(createFileList());

    expect(onEmit).not.toHaveBeenCalled();
  });

  it("handles multiple collisions with incrementing suffix", () => {
    const images = ref<ICommonAsset[]>([
      { name: "img.png", sortOrder: 0 },
      { name: "img_1.png", sortOrder: 1 },
    ]);
    const onEmit = vi.fn();
    const { onUpload } = useGalleryUpload(images, { onUpload: onEmit });

    onUpload(createFileList("img.png"));

    const [files] = onEmit.mock.calls[0];
    expect(files[0].name).toBe("img_2.png");
  });
});
