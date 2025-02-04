import { useSSRContext, defineComponent, ref, mergeProps, unref, resolveComponent, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, withDirectives, isRef, vModelText, createTextVNode, createCommentVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrRenderStyle, ssrRenderTeleport, ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { _ as __nuxt_component_0 } from './app-logo-jvqRr6N2.mjs';
import { a as useAPIExecution, u as useUiStore, g as _sfc_main$8, d as _sfc_main$3$1, _ as __nuxt_component_5, e as _sfc_main$1$1 } from './modal-window-D1_6KwB4.mjs';
import { u as useFlowStore } from './useFlowStore-Bci9blvY.mjs';
import { u as useAuthStore } from './useAuthStore-DfEvTafy.mjs';
import { _ as __nuxt_component_2 } from './notification-queue-2XnyL0tW.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'pinia';
import 'vue-router';
import 'vue-draggable-plus';
import '@vue-flow/core';
import './useMessageQueue-EDFjpfdQ.mjs';
import '../_/v4.mjs';
import 'node:crypto';
import './fetch-vM0MWLpl.mjs';
import './ssr-DLPS32Cj.mjs';

const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "loading",
  __ssrInlineRender: true,
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["fixed h-screen w-full bg-gray-200 z-50 transition-all duration-300 flex flex-col items-center justify-center", __props.isLoading ? "opacity-100  " : "opacity-0 pointer-events-none"]
      }, _attrs))}><p> Loading... </p><div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/common/loading.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "dropdown-menu",
  __ssrInlineRender: true,
  props: {
    modalPossition: {
      type: String,
      default: "bottom"
    },
    bgColor: {
      type: String,
      default: "white"
    },
    bgOpacity: {
      type: String,
      default: "100"
    },
    buttonColor: {
      type: String,
      default: "[#842ff7]"
    },
    borderThickness: {
      type: String,
      default: null
    },
    borderColor: {
      type: String,
      default: null
    }
  },
  setup(__props, { expose: __expose }) {
    ref(null);
    const visibility = ref(false);
    const changeVisibility = () => {
      visibility.value = !visibility.value;
    };
    const floatingElementChildTop = ref(0);
    const floatingElementChildLeft = ref(0);
    __expose({
      changeVisibility
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-start justify-start w-fit z-0" }, _attrs))}><div>`);
      ssrRenderSlot(_ctx.$slots, "parent", {}, null, _push, _parent);
      _push(`</div><div class="${ssrRenderClass([unref(visibility) ? "" : "opacity-0 pointer-events-none", "relative transition-all duration-200 z-0"])}"><div style="${ssrRenderStyle({ top: unref(floatingElementChildTop) + "px", left: unref(floatingElementChildLeft) + "px" })}" class="${ssrRenderClass(["bg-" + __props.bgColor + " bg-opacity-" + __props.bgOpacity + " border-" + __props.borderThickness + " border-" + __props.borderColor, "fixed z-20 overflow-hidden shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)] rounded-md"])}"><div class="flex flex-col">`);
      ssrRenderSlot(_ctx.$slots, "menu", {}, null, _push, _parent);
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/dropdown-menu.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "comfirm-dialog",
  __ssrInlineRender: true,
  props: {
    bgColor: {
      type: String,
      default: "white"
    },
    bgOpacity: {
      type: String,
      default: "100"
    },
    buttonColor: {
      type: String,
      default: "[#842ff7]"
    },
    borderThickness: {
      type: String,
      default: null
    },
    borderColor: {
      type: String,
      default: null
    }
  },
  setup(__props) {
    const visibility = ref(false);
    const changeVisibility = () => {
      visibility.value = !visibility.value;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<!--[--><div>`);
      ssrRenderSlot(_ctx.$slots, "button", {}, null, _push, _parent);
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="${ssrRenderClass([unref(visibility) ? "" : "opacity-0 pointer-events-none", "fixed left-0 top-0 w-full h-full transition-all duration-300 z-50"])}"><div class="absolute left-0 top-0 items-center w-full h-full bg-gray-500 bg-opacity-50 transition-all duration-300"></div><div class="flex flex-col z-20 items-center justify-center h-full w-full"><div class="${ssrRenderClass(["bg-" + __props.bgColor + " bg-opacity-" + __props.bgOpacity + " border-" + __props.borderThickness + " border-" + __props.borderColor, "flex flex-col items-center justify-center md:w-3/4 lg:w-[800px] drop-shadow-lg rounded-xl md:max-h-[1500px] transition-all duration-300"])}"><div class="flex flex-col w-full"><div class="flex justify-end w-full">`);
        _push2(ssrRenderComponent(_component_font_awesome_icon, {
          class: ["text-2xl m-2 hover:opacity-50 transition-all duration-300 cursor-pointer", "text-" + __props.buttonColor],
          icon: ["fas", "circle-xmark"],
          onClick: changeVisibility
        }, null, _parent));
        _push2(`</div><div class="relative flex flex-col items-center justify-center pb-5 px-5 md:px-5 transition-all duration-300">`);
        ssrRenderSlot(_ctx.$slots, "modal", {}, null, _push2, _parent);
        _push2(`<div class="flex justify-center items-center"><button>`);
        ssrRenderSlot(_ctx.$slots, "yes", {}, null, _push2, _parent);
        _push2(`</button><button>`);
        ssrRenderSlot(_ctx.$slots, "no", {}, null, _push2, _parent);
        _push2(`</button></div></div></div></div></div></div>`);
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/comfirm-dialog.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "flow-menu",
  __ssrInlineRender: true,
  setup(__props) {
    const flowStore = useFlowStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_draggable = resolveComponent("draggable");
      const _component_AtomsCommonComfirmDialog = _sfc_main$5;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-full rounded-2xl flex flex-col justify-center items-center z-10" }, _attrs))}><div class="w-full flex items-start justify-center h-full"><div class="flex-grow">`);
      if (unref(flowStore).savedFlowItems.length > 0) {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_draggable, {
          ref: "el",
          modelValue: unref(flowStore).savedFlowItems,
          "onUpdate:modelValue": ($event) => unref(flowStore).savedFlowItems = $event,
          animation: 150,
          easing: "ease",
          class: "m-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(unref(flowStore).savedFlowItems, (savedFlow, index) => {
                _push2(`<div class="px-2 py-1 cursor-pointer group/flow flex justify-center items-center"${_scopeId}><div class="${ssrRenderClass([savedFlow.id === unref(flowStore).uuuidOfLoadedSavedFlow ? "bg-[#f5ecff]  text-[#842ff7] " : " ", "flex flex-col justify-center items-center rounded-lg px-3 py-1 hover:bg-[#f5ecff]"])}"${_scopeId}><div class=""${_scopeId}>`);
                if (savedFlow.flowItem?.name) {
                  _push2(`<p${_scopeId}>${ssrInterpolate(savedFlow.flowItem?.name)}</p>`);
                } else {
                  _push2(`<p class="text-gray-500"${_scopeId}> Untitled </p>`);
                }
                _push2(`</div><div class=""${_scopeId}> \u66F4\u65B0\u65E5: ${ssrInterpolate(new Date(savedFlow.updatedAt).toLocaleString())}</div></div>`);
                _push2(ssrRenderComponent(_component_AtomsCommonComfirmDialog, { "bg-color": "white" }, {
                  modal: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div class="px-4 py-4 w-full h-full flex flex-col justify-center items-center"${_scopeId2}><p class="mb-5"${_scopeId2}> \u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F </p></div>`);
                    } else {
                      return [
                        createVNode("div", { class: "px-4 py-4 w-full h-full flex flex-col justify-center items-center" }, [
                          createVNode("p", { class: "mb-5" }, " \u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F ")
                        ])
                      ];
                    }
                  }),
                  yes: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<button class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300 mr-5"${_scopeId2}> \u306F\u3044 </button>`);
                    } else {
                      return [
                        createVNode("button", {
                          onClick: ($event) => unref(flowStore).deleteSavedFlow(index),
                          class: "px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300 mr-5"
                        }, " \u306F\u3044 ", 8, ["onClick"])
                      ];
                    }
                  }),
                  no: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<button class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300"${_scopeId2}> \u3044\u3044\u3048 </button>`);
                    } else {
                      return [
                        createVNode("button", { class: "px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300" }, " \u3044\u3044\u3048 ")
                      ];
                    }
                  }),
                  button: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<button class="flex items-center justify-end ml-3"${_scopeId2}><p class="text-red-500 hover:text-red-700 text-sm transition-all duration-200"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "trash-can"] }, null, _parent3, _scopeId2));
                      _push3(`</p></button>`);
                    } else {
                      return [
                        createVNode("button", { class: "flex items-center justify-end ml-3" }, [
                          createVNode("p", { class: "text-red-500 hover:text-red-700 text-sm transition-all duration-200" }, [
                            createVNode(_component_font_awesome_icon, { icon: ["fas", "trash-can"] })
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(flowStore).savedFlowItems, (savedFlow, index) => {
                  return openBlock(), createBlock("div", {
                    key: savedFlow.id,
                    class: "px-2 py-1 cursor-pointer group/flow flex justify-center items-center"
                  }, [
                    createVNode("div", {
                      class: ["flex flex-col justify-center items-center rounded-lg px-3 py-1 hover:bg-[#f5ecff]", savedFlow.id === unref(flowStore).uuuidOfLoadedSavedFlow ? "bg-[#f5ecff]  text-[#842ff7] " : " "],
                      onClick: ($event) => unref(flowStore).loadFlow(savedFlow)
                    }, [
                      createVNode("div", { class: "" }, [
                        savedFlow.flowItem?.name ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(savedFlow.flowItem?.name), 1)) : (openBlock(), createBlock("p", {
                          key: 1,
                          class: "text-gray-500"
                        }, " Untitled "))
                      ]),
                      createVNode("div", { class: "" }, " \u66F4\u65B0\u65E5: " + toDisplayString(new Date(savedFlow.updatedAt).toLocaleString()), 1)
                    ], 10, ["onClick"]),
                    createVNode(_component_AtomsCommonComfirmDialog, { "bg-color": "white" }, {
                      modal: withCtx(() => [
                        createVNode("div", { class: "px-4 py-4 w-full h-full flex flex-col justify-center items-center" }, [
                          createVNode("p", { class: "mb-5" }, " \u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F ")
                        ])
                      ]),
                      yes: withCtx(() => [
                        createVNode("button", {
                          onClick: ($event) => unref(flowStore).deleteSavedFlow(index),
                          class: "px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300 mr-5"
                        }, " \u306F\u3044 ", 8, ["onClick"])
                      ]),
                      no: withCtx(() => [
                        createVNode("button", { class: "px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300" }, " \u3044\u3044\u3048 ")
                      ]),
                      button: withCtx(() => [
                        createVNode("button", { class: "flex items-center justify-end ml-3" }, [
                          createVNode("p", { class: "text-red-500 hover:text-red-700 text-sm transition-all duration-200" }, [
                            createVNode(_component_font_awesome_icon, { icon: ["fas", "trash-can"] })
                          ])
                        ])
                      ]),
                      _: 2
                    }, 1024)
                  ]);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/flow-menu.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "button-save-as",
  __ssrInlineRender: true,
  props: {
    flowItem: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const flowStore = useFlowStore();
    const name = ref("");
    const description = ref("");
    const modalwindow = ref(null);
    function closeModal() {
      if (modalwindow.value) {
        modalwindow.value.changeVisibility();
      }
    }
    name.value = props.flowItem.name;
    description.value = props.flowItem.description;
    const setFlowInfo = () => {
      name.value = props.flowItem.name;
      description.value = props.flowItem.description;
    };
    const saveFlow = () => {
      props.flowItem.name = name.value;
      props.flowItem.description = description.value;
      flowStore.saveFlow(props.flowItem, true);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonModalWindow = _sfc_main$8;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(ssrRenderComponent(_component_AtomsCommonModalWindow, mergeProps({
        ref_key: "modalwindow",
        ref: modalwindow
      }, _attrs), {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }, null, _parent2, _scopeId));
            _push2(`<p class="max-xl:hidden ml-2"${_scopeId}> \u5225\u540D\u3067\u4FDD\u5B58 </p></button>`);
          } else {
            return [
              createVNode("button", {
                class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full",
                onClick: ($event) => {
                  setFlowInfo();
                }
              }, [
                createVNode(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }),
                createVNode("p", { class: "max-xl:hidden ml-2" }, " \u5225\u540D\u3067\u4FDD\u5B58 ")
              ], 8, ["onClick"])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col items-center justify-center text-xs"${_scopeId}><div class="flex items-center justify-center mb-4"${_scopeId}><p class="mr-4"${_scopeId}> \u540D\u524D </p><input${ssrRenderAttr("value", unref(name))} placeholder="\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" class="outline-1 outline-gray-200 px-2"${_scopeId}></div><div class="flex items-center justify-center mb-4"${_scopeId}><p class="mr-4"${_scopeId}> \u8AAC\u660E </p><input${ssrRenderAttr("value", unref(description))} placeholder="\u8AAC\u660E\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" class="outline-1 outline-gray-200 px-2"${_scopeId}></div><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-center items-center transition-all duration-300 w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }, null, _parent2, _scopeId));
            _push2(`<p class="max-xl:hidden ml-2"${_scopeId}> \u4FDD\u5B58 </p></button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col items-center justify-center text-xs" }, [
                createVNode("div", { class: "flex items-center justify-center mb-4" }, [
                  createVNode("p", { class: "mr-4" }, " \u540D\u524D "),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null,
                    placeholder: "\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
                    class: "outline-1 outline-gray-200 px-2"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(name)]
                  ])
                ]),
                createVNode("div", { class: "flex items-center justify-center mb-4" }, [
                  createVNode("p", { class: "mr-4" }, " \u8AAC\u660E "),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null,
                    placeholder: "\u8AAC\u660E\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
                    class: "outline-1 outline-gray-200 px-2"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(description)]
                  ])
                ]),
                createVNode("button", {
                  onClick: ($event) => {
                    saveFlow();
                    closeModal();
                  },
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-center items-center transition-all duration-300 w-full"
                }, [
                  createVNode(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }),
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u4FDD\u5B58 ")
                ], 8, ["onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/header/button-save-as.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "header",
  __ssrInlineRender: true,
  setup(__props) {
    const flowStore = useFlowStore();
    useAuthStore();
    const fileInput = ref(null);
    const importFlow = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result);
          flowStore.importFlow(flowData);
        } catch (error) {
          console.error("Failed to import flow:", error);
        }
      };
      reader.readAsText(file);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonAppLogo = __nuxt_component_0;
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_AtomsCommonDropdownMenu = _sfc_main$6;
      const _component_OrganismsFlowMenu = _sfc_main$4;
      const _component_MoleculesHeaderButtonSaveAs = _sfc_main$3;
      const _component_ClientOnly = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "z-10 py-2 w-full px-2 grid md:grid-cols-7 max-md:flex max-md:justify-center max-md:items-center h-16" }, _attrs))}><div class="col-span-2 flex items-center justify-start ml-2 text-[#842ff7]">`);
      _push(ssrRenderComponent(_component_AtomsCommonAppLogo, null, null, _parent));
      _push(`</div><div class="col-span-3 flex items-center justify-center"><div class="flex justify-center items-center flex-grow"><div class="flex items-center justify-center px-4 py-2"><input${ssrRenderAttr("value", unref(flowStore).masterFlow.name)} type="text" placeholder="Untitled" class="mx-2 px-2 focus:bg-white bg-transparent rounded-md duration-300 transition-all border-gray-300 outline-none w-full text-sm"></div>`);
      _push(ssrRenderComponent(_component_AtomsCommonModalButton, null, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
            _push2(`</button>`);
          } else {
            return [
              createVNode("button", { class: "hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150" }, [
                createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] })
              ])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="bg-white rounded-md flex flex-col items-start justify-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AtomsCommonDropdownMenu, null, {
              parent: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_font_awesome_icon, { icon: ["far", "folder-open"] }, null, _parent3, _scopeId2));
                  _push3(`<p class="max-xl:hidden ml-2 mr-4"${_scopeId2}> \u30D5\u30ED\u30FC\u3092\u958B\u304F </p>`);
                  _push3(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "chevron-right"] }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full" }, [
                      createVNode(_component_font_awesome_icon, { icon: ["far", "folder-open"] }),
                      createVNode("p", { class: "max-xl:hidden ml-2 mr-4" }, " \u30D5\u30ED\u30FC\u3092\u958B\u304F "),
                      createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-right"] })
                    ])
                  ];
                }
              }),
              menu: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_OrganismsFlowMenu, { class: "" }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_OrganismsFlowMenu, { class: "" })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }, null, _parent2, _scopeId));
            _push2(`<p class="max-xl:hidden ml-2"${_scopeId}> \u4FDD\u5B58 </p></button><div class="w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_MoleculesHeaderButtonSaveAs, {
              "flow-item": unref(flowStore).masterFlow
            }, null, _parent2, _scopeId));
            _push2(`</div><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "download"] }, null, _parent2, _scopeId));
            _push2(`<p class="max-xl:hidden ml-2"${_scopeId}> \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8 </p></button><input type="file" accept=".json" class="hidden"${_scopeId}><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "file-import"] }, null, _parent2, _scopeId));
            _push2(`<p class="max-xl:hidden ml-2"${_scopeId}> \u30A4\u30F3\u30DD\u30FC\u30C8 </p></button></div>`);
          } else {
            return [
              createVNode("div", { class: "bg-white rounded-md flex flex-col items-start justify-center" }, [
                createVNode(_component_AtomsCommonDropdownMenu, null, {
                  parent: withCtx(() => [
                    createVNode("div", { class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full" }, [
                      createVNode(_component_font_awesome_icon, { icon: ["far", "folder-open"] }),
                      createVNode("p", { class: "max-xl:hidden ml-2 mr-4" }, " \u30D5\u30ED\u30FC\u3092\u958B\u304F "),
                      createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-right"] })
                    ])
                  ]),
                  menu: withCtx(() => [
                    createVNode(_component_OrganismsFlowMenu, { class: "" })
                  ]),
                  _: 1
                }),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).saveFlow(unref(flowStore).masterFlow),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode(_component_font_awesome_icon, { icon: ["fas", "floppy-disk"] }),
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u4FDD\u5B58 ")
                ], 8, ["onClick"]),
                createVNode("div", { class: "w-full" }, [
                  createVNode(_component_MoleculesHeaderButtonSaveAs, {
                    "flow-item": unref(flowStore).masterFlow
                  }, null, 8, ["flow-item"])
                ]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).exportFlow(unref(flowStore).masterFlow),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode(_component_font_awesome_icon, { icon: ["fas", "download"] }),
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8 ")
                ], 8, ["onClick"]),
                createVNode("input", {
                  type: "file",
                  ref_key: "fileInput",
                  ref: fileInput,
                  accept: ".json",
                  onChange: importFlow,
                  class: "hidden"
                }, null, 544),
                createVNode("button", {
                  onClick: ($event) => _ctx.$refs.fileInput.click(),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode(_component_font_awesome_icon, { icon: ["fas", "file-import"] }),
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u30A4\u30F3\u30DD\u30FC\u30C8 ")
                ], 8, ["onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="col-span-2 flex items-center justify-end mr-2">`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/header.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "commander",
  __ssrInlineRender: true,
  setup(__props) {
    const APIExecution = useAPIExecution();
    const flowStore = useFlowStore();
    const uiStore = useUiStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_AtomsCommonModalWindow = _sfc_main$8;
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_MoleculesFlowAddItemMenu = _sfc_main$1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white border-gray-300 border rounded-2xl px-2 flex justify-center items-center z-10 shadow-[4px_4px_24px_0px_rgb(0,0,0,0.2)] pointer-events-auto" }, _attrs))}><button class="${ssrRenderClass([unref(APIExecution).isExecuting ? "pointer-events-none text-gray-300" : "", "group overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center"])}"><div class="flex items-center justify-center px-4">`);
      _push(ssrRenderComponent(_component_font_awesome_icon, {
        icon: ["fas", "play"],
        class: "mr-2"
      }, null, _parent));
      _push(`<div class=""> \u5B9F\u884C <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div></div></div></button><button class="${ssrRenderClass([!unref(APIExecution).isExecuting ? "pointer-events-none text-gray-300" : "", "group overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center"])}"><div class="flex items-center justify-center px-4">`);
      _push(ssrRenderComponent(_component_font_awesome_icon, {
        icon: ["fas", "stop"],
        class: "mr-2"
      }, null, _parent));
      _push(`<div class=""> \u505C\u6B62 <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div></div></div></button><div class="bg-gray-300 w-[1px] h-8 mx-1"></div><button class="group/flow overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center"><div class="flex items-center justify-center"><div class=""> \u30D5\u30ED\u30FC <div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(unref(flowStore).masterFlow) === "flow" ? "opacity-100 bg-[#842ff7] w-full" : "opacity-0 ", "group-hover/flow:bg-[#842ff7] w-0 group-hover/flow:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"])}"></div></div></div></button><button class="group/result overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center"><div class="flex items-center justify-center"><div class=""> \u5B9F\u884C\u7D50\u679C <div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(unref(flowStore).masterFlow) === "result" ? "opacity-100 bg-[#842ff7] w-full" : "opacity-0 ", "group-hover/result:bg-[#842ff7] w-0 group-hover/result:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"])}"></div></div></div></button>`);
      _push(ssrRenderComponent(_component_AtomsCommonModalWindow, null, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center"${_scopeId}><div class="flex items-center justify-center"${_scopeId}><div class=""${_scopeId}> \u30D0\u30FC\u30B8\u30E7\u30F3\u5C65\u6B74 <div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(unref(flowStore).masterFlow) === "history" ? "opacity-100 bg-[#842ff7] w-full" : "opacity-0 ", "group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"])}"${_scopeId}></div></div></div></button>`);
          } else {
            return [
              createVNode("button", {
                class: "group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center",
                onClick: ($event) => unref(uiStore).setItemDisplayMode(unref(flowStore).masterFlow, "history")
              }, [
                createVNode("div", { class: "flex items-center justify-center" }, [
                  createVNode("div", { class: "" }, [
                    createTextVNode(" \u30D0\u30FC\u30B8\u30E7\u30F3\u5C65\u6B74 "),
                    createVNode("div", {
                      class: [unref(uiStore).getItemDisplayMode(unref(flowStore).masterFlow) === "history" ? "opacity-100 bg-[#842ff7] w-full" : "opacity-0 ", "group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"]
                    }, null, 2)
                  ])
                ])
              ], 8, ["onClick"])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(flowStore).histories.length > 3) {
              _push2(`<div class="flex flex-col items-center justify-center"${_scopeId}><!--[-->`);
              ssrRenderList(unref(flowStore).histories, (history, index) => {
                _push2(`<button${_scopeId}>`);
                if (index > 2) {
                  _push2(`<div class="flex p-2 m-1 border"${_scopeId}><p class="mr-2"${_scopeId}>${ssrInterpolate(index - 2)}</p><p${_scopeId}>${ssrInterpolate(history.name ? history.name : "Untitled")}</p></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</button>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(flowStore).histories.length > 3 ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex flex-col items-center justify-center"
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(flowStore).histories, (history, index) => {
                  return openBlock(), createBlock("button", {
                    key: history.id,
                    onClick: ($event) => {
                      unref(flowStore).loadHistory(history);
                    }
                  }, [
                    index > 2 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex p-2 m-1 border"
                    }, [
                      createVNode("p", { class: "mr-2" }, toDisplayString(index - 2), 1),
                      createVNode("p", null, toDisplayString(history.name ? history.name : "Untitled"), 1)
                    ])) : createCommentVNode("", true)
                  ], 8, ["onClick"]);
                }), 128))
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center"><div class="flex items-center justify-center"><div class=""> \u8868\u793A\u5909\u66F4 </div></div></button>`);
      _push(ssrRenderComponent(_component_AtomsCommonModalButton, {
        class: "p-2",
        "modal-possition": "top"
      }, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "plus"] }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}> \u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 </span></button>`);
          } else {
            return [
              createVNode("button", { class: "px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300" }, [
                createVNode(_component_font_awesome_icon, { icon: ["fas", "plus"] }),
                createVNode("span", null, " \u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 ")
              ])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_MoleculesFlowAddItemMenu, {
              "flow-item": unref(flowStore).masterFlow
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_MoleculesFlowAddItemMenu, {
                "flow-item": unref(flowStore).masterFlow
              }, null, 8, ["flow-item"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/commander.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    useFlowStore();
    const isLoading = ref(true);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OrganismsCommonLoading = _sfc_main$7;
      const _component_OrganismsHeader = _sfc_main$2;
      const _component_AtomsCommonNotificationQueue = __nuxt_component_2;
      const _component_OrganismsCommander = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-screen h-screen flex flex-col items-center justify-center text-xs bg-gray-200" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_OrganismsCommonLoading, {
        "is-loading": unref(isLoading),
        class: ""
      }, null, _parent));
      _push(ssrRenderComponent(_component_OrganismsHeader, { class: "" }, null, _parent));
      _push(`<div class="relative flex-grow w-full">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div><div class="absolute bottom-[2%] left-0 w-full flex flex-col items-center justify-center pointer-events-none">`);
      _push(ssrRenderComponent(_component_AtomsCommonNotificationQueue, null, null, _parent));
      _push(ssrRenderComponent(_component_OrganismsCommander, null, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-Cv_l4KbU.mjs.map
