import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { formatDateRelative } from "@core/utilities/date";
import { readableSize } from "@core/utilities/assets";
import type { TableAction } from "@ui/components/organisms/vc-data-table/types";
import type { BlobEntry } from "../types";
import AssetsFolderGrid from "./assets-folder-grid.vue";

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}));

const DATE = "2026-10-01T10:00:00Z";
const folder = (name: string): BlobEntry => ({ type: "folder", name, url: `/root/${name}`, modifiedDate: DATE });
const blob = (name: string): BlobEntry => ({
  type: "blob",
  name,
  url: `/root/${name}`,
  size: 6144,
  modifiedDate: DATE,
});

const Checkbox = defineComponent({
  name: "VcCheckbox",
  props: ["modelValue", "ariaLabel"],
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("input", {
        type: "checkbox",
        checked: props.modelValue,
        "aria-label": props.ariaLabel,
        onChange: () => emit("update:modelValue", !props.modelValue),
      });
  },
});

// Renders every item, so a test can pick one without opening the floating panel.
const Dropdown = defineComponent({
  name: "VcDropdown",
  props: ["items", "modelValue"],
  emits: ["item-click", "update:modelValue"],
  setup(props, { slots, emit }) {
    return () =>
      h("div", { "data-test-id": "menu" }, [
        slots.trigger?.({ isActive: props.modelValue, toggle: () => emit("update:modelValue", !props.modelValue) }),
        ...(props.items as TableAction[]).map((item) =>
          h("div", { "data-menu-item": item.id, onClick: () => emit("item-click", item) }, slots.item?.({ item })),
        ),
      ]);
  },
});

function mountGrid(props: Partial<InstanceType<typeof AssetsFolderGrid>["$props"]> = {}) {
  return mount(AssetsFolderGrid, {
    props: {
      items: [folder("a"), blob("b.txt")],
      selection: [],
      selectable: true,
      actions: () => [],
      ...props,
    },
    global: {
      stubs: {
        VcCheckbox: Checkbox,
        VcDropdown: Dropdown,
        VcDropdownItem: { props: ["title"], template: "<span class='item-title'>{{ title }}</span>" },
        VcButton: { template: "<button v-bind='$attrs'><slot /></button>" },
        VcImage: true,
        VcIcon: true,
      },
    },
  });
}

const cards = (wrapper: ReturnType<typeof mountGrid>) => wrapper.findAll(".assets-folder-grid__card");

