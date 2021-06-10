'use strict';function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}//
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
  data: function data() {
    return {
      expanded: false,
      filterOpened: false
    };
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}/* script */
var __vue_script__$a = script$a;
/* template */

var __vue_render__$d = function __vue_render__() {
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
  }, [_vm._ssrNode("<div class=\"vc-blade__topbar vc-flex-shrink_0\">", "</div>", [_vm.expanded ? _vm._ssrNode("<div class=\"vc-blade__topbar-button\">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": "window-minimize",
      "size": "s"
    }
  })], 1) : _vm._ssrNode("<div class=\"vc-blade__topbar-button\">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": "window-maximize",
      "size": "s"
    }
  })], 1), _vm._ssrNode(" "), _vm._ssrNode("<div" + _vm._ssrClass("vc-blade__topbar-button", {
    'vc-blade__topbar-button_disabled': !_vm.closable
  }) + ">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": "times"
    }
  })], 1)], 2), _vm._ssrNode(" "), _vm._ssrNode("<div class=\"vc-blade__header vc-flex-shrink_0\">", "</div>", [_vm._ssrNode("<div class=\"vc-blade__header-icon\">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": _vm.icon,
      "size": "xxl"
    }
  })], 1), _vm._ssrNode(" <div class=\"vc-blade__header-info\"><div" + _vm._ssrClass("vc-blade__header-title", {
    'vc-blade__header-title_only': !_vm.subtitle
  }) + ">" + _vm._ssrEscape("\n        " + _vm._s(_vm.$t(_vm.title)) + "\n      ") + "</div> " + (_vm.subtitle ? "<div class=\"vc-blade__header-subtitle\">" + _vm._ssrEscape("\n        " + _vm._s(_vm.$t(_vm.subtitle)) + "\n      ") + "</div>" : "<!---->") + "</div>")], 2), _vm._ssrNode(" "), _vm.toolbarItems ? _vm._ssrNode("<div class=\"vc-blade__toolbar vc-flex-shrink_0\">", "</div>", [_vm._l(_vm.toolbarItems, function (item) {
    return [_vm._ssrNode("<div" + _vm._ssrClass("vc-blade__toolbar-item", {
      'vc-blade__toolbar-item_disabled': item.disabled
    }) + ">", "</div>", [_c('vc-icon', {
      attrs: {
        "icon": item.icon,
        "size": "ss"
      }
    }), _vm._ssrNode(" <div class=\"vc-blade__toolbar-item-title\">" + _vm._ssrEscape(_vm._s(_vm.$t(item.title))) + "</div>")], 2)];
  })], 2) : _vm._e(), _vm._ssrNode(" "), _vm.breadcrumbs ? _c('vc-breadcrumbs', {
    staticClass: "vc-padding_l vc-padding-bottom_none vc-flex-shrink_0",
    attrs: {
      "items": _vm.breadcrumbs
    }
  }) : _vm._e(), _vm._ssrNode(" "), _vm.searchable || _vm.filterable ? _vm._ssrNode("<div class=\"\n      vc-blade__searchbar\n      vc-flex\n      vc-flex-align_center\n      vc-fill_width\n      vc-padding_l\n      vc-flex-shrink_0\n    \">", "</div>", [_vm.filterable ? _vm._ssrNode("<div class=\"vc-blade__searchbar-filter vc-margin-right_l\">", "</div>", [_vm._ssrNode("<div class=\"\n          vc-blade__searchbar-filter-toggler\n          vc-flex vc-flex-align-center\n        \">", "</div>", [_vm._ssrNode("<div class=\"vc-blade__searchbar-filter-label\">" + _vm._ssrEscape("\n          " + _vm._s(_vm.$t("Select filter")) + "\n        ") + "</div> "), _c('vc-icon', {
    staticClass: "vc-blade__searchbar-filter-chevron vc-margin-left_s",
    attrs: {
      "icon": _vm.filterOpened ? 'caret-up' : 'caret-down',
      "size": "s"
    }
  })], 2), _vm._ssrNode(" " + (_vm.filterOpened ? "<div class=\"vc-blade__searchbar-filter-menu\"><div class=\"vc-blade__searchbar-filter-menu-item\">\n          Item 1\n        </div> <div class=\"vc-blade__searchbar-filter-menu-item\">\n          Item 2\n        </div> <div class=\"vc-blade__searchbar-filter-menu-item\">\n          Item 3\n        </div></div>" : "<!---->"))], 2) : _vm._e(), _vm._ssrNode(" "), _vm._ssrNode("<div class=\"vc-blade__searchbar-search vc-flex-grow_1\">", "</div>", [_c('vc-input', {
    attrs: {
      "placeholder": _vm.$t('Search keywords'),
      "clearable": "clearable"
    }
  })], 1), _vm._ssrNode(" " + (_vm.filterable ? "<div class=\"vc-blade__searchbar-counter vc-margin-left_l\"><span class=\"vc-blade__searchbar-counter-label\">" + _vm._ssrEscape(_vm._s(_vm.$t("Count")) + ":") + "</span> <span class=\"vc-blade__searchbar-counter-value\">5</span></div>" : "<!---->"))], 2) : _vm._e(), _vm._ssrNode(" "), _vm._t("default")], 2);
};

