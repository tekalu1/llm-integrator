import { u as useUiStore, a as useAPIExecution, b as useLoopStore, _ as __nuxt_component_5, c as _sfc_main$2$1, d as _sfc_main$3$1, e as _sfc_main$1$1, f as __nuxt_component_0, g as _sfc_main$n } from './modal-window-D1_6KwB4.mjs';
import { useSSRContext, defineComponent, withAsyncContext, unref, mergeProps, withCtx, openBlock, createBlock, Fragment, renderList, createVNode, ref, watch, computed, resolveComponent, withModifiers, createCommentVNode, withDirectives, vModelText, createTextVNode, vShow, isRef, toDisplayString, renderSlot, vModelCheckbox } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrRenderSlot, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderDynamicModel, ssrInterpolate } from 'vue/server-renderer';
import { u as useFlowStore } from './useFlowStore-Bci9blvY.mjs';
import { _ as _sfc_main$m } from './dynamic-sidebar-CMZjvTft.mjs';
import { _ as _sfc_main$l } from './cool-scroll-bar-container-tamr20pv.mjs';
import { _ as _export_sfc } from './server.mjs';
import { u as useAuthStore } from './useAuthStore-DfEvTafy.mjs';
import { v as v4 } from '../_/v4.mjs';
import 'pinia';
import './useMessageQueue-EDFjpfdQ.mjs';
import './fetch-vM0MWLpl.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import './ssr-DLPS32Cj.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';
import 'vue-draggable-plus';
import '@vue-flow/core';
import 'node:crypto';

