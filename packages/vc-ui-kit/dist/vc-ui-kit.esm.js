//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$a = {
  props: {
    icon: {
      type: String
    },
    title: {
      type: String
    },
    subtitle: {
      type: String
    },
    width: {
      type: Number | String,
      default: 300
    },
    closable: {
      type: Boolean,
      default: true
    },
    toolbarItems: {
      type: Array
    },
    breadcrumbs: {
      type: Array
    },
    searchable: {
      type: Boolean
    },
    filterable: {
      type: Boolean
    }
  },

  data() {
    return {
      expanded: false,
      filterOpened: false
    };
  }

};

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
const __vue_script__$a = script$a;
/* template */

var __vue_render__$d = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-blade",
    class: {
      'vc-blade_expanded': _vm.expanded
    },
    style: {
      width: _vm.width + "px"
    }
  }, [_c('div', {
    staticClass: "vc-blade__topbar vc-flex-shrink_0"
  }, [_vm.expanded ? _c('div', {
    staticClass: "vc-blade__topbar-button",
    on: {
      "click": function ($event) {
        _vm.expanded = false;
      }
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "window-minimize",
      "size": "s"
    }
  })], 1) : _c('div', {
    staticClass: "vc-blade__topbar-button",
    on: {
      "click": function ($event) {
        _vm.expanded = true;
      }
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "window-maximize",
      "size": "s"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__topbar-button",
    class: {
      'vc-blade__topbar-button_disabled': !_vm.closable
    },
    on: {
      "click": function ($event) {
        _vm.closable && _vm.$emit('close');
      }
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "times"
    }
  })], 1)]), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__header vc-flex-shrink_0"
  }, [_c('div', {
    staticClass: "vc-blade__header-icon"
  }, [_c('vc-icon', {
    attrs: {
      "icon": _vm.icon,
      "size": "xxl"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__header-info"
  }, [_c('div', {
    staticClass: "vc-blade__header-title",
    class: {
      'vc-blade__header-title_only': !_vm.subtitle
    }
  }, [_vm._v("\n        " + _vm._s(_vm.$t(_vm.title)) + "\n      ")]), _vm._v(" "), _vm.subtitle ? _c('div', {
    staticClass: "vc-blade__header-subtitle"
  }, [_vm._v("\n        " + _vm._s(_vm.$t(_vm.subtitle)) + "\n      ")]) : _vm._e()])]), _vm._v(" "), _vm.toolbarItems ? _c('div', {
    staticClass: "vc-blade__toolbar vc-flex-shrink_0"
  }, [_vm._l(_vm.toolbarItems, function (item) {
    return [_c('div', {
      key: item.id,
      staticClass: "vc-blade__toolbar-item",
      class: {
        'vc-blade__toolbar-item_disabled': item.disabled
      }
    }, [_c('vc-icon', {
      attrs: {
        "icon": item.icon,
        "size": "ss"
      }
    }), _vm._v(" "), _c('div', {
      staticClass: "vc-blade__toolbar-item-title"
    }, [_vm._v(_vm._s(_vm.$t(item.title)))])], 1)];
  })], 2) : _vm._e(), _vm._v(" "), _vm.breadcrumbs ? _c('vc-breadcrumbs', {
    staticClass: "vc-padding_l vc-padding-bottom_none vc-flex-shrink_0",
    attrs: {
      "items": _vm.breadcrumbs
    }
  }) : _vm._e(), _vm._v(" "), _vm.searchable || _vm.filterable ? _c('div', {
    staticClass: "\n      vc-blade__searchbar\n      vc-flex\n      vc-flex-align_center\n      vc-fill_width\n      vc-padding_l\n      vc-flex-shrink_0\n    "
  }, [_vm.filterable ? _c('div', {
    staticClass: "vc-blade__searchbar-filter vc-margin-right_l"
  }, [_c('div', {
    staticClass: "\n          vc-blade__searchbar-filter-toggler\n          vc-flex vc-flex-align-center\n        ",
    on: {
      "click": function ($event) {
        _vm.filterOpened = !_vm.filterOpened;
      }
    }
  }, [_c('div', {
    staticClass: "vc-blade__searchbar-filter-label"
  }, [_vm._v("\n          " + _vm._s(_vm.$t("Select filter")) + "\n        ")]), _vm._v(" "), _c('vc-icon', {
    staticClass: "vc-blade__searchbar-filter-chevron vc-margin-left_s",
    attrs: {
      "icon": _vm.filterOpened ? 'caret-up' : 'caret-down',
      "size": "s"
    }
  })], 1), _vm._v(" "), _vm.filterOpened ? _c('div', {
    staticClass: "vc-blade__searchbar-filter-menu"
  }, [_c('div', {
    staticClass: "vc-blade__searchbar-filter-menu-item",
    on: {
      "click": function ($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 1\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-filter-menu-item",
    on: {
      "click": function ($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 2\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-filter-menu-item",
    on: {
      "click": function ($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 3\n        ")])]) : _vm._e()]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-search vc-flex-grow_1"
  }, [_c('vc-input', {
    attrs: {
      "placeholder": _vm.$t('Search keywords'),
      "clearable": "clearable"
    }
  })], 1), _vm._v(" "), _vm.filterable ? _c('div', {
    staticClass: "vc-blade__searchbar-counter vc-margin-left_l"
  }, [_c('span', {
    staticClass: "vc-blade__searchbar-counter-label"
  }, [_vm._v(_vm._s(_vm.$t("Count")) + ":")]), _vm._v(" "), _c('span', {
    staticClass: "vc-blade__searchbar-counter-value"
  }, [_vm._v("5")])]) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm._t("default")], 2);
};

var __vue_staticRenderFns__$d = [];
/* style */

const __vue_inject_styles__$d = undefined;
/* scoped */

const __vue_scope_id__$d = undefined;
/* module identifier */

const __vue_module_identifier__$d = undefined;
/* functional template */

const __vue_is_functional_template__$d = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$d = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$d,
  staticRenderFns: __vue_staticRenderFns__$d
}, __vue_inject_styles__$d, __vue_script__$a, __vue_scope_id__$d, __vue_is_functional_template__$d, __vue_module_identifier__$d, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$9 = {
  props: {
    items: {
      type: Array
    }
  }
};

/* script */
const __vue_script__$9 = script$9;
/* template */

var __vue_render__$c = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _vm.items ? _c('div', {
    staticClass: "vc-breadcrumbs vc-flex vc-flex-align_center vc-flex-nowrap"
  }, [_vm._l(_vm.items, function (item, i) {
    return [_c('div', {
      key: item.id,
      staticClass: "vc-breadcrumbs__item vc-flex vc-flex-align_center",
      class: {
        'vc-breadcrumbs__item_disabled': item.disabled,
        'vc-breadcrumbs__item_current': i === _vm.items.length - 1
      }
    }, [item.icon ? _c('vc-icon', {
      staticClass: "vc-breadcrumbs__item-icon",
      attrs: {
        "icon": item.icon,
        "size": "s"
      }
    }) : _vm._e(), _vm._v(" "), _c('div', {
      staticClass: "vc-breadcrumbs__item-title"
    }, [_vm._v(_vm._s(_vm.$t(item.title)))])], 1)];
  })], 2) : _vm._e();
};

var __vue_staticRenderFns__$c = [];
/* style */

const __vue_inject_styles__$c = undefined;
/* scoped */

const __vue_scope_id__$c = undefined;
/* module identifier */

const __vue_module_identifier__$c = undefined;
/* functional template */

const __vue_is_functional_template__$c = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$c = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$c,
  staticRenderFns: __vue_staticRenderFns__$c
}, __vue_inject_styles__$c, __vue_script__$9, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
var script$8 = {
  props: {
    icon: {
      type: String
    },
    title: {
      type: String
    },
    variant: {
      type: String,
      enum: ["primary", "secondary", "special"],
      default: "primary"
    },
    disabled: {
      type: Boolean
    },
    small: {
      type: Boolean,
      default: false
    }
  }
};

/* script */
const __vue_script__$8 = script$8;
/* template */

var __vue_render__$b = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-button",
    class: ["vc-button_" + _vm.variant, {
      'vc-button_disabled': _vm.disabled,
      'vc-button_small': _vm.small
    }]
  }, [_vm.icon ? _c('i', {
    staticClass: "vc-button__icon"
  }) : _vm._e(), _vm._v(" "), _vm.title ? _c('div', {
    staticClass: "vc-button__title"
  }, [_vm._v(_vm._s(_vm.title))]) : _vm._e()]);
};

var __vue_staticRenderFns__$b = [];
/* style */

const __vue_inject_styles__$b = undefined;
/* scoped */

const __vue_scope_id__$b = undefined;
/* module identifier */

const __vue_module_identifier__$b = undefined;
/* functional template */

const __vue_is_functional_template__$b = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$b = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$b,
  staticRenderFns: __vue_staticRenderFns__$b
}, __vue_inject_styles__$b, __vue_script__$8, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
var script$7 = {
  props: {
    checked: {
      type: Boolean
    }
  }
};

/* script */
const __vue_script__$7 = script$7;
/* template */

var __vue_render__$a = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  _vm._self._c || _h;

  return _vm._m(0);
};

var __vue_staticRenderFns__$a = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-checkbox"
  }, [_c('label', {
    staticClass: "vc-checkbox__label"
  }, [_c('input', {
    staticClass: "vc-checkbox__input",
    attrs: {
      "type": "checkbox"
    }
  }), _vm._v(" "), _c('span', {
    staticClass: "vc-checkbox__checkmark"
  })])]);
}];
/* style */

