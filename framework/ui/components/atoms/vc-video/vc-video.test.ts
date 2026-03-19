import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcVideo from "@ui/components/atoms/vc-video/vc-video.vue";

describe("VcVideo", () => {
  const mountComponent = (props = {}) =>
    mount(VcVideo as any, {
      props,
      global: { stubs: { VcIcon: true, VcLabel: true } },
    });

  it("renders with vc-video class", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-video");
  });

  it("renders placeholder when no source is provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-video__placeholder").exists()).toBe(true);
    expect(wrapper.find("iframe").exists()).toBe(false);
  });

  it("placeholder has accessible attributes", () => {
    const wrapper = mountComponent();
    const placeholder = wrapper.find(".vc-video__placeholder");
    expect(placeholder.attributes("role")).toBe("img");
    expect(placeholder.attributes("aria-label")).toBe("No video source");
  });

  it("renders iframe when source is provided", () => {
    const wrapper = mountComponent({ source: "https://youtube.com/embed/abc" });
    expect(wrapper.find("iframe").exists()).toBe(true);
    expect(wrapper.find(".vc-video__placeholder").exists()).toBe(false);
  });

  it("sets iframe src from source prop", () => {
    const url = "https://youtube.com/embed/abc";
    const wrapper = mountComponent({ source: url });
    expect(wrapper.find("iframe").attributes("src")).toBe(url);
  });

  it("sets iframe title from label prop", () => {
    const wrapper = mountComponent({ source: "https://example.com", label: "Demo Video" });
    expect(wrapper.find("iframe").attributes("title")).toBe("Demo Video");
  });

  it("sets iframe title to 'Video' when no label", () => {
    const wrapper = mountComponent({ source: "https://example.com" });
    expect(wrapper.find("iframe").attributes("title")).toBe("Video");
  });

  it("iframe has security attributes", () => {
    const wrapper = mountComponent({ source: "https://example.com" });
    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("sandbox")).toContain("allow-scripts");
    expect(iframe.attributes("loading")).toBe("lazy");
  });

  it("renders label when label prop is provided", () => {
    const wrapper = mountComponent({ label: "My Video" });
    expect(wrapper.find(".vc-video__label").exists()).toBe(true);
  });

  it("does not render label when label prop is not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-video__label").exists()).toBe(false);
  });

  it("renders container wrapper", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-video__container").exists()).toBe(true);
  });
});
