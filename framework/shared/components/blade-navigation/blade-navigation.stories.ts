import type { Meta, StoryFn } from "@storybook/vue3-vite";
import {
  ref,
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
} from "vue";
import {
  BladeRegistryKey,
  type IBladeRegistryInstance,
} from "@core/composables/useBladeRegistry";
import {
  BladeStackKey,
  BladeMessagingKey,
  BladeDescriptorKey,
} from "@core/blade-navigation/types";

// ── Shared demo state (module-level for control panel ↔ blade component sync) ─

const demoModified = ref(false);

// ── Mock Blade Components ──────────────────────────────────────────────────────

/**
 * OrdersWorkspace — a workspace blade showing a list of orders.
 * Clicking an order opens OrderDetails as a child blade.
 * Exposes `reload` method for IPC demo.
 */
const OrdersWorkspace = defineComponent({
  name: "OrdersWorkspace",
  props: {
    param: String,
    options: Object,
    closable: Boolean,
    expanded: Boolean,
  },
  emits: ["close:blade", "parent:call"],
  setup(props, { emit, expose }) {
    const bladeStack = inject(BladeStackKey)!;
    const selfDescriptor = inject(BladeDescriptorKey)!;

    const orders = [
      { id: "ORD-001", customer: "Alice Johnson", total: "$149.99", status: "Processing" },
      { id: "ORD-002", customer: "Bob Smith", total: "$299.50", status: "Shipped" },
      { id: "ORD-003", customer: "Carol White", total: "$89.00", status: "Delivered" },
      { id: "ORD-004", customer: "Dan Brown", total: "$549.99", status: "Pending" },
    ];

    async function openOrder(orderId: string) {
      await bladeStack.openBlade({
        name: "OrderDetails",
        param: orderId,
        parentId: selfDescriptor.value.id,
        options: { source: "workspace-click" },
      });
    }

    const toolbarItems = [
      {
        id: "refresh",
        icon: "lucide-refresh-cw",
        title: "Refresh",
        clickHandler: () => {
          /* demo noop */
        },
      },
    ];

    expose({
      title: "Orders",
      reload: () => "Orders workspace reloaded!",
    });

    return { orders, openOrder, toolbarItems };
  },
  template: `
    <VcBlade
      title="Orders"
      icon="lucide-file-text"
      :closable="closable"
      :expanded="expanded"
      :toolbar-items="toolbarItems"
      @close="$emit('close:blade')"
    >
      <div class="tw-p-4 tw-space-y-2">
        <div class="tw-text-sm tw-text-gray-500 tw-mb-3">Click an order to open details</div>
        <div
          v-for="order in orders"
          :key="order.id"
          class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-rounded-lg tw-border tw-border-gray-200 tw-cursor-pointer hover:tw-bg-blue-50 hover:tw-border-blue-300 tw-transition-colors"
          @click="openOrder(order.id)"
        >
          <div>
            <div class="tw-font-semibold tw-text-sm">{{ order.id }}</div>
            <div class="tw-text-xs tw-text-gray-500">{{ order.customer }}</div>
          </div>
          <div class="tw-text-right">
            <div class="tw-font-semibold tw-text-green-600 tw-text-sm">{{ order.total }}</div>
            <div class="tw-text-xs tw-text-gray-400">{{ order.status }}</div>
          </div>
        </div>
      </div>
    </VcBlade>
  `,
});

/**
 * OrderDetails — child blade showing order detail info.
 * Demonstrates: dynamic title, toolbar, modified state, closable.
 * Has "View Customer" button to open a third-level blade (demonstrates 2-visible stacking).
 * Exposes `title` (computed) and `reload` for IPC.
 */