var __vue_staticRenderFns__$d = [];
/* style */

var __vue_inject_styles__$d = undefined;
/* scoped */

var __vue_scope_id__$d = undefined;
/* module identifier */

var __vue_module_identifier__$d = "data-v-2f85794e";
/* functional template */

var __vue_is_functional_template__$d = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$d = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$d,
  staticRenderFns: __vue_staticRenderFns__$d
}, __vue_inject_styles__$d, __vue_script__$a, __vue_scope_id__$d, __vue_is_functional_template__$d, __vue_module_identifier__$d, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$9 = script$9;
/* template */

var __vue_render__$c = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _vm.items ? _c('div', {
    staticClass: "vc-breadcrumbs vc-flex vc-flex-align_center vc-flex-nowrap"
  }, [_vm._l(_vm.items, function (item, i) {
    return [_vm._ssrNode("<div" + _vm._ssrClass("vc-breadcrumbs__item vc-flex vc-flex-align_center", {
      'vc-breadcrumbs__item_disabled': item.disabled,
      'vc-breadcrumbs__item_current': i === _vm.items.length - 1
    }) + ">", "</div>", [item.icon ? _c('vc-icon', {
      staticClass: "vc-breadcrumbs__item-icon",
      attrs: {
        "icon": item.icon,
        "size": "s"
      }
    }) : _vm._e(), _vm._ssrNode(" <div class=\"vc-breadcrumbs__item-title\">" + _vm._ssrEscape(_vm._s(_vm.$t(item.title))) + "</div>")], 2)];
  })], 2) : _vm._e();
};

var __vue_staticRenderFns__$c = [];
/* style */

var __vue_inject_styles__$c = undefined;
/* scoped */

var __vue_scope_id__$c = undefined;
/* module identifier */

var __vue_module_identifier__$c = "data-v-34792b04";
/* functional template */

var __vue_is_functional_template__$c = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$c = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$c,
  staticRenderFns: __vue_staticRenderFns__$c
}, __vue_inject_styles__$c, __vue_script__$9, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$8 = script$8;
/* template */

var __vue_render__$b = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-button",
    class: ["vc-button_" + _vm.variant, {
      'vc-button_disabled': _vm.disabled,
      'vc-button_small': _vm.small
    }]
  }, [_vm._ssrNode((_vm.icon ? "<i class=\"vc-button__icon\"></i>" : "<!---->") + " " + (_vm.title ? "<div class=\"vc-button__title\">" + _vm._ssrEscape(_vm._s(_vm.title)) + "</div>" : "<!---->"))]);
};

