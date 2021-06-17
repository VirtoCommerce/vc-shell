'use strict';var Vue=require('vue');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var Vue__default=/*#__PURE__*/_interopDefaultLegacy(Vue);function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _slicedToArray(arr, i) {
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

var script$b = {
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

function normalizeComponent$1(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function (context) {
      style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}
/* script */


var __vue_script__$b = script$b;
/* template */

var __vue_render__$d = function __vue_render__$d() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('i', {
    class: "vc-icon vc-icon_" + _vm.size + " fa" + _vm.family.toLowerCase()[0] + " fa-" + _vm.icon.toLowerCase()
  });
};

var __vue_staticRenderFns__$d = [];
/* style */

var __vue_inject_styles__$d = undefined;
/* scoped */

var __vue_scope_id__$d = undefined;
/* module identifier */

var __vue_module_identifier__$d = undefined;
/* functional template */

var __vue_is_functional_template__$d = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$d = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$d,
  staticRenderFns: __vue_staticRenderFns__$d
}, __vue_inject_styles__$d, __vue_script__$b, __vue_scope_id__$d, __vue_is_functional_template__$d, __vue_module_identifier__$d, false, undefined, undefined, undefined); //


var script$a = {
  components: {
    VcIcon: __vue_component__$d
  },
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
};
/* script */

var __vue_script__$a = script$a;
/* template */

var __vue_render__$c = function __vue_render__$c() {
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
      "input": function input($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.internalValue = $event.target.value;
      }
    }
  }), _vm._v(" "), _vm.clearable ? _c('div', {
    staticClass: "\n      vc-input__clear\n      vc-padding-horizontal_m\n      vc-flex\n      vc-flex-align_center\n    ",
    on: {
      "click": function click($event) {
        _vm.internalValue = '';
      }
    }
  }, [_c('vc-icon', {
    attrs: {
      "icon": "times"
    }
  })], 1) : _vm._e()]);
};

var __vue_staticRenderFns__$c = [];
/* style */

var __vue_inject_styles__$c = undefined;
/* scoped */

var __vue_scope_id__$c = undefined;
/* module identifier */

var __vue_module_identifier__$c = undefined;
/* functional template */

var __vue_is_functional_template__$c = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$c = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$c,
  staticRenderFns: __vue_staticRenderFns__$c
}, __vue_inject_styles__$c, __vue_script__$a, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined); //


var script$9 = {
  components: {
    VcIcon: __vue_component__$d
  },
  props: {
    items: {
      type: Array
    }
  }
};
/* script */

var __vue_script__$9 = script$9;
/* template */

var __vue_render__$b = function __vue_render__$b() {
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
    }, [_vm._v(_vm._s(item.title))])], 1)];
  })], 2) : _vm._e();
};

var __vue_staticRenderFns__$b = [];
/* style */

var __vue_inject_styles__$b = undefined;
/* scoped */

var __vue_scope_id__$b = undefined;
/* module identifier */

var __vue_module_identifier__$b = undefined;
/* functional template */

var __vue_is_functional_template__$b = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$b = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$b,
  staticRenderFns: __vue_staticRenderFns__$b
}, __vue_inject_styles__$b, __vue_script__$9, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined); //


var script$8 = {
  components: {
    VcIcon: __vue_component__$d,
    VcInput: __vue_component__$c,
    VcBreadcrumbs: __vue_component__$b
  },
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
};
/* script */

var __vue_script__$8 = script$8;
/* template */

var __vue_render__$a = function __vue_render__$a() {
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
      "click": function click($event) {
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
      "click": function click($event) {
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
      "click": function click($event) {
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
  }, [_vm._v("\n        " + _vm._s(_vm.title) + "\n      ")]), _vm._v(" "), _vm.subtitle ? _c('div', {
    staticClass: "vc-blade__header-subtitle"
  }, [_vm._v("\n        " + _vm._s(_vm.subtitle) + "\n      ")]) : _vm._e()])]), _vm._v(" "), _vm.toolbarItems ? _c('div', {
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
    }, [_vm._v(_vm._s(item.title))])], 1)];
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
      "click": function click($event) {
        _vm.filterOpened = !_vm.filterOpened;
      }
    }
  }, [_c('div', {
    staticClass: "vc-blade__searchbar-filter-label"
  }, [_vm._v("Select filter")]), _vm._v(" "), _c('vc-icon', {
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
      "click": function click($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 1\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-filter-menu-item",
    on: {
      "click": function click($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 2\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-filter-menu-item",
    on: {
      "click": function click($event) {
        _vm.filterOpened = false;
      }
    }
  }, [_vm._v("\n          Item 3\n        ")])]) : _vm._e()]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "vc-blade__searchbar-search vc-flex-grow_1"
  }, [_c('vc-input', {
    attrs: {
      "placeholder": "Search keywords",
      "clearable": "clearable"
    }
  })], 1), _vm._v(" "), _vm.filterable ? _c('div', {
    staticClass: "vc-blade__searchbar-counter vc-margin-left_l"
  }, [_c('span', {
    staticClass: "vc-blade__searchbar-counter-label"
  }, [_vm._v("Count:")]), _vm._v(" "), _c('span', {
    staticClass: "vc-blade__searchbar-counter-value"
  }, [_vm._v("5")])]) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm._t("default")], 2);
};

var __vue_staticRenderFns__$a = [];
/* style */

var __vue_inject_styles__$a = undefined;
/* scoped */

var __vue_scope_id__$a = undefined;
/* module identifier */

var __vue_module_identifier__$a = undefined;
/* functional template */

var __vue_is_functional_template__$a = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$a = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$a,
  staticRenderFns: __vue_staticRenderFns__$a
}, __vue_inject_styles__$a, __vue_script__$8, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined); //
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
    checked: {
      type: Boolean
    }
  }
};
/* script */

var __vue_script__$6 = script$6;
/* template */

