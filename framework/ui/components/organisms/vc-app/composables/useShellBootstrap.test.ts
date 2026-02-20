import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, effectScope } from "vue";

// ── Mocks for all service providers ────────────────────────────────
const mockRegisterWidget = vi.fn();
const mockRegisterMobileButton = vi.fn();
const mockRegisterSettingsMenuItem = vi.fn();
const mockProvide = vi.fn();
const mockProvideAiAgentService = vi.fn();

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    provide: (...args: unknown[]) => mockProvide(...args),
    inject: (key: unknown) => {
      if (key === AppBarWidgetServiceKey) return { register: mockRegisterWidget };
      if (key === SettingsMenuServiceKey) return { register: mockRegisterSettingsMenuItem };
      return undefined;
    },
    onScopeDispose: actual.onScopeDispose,
  };
});

vi.mock("../../../../../core/composables/useAppBarMobileButtons", () => ({
  provideAppBarMobileButtonsService: () => ({ register: mockRegisterMobileButton }),
}));

vi.mock("../../../../../core/composables/useGlobalSearch", () => ({
  provideGlobalSearch: vi.fn(),
}));

vi.mock("../../../../../core/composables/useDashboard", () => ({
  provideDashboardService: vi.fn(),
}));

vi.mock("../../../../../core/composables/useNotifications", () => ({
  hasUnreadNotifications: ref(false),
}));

vi.mock("../../../../../shared/components", () => ({
  NotificationDropdown: { template: "<div />" },
}));

vi.mock("../../../../../shared/components/language-selector", () => ({
  LanguageSelector: { template: "<div />" },
}));

vi.mock("../../../../../shared/components/theme-selector", () => ({
  ThemeSelector: { template: "<div />" },
}));

vi.mock("../../../../../shared/components/change-password-button", () => ({
  ChangePasswordButton: { template: "<div />" },
}));

vi.mock("../../../../../shared/components/logout-button", () => ({
  LogoutButton: { template: "<div />" },
}));

vi.mock("../../../../../core/plugins/ai-agent", () => ({
  provideAiAgentService: (...args: unknown[]) => mockProvideAiAgentService(...args),
}));

// ── Import after mocks ─────────────────────────────────────────────
import { useShellBootstrap, type ShellBootstrapOptions } from "@ui/components/organisms/vc-app/composables/useShellBootstrap";
import {
  AppBarWidgetServiceKey,
  SettingsMenuServiceKey,
  EmbeddedModeKey,
  DynamicModulesKey,
  ShellIndicatorsKey,
  InternalRoutesKey,
} from "@framework/injection-keys";
import { hasUnreadNotifications } from "@core/composables/useNotifications";

// ── Helpers ─────────────────────────────────────────────────────────
function createOptions(overrides: Partial<ShellBootstrapOptions> = {}): ShellBootstrapOptions {
  return {
    isEmbedded: false,
    ...overrides,
  };
}

function bootstrapInScope(options: ShellBootstrapOptions) {
  const scope = effectScope();
  scope.run(() => useShellBootstrap(options));
  return scope;
}