const __vue_inject_styles__$a = undefined;
/* scoped */

const __vue_scope_id__$a = undefined;
/* module identifier */

const __vue_module_identifier__$a = undefined;
/* functional template */

const __vue_is_functional_template__$a = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$a = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$a,
  staticRenderFns: __vue_staticRenderFns__$a
}, __vue_inject_styles__$a, __vue_script__$7, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$9 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-container"
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$9 = [];
/* style */

const __vue_inject_styles__$9 = undefined;
/* scoped */

const __vue_scope_id__$9 = undefined;
/* module identifier */

const __vue_module_identifier__$9 = undefined;
/* functional template */

const __vue_is_functional_template__$9 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$9 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$9,
  staticRenderFns: __vue_staticRenderFns__$9
}, __vue_inject_styles__$9, {}, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
var script$6 = {
  props: {
    sticky: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String
    },
    title: {
      type: String
    },
    to: {
      type: String
    }
  }
};

/* script */
const __vue_script__$6 = script$6;
/* template */

var __vue_render__$8 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c(_vm.to ? 'nuxt-link' : 'div', {
    tag: "component",
    staticClass: "vc-drawer-item",
    attrs: {
      "to": _vm.to
    },
    on: {
      "click": function ($event) {
        return _vm.$emit('click');
      }
    }
  }, [_c('div', {
    staticClass: "vc-drawer-item__handler",
    class: {
      'vc-drawer-item__handler_enabled': !_vm.sticky
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "ellipsis-v",
      "size": "m"
    }
  })], 1), _vm._v(" "), _vm.icon ? _c('div', {
    staticClass: "vc-drawer-item__icon"
  }, [_c('vc-icon', {
    attrs: {
      "icon": _vm.icon,
      "size": "m"
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "vc-drawer-item__title",
    attrs: {
      "title": _vm.title
    }
  }, [_vm._v(_vm._s(_vm.title))])]);
};

