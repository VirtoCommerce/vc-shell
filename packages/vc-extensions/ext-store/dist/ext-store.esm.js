import { VcBlade, VcTable, VcIcon, registerBlade } from '@virtocommerce/vc-ui-kit';
import { defineComponent, ref } from '@vue/composition-api';

//
var script$1 = defineComponent({
  components: {
    VcBlade,
    VcTable,
    VcIcon
  },

  vcExtension() {
    registerBlade({
      name: "product",
      component: this
    });
  },

  setup() {
    registerBlade({
      name: "product2",
      component: this
    });
    const toolbarItems = ref([{
      id: 1,
      icon: "sync-alt",
      title: "Refresh"
    }, {
      id: 2,
      icon: "plus",
      title: "Add"
    }]);
    const breadcrumbs = ref([{
      id: 0,
      title: "Back",
      icon: "arrow-left"
    }, {
      id: 1,
      title: "Electronics"
    }, {
      id: 2,
      title: "Desktop"
    }]);
    const headers = ref([{
      id: "actions",
      title: "",
      width: 30,
      class: "vc-table__body-cell_bordered"
    }, {
      id: "img",
      title: "Pic",
      width: 60,
      class: "vc-padding-right_none"
    }, {
      id: "name",
      title: "Name",
      sortable: true
    }, {
      id: "sku",
      title: "SKU",
      sortable: true,
      width: 100
    }]);
    const items = ref([{
      id: 1,
      img: "/images/1.jpg",
      name: "Lenovo IdeaCentre 310S-08",
      description: "Physical",
      sku: "990555005"
    }, {
      id: 2,
      img: "/images/2.jpg",
      name: "BLU Win HD LTE X150Q 8GB",
      description: "Physical",
      sku: "003578948"
    }, {
      id: 3,
      img: "/images/3.jpg",
      name: "Samsung Galaxy S6 SM-G920F 32GB",
      description: "Physical",
      sku: "334590-095"
    }, {
      id: 4,
      img: "/images/4.jpg",
      name: "DJI Phantom 3 Professional Quadcopter",
      description: "Physical",
      sku: "000545432"
    }, {
      id: 5,
      img: "/images/5.jpg",
      name: "3DR X8-M Octocopter for Visual-Spectr",
      description: "Physical",
      sku: "435344443"
    }]);
    return {
      toolbarItems,
      breadcrumbs,
      headers,
      items
    };
  }

});

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('vc-blade', {
    attrs: {
      "icon": "cloud",
      "title": "B2B-mixed (virtual)",
      "width": "600",
      "toolbarItems": _vm.toolbarItems,
      "breadcrumbs": _vm.breadcrumbs,
      "searchable": true,
      "filterable": true
    },
    on: {
      "close": function ($event) {
        return _vm.$store.commit('closeBlade');
      }
    }
  }, [_c('vc-table', {
    attrs: {
      "headers": _vm.headers,
      "items": _vm.items,
      "multiselect": true
    },
    scopedSlots: _vm._u([{
      key: "item_actions",
      fn: function () {
        return [_c('vc-icon', {
          staticStyle: {
            "color": "#43b0e6"
          },
          attrs: {
            "icon": "ellipsis-v"
          }
        })];
      },
      proxy: true
    }, {
      key: "item_img",
      fn: function (itemData) {
        return [_c('img', {
          staticClass: "vc-fill_width",
          attrs: {
            "src": itemData.item.img
          }
        })];
      }
    }, {
      key: "item_name",
      fn: function (itemData) {
        return [_c('div', {
          staticClass: "vc-flex vc-flex-column"
        }, [_c('div', {
          staticClass: "vc-font-size_m vc-ellipsis"
        }, [_vm._v(_vm._s(itemData.item.name))]), _vm._v(" "), _c('div', {
          staticClass: "vc-font-size_s vc-ellipsis"
        }, [_vm._v("\n          " + _vm._s(itemData.item.description) + "\n        ")])])];
      }
    }])
  })], 1);
};

var __vue_staticRenderFns__$1 = [];
/* style */

const __vue_inject_styles__$1 = undefined;
/* scoped */

const __vue_scope_id__$1 = undefined;
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

//
var script = defineComponent({
  components: {
    VcBlade,
    VcTable,
    VcIcon
  },

  vcExtension() {
    registerBlade({
      name: "store",
      workspace: true,
      component: this
    });
  },

  setup() {
    registerBlade({
      name: "store2",
      workspace: true,
      component: this
    });
    const toolbarItems = ref([{
      id: 1,
      icon: "sync-alt",
      title: "Refresh"
    }, {
      id: 2,
      icon: "plus",
      title: "Add"
    }]);
    const headers = ref([{
      id: "actions",
      title: "",
      width: 30,
      class: "vc-table__body-cell_bordered"
    }, {
      id: "name",
      title: "Name",
      sortable: true
    }]);
    const items = ref([{
      id: 1,
      icon: "cloud",
      name: "B2B-mixed (virtual)"
    }, {
      id: 2,
      icon: "folder",
      name: "Clothing"
    }, {
      id: 3,
      icon: "folder",
      name: "Desktops"
    }]);
    return {
      toolbarItems,
      headers,
      items,

      openDetails(blade) {
        console.log("Open blade");
      }

    };
  }

});

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('vc-blade', {
    attrs: {
      "icon": "archive",
      "title": "Stores",
      "subtitle": "Manage stores",
      "width": "400",
      "closable": false,
      "toolbarItems": _vm.toolbarItems,
      "searchable": true
    }
  }, [_c('vc-table', {
    attrs: {
      "headers": _vm.headers,
      "items": _vm.items,
      "multiselect": true
    },
    on: {
      "itemClick": function ($event) {
        return _vm.openDetails($event);
      }
    },
    scopedSlots: _vm._u([{
      key: "item_actions",
      fn: function () {
        return [_c('vc-icon', {
          staticStyle: {
            "color": "#43b0e6"
          },
          attrs: {
            "icon": "ellipsis-v"
          }
        })];
      },
      proxy: true
    }, {
      key: "item_name",
      fn: function (itemData) {
        return [_c('div', {
          staticClass: "vc-flex vc-flex vc-flex-align_center vc-fill_width"
        }, [_c('vc-icon', {
          staticStyle: {
            "color": "#a5a5a5"
          },
          attrs: {
            "icon": itemData.item.icon,
            "size": "xl"
          }
        }), _vm._v(" "), _c('div', {
          staticClass: "\n            vc-font-size_m\n            vc-font-weight_bold\n            vc-flex-grow_1\n            vc-margin-horizontal_m\n          "
        }, [_vm._v("\n          " + _vm._s(itemData.item.name) + "\n        ")]), _vm._v(" "), _c('vc-icon', {
          staticStyle: {
            "color": "#a5a5a5"
          },
          attrs: {
            "icon": "chevron-right"
          }
        })], 1)];
      }
    }])
  })], 1);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

/* eslint-disable import/prefer-default-export */

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  StoreDetailsBlade: __vue_component__$1,
  StoreListBlade: __vue_component__
});

// Import vue components

const install = function installExtStore(Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
}; // Register VC Extensions


Object.entries(components).forEach(([componentName, component]) => {
  component.vcExtension();
}); // Create module definition for Vue.use()

export default install;
export { __vue_component__$1 as StoreDetailsBlade, __vue_component__ as StoreListBlade };