const OrderDetails = defineComponent({
  name: "OrderDetails",
  props: {
    param: String,
    options: Object,
    closable: Boolean,
    expanded: Boolean,
  },
  emits: ["close:blade", "parent:call"],
  setup(props, { emit, expose }) {
    const bladeStack = inject(BladeStackKey)!;
    const title = computed(() => `Order: ${props.param || "N/A"}`);

    const toolbarItems = [
      {
        id: "save",
        icon: "lucide-save",
        title: "Save",
        clickHandler: () => {
          /* demo noop */
        },
      },
      {
        id: "delete",
        icon: "lucide-trash-2",
        title: "Delete",
        clickHandler: () => {
          /* demo noop */
        },
      },
    ];

    async function openCustomer(customerId: string) {
      await bladeStack.openBlade({
        name: "CustomerDetails",
        param: customerId,
        options: { orderId: props.param },
      });
    }

    expose({
      title,
      reload: () => `Order ${props.param} reloaded!`,
    });

    return { title, toolbarItems, demoModified, openCustomer };
  },
  template: `
    <VcBlade
      :title="title"
      icon="lucide-file-text"
      :closable="closable"
      :expanded="expanded"
      :toolbar-items="toolbarItems"
      :modified="demoModified"
      @close="$emit('close:blade')"
    >
      <div class="tw-p-4 tw-space-y-4">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">Order ID</div>
            <div class="tw-font-mono tw-text-sm">{{ param }}</div>
          </div>
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">Source</div>
            <div class="tw-text-sm">{{ options?.source || 'N/A' }}</div>
          </div>
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">Status</div>
            <div class="tw-text-sm tw-text-green-600">Active</div>
          </div>
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">Expanded</div>
            <div class="tw-text-sm">{{ expanded }}</div>
          </div>
        </div>
        <div class="tw-border-t tw-pt-3">
          <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-2">Customer</div>
          <div
            class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-rounded-lg tw-border tw-border-gray-200 tw-cursor-pointer hover:tw-bg-indigo-50 hover:tw-border-indigo-300 tw-transition-colors"
            @click="openCustomer('CUST-' + (param || '').replace('ORD-', ''))"
          >
            <div>
              <div class="tw-font-semibold tw-text-sm">View Customer</div>
              <div class="tw-text-xs tw-text-gray-500">Opens a third-level blade</div>
            </div>
            <div class="tw-text-indigo-500 tw-text-sm">CUST-{{ (param || '').replace('ORD-', '') }}</div>
          </div>
        </div>
      </div>
    </VcBlade>
  `,
});

/**
 * CustomerDetails — third-level blade opened from OrderDetails.
 * Demonstrates deep stacking: with 3 blades open, only the last 2 are visible.
 */
const CustomerDetails = defineComponent({
  name: "CustomerDetails",
  props: {
    param: String,
    options: Object,
    closable: Boolean,
    expanded: Boolean,
  },
  emits: ["close:blade", "parent:call"],
  setup(props, { emit, expose }) {
    const title = computed(() => `Customer: ${props.param || "N/A"}`);

    expose({
      title,
      reload: () => `Customer ${props.param} reloaded!`,
    });

    return { title };
  },
  template: `
    <VcBlade
      :title="title"
      icon="lucide-user"
      :closable="closable"
      :expanded="expanded"
      @close="$emit('close:blade')"
    >
      <div class="tw-p-4 tw-space-y-4">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">Customer ID</div>
            <div class="tw-font-mono tw-text-sm">{{ param }}</div>
          </div>
          <div>
            <div class="tw-text-xs tw-text-gray-400 tw-uppercase tw-mb-1">From Order</div>
            <div class="tw-text-sm">{{ options?.orderId || 'N/A' }}</div>
          </div>
        </div>
        <div class="tw-border-t tw-pt-3 tw-text-sm tw-text-gray-500">
          This is a third-level blade. The workspace blade should now be hidden — only this blade and OrderDetails are visible.
        </div>
      </div>
    </VcBlade>
  `,
});

/**
 * ProductsWorkspace — alternative workspace blade for testing workspace switching.
 */