describe("AssetsFolderGrid", () => {
  it("renders one card per item", () => {
    expect(cards(mountGrid())).toHaveLength(2);
  });

  it("shows Folder and the date for a folder, size and date for a file", () => {
    const [folderCard, fileCard] = cards(mountGrid());
    const ago = formatDateRelative(DATE);
    expect(folderCard.find(".assets-folder-grid__meta").text()).toBe(`ASSETS_MANAGER.FOLDER.FOLDER_LABEL · ${ago}`);
    expect(fileCard.find(".assets-folder-grid__meta").text()).toBe(`${readableSize(6144)} · ${ago}`);
  });

  it("puts the full name in the title of a truncated name", () => {
    const name = cards(mountGrid())[1].find(".assets-folder-grid__name");
    expect(name.text()).toBe("b.txt");
    expect(name.attributes("title")).toBe("b.txt");
  });

  it("emits open on click and on Enter", async () => {
    const wrapper = mountGrid();
    await cards(wrapper)[0].trigger("click");
    await cards(wrapper)[1].trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("open")).toEqual([[folder("a")], [blob("b.txt")]]);
  });

  it("toggles the selection with Space only when selectable", async () => {
    const wrapper = mountGrid({ selection: [folder("a")] });
    await cards(wrapper)[1].trigger("keydown", { key: " " });
    await cards(wrapper)[0].trigger("keydown", { key: " " });
    expect(wrapper.emitted("update:selection")).toEqual([[[folder("a"), blob("b.txt")]], [[]]]);
    expect(wrapper.emitted("open")).toBeUndefined();

    const readOnly = mountGrid({ selectable: false });
    await cards(readOnly)[1].trigger("keydown", { key: " " });
    expect(readOnly.emitted("update:selection")).toBeUndefined();
  });

  it("toggles the selection from the checkbox without opening the card", async () => {
    const wrapper = mountGrid();
    const checkbox = cards(wrapper)[1].find('input[type="checkbox"]');
    expect(checkbox.attributes("aria-label")).toBe('ASSETS_MANAGER.FOLDER.GRID.SELECT:{"name":"b.txt"}');
    await checkbox.trigger("change");
    await checkbox.trigger("click");
    expect(wrapper.emitted("update:selection")).toEqual([[[blob("b.txt")]]]);
    expect(wrapper.emitted("open")).toBeUndefined();
  });

  it("has no checkbox when not selectable", () => {
    expect(mountGrid({ selectable: false }).find('input[type="checkbox"]').exists()).toBe(false);
  });

  it("lists the entry actions in the menu and runs the picked one", async () => {
    const download = vi.fn();
    const actions = (entry: BlobEntry): TableAction[] => [
      {
        id: "download",
        icon: "lucide-download",
        title: `Download ${entry.name}`,
        type: "info",
        clickHandler: download,
      },
      { id: "delete", icon: "lucide-trash-2", title: "Delete", type: "danger", clickHandler: vi.fn() },
    ];
    const wrapper = mountGrid({ actions: vi.fn(actions) });
    // Built only for the menu being opened.
    expect(wrapper.props("actions")).not.toHaveBeenCalled();
    await cards(wrapper)[1].find(".assets-folder-grid__more").trigger("click");
    expect(wrapper.props("actions")).toHaveBeenCalledWith(blob("b.txt"));
    const menu = cards(wrapper)[1].find('[data-test-id="menu"]');
    expect(cards(wrapper)[0].findAll(".item-title")).toHaveLength(0);
    expect(menu.findAll(".item-title").map((t) => t.text())).toEqual(["Download b.txt", "Delete"]);
    await menu.find('[data-menu-item="download"]').trigger("click");
    expect(download).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("open")).toBeUndefined();
  });

  it("drops hidden actions and passes disabled ones to the menu", async () => {
    const actions = (): TableAction[] => [
      { id: "shown", title: "Shown", clickHandler: vi.fn() },
      { id: "hidden", title: "Hidden", hidden: true, clickHandler: vi.fn() },
      { id: "off", title: "Off", disabled: true, clickHandler: vi.fn() },
    ];
    const wrapper = mountGrid({ actions });
    await cards(wrapper)[1].find(".assets-folder-grid__more").trigger("click");
    const dropdown = wrapper.findAllComponents(Dropdown)[1];
    expect((dropdown.props("items") as TableAction[]).map((a) => a.id)).toEqual(["shown", "off"]);
    const isDisabled = dropdown.vm.$attrs["is-item-disabled"] as (a: TableAction) => boolean;
    expect(isDisabled({ disabled: true } as TableAction)).toBe(true);
    expect(isDisabled({} as TableAction)).toBe(false);
  });

  it("names the card by the entry and describes it by the meta line", () => {
    const card = cards(mountGrid())[1];
    expect(card.attributes("aria-label")).toBe("b.txt");
    const describedBy = card.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(card.find(".assets-folder-grid__meta").attributes("id")).toBe(describedBy);
  });

  it("labels the menu button", () => {
    const more = cards(mountGrid())[0].find(".assets-folder-grid__more");
    expect(more.attributes("aria-label")).toBe("ASSETS_MANAGER.FOLDER.GRID.MORE");
  });

  it("marks selected, active and drop-target cards", () => {
    const wrapper = mountGrid({
      items: [folder("a"), blob("b.txt"), blob("c.txt")],
      selection: [blob("c.txt")],
      activeUrl: "/root/b.txt",
      dropTargetUrl: "/root/a",
    });
    const [a, b, c] = cards(wrapper);
    expect(a.classes()).toContain("assets-folder-grid__card--drop-target");
    expect(b.classes()).toContain("assets-folder-grid__card--active");
    expect(c.classes()).toContain("assets-folder-grid__card--selected");
    expect(a.classes()).not.toContain("assets-folder-grid__card--selected");
    expect(c.classes()).not.toContain("assets-folder-grid__card--active");
  });

  it("marks folder cards as drop targets and forwards their drag events", async () => {
    const wrapper = mountGrid();
    const [folderCard, fileCard] = cards(wrapper);
    expect(folderCard.attributes("data-folder-url")).toBe("/root/a");
    expect(fileCard.attributes("data-folder-url")).toBeUndefined();
    await folderCard.trigger("dragover");
    await folderCard.trigger("dragleave");
    await folderCard.trigger("drop");
    await fileCard.trigger("drop");
    expect(wrapper.emitted("folder-dragover")?.[0][0]).toEqual(folder("a"));
    expect(wrapper.emitted("folder-dragleave")?.[0][0]).toEqual(folder("a"));
    expect(wrapper.emitted("folder-drop")).toHaveLength(1);
    expect(wrapper.emitted("folder-drop")?.[0][0]).toEqual(folder("a"));
  });
});