var __vue_render__$8 = function __vue_render__$8() {
  var _vm = this;

  var _h = _vm.$createElement;
  _vm._self._c || _h;
  return _vm._m(0);
};

var __vue_staticRenderFns__$8 = [function () {
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

var __vue_inject_styles__$8 = undefined;
/* scoped */

var __vue_scope_id__$8 = undefined;
/* module identifier */

var __vue_module_identifier__$8 = undefined;
/* functional template */

var __vue_is_functional_template__$8 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$8 = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$8,
  staticRenderFns: __vue_staticRenderFns__$8
}, __vue_inject_styles__$8, __vue_script__$6, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);


var script$2 = {
  components: {
    VcIcon: __vue_component__$d,
    VcCheckbox: __vue_component__$8
  },
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

var __vue_script__$2 = script$2;
/* template */

var __vue_render__$2 = function __vue_render__() {
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
        "click": function click($event) {
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

var __vue_staticRenderFns__$2 = [];
/* style */

var __vue_inject_styles__$2 = undefined;
/* scoped */

var __vue_scope_id__$2 = undefined;
/* module identifier */

var __vue_module_identifier__$2 = undefined;
/* functional template */

var __vue_is_functional_template__$2 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$2 = /*#__PURE__*/normalizeComponent$1({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

var toString$1 = function toString(x) {
  return Object.prototype.toString.call(x);
};

function isNative$1(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

var hasSymbol$1 = typeof Symbol !== 'undefined' && isNative$1(Symbol) && typeof Reflect !== 'undefined' && isNative$1(Reflect.ownKeys);

var noopFn$1 = function noopFn(_) {
  return _;
};

function proxy$1(target, key, _a) {
  var get = _a.get,
      set = _a.set;
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: get || noopFn$1,
    set: set || noopFn$1
  });
}

function def$1(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

function hasOwn$1(obj, key) {
  return Object.hasOwnProperty.call(obj, key);
}

function isArray$1(x) {
  return Array.isArray(x);
}

function isObject$1(val) {
  return val !== null && _typeof(val) === 'object';
}

function isPlainObject$1(x) {
  return toString$1(x) === '[object Object]';
}

function isFunction$1(x) {
  return typeof x === 'function';
}

function warn$1$1(msg, vm) {
  Vue__default['default'].util.warn(msg, vm);
}

var vueDependency$1 = undefined;

try {
  var requiredVue$1 = require('vue');

  if (requiredVue$1 && isVue$1(requiredVue$1)) {
    vueDependency$1 = requiredVue$1;
  } else if (requiredVue$1 && 'default' in requiredVue$1 && isVue$1(requiredVue$1.default)) {
    vueDependency$1 = requiredVue$1.default;
  }
} catch (_a) {// not available
}

var vueConstructor$1 = null;
var PluginInstalledFlag$1 = '__composition_api_installed__';

function isVue$1(obj) {
  return obj && typeof obj === 'function' && obj.name === 'Vue';
}

function isVueRegistered$1(Vue) {
  return hasOwn$1(Vue, PluginInstalledFlag$1);
}

function getVueConstructor$1() {
  return vueConstructor$1;
} // returns registered vue or `vue` dependency


function getRegisteredVueOrDefault$1() {
  var constructor = vueConstructor$1 || vueDependency$1;
  return constructor;
}

function setVueConstructor$1(Vue) {
  vueConstructor$1 = Vue;
  Object.defineProperty(Vue, PluginInstalledFlag$1, {
    configurable: true,
    writable: true,
    value: true
  });
}

function defineComponentInstance$1(Ctor, options) {
  if (options === void 0) {
    options = {};
  }

  var silent = Ctor.config.silent;
  Ctor.config.silent = true;
  var vm = new Ctor(options);
  Ctor.config.silent = silent;
  return vm;
}

function isComponentInstance$1(obj) {
  var Vue = getVueConstructor$1();
  return Vue && obj instanceof Vue;
}

function createSlotProxy$1(vm, slotName) {
  return function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (!vm.$scopedSlots[slotName]) {
      return warn$1$1("slots." + slotName + "() got called outside of the \"render()\" scope", vm);
    }

    return vm.$scopedSlots[slotName].apply(vm, args);
  };
}

function resolveSlots$1(slots, normalSlots) {
  var res;

  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized;
  } else {
    res = {};

    for (var key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = true;
      }
    }
  } // expose normal slots on scopedSlots


  for (var key in normalSlots) {
    if (!(key in res)) {
      res[key] = true;
    }
  }

  return res;
}

function __values$1(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
} // must be a string, symbol key is ignored in reactive


var RefKey$1 = 'composition-api.refKey';
var accessModifiedSet$1 = new WeakMap();
var readonlySet$1 = new WeakMap();

var RefImpl$1 =
/** @class */
function () {
  function RefImpl(_a) {
    var get = _a.get,
        set = _a.set;
    proxy$1(this, 'value', {
      get: get,
      set: set
    });
  }

  return RefImpl;
}();

function createRef$1(options, readonly) {
  var r = new RefImpl$1(options); // seal the ref, this could prevent ref from being observed
  // It's safe to seal the ref, since we really shouldn't extend it.
  // related issues: #79

  var sealed = Object.seal(r);
  readonlySet$1.set(sealed, true);
  return sealed;
}

function ref$1(raw) {
  var _a;

  if (isRef$1(raw)) {
    return raw;
  }

  var value = reactive$1((_a = {}, _a[RefKey$1] = raw, _a));
  return createRef$1({
    get: function get() {
      return value[RefKey$1];
    },
    set: function set(v) {
      return value[RefKey$1] = v;
    }
  });
}

function isRef$1(value) {
  return value instanceof RefImpl$1;
}

function toRefs$1(obj) {
  if (!isPlainObject$1(obj)) return obj;
  var ret = {};

  for (var key in obj) {
    ret[key] = toRef$1(obj, key);
  }

  return ret;
}

function toRef$1(object, key) {
  var v = object[key];
  if (isRef$1(v)) return v;
  return createRef$1({
    get: function get() {
      return object[key];
    },
    set: function set(v) {
      return object[key] = v;
    }
  });
}

function isRaw$1(obj) {
  var _a;

  return Boolean((obj === null || obj === void 0 ? void 0 : obj.__ob__) && ((_a = obj.__ob__) === null || _a === void 0 ? void 0 : _a.__raw__));
}

function isReactive$1(obj) {
  var _a;

  return Boolean((obj === null || obj === void 0 ? void 0 : obj.__ob__) && !((_a = obj.__ob__) === null || _a === void 0 ? void 0 : _a.__raw__));
}
/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */


function setupAccessControl$1(target) {
  if (!isPlainObject$1(target) || isRaw$1(target) || Array.isArray(target) || isRef$1(target) || isComponentInstance$1(target) || accessModifiedSet$1.has(target)) return;
  accessModifiedSet$1.set(target, true);
  var keys = Object.keys(target);

  for (var i = 0; i < keys.length; i++) {
    defineAccessControl$1(target, keys[i]);
  }
}
/**
 * Auto unwrapping when access property
 */


function defineAccessControl$1(target, key, val) {
  if (key === '__ob__') return;
  if (isRaw$1(target[key])) return;
  var getter;
  var setter;
  var property = Object.getOwnPropertyDescriptor(target, key);

  if (property) {
    if (property.configurable === false) {
      return;
    }

    getter = property.get;
    setter = property.set;

    if ((!getter || setter) &&
    /* not only have getter */
    arguments.length === 2) {
      val = target[key];
    }
  }

  setupAccessControl$1(val);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function getterHandler() {
      var value = getter ? getter.call(target) : val; // if the key is equal to RefKey, skip the unwrap logic

      if (key !== RefKey$1 && isRef$1(value)) {
        return value.value;
      } else {
        return value;
      }
    },
    set: function setterHandler(newVal) {
      if (getter && !setter) return;
      var value = getter ? getter.call(target) : val; // If the key is equal to RefKey, skip the unwrap logic
      // If and only if "value" is ref and "newVal" is not a ref,
      // the assignment should be proxied to "value" ref.

      if (key !== RefKey$1 && isRef$1(value) && !isRef$1(newVal)) {
        value.value = newVal;
      } else if (setter) {
        setter.call(target, newVal);
      } else {
        val = newVal;
      }

      setupAccessControl$1(newVal);
    }
  });
}

