import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, defineComponent } from "vue";
import { VueWrapper, mount } from "@vue/test-utils";
import { RouterView } from "vue-router";
import VirtoShellFramework, { DetailsBladeExposed, createDynamicAppModule, useUser } from "@vc-shell/framework";
import * as components from "../components";
import * as schema from "../pages";
import * as locales from "../locales";
import * as composables from "../composables";
import * as notificationTemplates from "../components/notifications";
import { createRouterMock, injectRouterMock } from "vue-router-mock";

// Mocking necessary modules
vi.mock("@vc-shell/framework", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    useUser: () => ({
      loadUser: vi.fn().mockResolvedValue(true),
      isAuthenticated: true,
      user: {
        id: "123",
        name: "Test User",
      },
    }),
    useApiClient: vi.fn().mockReturnValue({
      getApiClient: vi.fn().mockReturnValue({
        // Mock any methods used in your code
        isOperator: vi.fn().mockReturnValue(true),
        getAvailableLanguages: vi.fn().mockReturnValue(["en-US"]),
        searchCategories: vi.fn().mockReturnValue({
          totalCount: 1,
          results: [
            {
              catalogId: "7815ff11-4d95-454e-9f18-2431f9b5094e",
              parentId: null,
              code: "all",
              name: "ALL",
              outline: "a34fccdb-fa09-40c9-bff8-423d60a6feb3",
              path: "ALL",
              isActive: true,
              outerId: "22565422683",
              links: [],
              taxType: null,
              enableDescription: null,
              descriptions: [],
              images: [],
              id: "a34fccdb-fa09-40c9-bff8-423d60a6feb3",
            },
          ],
        }),
        getVcmpSettings: vi.fn().mockReturnValue({
          defaultCurrency: "USD",
          currencies: ["USD"],
          defaultLanguage: "en-US",
          languages: ["en-US"],
          defaultProductType: "Physical",
          productTypes: ["Physical", "Digital"],
        }),
      }),
    }),
    useBladeNavigation: vi.fn().mockReturnValue({}),
  };
});

// Mock innerText
Object.defineProperty(HTMLElement.prototype, "innerText", {
  configurable: true,
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  },
});

const routes = [
  {
    path: `/`,
    component: defineComponent({
      template: `<router-view />`,
    }),
    name: "App",
    meta: {
      root: true,
    },
    children: [],
  },
  {
    name: "Login",
    path: "/login",
    component: defineComponent({
      template: `<div />`,
    }),
  },
];

describe("Products Module", () => {
  let app;
  let wrapper: VueWrapper;
  const router = createRouterMock();

  const initializeComponent = async () => {
    const { loadUser } = useUser();

    try {
      await loadUser();
    } catch (e) {
      console.log(e);
    }
    routes.forEach((route) => router.addRoute(route));
    const ProductsPlugin = createDynamicAppModule({
      schema,
      composables,
      moduleComponents: components,
      notificationTemplates,
      locales,
    });

    app = createApp(RouterView);

    app.use(VirtoShellFramework, { router, platformUrl: "/" });
    app.use(ProductsPlugin, { router });

    wrapper = mount(app._context.components.Product, {
      global: {
        plugins: [[VirtoShellFramework, { router }], [ProductsPlugin, { router }], router],
        provide: {
          currentSeller: "",
        },
        stubs: {
          teleport: true,
        },
      },
    });

    app.use(router);
    injectRouterMock(router);

    await router.isReady();
    app.mount("#app");

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    await initializeComponent();
  });

  it("should fill out the form and save the draft", async () => {
    const saveDraft = wrapper.find("div[data-test-id='saveAndPublish']");
    expect(saveDraft.exists()).toBe(true);
    expect(saveDraft.classes()).toContain("vc-blade-toolbar-button_disabled");

    const item = (wrapper.vm as unknown as DetailsBladeExposed<Record<string, unknown>>).item;

    // Fill out the name
    const nameInput = wrapper.find(".vc-input__input");
    await nameInput.setValue("123");
    expect(item.name).toBe("123");

    // Select a product type
    const productTypeSelect = wrapper.find(".vc-select[data-test-id='productType']");
    expect(productTypeSelect.exists()).toBe(true);
    const toggleProductType = productTypeSelect.find('div[data-test-id="dropdown-toggle"]');
    await toggleProductType.trigger("click");
    await wrapper.vm.$nextTick();
    const productTypeOptions = wrapper.findAll('div[data-test-id="option"]');
    await productTypeOptions[0].trigger("click");
    await wrapper.vm.$nextTick();
    expect(item.productType).toBe("Physical");

    // Select a category
    const categoryIdSelect = wrapper.find(".vc-select[data-test-id='categoryId']");
    expect(categoryIdSelect.exists()).toBe(true);
    const toggleCategory = categoryIdSelect.find('div[data-test-id="dropdown-toggle"]');
    await toggleCategory.trigger("click");
    await wrapper.vm.$nextTick();
    const categoryOptions = wrapper.findAll('div[data-test-id="option"]');
    await categoryOptions[0].trigger("click");
    await wrapper.vm.$nextTick();
    expect(item.categoryId).toBe("a34fccdb-fa09-40c9-bff8-423d60a6feb3");
    await wrapper.vm.$nextTick();

    // Expect the properties card to become visible
    expect(wrapper.find('div[data-test-id="propertiesCard"]')).not.toBeNull();

    // Expect the product gallery card to become visible
    expect(wrapper.find('div[data-test-id="productGalleryCard"]')).not.toBeNull();

    // Fill out the GTIN
    const gtin = wrapper.find('.vc-input[data-test-id="gtin"] .vc-input__input');
    expect(gtin.exists()).toBe(true);
    gtin.setValue("123456");
    expect(item.gtin).toBe("123456");

    // Fill out the description
    const description = wrapper.find('.vc-editor[data-test-id="description"]');
    expect(description.exists()).toBe(true);
    const quillEditor = description.findComponent({ ref: "quillRef" });
    quillEditor.vm.getQuill().root.innerHTML = "12";
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as unknown as DetailsBladeExposed<Record<string, unknown>>).computedDescription).toBe(
      "<p>12</p>",
    );

    // Check that the save draft button is enabled and click it
    expect(saveDraft.classes()).not.toContain("vc-blade-toolbar-button_disabled");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).validationState.valid).toBe(true);
    await wrapper.vm.$nextTick();

    // Check the final state of the item
    expect(item.name).toBe("123");
    expect(item.gtin).toBe("123456");
    expect((wrapper.vm as unknown as DetailsBladeExposed<Record<string, unknown>>).computedDescription).toBe(
      "<p>12</p>",
    );
    expect(item.productType).toBe("Physical");
    expect(item.categoryId).toBe("a34fccdb-fa09-40c9-bff8-423d60a6feb3");

    // Save the draft
    await saveDraft.trigger("click");
    await wrapper.vm.$nextTick();

    // Check that the item was saved
    expect(wrapper.find('div[data-test-id="saveAndPublish"]').classes()).toContain("vc-blade-toolbar-button_disabled");
  });
});