var __vue_staticRenderFns__$8 = [];
/* style */

const __vue_inject_styles__$8 = undefined;
/* scoped */

const __vue_scope_id__$8 = undefined;
/* module identifier */

const __vue_module_identifier__$8 = undefined;
/* functional template */

const __vue_is_functional_template__$8 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$8 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$8,
  staticRenderFns: __vue_staticRenderFns__$8
}, __vue_inject_styles__$8, __vue_script__$6, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$7 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-drawer-toggler",
    on: {
      "click": function ($event) {
        return _vm.$emit('click');
      }
    }
  }, [_c('vc-drawer-item', {
    attrs: {
      "sticky": "sticky",
      "icon": "bars"
    }
  })], 1);
};

var __vue_staticRenderFns__$7 = [];
/* style */

const __vue_inject_styles__$7 = undefined;
/* scoped */

const __vue_scope_id__$7 = undefined;
/* module identifier */

const __vue_module_identifier__$7 = undefined;
/* functional template */

const __vue_is_functional_template__$7 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$7 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$7,
  staticRenderFns: __vue_staticRenderFns__$7
}, __vue_inject_styles__$7, {}, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$5 = {
  props: {
    logo: {
      type: String
    },
    version: {
      type: String
    },
    items: {
      type: Array,
      default: []
    }
  },

  data() {
    return {
      collapsed: false
    };
  },

  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
      this.$emit(this.collapsed ? "collapse" : "expand");
    }

  }
};

/* script */
const __vue_script__$5 = script$5;
/* template */