function observe$1(obj) {
  var Vue = getRegisteredVueOrDefault$1();
  var observed;

  if (Vue.observable) {
    observed = Vue.observable(obj);
  } else {
    var vm = defineComponentInstance$1(Vue, {
      data: {
        $$state: obj
      }
    });
    observed = vm._data.$$state;
  } // in SSR, there is no __ob__. Mock for reactivity check


  if (!hasOwn$1(observed, '__ob__')) {
    def$1(observed, '__ob__', mockObserver$1(observed));
  }

  return observed;
}

function createObserver$1() {
  return observe$1({}).__ob__;
}

function mockObserver$1(value) {
  if (value === void 0) {
    value = {};
  }

  return {
    value: value,
    dep: {
      notify: noopFn$1,
      depend: noopFn$1,
      addSub: noopFn$1,
      removeSub: noopFn$1
    }
  };
}
/**
 * Make obj reactivity
 */


function reactive$1(obj) {
  if (!isObject$1(obj)) {
    return obj;
  }

  if (!(isPlainObject$1(obj) || isArray$1(obj)) || isRaw$1(obj) || !Object.isExtensible(obj)) {
    return obj;
  }

  var observed = observe$1(obj);
  setupAccessControl$1(observed);
  return observed;
} // implement

function set$1(vm, key, value) {
  var state = vm.__composition_api_state__ = vm.__composition_api_state__ || {};
  state[key] = value;
}

function get$1(vm, key) {
  return (vm.__composition_api_state__ || {})[key];
}

var vmStateManager$1 = {
  set: set$1,
  get: get$1
};

function asVmProperty$1(vm, propName, propValue) {
  var props = vm.$options.props;

  if (!(propName in vm) && !(props && hasOwn$1(props, propName))) {
    if (isRef$1(propValue)) {
      proxy$1(vm, propName, {
        get: function get() {
          return propValue.value;
        },
        set: function set(val) {
          propValue.value = val;
        }
      });
    } else {
      Object.defineProperty(vm, propName, {
        enumerable: true,
        configurable: true,
        get: function get() {
          if (isReactive$1(propValue)) {
            propValue.__ob__.dep.depend();
          }

          return propValue;
        },
        set: function set(val) {
          propValue = val;
        }
      });
    }
  }
}

function updateTemplateRef$1(vm) {
  var rawBindings = vmStateManager$1.get(vm, 'rawBindings') || {};
  if (!rawBindings || !Object.keys(rawBindings).length) return;
  var refs = vm.$refs;
  var oldRefKeys = vmStateManager$1.get(vm, 'refs') || [];

  for (var index = 0; index < oldRefKeys.length; index++) {
    var key = oldRefKeys[index];
    var setupValue = rawBindings[key];

    if (!refs[key] && setupValue && isRef$1(setupValue)) {
      setupValue.value = null;
    }
  }

  var newKeys = Object.keys(refs);
  var validNewKeys = [];

  for (var index = 0; index < newKeys.length; index++) {
    var key = newKeys[index];
    var setupValue = rawBindings[key];

    if (refs[key] && setupValue && isRef$1(setupValue)) {
      setupValue.value = refs[key];
      validNewKeys.push(key);
    }
  }

  vmStateManager$1.set(vm, 'refs', validNewKeys);
}

