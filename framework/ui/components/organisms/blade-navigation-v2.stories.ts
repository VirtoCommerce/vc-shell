import type { Meta, StoryFn } from "@storybook/vue3";
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
} from "@shared/components/blade-navigation/types";

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
        icon: "fas fa-sync-alt",
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
      icon="fas fa-file-alt"
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
        icon: "fas fa-save",
        title: "Save",
        clickHandler: () => {
          /* demo noop */
        },
      },
      {
        id: "delete",
        icon: "fas fa-trash",
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
      icon="fas fa-file-invoice"
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
      icon="fas fa-user"
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
      icon="fas fa-box"
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

export default {
  title: "Blade Navigation/v2 BladeStack",
} as Meta;

// ── Main Interactive Story ─────────────────────────────────────────────────────

export const Interactive: StoryFn = () => ({
  setup() {
    // ── Inject framework-provided infrastructure ─────────────────────────────
    // The Storybook preview.ts calls app.use(framework, { router }) which installs:
    //   - BladeRegistry (with _registerBladeFn) via BladeRegistryKey
    //   - BladeStack via BladeStackKey
    //   - BladeMessaging via BladeMessagingKey
    // We inject these real instances to hook into the existing system.
    const registry = inject(BladeRegistryKey) as IBladeRegistryInstance;
    const bladeStack = inject(BladeStackKey)!;
    const messaging = inject(BladeMessagingKey)!;

    // ── Register mock blade components in the real registry ──────────────────
    // _registerBladeFn adds to the registry map AND calls app.component()
    // so VcBladeSlot can resolve them by name.
    // allowOverwrite=true because Storybook HMR re-runs setup
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

    // ── Clear stale state from previous story renders ────────────────────────
    bladeStack._restoreStack([]);
    demoModified.value = false;

    // ── Reactive state ───────────────────────────────────────────────────────
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

    // ── Auto-open workspace on mount ─────────────────────────────────────────
    onMounted(async () => {
      await bladeStack.openWorkspace({ name: "OrdersWorkspace" });
      log("Opened workspace: OrdersWorkspace");
    });

    // ── Cleanup on unmount ───────────────────────────────────────────────────
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
      // Explicitly set workspace as parent so sibling blades REPLACE each other
      // (without this, parentId defaults to activeBlade — stacking instead of replacing)
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

    async function replaceActive() {
      try {
        await bladeStack.replaceCurrentBlade({
          name: "OrderDetails",
          param: `replaced-${Date.now().toString(36)}`,
          options: { source: "replace" },
        });
        log("Replaced active blade with new OrderDetails");
      } catch (e: any) {
        log(`Replace failed: ${e.message}`);
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

    return {
      blades,
      activeBlade,
      guardEnabled,
      logMessages,
      demoModified,
      openOrders,
      openProducts,
      openOrderDetail,
      closeActiveBlade,
      replaceActive,
      callParentReload,
      toggleGuard,
      setError,
      clearError,
      toggleModified,
    };
  },
  template: `
    <div class="tw-flex tw-flex-col" style="height: 700px;">
      <!-- Control Panel -->
      <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-p-3 tw-bg-white tw-border-b tw-shrink-0">
        <span class="tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400 tw-mr-1">Workspace</span>
        <button @click="openOrders" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-blue-500 tw-text-white tw-rounded hover:tw-bg-blue-600 tw-transition-colors">
          Orders
        </button>
        <button @click="openProducts" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-purple-500 tw-text-white tw-rounded hover:tw-bg-purple-600 tw-transition-colors">
          Products
        </button>
        <div class="tw-w-px tw-h-5 tw-bg-gray-200 tw-mx-1" />

        <span class="tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400 tw-mr-1">Blades</span>
        <button @click="openOrderDetail('ORD-001')" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-green-500 tw-text-white tw-rounded hover:tw-bg-green-600 tw-transition-colors">
          Open #001
        </button>
        <button @click="openOrderDetail('ORD-002')" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-green-500 tw-text-white tw-rounded hover:tw-bg-green-600 tw-transition-colors">
          Open #002
        </button>
        <button @click="closeActiveBlade" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-red-500 tw-text-white tw-rounded hover:tw-bg-red-600 tw-transition-colors">
          Close Active
        </button>
        <button @click="replaceActive" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-amber-500 tw-text-white tw-rounded hover:tw-bg-amber-600 tw-transition-colors">
          Replace
        </button>
        <div class="tw-w-px tw-h-5 tw-bg-gray-200 tw-mx-1" />

        <span class="tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400 tw-mr-1">IPC</span>
        <button @click="callParentReload" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-indigo-500 tw-text-white tw-rounded hover:tw-bg-indigo-600 tw-transition-colors">
          Call Parent
        </button>
        <div class="tw-w-px tw-h-5 tw-bg-gray-200 tw-mx-1" />

        <button
          @click="toggleGuard"
          :class="guardEnabled ? 'tw-bg-orange-600' : 'tw-bg-orange-400'"
          class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-text-white tw-rounded hover:tw-opacity-90 tw-transition-colors"
        >
          Guard {{ guardEnabled ? 'ON' : 'OFF' }}
        </button>
        <button @click="setError" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-rose-500 tw-text-white tw-rounded hover:tw-bg-rose-600 tw-transition-colors">
          Set Error
        </button>
        <button @click="clearError" class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-bg-gray-400 tw-text-white tw-rounded hover:tw-bg-gray-500 tw-transition-colors">
          Clear Error
        </button>
        <button
          @click="toggleModified"
          :class="demoModified ? 'tw-bg-yellow-600' : 'tw-bg-yellow-400'"
          class="tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-text-white tw-rounded hover:tw-opacity-90 tw-transition-colors"
        >
          Modified {{ demoModified ? 'ON' : 'OFF' }}
        </button>
      </div>

      <!-- Main area: Blade Navigation + Event Log -->
      <div class="tw-flex tw-flex-1 tw-min-h-0">
        <!-- VcBladeNavigation renders the real blade stack with full VcBlade chrome -->
        <VcBladeNavigation class="tw-flex-1" />

        <!-- Event Log -->
        <div class="tw-w-[260px] tw-flex tw-flex-col tw-bg-gray-900 tw-shrink-0 tw-border-l tw-border-gray-700">
          <div class="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-border-b tw-border-gray-700">
            <span class="tw-text-xs tw-font-semibold tw-text-gray-400 tw-uppercase">Event Log</span>
            <span class="tw-text-[10px] tw-text-gray-600">{{ blades.length }} blade(s)</span>
          </div>
          <div class="tw-flex-1 tw-overflow-auto tw-p-2 tw-font-mono tw-text-[11px] tw-leading-relaxed">
            <div v-for="(msg, i) in logMessages" :key="i" class="tw-text-green-400 tw-py-0.5">
              {{ msg }}
            </div>
            <div v-if="logMessages.length === 0" class="tw-text-gray-600 tw-italic">
              No events yet...
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
});
Interactive.storyName = "Interactive BladeStack";