const ProductsWorkspace = defineComponent({
  name: "ProductsWorkspace",
  props: {
    param: String,
    options: Object,
    closable: Boolean,
    expanded: Boolean,
  },
  emits: ["close:blade", "parent:call"],
  setup(props, { emit, expose }) {
    const products = [
      { id: "SKU-001", name: "Wireless Headphones", price: "$79.99" },
      { id: "SKU-002", name: "USB-C Hub", price: "$34.99" },
      { id: "SKU-003", name: "Mechanical Keyboard", price: "$129.99" },
    ];

    expose({ title: "Products" });

    return { products };
  },
  template: `
    <VcBlade
      title="Products"
      icon="lucide-box"
      :closable="closable"
      :expanded="expanded"
      @close="$emit('close:blade')"
    >
      <div class="tw-p-4 tw-space-y-2">
        <div
          v-for="product in products"
          :key="product.id"
          class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-rounded-lg tw-border tw-border-gray-200"
        >
          <div>
            <div class="tw-font-semibold tw-text-sm">{{ product.name }}</div>
            <div class="tw-text-xs tw-text-gray-500">{{ product.id }}</div>
          </div>
          <div class="tw-font-semibold tw-text-green-600 tw-text-sm">{{ product.price }}</div>
        </div>
      </div>
    </VcBlade>
  `,
});

// ── Story Meta ─────────────────────────────────────────────────────────────────

/**
 * `VcBladeNavigation` manages a stack of blade panels with workspace switching,
 * parent-child relationships, inter-blade messaging, close guards, and error handling.
 *
 * Key navigation methods:
 * - `replaceCurrentBlade` — true replacement: destroys old blade, creates new at same position
 * - `coverCurrentBlade` — hides old blade, opens new on top; closing reveals the hidden blade
 */
export default {
  title: "Navigation/VcBladeNavigation",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The blade navigation container that manages a stack of blade panels. Supports workspace switching, " +
          "parent-child blade relationships, inter-blade messaging (IPC), close guards to prevent unsaved data loss, " +
          "error state management, replace vs cover blade substitution, and automatic 2-visible stacking for deep navigation.",
      },
    },
  },
} as Meta;

// ── Main Interactive Story ─────────────────────────────────────────────────────