const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "flow-view",
  __ssrInlineRender: true,
  props: {
    flowItem: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const flowStore = useFlowStore();
    const props = __props;
    const latestY = ref(50);
    const nodes = ref([]);
    function addNode(name = "Untitled", flowItem) {
      const id = v4();
      latestY.value += 100;
      nodes.value.push({
        id,
        position: { x: 150, y: latestY.value },
        type: "custom",
        data: {
          label: `${name}`,
          flowItem
        }
      });
    }
    function setNode() {
      for (const flowItemChild of props.flowItem.flowItems) {
        console.log(flowItemChild.flowItems.length);
        addNode(flowItemChild.name, flowItemChild);
      }
    }
    watch(flowStore.masterFlow, () => {
      latestY.value = 50;
      nodes.value = [];
      setNode();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_5;
      _push(ssrRenderComponent(_component_ClientOnly, _attrs, {}, _parent));
    };
  }
});
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/flow-view.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "dynamic-size-wrapper",
  __ssrInlineRender: true,
  props: {
    idName: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const props = __props;
    computed(() => {
      try {
        return (void 0).getElementById(props.idName).clientHeight;
      } catch (e) {
        return 0;
      }
    });
    const releaseWrapperHeight = ref(0);
    ref();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "transition-all duration-150 overflow-hidden",
        style: { height: unref(releaseWrapperHeight) + "px" }
      }, _attrs))}><div${ssrRenderAttr("id", __props.idName)} class="flex">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/dynamic-size-wrapper.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "draggable-flow-list",
  __ssrInlineRender: true,
  props: {
    flowItem: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const uiStore = useUiStore();
    const flowStore = useFlowStore();
    const modalButton = ref(null);
    function closeModal() {
      if (modalButton.value) {
        console.log(JSON.stringify(modalButton.value));
        modalButton.value.changeVisibility();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_draggable = resolveComponent("draggable");
      const _component_AtomsCommonItemLogo = _sfc_main$2$1;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_MoleculesFlowAddItemMenu = _sfc_main$1$1;
      const _component_MoleculesSideMenuDraggableFlowList = _sfc_main$i;
      _push(ssrRenderComponent(_component_draggable, mergeProps({
        ref: "el",
        modelValue: __props.flowItem.flowItems,
        "onUpdate:modelValue": ($event) => __props.flowItem.flowItems = $event,
        animation: 150,
        easing: "ease",
        group: "flow",
        ghostClass: "ghost",
        swapThreshold: 0.1,
        class: "my-[1px] w-full flex flex-col items-center justify-center"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(__props.flowItem.flowItems, (flowItemChild, index) => {
              _push2(`<a${ssrRenderAttr("href", "#dynmcwrpr_" + flowItemChild.id)} class="flex w-full mb-[2px]"${_scopeId}><div class="${ssrRenderClass([[unref(uiStore).focusedItemId === flowItemChild.id ? "border-2 border-blue-500" : "border border-gray-200", flowItemChild.isItemActive ? "bg-white" : "bg-gray-300"], "flex rounded-lg w-full overflow-hidden pr-1 transition-all duration-150"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AtomsCommonItemLogo, {
                "item-type": flowItemChild.type,
                size: "small"
              }, null, _parent2, _scopeId));
              _push2(`<div class="flex flex-col items-start justify-center w-full ml-1"${_scopeId}><div class="flex items-center justify-center w-full pt-1"${_scopeId}>`);
              if (unref(uiStore).getIsExecutedFlow(flowItemChild.id) === "Done" && flowItemChild.type === "api") {
                _push2(`<div class="flex flex-col items-center justify-center"${_scopeId}>`);
                if (unref(uiStore).getExecutionResults(flowItemChild.id)[unref(uiStore).getExecutionResults(flowItemChild.id).length - 1]?.success) {
                  _push2(ssrRenderComponent(_component_font_awesome_icon, {
                    icon: ["fas", "circle-check"],
                    class: "text-green-600"
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (!unref(uiStore).getExecutionResults(flowItemChild.id)[unref(uiStore).getExecutionResults(flowItemChild.id).length - 1]?.success) {
                  _push2(ssrRenderComponent(_component_font_awesome_icon, {
                    icon: ["fas", "circle-exclamation"],
                    class: "text-red-600"
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else if (unref(uiStore).getIsExecutedFlow(flowItemChild.id) === "In progress") {
                _push2(`<div class="flex flex-col items-center justify-center"${_scopeId}><div class="flex items-center justify-center"${_scopeId}><div class="animate-spin rounded-full h-2 w-2 border-b-2 border-green-500"${_scopeId}></div></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex items-center justify-start flex-grow"${_scopeId}><input${ssrRenderAttr("value", flowItemChild.name)} type="text" placeholder="Untitled" class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"${_scopeId}></div>`);
              _push2(ssrRenderComponent(_component_AtomsCommonModalButton, {
                ref_for: true,
                ref_key: "modalButton",
                ref: modalButton
              }, {
                button: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<button class="rounded-md mr-1 hover:bg-gray-200 px-1 transition-all duration-150"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_font_awesome_icon, {
                      icon: ["fas", "plus"],
                      class: ""
                    }, null, _parent3, _scopeId2));
                    _push3(`</button>`);
                  } else {
                    return [
                      createVNode("button", { class: "rounded-md mr-1 hover:bg-gray-200 px-1 transition-all duration-150" }, [
                        createVNode(_component_font_awesome_icon, {
                          icon: ["fas", "plus"],
                          class: ""
                        })
                      ])
                    ];
                  }
                }),
                modal: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_MoleculesFlowAddItemMenu, {
                      "flow-item": flowItemChild,
                      onClick: closeModal
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_MoleculesFlowAddItemMenu, {
                        "flow-item": flowItemChild,
                        onClick: closeModal
                      }, null, 8, ["flow-item"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<button class="flex items-center justify-center mr-1 hover:bg-gray-200 p-1 rounded-md transition-all duration-150"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["far", "clone"] }, null, _parent2, _scopeId));
              _push2(`</button><button class="flex items-center justify-center text-red-500 hover:text-red-700 mr-4 hover:bg-gray-200 p-1 rounded-md transition-all duration-150"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "xmark"] }, null, _parent2, _scopeId));
              _push2(`</button></div>`);
              _push2(ssrRenderComponent(_component_MoleculesSideMenuDraggableFlowList, { "flow-item": flowItemChild }, null, _parent2, _scopeId));
              _push2(`</div></div></a>`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(__props.flowItem.flowItems, (flowItemChild, index) => {
                return openBlock(), createBlock("a", {
                  key: __props.flowItem.id,
                  href: "#dynmcwrpr_" + flowItemChild.id,
                  class: "flex w-full mb-[2px]"
                }, [
                  createVNode("div", {
                    class: ["flex rounded-lg w-full overflow-hidden pr-1 transition-all duration-150", [unref(uiStore).focusedItemId === flowItemChild.id ? "border-2 border-blue-500" : "border border-gray-200", flowItemChild.isItemActive ? "bg-white" : "bg-gray-300"]],
                    onClick: withModifiers(($event) => unref(uiStore).setFocusedItemId(flowItemChild.id), ["stop"])
                  }, [
                    createVNode(_component_AtomsCommonItemLogo, {
                      "item-type": flowItemChild.type,
                      size: "small"
                    }, null, 8, ["item-type"]),
                    createVNode("div", { class: "flex flex-col items-start justify-center w-full ml-1" }, [
                      createVNode("div", { class: "flex items-center justify-center w-full pt-1" }, [
                        unref(uiStore).getIsExecutedFlow(flowItemChild.id) === "Done" && flowItemChild.type === "api" ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "flex flex-col items-center justify-center"
                        }, [
                          unref(uiStore).getExecutionResults(flowItemChild.id)[unref(uiStore).getExecutionResults(flowItemChild.id).length - 1]?.success ? (openBlock(), createBlock(_component_font_awesome_icon, {
                            key: 0,
                            icon: ["fas", "circle-check"],
                            class: "text-green-600"
                          })) : createCommentVNode("", true),
                          !unref(uiStore).getExecutionResults(flowItemChild.id)[unref(uiStore).getExecutionResults(flowItemChild.id).length - 1]?.success ? (openBlock(), createBlock(_component_font_awesome_icon, {
                            key: 1,
                            icon: ["fas", "circle-exclamation"],
                            class: "text-red-600"
                          })) : createCommentVNode("", true)
                        ])) : unref(uiStore).getIsExecutedFlow(flowItemChild.id) === "In progress" ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "flex flex-col items-center justify-center"
                        }, [
                          createVNode("div", { class: "flex items-center justify-center" }, [
                            createVNode("div", { class: "animate-spin rounded-full h-2 w-2 border-b-2 border-green-500" })
                          ])
                        ])) : createCommentVNode("", true),
                        createVNode("div", { class: "flex items-center justify-start flex-grow" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => flowItemChild.name = $event,
                            type: "text",
                            placeholder: "Untitled",
                            class: "px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, flowItemChild.name]
                          ])
                        ]),
                        createVNode(_component_AtomsCommonModalButton, {
                          ref_for: true,
                          ref_key: "modalButton",
                          ref: modalButton
                        }, {
                          button: withCtx(() => [
                            createVNode("button", { class: "rounded-md mr-1 hover:bg-gray-200 px-1 transition-all duration-150" }, [
                              createVNode(_component_font_awesome_icon, {
                                icon: ["fas", "plus"],
                                class: ""
                              })
                            ])
                          ]),
                          modal: withCtx(() => [
                            createVNode(_component_MoleculesFlowAddItemMenu, {
                              "flow-item": flowItemChild,
                              onClick: closeModal
                            }, null, 8, ["flow-item"])
                          ]),
                          _: 2
                        }, 1536),
                        createVNode("button", {
                          class: "flex items-center justify-center mr-1 hover:bg-gray-200 p-1 rounded-md transition-all duration-150",
                          onClick: ($event) => unref(flowStore).duplicateFlowItem(__props.flowItem, flowItemChild)
                        }, [
                          createVNode(_component_font_awesome_icon, { icon: ["far", "clone"] })
                        ], 8, ["onClick"]),
                        createVNode("button", {
                          onClick: ($event) => unref(flowStore).removeFlowItemById(flowItemChild.id),
                          class: "flex items-center justify-center text-red-500 hover:text-red-700 mr-4 hover:bg-gray-200 p-1 rounded-md transition-all duration-150"
                        }, [
                          createVNode(_component_font_awesome_icon, { icon: ["fas", "xmark"] })
                        ], 8, ["onClick"])
                      ]),
                      createVNode(_component_MoleculesSideMenuDraggableFlowList, { "flow-item": flowItemChild }, null, 8, ["flow-item"])
                    ])
                  ], 10, ["onClick"])
                ], 8, ["href"]);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/side-menu/draggable-flow-list.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "flow-list",
  __ssrInlineRender: true,
  setup(__props) {
    const flowStore = useFlowStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonDynamicSizeWrapper = _sfc_main$j;
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MoleculesFlowAddItemMenu = _sfc_main$1$1;
      const _component_MoleculesSideMenuDraggableFlowList = _sfc_main$i;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-fit py-4 px-4 flex flex-col justify-start items-center" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AtomsCommonDynamicSizeWrapper, {
        "id-name": "flow-list",
        class: "w-full"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-full flex flex-col items-start justify-center"${_scopeId}><p class="mb-3"${_scopeId}> Flow\u30EA\u30B9\u30C8 </p>`);
            _push2(ssrRenderComponent(_component_AtomsCommonModalButton, { class: "" }, {
              button: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white mb-2 px-3 py-1 transition duration-100"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_font_awesome_icon, {
                    icon: ["fas", "plus"],
                    class: ""
                  }, null, _parent3, _scopeId2));
                  _push3(` \u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 </button>`);
                } else {
                  return [
                    createVNode("button", { class: "rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white mb-2 px-3 py-1 transition duration-100" }, [
                      createVNode(_component_font_awesome_icon, {
                        icon: ["fas", "plus"],
                        class: ""
                      }),
                      createTextVNode(" \u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 ")
                    ])
                  ];
                }
              }),
              modal: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_MoleculesFlowAddItemMenu, {
                    "flow-item": unref(flowStore).masterFlow
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_MoleculesFlowAddItemMenu, {
                      "flow-item": unref(flowStore).masterFlow
                    }, null, 8, ["flow-item"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="w-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_MoleculesSideMenuDraggableFlowList, {
              "flow-item": unref(flowStore).masterFlow
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "w-full flex flex-col items-start justify-center" }, [
                createVNode("p", { class: "mb-3" }, " Flow\u30EA\u30B9\u30C8 "),
                createVNode(_component_AtomsCommonModalButton, { class: "" }, {
                  button: withCtx(() => [
                    createVNode("button", { class: "rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white mb-2 px-3 py-1 transition duration-100" }, [
                      createVNode(_component_font_awesome_icon, {
                        icon: ["fas", "plus"],
                        class: ""
                      }),
                      createTextVNode(" \u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 ")
                    ])
                  ]),
                  modal: withCtx(() => [
                    createVNode(_component_MoleculesFlowAddItemMenu, {
                      "flow-item": unref(flowStore).masterFlow
                    }, null, 8, ["flow-item"])
                  ]),
                  _: 1
                }),
                createVNode("div", { class: "w-full" }, [
                  createVNode(_component_MoleculesSideMenuDraggableFlowList, {
                    "flow-item": unref(flowStore).masterFlow
                  }, null, 8, ["flow-item"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/side-menu/flow-list.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "variable-list",
  __ssrInlineRender: true,
  setup(__props) {
    const flowStore = useFlowStore();
    const updateKey = (oldKey, newKey) => {
      flowStore.masterFlow.variables[newKey] = flowStore.masterFlow.variables[oldKey];
      delete flowStore.masterFlow.variables[oldKey];
    };
    const addKey = (key, value) => {
      flowStore.masterFlow.variables[key] = value;
    };
    const deleteKey = (key) => {
      delete flowStore.masterFlow.variables[key];
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonDynamicSizeWrapper = _sfc_main$j;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-fit py-4 px-4 flex flex-col justify-start items-center" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AtomsCommonDynamicSizeWrapper, {
        "id-name": "variable-list",
        class: "w-full"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="rounded-md w-full"${_scopeId}><div class="w-full flex items-center justify-start"${_scopeId}><p class="mr-2"${_scopeId}> \u5909\u6570 </p><button class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "plus"] }, null, _parent2, _scopeId));
            _push2(`</button></div><!--[-->`);
            ssrRenderList(unref(flowStore).masterFlow.variables, (value, id, index) => {
              _push2(`<div class="mt-1 flex items-center justify-center w-full"${_scopeId}><input${ssrRenderAttr("value", id)} type="text" placeholder="key" class="mr-1 px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"${_scopeId}><input type="text"${ssrRenderAttr("value", unref(flowStore).masterFlow.variables[id])} class="mr-1 px-2 duration-300 transition-all rounded-md border-gray-300 outline-none w-full"${_scopeId}><button class="ml-2 mr-1"${_scopeId}><p class="text-red-500 hover:text-red-700 transition-all duration-300"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "minus"] }, null, _parent2, _scopeId));
              _push2(`</p></button></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "rounded-md w-full" }, [
                createVNode("div", { class: "w-full flex items-center justify-start" }, [
                  createVNode("p", { class: "mr-2" }, " \u5909\u6570 "),
                  createVNode("button", {
                    onClick: ($event) => addKey("", ""),
                    class: "text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center"
                  }, [
                    createVNode(_component_font_awesome_icon, { icon: ["fas", "plus"] })
                  ], 8, ["onClick"])
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(flowStore).masterFlow.variables, (value, id, index) => {
                  return openBlock(), createBlock("div", {
                    key: id,
                    class: "mt-1 flex items-center justify-center w-full"
                  }, [
                    createVNode("input", {
                      value: id,
                      onChange: ($event) => updateKey(id, $event.target.value),
                      type: "text",
                      placeholder: "key",
                      class: "mr-1 px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"
                    }, null, 40, ["value", "onChange"]),
                    withDirectives(createVNode("input", {
                      type: "text",
                      "onUpdate:modelValue": ($event) => unref(flowStore).masterFlow.variables[id] = $event,
                      class: "mr-1 px-2 duration-300 transition-all rounded-md border-gray-300 outline-none w-full"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(flowStore).masterFlow.variables[id]]
                    ]),
                    createVNode("button", {
                      onClick: ($event) => deleteKey(id),
                      class: "ml-2 mr-1"
                    }, [
                      createVNode("p", { class: "text-red-500 hover:text-red-700 transition-all duration-300" }, [
                        createVNode(_component_font_awesome_icon, { icon: ["fas", "minus"] })
                      ])
                    ], 8, ["onClick"])
                  ]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/side-menu/variable-list.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "side-menu",
  __ssrInlineRender: true,
  setup(__props) {
    const uiStore = useUiStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonDynamicSidebar = _sfc_main$m;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_AtomsCommonCoolScrollBarContainer = _sfc_main$l;
      const _component_MoleculesSideMenuFlowList = _sfc_main$h;
      const _component_MoleculesSideMenuVariableList = _sfc_main$g;
      _push(ssrRenderComponent(_component_AtomsCommonDynamicSidebar, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start justify-start h-full w-full pb-2"${_scopeId}><div class="flex flex-col items-center justify-start text-2xl border-r border-gray-300 h-full mr-2 px-2 w-[96px]"${_scopeId}><button class="${ssrRenderClass([unref(uiStore).getSideMenuStatus() === "Flow List" ? "bg-[#e5daf3] text-[#862ff7] font-bold" : "hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100", "p-2 w-full mb-2 flex flex-col items-center justify-center rounded-lg transition-all duration-150"])}"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["far", "chart-bar"] }, null, _parent2, _scopeId));
            _push2(`<p class="text-xs mt-2"${_scopeId}> Flow\u30EA\u30B9\u30C8 </p></button><button class="${ssrRenderClass([unref(uiStore).getSideMenuStatus() === "Variable List" ? "bg-[#e5daf3] text-[#862ff7] font-bold" : "hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100", "p-2 w-full mb-2 flex flex-col items-center justify-center rounded-lg transition-all duration-150"])}"${_scopeId}><div class="font-normal"${_scopeId}> {{x}} </div><p class="text-xs mt-2"${_scopeId}> \u5909\u6570 </p></button></div><div class="relative flex flex-col items-center justify-center w-[calc(100%-96px)] h-full max-h-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AtomsCommonCoolScrollBarContainer, { class: "max-h-full pl-2 rounded-lg w-full" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_MoleculesSideMenuFlowList, {
                    style: unref(uiStore).getSideMenuStatus() === "Flow List" ? null : { display: "none" },
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_MoleculesSideMenuVariableList, {
                    style: unref(uiStore).getSideMenuStatus() === "Variable List" ? null : { display: "none" },
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    withDirectives(createVNode(_component_MoleculesSideMenuFlowList, { class: "w-full" }, null, 512), [
                      [vShow, unref(uiStore).getSideMenuStatus() === "Flow List"]
                    ]),
                    withDirectives(createVNode(_component_MoleculesSideMenuVariableList, { class: "w-full" }, null, 512), [
                      [vShow, unref(uiStore).getSideMenuStatus() === "Variable List"]
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-start justify-start h-full w-full pb-2" }, [
                createVNode("div", { class: "flex flex-col items-center justify-start text-2xl border-r border-gray-300 h-full mr-2 px-2 w-[96px]" }, [
                  createVNode("button", {
                    onClick: ($event) => unref(uiStore).setSideMenuStatus("Flow List"),
                    class: ["p-2 w-full mb-2 flex flex-col items-center justify-center rounded-lg transition-all duration-150", unref(uiStore).getSideMenuStatus() === "Flow List" ? "bg-[#e5daf3] text-[#862ff7] font-bold" : "hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100"]
                  }, [
                    createVNode(_component_font_awesome_icon, { icon: ["far", "chart-bar"] }),
                    createVNode("p", { class: "text-xs mt-2" }, " Flow\u30EA\u30B9\u30C8 ")
                  ], 10, ["onClick"]),
                  createVNode("button", {
                    onClick: ($event) => unref(uiStore).setSideMenuStatus("Variable List"),
                    class: ["p-2 w-full mb-2 flex flex-col items-center justify-center rounded-lg transition-all duration-150", unref(uiStore).getSideMenuStatus() === "Variable List" ? "bg-[#e5daf3] text-[#862ff7] font-bold" : "hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100"]
                  }, [
                    createVNode("div", { class: "font-normal" }, " {{x}} "),
                    createVNode("p", { class: "text-xs mt-2" }, " \u5909\u6570 ")
                  ], 10, ["onClick"])
                ]),
                createVNode("div", { class: "relative flex flex-col items-center justify-center w-[calc(100%-96px)] h-full max-h-full" }, [
                  createVNode(_component_AtomsCommonCoolScrollBarContainer, { class: "max-h-full pl-2 rounded-lg w-full" }, {
                    default: withCtx(() => [
                      withDirectives(createVNode(_component_MoleculesSideMenuFlowList, { class: "w-full" }, null, 512), [
                        [vShow, unref(uiStore).getSideMenuStatus() === "Flow List"]
                      ]),
                      withDirectives(createVNode(_component_MoleculesSideMenuVariableList, { class: "w-full" }, null, 512), [
                        [vShow, unref(uiStore).getSideMenuStatus() === "Variable List"]
                      ])
                    ]),
                    _: 1
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organisms/side-menu.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const _sfc_main$e = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<button${ssrRenderAttrs(mergeProps({ class: "group/history overflow-hidden hover:bg-gray-200 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" }, _attrs))}><div class="flex items-center justify-center"><div class="">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`<div class="group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div></div></div></button>`);
}
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/button.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "request-parameter-editor",
  __ssrInlineRender: true,
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue", "remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const parameter = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const removeChild = (index) => {
      parameter.value.children?.splice(index, 1);
    };
    watch(() => parameter.value.type, (newType) => {
      if (newType === "object" || newType === "array") {
        parameter.value.value = void 0;
        if (!parameter.value.children) {
          parameter.value.children = [];
        }
      } else {
        parameter.value.children = void 0;
        parameter.value.value = "";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MoleculesApiRequestParameterEditor = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pl-4 border-l-2 border-[#842ff7] w-full" }, _attrs))}><div class="grid grid-cols-12 gap-2 w-full"><input${ssrRenderAttr("value", unref(parameter).key)} placeholder="\u30AD\u30FC" class="col-span-3 px-2 outline-none rounded border bg-white focus:bg-white"><select class="col-span-2 px-2 outline-none rounded border bg-white focus:bg-white"><option value="string"${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).type) ? ssrLooseContain(unref(parameter).type, "string") : ssrLooseEqual(unref(parameter).type, "string")) ? " selected" : ""}>\u6587\u5B57\u5217</option><option value="number"${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).type) ? ssrLooseContain(unref(parameter).type, "number") : ssrLooseEqual(unref(parameter).type, "number")) ? " selected" : ""}>\u6570\u5024</option><option value="boolean"${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).type) ? ssrLooseContain(unref(parameter).type, "boolean") : ssrLooseEqual(unref(parameter).type, "boolean")) ? " selected" : ""}>\u771F\u507D\u5024</option><option value="object"${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).type) ? ssrLooseContain(unref(parameter).type, "object") : ssrLooseEqual(unref(parameter).type, "object")) ? " selected" : ""}>\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8</option><option value="array"${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).type) ? ssrLooseContain(unref(parameter).type, "array") : ssrLooseEqual(unref(parameter).type, "array")) ? " selected" : ""}>\u914D\u5217</option></select><div class="col-span-7"><div class="flex justify-end items-center h-full"><div class="flex-grow h-full">`);
      if (unref(parameter).type === "boolean") {
        _push(`<select class="w-full px-2 outline-none rounded border h-full"><option${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).value) ? ssrLooseContain(unref(parameter).value, true) : ssrLooseEqual(unref(parameter).value, true)) ? " selected" : ""}>true</option><option${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(Array.isArray(unref(parameter).value) ? ssrLooseContain(unref(parameter).value, false) : ssrLooseEqual(unref(parameter).value, false)) ? " selected" : ""}>false</option></select>`);
      } else if (unref(parameter).type === "object" || unref(parameter).type === "array") {
        _push(`<div class="flex justify-start items-center h-full"><p class="mr-2"> \u5B50\u8981\u7D20 </p><button class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center">`);
        _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "plus"] }, null, _parent));
        _push(`</button></div>`);
      } else {
        _push(`<input${ssrRenderDynamicModel(unref(parameter).type === "number" ? "number" : "text", unref(parameter).value, null)}${ssrRenderAttr("type", unref(parameter).type === "number" ? "number" : "text")} class="w-full h-full px-2 py-1 outline-none rounded border bg-white focus:bg-white">`);
      }
      _push(`</div><button class="ml-2 mr-1"><p class="text-red-500 hover:text-red-700 transition-all duration-300">`);
      _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "minus"] }, null, _parent));
      _push(`</p></button></div></div></div>`);
      if (unref(parameter).children && unref(parameter).children.length > 0) {
        _push(`<div class="pl-4"><!--[-->`);
        ssrRenderList(unref(parameter).children, (child, index) => {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_MoleculesApiRequestParameterEditor, {
            "model-value": child,
            onRemove: ($event) => removeChild(index)
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/api/request-parameter-editor.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "form-editor",
  __ssrInlineRender: true,
  props: {
    apiItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    const flowStore = useFlowStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MoleculesApiRequestParameterEditor = _sfc_main$d;
      _push(`<!--[--><div class="flex items-center justify-start mb-2"><p class="mr-2"> headers </p><button class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center">`);
      _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "plus"] }, null, _parent));
      _push(`</button></div><div class="flex items-center justify-start"><div class="flex flex-col"><!--[-->`);
      ssrRenderList(__props.apiItem.headers, (header, index) => {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_MoleculesApiRequestParameterEditor, {
          "model-value": header,
          onRemove: ($event) => unref(flowStore).removeHeader(__props.apiItem, index)
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></div>`);
      if (__props.apiItem.method !== "GET") {
        _push(`<div class="flex items-center justify-start mt-4 mb-2"><p class="mr-2"> body </p><button class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center">`);
        _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "plus"] }, null, _parent));
        _push(`</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center justify-start"><div class="flex flex-col"><!--[-->`);
      ssrRenderList(__props.apiItem.body, (body, index) => {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_MoleculesApiRequestParameterEditor, {
          "model-value": body,
          onRemove: ($event) => unref(flowStore).removeBodyParam(__props.apiItem, index)
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></div><!--]-->`);
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/api/form-editor.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "code-editor",
  __ssrInlineRender: true,
  props: {
    apiItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    const props = __props;
    useFlowStore();
    const APIExecution = useAPIExecution();
    const valueHeaders = ref("");
    const valueBody = ref("");
    const formatResponse = (response) => {
      try {
        return JSON.stringify(response, null, 2);
      } catch {
        return JSON.stringify(response);
      }
    };
    valueHeaders.value = formatResponse(APIExecution.reverseTransformToRequestParameterArray(props.apiItem.headers));
    valueBody.value = formatResponse(APIExecution.reverseTransformToRequestParameterArray(props.apiItem.body));
    const setHeadersValueToStore = () => {
      try {
        props.apiItem.headers = APIExecution.transformEntriesArray(JSON.parse(valueHeaders.value));
        console.log("called setHeadersValueToStore");
      } catch (e) {
        console.error(e.message);
      }
    };
    const setBodyValueToStore = () => {
      try {
        console.log("called setBodyValueToStore");
        props.apiItem.body = APIExecution.transformEntriesArray(JSON.parse(valueBody.value));
      } catch (e) {
        console.error(e.message);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MonacoEditor34 = __nuxt_component_0;
      const _component_MonacoEditor = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}><div class="rounded-lg bg-white overflow-hidden py-4 mb-4"><p class="px-2 ml-2 mb-2"> \u30D8\u30C3\u30C0\u30FC </p><div class="rounded-lg bg-white overflow-hidden py-8">`);
      _push(ssrRenderComponent(_component_MonacoEditor34, {
        modelValue: unref(valueHeaders),
        "onUpdate:modelValue": ($event) => isRef(valueHeaders) ? valueHeaders.value = $event : null,
        onFocusout: setHeadersValueToStore,
        lang: "json",
        options: { scrollbar: { alwaysConsumeMouseWheel: false } },
        class: "h-64"
      }, null, _parent));
      _push(`</div></div>`);
      if (__props.apiItem.method !== "GET") {
        _push(`<div class="rounded-lg bg-white overflow-hidden py-4"><p class="px-2 ml-2 mb-2"> \u30DC\u30C7\u30A3 </p><div class="rounded-lg bg-white overflow-hidden py-8">`);
        _push(ssrRenderComponent(_component_MonacoEditor, {
          modelValue: unref(valueBody),
          "onUpdate:modelValue": ($event) => isRef(valueBody) ? valueBody.value = $event : null,
          onFocusout: setBodyValueToStore,
          lang: "json",
          options: { scrollbar: { alwaysConsumeMouseWheel: false } },
          class: "h-64"
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/api/code-editor.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "result-card",
  __ssrInlineRender: true,
  props: {
    executionResult: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    useUiStore();
    useAPIExecution();
    const formatResponse = (response) => {
      try {
        return JSON.stringify(response, null, 2);
      } catch {
        return response;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonModalWindow = _sfc_main$n;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-center bg-white backdrop-blur-md bg-opacity-50 border-gray-300 border rounded-lg p-2" }, _attrs))}><div class="flex mb-1 items-center justify-center"><p class="${ssrRenderClass([__props.executionResult.success ? "bg-green-600" : "bg-red-600", "font-bold text-white px-[6px] rounded mr-1"])}">`);
      if (__props.executionResult.success) {
        _push(`<span>${ssrInterpolate(__props.executionResult.data.status)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.executionResult.success) {
        _push(`<span>${ssrInterpolate(__props.executionResult.error.status)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</p><p class="${ssrRenderClass([__props.executionResult.success ? "text-green-600" : "text-red-600", "font-bold"])}">${ssrInterpolate(__props.executionResult.success ? "\u6210\u529F" : "\u5931\u6557")}</p></div><p> \u5B9F\u884C\u65E5\u6642\uFF1A${ssrInterpolate(new Date(__props.executionResult.executionDate).toLocaleString())}</p><p> \u5B9F\u884C\u6642\u9593\uFF1A${ssrInterpolate(__props.executionResult.duration)} ms </p>`);
      _push(ssrRenderComponent(_component_AtomsCommonModalWindow, null, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="hover:underline text-blue-600"${_scopeId}> \u5B9F\u884C\u7D50\u679C\u3092\u78BA\u8A8D\u3059\u308B </button>`);
          } else {
            return [
              createVNode("button", { class: "hover:underline text-blue-600" }, " \u5B9F\u884C\u7D50\u679C\u3092\u78BA\u8A8D\u3059\u308B ")
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col items-start justify-start overflow-auto bg-gray-50 relative w-[90vw] max-h-[90vh] text-xs"${_scopeId}>`);
            if (__props.executionResult.success) {
              _push2(`<pre class="p-4 rounded w-full"${_scopeId}>${ssrInterpolate(formatResponse(__props.executionResult.data))}</pre>`);
            } else {
              _push2(`<!---->`);
            }
            if (!__props.executionResult.success) {
              _push2(`<pre class="p-4 rounded w-full"${_scopeId}>${ssrInterpolate(formatResponse(__props.executionResult.error))}</pre>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col items-start justify-start overflow-auto bg-gray-50 relative w-[90vw] max-h-[90vh] text-xs" }, [
                __props.executionResult.success ? (openBlock(), createBlock("pre", {
                  key: 0,
                  class: "p-4 rounded w-full"
                }, toDisplayString(formatResponse(__props.executionResult.data)), 1)) : createCommentVNode("", true),
                !__props.executionResult.success ? (openBlock(), createBlock("pre", {
                  key: 1,
                  class: "p-4 rounded w-full"
                }, toDisplayString(formatResponse(__props.executionResult.error)), 1)) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/api/result-card.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "accordion",
  __ssrInlineRender: true,
  props: {
    idName: {
      type: String,
      default: ""
    }
  },
  setup(__props, { expose: __expose }) {
    const id = ref(v4());
    const isOpening = ref(false);
    __expose({
      isOpening
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonDynamicSizeWrapper = _sfc_main$j;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border-y overflow-hidden transition-all duration-500 py-4 w-full" }, _attrs))}><div>`);
      ssrRenderSlot(_ctx.$slots, "summary", {}, null, _push, _parent);
      _push(`</div>`);
      _push(ssrRenderComponent(_component_AtomsCommonDynamicSizeWrapper, {
        "id-name": "acd-" + unref(id)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="${ssrRenderClass([!unref(isOpening) ? "h-0" : "h-fit", "w-full"])}"${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "detail", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", {
                class: [!unref(isOpening) ? "h-0" : "h-fit", "w-full"]
              }, [
                renderSlot(_ctx.$slots, "detail")
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/accordion.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    apiItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    const uiStore = useUiStore();
    const APIExecution = useAPIExecution();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MoleculesApiFormEditor = _sfc_main$c;
      const _component_MoleculesApiCodeEditor = _sfc_main$b;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MonacoEditor = __nuxt_component_0;
      const _component_AtomsApiResultCard = _sfc_main$a;
      const _component_AtomsCommonAccordion = _sfc_main$9;
      _push(`<!--[-->`);
      if (unref(uiStore).getItemDisplayMode(__props.apiItem) === "default") {
        _push(`<div><div class="flex items-center justify-start my-2 w-full rounded-lg border overflow-hidden"><div class="border-r border-gray-200"><select class="w-full py-1 px-2 outline-none font-bold" style="${ssrRenderStyle({ color: unref(uiStore).methodColor[__props.apiItem.method] })}"><option class="bg-white text-[#183153]"${ssrIncludeBooleanAttr(Array.isArray(__props.apiItem.method) ? ssrLooseContain(__props.apiItem.method, null) : ssrLooseEqual(__props.apiItem.method, null)) ? " selected" : ""}>GET</option><option class="bg-white text-[#183153]"${ssrIncludeBooleanAttr(Array.isArray(__props.apiItem.method) ? ssrLooseContain(__props.apiItem.method, null) : ssrLooseEqual(__props.apiItem.method, null)) ? " selected" : ""}>POST</option><option class="bg-white text-[#183153]"${ssrIncludeBooleanAttr(Array.isArray(__props.apiItem.method) ? ssrLooseContain(__props.apiItem.method, null) : ssrLooseEqual(__props.apiItem.method, null)) ? " selected" : ""}>PUT</option><option class="bg-white text-[#183153]"${ssrIncludeBooleanAttr(Array.isArray(__props.apiItem.method) ? ssrLooseContain(__props.apiItem.method, null) : ssrLooseEqual(__props.apiItem.method, null)) ? " selected" : ""}>DELETE</option></select></div><input${ssrRenderAttr("value", __props.apiItem.endpoint)} placeholder="endpoint" class="flex-grow outline-none px-2 py-1"></div><div class="mt-6 mb-4 w-full flex justify-start items-center"><p class="mr-6"> \u5165\u529B\u30E2\u30FC\u30C9 </p><button class="${ssrRenderClass([unref(uiStore).getEditModeStatus(__props.apiItem.id) === "form" ? "bg-[#842ff7]  text-white" : "", "mr-1 px-3 py-1 rounded-2xl transition-all duration-300"])}"> Form </button><button class="${ssrRenderClass([unref(uiStore).getEditModeStatus(__props.apiItem.id) === "code" ? "bg-[#842ff7]  text-white  " : "", "px-3 py-1 rounded-2xl transition-all duration-300"])}"> Raw </button></div>`);
        if (unref(uiStore).getEditModeStatus(__props.apiItem.id) === "form") {
          _push(ssrRenderComponent(_component_MoleculesApiFormEditor, { "api-item": __props.apiItem }, null, _parent));
        } else if (unref(uiStore).getEditModeStatus(__props.apiItem.id) === "code") {
          _push(ssrRenderComponent(_component_MoleculesApiCodeEditor, { "api-item": __props.apiItem }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (unref(uiStore).getItemDisplayMode(__props.apiItem) === "script") {
        _push(`<div class="flex flex-col items-start justify-start"><label class="inline-flex items-center cursor-pointer p-1"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(__props.apiItem.isScriptEnabled) ? ssrLooseContain(__props.apiItem.isScriptEnabled, null) : __props.apiItem.isScriptEnabled) ? " checked" : ""} class="sr-only peer"><div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"></div><span class="ms-3 dark:text-gray-300">\u30B9\u30AF\u30EA\u30D7\u30C8\u3092\u6709\u52B9\u306B\u3059\u308B</span></label><div class="${ssrRenderClass([__props.apiItem.isScriptEnabled ? "" : "pointer-events-none", "flex flex-col items-start justify-center p-2 rounded-lg overflow-hidden w-full transition-all duration-200 relative bg-white z-0"])}"><div class="${ssrRenderClass([__props.apiItem.isScriptEnabled ? "opacity-0" : "opacity-10", "absolute top-0 left-0 w-full h-full pointer-events-none bg-black z-10 duration-150 transition-all"])}"></div><div class="flex flex-col items-start justify-start"><button class="hover:bg-gray-200 px-2 rounded-md transition-all duration-150 mb-4">`);
        _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "play"] }, null, _parent));
        _push(` \u30C6\u30B9\u30C8\u5B9F\u884C </button></div>`);
        _push(ssrRenderComponent(_component_MonacoEditor, {
          modelValue: __props.apiItem.script,
          "onUpdate:modelValue": ($event) => __props.apiItem.script = $event,
          lang: "typescript",
          options: { scrollbar: { alwaysConsumeMouseWheel: false } },
          class: "h-72 w-full"
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(uiStore).getItemDisplayMode(__props.apiItem) === "result") {
        _push(`<div class="w-full">`);
        if (unref(APIExecution).isExecuting) {
          _push(`<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(uiStore).getExecutionResults(__props.apiItem.id).length > 0) {
          _push(`<div><p class="font-bold mb-4"> \u6700\u65B0\u306E\u5B9F\u884C </p>`);
          _push(ssrRenderComponent(_component_AtomsApiResultCard, {
            "execution-result": unref(uiStore).getExecutionResults(__props.apiItem.id)[unref(uiStore).getExecutionResults(__props.apiItem.id).length - 1]
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(uiStore).getExecutionResults(__props.apiItem.id).length > 1) {
          _push(`<div class="w-full">`);
          _push(ssrRenderComponent(_component_AtomsCommonAccordion, { "id-name": "result-list" }, {
            summary: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<button class="flex items-center justify-start mt-2 hover:bg-gray-200 p-2 rounded-md transition duration-150"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
                _push2(`<p class="font-bold ml-2"${_scopeId}> \u904E\u53BB\u306E\u5B9F\u884C </p></button>`);
              } else {
                return [
                  createVNode("button", { class: "flex items-center justify-start mt-2 hover:bg-gray-200 p-2 rounded-md transition duration-150" }, [
                    createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] }),
                    createVNode("p", { class: "font-bold ml-2" }, " \u904E\u53BB\u306E\u5B9F\u884C ")
                  ])
                ];
              }
            }),
            detail: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-col-reverse items-center justify-center mt-4 w-full"${_scopeId}><!--[-->`);
                ssrRenderList(unref(uiStore).getExecutionResults(__props.apiItem.id), (executionResult, index) => {
                  _push2(`<div class="mb-2 w-full"${_scopeId}>`);
                  if (index !== unref(uiStore).getExecutionResults(__props.apiItem.id).length - 1) {
                    _push2(`<div class="w-full"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_AtomsApiResultCard, { "execution-result": executionResult }, null, _parent2, _scopeId));
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-col-reverse items-center justify-center mt-4 w-full" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(uiStore).getExecutionResults(__props.apiItem.id), (executionResult, index) => {
                      return openBlock(), createBlock("div", {
                        key: index,
                        class: "mb-2 w-full"
                      }, [
                        index !== unref(uiStore).getExecutionResults(__props.apiItem.id).length - 1 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "w-full"
                        }, [
                          createVNode(_component_AtomsApiResultCard, { "execution-result": executionResult }, null, 8, ["execution-result"])
                        ])) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/api/item.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "condition",
  __ssrInlineRender: true,
  props: {
    condition: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    const operators = ref([
      "&",
      "|",
      "=",
      "!=",
      "<",
      ">",
      ">=",
      "<=",
      "contain"
    ]);
    useUiStore();
    useAPIExecution();
    const flowStore = useFlowStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MoleculesCondition = _sfc_main$7;
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-start my-2 w-full overflow-hidden bg-white bg-opacity-50 border-gray-300 border rounded-2xl p-1" }, _attrs))}><div class="flex justify-center items-center bg-white bg-opacity-50 border-gray-300 border rounded-xl px-2 py-1 mb-2">`);
      if (__props.condition.leftSide.valueType === "condition") {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_MoleculesCondition, {
          condition: __props.condition.leftSide.value
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div><input${ssrRenderAttr("value", __props.condition.leftSide.value)} class="outline-none" placeholder="\u5024\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"></div>`);
      }
      _push(ssrRenderComponent(_component_AtomsCommonModalButton, null, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150 flex items-center justify-center"${_scopeId}><p class="mr-1"${_scopeId}>${ssrInterpolate(__props.condition.leftSide.valueType)}</p>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
            _push2(`</button>`);
          } else {
            return [
              createVNode("button", { class: "hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150 flex items-center justify-center" }, [
                createVNode("p", { class: "mr-1" }, toDisplayString(__props.condition.leftSide.valueType), 1),
                createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] })
              ])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="bg-white rounded-md flex flex-col items-start justify-center"${_scopeId}><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6761\u4EF6\u5206\u5C90\u3092\u30CD\u30B9\u30C8 </p></button><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6587\u5B57\u5217 </p></button><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6570\u5024 </p></button><button class="px-2 py-2 hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8 </p></button></div>`);
          } else {
            return [
              createVNode("div", { class: "bg-white rounded-md flex flex-col items-start justify-center" }, [
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "condition", "left"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6761\u4EF6\u5206\u5C90\u3092\u30CD\u30B9\u30C8 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "string", "left"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6587\u5B57\u5217 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "number", "left"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6570\u5024 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).resetCondition(__props.condition),
                  class: "px-2 py-2 hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8 ")
                ], 8, ["onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex justify-center items-center mb-2"><select class="flex justify-center items-center px-2 py-1 outline-none rounded border text-center"><!--[-->`);
      ssrRenderList(unref(operators), (operator, index) => {
        _push(`<option${ssrRenderAttr("value", operator)} class="flex justify-center items-center"${ssrIncludeBooleanAttr(Array.isArray(__props.condition.comparisonOperator) ? ssrLooseContain(__props.condition.comparisonOperator, operator) : ssrLooseEqual(__props.condition.comparisonOperator, operator)) ? " selected" : ""}>${ssrInterpolate(operator)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex justify-center items-center bg-white bg-opacity-50 border-gray-300 border rounded-xl px-2 py-1">`);
      if (__props.condition.rightSide.valueType === "condition") {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_MoleculesCondition, {
          condition: __props.condition.rightSide.value
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div><input${ssrRenderAttr("value", __props.condition.rightSide.value)} class="outline-none" placeholder="\u5024\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"></div>`);
      }
      _push(ssrRenderComponent(_component_AtomsCommonModalButton, null, {
        button: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150 flex items-center justify-center"${_scopeId}><p class="mr-1"${_scopeId}>${ssrInterpolate(__props.condition.rightSide.valueType)}</p>`);
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
            _push2(`</button>`);
          } else {
            return [
              createVNode("button", { class: "hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150 flex items-center justify-center" }, [
                createVNode("p", { class: "mr-1" }, toDisplayString(__props.condition.rightSide.valueType), 1),
                createVNode(_component_font_awesome_icon, { icon: ["fas", "chevron-down"] })
              ])
            ];
          }
        }),
        modal: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="bg-white rounded-md flex flex-col items-start justify-center"${_scopeId}><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6761\u4EF6\u5206\u5C90\u3092\u30CD\u30B9\u30C8 </p></button><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6587\u5B57\u5217 </p></button><button class="px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6570\u5024 </p></button><button class="px-2 py-2 hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"${_scopeId}><p class="max-xl:hidden ml-2"${_scopeId}> \u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8 </p></button></div>`);
          } else {
            return [
              createVNode("div", { class: "bg-white rounded-md flex flex-col items-start justify-center" }, [
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "condition", "right"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6761\u4EF6\u5206\u5C90\u3092\u30CD\u30B9\u30C8 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "string", "right"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6587\u5B57\u5217 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).changeConditionType(__props.condition, "number", "right"),
                  class: "px-2 py-2 hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6570\u5024 ")
                ], 8, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => unref(flowStore).resetCondition(__props.condition),
                  class: "px-2 py-2 hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
                }, [
                  createVNode("p", { class: "max-xl:hidden ml-2" }, " \u6761\u4EF6\u3092\u30EA\u30BB\u30C3\u30C8 ")
                ], 8, ["onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/condition/condition.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    conditionItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    useUiStore();
    useAPIExecution();
    useFlowStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MoleculesCondition = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-center justify-start my-2 rounded-lg" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_MoleculesCondition, {
        condition: __props.conditionItem.condition
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/condition/item.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    loopItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    useUiStore();
    useLoopStore();
    useAPIExecution();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MoleculesCondition = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-start my-2 rounded-lg" }, _attrs))}><div class="flex items-center justify-center"><p class="mr-2"> \u30BF\u30A4\u30D7 </p><select class="py-1 px-2 outline-none rounded-lg"><option class="bg-white text-[#183153]"${ssrIncludeBooleanAttr(Array.isArray(__props.loopItem.loopType) ? ssrLooseContain(__props.loopItem.loopType, null) : ssrLooseEqual(__props.loopItem.loopType, null)) ? " selected" : ""}>while</option></select></div>`);
      if (__props.loopItem.loopType === "while") {
        _push(`<div class="mt-4"><p class=""> \u6761\u4EF6 </p>`);
        _push(ssrRenderComponent(_component_MoleculesCondition, {
          condition: __props.loopItem.condition
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/loop/item.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    scriptItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    useUiStore();
    useLoopStore();
    useAPIExecution();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MonacoEditor = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-start my-2 rounded-lg w-full" }, _attrs))}><div class="flex flex-col items-start justify-start w-full"><div class="flex flex-col items-start justify-center p-2 rounded-lg overflow-hidden w-full transition-all duration-200 relative bg-white z-0"><div class="flex flex-col items-start justify-start w-full"><button class="hover:bg-gray-200 px-2 rounded-md transition-all duration-150 mb-4">`);
      _push(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "play"] }, null, _parent));
      _push(` \u30C6\u30B9\u30C8\u5B9F\u884C </button></div>`);
      _push(ssrRenderComponent(_component_MonacoEditor, {
        modelValue: __props.scriptItem.script,
        "onUpdate:modelValue": ($event) => __props.scriptItem.script = $event,
        lang: "json",
        options: { scrollbar: { alwaysConsumeMouseWheel: false } },
        class: "h-72 w-full"
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/script/item.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    endItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-start my-2 rounded-lg" }, _attrs))}></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/end/item.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    waitItem: {
      type: Object,
      default: 0
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-start justify-start my-2 rounded-lg" }, _attrs))}><p class="mb-2"> \u5F85\u6A5F\u6642\u9593 </p><div class="flex"><input${ssrRenderAttr("value", __props.waitItem.waitTime)} type="number" placeholder="\u5F85\u6A5F\u6642\u9593\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" class="mr-1 px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"><p> ms </p></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/wait/item.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _imports_0 = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23183153'%3e%3cpath%20d='M360-272.31v-415.38L686.15-480%20360-272.31ZM400-480Zm0%20134%20211.54-134L400-614v268Z'/%3e%3c/svg%3e";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "item",
  __ssrInlineRender: true,
  props: {
    flowItem: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const flowStore = useFlowStore();
    const uiStore = useUiStore();
    const APIExecution = useAPIExecution();
    const props = __props;
    const modalButton = ref(null);
    ref(null);
    function closeModal(modalElement) {
      if (modalElement) {
        modalElement.changeVisibility();
      }
    }
    const userPrompt = ref("");
    const promptApi = computed(() => {
      return `
        # \u524D\u63D0
            API\u30D5\u30ED\u30FC\u4F5C\u6210\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066\u3001\u30D5\u30ED\u30FC\u30A2\u30A4\u30C6\u30E0\u306E\u30C7\u30FC\u30BF\u3092\u81EA\u52D5\u7684\u306B\u751F\u6210\u3059\u308B\u3053\u3068\u3092\u624B\u4F1D\u3063\u3066\u3044\u305F\u3060\u304D\u305F\u3044\u3067\u3059\u3002
            \u4E0B\u8A18\u306E\u578B\u69CB\u9020(ApiItem)\u306E\u30C7\u30FC\u30BF\u3092\u304A\u9001\u308A\u3057\u307E\u3059\u306E\u3067\u3001\u6307\u793A\u306B\u5408\u308F\u305B\u3066\u3001\u4FEE\u6B63\u3057\u305F\u30C7\u30FC\u30BF\u306E\u307F\u3092\u8FD4\u5374\u3057\u3066\u304F\u3060\u3055\u3044\u3002\uFF08json\u5F62\u5F0F\u3067\u3001\u305D\u308C\u4EE5\u5916\u306E\u6587\u5B57\u5217\u306F\u8FD4\u7B54\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\uFF09
            import { type FlowItem } from '~/types/item/flow';

            export type ApiItem = FlowItem & {
                endpoint: string;
                method: Method;
                headers: RequestParameter[];
                body: RequestParameter[];
                script: string;
                isScriptEnabled: boolean;
            }

            export type RequestParameter = {
                key?: string;
                type: 'string' | 'number' | 'boolean' | 'object' | 'array';
                value: any;
                children?: RequestParameter[];
            }

            export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

            \u53C2\u8003
            export type FlowItem = {
            id: string;
            name: string;
            type: 'flow'|'api'|'condition'|'loop'|'script'|'end'|'wait';
            description: string;
            isItemActive: boolean;
            variables: {};
            executionResults: ExecutionResult[];
            flowItems: FlowItem[];
            }

            script\u306B\u8A18\u8F09\u3057\u305F\u30B9\u30AF\u30EA\u30D7\u30C8\u306F\u3001API\u306E\u5B9F\u884C\u5F8C\u306B\u5B9F\u884C\u3055\u308C\u307E\u3059\u3002
            \u30D5\u30ED\u30FC\u306E\u5909\u6570\u3092\u4F7F\u7528\u3057\u305F\u3044\u3068\u304D\u306Fscript\u5185\u3067variables[\${\u30AD\u30FC\u540D}]\u3092\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002
            \u307E\u305F\u3001\u5B9F\u884C\u7D50\u679C\u3092\u5229\u7528\u3057\u305F\u3044\u5834\u5408\u306F\u3001script\u5185\u3067result.data.data\u3000\u3067\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059\u3002
            \u4F8B\u3048\u3070\u3001API\u306E\u5B9F\u884C\u7D50\u679C\u3092\u4FDD\u6301\u3057\u305F\u3044\u5834\u5408\u306Fvariables['result'] = result.data.data.\u4FDD\u6301\u3057\u305F\u3044\u30D7\u30ED\u30D1\u30C6\u30A3 \u306E\u3088\u3046\u306B\u3059\u308B\u3053\u3068\u3067\u3001\u4FDD\u6301\u3067\u304D\u307E\u3059\u3002

        # \u6307\u793A
            \u4E0B\u8A18\u306E\u30C7\u30FC\u30BF\u306B\u3064\u3044\u3066\u3001${userPrompt.value}
            ${JSON.stringify(props.flowItem)}
        
    `;
    });
    const promptScript = computed(() => {
      return `
        # \u524D\u63D0
            API\u30D5\u30ED\u30FC\u4F5C\u6210\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066\u3001\u30D5\u30ED\u30FC\u30A2\u30A4\u30C6\u30E0\u306E\u30C7\u30FC\u30BF\u3092\u81EA\u52D5\u7684\u306B\u751F\u6210\u3059\u308B\u3053\u3068\u3092\u624B\u4F1D\u3063\u3066\u3044\u305F\u3060\u304D\u305F\u3044\u3067\u3059\u3002
            \u4E0B\u8A18\u306E\u578B\u69CB\u9020(ScriptItem)\u306E\u30C7\u30FC\u30BF\u3092\u304A\u9001\u308A\u3057\u307E\u3059\u306E\u3067\u3001\u6307\u793A\u306B\u5408\u308F\u305B\u3066\u3001\u4FEE\u6B63\u3057\u305F\u30C7\u30FC\u30BF\u306E\u307F\u3092\u8FD4\u5374\u3057\u3066\u304F\u3060\u3055\u3044\u3002\uFF08json\u5F62\u5F0F\u3067\u3001\u305D\u308C\u4EE5\u5916\u306E\u6587\u5B57\u5217\u306F\u8FD4\u7B54\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\uFF09
            import { type FlowItem } from '~/types/item/flow';

            export type ScriptItem = FlowItem & {
                script: string;
            }


            \u53C2\u8003
            export type FlowItem = {
            id: string;
            name: string;
            type: 'flow'|'api'|'condition'|'loop'|'script'|'end'|'wait';
            description: string;
            isItemActive: boolean;
            variables: {};
            executionResults: ExecutionResult[];
            flowItems: FlowItem[];
            }

            script\u306Ftype script\u306E\u5F62\u5F0F\u3067\u304A\u9858\u3044\u3057\u307E\u3059\u3002
            \u30D5\u30ED\u30FC\u306E\u5909\u6570\u3092\u4F7F\u7528\u3057\u305F\u3044\u3068\u304D\u306Fvariables[\${\u30AD\u30FC\u540D}]\u3092\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002
            \u4F8B\u3048\u3070\u3001variables['result'] = 'test'\u306E\u3088\u3046\u306B\u3059\u308B\u3053\u3068\u3067\u3001\u4FDD\u6301\u3067\u304D\u307E\u3059\u3002
            \u203BFlowItem\u5185\u306Evariables\u30D7\u30ED\u30D1\u30C6\u30A3\u306F\u7121\u8996\u3057\u3066\u304F\u3060\u3055\u3044\u3002

        # \u6307\u793A
            \u4E0B\u8A18\u306E\u30C7\u30FC\u30BF\u306B\u3064\u3044\u3066\u3001${userPrompt.value}
            ${JSON.stringify(props.flowItem)}
        
    `;
    });
    const apiToken = ref("");
    const registerApiToken = () => {
      flowStore.masterFlow.variables["openAiApiKey"] = apiToken.value;
    };
    const onGenerateFlowButtonClicked = async () => {
      uiStore.setIsGenerating(props.flowItem.id, true);
      try {
        if (props.flowItem.type === "api") {
          console.log(promptApi.value);
          const getGenaratedDataByAi = await flowStore.generateFlowItem(promptApi.value);
          console.log(JSON.stringify(getGenaratedDataByAi));
          flowStore.changeFlowItemById(props.flowItem.id, JSON.parse(getGenaratedDataByAi.value?.choices[0].message?.content));
        } else if (props.flowItem.type === "script") {
          console.log(promptScript.value);
          const getGenaratedDataByAi = await flowStore.generateFlowItem(promptScript.value);
          console.log(JSON.stringify(getGenaratedDataByAi));
          flowStore.changeFlowItemById(props.flowItem.id, JSON.parse(getGenaratedDataByAi.value?.choices[0].message?.content));
        }
      } catch (e) {
        throw new Error(e.message);
      } finally {
        uiStore.setIsGenerating(props.flowItem.id, false);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonDynamicSizeWrapper = _sfc_main$j;
      const _component_AtomsCommonItemLogo = _sfc_main$2$1;
      const _component_AtomsCommonModalButton = _sfc_main$3$1;
      const _component_AtomsCommonButton = __nuxt_component_3;
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_MoleculesApiItem = _sfc_main$8;
      const _component_MoleculesConditionItem = _sfc_main$6;
      const _component_MoleculesLoopItem = _sfc_main$5;
      const _component_MoleculesScriptItem = _sfc_main$4;
      const _component_MoleculesEndItem = _sfc_main$3;
      const _component_MoleculesWaitItem = _sfc_main$2;
      const _component_MoleculesFlowAddItemMenu = _sfc_main$1$1;
      const _component_MoleculesFlowItem = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["py-1 px-2 rounded-xl mt-1 mb-1 overflow-hidden transition-all duration-150", [__props.flowItem.isItemActive ? "bg-[#f2f3f5]" : "bg-gray-300 ", unref(uiStore).focusedItemId === __props.flowItem.id ? "outline outline-2 outline-blue-500" : "outline outline-1 outline-gray-300"]]
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AtomsCommonDynamicSizeWrapper, {
        "id-name": "dynmcwrpr_" + __props.flowItem.id
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.flowItem) {
              _push2(`<div class="w-full"${_scopeId}><div class="flex items-center justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AtomsCommonItemLogo, {
                "item-type": __props.flowItem.type,
                rounded: true
              }, null, _parent2, _scopeId));
              _push2(`<div class="flex items-center justify-start flex-grow ml-2"${_scopeId}><input${ssrRenderAttr("value", __props.flowItem.name)} type="text" placeholder="Untitled" class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"${_scopeId}></div><div${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AtomsCommonModalButton, {
                ref_key: "modalButton",
                ref: modalButton,
                "close-on-click": false,
                "modal-possition-horizonal": "right"
              }, {
                modal: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    if (unref(flowStore).isApiTokenRegistered()) {
                      _push3(`<div class="flex flex-col items-center justify-center text-xs px-2 py-1 w-64"${_scopeId2}><h1 class="mb-2"${_scopeId2}></h1><textarea class="outline-none border rounded-sm mb-2 w-full border-none resize-none hover:resize-y" style="${ssrRenderStyle({ fieldSizing: "content" })}" placeholder="\u6307\u793A\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"${_scopeId2}>${ssrInterpolate(unref(userPrompt))}</textarea>`);
                      _push3(ssrRenderComponent(_component_AtomsCommonButton, {
                        onClick: ($event) => [onGenerateFlowButtonClicked(), closeModal(unref(modalButton))]
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }, null, _parent4, _scopeId3));
                            _push4(` \u751F\u6210 `);
                          } else {
                            return [
                              createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                              createTextVNode(" \u751F\u6210 ")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div>`);
                    } else {
                      _push3(`<div class="flex flex-col items-start justify-center px-2 py-1 w-64"${_scopeId2}><p class="mb-2"${_scopeId2}> Open AI\u306EAPI Token\u3092\u767B\u9332\u3057\u3066\u304F\u3060\u3055\u3044 </p><input placeholder="API Token"${ssrRenderAttr("value", unref(apiToken))} class="mb-2 px-2 outline-none"${_scopeId2}><div class="w-full flex justify-center items-center"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_AtomsCommonButton, {
                        onClick: ($event) => [registerApiToken()]
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(` \u767B\u9332 `);
                          } else {
                            return [
                              createTextVNode(" \u767B\u9332 ")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                      _push3(`</div></div>`);
                    }
                  } else {
                    return [
                      unref(flowStore).isApiTokenRegistered() ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex flex-col items-center justify-center text-xs px-2 py-1 w-64"
                      }, [
                        createVNode("h1", { class: "mb-2" }),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => isRef(userPrompt) ? userPrompt.value = $event : null,
                          class: "outline-none border rounded-sm mb-2 w-full border-none resize-none hover:resize-y",
                          style: { fieldSizing: "content" },
                          placeholder: "\u6307\u793A\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"
                        }, "                  ", 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userPrompt)]
                        ]),
                        createVNode(_component_AtomsCommonButton, {
                          onClick: ($event) => [onGenerateFlowButtonClicked(), closeModal(unref(modalButton))]
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                            createTextVNode(" \u751F\u6210 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "flex flex-col items-start justify-center px-2 py-1 w-64"
                      }, [
                        createVNode("p", { class: "mb-2" }, " Open AI\u306EAPI Token\u3092\u767B\u9332\u3057\u3066\u304F\u3060\u3055\u3044 "),
                        withDirectives(createVNode("input", {
                          placeholder: "API Token",
                          "onUpdate:modelValue": ($event) => isRef(apiToken) ? apiToken.value = $event : null,
                          class: "mb-2 px-2 outline-none"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(apiToken)]
                        ]),
                        createVNode("div", { class: "w-full flex justify-center items-center" }, [
                          createVNode(_component_AtomsCommonButton, {
                            onClick: ($event) => [registerApiToken()]
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" \u767B\u9332 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ]))
                    ];
                  }
                }),
                button: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_AtomsCommonButton, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }, null, _parent4, _scopeId3));
                          _push4(` \u751F\u6210 `);
                        } else {
                          return [
                            createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                            createTextVNode(" \u751F\u6210 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_AtomsCommonButton, null, {
                        default: withCtx(() => [
                          createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                          createTextVNode(" \u751F\u6210 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div class="pr-2 py-1 flex items-center justify-center h-full"${_scopeId}><button class="${ssrRenderClass([__props.flowItem.isItemActive ? "" : "pointer-events-none opacity-40", "group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 px-2 flex flex-col items-center justify-center"])}"${_scopeId}><div class="flex items-center justify-center"${_scopeId}><img${ssrRenderAttr("src", _imports_0)} class="w-8"${_scopeId}><div class="mr-4"${_scopeId}> \u5B9F\u884C <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"${_scopeId}></div></div></div></button></div><label class="inline-flex items-center cursor-pointer mt-1 mr-2 p-1"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(__props.flowItem.isItemActive) ? ssrLooseContain(__props.flowItem.isItemActive, null) : __props.flowItem.isItemActive) ? " checked" : ""} class="sr-only peer"${_scopeId}><div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"${_scopeId}></div></label><button class="px-2 m-1"${_scopeId}><p class="text-red-500 text-lg hover:text-red-700 transition-all duration-200"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "xmark"] }, null, _parent2, _scopeId));
              _push2(`</p></button></div><div class="flex w-full justify-start items-center mb-4 px-2"${_scopeId}><button class="mr-4 flex flex-col items-center justify-center"${_scopeId}><p${_scopeId}> \u30EA\u30AF\u30A8\u30B9\u30C8 </p><div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(__props.flowItem) == "default" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"])}"${_scopeId}></div></button><button class="mr-4 flex flex-col items-center justify-center"${_scopeId}><p${_scopeId}> \u30B9\u30AF\u30EA\u30D7\u30C8 </p><div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(__props.flowItem) == "script" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"])}"${_scopeId}></div></button><button class="mr-4 flex flex-col items-center justify-center"${_scopeId}><p${_scopeId}> \u5B9F\u884C\u7D50\u679C </p><div class="${ssrRenderClass([unref(uiStore).getItemDisplayMode(__props.flowItem) == "result" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"])}"${_scopeId}></div></button></div>`);
              if (unref(uiStore).getIsGenerating(__props.flowItem.id)) {
                _push2(`<div class="shadow rounded-md p-4 w-full mx-auto bg-white"${_scopeId}><div class="animate-pulse flex space-x-4 w-full"${_scopeId}><div class="flex-1 space-y-6 py-1"${_scopeId}><div class="h-2 bg-slate-200 rounded"${_scopeId}></div><div class="space-y-3"${_scopeId}><div class="grid grid-cols-3 gap-4"${_scopeId}><div class="h-2 bg-slate-200 rounded col-span-2"${_scopeId}></div><div class="h-2 bg-slate-200 rounded col-span-1"${_scopeId}></div></div><div class="h-2 bg-slate-200 rounded"${_scopeId}></div></div></div></div></div>`);
              } else {
                _push2(`<div${_scopeId}>`);
                if (__props.flowItem.type == "api") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesApiItem, { "api-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.flowItem.type == "condition") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesConditionItem, { "condition-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.flowItem.type == "loop") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesLoopItem, { "loop-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.flowItem.type == "script") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesScriptItem, { "script-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.flowItem.type == "end") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesEndItem, { "end-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.flowItem.type == "wait") {
                  _push2(`<div${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_MoleculesWaitItem, { "wait-item": __props.flowItem }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              }
              _push2(ssrRenderComponent(_component_AtomsCommonModalButton, { class: "mt-4" }, {
                button: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<button class="rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white px-3 py-1 transition duration-100 mb-2"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_font_awesome_icon, {
                      icon: ["fas", "plus"],
                      class: ""
                    }, null, _parent3, _scopeId2));
                    _push3(` \u5B50\u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 </button>`);
                  } else {
                    return [
                      createVNode("button", { class: "rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white px-3 py-1 transition duration-100 mb-2" }, [
                        createVNode(_component_font_awesome_icon, {
                          icon: ["fas", "plus"],
                          class: ""
                        }),
                        createTextVNode(" \u5B50\u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 ")
                      ])
                    ];
                  }
                }),
                modal: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_MoleculesFlowAddItemMenu, { "flow-item": __props.flowItem }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_MoleculesFlowAddItemMenu, { "flow-item": __props.flowItem }, null, 8, ["flow-item"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<!--[-->`);
              ssrRenderList(__props.flowItem.flowItems, (flowItemChild, index) => {
                _push2(`<div${_scopeId}>`);
                _push2(ssrRenderComponent(_component_MoleculesFlowItem, { "flow-item": flowItemChild }, null, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              __props.flowItem ? (openBlock(), createBlock("div", {
                key: 0,
                class: "w-full"
              }, [
                createVNode("div", { class: "flex items-center justify-center" }, [
                  createVNode(_component_AtomsCommonItemLogo, {
                    "item-type": __props.flowItem.type,
                    rounded: true
                  }, null, 8, ["item-type"]),
                  createVNode("div", { class: "flex items-center justify-start flex-grow ml-2" }, [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => __props.flowItem.name = $event,
                      type: "text",
                      placeholder: "Untitled",
                      class: "px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, __props.flowItem.name]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode(_component_AtomsCommonModalButton, {
                      ref_key: "modalButton",
                      ref: modalButton,
                      "close-on-click": false,
                      "modal-possition-horizonal": "right"
                    }, {
                      modal: withCtx(() => [
                        unref(flowStore).isApiTokenRegistered() ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "flex flex-col items-center justify-center text-xs px-2 py-1 w-64"
                        }, [
                          createVNode("h1", { class: "mb-2" }),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => isRef(userPrompt) ? userPrompt.value = $event : null,
                            class: "outline-none border rounded-sm mb-2 w-full border-none resize-none hover:resize-y",
                            style: { fieldSizing: "content" },
                            placeholder: "\u6307\u793A\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044"
                          }, "                  ", 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(userPrompt)]
                          ]),
                          createVNode(_component_AtomsCommonButton, {
                            onClick: ($event) => [onGenerateFlowButtonClicked(), closeModal(unref(modalButton))]
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                              createTextVNode(" \u751F\u6210 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "flex flex-col items-start justify-center px-2 py-1 w-64"
                        }, [
                          createVNode("p", { class: "mb-2" }, " Open AI\u306EAPI Token\u3092\u767B\u9332\u3057\u3066\u304F\u3060\u3055\u3044 "),
                          withDirectives(createVNode("input", {
                            placeholder: "API Token",
                            "onUpdate:modelValue": ($event) => isRef(apiToken) ? apiToken.value = $event : null,
                            class: "mb-2 px-2 outline-none"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(apiToken)]
                          ]),
                          createVNode("div", { class: "w-full flex justify-center items-center" }, [
                            createVNode(_component_AtomsCommonButton, {
                              onClick: ($event) => [registerApiToken()]
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" \u767B\u9332 ")
                              ]),
                              _: 1
                            }, 8, ["onClick"])
                          ])
                        ]))
                      ]),
                      button: withCtx(() => [
                        createVNode(_component_AtomsCommonButton, null, {
                          default: withCtx(() => [
                            createVNode(_component_font_awesome_icon, { icon: ["fas", "wand-sparkles"] }),
                            createTextVNode(" \u751F\u6210 ")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 512)
                  ]),
                  createVNode("div", { class: "pr-2 py-1 flex items-center justify-center h-full" }, [
                    createVNode("button", {
                      onClick: ($event) => {
                        unref(APIExecution).runFlow(__props.flowItem);
                        unref(uiStore).setItemDisplayMode(__props.flowItem, "result");
                      },
                      class: [__props.flowItem.isItemActive ? "" : "pointer-events-none opacity-40", "group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 px-2 flex flex-col items-center justify-center"]
                    }, [
                      createVNode("div", { class: "flex items-center justify-center" }, [
                        createVNode("img", {
                          src: _imports_0,
                          class: "w-8"
                        }),
                        createVNode("div", { class: "mr-4" }, [
                          createTextVNode(" \u5B9F\u884C "),
                          createVNode("div", { class: "w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500" })
                        ])
                      ])
                    ], 10, ["onClick"])
                  ]),
                  createVNode("label", { class: "inline-flex items-center cursor-pointer mt-1 mr-2 p-1" }, [
                    withDirectives(createVNode("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": ($event) => __props.flowItem.isItemActive = $event,
                      class: "sr-only peer"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelCheckbox, __props.flowItem.isItemActive]
                    ]),
                    createVNode("div", { class: "relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300" })
                  ]),
                  createVNode("button", {
                    onClick: ($event) => unref(flowStore).removeFlowItemById(__props.flowItem.id),
                    class: "px-2 m-1"
                  }, [
                    createVNode("p", { class: "text-red-500 text-lg hover:text-red-700 transition-all duration-200" }, [
                      createVNode(_component_font_awesome_icon, { icon: ["fas", "xmark"] })
                    ])
                  ], 8, ["onClick"])
                ]),
                createVNode("div", { class: "flex w-full justify-start items-center mb-4 px-2" }, [
                  createVNode("button", {
                    onClick: ($event) => unref(uiStore).setItemDisplayMode(__props.flowItem, "default"),
                    class: "mr-4 flex flex-col items-center justify-center"
                  }, [
                    createVNode("p", null, " \u30EA\u30AF\u30A8\u30B9\u30C8 "),
                    createVNode("div", {
                      class: [unref(uiStore).getItemDisplayMode(__props.flowItem) == "default" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"]
                    }, null, 2)
                  ], 8, ["onClick"]),
                  createVNode("button", {
                    onClick: ($event) => unref(uiStore).setItemDisplayMode(__props.flowItem, "script"),
                    class: "mr-4 flex flex-col items-center justify-center"
                  }, [
                    createVNode("p", null, " \u30B9\u30AF\u30EA\u30D7\u30C8 "),
                    createVNode("div", {
                      class: [unref(uiStore).getItemDisplayMode(__props.flowItem) == "script" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"]
                    }, null, 2)
                  ], 8, ["onClick"]),
                  createVNode("button", {
                    onClick: ($event) => unref(uiStore).setItemDisplayMode(__props.flowItem, "result"),
                    class: "mr-4 flex flex-col items-center justify-center"
                  }, [
                    createVNode("p", null, " \u5B9F\u884C\u7D50\u679C "),
                    createVNode("div", {
                      class: [unref(uiStore).getItemDisplayMode(__props.flowItem) == "result" ? " opacity-100" : " opacity-0", "w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500"]
                    }, null, 2)
                  ], 8, ["onClick"])
                ]),
                unref(uiStore).getIsGenerating(__props.flowItem.id) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "shadow rounded-md p-4 w-full mx-auto bg-white"
                }, [
                  createVNode("div", { class: "animate-pulse flex space-x-4 w-full" }, [
                    createVNode("div", { class: "flex-1 space-y-6 py-1" }, [
                      createVNode("div", { class: "h-2 bg-slate-200 rounded" }),
                      createVNode("div", { class: "space-y-3" }, [
                        createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                          createVNode("div", { class: "h-2 bg-slate-200 rounded col-span-2" }),
                          createVNode("div", { class: "h-2 bg-slate-200 rounded col-span-1" })
                        ]),
                        createVNode("div", { class: "h-2 bg-slate-200 rounded" })
                      ])
                    ])
                  ])
                ])) : (openBlock(), createBlock("div", { key: 1 }, [
                  __props.flowItem.type == "api" ? (openBlock(), createBlock("div", { key: 0 }, [
                    createVNode(_component_MoleculesApiItem, { "api-item": __props.flowItem }, null, 8, ["api-item"])
                  ])) : createCommentVNode("", true),
                  __props.flowItem.type == "condition" ? (openBlock(), createBlock("div", { key: 1 }, [
                    createVNode(_component_MoleculesConditionItem, { "condition-item": __props.flowItem }, null, 8, ["condition-item"])
                  ])) : createCommentVNode("", true),
                  __props.flowItem.type == "loop" ? (openBlock(), createBlock("div", { key: 2 }, [
                    createVNode(_component_MoleculesLoopItem, { "loop-item": __props.flowItem }, null, 8, ["loop-item"])
                  ])) : createCommentVNode("", true),
                  __props.flowItem.type == "script" ? (openBlock(), createBlock("div", { key: 3 }, [
                    createVNode(_component_MoleculesScriptItem, { "script-item": __props.flowItem }, null, 8, ["script-item"])
                  ])) : createCommentVNode("", true),
                  __props.flowItem.type == "end" ? (openBlock(), createBlock("div", { key: 4 }, [
                    createVNode(_component_MoleculesEndItem, { "end-item": __props.flowItem }, null, 8, ["end-item"])
                  ])) : createCommentVNode("", true),
                  __props.flowItem.type == "wait" ? (openBlock(), createBlock("div", { key: 5 }, [
                    createVNode(_component_MoleculesWaitItem, { "wait-item": __props.flowItem }, null, 8, ["wait-item"])
                  ])) : createCommentVNode("", true)
                ])),
                createVNode(_component_AtomsCommonModalButton, { class: "mt-4" }, {
                  button: withCtx(() => [
                    createVNode("button", { class: "rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white px-3 py-1 transition duration-100 mb-2" }, [
                      createVNode(_component_font_awesome_icon, {
                        icon: ["fas", "plus"],
                        class: ""
                      }),
                      createTextVNode(" \u5B50\u30A2\u30A4\u30C6\u30E0\u3092\u8FFD\u52A0 ")
                    ])
                  ]),
                  modal: withCtx(() => [
                    createVNode(_component_MoleculesFlowAddItemMenu, { "flow-item": __props.flowItem }, null, 8, ["flow-item"])
                  ]),
                  _: 1
                }),
                (openBlock(true), createBlock(Fragment, null, renderList(__props.flowItem.flowItems, (flowItemChild, index) => {
                  return openBlock(), createBlock("div", {
                    key: flowItemChild.id
                  }, [
                    createVNode(_component_MoleculesFlowItem, { "flow-item": flowItemChild }, null, 8, ["flow-item"])
                  ]);
                }), 128))
              ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/flow/item.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const flowStore = useFlowStore();
    const uiStore = useUiStore();
    const authStore = useAuthStore();
    const isLoggedIn = ([__temp, __restore] = withAsyncContext(() => authStore.isLoggedIn()), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OrganismsFlowView = _sfc_main$k;
      const _component_OrganismsSideMenu = _sfc_main$f;
      const _component_AtomsCommonCoolScrollBarContainer = _sfc_main$l;
      const _component_MoleculesFlowItem = _sfc_main$1;
      if (unref(isLoggedIn)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-start justify-center w-full h-full text-[#183153]" }, _attrs))}>`);
        if (unref(uiStore).getViewMode() === "Flow") {
          _push(ssrRenderComponent(_component_OrganismsFlowView, {
            flowItem: unref(flowStore).masterFlow
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle(unref(uiStore).getViewMode() === "Laboratory" ? null : { display: "none" })}" class="flex items-start justify-center w-full h-full"><div class="h-full">`);
        _push(ssrRenderComponent(_component_OrganismsSideMenu, null, null, _parent));
        _push(`</div><div class="w-full h-full flex-grow relative">`);
        _push(ssrRenderComponent(_component_AtomsCommonCoolScrollBarContainer, {
          class: "max-h-full px-2 rounded-lg flex flex-col",
          "bg-color": "none"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(unref(flowStore).masterFlow.flowItems, (flowItem, index) => {
                _push2(`<div class="flex flex-col items-center justify-center"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_MoleculesFlowItem, {
                  "flow-item": flowItem,
                  class: "w-full"
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(flowStore).masterFlow.flowItems, (flowItem, index) => {
                  return openBlock(), createBlock("div", {
                    key: flowItem.id,
                    class: "flex flex-col items-center justify-center"
                  }, [
                    createVNode(_component_MoleculesFlowItem, {
                      "flow-item": flowItem,
                      class: "w-full"
                    }, null, 8, ["flow-item"])
                  ]);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DpnJxjnk.mjs.map
