import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ref, computed, nextTick, provide } from "vue";

// ---- Mocks ----

const mockOnBeforeClose = vi.fn();
const mockShowConfirmation = vi.fn();

vi.mock("vee-validate", () => ({
  useForm: vi.fn(() => ({
    meta: computed(() => ({ valid: true, dirty: false, touched: false, pending: false })),
    setFieldError: vi.fn(),
    errorBag: ref({}),
  })),
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: vi.fn(() => ({
    onBeforeClose: mockOnBeforeClose,
  })),
}));

vi.mock("@core/composables/usePopup", () => ({
  usePopup: vi.fn(() => ({
    showConfirmation: mockShowConfirmation,
  })),
}));

vi.mock("@core/composables/useBeforeUnload", () => ({
  useBeforeUnload: vi.fn(),
}));

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    provide: vi.fn(),
  };
});

import { useBladeForm } from "./index";
import { useBeforeUnload } from "@core/composables/useBeforeUnload";
import { useForm } from "vee-validate";
import { BladeFormKey } from "@framework/injection-keys";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useBladeForm", () => {
  // ---- isReady gate ----

  describe("isReady gate", () => {
    it("isReady is false before setBaseline", () => {
      const data = ref({ name: "initial" });
      const { isReady } = useBladeForm({ data });
      expect(isReady.value).toBe(false);
    });

    it("isReady becomes true after setBaseline", () => {
      const data = ref({ name: "initial" });
      const { isReady, setBaseline } = useBladeForm({ data });
      setBaseline();
      expect(isReady.value).toBe(true);
    });

    it("isModified is false before setBaseline even if data changes", async () => {
      const data = ref({ name: "initial" });
      const { isModified } = useBladeForm({ data });

      data.value.name = "changed";
      await nextTick();

      expect(isModified.value).toBe(false);
    });

    it("canSave is false before setBaseline", async () => {
      const data = ref({ name: "initial" });
      const { canSave } = useBladeForm({ data });

      data.value.name = "changed";
      await nextTick();

      expect(canSave.value).toBe(false);
    });
  });

  // ---- setBaseline ----

  describe("setBaseline", () => {
    it("resets isModified after data was changed", async () => {
      const data = ref({ name: "initial" });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();
      expect(isModified.value).toBe(true);

      setBaseline();
      expect(isModified.value).toBe(false);
    });

    it("can be called multiple times (after load and save)", async () => {
      const data = ref({ name: "v1" });
      const { setBaseline, isModified } = useBladeForm({ data });

      // First call: after load
      setBaseline();
      expect(isModified.value).toBe(false);

      // Simulate user edit
      data.value.name = "v2";
      await nextTick();
      expect(isModified.value).toBe(true);

      // Second call: after save
      setBaseline();
      expect(isModified.value).toBe(false);

      // Another user edit
      data.value.name = "v3";
      await nextTick();
      expect(isModified.value).toBe(true);
    });
  });

  // ---- canSave ----

  describe("canSave", () => {
    it("is true when ready, valid, and modified", async () => {
      const data = ref({ name: "initial" });
      const { setBaseline, canSave } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();
      expect(canSave.value).toBe(true);
    });

    it("is false when canSaveOverride is false", async () => {
      const data = ref({ name: "initial" });
      const override = ref(false);
      const { setBaseline, canSave } = useBladeForm({
        data,
        canSaveOverride: computed(() => override.value),
      });
      setBaseline();

      data.value.name = "changed";
      await nextTick();
      expect(canSave.value).toBe(false);
    });

    it("is false when not modified", () => {
      const data = ref({ name: "initial" });
      const { setBaseline, canSave } = useBladeForm({ data });
      setBaseline();
      expect(canSave.value).toBe(false);
    });

    it("reacts to canSaveOverride changes", async () => {
      const data = ref({ name: "initial" });
      const override = ref(false);
      const canSaveOverride = computed(() => override.value);
      const { setBaseline, canSave } = useBladeForm({ data, canSaveOverride });
      setBaseline();

      data.value.name = "changed";
      await nextTick();
      expect(canSave.value).toBe(false);

      override.value = true;
      expect(canSave.value).toBe(true);
    });

    it("is false when form is invalid", async () => {
      (useForm as unknown as Mock).mockReturnValueOnce({
        meta: computed(() => ({ valid: false, dirty: false, touched: false, pending: false })),
        setFieldError: vi.fn(),
        errorBag: ref({}),
      });

      const data = ref({ name: "initial" });
      const { setBaseline, canSave } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();
      expect(canSave.value).toBe(false);
    });
  });

  // ---- revert ----

  describe("revert", () => {
    it("reverts data to pristine when onRevert is not provided", async () => {
      const data = ref({ name: "initial" });
      const { setBaseline, revert } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      revert();
      expect(data.value).toEqual({ name: "initial" });
    });

    it("calls onRevert when provided and does NOT revert data itself", async () => {
      const data = ref({ name: "initial" });
      const onRevert = vi.fn();
      const { setBaseline, revert } = useBladeForm({ data, onRevert });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      revert();
      expect(onRevert).toHaveBeenCalledOnce();
      expect(data.value).toEqual({ name: "changed" });
    });
  });

  // ---- deep empty comparison ----

  describe("deep empty comparison", () => {
    it("[{ value: 'real' }] → [{ value: '' }] IS considered modified", async () => {
      const data = ref({ values: [{ value: "real" }] });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();

      data.value.values = [{ value: "" }];
      await nextTick();
      expect(isModified.value).toBe(true);
    });

    it("0 is NOT considered empty", async () => {
      const data = ref({ count: 0 as number | undefined });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();

      data.value.count = undefined;
      await nextTick();
      expect(isModified.value).toBe(true);
    });

    it("false is NOT considered empty", async () => {
      const data = ref({ active: false as boolean | undefined });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();

      data.value.active = undefined;
      await nextTick();
      expect(isModified.value).toBe(true);
    });

    it("[] and undefined are considered equal", async () => {
      const data = ref<{ items?: unknown[] }>({ items: undefined });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();
      data.value.items = [];
      await nextTick();
      expect(isModified.value).toBe(false);
    });

    it("[] and null are considered equal", async () => {
      const data = ref<{ items?: unknown[] | null }>({ items: null });
      const { setBaseline, isModified } = useBladeForm({ data });
      setBaseline();
      data.value.items = [];
      await nextTick();
      expect(isModified.value).toBe(false);
    });
  });

  // ---- autoBeforeClose ----

  describe("autoBeforeClose", () => {
    it("registers onBeforeClose guard by default", () => {
      const data = ref({ name: "initial" });
      useBladeForm({ data });
      expect(mockOnBeforeClose).toHaveBeenCalledOnce();
    });

    it("does not register guard when autoBeforeClose is false", () => {
      const data = ref({ name: "initial" });
      useBladeForm({ data, autoBeforeClose: false });
      expect(mockOnBeforeClose).not.toHaveBeenCalled();
    });

    it("guard allows close when not modified", async () => {
      const data = ref({ name: "initial" });
      useBladeForm({ data });

      const guardFn = mockOnBeforeClose.mock.calls[0][0];
      const shouldBlock = await guardFn();
      expect(shouldBlock).toBe(false);
    });

    it("guard shows confirmation when modified", async () => {
      mockShowConfirmation.mockResolvedValue(false); // user declines to leave

      const data = ref({ name: "initial" });
      const { setBaseline } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      const guardFn = mockOnBeforeClose.mock.calls[0][0];
      const shouldBlock = await guardFn();

      expect(mockShowConfirmation).toHaveBeenCalledWith("You have unsaved changes. Are you sure you want to leave?");
      expect(shouldBlock).toBe(true);
    });

    it("guard lets close when user confirms", async () => {
      mockShowConfirmation.mockResolvedValue(true); // user confirms leave

      const data = ref({ name: "initial" });
      const { setBaseline } = useBladeForm({ data });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      const guardFn = mockOnBeforeClose.mock.calls[0][0];
      const shouldBlock = await guardFn();
      expect(shouldBlock).toBe(false);
    });

    it("guard respects ComputedRef<boolean> condition", async () => {
      mockShowConfirmation.mockResolvedValue(false);

      const condition = ref(false);
      const data = ref({ name: "initial" });
      const { setBaseline } = useBladeForm({
        data,
        autoBeforeClose: computed(() => condition.value),
      });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      const guardFn = mockOnBeforeClose.mock.calls[0][0];

      // Condition is false => should not guard even though modified
      let shouldBlock = await guardFn();
      expect(shouldBlock).toBe(false);
      expect(mockShowConfirmation).not.toHaveBeenCalled();

      // Condition becomes true => should guard
      condition.value = true;
      shouldBlock = await guardFn();
      expect(shouldBlock).toBe(true);
      expect(mockShowConfirmation).toHaveBeenCalledOnce();
    });

    it("uses custom closeConfirmMessage when provided", async () => {
      mockShowConfirmation.mockResolvedValue(false);

      const data = ref({ name: "initial" });
      const { setBaseline } = useBladeForm({
        data,
        closeConfirmMessage: "Custom message!",
      });
      setBaseline();

      data.value.name = "changed";
      await nextTick();

      const guardFn = mockOnBeforeClose.mock.calls[0][0];
      await guardFn();

      expect(mockShowConfirmation).toHaveBeenCalledWith("Custom message!");
    });
  });

  // ---- autoBeforeUnload ----

  describe("autoBeforeUnload", () => {
    it("registers useBeforeUnload by default", () => {
      const data = ref({ name: "initial" });
      useBladeForm({ data });
      expect(useBeforeUnload).toHaveBeenCalledOnce();
    });

    it("does not register useBeforeUnload when autoBeforeUnload is false", () => {
      const data = ref({ name: "initial" });
      useBladeForm({ data, autoBeforeUnload: false });
      expect(useBeforeUnload).not.toHaveBeenCalled();
    });
  });

  // ---- provide ----

  describe("provide", () => {
    it("provides BladeFormKey with isModified and canSave", () => {
      const data = ref({ name: "initial" });
      const { isModified, canSave } = useBladeForm({ data });

      expect(provide).toHaveBeenCalledWith(BladeFormKey, { isModified, canSave });
    });
  });
});
