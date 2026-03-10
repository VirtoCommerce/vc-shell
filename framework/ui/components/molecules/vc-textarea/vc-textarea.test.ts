import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcTextarea from "@ui/components/molecules/vc-textarea/vc-textarea.vue";

describe("VcTextarea", () => {
  const mountTextarea = (props: Record<string, unknown> = {}) =>
    mount(VcTextarea as any, {
      props: { modelValue: "", ...props },
      global: { stubs: { VcLabel: false, VcHint: false } },
    });

  describe("v-model contract", () => {
    it("renders modelValue in the textarea", () => {
      const wrapper = mountTextarea({ modelValue: "hello world" });
      expect((wrapper.find("textarea").element as HTMLTextAreaElement).value).toBe("hello world");
    });

    it("emits update:modelValue on user input", async () => {
      const wrapper = mountTextarea({ modelValue: "" });
      await wrapper.find("textarea").setValue("typed text");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["typed text"]);
    });
  });
});