var __vue_staticRenderFns__$b = [];
/* style */

var __vue_inject_styles__$b = undefined;
/* scoped */

var __vue_scope_id__$b = undefined;
/* module identifier */

var __vue_module_identifier__$b = "data-v-c94e5640";
/* functional template */

var __vue_is_functional_template__$b = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$b = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$b,
  staticRenderFns: __vue_staticRenderFns__$b
}, __vue_inject_styles__$b, __vue_script__$8, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$7 = script$7;
/* template */

var __vue_render__$a = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-checkbox"
  }, [_vm._ssrNode("<label class=\"vc-checkbox__label\"><input type=\"checkbox\" class=\"vc-checkbox__input\"> <span class=\"vc-checkbox__checkmark\"></span></label>")]);
};

var __vue_staticRenderFns__$a = [];
/* style */

var __vue_inject_styles__$a = undefined;
/* scoped */

var __vue_scope_id__$a = undefined;
/* module identifier */

var __vue_module_identifier__$a = "data-v-4aca5a36";
/* functional template */

var __vue_is_functional_template__$a = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$a = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$a,
  staticRenderFns: __vue_staticRenderFns__$a
}, __vue_inject_styles__$a, __vue_script__$7, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);/* script */

/* template */
var __vue_render__$9 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-container"
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$9 = [];
/* style */

var __vue_inject_styles__$9 = undefined;
/* scoped */

var __vue_scope_id__$9 = undefined;
/* module identifier */

var __vue_module_identifier__$9 = "data-v-0f3b297a";
/* functional template */

var __vue_is_functional_template__$9 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$9 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$9,
  staticRenderFns: __vue_staticRenderFns__$9
}, __vue_inject_styles__$9, {}, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$6 = script$6;
/* template */

var __vue_render__$8 = function __vue_render__() {
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
      "click": function click($event) {
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

var __vue_inject_styles__$8 = undefined;
/* scoped */

var __vue_scope_id__$8 = undefined;
/* module identifier */

var __vue_module_identifier__$8 = "data-v-2ee461be";
/* functional template */

var __vue_is_functional_template__$8 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$8 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$8,
  staticRenderFns: __vue_staticRenderFns__$8
}, __vue_inject_styles__$8, __vue_script__$6, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);/* script */

/* template */
var __vue_render__$7 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-drawer-toggler",
    on: {
      "click": function click($event) {
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

var __vue_inject_styles__$7 = undefined;
/* scoped */

var __vue_scope_id__$7 = undefined;
/* module identifier */

var __vue_module_identifier__$7 = "data-v-5ddca594";
/* functional template */

var __vue_is_functional_template__$7 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$7 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$7,
  staticRenderFns: __vue_staticRenderFns__$7
}, __vue_inject_styles__$7, {}, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);//
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
  data: function data() {
    return {
      collapsed: false
    };
  },
  methods: {
    toggleCollapsed: function toggleCollapsed() {
      this.collapsed = !this.collapsed;
      this.$emit(this.collapsed ? "collapse" : "expand");
    }
  }
};/* script */
var __vue_script__$5 = script$5;
/* template */

var __vue_render__$6 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-drawer",
    class: {
      'vc-drawer_collapsed': _vm.collapsed
    }
  }, [_vm._ssrNode("<div class=\"vc-drawer__top\"><div class=\"vc-drawer__top-image\"" + _vm._ssrStyle(null, {
    'background-image': "url(" + _vm.logo + ")"
  }, null) + "></div> <div class=\"vc-drawer__top-version\">" + _vm._ssrEscape(_vm._s(_vm.version)) + "</div></div> "), _c('vc-drawer-toggler', {
    on: {
      "click": function click($event) {
        return _vm.toggleCollapsed();
      }
    }
  }), _vm._ssrNode(" "), _c('vc-container', {
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
  })], 2)], 2);
};

var __vue_staticRenderFns__$6 = [];
/* style */