export const Interactive: StoryFn = () => ({
  setup() {
    const registry = inject(BladeRegistryKey) as IBladeRegistryInstance;
    const bladeStack = inject(BladeStackKey)!;
    const messaging = inject(BladeMessagingKey)!;

    registry._registerBladeFn("OrdersWorkspace", {
      component: OrdersWorkspace as any,
      route: "/orders",
      isWorkspace: true,
    }, true);
    registry._registerBladeFn("OrderDetails", {
      component: OrderDetails as any,
      route: "/order",
    }, true);
    registry._registerBladeFn("CustomerDetails", {
      component: CustomerDetails as any,
      route: "/customer",
    }, true);
    registry._registerBladeFn("ProductsWorkspace", {
      component: ProductsWorkspace as any,
      route: "/products",
      isWorkspace: true,
    }, true);

    bladeStack._restoreStack([]);
    demoModified.value = false;

    const blades = computed(() => bladeStack.blades.value);
    const activeBlade = computed(() => bladeStack.activeBlade.value);
    const guardEnabled = ref(false);
    const guardBladeId = ref<string | null>(null);
    const logMessages = ref<string[]>([]);

    function log(msg: string) {
      const time = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      logMessages.value = [...logMessages.value.slice(-29), `[${time}] ${msg}`];
    }

    onMounted(async () => {
      await bladeStack.openWorkspace({ name: "OrdersWorkspace" });
      log("Opened workspace: OrdersWorkspace");
    });

    onUnmounted(() => {
      if (guardBladeId.value) {
        bladeStack.unregisterBeforeClose(guardBladeId.value);
      }
      bladeStack._restoreStack([]);
    });

    // ── Workspace actions ────────────────────────────────────────────────────

    async function openOrders() {
      await bladeStack.openWorkspace({ name: "OrdersWorkspace" });
      guardEnabled.value = false;
      guardBladeId.value = null;
      log("Opened workspace: OrdersWorkspace");
    }

    async function openProducts() {
      await bladeStack.openWorkspace({ name: "ProductsWorkspace" });
      guardEnabled.value = false;
      guardBladeId.value = null;
      log("Opened workspace: ProductsWorkspace");
    }

    // ── Blade actions ────────────────────────────────────────────────────────

    async function openOrderDetail(param: string) {
      const workspace = bladeStack.workspace.value;
      await bladeStack.openBlade({
        name: "OrderDetails",
        param,
        parentId: workspace?.id,
        options: { source: "control-panel", timestamp: Date.now() },
      });
      log(`Opened blade: OrderDetails (param=${param})`);
    }

    async function closeActiveBlade() {
      const active = activeBlade.value;
      if (!active || active === bladeStack.workspace.value) {
        log("Cannot close workspace blade");
        return;
      }
      const prevented = await bladeStack.closeBlade(active.id);
      if (prevented) {
        log(`Close PREVENTED for ${active.name}`);
      } else {
        log(`Closed blade: ${active.name}`);
        if (guardBladeId.value && !blades.value.find((b) => b.id === guardBladeId.value)) {
          guardEnabled.value = false;
          guardBladeId.value = null;
        }
      }
    }

    // ── Replace (true replacement — destroy old, create new at same index) ───

    async function replaceActive() {
      try {
        await bladeStack.replaceCurrentBlade({
          name: "OrderDetails",
          param: `replaced-${Date.now().toString(36)}`,
          options: { source: "replace" },
        });
        log("Replaced active blade (destroyed old, created new at same index)");
      } catch (e: any) {
        log(`Replace failed: ${e.message}`);
      }
    }

    // ── Cover (hide old, open new on top — closing reveals hidden blade) ─────

    async function coverActive() {
      try {
        await bladeStack.coverCurrentBlade({
          name: "OrderDetails",
          param: `covered-${Date.now().toString(36)}`,
          options: { source: "cover" },
        });
        log("Covered active blade (old hidden, new on top — close to reveal)");
      } catch (e: any) {
        log(`Cover failed: ${e.message}`);
      }
    }

    // ── IPC (inter-blade messaging) ──────────────────────────────────────────

    async function callParentReload() {
      const all = blades.value;
      const child = all.length > 1 ? all[all.length - 1] : undefined;
      if (!child) {
        log("No child blade to call parent from");
        return;
      }
      try {
        const result = await messaging.callParent(child.id, "reload");
        log(`callParent('reload') returned: ${JSON.stringify(result)}`);
      } catch (e: any) {
        log(`callParent failed: ${e.message}`);
      }
    }

    // ── Guard (prevent close) ────────────────────────────────────────────────

    function toggleGuard() {
      const active = activeBlade.value;
      if (!active || active === bladeStack.workspace.value) {
        log("Select a non-workspace blade first");
        return;
      }
      if (guardEnabled.value && guardBladeId.value) {
        bladeStack.unregisterBeforeClose(guardBladeId.value);
        guardEnabled.value = false;
        guardBladeId.value = null;
        log("Guard removed");
      } else {
        bladeStack.registerBeforeClose(active.id, async () => {
          log("Guard PREVENTED close!");
          return true;
        });
        guardEnabled.value = true;
        guardBladeId.value = active.id;
        log(`Guard enabled on ${active.name}`);
      }
    }

    // ── Error ────────────────────────────────────────────────────────────────

    function setError() {
      const active = activeBlade.value;
      if (active) {
        bladeStack.setBladeError(active.id, new Error("Demo error: something went wrong"));
        log(`Set error on ${active.name}`);
      }
    }

    function clearError() {
      const active = activeBlade.value;
      if (active) {
        bladeStack.clearBladeError(active.id);
        log(`Cleared error on ${active.name}`);
      }
    }

    // ── Modified state ───────────────────────────────────────────────────────

    function toggleModified() {
      demoModified.value = !demoModified.value;
      log(`Modified: ${demoModified.value}`);
    }

    const hiddenCount = computed(() => blades.value.filter((b) => !b.visible).length);

    return {
      blades,
      activeBlade,
      guardEnabled,
      logMessages,
      demoModified,
      hiddenCount,
      openOrders,
      openProducts,
      openOrderDetail,
      closeActiveBlade,
      replaceActive,
      coverActive,
      callParentReload,
      toggleGuard,
      setError,
      clearError,
      toggleModified,
    };
  },
  template: `
    <div class="tw-flex" style="height: 700px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <!-- ═══ Sidebar Control Panel ═══ -->
      <div class="tw-w-[220px] tw-flex tw-flex-col tw-bg-[#1e1e2e] tw-shrink-0 tw-overflow-y-auto">

        <!-- Header -->
        <div class="tw-px-4 tw-pt-4 tw-pb-3">
          <div class="tw-text-[13px] tw-font-semibold tw-text-white">Blade Navigation</div>
          <div class="tw-text-[11px] tw-text-[#6c7086] tw-mt-0.5">Interactive playground</div>
        </div>

        <!-- Stack Visualization -->
        <div class="tw-px-3 tw-pb-3">
          <div class="tw-rounded-lg tw-bg-[#181825] tw-p-2.5">
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
              <span class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086]">Stack</span>
              <span class="tw-text-[10px] tw-tabular-nums tw-text-[#6c7086]">{{ blades.length }} blade{{ blades.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="tw-space-y-1">
              <div
                v-for="(b, i) in blades"
                :key="b.id"
                class="tw-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-1 tw-rounded tw-text-[11px]"
                :class="[
                  b.id === activeBlade?.id ? 'tw-bg-[#313244] tw-text-[#cdd6f4]' : '',
                  !b.visible ? 'tw-opacity-40' : 'tw-text-[#a6adc8]',
                ]"
              >
                <span
                  class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-shrink-0"
                  :class="[
                    !b.visible ? 'tw-bg-[#fab387]' :
                    b.id === activeBlade?.id ? 'tw-bg-[#a6e3a1]' : 'tw-bg-[#585b70]'
                  ]"
                />
                <span class="tw-truncate tw-font-medium">{{ b.name }}</span>
                <span v-if="b.param" class="tw-text-[10px] tw-text-[#585b70] tw-truncate tw-ml-auto">{{ b.param.substring(0, 10) }}</span>
              </div>
              <div v-if="blades.length === 0" class="tw-text-[11px] tw-text-[#585b70] tw-italic tw-px-2 tw-py-1">Empty</div>
            </div>
            <div v-if="hiddenCount > 0" class="tw-mt-1.5 tw-px-2 tw-text-[10px] tw-text-[#fab387]">
              {{ hiddenCount }} hidden (covered)
            </div>
          </div>
        </div>

        <div class="tw-h-px tw-bg-[#313244] tw-mx-3" />

        <!-- Workspace -->
        <div class="tw-p-3">
          <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086] tw-mb-2">Workspace</div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-1.5">
            <button @click="openOrders" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#cdd6f4] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              Orders
            </button>
            <button @click="openProducts" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#cdd6f4] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              Products
            </button>
          </div>
        </div>

        <!-- Open Blades -->
        <div class="tw-p-3 tw-pt-0">
          <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086] tw-mb-2">Open Blade</div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-1.5">
            <button @click="openOrderDetail('ORD-001')" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#cdd6f4] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              #001
            </button>
            <button @click="openOrderDetail('ORD-002')" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#cdd6f4] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              #002
            </button>
          </div>
          <button @click="closeActiveBlade" class="tw-w-full tw-mt-1.5 tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#45475a] tw-text-[#f38ba8] hover:tw-bg-[#585b70] tw-transition-colors">
            Close Active
          </button>
        </div>

        <div class="tw-h-px tw-bg-[#313244] tw-mx-3" />

        <!-- Blade Substitution -->
        <div class="tw-p-3">
          <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086] tw-mb-2">Substitution</div>
          <div class="tw-space-y-1.5">
            <button @click="replaceActive" class="tw-w-full tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#f9e2af] hover:tw-bg-[#45475a] tw-transition-colors tw-text-left">
              <span class="tw-block">Replace</span>
              <span class="tw-block tw-text-[10px] tw-text-[#585b70] tw-font-normal">Destroy old, new at same index</span>
            </button>
            <button @click="coverActive" class="tw-w-full tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#94e2d5] hover:tw-bg-[#45475a] tw-transition-colors tw-text-left">
              <span class="tw-block">Cover</span>
              <span class="tw-block tw-text-[10px] tw-text-[#585b70] tw-font-normal">Hide old, close reveals it</span>
            </button>
          </div>
        </div>

        <div class="tw-h-px tw-bg-[#313244] tw-mx-3" />

        <!-- Messaging & State -->
        <div class="tw-p-3">
          <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086] tw-mb-2">Messaging & State</div>
          <div class="tw-space-y-1.5">
            <button @click="callParentReload" class="tw-w-full tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#89b4fa] hover:tw-bg-[#45475a] tw-transition-colors">
              Call Parent (reload)
            </button>
            <button
              @click="toggleGuard"
              class="tw-w-full tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-transition-colors tw-text-left"
              :class="guardEnabled
                ? 'tw-bg-[#fab387]/20 tw-text-[#fab387] hover:tw-bg-[#fab387]/30 tw-ring-1 tw-ring-[#fab387]/30'
                : 'tw-bg-[#313244] tw-text-[#a6adc8] hover:tw-bg-[#45475a]'"
            >
              Close Guard {{ guardEnabled ? 'Active' : 'Off' }}
            </button>
            <button
              @click="toggleModified"
              class="tw-w-full tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-transition-colors tw-text-left"
              :class="demoModified
                ? 'tw-bg-[#f9e2af]/20 tw-text-[#f9e2af] hover:tw-bg-[#f9e2af]/30 tw-ring-1 tw-ring-[#f9e2af]/30'
                : 'tw-bg-[#313244] tw-text-[#a6adc8] hover:tw-bg-[#45475a]'"
            >
              Modified {{ demoModified ? 'On' : 'Off' }}
            </button>
          </div>
        </div>

        <div class="tw-h-px tw-bg-[#313244] tw-mx-3" />

        <!-- Error -->
        <div class="tw-p-3">
          <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086] tw-mb-2">Error State</div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-1.5">
            <button @click="setError" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#f38ba8] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              Trigger
            </button>
            <button @click="clearError" class="tw-px-2.5 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-md tw-bg-[#313244] tw-text-[#a6adc8] hover:tw-bg-[#45475a] tw-transition-colors tw-text-center">
              Clear
            </button>
          </div>
        </div>

        <!-- Event Log -->
        <div class="tw-flex-1 tw-flex tw-flex-col tw-min-h-0">
          <div class="tw-h-px tw-bg-[#313244] tw-mx-3" />
          <div class="tw-px-3 tw-pt-3 tw-pb-1">
            <div class="tw-text-[10px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-[#6c7086]">Event Log</div>
          </div>
          <div class="tw-flex-1 tw-overflow-y-auto tw-px-3 tw-pb-3">
            <div v-for="(msg, i) in logMessages" :key="i" class="tw-text-[10px] tw-font-mono tw-leading-relaxed tw-text-[#a6e3a1] tw-py-px">
              {{ msg }}
            </div>
            <div v-if="logMessages.length === 0" class="tw-text-[10px] tw-text-[#585b70] tw-italic">
              Waiting for events...
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Main Content: Blade Navigation ═══ -->
      <div class="tw-flex-1 tw-min-w-0">
        <VcBladeNavigation class="tw-h-full" />
      </div>
    </div>
  `,
});
Interactive.storyName = "Interactive BladeStack";