var __vue_render__$6 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-drawer",
    class: {
      'vc-drawer_collapsed': _vm.collapsed
    }
  }, [_c('div', {
    staticClass: "vc-drawer__top"
  }, [_c('div', {
    staticClass: "vc-drawer__top-image",
    style: {
      'background-image': "url(" + _vm.logo + ")"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "vc-drawer__top-version"
  }, [_vm._v(_vm._s(_vm.version))])]), _vm._v(" "), _c('vc-drawer-toggler', {
    on: {
      "click": function ($event) {
        return _vm.toggleCollapsed();
      }
    }
  }), _vm._v(" "), _c('vc-container', {
    staticClass: "vc-drawer__content"
  }, [_c('vc-drawer-item', {
    attrs: {
      "icon": "home",
      "to": "/",
      "sticky": "sticky",
      "title": _vm.$t('Home')
    }
  }), _vm._v(" "), _vm._l(_vm.items, function (item) {
    return _c('vc-drawer-item', {
      key: item.id,
      attrs: {
        "icon": item.icon,
        "to": item.to,
        "title": _vm.$t(item.title)
      }
    });
  }), _vm._v(" "), _c('vc-drawer-item', {
    attrs: {
      "icon": "ellipsis-h",
      "sticky": "sticky",
      "title": _vm.$t('More')
    }
  })], 2)], 1);
};

var __vue_staticRenderFns__$6 = [];
/* style */

const __vue_inject_styles__$6 = undefined;
/* scoped */

const __vue_scope_id__$6 = undefined;
/* module identifier */

const __vue_module_identifier__$6 = undefined;
/* functional template */

const __vue_is_functional_template__$6 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$6 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$6,
  staticRenderFns: __vue_staticRenderFns__$6
}, __vue_inject_styles__$6, __vue_script__$5, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);

//
//
//
//
var script$4 = {
  props: {
    icon: {
      type: String,
      default: "square-full"
    },
    family: {
      type: String,
      default: "solid"
    },
    size: {
      type: String,
      default: "m"
    }
  }
};

/* script */
const __vue_script__$4 = script$4;
/* template */

var __vue_render__$5 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('i', {
    class: "vc-icon vc-icon_" + _vm.size + " fa" + _vm.family.toLowerCase()[0] + " fa-" + _vm.icon.toLowerCase()
  });
};

var __vue_staticRenderFns__$5 = [];
/* style */

const __vue_inject_styles__$5 = undefined;
/* scoped */

const __vue_scope_id__$5 = undefined;
/* module identifier */

const __vue_module_identifier__$5 = undefined;
/* functional template */

const __vue_is_functional_template__$5 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$5 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$5,
  staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, __vue_script__$4, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$3 = {
  props: {
    placeholder: {
      type: String
    },
    value: {
      type: String
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      internalValue: this.value
    };
  }

};

/* script */
const __vue_script__$3 = script$3;
/* template */

var __vue_render__$4 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-input vc-flex vc-flex-align_stretch",
    class: {
      'vc-input_clearable': _vm.clearable
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.internalValue,
      expression: "internalValue"
    }],
    staticClass: "vc-input__field vc-flex-grow_1 vc-padding-left_m",
    attrs: {
      "placeholder": _vm.placeholder
    },
    domProps: {
      "value": _vm.internalValue
    },
    on: {
      "input": function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.internalValue = $event.target.value;
      }
    }
  }), _vm._v(" "), _vm.clearable ? _c('div', {
    staticClass: "vc-input__clear vc-padding-horizontal_m vc-flex vc-flex-align_center",
    on: {
      "click": function ($event) {
        _vm.internalValue = '';
      }
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "times"
    }
  })], 1) : _vm._e()]);
};

var __vue_staticRenderFns__$4 = [];
/* style */

const __vue_inject_styles__$4 = undefined;
/* scoped */

const __vue_scope_id__$4 = undefined;
/* module identifier */

const __vue_module_identifier__$4 = undefined;
/* functional template */

const __vue_is_functional_template__$4 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$4 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$4,
  staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$3, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$2 = {
  props: {
    toolbarItems: {
      type: Array
    },
    account: {
      type: Object
    }
  },

  data() {
    return {
      accountMenuVisible: false
    };
  }

};

/* script */
const __vue_script__$2 = script$2;
/* template */