var __vue_inject_styles__$6 = undefined;
/* scoped */

var __vue_scope_id__$6 = undefined;
/* module identifier */

var __vue_module_identifier__$6 = "data-v-429006e3";
/* functional template */

var __vue_is_functional_template__$6 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$6 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$6,
  staticRenderFns: __vue_staticRenderFns__$6
}, __vue_inject_styles__$6, __vue_script__$5, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$4 = script$4;
/* template */

var __vue_render__$5 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('i', {
    class: "vc-icon vc-icon_" + _vm.size + " fa" + _vm.family.toLowerCase()[0] + " fa-" + _vm.icon.toLowerCase()
  }, []);
};

var __vue_staticRenderFns__$5 = [];
/* style */

var __vue_inject_styles__$5 = undefined;
/* scoped */

var __vue_scope_id__$5 = undefined;
/* module identifier */

var __vue_module_identifier__$5 = "data-v-74b82317";
/* functional template */

var __vue_is_functional_template__$5 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$5 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$5,
  staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, __vue_script__$4, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);//
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
  data: function data() {
    return {
      internalValue: this.value
    };
  }
};/* script */
var __vue_script__$3 = script$3;
/* template */

var __vue_render__$4 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-input vc-flex vc-flex-align_stretch",
    class: {
      'vc-input_clearable': _vm.clearable
    }
  }, [_vm._ssrNode("<input" + _vm._ssrAttr("placeholder", _vm.placeholder) + _vm._ssrAttr("value", _vm.internalValue) + " class=\"vc-input__field vc-flex-grow_1 vc-padding-left_m\"> "), _vm.clearable ? _vm._ssrNode("<div class=\"vc-input__clear vc-padding-horizontal_m vc-flex vc-flex-align_center\">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": "times"
    }
  })], 1) : _vm._e()], 2);
};

var __vue_staticRenderFns__$4 = [];
/* style */

var __vue_inject_styles__$4 = undefined;
/* scoped */

var __vue_scope_id__$4 = undefined;
/* module identifier */

var __vue_module_identifier__$4 = "data-v-1e12ceae";
/* functional template */

var __vue_is_functional_template__$4 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$4 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$4,
  staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$3, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);//
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
  data: function data() {
    return {
      accountMenuVisible: false
    };
  }
};/* script */
var __vue_script__$2 = script$2;
/* template */