function resolveScopedSlots$1(vm, slotsProxy) {
  var parentVNode = vm.$options._parentVnode;
  if (!parentVNode) return;
  var prevSlots = vmStateManager$1.get(vm, 'slots') || [];
  var curSlots = resolveSlots$1(parentVNode.data.scopedSlots, vm.$slots); // remove staled slots

  for (var index = 0; index < prevSlots.length; index++) {
    var key = prevSlots[index];

    if (!curSlots[key]) {
      delete slotsProxy[key];
    }
  } // proxy fresh slots


  var slotNames = Object.keys(curSlots);

  for (var index = 0; index < slotNames.length; index++) {
    var key = slotNames[index];

    if (!slotsProxy[key]) {
      slotsProxy[key] = createSlotProxy$1(vm, key);
    }
  }

  vmStateManager$1.set(vm, 'slots', slotNames);
}

function activateCurrentInstance$1(vm, fn, onError) {

  try {
    return fn(vm);
  } catch (err) {
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  } finally {
  }
}

function mixin$1(Vue) {
  Vue.mixin({
    beforeCreate: functionApiInit,
    mounted: function mounted() {
      updateTemplateRef$1(this);
    },
    updated: function updated() {
      updateTemplateRef$1(this);
    }
  });
  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function functionApiInit() {
    var vm = this;
    var $options = vm.$options;
    var setup = $options.setup,
        render = $options.render;

    if (render) {
      // keep currentInstance accessible for createElement
      $options.render = function () {
        var _this = this;

        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return activateCurrentInstance$1(vm, function () {
          return render.apply(_this, args);
        });
      };
    }

    if (!setup) {
      return;
    }

    if (typeof setup !== 'function') {
      return;
    }

    var data = $options.data; // wrapper the data option, so we can invoke setup before data get resolved

    $options.data = function wrappedData() {
      initSetup(vm, vm.$props);
      return typeof data === 'function' ? data.call(vm, vm) : data || {};
    };
  }

  function initSetup(vm, props) {
    if (props === void 0) {
      props = {};
    }

    var setup = vm.$options.setup;
    var ctx = createSetupContext(vm); // fake reactive for `toRefs(props)`

    def$1(props, '__ob__', createObserver$1()); // resolve scopedSlots and slots to functions
    // @ts-expect-error

    resolveScopedSlots$1(vm, ctx.slots);
    var binding;
    activateCurrentInstance$1(vm, function () {
      // make props to be fake reactive, this is for `toRefs(props)`
      binding = setup(props, ctx);
    });
    if (!binding) return;

    if (isFunction$1(binding)) {
      // keep typescript happy with the binding type.
      var bindingFunc_1 = binding; // keep currentInstance accessible for createElement

      vm.$options.render = function () {
        // @ts-expect-error
        resolveScopedSlots$1(vm, ctx.slots);
        return activateCurrentInstance$1(vm, function () {
          return bindingFunc_1();
        });
      };

      return;
    } else if (isPlainObject$1(binding)) {
      if (isReactive$1(binding)) {
        binding = toRefs$1(binding);
      }

      vmStateManager$1.set(vm, 'rawBindings', binding);
      var bindingObj_1 = binding;
      Object.keys(bindingObj_1).forEach(function (name) {
        var bindingValue = bindingObj_1[name];

        if (!isRef$1(bindingValue)) {
          if (!isReactive$1(bindingValue)) {
            if (isFunction$1(bindingValue)) {
              bindingValue = bindingValue.bind(vm);
            } else if (!isObject$1(bindingValue)) {
              bindingValue = ref$1(bindingValue);
            } else if (hasReactiveArrayChild(bindingValue)) {
              // creates a custom reactive properties without make the object explicitly reactive
              // NOTE we should try to avoid this, better implementation needed
              customReactive(bindingValue);
            }
          } else if (isArray$1(bindingValue)) {
            bindingValue = ref$1(bindingValue);
          }
        }

        asVmProperty$1(vm, name, bindingValue);
      });
      return;
    }
  }

  function customReactive(target) {
    if (!isPlainObject$1(target) || isRef$1(target) || isReactive$1(target) || isRaw$1(target)) return;
    var Vue = getVueConstructor$1();
    var defineReactive = Vue.util.defineReactive;
    Object.keys(target).forEach(function (k) {
      var val = target[k];
      defineReactive(target, k, val);

      if (val) {
        customReactive(val);
      }

      return;
    });
  }

  function hasReactiveArrayChild(target, visited) {
    if (visited === void 0) {
      visited = new Map();
    }

    if (visited.has(target)) {
      return visited.get(target);
    }

    visited.set(target, false);

    if (Array.isArray(target) && isReactive$1(target)) {
      visited.set(target, true);
      return true;
    }

    if (!isPlainObject$1(target) || isRaw$1(target)) {
      return false;
    }

    return Object.keys(target).some(function (x) {
      return hasReactiveArrayChild(target[x], visited);
    });
  }

  function createSetupContext(vm) {
    var ctx = {
      slots: {}
    };
    var propsPlain = ['root', 'parent', 'refs', 'listeners', 'isServer', 'ssrContext'];
    var propsReactiveProxy = ['attrs'];
    var methodReturnVoid = ['emit'];
    propsPlain.forEach(function (key) {
      var srcKey = "$" + key;
      proxy$1(ctx, key, {
        get: function get() {
          return vm[srcKey];
        },
        set: function set() {
          warn$1$1("Cannot assign to '" + key + "' because it is a read-only property", vm);
        }
      });
    });
    propsReactiveProxy.forEach(function (key) {
      var srcKey = "$" + key;
      proxy$1(ctx, key, {
        get: function get() {
          var e_1, _a;

          var data = reactive$1({});
          var source = vm[srcKey];

          var _loop_1 = function _loop_1(attr) {
            proxy$1(data, attr, {
              get: function get() {
                // to ensure it always return the latest value
                return vm[srcKey][attr];
              }
            });
          };

          try {
            for (var _b = __values$1(Object.keys(source)), _c = _b.next(); !_c.done; _c = _b.next()) {
              var attr = _c.value;

              _loop_1(attr);
            }
          } catch (e_1_1) {
            e_1 = {
              error: e_1_1
            };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
          }

          return data;
        },
        set: function set() {
          warn$1$1("Cannot assign to '" + key + "' because it is a read-only property", vm);
        }
      });
    });
    methodReturnVoid.forEach(function (key) {
      var srcKey = "$" + key;
      proxy$1(ctx, key, {
        get: function get() {
          return function () {
            var args = [];

            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }

            var fn = vm[srcKey];
            fn.apply(vm, args);
          };
        }
      });
    });
    return ctx;
  }
}
/**
 * Helper that recursively merges two data objects together.
 */


