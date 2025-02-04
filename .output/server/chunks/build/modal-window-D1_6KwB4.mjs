import { defineComponent, createElementBlock, ref, provide, useSSRContext, computed, mergeProps, unref, resolveComponent } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useFlowStore } from './useFlowStore-Bci9blvY.mjs';
import { defineStore } from 'pinia';
import { u as useMessageQueue } from './useMessageQueue-EDFjpfdQ.mjs';
import { v as v4 } from '../_/v4.mjs';

const __nuxt_component_0 = defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
const __nuxt_component_5 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = ref(false);
    provide(clientOnlySymbol, true);
    return (props) => {
      if (mounted.value) {
        return slots.default?.();
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "modal-button",
  __ssrInlineRender: true,
  props: {
    modalPossition: {
      type: String,
      default: "bottom"
    },
    modalPossitionHorizonal: {
      type: String,
      default: "left"
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
    },
    closeOnClick: {
      type: Boolean,
      default: true
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    ref(null);
    ref(null);
    ref(null);
    const visibility = ref(false);
    const changeVisibility = () => {
      visibility.value = !visibility.value;
    };
    const floatingElementChildTop = ref(0);
    const floatingElementChildLeft = ref(0);
    ref(0);
    const buttonRight = ref(0);
    const contentHeight = ref(0);
    const contentWidth = ref(0);
    const getTop = computed(() => {
      if (props.modalPossition === "bottom") {
        return floatingElementChildTop.value;
      } else if (props.modalPossition === "top") {
        return floatingElementChildTop.value - contentHeight.value;
      }
    });
    const getLeft = computed(() => {
      if (props.modalPossitionHorizonal === "left") {
        return floatingElementChildLeft.value;
      } else if (props.modalPossitionHorizonal === "right" && buttonRight.value) {
        return buttonRight.value - contentWidth.value;
      }
    });
    __expose({
      changeVisibility
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["flex items-start justify-center w-fit", __props.modalPossition === "bottom" ? "flex-col" : "flex-col-reverse"]
      }, _attrs))}><div class="">`);
      ssrRenderSlot(_ctx.$slots, "button", {}, null, _push, _parent);
      _push(`</div><div class="${ssrRenderClass([unref(visibility) ? "" : "opacity-0 pointer-events-none", "relative transition-all duration-200"])}"><div class="fixed left-0 top-0 items-center w-full h-full z-10"></div><div style="${ssrRenderStyle({ top: unref(getTop) + "px", left: unref(getLeft) + "px", position: "fixed" })}" class="${ssrRenderClass(["bg-" + __props.bgColor + " bg-opacity-" + __props.bgOpacity + " border-" + __props.borderThickness + " border-" + __props.borderColor, "p-1 rounded-md overflow-hidden shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)] z-20"])}"><div class="flex flex-col">`);
      ssrRenderSlot(_ctx.$slots, "modal", {}, null, _push, _parent);
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/modal-button.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "item-logo",
  __ssrInlineRender: true,
  props: {
    itemType: {
      type: String,
      default: "flow"
    },
    size: {
      type: String,
      default: "flow"
    },
    rounded: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["text-white font-bold flex justify-center items-center", [__props.size === "small" ? "text-xs " : "px-2", __props.rounded ? "rounded-md" : "", __props.itemType === "flow" ? "bg-blue-600" : "", __props.itemType === "api" ? "bg-red-600" : "", __props.itemType === "condition" ? "bg-orange-600" : "", __props.itemType === "loop" ? "bg-sky-600" : "", __props.itemType === "script" ? "bg-purple-600" : "", __props.itemType === "end" ? "bg-yellow-600" : "", __props.itemType === "wait" ? "bg-lime-600" : ""]]
      }, _attrs))}><div class="w-5 flex justify-center items-center py-1">`);
      if (__props.itemType === "flow") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "wind"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "api") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "circle-nodes"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "condition") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "diagram-project"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "loop") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "arrows-spin"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "end") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "flag-checkered"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "script") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["fas", "code"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.itemType === "wait") {
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          icon: ["far", "clock"],
          class: __props.size === "small" ? "" : "mr-2"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.size !== "small") {
        _push(`<p>${ssrInterpolate(__props.itemType)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/item-logo.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const useUiStore = defineStore("uiStore", {
  state: () => ({
    editMode: {},
    itemDisplayMode: {},
    methodColor: {
      "GET": "#21ad7a",
      "POST": "#f75c2f",
      "DELETE": "#2f50f7",
      "PUT": "#f72ff0"
    },
    focusedItemId: "",
    executionResults: {},
    isExecutedFlow: {},
    sideMenuStatus: "Flow List",
    viewMode: "Laboratory",
    isGenerating: {}
  }),
  actions: {
    getEditModeStatus(flowId) {
      if (!this.editMode[flowId]) {
        this.editMode[flowId] = "form";
      }
      return this.editMode[flowId];
    },
    setEditModeStatus(flowId, editModeStatus) {
      this.editMode[flowId] = editModeStatus;
    },
    getItemDisplayMode(flowItem) {
      if (!this.itemDisplayMode[flowItem.id]) {
        this.setItemDisplayMode(flowItem, "default");
      }
      return this.itemDisplayMode[flowItem.id];
    },
    setItemDisplayMode(flowItem, itemDisplayMode) {
      this.itemDisplayMode[flowItem.id] = itemDisplayMode;
      if (flowItem.flowItems.length > 0) {
        flowItem.flowItems.forEach((flowItemChild) => {
          this.setItemDisplayMode(flowItemChild, itemDisplayMode);
        });
      }
    },
    setFocusedItemId(flowId) {
      this.focusedItemId = flowId;
    },
    getExecutionResults(flowId) {
      if (!this.executionResults[flowId]) {
        this.executionResults[flowId] = [];
      }
      return this.executionResults[flowId];
    },
    setExecutionResults(flowId, executionResult) {
      this.executionResults[flowId].push(executionResult);
    },
    getIsExecutedFlow(flowId) {
      if (!this.isExecutedFlow[flowId]) {
        this.isExecutedFlow[flowId] = "Not yet";
      }
      return this.isExecutedFlow[flowId];
    },
    setIsExecutedFlow(flowId, status) {
      this.isExecutedFlow[flowId] = status;
    },
    clearIsExecutedFlow() {
      this.isExecutedFlow = {};
    },
    getSideMenuStatus() {
      return this.sideMenuStatus;
    },
    setSideMenuStatus(status) {
      this.sideMenuStatus = status;
    },
    getViewMode() {
      return this.viewMode;
    },
    setViewMode(mode) {
      this.viewMode = mode;
    },
    getIsGenerating(flowId) {
      if (!this.isGenerating[flowId]) {
        this.isGenerating[flowId] = false;
      }
      return this.isGenerating[flowId];
    },
    setIsGenerating(flowId, isGenerating) {
      this.isGenerating[flowId] = isGenerating;
    }
  }
});
const useLoopStore = defineStore("loopStore", {
  state: () => ({}),
  actions: {
    addLoopItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "loop",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
      loopType: "while",
      condition: {
        id: v4(),
        leftSide: {
          value: "",
          valueType: "string"
        },
        comparisonOperator: "=",
        rightSide: {
          value: "",
          valueType: "string"
        }
      }
    }) {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem);
    }
  }
});
const useScriptStore = defineStore("scriptStore", {
  state: () => ({}),
  actions: {
    addScriptItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "script",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
      script: ""
    }) {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem);
    }
  }
});
const useEndStore = defineStore("endStore", {
  state: () => ({}),
  actions: {
    addEndItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "end",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: []
    }) {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem);
    }
  }
});
const useWaitStore = defineStore("waitStore", {
  state: () => ({}),
  actions: {
    addEndItem(parentItems, newflowItem = {
      id: "",
      name: "",
      type: "wait",
      description: "",
      isItemActive: true,
      variables: {},
      executionResults: [],
      flowItems: [],
      waitTime: 0
    }) {
      const flowStore = useFlowStore();
      flowStore.addFlowItem(parentItems, newflowItem);
    }
  }
});
function transformEntriesArray(requestParameters, parentType = "object") {
  let result = [];
  for (const key of Object.keys(requestParameters)) {
    if (getType(requestParameters[key]) === "array") {
      result.push({
        key,
        type: "array",
        value: null,
        children: transformEntriesArray(requestParameters[key], "array")
      });
    } else if (getType(requestParameters[key]) === "object") {
      if (parentType === "array") {
        if (requestParameters[key]) {
          result.push({
            type: "object",
            value: null,
            children: transformEntriesArray(requestParameters[key], "array")
          });
        } else {
          result.push({
            key,
            type: "object",
            value: null,
            children: []
          });
        }
      } else {
        if (requestParameters[key]) {
          result.push({
            key,
            type: "object",
            value: null,
            children: transformEntriesArray(requestParameters[key])
          });
        } else {
          result.push({
            key,
            type: "object",
            value: null,
            children: []
          });
        }
      }
    } else {
      result.push({
        key,
        type: getType(requestParameters[key]),
        value: requestParameters[key]
      });
    }
  }
  return result;
}
function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "object";
  return typeof value;
}
function reverseTransformToRequestParameterArray(params, parentType = "object") {
  let result = {};
  if (parentType === "array") {
    if (!Array.isArray(result)) {
      result = [];
    }
  }
  for (const param of params) {
    if (!param.key) {
      if (param.children) {
        if (param.children.length > 0) {
          result.push(reverseTransformToRequestParameterArray(param.children, param.type));
        } else {
          result = null;
        }
      } else {
        if (parentType === "array") {
          result.push(param.value);
        } else {
          result = param.value;
        }
      }
    } else {
      if (param.children) {
        if (parentType === "array") {
          result.push({ [param.key]: reverseTransformToRequestParameterArray(param.children, param.type) });
        } else {
          if (param.children.length > 0) {
            result[param.key] = reverseTransformToRequestParameterArray(param.children, param.type);
          } else {
            result[param.key] = null;
          }
        }
      } else {
        if (parentType === "array") {
          result.push({ [param.key]: param.value });
        } else {
          result[param.key] = param.value;
        }
      }
    }
  }
  return result;
}
async function executeStep(apiItem) {
  console.log("apiItem", apiItem);
  try {
    const response = await fetch("/api/execute-flow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apiItem })
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      result: data,
      error: ""
    };
  } catch (e) {
    return {
      result: {},
      error: e.message
    };
  }
}
function executeScriptApiItem(apiItem, variables, executionResult) {
  try {
    const func = new Function("variables", "result", apiItem.script);
    if (apiItem.isScriptEnabled) {
      func(variables, executionResult);
    }
  } catch (error) {
    console.error("\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C\u30A8\u30E9\u30FC:", error);
  }
}
function executeScript(scriptItem, variables) {
  try {
    const func = new Function("variables", scriptItem.script);
    func(variables);
  } catch (error) {
    console.error("\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C\u30A8\u30E9\u30FC:", error);
  }
}
async function processStream(reader, onData) {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.trim()) {
        const jsonData = JSON.parse(line);
        onData(jsonData);
      }
    }
  }
}
const useAPIExecution = defineStore("APIExecution", {
  state: () => ({
    isExecuting: false,
    latestExecutedFlowItemId: ""
  }),
  actions: {
    async executeStep(apiItem) {
      return executeStep(apiItem);
    },
    executeScriptApiItem(apiItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      executeScriptApiItem(apiItem, flowStore.masterFlow.variables, uiStore.executionResults[apiItem.id].slice(-1)[0]);
    },
    executeScript(scriptItem) {
      const flowStore = useFlowStore();
      executeScript(scriptItem, flowStore.masterFlow.variables);
    },
    transformEntriesArray(requestParameters, parentType = "object") {
      return transformEntriesArray(requestParameters, parentType);
    },
    reverseTransformToRequestParameterArray(params, parentType = "object") {
      return reverseTransformToRequestParameterArray(params, parentType);
    },
    async runFlow(flowItem) {
      const uiStore = useUiStore();
      this.isExecuting = true;
      try {
        uiStore.clearIsExecutedFlow();
        await this.callApi(flowItem);
        if (uiStore.executionResults[flowItem.id]) {
        } else {
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.isExecuting = false;
      }
    },
    controller: null,
    async callApiByServer(flowItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      this.controller = new AbortController();
      try {
        const response = await fetch("/api/execute/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flowItem,
            variables: flowStore.masterFlow.variables
          }),
          signal: this.controller.signal
        });
        if (!response.body) {
          throw new Error("No response body");
        }
        const reader = response.body.getReader();
        await processStream(reader, (jsonData) => {
          console.log("Received:", jsonData);
          if (jsonData.executionResult) {
            uiStore.setExecutionResults(jsonData.id, jsonData.executionResult);
          }
          if (jsonData.variables) {
            flowStore.masterFlow.variables = jsonData.variables;
          }
          if (jsonData.status) {
            uiStore.setIsExecutedFlow(jsonData.id, jsonData.status);
            this.latestExecutedFlowItemId = jsonData.id;
          }
        });
        this.isExecuting = false;
      } catch (error) {
        console.error("Streaming error:", error);
        this.isExecuting = false;
      }
    },
    stopFlowByServer() {
      const uiStore = useUiStore();
      if (this.controller) {
        this.controller.abort();
        uiStore.setIsExecutedFlow(this.latestExecutedFlowItemId, "Done");
        this.isExecuting = false;
      }
    },
    async callApi(flowItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      const delay = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };
      const startTime = Date.now();
      if (!flowItem.isItemActive) {
        return;
      }
      if (!this.isExecuting) {
        return;
      }
      uiStore.setIsExecutedFlow(flowItem.id, "In progress");
      try {
        if (flowItem.type === "condition" || flowItem.type === "loop") {
          if (!flowStore.evaluateCondition(flowItem.condition)) {
            uiStore.setIsExecutedFlow(flowItem.id, "Done");
            return;
          }
        }
        if (flowItem.type === "api") {
          let stepConverted = JSON.parse(JSON.stringify(flowItem));
          stepConverted.headers = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.headers), flowItem);
          stepConverted.endpoint = flowStore.applyFlowVariablesOnString(flowItem.endpoint, flowItem);
          stepConverted.body = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.body), flowItem);
          console.log(stepConverted);
          const result = await this.executeStep(stepConverted);
          if (result && result.result) {
            const executionResult = {
              id: v4(),
              success: result.result.success,
              data: result.result.data ? result.result.data : {},
              error: result.result.error ? result.result.error : null,
              executionDate: startTime,
              duration: Date.now() - startTime
            };
            uiStore.setExecutionResults(flowItem.id, executionResult);
            this.executeScriptApiItem(flowItem);
          }
          console.log("result : ");
          console.log(result);
          console.log(result.result.success);
          if (!result.result.success) {
            useMessageQueue().addMessage("error", `\u30B9\u30C6\u30C3\u30D7 ${flowItem.name ? flowItem.name : "Untitled"} \u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F: ${result.error}`);
            throw new Error(`\u30B9\u30C6\u30C3\u30D7 ${flowItem.name ? flowItem.name : "Untitled"} \u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F: ${result.error}`);
          }
        }
        if (flowItem.type === "script") {
          this.executeScript(flowItem);
        }
        if (flowItem.flowItems.length > 0) {
          for (const item of flowItem.flowItems) {
            await this.callApi(item);
          }
        }
        if (flowItem.type === "loop") {
          console.log("flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition) : ", flowItem.loopType === "while" && flowStore.evaluateCondition(flowItem.condition));
          if (flowItem.loopType === "while" && flowStore.evaluateCondition(flowItem.condition)) {
            await delay(200);
            await this.callApi(JSON.parse(JSON.stringify(flowItem)));
          }
        }
        if (flowItem.type === "end") {
          this.isExecuting = false;
        }
        if (flowItem.type === "wait") {
          await delay(flowItem.waitTime);
        }
        uiStore.setIsExecutedFlow(flowItem.id, "Done");
      } catch (e) {
        console.log("error : " + e.message);
        uiStore.setIsExecutedFlow(flowItem.id, "Done");
        throw e;
      }
    },
    stopFlow() {
      this.isExecuting = false;
    }
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "add-item-menu",
  __ssrInlineRender: true,
  props: {
    flowItem: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    useFlowStore();
    useUiStore();
    useLoopStore();
    useScriptStore();
    useEndStore();
    useWaitStore();
    useAPIExecution();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonItemLogo = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-center justify-center w-full" }, _attrs))}><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "flow",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> Flow </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "api",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> API\u30EA\u30AF\u30A8\u30B9\u30C8 </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "condition",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> \u6761\u4EF6 </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "loop",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> \u30EB\u30FC\u30D7 </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "script",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> \u30B9\u30AF\u30EA\u30D7\u30C8 </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "end",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> \u7D42\u4E86 </p></button><button class="rounded-sm px-2 hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1">`);
      _push(ssrRenderComponent(_component_AtomsCommonItemLogo, {
        "item-type": "wait",
        size: "small",
        rounded: true
      }, null, _parent));
      _push(`<p class="ml-2"> \u5F85\u6A5F </p></button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/molecules/flow/add-item-menu.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "modal-window",
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
      default: "red-500"
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
    const visibility = ref(false);
    const changeVisibility = () => {
      visibility.value = !visibility.value;
    };
    __expose({
      changeVisibility
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<!--[--><div>`);
      ssrRenderSlot(_ctx.$slots, "button", {}, null, _push, _parent);
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="${ssrRenderClass([unref(visibility) ? "" : "opacity-0 pointer-events-none", "fixed left-0 top-0 w-full h-full transition-all duration-300 z-50"])}"><div class="absolute left-0 top-0 items-center w-full h-full bg-gray-500 bg-opacity-50 transition-all duration-300"></div><div class="flex flex-col z-20 items-center justify-center h-full w-full"><div class="${ssrRenderClass(["bg-" + __props.bgColor + " bg-opacity-" + __props.bgOpacity + " border-" + __props.borderThickness + " border-" + __props.borderColor, "flex flex-col items-center justify-center drop-shadow-lg rounded-lg md:max-h-screen transition-all duration-300 overflow-auto"])}"><div class="flex flex-col w-full"><div class="flex justify-end w-full">`);
        _push2(ssrRenderComponent(_component_font_awesome_icon, {
          class: ["m-2 hover:opacity-50 transition-all duration-300 cursor-pointer", "text-" + __props.buttonColor],
          icon: ["fas", "xmark"],
          onClick: changeVisibility
        }, null, _parent));
        _push2(`</div><div class="relative flex flex-col items-center justify-center pb-5 px-5 md:px-5 transition-all duration-300">`);
        ssrRenderSlot(_ctx.$slots, "modal", {}, null, _push2, _parent);
        _push2(`</div></div></div></div></div>`);
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/modal-window.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { __nuxt_component_5 as _, useAPIExecution as a, useLoopStore as b, _sfc_main$2 as c, _sfc_main$3 as d, _sfc_main$1 as e, __nuxt_component_0 as f, _sfc_main as g, useUiStore as u };
//# sourceMappingURL=modal-window-D1_6KwB4.mjs.map
