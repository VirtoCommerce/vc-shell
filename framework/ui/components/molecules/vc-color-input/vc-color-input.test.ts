import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import VcColorInput from "@ui/components/molecules/vc-color-input/vc-color-input.vue";

describe("VcColorInput", () => {
  const mountColorInput = (props: Record<string, unknown> = {}) =>
    mount(VcColorInput as any, {
      props: { modelValue: null, ...props },
      global: { stubs: { VcLabel: false, VcHint: false, VcIcon: true } },
    });

  describe("v-model contract", () => {
    it("renders modelValue in the text input", () => {
      const wrapper = mountColorInput({ modelValue: "#ff0000" });
      // VcColorInput uses v-model="textValue" on the text input; textValue is initialised from modelValue
      const input = wrapper.find("input.vc-color-input__input");
      expect((input.element as HTMLInputElement).value).toBe("#ff0000");
    });

    it("emits update:modelValue on text input change", async () => {
      const wrapper = mountColorInput({ modelValue: "" });
      // Wait for the immediate watcher's nextTick to release isSyncing=false
      await nextTick();
      await nextTick();
      const input = wrapper.find("input.vc-color-input__input");
      // VcColorInput uses v-model="textValue" + @input="onTextInput" on the text input.
      // Manually set the value then trigger the input event to fire onTextInput.
      (input.element as HTMLInputElement).value = "#00ff00";
      await input.trigger("input");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
  });
});
