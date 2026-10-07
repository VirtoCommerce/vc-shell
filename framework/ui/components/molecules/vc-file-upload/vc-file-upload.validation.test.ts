import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import "@core/plugins/validation/rules";
import VcFileUpload from "@ui/components/molecules/vc-file-upload/vc-file-upload.vue";

/**
 * The upload rules with the real vee-validate and the framework's own rules, for both ways a file can
 * arrive. `fileWeight` is the rule used here: `mindimensions` loads the image, which jsdom cannot.
 */
function file(bytes: number, name = "photo.png"): File {
  return new File([new Uint8Array(bytes)], name, { type: "image/png" });
}

/** A FileList stand-in: jsdom has neither DataTransfer nor a FileList constructor. */
function filesOf(...items: File[]): FileList {
  const list = Object.assign([...items], { item: (index: number) => items[index] ?? null });
  return list as unknown as FileList;
}

function mountWithWeightLimit() {
  // fileWeight counts 1 KB as 1000 bytes, so [1] caps a file at 1000 bytes.
  return mount(VcFileUpload, {
    props: { name: "logo", rules: { fileWeight: [1] } },
    global: { mocks: { $t: (key: string) => key } },
  });
}

async function drop(wrapper: ReturnType<typeof mountWithWeightLimit>, files: FileList) {
  const zone = wrapper.find(".vc-file-upload__drop-zone");
  const event = new Event("drop", { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, "dataTransfer", { value: { files } });
  zone.element.dispatchEvent(event);
  await flushPromises();
}

async function pick(wrapper: ReturnType<typeof mountWithWeightLimit>, files: FileList) {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
  await flushPromises();
}

describe("VcFileUpload — rules apply to dropped files as to picked ones", () => {
  it("refuses a picked file that breaks a rule", async () => {
    const wrapper = mountWithWeightLimit();
    await pick(wrapper, filesOf(file(2000)));

    expect(wrapper.emitted("upload")).toBeUndefined();
  });

  it("refuses a dropped file that breaks a rule", async () => {
    const wrapper = mountWithWeightLimit();
    await drop(wrapper, filesOf(file(2000)));

    expect(wrapper.emitted("upload")).toBeUndefined();
  });

  it("uploads a dropped file that passes the rules", async () => {
    const wrapper = mountWithWeightLimit();
    const files = filesOf(file(500));
    await drop(wrapper, files);

    expect(wrapper.emitted("upload")).toHaveLength(1);
    expect(wrapper.emitted("upload")?.[0]?.[0]).toBe(files);
  });
});
