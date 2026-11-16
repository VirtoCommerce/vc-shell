import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import OverwritePopup from "./overwrite-popup.vue";

function mountPopup() {
  return mount(OverwritePopup, {
    props: { name: "a.png" },
    global: {
      stubs: {
        VcPopup: {
          name: "VcPopup",
          emits: ["close"],
          template: "<div><slot name='content' /><slot name='footer' /></div>",
        },
        VcInput: {
          name: "VcInput",
          props: ["modelValue", "error"],
          emits: ["update:modelValue"],
          template:
            "<input :value='modelValue' :data-error='error' @input='$emit(\"update:modelValue\", $event.target.value)' />",
        },
        VcButton: { template: "<button v-bind='$attrs'><slot /></button>" },
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("OverwritePopup", () => {
  it("keeps the popup open on Rename with an empty name", async () => {
    const wrapper = mountPopup();
    await wrapper.find("input").setValue("   ");
    await wrapper.find('[data-test-id="overwrite-popup-rename"]').trigger("click");
    expect(wrapper.emitted("confirm")).toBeUndefined();
    expect(wrapper.emitted("cancel")).toBeUndefined();
    expect(wrapper.find("input").attributes("data-error")).toBe("true");
  });

  it("rejects a rename that contains a path separator", async () => {
    const wrapper = mountPopup();
    for (const name of ["x/b.png", "x\\b.png"]) {
      await wrapper.find("input").setValue(name);
      await wrapper.find('[data-test-id="overwrite-popup-rename"]').trigger("click");
      expect(wrapper.find("input").attributes("data-error")).toBe("true");
    }
    expect(wrapper.emitted("confirm")).toBeUndefined();
  });

  it("emits a rename decision with the typed name", async () => {
    const wrapper = mountPopup();
    await wrapper.find("input").setValue(" b.png ");
    await wrapper.find('[data-test-id="overwrite-popup-rename"]').trigger("click");
    expect(wrapper.emitted("confirm")).toEqual([[{ action: "rename", name: "b.png" }]]);
  });

  it("emits overwrite and skip decisions", async () => {
    const wrapper = mountPopup();
    await wrapper.find('[data-test-id="overwrite-popup-overwrite"]').trigger("click");
    await wrapper.find('[data-test-id="overwrite-popup-skip"]').trigger("click");
    expect(wrapper.emitted("confirm")).toEqual([[{ action: "overwrite" }], [{ action: "skip" }]]);
  });

  it("emits cancel when the popup is dismissed", async () => {
    const wrapper = mountPopup();
    wrapper.findComponent({ name: "VcPopup" }).vm.$emit("close");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
  });
});