function mergeData$1(from, to) {
  if (!from) return to;
  if (!to) return from;
  var key;
  var toVal;
  var fromVal;
  var keys = hasSymbol$1 ? Reflect.ownKeys(from) : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i]; // in case the object is already observed...

    if (key === '__ob__') continue;
    toVal = to[key];
    fromVal = from[key];

    if (!hasOwn$1(to, key)) {
      to[key] = fromVal;
    } else if (toVal !== fromVal && isPlainObject$1(toVal) && !isRef$1(toVal) && isPlainObject$1(fromVal) && !isRef$1(fromVal)) {
      mergeData$1(fromVal, toVal);
    }
  }

  return to;
}

function install$1$1(Vue) {
  if (isVueRegistered$1(Vue)) {
    return;
  }

  Vue.config.optionMergeStrategies.setup = function (parent, child) {
    return function mergedSetupFn(props, context) {
      return mergeData$1(typeof parent === 'function' ? parent(props, context) || {} : undefined, typeof child === 'function' ? child(props, context) || {} : undefined);
    };
  };

  setVueConstructor$1(Vue);
  mixin$1(Vue);
}

var Plugin$1 = {
  install: function install(Vue) {
    return install$1$1(Vue);
  }
}; // auto install when using CDN

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Plugin$1);
}
/** All registered blades */


ref$1([]);
/** All pinnned blades */

ref$1([]);
/** All opened blades */

var opened = ref$1([]);
/**
 * Open blade by name.
 */


function openBlade(component, componentOptions) {
  opened.value.push({
    id: Math.random(),
    component: component,
    componentOptions: componentOptions
  });
  console.log("Opened blades: ", opened.value);
}var toString = function (x) { return Object.prototype.toString.call(x); };
function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}
var hasSymbol = typeof Symbol !== 'undefined' &&
    isNative(Symbol) &&
    typeof Reflect !== 'undefined' &&
    isNative(Reflect.ownKeys);
var noopFn = function (_) { return _; };
function proxy(target, key, _a) {
    var get = _a.get, set = _a.set;
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        get: get || noopFn,
        set: set || noopFn,
    });
}
function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}
function hasOwn(obj, key) {
    return Object.hasOwnProperty.call(obj, key);
}
function isArray(x) {
    return Array.isArray(x);
}
function isObject(val) {
    return val !== null && typeof val === 'object';
}
function isPlainObject(x) {
    return toString(x) === '[object Object]';
}
function isFunction(x) {
    return typeof x === 'function';
}
function warn$1(msg, vm) {
    Vue__default['default'].util.warn(msg, vm);
}