// ── Tests ───────────────────────────────────────────────────────────
describe("useShellBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (hasUnreadNotifications as unknown as { value: boolean }).value = false;
  });

  describe("default notifications widget", () => {
    it("registers notification-dropdown to app-bar", () => {
      bootstrapInScope(createOptions());

      expect(mockRegisterWidget).toHaveBeenCalledWith(
        expect.objectContaining({ id: "notification-dropdown", icon: "lucide-bell", order: 10 }),
      );
    });

    it("registers notification-dropdown to mobile-topbar when not embedded", () => {
      bootstrapInScope(createOptions({ isEmbedded: false }));

      expect(mockRegisterMobileButton).toHaveBeenCalledWith(
        expect.objectContaining({ id: "notification-dropdown", isVisible: true }),
      );
    });

    it("does NOT register mobile button when embedded", () => {
      bootstrapInScope(createOptions({ isEmbedded: true }));

      expect(mockRegisterMobileButton).not.toHaveBeenCalled();
    });
  });

  describe("default settings menu items", () => {
    it("registers 4 default settings items", () => {
      bootstrapInScope(createOptions());

      expect(mockRegisterSettingsMenuItem).toHaveBeenCalledTimes(4);
      const ids = mockRegisterSettingsMenuItem.mock.calls.map((c: unknown[]) => (c[0] as { id: string }).id);
      expect(ids).toEqual(["theme-selector", "language-selector", "change-password", "logout"]);
    });

    it("registers items with correct groups", () => {
      bootstrapInScope(createOptions());

      expect(mockRegisterSettingsMenuItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: "theme-selector", group: "preferences" }),
      );
      expect(mockRegisterSettingsMenuItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: "logout", group: "account", order: 100 }),
      );
    });
  });

  describe("indicator state (ShellIndicatorsKey)", () => {
    it("provides false when no unread notifications", () => {
      bootstrapInScope(createOptions());

      const provideCall = mockProvide.mock.calls.find(
        ([key]: [unknown]) => key === ShellIndicatorsKey,
      );
      expect(provideCall).toBeDefined();
      expect(provideCall![1].value).toBe(false);
    });

    it("reacts to hasUnreadNotifications changes", () => {
      bootstrapInScope(createOptions());

      const provideCall = mockProvide.mock.calls.find(
        ([key]: [unknown]) => key === ShellIndicatorsKey,
      );
      expect(provideCall![1].value).toBe(false);

      (hasUnreadNotifications as unknown as { value: boolean }).value = true;
      expect(provideCall![1].value).toBe(true);
    });
  });

  describe("ai-agent", () => {
    it("does NOT provide AI agent service when no config", () => {
      bootstrapInScope(createOptions());

      expect(mockProvideAiAgentService).not.toHaveBeenCalled();
    });

    it("provides AI agent service when aiAgentConfig has url", () => {
      bootstrapInScope(
        createOptions({
          aiAgentConfig: { url: "https://ai.example.com" } as any,
          aiAgentAddGlobalToolbarButton: false,
        }),
      );

      expect(mockProvideAiAgentService).toHaveBeenCalledWith({
        config: expect.objectContaining({ url: "https://ai.example.com" }),
        addGlobalToolbarButton: false,
      });
    });

    it("defaults addGlobalToolbarButton to true", () => {
      bootstrapInScope(
        createOptions({
          aiAgentConfig: { url: "https://ai.example.com" } as any,
        }),
      );

      expect(mockProvideAiAgentService).toHaveBeenCalledWith(
        expect.objectContaining({ addGlobalToolbarButton: true }),
      );
    });
  });

  describe("injection keys", () => {
    it("provides EmbeddedModeKey", () => {
      bootstrapInScope(createOptions({ isEmbedded: true }));

      expect(mockProvide).toHaveBeenCalledWith(EmbeddedModeKey, true);
    });

    it("provides DynamicModulesKey when dynamicModules is defined", () => {
      const modules = { testModule: {} };
      bootstrapInScope(
        createOptions({ dynamicModules: modules as unknown as typeof window.VcShellDynamicModules }),
      );

      expect(mockProvide).toHaveBeenCalledWith(DynamicModulesKey, modules);
    });

    it("does not provide DynamicModulesKey when dynamicModules is undefined", () => {
      bootstrapInScope(createOptions());

      const dynamicModulesCall = mockProvide.mock.calls.find(
        ([key]: [unknown]) => key === DynamicModulesKey,
      );
      expect(dynamicModulesCall).toBeUndefined();
    });

    it("provides internalRoutes when specified", () => {
      const routes = [{ path: "/test", component: {} }] as unknown as ShellBootstrapOptions["internalRoutes"];
      bootstrapInScope(createOptions({ internalRoutes: routes }));

      expect(mockProvide).toHaveBeenCalledWith(InternalRoutesKey, routes);
    });
  });
});