var __vue_render__$3 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-layout vc-flex vc-fill_all"
  }, [_c('div', {
    staticClass: "vc-fill_height"
  }, [_vm._t("left")], 2), _vm._v(" "), _c('div', {
    staticClass: "vc-flex vc-flex-grow_1 vc-flex-column"
  }, [_c('div', {
    staticClass: "vc-layout__topbar vc-flex vc-fill_width vc-flex-align_stretch vc-flex-shrink_0"
  }, [_vm.$slots['banner'] ? _c('div', {
    staticClass: "vc-layout__topbar-banner"
  }, [_vm._t("banner")], 2) : _vm._e(), _vm._v(" "), _vm.$slots['notification'] ? _c('div', {
    staticClass: "vc-layout__topbar-notification"
  }, [_vm._t("notification")], 2) : _c('vc-spacer'), _vm._v(" "), _vm.toolbarItems ? _c('div', {
    staticClass: "vc-layout__topbar-toolbar vc-flex"
  }, _vm._l(_vm.toolbarItems, function (item) {
    return _c('div', {
      key: item.id,
      staticClass: "vc-layout__topbar-toolbar-item vc-flex vc-flex-align_center vc-fill_height vc-flex-justify_center",
      class: {
        'vc-layout__topbar-toolbar-item_accent': item.accent
      },
      attrs: {
        "title": _vm.$t(item.title)
      },
      on: {
        "click": function ($event) {
          item.hasOwnProperty('onClick') ? item.onClick() : null;
        }
      }
    }, [_c('vc-icon', {
      attrs: {
        "icon": typeof item.icon === 'function' ? item.icon() : item.icon,
        "size": "xl"
      }
    })], 1);
  }), 0) : _vm._e(), _vm._v(" "), _vm.account ? _c('div', {
    staticClass: "vc-layout__topbar-account vc-flex vc-flex-shrink_0 vc-flex-align_center",
    class: {
      'vc-layout__topbar-account_active': _vm.accountMenuVisible
    },
    on: {
      "click": function ($event) {
        _vm.accountMenuVisible = !_vm.accountMenuVisible;
      }
    }
  }, [_c('div', {
    staticClass: "vc-layout__topbar-account-avatar",
    style: {
      'background-image': "url(" + _vm.account.avatar + ")"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "vc-flex-grow_1 vc-margin-left_m"
  }, [_c('div', {
    staticClass: "vc-layout__topbar-account-name"
  }, [_vm._v(_vm._s(_vm.account.name))]), _vm._v(" "), _c('div', {
    staticClass: "vc-layout__topbar-account-role"
  }, [_vm._v(_vm._s(_vm.account.role))])]), _vm._v(" "), _c('div', {
    staticClass: "vc-layout__topbar-account-chevron"
  }, [_c('vc-icon', {
    attrs: {
      "icon": "chevron-down",
      "size": "xl"
    }
  })], 1), _vm._v(" "), _vm.accountMenuVisible ? _c('div', {
    staticClass: "vc-layout__topbar-account-menu",
    on: {
      "click": function ($event) {
        $event.stopPropagation();
      }
    }
  }, [_c('div', {
    staticClass: "vc-layout__topbar-account-menu-item"
  }, [_vm._v(_vm._s(_vm.$t("Profile")))]), _vm._v(" "), _c('div', {
    staticClass: "vc-layout__topbar-account-menu-item"
  }, [_vm._v(_vm._s(_vm.$t("Log Out")))])]) : _vm._e()]) : _vm._e()], 1), _vm._v(" "), _c('div', {
    staticClass: "vc-layout__content vc-flex vc-flex-grow_1"
  }, [_vm._t("default")], 2)])]);
};

var __vue_staticRenderFns__$3 = [];
/* style */

const __vue_inject_styles__$3 = undefined;
/* scoped */

const __vue_scope_id__$3 = undefined;
/* module identifier */

const __vue_module_identifier__$3 = undefined;
/* functional template */