var __vue_render__$3 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-layout vc-flex vc-fill_all"
  }, [_vm._ssrNode("<div class=\"vc-fill_height\">", "</div>", [_vm._t("left")], 2), _vm._ssrNode(" "), _vm._ssrNode("<div class=\"vc-flex vc-flex-grow_1 vc-flex-column\">", "</div>", [_vm._ssrNode("<div class=\"vc-layout__topbar vc-flex vc-fill_width vc-flex-align_stretch vc-flex-shrink_0\">", "</div>", [_vm.$slots['banner'] ? _vm._ssrNode("<div class=\"vc-layout__topbar-banner\">", "</div>", [_vm._t("banner")], 2) : _vm._e(), _vm._ssrNode(" "), _vm.$slots['notification'] ? _vm._ssrNode("<div class=\"vc-layout__topbar-notification\">", "</div>", [_vm._t("notification")], 2) : _c('vc-spacer'), _vm._ssrNode(" "), _vm.toolbarItems ? _vm._ssrNode("<div class=\"vc-layout__topbar-toolbar vc-flex\">", "</div>", _vm._l(_vm.toolbarItems, function (item) {
    return _vm._ssrNode("<div" + _vm._ssrAttr("title", _vm.$t(item.title)) + _vm._ssrClass("vc-layout__topbar-toolbar-item vc-flex vc-flex-align_center vc-fill_height vc-flex-justify_center", {
      'vc-layout__topbar-toolbar-item_accent': item.accent
    }) + ">", "</div>", [_c('vc-icon', {
      attrs: {
        "icon": typeof item.icon === 'function' ? item.icon() : item.icon,
        "size": "xl"
      }
    })], 1);
  }), 0) : _vm._e(), _vm._ssrNode(" "), _vm.account ? _vm._ssrNode("<div" + _vm._ssrClass("vc-layout__topbar-account vc-flex vc-flex-shrink_0 vc-flex-align_center", {
    'vc-layout__topbar-account_active': _vm.accountMenuVisible
  }) + ">", "</div>", [_vm._ssrNode("<div class=\"vc-layout__topbar-account-avatar\"" + _vm._ssrStyle(null, {
    'background-image': "url(" + _vm.account.avatar + ")"
  }, null) + "></div> <div class=\"vc-flex-grow_1 vc-margin-left_m\"><div class=\"vc-layout__topbar-account-name\">" + _vm._ssrEscape(_vm._s(_vm.account.name)) + "</div> <div class=\"vc-layout__topbar-account-role\">" + _vm._ssrEscape(_vm._s(_vm.account.role)) + "</div></div> "), _vm._ssrNode("<div class=\"vc-layout__topbar-account-chevron\">", "</div>", [_c('vc-icon', {
    attrs: {
      "icon": "chevron-down",
      "size": "xl"
    }
  })], 1), _vm._ssrNode(" " + (_vm.accountMenuVisible ? "<div class=\"vc-layout__topbar-account-menu\"><div class=\"vc-layout__topbar-account-menu-item\">" + _vm._ssrEscape(_vm._s(_vm.$t("Profile"))) + "</div> <div class=\"vc-layout__topbar-account-menu-item\">" + _vm._ssrEscape(_vm._s(_vm.$t("Log Out"))) + "</div></div>" : "<!---->"))], 2) : _vm._e()], 2), _vm._ssrNode(" "), _vm._ssrNode("<div class=\"vc-layout__content vc-flex vc-flex-grow_1\">", "</div>", [_vm._t("default")], 2)], 2)], 2);
};

var __vue_staticRenderFns__$3 = [];
/* style */

var __vue_inject_styles__$3 = undefined;
/* scoped */

var __vue_scope_id__$3 = undefined;
/* module identifier */

var __vue_module_identifier__$3 = "data-v-2759298c";
/* functional template */

var __vue_is_functional_template__$3 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$3 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$3,
  staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$2, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__$1 = script$1;
/* template */

var __vue_render__$2 = function __vue_render__() {
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

var __vue_inject_styles__$2 = undefined;
/* scoped */

var __vue_scope_id__$2 = undefined;
/* module identifier */

var __vue_module_identifier__$2 = "data-v-7132af8a";
/* functional template */

var __vue_is_functional_template__$2 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$2 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$1, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);/* script */

/* template */
var __vue_render__$1 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-spacer"
  }, []);
};

var __vue_staticRenderFns__$1 = [];
/* style */

var __vue_inject_styles__$1 = undefined;
/* scoped */

var __vue_scope_id__$1 = undefined;
/* module identifier */

var __vue_module_identifier__$1 = "data-v-6831c661";
/* functional template */