var vueDependency = undefined;
try {
    var requiredVue = require('vue');
    if (requiredVue && isVue(requiredVue)) {
        vueDependency = requiredVue;
    }
    else if (requiredVue &&
        'default' in requiredVue &&
        isVue(requiredVue.default)) {
        vueDependency = requiredVue.default;
    }
}
catch (_a) {
    // not available
}
var vueConstructor = null;
var PluginInstalledFlag = '__composition_api_installed__';
function isVue(obj) {
    return obj && typeof obj === 'function' && obj.name === 'Vue';
}
function isVueRegistered(Vue) {
    return hasOwn(Vue, PluginInstalledFlag);
}
function getVueConstructor() {
    return vueConstructor;
}
// returns registered vue or `vue` dependency
function getRegisteredVueOrDefault() {
    var constructor = vueConstructor || vueDependency;
    return constructor;
}
function setVueConstructor(Vue) {
    vueConstructor = Vue;
    Object.defineProperty(Vue, PluginInstalledFlag, {
        configurable: true,
        writable: true,
        value: true,
    });
}
function defineComponentInstance(Ctor, options) {
    if (options === void 0) { options = {}; }
    var silent = Ctor.config.silent;
    Ctor.config.silent = true;
    var vm = new Ctor(options);
    Ctor.config.silent = silent;
    return vm;
}
function isComponentInstance(obj) {
    var Vue = getVueConstructor();
    return Vue && obj instanceof Vue;
}
function createSlotProxy(vm, slotName) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!vm.$scopedSlots[slotName]) {
            return warn$1("slots." + slotName + "() got called outside of the \"render()\" scope", vm);
        }
        return vm.$scopedSlots[slotName].apply(vm, args);
    };
}
function resolveSlots(slots, normalSlots) {
    var res;
    if (!slots) {
        res = {};
    }
    else if (slots._normalized) {
        // fast path 1: child component re-render only, parent did not change
        return slots._normalized;
    }
    else {
        res = {};
        for (var key in slots) {
            if (slots[key] && key[0] !== '$') {
                res[key] = true;
            }
        }
    }
    // expose normal slots on scopedSlots
    for (var key in normalSlots) {
        if (!(key in res)) {
            res[key] = true;
        }
    }
    return res;
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
// must be a string, symbol key is ignored in reactive
var RefKey = 'composition-api.refKey';

var accessModifiedSet = new WeakMap();
var readonlySet = new WeakMap();

var RefImpl = /** @class */ (function () {
    function RefImpl(_a) {
        var get = _a.get, set = _a.set;
        proxy(this, 'value', {
            get: get,
            set: set,
        });
    }
    return RefImpl;
}());
function createRef(options, readonly) {
    var r = new RefImpl(options);
    // seal the ref, this could prevent ref from being observed
    // It's safe to seal the ref, since we really shouldn't extend it.
    // related issues: #79
    var sealed = Object.seal(r);
    readonlySet.set(sealed, true);
    return sealed;
}
function ref(raw) {
    var _a;
    if (isRef(raw)) {
        return raw;
    }
    var value = reactive((_a = {}, _a[RefKey] = raw, _a));
    return createRef({
        get: function () { return value[RefKey]; },
        set: function (v) { return (value[RefKey] = v); },
    });
}
function isRef(value) {
    return value instanceof RefImpl;
}
function toRefs(obj) {
    if (!isPlainObject(obj))
        return obj;
    var ret = {};
    for (var key in obj) {
        ret[key] = toRef(obj, key);
    }
    return ret;
}
function toRef(object, key) {
    var v = object[key];
    if (isRef(v))
        return v;
    return createRef({
        get: function () { return object[key]; },
        set: function (v) { return (object[key] = v); },
    });
}

function isRaw(obj) {
    var _a;
    return Boolean((obj === null || obj === void 0 ? void 0 : obj.__ob__) && ((_a = obj.__ob__) === null || _a === void 0 ? void 0 : _a.__raw__));
}
function isReactive(obj) {
    var _a;
    return Boolean((obj === null || obj === void 0 ? void 0 : obj.__ob__) && !((_a = obj.__ob__) === null || _a === void 0 ? void 0 : _a.__raw__));
}
/**
 * Proxing property access of target.
 * We can do unwrapping and other things here.
 */
function setupAccessControl(target) {
    if (!isPlainObject(target) ||
        isRaw(target) ||
        Array.isArray(target) ||
        isRef(target) ||
        isComponentInstance(target) ||
        accessModifiedSet.has(target))
        return;
    accessModifiedSet.set(target, true);
    var keys = Object.keys(target);
    for (var i = 0; i < keys.length; i++) {
        defineAccessControl(target, keys[i]);
    }
}
/**
 * Auto unwrapping when access property
 */
function defineAccessControl(target, key, val) {
    if (key === '__ob__')
        return;
    if (isRaw(target[key]))
        return;
    var getter;
    var setter;
    var property = Object.getOwnPropertyDescriptor(target, key);
    if (property) {
        if (property.configurable === false) {
            return;
        }
        getter = property.get;
        setter = property.set;
        if ((!getter || setter) /* not only have getter */ &&
            arguments.length === 2) {
            val = target[key];
        }
    }
    setupAccessControl(val);
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        get: function getterHandler() {
            var value = getter ? getter.call(target) : val;
            // if the key is equal to RefKey, skip the unwrap logic
            if (key !== RefKey && isRef(value)) {
                return value.value;
            }
            else {
                return value;
            }
        },
        set: function setterHandler(newVal) {
            if (getter && !setter)
                return;
            var value = getter ? getter.call(target) : val;
            // If the key is equal to RefKey, skip the unwrap logic
            // If and only if "value" is ref and "newVal" is not a ref,
            // the assignment should be proxied to "value" ref.
            if (key !== RefKey && isRef(value) && !isRef(newVal)) {
                value.value = newVal;
            }
            else if (setter) {
                setter.call(target, newVal);
            }
            else {
                val = newVal;
            }
            setupAccessControl(newVal);
        },
    });
}
function observe(obj) {
    var Vue = getRegisteredVueOrDefault();
    var observed;
    if (Vue.observable) {
        observed = Vue.observable(obj);
    }
    else {
        var vm = defineComponentInstance(Vue, {
            data: {
                $$state: obj,
            },
        });
        observed = vm._data.$$state;
    }
    // in SSR, there is no __ob__. Mock for reactivity check
    if (!hasOwn(observed, '__ob__')) {
        def(observed, '__ob__', mockObserver(observed));
    }
    return observed;
}
function createObserver() {
    return observe({}).__ob__;
}
function mockObserver(value) {
    if (value === void 0) { value = {}; }
    return {
        value: value,
        dep: {
            notify: noopFn,
            depend: noopFn,
            addSub: noopFn,
            removeSub: noopFn,
        },
    };
}
/**
 * Make obj reactivity
 */
function reactive(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    if (!(isPlainObject(obj) || isArray(obj)) ||
        isRaw(obj) ||
        !Object.isExtensible(obj)) {
        return obj;
    }
    var observed = observe(obj);
    setupAccessControl(observed);
    return observed;
}

function set(vm, key, value) {
    var state = (vm.__composition_api_state__ =
        vm.__composition_api_state__ || {});
    state[key] = value;
}
function get(vm, key) {
    return (vm.__composition_api_state__ || {})[key];
}
var vmStateManager = {
    set: set,
    get: get,
};