const __vue_is_functional_template__$3 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$3 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$3,
  staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$2, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$1 = {
  props: {
    to: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$2 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('nuxt-link', {
    staticClass: "vc-link",
    class: {
      'vc-link_disabled': _vm.disabled
    },
    attrs: {
      "to": _vm.to
    }
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$2 = [];
/* style */

const __vue_inject_styles__$2 = undefined;
/* scoped */

const __vue_scope_id__$2 = undefined;
/* module identifier */

const __vue_module_identifier__$2 = undefined;
/* functional template */

const __vue_is_functional_template__$2 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$2 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$1, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-spacer"
  });
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
}, __vue_inject_styles__$1, {}, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
  props: {
    headers: {
      type: Array
    },
    items: {
      type: Array
    },
    sortable: {
      type: Array
    },
    multiselect: {
      type: Boolean
    }
  }
};

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-table-wrapper"
  }, [_c('table', {
    staticClass: "vc-table vc-fill_width",
    class: {
      'vc-table_empty': !_vm.items || !_vm.items.length,
      'vc-table_multiselect': _vm.multiselect
    }
  }, [_vm.headers ? _c('thead', {
    staticClass: "vc-table__header"
  }, [_c('tr', {
    staticClass: "vc-table__header-row"
  }, [_vm.multiselect ? _c('td', {
    staticClass: "vc-table__header-cell",
    attrs: {
      "width": "32"
    }
  }, [_c('div', {
    staticClass: "vc-flex vc-flex-justify_center vc-flex-align_center"
  }, [_c('vc-checkbox')], 1)]) : _vm._e(), _vm._v(" "), _vm._l(_vm.headers, function (item) {
    return _c('td', {
      key: item.id,
      staticClass: "vc-table__header-cell vc-padding-horizontal_m",
      attrs: {
        "width": item.width
      }
    }, [_c('div', {
      staticClass: "vc-flex vc-flex-align_center vc-flex-nowrap",
      class: "vc-flex-justify_" + (item.align || 'start')
    }, [_c('div', [_vm._t("header_" + item.id, [_vm._v(_vm._s(item.title))])], 2), _vm._v(" "), item.sortable ? _c('div', {
      staticClass: "vc-table__header-cell_sort vc-margin-left_xs"
    }, [_c('vc-icon', {
      attrs: {
        "size": "xs",
        "icon": "caret-up"
      }
    })], 1) : _vm._e()])]);
  })], 2)]) : _vm._e(), _vm._v(" "), _vm.items ? _c('tbody', {
    staticClass: "vc-table__body"
  }, _vm._l(_vm.items, function (item) {
    return _c('tr', {
      key: item.id,
      staticClass: "vc-table__body-row",
      on: {
        "click": function ($event) {
          return _vm.$emit('itemClick', item);
        }
      }
    }, [_vm.multiselect ? _c('td', {
      staticClass: "vc-table__body-cell vc-table__body-cell_bordered",
      attrs: {
        "width": "20"
      }
    }, [_c('div', {
      staticClass: "vc-flex vc-flex-justify_center vc-flex-align_center"
    }, [_c('vc-checkbox')], 1)]) : _vm._e(), _vm._v(" "), _vm._l(_vm.headers, function (cell) {
      return _c('td', {
        key: item.id + "_" + cell.id,
        staticClass: "vc-table__body-cell vc-padding-horizontal_m",
        class: cell.class,
        attrs: {
          "width": cell.width
        }
      }, [_c('div', {
        staticClass: "vc-flex vc-flex-align_center"
      }, [_vm._t("item_" + cell.id, [_vm._v(_vm._s(item[cell.id]))], {
        "item": item
      })], 2)]);
    })], 2);
  }), 0) : _vm._e()])]);
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
  VcBlade: __vue_component__$d,
  VcBreadcrumbs: __vue_component__$c,
  VcButton: __vue_component__$b,
  VcCheckbox: __vue_component__$a,
  VcContainer: __vue_component__$9,
  VcDrawerItem: __vue_component__$8,
  VcDrawerToggler: __vue_component__$7,
  VcDrawer: __vue_component__$6,
  VcIcon: __vue_component__$5,
  VcInput: __vue_component__$4,
  VcLayout: __vue_component__$3,
  VcLink: __vue_component__$2,
  VcSpacer: __vue_component__$1,
  VcTable: __vue_component__
});

// Import vue components

const install = function installVcUiKit(Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()

export default install;
export { __vue_component__$d as VcBlade, __vue_component__$c as VcBreadcrumbs, __vue_component__$b as VcButton, __vue_component__$a as VcCheckbox, __vue_component__$9 as VcContainer, __vue_component__$6 as VcDrawer, __vue_component__$8 as VcDrawerItem, __vue_component__$7 as VcDrawerToggler, __vue_component__$5 as VcIcon, __vue_component__$4 as VcInput, __vue_component__$3 as VcLayout, __vue_component__$2 as VcLink, __vue_component__$1 as VcSpacer, __vue_component__ as VcTable };