var __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, {}, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);//
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
};/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vc-table-wrapper"
  }, [_vm._ssrNode("<table" + _vm._ssrClass("vc-table vc-fill_width", {
    'vc-table_empty': !_vm.items || !_vm.items.length,
    'vc-table_multiselect': _vm.multiselect
  }) + ">", "</table>", [_vm.headers ? _vm._ssrNode("<thead class=\"vc-table__header\">", "</thead>", [_vm._ssrNode("<tr class=\"vc-table__header-row\">", "</tr>", [_vm.multiselect ? _vm._ssrNode("<td width=\"32\" class=\"vc-table__header-cell\">", "</td>", [_vm._ssrNode("<div class=\"vc-flex vc-flex-justify_center vc-flex-align_center\">", "</div>", [_c('vc-checkbox')], 1)]) : _vm._e(), _vm._ssrNode(" "), _vm._l(_vm.headers, function (item) {
    return _vm._ssrNode("<td" + _vm._ssrAttr("width", item.width) + " class=\"vc-table__header-cell vc-padding-horizontal_m\">", "</td>", [_vm._ssrNode("<div" + _vm._ssrClass("vc-flex vc-flex-align_center vc-flex-nowrap", "vc-flex-justify_" + (item.align || 'start')) + ">", "</div>", [_vm._ssrNode("<div>", "</div>", [_vm._t("header_" + item.id, [_vm._v(_vm._s(item.title))])], 2), _vm._ssrNode(" "), item.sortable ? _vm._ssrNode("<div class=\"vc-table__header-cell_sort vc-margin-left_xs\">", "</div>", [_c('vc-icon', {
      attrs: {
        "size": "xs",
        "icon": "caret-up"
      }
    })], 1) : _vm._e()], 2)]);
  })], 2)]) : _vm._e(), _vm._ssrNode(" "), _vm.items ? _vm._ssrNode("<tbody class=\"vc-table__body\">", "</tbody>", _vm._l(_vm.items, function (item) {
    return _vm._ssrNode("<tr class=\"vc-table__body-row\">", "</tr>", [_vm.multiselect ? _vm._ssrNode("<td width=\"20\" class=\"vc-table__body-cell vc-table__body-cell_bordered\">", "</td>", [_vm._ssrNode("<div class=\"vc-flex vc-flex-justify_center vc-flex-align_center\">", "</div>", [_c('vc-checkbox')], 1)]) : _vm._e(), _vm._ssrNode(" "), _vm._l(_vm.headers, function (cell) {
      return _vm._ssrNode("<td" + _vm._ssrAttr("width", cell.width) + _vm._ssrClass("vc-table__body-cell vc-padding-horizontal_m", cell.class) + ">", "</td>", [_vm._ssrNode("<div class=\"vc-flex vc-flex-align_center\">", "</div>", [_vm._t("item_" + cell.id, [_vm._v(_vm._s(item[cell.id]))], {
        "item": item
      })], 2)]);
    })], 2);
  }), 0) : _vm._e()], 2)]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-2726585e";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);/* eslint-disable import/prefer-default-export */var components$1=/*#__PURE__*/Object.freeze({__proto__:null,VcBlade: __vue_component__$d,VcBreadcrumbs: __vue_component__$c,VcButton: __vue_component__$b,VcCheckbox: __vue_component__$a,VcContainer: __vue_component__$9,VcDrawerItem: __vue_component__$8,VcDrawerToggler: __vue_component__$7,VcDrawer: __vue_component__$6,VcIcon: __vue_component__$5,VcInput: __vue_component__$4,VcLayout: __vue_component__$3,VcLink: __vue_component__$2,VcSpacer: __vue_component__$1,VcTable: __vue_component__});var install = function installVcUiKit(Vue) {
  Object.entries(components$1).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()
var components=/*#__PURE__*/Object.freeze({__proto__:null,'default': install,VcBlade: __vue_component__$d,VcBreadcrumbs: __vue_component__$c,VcButton: __vue_component__$b,VcCheckbox: __vue_component__$a,VcContainer: __vue_component__$9,VcDrawerItem: __vue_component__$8,VcDrawerToggler: __vue_component__$7,VcDrawer: __vue_component__$6,VcIcon: __vue_component__$5,VcInput: __vue_component__$4,VcLayout: __vue_component__$3,VcLink: __vue_component__$2,VcSpacer: __vue_component__$1,VcTable: __vue_component__});// only expose one global var, with component exports exposed as properties of
// that global var (eg. plugin.component)

Object.entries(components).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      componentName = _ref2[0],
      component = _ref2[1];

  if (componentName !== 'default') {
    install[componentName] = component;
  }
});module.exports=install;