function asVmProperty(vm, propName, propValue) {
    var props = vm.$options.props;
    if (!(propName in vm) && !(props && hasOwn(props, propName))) {
        if (isRef(propValue)) {
            proxy(vm, propName, {
                get: function () { return propValue.value; },
                set: function (val) {
                    propValue.value = val;
                },
            });
        }
        else {
            Object.defineProperty(vm, propName, {
                enumerable: true,
                configurable: true,
                get: function () {
                    if (isReactive(propValue)) {
                        propValue.__ob__.dep.depend();
                    }
                    return propValue;
                },
                set: function (val) {
                    propValue = val;
                },
            });
        }
    }
}
function updateTemplateRef(vm) {
    var rawBindings = vmStateManager.get(vm, 'rawBindings') || {};
    if (!rawBindings || !Object.keys(rawBindings).length)
        return;
    var refs = vm.$refs;
    var oldRefKeys = vmStateManager.get(vm, 'refs') || [];
    for (var index = 0; index < oldRefKeys.length; index++) {
        var key = oldRefKeys[index];
        var setupValue = rawBindings[key];
        if (!refs[key] && setupValue && isRef(setupValue)) {
            setupValue.value = null;
        }
    }
    var newKeys = Object.keys(refs);
    var validNewKeys = [];
    for (var index = 0; index < newKeys.length; index++) {
        var key = newKeys[index];
        var setupValue = rawBindings[key];
        if (refs[key] && setupValue && isRef(setupValue)) {
            setupValue.value = refs[key];
            validNewKeys.push(key);
        }
    }
    vmStateManager.set(vm, 'refs', validNewKeys);
}
function resolveScopedSlots(vm, slotsProxy) {
    var parentVNode = vm.$options._parentVnode;
    if (!parentVNode)
        return;
    var prevSlots = vmStateManager.get(vm, 'slots') || [];
    var curSlots = resolveSlots(parentVNode.data.scopedSlots, vm.$slots);
    // remove staled slots
    for (var index = 0; index < prevSlots.length; index++) {
        var key = prevSlots[index];
        if (!curSlots[key]) {
            delete slotsProxy[key];
        }
    }
    // proxy fresh slots
    var slotNames = Object.keys(curSlots);
    for (var index = 0; index < slotNames.length; index++) {
        var key = slotNames[index];
        if (!slotsProxy[key]) {
            slotsProxy[key] = createSlotProxy(vm, key);
        }
    }
    vmStateManager.set(vm, 'slots', slotNames);
}
function activateCurrentInstance(vm, fn, onError) {
    try {
        return fn(vm);
    }
    catch (err) {
        if (onError) {
            onError(err);
        }
        else {
            throw err;
        }
    }
    finally {
    }
}

function mixin(Vue) {
    Vue.mixin({
        beforeCreate: functionApiInit,
        mounted: function () {
            updateTemplateRef(this);
        },
        updated: function () {
            updateTemplateRef(this);
        },
    });
    /**
     * Vuex init hook, injected into each instances init hooks list.
     */
    function functionApiInit() {
        var vm = this;
        var $options = vm.$options;
        var setup = $options.setup, render = $options.render;
        if (render) {
            // keep currentInstance accessible for createElement
            $options.render = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return activateCurrentInstance(vm, function () { return render.apply(_this, args); });
            };
        }
        if (!setup) {
            return;
        }
        if (typeof setup !== 'function') {
            return;
        }
        var data = $options.data;
        // wrapper the data option, so we can invoke setup before data get resolved
        $options.data = function wrappedData() {
            initSetup(vm, vm.$props);
            return typeof data === 'function'
                ? data.call(vm, vm)
                : data || {};
        };
    }
    function initSetup(vm, props) {
        if (props === void 0) { props = {}; }
        var setup = vm.$options.setup;
        var ctx = createSetupContext(vm);
        // fake reactive for `toRefs(props)`
        def(props, '__ob__', createObserver());
        // resolve scopedSlots and slots to functions
        // @ts-expect-error
        resolveScopedSlots(vm, ctx.slots);
        var binding;
        activateCurrentInstance(vm, function () {
            // make props to be fake reactive, this is for `toRefs(props)`
            binding = setup(props, ctx);
        });
        if (!binding)
            return;
        if (isFunction(binding)) {
            // keep typescript happy with the binding type.
            var bindingFunc_1 = binding;
            // keep currentInstance accessible for createElement
            vm.$options.render = function () {
                // @ts-expect-error
                resolveScopedSlots(vm, ctx.slots);
                return activateCurrentInstance(vm, function () { return bindingFunc_1(); });
            };
            return;
        }
        else if (isPlainObject(binding)) {
            if (isReactive(binding)) {
                binding = toRefs(binding);
            }
            vmStateManager.set(vm, 'rawBindings', binding);
            var bindingObj_1 = binding;
            Object.keys(bindingObj_1).forEach(function (name) {
                var bindingValue = bindingObj_1[name];
                if (!isRef(bindingValue)) {
                    if (!isReactive(bindingValue)) {
                        if (isFunction(bindingValue)) {
                            bindingValue = bindingValue.bind(vm);
                        }
                        else if (!isObject(bindingValue)) {
                            bindingValue = ref(bindingValue);
                        }
                        else if (hasReactiveArrayChild(bindingValue)) {
                            // creates a custom reactive properties without make the object explicitly reactive
                            // NOTE we should try to avoid this, better implementation needed
                            customReactive(bindingValue);
                        }
                    }
                    else if (isArray(bindingValue)) {
                        bindingValue = ref(bindingValue);
                    }
                }
                asVmProperty(vm, name, bindingValue);
            });
            return;
        }
    }
    function customReactive(target) {
        if (!isPlainObject(target) ||
            isRef(target) ||
            isReactive(target) ||
            isRaw(target))
            return;
        var Vue = getVueConstructor();
        var defineReactive = Vue.util.defineReactive;
        Object.keys(target).forEach(function (k) {
            var val = target[k];
            defineReactive(target, k, val);
            if (val) {
                customReactive(val);
            }
            return;
        });
    }
    function hasReactiveArrayChild(target, visited) {
        if (visited === void 0) { visited = new Map(); }
        if (visited.has(target)) {
            return visited.get(target);
        }
        visited.set(target, false);
        if (Array.isArray(target) && isReactive(target)) {
            visited.set(target, true);
            return true;
        }
        if (!isPlainObject(target) || isRaw(target)) {
            return false;
        }
        return Object.keys(target).some(function (x) {
            return hasReactiveArrayChild(target[x], visited);
        });
    }
    function createSetupContext(vm) {
        var ctx = { slots: {} };
        var propsPlain = [
            'root',
            'parent',
            'refs',
            'listeners',
            'isServer',
            'ssrContext',
        ];
        var propsReactiveProxy = ['attrs'];
        var methodReturnVoid = ['emit'];
        propsPlain.forEach(function (key) {
            var srcKey = "$" + key;
            proxy(ctx, key, {
                get: function () { return vm[srcKey]; },
                set: function () {
                    warn$1("Cannot assign to '" + key + "' because it is a read-only property", vm);
                },
            });
        });
        propsReactiveProxy.forEach(function (key) {
            var srcKey = "$" + key;
            proxy(ctx, key, {
                get: function () {
                    var e_1, _a;
                    var data = reactive({});
                    var source = vm[srcKey];
                    var _loop_1 = function (attr) {
                        proxy(data, attr, {
                            get: function () {
                                // to ensure it always return the latest value
                                return vm[srcKey][attr];
                            },
                        });
                    };
                    try {
                        for (var _b = __values(Object.keys(source)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var attr = _c.value;
                            _loop_1(attr);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return data;
                },
                set: function () {
                    warn$1("Cannot assign to '" + key + "' because it is a read-only property", vm);
                },
            });
        });
        methodReturnVoid.forEach(function (key) {
            var srcKey = "$" + key;
            proxy(ctx, key, {
                get: function () {
                    return function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var fn = vm[srcKey];
                        fn.apply(vm, args);
                    };
                },
            });
        });
        return ctx;
    }
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(from, to) {
    if (!from)
        return to;
    if (!to)
        return from;
    var key;
    var toVal;
    var fromVal;
    var keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        // in case the object is already observed...
        if (key === '__ob__')
            continue;
        toVal = to[key];
        fromVal = from[key];
        if (!hasOwn(to, key)) {
            to[key] = fromVal;
        }
        else if (toVal !== fromVal &&
            isPlainObject(toVal) &&
            !isRef(toVal) &&
            isPlainObject(fromVal) &&
            !isRef(fromVal)) {
            mergeData(fromVal, toVal);
        }
    }
    return to;
}
function install$1(Vue) {
    if (isVueRegistered(Vue)) {
        return;
    }
    Vue.config.optionMergeStrategies.setup = function (parent, child) {
        return function mergedSetupFn(props, context) {
            return mergeData(typeof parent === 'function' ? parent(props, context) || {} : undefined, typeof child === 'function' ? child(props, context) || {} : undefined);
        };
    };
    setVueConstructor(Vue);
    mixin(Vue);
}
var Plugin = {
    install: function (Vue) { return install$1(Vue); },
};

// implementation, close to no-op
function defineComponent(options) {
    return options;
}
// auto install when using CDN
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(Plugin);
}//
var script$1 = defineComponent({
  components: {
    VcBlade: __vue_component__$a,
    VcTable: __vue_component__$2,
    VcIcon: __vue_component__$d
  },
  setup: function setup() {
    var toolbarItems = ref([{
      id: 1,
      icon: "sync-alt",
      title: "Refresh"
    }, {
      id: 2,
      icon: "plus",
      title: "Add"
    }]);
    var breadcrumbs = ref([{
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
    var headers = ref([{
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
    var items = ref([{
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
      toolbarItems: toolbarItems,
      breadcrumbs: breadcrumbs,
      headers: headers,
      items: items
    };
  }
});function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
var __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('vc-blade', {
    attrs: {
      "icon": "cloud",
      "title": "B2B-mixed (virtual)",
      "width": "600",
      "toolbarItems": _vm.toolbarItems.value,
      "breadcrumbs": _vm.breadcrumbs.value,
      "searchable": true,
      "filterable": true
    },
    on: {
      "close": function close($event) {
        return _vm.$store.commit('closeBlade');
      }
    }
  }, [_c('vc-table', {
    attrs: {
      "headers": _vm.headers.value,
      "items": _vm.items.value,
      "multiselect": true
    },
    scopedSlots: _vm._u([{
      key: "item_actions",
      fn: function fn() {
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
      fn: function fn(itemData) {
        return [_c('img', {
          staticClass: "vc-fill_width",
          attrs: {
            "src": itemData.item.img
          }
        })];
      }
    }, {
      key: "item_name",
      fn: function fn(itemData) {
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

var __vue_inject_styles__$1 = undefined;
/* scoped */

var __vue_scope_id__$1 = undefined;
/* module identifier */

var __vue_module_identifier__$1 = "data-v-33d30b6e";
/* functional template */

var __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);//
var script = defineComponent({
  components: {
    VcBlade: __vue_component__$a,
    VcTable: __vue_component__$2,
    VcIcon: __vue_component__$d
  },
  setup: function setup() {
    var toolbarItems = ref([{
      id: 1,
      icon: "sync-alt",
      title: "Refresh"
    }, {
      id: 2,
      icon: "plus",
      title: "Add"
    }]);
    var headers = ref([{
      id: "actions",
      title: "",
      width: 30,
      class: "vc-table__body-cell_bordered"
    }, {
      id: "name",
      title: "Name",
      sortable: true
    }]);
    var items = ref([{
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
      toolbarItems: toolbarItems,
      headers: headers,
      items: items,
      openDetails: function openDetails(options) {
        openBlade(__vue_component__$1, options);
      }
    };
  }
});/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
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
      "toolbarItems": _vm.toolbarItems.value,
      "searchable": true
    }
  }, [_c('vc-table', {
    attrs: {
      "headers": _vm.headers.value,
      "items": _vm.items.value,
      "multiselect": true
    },
    on: {
      "itemClick": function itemClick($event) {
        return _vm.openDetails($event);
      }
    },
    scopedSlots: _vm._u([{
      key: "item_actions",
      fn: function fn() {
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
      fn: function fn(itemData) {
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

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-667b1d6e";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);/* eslint-disable import/prefer-default-export */var components$1=/*#__PURE__*/Object.freeze({__proto__:null,StoreDetailsBlade: __vue_component__$1,StoreListBlade: __vue_component__});var install = function installExtStore(Vue) {
  Object.entries(components$1).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()
var components=/*#__PURE__*/Object.freeze({__proto__:null,'default': install,StoreDetailsBlade: __vue_component__$1,StoreListBlade: __vue_component__});// only expose one global var, with component exports exposed as properties of
// that global var (eg. plugin.component)

Object.entries(components).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      componentName = _ref2[0],
      component = _ref2[1];

  if (componentName !== 'default') {
    install[componentName] = component;
  }
});module.exports=install;